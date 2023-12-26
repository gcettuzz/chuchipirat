import Firebase from "../firebase.class";
import {
  FirebaseDbSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";

import {ERROR_NOT_IMPLEMENTED_YET} from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
import {RecipeType} from "../../Recipe/recipe.class";
import {MealRecipe, MealRecipes} from "../../Event/Menuplan/menuplan.class";

export class FirebaseDbEventMenuplan extends FirebaseDbSuper {
  firebase: Firebase;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection("events/docs");
  }
  /* =====================================================================
  // Collection-Group holen
  // ===================================================================== */
  getCollectionGroup() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    return this.firebase.db.collectionGroup("none");
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(`events/${uids[0]}/docs/menuplan`);
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    // Not implemented
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({value}: PrepareDataForDb<T>) {
    // Für die DB braucht es die verwendeten Rezepte in einem Array.
    // So können gelöschte Rezepte auch in einem Menüplan gefunden werden
    // in der App selbst ist diese Information bereits in den MealRecipes.
    // Das finden (Select - Where) funktioniert jedoch nur mit einem solchen
    // Array.
    let usedRecipes: string[] = [];

    Object.values(value.mealRecipes as MealRecipes).forEach((mealRecipe) => {
      if (!mealRecipe.recipe.recipeUid.includes("[DELETED]")) {
        if (!usedRecipes.includes(mealRecipe.recipe.recipeUid)) {
          usedRecipes.push(mealRecipe.recipe.recipeUid);
        }
      }
    });

    return {
      dates: value.dates.map((date) => this.firebase.timestamp.fromDate(date)),
      mealTypes: value.mealTypes,
      notes: value.notes,
      mealRecipes: value.mealRecipes,
      meals: value.meals,
      menues: value.menues,
      materials: value.materials,
      products: value.products,
      // diets: value.diets,
      // intolerances: value.intolerances,
      // portions: value.portions,
      // totals: value.totals,
      created: value.created,
      lastChange: value.lastChange,
      usedRecipes: usedRecipes,
      // created: {
      //   date: this.firebase.timestamp.fromDate(value.created.date),
      //   fromUid: value.created.fromUid,
      //   fromDisplayName: value.created.fromDisplayName,
      // },
      // lastChange: {
      //   date: this.firebase.timestamp.fromDate(value.lastChange.date),
      //   fromUid: value.lastChange.fromUid,
      //   fromDisplayName: value.lastChange.fromDisplayName,
      // },
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    if (!value) {
      throw new Error("No Values fetched!");
    }
    return {
      dates: value.dates,
      // dates: value?.dates.map((timestamp) =>
      //   timestamp instanceof Date ? timestamp : timestamp.toDate()
      // ),
      mealTypes: value.mealTypes,
      notes: value?.notes ? value.notes : {},
      meals: value?.meals ? value.meals : {},
      menues: value?.menues ? value.menues : {},
      mealRecipes: value?.mealRecipes ? value.mealRecipes : {},
      materials: value?.materials ? value.materials : {},
      products: value?.products ? value.products : {},
      created: value.created,
      lastChange: value.lastChange,
      // created: {
      //   date:
      //     value.created.date instanceof Date
      //       ? value.created.date
      //       : value.created.date.toDate(),
      //   fromUid: value.created.fromUid,
      //   fromDisplayName: value.created.fromDisplayName,
      // },
      // lastChange: {
      //   date:
      //     value.lastChange.date instanceof Date
      //       ? value.lastChange.date
      //       : value.lastChange.date.toDate(),
      //   fromUid: value.lastChange.fromUid,
      //   fromDisplayName: value.lastChange.fromDisplayName,
      // },
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.MENUPLAN;
  }
}
export default FirebaseDbEventMenuplan;
