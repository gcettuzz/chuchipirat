import MailTemplate from "../../../constants/mailTemplates";
import User from "../../User/user.class";
import Firebase from "../firebase.class";
import FirebaseDbCloudFunctionSuper, {
  BaseDocumentStructure,
  CloudFunctionType,
} from "./firebase.db.cloudfunction.super.class";

export interface CloudFunctionMailUserDocumentStructure
  extends BaseDocumentStructure {
  mailTemplate: MailTemplate;
  recipientUid: User["uid"];
  recipients: string;
  templateData: {[key: string]: string};
}

export class FirebaseDbCloudFunctionMailUser extends FirebaseDbCloudFunctionSuper {
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
      `_cloudFunctions/functions/mailUser/${uids[0]}`
    );
  }
  /* =====================================================================
  // Trigger für CloudFunction
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection("_cloudFunctions/functions/mailUser");
  }
  /* =====================================================================
  // CloudFunction Type zurückgeben
  // ===================================================================== */
  getCloudFunctionType(): CloudFunctionType {
    return CloudFunctionType.mailUser;
  }
}
export default FirebaseDbCloudFunctionMailUser;
