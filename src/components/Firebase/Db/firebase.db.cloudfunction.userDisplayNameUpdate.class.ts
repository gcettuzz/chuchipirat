import Firebase from "../firebase.class";
import FirebaseDbCloudFunctionSuper, {
  CloudFunctionType,
} from "./firebase.db.cloudfunction.super.class";

export class FirebaseDbCloudFunctionUserDisplayNameUpdate extends FirebaseDbCloudFunctionSuper {
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
      `_cloudFunctions/functions/updateUserDisplayName/${uids[0]}`
    );
  }
  /* =====================================================================
  // Trigger für CloudFunction
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection(
      "_cloudFunctions/functions/updateUserDisplayName"
    );
  }
  /* =====================================================================
  // CloudFunction Type zurückgeben
  // ===================================================================== */
  getCloudFunctionType(): CloudFunctionType {
    return CloudFunctionType.userDiplayNameUpdate;
  }
}
export default FirebaseDbCloudFunctionUserDisplayNameUpdate;
