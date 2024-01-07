// import Feed, {FEED_TYPE} from "../../Shared/feed.class";
// import Stats, {STATS_FIELDS} from "../../Shared/stats.class";

// import * as TEXT from "../../../constants/text";
// import * as FIREBASE_EVENTS from "../../../constants/firebaseEvents";

// import UnitConversion from "../../Unit/unitConversion.class";
// import Utils from "../../Shared/utils.class";
// import Recipe from "../../Recipe/recipe.class";
import {ChangeRecord} from "../../Shared/global.interface";
import Unit from "../../Unit/unit.class";
import Event from "../Event/event.class";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import Firebase from "../../Firebase";
import Product from "../../Product/product.class";
import Menuplan, {Menue} from "../Menuplan/menuplan.class";
import Recipe from "../../Recipe/recipe.class";
import ShoppingList, {ShoppingListItem} from "./shoppingList.class";
import {
  UnitConversionBasic,
  UnitConversionProducts,
} from "../../Unit/unitConversion.class";
import Department from "../../Department/department.class";
import Material from "../../Material/material.class";
import _ from "lodash";
import Utils from "../../Shared/utils.class";
import FirebaseAnalyticEvent from "../../../constants/firebaseEvent";
import Stats, {StatsField} from "../../Shared/stats.class";

interface Factory {
  event: Event;
}
interface SaveCollection {
  firebase: Firebase;
  authUser: AuthUser;
  shoppingListCollection: ShoppingListCollection;
}
interface GetShoppingListCollection {
  eventUid: Event["uid"];
  firebase: Firebase;
}
interface GetShoppingListCollectionListener {
  eventUid: Event["uid"];
  firebase: Firebase;
  callback: (shoppingListCollection: ShoppingListCollection) => void;
}

export interface ShoppingListProperties {
  uid: string;
  name: string;
  selectedMenues: string[];
  generated: ChangeRecord;
  hasManuallyAddedItems: boolean;
}

interface CreateNewList {
  name: string;
  selectedMenues: string[];
  shoppingListCollection: ShoppingListCollection;
  menueplan: Menuplan;
  eventUid: Event["uid"];
  products: Product[];
  materials: Material[];
  departments: Department[];
  unitConversionBasic: UnitConversionBasic;
  unitConversionProducts: UnitConversionProducts;
  firebase: Firebase;
  authUser: AuthUser;
}

interface RefreshLists {
  shoppingListCollection: ShoppingListCollection;
  shoppingList: ShoppingList;
  keepManuallyAddedItems?: boolean;
  menueplan: Menuplan;
  eventUid: Event["uid"];
  products: Product[];
  materials: Material[];
  departments: Department[];
  unitConversionBasic: UnitConversionBasic;
  unitConversionProducts: UnitConversionProducts;
  firebase: Firebase;
  authUser: AuthUser;
}

export interface ProductTrace {
  menueUid: Menue["uid"];
  recipe: {uid: Recipe["uid"]; name: Recipe["name"]};
  planedPortions?: number;
  quantity: number;
  unit: Unit["key"];
  manualAdd?: boolean;
}

interface DeleteList {
  firebase: Firebase;
  shoppingListColection: ShoppingListCollection;
  eventUid: Event["uid"];
  listUidToDelete: ShoppingList["uid"];
  authUser: AuthUser;
}

interface EditListName {
  shoppingListCollection: ShoppingListCollection;
  listUidToEdit: ShoppingList["uid"];
  newName: ShoppingListProperties["name"];
  authUser: AuthUser;
}

export interface ShoppingListTrace {
  [key: Product["uid"]]: ProductTrace[];
}

export interface ShoppingListEntry {
  properties: ShoppingListProperties;
  trace: ShoppingListTrace;
}

interface Save {
  firebase: Firebase;
  eventUid: Event["uid"];
  shoppingListCollection: ShoppingListCollection;
  authUser: AuthUser;
}
interface Delete {
  eventUid: Event["uid"];
  firebase: Firebase;
}

interface AddTraceEntry {
  trace: ShoppingListTrace;
  item: Product | Material;
  menueUid: Menue["uid"];
  recipe: {uid: Recipe["uid"]; name: Recipe["name"]};
  planedPortions?: number;
  quantity: number;
  unit: Unit["key"];
  addedManually?: boolean;
}

interface DeleteTraceEntry {
  trace: ShoppingListTrace;
  itemUid: Product["uid"] | Material["uid"];
}

export default class ShoppingListCollection {
  noOfLists: number;
  lists: {[key: string]: ShoppingListEntry};
  lastChange: ChangeRecord;
  eventUid: Event["uid"];
  /* =====================================================================
  // Konstruktor
  // ===================================================================== */
  constructor() {
    this.noOfLists = 0;
    this.lastChange = {date: new Date(0), fromUid: "", fromDisplayName: ""};
    this.lists = {};
    this.eventUid = "";
  } // ===================================================================== */
  /**
   * Factory Methode
   * @returns ShoppingListCollection
   */
  static factory = ({event}: Factory) => {
    let shoppingListCollection = new ShoppingListCollection();
    shoppingListCollection.eventUid = event.uid;
    return shoppingListCollection;
  };
  // ===================================================================== */
  /**
   * Collection speichern (Übersichts-File aller Einkaufslisten)
   * @returns void
   */
  static saveCollection = async ({
    firebase,
    authUser,
    shoppingListCollection,
  }: SaveCollection) => {
    firebase.event.shoppingListCollection
      .set({
        uids: [shoppingListCollection.eventUid],
        value: shoppingListCollection,
        authUser: authUser,
      })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  // ===================================================================== */
  /**
   * Collection mit Listener holen
   * @returns listener
   */
  static getShoppingListCollection = async ({
    eventUid,
    firebase,
  }: GetShoppingListCollection) => {
    let shoppingListColection = {} as ShoppingListCollection;
    await firebase.event.shoppingListCollection
      .read<ShoppingListCollection>({uids: [eventUid]})
      .then((result) => {
        shoppingListColection = result;
        shoppingListColection.eventUid = eventUid;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return shoppingListColection;
  };

  // ===================================================================== */
  /**
   * Collection mit Listener holen
   * @returns listener
   */
  static getShoppingListCollectionListener = async ({
    firebase,
    eventUid: uid,
    callback,
  }: GetShoppingListCollectionListener) => {
    let shoppingListCollectionListener = () => {};

    const shoppingListCollectionCallback = (
      shoppingListCollection: ShoppingListCollection
    ) => {
      // Menüplan mit UID anreichern
      shoppingListCollection.eventUid = uid;
      callback(shoppingListCollection);
    };
    const errorCallback = (error: any) => {
      console.error(error);
      throw error;
    };

    await firebase.event.shoppingListCollection
      .listen<ShoppingListCollection>({
        uids: [uid],
        callback: shoppingListCollectionCallback,
        errorCallback: errorCallback,
      })
      .then((result) => {
        shoppingListCollectionListener = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return shoppingListCollectionListener;
  };
  // ===================================================================== */
  /**
   * Neue Liste erstellen
   * Anhand der gewählten Menües, die Rezepte suchen und eine neue Liste
   * erstellen.
   * @param object - Objekt Name der Liste, ausgewählte Menües [menueUid],
   *                 Firebase und Authuser
   * @returns Generierte Liste als Objekt
   */
  static createNewList = async ({
    name,
    selectedMenues,
    shoppingListCollection,
    menueplan,
    eventUid,
    products,
    materials,
    departments,
    unitConversionBasic,
    unitConversionProducts,
    firebase,
    authUser,
  }: CreateNewList) => {
    let trace = {} as ShoppingListTrace;
    let shoppingList = {} as ShoppingList;

    await ShoppingList.createNewList({
      selectedMenues: selectedMenues,
      menueplan: menueplan,
      products: products,
      materials: materials,
      departments: departments,
      unitConversionBasic: unitConversionBasic,
      unitConversionProducts: unitConversionProducts,
      firebase: firebase,
    }).then(async (result) => {
      shoppingList = result.shoppingList;
      trace = result.trace;

      // Liste speichern und UID aufnehmen für Trace
      await ShoppingList.save({
        firebase: firebase,
        eventUid: eventUid,
        shoppingList: result.shoppingList,
        authUser: authUser,
      }).then(async (result) => {
        shoppingList = result;
        shoppingListCollection.noOfLists++;

        shoppingListCollection.lists[shoppingList.uid] = {
          properties: {
            uid: shoppingList.uid,
            name: name,
            selectedMenues: selectedMenues,
            generated: Utils.createChangeRecord(authUser),
            hasManuallyAddedItems: false,
          },
          trace: trace,
        };
      });
    });
    // Neue UID und Collection
    return {
      shoppingListUid: shoppingList.uid,
      shoppingListCollection: shoppingListCollection,
    };
  };
  // ===================================================================== */
  /**
   * Eintrag in Trace hinzufügen
   * @param object - Objekt mit: Referenz zum Trace-Array, der Artikel, Menu-UID
   *                 Rezept (UID und Name), Menge und Einheit
   * @returns gibt das Trace File zurück
   */
  static addTraceEntry = ({
    trace,
    item,
    menueUid,
    recipe,
    planedPortions,
    quantity,
    unit,
    addedManually: addedManualy = false,
  }: AddTraceEntry) => {
    if (!trace.hasOwnProperty(item.uid)) {
      trace[item.uid] = [];
    }

    let shoppingListItem: ProductTrace = {
      menueUid: menueUid,
      recipe: recipe,
      quantity: quantity,
      unit: unit,
    };
    if (planedPortions) {
      shoppingListItem.planedPortions = planedPortions;
    }

    if (addedManualy) {
      shoppingListItem.manualAdd = true;
    }

    trace[item.uid].push(shoppingListItem);
    return trace;
  };
  // ===================================================================== */
  /**
   * Eintrag aus dem Trace löschen
   * @param object - Objekt mit: Referenz zum Trace-Array, und UID des Item
   * @returns gibt das Trace File zurück
   */
  static deleteTraceEntry = ({trace, itemUid}: DeleteTraceEntry) => {
    // Gewähltes Produkt ausfiltern
    let updatedTrace = _.cloneDeep(trace);

    delete updatedTrace[itemUid];

    return updatedTrace;
  };
  // ===================================================================== */
  /**
   * Bestehende Liste aktualisieren
   * @param object - Objekt mit: Referenz auf ShoppingList-Collection,
   *                 ShoppingList, Wert ob manuell hinzugefügte Werte bei-
   *                 behalten werden sollen, Referenzen auf Menplan, Produkte
   *                 Materialien, UnitConversion Basic, Unit Conversion Products
   *                 Abteilungen, Firebase und AuthUser
   * @returns objekt mit ShoppingList und ShoppingListCollection
   */
  static refreshList = async ({
    shoppingListCollection,
    shoppingList,
    keepManuallyAddedItems = false,
    menueplan,
    products,
    materials,
    unitConversionBasic,
    unitConversionProducts,
    departments,
    firebase,
    authUser,
  }: RefreshLists) => {
    // Manuel hinzugefügte Elmente nicht löschen!
    let manuallyAddedItems: ShoppingList["list"];
    let manuallyAddedItemsTrace = {} as ShoppingListTrace;
    let updatedShoppingListCollection = _.cloneDeep(
      shoppingListCollection
    ) as ShoppingListCollection;
    let updatedTrace = {} as ShoppingListTrace;
    let updatedShoppingList = {} as ShoppingList;
    let itemToInsert: ShoppingListItem | undefined = undefined;
    if (keepManuallyAddedItems) {
      // die manuell hinzugefügten Elemente behalten
      manuallyAddedItems = _.cloneDeep(shoppingList.list);

      Object.entries(manuallyAddedItems).forEach(
        ([departmentPos, department]) => {
          department.items = department.items.filter(
            (item) => item?.manualAdd == true
          );

          if (department.items.length == 0) {
            // Ganze Abteilung löschen
            delete manuallyAddedItems[departmentPos];
          }
        }
      );

      // Trace-Elemente auch behalten
      Object.values(manuallyAddedItems).forEach((department) => {
        department.items.forEach((item) => {
          manuallyAddedItemsTrace[item.item.uid] =
            shoppingListCollection.lists[shoppingList.uid].trace[item.item.uid];
        });
      });
      Object.values(manuallyAddedItemsTrace).forEach((traceItem) => {
        traceItem = traceItem.filter((item) => item.manualAdd);
      });
    }

    // Shopping Liste neu generieren
    await ShoppingList.createNewList({
      selectedMenues:
        shoppingListCollection.lists[shoppingList.uid].properties
          .selectedMenues,
      menueplan: menueplan,
      products: products,
      materials: materials,
      departments: departments,
      unitConversionBasic: unitConversionBasic,
      unitConversionProducts: unitConversionProducts,
      firebase: firebase,
    })
      .then((result) => {
        updatedShoppingList = result.shoppingList;
        updatedShoppingList.uid = shoppingList.uid;
        updatedTrace = result.trace;

        if (keepManuallyAddedItems) {
          // Liste mit manuellen Einträgen mergen
          Object.entries(manuallyAddedItems).forEach(
            ([departmentKey, department]) => {
              department.items.forEach((item) => {
                if (!updatedShoppingList.list.hasOwnProperty(departmentKey)) {
                  itemToInsert = undefined;
                  updatedShoppingList.list[departmentKey] = {...department};
                } else {
                  // Prüfen ob es das in der neuen Liste auch gibt -- dann dazuzählen
                  itemToInsert = updatedShoppingList.list[
                    departmentKey
                  ].items.find(
                    (updatedListItem: ShoppingListItem) =>
                      updatedListItem.item.uid == item.item.uid &&
                      updatedListItem.quantity == item.quantity
                  );
                  if (itemToInsert) {
                    // Gibt es schon (mit dem Update dazugekommen) --> Menge dazuzählen
                    itemToInsert.quantity += item.quantity;
                  } else {
                    updatedShoppingList.list[departmentKey].items.push(item);
                  }
                }
              });
            }
          );
          // Trace mit manuellen Einträgen mergen
          Object.entries(manuallyAddedItemsTrace).forEach(([itemUid, item]) => {
            // Prüfen ob es das im neuen Trace schon gibt.
            if (!updatedTrace.hasOwnProperty(itemUid)) {
              updatedTrace[itemUid] = [];
            }
            updatedTrace[itemUid] = updatedTrace[itemUid].concat(
              manuallyAddedItemsTrace[itemUid]
            );
          });
        }

        updatedShoppingListCollection.lists[
          shoppingList.uid
        ].properties.generated = Utils.createChangeRecord(authUser);

        firebase.analytics.logEvent(
          FirebaseAnalyticEvent.shoppingListRefreshed
        );
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return {
      shoppingList: updatedShoppingList,
      shoppingListCollection: updatedShoppingListCollection,
    };
  };

  /* =====================================================================
  // Einkaufsliste speichern
  // ===================================================================== */
  static save = async ({
    firebase,
    eventUid,
    shoppingListCollection,
    authUser,
  }: Save) => {
    shoppingListCollection.lastChange = Utils.createChangeRecord(authUser);

    await firebase.event.shoppingListCollection
      .set({
        uids: [eventUid],
        value: shoppingListCollection,
        authUser: authUser,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  // ===================================================================== */
  /**
   * Listen löschen (löscht das gesamte Dokument)
   * @param object - Objekt Event-UID und Firebase-Referenz
   * @returns void
   */
  static delete = async ({eventUid, firebase}: Delete) => {
    let counter = 0;
    // Zuerst Übersicht holen um alle Einkaufslisten einzeln zu löschen
    await ShoppingListCollection.getShoppingListCollection({
      eventUid: eventUid,
      firebase: firebase,
    })
      .then((result) => {
        Object.keys(result.lists).forEach(async (shoppingListUid) => {
          await ShoppingList.delete({
            eventUid: eventUid,
            listUidToDelete: shoppingListUid,
            firebase: firebase,
          })
            .then(() => {
              counter++;
            })
            .catch((error) => {
              console.error(error);
              throw error;
            });
        });
      })
      .then(async () => {
        // Collection selbst löschen
        await firebase.event.shoppingListCollection
          .delete({uids: [eventUid]})
          .catch((error) => {
            console.error(error);
            throw error;
          });
      })
      .then(() => {
        Stats.incrementStat({
          field: StatsField.noShoppingLists,
          value: counter * -1,
          firebase: firebase,
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  // ===================================================================== */
  /**
   * List löschen
   * @param object - Objekt mit ShoppingListCollection, authUser
   * @returns void
   */
  static deleteList = async ({
    firebase,
    shoppingListColection,
    eventUid,
    listUidToDelete,
    authUser,
  }: DeleteList) => {
    let updatedShoppingListCollection = _.cloneDeep(
      shoppingListColection
    ) as ShoppingListCollection;
    delete updatedShoppingListCollection.lists[listUidToDelete];

    updatedShoppingListCollection.lastChange = {
      fromDisplayName: authUser.publicProfile.displayName,
      fromUid: authUser.uid,
      date: new Date(),
    };

    updatedShoppingListCollection.noOfLists--;

    await firebase.event.shoppingListCollection
      .set({
        uids: [eventUid, updatedShoppingListCollection.eventUid],
        value: updatedShoppingListCollection,
        authUser: authUser,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return updatedShoppingListCollection;
  };
  // ===================================================================== */
  /**
   * Listen-Namen anpassen
   * @param object - Objekt mit ShoppingListCollection, authUser
   * @returns void
   */
  static editListName = ({
    shoppingListCollection,
    listUidToEdit,
    newName,
    authUser,
  }: EditListName) => {
    let updatedShoppingListCollection = _.cloneDeep(
      shoppingListCollection
    ) as ShoppingListCollection;

    updatedShoppingListCollection.lists[listUidToEdit].properties.name =
      newName;
    updatedShoppingListCollection.lastChange = {
      fromDisplayName: authUser.publicProfile.displayName,
      fromUid: authUser.uid,
      date: new Date(),
    };

    return updatedShoppingListCollection;
  };
}
