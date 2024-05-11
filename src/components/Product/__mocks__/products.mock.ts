import Product, {Diet} from "../product.class";

export const products: Product[] = [
  {
    uid: "xyz",
    name: "Oktobpus",
    department: {uid: "tk", name: "Tiefkühl"},
    shoppingUnit: "kg",
    dietProperties: {allergens: [], diet: Diet.Meat},
    usable: true,
  },
  {
    uid: "qrt",
    name: "Mozzarella",
    department: {uid: "molk", name: "Molkerei"},
    shoppingUnit: "g",
    dietProperties: {allergens: [1], diet: Diet.Vegetarian},
    usable: true,
  },
  {
    uid: "n0r!",
    name: "Nori",
    department: {uid: "arigato", name: "Fremdländische Spezialitäten"},
    shoppingUnit: "g",
    dietProperties: {allergens: [], diet: Diet.Vegan},
    usable: true,
  },
  {
    uid: "g1ng3",
    name: "Ingwer",
    department: {uid: "vegetable", name: "Gemüse"},
    shoppingUnit: "g",
    dietProperties: {allergens: [], diet: Diet.Vegan},
    usable: true,
  },
];
export default products;
