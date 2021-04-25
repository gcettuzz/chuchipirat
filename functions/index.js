// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");

admin.initializeApp();

/* =====================================================================
// Feed-Daten löschen
// ===================================================================== */
exports.deleteFeeds = functions
  .region("europe-west6")
  .https.onRequest(async (req, res) => {
    if (!req.query.hasOwnProperty("daysoffset")) {
      // Keine Parameter übergeben
      res.json({
        result: `Kein Parameter (daysoffset) übergeben.`,
      });
      return;
    }
    let daysOffset = parseInt(req.query.daysoffset);
    let counter = 0;
    if (daysOffset === 0) {
      // Das geht nicht - wäre zuviel
      res.json({
        result: `Kein Parameter DAYSOFFSET (oder Wert 0) übergeben.`,
      });
      return;
    } else if (daysOffset < 30) {
      res.json({
        result: `Der Offset Wert ${daysOffset} ist zu klein. Mindestens 30 Tage übergeben.`,
      });
      return;
    }
    let dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - daysOffset);
    const snapshot = await admin
      .firestore()
      .collection("feeds")
      .where("createdAt", "<", dateLimit)
      .get();

    snapshot.forEach(async (document) => {
      await admin.firestore().collection("feeds").doc(document.id).delete();
      counter++;
    });
    // Send back a message that we've successfully written the message
    res.json({ result: `${counter} Feed-Documents deleted.` });
  });
/* =====================================================================
// User DisplayName updaten
// ===================================================================== */
// Alle Dokumente anpassen, in welchen das Bild drin ist.
exports.updateUserDisplayName = functions
  .region("europe-west6")
  .firestore.document(
    "_cloudFunctions/waitingArea/user_displayName/{documentId}"
  )
  .onCreate(async (snap, context) => {
    // aktuells Dokuemnt holen
    const updateValues = snap.data();
    let counter = 0;
    // Log --> wer update
    functions.logger.log("Update Displayname for Profile: ", updateValues.uid);

    // Events --> Ersteller
    let events = await admin
      .firestore()
      .collection("events")
      .where("createdFromUid", "==", updateValues.uid)
      .get();

    events.forEach(async (event) => {
      await admin.firestore().collection("events").doc(event.id).update({
        createdFromDisplayName: updateValues.newValue,
      });
      counter++;
    });

    // Events --> Zuletzt geändert
    events = await admin
      .firestore()
      .collection("events")
      .where("lastChangeFromUid", "==", updateValues.uid)
      .get();

    events.forEach(async (event) => {
      await admin.firestore().collection("events").doc(event.id).update({
        lastChangeFromDisplayName: updateValues.newValue,
      });
      counter++;
    });

    // Events --> Köche
    events = await admin
      .firestore()
      .collection("events")
      .where("authUsers", "array-contains", updateValues.uid)
      .get();

    events.forEach(async (event) => {
      let cooks = event.data().cooks;
      let cook = cooks.find((cook) => cook.uid === updateValues.uid);
      cook.displayName = updateValues.newValue;
      await admin.firestore().collection("events").doc(event.id).update({
        cooks: cooks,
      });
      counter++;
    });

    // Menüplan  --> Erstellt von
    let menuplans = await admin
      .firestore()
      .collectionGroup("docs")
      .where("createdFromUid", "==", updateValues.uid)
      .get();

    menuplans.forEach(async (menuplan) => {
      menuplans.forEach(async (menuplan) => {
        await admin
          .firestore()
          .collection(`events/${menuplan.ref.parent.parent.id}/docs`)
          .doc(menuplan.id)
          .update({
            createdFromDisplayName: updateValues.newValue,
          });
        counter++;
      });

      // Menüplan --> Zuletzt geändert
      menuplans = await admin
        .firestore()
        .collectionGroup("docs")
        .where("lastChangeFromUid", "==", updateValues.uid)
        .get();

      await admin
        .firestore()
        .collection(`events/${menuplan.ref.parent.parent.id}/docs`)
        .doc(menuplan.id)
        .update({
          lastChangeFromDisplayName: updateValues.newValue,
        });
      counter++;
    });

    // ShoppingList  --> Erstellt von
    let shoppingLists = await admin
      .firestore()
      .collectionGroup("docs")
      .where("generatedFromUid", "==", updateValues.uid)
      .get();

    shoppingLists.forEach(async (shoppingList) => {
      await admin
        .firestore()
        .collection(`events/${shoppingList.ref.parent.parent.id}/docs`)
        .doc(shoppingList.id)
        .update({
          generatedFromDisplayName: updateValues.newValue,
        });
      counter++;
    });

    // Feeds
    let feeds = await admin
      .firestore()
      .collection("feeds")
      .where("userUid", "==", updateValues.uid)
      .get();

    feeds.forEach(async (feed) => {
      await admin.firestore().collection("feeds").doc(feed.id).update({
        displayName: updateValues.newValue,
      });
      counter++;
    });

    // Recipes - Angelegt von
    let recipes = await admin
      .firestore()
      .collection("recipes")
      .where("createdFromUid", "==", updateValues.uid)
      .get();

    recipes.forEach(async (recipe) => {
      await admin.firestore().collection("recipes").doc(recipe.id).update({
        createdFromDisplayName: updateValues.newValue,
      });
      counter++;
    });

    // Recipes - geändert von
    recipes = await admin
      .firestore()
      .collection("recipes")
      .where("lastChangeFromUid", "==", updateValues.uid)
      .get();

    recipes.forEach(async (recipe) => {
      await admin.firestore().collection("recipes").doc(recipe.id).update({
        lastChangeFromDisplayName: updateValues.newValue,
      });
      counter++;
    });
    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    const done = true;

    // Log - Wieviele Docs angepasst wurden
    functions.logger.log("Edited Documents: ", counter);

    return snap.ref.set({ done }, { merge: true });
  });
/* =====================================================================
// User Profilbild updaten
// ===================================================================== */
// Alle Dokumente anpassen, in welchen das Bild drin ist.
exports.updateUserPictureSrc = functions
  .region("europe-west6")
  .firestore.document(
    "_cloudFunctions/waitingArea/user_pictureSrc/{documentId}"
  )
  .onCreate(async (snap, context) => {
    // aktuells Dokuemnt holen
    const updateValues = snap.data();
    let counter = 0;
    // Log --> wer update
    functions.logger.log("Update PictureSrc for Profile: ", updateValues.uid);

    // Events --> Köche
    events = await admin
      .firestore()
      .collection("events")
      .where("authUsers", "array-contains", updateValues.uid)
      .get();

    events.forEach(async (event) => {
      let cooks = event.data().cooks;
      let cook = cooks.find((cook) => cook.uid === updateValues.uid);
      cook.pictureSrc = updateValues.newValue;
      await admin.firestore().collection("events").doc(event.id).update({
        cooks: cooks,
      });
      counter++;
    });

    // Feeds
    let feeds = await admin
      .firestore()
      .collection("feeds")
      .where("userUid", "==", updateValues.uid)
      .get();

    feeds.forEach(async (feed) => {
      await admin.firestore().collection("feeds").doc(feed.id).update({
        pictureSrc: updateValues.newValue,
      });
      counter++;
    });

    const done = true;

    // Log - Wieviele Docs angepasst wurden
    functions.logger.log("Edited Documents: ", counter);

    return snap.ref.set({ done }, { merge: true });
  });
/* =====================================================================
// User Profil-Motto updaten
// ===================================================================== */
// Alle Dokumente anpassen, in welchen das Motto drin ist.
exports.updateUserMotto = functions
  .region("europe-west6")
  .firestore.document("_cloudFunctions/waitingArea/user_motto/{documentId}")
  .onCreate(async (snap, context) => {
    // aktuells Dokuemnt holen
    const updateValues = snap.data();
    let counter = 0;
    // Log --> wer update
    functions.logger.log("Update Motto for Profile: ", updateValues.uid);

    // Events --> Köche
    events = await admin
      .firestore()
      .collection("events")
      .where("authUsers", "array-contains", updateValues.uid)
      .get();

    events.forEach(async (event) => {
      let cooks = event.data().cooks;
      let cook = cooks.find((cook) => cook.uid === updateValues.uid);
      cook.motto = updateValues.newValue;
      await admin.firestore().collection("events").doc(event.id).update({
        cooks: cooks,
      });
      counter++;
    });

    const done = true;
    // Log - Wieviele Docs angepasst wurden
    functions.logger.log("Edited Documents: ", counter);

    return snap.ref.set({ done }, { merge: true });
  });
/* =====================================================================
// Produkte updaten
// ===================================================================== */
// Alle Dokumente anpassen, in welchen das Produkt drin ist.
exports.updateProduct = functions
  .region("europe-west6")
  .firestore.document("_cloudFunctions/waitingArea/product/{documentId}")
  .onCreate(async (snap, context) => {
    // aktuelles Dokuemnt holen
    const updateValues = snap.data();
    let counter = 0;

    // Log --> wer update
    functions.logger.log("Update Product: ", updateValues.uid);

    // Alle Rezepte mit diesem Produkt holen
    let recipes = await admin
      .firestore()
      .collectionGroup("details")
      .where("usedProducts", "array-contains", updateValues.uid)
      .get();

    recipes.forEach(async (recipe) => {
      // Namen updaten
      let ingredients = recipe.data().ingredients;
      ingredients.forEach((ingredient) => {
        if (ingredient.product.uid === updateValues.uid) {
          ingredient.product.name = updateValues.newValue;
        }
      });
      // Dokument zurückschreiben
      await admin
        .firestore()
        .collection(`recipes/${recipe.ref.parent.parent.id}/details`)
        .doc(recipe.id)
        .update({
          ingredients: ingredients,
        });
      counter++;
    });

    // Alle Postizettel mit diesem Produkt holen
    let shoppingLists = await admin
      .firestore()
      .collectionGroup("docs")
      .where("usedProducts", "array-contains", updateValues.uid)
      .get();

    shoppingLists.forEach(async (shoppingList) => {
      // Namen updaten
      let list = shoppingList.data().list;
      list.forEach((department) => {
        department.items.forEach((item) => {
          if (item.uid === updateValues.uid) {
            item.name = updateValues.newValue;
          }
        });
      });
      // Dokument zurückschreiben
      await admin
        .firestore()
        .collection(`events/${shoppingList.ref.parent.parent.id}/docs`)
        .doc(shoppingList.id)
        .update({
          list: list,
        });
      counter++;
    });

    const done = true;
    // Log - Wieviele Docs angepasst wurden
    functions.logger.log("Edited Documents: ", counter);

    return snap.ref.set({ done }, { merge: true });
  });
/* =====================================================================
// Gio's Vestaboard updaten
// ===================================================================== */
// Sobald ein neuer User erfasst wurde, das Vestaboard updaten
exports.updateGiosVestaboardAboutNewUser = functions
  .region("europe-west6")
  .firestore.document("users/{documentId}")
  .onCreate(async (snap, context) => {
    const fetch = require("node-fetch");

    // aktuelles Dokument holen
    const firstName = snap.data().firstName;

    // Anzahl Köche holen
    let stats = await admin
      .firestore()
      .collection("stats")
      .doc("counter")
      .get();

    let noCooks = stats.data().noUsers;

    // No im öffentlichen Profil setzen
    let publicProfile = await admin
      .firestore()
      .collection(`users/${snap.id}/public`)
      .doc("profile")
      .get();

    await admin
      .firestore()
      .collection(`users/${snap.id}/public`)
      .doc("profile")
      .update({
        memberId: noCooks,
      });

    // Log - Was wird gesendet
    functions.logger.log(
      "Vestaboard updated - Welcome ",
      firstName,
      " cook # ",
      noCooks
    );

    const url = `https://maker.ifttt.com/trigger/chuchipirat_user_created/with/key/bDl9vn7PMDEUwlwEsiVDjU?value1=${firstName}&value2=${noCooks}`;

    // ... und Schuss
    const externalRes = await fetch(url);
    res.sendStatus(externalRes.ok ? 200 : 500);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("done");
      }, 200);
    });
  });

// NEXT_FEATURE: Auch Rezepte können Bilder und Namen wechseln....
// Es braucht eine entsprechende CloudFunction

// NEXT_FEATURE: Löschen der Trigger-Files -- >über Cloud Function
// wie deleteFeeds
