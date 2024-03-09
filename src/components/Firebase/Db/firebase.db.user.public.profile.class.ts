import {ERROR_NOT_IMPLEMENTED_YET} from "../../../constants/text";
import Firebase from "../firebase.class";

import {
  FirebaseDbSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";

export class FirebaseDbUserPublicProfile extends FirebaseDbSuper {
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
    return this.firebase.db.collection(`users/${uids[0]}/public`);
  }
  /* =====================================================================
  // Collection-Group holen
  // ===================================================================== */
  getCollectionGroup() {
    return this.firebase.db.collectionGroup("public");
  }
  /*
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(`users/${uids[0]}/public/profile`);
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
    return {
      displayName: value.displayName,
      memberSince: value.memberSince,
      // memberSince: this.firebase.timestamp.fromDate(value.memberSince),
      memberId: value.memberId ? value.memberId : 0,
      motto: value.motto ? value.motto : "",
      pictureSrc: value.pictureSrc ? value.pictureSrc : "",
      stats: {
        noComments: value.stats.noComments ? value.stats.noComments : 0,
        noEvents: value.stats.noEvents ? value.stats.noEvents : 0,
        noRecipesPublic: value.stats.noRecipesPublic
          ? value.stats.noRecipesPublic
          : 0,
        noRecipesPrivate: value.stats.noRecipesPrivate
          ? value.stats.noRecipesPrivate
          : 0,
        noFoundBugs: value.stats.noFoundBugs ? value.stats.noFoundBugs : 0,
      },
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    return {
      uid: uid,
      displayName: value.displayName,
      memberSince: value.memberSince,
      memberId: value.memberId,
      motto: value.motto,
      pictureSrc: value.pictureSrc,
      stats: {
        noComments: value.stats?.noComments,
        noEvents: value.stats?.noEvents,
        noRecipesPublic: value.stats?.noRecipesPublic,
        noRecipesPrivate: value.stats?.noRecipesPrivate,
        noFoundBugs: value.stats?.noFoundBugs,
      },
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.PROFILE_PUBLIC;
  }
}
export default FirebaseDbUserPublicProfile;
