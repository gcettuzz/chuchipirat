import Department from "../components/Department/department.class";
import AuthUser from "../components/Firebase/Authentication/authUser.class";
import Firebase from "../components/Firebase/firebase.class";
import Product, {DietProperties} from "../components/Product/product.class";

type OldProductStructure = {
  departmentUid: string;
  dietProperties: DietProperties;
  name: string;
  shoppingUnit: string;
  usable: boolean;
};

type ProductWithoutUid = Omit<Product, "uid">;

export async function restructureProducts(firebase: Firebase) {
  let products: {[key: string]: ProductWithoutUid} = {};
  const newProducts: {[key: string]: OldProductStructure} = {};
  const departments: {[key: string]: Department} = {};
  let counter = 0;

  // alle Produkte
  await firebase.masterdata.products.read({uids: []}).then((result) => {
    products = result;
  });

  Object.keys(products).forEach((productUid) => {
    counter++;

    newProducts[productUid] = {
      ...products[productUid],
      departmentUid: products[productUid].department.uid,
    };
    delete newProducts[productUid]["department"];
  });

  console.log(products, departments);
  console.log(newProducts);

  await firebase.masterdata.products.setRawData({
    uids: [],
    value: newProducts,
    authUser: {uid: "", publicProfile: {displayName: ""}} as AuthUser,
  });

  return counter;
}
