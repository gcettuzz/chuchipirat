import Firebase from "../firebase.class";
import {
  FirebaseDbSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";

import {
  ERROR_WRONG_DB_CLASS,
  ERROR_NOT_IMPLEMENTED_YET,
} from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
export class FirebaseDbConfigurationSystemMessage extends FirebaseDbSuper {
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
    return this.firebase.db.collection("_configuration");
  }
  /* =====================================================================
  // Collection-Group holen
  // ===================================================================== */
  getCollectionGroup() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    return this.firebase.db.collectionGroup("");
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument() {
    return this.firebase.db.doc(`_configuration/systemMessage`);
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
    return STORAGE_OBJECT_PROPERTY.SYSTEM_MESSAGE;
  }
}
export default FirebaseDbConfigurationSystemMessage;
