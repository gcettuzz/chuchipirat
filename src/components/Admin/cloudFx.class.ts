import {ImageRepository} from "../../constants/imageRepository";
import MailTemplate from "../../constants/mailTemplates";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CloudFunctionType} from "../Firebase/Db/firebase.db.cloudfunction.super.class";
import {ValueObject} from "../Firebase/Db/firebase.db.super.class";
import Firebase from "../Firebase/firebase.class";
import User from "../User/user.class";
import UserPublicProfile from "../User/user.public.profile.class";

export enum RecipientType {
  none,
  email,
  uid,
  role,
}

export interface MailLogOverviewStructure {
  uid: string;
  recipients: string;
  noRecipients: number;
  templateName: MailTemplate;
  timestamp: Date;
}

export interface MailLogEntry {
  uid: string;
  recipients: string[];
  noRecipients: number;
  template: {data: {[key: string]: any}; name: MailTemplate};
  timestamp: Date;
}

interface GetCloudFxOverview {
  firebase: Firebase;
}
interface GetCloudFunctionTriggerFile {
  firebase: Firebase;
  cloudFunctionType: CloudFunctionType;
  triggerFileUid: string;
}
interface DeleteMailProtocols {
  firebase: Firebase;
  authUser: AuthUser;
  dayOffset: number;
  mailLog: MailLogEntry[];
}

class CloudFx {
  cloudFunctionType: CloudFunctionType;
  date: Date;
  invokedBy: {
    displayName: UserPublicProfile["displayName"];
    email: User["email"];
    firstName: User["firstName"];
    lastName: User["lastName"];
    uid: User["uid"];
  };

  // ===================================================================== */
  /**
   * Constructor
   */
  constructor() {
    this.cloudFunctionType = CloudFunctionType.none;
    this.date = new Date();
    this.invokedBy = {
      displayName: "",
      email: "",
      firstName: "",
      lastName: "",
      uid: "",
    };
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
    console.log("todo");
    // return await firebase.mailbox
    //   .read({uids: [mailUid]})
    //   .then((result) => {
    //     result.uid = mailUid;
    //     return result as MailProtocol;
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     throw error;
    //   });
  };
  // ===================================================================== */
  /**
   * Mail-Log auslesen
   */
  static getCloudFxOverview = async ({firebase}: GetCloudFxOverview) => {
    const mailOverview: MailLogEntry[] = [];

    await firebase.cloudFunction.log
      .read({uids: []})
      .then((result) => {
        Object.keys(result).forEach((key) => {
          mailOverview.push({uid: key, ...result[key]});
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return mailOverview;
  };
  // ===================================================================== */
  /**
   * Mail-Protokolle löschen
   */
  static deleteMailProtocols = async ({
    firebase,
    authUser,
    dayOffset,
    mailLog,
  }: DeleteMailProtocols) => {
    let counter = 0;
    const offsetDate = new Date();
    offsetDate.setDate(offsetDate.getDate() - dayOffset);
    const offsetTimestamp = offsetDate.getTime();

    const deletedDocuments: Promise<void>[] = [];

    const newMailLog: {[key: string]: any} = {};
    // Dokumente löschen und Maillog gleich anpassen
    mailLog.forEach((logEntry) => {
      if (logEntry.timestamp.getTime() <= offsetTimestamp) {
        // Dokument löschen
        deletedDocuments.push(
          firebase.mailbox
            .delete({uids: [logEntry.uid]})
            .catch((error) => console.error(error))
        );
        counter++;
      } else {
        // den behalten wir
        newMailLog[logEntry.uid] = {
          noRecipients: logEntry.noRecipients,
          recipients: logEntry.recipients,
          template: logEntry.template,
          timestamp: logEntry.timestamp,
        };
      }
    });

    await Promise.all(deletedDocuments);

    // Neue Struktur updaten
    firebase.mailbox.short
      .set({uids: [], value: newMailLog, authUser: authUser})
      .catch((error) => {
        console.error(error);
        throw error;
      });

    mailLog = mailLog.filter(
      (logEntry) => logEntry.timestamp.getTime() >= offsetTimestamp
    );

    return {counter, mailLog};
  };
}

export default CloudFx;
