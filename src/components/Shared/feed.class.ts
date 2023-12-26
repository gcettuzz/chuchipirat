import * as DEFAULT_VALUES from "../../constants/defaultValues";
import {ChangeRecord} from "./global.interface";
import Firebase from "../Firebase";
import {AuthUser} from "../Firebase/Authentication/authUser.class";
import Role from "../../constants/roles";

import {
  SortOrder,
  Operator,
  Where,
} from "../Firebase/Db/firebase.db.super.class";
import {FEED_TITLE, FEED_TEXT} from "../../constants/text";

export enum FeedType {
  userCreated = "userCreated",
  recipeCreated = "recipeCreated",
  recipePublished = "recipePublished",
  eventCreated = "eventCreated",
  eventCookAdded = "eventCookAdded",
  menuplanCreated = "menuplanCreated",
  shoppingListCreated = "shoppingListCreated",
  recipeRated = "recipeRated",
  materialCreated = "materialCreated",
  productCreated = "productCreated",
  none = "none",
}

//TS_MIGRATION:
// zu löschen sobal Typescript Migration durch
// export const FEED_TYPE = {
//   USER_CREATED: "userCreated",
//   RECIPE_CREATED: "recipeCreated",
//   EVENT_CREATED: "eventCreated",
//   EVENT_COOK_ADDED: "eventCookAdded",
//   MENUPLAN_CREATED: "menuplanCreated",
//   SHOPPINGLIST_CREATED: "shoppingListCreated",
// };
interface CreateFeedEntry {
  firebase: Firebase;
  authUser: AuthUser;
  feedType: FeedType;
  feedVisibility: Role;
  objectUid: string;
  objectName: string;
  objectPictureSrc?: string;
  textElements?: string[];
  objectUserUid?: string;
  objectUserDisplayName?: string;
  objectUserPictureSrc?: string;
}
interface GetNewestFeeds {
  firebase: Firebase;
  limitTo: number;
  visibility: Role;
  feedType?: FeedType;
}
// interface GetNewestFeedsOfType {
//   firebase: Firebase;
//   limitTo: number;
//   feedType?: FeedType;
//   visibility: Role;
// }
interface CallCloudFunctionDeleteFeeds {
  firebase: Firebase;
  daysOffset: number;
}
// ==================================================================== */
/**
 * Feed Klasse
 * Regelt und Strukturiert den Feed -> verbindung zur DB
 * @param uid - UID des Feedeintrag
 * @param title - Titel des Feedeintrages
 * @param text - Text im Feedeintrag
 * @param type - Feed Typ
 * @param visibility - Sichtbarkeit für User (anhand der Rolle)
 * @param sourceObject - Objekt, welches den Feedeintrag auslöst (Rezept, Event, User, etc)
 * @param user - Informationen zum User, der im Feedeintrag angezeigt werden (muss nicht zwingend)
 *               mit der Person, die den Eintrag anlegt, übereinstmmen
 * @param created - Informationen zur Anlage des Feedeintrag (Datum, User)
 */
export default class Feed {
  uid: string;
  title: string;
  text: string;
  type: FeedType;
  visibility: Role;
  sourceObject: {uid: string; name: string; pictureSrc: string};
  user: {uid: string; displayName: string; pictureSrc: string};
  created: ChangeRecord;

  // createdAt: Date;
  // createdFromUid: string;
  // createdFromDisplayName: string;
  // objectUserUid: string;
  // objectUserDisplayName: string;
  // objectUserPictureSrc: string;
  // title: string;
  // text: string;
  // feedType: FeedType;
  // objectUid: string;
  // objectName: string;
  // objectPictureSrc: string;

  /* ====================================================================
  // Constructor
  / ==================================================================== */
  constructor() {
    this.uid = "";
    this.title = "";
    this.text = "";
    this.type = FeedType.none;
    this.visibility = Role.basic;
    this.sourceObject = {uid: "", name: "", pictureSrc: ""};
    this.user = {uid: "", displayName: "", pictureSrc: ""};
    this.created = {date: new Date(0), fromUid: "", fromDisplayName: ""};

    // this.createdAt = new Date();
    // this.createdFromUid = "";
    // this.createdFromDisplayName = "";
    // this.objectUserUid = "";
    // this.objectUserDisplayName = "";
    // this.objectUserPictureSrc = "";
    // this.title = "";
    // this.text = "";
    // this.objectUid = "";
    // this.objectName = "";
    // this.objectPictureSrc = "";
  }

  /* ====================================================================
  // Feed Eintrag erzeugen
  / ==================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  /**
   * Schnittstelle für createFeedEntry (im Objektformat!)
   *
   * @param firebase - Object zur DB
   * @param authUser AuthUser -  Die Person die den Feedeintrag erstellt;
   * @param feedType Typ des Feeds (siehe enum FeedType);
   * @param objectUid UID des Objektes, dass zum Feed gehört;
   * @param objectName optional Name des Objektes, dass zum Feed gehört
   * @param objectPictureSrc optional Bildquelle zum Objekt, dass zum Feed gehört
   * @param textElements optional Testbausteine (Array), die in den Text eingefügt werden
   * @param objectUserUid optional UID der Person, die im Feed erwähnt wird (nicht AuthUser)
   * @param objectUserDisplayName optional Anzeigename der Person, die im Feed erwähnt wird
   * @param objectUserPictureSrc optional Bildquelle, der Person, die im Feed erwähnt wird.
   */
  static createFeedEntry({
    firebase,
    authUser,
    feedType,
    feedVisibility = Role.basic,
    objectUid,
    objectName,
    objectPictureSrc = "",
    textElements = [""],
    objectUserUid = "",
    objectUserDisplayName = "",
    objectUserPictureSrc = "",
  }: CreateFeedEntry) {
    let feed: Feed = {
      uid: "",
      title: Feed.getTitle(feedType, textElements),
      text: Feed.getText(feedType, textElements),
      type: feedType,
      visibility: feedVisibility,
      sourceObject: {
        uid: objectUid,
        name: objectName,
        pictureSrc: objectPictureSrc,
      },
      user: objectUserUid
        ? {
            uid: objectUserUid,
            displayName: objectUserDisplayName,
            pictureSrc: objectUserPictureSrc,
          }
        : {
            uid: authUser.uid,
            displayName: authUser.publicProfile.displayName,
            pictureSrc: authUser.publicProfile.pictureSrc.normalSize,
          },
      created: {
        date: new Date(),
        fromUid: authUser.uid,
        fromDisplayName: authUser.publicProfile.displayName,
      },
    };
    firebase.feed.create<Feed>({value: feed, authUser: authUser});
  }
  /* =====================================================================
  // Neuste X Feed holen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getNewestFeeds = async ({
    firebase,
    limitTo = DEFAULT_VALUES.FEEDS_DISPLAY,
    visibility = Role.basic,
    feedType,
  }: GetNewestFeeds) => {
    let feeds: Feed[] = [];

    let whereClause = [
      {
        field: "visibility",
        operator: Operator.EQ,
        value: visibility,
      },
    ] as Where[];

    feedType &&
      whereClause.push({
        field: "type",
        operator: Operator.EQ,
        value: feedType,
      });

    await firebase.feed
      .readCollection<Feed>({
        uids: [""],
        orderBy: {field: "created.date", sortOrder: SortOrder.desc},
        where: whereClause,
        limit: limitTo,
      })
      .then((result) => {
        feeds = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return feeds;
    // const feedsRef = firebase.feeds();
    // const snapshot = await feedsRef
    //   .orderBy("createdAt", "desc")
    //   .limit(limitTo)
    //   .get()
    //   .catch((error) => {
    //     console.error(error);
    //     throw error;
    //   });
    // snapshot.forEach((obj) => {
    //   feed = obj.data() as Feed;
    //   feed.uid = obj.id;
    //   // Timestamp umwandeln
    //   feed.createdAt = obj.data().createdAt.toDate();
    //   feeds.push(feed);
    // });
  };
  /* =====================================================================
  // Neuste X Feed eines bestimmten Typs holen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  // static getNewestFeedsOfType = async ({
  //   firebase,
  //   limitTo = DEFAULT_VALUES.FEEDS_DISPLAY,
  //   feedType,
  //   visibility = Role.basic,
  // }: GetNewestFeedsOfType) => {
  //   let feeds: Feed[] = [];

  //   if (!firebase || !visibility) {
  //     throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
  //   }

  //   let whereClause = [
  //     {
  //       field: "visibility",
  //       operator: Operator.EQ,
  //       value: visibility,
  //     },
  //   ] as Where[];

  //   feedType &&
  //     whereClause.push({
  //       field: "type",
  //       operator: Operator.EQ,
  //       value: feedType,
  //     });
  //   console.log(whereClause);
  //   await firebase.feed
  //     .readCollection<Feed>({
  //       uids: [""],
  //       orderBy: { field: "created.date", sortOrder: SortOrder.desc },
  //       where: whereClause,
  //       limit: limitTo,
  //     })
  //     .then((result) => {
  //       console.log(result);
  //       feeds = result;
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       throw error;
  //     });

  //   // const feedsRef = firebase.feeds();
  //   // const snapshot = await feedsRef
  //   //   .orderBy("createdAt", "desc")
  //   //   .where("feedType", "==", feedType)
  //   //   .limit(limitTo)
  //   //   .get()
  //   //   .catch((error) => {
  //   //     console.error(error);
  //   //     throw error;
  //   //   });
  //   // snapshot.forEach((obj) => {
  //   //   feed = obj.data() as Feed;
  //   //   feed.uid = obj.id;
  //   //   // Timestamp umwandeln
  //   //   feed.createdAt = obj.data().createdAt.toDate();
  //   //   feeds.push(feed);
  //   // });
  //   return feeds;
  // };
  // ===================================================================== */
  /**
   * Anhand des Feed Typs den Titel bestimmen
   * @param feedType - Was für eine Art von Feed ist es
   * @param textElement - Textbaustein, der im Titel eingebaut wird
   * @returns Titel des Feedeintrag
   */
  static getTitle(feedType: FeedType, textElement: string[]) {
    switch (feedType) {
      case FeedType.userCreated:
        return FEED_TITLE.USER_CREATED;
      case FeedType.recipeCreated:
        return FEED_TITLE.RECIPE_CREATED;
      case FeedType.recipePublished:
        return FEED_TITLE.RECIPE_PUBLISHED;
      case FeedType.recipeRated:
        return `${FEED_TITLE.RECIPE_RATED} ${textElement[0]}`;
      case FeedType.eventCreated:
        return FEED_TITLE.EVENT_CREATED;
      case FeedType.eventCookAdded:
        return FEED_TITLE.EVENT_COOK_ADDED;
      case FeedType.shoppingListCreated:
        return FEED_TITLE.SHOPPINGLIST_CREATED;
      case FeedType.menuplanCreated:
        return FEED_TITLE.MENUPLAN_CREATED;
      default:
        return "?";
    }
  }
  // ===================================================================== */
  /**
   * Anhand des Feed Typs den Text bestimmen
   * @param feedType - Was für eine Art von Feed ist es
   * @param textElement - Textbaustein, der im Titel eingebaut wird
   * @returns zusammengebauter Text für den Feedeintrag
   */
  static getText(feedType: FeedType, textElements: string[]) {
    switch (feedType) {
      case FeedType.userCreated:
        return FEED_TEXT.USER_CREATED;
      // return "ist neu mit an Bord.";
      case FeedType.recipeCreated:
        return FEED_TEXT.RECIPE_CREATED(textElements);
      case FeedType.recipePublished:
        return FEED_TEXT.RECIPE_PUBLISHED(textElements);
      // return `hat das Rezept «${text}» erfasst.`;
      case FeedType.recipeRated:
        return FEED_TEXT.RECIPE_RATED(textElements);
      case FeedType.eventCreated:
        return FEED_TEXT.EVENT_CREATED(textElements);
      // return `hat den Anlass «${text}» erstellt.`;
      case FeedType.eventCookAdded:
        return FEED_TEXT.EVENT_COOK_ADDED(textElements);
      // return `wurde in das Team «${text}» aufgenommen.`;
      case FeedType.menuplanCreated:
        return FEED_TEXT.MENUPLAN_CREATED(textElements);
      // return `Plant gerade den ${text}`;
      case FeedType.shoppingListCreated:
        return FEED_TEXT.SHOPPINGLIST_CREATED(textElements);
      // return `kauft ${text} ein.`;
      default:
        return "?";
    }
  }
  /* =====================================================================
  // Cloud Function deleteFeeds aufrufen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static callCloudFunctionDeleteFeeds = ({
    firebase,
    daysOffset,
  }: CallCloudFunctionDeleteFeeds) => {
    //FIXME:
    // if (!firebase || !daysOffset) {
    //   throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    // }
    // let deleteFeeds = firebase.functions.httpsCallable("deleteFeeds");
    // deleteFeeds({ daysoffset: daysOffset })
    //   .then((result) => {
    //     // Read result of the Cloud Function.
    //     return result.data.text;
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     throw error;
    //     // Getting the Error details.
    //     // var code = error.code;
    //     // var message = error.message;
    //     // var details = error.details;
    //     // ...
    //   });
  };
}
// altes JS Script
// import * as DEFAULT_VALUES from "../../constants/defaultValues";
// import * as TEXT from "../../constants/text";

// import { FEED_TITLE, FEED_TEXT } from "../../constants/text";

// export const FEED_TYPE = {
//   USER_CREATED: "userCreated",
//   RECIPE_CREATED: "recipeCreated",
//   EVENT_CREATED: "eventCreated",
//   EVENT_COOK_ADDED: "eventCookAdded",
//   MENUPLAN_CREATED: "menuplanCreated",
//   SHOPPINGLIST_CREATED: "shoppingListCreated",
// };

// export default class Feed {
//   /* ====================================================================
//   // Feed Eintrag erzeugen
//   / ==================================================================== */
//   static createFeedEntry({
//     firebase,
//     authUser,
//     feedType,
//     objectUid,
//     text = "",
//     objectName = "",
//     objectPictureSrc = "",
//   }) {
//     const feedDoc = firebase.feeds().doc();
//     feedDoc.set({
//       createdAt: firebase.timestamp.fromDate(new Date()),
//       userUid: authUser.uid,
//       displayName: authUser.publicProfile.displayName,
//       pictureSrc: authUser.publicProfile.pictureSrc,
//       title: Feed.getTitle(feedType),
//       text: Feed.getText(feedType, text),
//       feedType: feedType,
//       objectUid: objectUid,
//       objectName: objectName,
//       objectPictureSrc: objectPictureSrc,
//     });
//   }
//   /* =====================================================================
//   // Neuste X Feed holen
//   // ===================================================================== */
//   static getNewestFeeds = async ({
//     firebase,
//     limitTo = DEFAULT_VALUES.FEEDS_DISPLAY,
//   }) => {
//     let feeds = [];
//     let feed = {};

//     const feedsRef = firebase.feeds();

//     const snapshot = await feedsRef
//       .orderBy("createdAt", "desc")
//       .limit(limitTo)
//       .get()
//       .catch((error) => {
//         console.error(error);
//         throw error;
//       });

//     snapshot.forEach((obj) => {
//       feed = obj.data();
//       feed.uid = obj.id;
//       // Timestamp umwandeln
//       feed.createdAt = feed.createdAt.toDate();
//       feeds.push(feed);
//     });

//     return feeds;
//   };
//   /* =====================================================================
//   // Neuste X Feed eines bestimmten Typs holen
//   // ===================================================================== */
//   static getNewestFeedsOfType = async (
//     firebase,
//     limitTo = DEFAULT_VALUES.FEEDS_DISPLAY,
//     feedType
//   ) => {
//     let feeds = [];
//     let feed = {};

//     if (!firebase || !feedType) {
//       throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
//     }
//     const feedsRef = firebase.feeds();
//     const snapshot = await feedsRef
//       .orderBy("createdAt", "desc")
//       .where("feedType", "==", feedType)
//       .limit(limitTo)
//       .get()
//       .catch((error) => {
//         console.error(error);
//         throw error;
//       });

//     snapshot.forEach((obj) => {
//       feed = obj.data();
//       feed.uid = obj.id;
//       // Timestamp umwandeln
//       feed.createdAt = feed.createdAt.toDate();
//       feeds.push(feed);
//     });

//     return feeds;
//   };
//   /* =====================================================================
//   // Anhand des Feed Typs den Titel bestimmen
//   // ===================================================================== */
//   static getTitle(feedType) {
//     switch (feedType) {
//       case FEED_TYPE.USER_CREATED:
//         return FEED_TITLE.USER_CREATED;
//       case FEED_TYPE.RECIPE_CREATED:
//         return FEED_TITLE.RECIPE_CREATED;
//       case FEED_TYPE.EVENT_CREATED:
//         return FEED_TITLE.EVENT_CREATED;
//       case FEED_TYPE.EVENT_COOK_ADDED:
//         return FEED_TITLE.EVENT_COOK_ADDED;
//       case FEED_TYPE.SHOPPINGLIST_CREATED:
//         return FEED_TITLE.SHOPPINGLIST_CREATED;
//       case FEED_TYPE.MENUPLAN_CREATED:
//         return FEED_TITLE.MENUPLAN_CREATED;
//       default:
//         return "?";
//     }
//   }
//   /* =====================================================================
//   // Anhand des Feed Typs den Text bestimmen
//   // ===================================================================== */
//   static getText(feedType, text) {
//     switch (feedType) {
//       case FEED_TYPE.USER_CREATED:
//         return FEED_TEXT.USER_CREATED;
//       // return "ist neu mit an Bord.";
//       case FEED_TYPE.RECIPE_CREATED:
//         return FEED_TEXT.RECIPE_CREATED(text);
//       // return `hat das Rezept «${text}» erfasst.`;
//       case FEED_TYPE.EVENT_CREATED:
//         return FEED_TEXT.EVENT_CREATED(text);
//       // return `hat den Anlass «${text}» erstellt.`;
//       case FEED_TYPE.EVENT_COOK_ADDED:
//         return FEED_TEXT.EVENT_COOK_ADDED(text);
//       // return `wurde in das Team «${text}» aufgenommen.`;
//       case FEED_TYPE.MENUPLAN_CREATED:
//         return FEED_TEXT.MENUPLAN_CREATED(text);
//       // return `Plant gerade den ${text}`;
//       case FEED_TYPE.SHOPPINGLIST_CREATED:
//         return FEED_TEXT.SHOPPINGLIST_CREATED(text);
//       // return `kauft ${text} ein.`;
//       default:
//         return "?";
//     }
//   }
//   /* =====================================================================
// // Cloud Function deleteFeeds aufrufen
// // ===================================================================== */
//   static deleteFeeds = async ({
//     firebase,
//     daysOffset,
//     authUser,
//     traceListener,
//   }) => {
//     if (!firebase || !daysOffset) {
//       throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
//     }
//     let listener;
//     let docRef = firebase.cloudFunctions_feed_Delete().doc();
//     await docRef
//       .set({
//         daysOffset: parseInt(daysOffset),
//         user: {
//           uid: authUser.uid,
//           displayName: authUser.publicProfile.displayName,
//         },
//         date: firebase.timestamp.fromDate(new Date()),
//       })
//       .then(async () => {
//         await firebase.delay(1);
//       })
//       .then(() => {
//         const unsubscribe = docRef.onSnapshot((snapshot) => {
//           traceListener(snapshot.data());
//           if (snapshot.data()?.done) {
//             // Wenn das Feld DONE vorhanden ist, ist die Cloud-Function durch
//             unsubscribe();
//           }
//         });
//       })
//       .catch((error) => {
//         throw error;
//       });
//     console.log(listener);
//     return listener;
//   };
//   /* =====================================================================
//   // Einzelne Feeds löschen
//   // ===================================================================== */
//   static deleteFeed = async ({ firebase, feedUid }) => {
//     if (!firebase || !feedUid) {
//       throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
//     }
//     let docCollection = firebase.feeds();

//     await docCollection
//       .doc(feedUid)
//       .delete()
//       .catch((error) => {
//         throw error;
//       });
//   };
// }
