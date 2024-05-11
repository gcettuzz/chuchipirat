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
// interface DateAsString {
//   date: Date;
// }

interface ConvertArrayToObject<T> {
  array: T[];
  keyName: keyof T;
}

export enum Enviroment {
  development,
  test,
  production,
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
    const regexp = new RegExp(
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
    const listNewElement: T[] = [];
    let listPartAfterInsert: T[] = [];

    listPartPreInsert = array.slice(0, indexToInsert + 1);
    listNewElement.push(newElement);
    listPartAfterInsert = array.slice(indexToInsert + 1);

    return listPartPreInsert.concat(listNewElement, listPartAfterInsert);
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
      return 0;
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
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
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
      return "";
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
    const nameHierarchy = attributeName.split(".");

    if (sortOrder == SortOrder.asc) {
      array.sort(function (aOriginal, bOriginal) {
        let nameA: string;
        let nameB: string;
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
   * Prüfung ob wir uns in der Produktion befinden
   * @returns true/false ob wir in der Produktion sind
   */
  static isProductionEnviroment() {
    if (!process.env.NODE_ENV || process.env.REACT_APP_ENVIROMENT === "PRD") {
      return true;
    } else {
      return false;
    }
  }
  // ===================================================================== */
  /**
   * Prüfung ob wir uns in der Entwicklung befinden
   * @returns true/false ob wir in der Entwicklung sind
   */
  static isDevEnviroment() {
    if (!process.env.NODE_ENV || process.env.REACT_APP_ENVIROMENT === "DEV") {
      return true;
    } else {
      return false;
    }
  }
  // ===================================================================== */
  /**
   * Prüfung ob wir uns in der Testumgebung befinden
   * @returns true/false ob wir in der Entwicklung sind
   */
  static isTestEnviroment() {
    if (!process.env.NODE_ENV || process.env.REACT_APP_ENVIROMENT === "TST") {
      return true;
    } else {
      return false;
    }
  }
  // ===================================================================== */
  /**
   * System bestimmen
   * @returns Systemtyp
   */
  static getEnviroment(): Enviroment {
    if (Utils.isProductionEnviroment()) {
      return Enviroment.production;
    } else if (Utils.isTestEnviroment()) {
      return Enviroment.test;
    } else {
      return Enviroment.development;
    }
  }
  // ===================================================================== */
  /**
   * Prüfen ob übergebenes Objekt noch am laden ist (Objekt mit alles Boolean)
   */
  static deriveIsLoading = (loadingComponents: {[key: string]: boolean}) => {
    return (
      Object.values(loadingComponents).filter((isLoading) => isLoading === true)
        .length >= 1
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
    const year = "" + date.getFullYear();

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
  static convertObjectToArray = (
    object: Record<string, unknown>,
    idName: string
  ) => {
    return Object.keys(object).map((key) => {
      const entry: Record<string, unknown> = {
        [idName]: key,
        ...(object[key] as Record<string, unknown>),
      };
      return entry;
    });
  };
  // ===================================================================== */
  /**
   * Array in Objekt verwandeln
   * @param Array Objekt
   * @param keyField Name des Feldes, dass zum Schlüssel wird
   * @result Objekt
   */
  static convertArrayToObject = <T>({
    array,
    keyName,
  }: ConvertArrayToObject<T>) => {
    const newObject = {} as Record<string, T>;

    array.forEach((entry) => {
      newObject[entry[keyName] as string] = entry;
      delete newObject[entry[keyName] as string][keyName];
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
  // ===================================================================== */
  /**
   * Überprüfen ob zwei Array die gleichen Werte enthalen (egal in welcher
   * Reihenfolge).
   * @result Boolean
   */
  static areStringArraysEqual = (array1: string[], array2: string[]) => {
    if (array1.length !== array2.length) {
      return false; // Die Arrays haben unterschiedliche Längen, daher können sie nicht identisch sein.
    }

    const sortedArray1 = array1.slice().sort();
    const sortedArray2 = array2.slice().sort();
    for (let i = 0; i < sortedArray1.length; i++) {
      if (sortedArray1[i] !== sortedArray2[i]) {
        return false; // Einträge an der gleichen Position sind unterschiedlich, daher sind die Arrays nicht identisch.
      }
    }

    return true; // Die Arrays sind identisch.
  };
  // ===================================================================== */
  /**
   * Überprüfen ob zwei Array die gleichen Werte enthalen (egal in welcher
   * Reihenfolge).
   * @result Boolean
   */
  static areArraysIdentical<T>(array1: T[], array2: T[]): boolean {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
      return false;
    }
    if (array1.length !== array2.length) {
      // Überprüfe, ob die Arrays die gleiche Länge haben
      return false;
    }

    // Vergleiche Element für Element
    for (let i = 0; i < array1.length; i++) {
      // Wenn ein Element nicht übereinstimmt, sind die Arrays nicht identisch
      if (array1[i] !== array2[i]) {
        return false;
      }
    }

    // Alle Elemente stimmen überein, daher sind die Arrays identisch
    return true;
  }
  // ===================================================================== */
  /**
   * Überprüfen zwei Daten den gleichen Tag sind (Zeit wird ignoriert)
   * @result Boolean
   */
  static areDatesIdentical(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
  // ===================================================================== */
  /**
   * Jaccard-Index-Algorithmus - Prozent bestimmen, wie ähnlich sich zwei
   * Strings sind
   * @param a: String 1
   * @param b: String 2
   * @result Number -  Prozent wie fest sie sich überschneiden
   */
  static jaccardIndex(a: string, b: string): number {
    // Normalisiere die Eingabestrings, indem Leerzeichen entfernt und in Kleinbuchstaben umgewandelt werden
    const normalizedA = a.trim().toLowerCase();
    const normalizedB = b.trim().toLowerCase();

    const setA = new Set(normalizedA);
    const setB = new Set(normalizedB);
    const intersectionSize = new Set([...setA].filter((char) => setB.has(char)))
      .size;
    const unionSize = new Set([...setA, ...setB]).size;
    return intersectionSize / unionSize;
  }
}
