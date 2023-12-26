import Firebase from "../firebase.class";
import {
  FirebaseDbSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
  Where,
  OrderBy,
} from "./firebase.db.super.class";
// import { AuthUser } from "../firebase.class.temp";
import {ERROR_NOT_IMPLEMENTED_YET} from "../../../constants/text";
import FirebaseDbEventGroupConfiguration from "./firebase.db.event.groupConfig.class";
import FirebaseDbEventMenuplan from "./firebase.db.event.menuplan.class";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
import FirebaseDbEventUsedRecipes from "./firebase.db.event.usedRecipes.class";
import FirebaseDbEventShoppingList from "./firebase.db.event.shoppingList";
import FirebaseDbEventShoppingListCollection from "./firebase.db.event.shoppingListCollection";
// //FIXME: KOMMENTARE LÖSCHEN!
// interface Update {
//   value: Event;
//   authUser: AuthUser;
// }

export class FirebaseDbEvent extends FirebaseDbSuper {
  firebase: Firebase;
  groupConfiguration: FirebaseDbEventGroupConfiguration;
  menuplan: FirebaseDbEventMenuplan;
  usedRecipes: FirebaseDbEventUsedRecipes;
  shoppingList: FirebaseDbEventShoppingList;
  shoppingListCollection: FirebaseDbEventShoppingListCollection;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    this.groupConfiguration = new FirebaseDbEventGroupConfiguration(firebase);
    this.menuplan = new FirebaseDbEventMenuplan(firebase);
    this.usedRecipes = new FirebaseDbEventUsedRecipes(firebase);
    this.shoppingList = new FirebaseDbEventShoppingList(firebase);
    this.shoppingListCollection = new FirebaseDbEventShoppingListCollection(
      firebase
    );
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection("events");
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
  prepareDataForDb<T extends ValueObject>({value}: PrepareDataForDb<T>) {
    return {
      authUsers: value.authUsers,
      cooks: value.cooks,
      dates: value.dates,
      // dates: value.dates.map((dateSlice: ValueObject) => {
      //   return {
      //     uid: dateSlice.uid,
      //     pos: dateSlice.pos,
      //     from:
      //       dateSlice.from instanceof Date
      //         ? this.firebase.timestamp.fromDate(dateSlice.from)
      //         : dateSlice.from,
      //     to:
      //       dateSlice.to instanceof Date
      //         ? this.firebase.timestamp.fromDate(dateSlice.to)
      //         : dateSlice.to,
      //   };
      // }),
      location: value.location,
      // maxDate: this.firebase.timestamp.fromDate(value.maxDate),
      maxDate: value.maxDate,
      motto: value.motto,
      name: value.name,
      numberOfDays: value.numberOfDays,
      pictureSrc: value.pictureSrc,
      created: value.created,
      lastChange: value.lastChange,
      // created: {
      //   date: this.firebase.timestamp.fromDate(value.created.date),
      //   fromUid: value.created.fromUid,
      //   fromDisplayName: value.created.fromDisplayName,
      // },
      // lastChange: {
      //   date: this.firebase.timestamp.fromDate(value.lastChange.date),
      //   fromUid: value.lastChange.fromUid,
      //   fromDisplayName: value.lastChange.fromDisplayName,
      // },
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    return {
      uid: uid,
      name: value.name,
      motto: value.motto,
      location: value.location,
      cooks: value.cooks,
      numberOfDays: value.numberOfDays,
      dates: value.dates,
      // dates: value.dates.map((dateSlice: ValueObject) => {
      //   return {
      //     uid: dateSlice.uid,
      //     pos: dateSlice.pos,
      //     from:
      //       dateSlice.from instanceof Date
      //         ? dateSlice.from
      //         : dateSlice.from.toDate(),
      //     to:
      //       dateSlice.to instanceof Date ? dateSlice.to : dateSlice.to.toDate(),
      //   };
      // }),
      maxDate: value.maxDate,
      // maxDate:
      //   value.maxDate instanceof Date ? value.maxDate : value.maxDate.toDate(),
      pictureSrc: value.pictureSrc,
      authUsers: value.authUsers,
      created: value.created,
      lastChange: value.lastChange,
      // created: {
      //   date:
      //     value.created.date instanceof Date
      //       ? value.created.date
      //       : value.created.date.toDate(),
      //   fromUid: value.created.fromUid,
      //   fromDisplayName: value.created.fromDisplayName,
      // },
      // lastChange: {
      //   date:
      //     value.lastChange.date instanceof Date
      //       ? value.lastChange.date
      //       : value.lastChange.date.toDate(),
      //   fromUid: value.lastChange.fromUid,
      //   fromDisplayName: value.lastChange.fromDisplayName,
      // },
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.EVENT;
  }
}
export default FirebaseDbEvent;
