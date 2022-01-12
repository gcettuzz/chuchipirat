import Firebase from "../firebase.class";
import {
  FirebaseSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
// import { AuthUser } from "../firebase.class.temp";
// import { ERROR_PARAMETER_NOT_PASSED } from "../../../constants/text";
// //FIXME: KOMMENTARE LÖSCHEN!
// interface Update {
//   value: Event;
//   authUser: AuthUser;
// }

export class FirebaseDbEvent extends FirebaseSuper {
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
    return this.firebase.db.collection("events");
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(`events/${uids[0]}`);
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
      authUsers: value.authUsers,
      cooks: value.cooks,
      createdAt: this.firebase.timestamp.fromDate(value.createdAt),
      createdFromDisplayName: value.createdFromDisplayName,
      createdFromUid: value.createdFromUid,
      dates: value.dates,
      lastChangeAt: this.firebase.timestamp.fromDate(value.lastChangeAt),
      lastChangeFromDisplayName: value.lastChangeFromDisplayName,
      lastChangeFromUid: value.lastChangeFromUid,
      location: value.location,
      maxDate: this.firebase.timestamp.fromDate(value.maxDate),
      motto: value.motto,
      name: value.name,
      participants: parseInt(value.participants),
      numberOfDays: value.numberOfDays,
      pictureSrc: value.pictureSrc,
      pictureSrcFullSize: value.pictureSrcFullSize,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    return {
      uid: uid,
      name: value.name,
      motto: value.motto,
      location: value.location,
      participants: value.participants,
      cooks: value.cooks,
      numberOfDays: value.numberOfDays,
      dates: value.dates.map((dateSlice: ValueObject) => {
        return {
          uid: dateSlice.uid,
          pos: dateSlice,
          from: dateSlice.from.toDate(),
          to: dateSlice.to.toDate(),
        };
      }),
      maxDate: value.maxDate.toDate(),
      pictureSrc: value.pictureSrc,
      pictureSrcFullSize: value.pictureSrcFullSize,
      authUsers: value.authUsers,
      createdAt: value.createdAt.toDate(),
      createdFromDisplayName: value.createdFromDisplayName,
      createdFromUid: value.createdFromUid,
      lastChangeAt: value.lastChangeAt.toDate(),
      lastChangeFromDisplayName: value.lastChangeFromDisplayName,
      lastChangeFromUid: value.lastChangeFromUid,
    } as unknown as T;
  }

  // /* =====================================================================
  // // Create
  // // ===================================================================== */
  // public async create({ value, authUser }: Create): Promise<ValueObject> {
  //   value = FirebaseSuper.setCreatedFields({
  //     value: value,
  //     authUser: authUser,
  //   });
  //   // Felder auf Firebase anpassen
  //   let event = this.structureDataForDb(value);

  //   const collection = this.getCollection();

  //   return await collection
  //     .add(event)
  //     .then((docRef) => {
  //       value.uid = docRef.id;
  //       return value;
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
  //   let event = <Event>{};

  //   return await document.get().then((snapshot) => {
  //     return this.structureDataFromDb(snapshot.data() as ValueObject) as Event;
  //   });
  //   // return event;
  // }
  // /* =====================================================================
  // // Read der Collection
  // // ===================================================================== */
  // public async readCollection<T extends ValueObject>({
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
  //   value = FirebaseSuper.setLastChangeFields({
  //     value: value,
  //     authUser: authUser,
  //   }) as Event;

  //   // Felder auf Firebase anpassen
  //   let event = this.structureDataForDb(value);

  //   const document = this.getDocument(value.uid);
  //   await document.set(value).catch((error) => {
  //     console.error(error);
  //     throw error;
  //   });
  //   return value;
  // }
  // /* =====================================================================
  // // Delete
  // // ===================================================================== */
  // public delete(uid: string) {}
}
export default FirebaseDbEvent;
