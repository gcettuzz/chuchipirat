import Firebase from "../firebase.class";
import {
  FirebaseSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";

export class FirebaseDbCloudfunctionWaitingareaRecipetrace extends FirebaseSuper {
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
    return this.firebase.db.collection(
      "_cloudFunctions/waitingArea/recipeTrace/"
    );
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(
      `_cloudFunctions/waitingArea/recipeTrace/${uids[0]}`
    );
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
      // createdAt: this.firebase.timestamp.fromDate(value.createdAt as Date),
      // createdFromUid: value.createdFromUid,
      // createdFromDisplayName: value.createdFromDisplayName,
      // userUid: value.userUid,
      // displayName: value.displayName,
      // pictureSrc: value.pictureSrc,
      // title: value.title,
      // text: value.text,
      // feedType: value.feedType,
      // objectUid: value.objectUid,
      // objectName: value.objectName,
      // objectPictureSrc: value.objectPictureSrc,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    return {
      // uid: uid,
      // createdAt: value.createdAt?.toDate(),
      // createdFromUid: value.createdFromUid,
      // createdFromDisplayName: value.createdFromDisplayName,
      // userUid: value.userUid,
      // displayName: value.displayName,
      // pictureSrc: value.pictureSrc,
      // title: value.pictureSrc,
      // text: value.text,
      // feedType: value.feedType,
      // objectUid: value.objectUid,
      // objectName: value.objectName,
      // objectPictureSrc: value.objectPictureSrc,
    } as unknown as T;
  }
}
export default FirebaseDbCloudfunctionWaitingareaRecipetrace;
