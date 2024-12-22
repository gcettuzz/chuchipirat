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
import FirebaseDbFeedLog from "./firebase.db.feed.log.class";
import {collection, collectionGroup, doc} from "firebase/firestore";

export class FirebaseDbFeed extends FirebaseDbSuper {
  firebase: Firebase;
  log: FirebaseDbFeedLog;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    this.log = new FirebaseDbFeedLog(firebase);
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return collection(this.firebase.firestore, `feeds`);
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
      title: value.title,
      text: value.text,
      type: value.type,
      visibility: value.visibility,
      sourceObject: value.sourceObject,
      user: value.user,
      created: value.created,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    return {
      uid: uid,
      title: value.title,
      text: value.text,
      type: value.type,
      visibility: value.visibility,
      sourceObject: value.sourceObject,
      user: value.user,
      created: value.created,
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.FEED;
  }
}
export default FirebaseDbFeed;
