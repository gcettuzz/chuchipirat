import Firebase from "../firebase.class";
// import Stats from "../../Shared/stats.class";
import {
  FirebaseDbSuper,
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
} from "./firebase.db.super.class";
// import { AuthUser } from "../firebase.class.temp";
import {ERROR_NOT_IMPLEMENTED_YET} from "../../../constants/text";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
// //FIXME: KOMMENTARE LÖSCHEN!

// interface Create {
//   value: Stats;
//   authUser: AuthUser;
// }

export class FirebaseDbMasterDataProducts extends FirebaseDbSuper {
  firebase: Firebase;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection("masterData");
  }
  /* =====================================================================
  // Collection-Group holen
  // ===================================================================== */
  getCollectionGroup() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    return this.firebase.db.collectionGroup("none");
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument() {
    return this.firebase.db.doc("masterData/products");
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    // Not implemented
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({value}: PrepareDataForDb<T>) {
    // value kommt als Array, damit auch mehrere Produkte angepasst werden können

    let productsMap = {};

    value.forEach((product) => {
      // Allergene nur speichern, wenn auch welche vorhanden
      let dietProperties = product.dietProperties;
      if (product.dietProperties.allergens.length == 0) {
        delete dietProperties.allergens;
      }

      productsMap[product.uid] = {
        name: product.name,
        departmentUid: product.department?.uid ? product.department.uid : "",
        shoppingUnit: product.shoppingUnit,
        dietProperties: dietProperties,
        usable: product.usable,
      };
    });

    return productsMap;
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({uid, value}: PrepareDataForApp) {
    // Die Aufsplittung von Objekt zu Array geschieht in der products.class

    // Allergene hinzufügen, falls nicht vorhanden
    // Feld wird in prepareDataForDB gelöscht, damit keine leeren Felder
    // gespeichert werden. Hier muss es wieder hinzugefügt werden
    Object.keys(value).map((key) => {
      if (!value[key].dietProperties.allergens) {
        value[key].dietProperties.allergens = [];
      }
      value[key].department = {uid: value[key].departmentUid, name: ""};
    });
    return value as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.PRODUCTS;
  }
}
export default FirebaseDbMasterDataProducts;
