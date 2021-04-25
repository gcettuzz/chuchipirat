// import Ingredient from "./ingredient";
import Utils from "../Shared/utils.class";
import User, { PUBLIC_PROFILE_FIELDS } from "../User/user.class";
import Stats, { STATS_FIELDS } from "../Shared/stats.class";
import Feed, { FEED_TYPE } from "../Shared/feed.class";

import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";
import * as DEFAULT_VALUES from "../../constants/defaultValues";
import * as TEXT from "../../constants/text";

export default class Recipe {
  /* =====================================================================
  // Kostruktor
  // ===================================================================== */
  constructor() {
    this.uid = "";
    this.name = "";
    this.portions = "";
    this.source = "";
    this.preparationTime = "";
    this.restTime = "";
    this.cookTime = "";
    this.pictureSrc = "";
    this.pictureSrcFullSize = "";
    this.createdFromUid = "";
    this.createdFromDisplayName = "";
    this.createdAt = new Date();
    this.note = "";
    this.tags = [];

    let ingredient = Recipe.createEmptyIngredient();
    ingredient.pos = 1;

    // this.ingredientList = [
    this.ingredients = [
      ingredient,
      // {
      //   uid: Utils.generateUid(5),
      //   // recipeId: "",
      //   pos: 1,
      //   product: { uid: "", name: "" },
      //   quantity: "",
      //   unit: "",
      //   detail: "",
      //   scalingFactor: 1,
      // },
    ];
    let preparationStep = Recipe.createEmptyPreparationStep();
    preparationStep.pos = 1;
    this.preparationSteps = [
      preparationStep,
      // {
      //   uid: Utils.generateUid(5),
      //   pos: 1,
      //   step: "",
      // },
    ];
    this.rating = {
      avgRating: 0,
      noRatings: 0,
      myRating: 0,
    };
    // this.stats = new RecipeStats();
    this.comments = [];
  }
  /* =====================================================================
  // Tag löschen
  // ===================================================================== */
  static deleteTag({ tags, tagToDelete }) {
    return tags.filter((tag) => tag !== tagToDelete);
  }
  /* =====================================================================
  // Tag hinzufügen
  // ===================================================================== */
  static addTag({ tags, tagToAdd }) {
    // Alle Leerzeichen löschen und in Kleinbuchstaben umwandeln.
    let newTagLabel = tagToAdd.replace(/\s/g, "");
    tags = tags.concat([newTagLabel.toLowerCase()]);
    return tags;
  }
  /* =====================================================================
  // Daten prüfen
  // ===================================================================== */
  static checkRecipeData(recipe) {
    if (!recipe.name) {
      throw new Error(TEXT.RECIPE_NAME_CANT_BE_EMPTY);
    }

    if (!recipe.portions) {
      throw new Error(TEXT.ERROR_GIVE_FIELD_VALUE("Portionen"));
    }

    recipe.ingredients.forEach((ingredient) => {
      if (
        !ingredient.product.uid &&
        (ingredient.quantity || ingredient.unit || ingredient.product.name)
      ) {
        throw new Error(
          TEXT.ERROR_PRODUCT_WIHTOUT_UID(ingredient.product.name)
        );
      }
    });
  }
  /* =====================================================================
  // Daten in Firebase SPEICHERN
  // ===================================================================== */
  static async save({ firebase, recipe, authUser }) {
    //NEXT_FEATURE: Untescheiden zwischen Rezept und Anpassung für Event
    let newRecipe = false;
    let docRef = null;
    let usedProducts = [];

    let searchString = Utils.createSearchStringArray(recipe.name);

    // Falls leere Einträge vorhanden, diese entfernen
    recipe.ingredients = recipe.ingredients.filter((ingredient) => {
      if (
        !ingredient.quantity &&
        !ingredient.unit &&
        !ingredient.product.name
      ) {
        return false;
      }
      return true;
    });

    recipe.preparationSteps = recipe.preparationSteps.filter(
      (preparationStep) => preparationStep.step
    );

    // Nochmals prüfen ob alles ok.
    try {
      Recipe.checkRecipeData(recipe);
    } catch (error) {
      throw error;
    }
    // Genutzte Produkte sammeln (damit diese auch wieder gefunden werden)
    recipe.ingredients.forEach((ingredient) =>
      usedProducts.push(ingredient.product.uid)
    );

    //Ingredients: sicherstellen, dass Nummerische Werte auch so gespeichert werden
    recipe.ingredients.forEach((ingredient) => {
      ingredient.quantity = parseFloat(ingredient.quantity);
      ingredient.scalingFactor = parseFloat(ingredient.scalingFactor);
    });
    recipe.portions = parseInt(recipe.portions);

    if (!recipe.uid) {
      docRef = firebase.recipes().doc();
      recipe.uid = docRef.id;
      recipe.createdAt = firebase.timestamp.fromDate(new Date());
      recipe.createdFromUid = authUser.uid;
      recipe.createdFromDisplayName = authUser.publicProfile.displayName;
      newRecipe = true;
    } else {
      docRef = firebase.recipe(recipe.uid);
    }

    await docRef
      .set({
        name: recipe.name,
        pictureSrc: recipe.pictureSrc,
        pictureSrcFullSize: recipe.pictureSrcFullSize
          ? recipe.pictureSrcFullSize
          : recipe.pictureSrc,
        createdAt: recipe.createdAt,
        createdFromUid: recipe.createdFromUid,
        createdFromDisplayName: recipe.createdFromDisplayName,
        lastChangeFromUid: authUser.uid,
        lastChangeFromDisplayName: authUser.publicProfile.displayName,
        lastChangeAt: firebase.timestamp.fromDate(new Date()),
        searchString: searchString,
      })
      .then(() => {
        // Details zu Rezept erstellen
        const newSubRef = firebase.recipe_details(recipe.uid);
        newSubRef
          .set({
            usedProducts: usedProducts,
            portions: recipe.portions,
            source: recipe.source,
            preparationTime: recipe.preparationTime,
            restTime: recipe.restTime,
            cookTime: recipe.cookTime,
            tags: recipe.tags,
            note: recipe.note,
            ingredients: recipe.ingredients,
            preparationSteps: recipe.preparationSteps,
            rating: {
              avgRating: recipe.rating.avgRating,
              noRatings: recipe.rating.noRatings,
            },
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });
      })

      .catch((error) => {
        console.error(error);
        throw error;
      });

    if (newRecipe) {
      // Event auslösen
      firebase.analytics.logEvent(FIREBASE_EVENTS.RECIPE_CREATED);
      Stats.incrementStat({ firebase: firebase, field: STATS_FIELDS.RECIPES });

      // Dem User Credits geben
      User.incrementPublicProfileField(
        firebase,
        authUser.uid,
        PUBLIC_PROFILE_FIELDS.NO_RECIPES,
        1
      );

      // Feed Eintrag
      Feed.createFeedEntry({
        firebase: firebase,
        authUser: authUser,
        feedType: FEED_TYPE.RECIPE_CREATED,
        objectUid: recipe.uid,
        text: recipe.name,
      });
    }

    return recipe;
  }
  /* =====================================================================
  // Statistik hochzählen
  // ===================================================================== */
  // static addOneRecipeToStats(firebase) {
  //   // Stats
  //   return firebase.stats_recipe().set({
  //     // noRecipes: firebase.serverValue.increment(1),
  //     noRecipes: firebase.fieldValue.increment(1),
  //   });
  // }
  /* =====================================================================
  // Bild in Firebase Storage hochladen
  // ===================================================================== */
  static async uploadPicture({ firebase, file, recipe, authUser }) {
    let downloadURL;

    const recipeDoc = firebase.recipe(recipe.uid);

    downloadURL = await firebase
      .uploadPicture({
        file: file,
        filename: recipe.uid,
        folder: firebase.recipe_folder(),
      })
      .then(async () => {
        await firebase.waitUntilFileDeleted({
          folder: firebase.recipe_folder(),
          uid: recipe.uid,
          originalFile: file,
        });
      })
      .then(async (downloadURL) => {
        recipe.pictureSrc = downloadURL;
      })
      .then(async () => {
        // Redimensionierte Varianten holen
        await firebase
          .getPictureVariants({
            folder: firebase.recipe_folder(),
            uid: recipe.uid,
            sizes: [300, 1000],
          })
          .then((fileVariants) => {
            fileVariants.forEach((fileVariant, counter) => {
              if (fileVariant.size === 300) {
                recipe.pictureSrc = fileVariant.downloadURL;
              } else if (fileVariant.size === 1000) {
                recipe.pictureSrcFullSize = fileVariant.downloadURL;
              }
            });
          });
      })
      .then(() => {
        // Neuer Wert gleich speichern
        recipeDoc.update({
          pictureSrc: recipe.pictureSrc,
          pictureSrcFullSize: recipe.pictureSrcFullSize,
          lastChangeFromUid: authUser.uid,
          lastChangeFromDisplayName: authUser.publicProfile.displayName,
          lastChangeAt: firebase.timestamp.fromDate(new Date()),
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    // Analytik
    firebase.analytics.logEvent(FIREBASE_EVENTS.UPLOAD_PICTRE, {
      folder: "recipes",
    });

    return recipe.pictureSrc;
  }
  /* =====================================================================
  // Rating zu Rezept setzen 
  // ===================================================================== */
  // static setRating = async (firebase, uid, rating, authUser, isNew) => {
  //   // Globales Rating setzen
  //   const docRef = firebase.recipe(uid);

  //   // firebase;

  // };
  /* =====================================================================
  // Leeres Objket Zutat erzeugen
  // ===================================================================== */
  static createEmptyIngredient() {
    return {
      uid: Utils.generateUid(5),
      // recipeId: "",
      pos: 0,
      product: { uid: "", name: "" },
      quantity: "",
      unit: "",
      detail: "",
      scalingFactor: 1,
    };
  }
  /* =====================================================================
  // Leeren Zubereitungsschritt erzeugen
  // ===================================================================== */
  static createEmptyPreparationStep() {
    return {
      uid: Utils.generateUid(5),
      pos: 0,
      step: "",
    };
  }
  /* =====================================================================
  // Eintrag in Array hinzufügen
  // ===================================================================== */
  static addEmptyEntry({ array, pos, emptyObject, renumberByField }) {
    array = Utils.insertArrayElementAtPosition(array, pos - 1, emptyObject);
    array = Utils.renumberArray({ array: array, field: renumberByField });
    return array;
  }
  /* =====================================================================
  // Eintrag in Array löschen
  // ===================================================================== */
  static deleteEntry(
    array,
    fieldValue,
    fieldName,
    emptyObject,
    renumberByField
  ) {
    array = array.filter((entry) => entry[fieldName] !== fieldValue);

    if (array.length === 0) {
      array.push(emptyObject);
    }
    array = Utils.renumberArray({ array: array, field: renumberByField });
    return array;
  }
  /* =====================================================================
  // Eintrag in Liste runter schieben
  // ===================================================================== */
  static moveArrayEntryDown({ array, posToMoveDown, renumberByField }) {
    array = Utils.moveArrayElementDown({
      array: array,
      indexToMoveDown: posToMoveDown - 1,
    });
    array = Utils.renumberArray({ array: array, field: renumberByField });
    return array;
  }
  /* =====================================================================
  // Eintrag in Liste hoch schieben
  // ===================================================================== */
  static moveArrayEntryUp({ array, posToMoveUp, renumberByField }) {
    array = Utils.moveArrayElementUp({
      array: array,
      indexToMoveUp: posToMoveUp - 1,
    });
    array = Utils.renumberArray({ array: array, field: renumberByField });
    return array;
  }

  /* =====================================================================
  // Rezepte aus der DB suchen
  // ===================================================================== */
  static async searchRecipes({ firebase, searchString, lastPaginationName }) {
    let recipes = [];
    let recipe = {};
    let snapshot = {};

    const recipesRef = firebase.recipes();

    if (!lastPaginationName) {
      // Die ersten Einträge holen (ohne Pagination)
      snapshot = await recipesRef
        .orderBy("name", "asc")
        .where("searchString", "array-contains", searchString.toLowerCase())
        .limit(DEFAULT_VALUES.RECIPES_SEARCH)
        .get()
        .catch((error) => {
          console.error(error);
          throw error;
        });
    } else {
      // Die nächsten Einträge holen (mit Pagination)
      snapshot = await recipesRef
        .orderBy("name", "asc")
        .where("searchString", "array-contains", searchString.toLowerCase())
        .limit(DEFAULT_VALUES.RECIPES_SEARCH)
        .startAfter(lastPaginationName)
        .get()
        .catch((error) => {
          console.error(error);
          throw error;
        });
    }
    snapshot.forEach((obj) => {
      recipe = obj.data();
      recipe.uid = obj.id;
      //   // Timestamp umwandeln
      recipe.createdAt = recipe.createdAt.toDate();
      recipes.push(recipe);
    });

    firebase.analytics.logEvent(FIREBASE_EVENTS.RECIPE_SEARCH, {
      searchString: searchString,
    });

    return recipes;
  }
  /* =====================================================================
  // Rezeptkopf lesen
  // ===================================================================== */
  static getRecipeHead = async (firebase, uid) => {
    let recipeHead = {};

    const recipeRef = firebase.recipe(uid);
    await recipeRef
      .get()
      .then((snapshot) => {
        recipeHead = snapshot.data();
        recipeHead.uid = snapshot.id;
        recipeHead.createdAt = recipeHead.createdAt.toDate();
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return recipeHead;
  };
  /* =====================================================================
  // Rezeptdetails lesen
  // ===================================================================== */
  static getRecipeDetails = async ({ firebase, uid, userUid }) => {
    let recipeDetails = {};
    const recipeRef = firebase.recipe_details(uid);

    await recipeRef
      .get()
      .then(async (snapshot) => {
        recipeDetails = snapshot.data();
        // Bewertung holen
        const ratingRef = firebase.recipe_ratings_user(uid, userUid);

        await ratingRef.get().then((snapshot) => {
          if (snapshot && snapshot.exists) {
            recipeDetails.rating.myRating = snapshot.data()["rating"];
          } else {
            recipeDetails.rating.myRating = 0;
          }
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    //Kommentare holen
    let comment;
    recipeDetails.comments = [];
    const commentsRef = firebase.recipe_comments(uid);

    const snapshot = await commentsRef
      .orderBy("createdAt", "desc")
      .limit(DEFAULT_VALUES.COMMENT_DISPLAY)
      .get()
      .catch((error) => {
        console.error(error);
        throw error;
      });

    snapshot.forEach((obj) => {
      comment = obj.data();
      comment.uid = obj.id;
      //   // Timestamp umwandeln
      comment.createdAt = comment.createdAt.toDate();
      recipeDetails.comments.unshift(comment);
    });

    return recipeDetails;
  };
  /* =====================================================================
  // Mehrere Rezept-Details aus der DB suchen
  // ===================================================================== */
  static getMultipleRecipeDetails = async ({ firebase, uids = [] }) => {
    let docRefs = [];
    let results = [];
    let recipes = [];

    if (!firebase || !uids || uids.length === 0) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    uids.forEach((uid) => docRefs.push(firebase.recipe_details(uid).get()));

    results = await Promise.all(docRefs);

    results.forEach((result) => {
      recipes.push({ ...result.data(), uid: result.ref.parent.parent.id });
    });

    return recipes;
  };

  /* =====================================================================
  // Rating updaten
  // ===================================================================== */
  static updateRating = (firebase, uid, rating, newRating, userUid) => {
    // Neues Rating
    const userRatingDocRef = firebase.recipe_ratings_user(uid, userUid);
    userRatingDocRef.set({ rating: newRating });

    // Durchschnitt neu rechnen
    if (rating.myRating !== 0 && newRating === 0) {
      // gelöschtes Rating
      rating.avgRating =
        Math.round(
          ((rating.avgRating * rating.noRatings - rating.myRating) /
            (rating.noRatings - 1)) *
            10
        ) / 10;
      rating.noRatings = rating.noRatings - 1;
    } else if (rating.myRating > 0) {
      // geändertes Rating
      rating.avgRating =
        Math.round(
          ((rating.avgRating * rating.noRatings - rating.myRating + newRating) /
            rating.noRatings) *
            10
        ) / 10;
    } else {
      // neues Rating
      rating.avgRating =
        Math.round(
          ((rating.avgRating * rating.noRatings + newRating) /
            (rating.noRatings + 1)) *
            10
        ) / 10;
      rating.noRatings = rating.noRatings + 1;
    }

    rating.myRating = newRating;

    // Rezept Details updaten
    const recipeDetailsDoc = firebase.recipe_details(uid);
    recipeDetailsDoc.update({
      rating: {
        avgRating: rating.avgRating,
        noRatings: rating.noRatings,
      },
    });

    firebase.analytics.logEvent(FIREBASE_EVENTS.RECIPE_RATING_SET, {
      recipe: uid,
      rating: newRating,
    });

    return rating;
  };
  /* =====================================================================
  // Kommentar speichern
  // ===================================================================== */
  static saveComment = async (firebase, uid, newComment, user) => {
    // Kommentar speichern
    const commentDoc = firebase.recipe_comments(uid).doc();

    const comment = {
      userUid: user.uid,
      displayName: user.publicProfile.displayName,
      pictureSrc: user.publicProfile.pictureSrc,
      createdAt: firebase.timestamp.fromDate(new Date()),
      comment: newComment,
    };

    await commentDoc.set(comment).catch((error) => {
      console.error(error);
      throw error;
    });

    comment.uid = commentDoc.id;

    // Rezept Details updaten
    const recipeDetailsDoc = firebase.recipe_details(uid);

    recipeDetailsDoc
      .update({
        noComments: firebase.fieldValue.increment(1),
      })
      .then(() => {
        // Dem User Credits geben
        User.incrementPublicProfileField(
          firebase,
          user.uid,
          PUBLIC_PROFILE_FIELDS.NO_COMMENTS,
          1
        );
      })

      .catch((error) => {
        console.error(error);
        throw error;
      });

    // Bitzeli Analytics
    firebase.analytics.logEvent(FIREBASE_EVENTS.RECIPE_COMMENT_CREATED, {
      recipe: uid,
    });

    // Timestamp umwandeln
    comment.createdAt = new Date();

    return comment;
  };
  /* =====================================================================
  // Kommentare holen (Pagination)
  // ===================================================================== */
  static getPreviousComments = async (firebase, uid, lastComment) => {
    const commentsRef = firebase.recipe_comments(uid);
    let comment;
    let newComments = [];

    const snapshot = await commentsRef
      .orderBy("createdAt", "desc")
      .startAfter(lastComment.createdAt)
      .limit(DEFAULT_VALUES.COMMENT_DISPLAY)
      .get();

    snapshot.forEach((obj) => {
      comment = obj.data();
      comment.uid = obj.id;
      //   // Timestamp umwandeln
      comment.createdAt = comment.createdAt.toDate();
      newComments.unshift(comment);
    });

    firebase.analytics.logEvent(FIREBASE_EVENTS.RECIPE_COMMENTS_SHOW_PREVIOUS, {
      recipe: uid,
    });

    return newComments;
  };
  /* =====================================================================
  // Rezept skalieren
  // ===================================================================== */
  static scale = ({ recipe, portionsToScale }) => {
    recipe.scaledIngredients = [];

    recipe.ingredients.forEach((ingredient) => {
      let scaledIngredient = { ...ingredient };

      if (
        !scaledIngredient.scalingFactor ||
        scaledIngredient.scalingFactor > 1
      ) {
        scaledIngredient.scalingFactor = 1;
      }

      if (ingredient.quantity) {
        scaledIngredient.quantity =
          (ingredient.quantity / recipe.portions) *
          ingredient.scalingFactor *
          portionsToScale;
      }

      recipe.scaledIngredients.push(scaledIngredient);
    });

    return recipe.scaledIngredients;
  };
  /* =====================================================================
  // Neuste X Rezepte holen
  // ===================================================================== */
  static getNewestRecipes = async (
    firebase,
    limitTo = DEFAULT_VALUES.RECIPE_DISPLAY
  ) => {
    let recipes = [];
    let recipe = {};

    const recipesRef = firebase.recipes();

    const snapshot = await recipesRef
      .orderBy("createdAt", "desc")
      .limit(limitTo)
      .get()
      .catch((error) => {
        console.error(error);
        throw error;
      });

    snapshot.forEach((obj) => {
      recipe = obj.data();
      recipe.uid = obj.id;
      // Timestamp umwandeln
      recipe.createdAt = recipe.createdAt.toDate();
      recipes.push(recipe);
    });

    return recipes;
  };
}
