import Firebase from "../firebase.class";
import FirebaseDbMasterDataDepartments from "./firebase.db.masterData.departments.class";
import FirebaseDbMasterDataProducts from "./firebase.db.masterData.products.class";
import FirebaseDbMasterDataUnits from "./firebase.db.masterData.units.class";
import FirebaseDbMasterDataMaterials from "./firebase.db.masterData.materials.class";
import FirebaseDbMasterDataUnitConversionBasic from "./firebase.db.masterData.unitConversionBasic.class";
import FirebaseDbMasterDataUnitConversionProducts from "./firebase.db.masterData.unitConversionProducts.class";
export class FirebaseDbMasterData {
  department: FirebaseDbMasterDataDepartments;
  products: FirebaseDbMasterDataProducts;
  units: FirebaseDbMasterDataUnits;
  materials: FirebaseDbMasterDataMaterials;
  unitConversionBasic: FirebaseDbMasterDataUnitConversionBasic;
  unitConversionProducts: FirebaseDbMasterDataUnitConversionProducts;

  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    this.department = new FirebaseDbMasterDataDepartments(firebase);
    this.products = new FirebaseDbMasterDataProducts(firebase);
    this.units = new FirebaseDbMasterDataUnits(firebase);
    this.materials = new FirebaseDbMasterDataMaterials(firebase);
    this.unitConversionBasic = new FirebaseDbMasterDataUnitConversionBasic(
      firebase
    );
    this.unitConversionProducts =
      new FirebaseDbMasterDataUnitConversionProducts(firebase);
  }
}
export default FirebaseDbMasterData;
