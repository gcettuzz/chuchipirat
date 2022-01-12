import Firebase from "../firebase.class";
import { AuthUser } from "../Authentication/authUser.class";
import {
  FirebaseSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";

export class FirebaseDbRecipeShort extends FirebaseSuper {
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
    return this.firebase.db.collection("recipes");
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument() {
    return this.firebase.db.doc(`recipes/000_allRecipes`);
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    // Not implemented
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({ value }: PrepareDataForDb<T>) {
    return {
      [value.uid]: {
        name: value.name,
        pictureSrc: value.pictureSrc,
        private: value.private,
        tags: value.tags,
        linkedRecipes: value.linkedRecipes,
        createdFromUid: value.createdFromUid,
      },
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    // Die Aufsplittung von Objekt zu Array geschieht in der recipeshort.class
    return value as unknown as T;
  }
}
export default FirebaseDbRecipeShort;
