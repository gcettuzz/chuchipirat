// import Feed, {FEED_TYPE} from "../../Shared/feed.class";
// import Stats, {STATS_FIELDS} from "../../Shared/stats.class";

// import * as TEXT from "../../../constants/text";
// import * as FIREBASE_EVENTS from "../../../constants/firebaseEvents";

// import UnitConversion from "../../Unit/unitConversion.class";
// import Utils from "../../Shared/utils.class";
// import Recipe from "../../Recipe/recipe.class";
import {ChangeRecord} from "../../Shared/global.interface";
import Unit from "../../Unit/unit.class";
import Event from "../Event/event.class";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import Firebase from "../../Firebase";
import Product from "../../Product/product.class";
import Menuplan, {Meal, Menue} from "../Menuplan/menuplan.class";
import Recipe from "../../Recipe/recipe.class";
import ShoppingList, {ShoppingListItem} from "./shoppingList.class";
import {
  SingleUnitConversionBasic,
  UnitConversionBasic,
  UnitConversionProducts,
} from "../../Unit/unitConversion.class";
import Department from "../../Department/department.class";
import Material from "../../Material/material.class";
import _ from "lodash";
import {de} from "date-fns/locale";
import Utils from "../../Shared/utils.class";
import FirebaseAnalyticEvent from "../../../constants/firebaseEvent";

interface Factory {
  event: Event;
}
interface SaveCollection {
  firebase: Firebase;
  authUser: AuthUser;
  shoppingListCollection: ShoppingListCollection;
}
interface GetShoppingListCollection {
  firebase: Firebase;
  uid: string;
  callback: (shoppingListCollection: ShoppingListCollection) => void;
}
export interface ShoppingListProperties {
  uid: string;
  name: string;
  selectedMenues: string[];
  generated: ChangeRecord;
  hasManuallyAddedItems: boolean;
}

interface CreateNewList {
  name: string;
  selectedMenues: string[];
  shoppingListCollection: ShoppingListCollection;
  menueplan: Menuplan;
  eventUid: Event["uid"];
  products: Product[];
  materials: Material[];
  departments: Department[];
  unitConversionBasic: UnitConversionBasic;
  unitConversionProducts: UnitConversionProducts;
  firebase: Firebase;
  authUser: AuthUser;
}

interface RefreshLists {
  shoppingListCollection: ShoppingListCollection;
  shoppingList: ShoppingList;
  keepManuallyAddedItems?: boolean;
  menueplan: Menuplan;
  eventUid: Event["uid"];
  products: Product[];
  materials: Material[];
  departments: Department[];
  unitConversionBasic: UnitConversionBasic;
  unitConversionProducts: UnitConversionProducts;
  firebase: Firebase;
  authUser: AuthUser;
}

export interface ProductTrace {
  menueUid: Menue["uid"];
  recipe: {uid: Recipe["uid"]; name: Recipe["name"]};
  planedPortions?: number;
  quantity: number;
  unit: Unit["key"];
  manualAdd?: boolean;
}

interface DeleteList {
  firebase: Firebase;
  shoppingListColection: ShoppingListCollection;
  eventUid: Event["uid"];
  listUidToDelete: ShoppingList["uid"];
  authUser: AuthUser;
}

interface EditListName {
  shoppingListCollection: ShoppingListCollection;
  listUidToEdit: ShoppingList["uid"];
  newName: ShoppingListProperties["name"];
  authUser: AuthUser;
}

export interface ShoppingListTrace {
  [key: Product["uid"]]: ProductTrace[];
}

export interface ShoppingListEntry {
  properties: ShoppingListProperties;
  trace: ShoppingListTrace;
}

interface Save {
  firebase: Firebase;
  eventUid: Event["uid"];
  shoppingListCollection: ShoppingListCollection;
  authUser: AuthUser;
}

interface AddTraceEntry {
  trace: ShoppingListTrace;
  item: Product | Material;
  menueUid: Menue["uid"];
  recipe: {uid: Recipe["uid"]; name: Recipe["name"]};
  planedPortions?: number;
  quantity: number;
  unit: Unit["key"];
  addedManually?: boolean;
}

interface DeleteTraceEntry {
  trace: ShoppingListTrace;
  itemUid: Product["uid"] | Material["uid"];
}

export default class ShoppingListCollection {
  noOfLists: number;
  lists: {[key: string]: ShoppingListEntry};
  lastChange: ChangeRecord;
  eventUid: Event["uid"];
  /* =====================================================================
  // Konstruktor
  // ===================================================================== */
  constructor() {
    this.noOfLists = 0;
    this.lastChange = {date: new Date(0), fromUid: "", fromDisplayName: ""};
    this.lists = {};
    this.eventUid = "";
  } // ===================================================================== */
  /**
   * Factory Methode
   * @returns ShoppingListCollection
   */
  static factory = ({event}: Factory) => {
    let shoppingListCollection = new ShoppingListCollection();
    shoppingListCollection.eventUid = event.uid;
    return shoppingListCollection;
  };
  // ===================================================================== */
  /**
   * Collection speichern (Übersichts-File aller Einkaufslisten)
   * @returns void
   */
  static saveCollection = async ({
    firebase,
    authUser,
    shoppingListCollection,
  }: SaveCollection) => {
    firebase.event.shoppingListCollection
      .set({
        uids: [shoppingListCollection.eventUid],
        value: shoppingListCollection,
        authUser: authUser,
      })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  // ===================================================================== */
  /**
   * Collection mit Listener holen
   * @returns listener
   */
  static getShoppingListCollectionListener = async ({
    firebase,
    uid,
    callback,
  }: GetShoppingListCollection) => {
    let shoppingListCollectionListener = () => {};

    const shoppingListCollectionCallback = (
      shoppingListCollection: ShoppingListCollection
    ) => {
      // Menüplan mit UID anreichern
      shoppingListCollection.eventUid = uid;
      callback(shoppingListCollection);
    };

    await firebase.event.shoppingListCollection
      .listen<ShoppingListCollection>({
        uids: [uid],
        callback: shoppingListCollectionCallback,
      })
      .then((result) => {
        shoppingListCollectionListener = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return shoppingListCollectionListener;
  };
  // ===================================================================== */
  /**
   * Neue Liste erstellen
   * Anhand der gewählten Menües, die Rezepte suchen und eine neue Liste
   * erstellen.
   * @param object - Objekt Name der Liste, ausgewählte Menües [menueUid],
   *                 Firebase und Authuser
   * @returns Generierte Liste als Objekt
   */
  static createNewList = async ({
    name,
    selectedMenues,
    shoppingListCollection,
    menueplan,
    eventUid,
    products,
    materials,
    departments,
    unitConversionBasic,
    unitConversionProducts,
    firebase,
    authUser,
  }: CreateNewList) => {
    let trace = {} as ShoppingListTrace;
    let shoppingList = {} as ShoppingList;

    await ShoppingList.createNewList({
      selectedMenues: selectedMenues,
      menueplan: menueplan,
      products: products,
      materials: materials,
      departments: departments,
      unitConversionBasic: unitConversionBasic,
      unitConversionProducts: unitConversionProducts,
      firebase: firebase,
    }).then(async (result) => {
      shoppingList = result.shoppingList;
      trace = result.trace;

      // Liste speichern und UID aufnehmen für Trace
      await ShoppingList.save({
        firebase: firebase,
        eventUid: eventUid,
        shoppingList: result.shoppingList,
        authUser: authUser,
      }).then(async (result) => {
        shoppingList = result;
        shoppingListCollection.noOfLists++;

        shoppingListCollection.lists[shoppingList.uid] = {
          properties: {
            uid: shoppingList.uid,
            name: name,
            selectedMenues: selectedMenues,
            generated: Utils.createChangeRecord(authUser),
            hasManuallyAddedItems: false,
          },
          trace: trace,
        };

        await ShoppingListCollection.save({
          firebase: firebase,
          eventUid: eventUid,
          shoppingListCollection: shoppingListCollection,
          authUser: authUser,
        });
      });
    });
    // Neue UID zurückgeben
    return shoppingList.uid;
  };
  // ===================================================================== */
  /**
   * Eintrag in Trace hinzufügen
   * @param object - Objekt mit: Referenz zum Trace-Array, der Artikel, Menu-UID
   *                 Rezept (UID und Name), Menge und Einheit
   * @returns gibt das Trace File zurück
   */
  static addTraceEntry = ({
    trace,
    item,
    menueUid,
    recipe,
    planedPortions,
    quantity,
    unit,
    addedManually: addedManualy = false,
  }: AddTraceEntry) => {
    if (!trace.hasOwnProperty(item.uid)) {
      trace[item.uid] = [];
    }

    let shoppingListItem: ProductTrace = {
      menueUid: menueUid,
      recipe: recipe,
      quantity: quantity,
      unit: unit,
    };
    if (planedPortions) {
      shoppingListItem.planedPortions = planedPortions;
    }

    if (addedManualy) {
      shoppingListItem.manualAdd = true;
    }

    trace[item.uid].push(shoppingListItem);
    return trace;
  };
  // ===================================================================== */
  /**
   * Eintrag aus dem Trace löschen
   * @param object - Objekt mit: Referenz zum Trace-Array, und UID des Item
   * @returns gibt das Trace File zurück
   */
  static deleteTraceEntry = ({trace, itemUid}: DeleteTraceEntry) => {
    // Gewähltes Produkt ausfiltern
    let updatedTrace = _.cloneDeep(trace);

    delete updatedTrace[itemUid];

    return updatedTrace;
  };
  // ===================================================================== */
  /**
   * Bestehende Liste aktualisieren
   * @param object - Objekt mit: Referenz auf ShoppingList-Collection,
   *                 ShoppingList, Wert ob manuell hinzugefügte Werte bei-
   *                 behalten werden sollen, Referenzen auf Menplan, Produkte
   *                 Materialien, UnitConversion Basic, Unit Conversion Products
   *                 Abteilungen, Firebase und AuthUser
   * @returns objekt mit ShoppingList und ShoppingListCollection
   */
  static refreshList = async ({
    shoppingListCollection,
    shoppingList,
    keepManuallyAddedItems = false,
    menueplan,
    products,
    materials,
    unitConversionBasic,
    unitConversionProducts,
    departments,
    firebase,
    authUser,
  }: RefreshLists) => {
    // Manuel hinzugefügte Elmente nicht löschen!
    let manuallyAddedItems: ShoppingList["list"];
    let manuallyAddedItemsTrace = {} as ShoppingListTrace;
    let updatedShoppingListCollection = _.cloneDeep(
      shoppingListCollection
    ) as ShoppingListCollection;
    let updatedTrace = {} as ShoppingListTrace;
    let updatedShoppingList = {} as ShoppingList;
    let itemToInsert: ShoppingListItem | undefined = undefined;
    if (keepManuallyAddedItems) {
      // die manuell hinzugefügten Elemente behalten
      manuallyAddedItems = _.cloneDeep(shoppingList.list);

      Object.entries(manuallyAddedItems).forEach(
        ([departmentPos, department]) => {
          department.items = department.items.filter(
            (item) => item?.manualAdd == true
          );

          if (department.items.length == 0) {
            // Ganze Abteilung löschen
            delete manuallyAddedItems[departmentPos];
          }
        }
      );

      // Trace-Elemente auch behalten
      Object.values(manuallyAddedItems).forEach((department) => {
        department.items.forEach((item) => {
          manuallyAddedItemsTrace[item.item.uid] =
            shoppingListCollection.lists[shoppingList.uid].trace[item.item.uid];
        });
      });
      Object.values(manuallyAddedItemsTrace).forEach((traceItem) => {
        traceItem = traceItem.filter((item) => item.manualAdd);
      });
    }

    // Shopping Liste neu generieren
    await ShoppingList.createNewList({
      selectedMenues:
        shoppingListCollection.lists[shoppingList.uid].properties
          .selectedMenues,
      menueplan: menueplan,
      products: products,
      materials: materials,
      departments: departments,
      unitConversionBasic: unitConversionBasic,
      unitConversionProducts: unitConversionProducts,
      firebase: firebase,
    })
      .then((result) => {
        updatedShoppingList = result.shoppingList;
        updatedShoppingList.uid = shoppingList.uid;
        updatedTrace = result.trace;

        if (keepManuallyAddedItems) {
          // Liste mit manuellen Einträgen mergen
          Object.entries(manuallyAddedItems).forEach(
            ([departmentKey, department]) => {
              department.items.forEach((item) => {
                if (!updatedShoppingList.list.hasOwnProperty(departmentKey)) {
                  itemToInsert = undefined;
                  updatedShoppingList.list[departmentKey] = {...department};
                } else {
                  // Prüfen ob es das in der neuen Liste auch gibt -- dann dazuzählen
                  itemToInsert = updatedShoppingList.list[
                    departmentKey
                  ].items.find(
                    (updatedListItem: ShoppingListItem) =>
                      updatedListItem.item.uid == item.item.uid &&
                      updatedListItem.quantity == item.quantity
                  );
                  if (itemToInsert) {
                    // Gibt es schon (mit dem Update dazugekommen) --> Menge dazuzählen
                    itemToInsert.quantity += item.quantity;
                  } else {
                    updatedShoppingList.list[departmentKey].items.push(item);
                  }
                }
              });
            }
          );
          // Trace mit manuellen Einträgen mergen
          Object.entries(manuallyAddedItemsTrace).forEach(([itemUid, item]) => {
            // Prüfen ob es das im neuen Trace schon gibt.
            if (!updatedTrace.hasOwnProperty(itemUid)) {
              updatedTrace[itemUid] = [];
            }
            updatedTrace[itemUid] = updatedTrace[itemUid].concat(
              manuallyAddedItemsTrace[itemUid]
            );
          });
        }

        updatedShoppingListCollection.lists[
          shoppingList.uid
        ].properties.generated = Utils.createChangeRecord(authUser);

        console.warn(
          updatedShoppingListCollection.lists[shoppingList.uid].properties
            .generated
        );

        firebase.analytics.logEvent(
          FirebaseAnalyticEvent.shoppingListRefreshed
        );
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return {
      shoppingList: updatedShoppingList,
      shoppingListCollection: updatedShoppingListCollection,
    };
  };
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
    // let allMealRecipes = [];
    // // Nur Rezepte, die auch eingeplant sind
    // menuplan.dates.forEach((day) => {
    //   if (day < dateFrom || day > dateTo) {
    //     // Nächster Schlaufendurchgang
    //     return;
    //   }
    //   menuplan.meals.forEach((meal) => {
    //     if (day === dateFrom && meal.pos < mealFrom.pos) {
    //       return;
    //     } else if (day === dateTo && meal.pos > mealTo.pos) {
    //       return;
    //     }
    //     // Alle Rezepte dieser Mahlzeit holen
    //     allMealRecipes = allMealRecipes.concat(
    //       menuplan.recipes.filter(
    //         (recipe) =>
    //           recipe.date.getTime() === day.getTime() &&
    //           recipe.mealUid === meal.uid
    //       )
    //     );
    //   });
    // });
    // return allMealRecipes;
  };
  /* =====================================================================
  // Rezepte der gewählten Periodelesen
  // ===================================================================== */
  static getRecipesFromList = async ({firebase, allMealRecipes}) => {
    // let uids = [];
    // // ====== Rezepte holen ======
    // uids = allMealRecipes.map((recipe) => recipe.recipeUid);
    // // doppelte Rezepte löschen
    // uids = [...new Set(uids)];
    // let allRecipes = await Recipe.getMultipleRecipes({
    //   firebase: firebase,
    //   uids: uids,
    // });
    // return allRecipes;
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
    // let list = [];
    // let allMealRecipes = [];
    // let fxQuantity;
    // let fxUnit;
    // if (
    //   !firebase ||
    //   !dateFrom ||
    //   !dateTo ||
    //   !mealFrom ||
    //   !mealTo ||
    //   !menuplan ||
    //   (convertUnits && (!unitConversionBasic || !unitConversionProducts))
    // ) {
    //   throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    // }
    // // Rezepte bestimmen
    // allMealRecipes = ShoppingList.defineRequiredRecipes({
    //   menuplan: menuplan,
    //   dateFrom: dateFrom,
    //   dateTo: dateTo,
    //   mealFrom: mealFrom,
    //   mealTo: mealTo,
    // });
    // // Rezepte lesen
    // let allRecipes = await ShoppingList.getRecipesFromList({
    //   firebase: firebase,
    //   allMealRecipes: allMealRecipes,
    // });
    // // ====== hochrechnen und hinzufügen======
    // allMealRecipes.forEach((mealRecipe) => {
    //   let recipe = allRecipes.find(
    //     (recipe) => recipe.uid === mealRecipe.recipeUid
    //   );
    //   // skalieren
    //   recipe.scaledQuantity = Recipe.scaleIngredients({
    //     recipe: recipe,
    //     portionsToScale: mealRecipe.noOfServings,
    //   });
    //   recipe.scaledNoOfServings = mealRecipe.noOfServings;
    //   recipe.scaledIngredients.forEach((ingredient) => {
    //     let product = products.find(
    //       (product) => product.uid === ingredient.product.uid
    //     );
    //     if (
    //       convertUnits &&
    //       product.shoppingUnit !== ingredient.unit &&
    //       product.shoppingUnit
    //     ) {
    //       try {
    //         // Einheit in Einkaufseinheit umrechnen
    //         fxQuantity = UnitConversion.convertQuantity({
    //           quantity: ingredient.quantity,
    //           product: ingredient.product,
    //           fromUnit: ingredient.unit,
    //           toUnit: product.shoppingUnit,
    //           unitConversionBasic: unitConversionBasic,
    //           unitConversionProducts: unitConversionProducts,
    //         });
    //         fxUnit = product.shoppingUnit;
    //       } catch (error) {
    //         console.warn(ingredient.product, error);
    //         fxQuantity = ingredient.quantity;
    //         fxUnit = ingredient.unit;
    //       }
    //     } else {
    //       // Keine Umrechnung
    //       fxQuantity = ingredient.quantity;
    //       fxUnit = ingredient.unit;
    //     }
    //     // hinzufügen;
    //     list = ShoppingList.addProductToShoppingList({
    //       list: list,
    //       quantity: fxQuantity,
    //       unit: fxUnit,
    //       productToAdd: ingredient.product,
    //       products: products,
    //       departments: departments,
    //       manualAdded: false,
    //     });
    //   });
    // });
    // // Einträge alphabetisch sortieren
    // list.forEach((department) => {
    //   department.items = Utils.sortArray({
    //     array: department.items,
    //     attributeName: "name",
    //   });
    // });
    // return list;
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
    // if (!list || !productToAdd || !products || !departments) {
    //   throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    // }
    // if (!unit) {
    //   // Kein null!
    //   unit = "";
    // }
    // let product = products.find((product) => product.uid === productToAdd.uid);
    // if (!product) {
    //   throw new Error(TEXT.ERROR_PRODUCT_UNKNOWN(productToAdd.name));
    // }
    // // Nach der Abteilung suchen
    // let department = list.find(
    //   (department) => department.uid === product.departmentUid
    // );
    // if (!department) {
    //   department = {
    //     uid: product.departmentUid,
    //     name: product.departmentName,
    //     pos: departments.find(
    //       (department) => department.uid === product.departmentUid
    //     ).pos,
    //     items: [],
    //   };
    //   list.push(department);
    //   // Abteilungen sortieren
    //   list = Utils.sortArray({
    //     array: list,
    //     attributeName: "pos",
    //   });
    // }
    // // Nach Produkt suchen
    // let item = department.items.find(
    //   (item) => item.uid === product.uid && item.unit === unit
    // );
    // if (item) {
    //   // Menge aufrechnen
    //   item.quantity = item.quantity + quantity;
    // } else {
    //   item = {
    //     checked: false,
    //     name: product.name,
    //     uid: product.uid,
    //     quantity: quantity,
    //     unit: unit ? unit : "",
    //   };
    //   if (manualAdded) {
    //     item.manualAdded = true;
    //   }
    //   department.items.push(item);
    // }
    // return list;
  };
  /* =====================================================================
  // Einkaufsliste speichern
  // ===================================================================== */
  static save = async ({
    firebase,
    eventUid,
    shoppingListCollection,
    authUser,
  }: Save) => {
    shoppingListCollection.lastChange = Utils.createChangeRecord(authUser);

    await firebase.event.shoppingListCollection
      .set({
        uids: [eventUid],
        value: shoppingListCollection,
        authUser: authUser,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  // ===================================================================== */
  /**
   * List löschen
   * @param object - Objekt mit ShoppingListCollection, authUser
   * @returns void
   */
  static deleteList = async ({
    firebase,
    shoppingListColection,
    eventUid,
    listUidToDelete,
    authUser,
  }: DeleteList) => {
    let updatedShoppingListCollection = _.cloneDeep(
      shoppingListColection
    ) as ShoppingListCollection;
    delete updatedShoppingListCollection.lists[listUidToDelete];

    updatedShoppingListCollection.lastChange = {
      fromDisplayName: authUser.publicProfile.displayName,
      fromUid: authUser.uid,
      date: new Date(),
    };

    updatedShoppingListCollection.noOfLists--;

    await firebase.event.shoppingListCollection
      .set({
        uids: [eventUid, updatedShoppingListCollection.eventUid],
        value: updatedShoppingListCollection,
        authUser: authUser,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return updatedShoppingListCollection;
  };
  // ===================================================================== */
  /**
   * Listen-Namen anpassen
   * @param object - Objekt mit ShoppingListCollection, authUser
   * @returns void
   */
  static editListName = ({
    shoppingListCollection,
    listUidToEdit,
    newName,
    authUser,
  }: EditListName) => {
    let updatedShoppingListCollection = _.cloneDeep(
      shoppingListCollection
    ) as ShoppingListCollection;

    updatedShoppingListCollection.lists[listUidToEdit].properties.name =
      newName;
    updatedShoppingListCollection.lastChange = {
      fromDisplayName: authUser.publicProfile.displayName,
      fromUid: authUser.uid,
      date: new Date(),
    };

    return updatedShoppingListCollection;
  };
  /* =====================================================================
  // Postizettel aus DB lesen
  // ===================================================================== */
  static getShoppingList = async ({firebase, eventUid}) => {
    // let shoppingList = {};
    // if (!firebase || !eventUid) {
    //   throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    // }
    // const shoppingListDoc = firebase.shoppingList(eventUid);
    // await shoppingListDoc
    //   .get()
    //   .then((snapshot) => {
    //     if (!snapshot.data()) {
    //       return;
    //     }
    //     shoppingList = snapshot.data();
    //     //Timestamps umbiegen
    //     shoppingList.dateFrom = shoppingList.dateFrom.toDate();
    //     shoppingList.dateTo = shoppingList.dateTo.toDate();
    //     shoppingList.generatedOn = shoppingList.generatedOn.toDate();
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     throw error;
    //   });
    // return shoppingList;
  };
  /* =====================================================================
  // Anzahl Artikel in Postizettel ermitteln
  // ===================================================================== */
  static countItems = ({shoppingList}) => {
    // let noItems = 0;
    // shoppingList.list.forEach((department) => {
    //   noItems += department.items.length;
    // });
    // return noItems;
  };
  /* =====================================================================
  // Anzahl Abteilungen in Postizettel ermitteln
  // ===================================================================== */
  static countDepartments = ({shoppingList}) => {
    // let noDepartment = 0;
    // // Anzahl Abteilungen zählen
    // shoppingList.list.forEach((department) => {
    //   if (department.items.length > 0) {
    //     noDepartment++;
    //   }
    // });
    // return noDepartment;
  };
  /* =====================================================================
  // Alles Rezepte auslesen, die ein bestimmtes Produkt beinhalten
  // ===================================================================== */
  static getRecipesWithItem = ({itemUid, recipes, mealRecipes, meals}) => {
    // let recipesWithItem = [];
    // mealRecipes.forEach((mealRecipe) => {
    //   // Rezept suchen
    //   let recipe = recipes.find(
    //     (recipe) => recipe.uid === mealRecipe.recipeUid
    //   );
    //   // Prüfen ob Zutat vorkommt
    //   let foundIngredientsOfRecipe = recipe.ingredients.filter(
    //     (ingredient) => ingredient.product.uid === itemUid
    //   );
    //   if (foundIngredientsOfRecipe.length > 0) {
    //     // Rezept skalieren
    //     recipe.scaledIngredients = Recipe.scaleIngredients({
    //       recipe: recipe,
    //       portionsToScale: mealRecipe.noOfServings,
    //     });
    //     recipe.scaledIngredients.forEach((ingredient) => {
    //       if (ingredient.product.uid === itemUid) {
    //         // hinzufügen
    //         recipesWithItem.push({
    //           recipeUid: recipe.uid,
    //           recipeName: recipe.name,
    //           ingredientQuantity: ingredient.quantity,
    //           ingredientUnit: ingredient.unit,
    //           mealDate: mealRecipe.date,
    //           mealName: meals.find((meal) => meal.uid === mealRecipe.mealUid)
    //             .name,
    //         });
    //       }
    //     });
    //   }
    // });
    // return recipesWithItem;
  };
}
