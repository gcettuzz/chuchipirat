import exp from "constants";
import User from "../user.class";
/* =====================================================================
// Kostruktor
// ===================================================================== */
test("User.constructor()", () => {
  let user = new User();

  expect(user).toBeDefined();
  expect(user).toHaveProperty("uid");
  expect(user).toHaveProperty("firstName");
  expect(user).toHaveProperty("lastName");
  expect(user).toHaveProperty("email");
  expect(user).toHaveProperty("lastLogin");
  expect(user).toHaveProperty("noLogins");
  expect(user).toHaveProperty("roles");
});
/* =====================================================================
// Factory
// ===================================================================== */
test("User.factory()", () => {
  // FIXME:
  // let user = User.factory({
  //   uid: "xyz11",
  //   firstName: "Test",
  //   lastName: "User",
  //   email: "test@chuchipirat.ch",
  //   lastLogin: new Date(2021, 1, 28),
  //   noLogins: 42,
  // });
  // expect(user).toBeDefined();
  // expect(user.uid).toEqual("xyz11");
  // expect(user.firstName).toEqual("Test");
  // expect(user.lastName).toEqual("User");
  // expect(user.email).toEqual("test@chuchipirat.ch");
  // expect(user.lastLogin).toEqual(new Date(2021, 1, 28));
  // expect(user.noLogins).toEqual(42);
});
/* =====================================================================
// Daten prüfen
// ===================================================================== */
//FIXME:
// test("User.checkUserProfileData(): Daten prüfen", () => {
//   let publicProfile = {
//     uid: "abcde",
//     firstName: "Test",
//     lastName: "User",
//     displayName: "test Dummy",
//     email: "test@chuchipirat.ch",
//     motto: "testen lohnt sich...",
//     pictureSrc: "",
//     pictureSrcFullSize: "",
//     lastLogin: new Date(),
//     noLogins: 42,
//   };

//   expect(() => User.checkUserProfileData(publicProfile)).not.toThrow();
//   publicProfile.displayName = "";
//   expect(() => User.checkUserProfileData(publicProfile)).toThrow();
// });

//TEST_MISSING
/* =====================================================================
// Zähler für öffentliches Profil hochzählen
// ===================================================================== */
// test("User.incrementPublicProfileField(): Daten speichern", () => {});
/* =====================================================================
// Alle User holen
// ===================================================================== */
// test("User.getAllUsers(): alle User holen", () => {});
/* =====================================================================
// Neuer User anlegen
// ===================================================================== */
// test("User.createUser(): XXX", () => {});
/* =====================================================================
// Letztes Login updaten und Anzahl Logins hochzählen
// ===================================================================== */
// test("User.registerSignIn(): XXX", () => {});
/* =====================================================================
// User anhand der Mailadresse holen
// ===================================================================== */
// test("User.getUidByEmail(): XXX", () => {});
/* =====================================================================
// User holen
// ===================================================================== */
// test("User.getUser(): XXX", () => {});
/* =====================================================================
// Öffentliches Profil lesen
// ===================================================================== */
// test("User.getPublicProfile(): XXX", () => {});
/* =====================================================================
// Profil und Öffentliches Profil lesen
// ===================================================================== */
// test("User.getFullProfile(): XXX", () => {});
/* =====================================================================
// Profilwerte speichern
// ===================================================================== */
// test("User.saveFullProfile(): XXX", () => {});
/* =====================================================================
// Profilbild hochladen
// ===================================================================== */
// test("User.uploadPicture(): XXX", () => {});
/* =====================================================================
// Bild löschen
// ===================================================================== */
// test("User.deletePicture(): XXX", () => {});
/* =====================================================================
// E-Mailadresse updaten
// ===================================================================== */
// test("User.updateEmail(): XXX", () => {});

// test("User.uploadPicture(): XXX", () => {});

// test("User.uploadPicture(): XXX", () => {});

// test("User.uploadPicture(): XXX", () => {});
