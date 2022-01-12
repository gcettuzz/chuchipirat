import * as TEXT from "../../constants/text";
import Firebase from "../Firebase/firebase.class";

export enum StatsField {
  noUsers = "noUsers",
  noEvents = "noEvents",
  noIngredients = "noIngredients",
  noRecipes = "noRecipes",
  noShoppingLists = "noShoppingLists",
  noParticipants = "noParticipants",
}

interface incrementStat {
  firebase: Firebase;
  field: StatsField;
  value: number;
}
interface kpi {
  id: StatsField;
  value: number;
  caption: string;
}

export default class Stats {
  noEvents: number;
  noIngredients: number;
  noParticipants: number;
  noRecipes: number;
  noShoppingLists: number;
  noUsers: number;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor() {
    this.noEvents = 0;
    this.noIngredients = 0;
    this.noParticipants = 0;
    this.noRecipes = 0;
    this.noShoppingLists = 0;
    this.noUsers = 0;
  }
  /* =====================================================================
  // Statistikfeld um X erhöhen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static incrementStat({ firebase, field, value = 1 }: incrementStat) {
    firebase.stats.incrementField({ uids: [""], field: field, value: value });
  }
  /* =====================================================================
  // Statistik lesen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getStats = async (firebase: Firebase) => {
    const stats: kpi[] = [];

    await firebase.stats
      .read<Stats>({})
      .then((result) => {
        Object.keys(result).forEach((key) =>
          stats.push({
            id: key as StatsField,
            value: result[key as StatsField],
            caption: Stats.getCaptionFromField(key as StatsField),
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
      case StatsField.noRecipes:
        return TEXT.HOME_STATS_CAPTIONS.RECIPES;
      case StatsField.noShoppingLists:
        return TEXT.HOME_STATS_CAPTIONS.SHOPPING_LISTS;
      case StatsField.noParticipants:
        return TEXT.HOME_STATS_CAPTIONS.PARTICIPANTS;
    }
  };
}
