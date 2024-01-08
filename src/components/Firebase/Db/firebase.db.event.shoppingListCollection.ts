import Firebase from "../firebase.class";
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
import {ShoppingListEntry} from "../../Event/ShoppingList/shoppingListCollection.class";
export class FirebaseDbEventShoppingListCollection extends FirebaseDbSuper {
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
    return this.firebase.db.collection("events/docs");
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
    return this.firebase.db.doc(
      `events/${uids[0]}/docs/shoppingListCollection`
    );
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    // Not implemented
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({value}: PrepareDataForDb<T>) {
    let usedProducts: string[] = [];

    Object.values(value.lists as ShoppingListEntry).forEach(
      (list: ShoppingListEntry) =>
        Object.keys(list.trace).forEach((productUid) =>
          usedProducts.push(productUid)
        )
    );

    return {
      lastChange: value.lastChange,
      lists: value.lists,
      noOfLists: value.noOfLists,
      usedProducts: usedProducts,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    if (!value) {
      throw new Error("No Values fetched!");
    }

    return {
      noOfLists: value.noOfLists,
      lastChange: value.lastChange,
      lists: value?.lists ? value.lists : {},
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.USED_RECIPES;
  }
}
export default FirebaseDbEventShoppingListCollection;
