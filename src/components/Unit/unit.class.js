import Utils from "../Shared/utils.class";
import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";

export default class Unit {
  constructor(key, name) {
    this.key = key;
    this.name = name;
    // this.list = [];
    // this.readUnits();
    // this.conversionFactors = Unit._getConversionFactors();
  }
  /* =====================================================================
  // Alle Einheiten aus der DB holen
  // ===================================================================== */
  static async getAllUnits(firebase) {
    let units = [];

    await firebase
      .units()
      .get()
      .then((snapshot) => {
        if (snapshot && snapshot.exists) {
          Object.keys(snapshot.data()).forEach((key) => {
            units.push(new Unit(key, snapshot.data()[key].name));
          });
        }
      });

    units = Utils.sortArray({
      array: units,
      attributeName: "key",
    });

    return units;
  }
  /* =====================================================================
  // Neue Einheit anlegen
  // ===================================================================== */
  static createUnit = async (firebase, key, name) => {
    const unitDoc = firebase.units();

    await unitDoc
      .update({
        [key]: { name: name },
      })
      .catch((error) => {
        throw error;
      });

    // Event auslösen
    firebase.analytics.logEvent(FIREBASE_EVENTS.UNIT_CREATED);
  };
  /* =====================================================================
  // Alle Einheite speichern
  // ===================================================================== */
  static saveUnits = async (firebase, units) => {
    const unitDoc = firebase.units();

    var unitsMap = {};
    units.forEach((unit) => {
      unitsMap[unit.key] = { name: unit.name };
    });

    await unitDoc.update(unitsMap).catch((error) => {
      throw error;
    });
  };
}
