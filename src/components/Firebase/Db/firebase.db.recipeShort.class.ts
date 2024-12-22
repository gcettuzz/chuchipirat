/* eslint-disable @typescript-eslint/no-unused-vars */
import Firebase from "../firebase.class";

import {
  ERROR_WRONG_DB_CLASS,
  ERROR_NOT_IMPLEMENTED_YET,
} from "../../../constants/text";

import {
  FirebaseDbSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
import {RecipeType} from "../../Recipe/recipe.class";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
import {collection, collectionGroup, doc} from "firebase/firestore";

export class FirebaseDbRecipeShort extends FirebaseDbSuper {
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
    return collection(this.firebase.firestore, `recipes`);
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
    throw Error(ERROR_WRONG_DB_CLASS);
    return doc(
      this.firebase.firestore,
      this.getCollection(uids).path,
      `000_allRecipes`
    );
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
    const recipeShort = {
      [value.uid]: {
        name: value.name,
        source: value.source,
        pictureSrc: value.pictureSrc,
        tags: value.tags ? value.tags : [],
        linkedRecipes: value.linkedRecipes ? value.linkedRecipes : [],
        dietProperties: value.dietProperties,
        outdoorKitchenSuitable: value.outdoorKitchenSuitable,
        menuTypes: value.menuTypes,
        created: value.created,
        rating: value.rating,
        variantName: value?.variantName ? value.variantName : "",
      },
    };

    if (value.type !== RecipeType.variant) {
      delete recipeShort[value.uid].variantName;
    }

    return recipeShort;
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    // Die Aufsplittung von Objekt zu Array geschieht in der recipeshort.class
    // Object.keys(value).forEach((recipeUid) => {
    //   let created = value[recipeUid].created;
    //   created.date instanceof Date
    //     ? (created.date = created.date)
    //     : (created.date = created.date.toDate());
    // });
    return value as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.NONE;
  }
}
export default FirebaseDbRecipeShort;
