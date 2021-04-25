import * as DEFAULT_VALUES from "../../constants/defaultValues";
import * as TEXT from "../../constants/text";

import { FEED_TITLE, FEED_TEXT } from "../../constants/text";

export const FEED_TYPE = {
  USER_CREATED: "userCreated",
  RECIPE_CREATED: "recipeCreated",
  EVENT_CREATED: "eventCreated",
  EVENT_COOK_ADDED: "eventCookAdded",
  MENUPLAN_CREATED: "menuplanCreated",
  SHOPPINGLIST_CREATED: "shoppingListCreated",
};

export default class Feed {
  /* ====================================================================
  // Feed Eintrag erzeugen
  / ==================================================================== */
  static createFeedEntry({
    firebase,
    authUser,
    feedType,
    objectUid,
    text = "",
  }) {
    const feedDoc = firebase.feeds().doc();
    feedDoc.set({
      createdAt: firebase.timestamp.fromDate(new Date()),
      userUid: authUser.uid,
      displayName: authUser.publicProfile.displayName,
      pictureSrc: authUser.publicProfile.pictureSrc,
      title: Feed.getTitle(feedType),
      text: Feed.getText(feedType, text),
      feedType: feedType,
      objectUid: objectUid,
    });
  }
  /* =====================================================================
  // Neuste X Feed holen
  // ===================================================================== */
  static getNewestFeeds = async (
    firebase,
    limitTo = DEFAULT_VALUES.FEEDS_DISPLAY
  ) => {
    let feeds = [];
    let feed = {};

    const feedsRef = firebase.feeds();

    const snapshot = await feedsRef
      .orderBy("createdAt", "desc")
      .limit(limitTo)
      .get()
      .catch((error) => {
        console.error(error);
        throw error;
      });

    snapshot.forEach((obj) => {
      feed = obj.data();
      feed.uid = obj.id;
      // Timestamp umwandeln
      feed.createdAt = feed.createdAt.toDate();
      feeds.push(feed);
    });

    return feeds;
  };
  /* =====================================================================
  // Anhand des Feed Typs den Titel bestimmen
  // ===================================================================== */
  static getTitle(feedType) {
    switch (feedType) {
      case FEED_TYPE.USER_CREATED:
        return FEED_TITLE.USER_CREATED;
      case FEED_TYPE.RECIPE_CREATED:
        return FEED_TITLE.RECIPE_CREATED;
      case FEED_TYPE.EVENT_CREATED:
        return FEED_TITLE.EVENT_CREATED;
      case FEED_TYPE.EVENT_COOK_ADDED:
        return FEED_TITLE.EVENT_COOK_ADDED;
      case FEED_TYPE.SHOPPINGLIST_CREATED:
        return FEED_TITLE.SHOPPINGLIST_CREATED;
      case FEED_TYPE.MENUPLAN_CREATED:
        return FEED_TITLE.MENUPLAN_CREATED;
      default:
        return "?";
    }
  }
  /* =====================================================================
  // Anhand des Feed Typs den Text bestimmen
  // ===================================================================== */
  static getText(feedType, text) {
    switch (feedType) {
      case FEED_TYPE.USER_CREATED:
        return FEED_TEXT.USER_CREATED;
      // return "ist neu mit an Bord.";
      case FEED_TYPE.RECIPE_CREATED:
        return FEED_TEXT.RECIPE_CREATED(text);
      // return `hat das Rezept «${text}» erfasst.`;
      case FEED_TYPE.EVENT_CREATED:
        return FEED_TEXT.EVENT_CREATED(text);
      // return `hat den Anlass «${text}» erstellt.`;
      case FEED_TYPE.EVENT_COOK_ADDED:
        return FEED_TEXT.EVENT_COOK_ADDED(text);
      // return `wurde in das Team «${text}» aufgenommen.`;
      case FEED_TYPE.MENUPLAN_CREATED:
        return FEED_TEXT.MENUPLAN_CREATED(text);
      // return `Plant gerade den ${text}`;
      case FEED_TYPE.SHOPPINGLIST_CREATED:
        return FEED_TEXT.SHOPPINGLIST_CREATED(text);
      // return `kauft ${text} ein.`;
      default:
        return "?";
    }
  }
  /* =====================================================================
// Cloud Function deleteFeeds aufrufen
// ===================================================================== */
  static callCloudFunctionDeleteFeeds = ({ firebase, daysOffset }) => {
    if (!firebase || !daysOffset) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }
    let deleteFeeds = firebase.functions.httpsCallable("deleteFeeds");
    deleteFeeds({ daysoffset: daysOffset })
      .then((result) => {
        // Read result of the Cloud Function.
        return result.data.text;
      })
      .catch((error) => {
        console.error(error);
        throw error;
        // Getting the Error details.
        // var code = error.code;
        // var message = error.message;
        // var details = error.details;
        // ...
      });
  };
}
