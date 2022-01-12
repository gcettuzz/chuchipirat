import Event, { Cook, EventDate } from "../event.class";
import mockAuthUser from "../../Firebase/__mocks__/authuser.mock";
import mockEvent from "../__mocks__/event.mock";
import exp from "constants";

/* =====================================================================
// Kostruktor
// ===================================================================== */
test("Event.constructor: Objekt Typ Event instazieren", () => {
  let testEvent = new Event();
  expect(testEvent).toBeDefined();
  // expect(testEvent).toHaveProperty("uid");
  // expect(testEvent).toHaveProperty("name");
  // expect(testEvent).toHaveProperty("motto");
  // expect(testEvent).toHaveProperty("location");
  // expect(testEvent).toHaveProperty("participants");
  // expect(testEvent).toHaveProperty("cooks");
  // expect(testEvent).toHaveProperty("numberOfDays");
  // expect(testEvent).toHaveProperty("dates");
  // expect(testEvent).toHaveProperty("maxDate");
  // expect(testEvent).toHaveProperty("pictureSrc");
  // expect(testEvent).toHaveProperty("pictureSrcFullSize");
  // expect(testEvent).toHaveProperty("createdAt");
  // expect(testEvent).toHaveProperty("createdFromDisplayName");
  // expect(testEvent).toHaveProperty("createdFromUid");
  // expect(testEvent).toHaveProperty("lastChangeAt");
  // expect(testEvent).toHaveProperty("lastChangeFromDisplayName");
  // expect(testEvent).toHaveProperty("lastChangeFromUid");

  // expect(Object.keys(testEvent).length).toEqual(19);
});
// /* =====================================================================
// // Factory
// // ===================================================================== */
// test("Event.factory: Objekt Typ Event instazieren", () => {
//   // Mit AuthUser
//   let testEvent = Event.factory(mockAuthUser);

//   expect(testEvent).toBeDefined();
//   expect(testEvent.cooks.length).toEqual(1);
//   expect(testEvent.dates.length).toEqual(1);
//   // Ohne Auth User
//   testEvent = Event.factory();
//   expect(testEvent).toBeDefined();
//   expect(testEvent.cooks.length).toEqual(0);
//   expect(testEvent.dates.length).toEqual(1);
// });

// /* =====================================================================
// // Eintrag in Array hinzufügen
// // ===================================================================== */
// test("Event.addEmptyEntry(): Eintrag in Array einfügen", () => {
//   let testEvent = Object.assign({}, mockEvent);

//   testEvent.dates = Event.addEmptyEntry({
//     array: testEvent.dates,
//     pos: 1,
//     emptyObject: Event.createDateEntry(),
//     renumberByField: "pos",
//   }) as EventDate[];

//   expect(testEvent).toBeDefined();
//   expect(testEvent.dates.length).toEqual(3);
//   expect(testEvent.dates[1].from).toEqual(new Date(0));
// });
/* =====================================================================
// Daten prüfen
// ===================================================================== */
// test("Event.checkEventData(): Prüfung der Daten", () => {
//   let testEvent = Object.assign({}, mockEvent);
//   // Happy Case
//   expect(() => Event.checkEventData(testEvent)).not.toThrow();

//   // Fehlernder Name
//   testEvent.name = "";
//   expect(() => Event.checkEventData(testEvent)).toThrow();

//   // Keine Köche
//   testEvent = Object.assign({}, mockEvent);
//   testEvent.cooks = [];
//   expect(() => Event.checkEventData(testEvent)).toThrow();

//   // Fehlendes Von Datum
//   testEvent = Object.assign({}, mockEvent);
//   testEvent.dates[0] = {
//     uid: "RZD5J",
//     pos: 2,
//     from: new Date(0),
//     to: new Date(2020, 9, 17),
//   };
//   expect(() => Event.checkEventData(testEvent)).toThrow();

//   // Fehlendes Bis Datum
//   testEvent = Object.assign({}, mockEvent);
//   testEvent.dates[0] = {
//     uid: "RZD5J",
//     pos: 2,
//     from: new Date(2020, 9, 17),
//     to: new Date(0),
//   };
//   expect(() => Event.checkEventData(testEvent)).toThrow();

//   // Von Datum ist grösser als Bis Datum
//   testEvent = Object.assign({}, mockEvent);
//   testEvent.dates[0] = {
//     uid: "RZD5J",
//     pos: 2,
//     from: new Date(2020, 9, 25),
//     to: new Date(2020, 9, 17),
//   };
//   expect(() => Event.checkEventData(testEvent)).toThrow();

//   // Überlappende Zeitscheiben
//   testEvent = Object.assign({}, mockEvent);
//   (testEvent.dates[0] = {
//     uid: "ZMVPs",
//     pos: 1,
//     from: new Date(2020, 8, 5),
//     to: new Date(2020, 8, 10),
//   }),
//     (testEvent.dates[1] = {
//       uid: "RZD5J",
//       pos: 2,
//       from: new Date(2020, 8, 9),
//       to: new Date(2020, 8, 16),
//     }),
//     expect(() => Event.checkEventData(testEvent)).toThrow();
// });
// /* =====================================================================
//   // Eintrag in Array löschen
//   // ===================================================================== */
// test("Event.deleteEntry(): Eintrag aus Array löschen", () => {
//   let testEvent = Object.assign({}, mockEvent);

//   // Liste mit nur einem Eintrag löschen
//   testEvent.cooks = Event.deleteEntry({
//     array: testEvent.cooks,
//     fieldValue: "RvLIR9NDGOWPwos8PrSZVgfIZvj9",
//     fieldName: "uid",
//     emptyObject: <Cook>{},
//     renumberByField: "displayName",
//   }) as Cook[];
//   expect(testEvent.cooks.length).toEqual(1);

//   // Liste mit zwei Einträgen löschen
//   testEvent.dates = Event.deleteEntry({
//     array: testEvent.dates,
//     fieldValue: "ZMVPs",
//     fieldName: "uid",
//     emptyObject: <Date>{},
//     renumberByField: "pos",
//   }) as EventDate[];
//   expect(testEvent.dates.length).toEqual(1);
// });
// /* =====================================================================
//   // Speichern vorbereiten
//   // ===================================================================== */
// test("Event.prepareSave(): Speichern vorbereiten", () => {
//   let testEvent = Object.assign({}, mockEvent);

//   testEvent.dates[1].to = new Date();
//   testEvent.pictureSrcFullSize = "";
//   let checkedEvent = Event.prepareSave(testEvent);
//   //FIXME: zwei neue Prüfungen!!!!

//   expect(testEvent.maxDate.getDate()).toEqual(new Date().getDate);
//   expect(testEvent.pictureSrcFullSize).toEqual(testEvent.pictureSrc);
// });

// // test("Event.prepareSave(): xxx", () => {
// //   let testEvent = Object.assign({}, mockEvent);

// // })

// // test("Event.prepareSave(): xxx", () => {
// //   let testEvent = Object.assign({}, mockEvent);

// // })

// // test("Event.prepareSave(): xxx", () => {
// //   let testEvent = Object.assign({}, mockEvent);

// // })

// /* =====================================================================
//   // Eintrag in Array löschen
//   // ===================================================================== */
// test("Event.getAuthUsersFromCooks(): berechtigte User aus Köche definieren", () => {
//   let testEvent = Object.assign({}, mockEvent);

//   let authUsers = Event.getAuthUsersFromCooks(testEvent.cooks);
//   expect(authUsers).toBeDefined();
//   expect(authUsers.length).toEqual(1);
//   expect(authUsers[0]).toEqual("RvLIR9NDGOWPwos8PrSZVgfIZvj9");
// });

//TEST_MISSING
/* =====================================================================
// Person/Koch hinzufügen
// ===================================================================== */
// test("Evemt.addCookToEvent(): XXX:", () => {})
/* =====================================================================
// Daten in Firebase SPEICHERN
// ===================================================================== */
// test("Evemt.save(): XXX:", () => {})

// test("Evemt.xyz(): XXX:", () => {})

// test("Evemt.xyz(): XXX:", () => {})

// test("Evemt.xyz(): XXX:", () => {})

// test("Evemt.xyz(): XXX:", () => {})

// test("Evemt.xyz(): XXX:", () => {})
