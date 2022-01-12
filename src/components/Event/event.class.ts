import Utils from "../Shared/utils.class";
import Feed, { FeedType } from "../Shared/feed.class";
import Stats, { StatsField } from "../Shared/stats.class";

import { IMAGES_SUFFIX } from "../Firebase/Storage/firebase.storage.super.class";
// import * as TEXT from "../../constants/text";
import * as DEFAULT_VALUES from "../../constants/defaultValues";

import {
  AuthUser,
  AuthUserPublicProfile,
} from "../Firebase/Authentication/authUser.class";
import Firebase from "../Firebase/firebase.class";
import FirebaseAnalyticEvent from "../../constants/firebaseEvent";
import UserPublicProfile, {
  UserPublicProfileFields,
} from "../User/user.public.profile.class";
import { Operator, SortOrder } from "../Firebase/Db/firebase.db.super.class";

export const EVENT_TYPES = {
  TYPE_ACTUAL: "actual",
  TYPE_HISTORY: "history",
};

export enum EventType {
  actual = "actual",
  history = "history",
}

export interface Cook extends AuthUserPublicProfile {
  uid: string;
}

export interface EventDate {
  uid: string;
  pos: number;
  from: Date;
  to: Date;
}
interface AddEmptyEntry {
  array: object[];
  pos: number;
  emptyObject: object;
  renumberByField: string;
}
interface DeleteEntry {
  array: { [key: string]: any }[];
  fieldValue: string | number | boolean;
  fieldName: string;
  emptyObject: object;
  renumberByField: string;
}
//FIXME:
interface AddCookToEvent {
  firebase: Firebase;
  authUser: AuthUser;
  cookPublicProfile: any;
  cookUid: string;
  event: Event;
}
interface RemoveCookFromEvent {
  firebase: Firebase;
  authUser: AuthUser;
  cookUidToRemove: string;
  event: Event;
}

interface Save {
  firebase: Firebase;
  event: Event;
  authUser: AuthUser;
}

interface UploadPicture {
  firebase: Firebase;
  file: Object;
  event: Event;
  authUser: AuthUser;
}

interface GetEvent {
  firebase: Firebase;
  uid: string;
}
interface GetEvents {
  firebase: Firebase;
  userUid: string;
  eventType: EventType;
}
export default class Event {
  uid: string;
  name: string;
  motto: string;
  location: string;
  participants: number;
  cooks: Cook[];
  numberOfDays: number;
  dates: EventDate[];
  maxDate: Date;
  pictureSrc: string;
  pictureSrcFullSize: string;
  authUsers: string[];
  createdAt: Date;
  createdFromDisplayName: string;
  createdFromUid: string;
  lastChangeAt: Date;
  lastChangeFromDisplayName: string;
  lastChangeFromUid: string;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor() {
    this.uid = "";
    this.name = "";
    this.motto = "";
    this.location = "";
    this.participants = 0;
    this.pictureSrc = "";
    this.cooks = [];
    this.numberOfDays = 0;
    this.dates = [];
    this.maxDate = new Date(0);
    this.pictureSrc = "";
    this.pictureSrcFullSize = "";
    this.authUsers = [];
    this.createdAt = new Date(0);
    this.createdFromDisplayName = "";
    this.createdFromUid = "";
    this.lastChangeAt = new Date(0);
    this.lastChangeFromDisplayName = "";
    this.lastChangeFromUid = "";
  }
  /* =====================================================================
  // Factory
  // ===================================================================== */
  static factory(authUser?: AuthUser) {
    let event = new Event();
    if (authUser) {
      event.cooks = [
        {
          uid: authUser.uid,
          ...authUser.publicProfile,
        },
      ];
    } else {
      event.cooks = [];
    }

    let emptyDateLine = Event.createDateEntry();
    emptyDateLine.pos = 1;
    event.dates = [emptyDateLine];
    return event;
  }
  /* =====================================================================
  // Leere Datumszeile erzeugen
  // ===================================================================== */
  static createDateEntry(): EventDate {
    return {
      uid: Utils.generateUid(5),
      pos: 0,
      from: new Date(0),
      to: new Date(0),
    };
  }
  /* =====================================================================
  // Eintrag in Array hinzufügen
  // ===================================================================== */
  static addEmptyEntry({
    array,
    pos,
    emptyObject,
    renumberByField,
  }: AddEmptyEntry) {
    array = Utils.insertArrayElementAtPosition({
      array: array,
      indexToInsert: pos - 1,
      newElement: emptyObject,
    });
    array = Utils.renumberArray({ array: array, field: renumberByField });
    return array;
  }
  /* =====================================================================
  // Daten prüfen
  // ===================================================================== */
  static checkEventData(event: Event) {
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
      if (date.from.getTime() == new Date(0).getTime()) {
        throw new Error(`Bei der Position ${counter + 1} fehlt das Von-Datum.`);
      }
      if (date.to.getTime() == new Date(0).getTime()) {
        throw new Error(`Bei der Position ${counter + 1} fehlt das Bis-Datum.`);
      }
      if (date.from.getDate() > date.to.getDate()) {
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
  static deleteEntry({
    array,
    fieldValue,
    fieldName,
    emptyObject,
    renumberByField,
  }: DeleteEntry) {
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
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static addCookToEvent = async ({
    firebase,
    authUser,
    cookPublicProfile,
    cookUid,
    event,
  }: AddCookToEvent) => {
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
    UserPublicProfile.incrementField({
      firebase: firebase,
      uid: cookUid,
      field: UserPublicProfileFields.noEvents,
      step: 1,
    });

    // Feed
    Feed.createFeedEntry({
      firebase: firebase,
      authUser: authUser,
      feedType: FeedType.eventCookAdded,
      objectUid: event.uid,
      objectName: event.name,
      textElements: [event.name],
      objectPictureSrc: event.pictureSrc,
      objectUserUid: cookUid,
      objectUserDisplayName: cookPublicProfile.displayName,
      objectUserPictureSrc: cookPublicProfile.pictureSrc,
    });
    // Analytik
    firebase.analytics.logEvent(FirebaseAnalyticEvent.eventCookAdded);

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
  }: RemoveCookFromEvent) => {
    event.cooks = event.cooks.filter((cook) => cook.uid !== cookUidToRemove);

    // Änderungen direkt speichern
    await Event.save({ firebase: firebase, event: event, authUser: authUser });

    // Dem User Credit nehmen
    UserPublicProfile.incrementField({
      firebase: firebase,
      field: UserPublicProfileFields.noEvents,
      uid: cookUidToRemove,
      step: -1,
    }).catch((error) => {
      console.error(error);
      throw error;
    });

    return event.cooks;
  };
  /* =====================================================================
  // Daten in Firebase SPEICHERN
  // ===================================================================== */
  static async save({ firebase, event, authUser }: Save) {
    let newEvent = false;
    let noParticipantsBeforeSave = 0;

    event = Event.prepareSave(event);

    if (!event.uid) {
      newEvent = true;
      await firebase.event
        .create<Event>({ value: event, authUser: authUser })
        .then((result) => {
          event = result as Event;
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    } else {
      // Alte Teilnehmerzahl holen, damit die Statistik später angepasst werden kann
      await firebase.event.read<Event>({ uids: [event.uid] }).then((result) => {
        noParticipantsBeforeSave = result.participants;
      });
      firebase.event
        .update<Event>({
          uids: [event.uid],
          value: event,
          authUser: authUser,
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    }

    if (newEvent) {
      // Event auslösen
      firebase.analytics.logEvent(FirebaseAnalyticEvent.eventCreated);
      // Statistik
      Stats.incrementStat({
        firebase: firebase,
        field: StatsField.noEvents,
        value: 1,
      });
      // Dem User Credits geben
      UserPublicProfile.incrementField({
        firebase: firebase,
        uid: authUser.uid,
        field: UserPublicProfileFields.noEvents,
        step: 1,
      });
      // Feed Eintrag
      Feed.createFeedEntry({
        firebase: firebase,
        authUser: authUser,
        feedType: FeedType.eventCreated,
        objectUid: event.uid,
        textElements: [event.name],
        objectName: event.name,
        objectPictureSrc: event.pictureSrc,
      });
    }

    // Anzahl TNs updaten
    if (event.participants !== noParticipantsBeforeSave) {
      Stats.incrementStat({
        firebase: firebase,
        field: StatsField.noParticipants,
        value: event.participants - noParticipantsBeforeSave,
      });
    }
    return event;
  }
  /* =====================================================================
  // Speichern vorbereiten
  // ===================================================================== */
  static prepareSave(event: Event) {
    // Max-Datum bestimmen
    let maxDate = new Date();
    event.maxDate = event.dates[0].to;
    for (let i = 1; i < event.dates.length; i++) {
      if (event.dates[i].to > maxDate) {
        event.maxDate = event.dates[i].to;
      }
    }

    // Anzahl Tage Total berechnen
    event.dates.forEach((date) => {
      event.numberOfDays += Utils.differenceBetweenTwoDates({
        dateFrom: date.from,
        dateTo: date.to,
      }) as number;
    });

    // Dates sortieren
    event.dates = Utils.sortArray({
      array: event.dates,
      attributeName: "from",
    }) as EventDate[];
    event.dates = Utils.renumberArray({
      array: event.dates,
      field: "pos",
    }) as EventDate[];

    // Bild URL kopieren falls nicht auf eigenem Server
    if (
      (!event.pictureSrc.includes("firebasestorage.googleapis") &&
        !event.pictureSrc.includes("chuchipirat") &&
        !event.pictureSrc) ||
      !event.pictureSrcFullSize
    ) {
      event.pictureSrcFullSize = event.pictureSrc;
    }

    event.authUsers = this.getAuthUsersFromCooks(event.cooks);

    return event;
  }
  /* =====================================================================
  // Bild in Firebase Storage hochladen
  // ===================================================================== */
  static getAuthUsersFromCooks(cooks: Cook[]) {
    let authUsers: string[] = [];
    // Berechtigte Users in Array speicher
    cooks.forEach((cook) => authUsers.push(cook.uid));
    return authUsers;
  }

  // /* =====================================================================
  // // Bild in Firebase Storage hochladen
  // // ===================================================================== */
  // HACK: Wegen Fehler im Firebase Interface kann hier nicht auf das Klassen-
  // HACK: konstukt firebase.storage.class gewechselt werden. nach dem Upgrade
  // HACK: wieder prüfen.
  static async uploadPicture({
    firebase,
    file,
    event,
    authUser,
  }: UploadPicture) {
    let downloadURL;

    // const eventDoc = firebase.eventDoc(event.uid);

    //FIXME: auf neue Storage klasse umbiegen
    // await firebase
    //   .uploadPicture({
    //     file: file,
    //     filename: event.uid,
    //     folder: firebase.event_folder(),
    //   })
    //   .then(async () => {
    //     // Redimensionierte Varianten holen
    //     await firebase
    //       .getPictureVariants({
    //         folder: firebase.event_folder(),
    //         uid: event.uid,
    //         sizes: [IMAGES_SUFFIX.size300.size, IMAGES_SUFFIX.size1000.size],
    //         oldDownloadUrl: event.pictureSrc,
    //       })
    //       .then((fileVariants) => {
    //         fileVariants.forEach((fileVariant, counter) => {
    //           if (fileVariant.size === IMAGES_SUFFIX.size300.size) {
    //             event.pictureSrc = fileVariant.downloadURL;
    //           } else if (fileVariant.size === IMAGES_SUFFIX.size1000.size) {
    //             event.pictureSrcFullSize = fileVariant.downloadURL;
    //           }
    //         });
    //       });
    //   })
    //   .then(() => {
    //     // Neuer Wert gleich speichern
    //     firebase.event.updateFields({
    //       uids: [event.uid],
    //       authUser: authUser,
    //       values: {
    //         pictureSrc: event.pictureSrc,
    //         pictureSrcFullSize: event.pictureSrcFullSize,
    //       },
    //       updateChangeFields: true,
    //     });
    //     // eventDoc.update({
    //     //   pictureSrc: event.pictureSrc,
    //     //   pictureSrcFullSize: event.pictureSrcFullSize,
    //     //   lastChangeFromUid: authUser.uid,
    //     //   lastChangeFromDisplayName: authUser.publicProfile.displayName,
    //     //   lastChangeAt: firebase.timestamp.fromDate(new Date()),
    //     // });
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     throw error;
    //   });

    // // Analytik
    // firebase.analytics.logEvent(FirebaseAnalyticEvent.uploadPicture, {
    //   folder: "events",
    // });

    return {
      pictureSrc: event.pictureSrc,
      pictureSrcFullSize: event.pictureSrcFullSize,
    };
  }
  // /* =====================================================================
  // // Bild löschen
  // // ===================================================================== */
  // static deletePicture = async ({ firebase, event, authUser }) => {
  //   firebase
  //     .deletePicture({
  //       folder: firebase.event_folder(),
  //       filename: `${event.uid}${IMAGES_SUFFIX.size300.suffix}`,
  //     })
  //     .catch((error) => {
  //       throw error;
  //     });
  //   firebase
  //     .deletePicture({
  //       folder: firebase.event_folder(),
  //       filename: `${event.uid}${IMAGES_SUFFIX.size1000.suffix}`,
  //     })
  //     .catch((error) => {
  //       throw error;
  //     });

  //   const eventDoc = firebase.event(event.uid);

  //   // Neuer Wert gleich speichern
  //   eventDoc
  //     .update({
  //       pictureSrc: "",
  //       pictureSrcFullSize: "",
  //       lastChangeFromUid: authUser.uid,
  //       lastChangeFromDisplayName: authUser.publicProfile.displayName,
  //       lastChangeAt: firebase.timestamp.fromDate(new Date()),
  //     })
  //     .catch((error) => {
  //       throw error;
  //     });

  //   // Analytik
  //   firebase.analytics.logEvent(FIREBASE_EVENTS.DELETE_PICTURE, {
  //     folder: "events",
  //   });
  // };
  /* =====================================================================
  // Event lesen
  // ===================================================================== */
  static getEvent = async ({ firebase, uid }: GetEvent) => {
    let event = <Event>{};

    await firebase.event
      .read<Event>({ uids: [uid] })
      .then((result) => {
        event = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return event;
  };
  // ===================================================================== */
  /**
   * getEventsOfUser: Event einer Person lesen
   * @param firebase Referenz zur DB
   * @param userUid UID des Users
   * @param eventType Type der Events, die gelesen werden sollen (siehe enum EventType )
   */
  // ===================================================================== */
  static async getEventsOfUser({
    firebase,
    userUid,
    eventType = EventType.actual,
  }: GetEvents) {
    let events: Event[] = [];

    let whereOperator: Operator;

    switch (eventType) {
      case EventType.actual:
        // Analytik
        firebase.analytics.logEvent(FirebaseAnalyticEvent.eventGetActual);
        whereOperator = Operator.GE;
        break;
      case EventType.history:
        // Analytik
        firebase.analytics.logEvent(FirebaseAnalyticEvent.eventGetHistory);
        whereOperator = Operator.LE;
        break;
    }

    await firebase.event
      .readCollection<Event>({
        uids: [""],
        orderBy: { field: "maxDate", sortOrder: SortOrder.asc },
        where: [
          {
            field: "authUsers",
            operator: Operator.ArrayContains,
            value: userUid,
          },
          { field: "maxDate", operator: whereOperator, value: new Date() },
        ],
        limit: DEFAULT_VALUES.FEEDS_DISPLAY,
      })
      .then((result) => {
        events = result;
      });

    return events;
  }
}
