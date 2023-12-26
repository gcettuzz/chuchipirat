import Firebase from "../firebase.class";
import FirebaseDbRecipeShort from "./firebase.db.recipeShort.class";

import {ERROR_NOT_IMPLEMENTED_YET} from "../../../constants/text";
import {ValueObject, PrepareDataForApp} from "./firebase.db.super.class";
import {RecipeType} from "../../Recipe/recipe.class";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";

export class FirebaseDbRecipeShortPrivate extends FirebaseDbRecipeShort {
  firebase: Firebase;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super(firebase);
    this.firebase = firebase;
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection(uids: string[]) {
    return this.firebase.db.collection(`recipes/000_userRecipes/${uids[0]}`);
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
    if (uids.length === 0) {
      return this.firebase.db.doc(`recipes/000_userRecipes/`);
    } else {
      return this.firebase.db.doc(
        `recipes/000_userRecipes/${uids[0]}/000_allRecipes`
      );
    }
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    // Die Aufsplittung von Objekt zu Array geschieht in der recipeshort.class
    value = super.prepareDataForApp({uid: uid, value: value});
    // Schlüssel setzen, dass privat
    Object.keys(value).forEach((recipeUid) => {
      value[recipeUid].type = RecipeType.private;
    });

    return value as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.RECIPE_SHORT_PRIVATE;
  }
}
export default FirebaseDbRecipeShortPrivate;
