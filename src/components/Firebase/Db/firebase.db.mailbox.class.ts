import Firebase from "../firebase.class";

import {
  FirebaseDbSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
import {ERROR_NOT_IMPLEMENTED_YET} from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
import FirebaseDbMailboxShort from "./firebase.db.mailboxShort.class";
import {collection, collectionGroup, doc} from "firebase/firestore";

export class FirebaseDbMailbox extends FirebaseDbSuper {
  firebase: Firebase;
  short: FirebaseDbMailboxShort;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    this.short = new FirebaseDbMailboxShort(firebase);
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return collection(this.firebase.firestore, `_mailbox`);
  }
  /* =====================================================================
  // Collection-Group holen
  // ===================================================================== */
  getCollectionGroup() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    return collectionGroup(this.firebase.firestore, `none`);
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return doc(this.firebase.firestore, this.getCollection().path, uids[0]);
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    // Not implemented
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({value}: PrepareDataForDb<T>) {
    return {
      to: value.to,
      bcc: value.bcc,
      template: value.template,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    return {
      uid: uid,
      to: value.to,
      bcc: value.bcc,
      template: value.template,
      delivery: value.delivery,
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.MAILBOX;
  }
}
export default FirebaseDbMailbox;
