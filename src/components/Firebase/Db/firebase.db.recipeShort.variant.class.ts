import Firebase from "../firebase.class";
import FirebaseDbRecipeShort from "./firebase.db.recipeShort.class";

import {ERROR_NOT_IMPLEMENTED_YET} from "../../../constants/text";
import {ValueObject, PrepareDataForApp} from "./firebase.db.super.class";
import {RecipeType} from "../../Recipe/recipe.class";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
import {collection, collectionGroup, doc} from "firebase/firestore";

export class FirebaseDbRecipeShortVariant extends FirebaseDbRecipeShort {
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
    return collection(
      this.firebase.firestore,
      `recipes/variants/events/${uids[0]}/recipes/`
    );
  }
  /* =====================================================================
  // Collection-Group holen
  // ===================================================================== */
  getCollectionGroup() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    return collectionGroup(this.firebase.firestore, `none`);
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return doc(this.firebase.firestore, this.getCollection(uids).path, uids[1]);
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
      value[recipeUid].type = RecipeType.variant;
    });
    return value as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.RECIPE_SHORT_VARIANT;
  }
}
export default FirebaseDbRecipeShortVariant;
