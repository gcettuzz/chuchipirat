import * as FIREBASE_MSG from "../../constants/firebaseMessages";
import { FIREBASE_MESSAGES as TEXT_FIREBASE_MESSAGES } from "../../constants/text";

// Meldungen auf Deutsch umschreieben
// Firebase -> gibt nur englische Meldungen zurück
class FirebaseMessageHandler {
  static translateMessage(error) {
    switch (error.code) {
      case FIREBASE_MSG.AUTH.WEAK_PASSWORD:
      case FIREBASE_MSG.AUTH.INVALID_EMAIL:
      case FIREBASE_MSG.AUTH.EMAIL_ALREADY_IN_USE:
      case FIREBASE_MSG.AUTH.USER_DISABLED:
      case FIREBASE_MSG.AUTH.USER_NOT_FOUND:
      case FIREBASE_MSG.AUTH.WRONG_PASSWORD:
      case FIREBASE_MSG.AUTH.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL:
      case FIREBASE_MSG.GENERAL.PERMISSION_DENIED:
      case FIREBASE_MSG.AUTH.INVALID_ACTION_CODE:
      case FIREBASE_MSG.AUTH.REQUIRES_RECENT_LOGIN:
      case FIREBASE_MSG.AUTH.TOO_MANY_REQUESTS:
      case FIREBASE_MSG.GENERAL.UNAVAILABLE:
        return TEXT_FIREBASE_MESSAGES[
          FirebaseMessageHandler.getTextCode(error.code)
        ];
      default:
        return error.message;
    }
  }
  /* =====================================================================
  // Firebase Code in Code für Textbausteine ändern
  // ===================================================================== */
  static getTextCode(code) {
    // Code in Firebase ist mit "-" und in Kleinbuchstaben
    // die Textbausteine (Konstanten) sind mit "_" und in Grossbuchstaben
    let textCode = code.toUpperCase();
    textCode = textCode.replaceAll("-", "_");
    if (textCode.search("/") > 0) {
      textCode = textCode.split("/")[1];
    }
    return textCode;
  }
}

export default FirebaseMessageHandler;
