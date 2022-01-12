import Firebase from "../firebase.class";
import Recipe from "../../Recipe/recipe.class";

import { AuthUser } from "../Authentication/authUser.class";
import {
  FirebaseSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
import FirebaseDbRecipeRating from "./firebase.db.recipe.rating.class";
import FirebaseDbRecipeComment from "./firebase.db.recipe.comment.class";

export class FirebaseDbRecipe extends FirebaseSuper {
  firebase: Firebase;
  comment: FirebaseDbRecipeComment;
  rating: FirebaseDbRecipeRating;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    this.comment = new FirebaseDbRecipeComment(firebase);
    this.rating = new FirebaseDbRecipeRating(firebase);
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection("recipes");
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(`recipes/${uids[0]}`);
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    // Not implemented
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getAllRecipeDocument() {
    return this.firebase.db.doc(`recipes/000_allRecipes`);
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({ value }: PrepareDataForDb<T>) {
    return {
      ingredients: value.ingredients,
      name: value.name,
      note: value.note,
      picture: {
        smallSize: value.smallSize,
        normalSize: value.normalSize,
        fullSize: value.fullSize,
      },
      portions: value.portions,
      prepartaionSteps: value.preparationSteps,
      rating: value.rating,
      source: value.source,
      tags: value.tags,
      times: {
        preparation: value.times.preparation,
        rest: value.times.rest,
        cooking: value.times.cooking,
      },
      usedProducts: value.usedProducts,
      created: {
        date: this.firebase.timestamp.fromDate(value.created.date),
        fromUid: value.created.fromUid,
        fromDisplayName: value.created.fromDisplayName,
      },
      lastChange: {
        date: this.firebase.timestamp.fromDate(value.lastChange.date),
        fromUid: value.lastChange.fromUid,
        fromDisplayName: value.lastChange.fromDisplayName,
      },
    };
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    return {
      uid: uid,
      name: value.name,
      portions: value.portions,
      source: value.source,
      picture: {
        smallSize: value.smallSize,
        normalSize: value.normalSize,
        fullSize: value.fullSize,
      },
      note: value.note,
      tags: value.tags,
      private: value.private,
      linkedRecipes: value.linkedRecipes,
      ingredients: value.ingredients,
      preparationSteps: value.preparationSteps,
      rating: value.rating,
      times: {
        preparation: value.times.preparation,
        rest: value.times.rest,
        cooking: value.times.cooking,
      },
      usedProducts: value.usedProducts,
      created: {
        date: value.created.date.toDate(),
        fromUid: value.created.fromUid,
        fromDisplayName: value.created.fromDisplayName,
      },
      lastChange: {
        date: value.lastChange.date.toDate(),
        fromUid: value.lastChange.fromUid,
        fromDisplayName: value.lastChange.fromDisplayName,
      },
    } as unknown as T;
  }
}
export default FirebaseDbRecipe;
