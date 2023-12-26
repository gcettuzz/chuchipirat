import Firebase from "../firebase.class";
// import UserPublicSearchFields from "../../User/user.public.searchFields.class";

import {
  FirebaseDbSuper,
  ValueObject,
  // ReadCollection,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
// import { AuthUser } from "../firebase.class.temp";
// import { ERROR_PARAMETER_NOT_PASSED } from "../../../constants/text";
// //FIXME: KOMMENTARE LÖSCHEN!

// interface Update {
//   value: UserPublicSearchFields;
//   authUser: AuthUser;
// }

export class FirebaseUserPublicSearchFields extends FirebaseDbSuper {
  firebase: Firebase;
  /* ========tsc=============================================================
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
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(`users/${uids[0]}/public/searchFields`);
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
      uid: value.uid,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    return {
      uid: value.uid,
      email: value.email,
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
  //   let publicSearchFields = this.prepareDataForDb(value);

  //   const document = this.getDocument(value.uid);

  //   return await document
  //     .set(publicSearchFields)
  //     .then(() => {
  //       return this.prepareDataForApp({
  //         uid: value.uid,
  //         value: publicSearchFields,
  //       });
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
  //   console.error("🤪 not implemented!");
  //   throw "🤪 not implemented!";
  //   return await document.get().then((snapshot) => {
  //     return this.prepareDataForApp({
  //       uid: uid,
  //       value: snapshot.data() as ValueObject,
  //     }) as UserPublicSearchFields;
  //   });
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

  //   const collection = this.getCollection(uid);

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
  //   console.error("🤪 not implemented!");
  //   throw "🤪 not implemented!";

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
export default FirebaseUserPublicSearchFields;
