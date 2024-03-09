import {
  CollectionReference,
  DocumentReference,
} from "@firebase/firestore-types";
import {ERROR_PARAMETER_NOT_PASSED} from "../../../constants/text";

import Firebase from "../firebase.class";
import {AuthUser} from "../Authentication/authUser.class";
import {ValueObject} from "./firebase.db.super.class";
import FirebaseAnalyticEvent from "../../../constants/firebaseEvent";

export enum CloudFunctionType {
  userDiplayNameUpdate = "userDisplayNameUpdate",
  userMottoUpdate = "userMottoUpdate",
  userPictureSrcUpdate = "userPictureSrcUpdate",
  recipeUpdate = "recipeUpdate",
  recipeDelete = "recipeDelete",
  objectTrace = "objectTrace",
  productUpdate = "productUpdate",
  recipeReviewMailCommunityLeaders = "recipeReviewMailCommunityLeaders",
  requestPublishRecipe = "requestPublishRecipe",
  mailUser = "mailUser",
  dailySummary = "dailySummary",
  feedsDelete = "feedsDelete",
  mergeProducts = "mergeProducts",
  convertProductToMaterial = "convertProductToMaterial",
  activateSupportUser = "activateSupportUser",
}

interface CreateDocumentForCloudFunctionsTrigger {
  document: DocumentReference;
  values: {[key: string]: any};
}
export interface TriggerCloudFunction {
  values: {[key: string]: any};
  authUser: AuthUser;
}
interface UpdateLog {
  uid: string;
  cloudFunctionType: CloudFunctionType;
  authUser: AuthUser;
}
interface UpdateCounter {
  cloudFunctionType: CloudFunctionType;
}
interface Listen<T> {
  uids: string[];
  callback: (T) => void;
}

export interface BaseDocumentStructure {
  date: Date;
  done: boolean;
}

export abstract class FirebaseDbCloudFunctionSuper {
  abstract firebase: Firebase;
  abstract getDocument(uids?: string[]): DocumentReference;
  abstract getCollection(uid?: string): CollectionReference;
  abstract getCloudFunctionType(): CloudFunctionType;

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
  async updateLog({uid, cloudFunctionType, authUser}: UpdateLog) {
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
        throw error;
      });
  }
  /* =====================================================================
  // Zähler der Cloud-FX hochzählen
  // ===================================================================== */
  updateCounter = async ({cloudFunctionType}: UpdateCounter) => {
    const document = this.firebase.db.doc("_cloudFunctions/functions");

    document
      .update({
        [cloudFunctionType]: this.firebase.fieldValue.increment(1),
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  // ===================================================================== */
  /**
   * Bestimmtes Dokument - überwachen
   * @param param0  Objekt mit UIDs zu Dokument und Callback Funtion
   */
  async listen<T extends ValueObject>({uids, callback}: Listen<T>) {
    const document = this.getDocument(uids);

    return document.onSnapshot((snapshot) => {
      callback(snapshot.data());
    });
  }
  // ===================================================================== */
  /**
   * Cloudfunction triggern
   * @param param0  Objekt mit zu schreibenden Werten für die Cloudfuntions
   *                und den authUser
   * @returns UID des Dokumentes, das den Trigger ausgelöst hat
   */
  async triggerCloudFunction({values, authUser}: TriggerCloudFunction) {
    const document = this.getCollection().doc();

    await this.createDocumentForCloudFunctionsTrigger({
      document: document,
      values: values,
    }).catch((error) => {
      console.error(error);
      throw error;
    });

    this.updateLog({
      uid: document.id,
      cloudFunctionType: this.getCloudFunctionType(),
      authUser: authUser,
    });
    this.updateCounter({cloudFunctionType: this.getCloudFunctionType()});
    this.firebase.analytics.logEvent(
      FirebaseAnalyticEvent.cloudFunctionExecuted,
      {
        function: this.getCloudFunctionType(),
      }
    );

    return document.id;
  }
}
export default FirebaseDbCloudFunctionSuper;
