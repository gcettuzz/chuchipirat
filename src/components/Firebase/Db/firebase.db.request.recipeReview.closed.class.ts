import Firebase from "../firebase.class";
import {
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
  FirebaseDbSuper,
} from "./firebase.db.super.class";
import FirebaseDbRequestRecipeReview from "./firebase.db.request.recipeReview.class";
import {
  ERROR_WRONG_DB_CLASS,
  ERROR_NOT_IMPLEMENTED_YET,
} from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";

export class FirebaseDbRequestRecipeReviewClosed extends FirebaseDbSuper {
  firebase: Firebase;
  recipe: FirebaseDbRequestRecipeReview;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase, recipe: FirebaseDbRequestRecipeReview) {
    super();
    this.firebase = firebase;
    this.recipe = recipe;
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection(uids: string[]) {
    return this.firebase.db.collection("_requests/recipeReview/closed");
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
    return this.firebase.db.doc(`_requests/recipeReview/closed/${uids[0]}`);
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    throw Error(ERROR_WRONG_DB_CLASS);
    // Not implemented
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({ value }: PrepareDataForDb<T>) {
    return this.recipe.prepareDataForDb<T>({ value: value });
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    return this.recipe.prepareDataForApp<T>({ uid: uid, value: value });
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.NONE;
  }
}
export default FirebaseDbRequestRecipeReviewClosed;
