import Firebase from "../firebase.class";
import FirebaseDbRecipe from "./firebase.db.recipe.class";

import { RecipeType } from "../../Recipe/recipe.class";

import FirebaseDbRecipeRating from "./firebase.db.recipe.rating.class";
import FirebaseDbRecipeComment from "./firebase.db.recipe.comment.class";
import {
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
import { ERROR_NOT_IMPLEMENTED_YET } from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";

export class FirebaseDbRecipePrivate extends FirebaseDbRecipe {
  firebase: Firebase;
  comment: FirebaseDbRecipeComment;
  rating: FirebaseDbRecipeRating;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super(firebase);
    this.firebase = firebase;
    this.comment = new FirebaseDbRecipeComment(firebase);
    this.rating = new FirebaseDbRecipeRating(firebase);
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection(uids: string[]) {
    return this.firebase.db.collection(`recipes/000_userRecipes/${uids[0]}`);
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
    if (uids.length !== 0) {
      return this.firebase.db.doc(
        `recipes/000_userRecipes/${uids[0]}/${uids[1]}`
      );
    } else {
      return this.firebase.db.doc(`recipes/000_userRecipes`);
    }
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
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    // Die Aufsplittung von Objekt zu Array geschieht in der recipeshort.class
    value = super.prepareDataForApp({ uid: uid, value: value });
    // Schlüssel setzen, dass privat
    value.type = RecipeType.private;
    return value as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.RECIPE;
  }
}
export default FirebaseDbRecipePrivate;
