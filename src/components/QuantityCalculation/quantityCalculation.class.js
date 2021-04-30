import Utils from "../Shared/utils.class";
import Recipe from "../Recipe/recipe.class";
import recipe from "../Recipe/recipe";

import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";

export default class QuantityCalculation {
  /* =====================================================================
  // Alle Rezepte lesen und skalieren
  // ===================================================================== */
  static getRecipesAndScale = async ({ firebase, menuplan }) => {
    let quantities = [];

    // let results = [];
    let allMealRecipes = [];
    let uids = [];
    let allRecipes = [];

    // Nur Rezepte, die auch eingeplant sind
    menuplan.dates.forEach((day) => {
      menuplan.meals.forEach((meal) => {
        // Alle Rezepte dieser Mahlzeit holen
        allMealRecipes = allMealRecipes.concat(
          menuplan.recipes.filter((recipe) => {
            if (
              recipe.date.getTime() === day.getTime() &&
              recipe.mealUid === meal.uid
            ) {
              return recipe.recipeUid;
            }
          })
        );
      });
    });
    uids = allMealRecipes.map((recipe) => recipe.recipeUid);

    allRecipes = await Recipe.getMultipleRecipes({
      firebase: firebase,
      uids: uids,
    });

    // Und nun alle Malzeiten wieder abarbeiten
    allMealRecipes.forEach((mealRecipe) => {
      let recipe = allRecipes.find(
        (recipe) => recipe.uid === mealRecipe.recipeUid
      );

      // skalieren
      recipe.scaledQuantity = Recipe.scale({
        recipe: recipe,
        portionsToScale: mealRecipe.noOfServings,
      });
      recipe.scaledNoOfServings = mealRecipe.noOfServings;
      // Pro Rezept gibt es nun ein neues Objekt
      quantities.push({
        uid: mealRecipe.uid,
        date: mealRecipe.date,
        mealUid: mealRecipe.mealUid,
        mealName: menuplan.meals.find((meal) => meal.uid === mealRecipe.mealUid)
          .name,
        recipeName: mealRecipe.recipeName,
        recipe: recipe,
      });
    });

    // Analytik
    firebase.analytics.logEvent(FIREBASE_EVENTS.QUANTITY_CALCULATION_CREATED);

    return quantities;
  };
}
