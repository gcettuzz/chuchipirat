import Firebase from "../firebase.class";
import FirebaseDbRecipe from "./firebase.db.recipe.class";

import {RecipeType} from "../../Recipe/recipe.class";

import {ValueObject, PrepareDataForApp} from "./firebase.db.super.class";
import FirebaseDbRecipeRating from "./firebase.db.recipe.rating.class";
import FirebaseDbRecipeComment from "./firebase.db.recipe.comment.class";

import {ERROR_NOT_IMPLEMENTED_YET} from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
import {collection, collectionGroup, doc} from "firebase/firestore";

export class FirebaseDbRecipeVariant extends FirebaseDbRecipe {
  firebase: Firebase;
  comment: FirebaseDbRecipeComment;
  rating: FirebaseDbRecipeRating;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super(firebase);
    this.firebase = firebase;
    this.comment = new FirebaseDbRecipeComment(firebase);
    this.rating = new FirebaseDbRecipeRating(firebase);
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection(uids: string[]) {
    return collection(
      this.firebase.firestore,
      `recipes/variants/events/${uids[0]}/recipes`
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
    // Not implemented
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    // Die Aufsplittung von Objekt zu Array geschieht in der recipeshort.class
    value = super.prepareDataForApp({uid: uid, value: value});
    // Schlüssel setzen, dass Variante
    value.type = RecipeType.variant;
    return value as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.RECIPE;
  }
}
export default FirebaseDbRecipeVariant;
