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
import {ItemType} from "../../Event/ShoppingList/shoppingList.class";
import {collection, collectionGroup, doc} from "firebase/firestore";

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
  getCollection(uids: string[]) {
    return collection(this.firebase.firestore, `events/${uids[0]}/docs`);
  }
  /* =====================================================================
  // Collection-Group holen
  // ===================================================================== */
  getCollectionGroup() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    return collectionGroup(this.firebase.firestore, `none`);
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return doc(
      this.firebase.firestore,
      this.getCollection(uids).path,
      `shoppingListCollection`
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
    const usedProducts: string[] = [];
    const usedMaterials: string[] = [];

    Object.values(value.lists as ShoppingListEntry).forEach(
      (list: ShoppingListEntry) =>
        Object.entries(list.trace).forEach(([key, value]) => {
          if (value[0].itemType == ItemType.food) {
            usedProducts.push(key);
          } else if (value[0].itemType == ItemType.material) {
            usedMaterials.push(key);
          }
        })
    );

    return {
      lastChange: value.lastChange,
      lists: value.lists,
      noOfLists: value.noOfLists,
      usedProducts: usedProducts,
      usedMaterials: usedMaterials,
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({value}: PrepareDataForApp) {
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
