import Firebase from "../firebase.class";
import FirebaseDbCloudFunctionSuper, {
  CloudFunctionType,
} from "./firebase.db.cloudfunction.super.class";
import {
  PrepareDataForApp,
  PrepareDataForDb,
  ValueObject,
} from "./firebase.db.super.class";

export class FirebaseDbCloudFunctionConvertProductToMaterial extends FirebaseDbCloudFunctionSuper {
  firebase: Firebase;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(
      `_cloudFunctions/functions/convertProductToMaterial/${uids[0]}`
    );
  }
  /* =====================================================================
  // Trigger für CloudFunction
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection(
      "_cloudFunctions/functions/convertProductToMaterial"
    );
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
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp): T {
    return {...value, uid: uid} as unknown as T;
  }

  /* =====================================================================
  // CloudFunction Type zurückgeben
  // ===================================================================== */
  getCloudFunctionType(): CloudFunctionType {
    return CloudFunctionType.convertProductToMaterial;
  }
}
export default FirebaseDbCloudFunctionConvertProductToMaterial;
