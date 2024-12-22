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
import {collection, collectionGroup, doc, Timestamp} from "firebase/firestore";

export class FirebaseDbRecipeComment extends FirebaseDbSuper {
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
    return collection(
      this.firebase.firestore,
      `recipes/public/recipes/${uids[0]}/comments`
    );
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
    return doc(this.firebase.firestore, this.getCollection(uids).path, uids[1]);
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    throw "🤪 not implemented";
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({value}: PrepareDataForDb<T>) {
    return {
      comment: value.comment,
      createdAt: Timestamp.fromDate(value.createdAt),
      userUid: value.userUid,
      displayName: value.displayName,
      pictureSrc: value.picutreSrc,
      motto: value.motto,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    return {
      uid: uid,
      user: {
        userUid: value.userUid,
        displayName: value.displayName,
        pictureSrc: value.pictureSrc,
        motto: value.motto,
      },
      createdAt: value.createdAt,
      // createdAt: value.createdAt.toDate(),
      comment: value.comment,
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.NONE;
  }
}

export default FirebaseDbRecipeComment;
