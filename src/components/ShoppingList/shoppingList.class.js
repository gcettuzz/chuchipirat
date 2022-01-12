import Feed, { FEED_TYPE } from "../Shared/feed.class";
import Stats, { STATS_FIELDS } from "../Shared/stats.class";

import * as TEXT from "../../constants/text";
import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";

import UnitConversion from "../Unit/unitConversion.class";
import Utils from "../Shared/utils.class";
import Recipe from "../Recipe/recipe.class";

export default class ShoppingList {
  constructor() {
    this.dateFrom = null;
    this.dateTo = null;
    this.mealForm = null;
    this.mealTo = null;
    this.list = [];
  }
  /* =====================================================================
  // Nötige Rezepte aus dem Mahlzeiten bestimmen
  // ===================================================================== */
  static defineRequiredRecipes = ({
    menuplan,
    dateFrom,
    dateTo,
    mealFrom,
    mealTo,
  }) => {
    let allMealRecipes = [];

    // Nur Rezepte, die auch eingeplant sind
    menuplan.dates.forEach((day) => {
      if (day < dateFrom || day > dateTo) {
        // Nächster Schlaufendurchgang
        return;
      }
      menuplan.meals.forEach((meal) => {
        if (day === dateFrom && meal.pos < mealFrom.pos) {
          return;
        } else if (day === dateTo && meal.pos > mealTo.pos) {
          return;
        }

        // Alle Rezepte dieser Mahlzeit holen
        allMealRecipes = allMealRecipes.concat(
          menuplan.recipes.filter(
            (recipe) =>
              recipe.date.getTime() === day.getTime() &&
              recipe.mealUid === meal.uid
          )
        );
      });
    });
    return allMealRecipes;
  };
  /* =====================================================================
  // Rezepte der gewählten Periodelesen
  // ===================================================================== */
  static getRecipesFromList = async ({ firebase, allMealRecipes }) => {
    let uids = [];

    // ====== Rezepte holen ======
    uids = allMealRecipes.map((recipe) => recipe.recipeUid);

    // doppelte Rezepte löschen
    uids = [...new Set(uids)];

    let allRecipes = await Recipe.getMultipleRecipes({
      firebase: firebase,
      uids: uids,
    });
    return allRecipes;
  };
  /* =====================================================================
  // Einkaufsliste generieren
  // ===================================================================== */
  static generateShoppingList = async ({
    firebase,
    dateFrom,
    dateTo,
    mealFrom,
    mealTo,
    convertUnits,
    menuplan,
    products,
    departments,
    unitConversionBasic,
    unitConversionProducts,
  }) => {
    let list = [];
    let allMealRecipes = [];
    let fxQuantity;
    let fxUnit;

    if (
      !firebase ||
      !dateFrom ||
      !dateTo ||
      !mealFrom ||
      !mealTo ||
      !menuplan ||
      (convertUnits && (!unitConversionBasic || !unitConversionProducts))
    ) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    // Rezepte bestimmen
    allMealRecipes = ShoppingList.defineRequiredRecipes({
      menuplan: menuplan,
      dateFrom: dateFrom,
      dateTo: dateTo,
      mealFrom: mealFrom,
      mealTo: mealTo,
    });

    // Rezepte lesen
    let allRecipes = await ShoppingList.getRecipesFromList({
      firebase: firebase,
      allMealRecipes: allMealRecipes,
    });

    // ====== hochrechnen und hinzufügen======
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

      recipe.scaledIngredients.forEach((ingredient) => {
        let product = products.find(
          (product) => product.uid === ingredient.product.uid
        );
        if (
          convertUnits &&
          product.shoppingUnit !== ingredient.unit &&
          product.shoppingUnit
        ) {
          try {
            // Einheit in Einkaufseinheit umrechnen
            fxQuantity = UnitConversion.convertQuantity({
              quantity: ingredient.quantity,
              product: ingredient.product,
              fromUnit: ingredient.unit,
              toUnit: product.shoppingUnit,
              unitConversionBasic: unitConversionBasic,
              unitConversionProducts: unitConversionProducts,
            });
            fxUnit = product.shoppingUnit;
          } catch (error) {
            console.warn(ingredient.product, error);
            fxQuantity = ingredient.quantity;
            fxUnit = ingredient.unit;
          }
        } else {
          // Keine Umrechnung
          fxQuantity = ingredient.quantity;
          fxUnit = ingredient.unit;
        }

        // hinzufügen;
        list = ShoppingList.addProductToShoppingList({
          list: list,
          quantity: fxQuantity,
          unit: fxUnit,
          productToAdd: ingredient.product,
          products: products,
          departments: departments,
          manualAdded: false,
        });
      });
    });

    // Einträge alphabetisch sortieren
    list.forEach((department) => {
      department.items = Utils.sortArray({
        array: department.items,
        attributeName: "name",
      });
    });

    return list;
  };

  /* =====================================================================
  // Produkt zu Liste hinzufügen
  // ===================================================================== */
  static addProductToShoppingList = ({
    list,
    productToAdd,
    quantity,
    unit,
    products,
    departments,
    manualAdded = false,
  }) => {
    if (!list || !productToAdd || !products || !departments) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }
    if (!unit) {
      // Kein null!
      unit = "";
    }

    let product = products.find((product) => product.uid === productToAdd.uid);

    if (!product) {
      throw new Error(TEXT.ERROR_PRODUCT_UNKNOWN(productToAdd.name));
    }
    // Nach der Abteilung suchen
    let department = list.find(
      (department) => department.uid === product.departmentUid
    );

    if (!department) {
      department = {
        uid: product.departmentUid,
        name: product.departmentName,
        pos: departments.find(
          (department) => department.uid === product.departmentUid
        ).pos,
        items: [],
      };
      list.push(department);
      // Abteilungen sortieren
      list = Utils.sortArray({
        array: list,
        attributeName: "pos",
      });
    }

    // Nach Produkt suchen
    let item = department.items.find(
      (item) => item.uid === product.uid && item.unit === unit
    );

    if (item) {
      // Menge aufrechnen
      item.quantity = item.quantity + quantity;
    } else {
      item = {
        checked: false,
        name: product.name,
        uid: product.uid,
        quantity: quantity,
        unit: unit ? unit : "",
      };
      if (manualAdded) {
        item.manualAdded = true;
      }
      department.items.push(item);
    }

    return list;
  };
  /* =====================================================================
  // Einkaufsliste speichern
  // ===================================================================== */
  static save = async ({ firebase, eventUid, shoppingList, authUser }) => {
    let docRef = null;
    let usedProducts = [];

    if (!firebase || !eventUid || !shoppingList) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    // Genutzte Produkte sammeln (damit diese auch wieder gefunden werden)
    shoppingList.list.forEach((department) => {
      department.items.forEach((item) => {
        usedProducts.push(item.uid);
      });
    });

    docRef = firebase.shoppingList(eventUid);

    await docRef
      .set({
        dateFrom: shoppingList.dateFrom,
        dateTo: shoppingList.dateTo,
        mealFrom: shoppingList.mealFrom,
        mealTo: shoppingList.mealTo,
        generatedFromDisplayName: shoppingList.generatedFromDisplayName,
        generatedFromUid: shoppingList.generatedFromUid,
        generatedOn: shoppingList.generatedOn,
        list: shoppingList.list,
        usedProducts: usedProducts,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    // ====== Statistik ======
    // Feed
    let randomDepartment =
      shoppingList.list[Math.floor(Math.random() * shoppingList.list.length)];
    let randomItem =
      randomDepartment.items[
        Math.floor(Math.random() * randomDepartment.items.length)
      ];
    Feed.createFeedEntry({
      firebase: firebase,
      authUser: authUser,
      feedType: FEED_TYPE.SHOPPINGLIST_CREATED,
      objectUid: eventUid,
      text: Number.isNaN(randomItem.quantity)
        ? randomItem.name
        : randomItem.quantity.toLocaleString("de-CH") +
          " " +
          randomItem.unit +
          " " +
          randomItem.name,
    });
    // Event auslösen
    firebase.analytics.logEvent(FIREBASE_EVENTS.SHOPPING_LIST_GENERATED);

    // Counter
    Stats.incrementStat({
      firebase: firebase,
      field: STATS_FIELDS.SHOPPING_LIST,
    });
  };
  /* =====================================================================
  // Postizettel aus DB lesen
  // ===================================================================== */
  static getShoppingList = async ({ firebase, eventUid }) => {
    let shoppingList = {};

    if (!firebase || !eventUid) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    const shoppingListDoc = firebase.shoppingList(eventUid);

    await shoppingListDoc
      .get()
      .then((snapshot) => {
        if (!snapshot.data()) {
          return;
        }
        shoppingList = snapshot.data();

        //Timestamps umbiegen
        shoppingList.dateFrom = shoppingList.dateFrom.toDate();
        shoppingList.dateTo = shoppingList.dateTo.toDate();
        shoppingList.generatedOn = shoppingList.generatedOn.toDate();
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return shoppingList;
  };
  /* =====================================================================
  // Anzahl Artikel in Postizettel ermitteln
  // ===================================================================== */
  static countItems = ({ shoppingList }) => {
    let noItems = 0;

    shoppingList.list.forEach((department) => {
      noItems += department.items.length;
    });
    return noItems;
  };
  /* =====================================================================
  // Anzahl Abteilungen in Postizettel ermitteln
  // ===================================================================== */
  static countDepartments = ({ shoppingList }) => {
    let noDepartment = 0;
    // Anzahl Abteilungen zählen

    shoppingList.list.forEach((department) => {
      if (department.items.length > 0) {
        noDepartment++;
      }
    });
    return noDepartment;
  };
  /* =====================================================================
  // Alles Rezepte auslesen, die ein bestimmtes Produkt beinhalten
  // ===================================================================== */
  static getRecipesWithItem = ({ itemUid, recipes, mealRecipes, meals }) => {
    let recipesWithItem = [];

    mealRecipes.forEach((mealRecipe) => {
      // Rezept suchen
      let recipe = recipes.find(
        (recipe) => recipe.uid === mealRecipe.recipeUid
      );

      // Prüfen ob Zutat vorkommt
      let foundIngredientsOfRecipe = recipe.ingredients.filter(
        (ingredient) => ingredient.product.uid === itemUid
      );

      if (foundIngredientsOfRecipe.length > 0) {
        // Rezept skalieren
        recipe.scaledIngredients = Recipe.scale({
          recipe: recipe,
          portionsToScale: mealRecipe.noOfServings,
        });
        recipe.scaledIngredients.forEach((ingredient) => {
          if (ingredient.product.uid === itemUid) {
            // hinzufügen
            recipesWithItem.push({
              recipeUid: recipe.uid,
              recipeName: recipe.name,
              ingredientQuantity: ingredient.quantity,
              ingredientUnit: ingredient.unit,
              mealDate: mealRecipe.date,
              mealName: meals.find((meal) => meal.uid === mealRecipe.mealUid)
                .name,
            });
          }
        });
      }
    });

    return recipesWithItem;
  };
}
