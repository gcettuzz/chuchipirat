import Utils from "../Shared/utils.class";
import Firebase from "../Firebase";
import AuthUser from "../Firebase/Authentication/authUser.class";

interface GetAllUnits {
  firebase: Firebase;
}

interface CreateUnit {
  firebase: Firebase;
  key: string;
  name: string;
}
interface SaveUnits {
  firebase: Firebase;
  units: Unit[];
  authUser: AuthUser;
}

export default class Unit {
  key: string;
  name: string;

  constructor(key, name) {
    this.key = key;
    this.name = name;
  }
  /* =====================================================================
  // Alle Einheiten aus der DB holen
  // ===================================================================== */
  static async getAllUnits({firebase}: GetAllUnits) {
    let units: Unit[] = [];

    await firebase.masterdata.units
      .read<Object>({uids: []})
      .then((result) => {
        Object.keys(result).forEach((key) => {
          units.push({key: key, name: result[key].name});
        });
      })
      .catch((error) => {
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
}
