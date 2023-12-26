import AuthUser from "../components/Firebase/Authentication/authUser.class";
import Firebase from "../components/Firebase/firebase.class";
import Recipe from "../components/Recipe/recipe.class";

export async function rebuildFile000AllRecipes(firebase: Firebase) {
  let allRecipes: object = {};
  let counter: number = 0;

  await Recipe.getAllRecipes({
    firebase: firebase,
  })
    .then((result) => {
      // Alle dokumente holen

      result.forEach((recipe) => {
        counter++;
        allRecipes[recipe.uid] = {
          name: recipe.name,
          pictureSrc: recipe.pictureSrc,
          source: recipe.source,
          tags: recipe.tags,
          linkedRecipes: recipe.linkedRecipes ? recipe.linkedRecipes : [],
          dietProperties: recipe.dietProperties,
          menuTypes: recipe.menuTypes ? recipe.menuTypes : [],
          outdoorKitchenSuitable: recipe.outdoorKitchenSuitable
            ? recipe.outdoorKitchenSuitable
            : false,
          created: recipe.created,
          rating: {
            avgRating: recipe.rating.avgRating,
            noRatings: recipe.rating.noRatings,
          },
        };
      });
      firebase.recipeShortPublic.set({
        uids: [], // wird in der Klasse bestimmt
        value: allRecipes,
        authUser: {} as AuthUser,
      });
    })
    .then(() => {
      //TODO: gleiches mit allen privaten Rezepten....
    })
    .catch((error) => {
      throw error;
    });

  return counter;
}
