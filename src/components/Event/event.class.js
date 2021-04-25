import Utils from "../Shared/utils.class";
import Stats, { STATS_FIELDS } from "../Shared/stats.class";
import User, { PUBLIC_PROFILE_FIELDS } from "../User/user.class";
import Feed, { FEED_TYPE } from "../Shared/feed.class";
import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";
import * as TEXT from "../../constants/text";

export const EVENT_TYPES = {
  TYPE_ACTUAL: "actual",
  TYPE_HISTORY: "history",
};

export default class Event {
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(authUser = {}) {
    this.uid = "";
    this.name = "";
    this.motto = "";
    this.location = "";

    this.participants = "";
    this.pictureSrc = "";
    if (authUser) {
      this.cooks = [
        {
          ...authUser.publicProfile,
          uid: authUser.uid,
        },
      ];
    } else {
      this.cooks = [];
    }
    this.numberOfDays = "";
    let emptyDateLine = Event.createDateEntry();
    emptyDateLine.pos = 1;

    this.dates = [emptyDateLine];
  }
  /* =====================================================================
  // Leere Datumszeile erzeugen
  // ===================================================================== */
  static createDateEntry() {
    return { pos: 0, from: null, to: null, uid: Utils.generateUid(5) };
  }
  /* =====================================================================
  // Eintrag in Array hinzufügen
  // ===================================================================== */
  static addEmptyEntry({ array, pos, emptyObject, renumberByField }) {
    array = Utils.insertArrayElementAtPosition(array, pos - 1, emptyObject);
    array = Utils.renumberArray({ array: array, field: renumberByField });
    return array;
  }
  /* =====================================================================
  // Daten prüfen
  // ===================================================================== */
  static checkEventData(event) {
    if (!event.name) {
      throw new Error("Der Name des Anlasses darf nicht leer sein.");
    }

    if (event.cooks.length === 0) {
      throw new Error(
        "Der Anlass muss mindestens einer Person zugeordnet sein."
      );
    }

    // Prüfen ob Von- und Bis-Datum konsistent
    event.dates.forEach((date, counter) => {
      if (!date.from) {
        throw new Error(`Bei der Position ${counter + 1} fehlt das Von-Datum.`);
      }
      if (!date.to) {
        throw new Error(`Bei der Position ${counter + 1} fehlt das Bis-Datum.`);
      }
      if (date.from > date.to) {
        throw new Error(
          `Die Daten der Position ${
            counter + 1
          } stimmen nicht. Das Von-Datum ${date.from.toLocaleString("de-CH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })} ist grösser als das Bis-Datum ${date.to.toLocaleString("de-CH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}`
        );
      }
    });

    // Prüfen ob Zeitscheiben überlappend
    event.dates.forEach((outerDate, outerCounter) => {
      event.dates.forEach((innerDate, innerCounter) => {
        if (outerCounter !== innerCounter) {
          if (
            outerDate.from >= innerDate.from &&
            outerDate.from <= innerDate.to
          ) {
            throw new Error(
              `Die Daten der Position ${
                outerCounter + 1
              } überschneiden sich mit der Position ${innerCounter + 1}`
            );
          }
        }
      });
    });
  }
  /* =====================================================================
  // Eintrag in Array löschen
  // ===================================================================== */
  static deleteEntry(
    array,
    fieldValue,
    fieldName,
    emptyObject,
    renumberByField
  ) {
    array = array.filter((entry) => entry[fieldName] !== fieldValue);

    if (array.length === 0) {
      array.push(emptyObject);
    }
    array = Utils.renumberArray({ array: array, field: renumberByField });
    return array;
  }
  /* =====================================================================
  // Person/Koch hinzufügen
  // ===================================================================== */
  static addCookToEvent = async (
    firebase,
    authUser,
    cookPublicProfile,
    cookUid,
    event
  ) => {
    // Neue Person in Kochmannschaft aufnehmen
    event.cooks.push({
      displayName: cookPublicProfile.displayName,
      motto: cookPublicProfile.motto,
      pictureSrc: cookPublicProfile.pictureSrc,
      uid: cookUid,
    });

    // Änderungen direkt speichern
    await Event.save({ firebase: firebase, event: event, authUser: authUser });

    // Dem User Credit geben
    User.incrementPublicProfileField(
      firebase,
      cookUid,
      PUBLIC_PROFILE_FIELDS.NO_EVENTS,
      1
    );

    // Feed
    Feed.createFeedEntry({
      firebase: firebase,
      authUser: {
        uid: cookUid,
        publicProfile: {
          displayName: cookPublicProfile.displayName,
          pictureSrc: cookPublicProfile.pictureSrc,
        },
      },
      feedType: FEED_TYPE.EVENT_COOK_ADDED,
      objectUid: event.uid,
      text: event.name,
    });
    // Analytik
    firebase.analytics.logEvent(FIREBASE_EVENTS.EVENT_COOK_ADDED);

    return event.cooks;
  };
  /* =====================================================================
  // Person/Koch entfernen
  // ===================================================================== */
  static removeCookFromEvent = async ({
    firebase,
    authUser,
    cookUidToRemove,
    event,
  }) => {
    event.cooks = event.cooks.filter((cook) => cook.uid !== cookUidToRemove);

    // Änderungen direkt speichern
    await Event.save({ firebase: firebase, event: event, authUser: authUser });

    // Dem User Credit nehmen
    User.incrementPublicProfileField(
      firebase,
      cookUidToRemove,
      PUBLIC_PROFILE_FIELDS.NO_EVENTS,
      -1
    );

    return event.cooks;
  };
  /* =====================================================================
  // Daten in Firebase SPEICHERN
  // ===================================================================== */
  static async save({ firebase, event, authUser }) {
    let newEvent = false;
    let docRef = null;
    let authUsers = [];
    let oldParticipants = 0;
    // NEXT_FEATURE: Bild generieren aus Google Maps
    let pictureSrc = event.pictureSrc;

    // Max-Datum bestimmen
    let maxDate = new Date();

    console.log(event);

    maxDate = event.dates[0].to;
    for (let i = 1; i < event.dates.length; i++) {
      if (event.dates[i].to > maxDate) {
        maxDate = event.dates[i].to;
      }
    }

    // Berechtigte Users in Array speicher
    event.cooks.forEach((cook) => authUsers.push(cook.uid));

    // Dates sortieren
    event.dates = Utils.sortArrayWithObjectByDate(event.dates, "from");
    event.dates = Utils.renumberArray({ array: event.dates, field: "pos" });

    if (!event.uid) {
      docRef = firebase.events().doc();
      event.uid = docRef.id;
      event.createdAt = firebase.timestamp.fromDate(new Date());
      event.createdFromUid = authUser.uid;
      event.createdFromDisplayName = authUser.publicProfile.displayName;
      newEvent = true;
    } else {
      docRef = firebase.event(event.uid);
      // Anzahl TNs holen
      await docRef.get().then((result) => {
        oldParticipants = result.data().participants;
      });
    }
    await docRef
      .set({
        name: event.name,
        motto: event.motto,
        location: event.location,
        dates: event.dates,
        maxDate: maxDate,
        cooks: event.cooks,
        authUsers: authUsers,
        pictureSrc: event.pictureSrc,
        pictureSrcFullSize: event.pictureSrcFullSize
          ? event.pictureSrcFullSize
          : event.pictureSrc,
        participants: event.participants,
        createdAt: event.createdAt,
        createdFromUid: event.createdFromUid,
        createdFromDisplayName: event.createdFromDisplayName,
        lastChangeFromUid: authUser.uid,
        lastChangeFromDisplayName: authUser.publicProfile.displayName,
        lastChangeAt: firebase.timestamp.fromDate(new Date()),
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    if (newEvent) {
      // Event auslösen
      firebase.analytics.logEvent(FIREBASE_EVENTS.EVENT_CREATED);
      // Statistik
      Stats.incrementStat({ firebase: firebase, field: STATS_FIELDS.EVENTS });
      // Dem User Credits geben
      User.incrementPublicProfileField(
        firebase,
        authUser.uid,
        PUBLIC_PROFILE_FIELDS.NO_EVENTS,
        1
      );
      // Feed Eintrag
      Feed.createFeedEntry({
        firebase: firebase,
        authUser: authUser,
        feedType: FEED_TYPE.EVENT_CREATED,
        objectUid: event.uid,
        text: event.name,
      });
    }
    // Anzahl TNs updaten
    Stats.incrementStat({
      firebase: firebase,
      field: STATS_FIELDS.PARTICIPANTS,
      value: event.participants - oldParticipants,
    });

    return event;
  }
  /* =====================================================================
  // Bild in Firebase Storage hochladen
  // ===================================================================== */
  static async uploadPicture({ firebase, file, event, authUser }) {
    const eventDoc = firebase.event(event.uid);

    await firebase
      .uploadPicture({
        file: file,
        filename: event.uid,
        folder: firebase.event_folder(),
      })
      .then(async () => {
        await firebase.waitUntilFileDeleted({
          folder: firebase.event_folder(),
          uid: event.uid,
          originalFile: file,
        });
      })
      .then(async () => {
        // Redimensionierte Varianten holen
        await firebase
          .getPictureVariants({
            folder: firebase.event_folder(),
            uid: event.uid,
            sizes: [300, 1000],
          })
          .then((fileVariants) => {
            fileVariants.forEach((fileVariant, counter) => {
              if (fileVariant.size === 300) {
                event.pictureSrc = fileVariant.downloadURL;
              } else if (fileVariant.size === 1000) {
                event.pictureSrcFullSize = fileVariant.downloadURL;
              }
            });
          });
      })
      .then(() => {
        // Neuer Wert gleich speichern
        eventDoc.update({
          pictureSrc: event.pictureSrc,
          pictureSrcFullSize: event.pictureSrcFullSize,
          lastChangeFromUid: authUser.uid,
          lastChangeFromDisplayName: authUser.publicProfile.displayName,
          lastChangeAt: firebase.timestamp.fromDate(new Date()),
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    // Analytik
    firebase.analytics.logEvent(FIREBASE_EVENTS.UPLOAD_PICTRE, {
      folder: "events",
    });

    return event.pictureSrcFullSize;
  }
  /* =====================================================================
  // Event lesen
  // ===================================================================== */
  static getEvent = async ({ firebase, uid }) => {
    let event = {};

    const eventRef = firebase.event(uid);
    await eventRef
      .get()
      .then((snapshot) => {
        event = snapshot.data();
        event.uid = snapshot.id;
        // Timestamps umwandeln
        event.dates.forEach((date) => {
          date.from = date.from.toDate();
          date.to = date.to.toDate();
        });
        event.createdAt = event.createdAt.toDate();
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return event;
  };
  /* =====================================================================
  // Events (alle) lesen
  // ===================================================================== */
  static async getEvents(firebase, authUser, type = EVENT_TYPES.TYPE_ACTUAL) {
    let events = [];
    let event = {};
    let whereOperator = "";
    const eventsRef = firebase.events();

    switch (type) {
      case EVENT_TYPES.TYPE_ACTUAL:
        // Analytik
        firebase.analytics.logEvent(FIREBASE_EVENTS.EVENT_GET_ACTUAL);
        whereOperator = ">=";
        break;
      case EVENT_TYPES.TYPE_HISTORY:
        // Analytik
        firebase.analytics.logEvent(FIREBASE_EVENTS.EVENT_GET_HISTORY);
        whereOperator = "<=";
        break;
      default:
        throw new Error();
    }

    const snapshot = await eventsRef
      .orderBy("maxDate", "asc")
      .where("authUsers", "array-contains", authUser.uid)
      .where("maxDate", whereOperator, new Date())
      .get()
      .catch((error) => {
        console.error(error);
        throw error;
      });

    snapshot.forEach((obj) => {
      event = obj.data();
      event.uid = obj.id;
      // Timestamps umwandeln
      event.dates.forEach((date) => {
        date.from = date.from.toDate();
        date.to = date.to.toDate();
      });
      event.createdAt = event.createdAt.toDate();
      events.push(event);
    });

    return events;
  }
}
