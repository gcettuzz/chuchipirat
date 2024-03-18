import {HOME_STATS_CAPTIONS as TEXT_HOME_STATS_CAPTIONS} from "../../constants/text";
import AuthUser from "../Firebase/Authentication/authUser.class";
import Firebase from "../Firebase/firebase.class";
import Recipe from "../Recipe/recipe.class";

export enum StatsField {
  noUsers = "noUsers",
  noEvents = "noEvents",
  noIngredients = "noIngredients",
  noMaterials = "noMaterials",
  noRecipesPublic = "noRecipesPublic",
  noRecipesPrivate = "noRecipesPrivate",
  noRecipeVariants = "noRecipesVariants",
  noShoppingLists = "noShoppingLists",
  noParticipants = "noParticipants",
  noMaterialLists = "noMaterialLists",
}

interface incrementStat {
  firebase: Firebase;
  field: StatsField;
  value: number;
}
interface Save {
  firebase: Firebase;
  stats: Stats;
  authUser: AuthUser;
}
interface IncrementRecipeVariantCounter {
  firebase: Firebase;
  recipeUid: Recipe["uid"];
  value: number;
}
export interface Kpi {
  id: StatsField;
  value: number;
  caption: string;
}

export default class Stats {
  noEvents: number;
  noIngredients: number;
  noMaterials: number;
  noParticipants: number;
  noRecipesPublic: number;
  noRecipesPrivate: number;
  noRecipeVariants: number;
  noShoppingLists: number;
  noMaterialLists: number;
  noUsers: number;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor() {
    this.noEvents = 0;
    this.noIngredients = 0;
    this.noMaterials = 0;
    this.noParticipants = 0;
    this.noRecipesPublic = 0;
    this.noRecipesPrivate = 0;
    this.noRecipeVariants = 0;
    this.noShoppingLists = 0;
    this.noMaterialLists = 0;
    this.noUsers = 0;
  }
  /* =====================================================================
  // Statistikfeld um X erhöhen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static incrementStat({firebase, field, value = 1}: incrementStat) {
    firebase.stats.counter.incrementField({
      uids: [""],
      field: field,
      value: value,
    });
  }
  /* =====================================================================
  // Statistik lesen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static save = async ({firebase, stats, authUser}: Save) => {
    await firebase.stats.counter
      .set<Stats>({uids: [], value: stats, authUser: authUser})
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  /* =====================================================================
  // Statistik lesen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getStats = async (firebase: Firebase) => {
    const stats: Kpi[] = [];

    await firebase.stats.counter
      .read<Stats>({})
      .then((result) => {
        Object.keys(result).forEach((key) =>
          stats.push({
            id: key as StatsField,
            value: result[key as StatsField],
            caption: Stats.getCaptionFromField(key as StatsField) as string,
          })
        );
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return stats;
  };
  /* =====================================================================
  // Texte zu ID holen
  // ===================================================================== */
  static getCaptionFromField = (field: StatsField) => {
    switch (field) {
      case StatsField.noUsers:
        return TEXT_HOME_STATS_CAPTIONS.USERS;
      case StatsField.noEvents:
        return TEXT_HOME_STATS_CAPTIONS.EVENTS;
      case StatsField.noIngredients:
        return TEXT_HOME_STATS_CAPTIONS.INGREDIENTS;
      case StatsField.noRecipesPublic:
        return TEXT_HOME_STATS_CAPTIONS.RECIPES_PUBLIC;
      case StatsField.noRecipesPrivate:
        return TEXT_HOME_STATS_CAPTIONS.RECIPES_PRIVATE;
      case StatsField.noShoppingLists:
        return TEXT_HOME_STATS_CAPTIONS.SHOPPING_LISTS;
      case StatsField.noParticipants:
        return TEXT_HOME_STATS_CAPTIONS.PARTICIPANTS;
      case StatsField.noMaterials:
        return TEXT_HOME_STATS_CAPTIONS.MATERIALS;
      case StatsField.noRecipeVariants:
        return TEXT_HOME_STATS_CAPTIONS.RECIPES_VARIANTS;
      case StatsField.noMaterialLists:
        return TEXT_HOME_STATS_CAPTIONS.MATERIALLISTS;
      default:
        return "";
    }
  };
  /* =====================================================================
  // Statistik Verwendete Rezepte in Menüplan
  // ===================================================================== */
  // Holt die Statistik, welches Rezept wie oft in einem Menüplan ein-
  // geplant wurde. Die Statistik, wird jede Nacht aktualisert mit den Menü-
  // plänen, die gestern den letzten Tag ihrere Einplanung hatten.
  static getRecipeInMenuplanStats = async (firebase: Firebase) => {
    firebase.stats.recipesInMenuplan
      .read({uids: []})
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  /* =====================================================================
  // Statistik anzahl erstellte Varianten eines Originalrezeptes
  // ===================================================================== */
  // Holt die Statistik, welches von welchem Rezept wie oft eine Variante
  // erstellt wurde.
  static getRecipeVariants = async (firebase: Firebase) => {
    firebase.stats.recipeVariants
      .read({uids: []})
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  /* =====================================================================
  // Zähler für Anzahl Variante pro Rezept hochzählen
  // ===================================================================== */
  // Holt die Statistik, welches von welchem Rezept wie oft eine Variante
  // erstellt wurde.
  static incrementRecipeVariantCounter = async ({
    firebase,
    recipeUid,
    value,
  }: IncrementRecipeVariantCounter) => {
    firebase.stats.recipeVariants.incrementField({
      uids: [""],
      field: recipeUid,
      value: value,
    });
  };
}
