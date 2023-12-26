import Firebase from "../firebase.class";

import {
  ERROR_NOT_IMPLEMENTED_YET,
  ERROR_WRONG_DB_CLASS,
} from "../../../constants/text";
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
  getCollection(uids: string[]) {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    return this.firebase.db.collection("events");
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
    return this.firebase.db.doc(`events/000_allEvents`);
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
    let eventShort = {
      [value.uid]: {
        name: value.name,
        motto: value.motto,
        location: value.location,
        noOfCooks: value.noOfCooks,
        numberOfDays: value.numberOfDays,
        startDate: value.startDate,
        created: value.created,
      },
    };

    return eventShort;
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
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
