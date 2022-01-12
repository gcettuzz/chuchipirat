import exp from "constants";
import Utils from "../utils.class";

/* =====================================================================
// Prüfung Domain
// ===================================================================== */
test("Utils.getDomain(): mit gültiger URL", () => {
  let url = "https://migusto.migros.ch/de/rezepte/rindsfilet-stroganoff";

  let domain = Utils.getDomain(url);
  expect(domain).toBe("migusto.migros.ch");

  url = "http://localhost:3000/recipe/t3jKjgl5QnDpe9EHDWZ9";
  expect(Utils.getDomain(url)).toBe("localhost");
});

test("Util.getDomain: mit ungültiger URL", () => {
  const url = "www.googlech";

  let domain = Utils.getDomain(url);
  expect(domain).toBe(url);
});

/* =====================================================================
// Prüfen ob URL gültig ist
// ===================================================================== */
test("Utils.isUrl(): mit gültiger URL", () => {
  const url = "https://migusto.migros.ch/de.html";
  expect(Utils.isUrl(url)).toBeTruthy();
});
test("Util.isUrl(): mit ungültiger URL", () => {
  const url = "https://migusto.migros. ch/de.html";
  expect(Utils.isUrl(url)).toBeFalsy();
});
test("Util.isUrl(): ohne Paramter", () => {
  expect(Utils.isUrl("")).toBeFalsy();
});
/* =====================================================================
// Prüfen ob gültige Email
// ===================================================================== */
test("Utils.isEmail(): mit gültiger Email-Adresse", () => {
  expect(Utils.isEmail("admin@chuchipirat.ch")).toBeTruthy();
  expect(Utils.isEmail("gio.developer@chuchipirat.ch")).toBeTruthy();
});

test("Util.isEmail(): mit ungültiger Email-Adressen", () => {
  expect(Utils.isEmail("admin@chuchipiratch")).toBeFalsy();
  expect(Utils.isEmail("adminchuchipirat.ch")).toBeFalsy();
  expect(Utils.isEmail("admin@ chuchipirat.ch")).toBeFalsy();
  expect(Utils.isEmail("admin@🏴‍☠️chuchipirat.ch")).toBeFalsy();
});
/* =====================================================================
// Element an bestimmter Position in Array einfügen (a)
// ===================================================================== */
test("Utils.insertArrayElementAtPosition(): an korrekter Stelle einfügen", () => {
  let array: object[] = [
    { name: "Test Pos 1", pos: 1 },
    { name: "Test Pos 3", pos: 3 },
    { name: "Test Pos 4", pos: 4 },
  ];
  let newElement = { name: "Test Pos 2", pos: 2 };
  array = Utils.insertArrayElementAtPosition({
    array: array,
    indexToInsert: 0,
    newElement: newElement,
  });
  expect(array).toBeDefined();
  expect(array[1]).toEqual({ name: "Test Pos 2", pos: 2 });
  expect(array.length).toBe(4);
});
/* =====================================================================
// Array-Element Position runter schieben
// ===================================================================== */
test("Utils.moveArrayElementDown(): Element nach unten schieben", () => {
  let array: object[] = [
    { name: "Test Pos 1", pos: 1 },
    { name: "Test Pos 2", pos: 2 },
    { name: "Test Pos 3", pos: 3 },
    { name: "Test Pos 4", pos: 4 },
  ];

  let rearangedArray = Utils.moveArrayElementDown({
    array: array,
    indexToMoveDown: 1,
  });

  expect(rearangedArray).toBeDefined();
  expect(rearangedArray[1]).toEqual({ name: "Test Pos 3", pos: 3 });
  expect(rearangedArray.length).toBe(4);

  rearangedArray = Utils.moveArrayElementDown({
    array: array,
    indexToMoveDown: 0,
  });

  expect(rearangedArray).toBeDefined();
  expect(rearangedArray[1]).toEqual({ name: "Test Pos 1", pos: 1 });
  expect(rearangedArray.length).toBe(4);

  // Letze Position verschieben -> darf nicht passieren
  rearangedArray = Utils.moveArrayElementDown({
    array: array,
    indexToMoveDown: 3,
  });
  expect(rearangedArray).toEqual(array);
});
/* =====================================================================
  // Array-Element Position runter schieben
  // ===================================================================== */
test("Utils.moveArrayElementUp(): Element nach oben schieben", () => {
  let array: object[] = [
    { name: "Test Pos 1", pos: 1 },
    { name: "Test Pos 2", pos: 2 },
    { name: "Test Pos 3", pos: 3 },
    { name: "Test Pos 4", pos: 4 },
  ];

  let rearangedArray = Utils.moveArrayElementUp({
    array: array,
    indexToMoveUp: 1,
  });

  expect(rearangedArray).toBeDefined();
  expect(rearangedArray[1]).toEqual({ name: "Test Pos 1", pos: 1 });
  expect(rearangedArray.length).toBe(4);

  // Erste Position verschieben -> darf nicht passieren
  rearangedArray = Utils.moveArrayElementUp({
    array: array,
    indexToMoveUp: 0,
  });

  expect(rearangedArray).toBeDefined();
  expect(rearangedArray).toEqual(array);
  expect(rearangedArray.length).toBe(4);

  rearangedArray = Utils.moveArrayElementUp({
    array: array,
    indexToMoveUp: 3,
  });

  expect(rearangedArray).toBeDefined();
  expect(rearangedArray[3]).toEqual({ name: "Test Pos 3", pos: 3 });
  expect(rearangedArray.length).toBe(4);
});
/* =====================================================================
  // Array nach bestimmten Feld neu Nummerieren
  // ===================================================================== */
test("Utils.renumberArray(): Elemente neu nummerieren", () => {
  let array: object[] = [
    { name: "Test Pos 1", pos: 9 },
    { name: "Test Pos 2", pos: 100 },
    { name: "Test Pos 3", pos: 12 },
    { name: "Test Pos 4", pos: 34 },
  ];

  let renumberedArray = Utils.renumberArray({
    array: array,
    field: "pos",
  });
  expect(renumberedArray).toBeDefined();
  expect(renumberedArray[1].pos).toEqual(2);
  expect(renumberedArray[3].pos).toEqual(4);
  expect(renumberedArray.length).toEqual(4);
});
/* =====================================================================
// Differenz in Tagen zwischen zwei Daten
// ===================================================================== */
test("Utils.differenceBetweenTwoDates(): Unterschied zwischen 2 Daten in Tagen", () => {
  let dateFrom = new Date(2021, 0, 3);
  let dateTo = new Date(2021, 0, 8);

  let differenceInDays = Utils.differenceBetweenTwoDates({
    dateFrom: dateFrom,
    dateTo: dateTo,
  });

  expect(differenceInDays).toEqual(6);

  differenceInDays = Utils.differenceBetweenTwoDates({
    dateFrom: dateTo,
    dateTo: dateFrom,
  });
  expect(differenceInDays).toBeUndefined();
});
/* =====================================================================
// UID generieren
// ===================================================================== */
test("Utils.generateUid(): Eindeutige Uid generieren", () => {
  let array: string[] = [];

  for (let i = 0; i < 100; i++) {
    array.push(Utils.generateUid(5));
  }

  let uniqueUids = new Set(array);
  // Prüfen ob wirklich eindeutig
  expect(array.length).toEqual(uniqueUids.size);
  // länge checken
  expect(Utils.generateUid(10).length).toEqual(10);
});
/* =====================================================================
// File-Suffix holen
// ===================================================================== */
test("Utils.getFileSuffix(): Suffix eines Files ermitteln", () => {
  expect(Utils.getFileSuffix("C:Documents/Test/Dummy.pdf")).toEqual("pdf");
  expect(Utils.getFileSuffix("C:DOCUMENT/STEST/DUMMY.PDF")).toEqual("pdf");
  expect(Utils.getFileSuffix("C:Documents/Test/Dummy")).toBeUndefined();

  expect(Utils.getFileSuffix("Header.jpg")).toEqual("jpg");
  expect(Utils.getFileSuffix("Header.max.jpg")).toEqual("jpg");
});
/* =====================================================================
// Array nach Attributnamen sortieren
// ===================================================================== */
test("Utils.sortArrayWithObject(): Array sortieren", () => {
  let array: object[] = [
    { name: "Alpha", pos: 3 },
    { name: "Beta", pos: 12 },
    { name: "Gamma", pos: 1 },
    { name: "Delta", pos: 5 },
    { name: "Epsilon", pos: 5 },
  ];
  // sortieren nach Datum
  let sortedArray: { [key: string]: any }[] = [];
  sortedArray = Utils.sortArray({
    array: array,
    attributeName: "name",
  });

  expect(sortedArray).toBeDefined();
  expect(sortedArray.length).toEqual(5);
  expect(sortedArray[2]).toEqual({ name: "Delta", pos: 5 });
  // Sortieren nach Zahl
  sortedArray = Utils.sortArray({
    array: array,
    attributeName: "pos",
  });

  expect(sortedArray).toBeDefined();
  expect(sortedArray.length).toEqual(5);
  expect(sortedArray[2]).toEqual({ name: "Delta", pos: 5 });

  // Sortieren nach Datum
  array = [
    { name: "Alpha", date: new Date(2021, 0, 13) },
    { name: "Beta", date: new Date(2021, 0, 2) },
    { name: "Gamma", date: new Date(2021, 0, 30) },
    { name: "Delta", date: new Date(2021, 0, 25) },
  ];

  sortedArray = Utils.sortArray({
    array: array,
    attributeName: "date",
  });

  expect(sortedArray).toBeDefined();
  expect(sortedArray.length).toEqual(4);
  expect(sortedArray[2]).toEqual({
    name: "Delta",
    date: new Date(2021, 0, 25),
  });
});
// /* =====================================================================
//   // Array nach Attributnamen (Wert Datum) sortieren
//   // ===================================================================== */
// test("Utils.sortArrayWithObjectByDate() - Array sortieren bei Datum", () => {
//   let
// });
