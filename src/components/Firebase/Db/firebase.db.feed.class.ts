import Firebase from "../firebase.class";
// import Feed from "../../Shared/feed.class";
import {
  FirebaseSuper,
  ValueObject,
  // ReadCollection,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
// import { AuthUser } from "../firebase.class.temp";
// import { ERROR_PARAMETER_NOT_PASSED } from "../../../constants/text";

// import { Timestamp } from "@firebase/firestore-types";

// //FIXME: KOMMENTARE LÖSCHEN!
// interface Update {
//   value: Feed;
//   authUser: AuthUser;
// }

export class FirebaseDbFeed extends FirebaseSuper {
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
    return this.firebase.db.collection("feeds");
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(`feeds/${uids[0]}`);
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
      createdAt: this.firebase.timestamp.fromDate(value.createdAt as Date),
      createdFromUid: value.createdFromUid,
      createdFromDisplayName: value.createdFromDisplayName,
      userUid: value.userUid,
      displayName: value.displayName,
      pictureSrc: value.pictureSrc,
      title: value.title,
      text: value.text,
      feedType: value.feedType,
      objectUid: value.objectUid,
      objectName: value.objectName,
      objectPictureSrc: value.objectPictureSrc,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    return {
      uid: uid,
      createdAt: value.createdAt?.toDate(),
      createdFromUid: value.createdFromUid,
      createdFromDisplayName: value.createdFromDisplayName,
      userUid: value.userUid,
      displayName: value.displayName,
      pictureSrc: value.pictureSrc,
      title: value.pictureSrc,
      text: value.text,
      feedType: value.feedType,
      objectUid: value.objectUid,
      objectName: value.objectName,
      objectPictureSrc: value.objectPictureSrc,
    } as unknown as T;
  }
  /* =====================================================================
  // Create
  // ===================================================================== */
  // public async create<T extends ValueObject>({ value, authUser }: Create) {
  // //TODO: Kann der Create Befehl zentralisiert werden?

  // value = FirebaseSuper.setCreatedFields({
  //   value: value,
  //   authUser: authUser,
  // });

  // // Felder auf Firebase anpassen
  // let feed = this.structureDataForDb(value);

  // const collection = this.getCollection();

  // return await collection
  //   .add(feed)
  //   .then((docRef) => {
  //     return this.structureDataFromDb({ uid: docRef.id, value: feed });
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //     throw error;
  //   });
  // }
  /* =====================================================================
  // Read
  // ===================================================================== */
  // public async read(uid: string) {
  //   // const document = this.getDocument(uid);
  //   let event = <Event>{};

  //   // return await document.get().then((snapshot) => {
  //   //   return this.structureDataFromDb(snapshot.data() as ValueObject) as Event;
  //   // });

  //   return event;
  // }
  // /* =====================================================================
  // // Read der Collection
  // // ===================================================================== */
  // public async readCollection<T extends ValueObject>({
  //   uid,
  //   orderBy,
  //   limit,
  //   where,
  // }: ReadCollection) {
  //   let result: T[] = [];

  //   const collection = this.getCollection();
  //   //TODO: in Super.class verschieben!

  //   let queryObject = collection.orderBy(orderBy.field, orderBy.sortOrder);
  //   if (where) {
  //     queryObject = queryObject.where(where.field, where.operator, where.value);
  //   }
  //   queryObject = queryObject.limit(limit);

  //   return await queryObject
  //     .get()
  //     .then((snapshot) => {
  //       snapshot.forEach((document) => {
  //         let object = this.prepareDataForApp<T>({
  //           uid: document.id,
  //           value: document.data(),
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
  /* =====================================================================
  // Update
  // ===================================================================== */
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
export default FirebaseDbFeed;
