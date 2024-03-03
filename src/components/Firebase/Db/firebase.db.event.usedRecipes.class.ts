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
import {UsedRecipeListEntry} from "../../Event/UsedRecipes/usedRecipes.class";
import {
  Ingredient,
  PositionType,
  RecipeMaterialPosition,
  RecipeObjectStructure,
} from "../../Recipe/recipe.class";

export class FirebaseDbEventUsedRecipes extends FirebaseDbSuper {
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
    return this.firebase.db.doc(`events/${uids[0]}/docs/usedRecipes`);
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
    const usedProducts: string[] = [];
    const usedMaterials: string[] = [];

    Object.values(value.lists as UsedRecipeListEntry).forEach(
      (list: UsedRecipeListEntry) =>
        Object.values(list.recipes).forEach((recipe) => {
          // Produkte sammelnd
          Object.values(recipe.ingredients.entries).forEach((position) => {
            if (position.posType === PositionType.ingredient) {
              const ingredient = position as Ingredient;
              if (!usedProducts.includes(ingredient.product.uid)) {
                usedProducts.push(ingredient.product.uid);
              }
            }
          });
          // Material sammeln
          Object.values(
            recipe.materials
              .entries as RecipeObjectStructure<RecipeMaterialPosition>["entries"]
          ).forEach((position) => {
            if (!usedMaterials.includes(position.material.uid)) {
              usedMaterials.push(position.material.uid);
            }
          });
        })
    );

    return {
      noOfLists: value.noOfLists,
      lastChange: value.lastChange,
      lists: value.lists,
      usedProducts: usedProducts,
      usedMaterials: usedMaterials,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({value}: PrepareDataForApp) {
    if (!value) {
      throw new Error("No Values fetched!");
    }
    return {
      noOfLists: value.noOfLists,
      lastChange: value.lastChange,
      lists: value?.lists ? value.lists : {},
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.USED_RECIPES;
  }
}
export default FirebaseDbEventUsedRecipes;
