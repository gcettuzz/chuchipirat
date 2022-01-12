import Firebase from "../firebase.class";

import {
  FirebaseSuper,
  ValueObject,
  // ReadCollection,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
// import { AuthUser } from "../firebase.class.temp";
// import { ERROR_PARAMETER_NOT_PASSED } from "../../../constants/text";

// //FIXME: KOMMENTARE LÖSCHEN!

// interface Update {
//   value: UserPublicProfile;
//   authUser: AuthUser;
// }

export class FirebaseDbUserPublicProfile extends FirebaseSuper {
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
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(`users/${uids[0]}/public/profile`);
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
      displayName: value.displayName,
      memberSince: this.firebase.timestamp.fromDate(value.memberSince),
      memberId: value.memberId,
      motto: value.motto,
      noComments: value.noComments,
      noEvents: value.noEvents,
      noRecipes: value.noRecipes,
      pictureSrc: value.pictureSrc,
      pictureSrcFullSize: value.PictureSrcFullSize,
    };
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
    return {
      uid: uid,
      displayName: value.displayName,
      memberSince: value.memberSince.toDate(),
      motto: value.motto,
      pictureSrc: value.pictureSrc,
      pictureSrcFullSize: value.pictureSrcFullSize,
      noComments: value.noComments,
      noEvents: value.noEvents,
      noRecipes: value.noRecipes,
    } as unknown as T;
  }

  // /* =====================================================================
  // // Create
  // // ===================================================================== */
  // public async create({ value, authUser }: Create): Promise<ValueObject> {
  //   // Felder auf Firebase anpassen
  //   let publicProfile = this.structureDataForDb(value);

  //   const document = this.getDocument(value.uid);

  //   return await document
  //     .set(publicProfile)
  //     .then(() => {
  //       return this.structureDataFromDb({
  //         uid: value.uid,
  //         value: publicProfile,
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

  //   return await document.get().then((snapshot) => {
  //     return this.structureDataFromDb({
  //       uid: uid,
  //       value: snapshot.data() as ValueObject,
  //     }) as UserPublicProfile;
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
  /* =====================================================================
  // Delete
  // ===================================================================== */
  // public delete(uid: string) {}
}
export default FirebaseDbUserPublicProfile;
