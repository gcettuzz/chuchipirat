import * as TEXT from "../../constants/text";
export const STATS_FIELDS = {
  USERS: "noUsers",
  EVENTS: "noEvents",
  INGREDIENTS: "noIngredients",
  RECIPES: "noRecipes",
  SHOPPING_LIST: "noShoppingLists",
  PARTICIPANTS: "noParticipants",
};

export default class Stats {
  /* =====================================================================
  // Statistikfeld um X erhöhen
  // ===================================================================== */
  static incrementStat({ firebase, field, value = 1 }) {
    const statsDoc = firebase.stats();

    statsDoc.update({
      [field]: firebase.fieldValue.increment(value),
    });
  }
  /* =====================================================================
  // Statistik lesen
  // ===================================================================== */
  static getStats = async (firebase) => {
    const statsDoc = firebase.stats();
    const stats = [];

    await statsDoc
      .get()
      .then((snapshot) => {
        for (let prop in snapshot.data()) {
          let kpi = {
            id: prop,
            value: snapshot.data()[prop],
            caption: Stats.getCaptionFromField(prop),
          };
          stats.push(kpi);
        }
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
  static getCaptionFromField = (field) => {
    switch (field) {
      case STATS_FIELDS.USERS:
        return TEXT.HOME_STATS_CAPTIONS.USERS;
      case STATS_FIELDS.EVENTS:
        return TEXT.HOME_STATS_CAPTIONS.EVENTS;
      case STATS_FIELDS.INGREDIENTS:
        return TEXT.HOME_STATS_CAPTIONS.INGREDIENTS;
      case STATS_FIELDS.RECIPES:
        return TEXT.HOME_STATS_CAPTIONS.RECIPES;
      case STATS_FIELDS.SHOPPING_LIST:
        return TEXT.HOME_STATS_CAPTIONS.SHOPPING_LISTS;
      case STATS_FIELDS.PARTICIPANTS:
        return TEXT.HOME_STATS_CAPTIONS.PARTICIPANTS;
      default:
        return "?";
    }
  };
}
