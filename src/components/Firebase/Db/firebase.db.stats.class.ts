import Firebase from "../firebase.class";
import {FirebaseDbSuper, ValueObject} from "./firebase.db.super.class";

import {
  ERROR_WRONG_DB_CLASS,
  ERROR_NOT_IMPLEMENTED_YET,
} from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
import FirebaseDbStatsCounter from "./firebase.db.stats.counter.class";
import FirebaseDbStatsRecipeVariants from "./firebase.db.stats.recipeVariants.class";
import FirebaseDbStatsRecipesInMenuplan from "./firebase.db.stats.recipesInMenuplan.class";
import {collection, collectionGroup, doc} from "firebase/firestore";

export class FirebaseDbStats extends FirebaseDbSuper {
  firebase: Firebase;
  counter: FirebaseDbStatsCounter;
  recipeVariants: FirebaseDbStatsRecipeVariants;
  recipesInMenuplan: FirebaseDbStatsRecipesInMenuplan;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    this.counter = new FirebaseDbStatsCounter(firebase);
    this.recipeVariants = new FirebaseDbStatsRecipeVariants(firebase);
    this.recipesInMenuplan = new FirebaseDbStatsRecipesInMenuplan(firebase);
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    throw Error(ERROR_WRONG_DB_CLASS);
    return collection(this.firebase.firestore, `stats`);
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
    throw Error(ERROR_WRONG_DB_CLASS);
    return doc(this.firebase.firestore, this.getCollection().path, uids[0]);
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
  prepareDataForDb() {
    return {};
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>() {
    return {} as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.NONE;
  }
}
export default FirebaseDbStats;
