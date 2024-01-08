import Utils from "../../Shared/utils.class";
import * as DEFAULT_VALUES from "../../../constants/defaultValues";
import {ChangeRecord} from "../../Shared/global.interface";
import Event from "../Event/event.class";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import Firebase from "../../Firebase";
import LocalStorageHandler from "../../Shared/localStorageHandler.class";
import Recipe, {RecipeType} from "../../Recipe/recipe.class";
import Product from "../../Product/product.class";
import Material from "../../Material/material.class";
import EventGroupConfiguration, {
  Intolerance,
  Diet,
} from "../GroupConfiguration/groupConfiguration.class";
import RecipeShort from "../../Recipe/recipeShort.class";
import Unit from "../../Unit/unit.class";
import UsedRecipes from "../UsedRecipes/usedRecipes.class";
import _ from "lodash";
// export interface Meal {
//   uid: string;
//   pos: number;
//   name: string;
// }

// meal (pro Typ/Tag 1)
// uid: (eindeutige uid, datum, mealtypeuid), order Menu
// TODO: dass muss automatisch erzeugt werden für alle! jeweils schon in der Factory

// menu (mehrere pro meal möglich)
//   uid: {uid (neue eindeutige UID), name}
// recipeOrder,
// materialOrder
// productOrder

// recipes
//  |- uid: {eindeutige UID, recipeuid, einplanung(Mengen)}

// gleiches mit material und Products

interface MenuplanObjectStructure<T> {
  entries: {[key: string]: T};
  order: string[];
}

export interface MealType {
  uid: string;
  name: string;
}
export interface Menue {
  uid: string;
  name: string;
  mealRecipeOrder: Recipe["uid"][];
  materialOrder: Material["uid"][];
  productOrder: Product["uid"][];
}
export interface Menues {
  [key: Menue["uid"]]: Menue;
}
export interface Meal {
  uid: string;
  date: string; // YYYY-MM-DD,
  mealType: MealType["uid"];
  mealTypeName?: MealType["name"];
  menuOrder: Menue["uid"][];
}
export interface Meals {
  [key: Meal["uid"]]: Meal;
}
export interface Note {
  uid: string;
  date: string; // YYYY-MM-DD
  menueUid: Menue["uid"];
  text: string;
}
export interface Notes {
  [key: Note["uid"]]: Note;
}
export enum PlanedIntolerances {
  ALL = "ALL",
  FIX = "FIX",
}
export enum PlanedDiet {
  ALL = "ALL",
  FIX = "FIX",
}
export interface MealRecipes {
  [key: MealRecipe["uid"]]: MealRecipe;
}
export interface PortionPlan {
  diet: PlanedDiet | Diet["uid"];
  intolerance: PlanedIntolerances | Intolerance["uid"];
  factor: number;
  totalPortions: number;
}
export const MealRecipeDeletedPrefix = "[DELETED]";
export interface MealRecipe {
  uid: string;
  recipe: {
    recipeUid: Recipe["uid"];
    name: Recipe["name"];
    type: Recipe["type"];
    createdFromUid: Recipe["created"]["fromUid"];
    variantName?: string;
  };
  plan: PortionPlan[];
  totalPortions: number;
}
export interface Materials {
  [key: MenuplanMaterial["uid"]]: MenuplanMaterial;
}
export interface Products {
  [key: MenuplanProduct["uid"]]: MenuplanProduct;
}
export interface MenuplanMaterial {
  uid: string;
  quantity: number;
  unit: Unit["key"];
  materialUid: Material["uid"];
  materialName: Material["name"];
  planMode: GoodsPlanMode;
  plan: PortionPlan[];
  // Summer aller plan-positionen
  totalQuantity: number;
}
export interface MenuplanProduct {
  uid: string;
  quantity: number;
  unit: Unit["key"];
  productUid: Product["uid"];
  productName: Product["name"];
  planMode: GoodsPlanMode;
  plan: PortionPlan[];
  // Summer aller plan-positionen
  totalQuantity: number;
}

export enum GoodsType {
  NONE,
  MATERIAL = "MATERIAL",
  PRODUCT = "PRODUCT",
}
export enum GoodsPlanMode {
  TOTAL,
  PER_PORTION,
}
export interface PlanedMealsRecipe {
  mealPlanRecipe: MealRecipe["uid"];
  meal: Meal;
  menue: Menue;
  mealPlan: PortionPlan[];
}
interface Factory {
  event: Event;
  authUser: AuthUser;
}
interface CreateMealType {
  newMealName: MealType["name"];
}
interface CreateMeal {
  mealType: MealType["uid"];
  date: Date | string;
}
interface AddMealType {
  mealType: MealType;
  mealTypes: Menuplan["mealTypes"];
  meals: Menuplan["meals"];
  menues: Menuplan["menues"];
  dates: Menuplan["dates"];
}
interface DeleteMealType {
  mealTypeToDelete: MealType;
  mealTypes: Menuplan["mealTypes"];
  meals: Menuplan["meals"];
  menues: Menuplan["menues"];
  mealRecipes: Menuplan["mealRecipes"];
  products: Menuplan["products"];
  materials: Menuplan["materials"];
}
interface GetMenuplan {
  firebase: Firebase;
  uid: string;
  callback: (menuplan: Menuplan) => void;
}

interface Save {
  menuplan: Menuplan;
  firebase: Firebase;
  authUser: AuthUser;
}
interface Delete {
  eventUid: Event["uid"];
  firebase: Firebase;
}
interface FindMealOfMenu {
  menueUid: Menue["uid"];
  meals: Menuplan["meals"];
}
interface FindMenueOfMealRecipe {
  mealRecipeUid: MealRecipe["uid"];
  menues: Menuplan["menues"];
}
interface FindMenueOfMealProduct {
  productUid: MenuplanProduct["uid"];
  menues: Menuplan["menues"];
}
interface FindMenueOfMealMaterial {
  materialUid: MenuplanMaterial["uid"];
  menues: Menuplan["menues"];
}
interface CreateMealRecipe {
  recipe: RecipeShort;
  plan: {
    [key: Intolerance["uid"]]: {
      active: boolean;
      factor: string;
      portions: number;
      total: number;
      diet: Diet["uid"];
    };
  };
}
interface AddPlanToGood<T> {
  good: T;
  plan: {
    [key: Intolerance["uid"]]: {
      active: boolean;
      factor: string;
      portions: number;
      total: number;
      diet: Diet["uid"];
    };
  };
}

interface RecalculatePortions {
  menuplan: Menuplan;
  groupConfig: EventGroupConfiguration;
}
interface RecalculateSinglePortion {
  portionPlan: PortionPlan;
  groupConfig: EventGroupConfiguration;
}

interface _GetEventDateList {
  event: Event;
}
interface AdjustMenuplanWithNewDays {
  menuplan: Menuplan;
  existingEvent: Event;
  newEvent: Event;
}

export interface MenueCoordinates {
  menueUid: Menue["uid"];
  date: Date;
  menueName: Menue["name"];
  mealUid: Meal["uid"];
  mealType: MealType;
}

interface SortSelectedMenues {
  menueList: string[];
  menuplan: Menuplan;
}
export default class Menuplan {
  uid: string;
  dates: Date[];
  // meals: Meal[];
  meals: Meals;
  menues: Menues;
  mealTypes: MenuplanObjectStructure<MealType>;
  notes: Notes;
  mealRecipes: MealRecipes;
  created: ChangeRecord;
  lastChange: ChangeRecord;
  materials: Materials;
  products: Products;

  /* =====================================================================
   // Konstruktor
   // ===================================================================== */
  constructor() {
    this.uid = "";
    this.dates = [];
    this.mealTypes = {
      entries: {} as MenuplanObjectStructure<MealType>["entries"],
      order: [],
    };
    this.meals = {} as Meals;
    this.menues = {} as Menues;
    this.notes = {} as Notes;
    this.mealRecipes = {} as MealRecipes;
    this.materials = {} as Materials;
    this.products = {} as Products;
    this.created = {date: new Date(0), fromUid: "", fromDisplayName: ""};
    this.lastChange = {date: new Date(0), fromUid: "", fromDisplayName: ""};
  }
  /* =====================================================================
   // Factory
   // ===================================================================== */
  // static factory({
  //   dates,
  //   meals,
  //   notes,
  //   recipes,
  //   createdAt,
  //   createdFromUid,
  //   createdFromDisplayName,
  //   lastChangeAt,
  //   lastChangeFromUid,
  //   lastChangeFromDisplayName,
  // }: Menuplan) {
  //   let menuplan = new Menuplan();
  //   menuplan.dates = dates;
  //   menuplan.meals = meals;
  //   menuplan.notes = notes;
  //   menuplan.recipes = recipes;
  //   menuplan.createdAt = createdAt;
  //   menuplan.createdFromUid = createdFromUid;
  //   menuplan.createdFromDisplayName = createdFromDisplayName;
  //   menuplan.lastChangeAt = lastChangeAt;
  //   menuplan.lastChangeFromUid = lastChangeFromUid;
  //   menuplan.lastChangeFromDisplayName = lastChangeFromDisplayName;
  //   return menuplan;
  // }

  // ===================================================================== */
  /**
   * Menüplan erstellen anhand eines Events
   */
  static factory = ({event, authUser}: Factory) => {
    let menuplan = new Menuplan();

    menuplan.uid = event.uid;

    menuplan.created = {
      date: new Date(),
      fromUid: authUser.uid,
      fromDisplayName: authUser.publicProfile.displayName,
    };

    // Datumsliste generieren
    menuplan.dates = Menuplan._getEventDateList({event: event});

    // Mahlzeiten generieren (aus Default)
    DEFAULT_VALUES.MENUPLAN_MEALS.forEach((mealType) => {
      let mealTypeUid = Utils.generateUid(5);
      mealType.uid = mealTypeUid;
      menuplan.mealTypes.order.push(mealTypeUid);
      menuplan.mealTypes.entries[mealTypeUid] = mealType;
    });

    // Für jedes Datum/Mahlzeit ein Meal generieren
    Object.values(menuplan.mealTypes.entries).forEach((mealType) => {
      menuplan.dates.forEach((date) => {
        // Mahlzeit erstellen
        let meal = Menuplan.createMeal({mealType: mealType.uid, date: date});
        menuplan.meals[meal.uid] = meal;
        // Ein Menü erzeugen und der Mahlzeit hinzufügen
        let menu = Menuplan.createMenu();
        menuplan.meals[meal.uid].menuOrder.push(menu.uid);
        menuplan.menues[menu.uid] = menu;
      });
    });

    return menuplan;
  };
  // ===================================================================== */
  /**
   * Menuplan mit Listener lesen
   * @param param0
   * @returns
   */
  static getMenuplanListener = async ({
    firebase,
    uid,
    callback,
  }: GetMenuplan) => {
    let menuplanListener = () => {};

    const menuplanCallback = (menuplan: Menuplan) => {
      // Menüplan mit UID anreichern
      menuplan.uid = uid;
      callback(menuplan);
    };
    const errorCallback = (error: any) => {
      console.error(error);
      throw error;
    };

    await firebase.event.menuplan
      .listen<Menuplan>({
        uids: [uid],
        callback: menuplanCallback,
        errorCallback: errorCallback,
      })
      .then((result) => {
        menuplanListener = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return menuplanListener;
  };
  // ===================================================================== */
  /**
   * Save  of menuplan
   */
  static save = async ({menuplan, firebase, authUser}: Save) => {
    // Set weil auch gelöschte Werte raus sollen (Update = merge:true)

    menuplan.lastChange = Utils.createChangeRecord(authUser);

    firebase.event.menuplan
      .set({
        uids: [menuplan.uid],
        value: menuplan,
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
   * Menüplan löschen (gesamtes Dokument)
   * @param Object - Event-UID und Firebase
   */
  static delete = async ({eventUid, firebase}: Delete) => {
    firebase.event.menuplan.delete({uids: [eventUid]}).catch((error) => {
      console.error(error);
      throw error;
    });
  };
  // ===================================================================== */
  /**
   * Neue Mahlzeit erstellen
   * alle Parameter als 1 Objekt
   * @param newMealName
   * @returns object --> neues Meal
   */
  static createMealType = ({newMealName}: CreateMealType) => {
    return <MealType>{
      name: newMealName,
      uid: Utils.generateUid(5),
    };
  };
  // ===================================================================== */
  /**
   * Neue Mahlzeit zu Menüplan hinzufügen
   * in Allen nötigen Objekten die neue Mahlzeit hinzufügen, damit diese im
   * Menüplan angezeigt werden kann.
   * @param object {mealType --> neue Mahlzeit, mealTypes: alle bestehende Mahlzeiten, meal: Mahlzeit pro Tag/Mahlzeittyp, menues: Menüs }
   * @returns object {mealTypes, meals, menues} --> kann mittels spread wieder auseinander genommen werden
   */
  static addMealType = ({
    mealType,
    mealTypes,
    meals,
    menues,
    dates,
  }: AddMealType) => {
    let newMealTypes = {...mealTypes};
    let newMeals = {...meals};
    let newMenues = {...menues};

    // Mahlzeit in Übersicht aufnehmen
    newMealTypes.entries[mealType.uid] = mealType;
    newMealTypes.order.push(mealType.uid);

    // Für jeden Tag eine Mahlzeit erstellen und Menü einfügen
    dates.forEach((date) => {
      // Mahlzeit erstellen
      let meal = Menuplan.createMeal({mealType: mealType.uid, date: date});
      newMeals[meal.uid] = meal;
      // Ein Menü erzeugen und der Mahlzeit hinzufügen
      let menu = Menuplan.createMenu();
      newMeals[meal.uid].menuOrder.push(menu.uid);
      newMenues[menu.uid] = menu;
    });

    return {mealTypes: newMealTypes, meals: newMeals, menues: newMenues};
  };
  // ===================================================================== */
  /**
   * Mahlzeit aus Menüplan löschen
   */
  static deleteMealType = ({
    mealTypeToDelete,
    mealTypes,
    meals,
    menues,
    mealRecipes,
    products,
    materials,
  }: DeleteMealType) => {
    // Mahlzeit allgemein löschen

    if (!mealTypeToDelete.uid) {
      return {
        mealTypes: mealTypes,
        meals: meals,
        menues: menues,
        mealRecipes: mealRecipes,
        products: products,
        materials: materials,
      };
    }
    let newMealTypes = {...mealTypes};
    let newMeals = {...meals};
    let newMenues = {...menues};
    let newMealRecipes = {...mealRecipes};
    let newProducts = {...products};
    let newMaterials = {...materials};

    // Mahlzeittyp löschen
    newMealTypes.order = mealTypes.order.filter(
      (mealType) => mealType != mealTypeToDelete.uid
    );
    delete newMealTypes.entries[mealTypeToDelete.uid];

    // alle Meals und Menüs löschen
    Object.keys(meals).forEach((mealUid) => {
      if (meals[mealUid].mealType == mealTypeToDelete.uid) {
        // Alle Menüs löschen, die in dieser Mahlzeit sind
        meals[mealUid].menuOrder.forEach((menuUid) => {
          // Alle Rezepte löschen
          menues[menuUid].mealRecipeOrder.forEach(
            (mealRecipeUid) => delete newMealRecipes[mealRecipeUid]
          );
          // Alle Produkte löschen
          menues[menuUid].productOrder.forEach(
            (productUid) => delete newProducts[productUid]
          );
          // Alle Materialien löschen
          menues[menuUid].materialOrder.forEach(
            (materialUid) => delete newMaterials[materialUid]
          );
          delete newMenues[menuUid];
        });
        // Mahlzeit selbst löschen
        delete newMeals[mealUid];
      }
    });

    return {
      mealTypes: newMealTypes,
      meals: newMeals,
      menues: newMenues,
      mealRecipes: newMealRecipes,
      products: newProducts,
      materials: newMaterials,
    };
  };

  // ===================================================================== */
  /**
   * Leere Notiz erzeugen
   * @returns leere Notiz
   */
  static createEmptyNote = () => {
    return {
      uid: Utils.generateUid(5),
      text: "",
      date: Utils.dateAsString(new Date()),
      menueUid: "",
    } as Note;
  };
  // ===================================================================== */
  /**
   * Leere Mahlzeit erzeugen
   * Die Mahlzeit kommt pro Datum und Mahlzeittyp einmal vor und kann mehrere
   * Menüs halten
   * @param object {mealTyp, date}
   * @returns object as Meal
   */
  static createMeal = ({mealType, date}: CreateMeal) => {
    let stringDate: string;

    if (date instanceof Date) {
      stringDate = Utils.dateAsString(date);
    } else {
      stringDate = date;
    }

    return {
      uid: Utils.generateUid(5),
      date: stringDate,
      mealType: mealType,
      menuOrder: [],
    } as Meal;
  };
  // ===================================================================== */
  /**
   * Neues Menü erstellen
   * @returns object as Menu
   */
  static createMenu = () => {
    return {
      uid: Utils.generateUid(5),
      name: "",
      mealRecipeOrder: [],
      productOrder: [],
      materialOrder: [],
    } as Menue;
  };
  // ===================================================================== */
  /**
   * Die Mahlzeit finden, in der das Menü sich befindet
   * @param menueUid - UID des Menüs
   * @returns meal - Mahlzeit
   */
  static findMealOfMenu = ({menueUid, meals}: FindMealOfMenu) => {
    let mealUid = Object.keys(meals).find((mealUid) => {
      if (
        meals[mealUid].menuOrder.find(
          (menuUidInMeal) => menuUidInMeal == menueUid
        )
      ) {
        return mealUid;
      }
    });
    return meals[mealUid as string];
  };
  // ===================================================================== */
  /**
   * Das Menü finden, in dem das eigeplante Rezept sich befindet
   * @param mealRecipeUid - UID des Menüs
   * @returns menue - Menü
   */
  static findMenueOfMealRecipe = ({
    mealRecipeUid,
    menues,
  }: FindMenueOfMealRecipe) => {
    let menue = Object.values(menues).find((menue) =>
      menue.mealRecipeOrder.includes(mealRecipeUid)
    );
    return menue;
  };
  // ===================================================================== */
  /**
   * Das Menü finden, in dem das eigeplante Produkt sich befindet
   * @param productUid - UID des Menüs
   * @returns menue - Menü
   */
  static findMenueOfMealProduct = ({
    productUid,
    menues,
  }: FindMenueOfMealProduct) => {
    let menue = Object.values(menues).find((menue) =>
      menue.productOrder.includes(productUid)
    );
    return menue;
  };
  // ===================================================================== */
  /**
   * Das Menü finden, in dem das eigeplante Material sich befindet
   * @param materialUid - UID des Menüs
   * @returns menue - Menü
   */
  static findMenueOfMealMaterial = ({
    materialUid,
    menues,
  }: FindMenueOfMealMaterial) => {
    let menue = Object.values(menues).find((menue) =>
      menue.materialOrder.includes(materialUid)
    );
    return menue;
  };
  // ===================================================================== */
  /**
   * Ein neues Rezept, welches im Menüplan eingeplant wird erzeugen
   * @returns
   */
  static createMealRecipe = ({recipe, plan}: CreateMealRecipe) => {
    let mealRecipe = {} as MealRecipe;
    mealRecipe.plan = [];
    Object.keys(plan).forEach((intoleranceUid) =>
      mealRecipe.plan.push({
        diet: plan[intoleranceUid].diet,
        intolerance: intoleranceUid,
        factor: parseFloat(plan[intoleranceUid].factor),
        totalPortions: plan[intoleranceUid].total,
      })
    );

    mealRecipe.uid = Utils.generateUid(5);

    mealRecipe.recipe = {
      recipeUid: recipe.uid,
      name: recipe.name,
      type: recipe.type,
      createdFromUid: recipe.created.fromUid,
    };

    if (recipe.type == RecipeType.variant) {
      mealRecipe.recipe.variantName = recipe.variantName;
    }

    mealRecipe.totalPortions = mealRecipe.plan.reduce(
      (runningSum, intolerance) => {
        runningSum = runningSum + intolerance.totalPortions;
        return runningSum;
      },
      0
    );

    return mealRecipe;
  };
  // ===================================================================== */
  /**
   * Ein neues Material für die Einplanung erstellen
   * @returns Material
   */
  static createMaterial = () => {
    let material = {} as MenuplanMaterial;

    material.uid = Utils.generateUid(5);
    material.materialName = "";
    material.materialUid = "";
    material.quantity = 0;
    material.unit = "";
    material.planMode = GoodsPlanMode.TOTAL;
    material.plan = [];
    return material;
  };
  // ===================================================================== */
  /**
   * Der Plan für ein Menuplan-Material/Produkt einfügen
   * @returns Menuplan-Material/Produkt
   */
  static addPlanToGood<T extends MenuplanProduct | MenuplanMaterial>({
    good,
    plan,
  }: AddPlanToGood<T>) {
    Object.keys(plan).forEach((intoleranceUid) =>
      good.plan.push({
        diet: plan[intoleranceUid].diet,
        intolerance: intoleranceUid,
        factor: parseFloat(plan[intoleranceUid].factor),
        totalPortions: plan[intoleranceUid].total,
      })
    );

    good.totalQuantity = good.plan.reduce((runningSum, intolerance) => {
      runningSum = runningSum + intolerance.totalPortions;
      return runningSum;
    }, 0);

    return good;
  }
  // ===================================================================== */
  /**
   * Ein neues Produkt für die Einplanung erstellen
   * @returns Produkt
   */
  static createProduct = () => {
    let product = {} as MenuplanProduct;

    product.uid = Utils.generateUid(5);
    product.productName = "";
    product.productUid = "";
    product.quantity = 0;
    product.unit = "";
    product.planMode = GoodsPlanMode.TOTAL;
    product.plan = [];
    return product;
  };
  // ===================================================================== */
  /**
   * Alle Portionen anhand der neuen GroupConfig berechnen
   * @returns Menuüplan
   */
  static recalculatePortions = ({
    menuplan,
    groupConfig,
  }: RecalculatePortions) => {
    Object.values(menuplan.mealRecipes).forEach((mealRecipe) => {
      let totalPortions = 0;
      mealRecipe.plan = mealRecipe.plan.map((plan) => {
        if (
          plan.diet != PlanedDiet.FIX &&
          plan.intolerance != PlanedIntolerances.FIX
        ) {
          // Nur ändern was nicht fix eingeplant wurde
          plan = Menuplan._recalculateSinglePortion({
            portionPlan: plan,
            groupConfig: groupConfig,
          });
          totalPortions += plan.totalPortions;
          return plan;
        } else {
          return plan;
        }
      });
      mealRecipe.totalPortions = totalPortions;
      // Aus der Einplanung löschen, was es nicht mehr gibt
      mealRecipe.plan = mealRecipe.plan.filter(
        (plan) => plan.diet != "" && plan.intolerance != ""
      );
    });

    // Produkte iterieren
    Object.values(menuplan.products).forEach((product) => {
      let totalPortions = 0;
      product.plan = product.plan.map((plan) => {
        if (
          plan.diet != PlanedDiet.FIX &&
          plan.intolerance != PlanedIntolerances.FIX
        ) {
          // Nur ändern was nicht fix eingeplant wurde
          plan = Menuplan._recalculateSinglePortion({
            portionPlan: plan,
            groupConfig: groupConfig,
          });
          totalPortions += plan.totalPortions;
          return plan;
        } else {
          return plan;
        }
      });
      product.totalQuantity = totalPortions;
      // Aus der Einplanung löschen, was es nicht mehr gibt
      product.plan = product.plan.filter(
        (plan) => plan.diet != "" && plan.intolerance != ""
      );
    });

    // Material iterieren
    Object.values(menuplan.materials).forEach((material) => {
      let totalPortions = 0;
      material.plan = material.plan.map((plan) => {
        if (
          plan.diet != PlanedDiet.FIX &&
          plan.intolerance != PlanedIntolerances.FIX
        ) {
          // Nur ändern was nicht fix eingeplant wurde
          plan = Menuplan._recalculateSinglePortion({
            portionPlan: plan,
            groupConfig: groupConfig,
          });
          totalPortions += plan.totalPortions;
          return plan;
        } else {
          return plan;
        }
      });
      material.totalQuantity = totalPortions;
      // Aus der Einplanung löschen, was es nicht mehr gibt
      material.plan = material.plan.filter(
        (plan) => plan.diet != "" && plan.intolerance != ""
      );
    });

    return menuplan;
  };
  // ===================================================================== */
  /**
   * Übergebene Menües in die Reihenfolge bringen, in der sie auch eingeplant
   * sind
   * @param Object - Objekt mit Array-MenueUid und der Menueplan
   * @returns Array mit MenueUid in der richtigen Reihenfolge
   */
  static sortSelectedMenues = ({menueList, menuplan}: SortSelectedMenues) => {
    let result: MenueCoordinates[] = [];

    menuplan.dates.forEach((date) => {
      let dateAsString = Utils.dateAsString(date);
      menuplan.mealTypes.order.forEach((mealTypeUid) => {
        let meal = Object.values(menuplan.meals).find(
          (meal) => meal.date == dateAsString && meal.mealType == mealTypeUid
        );
        if (meal) {
          meal.menuOrder.forEach((menueUid) => {
            if (menueList.includes(menueUid)) {
              result.push({
                menueUid: menueUid,
                date: date,
                menueName: menuplan.menues[menueUid].name,
                mealUid: meal!.uid,
                mealType: menuplan.mealTypes.entries[mealTypeUid],
              });
            }
          });
        }
      });
    });
    return result;
  };

  // ===================================================================== */
  /**
   * Einzelne Portion neu berechnen
   * @returns Geplante Portion
   */
  static _recalculateSinglePortion = ({
    portionPlan,
    groupConfig,
  }: RecalculateSinglePortion) => {
    // Anzahl Portionen holen, die in der GroupConfig hinterlegt ist
    let planedPortions = 0;

    // Prüfen ob es die Diät nocht gibt
    if (
      portionPlan.diet != PlanedDiet.ALL &&
      portionPlan.diet != PlanedDiet.FIX &&
      !Object.values(groupConfig.diets.entries).some(
        (entry) => entry.uid == portionPlan.diet
      )
    ) {
      portionPlan.diet = "";
      portionPlan.intolerance = "";
      portionPlan.totalPortions = 0;
      return portionPlan;
    }

    // Prüfen ob es die Intoleranz nocht gibt
    if (
      portionPlan.intolerance != PlanedIntolerances.ALL &&
      portionPlan.intolerance != PlanedIntolerances.FIX &&
      !Object.values(groupConfig.intolerances.entries).some(
        (entry) => entry.uid == portionPlan.intolerance
      )
    ) {
      portionPlan.diet = "";
      portionPlan.intolerance = "";
      portionPlan.totalPortions = 0;
      return portionPlan;
    }

    if (
      portionPlan.diet == PlanedDiet.ALL &&
      portionPlan.intolerance == PlanedIntolerances.ALL
    ) {
      // Alle Portionen
      planedPortions = groupConfig.totalPortions;
    } else if (
      portionPlan.diet == PlanedDiet.ALL &&
      portionPlan.intolerance != PlanedIntolerances.ALL
    ) {
      // Alle einer bestimmten Intoleranz
      planedPortions =
        groupConfig.intolerances.entries[portionPlan.intolerance].totalPortions;
    } else if (
      portionPlan.diet != PlanedDiet.ALL &&
      portionPlan.intolerance == PlanedIntolerances.ALL
    ) {
      // Aller einer bestimmten Diät
      planedPortions =
        groupConfig.diets.entries[portionPlan.diet].totalPortions;
    } else {
      // Bestimmte Diät mit Intoleranz
      planedPortions =
        groupConfig.portions[portionPlan.diet][portionPlan.intolerance];
    }

    portionPlan.totalPortions = planedPortions * portionPlan.factor;

    return portionPlan;
  };

  // /* =====================================================================
  // // Neue Notiz anlegen
  // // ===================================================================== */
  // static createNote = ({ date, mealUid, type, text }) => {
  //   return {
  //     uid: Utils.generateUid(5),
  //     type: type,
  //     text: text,
  //     date: date,
  //     mealUid: mealUid,
  //   };
  // };
  // /* =====================================================================
  // // Neues (Menüplan-) Rezept anlegen
  // // ===================================================================== */
  // static createMealRecipe = ({
  //   date,
  //   mealUid,
  //   recipeUid,
  //   recipeName,
  //   pictureSrc,
  //   noOfServings,
  // }) => {
  //   return {
  //     uid: Utils.generateUid(5),
  //     date: date,
  //     mealUid: mealUid,
  //     recipeUid: recipeUid,
  //     recipeName: recipeName,
  //     pictureSrc: pictureSrc,
  //     noOfServings: noOfServings,
  //   };
  // };
  // /* =====================================================================
  // // Mahlzeit Position hoch schieben
  // // ===================================================================== */
  // static moveMealUp = ({ meals, meal }) => {
  //   meals = Utils.moveArrayElementUp({
  //     array: meals,
  //     indexToMoveUp: meal.pos - 1,
  //   });
  //   meals = Utils.renumberArray({ array: meals, field: "pos" });
  //   return meals;
  // };
  // /* =====================================================================
  // // Mahlzeit Position runter schieben
  // // ===================================================================== */
  // static moveMealDown = ({ meals, meal }) => {
  //   meals = Utils.moveArrayElementDown({
  //     array: meals,
  //     indexToMoveDown: meal.pos - 1,
  //   });
  //   meals = Utils.renumberArray({ array: meals, field: "pos" });
  //   return meals;
  // };
  // /* =====================================================================
  // // Mahlzeit in Plan hinzufügen
  // // ===================================================================== */
  // // static addMealToPlan = ({ plan, meal }) => {
  // //   plan.forEach((day) => {
  // //     day.meals.push({ mealUid: meal.uid, recipes: [], notes: [] });
  // //   });
  // //   return plan;
  // // };
  // /* =====================================================================
  // // Notiz in Plan hinzufügen
  // // ===================================================================== */
  // // static addNoteToPlan = ({ plan, note, headNote, mealDate, mealUid }) => {
  // //   let day = plan.find((day) => day.date.getTime() === mealDate.getTime());
  // //   if (headNote) {
  // //     day.headNotes.push(note);
  // //   } else {
  // //     let meal = day.meals.find((meal) => meal.mealUid === mealUid);
  // //     meal.notes.push(note);
  // //   }
  // //   return plan;
  // // };
  // /* =====================================================================
  // // PRIVAT: Liste mit Tagen generieren
  // // ===================================================================== */
  // ===================================================================== */
  /**
   * Datumsliste generieren
   * Anhand der Zeitscheiben, ein Array mit allen Daten erstellen
   * @param {event}
   */
  static _getEventDateList = ({event}: _GetEventDateList) => {
    let dateList: Date[] = [];

    let dateRanges = Event.deleteEmptyDates(event.dates);
    dateRanges.forEach((daterange) => {
      let currentDate = new Date(daterange.from);
      while (currentDate <= daterange.to) {
        dateList.push(new Date(currentDate.setUTCHours(0, 0, 0, 0)));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return dateList;
  };
  // ===================================================================== */
  /**
   * Menuplan anpassen mit neuer Tagesauwahl
   * Werden die Tage des Anlasses angepasst, muss auch der Menuplan an-
   * gepasst werden.
   * @param Object - Objekt mit Menüplan, Event und neuen Tagen
   * @returns updatedMenuplan
   */
  static adjustMenuplanWithNewDays = ({
    menuplan,
    existingEvent,
    newEvent,
  }: AdjustMenuplanWithNewDays) => {
    let updatedMenuplan = _.cloneDeep(menuplan) as Menuplan;

    let newDayList = Menuplan._getEventDateList({event: newEvent}).map((date) =>
      Utils.dateAsString(date)
    );
    let oldDayList = Menuplan._getEventDateList({event: existingEvent}).map(
      (date) => Utils.dateAsString(date)
    );

    let datesToDelete = oldDayList.filter((date) => !newDayList.includes(date));
    let datesToDAdd = newDayList.filter((date) => !oldDayList.includes(date));

    updatedMenuplan.dates = newDayList.map(
      (date) => new Date(new Date(date).setUTCHours(0, 0, 0, 0))
    );

    let mealsToDelete = Object.values(menuplan.meals).filter(
      (meal) => !newDayList.includes(meal.date)
    );
    let menueUidsToDelete = mealsToDelete.reduce<Meal["uid"][]>(
      (accumulator, meal) => accumulator.concat(meal.menuOrder),
      []
    );

    let mealRecipeUidsToDelete = menueUidsToDelete.reduce<MealRecipe["uid"][]>(
      (accumulator, menuUid) =>
        accumulator.concat(menuplan.menues[menuUid].mealRecipeOrder),
      []
    );

    let productUidsToDelete = menueUidsToDelete.reduce<
      MenuplanProduct["uid"][]
    >(
      (accumulator, menuUid) =>
        accumulator.concat(menuplan.menues[menuUid].productOrder),
      []
    );

    let materialUidToDelete = menueUidsToDelete.reduce<
      MenuplanMaterial["uid"][]
    >(
      (accumulator, menuUid) =>
        accumulator.concat(menuplan.menues[menuUid].materialOrder),
      []
    );

    let notesToDelete = Object.values(menuplan.notes).filter((note) =>
      menueUidsToDelete.includes(note.menueUid)
    );

    mealsToDelete.forEach((meal) => delete updatedMenuplan.meals[meal.uid]);
    menueUidsToDelete.forEach(
      (menueUid) => delete updatedMenuplan.menues[menueUid]
    );
    mealRecipeUidsToDelete.forEach(
      (mealRecipeUid) => delete updatedMenuplan.mealRecipes[mealRecipeUid]
    );
    productUidsToDelete.forEach(
      (productUid) => delete updatedMenuplan.products[productUid]
    );
    materialUidToDelete.forEach(
      (materialUid) => delete updatedMenuplan.materials[materialUid]
    );
    notesToDelete.forEach((note) => delete updatedMenuplan.notes[note.uid]);

    // Für jeden neuen Tage Malhzeit, und eine Menü erstellen
    datesToDAdd.forEach((newDay) => {
      Object.values(updatedMenuplan.mealTypes.entries).forEach((mealType) => {
        let meal = Menuplan.createMeal({mealType: mealType.uid, date: newDay});
        updatedMenuplan.meals[meal.uid] = meal;
        let menu = Menuplan.createMenu();
        updatedMenuplan.meals[meal.uid].menuOrder.push(menu.uid);
        updatedMenuplan.menues[menu.uid] = menu;
      });
    });

    return updatedMenuplan;
  };
}
