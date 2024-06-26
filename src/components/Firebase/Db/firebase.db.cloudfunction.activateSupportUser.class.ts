import Firebase from "../firebase.class";
import FirebaseDbCloudFunctionSuper, {
  BaseDocumentStructure,
  CloudFunctionType,
} from "./firebase.db.cloudfunction.super.class";
import {
  ValueObject,
  PrepareDataForApp,
  PrepareDataForDb,
} from "./firebase.db.super.class";

export interface CloudFunctionActivateSupportUserDocumentStructure
  extends BaseDocumentStructure {
  eventUid: string;
  supportUserUid: string;
  errorMessage: Error["message"];
}

export class FirebaseDbCloudFunctionActivateSupportUser extends FirebaseDbCloudFunctionSuper {
  firebase: Firebase;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
  }
  /* =====================================================================
  // Dokument holen, das die Cloudfunction triggert
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(
      `_cloudFunctions/functions/activateSupportUser/${uids[0]}`
    );
  }
  /* =====================================================================
  // Trigger für CloudFunction
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection(
      "_cloudFunctions/functions/activateSupportUser"
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
  prepareDataForApp<T extends ValueObject>({value}: PrepareDataForApp): T {
    return value as unknown as T;
  }
  /* =====================================================================
  // CloudFunction Type zurückgeben
  // ===================================================================== */
  getCloudFunctionType(): CloudFunctionType {
    return CloudFunctionType.activateSupportUser;
  }
}
export default FirebaseDbCloudFunctionActivateSupportUser;
