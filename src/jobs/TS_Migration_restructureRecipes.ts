// Migration Job für neue Datenstrutkur nach Umstellung auf Typescript
import Firebase from "../components/Firebase/firebase.class";
import Product, {DietProperties} from "../components/Product/product.class";
import Recipe, {
  Ingredient,
  PositionType,
  PreparationStep,
  RecipeObjectStructure,
  RecipeType,
} from "../components/Recipe/recipe.class";
import RecipeShort from "../components/Recipe/recipeShort.class";
import User from "../components/User/user.class";
import UserPublicProfile, {
  UserPublicProfileStatsFields,
} from "../components/User/user.public.profile.class";

interface UserRecipe {
  [key: User["uid"]]: {[key: RecipeShort["uid"]]: RecipeShort};
}

export async function restructureRecipeDocuments(firebase: Firebase) {
  // Alle dokumente holen
  const collection = firebase.db.collection("recipes");
  let products: Product[] = [];
  let counter = 0;

  const userRecipesIndex: UserRecipe[] = [];
  const userUidWithPrivateRecipes: string[] = [];

  await Product.getAllProducts({
    firebase: firebase,
    onlyUsable: false,
    withDepartmentName: false,
  }).then((result) => {
    products = result;
  });

  await collection.get().then((snapshot) => {
    snapshot.forEach(async (document) => {
      const documentData = document.data();
      if (
        document.id == "000_allRecipes" ||
        Object.prototype.hasOwnProperty.call(documentData, "times") ||
        Object.prototype.hasOwnProperty.call(documentData, "created") ||
        Object.prototype.hasOwnProperty.call(documentData, "lastEdit")
      ) {
        // Dokument darf nur einmal angepasst werden!
      } else {
        counter += 1;

        // Zutaten von Array auf Objekt umstellen
        const ingredients: RecipeObjectStructure<Ingredient> = {
          entries: {},
          order: [],
        };
        documentData.ingredients.forEach((ingredient) => {
          const newIngredient: Ingredient = {
            uid: ingredient.uid,
            posType: PositionType.ingredient,
            product: ingredient.product,
            quantity: !isNaN(ingredient.quantity)
              ? parseFloat(`${ingredient.quantity}`)
              : ingredient.quantity,
            unit: ingredient.unit,
            detail: ingredient.detail,
            scalingFactor: !isNaN(ingredient.scalingFactor)
              ? parseFloat(`${ingredient.scalingFactor}`)
              : ingredient.scalingFactor,
          };

          ingredients.entries[newIngredient.uid] = newIngredient;
          ingredients.order.push(newIngredient.uid);
        });

        const preparationSteps: RecipeObjectStructure<PreparationStep> = {
          entries: {},
          order: [],
        };
        documentData.preparationSteps.forEach((preparationStep) => {
          const newPreparationStep: PreparationStep = {
            uid: preparationStep.uid,
            posType: PositionType.preparationStep,
            step: preparationStep.step,
          };

          preparationSteps.entries[newPreparationStep.uid] = newPreparationStep;
          preparationSteps.order.push(newPreparationStep.uid);
        });

        const documentNewStructure: Recipe = {
          uid: document.id,
          name: documentData.name,
          portions: documentData.portions,
          source: documentData.source,
          times: {
            preparation:
              documentData.preparationTime == ""
                ? 0
                : parseInt(documentData.preparationTime),
            rest:
              documentData.restTime == "" ? 0 : parseInt(documentData.restTime),
            cooking:
              documentData.cookTime == "" ? 0 : parseInt(documentData.cookTime),
          },
          pictureSrc: documentData.pictureSrcFullSize,
          note: documentData.note,
          tags: documentData.tags,
          type: RecipeType.private,
          linkedRecipes: Object.prototype.hasOwnProperty.call(
            documentData,
            "linkedRecipes"
          )
            ? documentData.linkedRecipes
            : [],
          ingredients: ingredients,
          preparationSteps: preparationSteps,
          materials: {entries: {}, order: []},
          dietProperties: {allergens: [], diet: 3} as DietProperties,
          menuTypes: [],
          outdoorKitchenSuitable: false,
          rating: documentData.rating,
          usedProducts: documentData.usedProducts,
          isInReview: false,
          created: Object.prototype.hasOwnProperty.call(documentData, "created")
            ? documentData.created
            : {
                date: documentData.createdAt,
                fromDisplayName: documentData.createdFromDisplayName,
                fromUid: documentData.createdFromUid,
              },
          lastChange: Object.prototype.hasOwnProperty.call(
            documentData,
            "lastChange"
          )
            ? documentData.created
            : {
                date: documentData.lastChangeAt,
                fromDisplayName: documentData.lastChangeFromDisplayName,
                fromUid: documentData.lastChangeFromUid,
              },
        };

        console.log(document.id, documentNewStructure);
        documentNewStructure.dietProperties = Recipe.defineDietProperties({
          recipe: documentNewStructure as unknown as Recipe,
          products: products,
        });

        // Prüfen ob wir von diesem User bereits ein Rezept migriert haben
        if (
          !Object.prototype.hasOwnProperty.call(
            userRecipesIndex,
            documentNewStructure.created.fromUid
          )
        ) {
          userRecipesIndex[documentNewStructure.created.fromUid] = {
            [document.id]:
              RecipeShort.createShortRecipeFromRecipe(documentNewStructure),
          };
          userUidWithPrivateRecipes.push(documentNewStructure.created.fromUid);
        } else {
          userRecipesIndex[documentNewStructure.created.fromUid][document.id] =
            RecipeShort.createShortRecipeFromRecipe(documentNewStructure);
        }

        await firebase.db
          .collection(
            `recipes/private/users/${documentNewStructure.created.fromUid}/recipes`
          )
          .doc(document.id)
          .set(documentNewStructure)
          .then(() => {
            document.ref.delete();
          });
      }
    });

    // Dokumente updaten
    firebase.db
      .collection("recipes")
      .doc("private")
      .set({userWithPrivateRecipes: userUidWithPrivateRecipes});

    // Statistik
    firebase.db
      .collection("stats")
      .doc("counter")
      .update({noRecipesPrivate: counter});

    Object.entries(userRecipesIndex).forEach(([key, value]) => {
      firebase.db.collection(`recipes/private/users`).doc(key).set(value);

      // Statistik für User mitführen.
      UserPublicProfile.incrementField({
        firebase: firebase,
        uid: key,
        field: UserPublicProfileStatsFields.noRecipesPrivate,
        step: Object.keys(value).length,
      }).catch((error) => console.error(error));
    });
  });
  return counter;
}
