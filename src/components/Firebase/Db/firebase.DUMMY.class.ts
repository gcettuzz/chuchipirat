import Firebase from "../firebase.class";
import {
  FirebaseSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";

export class FirebaseDummy extends FirebaseSuper {
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
}
export default FirebaseDummy;
