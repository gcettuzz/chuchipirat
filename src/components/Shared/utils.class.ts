import AuthUser from "../Firebase/Authentication/authUser.class";
import {SortOrder} from "../Firebase/Db/firebase.db.super.class";
import {ChangeRecord} from "./global.interface";

/**
 * Schnittstelle für Utils.insertArrayElementAtPosition
 * @param array - Array das geändert werden soll
 * @param indexToInsert- Index an der das neue Element eingefügt werden soll
 * @param newElement - Neues Element

 */
export interface InsertArrayElementAtPosition<T> {
  array: T[];
  indexToInsert: number;
  newElement: T;
}
/**
 * Schnittstelle für Util.moveArrayElementDown
 * @param array - Array das geändert werden soll
 * @param indexToMoveUDown- Index der Zeile, die um eine Position runter verschoben werden soll
 */
export interface MoveArrayElementDown<T> {
  array: T[];
  indexToMoveDown: number;
}
/**
 * Schnittstelle für Util.moveArrayElementUp
 * @param array - Array das geändert werden soll
 * @param indexToMoveUp - Index der Zeile, die um eine Position hoch verschoben werden soll
 */
export interface MoveArrayElementUp<T> {
  array: T[];
  indexToMoveUp: number;
}
/**
 * Schnittstelle für Util.RenumberArray
 * @param array - Array
 * @param field - Name des Object.Key
 */
export interface RenumberArray<T> {
  array: T[];
  field: string;
}
/**
 * Schnittstelle für Util.differenceBetweenTwoDates
 * @param dateFrom - Von Datum
 * @param dateTo - Bis Datum
 */
export interface DifferenceBetweenTwoDates {
  dateFrom: Date;
  dateTo: Date;
}
/**
 * Schnittstelle für Utils.SortArrayWithObject
 * @param array - zu sortierendes Array
 * @param attributeName - Name des Attributes nach dem sortiert wird
 */
export interface SortArray<T> {
  array: T[];
  attributeName: string;
  sortOrder?: SortOrder;
}
export interface SortArrayWithObjectByDate {
  array: {[key: string]: any}[];
  attributeName: string;
}
interface DateAsString {
  date: Date;
}

interface ConvertArrayToObject {
  array: object[];
  keyName: string;
}

export default class Utils {
  /* =====================================================================
  // Domain aus URL herausholen
  // ===================================================================== */
  static getDomain(url: string) {
    // Die grossen 4 hereausholen aus den URL
    if (url.includes("swissmilk")) {
      return "swissmilk.ch";
    } else if (url.includes("fooby")) {
      return "fooby.ch";
    } else if (url.includes("migros")) {
      return "migusto.ch";
    } else if (url.includes("bettybossi")) {
      return "bettybossi.ch";
    }

    // Domain einer URL zurückgeben
    let hostname: string;
    if (url.indexOf("//") > -1) {
      hostname = url.split("/")[2];
    } else {
      hostname = url.split("/")[0];
    }
    //find & remove port number
    hostname = hostname.split(":")[0];
    //find & remove "?"
    hostname = hostname.split("?")[0];

    return hostname;
  }
  /* =====================================================================
  // Prüfen ob gültige URL
  // ===================================================================== */
  static isUrl(url: string) {
    let regexp = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$", // fragment locator
      "i"
    );
    return regexp.test(url);
  }
  /* =====================================================================
  // Prüfen ob gültige Email
  // ===================================================================== */
  static isEmail(email: string) {
    if (
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]/.test(
        email
      )
    ) {
      return true;
    }
    return false;
  }
  /* =====================================================================
  // Element an bestimmter Position in Array einfügen 
  // ===================================================================== */
  // Das Element wird nach dem Index eingefügt
  static insertArrayElementAtPosition<T>({
    array,
    indexToInsert,
    newElement,
  }: InsertArrayElementAtPosition<T>) {
    let listPartPreInsert: T[] = [];
    let listNewElement: T[] = [];
    let listPartAfterInsert: T[] = [];

    listPartPreInsert = array.slice(0, indexToInsert + 1);
    listNewElement.push(newElement);
    listPartAfterInsert = array.slice(indexToInsert + 1);

    return listPartPreInsert.concat(listNewElement, listPartAfterInsert);
  }
  /* =====================================================================
  // Array-Element Position runter schieben
  // ===================================================================== */
  static moveArrayElementDown<T>({
    array,
    indexToMoveDown,
  }: MoveArrayElementDown<T>) {
    let listPartPreMove: T[] = [];

    if (indexToMoveDown + 1 === array.length) {
      return array;
    }

    if (indexToMoveDown !== 0) {
      listPartPreMove = array.slice(0, indexToMoveDown);
    }
    let listElementSwapDown: T = array[indexToMoveDown];
    let listElementSwapUp: T = array[indexToMoveDown + 1];
    let listPartRest: T[] = array.slice(indexToMoveDown + 2);

    return listPartPreMove.concat(
      listElementSwapUp,
      listElementSwapDown,
      listPartRest
    ) as T[];
  }
  /* =====================================================================
  // Array-Element Position runter schieben
  // ===================================================================== */
  static moveArrayElementUp<T>({array, indexToMoveUp}: MoveArrayElementUp<T>) {
    if (indexToMoveUp === 0) {
      // Erste Position kann nicht weiter hochgeschoben werden
      return array;
    }

    let listPartPreMove: T[] = array.slice(0, indexToMoveUp - 1);
    let listElementSwapUp: T = array[indexToMoveUp];
    let listElementSwapDown: T = array[indexToMoveUp - 1];

    let listPartRest: T[] = [];
    if (indexToMoveUp !== array.length) {
      listPartRest = array.slice(indexToMoveUp + 1);
    }
    return listPartPreMove.concat(
      listElementSwapUp,
      listElementSwapDown,
      listPartRest
    ) as T[];
  }
  /* =====================================================================
  // Array nach bestimmten Feld neu Nummerieren
  // ===================================================================== */
  static renumberArray<T>({array, field}: RenumberArray<T>) {
    array.forEach((entry, index) => (entry[field] = index + 1));
    return array;
  }
  /* =====================================================================
  // Differenz in Tagen zwischen zwei Daten
  // ===================================================================== */
  static differenceBetweenTwoDates({
    dateFrom,
    dateTo,
  }: DifferenceBetweenTwoDates) {
    if (dateFrom.getTime() > dateTo.getTime()) {
      return;
    }
    const differenceTime = Math.abs(dateTo.getTime() - dateFrom.getTime());
    const differenceDays =
      Math.ceil(differenceTime / (1000 * 60 * 60 * 24)) + 1;
    return differenceDays;
  }

  /* =====================================================================
  // UID generieren
  // ===================================================================== */
  static generateUid(length: number) {
    let result = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  /* =====================================================================
  // File-Suffix holen
  // ===================================================================== */
  static getFileSuffix(filename: string) {
    if (!filename.includes(".")) {
      return;
    }
    return filename.split(".")?.pop()?.toLowerCase();
  }
  // ===================================================================== */
  /**
   * Sortieren eines Arrays
   * Falls die Objekte verschachtelt sind, muss der Zugriffspfad zu dem
   * Sortiert-Attributsnamen mit Punkten (.) getrennt werden
   * @param object - Objekt mit Referenz zu Array, dem Attributnamen nach
   *                 dem sortiert werden soll und optional die Sortierrichtung
   * @returns Sortiertes Array
   */
  static sortArray<T>({
    array,
    attributeName,
    sortOrder = SortOrder.asc,
  }: SortArray<T>) {
    let nameHierarchy = attributeName.split(".");

    if (sortOrder == SortOrder.asc) {
      array.sort(function (aOriginal, bOriginal) {
        let nameA: any;
        let nameB: any;
        let aValue: any;
        let bValue: any;

        if (nameHierarchy.length > 1) {
          aValue = aOriginal;
          bValue = bOriginal;

          // Versachtelten Wert holen
          nameHierarchy.forEach((attributeName) => {
            aValue = aValue[attributeName];
            bValue = bValue[attributeName];
          });
        } else {
          aValue = aOriginal[attributeName];
          bValue = bOriginal[attributeName];
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return aValue.valueOf() - bValue.valueOf();
        } else if (typeof aValue === "string") {
          nameA = aValue.toUpperCase(); // Gross-/Kleinschreibung ignorieren
          nameB = bValue.toUpperCase(); // Gross-/Kleinschreibung ignorieren
        } else {
          nameA = aValue;
          nameB = bValue;
        }

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // Namen müssen gleich sein
        return 0;
      });
    } else {
      array.sort(function (aOriginal, bOriginal) {
        let nameA: any;
        let nameB: any;
        let aValue: any;
        let bValue: any;

        if (nameHierarchy.length > 1) {
          aValue = aOriginal;
          bValue = bOriginal;
          // Versachtelten Wert holen
          nameHierarchy.forEach((attributeName) => {
            aValue = aValue[attributeName];
            bValue = bValue[attributeName];
          });
        } else {
          aValue = aOriginal[attributeName];
          bValue = bOriginal[attributeName];
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return bValue.valueOf() - aValue.valueOf();
        } else if (typeof aValue === "string") {
          nameA = aValue.toUpperCase(); // Gross-/Kleinschreibung ignorieren
          nameB = bValue.toUpperCase(); // Gross-/Kleinschreibung ignorieren
        } else {
          nameA = aValue;
          nameB = bValue;
        }

        if (nameA > nameB) {
          return -1;
        }
        if (nameA < nameB) {
          return 1;
        }
        // Namen müssen gleich sein
        return 0;
      });
    }

    return array;
  }
  // ===================================================================== */
  /**
   * Prüfung ob wir uns in der Entwicklung befinden
   * @returns true/false ob wir in der Entwicklung sind
   */
  static isDevelopmentEnviroment() {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
      return true;
    } else {
      return false;
    }
  }
  // ===================================================================== */
  /**
   * Prüfen ob übergebenes Objekt noch am laden ist (Objekt mit alles Boolean)
   */
  static deriveIsLoading = (loadingComponents: {[key: string]: boolean}) => {
    return (
      Object.values(loadingComponents).filter((isLoading) => isLoading === true)
        .length === 1
    );
  };
  // ===================================================================== */
  /**
   * Datum als String umwandlen im Format YYYY-MM-DD
   * @param date als Datum
   * @result String im Format YYYY-MM-DD
   */
  static dateAsString = (date: Date) => {
    let month = "" + (date.getMonth() + 1);
    let day = "" + date.getDate();
    let year = "" + date.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };
  // ===================================================================== */
  /**
   * Objekt in Array verwandeln
   * @param object Objekt
   * @result Wie soll das Feld heissen, das den Key, Wert des Objekts speichert?
   */
  static convertObjectToArray = (object: object, idName: string) => {
    return Object.keys(object).map((key) => {
      return {[idName]: key, ...object[key]};
    });
  };
  // ===================================================================== */
  /**
   * Array in Objekt verwandeln
   * @param Array Objekt
   * @param keyField Name des Feldes, dass zum Schlüssel wird
   * @result Objekt
   */
  static convertArrayToObject = ({array, keyName}: ConvertArrayToObject) => {
    let newObject = {} as object;

    array.forEach((entry) => {
      newObject[entry[keyName]] = entry;
      delete newObject[entry[keyName]][keyName];
    });

    return newObject;
  };
  // ===================================================================== */
  /**
   * Change Record erzeugen
   * @param authUser Referenz auf aktuellen User
   * @result Objekt mit aktuellem Change-Record
   */
  static createChangeRecord = (authUser: AuthUser) => {
    return {
      date: new Date(),
      fromUid: authUser.uid,
      fromDisplayName: authUser.publicProfile.displayName,
    } as ChangeRecord;
  };
}
