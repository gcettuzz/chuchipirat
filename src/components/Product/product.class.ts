import Utils from "../Shared/utils.class";
import Stats, {StatsField, STATS_FIELDS} from "../Shared/stats.class";
import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";
import * as TEXT from "../../constants/text";

import Feed, {FeedType} from "../Shared/feed.class";
import Role from "../../constants/roles";

import Department from "../Department/department.class";
import Unit from "../Unit/unit.class";
import Firebase from "../Firebase";
import AuthUser from "../Firebase/Authentication/authUser.class";
import FirebaseAnalyticEvent from "../../constants/firebaseEvent";

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
}
interface SaveAllProductsProps {
  firebase: Firebase;
  products: Product[];
  authUser: AuthUser;
}
// interface DietProperty {
//   [key: string]: boolean;
// }

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
  uid: string;
  name: string;
  department: ProductDepartment;
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
  // static factory(productId) {
  //   let product = new Product();
  //   product.productId = productId;
  //   product.readInfos();
  //   return product;
  // }
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
      .read<Object>({uids: []})
      .then((result) => {
        Object.entries(result).forEach(([key, value]) => {
          if (onlyUsable === true && value.usable === false) {
            // Nächster Datensatz
            return;
          }
          // Department dazulesen....
          department = {uid: value.departmentUid, name: ""};
          if (withDepartmentName) {
            let lookUpDepartment = departments.find(
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
    authUser,
  }: CreateProduct) => {
    let product = new Product();
    let department = new Department();

    department.uid = departmentUid;

    product.uid = Utils.generateUid(20);
    product.name = name.trim();
    product.department = department;
    product.shoppingUnit = shoppingUnit ? shoppingUnit : "";
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
  }: SaveAllProductsProps) => {
    // Dokument updaten mit neuem Produkt

    firebase.masterdata.products.update<Array<Product>>({
      uids: [""], // Wird in der Klasse bestimmt
      value: products,
      authUser: authUser,
    });

    return products;
  };

  /* =====================================================================
  // Produkt anpassen
  // ===================================================================== */
  static editProduct = async ({
    firebase,
    uid,
    name,
    departmentUid,
    shoppingUnit,
    usable,
    runCloudFunction,
  }) => {
    //FIXME:
    let product = new Product();
    // // Dokument updaten mit neuem Produkt
    // await firebase
    //   .products()
    //   .update({
    //     [uid]: {
    //       name: name.trim(),
    //       departmentUid: departmentUid,
    //       shoppingUnit: shoppingUnit,
    //       usable: usable,
    //     },
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     throw error;
    //   });
    // if (runCloudFunction) {
    //   firebase.createTriggerDocForCloudFunctions({
    //     docRef: firebase.cloudFunctions_productUpdate().doc(),
    //     uid: uid,
    //     newValue: name,
    //   });
    //   firebase.analytics.logEvent(FIREBASE_EVENTS.CLOUD_FUNCTION_EXECUTED);
    // }
    // let product = new Product({
    //   uid: uid,
    //   name: name.trim(),
    //   departmentUid: departmentUid,
    //   shoppingUnit: shoppingUnit,
    //   usable: usable,
    // });
    return product;
  };
  /* =====================================================================
  // Produkt tracen
  // ===================================================================== */
  static traceProduct = async ({firebase, uid, traceListener}) => {
    // if (!firebase || !uid) {
    //   throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    // }
    // let listener;
    // let docRef = firebase.cloudFunctions_productTrace().doc();
    // await docRef
    //   .set({
    //     uid: uid,
    //     date: firebase.timestamp.fromDate(new Date()),
    //   })
    //   .then(async () => {
    //     await firebase.delay(1);
    //   })
    //   .then(() => {
    //     const unsubscribe = docRef.onSnapshot((snapshot) => {
    //       traceListener(snapshot.data());
    //       if (snapshot.data()?.done) {
    //         // Wenn das Feld DONE vorhanden ist, ist die Cloud-Function durch
    //         unsubscribe();
    //       }
    //     });
    //   })
    //   .catch((error) => {
    //     throw error;
    //   });
    // firebase.analytics.logEvent(FIREBASE_EVENTS.CLOUD_FUNCTION_EXECUTED);
    // return listener;
  };
  /* =====================================================================
    // Produkte mergen
    // ===================================================================== */
  static mergeProducts = async ({
    firebase,
    productA,
    productB,
    authUser,
    traceListener,
  }) => {
    //   if (!firebase || !productA || !productB) {
    //     throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    //   }
    //   let listener;
    //   let docRef = firebase.cloudFunctions_mergeProducts().doc();
    //   await docRef
    //     .set({
    //       productA: {
    //         uid: productA.uid,
    //         name: productA.name,
    //         departmentUid: productA.departmentUid,
    //         // departmentName: "",
    //       },
    //       productB: {
    //         uid: productB.uid,
    //         name: productB.name,
    //         departmentUid: productB.departmentUid,
    //         // departmentName: "",
    //       },
    //       user: {
    //         uid: authUser.uid,
    //         displayName: authUser.publicProfile.displayName,
    //       },
    //       date: firebase.timestamp.fromDate(new Date()),
    //     })
    //     .then(async () => {
    //       await firebase.delay(1);
    //     })
    //     .then(() => {
    //       const unsubscribe = docRef.onSnapshot((snapshot) => {
    //         traceListener(snapshot.data());
    //         if (snapshot.data()?.done) {
    //           // Wenn das Feld DONE vorhanden ist, ist die Cloud-Function durch
    //           unsubscribe();
    //         }
    //       });
    //     })
    //     .catch((error) => {
    //       throw error;
    //     });
    //   firebase.analytics.logEvent(FIREBASE_EVENTS.CLOUD_FUNCTION_EXECUTED);
    //   return listener;
  };
}
