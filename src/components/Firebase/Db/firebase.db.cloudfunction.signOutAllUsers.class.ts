import Firebase from "../firebase.class";
import FirebaseDbCloudFunctionSuper, {
  // BaseDocumentStructure,
  CloudFunctionType,
} from "./firebase.db.cloudfunction.super.class";

// export interface CloudFunctionActivateSupportUserDocumentStructure
//   extends BaseDocumentStructure {
//   eventUid: string;
//   supportUserUid: string;
//   errorMessage: Error["message"];
// }

export class FirebaseDbCloudFunctionSignOutAllUsers extends FirebaseDbCloudFunctionSuper {
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
      `_cloudFunctions/functions/signOutAllUsers/${uids[0]}`
    );
  }
  /* =====================================================================
  // Trigger für CloudFunction
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection(
      "_cloudFunctions/functions/signOutAllUsers"
    );
  }
  /* =====================================================================
  // CloudFunction Type zurückgeben
  // ===================================================================== */
  getCloudFunctionType(): CloudFunctionType {
    return CloudFunctionType.signOutAllUsers;
  }
}
export default FirebaseDbCloudFunctionSignOutAllUsers;
