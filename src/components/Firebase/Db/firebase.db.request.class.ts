import Firebase from "../firebase.class";
import {FirebaseDbSuper, ValueObject} from "./firebase.db.super.class";

import {
  ERROR_WRONG_DB_CLASS,
  ERROR_NOT_IMPLEMENTED_YET,
} from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
import FirebaseDbRequestActive from "./firebase.db.request.active.class";
import FirebaseDbRequestNumberStorage from "./firebase.db.request.numberStorage.class";
import FirebaseDbRequestClosed from "./firebase.db.request.closed.class";
import FirebaseDbRequestLog from "./firebase.db.request.log.class";

export class FirebaseDbRequest extends FirebaseDbSuper {
  firebase: Firebase;
  active: FirebaseDbRequestActive;
  closed: FirebaseDbRequestClosed;
  log: FirebaseDbRequestLog;
  numberStorage: FirebaseDbRequestNumberStorage;

  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    this.active = new FirebaseDbRequestActive(firebase);
    this.closed = new FirebaseDbRequestClosed(firebase);
    this.log = new FirebaseDbRequestLog(firebase);
    this.numberStorage = new FirebaseDbRequestNumberStorage(firebase);
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    throw Error(ERROR_WRONG_DB_CLASS);
    return this.firebase.db.collection("_requests");
  }
  /* =====================================================================
  // Collection-Group holen
  // ===================================================================== */
  getCollectionGroup() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    return this.firebase.db.collectionGroup("none");
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    throw Error(ERROR_WRONG_DB_CLASS);
    return this.firebase.db.doc(`_requests/${uids[0]}`);
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    throw Error(ERROR_WRONG_DB_CLASS);
    // Not implemented
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb() {
    return {};
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>() {
    return {} as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.NONE;
  }
}
export default FirebaseDbRequest;
