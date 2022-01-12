/**
 * Schnittstelle für Utils.insertArrayElementAtPosition
 * @param array - Array das geändert werden soll
 * @param indexToInsert- Index an der das neue Element eingefügt werden soll
 * @param newElement - Neues Element

 */
export interface InsertArrayElementAtPosition {
  array: Object[];
  indexToInsert: number;
  newElement: Object;
}
/**
 * Schnittstelle für Util.moveArrayElementDown
 * @param array - Array das geändert werden soll
 * @param indexToMoveUDown- Index der Zeile, die um eine Position runter verschoben werden soll
 */
export interface MoveArrayElementDown {
  array: Object[];
  indexToMoveDown: number;
}
/**
 * Schnittstelle für Util.moveArrayElementUp
 * @param array - Array das geändert werden soll
 * @param indexToMoveUp - Index der Zeile, die um eine Position hoch verschoben werden soll
 */
export interface MoveArrayElementUp {
  array: Object[];
  indexToMoveUp: number;
}
/**
 * Schnittstelle für Util.RenumberArray
 * @param array - Array
 * @param field - Name des Object.Key
 */
export interface RenumberArray {
  array: { [key: string]: any }[];
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
export interface SortArrayWithObject {
  array: { [key: string]: any }[];
  attributeName: string;
}
export interface SortArrayWithObjectByDate {
  array: { [key: string]: any }[];
  attributeName: string;
}
export default class Utils {
  /* =====================================================================
  // Domain aus URL herausholen
  // ===================================================================== */
  static getDomain(url: string) {
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
  static insertArrayElementAtPosition({
    array,
    indexToInsert,
    newElement,
  }: InsertArrayElementAtPosition) {
    let listPartPreInsert: object[] = [];
    let listNewElement: object[] = [];
    let listPartAfterInsert: object[] = [];

    listPartPreInsert = array.slice(0, indexToInsert + 1);
    listNewElement.push(newElement);
    listPartAfterInsert = array.slice(indexToInsert + 1);

    return listPartPreInsert.concat(listNewElement, listPartAfterInsert);
  }
  /* =====================================================================
  // Array-Element Position runter schieben
  // ===================================================================== */
  static moveArrayElementDown({
    array,
    indexToMoveDown,
  }: MoveArrayElementDown) {
    let listPartPreMove: Object[] = [];

    if (indexToMoveDown + 1 === array.length) {
      return array;
    }

    if (indexToMoveDown !== 0) {
      listPartPreMove = array.slice(0, indexToMoveDown);
    }
    let listElementSwapDown: Object = array[indexToMoveDown];
    let listElementSwapUp: Object = array[indexToMoveDown + 1];
    let listPartRest: Object[] = array.slice(indexToMoveDown + 2);

    return listPartPreMove.concat(
      listElementSwapUp,
      listElementSwapDown,
      listPartRest
    );
  }
  /* =====================================================================
  // Array-Element Position runter schieben
  // ===================================================================== */
  static moveArrayElementUp = ({
    array,
    indexToMoveUp,
  }: MoveArrayElementUp) => {
    if (indexToMoveUp === 0) {
      // Erste Position kann nicht weiter hochgeschoben werden
      return array;
    }

    let listPartPreMove: Object[] = array.slice(0, indexToMoveUp - 1);
    let listElementSwapUp: Object = array[indexToMoveUp];
    let listElementSwapDown: Object = array[indexToMoveUp - 1];

    let listPartRest: Object[] = [];
    if (indexToMoveUp !== array.length) {
      listPartRest = array.slice(indexToMoveUp + 1);
    }
    return listPartPreMove.concat(
      listElementSwapUp,
      listElementSwapDown,
      listPartRest
    );
  };
  /* =====================================================================
  // Array nach bestimmten Feld neu Nummerieren
  // ===================================================================== */
  static renumberArray = ({ array, field }: RenumberArray) => {
    array.forEach((entry, index) => (entry[field] = index + 1));
    return array;
  };
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
  /* =====================================================================
  // Array nach Attributnamen sortieren
  // ===================================================================== */
  static sortArray({ array, attributeName }: SortArrayWithObject) {
    array.sort(function (a, b) {
      let nameA;
      let nameB;
      if (
        a[attributeName] instanceof Date &&
        b[attributeName] instanceof Date
      ) {
        return a[attributeName] - b[attributeName];
      } else if (typeof a[attributeName] === "string") {
        nameA = a[attributeName as keyof typeof Object].toUpperCase(); // Gross-/Kleinschreibung ignorieren
        nameB = b[attributeName].toUpperCase(); // Gross-/Kleinschreibung ignorieren
      } else {
        nameA = a[attributeName];
        nameB = b[attributeName];
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

    return array;
  }
}
