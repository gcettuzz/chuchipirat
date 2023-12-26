import Firebase from "../firebase.class";
// import Feed from "../../Shared/feed.class";
import {
  FirebaseDbSuper,
  ValueObject,
  // ReadCollection,
  PrepareDataForDb,
  PrepareDataForApp,
  Where,
  OrderBy,
  UpdateSessionStorageFromDbRead,
} from "./firebase.db.super.class";
// import { AuthUser } from "../firebase.class.temp";
import { ERROR_NOT_IMPLEMENTED_YET } from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  SessionStorageHandler,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";

// import { Timestamp } from "@firebase/firestore-types";

// //FIXME: KOMMENTARE LÖSCHEN!
// interface Update {
//   value: Feed;
//   authUser: AuthUser;
// }

export class FirebaseDbFeed extends FirebaseDbSuper {
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
    return this.firebase.db.collection("feeds");
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
    return this.firebase.db.doc(`feeds/${uids[0]}`);
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
    return {
      title: value.title,
      text: value.text,
      type: value.type,
      visibility: value.visibility,
      sourceObject: value.sourceObject,
      user: value.user,
      created: value.created,
      // created: {
      //   date: this.firebase.timestamp.fromDate(value.created.date),
      //   fromUid: value.created.fromUid,
      //   fromDisplayName: value.created.fromDisplayName,
      // },
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    return {
      uid: uid,
      title: value.title,
      text: value.text,
      type: value.type,
      visibility: value.visibility,
      sourceObject: value.sourceObject,
      user: value.user,
      created: value.created,
      // created: {
      //   date: value.created.date.toDate(),
      //   fromUid: value.created.fromUid,
      //   fromDisplayName: value.created.fromDisplayName,
      // },
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.FEED;
  }
  // /* =====================================================================
  // // Session Storage updaten
  // // ===================================================================== */
  // updateSessionStorageFromDbRead({
  //   value,
  //   documentUid,
  // }: UpdateSessionStorageFromDbRead): void {
  //   SessionStorageHandler.upsertDocument({
  //     storageObjectProperty: STORAGE_OBJECT_PROPERTY.FEED,
  //     documentUid: documentUid,
  //     value,
  //   });
  // }
  // updateSessionStorageFromDbReadCollection(value: ValueObject[]): void {
  //   console.log("⚠️ FIX ME");
  //   return;
  // }
  // /* =====================================================================
  // // Dokument(e) aus dem Session Storage holen
  // // ===================================================================== */
  // readSessionStorageValue<T extends ValueObject>(uids: string[]): T | null {
  //   return null;
  //   // this.sessionStorageHandler.readDocument<T>(uids);
  // }
  // readSessionStorageValues<T extends ValueObject>(
  //   uids: string[] | undefined,
  //   where: Where[],
  //   orderBy: OrderBy
  // ): T | null {
  //   console.log("⚠️ FIX ME");
  //   return null;
  // }
}
export default FirebaseDbFeed;
