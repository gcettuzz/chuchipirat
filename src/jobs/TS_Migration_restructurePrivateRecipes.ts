// Migration Job für neue Datenstrutkur nach Umstellung auf Typescript
import Firebase from "../components/Firebase/firebase.class";
import Recipe, {
  Ingredient,
  PreparationStep,
  RecipeType,
  Section,
} from "../components/Recipe/recipe.class";
import RecipeShort from "../components/Recipe/recipeShort.class";
import {
  ChangeRecord,
  Picture as PictureSrc,
} from "../../src/components/Shared/global.interface";
import { Rating } from "../../src/components/Recipe/recipe.rating.class";
import { AuthUser } from "../../src/components/Firebase/Authentication/authUser.class";

// Angepasstes Interface (da die UID nicht auf die DB muss)
interface RecipeShortDb {
  uid?: string;
  name: string;
  pictureSrc: string;
  tags: string[];
  linkedRecipes: RecipeShort[];
  created: ChangeRecord;
  source: string;
}

interface UserRecipe {
  uid: string;
  allRecipes: {
    [key: string]: RecipeShortDb;
  };
  recipes: Recipe[];
}

export async function restructurePrivateRecipeDocuments(firebase: Firebase) {
  // Alle dokumente holen
  let collection = firebase.db.collection("recipes");
  let privateRecipeCounter: number = 0;
  let publicRecipeCounter: number = 0;
  let usersRecipes: UserRecipe[] = [];
  let userUidWithPrivateRecipes: string[] = [];

  await Recipe.getAllRecipes({ firebase: firebase })
    .then((result) => {
      result.forEach((recipe) => {
        if (recipe.type == RecipeType.private) {
          privateRecipeCounter++;
          // Prüfen ob dieser User bereits was hatte
          let userRecipes = usersRecipes.find(
            (user) => user.uid === recipe.created.fromUid
          );

          if (!userRecipes) {
            let newUserRecipes = {
              uid: recipe.created.fromUid,
              allRecipes: {
                [recipe.uid]: RecipeShort.createShortRecipeFromRecipe(
                  recipe
                ) as RecipeShortDb,
              },
              recipes: [recipe],
            };

            delete newUserRecipes.allRecipes[recipe.uid].uid;

            usersRecipes.push(newUserRecipes);
            userUidWithPrivateRecipes.push(recipe.created.fromUid);
          } else {
            let recipeShortDb = RecipeShort.createShortRecipeFromRecipe(
              recipe
            ) as RecipeShortDb;
            delete recipeShortDb.uid;
            userRecipes.allRecipes[recipe.uid] = recipeShortDb;

            userRecipes.recipes.push(recipe);
          }
        } else {
          publicRecipeCounter++;
        }
      });

      // Dokumente pro User anlegen
      usersRecipes.forEach((userRecipe) => {
        firebase.recipeShortPrivate.set({
          uids: [userRecipe.uid],
          value: userRecipe.allRecipes,
          authUser: {} as AuthUser,
        });

        userRecipe.recipes.forEach((recipe) => {
          firebase.recipePrivate.set({
            uids: [userRecipe.uid, recipe.uid],
            value: firebase.recipePublic.prepareDataForDb<Recipe>({
              value: recipe,
            }),
            authUser: {} as AuthUser,
          });
        });
      });

      // Nochmals loopen und Rezepte löschen....
      usersRecipes.forEach((userRecipe) => {
        userRecipe.recipes.forEach((recipe) => {
          firebase.recipePublic.delete({ uids: [recipe.uid] });
        });
      });

      // Counter in User Rezepte neu setzen....
      firebase.recipeShortPrivate.updateFields({
        uids: [],
        values: {
          userWithPrivateRecipes: userUidWithPrivateRecipes,
        },
        authUser: <AuthUser>{},
      });

      // Counter in den Stats neu setzen
      firebase.stats.updateFields({
        uids: [],
        values: {
          noRecipesPublic: publicRecipeCounter,
          noRecipesPrivate: privateRecipeCounter,
        },
        authUser: <AuthUser>{},
      });
    })
    .catch((error) => {
      throw error;
    });

  return privateRecipeCounter;
}
