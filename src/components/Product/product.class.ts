import Utils from "../Shared/utils.class";
import Stats, {StatsField} from "../Shared/stats.class";
import * as TEXT from "../../constants/text";

import Feed, {FeedType} from "../Shared/feed.class";
import Role from "../../constants/roles";

import Department from "../Department/department.class";
import Unit from "../Unit/unit.class";
import Firebase from "../Firebase/firebase.class";
import AuthUser from "../Firebase/Authentication/authUser.class";
import FirebaseAnalyticEvent from "../../constants/firebaseEvent";
import {ValueObject} from "../Firebase/Db/firebase.db.super.class";

interface GetAllProducts {
  firebase: Firebase;
  onlyUsable?: boolean;
  withDepartmentName?: boolean;
}

interface CreateProduct {
  firebase: Firebase;
  name: string;
  departmentUid: string;
  shoppingUnit: string;
  authUser: AuthUser;
  dietProperties: DietProperties;
}
interface SaveAllProducts {
  firebase: Firebase;
  products: Product[];
  authUser: AuthUser;
}
export interface MergeProductsCallbackDocument {
  date: Date;
  documentList: {document: string; name: string}[];
  done: boolean;
  productToReplace: {uid: string; name: string};
  productToReplaceWith: {uid: string; name: string};
}
interface MergeProducts {
  firebase: Firebase;
  authUser: AuthUser;
  productToReplace: {uid: string; name: string};
  productToReplaceWith: {uid: string; name: string};
  callbackDone: (document: MergeProductsCallbackDocument) => void;
}

// ATTENTION:
// wird dies erweitert, muss auch im Cloud-Function File index
// die Beschreibung angepasst werden. Sonst funktioniert der
// Feed-Recap-Newsletter nicht.
export enum Allergen {
  None,
  Lactose = 1,
  Gluten,
}

export enum Diet {
  Meat = 1,
  Vegetarian,
  Vegan,
}

export interface DietProperties {
  allergens: Allergen[];
  diet: Diet;
}

type ProductDepartment = {
  uid: Department["uid"];
  name: Department["name"];
};

export default class Product {
  // HINT: Änderungen müssen auch im Cloud-FX-Type nachgeführt werden
  uid: string;
  name: string;
  department: ProductDepartment;
  departmentUid?: Department["uid"];
  // department: ProductDepartment;
  shoppingUnit: Unit["key"];
  dietProperties: DietProperties;
  usable: boolean;

  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor() {
    this.uid = "";
    this.name = "";
    this.department = {uid: "", name: ""};
    this.shoppingUnit = "";
    this.dietProperties = Product.createEmptyDietProperty();
    this.usable = false;
  }
  /* =====================================================================
  // Leere Diät-Eigenschaft
  // ===================================================================== */
  static createEmptyDietProperty() {
    return {
      allergens: [] as Allergen[],
      diet: Diet.Meat,
    };
  }
  // =====================================================================
  /**
   * Alle Produkte aus der DB holen -->
   * Möglichkeit mit onlyUsable die nicht nutzbaren Produkte
   * auszufiltern.
   * @param Objekt nach Interface GetAllProducts
   * @returns Liste der Produkte
   */
  static async getAllProducts({
    firebase,
    onlyUsable,
    withDepartmentName,
  }: GetAllProducts) {
    let products: Product[] = [];
    let departments: Department[] = [];
    let department: ProductDepartment = {uid: "", name: ""};

    if (withDepartmentName) {
      await Department.getAllDepartments({firebase: firebase})
        .then((result) => {
          departments = result;
        })
        .catch((error) => {
          throw error;
        });
    }

    // Produkte holen
    await firebase.masterdata.products
      .read<ValueObject>({uids: []})
      .then((result) => {
        Object.entries(result).forEach(([key, value]) => {
          if (onlyUsable === true && value.usable === false) {
            // Nächster Datensatz
            return;
          }
          // Department dazulesen....
          department = {uid: value.departmentUid, name: ""};
          if (withDepartmentName) {
            const lookUpDepartment = departments.find(
              (department) => department.uid === value.departmentUid
            );

            if (lookUpDepartment !== undefined) {
              department.name = lookUpDepartment.name;
            }
          }

          let dietProperties = {} as DietProperties;

          if (value.dietProperties) {
            dietProperties = value.dietProperties;
            if (!value.dietProperties?.allergens) {
              dietProperties.allergens = [];
            }
            if (!dietProperties.diet) {
              dietProperties.diet = Diet.Meat;
            }
          } else {
            dietProperties = Product.createEmptyDietProperty();
          }

          products.push({
            uid: key,
            name: value.name,
            department: department,
            shoppingUnit: value.shoppingUnit,
            dietProperties: dietProperties,
            usable: value.usable,
          });
        });
        products = Utils.sortArray({array: products, attributeName: "name"});
      })
      .catch((error) => {
        throw error;
      });
    return products;
  }
  /* =====================================================================
  // Produkt anlegen
  // ===================================================================== */
  static createProduct = async ({
    firebase,
    name,
    departmentUid,
    shoppingUnit,
    dietProperties,
    authUser,
  }: CreateProduct) => {
    const product = new Product();
    const department = new Department();

    department.uid = departmentUid;

    product.uid = Utils.generateUid(20);
    product.name = name.trim();
    product.department = department;
    product.shoppingUnit = shoppingUnit ? shoppingUnit : "";
    product.dietProperties = dietProperties;
    product.usable = true;

    // Dokument updaten mit neuem Produkt
    firebase.masterdata.products.update<Array<Product>>({
      uids: [""], // Wird in der Klasse bestimmt
      value: [product],
      authUser: authUser,
    });

    // Event auslösen
    firebase.analytics.logEvent(FirebaseAnalyticEvent.ingredientCreated);

    // interner Feed-Eintrag
    Feed.createFeedEntry({
      firebase: firebase,
      authUser: authUser,
      feedType: FeedType.productCreated,
      feedVisibility: Role.communityLeader,
      objectUid: product.uid,
      objectName: product.name,
      textElements: [product.name],
    });

    // Statistik
    Stats.incrementStat({
      firebase: firebase,
      field: StatsField.noIngredients,
      value: 1,
    });

    return product;
  };
  /* =====================================================================
  // Produkt anlegen
  // ===================================================================== */
  static saveAllProducts = async ({
    firebase,
    products,
    authUser,
  }: SaveAllProducts) => {
    // Dokument updaten mit neuem Produkt
    let triggerCloudFx = false;
    const changedProducts = [] as Product[];
    // altes File holen und vergleichen. für die geänderten Produkte muss die Cloud-FX ausgelöst werden
    await Product.getAllProducts({
      firebase: firebase,
      onlyUsable: false,
      withDepartmentName: false,
    })
      .then((result) => {
        products.forEach((product) => {
          const dbProduct = result.find(
            (dbProduct) => dbProduct.uid === product.uid
          );

          if (
            dbProduct &&
            (dbProduct.name != product.name ||
              !Utils.areArraysIdentical<Allergen>(
                dbProduct.dietProperties.allergens,
                product.dietProperties.allergens
              ) ||
              dbProduct.dietProperties.diet !== product.dietProperties.diet)
          ) {
            // Das Produkt hat eine Änderung erfahren, die über alle
            // Dokumente nachgeführt werden muss
            triggerCloudFx = true;
            delete product.departmentUid;
            changedProducts.push(product);
          }
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    await firebase.masterdata.products.set<Array<Product>>({
      uids: [""], // Wird in der Klasse bestimmt
      value: products,
      authUser: authUser,
    });

    if (triggerCloudFx) {
      firebase.cloudFunction.updateProduct.triggerCloudFunction({
        values: {changedProducts: changedProducts},
        authUser: authUser,
      });
    }

    return products;
  };
  // =====================================================================
  /**
   * Zwei Produkte mergen
   * Über eine Cloud-Function werden zwei Produkte zusammengeführt und
   * in allen relevanten Dokumenten wird das nachgeführt
   * @param Objekt - Referenz auf Firebase, AuthUser, Produkt zu erstetzen,
   *                 Ersatz-Produkt, Callback wenn Cloud-FX fertig.
   * @returns Liste der Produkte
   */
  static mergeProducts = async ({
    firebase,
    authUser,
    productToReplace,
    productToReplaceWith,
    callbackDone,
  }: MergeProducts) => {
    if (!firebase || !productToReplace || !productToReplaceWith) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }
    let unsubscribe: () => void;
    let documentId = "";

    firebase.cloudFunction.mergeProducts
      .triggerCloudFunction({
        values: {
          productToReplace: productToReplace,
          productToReplaceWith: productToReplaceWith,
        },
        authUser: authUser,
      })
      .then((result) => {
        documentId = result;
      })
      .then(() => {
        // Melden wenn fertig
        const callback = (data) => {
          if (data?.done) {
            callbackDone(data);
            unsubscribe();
          }
        };
        const errorCallback = (error: Error) => {
          throw error;
        };

        firebase.cloudFunction.mergeProducts
          .listen({
            uids: [documentId],
            callback: callback,
            errorCallback: errorCallback,
          })
          .then((result) => {
            unsubscribe = result;
          });
      })
      .catch((error) => {
        throw error;
      });
  };
}
