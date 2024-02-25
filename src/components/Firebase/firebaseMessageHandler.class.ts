import {AuthMessages, General} from "../../constants/firebaseMessages";
import {FIREBASE_MESSAGES as TEXT_FIREBASE_MESSAGES} from "../../constants/text";

// Meldungen auf Deutsch umschreieben
// Firebase -> gibt nur englische Meldungen zurück
class FirebaseMessageHandler {
  static translateMessage(error) {
    switch (error.code) {
      case AuthMessages.WEAK_PASSWORD:
      case AuthMessages.INVALID_EMAIL:
      case AuthMessages.EMAIL_ALREADY_IN_USE:
      case AuthMessages.USER_DISABLED:
      case AuthMessages.USER_NOT_FOUND:
      case AuthMessages.WRONG_PASSWORD:
      case AuthMessages.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL:
      case AuthMessages.INVALID_ACTION_CODE:
      case AuthMessages.REQUIRES_RECENT_LOGIN:
      case AuthMessages.TOO_MANY_REQUESTS:
      case General.PERMISSION_DENIED:
      case General.UNAVAILABLE:
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
