export default class Utils {
  /* =====================================================================
  // Domain aus URL herausholen
  // ===================================================================== */
  static getDomain(url) {
    // Domain einer URL zurückgeben
    let hostname;
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
  static isUrl(url) {
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
  static isEmail(email) {
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
  // Such-String-Array anhand vom Input erzeugen
  // ===================================================================== */
  static createSearchStringArray = (string) => {
    /* Da in Firebase die Suche auf Text nicht standardmässig geschieht,
       wird der Input als String in ein suchbares Array umgewandelt
       aus Hello World wird (alles in Kleinbuchstaben)
       h
       he
       hel
       hell
       ... */

    let array = [];
    let words = string.split(" ");

    // Mal den ganzen Begriff auseinander nehmen
    array = Utils.disassembleString(string.toLowerCase());

    if (words.length > 1) {
      // Die einzelnen Wörter auch auseinandernehmen
      for (let i = 1; i < words.length; i++) {
        array = array.concat(Utils.disassembleString(words[i].toLowerCase()));
      }
    }

    return array;
  };

  /* =====================================================================
  // String zerlegen
  // ===================================================================== */
  static disassembleString = (string) => {
    // Wort in Einzelteile zerlegen und Array zurückgeben

    const array = [];
    let currentString = "";

    string.split("").forEach((letter) => {
      currentString += letter;
      array.push(currentString);
    });

    return array;
  };

  /* =====================================================================
  // 
  // ===================================================================== */
  static insertArrayElementAtPosition(array, indexToInsert, newElement) {
    let listPartPreInsert = array.slice(0, indexToInsert + 1);
    let listNewElement = [newElement];
    let listPartAfterInsert = array.slice(indexToInsert + 1);

    return listPartPreInsert.concat(listNewElement, listPartAfterInsert);
  }
  /* =====================================================================
  // Array-Element Position hoch schieben
  // ===================================================================== */
  static moveArrayElementDown({ array, indexToMoveDown }) {
    let listPartPreMove = [];
    if (indexToMoveDown !== 0) {
      listPartPreMove = array.slice(0, indexToMoveDown);
    }
    let listElementSwapDown = array[indexToMoveDown];
    let listElementSwapUp = array[indexToMoveDown + 1];
    let listPartRest = array.slice(indexToMoveDown + 2);
    return listPartPreMove.concat(
      listElementSwapUp,
      listElementSwapDown,
      listPartRest
    );
  }
  /* =====================================================================
  // Array-Element Position runter schieben
  // ===================================================================== */
  static moveArrayElementUp = ({ array, indexToMoveUp }) => {
    let listPartPreMove = array.slice(0, indexToMoveUp - 1);
    let listElementSwapUp = array[indexToMoveUp];
    let listElementSwapDown = array[indexToMoveUp - 1];

    let listPartRest = [];
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
  static renumberArray = ({ array, field }) => {
    array.forEach((entry, index) => (entry[field] = index + 1));
    return array;
  };

  static differenceBetweenTwoDates(dateFrom, dateTo) {
    // Differenz zwischen 2 Daten
    // let datePart1 = date1.split(".");
    // let datePart2 = date2.split(".");

    // let dateFrom = new Date(datePart1[2], datePart1[1], datePart1[0]);
    // let dateTo = new Date(datePart2[2], datePart2[1], datePart2[0]);

    const diffTime = Math.abs(dateTo - dateFrom);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  }

  /* =====================================================================
  // UID generieren
  // ===================================================================== */
  static generateUid(length) {
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
  static getFileSuffix(filename) {
    return filename.split(".").pop().toLowerCase();
  }
  /* =====================================================================
  // Array nach Attributnamen sortieren
  // ===================================================================== */
  static sortArrayWithObjectByText({ list, attributeName }) {
    list.sort(function (a, b) {
      var nameA = a[attributeName].toUpperCase(); // Gross-/Kleinschreibung ignorieren
      var nameB = b[attributeName].toUpperCase(); // Gross-/Kleinschreibung ignorieren
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // Namen müssen gleich sein
      return 0;
    });

    return list;
  }
  /* =====================================================================
  // Array nach Attributname sortieren
  // ===================================================================== */
  static sortArrayWithObjectByNumber = ({ list, attributeName }) => {
    list.sort(function (a, b) {
      var nameA = a[attributeName];
      var nameB = b[attributeName];
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // Wert müssen gleich sein
      return 0;
    });

    return list;
  };
  /* =====================================================================
  // Array nach Attributnamen (Wert Datum) sortieren
  // ===================================================================== */
  static sortArrayWithObjectByDate(list, attributeName) {
    list.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return a[attributeName] - b[attributeName];
    });

    return list;
  }
}
