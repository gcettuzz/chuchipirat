// import Ingredient from "./ingredient";
import Utils from "../Shared/utils.class";
import User, { PUBLIC_PROFILE_FIELDS } from "../User/user.class";
import Stats, { STATS_FIELDS } from "../Shared/stats.class";
import Feed, { FEED_TYPE } from "../Shared/feed.class";

import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";
import * as DEFAULT_VALUES from "../../constants/defaultValues";
import { IMAGES_SUFFIX } from "../Firebase/firebase.class";
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
        throw new Error(TEXT.ERROR_POS_WITHOUT_PRODUCT(ingredient.pos));
      }
    });
  }
  /* =====================================================================
  // Daten in Firebase SPEICHERN
  // ===================================================================== */
  static async save({
    firebase,
    recipe,
    authUser,
    triggerCloudfunction = false,
  }) {
    console.log("recipe:", recipe);

    //NEXT_FEATURE: Untescheiden zwischen Rezept und Anpassung für Event
    let newRecipe = false;
    let docRef = null;
    let usedProducts = [];

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

    // Zutaten und Zubereitung nochmals Positionen nummerieren
    recipe.ingredients = Utils.renumberArray({
      array: recipe.ingredients,
      field: "pos",
    });
    recipe.preparationSteps = Utils.renumberArray({
      array: recipe.preparationSteps,
      field: "pos",
    });

    // Genutzte Produkte sammeln (damit diese auch wieder gefunden werden)
    recipe.ingredients.forEach((ingredient) =>
      usedProducts.push(ingredient.product.uid)
    );

    //Zutaten: sicherstellen, dass Nummerische Werte auch so gespeichert werden
    recipe.ingredients.forEach((ingredient) => {
      ingredient.quantity = parseFloat(ingredient.quantity);
      ingredient.scalingFactor = parseFloat(ingredient.scalingFactor);
    });
    recipe.portions = parseInt(recipe.portions);

    // Bild URL kopieren falls nicht auf eigenem Server
    if (
      !recipe.pictureSrc.includes("firebasestorage.googleapis") &&
      !recipe.pictureSrc.includes("chuchipirat") &&
      !recipe.pictureSrc
    ) {
      recipe.pictureSrcFullSize = recipe.pictureSrc;
    }

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
        pictureSrcFullSize: recipe.pictureSrcFullSize,
        createdAt: recipe.createdAt,
        createdFromUid: recipe.createdFromUid,
        createdFromDisplayName: recipe.createdFromDisplayName,
        lastChangeFromUid: authUser.uid,
        lastChangeFromDisplayName: authUser.publicProfile.displayName,
        lastChangeAt: firebase.timestamp.fromDate(new Date()),
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
      .then(() => {
        // Update aller Rezepte
        let allRecipesDocRef = firebase.allRecipes();
        allRecipesDocRef.update({
          [recipe.uid]: {
            name: recipe.name,
            pictureSrc: recipe.pictureSrcFullSize,
            tags: recipe.tags,
          },
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
        objectName: recipe.name,
        objectPictureSrc: recipe.pictureSrc,
      });
    }

    if (triggerCloudfunction && !newRecipe) {
      firebase.createTriggerDocForCloudFunctions({
        docRef: firebase.cloudFunctions_recipe().doc(),
        uid: recipe.uid,
        newValue: recipe.name,
        newValue2: recipe.pictureSrc,
      });
    }

    // sicherstellen, dass mindestens eine Postion in Zutaten und Zubereitungsschritte vorhanden ist
    if (recipe.ingredients.length === 0) {
      recipe.ingredients.push(Recipe.createEmptyIngredient());
    }
    if (recipe.preparationSteps.length === 0) {
      recipe.preparationSteps.push(Recipe.createEmptyPreparationStep());
    }
    return recipe;
  }
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
        // Redimensionierte Varianten holen
        await firebase
          .getPictureVariants({
            folder: firebase.recipe_folder(),
            uid: recipe.uid,
            sizes: [IMAGES_SUFFIX.size300.size, IMAGES_SUFFIX.size1000.size],
            oldDownloadUrl: recipe.pictureSrc,
          })
          .then((fileVariants) => {
            fileVariants.forEach((fileVariant, counter) => {
              if (fileVariant.size === IMAGES_SUFFIX.size300.size) {
                recipe.pictureSrc = fileVariant.downloadURL;
              } else if (fileVariant.size === IMAGES_SUFFIX.size1000.size) {
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
      .then(() => {
        // CloudFunction Triggern
        firebase.createTriggerDocForCloudFunctions({
          docRef: firebase.cloudFunctions_recipe().doc(),
          uid: recipe.uid,
          newValue: recipe.name,
          newValue2: recipe.pictureSrc,
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    // Analytik
    firebase.analytics.logEvent(FIREBASE_EVENTS.UPLOAD_PICTURE, {
      folder: "recipes",
    });

    return {
      pictureSrc: recipe.pictureSrc,
      pictureSrcFullSize: recipe.pictureSrcFullSize,
    };
  }
  /* =====================================================================
  // Bild löschen
  // ===================================================================== */
  static deletePicture = async ({ firebase, recipe, authUser }) => {
    firebase
      .deletePicture({
        folder: firebase.recipe_folder(),
        filename: `${recipe.uid}${IMAGES_SUFFIX.size300.suffix}`,
      })
      .catch((error) => {
        throw error;
      });
    firebase
      .deletePicture({
        folder: firebase.recipe_folder(),
        filename: `${recipe.uid}${IMAGES_SUFFIX.size1000.suffix}`,
      })
      .catch((error) => {
        throw error;
      });

    const recipeDoc = firebase.recipe(recipe.uid);

    // Neuer Wert gleich speichern
    recipeDoc
      .update({
        pictureSrc: "",
        pictureSrcFullSize: "",
        lastChangeFromUid: authUser.uid,
        lastChangeFromDisplayName: authUser.publicProfile.displayName,
        lastChangeAt: firebase.timestamp.fromDate(new Date()),
      })
      .catch((error) => {
        throw error;
      });
    // CloudFunction Triggern
    firebase
      .createTriggerDocForCloudFunctions({
        docRef: firebase.cloudFunctions_recipe().doc(),
        uid: recipe.uid,
        newValue: recipe.name,
        newValue2: "",
      })
      .catch((error) => {
        throw error;
      });
    // Analytik
    firebase.analytics.logEvent(FIREBASE_EVENTS.DELETE_PICTURE, {
      folder: "recipes",
    });
  };
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
  static deleteEntry({
    array,
    fieldValue,
    fieldName,
    emptyObject,
    renumberByField,
  }) {
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
  // Liste aller Rezepte holen
  // ===================================================================== */
  static getRecipes = async ({ firebase }) => {
    let allRecipes;
    const allRecipesDocRef = firebase.allRecipes();

    await allRecipesDocRef
      .get()
      .then((snapshot) => {
        allRecipes = snapshot.data();
      })
      .catch((error) => {
        console.log(error);
        throw error;
      });

    return allRecipes;
  };
  /* =====================================================================
  // Rezepte aus der DB suchen
  // ===================================================================== */
  static async searchRecipes({ firebase, searchString, lastPaginationName }) {
    // let recipes = [];
    // let recipe = {};
    // let snapshot = {};
    // const recipesRef = firebase.recipes();
    // if (!lastPaginationName) {
    //   // Die ersten Einträge holen (ohne Pagination)
    //   snapshot = await recipesRef
    //     .orderBy("name", "asc")
    //     .where("searchString", "array-contains", searchString.toLowerCase())
    //     .limit(DEFAULT_VALUES.RECIPES_SEARCH)
    //     .get()
    //     .catch((error) => {
    //       console.error(error);
    //       throw error;
    //     });
    // } else {
    //   // Die nächsten Einträge holen (mit Pagination)
    //   snapshot = await recipesRef
    //     .orderBy("name", "asc")
    //     .where("searchString", "array-contains", searchString.toLowerCase())
    //     .limit(DEFAULT_VALUES.RECIPES_SEARCH)
    //     .startAfter(lastPaginationName)
    //     .get()
    //     .catch((error) => {
    //       console.error(error);
    //       throw error;
    //     });
    // }
    // snapshot.forEach((obj) => {
    //   recipe = obj.data();
    //   recipe.uid = obj.id;
    //   //   // Timestamp umwandeln
    //   recipe.createdAt = recipe.createdAt.toDate();
    //   recipes.push(recipe);
    // });
    // firebase.analytics.logEvent(FIREBASE_EVENTS.RECIPE_SEARCH, {
    //   searchString: searchString,
    // });
    // return recipes;
  }
  /* =====================================================================
  // Rezept lesen
  // ===================================================================== */
  static getRecipe = async ({ firebase, uid, userUid }) => {
    let recipe = {};

    if (!firebase || !uid || !userUid) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    const recipeRef = firebase.recipe(uid);
    await recipeRef
      .get()
      .then((snapshot) => {
        recipe = snapshot.data();

        if (!recipe) {
          throw Error(TEXT.ERROR_RECIPE_UNKNOWN(uid));
        }

        recipe.uid = uid;
        recipe.createdAt = recipe.createdAt.toDate();

        // sicherstellen, dass mindestens eine Postion in Zutaten und Zubereitungsschritte vorhanden ist
        if (recipe.ingredients.length === 0) {
          recipe.ingredients.push(Recipe.createEmptyIngredient());
        }
        if (recipe.preparationSteps.length === 0) {
          recipe.preparationSteps.push(Recipe.createEmptyPreparationStep());
        }
      })
      .then(async () => {
        // Bewertung holen
        const ratingRef = firebase.recipe_ratings_user(uid, userUid);
        await ratingRef.get().then((snapshot) => {
          if (snapshot && snapshot.exists) {
            recipe.rating.myRating = snapshot.data()["rating"];
          } else {
            recipe.rating.myRating = 0;
          }
        });
      })
      .then(async () => {
        //Kommentare holen
        let comment;
        recipe.comments = [];
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
          recipe.comments.unshift(comment);
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return recipe;
  };
  /* =====================================================================
  // Rezeptdetails lesen
  // ===================================================================== */
  // static getRecipeDetails = async ({ firebase, uid, userUid }) => {
  // let recipeDetails = {};
  // const recipeRef = firebase.recipe_details(uid);
  // await recipeRef
  //   .get()
  //   .then(async (snapshot) => {
  //     recipeDetails = snapshot.data();
  //     // Bewertung holen
  //     const ratingRef = firebase.recipe_ratings_user(uid, userUid);
  //     await ratingRef.get().then((snapshot) => {
  //       if (snapshot && snapshot.exists) {
  //         recipeDetails.rating.myRating = snapshot.data()["rating"];
  //       } else {
  //         recipeDetails.rating.myRating = 0;
  //       }
  //     });
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //     throw error;
  //   });
  // //Kommentare holen
  // let comment;
  // recipeDetails.comments = [];
  // const commentsRef = firebase.recipe_comments(uid);
  // const snapshot = await commentsRef
  //   .orderBy("createdAt", "desc")
  //   .limit(DEFAULT_VALUES.COMMENT_DISPLAY)
  //   .get()
  //   .catch((error) => {
  //     console.error(error);
  //     throw error;
  //   });
  // snapshot.forEach((obj) => {
  //   comment = obj.data();
  //   comment.uid = obj.id;
  //   //   // Timestamp umwandeln
  //   comment.createdAt = comment.createdAt.toDate();
  //   recipeDetails.comments.unshift(comment);
  // });
  // return recipeDetails;
  // };
  /* =====================================================================
  // Mehrere Rezepte aus der DB suchen
  // ===================================================================== */
  static getMultipleRecipes = async ({ firebase, uids = [] }) => {
    let docRefs = [];
    let results = [];
    let recipes = [];

    if (!firebase || !uids || uids.length === 0) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    uids.forEach((uid) => docRefs.push(firebase.recipe(uid).get()));

    results = await Promise.all(docRefs);

    results.forEach((result) => {
      recipes.push({ ...result.data(), uid: result.id });
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
    const recipeDocRef = firebase.recipe(uid);
    recipeDocRef.update({
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

    // Rezept  updaten
    const recipeDetailsDoc = firebase.recipe(uid);

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
    //FIXME: kann das über den Feed gelöst werden?
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
