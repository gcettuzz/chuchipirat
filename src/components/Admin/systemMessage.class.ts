import {Color} from "@material-ui/lab";
import Firebase from "../Firebase/firebase.class";
import AuthUser from "../Firebase/Authentication/authUser.class";

interface Save {
  firebase: Firebase;
  authUser: AuthUser;
  systemMessage: SystemMessage;
}

interface GetSystemMessage {
  firebase: Firebase;
  mustBeValid: boolean;
}

// ===================================================================== */
/**
 * Mail versenden
 * Mail über die Cloud-Fx versenden
 * @param param0 - Objekt
 */
export class SystemMessage {
  title: string;
  text: string;
  type: Color;
  validTo: Date;

  // ===================================================================== */
  /**
   * Constructor
   */
  constructor() {
    this.title = "";
    this.text = "";
    this.type = "info";
    this.validTo = new Date();
  }
  /* ====================================================================
    // Systemmeldung speichern
    / ==================================================================== */
  /**
   * Systemmeldung speichern
   * @param Object - Objekt mit Firebase Referenz und Werte zur Systemmeldung
   */
  static save = async ({firebase, systemMessage, authUser}: Save) => {
    // Zeit auf 23:59:59 stellen, damit es bis zum Schluss dieses Tages
    // gültig ist.

    if (!(systemMessage.validTo instanceof Date)) {
      // z.T. kommt das Datum als String
      systemMessage.validTo = new Date(systemMessage.validTo);
    }

    systemMessage.validTo.setHours(23, 59, 59, 0);

    firebase.configuration.systemMessage
      .set({
        uids: [],
        value: systemMessage,
        authUser: authUser,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  /* ====================================================================
    // Systemmeldung holen
    / ==================================================================== */
  /**
   * Systemmeldung lesen
   * @param Object - Objekt mit Firebase Referenz und angaben ob nur aktuell
   *                 gültige Meldungen von intersse sind.
   */
  static getSystemMessage = async ({
    firebase,
    mustBeValid = true,
  }: GetSystemMessage) => {
    let systemMessage = new SystemMessage();

    firebase.configuration.systemMessage;

    await firebase.configuration.systemMessage
      .read<SystemMessage>({uids: []})
      .then((result) => {
        systemMessage = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    const today = new Date();
    today.setHours(23, 59, 59, 0);

    if (mustBeValid && systemMessage.validTo < today) {
      return null;
    } else {
      return systemMessage;
    }
  };
}

export default SystemMessage;
