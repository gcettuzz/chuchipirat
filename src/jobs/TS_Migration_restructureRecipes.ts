// Migration Job für neue Datenstrutkur nach Umstellung auf Typescript
import Firebase from "../components/Firebase/firebase.class";
import Recipe, {
  Ingredient,
  PositionType,
  PreparationStep,
  RecipeObjectStructure,
  RecipeType,
} from "../components/Recipe/recipe.class";

export async function restructureRecipeDocuments(firebase: Firebase) {
  // Alle dokumente holen
  let collection = firebase.db.collection("recipes");
  let counter: number = 0;

  await collection.get().then((snapshot) => {
    snapshot.forEach(async (document) => {
      let documentData = document.data();
      if (
        document.id == "000_allRecipes" ||
        documentData.hasOwnProperty("times") ||
        documentData.hasOwnProperty("created") ||
        documentData.hasOwnProperty("lastEdit")
      ) {
        // Dokument darf nur einmal angepasst werden!
      } else {
        counter += 1;

        // Zutaten von Array auf Objekt umstellen
        let ingredients: RecipeObjectStructure<Ingredient> = {
          entries: {},
          order: [],
        };
        documentData.ingredients.forEach((ingredient) => {
          let newIngredient: Ingredient = {
            uid: ingredient.uid,
            posType: PositionType.ingredient,
            product: ingredient.product,
            quantity: !isNaN(ingredient.quantity)
              ? parseInt(`${ingredient.quantity}`)
              : ingredient.quantity,
            unit: ingredient.unit,
            detail: ingredient.detail,
            scalingFactor: !isNaN(ingredient.scalingFactor)
              ? parseInt(`${ingredient.scalingFactor}`)
              : ingredient.scalingFactor,
          };

          ingredients.entries[newIngredient.uid] = newIngredient;
          ingredients.order.push(newIngredient.uid);
        });

        let preparationSteps: RecipeObjectStructure<PreparationStep> = {
          entries: {},
          order: [],
        };
        documentData.preparationSteps.forEach((preparationStep) => {
          let newPreparationStep: PreparationStep = {
            uid: preparationStep.uid,
            posType: PositionType.preparationStep,
            step: preparationStep.step,
          };

          preparationSteps.entries[newPreparationStep.uid] = newPreparationStep;
          preparationSteps.order.push(newPreparationStep.uid);
        });

        let documentNewStructure = {
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
          // private: true,
          // private: documentData.hasOwnProperty("private")
          //   ? documentData.private
          //   : false,
          linkedRecipes: documentData.hasOwnProperty("linkedRecipes")
            ? documentData.linkedRecipes
            : [],
          ingredients: ingredients,
          preparationSteps: preparationSteps,
          materials: {entries: {}, order: []},
          dietProperties: {allergens: [], diet: 3},
          menuTypes: [],
          outdoorKitchenSuitable: false,
          rating: documentData.rating,
          usedProducts: documentData.usedProducts,
          isInReview: false,
          created: documentData.hasOwnProperty("created")
            ? documentData.created
            : {
                date: documentData.createdAt,
                fromDisplayName: documentData.createdFromDisplayName,
                fromUid: documentData.createdFromUid,
              },
          lastChange: documentData.hasOwnProperty("lastChange")
            ? documentData.created
            : {
                date: documentData.lastChangeAt,
                fromDisplayName: documentData.lastChangeFromDisplayName,
                fromUid: documentData.lastChangeFromUid,
              },
        };

        let documentReference = firebase.db.doc(`recipes/${document.id}`);
        // TODO: Klasse anpassen bevor das ausgeführt wird // auch db-klasse
        await documentReference.set(documentNewStructure);
      }
    });
  });
  return counter;
}
