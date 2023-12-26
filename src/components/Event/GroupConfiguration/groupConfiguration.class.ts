import Utils from "../../Shared/utils.class";

import {AuthUser} from "../../Firebase/Authentication/authUser.class";
import Firebase from "../../Firebase/firebase.class";
import LocalStorageHandler from "../../Shared/localStorageHandler.class";

import {
  INTOLERANCES as DEFAULT_INTOLERANCES,
  DIETS as DEFAULT_DIETS,
} from "../../../constants/defaultValues";
import {ChangeRecord} from "../../Shared/global.interface";

interface GroupConfigObjectStructure<T> {
  entries: {[key: string]: T};
  order: string[];
}

export interface Diet {
  uid: string;
  name: string;
  totalPortions: number;
}

export interface Intolerance {
  uid: string;
  name: string;
  totalPortions: number;
}
interface DeleteIntoleranceProps {
  groupConfig: EventGroupConfiguration;
  intoleranceUidToDelete: Intolerance["uid"];
}
interface DeleteDietProps {
  groupConfig: EventGroupConfiguration;
  dietUidToDelete: Diet["uid"];
}
interface AddDietGroupProps {
  groupConfig: EventGroupConfiguration;
  dietGroupName: Diet["name"];
}
interface AddIntoleranceProps {
  groupConfig: EventGroupConfiguration;
  intoleranceName: Intolerance["name"];
}
interface CalculateTotals {
  groupConfig: EventGroupConfiguration;
}

interface Save {
  firebase: Firebase;
  groupConfig: EventGroupConfiguration;
  authUser: AuthUser;
}
interface GetGroupConfiguration {
  firebase: Firebase;
  uid: EventGroupConfiguration["uid"];
}
interface GetGroupConfigurationListener {
  firebase: Firebase;
  uid: EventGroupConfiguration["uid"];
  callback: (groupConfiguration: EventGroupConfiguration) => void;
}
interface IntolerancePortions {
  [key: Intolerance["uid"]]: number;
}
export interface Portions {
  [key: Diet["uid"]]: IntolerancePortions;
}

export default class EventGroupConfiguration {
  uid: string;
  diets: GroupConfigObjectStructure<Diet>;
  intolerances: GroupConfigObjectStructure<Intolerance>;
  portions: Portions;
  totalPortions: number;
  created: ChangeRecord;
  lastChange: ChangeRecord;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor() {
    this.uid = "";
    this.diets = {
      entries: {} as GroupConfigObjectStructure<Diet>["entries"],
      order: [],
    };
    this.intolerances = {
      entries: {} as GroupConfigObjectStructure<Intolerance>["entries"],
      order: [],
    };
    this.portions = {} as Portions;
    this.totalPortions = 0;
    this.created = {date: new Date(0), fromUid: "", fromDisplayName: ""};
    this.lastChange = {date: new Date(0), fromUid: "", fromDisplayName: ""};
  }
  // ===================================================================== */
  /**
   * Factory-Methode
   * erzeugt ein fix-fertigs Objekt vom Typ Group-Config
   * @returns Group-Config
   */
  static factory() {
    let groupConfig = new EventGroupConfiguration();

    DEFAULT_DIETS.forEach((diet) => {
      let dietUid = Utils.generateUid(5);
      groupConfig.diets.entries[dietUid] = {
        uid: dietUid,
        name: diet,
        totalPortions: 0,
      };
      groupConfig.diets.order.push(dietUid);
    });

    DEFAULT_INTOLERANCES.forEach((intolerance) => {
      let intoleranceUid = Utils.generateUid(5);
      groupConfig.intolerances.entries[intoleranceUid] = {
        uid: intoleranceUid,
        name: intolerance,
        totalPortions: 0,
      };
      groupConfig.intolerances.order.push(intoleranceUid);
    });
    // Portionen aufbauen
    groupConfig.diets.order.forEach((dietUid) => {
      let intolerancePortions = {} as IntolerancePortions;
      groupConfig.intolerances.order.forEach((intoleranceUid) => {
        intolerancePortions[intoleranceUid] = 0;
      });
      groupConfig.portions[dietUid] = intolerancePortions;
    });
    groupConfig.totalPortions = 0;

    return groupConfig;
  }
  // ===================================================================== */
  /**
   * Unverträglichkeit hinzufügen
   * @param Objekt mit Unverträglichkeit-Array und Name der neuen Unverträglichkeit
   * @returns Unverträglichkeiten-Array mit neuer Unverträglichkeit
   */
  static addIntolerance({groupConfig, intoleranceName}: AddIntoleranceProps) {
    let newIntolerance: Intolerance = {
      uid: Utils.generateUid(5),
      name: intoleranceName,
      totalPortions: 0,
    };
    groupConfig.intolerances.entries[newIntolerance.uid] = newIntolerance;
    groupConfig.intolerances.order.push(newIntolerance.uid);

    groupConfig.diets.order.forEach((dietUid) => {
      groupConfig.portions[dietUid] = {
        ...groupConfig.portions[dietUid],
        [newIntolerance.uid]: 0,
      };
    });

    return groupConfig;
  }
  // ===================================================================== */
  /**
   * Intoleranz löschen
   * @param Objekt mit groupConfig und UID der Intoleranz, die gelöscht werden muss
   * @returns Gesamte GroupConfig
   */
  static deleteIntolerance({
    groupConfig,
    intoleranceUidToDelete,
  }: DeleteIntoleranceProps) {
    delete groupConfig.intolerances.entries[intoleranceUidToDelete];
    groupConfig.intolerances.order = groupConfig.intolerances.order.filter(
      (intoleranceUid) => intoleranceUid != intoleranceUidToDelete
    );

    Object.keys(groupConfig.portions).forEach((diet) => {
      delete groupConfig.portions[diet][intoleranceUidToDelete];
    });

    groupConfig = EventGroupConfiguration.calculateTotals({
      groupConfig: groupConfig,
    });

    return groupConfig;
  }
  // ===================================================================== */
  /**
   * Diät-Gruppe hinzufügen
   * @param Objekt mit Diät-Array und Name der neuen Diätgruppe
   * @returns Diät-Array mit neuer Gruppe
   */
  static addDietGroup({groupConfig, dietGroupName}: AddDietGroupProps) {
    let newDiet: Diet = {
      uid: Utils.generateUid(5),
      name: dietGroupName,
      totalPortions: 0,
    };

    groupConfig.diets.entries[newDiet.uid] = newDiet;
    groupConfig.diets.order.push(newDiet.uid);

    let intolerancePortions = {} as IntolerancePortions;
    groupConfig.intolerances.order.forEach((intoleranceUid) => {
      intolerancePortions[intoleranceUid] = 0;
    });
    groupConfig.portions[newDiet.uid] = intolerancePortions;

    return groupConfig;
  }
  // ===================================================================== */
  /**
   * Diät aus Diät-Array löschen
   * @param Objekt mit groupConfig und UID der Diät, die gelöscht werden muss
   * @returns Gesamte GroupConfig
   */
  static deleteDiet({groupConfig, dietUidToDelete}: DeleteDietProps) {
    delete groupConfig.diets.entries[dietUidToDelete];
    groupConfig.diets.order = groupConfig.diets.order.filter(
      (dietUid) => dietUid != dietUidToDelete
    );

    delete groupConfig.portions[dietUidToDelete];

    groupConfig = EventGroupConfiguration.calculateTotals({
      groupConfig: groupConfig,
    });

    return groupConfig;
  }
  // ===================================================================== */
  /**
   * Die Totale der Diäten und Intoleranzen neu berechnen
   * @param groupConfig
   * @returns groupConfig - mit neu berechneten Total-Summern
   */
  static calculateTotals({groupConfig}: CalculateTotals) {
    groupConfig.totalPortions = 0;

    groupConfig.diets.order.forEach((dietUid) => {
      groupConfig.diets.entries[dietUid].totalPortions = Object.values(
        groupConfig.portions[dietUid]
      ).reduce((runningSum, portion) => runningSum + portion, 0);
      // Gleich die Total-Portionen über alles dazurechnen
      groupConfig.totalPortions =
        groupConfig.totalPortions +
        groupConfig.diets.entries[dietUid].totalPortions;
    });

    groupConfig.intolerances.order.forEach((intoleranceUid) => {
      groupConfig.intolerances.entries[intoleranceUid].totalPortions = 0;

      groupConfig.diets.order.forEach((dietUid) => {
        groupConfig.intolerances.entries[intoleranceUid].totalPortions =
          groupConfig.intolerances.entries[intoleranceUid].totalPortions +
          groupConfig.portions[dietUid][intoleranceUid];
      });
    });

    return groupConfig;
  }
  // ===================================================================== */
  /**
   * Gruppen-Konfig speichern
   * @param {firebase, event, authUser}
   */
  static async save({firebase, groupConfig, authUser}: Save) {
    if (!groupConfig.created.fromUid) {
      // Wird soeben neu erstellt.
      groupConfig.created = {
        fromUid: authUser.uid,
        fromDisplayName: authUser.publicProfile.displayName,
        date: new Date(),
      };
    }

    await firebase.event.groupConfiguration
      .set<EventGroupConfiguration>({
        uids: [groupConfig.uid],
        value: groupConfig,
        authUser: authUser,
      })
      .then((result) => {
        return result as EventGroupConfiguration;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
  // ===================================================================== */
  /**
   * GruppenKonfiguration aus der DB lesen
   * @param {firebase, uid}
   */
  static getGroupConfiguration = async ({
    firebase,
    uid,
  }: GetGroupConfiguration) => {
    let groupConfig = <EventGroupConfiguration>{};

    await firebase.event.groupConfiguration
      .read<EventGroupConfiguration>({uids: [uid]})
      .then((result) => {
        groupConfig = result;
        groupConfig.uid = uid;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return groupConfig;
  };
  // ===================================================================== */
  /**
   * GruppenKonfiguration als Listener holen
   * @param {firebase, uid}
   */
  static getGroupConfigurationListener = async ({
    firebase,
    uid,
    callback,
  }: GetGroupConfigurationListener) => {
    let groupConfigurationListener = () => {};

    const groupConfigurationCalback = (
      groupConfiguration: EventGroupConfiguration
    ) => {
      // Menüplan mit UID anreichern
      groupConfiguration.uid = uid;
      callback(groupConfiguration);
    };

    await firebase.event.groupConfiguration
      .listen<EventGroupConfiguration>({
        uids: [uid],
        callback: groupConfigurationCalback,
      })
      .then((result) => {
        groupConfigurationListener = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return groupConfigurationListener;
  };
}
