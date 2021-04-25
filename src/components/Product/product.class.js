import Utils from "../Shared/utils.class";
import Stats, { STATS_FIELDS } from "../Shared/stats.class";
import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";
import Department from "../Department/department.class";
import { Alert } from "@material-ui/lab";

export default class Product {
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor({
    uid,
    name,
    departmentName,
    departmentUid,
    shoppingUnit,
    usable,
  }) {
    this.uid = uid;
    this.name = name;
    this.departmentName = departmentName;
    this.departmentUid = departmentUid;
    this.shoppingUnit = shoppingUnit ? shoppingUnit : "";
    this.usable = usable;
  }

  static factory(productId) {
    let product = new Product();
    product.productId = productId;
    product.readInfos();
    return product;
  }
  /* =====================================================================
  // Alle Produkte aus der DB holen
  // ===================================================================== */
  static async getAllProducts({
    firebase,
    onlyUsable = true,
    withDepartmentName = false,
  } = {}) {
    let products = [];
    let departments = [];
    let departmentName = "";

    if (withDepartmentName) {
      await Department.getAllDepartments(firebase)
        .then((result) => {
          departments = result;
        })
        .catch((error) => {
          throw error;
        });
    }

    await firebase
      .products()
      .get()
      .then(async (snapshot) => {
        if (snapshot && snapshot.exists) {
          Object.keys(snapshot.data()).forEach((key) => {
            if (onlyUsable === true && snapshot.data()[key].usable === false) {
              // Nächster Datensatz
              return;
            }

            // Department dazulesen....
            if (withDepartmentName) {
              departmentName = departments.find(
                (department) =>
                  department.uid === snapshot.data()[key].departmentUid
              ).name;
            }

            let product = new Product({
              uid: key,
              name: snapshot.data()[key].name,
              departmentName,
              departmentUid: snapshot.data()[key].departmentUid,
              shoppingUnit: snapshot.data()[key].shoppingUnit,
              usable: snapshot.data()[key].usable,
            });
            products.push(product);
          });
        }
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    products = Utils.sortArrayWithObjectByText({
      list: products,
      attributeName: "name",
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
  }) => {
    let uid = Utils.generateUid(20);

    // Dokument updaten mit neuem Produkt
    await firebase.products().update({
      [uid]: {
        name: name,
        departmentUid: departmentUid,
        shoppingUnit: shoppingUnit ? shoppingUnit : "",
        usable: true,
      },
    });
    // Event auslösen
    firebase.analytics.logEvent(FIREBASE_EVENTS.INGREDIENT_CREATED);
    // Statistik
    Stats.incrementStat({
      firebase: firebase,
      field: STATS_FIELDS.INGREDIENTS,
    });

    let product = new Product({
      uid: uid,
      name: name,
      departmentUid: departmentUid,
      shoppingUnit: shoppingUnit,
      usable: true,
    });

    return product;
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
    // Dokument updaten mit neuem Produkt
    await firebase
      .products()
      .update({
        [uid]: {
          name: name,
          departmentUid: departmentUid,
          shoppingUnit: shoppingUnit,
          usable: usable,
        },
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    if (runCloudFunction) {
      firebase.createTriggerDocForCloudFunctions({
        docRef: firebase.cloudFunctions_product().doc(),
        uid: uid,
        newValue: name,
      });
    }

    let product = new Product({
      uid: uid,
      name: name,
      departmentUid: departmentUid,
      shoppingUnit: shoppingUnit,
      usable: usable,
    });

    return product;
  };
}
