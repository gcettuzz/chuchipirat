import Firebase from "../firebase.class";

import {ERROR_NOT_IMPLEMENTED_YET} from "../../../constants/text";
import {
  ValueObject,
  PrepareDataForApp,
  PrepareDataForDb,
  FirebaseDbSuper,
} from "./firebase.db.super.class";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
import {collection, collectionGroup, doc} from "firebase/firestore";

export class FirebaseDbEventShort extends FirebaseDbSuper {
  firebase: Firebase;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return collection(this.firebase.firestore, `events`);
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
  getDocument() {
    return doc(
      this.firebase.firestore,
      this.getCollection().path,
      `000_allEvents`
    );
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({value}: PrepareDataForDb<T>) {
    return value;
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
    return STORAGE_OBJECT_PROPERTY.EVENT_SHORT;
  }
}
export default FirebaseDbEventShort;
