import Recipe from "../recipe.class";

export const recipe: Recipe = {
  uid: "",
  name: "Test Rezept",
  portions: 4,
  source: "https://jestjs.io",
  times: {
    preparation: 20,
    rest: 10,
    cooking: 0,
  },
  pictureSrc: {
    smallSize: "",
    normalSize: "https://jestjs.io/img/opengraph.png",
    fullSize: "",
  },
  created: {
    date: new Date(),
    fromUid: "adminUID",
    fromDisplayName: "Jest Test",
  },
  note: "nichts besonderes",
  tags: ["klassiker", "testfall"],
  private: false,
  linkedRecipes: [
    {
      uid: "NdSQvHJlnD0r4IoO8KsA",
      name: "Cervelat Stroganoff",
      pictureSrc: "https://recipecontent.fooby.ch/9940_3-2_1200-800.jpg",
      private: false,
      tags: ["wurst", "spätzli", "klassiker"],
      linkedRecipes: [],
      createdFromUid: "7HoaQsZC4NXqb4wq6CqOZQMBcg13",
    },
    {
      uid: "eBdelgYlY3oWrpJhtVUt",
      name: "Vegi Stroganoff",
      pictureSrc: "https://recipecontent.fooby.ch/10443_3-2_1200-800.jpg",
      private: false,
      tags: ["vegi", "vegetarisch"],
      linkedRecipes: [],
      createdFromUid: "7HoaQsZC4NXqb4wq6CqOZQMBcg13",
    },
  ],
  ingredients: [
    {
      uid: "abcde",
      pos: 1,
      product: { uid: "xyz", name: "Oktopus" },
      quantity: 42,
      unit: "",
      detail: "Bitte Bio",
      scalingFactor: 1,
    },
    {
      uid: "fghij",
      pos: 2,
      product: { uid: "", name: "" },
      quantity: 0,
      unit: "",
      detail: "",
      scalingFactor: 1,
    },
    {
      uid: "klmno",
      pos: 3,
      product: { uid: "n0r!", name: "Nori" },
      quantity: 2,
      unit: "",
      detail: "",
      scalingFactor: 0.5,
    },
    {
      uid: "pqrst",
      pos: 4,
      product: { uid: "g1ng3", name: "Ingwer" },
      quantity: 100,
      unit: "g",
      detail: "eingelegt",
      scalingFactor: 2.5,
    },
  ],
  preparationSteps: [
    { uid: "abcdef", pos: 1, step: "Schneiden" },
    { uid: "ghijkl", pos: 2, step: "" },
    { uid: "mnopqr", pos: 3, step: "Hacken" },
    { uid: "stuvwx", pos: 4, step: "" },
  ],
  rating: { avgRating: 5, noRatings: 1, myRating: 0 },
  usedProducts: [],
  lastChange: {
    date: new Date(0),
    fromDisplayName: "string",
    fromUid: "string",
  },
};

export default recipe;
