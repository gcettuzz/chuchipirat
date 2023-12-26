import { ERROR_NOT_IMPLEMENTED_YET } from "../../../constants/text";
import Firebase from "../firebase.class";
// import Stats from "../../Shared/stats.class";
import {
  FirebaseDbSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
  Where,
  OrderBy,
  UpdateSessionStorageFromDbRead,
} from "./firebase.db.super.class";
// import { AuthUser } from "../firebase.class.temp";
import { ERROR_PARAMETER_NOT_PASSED } from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  SessionStorageHandler,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
// import { SessionStorageHandlerStats } from "../../SessionStorage/sessionStorageHandler.stats.class";
// //FIXME: KOMMENTARE LÖSCHEN!

export class FirebaseDbStats extends FirebaseDbSuper {
  firebase: Firebase;
  // sessionStorageHandler: SessionStorageHandlerStats;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    // this.sessionStorageHandler = new SessionStorageHandlerStats();
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection("stats");
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
  getDocument() {
    return this.firebase.db.doc("stats/counter");
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({ value }: PrepareDataForDb<T>) {
    return {
      noEvents: value.noEvents,
      noIngredients: value.noIngredients,
      noMaterials: value.noMaterials,
      noParticipants: value.noParticipants,
      noRecipesPublic: value.noRecipesPublic,
      noRecipesPrivate: value.noRecipesPrivate,
      noRecipesVariants: value.noRecipesVariants,
      noShoppingLists: value.noShoppingLists,
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
      noMaterials: value.noMaterials,
      noParticipants: value.noParticipants,
      noRecipesPublic: value.noRecipesPublic,
      noRecipesPrivate: value.noRecipesPrivate,
      noRecipesVariants: value.noRecipesVariants,
      noShoppingLists: value.noShoppingLists,
      noUsers: value.noUsers,
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.STATS;
  }
}
export default FirebaseDbStats;
