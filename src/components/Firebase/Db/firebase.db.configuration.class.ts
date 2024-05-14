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
import {FirebaseDbConfigurationGlobalSettings} from "./firebase.db.configuration.globalSettings.class";
import FirebaseDbConfigurationVersion from "./firebase.db.configuration.version.class";
import FirebaseDbConfigurationSystemMessage from "./firebase.db.configuration.systemMessage.class";
export class FirebaseDbConfiguration extends FirebaseDbSuper {
  firebase: Firebase;
  globalSettings: FirebaseDbConfigurationGlobalSettings;
  version: FirebaseDbConfigurationVersion;
  systemMessage: FirebaseDbConfigurationSystemMessage;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    this.globalSettings = new FirebaseDbConfigurationGlobalSettings(firebase);
    this.version = new FirebaseDbConfigurationVersion(firebase);
    this.systemMessage = new FirebaseDbConfigurationSystemMessage(firebase);
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
    throw Error(ERROR_WRONG_DB_CLASS);
    return this.firebase.db.doc(``);
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
    throw Error(ERROR_WRONG_DB_CLASS);

    return {} as T;
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    throw Error(ERROR_WRONG_DB_CLASS);
    return {} as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.CONFIGURATION;
  }
}
export default FirebaseDbConfiguration;
