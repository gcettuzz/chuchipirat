import Firebase from "../firebase.class";
// import Stats from "../../Shared/stats.class";
import {
  FirebaseSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
// import { AuthUser } from "../firebase.class.temp";
// import { ERROR_PARAMETER_NOT_PASSED } from "../../../constants/text";
// //FIXME: KOMMENTARE LÖSCHEN!

// interface Create {
//   value: Stats;
//   authUser: AuthUser;
// }

export class FirebaseDbStats extends FirebaseSuper {
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
    return this.firebase.db.collection("stats");
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument() {
    return this.firebase.db.doc("stats/counter");
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
      noEvents: value.noEvents,
      noIngredients: value.noIngredients,
      noParticipants: value.noParticipants,
      noRecipes: value.noRecipes,
      noUsers: value.noUsers,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    return {
      noEvents: value.noEvents,
      noIngredients: value.noIngredients,
      noParticipants: value.noParticipants,
      noRecipes: value.noRecipes,
      noShoppingLists: value.noShoppingLists,
      noUsers: value.noUsers,
    } as unknown as T;
  }
  // /* =====================================================================
  // // Create
  // // ===================================================================== */
  // async create({ value, authUser }: Create) {
  //   let stats = this.structureDataForDb(value);
  //   const document = this.getDocument();

  //   // Diese Dokument darf es nur einmal geben, nicht überschreiben falls
  //   // bereits existent
  //   await document.get().then((snapshot) => {
  //     if (!snapshot.exists) {
  //       document.set(stats);
  //     }
  //   });
  //   return stats;
  // }
  // /* =====================================================================
  // // Read
  // // ===================================================================== */
  // async read() {
  //   const document = this.getDocument();

  //   return await document.get().then((snapshot) => {
  //     return this.structureDataFromDb(snapshot.data() as ValueObject) as Stats;
  //   });
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
  // async update({ uid, value, authUser }: Update) {
  //   const document = this.getDocument();

  //   return document.set(value).then(() => {
  //     return value;
  //   });
  // }
  // /* =====================================================================
  // // Delete
  // // ===================================================================== */
  // delete() {}
}
export default FirebaseDbStats;
