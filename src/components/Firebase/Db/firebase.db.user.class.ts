import Firebase from "../firebase.class";
import FirebaseDbUserPublic from "./firebase.db.user.public.class";
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
import FirebaseDbUserShort from "./firebase.db.userShort.class";
import {collection, collectionGroup, doc} from "firebase/firestore";

export class FirebaseDbUser extends FirebaseDbSuper {
  firebase: Firebase;
  public: FirebaseDbUserPublic;
  short: FirebaseDbUserShort;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    this.public = new FirebaseDbUserPublic(firebase);
    this.short = new FirebaseDbUserShort(firebase);
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return collection(this.firebase.firestore, `users`);
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
    const dbUser = {
      email: value.email.toLocaleLowerCase(),
      firstName: value.firstName,
      lastLogin: value.lastLogin,
      lastName: value.lastName,
      noLogins: value.noLogins,
      roles: value.roles,
    };

    if (Object.prototype.hasOwnProperty.call(value, "disabled")) {
      dbUser["disabled"] = value.disabled;
    }

    return dbUser;
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    return {
      uid: uid,
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      lastLogin: value.lastLogin,
      // lastLogin: value.lastLogin.toDate(),
      noLogins: value.noLogins,
      roles: value.roles,
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.NONE;
  }
}
export default FirebaseDbUser;
