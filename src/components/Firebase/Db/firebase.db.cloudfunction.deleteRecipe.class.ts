import Firebase from "../firebase.class";
import FirebaseDbCloudFunctionSuper, {
  CloudFunctionType,
} from "./firebase.db.cloudfunction.super.class";
import {
  PrepareDataForApp,
  PrepareDataForDb,
  ValueObject,
} from "./firebase.db.super.class";
import {collection, doc} from "firebase/firestore";

export class FirebaseDbCloudFunctionDeleteRecipe extends FirebaseDbCloudFunctionSuper {
  firebase: Firebase;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
  }
  /* =====================================================================
  // Trigger für CloudFunction
  // ===================================================================== */
  getCollection() {
    return collection(
      this.firebase.firestore,
      super.getCollection().path,
      `functions/deleteRecipe`
    );
  }
  /* =====================================================================
  // Trigger für CloudFunction
  // ===================================================================== */
  getDocument(uids: string[]) {
    return doc(this.firebase.firestore, this.getCollection().path, uids[0]);
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({value}: PrepareDataForDb<T>) {
    return value as unknown as T;
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({value}: PrepareDataForApp): T {
    return value as unknown as T;
  }
  /* =====================================================================
  // CloudFunction Type zurückgeben
  // ===================================================================== */
  getCloudFunctionType(): CloudFunctionType {
    return CloudFunctionType.deleteRecipe;
  }
}
export default FirebaseDbCloudFunctionDeleteRecipe;
