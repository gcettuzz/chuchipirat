import {Diet} from "../../Product/product.class";
import Recipe, {PositionType, RecipeType} from "../recipe.class";

export const recipe: Recipe = {
  uid: "HWEvHBnRM56GDapkWtsd",
  name: "Test Rezept",
  portions: 4,
  source: "https://jestjs.io",
  times: {
    preparation: 20,
    rest: 10,
    cooking: 0,
  },
  pictureSrc: "https://jestjs.io/img/opengraph.png",
  created: {
    date: new Date(),
    fromUid: "adminUID",
    fromDisplayName: "Jest Test",
  },
  note: "nichts besonderes",
  tags: ["klassiker", "testfall"],
  type: RecipeType.public,
  linkedRecipes: [],
  ingredients: {
    entries: {
      abcde: {
        uid: "abcde",
        product: {uid: "xyz", name: "Oktopus"},
        posType: PositionType.ingredient,
        quantity: 42,
        unit: "",
        detail: "Bitte Bio",
        scalingFactor: 1,
      },
      fghij: {
        uid: "fghij",
        posType: PositionType.ingredient,
        product: {uid: "qrt", name: "Mozzarella"},
        quantity: 120,
        unit: "g",
        detail: "",
        scalingFactor: 1,
      },
      klmno: {
        uid: "klmno",
        posType: PositionType.ingredient,
        product: {uid: "n0r!", name: "Nori"},
        quantity: 2,
        unit: "",
        detail: "",
        scalingFactor: 0.5,
      },
      pqrst: {
        uid: "pqrst",
        posType: PositionType.ingredient,
        product: {uid: "g1ng3", name: "Ingwer"},
        quantity: 100,
        unit: "g",
        detail: "eingelegt",
        scalingFactor: 2.5,
      },
      z: {
        uid: "z",
        posType: PositionType.ingredient,
        product: {uid: "", name: ""},
        quantity: 0,
        unit: "",
        detail: "",
        scalingFactor: 1,
      },
    },
    order: ["abcde", "fghij", "klmno", "pqrst", "z"],
  },

  preparationSteps: {
    entries: {
      abcdef: {
        uid: "abcdef",
        posType: PositionType.preparationStep,
        step: "Schneiden",
      },
      ghijkl: {uid: "ghijkl", posType: PositionType.preparationStep, step: ""},
      mnopqr: {
        uid: "mnopqr",
        posType: PositionType.preparationStep,
        step: "Hacken",
      },
      stuvwx: {
        uid: "stuvwx",
        posType: PositionType.preparationStep,
        step: "rösten",
      },
      z: {
        uid: "z",
        posType: PositionType.preparationStep,
        step: "",
      },
    },
    order: ["abcdef", "ghijkl", "mnopqr", "stuvwx", "z"],
  },
  materials: {
    entries: {
      xxx: {
        uid: "xxx",
        material: {name: "Schwingbesen", uid: "öjökasdölfkj"},
        quantity: 1,
      },
      zzz: {
        uid: "zzz",
        material: {name: "", uid: ""},
        quantity: 0,
      },
    },
    order: ["xxx", "zzz"],
  },
  dietProperties: {allergens: [], diet: Diet.Meat},
  menuTypes: [],
  outdoorKitchenSuitable: false,
  rating: {avgRating: 5, noRatings: 1, myRating: 0},
  usedProducts: [],
  isInReview: false,
  lastChange: {
    date: new Date(0),
    fromDisplayName: "string",
    fromUid: "string",
  },
};

export default recipe;
