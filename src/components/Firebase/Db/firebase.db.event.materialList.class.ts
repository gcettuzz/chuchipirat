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
import {MaterialListEntry} from "../../Event/MaterialList/materialList.class";

export class FirebaseDbEventMaterialList extends FirebaseDbSuper {
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
    return this.firebase.db.doc(`events/${uids[0]}/docs/materialList`);
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
    const usedMaterials: string[] = [];

    Object.values(value.lists as MaterialListEntry).forEach(
      (list: MaterialListEntry) => {
        list.items.forEach((material) => {
          if (!usedMaterials.includes(material.uid)) {
            usedMaterials.push(material.uid);
          }
        });
      }
    );

    return {
      noOfLists: value.noOfLists,
      lastChange: value.lastChange,
      lists: value.lists ? value.lists : {},
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
export default FirebaseDbEventMaterialList;
