import Stats, { StatsField } from "../stats.class";
import * as TEXT from "../../../constants/text";
// import FirebaseStats from "../Firebase/SubClasses/firebase.stats.class";
// // import read from "../Firebase/SubClasses/__mock__/firebase.stats.class";
// import Firebase from "../Firebase/firebase.class";

// jest.mock("../Firebase/firebase.class")
// const mockedMethod = jest.fn();

// jest.mock("../Firebase/SubClasses/firebase.stats.class");

// beforeAll(() => {
//   jest.spyOn(FirebaseStats.prototype, "read").mockImplementation(() => read());
// });

// afterAll(() => {
//   jest.restoreAllMocks();
// });

/* =====================================================================
// Kostruktor
// ===================================================================== */
test("Stats.constructor()", () => {
  let stats = new Stats();
  expect(stats).toBeDefined();
  expect(stats).toHaveProperty("noEvents");
  expect(stats).toHaveProperty("noIngredients");
  expect(stats).toHaveProperty("noParticipants");
  expect(stats).toHaveProperty("noRecipes");
  expect(stats).toHaveProperty("noShoppingLists");
  expect(stats).toHaveProperty("noUsers");
});
/* =====================================================================
// Texte zu ID holen
// ===================================================================== */
test("Stats.getCaptionFromField(): Text zu ID holen", () => {
  expect(Stats.getCaptionFromField(StatsField.noUsers)).toEqual(
    TEXT.HOME_STATS_CAPTIONS.USERS
  );
  expect(Stats.getCaptionFromField(StatsField.noEvents)).toEqual(
    TEXT.HOME_STATS_CAPTIONS.EVENTS
  );
  expect(Stats.getCaptionFromField(StatsField.noIngredients)).toEqual(
    TEXT.HOME_STATS_CAPTIONS.INGREDIENTS
  );
  expect(Stats.getCaptionFromField(StatsField.noRecipes)).toEqual(
    TEXT.HOME_STATS_CAPTIONS.RECIPES
  );
  expect(Stats.getCaptionFromField(StatsField.noShoppingLists)).toEqual(
    TEXT.HOME_STATS_CAPTIONS.SHOPPING_LISTS
  );
  expect(Stats.getCaptionFromField(StatsField.noParticipants)).toEqual(
    TEXT.HOME_STATS_CAPTIONS.PARTICIPANTS
  );
});

//TEST_MISSING
/* =====================================================================
// Statistik lesen
// ===================================================================== */
// test("Stats.getStats(): Statistik lesen", (done) => {
//   const spy = jest.spyOn(FirebaseStats, "read");
//   spy.mockReturnValue({ test: "abc" });
//   // let stats = Stats.getStats({} as Firebase);

//   // console.log(stats);

//   expect(Stats.getStats({ stats: {} as FirebaseStats } as Firebase)).toEqual(
//     ""
//   );
// FirebaseStats.read.mockResolvedValueOnce(resolvedValue)
// });

/* =====================================================================
// Statistikfeld um X erhöhen
// ===================================================================== */
// test("Stats.incrementStat(): XXX", () => {});
