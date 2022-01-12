import {
  CollectionReference,
  DocumentReference,
} from "@firebase/firestore-types";
import { ERROR_PARAMETER_NOT_PASSED } from "../../../constants/text";

import Firebase from "../firebase.class";
import { AuthUser } from "../Authentication/authUser.class";

export enum CloudFunctionType {
  userDiplayName = "userDisplayName",
  userMotto = "userMotto",
  userPictureSrc = "userPictureSrc",
  recipeUpdate = "recipeUpdate",
}

interface CreateDocumentForCloudFunctionsTrigger {
  document: DocumentReference;
  values: { [key: string]: any };
}
export interface TriggerCloudFunction {
  values: { [key: string]: any };
  authUser: AuthUser;
}
interface UpdateLog {
  uid: string;
  cloudFunctionType: CloudFunctionType;
  authUser: AuthUser;
}

export abstract class FirebaseDbCloudFunctionSuper {
  abstract firebase: Firebase;
  abstract getCollection(uid?: string): CollectionReference;

  /* =====================================================================
  // Dokument schreiben
  // ===================================================================== */
  async createDocumentForCloudFunctionsTrigger({
    document,
    values,
  }: CreateDocumentForCloudFunctionsTrigger) {
    if (!document) {
      throw new Error(ERROR_PARAMETER_NOT_PASSED);
    }
    values.date = this.firebase.timestamp.fromDate(new Date());

    return await document.set(values).catch((error) => {
      console.error(error);
      throw error;
    });
  }
  /* =====================================================================
  // Logfile updaten
  // ===================================================================== */
  async updateLog({ uid, cloudFunctionType, authUser }: UpdateLog) {
    const document = this.firebase.db.doc("_cloudFunctions/log");

    document
      .update({
        [uid]: {
          cloudFunctionType: cloudFunctionType,
          date: this.firebase.timestamp.fromDate(new Date()),
          invokedBy: {
            uid: authUser.uid,
            displayName: authUser.publicProfile.displayName,
            firstName: authUser.firstName,
            lastName: authUser.lastName,
            email: authUser.email,
          },
        },
      })
      .catch((error) => {
        console.error(error);
      });
  }
  // ===================================================================== */
  /**
   * Cloudfunction triggern
   * @param param0  Objekt mit zu schreibenden Werten für die Cloudfuntions
   *                 und den authUser
   * @returns UID des Dokumentes, das den Trigger ausgelöst hat
   */
  triggerCloudFunction({ values, authUser }: TriggerCloudFunction) {
    const document = this.getCollection().doc();

    this.createDocumentForCloudFunctionsTrigger({
      document: document,
      values: values,
    });

    this.updateLog({
      uid: document.id,
      cloudFunctionType: CloudFunctionType.recipeUpdate,
      authUser: authUser,
    });

    return document.id;
  }
}
export default FirebaseDbCloudFunctionSuper;
