import Department from "../../Department/department.class";
import Firebase from "../../Firebase/firebase.class";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import Unit from "../../Unit/unit.class";
import Menuplan, {
  MealRecipeDeletedPrefix,
  Menue,
} from "../Menuplan/menuplan.class";
import UsedRecipes from "../UsedRecipes/usedRecipes.class";
import {
  ERROR_NO_RECIPE_PRODUCT_MATERIAL_FOUND as TEXT_ERROR_NO_RECIPE_PRODUCT_MATERIAL_FOUND,
  ERROR_PARAMETER_NOT_PASSED as TEXT_ERROR_PARAMETER_NOT_PASSED,
} from "../../../constants/text";
import Recipe, {
  Ingredient,
  RecipeMaterialPosition,
} from "../../Recipe/recipe.class";
import Product from "../../Product/product.class";
import {
  UnitConversionBasic,
  UnitConversionProducts,
} from "../../Unit/unitConversion.class";
import ShoppingListCollection, {
  ShoppingListTrace,
} from "./shoppingListCollection.class";
import Material, {MaterialType} from "../../Material/material.class";
import Event from "../Event/event.class";
import FirebaseAnalyticEvent from "../../../constants/firebaseEvent";
import Stats, {StatsField} from "../../Shared/stats.class";
import Feed, {FeedType} from "../../Shared/feed.class";
import Role from "../../../constants/roles";
import _ from "lodash";
import {logEvent} from "firebase/analytics";

export enum ItemType {
  none = 0,
  food,
  material,
}

export interface ShoppingListItem {
  checked: boolean;
  quantity: number;
  unit: Unit["key"];
  item: {uid: string; name: string};
  type: ItemType;
  manualEdit?: boolean;
  manualAdd?: boolean;
}

export interface ShoppingListDepartment {
  departmentUid: Department["uid"];
  departmentName: Department["name"];
  items: ShoppingListItem[];
}

interface CreateNewList {
  selectedMenues: Menue["uid"][];
  selectedDepartments: Department["uid"][];
  menueplan: Menuplan;
  products: Product[];
  materials: Material[];
  departments: Department[];
  units: Unit[];
  unitConversionBasic: UnitConversionBasic;
  unitConversionProducts: UnitConversionProducts;
  firebase: Firebase;
}

interface AddItem {
  shoppingListReference: ShoppingList;
  item: Product | Material;
  quantity: number;
  unit: Unit["key"];
  department: Department | undefined;
  addedManually?: boolean;
  itemType: ItemType;
}
interface DeleteItem {
  shoppingListReference: ShoppingList;
  itemUid: Product["uid"] | Material["uid"];
  unit: Unit["key"];
  departmentKey: Department["pos"];
}
// interface AddMaterial {
//   shoppingListReference: ShoppingList;
//   // material: RecipeMaterialPosition;
//   material: Material;
//   // materials: Material[];
//   quantity: number;
//   unit: Unit["key"];
//   department: Department | undefined;
//   addedManualy?: boolean;
// }

interface Save {
  firebase: Firebase;
  eventUid: Event["uid"];
  shoppingList: ShoppingList;
  authUser: AuthUser;
}

interface GetShoppingListListener {
  firebase: Firebase;
  eventUid: Event["uid"];
  shoppingListUid: ShoppingList["uid"];
  callback: (shoppingList: ShoppingList) => void;
  errorCallback: (error: Error) => void;
}

interface GetShoppingList {
  eventUid: Event["uid"];
  shoppingListUid: ShoppingList["uid"];
  firebase: Firebase;
}

interface Delete {
  firebase: Firebase;
  eventUid: Event["uid"];
  listUidToDelete: ShoppingList["uid"];
}
interface CountItems {
  shoppingList: ShoppingList;
}
export default class ShoppingList {
  uid: string;
  list: {
    [key: Department["pos"]]: ShoppingListDepartment;
  };

  /* =====================================================================
  // Konstruktor
  // ===================================================================== */
  constructor() {
    this.uid = "";
    this.list = {0: {departmentUid: "", departmentName: "", items: []}};
  }
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
    selectedMenues,
    selectedDepartments,
    menueplan,
    products,
    materials,
    departments,
    units,
    unitConversionBasic,
    unitConversionProducts,
    firebase,
  }: CreateNewList) => {
    const recipeList = UsedRecipes.defineSelectedRecipes({
      selectedMenues: selectedMenues,
      menueplan: menueplan,
    });

    const shoppingList = {list: {}, uid: ""} as ShoppingList;
    let trace = {} as ShoppingListTrace;
    let itemCounter = 0;
    // Alle Rezepte holen
    if (recipeList.length !== 0) {
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
                if (
                  menueplan.mealRecipes[
                    mealRecipeUid
                  ].recipe.recipeUid.includes(MealRecipeDeletedPrefix)
                ) {
                  return;
                }

                // Alle Zutaten und Materiale holen
                const scaledIngredients = Recipe.scaleIngredients({
                  recipe:
                    result[
                      menueplan.mealRecipes[mealRecipeUid].recipe.recipeUid
                    ],
                  portionsToScale:
                    menueplan.mealRecipes[mealRecipeUid].totalPortions,
                  scalingOptions: {convertUnits: true},
                  units: units,
                  unitConversionBasic: unitConversionBasic,
                  unitConversionProducts: unitConversionProducts,
                  products: products,
                });
                const scaledMaterials = Recipe.scaleMaterials({
                  recipe:
                    result[
                      menueplan.mealRecipes[mealRecipeUid].recipe.recipeUid
                    ],
                  portionsToScale:
                    menueplan.mealRecipes[mealRecipeUid].totalPortions,
                });

                // Alle skalierten Zutaten hinzufügen
                Object.values(scaledIngredients).forEach(
                  (ingredient: Ingredient) => {
                    const product = products.find(
                      (product) => product.uid == ingredient.product.uid
                    );
                    const department = departments.find(
                      (department) => department.uid == product?.department.uid
                    );

                    if (
                      !department ||
                      selectedDepartments.includes(department!.uid)
                    ) {
                      // Nur hinzufügen, wenn die Abteilung ausgewählt wurde
                      // oder die Abteilung nicht identifiziert werden konnte.
                      // Better Save than sorry
                      ShoppingList.addItem({
                        shoppingListReference: shoppingList,
                        item: product!,
                        quantity: ingredient.quantity,
                        unit: ingredient.unit,
                        department: department!,
                        itemType: ItemType.food,
                      });
                      itemCounter++;

                      trace = ShoppingListCollection.addTraceEntry({
                        trace: trace,
                        item: product!,
                        menueUid: menueUid,
                        recipe: {
                          uid: menueplan.mealRecipes[mealRecipeUid].recipe
                            .recipeUid,
                          name: menueplan.mealRecipes[mealRecipeUid].recipe
                            .name,
                        },
                        planedPortions:
                          menueplan.mealRecipes[mealRecipeUid].totalPortions,
                        quantity: ingredient.quantity,
                        unit: ingredient.unit,
                        itemType: ItemType.food,
                      });
                    }
                  }
                );
                // Alle skalierten Materialien hinzufügen
                Object.values(scaledMaterials).forEach(
                  (recipeMaterial: RecipeMaterialPosition) => {
                    // Prüfen ob ein Verbauchsmaterial
                    const material = materials.find(
                      (materialRecord) =>
                        materialRecord.uid == recipeMaterial.material.uid
                    );

                    const department = departments.find(
                      // Material geht fix in die Non-Food Abteilung
                      (department) =>
                        department.name.toUpperCase() == "NON FOOD"
                    );

                    if (
                      !department ||
                      (material?.type == MaterialType.consumable &&
                        selectedDepartments.includes(department!.uid))
                    ) {
                      // Nur hinzufügen, wenn die Abteilung ausgewählt wurde
                      ShoppingList.addItem({
                        shoppingListReference: shoppingList,
                        item: material!,
                        quantity: recipeMaterial.quantity,
                        unit: "",
                        // materials: materials,
                        department: department,
                        itemType: ItemType.material,
                      });
                      itemCounter++;

                      ShoppingListCollection.addTraceEntry({
                        trace: trace,
                        item: material!,
                        menueUid: menueUid,
                        recipe: {
                          uid: menueplan.mealRecipes[mealRecipeUid].recipe
                            .recipeUid,
                          name: menueplan.mealRecipes[mealRecipeUid].recipe
                            .name,
                        },
                        planedPortions:
                          menueplan.mealRecipes[mealRecipeUid].totalPortions,
                        quantity: recipeMaterial.quantity,
                        unit: "",
                        itemType: ItemType.material,
                      });
                    }
                  }
                );
              }
            );
          });
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    }
    // alle Produkte und Materialien holen
    // Produkte // Material aus dem Menü ebenefalls hinzufügen
    selectedMenues.forEach((menueUid) => {
      menueplan.menues[menueUid].productOrder.forEach((productMenuUid) => {
        const menuPlanProductEntry = menueplan.products[productMenuUid];

        const product = products.find(
          (product) => product.uid == menuPlanProductEntry.productUid
        );
        const department = departments.find(
          (department) => department.uid == product?.department.uid
        );
        if (!department || selectedDepartments.includes(department!.uid)) {
          // Nur hinzufügen, wenn die Abteilung ausgewählt wurde
          ShoppingList.addItem({
            shoppingListReference: shoppingList,
            item: product!,
            quantity: menuPlanProductEntry.totalQuantity,
            unit: menuPlanProductEntry.unit,
            department: department!,
            itemType: ItemType.food,
          });
          itemCounter++;

          // Trace nachführen
          trace = ShoppingListCollection.addTraceEntry({
            trace: trace,
            item: product!,
            menueUid: menueUid,
            recipe: {} as Recipe,
            quantity: menuPlanProductEntry.totalQuantity,
            unit: menuPlanProductEntry.unit,
            itemType: ItemType.food,
          });
        }
      });

      menueplan.menues[menueUid].materialOrder.forEach((materialMenuUid) => {
        const menuPlanMaterialEntry = menueplan.materials[materialMenuUid];

        const material = materials.find(
          (material) => material.uid == menuPlanMaterialEntry.materialUid
        );
        const department = departments.find(
          (department) => department.name.toUpperCase() == "NON FOOD"
        );

        if (
          (!department || selectedDepartments.includes(department!.uid)) &&
          material?.type == MaterialType.consumable
        ) {
          ShoppingList.addItem({
            shoppingListReference: shoppingList,
            item: material!,
            quantity: menuPlanMaterialEntry.totalQuantity,
            unit: menuPlanMaterialEntry.unit,
            department: department,
            itemType: ItemType.material,
          });
          itemCounter++;

          ShoppingListCollection.addTraceEntry({
            trace: trace,
            item: material!,
            menueUid: menueUid,
            recipe: {} as Recipe,
            quantity: menuPlanMaterialEntry.totalQuantity,
            unit: menuPlanMaterialEntry.unit,
            itemType: ItemType.material,
          });
        }
      });
    });

    if (itemCounter == 0) {
      throw new Error(TEXT_ERROR_NO_RECIPE_PRODUCT_MATERIAL_FOUND);
    }

    return {shoppingList, trace};
  };
  // ===================================================================== */
  /**
   * Produkt oder Material  der Liste hinzufügen
   * In die Liste (Referenz) das Produkt/Material hinzufügen. Falls der Eintrag bereits
   * vorhanden ist, wird dazu addiert.
   * @param object - Objekt mit Referenz zur Liste, Produkt/Material, die hinzugefügt
   *                 werden soll, Menge, Einheit, Abteilung und Hinweis ob das
   *                 hinzufügen aufgrund Manueller Tätigkeit geschieht.
   * @returns VOID : Da Liste als Referenz
   */
  static addItem = ({
    shoppingListReference,
    item,
    quantity,
    unit,
    department,
    addedManually = false,
    itemType,
  }: AddItem) => {
    if (!item) {
      return;
    }
    if (!department) {
      // Lieber falsch zuordnen, als nicht aufführen
      department = {
        uid: "NotIdetifiable",
        name: "Keine Zuordnung möglich",
        pos: 99,
        usable: true,
      };
    }
    if (
      !Object.prototype.hasOwnProperty.call(
        shoppingListReference.list,
        department.pos
      )
    ) {
      // Neue Abteilung hinzufügen
      shoppingListReference.list[department.pos] = {
        departmentUid: department.uid,
        departmentName: department?.name,
        items: [],
      };
    }

    let shoppingListItem = shoppingListReference.list[
      department.pos
    ].items.find(
      (listItem: ShoppingListItem) =>
        listItem.item.uid === item!.uid && listItem.unit === unit
    );

    if (shoppingListItem) {
      // Gibt es schon -- Addieren
      shoppingListItem.quantity = shoppingListItem.quantity + quantity;
    } else {
      // Neu -- hinzufügen || Andere Einheit, gleich behandeln, wie neues Produkt
      shoppingListItem = {
        checked: false,
        quantity: quantity,
        unit: unit,
        item: {uid: item.uid, name: item.name},
        type: itemType,
      };

      if (addedManually) {
        shoppingListItem.manualAdd = true;
      }

      shoppingListReference.list[department.pos].items.push(shoppingListItem);
      return;
    }
  };
  // ===================================================================== */
  /**
   * Produkt oder Material aus der Liste entfernen
  
   * @param object - Objekt mit Referenz zur Liste, Produkt/Material, die hinzugefügt
   *                 werden soll, Abteilung
   * @returns VOID : Da Liste als Referenz
   */
  static deleteItem = ({
    shoppingListReference,
    departmentKey,
    unit,
    itemUid,
  }: DeleteItem) => {
    const updatedShoppingList = _.cloneDeep(
      shoppingListReference
    ) as ShoppingList;

    updatedShoppingList!.list[departmentKey].items = updatedShoppingList!.list[
      departmentKey
    ].items.filter((item) => item.unit !== unit || item.item.uid !== itemUid);

    if (updatedShoppingList!.list[departmentKey].items.length == 0) {
      // Ganzer Eintrag löschen
      delete updatedShoppingList.list[departmentKey];
    }
    return updatedShoppingList;
  };

  // ===================================================================== */
  /**
   * Einkaufsliste speichern
   * @param object - Referenz zu Firebase, ShoppintListe und Authuser
   * @returns shoppingList - ganze ShoppingList
   */
  static save = async ({firebase, eventUid, shoppingList, authUser}: Save) => {
    if (!shoppingList.uid) {
      // Neue Liste
      await firebase.event.shoppingList
        .create({
          uids: [eventUid],
          value: shoppingList,
          authUser: authUser,
        })
        .then((result) => {
          shoppingList = result.value;

          // Feed Eintrag
          const indexList = Object.keys(shoppingList.list);
          const randomDepartment = shoppingList.list[
            indexList[Math.floor(Math.random() * indexList.length)]
          ].items as ShoppingListItem[];

          const randomItem =
            randomDepartment[
              Math.floor(Math.random() * randomDepartment.length)
            ];
          Feed.createFeedEntry({
            firebase: firebase,
            authUser: authUser,
            feedType: FeedType.shoppingListCreated,
            textElements: [randomItem.item.name],
            objectUid: eventUid,
            objectName: "",
            feedVisibility: Role.basic,
          });

          // Statistik mitführen
          Stats.incrementStat({
            firebase: firebase,
            field: StatsField.noShoppingLists,
            value: 1,
          });

          logEvent(
            firebase.analytics,
            FirebaseAnalyticEvent.shoppingListGenerated
          );
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
      // Statistik hochzählen
    } else {
      // reines Update
      await firebase.event.shoppingList
        .set({
          uids: [eventUid, shoppingList.uid],
          value: shoppingList,
          authUser: authUser,
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    }

    return shoppingList;
  };
  // ===================================================================== */
  /**
   * Listener zu bestimmter ShoppingList holen
   * @param object - Referenz zu Firebase, ShoppintListeUid und Callback Funktion
   * @returns shoppingListListener - Listener mit Unsubscribe Methode
   */
  static getShoppingListListener = async ({
    firebase,
    eventUid,
    shoppingListUid,
    callback,
    errorCallback,
  }: GetShoppingListListener) => {
    const shoppingListCallback = (shoppingList: ShoppingList) => {
      // Menüplan mit UID anreichern
      shoppingList.uid = shoppingListUid;
      callback(shoppingList);
    };
    return await firebase.event.shoppingList
      .listen<ShoppingList>({
        uids: [eventUid, shoppingListUid],
        callback: shoppingListCallback,
        errorCallback: errorCallback,
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
   * Shopping-List lesen
   * @param object - Referenz zu Firebase, ShoppintListeUid udn AuthUser
   * @returns shoppingList - Listener mit Unsubscribe Methode
   */
  static getShoppingList = async ({
    eventUid,
    shoppingListUid,
    firebase,
  }: GetShoppingList) => {
    let shoppingList = new ShoppingList();
    if (!firebase || !eventUid || !shoppingListUid) {
      throw new Error(TEXT_ERROR_PARAMETER_NOT_PASSED);
    }

    await firebase.event.shoppingList
      .read<ShoppingList>({uids: [eventUid, shoppingListUid]})
      .then((result) => {
        shoppingList = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return shoppingList;
  };
  // ===================================================================== */
  /**
   * Liste löschen
   * @param object - Referenz zu Firabse, ShoppintListeUid
   * @returns void
   */
  static delete = async ({firebase, eventUid, listUidToDelete}: Delete) => {
    firebase.event.shoppingList
      .delete({uids: [eventUid, listUidToDelete]})
      .catch((error) => {
        console.error(error);
        throw error;
      });

    logEvent(firebase.analytics, FirebaseAnalyticEvent.shoppingListDeleted);
  };
  // ===================================================================== */
  /**
   * Anzahl Items zählen
   * @param object - Referenz auf ShoppingList
   * @returns result: Anzahl Items
   */
  static countItems = ({shoppingList}: CountItems) => {
    let result = 0;
    Object.values(shoppingList.list).forEach(
      (department) => (result += department.items.length)
    );
    return result;
  };
}
