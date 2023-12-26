import Firebase from "../firebase.class";
import FirebaseDbUserPublic from "./firebase.db.user.public.class";
// import User from "../../User/user.class";
import {
  FirebaseDbSuper,
  ValueObject,
  // ReadCollection,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
// import { AuthUser } from "../firebase.class.temp";
// import FirebaseUserPublic from "./firebase.user.public.class";
import { ERROR_NOT_IMPLEMENTED_YET } from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
// //FIXME: KOMMENTARE LÖSCHEN!

// interface Update {
//   value: User;
//   authUser: AuthUser;
// }

export class FirebaseDbUser extends FirebaseDbSuper {
  firebase: Firebase;
  public: FirebaseDbUserPublic;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    this.public = new FirebaseDbUserPublic(firebase);
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection("users");
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
    return this.firebase.db.doc(`users/${uids[0]}`);
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
      email: value.email,
      firstName: value.firstName,
      lastLogin: value.lastLogin,
      // lastLogin: this.firebase.timestamp.fromDate(value.lastLogin),
      lastName: value.lastName,
      noLogins: value.noLogins,
      roles: value.roles,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
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
  // /* =====================================================================
  // // Create
  // // ===================================================================== */
  // public async create({ value, authUser }: Create): Promise<ValueObject> {
  //   // Felder auf Firebase anpassen
  //   let user = this.structureDataForDb(value);

  //   const document = this.getDocument(value.uid);

  //   return await document
  //     .set(user)
  //     .then((snapshot) => {
  //       return this.structureDataFromDb({ uid: value.uid, value: user });
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       throw error;
  //     });
  // }
  // /* =====================================================================
  // // Read
  // // ===================================================================== */
  // public async read(uid: string) {
  //   const document = this.getDocument(uid);
  //   return await document
  //     .get()
  //     .then((snapshot) => {
  //       return this.structureDataFromDb({
  //         uid: uid,
  //         value: snapshot.data() as ValueObject,
  //       }) as User;
  //     })
  //     .catch((error) => {
  //       throw error;
  //     });
  // }
  // /* =====================================================================
  // // Read der Collection
  // // ===================================================================== */
  // public async readCollection<T extends ValueObject>({
  //   uid,
  //   orderBy,
  //   where,
  //   limit,
  // }: ReadCollection) {
  //   if (!orderBy || !where || !limit) {
  //     console.error(ERROR_PARAMETER_NOT_PASSED);
  //     throw ERROR_PARAMETER_NOT_PASSED;
  //   }

  //   let result: T[] = [];

  //   const collection = this.getCollection();

  //   return await collection
  //     .orderBy(orderBy.field, orderBy.sortOrder)
  //     .where(where.field, where.operator, where.value)
  //     .limit(limit)
  //     .get()
  //     .then((snapshot) => {
  //       snapshot.forEach((document) => {
  //         let object = this.prepareDataForApp<T>({
  //           uid: document.id,
  //           value: document,
  //         }) as T;
  //         result.push(object);
  //       });
  //       return result;
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       throw error;
  //     });
  // }
  // /* =====================================================================
  // // Update
  // // ===================================================================== */
  // public async update({ value, authUser }: Update): Promise<ValueObject> {
  //   return new Promise((resolve) => resolve(<ValueObject>{}));

  //   // value = FirebaseSuper.setLastChangeFields({
  //   //   value: value,
  //   //   authUser: authUser,
  //   // }) as Event;

  //   // // Felder auf Firebase anpassen
  //   // let event = this.structureDataForDb(value);

  //   // const document = this.getDocument(value.uid);
  //   // await document.set(value).catch((error) => {
  //   //   console.error(error);
  //   //   throw error;
  //   // });
  //   // return value;
  // }
  // /* =====================================================================
  // // Delete
  // // ===================================================================== */
  // public delete(uid: string) {}
}
export default FirebaseDbUser;
