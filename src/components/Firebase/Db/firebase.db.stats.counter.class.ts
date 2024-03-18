import {ERROR_NOT_IMPLEMENTED_YET} from "../../../constants/text";
import Firebase from "../firebase.class";
// import Stats from "../../Shared/stats.class";
import {
  FirebaseDbSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";

export class FirebaseDbStatsCounter extends FirebaseDbSuper {
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
  prepareDataForDb<T extends ValueObject>({value}: PrepareDataForDb<T>) {
    return {
      noEvents: value.noEvents,
      noIngredients: value.noIngredients,
      noMaterials: value.noMaterials,
      noParticipants: value.noParticipants,
      noRecipesPublic: value.noRecipesPublic,
      noRecipesPrivate: value.noRecipesPrivate,
      noRecipeVariants: value.noRecipeVariants,
      noShoppingLists: value.noShoppingLists,
      noMaterialLists: value.noMaterialLists,
      noUsers: value.noUsers,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({value}: PrepareDataForApp) {
    return {
      noEvents: value.noEvents,
      noIngredients: value.noIngredients,
      noMaterials: value.noMaterials,
      noParticipants: value.noParticipants,
      noRecipesPublic: value.noRecipesPublic,
      noRecipesPrivate: value.noRecipesPrivate,
      noRecipeVariants: value.noRecipeVariants,
      noShoppingLists: value.noShoppingLists,
      noMaterialLists: value.noMaterialLists,
      noUsers: value.noUsers,
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.STATS_COUNTER;
  }
}
export default FirebaseDbStatsCounter;
