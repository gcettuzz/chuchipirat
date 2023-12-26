import Firebase from "../firebase.class";
import {
  FirebaseDbSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
import { ERROR_NOT_IMPLEMENTED_YET } from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
export class FirebaseDummy extends FirebaseDbSuper {
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
    //FIXME:
    return this.firebase.db.collection("XYZ");
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
    //FIXME:
    return this.firebase.db.doc(`XYU/${uids[0]}`);
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
  prepareDataForDb<T extends ValueObject>({ value }: PrepareDataForDb<T>) {
    return {};
    //   authUsers: value.authUsers,
    //   cooks: value.cooks,
    //   createdAt: this.firebase.timestamp.fromDate(value.createdAt),
    //   createdFromDisplayName: value.createdFromDisplayName,
    //   createdFromUid: value.createdFromUid,
    //   dates: value.dates,
    //   lastChangeAt: this.firebase.timestamp.fromDate(value.lastChangeAt),
    //   lastChangeFromDisplayName: value.lastChangeFromDisplayName,
    //   lastChangeFromUid: value.lastChangeFromUid,
    //   location: value.location,
    //   maxDate: this.firebase.timestamp.fromDate(value.maxDate),
    //   motto: value.motto,
    //   name: value.name,
    //   participants: parseInt(value.participants),
    //   numberOfDays: value.numberOfDays,
    //   pictureSrc: value.pictureSrc,
    //   pictureSrcFullSize: value.pictureSrcFullSize,
    // };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    return { key: "dummy" } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.NONE;
  }
}
export default FirebaseDummy;
