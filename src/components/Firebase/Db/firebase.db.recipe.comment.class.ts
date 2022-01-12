import Firebase from "../firebase.class";

import {
  FirebaseSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";

export class FirebaseDbRecipeComment extends FirebaseSuper {
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
    return this.firebase.db.collection(`recipes/${uids[0]}/comments/`);
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(`recipes/${uids[0]}/comments/${uids[1]}`);
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
  prepareDataForDb<T extends ValueObject>({ value }: PrepareDataForDb<T>) {
    return {
      comment: value.comment,
      createdAt: this.firebase.timestamp.fromDate(value.createdAt),
      userUid: value.userUid,
      displayName: value.displayName,
      pictureSrc: value.picutreSrc,
      motto: value.motto,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    return {
      uid: uid,
      user: {
        userUid: value.userUid,
        displayName: value.displayName,
        pictureSrc: value.pictureSrc,
        motto: value.motto,
      },
      createdAt: value.createdAt.toDate(),
      comment: value.comment,
    } as unknown as T;
  }
}

export default FirebaseDbRecipeComment;
