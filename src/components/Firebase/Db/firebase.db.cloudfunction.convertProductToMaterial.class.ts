import Firebase from "../firebase.class";
import FirebaseDbCloudFunctionSuper, {
  CloudFunctionType,
} from "./firebase.db.cloudfunction.super.class";

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
  // CloudFunction Type zurückgeben
  // ===================================================================== */
  getCloudFunctionType(): CloudFunctionType {
    return CloudFunctionType.convertProductToMaterial;
  }
}
export default FirebaseDbCloudFunctionConvertProductToMaterial;
