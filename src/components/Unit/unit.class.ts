import Utils from "../Shared/utils.class";
import Firebase from "../Firebase/firebase.class";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {ValueObject} from "../Firebase/Db/firebase.db.super.class";

interface Constructor {
  key: Unit["key"];
  name: Unit["name"];
}

export enum UnitDimension {
  volume = "VOL",
  mass = "MAS",
  dimensionless = "DLS",
}

interface GetAllUnits {
  firebase: Firebase;
}

interface CreateUnit {
  firebase: Firebase;
  unit: Unit;
  authUser: AuthUser;
}
interface SaveUnits {
  firebase: Firebase;
  units: Unit[];
  authUser: AuthUser;
}

export default class Unit {
  // HINT: Änderungen müssen auch im Cloud-FX-Type nachgeführt werden
  key: string;
  name: string;
  dimension: UnitDimension;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor({key, name}: Constructor) {
    this.key = key;
    this.name = name;
    this.dimension = UnitDimension.dimensionless;
  }
  /* =====================================================================
  // Alle Einheiten aus der DB holen
  // ===================================================================== */
  static async getAllUnits({firebase}: GetAllUnits) {
    let units: Unit[] = [];

    await firebase.masterdata.units
      .read<ValueObject>({uids: []})
      .then((result) => {
        Object.keys(result).forEach((key) => {
          units.push({
            key: key,
            name: result[key].name,
            dimension: result[key].dimension,
          });
        });
      })
      .catch((error: Error) => {
        throw error;
      });

    units = Utils.sortArray({array: units, attributeName: "name"});

    return units;
  }
  /* =====================================================================
  // Alle Einheite speichern
  // ===================================================================== */
  static saveUnits = async ({firebase, units, authUser}: SaveUnits) => {
    await firebase.masterdata.units.update<Array<Unit>>({
      uids: [""],
      value: units,
      authUser,
    });
    return units;
  };
  /* =====================================================================
  // Neue Einheit anlegen
  // ===================================================================== */
  static createUnit = async ({firebase, unit, authUser}: CreateUnit) => {
    await firebase.masterdata.units.update({
      uids: [""],
      value: [unit],
      authUser: authUser,
    });
  };
  /* =====================================================================
  // Dimension einer Einheit bestimmen
  // ===================================================================== */
  static getDimensionOfUnit = (units: Unit[], unitToFind: Unit["key"]) => {
    let dimension = units.find((unit) => unit.key === unitToFind)?.dimension;

    if (!dimension) {
      dimension = UnitDimension.dimensionless;
    }
    return dimension;
  };
}
