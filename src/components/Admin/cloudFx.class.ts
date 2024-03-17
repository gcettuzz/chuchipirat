import AuthUser from "../Firebase/Authentication/authUser.class";
import {CloudFunctionType} from "../Firebase/Db/firebase.db.cloudfunction.super.class";
import {ValueObject} from "../Firebase/Db/firebase.db.super.class";
import Firebase from "../Firebase/firebase.class";
import User from "../User/user.class";
import UserPublicProfile from "../User/user.public.profile.class";

export interface CloudFxLogEntry {
  uid: string;
  cloudFunctionType: CloudFunctionType;
  date: Date;
  invokedBy: {
    displayName: UserPublicProfile["displayName"];
    email: User["email"];
    firstName: User["firstName"];
    lastName: User["lastName"];
    uid: User["uid"];
  };
}

interface GetCloudFxOverview {
  firebase: Firebase;
}
interface GetCloudFunctionTriggerFile {
  firebase: Firebase;
  cloudFunctionType: CloudFunctionType;
  triggerFileUid: string;
}
interface DeleteCloudFxTriggerDocuments {
  firebase: Firebase;
  authUser: AuthUser;
  dayOffset: number;
  cloudFxLog: CloudFxLogEntry[];
}

class CloudFx {
  uid: string;
  [key: string]: string | number | string[] | ValueObject;

  constructor() {
    this.uid = "";
  }
  // ===================================================================== */
  /**
   * Versand-Protokoll holen
   */
  static getCloudFunctionTriggerFile = async ({
    firebase,
    cloudFunctionType,
    triggerFileUid,
  }: GetCloudFunctionTriggerFile) => {
    return await firebase.cloudFunction[cloudFunctionType]
      .read({
        uids: [triggerFileUid],
      })
      .then((result) => {
        result.uid = triggerFileUid;
        return result as CloudFx;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  // ===================================================================== */
  /**
   * Cloud-FX-Log auslesen
   */
  static getCloudFxLog = async ({firebase}: GetCloudFxOverview) => {
    const cloudFxLog: CloudFxLogEntry[] = [];

    await firebase.cloudFunction.log
      .read({uids: []})
      .then((result) => {
        Object.keys(result).forEach((key) => {
          cloudFxLog.push({uid: key, ...result[key]});
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return cloudFxLog;
  };
  // ===================================================================== */
  /**
   * Cloud-FX-Trigger-Dokumente löschen
   */
  static deleteCloudFxTriggerDocuments = async ({
    firebase,
    authUser,
    dayOffset,
    cloudFxLog,
  }: DeleteCloudFxTriggerDocuments) => {
    let counter = 0;

    const offsetDate = new Date();
    offsetDate.setDate(offsetDate.getDate() - dayOffset);
    const offsetTimestamp = offsetDate.getTime();

    const deletedDocuments: Promise<void>[] = [];

    const newCloudFxLog: {[key: string]: any} = {};
    // Dokumente löschen und cloudFxLog gleich anpassen
    cloudFxLog.forEach((logEntry) => {
      if (logEntry.date.getTime() <= offsetTimestamp) {
        // Dokument löschen
        deletedDocuments.push(
          firebase.cloudFunction[logEntry.cloudFunctionType]
            .delete({uids: [logEntry.uid]})
            .catch((error) => console.error(error))
        );
        counter++;
      } else {
        // den behalten wir
        newCloudFxLog[logEntry.uid] = logEntry;
      }
    });

    await Promise.all(deletedDocuments);

    // Neue Struktur updaten
    firebase.cloudFunction.log
      .set({uids: [], value: newCloudFxLog, authUser: authUser})
      .catch((error) => {
        console.error(error);
        throw error;
      });

    cloudFxLog = cloudFxLog.filter(
      (logEntry) => logEntry.date.getTime() >= offsetTimestamp
    );

    return {counter, cloudFxLog};
  };
}

export default CloudFx;
