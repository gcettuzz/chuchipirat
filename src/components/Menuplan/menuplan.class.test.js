"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const menuplan_class_1 = __importDefault(require("./menuplan.class"));
const menuplan = {
    dates: [
        new Date(2020, 8, 5),
        new Date(2020, 9, 10),
        new Date(2020, 9, 11),
        new Date(2020, 9, 12),
        new Date(2020, 9, 13),
        new Date(2020, 9, 14),
        new Date(2020, 9, 15),
        new Date(2020, 9, 16),
        new Date(2020, 9, 17),
    ],
    meals: [
        { uid: "VlYl1", pos: 1, name: "Zmorgen" },
        { uid: "MtZDm", pos: 2, name: "Zmittag" },
        { uid: "GxgKw", pos: 3, name: "Znacht" },
    ],
    notes: [
        {
            uid: "l39Kz",
            date: new Date(2020, 8, 5),
            mealUid: "",
            type: 1,
            text: "Text Notiz",
        },
        {
            uid: "Hh6J7",
            date: new Date(2020, 9, 10),
            mealUid: "GxgKw",
            text: "Pulled Pork schon mal marinieren",
            type: 4,
        },
    ],
    recipes: [
        {
            uid: "qoZ49",
            date: new Date(2020, 8, 5),
            mealUid: "GxgKw",
            recipeName: "Zopf",
            recipeUid: "8tMpWw2oTKwRzbuYjg5H",
            noOfServings: 28,
            pictureSrc: "",
        },
        {
            uid: "2gPA6",
            date: new Date(2020, 8, 5),
            mealUid: "MtZDm",
            recipeName: "Cervelat Stroganoff",
            recipeUid: "t3jKjgl5QnDpe9EHDWZ9",
            noOfServings: 28,
            pictureSrc: "https://recipeimages.migros.ch/crop/v-w-2000-h-851-a-center_center/323e97d7031e3995a5325da2381cc72992cf9dc2/rindsfilet-stroganoff-0-47-20.jpg",
        },
        {
            uid: "1rn4K",
            date: new Date(2020, 9, 11),
            mealUid: "MtZDm",
            recipeName: "Lasagne al forno",
            recipeUid: "aWkF0K4PlbLUsP3nirOW",
            noOfServings: 28,
            pictureSrc: "https://www.bettybossi.ch/static/rezepte/x/bb_bkxx060801_0090a_x.jpg",
        },
        {
            uid: "llFvJ",
            mealUid: "MtZDm",
            date: new Date(2020, 9, 14),
            recipeName: "Cervelat Stroganoff",
            recipeUid: "t3jKjgl5QnDpe9EHDWZ9",
            noOfServings: 4,
            pictureSrc: "https://recipeimages.migros.ch/crop/v-w-2000-h-851-a-center_center/323e97d7031e3995a5325da2381cc72992cf9dc2/rindsfilet-stroganoff-0-47-20.jpg",
        },
        {
            uid: "bP4Mq",
            mealUid: "MtZDm",
            date: new Date(2020, 9, 15),
            recipeName: "Cervelat Stroganoff",
            recipeUid: "t3jKjgl5QnDpe9EHDWZ9",
            noOfServings: 8,
            pictureSrc: "https://recipeimages.migros.ch/crop/v-w-2000-h-851-a-center_center/323e97d7031e3995a5325da2381cc72992cf9dc2/rindsfilet-stroganoff-0-47-20.jpg",
        },
    ],
    createdAt: new Date(2021, 3, 30),
    createdFromUid: "ABCDEFGHIJ",
    createdFromDisplayName: "Jest User - the Testmachine",
    lastChangeAt: new Date(2021, 4, 1),
    lastChangeFromUid: "KLMNOPQRST",
    lastChangeFromDisplayName: "Der andere Test-User",
};
/* =====================================================================
// Kostruktor
// ===================================================================== */
test("Menuplan.constructor: Objekt Typ Menuplan instazieren", () => {
    let testMenuplan = new menuplan_class_1.default();
    expect(testMenuplan).toBeDefined();
    expect(testMenuplan).toHaveProperty("dates");
    expect(testMenuplan).toHaveProperty("meals");
    expect(testMenuplan).toHaveProperty("notes");
    expect(testMenuplan).toHaveProperty("recipes");
    expect(testMenuplan).toHaveProperty("createdAt");
    expect(testMenuplan).toHaveProperty("createdFromUid");
    expect(testMenuplan).toHaveProperty("createdFromDisplayName");
    expect(testMenuplan).toHaveProperty("lastChangeAt");
    expect(testMenuplan).toHaveProperty("lastChangeFromUid");
    expect(testMenuplan).toHaveProperty("lastChangeFromDisplayName");
});
/* =====================================================================
// Factory
// ===================================================================== */
test("Menuplan.factory: Objekt Menuplan erzeugen", () => {
    let testMenuplan = Object.assign({}, menuplan);
    expect(testMenuplan).toBeDefined();
    expect(testMenuplan.dates.length).toEqual(9);
    expect(testMenuplan.meals.length).toEqual(3);
    expect(testMenuplan.notes.length).toEqual(2);
    expect(testMenuplan.recipes.length).toEqual(5);
    expect(testMenuplan.createdAt).toEqual(new Date(2021, 3, 30));
    expect(testMenuplan.createdFromUid).toEqual("ABCDEFGHIJ");
    expect(testMenuplan.createdFromDisplayName).toEqual("Jest User - the Testmachine");
    expect(testMenuplan.lastChangeAt).toEqual(new Date(2021, 4, 1));
    expect(testMenuplan.lastChangeFromUid).toEqual("KLMNOPQRST");
    expect(testMenuplan.lastChangeFromDisplayName).toEqual("Der andere Test-User");
});
//TEST_MISSING
/* ====================================================================
// Feed Eintrag erzeugen
/ ==================================================================== */
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
// test("Menuplan.createFeedEntry(): XXX:", () => {})
