import Firebase from "../firebase.class";
import {
  FirebaseDbSuper,
  PrepareDataForApp,
  PrepareDataForDb,
  ValueObject,
} from "./firebase.db.super.class";

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
import {collection, collectionGroup, doc} from "firebase/firestore";

export class FirebaseDbRequest extends FirebaseDbSuper {
  firebase: Firebase;
  active: FirebaseDbRequestActive;
  closed: FirebaseDbRequestClosed;
  numberStorage: FirebaseDbRequestNumberStorage;

  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    this.active = new FirebaseDbRequestActive(firebase);
    this.closed = new FirebaseDbRequestClosed(firebase);
    this.numberStorage = new FirebaseDbRequestNumberStorage(firebase);
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return collection(this.firebase.firestore, `requests`);
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
    throw Error(ERROR_WRONG_DB_CLASS);
    // Not implemented
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({value}: PrepareDataForDb<T>) {
    return value as T;
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({value}: PrepareDataForApp) {
    return value as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.NONE;
  }
}
export default FirebaseDbRequest;
