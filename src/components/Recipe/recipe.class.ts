// // import Ingredient from "./ingredient";
import Utils from "../Shared/utils.class";

import Firebase from "../Firebase/firebase.class";
import { AuthUser } from "../Firebase/Authentication/authUser.class";

import UserPublicProfile, {
  UserPublicProfileFields,
} from "../User/user.public.profile.class";
import Stats, { StatsField } from "../Shared/stats.class";
import Feed, { FeedType } from "../Shared/feed.class";

import FirebaseAnalyticEvent from "../../constants/firebaseEvent";
import {
  File,
  IMAGES_SUFFIX,
} from "../Firebase/Storage/firebase.storage.super.class";
import * as TEXT from "../../constants/text";
import RecipeShort from "./recipeShort.class";
import RecipeRating from "./recipe.rating.class";
import RecipeComment from "./recipe.comment.class";
import {
  ChangeRecord,
  Picture as PictureSrc,
} from "../Shared/global.interface";

export interface Ingredient {
  uid: string;
  pos: number;
  product: IngredientProduct;
  quantity: number;
  unit: string;
  detail: string;
  scalingFactor: number;
}

interface IngredientProduct {
  uid: string;
  name: string;
}

export interface PreparationStep {
  uid: string;
  pos: number;
  step: string;
}
/**
 * Rating
 * @param avgRating - Durchschnittliche Bewertung
 * @param noRating - Anzahl abgegebene Bewertungen
 * @param myRaing - Meine Bewertung --> Bezieht sich auf die Klasse RecipeRating
 */
interface Rating {
  avgRating: number;
  noRatings: number;
  myRating: number;
}
interface DeleteTag {
  tags: string[];
  tagToDelete: string;
}
interface AddTag {
  tags: string[];
  tagsToAdd: string;
}
interface AddLinkedRecipe {
  linkedRecipes: RecipeShort[];
  recipeToLink: RecipeShort;
}
interface RemoveLinkedRecipe {
  linkedRecipes: RecipeShort[];
  recipeToRemoveUid: string;
}
/**
 * Speichern
 * @param firebase - Objekt zur DB
 * @param recipe - zu speicherndes Rezept
 * @param authUser - Authentifzierungsobjekt zu User
 * @param triggerCloudfunction - mit FALSE kann unterbunden werden, dass die
 * Cloudfunction(s) ausgeführt werden
 */
interface Save {
  firebase: Firebase;
  recipe: Recipe;
  authUser: AuthUser;
  triggerCloudfunction: boolean;
}
interface UploadPicture {
  firebase: Firebase;
  file: File;
  recipe: Recipe;
  authUser: AuthUser;
}
interface DeletePicture {
  firebase: Firebase;
  recipe: Recipe;
  authUser: AuthUser;
}
interface AddEmptyEntry {
  array: object[];
  pos: number;
  emptyObject: Object;
  renumberByField: string;
}
interface DeleteEntry {
  array: { [key: string]: any }[];
  fieldValue: string | number | boolean;
  fieldName: string;
  emptyObject: Object;
  renumberByField: string;
}
interface moveArrayEntryDown {
  array: Object[];
  posToMoveDown: number;
  renumberByField: string;
}
interface moveArrayEntryUp {
  array: Object[];
  posToMoveUp: number;
  renumberByField: string;
}
interface GetRecipe {
  firebase: Firebase;
  uid: string;
  userUid: string;
}
interface UpdateRating {
  firebase: Firebase;
  recipe: Recipe;
  newRating: number;
  authUser: AuthUser;
}
interface SaveComment {
  firebase: Firebase;
  uid: string;
  newComment: string;
  authUser: AuthUser;
}
interface Scale {
  recipe: Recipe;
  portionsToScale: number;
}

/**
 * Rezept-Klasse
 */
export default class Recipe {
  uid: string;
  name: string;
  portions: number;
  source: string;
  times: {
    preparation: number;
    rest: number;
    cooking: number;
  };
  pictureSrc: PictureSrc;
  note: string;
  tags: string[];
  private: boolean;
  linkedRecipes: RecipeShort[];
  ingredients: Ingredient[];
  preparationSteps: PreparationStep[];
  rating: Rating;
  usedProducts: string[];
  created: ChangeRecord;
  lastChange: ChangeRecord;

  /* =====================================================================
  // Kostruktor
  // ===================================================================== */
  constructor() {
    this.uid = "";
    this.name = "";
    this.portions = 0;
    this.source = "";
    this.times = {
      preparation: 0,
      rest: 0,
      cooking: 0,
    };
    this.pictureSrc = {
      smallSize: "",
      normalSize: "",
      fullSize: "",
    };
    this.note = "";
    this.tags = [];
    this.private = false;
    this.linkedRecipes = [];
    this.ingredients = [];
    this.preparationSteps = [];
    this.usedProducts = [];
    this.created = { date: new Date(0), fromUid: "", fromDisplayName: "" };
    this.lastChange = { date: new Date(0), fromUid: "", fromDisplayName: "" };

    let ingredient = Recipe.createEmptyIngredient();
    ingredient.pos = 1;

    this.ingredients.push(ingredient);

    let preparationStep = Recipe.createEmptyPreparationStep();
    preparationStep.pos = 1;
    this.preparationSteps.push(preparationStep);

    this.rating = {
      avgRating: 0,
      noRatings: 0,
      myRating: 0,
    };
  }
  /* =====================================================================
  // Tag löschen
  // ===================================================================== */
  static deleteTag({ tags, tagToDelete }: DeleteTag) {
    return tags.filter((tag) => tag !== tagToDelete);
  }
  /* =====================================================================
  // Tag hinzufügen
  // ===================================================================== */
  static addTag({ tags, tagsToAdd }: AddTag) {
    if (!tagsToAdd) {
      return tags;
    }

    // Wenn der Input Leerzeichen hat in mehrere Tags spliten
    let newTags = tagsToAdd.split(" ");

    newTags.forEach((newTag) => {
      // Nur neue Tags hinzufügen
      if (tags.find((tag) => tag === newTag.toLowerCase()) === undefined) {
        tags.push(newTag.toLowerCase());
      }
    });
    return tags;
  }
  /* =====================================================================
  // Verlinktes Rezept hinzufügen
  // ===================================================================== */
  static addLinkedRecipe({ linkedRecipes, recipeToLink }: AddLinkedRecipe) {
    linkedRecipes.push(recipeToLink);

    return Utils.sortArray({
      array: linkedRecipes,
      attributeName: "name",
    });
  }
  /* =====================================================================
  // Verlinktes Rezept entfernen
  // ===================================================================== */
  static removeLinkedRecipe({
    linkedRecipes,
    recipeToRemoveUid,
  }: RemoveLinkedRecipe) {
    return linkedRecipes.filter((recipe) => recipe.uid !== recipeToRemoveUid);
  }
  /* =====================================================================
  // Daten prüfen
  // ===================================================================== */
  static checkRecipeData(recipe: Recipe) {
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
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static async save({ firebase, recipe, authUser }: Save) {
    let newRecipe = false;
    let recipeNameBeforeSave: string = "";
    let pictureSrcBeforeSave: string = "";

    recipe = Recipe.prepareSave(recipe);

    if (!recipe.uid) {
      newRecipe = true;
      await firebase.recipe
        .create<Recipe>({
          value: recipe,
          authUser: authUser,
        })
        .then((result) => {
          recipe = result as Recipe;
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    } else {
      // Alte Werte holen bevor gespeichert wird; dadurch wird entschieden ob später die
      // Cloudfunction die Änderungen überall updaten muss
      await firebase.recipe
        .read<Recipe>({ uids: [recipe.uid] })
        .then((result) => {
          recipeNameBeforeSave = result.name;
          pictureSrcBeforeSave = result.pictureSrc.normalSize;
        });
      //Speichern
      await firebase.recipe
        .update<Recipe>({
          uids: [recipe.uid],
          value: recipe,
          authUser: authUser,
        })
        .then((result) => {
          recipe = result as Recipe;
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    }

    // Alle-Rezepte-File Update
    firebase.recipeShort
      .update<RecipeShort>({
        uids: [""], // wird in der Klasse bestimmt,
        value: RecipeShort.createShortRecipeFromRecipe(recipe),
        authUser: authUser,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    if (newRecipe) {
      // Event auslösen
      firebase.analytics.logEvent(FirebaseAnalyticEvent.recipeCreated);
      Stats.incrementStat({
        firebase: firebase,
        field: StatsField.noRecipes,
        value: 1,
      });

      // Dem User Credits geben
      UserPublicProfile.incrementField({
        firebase: firebase,
        uid: authUser.uid,
        field: UserPublicProfileFields.noRecipes,
        step: 1,
      });

      if (!recipe.private) {
        // Feed Eintrag
        Feed.createFeedEntry({
          firebase: firebase,
          authUser: authUser,
          feedType: FeedType.recipeCreated,
          objectUid: recipe.uid,
          objectName: recipe.name,
          objectPictureSrc: recipe.pictureSrc.normalSize,
          textElements: [recipe.name],
        });
      }
    }

    // Cloudfunctnion ausführen, falls Name und/oder Bildquelle geändert wurde
    if (
      !newRecipe &&
      (recipe.name !== recipeNameBeforeSave ||
        recipe.pictureSrc.normalSize !== pictureSrcBeforeSave)
    ) {
      firebase.cloudFunction.recipeUpdate.triggerCloudFunction({
        values: {
          uid: recipe.uid,
          newName: recipe.name,
          newPictureSrc: recipe.pictureSrc.normalSize,
        },
        authUser: authUser,
      });
    }
    firebase.analytics.logEvent(FirebaseAnalyticEvent.cloudFunctionExecuted);

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
  // Speichern vorbereiten
  // ===================================================================== */
  static prepareSave(recipe: Recipe) {
    // Falls mehrere leere Einträge vorhanden, diese entfernen
    if (recipe.ingredients.length > 1) {
      recipe.ingredients = Recipe.deleteEmptyIngredients(recipe.ingredients);
    }
    if (recipe.preparationSteps.length > 1) {
      recipe.preparationSteps = Recipe.deleteEmptyPreparationSteps(
        recipe.preparationSteps
      );
    }

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
    }) as Ingredient[];

    recipe.preparationSteps = Utils.renumberArray({
      array: recipe.preparationSteps,
      field: "pos",
    }) as PreparationStep[];

    recipe.usedProducts = Recipe.getUsedProducts(recipe.ingredients);

    //TODO:
    // Zutaten: sicherstellen, dass Nummerische Werte auch so gespeichert werden
    // recipe.ingredients.forEach((ingredient) => {
    //   ingredient.quantity = parseFloat(ingredient.quantity);
    //   ingredient.scalingFactor = parseFloat(ingredient.scalingFactor);
    // });
    // recipe.portions = (recipe.portions);

    // Bild URL kopieren falls nicht auf eigenem Server
    if (
      (!recipe.pictureSrc.normalSize.includes("firebasestorage.googleapis") &&
        !recipe.pictureSrc.normalSize.includes("chuchipirat") &&
        !recipe.pictureSrc.normalSize) ||
      !recipe.pictureSrc.fullSize
    ) {
      recipe.pictureSrc.fullSize = recipe.pictureSrc.normalSize;
      recipe.pictureSrc.smallSize = recipe.pictureSrc.smallSize;
    }

    return recipe;
  }
  /* =====================================================================
  // Genutzte Produkte sammeln (damit diese auch wieder gefunden werden)
  // ===================================================================== */
  static getUsedProducts(ingredients: Ingredient[]) {
    let usedProducts: string[] = [];
    ingredients.forEach((ingredient) =>
      usedProducts.push(ingredient.product.uid)
    );
    return usedProducts;
  }
  /* =====================================================================
  // leere Zutaten entfernen
  // ===================================================================== */
  static deleteEmptyIngredients(ingredients: Ingredient[]) {
    return ingredients.filter((ingredient) => {
      if (
        !ingredient.quantity &&
        !ingredient.unit &&
        !ingredient.product.name
      ) {
        return false;
      }
      return true;
    });
  }
  /* =====================================================================
  // leere Zubereitungsschritte entfernen
  // ===================================================================== */
  static deleteEmptyPreparationSteps(preparationSteps: PreparationStep[]) {
    return preparationSteps.filter((preparationStep) => preparationStep.step);
  }

  /* =====================================================================
  // Bild in Firebase Storage hochladen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static async uploadPicture({
    firebase,
    file,
    recipe,
    authUser,
  }: UploadPicture) {
    await firebase.fileStore.recipe
      .uploadFile({ file: file, filename: recipe.uid })
      .then(async (downloadUrl: string) => {
        console.log("firstDownloadUrl", downloadUrl);
        await firebase.fileStore.recipe
          .getPictureVariants({
            uid: recipe.uid,
            sizes: [IMAGES_SUFFIX.size300.size, IMAGES_SUFFIX.size1000.size],
            oldDownloadUrl: downloadUrl,
          })

          //TS_MIGRATION
          //Definition muss weg. müsste automatisch geschehen
          .then((fileVariants: { size: number; downloadURL: string }[]) => {
            fileVariants.forEach((fileVariant) => {
              if (fileVariant.size === IMAGES_SUFFIX.size300.size) {
                recipe.pictureSrc.normalSize = fileVariant.downloadURL;
              } else if (fileVariant.size === IMAGES_SUFFIX.size1000.size) {
                recipe.pictureSrc.fullSize = fileVariant.downloadURL;
              }
            });
          });
      })
      .then(async () => {
        // Neuer URLs im Rezept gleich speichern
        await firebase.recipe.updateFields({
          uids: [recipe.uid],
          values: {
            pictureSrc: recipe.pictureSrc.normalSize,
            pictureSrcFullSize: recipe.pictureSrc.fullSize,
          },
          authUser: authUser,
          updateChangeFields: true,
        });
      })
      .then(() => {
        // CloudFunction Triggern
        firebase.cloudFunction.recipeUpdate.triggerCloudFunction({
          values: {
            uid: recipe.uid,
            newName: recipe.name,
            newPictureSrc: recipe.pictureSrc.normalSize,
          },
          authUser: authUser,
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    // Analytik
    firebase.analytics.logEvent(FirebaseAnalyticEvent.uploadPicture);
    firebase.analytics.logEvent(FirebaseAnalyticEvent.cloudFunctionExecuted);

    return {
      pictureSrc: recipe.pictureSrc.normalSize,
      pictureSrcFullSize: recipe.pictureSrc.fullSize,
    };
  }
  /* =====================================================================
  // Bild löschen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static deletePicture = async ({
    firebase,
    recipe,
    authUser,
  }: DeletePicture) => {
    firebase.fileStore.recipe
      .deleteFile(`${recipe.uid}${IMAGES_SUFFIX.size300.suffix}`)
      .catch((error) => {
        throw error;
      });

    firebase.fileStore.recipe
      .deleteFile(`${recipe.uid}${IMAGES_SUFFIX.size1000.suffix}`)
      .catch((error) => {
        throw error;
      });

    // URLs im Rezept gleich löschen
    firebase.recipe
      .updateFields({
        uids: [recipe.uid],
        values: {
          pictureSrc: "",
          pictureSrcFullSize: "",
        },
        authUser: authUser,
        updateChangeFields: true,
      })
      .catch((error) => {
        throw error;
      });

    // Cloudfunction triggern
    firebase.cloudFunction.recipeUpdate.triggerCloudFunction({
      values: {
        uid: recipe.uid,
        newName: recipe.name,
        newPictureSrc: "",
      },
      authUser: authUser,
    });

    // Analytik
    firebase.analytics.logEvent(FirebaseAnalyticEvent.deletePicture);
    firebase.analytics.logEvent(FirebaseAnalyticEvent.cloudFunctionExecuted);
  };
  /* =====================================================================
  // Leeres Objket Zutat erzeugen
  // ===================================================================== */
  static createEmptyIngredient(): Ingredient {
    return {
      uid: Utils.generateUid(5),
      // recipeId: "",
      pos: 0,
      product: { uid: "", name: "" },
      quantity: 0,
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
  static addEmptyEntry({
    array,
    pos,
    emptyObject,
    renumberByField,
  }: AddEmptyEntry) {
    array = Utils.insertArrayElementAtPosition({
      array: array,
      indexToInsert: pos - 1,
      newElement: emptyObject,
    });
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
  }: DeleteEntry) {
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
  static moveArrayEntryDown({
    array,
    posToMoveDown,
    renumberByField,
  }: moveArrayEntryDown) {
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
  static moveArrayEntryUp({
    array,
    posToMoveUp,
    renumberByField,
  }: moveArrayEntryUp) {
    array = Utils.moveArrayElementUp({
      array: array,
      indexToMoveUp: posToMoveUp - 1,
    });
    array = Utils.renumberArray({ array: array, field: renumberByField });
    return array;
  }
  /* =====================================================================
  // Rezept lesen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getRecipe = async ({ firebase, uid, userUid }: GetRecipe) => {
    let recipe = new Recipe();

    if (!firebase || !uid || !userUid) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    await firebase.recipe
      .read<Recipe>({ uids: [uid] })
      .then((result) => {
        if (!result) {
          throw Error(TEXT.ERROR_RECIPE_UNKNOWN(uid));
        }
        //TS_MIGRATION: Defintion nicht mehr nötig
        recipe = result as Recipe;

        // sicherstellen, dass mindestens eine Postion in Zutaten und Zubereitungsschritte vorhanden ist
        // if (recipe.ingredients.length === 0) {
        //   recipe.ingredients.push(Recipe.createEmptyIngredient());
        // }
        // if (recipe.preparationSteps.length === 0) {
        //   recipe.preparationSteps.push(Recipe.createEmptyPreparationStep());
        // }
        // if (!recipe.private) {
        //   recipe.private = false;
        // }
        // if (!recipe?.linkedRecipes) {
        //   recipe.linkedRecipes = [];
        // }
      })
      .then(async () => {
        // Bewertung holen
        recipe.rating.myRating = await RecipeRating.getUserRating({
          firebase: firebase,
          recipeUid: recipe.uid,
          userUid: userUid,
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return recipe;
  };
  /* =====================================================================
  // Mehrere Rezepte aus der DB suchen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  // static getMultipleRecipes = async ({
  //   firebase,
  //   uids = [],
  // }: GetMultipleRecipes) => {
  //   // let docRefs: Promise<Object>[] = [];
  //   // let results = [];
  //   let recipes: Recipe[] = [];
  //   //FIXME:
  //   // if (!firebase || !uids || uids.length === 0) {
  //   //   throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
  //   // }

  //   // uids.forEach((uid) => docRefs.push(firebase.recipe(uid).get()));

  //   // results = (await Promise.all(docRefs)) as { [field: string]: any }[];

  //   // results.forEach((result) => {
  //   //   recipes.push({ ...result.data(), uid: result.id });
  //   // });

  //   return recipes;
  // };
  // ===================================================================== */
  /**
   * Rating updaten - je nach dem ob der User das Rating, neu hinzufügt,
   * ändert oder löscht, wird das durschnittliche Rating für das Rezept
   * neu gerechnet. Um die Kommazahlen im 0.1 Bereich zu erhalten, wird
   * jeweils gerechnet und dann *10 -> runden -> /10
   * @param param0 - Objekt mit Firebase-Referenz, Rezept-Referenz,
   *        neues Rating und authUser
   * @returns neu Berechnetes Rating für Rezept
   */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static updateRating = ({
    firebase,
    recipe,
    newRating,
    authUser,
  }: UpdateRating) => {
    if (recipe.rating.myRating !== 0 && newRating === 0) {
      //  Rating wurde gelöscht
      recipe.rating.avgRating =
        Math.round(
          ((recipe.rating.avgRating * recipe.rating.noRatings -
            recipe.rating.myRating) /
            (recipe.rating.noRatings - 1)) *
            10
        ) / 10;
      recipe.rating.noRatings -= 1;
    } else if (recipe.rating.myRating > 0) {
      // geändertes Rating
      recipe.rating.avgRating =
        Math.round(
          ((recipe.rating.avgRating * recipe.rating.noRatings -
            recipe.rating.myRating +
            newRating) /
            recipe.rating.noRatings) *
            10
        ) / 10;
    } else {
      // neues Rating
      recipe.rating.avgRating =
        Math.round(
          ((recipe.rating.avgRating * recipe.rating.noRatings + newRating) /
            (recipe.rating.noRatings + 1)) *
            10
        ) / 10;
      recipe.rating.noRatings += 1;
    }

    // Rezept aktualisieren
    firebase.recipe.updateFields({
      uids: [recipe.uid],
      values: {
        rating: {
          avgRating: recipe.rating.avgRating,
          noRatings: recipe.rating.noRatings,
        },
      },
      authUser: authUser,
    });

    // User-spezifisches Rating speichern
    RecipeRating.updateUserRating({
      firebase: firebase,
      recipe: recipe,
      newRating: newRating,
      authUser: authUser,
    }).catch((error) => {
      console.error(error);
      throw error;
    });

    firebase.analytics.logEvent(FirebaseAnalyticEvent.recipeRatingSet);

    return recipe.rating;
  };
  /* =====================================================================
  // Kommentar speichern
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static saveComment = async ({
    firebase,
    uid,
    newComment,
    authUser,
  }: SaveComment) => {
    let comment = new RecipeComment();

    await RecipeComment.save({
      firebase: firebase,
      recipeUid: uid,
      comment: newComment,
      authUser: authUser,
    })
      .then((result) => {
        comment = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    // Bitzeli Analytics
    firebase.analytics.logEvent(FirebaseAnalyticEvent.recipeCommentCreated);
    // Timestamp umwandeln
    return comment;
  };
  /* =====================================================================
  // Rezept skalieren
  // ===================================================================== */
  static scale = ({ recipe, portionsToScale }: Scale) => {
    let scaledIngredients: Ingredient[] = [];

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
      scaledIngredients.push(scaledIngredient);
    });
    return scaledIngredients;
  };
}
