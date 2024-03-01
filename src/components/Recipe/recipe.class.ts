// // import Ingredient from "./ingredient";
import Utils from "../Shared/utils.class";

import Firebase from "../Firebase/firebase.class";
import {AuthUser} from "../Firebase/Authentication/authUser.class";
import {DocumentSnapshot} from "@firebase/firestore-types";

import UserPublicProfile, {
  UserPublicProfileStatsFields,
} from "../User/user.public.profile.class";
import Stats, {StatsField} from "../Shared/stats.class";
import Feed, {FeedType} from "../Shared/feed.class";

import FirebaseAnalyticEvent from "../../constants/firebaseEvent";
// import {
//   File,
//   IMAGES_SUFFIX,
// } from "../Firebase/Storage/firebase.storage.super.class";
import {SortOrder} from "../Firebase/Db/firebase.db.super.class";
import * as TEXT from "../../constants/text";
import RecipeShort from "./recipeShort.class";
import RecipeRating, {Rating} from "./recipe.rating.class";
import RecipeComment from "./recipe.comment.class";
import {ChangeRecord} from "../Shared/global.interface";
import Unit from "../Unit/unit.class";
import {RequestPublishRecipe, RequestReportError} from "../Request/internal";

import Product, {Diet, DietProperties} from "../Product/product.class";
import Event from "../Event/Event/event.class";

import _ from "lodash";
import Role from "../../constants/roles";
import {SessionStorageHandler} from "../Firebase/Db/sessionStorageHandler.class";
import UnitConversion, {
  UnitConversionBasic,
  UnitConversionProducts,
} from "../Unit/unitConversion.class";

export interface RecipeObjectStructure<T> {
  entries: {[key: string]: T};
  order: string[];
}
export interface ScalingOptions {
  convertUnits: boolean;
}
export interface PositionBase {
  uid: string;
  posType: PositionType;
}

export interface Ingredient extends PositionBase {
  product: IngredientProduct;
  quantity: number;
  unit: Unit["key"];
  detail: string;
  scalingFactor: number;
}

export interface RecipeMaterialPosition {
  uid: string;
  quantity: number;
  material: RecipeProduct;
}

export interface RecipeProduct {
  uid: string;
  name: string;
}

export enum PositionType {
  ingredient,
  preparationStep,
  section,
}

export enum RecipeType {
  public = "public",
  private = "private",
  variant = "variant",
}

export enum MenuType {
  None,
  MainCourse,
  SideDish,
  Appetizer,
  Dessert,
  Breakfast,
  Snack,
  Apero,
  Beverage,
}

// export interface Section {
//   uid: string;
//   posType: PositionType;
//   name: string;
// }

export interface IngredientProduct {
  uid: string;
  name: string;
}

export interface PreparationStep extends PositionBase {
  step: string;
}

export interface Section extends PositionBase {
  name: string;
}

export interface RecipeVariantProperties {
  note: string;
  variantName: string;
  eventUid: string;
  originalRecipeUid: string;
  originalRecipeType: RecipeType;
  originalRecipeCreator: ChangeRecord["fromUid"];
}
interface CreateRecipeVariant {
  recipe: Recipe;
  eventUid: Event["uid"];
}
interface CreateEmptyListEntries {
  recipe: Recipe;
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
  products: Product[];
  authUser: AuthUser;
}
interface PrepareSave {
  recipe: Recipe;
  products: Product[];
}
interface DefineDietProperties {
  recipe: Recipe;
  products: Product[];
}
interface DefinePostionSectionAdjusted {
  uid: string;
  order: string[];
  entries: {[key: string]: {posType: PositionType}};
}
interface SaveTags {
  firebase: Firebase;
  recipe: Recipe;
  tags: Recipe["tags"];
  authUser: AuthUser;
}
interface Delete {
  firebase: Firebase;
  recipe: Recipe;
  authUser?: AuthUser;
}
interface DeleteAllVariants {
  eventUid: Event["uid"];
  firebase: Firebase;
  authUser: AuthUser;
}
// interface UploadPicture {
//   firebase: Firebase;
//   file: File;
//   recipe: Recipe;
//   authUser: AuthUser;
// }
// interface DeletePicture {
//   firebase: Firebase;
//   recipe: Recipe;
//   authUser: AuthUser;
// }
// interface CreateEmptySection {
//   type: SectionType;
// }
// interface AddEmptyEntry<T> {
//   array: T[];
//   pos: number;
//   emptyObject: T;
//   renumberByField: string;
// }
// interface DeleteEntry<T> {
//   array: T[];
//   fieldValue: string | number | boolean;
//   fieldName: string;
//   emptyObject: T;
//   renumberByField: string;
// }
// interface moveArrayEntryDown<T> {
//   array: T[];
//   posToMoveDown: number;
//   renumberByField: string;
// }
// interface moveArrayEntryUp<T> {
//   array: T[];
//   posToMoveUp: number;
//   renumberByField: string;
// }
interface GetRecipe {
  firebase: Firebase;
  uid: string;
  type: RecipeType;
  userUid: string;
  eventUid?: string;
  authUser: AuthUser;
}
interface GetAllRecipes {
  firebase: Firebase;
}
interface GetMultipleRecipes {
  firebase: Firebase;
  recipes: RecipeIndetifier[];
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
  scalingOptions?: ScalingOptions;
  unitConversionBasic?: UnitConversionBasic | null;
  unitConversionProducts?: UnitConversionProducts | null;
  products?: Product[];
}

interface CreateRequest {
  firebase: Firebase;
  recipe: Recipe;
  messageForReview: string;
  authUser: AuthUser;
}

// Macht ein Rezept eindeutig
export interface RecipeIndetifier {
  uid: Recipe["uid"];
  recipeType: RecipeType;
  createdFromUid: ChangeRecord["fromUid"];
  eventUid: Event["uid"];
}

// Mehrere Rezepte, mit der UID als Member
export interface Recipes {
  [key: Recipe["uid"]]: Recipe;
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
  pictureSrc: string;
  note: string;
  tags: string[];
  linkedRecipes: RecipeShort[];
  ingredients: RecipeObjectStructure<Ingredient | Section>;
  preparationSteps: RecipeObjectStructure<PreparationStep | Section>;
  // sections: Section[];
  // materials: RecipeMaterialPosition[];
  materials: RecipeObjectStructure<RecipeMaterialPosition>;
  dietProperties: DietProperties;
  menuTypes: MenuType[];
  outdoorKitchenSuitable: boolean;
  rating: Rating;
  usedProducts: string[];
  isInReview?: boolean;
  created: ChangeRecord;
  lastChange: ChangeRecord;
  type: RecipeType;
  variantProperties?: RecipeVariantProperties;
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
    this.pictureSrc = "";
    this.note = "";
    this.tags = [];
    this.linkedRecipes = [];
    this.ingredients = {entries: {}, order: []};
    this.preparationSteps = {entries: {}, order: []};
    // this.sections = [];
    this.materials = {entries: {}, order: []};
    this.dietProperties = Product.createEmptyDietProperty();
    this.menuTypes = [];
    this.outdoorKitchenSuitable = false;
    this.usedProducts = [];
    this.created = {date: new Date(0), fromUid: "", fromDisplayName: ""};
    this.lastChange = {date: new Date(0), fromUid: "", fromDisplayName: ""};

    const ingredient = Recipe.createEmptyIngredient();
    this.ingredients.entries[ingredient.uid] = ingredient;
    this.ingredients.order.push(ingredient.uid);

    const preparationStep = Recipe.createEmptyPreparationStep();
    this.preparationSteps.entries[preparationStep.uid] = preparationStep;
    this.preparationSteps.order.push(preparationStep.uid);

    const material = Recipe.createEmptyMaterial();
    this.materials.entries[material.uid] = material;
    this.materials.order.push(material.uid);

    this.rating = {
      avgRating: 0,
      noRatings: 0,
      myRating: 0,
    };
    this.type = RecipeType.private;
    this.isInReview = false;
  }
  /* =====================================================================
  // Variante erstellen
  // ===================================================================== */
  static createRecipeVariant({recipe, eventUid}: CreateRecipeVariant) {
    const recipeVariant: Recipe = _.cloneDeep(recipe);

    recipeVariant.type = RecipeType.variant;
    recipeVariant.variantProperties = {
      note: "",
      variantName: "",
      eventUid: eventUid,
      originalRecipeUid: recipe.uid,
      originalRecipeType: recipe.type,
      originalRecipeCreator: recipe.created.fromUid,
    };
    // Temp-UID bis gespeichert wurde
    recipeVariant.uid = "";
    recipeVariant.created = {
      date: new Date(0),
      fromUid: "",
      fromDisplayName: "",
    };
    recipeVariant.lastChange = {
      date: new Date(0),
      fromUid: "",
      fromDisplayName: "",
    };

    return recipeVariant;
  }
  /* =====================================================================
  // Leere Einträge erzeugen
  // ===================================================================== */
  // in den Listen Einträge erzeugen, wenn nötig
  static createEmptyListEntries({recipe}: CreateEmptyListEntries) {
    recipe.ingredients = Recipe.createEmptyListEntryIngredients(
      recipe.ingredients
    );
    recipe.preparationSteps = Recipe.createEmptyListEntryPreparationSteps(
      recipe.preparationSteps
    );
    recipe.materials = Recipe.createEmptyListEntryMaterials(recipe.materials);
    return recipe;
  }
  /* =====================================================================
  // Leere Einträge Zutaten erzeugen
  // ===================================================================== */
  static createEmptyListEntryIngredients(ingredients: Recipe["ingredients"]) {
    if (ingredients.order.length == 0) {
      const ingredient = Recipe.createEmptyIngredient();
      ingredients.entries[ingredient.uid] = ingredient;
      ingredients.order.push(ingredient.uid);
    } else {
      let lastEntry =
        ingredients.entries[ingredients.order[ingredients.order.length - 1]];

      if (lastEntry && lastEntry.posType == PositionType.ingredient) {
        lastEntry = lastEntry as Ingredient;

        if (lastEntry.product.uid) {
          const ingredient = Recipe.createEmptyIngredient();
          ingredients.entries[ingredient.uid] = ingredient;
          ingredients.order.push(ingredient.uid);
        }
      }
    }
    return ingredients;
  }
  /* =====================================================================
  // Leere Einträge Zubereitungsschritte erzeugen
  // ===================================================================== */
  static createEmptyListEntryPreparationSteps(
    preparationSteps: Recipe["preparationSteps"]
  ) {
    if (Object.keys(preparationSteps.entries).length == 0) {
      const preparationStep = Recipe.createEmptyPreparationStep();
      preparationSteps.entries[preparationStep.uid] = preparationStep;
      preparationSteps.order.push(preparationStep.uid);
    } else {
      let lastEntry =
        preparationSteps.entries[
          preparationSteps.order[preparationSteps.order.length - 1]
        ];

      if (lastEntry && lastEntry.posType == PositionType.preparationStep) {
        lastEntry = lastEntry as PreparationStep;
        if (lastEntry.step) {
          const preparationStep = Recipe.createEmptyPreparationStep();
          preparationSteps.entries[preparationStep.uid] = preparationStep;
          preparationSteps.order.push(preparationStep.uid);
        }
      }
    }
    return preparationSteps;
  }
  /* =====================================================================
  // Leere Einträge Materialien erzeugen
  // ===================================================================== */
  static createEmptyListEntryMaterials(materials: Recipe["materials"]) {
    if (Object.keys(materials.entries).length == 0) {
      const material = Recipe.createEmptyMaterial();
      materials.entries[material.uid] = material;
      materials.order.push(material.uid);
    } else {
      const lastEntry =
        materials.entries[materials.order[materials.order.length - 1]];

      if (lastEntry && lastEntry.material.uid) {
        // leere Position am Schluss
        const material = Recipe.createEmptyMaterial();
        materials.entries[material.uid] = material;
        materials.order.push(material.uid);
      }
    }
    return materials;
  }
  /* =====================================================================
  // Tag löschen
  // ===================================================================== */
  static deleteTag({tags, tagToDelete}: DeleteTag) {
    return tags.filter((tag) => tag !== tagToDelete);
  }
  /* =====================================================================
  // Tag hinzufügen
  // ===================================================================== */
  static addTag({tags, tagsToAdd}: AddTag) {
    if (!tagsToAdd) {
      return tags;
    }

    // Wenn der Input Leerzeichen hat in mehrere Tags spliten
    const newTags = tagsToAdd.split(" ");

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
  static addLinkedRecipe({linkedRecipes, recipeToLink}: AddLinkedRecipe) {
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
    if (
      recipe.type == RecipeType.variant &&
      !recipe.variantProperties?.variantName
    ) {
      throw new Error(TEXT.RECIPE_VARIANT_NAME_CANT_BE_EMPTY);
    }

    if (!recipe.portions) {
      throw new Error(TEXT.ERROR_GIVE_FIELD_VALUE("Portionen"));
    }

    if (recipe.portions < 0) {
      throw new Error(TEXT.ERROR_PORTIONS_NEGATIV);
    }

    if (isNaN(recipe.portions)) {
      throw new Error(TEXT.ERROR_PORTIONS_NOT_NUMERIC);
    }

    if (recipe.ingredients.order.length == 0) {
      throw new Error(TEXT.ERROR_NO_INGREDIENTS_GIVEN);
    } else if (recipe.ingredients.order.length == 1) {
      let lastEntry = recipe.ingredients.entries[recipe.ingredients.order[0]];

      if (lastEntry.posType == PositionType.section) {
        throw new Error(TEXT.ERROR_NO_INGREDIENTS_GIVEN);
      }
      lastEntry = lastEntry as Ingredient;
      if (lastEntry.product.uid == "") {
        throw new Error(TEXT.ERROR_NO_INGREDIENTS_GIVEN);
      }
    }

    Object.values(recipe.ingredients.entries).forEach((position, counter) => {
      if (position.posType == PositionType.ingredient) {
        position = position as Ingredient;
        if (
          !position.product.uid &&
          (position.quantity || position.unit || position.product.name)
        ) {
          throw new Error(TEXT.ERROR_POS_WITHOUT_PRODUCT(counter + 1));
        }
      }
    });
    Object.values(recipe.materials.entries).forEach((position, counter) => {
      if (
        !position.material.uid &&
        (position.quantity || position.material.name)
      ) {
        throw new Error(TEXT.ERROR_POS_WITHOUT_MATERIAL(counter));
      }
    });
  }
  /* =====================================================================
  // Daten in Firebase SPEICHERN
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static async save({firebase, recipe, products, authUser}: Save) {
    const recipeData = Recipe.prepareSave({
      recipe: recipe,
      products: products,
    });
    if (recipe.type === RecipeType.public) {
      await Recipe.savePublic({
        firebase: firebase,
        recipe: recipeData,
        products: products,
        authUser: authUser,
      }).then((result) => (recipe = result));
    } else if (recipe.type === RecipeType.private) {
      await Recipe.savePrivate({
        firebase: firebase,
        recipe: recipeData,
        products: products,
        authUser: authUser,
      }).then((result) => (recipe = result));
    } else if (recipe.type === RecipeType.variant) {
      await Recipe.saveVariant({
        firebase: firebase,
        recipe: recipeData,
        products: products,
        authUser: authUser,
      }).then((result) => (recipe = result));
    }
    // sicherstellen, dass mindestens eine Postion in Zutaten und Zubereitungsschritte vorhanden ist
    recipe = Recipe.createEmptyListEntries({recipe: recipe});
    return recipe;
  }
  /* =====================================================================
  // Daten in Firebase SPEICHERN für öffentliche Rezepte
  // ===================================================================== */
  private static savePublic = async ({firebase, recipe, authUser}: Save) => {
    let recipeNameBeforeSave = "";

    // Alte Werte holen bevor gespeichert wird; dadurch wird entschieden ob später die
    // Cloudfunction die Änderungen überall updaten muss
    await firebase.recipePublic
      .read<Recipe>({uids: [recipe.uid]})
      .then((result) => {
        recipeNameBeforeSave = result.name;
      });
    //Speichern
    await firebase.recipePublic
      .set<Recipe>({
        uids: [recipe.uid],
        value: recipe,
        authUser: authUser,
      })
      .then((result) => {
        recipe = result as Recipe;
      })
      .then(() => {
        // 000_allRecipes Updaten
        firebase.recipeShortPublic
          .updateFields({
            uids: [""], // wird in der Klasse bestimmt,
            values: {
              [recipe.uid]: RecipeShort.createShortRecipeFromRecipe(recipe),
            },
            authUser: authUser,
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

    if (recipe.name !== recipeNameBeforeSave) {
      firebase.cloudFunction.recipeUpdate.triggerCloudFunction({
        values: {
          uid: recipe.uid,
          type: recipe.type,
          newName: recipe.name,
        },
        authUser: authUser,
      });
    }
    firebase.analytics.logEvent(FirebaseAnalyticEvent.cloudFunctionExecuted);

    return recipe;
  };
  /* =====================================================================
  // Daten in Firebase SPEICHERN für private Rezepte
  // ===================================================================== */
  private static savePrivate = async ({firebase, recipe, authUser}: Save) => {
    let newRecipe = false;
    let recipeNameBeforeSave = "";

    if (!recipe.uid) {
      newRecipe = true;
      await firebase.recipePrivate
        .create<Recipe>({
          uids: [authUser.uid],
          value: recipe,
          authUser: authUser,
        })
        .then((result) => {
          recipe = result;
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    } else {
      // Alte Werte holen bevor gespeichert wird; dadurch wird entschieden ob später die
      // Cloudfunction die Änderungen überall updaten muss
      await firebase.recipePrivate
        .read<Recipe>({uids: [authUser.uid, recipe.uid]})
        .then((result) => {
          recipeNameBeforeSave = result.name;
        });
      //Speichern
      await firebase.recipePrivate
        .set<Recipe>({
          uids: [authUser.uid, recipe.uid],
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
    const recipeShort = RecipeShort.createShortRecipeFromRecipe(recipe);
    // 000_allRecipes Updaten
    firebase.recipeShortPrivate
      .updateFields({
        uids: [authUser.uid],
        values: {
          [recipe.uid]: recipeShort,
        },
        authUser: authUser,
      })
      .catch((error) => {
        if (
          error.name === "FirebaseError" &&
          error.message.startsWith("No document to update")
        ) {
          // Dokument existiert nicht - neu Anlegen
          firebase.recipeShortPrivate.set({
            uids: [authUser.uid],
            value: recipeShort,
            authUser: authUser,
          });
          // Liste aller User mit privaten Rezepten ergänzen
          firebase.recipePrivate.updateFields({
            uids: [],
            values: {
              userWithPrivateRecipes: firebase.fieldValue.arrayUnion(
                authUser.uid
              ),
            },
            authUser: authUser,
          });
        } else {
          console.error(error);
          throw error;
        }
      });

    if (newRecipe) {
      // Event auslösen
      firebase.analytics.logEvent(FirebaseAnalyticEvent.recipeCreated);
      // Stats anzahl Private Rezepte

      // Counter für Stats herunterzählen
      Stats.incrementStat({
        firebase: firebase,
        field: StatsField.noRecipesPrivate,
        value: 1,
      });
      // Dem User Credits geben
      UserPublicProfile.incrementField({
        firebase: firebase,
        uid: authUser.uid,
        field: UserPublicProfileStatsFields.noRecipesPrivate,
        step: 1,
      });

      Feed.createFeedEntry({
        firebase: firebase,
        authUser: authUser,
        feedType: FeedType.recipeCreated,
        objectUid: recipe.uid,
        objectName: recipe.name,
        objectPictureSrc: recipe.pictureSrc,
        objectType: RecipeType.private,
        feedVisibility: Role.communityLeader,
      });
    }

    if (!newRecipe && recipe.name !== recipeNameBeforeSave) {
      firebase.cloudFunction.recipeUpdate.triggerCloudFunction({
        values: {
          uid: recipe.uid,
          type: recipe.type,
          newName: recipe.name,
        },
        authUser: authUser,
      });
    }
    firebase.analytics.logEvent(FirebaseAnalyticEvent.cloudFunctionExecuted);

    return recipe;
  };
  /* =====================================================================
  // Daten in Firebase SPEICHERN für Varianten-Rezepte
  // ===================================================================== */
  private static saveVariant = async ({firebase, recipe, authUser}: Save) => {
    let newRecipe = false;
    if (!recipe.uid) {
      newRecipe = true;
      await firebase.recipeVariant
        .create<Recipe>({
          uids: [recipe.variantProperties!.eventUid!],
          value: recipe,
          authUser: authUser,
        })
        .then((result) => {
          recipe = result;
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    } else {
      //Speichern
      await firebase.recipeVariant
        .set<Recipe>({
          uids: [recipe.variantProperties!.eventUid!, recipe.uid],
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

    const recipeShort = RecipeShort.createShortRecipeFromRecipe(recipe);

    // 000_allRecipes Updaten
    await firebase.recipeShortVariant
      .updateFields({
        uids: [recipe.variantProperties!.eventUid],
        values: {
          [recipe.uid]: recipeShort,
        },
        authUser: authUser,
      })
      .catch(async (error) => {
        if (
          error.name === "FirebaseError" &&
          error.message.startsWith("No document to update")
        ) {
          // Dokument existiert nicht - neu Anlegen
          await firebase.recipeShortVariant.set({
            uids: [recipe.variantProperties!.eventUid],
            value: recipeShort,
            authUser: authUser,
          });
        } else {
          console.error(error);
          throw error;
        }
      });

    if (newRecipe) {
      // Event auslösen
      firebase.analytics.logEvent(FirebaseAnalyticEvent.recipeVariantCreated);
      Stats.incrementStat({
        firebase: firebase,
        field: StatsField.noRecipeVariants,
        value: 1,
      });
      Stats.incrementRecipeVariantCounter({
        firebase: firebase,
        recipeUid: recipe.variantProperties!.originalRecipeUid,
        value: 1,
      });
      Feed.createFeedEntry({
        firebase: firebase,
        authUser: authUser,
        feedType: FeedType.recipeCreated,
        objectUid: recipe.uid,
        objectName: recipe.name,
        objectPictureSrc: recipe.pictureSrc,
        objectType: RecipeType.variant,
        feedVisibility: Role.communityLeader,
      });
    }
    return recipe;
  };

  /* =====================================================================
  // Speichern vorbereiten
  // ===================================================================== */
  static prepareSave({recipe, products}: PrepareSave) {
    // Falls mehrere leere Einträge vorhanden, diese entfernen
    if (Object.keys(recipe.ingredients.entries).length > 0) {
      recipe.ingredients = Recipe.deleteEmptyIngredients(recipe.ingredients);
    }
    if (Object.values(recipe.materials.entries).length > 0) {
      recipe.materials = Recipe.deleteEmptyMaterials(recipe.materials);
    }

    // vorbereiten der Diät-Eigenschaften.
    recipe.dietProperties = Recipe.defineDietProperties({
      recipe: recipe,
      products: products,
    });

    // Nochmals prüfen ob alles ok.
    try {
      Recipe.checkRecipeData(recipe);
    } catch (error) {
      console.error(error);
      throw error;
    }

    // Prüfen ob Werte auch !== null
    Object.values(recipe.ingredients.entries).forEach((ingredient) => {
      if (ingredient.posType == PositionType.ingredient) {
        ingredient = ingredient as Ingredient;
        if (!ingredient.quantity) {
          ingredient.quantity = 0;
        }
        if (!ingredient.unit || ingredient.unit == null) {
          ingredient.unit = "";
        }
        if (!isNaN(ingredient.quantity)) {
          ingredient.quantity = parseFloat(`${ingredient.quantity}`);
        }
        if (!isNaN(ingredient.scalingFactor)) {
          ingredient.scalingFactor = parseFloat(`${ingredient.scalingFactor}`);
        }
      }
    });

    Object.values(recipe.materials.entries).forEach((material) => {
      if (!isNaN(material.quantity)) {
        material.quantity = parseFloat(`${material.quantity}`);
      }
    });

    // Zutaten und Zubereitung nochmals Positionen nummerieren
    // recipe.ingredients = Utils.renumberArray({
    //   array: recipe.ingredients,
    //   field: "pos",
    // }) as Ingredient[];

    // recipe.preparationSteps = Utils.renumberArray({
    //   array: recipe.preparationSteps,
    //   field: "pos",
    // }) as PreparationStep[];

    // recipe.usedProducts = Recipe.getUsedProducts(recipe.ingredients);

    // Zutaten: sicherstellen, dass Nummerische Werte auch so gespeichert werden
    recipe.portions = parseInt(recipe.portions.toString());
    return recipe;
  }
  /* =====================================================================
  // Bestimmen welche Diät-Eigenschaften ein Rezept hat
  // ===================================================================== */
  static defineDietProperties({recipe, products}: DefineDietProperties) {
    // HINT: diese Funktion muss auch in der Cloud-FX  nachgeführt werden
    const dietProperties = {allergens: [], diet: Diet.Vegan} as DietProperties;

    // Ein Vorkommnis reicht, damit ein Rezept die entsprechende Allergie erhält
    Object.values(recipe.ingredients.entries).forEach((ingredient) => {
      if (ingredient.posType == PositionType.ingredient) {
        ingredient = ingredient as Ingredient;
        const productUid = ingredient.product.uid;

        // Infos zu Produkt holen
        const product = products.find(
          (product) => product.uid === productUid
        ) as Product;

        if (product?.dietProperties?.allergens?.length > 0) {
          dietProperties.allergens = dietProperties.allergens.concat(
            product.dietProperties.allergens
          );
        }

        if (dietProperties?.diet > product.dietProperties.diet) {
          dietProperties.diet = product.dietProperties.diet;
        }
      }
    });

    if (dietProperties.allergens.length > 0) {
      // Duplikate löschen
      dietProperties.allergens = [...new Set(dietProperties.allergens)];
    }
    return dietProperties;
  }
  /* =====================================================================
  // Position definieren, und dabei die vorhergehenden Sektion ingnorieren
  // ===================================================================== */
  static definePostionSectionAdjusted({
    uid,
    entries,
    order,
  }: DefinePostionSectionAdjusted) {
    let positionCounter = 0;

    for (let i = 0; i < order.length; i++) {
      if (entries[order[i]].posType !== PositionType.section) {
        positionCounter++;
      }

      if (order[i] == uid) {
        return positionCounter;
      }
    }

    return positionCounter;
  }
  /* =====================================================================
  // Genutzte Produkte sammeln (damit diese auch wieder gefunden werden)
  // ===================================================================== */
  // static getUsedProducts(ingredients: Ingredient[]) {
  //   let usedProducts: string[] = [];
  //   ingredients.forEach((position) => usedProducts.push(position.product.uid));
  //   return usedProducts;
  // }
  /* =====================================================================
  // Tags speichern
  // ===================================================================== */
  static async saveTags({firebase, recipe, tags, authUser}: SaveTags) {
    // einzelnes Feld updaten!

    if (!recipe.uid) {
      // Wenn Rezept neu angelegt wird, werden die Tags mit dem
      // speichern festgehalten
      return;
    }

    switch (recipe.type) {
      case RecipeType.public:
        await firebase.recipePublic
          .updateFields({
            uids: [recipe.uid],
            values: {tags: tags},
            authUser: authUser,
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });

        await firebase.recipeShortPublic
          .updateFields({
            uids: [],
            values: {
              [recipe.uid]: {
                ...RecipeShort.createShortRecipeFromRecipe(recipe),
                tags: tags,
              },
            },
            authUser: authUser,
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });
        break;
      case RecipeType.private:
        await firebase.recipePrivate
          .updateFields({
            uids: [authUser.uid, recipe.uid],
            values: {tags: tags},
            authUser: authUser,
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });

        await firebase.recipeShortPrivate
          .updateFields({
            uids: [authUser.uid],
            values: {
              [recipe.uid]: {
                ...RecipeShort.createShortRecipeFromRecipe(recipe),
                tags: tags,
              },
            },
            authUser: authUser,
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });
        break;
        break;
      case RecipeType.variant:
        break;
    }
    // await firebase
  }
  /* =====================================================================
  // leere Zutaten entfernen
  // ===================================================================== */
  static deleteEmptyIngredients(
    ingredients: RecipeObjectStructure<Ingredient | Section>
  ) {
    const ingredientUids = [...ingredients.order];
    ingredientUids.forEach((ingredientUid) => {
      if (
        ingredients.entries[ingredientUid].posType == PositionType.ingredient
      ) {
        const ingredient = ingredients.entries[ingredientUid] as Ingredient;
        if (
          !ingredient.quantity &&
          !ingredient.unit &&
          !ingredient.product.name
        ) {
          delete ingredients.entries[ingredientUid];
          ingredients.order = ingredients.order.filter(
            (orderUid) => orderUid !== ingredientUid
          );
        }
      }
    });
    return ingredients;
  }
  /* =====================================================================
  // leere Zubereitungsschritte entfernen
  // ===================================================================== */
  static deleteEmptyPreparationSteps(
    preparationSteps: RecipeObjectStructure<PreparationStep>
  ) {
    const preparationStepUids = [...preparationSteps.order];
    preparationStepUids.forEach((preparationStepUid) => {
      if (!preparationSteps.entries[preparationStepUid].step) {
        delete preparationSteps.entries[preparationStepUid];
        preparationSteps.order = preparationSteps.order.filter(
          (orderUid) => orderUid !== preparationStepUid
        );
      }
    });
    return preparationSteps;
  }
  /* =====================================================================
  // leere Materiale entfernen
  // ===================================================================== */
  static deleteEmptyMaterials(
    materials: RecipeObjectStructure<RecipeMaterialPosition>
  ) {
    //TODO: Test-ME
    const materialUids = [...materials.order];
    materialUids.forEach((materialUid) => {
      if (!materials.entries[materialUid].material.name) {
        delete materials.entries[materialUid];
        materials.order = materials.order.filter(
          (orderUid) => orderUid !== materialUid
        );
      }
    });
    return materials;
  }
  /* =====================================================================
  // Rezept löschen
  // ===================================================================== */
  static async delete({firebase, recipe, authUser}: Delete) {
    // sicherstellen, dass nur die richtigen Personen löschen dürfen

    if (!authUser) {
      throw Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    switch (recipe.type) {
      case RecipeType.public:
        if (!authUser.roles.includes(Role.admin)) {
          throw Error(TEXT.FIREBASE_MESSAGES.PERMISSION_DENIED);
        }
        break;
      case RecipeType.private:
        if (recipe.created.fromUid !== authUser.uid) {
          throw Error(TEXT.FIREBASE_MESSAGES.PERMISSION_DENIED);
        }
        break;
      case RecipeType.variant:
        // Wird durch die Firebase-Rule abgefangen
        break;
    }

    if (recipe.type === RecipeType.public) {
      // Rezept löschen
      await Recipe.deletePublic({
        firebase: firebase,
        recipe: recipe,
        authUser: authUser,
      }).catch((error) => {
        console.error(error);
        throw error;
      });
    } else if (recipe.type === RecipeType.private) {
      await Recipe.deletePrivate({
        firebase: firebase,
        recipe: recipe,
        authUser: authUser,
      }).catch((error) => {
        console.error(error);
        throw error;
      });
    } else if (recipe.type === RecipeType.variant) {
      await Recipe.deleteVariant({
        firebase: firebase,
        recipe: recipe,
        authUser: authUser,
      }).catch((error) => {
        console.error(error);
        throw error;
      });
    }
    // 000_allRecipes anpassen
    await RecipeShort.delete({
      firebase: firebase,
      recipeUid: recipe.uid,
      recipeType: recipe.type,
      authUser: authUser,
      eventUid:
        recipe.type == RecipeType.variant
          ? recipe.variantProperties!.eventUid
          : "",
    }).catch((error) => {
      console.error(error);
      throw error;
    });

    // Cloud-Function triggern, die die Rezepte aus den Menüplänen entfernt
    if (recipe.type !== RecipeType.variant) {
      firebase.cloudFunction.recipeDelete.triggerCloudFunction({
        values: {
          uid: recipe.uid,
          name: recipe.name,
        },
        authUser: authUser,
      });
    }
  }
  /* =====================================================================
  /**
   * deletePublic: öffentliches Rezept löschen
   * alle nötigen Infos (000_allRecipes) udn Counter werden angepasst.
   */
  private static deletePublic = async ({
    firebase,
    recipe,
    authUser,
  }: Delete) => {
    if (!authUser) {
      throw Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }
    await firebase.recipePublic.delete({uids: [recipe.uid]}).catch((error) => {
      console.error(error);
      throw error;
    });
    // Counter für Stats herunterzählen
    Stats.incrementStat({
      firebase: firebase,
      field: StatsField.noRecipesPublic,
      value: -1,
    });
    // Dem User Credits nehmen
    UserPublicProfile.incrementField({
      firebase: firebase,
      uid: authUser.uid,
      field: UserPublicProfileStatsFields.noRecipesPublic,
      step: -1,
    });
  };
  /* =====================================================================
  /**
   * deletePrivate: Privates Rezept löschen
   * alle nötigen Infos (000_allRecipes) udn Counter werden angepasst.
   */
  private static deletePrivate = async ({
    firebase,
    recipe,
    authUser,
  }: Delete) => {
    if (!authUser) {
      throw Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    await firebase.recipePrivate
      .delete({uids: [authUser.uid, recipe.uid]})
      .catch((error) => {
        console.error(error);
        throw error;
      });
    // Counter für Stats herunterzählen
    Stats.incrementStat({
      firebase: firebase,
      field: StatsField.noRecipesPrivate,
      value: -1,
    });
    // Dem User Credits nehmen
    UserPublicProfile.incrementField({
      firebase: firebase,
      uid: authUser.uid,
      field: UserPublicProfileStatsFields.noRecipesPrivate,
      step: -1,
    });
  };
  /* =====================================================================
  /**
   * deletePrivate: Privates Rezept löschen
   * alle nötigen Infos (000_allRecipes) udn Counter werden angepasst.
   */
  private static deleteVariant = async ({firebase, recipe}: Delete) => {
    await firebase.recipeVariant
      .delete({uids: [recipe.variantProperties!.eventUid!, recipe.uid]})
      .catch((error) => {
        console.error(error);
        throw error;
      });
    // Counter für Stats herunterzählen
    Stats.incrementStat({
      firebase: firebase,
      field: StatsField.noRecipeVariants,
      value: -1,
    });
    Stats.incrementRecipeVariantCounter({
      firebase: firebase,
      recipeUid: recipe.variantProperties!.originalRecipeUid,
      value: -1,
    });
  };
  /* =====================================================================
  /**
   * Alle Rezept-Varianten löschen
   * Wird benötigt, wenn der ganze Event gelöscht wird.
   */
  static deleteAllVariants = async ({
    eventUid,
    firebase,
    authUser,
  }: DeleteAllVariants) => {
    let counter = 0;
    // Rezept-Übersicht holen
    await RecipeShort.getShortRecipesVariant({
      firebase: firebase,
      eventUid: eventUid,
    })
      .then((result) =>
        result.forEach(async (recipeVariantShort) => {
          await Recipe.delete({
            recipe: {
              ...new Recipe(),
              ...recipeVariantShort,
              variantProperties: {eventUid: eventUid},
            } as Recipe,
            firebase: firebase,
            authUser: authUser,
          }).then(() => {
            counter++;
          });
        })
      )
      .then(async () => {
        // Rezept-Übersich löschen
        await RecipeShort.deleteOverview({
          eventUid: eventUid,
          firebase: firebase,
        }).catch((error) => {
          console.error(error);
          throw error;
        });
      })
      .then(() => {
        Stats.incrementStat({
          field: StatsField.noRecipeVariants,
          value: counter * -1,
          firebase: firebase,
        });
      });
  };
  /* =====================================================================
  // Leeres Objket Zutat erzeugen
  // ===================================================================== */
  static createEmptyIngredient(): Ingredient {
    return {
      uid: Utils.generateUid(5),
      // recipeId: "",
      posType: PositionType.ingredient,
      product: {uid: "", name: ""},
      quantity: 0,
      unit: "",
      detail: "",
      scalingFactor: 1,
    };
  }
  /* =====================================================================
  // Leeres Objket Abschnitt erzeugen
  // ===================================================================== */
  static createEmptySection(): Section {
    return {
      uid: Utils.generateUid(5),
      posType: PositionType.section,
      name: "",
    };
  }
  /* =====================================================================
  // Leeren Zubereitungsschritt erzeugen
  // ===================================================================== */
  static createEmptyPreparationStep(): PreparationStep {
    return {
      uid: Utils.generateUid(5),
      posType: PositionType.preparationStep,
      step: "",
    };
  }
  /* =====================================================================
  // Leeres Material erzeugen
  // ===================================================================== */
  static createEmptyMaterial(): RecipeMaterialPosition {
    return {
      uid: Utils.generateUid(5),
      quantity: 0,
      material: {uid: "", name: ""},
    } as RecipeMaterialPosition;
  }
  /* =====================================================================
  // Eintrag in Array hinzufügen
  // ===================================================================== */
  // static addEmptyEntry<T>({
  //   array,
  //   pos,
  //   emptyObject,
  //   renumberByField,
  // }: AddEmptyEntry<T>) {
  //   array = Utils.insertArrayElementAtPosition({
  //     array: array,
  //     indexToInsert: pos - 1,
  //     newElement: emptyObject,
  //   });
  //   array = Utils.renumberArray({array: array, field: renumberByField});
  //   return array;
  // }
  /* =====================================================================
  // Eintrag in Array löschen
  // ===================================================================== */
  // static deleteEntry<T>({
  //   array,
  //   fieldValue,
  //   fieldName,
  //   emptyObject,
  //   renumberByField,
  // }: DeleteEntry<T>) {
  //   array = array.filter((entry) => entry[fieldName] !== fieldValue);

  //   if (array.length === 0) {
  //     array.push(emptyObject);
  //   }
  //   array = Utils.renumberArray({array: array, field: renumberByField});
  //   return array;
  // }
  /* =====================================================================
  // Eintrag in Liste runter schieben
  // ===================================================================== */
  // static moveArrayEntryDown<T>({
  //   array,
  //   posToMoveDown,
  //   renumberByField,
  // }: moveArrayEntryDown<T>) {
  //   array = Utils.moveArrayElementDown<T>({
  //     array: array,
  //     indexToMoveDown: posToMoveDown - 1,
  //   });
  //   array = Utils.renumberArray({array: array, field: renumberByField});
  //   return array;
  // }
  /* =====================================================================
  // Eintrag in Liste hoch schieben
  // ===================================================================== */
  // static moveArrayEntryUp<T>({
  //   array,
  //   posToMoveUp,
  //   renumberByField,
  // }: moveArrayEntryUp<T>) {
  //   array = Utils.moveArrayElementUp<T>({
  //     array: array,
  //     indexToMoveUp: posToMoveUp - 1,
  //   });
  //   array = Utils.renumberArray({array: array, field: renumberByField});
  //   return array;
  // }
  /* =====================================================================
  // Rezept lesen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getRecipe = async ({
    firebase,
    uid,
    type,
    userUid,
    eventUid = "",
    authUser,
  }: GetRecipe) => {
    let recipe = new Recipe();

    if (
      !firebase ||
      !uid ||
      !type ||
      (!userUid && type === RecipeType.private) ||
      (!eventUid && type === RecipeType.variant)
    ) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    if (type === RecipeType.public) {
      await firebase.recipePublic
        .read<Recipe>({uids: [uid]})
        .then((result) => {
          if (!result) {
            throw Error(TEXT.ERROR_RECIPE_UNKNOWN(uid));
          }
          recipe = result;
        })
        .then(async () => {
          // Bewertung holen
          recipe.rating.myRating = await RecipeRating.getUserRating({
            firebase: firebase,
            recipeUid: recipe.uid,
            userUid: authUser.uid,
          });

          recipe = Recipe.createEmptyListEntries({recipe: recipe});
        })
        .catch(() => {
          // User hat kein Rating abgegeben. Voll ok!
          // console.error(error);
          // throw error;
        });
    } else if (type === RecipeType.private) {
      await firebase.recipePrivate
        .read<Recipe>({uids: [userUid, uid]})
        .then((result) => {
          if (!result) {
            throw Error(TEXT.ERROR_RECIPE_UNKNOWN(uid));
          }
          recipe = result;
          recipe = Recipe.createEmptyListEntries({recipe: recipe});
        });
    } else if (type === RecipeType.variant) {
      await firebase.recipeVariant
        .read<Recipe>({uids: [eventUid, uid]})
        .then((result) => {
          if (!result) {
            throw Error(TEXT.ERROR_RECIPE_UNKNOWN(uid));
          }
          recipe = result;
          recipe = Recipe.createEmptyListEntries({recipe: recipe});
        })
        .catch((error) => console.error(error));
    } else {
      throw Error(TEXT.ERROR_RECIPE_UNKNOWN(uid));
    }

    return recipe;
  };
  /* =====================================================================
  // Alle Rezepte aus der DB holen
  // ===================================================================== */
  static getAllRecipes = async ({
    firebase,
  }: GetAllRecipes): Promise<Recipe[]> => {
    let recipes: Recipe[] = [];

    if (!firebase) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    await firebase.recipePublic
      .readCollection<Recipe>({
        uids: [],
        orderBy: {field: "name", sortOrder: SortOrder.asc},
        limit: 1000,
      })
      .then((result) => {
        recipes = result as Recipe[];
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return recipes;
  };

  /* =====================================================================
  // Mehrere Rezepte aus der DB suchen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getMultipleRecipes = async ({
    firebase,
    recipes,
  }: GetMultipleRecipes) => {
    const docRefs: Promise<DocumentSnapshot>[] = [];
    const result: {[key: Recipe["uid"]]: Recipe} = {};

    if (!firebase || !recipes || recipes.length === 0) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }

    // Trennen zwischen öffentlichen , Privaten, und Varianten
    recipes.forEach((recipe) => {
      if (recipe.uid.includes("[DELETED]")) {
        // gelöschte Rezepte ignorieren
        return;
      }
      switch (recipe.recipeType) {
        case RecipeType.public:
          docRefs.push(firebase.recipePublic.getDocument([recipe.uid]).get());
          break;
        case RecipeType.private:
          docRefs.push(
            firebase.recipePrivate
              .getDocument([recipe.createdFromUid, recipe.uid])
              .get()
          );
          break;
        case RecipeType.variant:
          docRefs.push(
            firebase.recipeVariant
              .getDocument([recipe.eventUid, recipe.uid])
              .get()
          );
          break;
      }
    });
    const documents = (await Promise.all(docRefs)) as {[field: string]: any}[];

    documents.forEach((document) => {
      let recipe = {} as Recipe;
      const recipeType = recipes.find(
        (recipe) => recipe.uid == document.id
      )?.recipeType;

      switch (recipeType) {
        case RecipeType.public:
          recipe = firebase.recipePublic.prepareDataForApp({
            uid: document.id,
            value: firebase.recipePublic.convertTimestampValuesToDates(
              document.data()
            ),
          });
          break;
        case RecipeType.private:
          recipe = firebase.recipePrivate.prepareDataForApp({
            uid: document.id,
            value: firebase.recipePrivate.convertTimestampValuesToDates(
              document.data()
            ),
          });
          break;
        case RecipeType.variant:
          recipe = firebase.recipeVariant.prepareDataForApp({
            uid: document.id,
            value: firebase.recipeVariant.convertTimestampValuesToDates(
              document.data()
            ),
          });
          break;
      }

      // Gleich in Local Storage aufnehmen
      SessionStorageHandler.upsertDocument({
        storageObjectProperty:
          firebase.recipePublic.getSessionHandlerProperty(), // gilt für alle Typen
        documentUid: document.id,
        value: recipe,
        prefix: "",
      });

      result[document.id] = recipe;
    });

    return result;
  };
  // ===================================================================== */
  /**
   * Rating updaten - je nach dem ob der User das Rating, neu hinzufügt,
   * ändert oder löscht, wird das durschnittliche Rating für das Rezept
   * neu gerechnet. Um die Kommazahlen im 0.1 Bereich zu erhalten, wird
   * jeweils gerechnet und dann *10 -> runden -> /10
   * Vor dem Speichern, muss der aktuelle Wert auf der DB nochmals
   * nachgelesen werden, da es sein könnte, dass in der Zwischenzeit jemand
   * anders ein neues Rating abgegeben hat. Daher: aktuelle Daten holen
   * und nochmals neu durchrechnen.
   * @param param0 - Objekt mit Firebase-Referenz, Rezept-Referenz,
   *        neues Rating und authUser
   * @returns neu Berechnetes Rating für Rezept
   */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static updateRating = async ({
    firebase,
    recipe,
    newRating,
    authUser,
  }: UpdateRating) => {
    const oldRating = recipe.rating.myRating;

    // Aktuelle Werte holen
    await firebase.recipePublic
      .read<Recipe>({uids: [recipe.uid]})
      .then((result) => {
        recipe.rating = result.rating;
        if (oldRating !== 0 && newRating === 0) {
          //  Rating wurde gelöscht
          recipe.rating.avgRating =
            Math.round(
              ((recipe.rating.avgRating * recipe.rating.noRatings - oldRating) /
                (recipe.rating.noRatings - 1)) *
                10
            ) / 10;
          recipe.rating.noRatings = recipe.rating.noRatings - 1;
        } else if (oldRating > 0) {
          // geändertes Rating
          recipe.rating.avgRating =
            Math.round(
              ((recipe.rating.avgRating * recipe.rating.noRatings -
                oldRating +
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
          recipe.rating.noRatings = recipe.rating.noRatings + 1;
        }

        recipe.rating.myRating = newRating;

        // Rating speichern
        firebase.recipePublic.updateFields({
          uids: [recipe.uid],
          values: {
            rating: {
              avgRating: recipe.rating.avgRating,
              noRatings: recipe.rating.noRatings,
            },
          },
          authUser: authUser,
          updateChangeFields: false,
        });

        //000_allRecipes updaten
        firebase.recipeShortPublic
          .updateFields({
            uids: [""], // wird in der Klasse bestimmt,
            values: {
              [recipe.uid]: RecipeShort.createShortRecipeFromRecipe(recipe),
            },
            authUser: authUser,
            updateChangeFields: false,
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });
      });
    // User-spezifisches Rating speichern
    await RecipeRating.updateUserRating({
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
  static scaleIngredients = ({
    recipe,
    portionsToScale,
    scalingOptions,
    unitConversionBasic,
    unitConversionProducts,
    products,
  }: Scale) => {
    const scaledIngredients = {} as RecipeObjectStructure<Ingredient>;

    Object.values(recipe.ingredients.entries).forEach((ingredient) => {
      if (ingredient.posType == PositionType.ingredient) {
        ingredient = ingredient as Ingredient;

        if (ingredient.product.uid) {
          // Leere positionen interessieren uns nicht

          const scaledIngredient = {...ingredient};

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
          scaledIngredients[ingredient.uid] = scaledIngredient;
          if (scalingOptions?.convertUnits) {
            // Einheit versuchen umzurechnen

            // Produkt suchen, damit die Ziel-Einheit bestimmt werden kann.
            const product = products?.find(
              (product) => product.uid == scaledIngredient.product.uid
            );
            const {convertedQuantity, convertedUnit} =
              UnitConversion.convertQuantity({
                quantity: scaledIngredient.quantity,
                productUid: scaledIngredient.product.uid,
                fromUnit: scaledIngredient.unit,
                toUnit: product!.shoppingUnit!,
                unitConversionBasic: unitConversionBasic!,
                unitConversionProducts: unitConversionProducts!,
              });
            if (convertedQuantity != undefined && convertedUnit != undefined) {
              // Nur übernehmen, wenn konsistent
              scaledIngredient.quantity = convertedQuantity;
              scaledIngredient.unit = convertedUnit;
            }
          }
        }
      }
    });
    return scaledIngredients;
  };
  static scaleMaterials = ({recipe, portionsToScale}: Scale) => {
    const scaledMaterials = {} as RecipeObjectStructure<RecipeMaterialPosition>;

    Object.values(recipe.materials.entries).forEach((material) => {
      const scaledMaterial = {...material};

      if (material.quantity) {
        scaledMaterial.quantity =
          (scaledMaterial.quantity / recipe.portions) * portionsToScale;
      }
      scaledMaterials[material.uid] = scaledMaterial;
    });
    return scaledMaterials;
  };

  // ===================================================================== */
  /**
   * Request für Rezept eröffnen.
   * @param param0 - Objekt mit Firebase-Referenz, und Objekt, dass den
   * Request auslöst authUser
   */
  static createRecipePublishRequest = async ({
    firebase,
    recipe,
    messageForReview,
    authUser,
  }: CreateRequest) => {
    const requestNo = await new RequestPublishRecipe().createRequest({
      firebase: firebase,
      requestObject: recipe,
      messageForReview: messageForReview,
      authUser: authUser,
    });
    // Rezept update, dass sich diesen in Review befindet.
    await firebase.recipePrivate.updateFields({
      uids: [authUser.uid, recipe.uid],
      values: {isInReview: true},
      authUser: authUser,
    });
    return requestNo;
  };

  // ===================================================================== */
  /**
   * Fehler im Rezept melden.
   * @param param0 - Objekt mit Firebase-Referenz, und Objekt, dass den
   * Request auslöst authUser
   */
  static createReportErrorRequest = async ({
    firebase,
    recipe,
    messageForReview,
    authUser,
  }: CreateRequest) => {
    const requestNo = await new RequestReportError().createRequest({
      firebase: firebase,
      requestObject: recipe,
      messageForReview: messageForReview,
      authUser: authUser,
    });

    return requestNo;
  };
}
