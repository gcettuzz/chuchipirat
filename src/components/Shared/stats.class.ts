import * as TEXT from "../../constants/text";
import Firebase from "../Firebase/firebase.class";

// TS_MIGRATION:
export const STATS_FIELDS = {
  // USERS: "noUsers",
  // EVENTS: "noEvents",
  // INGREDIENTS: "noIngredients",
  // RECIPES: "noRecipes",
  SHOPPING_LIST: "noShoppingLists",
  // PARTICIPANTS: "noParticipants",
};

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
export interface Kpi {
  id: StatsField;
  value: number;
  caption: string;
}

export default class Stats {
  noEvents: number;
  noIngredients: number;
  noParticipants: number;
  noRecipesPublic: number;
  noRecipesPrivate: number;
  noShoppingLists: number;
  noUsers: number;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor() {
    this.noEvents = 0;
    this.noIngredients = 0;
    this.noParticipants = 0;
    this.noRecipesPublic = 0;
    this.noRecipesPrivate = 0;
    this.noShoppingLists = 0;
    this.noUsers = 0;
  }
  /* =====================================================================
  // Statistikfeld um X erhöhen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */

  static incrementStat({firebase, field, value = 1}: incrementStat) {
    firebase.stats.incrementField({uids: [""], field: field, value: value});
  }
  /* =====================================================================
  // Statistik lesen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getStats = async (firebase: Firebase) => {
    const stats: Kpi[] = [];

    await firebase.stats
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
        return TEXT.HOME_STATS_CAPTIONS.USERS;
      case StatsField.noEvents:
        return TEXT.HOME_STATS_CAPTIONS.EVENTS;
      case StatsField.noIngredients:
        return TEXT.HOME_STATS_CAPTIONS.INGREDIENTS;
      case StatsField.noRecipesPublic:
        return TEXT.HOME_STATS_CAPTIONS.RECIPES_PUBLIC;
      case StatsField.noRecipesPrivate:
        return TEXT.HOME_STATS_CAPTIONS.RECIPES_PRIVATE;
      case StatsField.noShoppingLists:
        return TEXT.HOME_STATS_CAPTIONS.SHOPPING_LISTS;
      case StatsField.noParticipants:
        return TEXT.HOME_STATS_CAPTIONS.PARTICIPANTS;
      case StatsField.noMaterials:
        return TEXT.HOME_STATS_CAPTIONS.MATERIALS;
      case StatsField.noRecipeVariants:
        return TEXT.HOME_STATS_CAPTIONS.RECIPES_VARIANTS;
    }
  };
}
