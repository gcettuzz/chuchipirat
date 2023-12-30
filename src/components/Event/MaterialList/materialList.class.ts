import Firebase from "../../Firebase";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import Material, {MaterialType} from "../../Material/material.class";
import {ChangeRecord} from "../../Shared/global.interface";
import Utils from "../../Shared/utils.class";
import Event from "../Event/event.class";
import Menuplan, {Menue} from "../Menuplan/menuplan.class";
import _ from "lodash";

import UsedRecipes from "../UsedRecipes/usedRecipes.class";

import {
  ERROR_NO_RECIPES_FOUND as TEXT_ERROR_NO_RECIPES_FOUND,
  ERROR_PARAMETER_NOT_PASSED as TEXT_ERROR_PARAMETER_NOT_PASSED,
} from "../../../constants/text";
import Recipe, {RecipeMaterialPosition} from "../../Recipe/recipe.class";
import {
  ProductTrace,
  ShoppingListTrace,
} from "../ShoppingList/shoppingListCollection.class";
import FirebaseAnalyticEvent from "../../../constants/firebaseEvent";
import {Stats} from "fs";
import {StatsField} from "../../Shared/stats.class";

export interface MaterialListEntry {
  properties: ListProperties;
  items: MaterialListMaterial[];
}

export interface MaterialListMaterial {
  checked: boolean;
  name: Material["name"];
  uid: Material["uid"];
  type: MaterialType;
  quantity: number;
  trace: ProductTrace[];
  manualEdit?: boolean;
  manualAdd?: boolean;
}

interface ListProperties {
  uid: string;
  name: string;
  selectedMenues: string[];
  generated: ChangeRecord;
}

interface Save {
  materialList: MaterialList;
  firebase: Firebase;
  authUser: AuthUser;
}
interface GetMaterialListListener {
  firebase: Firebase;
  uid: string;
  callback: (materialList: MaterialList) => void;
}
interface Factory {
  event: Event;
  authUser: AuthUser;
}
interface CreateNewList {
  name: string;
  selectedMenues: string[];
  menueplan: Menuplan;
  materials: Material[];
  firebase: Firebase;
  authUser: AuthUser;
}
interface DeleteList {
  materialList: MaterialList;
  listUidToDelete: ListProperties["uid"];
  authUser: AuthUser;
}
interface EditListName {
  materialList: MaterialList;
  listUidToEdit: ListProperties["uid"];
  newName: ListProperties["name"];
  authUser: AuthUser;
}
interface AddItem {
  material: Material;
  list: MaterialListMaterial[];
  quantity: number;
  planedPortions?: number;
  manuelAdd?: boolean;
  recipeUid?: Recipe["uid"];
  recipeName?: Recipe["name"];
  menueUid?: Menue["uid"];
}
interface DeleteMaterialFromList {
  materialUid: Material["uid"];
  list: MaterialListMaterial[];
}
interface RefreshLists {
  listUidToRefresh: string;
  materialList: MaterialList;
  keepManuallyAddedItems?: boolean;
  menueplan: Menuplan;
  materials: Material[];
  firebase: Firebase;
  authUser: AuthUser;
}

export default class MaterialList {
  uid: string;
  noOfLists: number;
  lists: {
    [key: string]: MaterialListEntry;
  };
  lastChange: ChangeRecord;

  /* =====================================================================
  // Konstruktor
  // ===================================================================== */
  constructor() {
    this.uid = "";
    this.noOfLists = 0;
    this.lists = {};
    this.lastChange = {date: new Date(0), fromUid: "", fromDisplayName: ""};
  }
  // ===================================================================== */
  /**
   * Factory
   * @param object - Referenz zu Event und AuthUser
   * @returns Objekt vom Typ MaterialList
   */
  static factory = ({event, authUser}: Factory) => {
    return {
      uid: event.uid,
      noOfLists: 0,
      lists: {},
      lastChange: Utils.createChangeRecord(authUser),
    } as MaterialList;
  };
  // ===================================================================== */
  /**
   * Materialliste Speichern
   * @param object - Objekt mit Materialliste, Firebase und Authuser
   * @returns void
   */
  static save = async ({materialList, firebase, authUser}: Save) => {
    materialList.lastChange = Utils.createChangeRecord(authUser);

    firebase.event.materialList
      .set({
        uids: [materialList.uid],
        value: materialList,
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
   * Listener für Materialliste holen
   * @param object - Objekt mit Firebase, Eventuid und Callback Funktion
   * @returns void
   */
  static getMaterialListListener = async ({
    firebase,
    uid,
    callback,
  }: GetMaterialListListener) => {
    let materialListListener = () => {};

    const materialListCallback = (materialList: MaterialList) => {
      // Menüplan mit UID anreichern
      materialList.uid = uid;
      callback(materialList);
    };

    await firebase.event.materialList
      .listen<MaterialList>({
        uids: [uid],
        callback: materialListCallback,
      })
      .then((result) => {
        materialListListener = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return materialListListener;
  };
  // ===================================================================== */
  /**
   * Neue Liste erstellen
   * @param object - Objekt mit Name der Liste, gewählte Menüs, Menüplan,
   *                 Event-UID, Liste mit Materialien, Firebase und AuthUser
   * @returns void
   */
  static createNewList = async ({
    name,
    selectedMenues,
    menueplan,
    materials,
    firebase,
    authUser,
  }: CreateNewList) => {
    let listEntry = {
      properties: {
        uid: Utils.generateUid(5),
        name: name,
        selectedMenues: selectedMenues,
        generated: Utils.createChangeRecord(authUser),
      },
      items: [],
    } as MaterialListEntry;

    // Alle Rezepte in den Menüs herausfiltern, die selektiert wurden
    const recipeList = UsedRecipes.defineSelectedRecipes({
      selectedMenues: selectedMenues,
      menueplan: menueplan,
    });

    let trace = {} as ShoppingListTrace;

    if (recipeList == undefined || recipeList.length == 0) {
      throw new Error(TEXT_ERROR_NO_RECIPES_FOUND);
    }

    // Alle Rezepte holen
    await Recipe.getMultipleRecipes({
      firebase: firebase,
      recipes: recipeList,
    })
      .then((result) => {
        // Über gewählte Menüs loopen
        selectedMenues.forEach((menueUid) => {
          // Über alle Rezepte dieses Menü loopen
          menueplan.menues[menueUid].mealRecipeOrder.forEach(
            (mealRecipeUid) => {
              // Alle Zutaten und Materiale holen
              let scaledMaterials = Recipe.scaleMaterials({
                recipe:
                  result[menueplan.mealRecipes[mealRecipeUid].recipe.recipeUid],
                portionsToScale:
                  menueplan.mealRecipes[mealRecipeUid].totalPortions,
              });

              // Alle skalierten Materialien hinzufügen
              Object.values(scaledMaterials).forEach(
                (recipeMaterial: RecipeMaterialPosition) => {
                  // Prüfen ob ein Gebrauchsmaterial
                  let material = materials.find(
                    (materialRecord) =>
                      materialRecord.uid == recipeMaterial.material.uid
                  );

                  if (material?.type == MaterialType.usage) {
                    listEntry.items = MaterialList.addMaterialToList({
                      material: material,
                      list: listEntry.items,
                      quantity: recipeMaterial.quantity,
                      planedPortions:
                        menueplan.mealRecipes[mealRecipeUid].totalPortions,
                      recipeName:
                        result[
                          menueplan.mealRecipes[mealRecipeUid].recipe.recipeUid
                        ].name,
                      recipeUid:
                        result[
                          menueplan.mealRecipes[mealRecipeUid].recipe.recipeUid
                        ].uid,
                      menueUid: menueUid,
                    });
                  }
                }
              );
            }
          );
          // Material aus dem Menü ebenefalls hinzufügen

          menueplan.menues[menueUid].materialOrder.forEach(
            (materialMenuUid) => {
              let menuPlanMaterialEntry = menueplan.materials[materialMenuUid];

              let material = materials.find(
                (material) => material.uid == menuPlanMaterialEntry.materialUid
              );

              if (material?.type == MaterialType.consumable) {
                listEntry.items = MaterialList.addMaterialToList({
                  material: material,
                  list: listEntry.items,
                  quantity: menuPlanMaterialEntry.totalQuantity,
                  menueUid: menueUid,
                });
              }
            }
          );
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return listEntry;
  };
  // ===================================================================== */
  /**
   * Neue Liste erstellen
   * @param object - Objekt mit MateriaListe und UID die es zu löschen gilt
   * @returns Angepasstes MateriaListe
   */
  static deleteList = ({
    materialList,
    listUidToDelete,
    authUser,
  }: DeleteList) => {
    let updatedMaterialList = _.cloneDeep(materialList) as MaterialList;

    delete updatedMaterialList.lists[listUidToDelete];

    updatedMaterialList.lastChange = Utils.createChangeRecord(authUser);
    updatedMaterialList.noOfLists--;

    return updatedMaterialList;
  };
  // ===================================================================== */
  /**
   * Name einer Liste anpassen
   * @param object - Objekt mit UsedRecipes und UID angepasst wird, neuer
   * Name der Liste und Authuser
   * @returns Angepasstes Used Recipes
   */
  static editListName = ({
    materialList,
    listUidToEdit,
    newName,
    authUser,
  }: EditListName) => {
    let updatedMaterialList = _.cloneDeep(materialList) as MaterialList;

    updatedMaterialList.lists[listUidToEdit].properties.name = newName;
    updatedMaterialList.lastChange = Utils.createChangeRecord(authUser);

    return updatedMaterialList;
  };

  // ===================================================================== */
  /**
   * Material zur Liste hinzufügen
   * @param object - Objekt mit Material und Array der bestehenden Liste
   * @returns Liste mit hinzugefügten Material
   */
  static addMaterialToList = ({
    material,
    list,
    quantity,
    planedPortions,
    manuelAdd = false,
    recipeUid = "",
    recipeName = "",
    menueUid = "",
  }: AddItem) => {
    // Prüfen ob es das Material bereits gibt
    let materialInList = list.find(
      (materialInList) => materialInList.uid == material.uid
    );

    if (materialInList) {
      // Nur die Menge anpassen und einen Trace Eintrag hinzufügen
      materialInList.quantity = Math.max(materialInList.quantity, quantity);
      materialInList.trace.push({
        menueUid: menueUid,
        recipe: {uid: recipeUid, name: recipeName},
        planedPortions: planedPortions ? planedPortions : 0,
        quantity: quantity,
        unit: "",
        manualAdd: manuelAdd,
      });
    } else {
      list.push({
        checked: false,
        name: material.name,
        uid: material.uid,
        type: material.type,
        quantity: quantity,
        trace: [
          {
            menueUid: menueUid,
            recipe: {uid: recipeUid, name: recipeName},
            planedPortions: planedPortions ? planedPortions : 0,
            quantity: quantity,
            unit: "",
            manualAdd: manuelAdd,
          },
        ],
      });
    }

    return list;
  };
  // ===================================================================== */
  /**
   * Material von Liste entfernen
   * @param object - Objekt mit Material und Array der bestehenden Liste
   * @returns Liste mit hinzugefügten Material
   */
  static deleteMaterialFromList = ({
    materialUid,
    list,
  }: DeleteMaterialFromList) => {
    return list.filter((material) => material.uid !== materialUid);
  };
  // ===================================================================== */
  /**
   * Bestehende Liste aktualisieren
   * @param object - Objekt mit Referenz zu Materialliste, ID der Liste,
   *                 die angepasst werden soll, Wert ob manuelle Werte bei-
   *                 behalten werden sollen, Menüplan, Materialien,
   *                 Firebase und Authuser
   * @returns Aktualisierte Materialliste
   */
  static refreshList = async ({
    listUidToRefresh,
    materialList,
    keepManuallyAddedItems = false,
    menueplan,
    materials,
    firebase,
    authUser,
  }: RefreshLists) => {
    let manuallyAddedItems: MaterialListMaterial[] = [];
    let updatedMaterialList = _.cloneDeep(materialList) as MaterialList;
    let listToUpdate = updatedMaterialList.lists[listUidToRefresh];

    if (keepManuallyAddedItems) {
      manuallyAddedItems = listToUpdate.items.filter((material) =>
        material.trace.some((trace) => trace.manualAdd == true)
      );
    }
    await MaterialList.createNewList({
      name: listToUpdate.properties.name,
      selectedMenues: listToUpdate.properties.selectedMenues,
      menueplan: menueplan,
      materials: materials,
      firebase: firebase,
      authUser: authUser,
    })
      .then((result) => {
        if (keepManuallyAddedItems) {
          updatedMaterialList.lists[listUidToRefresh] = {
            properties: result.properties,
            items: [...result.items, ...manuallyAddedItems],
          };
        } else {
          updatedMaterialList.lists[listUidToRefresh] = result;
        }
        updatedMaterialList.lists[listUidToRefresh].properties.uid =
          listUidToRefresh;
        updatedMaterialList.lastChange = Utils.createChangeRecord(authUser);
        firebase.analytics.logEvent(
          FirebaseAnalyticEvent.materialListRefreshed
        );
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return updatedMaterialList;
  };
}
