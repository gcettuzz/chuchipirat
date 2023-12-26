// Default Werte für jegliche Parameter

import Utils from "../components/Shared/utils.class";

import {
  WITHOUT_INTOLERANCES as TEXT_WITHOUT_INTOLERANCES,
  LACTOSE_INTOLERANCE as TEXT_LACTOSE_INTOLERANCE,
  GLUTEN_INTOLERANCE as TEXT_GLUTEN_INTOLERANCE,
  MEAT as TEXT_MEAT,
  VEGETARIAN as TEXT_VEGETARIAN,
} from "../constants/text";

export const FEEDS_DISPLAY = 5;
export const RECIPE_DISPLAY = 3;
export const COMMENT_DISPLAY = 3;
export const RECIPES_SEARCH = 12;

export const EVENT_PLACEHOLDER_PICTURE =
  "https://firebasestorage.googleapis.com/v0/b/chuchipirat-a99de.appspot.com/o/placeholder.png?alt=media&token=333b62f9-db26-4bdb-96ba-8f6bf95c8d1e";

// ===================================================================== */
/**
 * Placeholder für Card holen
 * @returns Bild-URL
 */
export const CARD_PLACEHOLDER_PICTURE = () => {
  if (Utils.isDevelopmentEnviroment()) {
    return "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/defaults%2Fplaceholder.png?alt=media&token=fe2c82ce-5e98-41be-ae98-87a1af3753a3";
  } else {
    return "https://firebasestorage.googleapis.com/v0/b/chuchipirat.appspot.com/o/defaults%2Fplaceholder.png?alt=media&token=c5532518-f7d1-4c76-b9ee-f4f93716dd27";
  }
};

export const MENUPLAN_MEALS = [
  {name: "Zmorgen", uid: ""},
  {name: "Zmittag", uid: ""},
  {name: "Znacht", uid: ""},
];

export const MENUPLAN_NO_OF_COLUMS_MOBILE = 1;
export const MENUPLAN_NO_OF_COLUMS_NORMAL = 3;
export const MENUPLAN_NO_OF_COLUMS_LARGE = 5;
export const MENUPLAN_NO_OF_COLUMS_X_LARGE = 11;

export const MENUPLAN_NO_OF_COLUMS_PRINT = 4;

export const HELPCENTER_URL = "https://help.chuchipirat.ch/";

export const MAILADDRESS = "hallo@chuchipirat.ch";

export const INSTAGRAM_URL = "https://www.instagram.com/chuchipirat/";

export const SESSION_STORAGE_VALIDITY_DURATION = 3600;

export const INTOLERANCES = [
  TEXT_WITHOUT_INTOLERANCES,
  TEXT_LACTOSE_INTOLERANCE,
  TEXT_GLUTEN_INTOLERANCE,
];

export const DIETS = [TEXT_MEAT, TEXT_VEGETARIAN];

//TS_MIGRATION: Alte Werte aus js File
// "use strict";
// // Default Werte für jegliche Parameter
// exports.__esModule = true;
// exports.FEEDS_DISPLAY = 5;
// exports.RECIPE_DISPLAY = 3;
// exports.COMMENT_DISPLAY = 3;
// exports.RECIPES_SEARCH = 12;
// exports.EVENT_PLACEHOLDER_PICTURE = "https://firebasestorage.googleapis.com/v0/b/chuchipirat-a99de.appspot.com/o/placeholder.png?alt=media&token=333b62f9-db26-4bdb-96ba-8f6bf95c8d1e";
// exports.MENUPLAN_MEALS = [
//     { pos: 1, name: "Zmorgen" },
//     { pos: 2, name: "Zmittag" },
//     { pos: 3, name: "Znacht" },
// ];
// exports.MENUPLAN_NO_OF_COLUMS_MOBILE = 1;
// exports.MENUPLAN_NO_OF_COLUMS_NORMAL = 3;
// exports.MENUPLAN_NO_OF_COLUMS_LARGE = 5;
// exports.MENUPLAN_NO_OF_COLUMS_X_LARGE = 11;
// exports.MENUPLAN_NO_OF_COLUMS_PRINT = 4;
// exports.HELPCENTER_URL = "https://chuchipirat.wordpress.com/";
// exports.MAILADRESS = "hallo@chuchipirat.ch";
