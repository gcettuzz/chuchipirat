import Utils from "../../Shared/utils.class";
import Feed, {FeedType} from "../../Shared/feed.class";
import Stats, {StatsField} from "../../Shared/stats.class";

import {
  IMAGES_SUFFIX,
  ImageSize,
} from "../../Firebase/Storage/firebase.storage.super.class";
// import * as TEXT from "../../constants/text";
import {
  ERROR_EVENT_NAME_CANT_BE_EMPTY as TEXT_ERROR_EVENT_NAME_CANT_BE_EMPTY,
  ERROR_EVENT_MUST_HAVE_MIN_ONE_COOK as TEXT_ERROR_EVENT_MUST_HAVE_MIN_ONE_COOK,
  ERROR_FROM_DATE_EMPTY as TEXT_ERROR_FROM_DATE_EMPTY,
  ERROR_TO_DATE_EMPTY as TEXT_ERROR_TO_DATE_EMPTY,
  ERROR_FORM_VALIDATION as TEXT_ERROR_FORM_VALIDATION,
  ERROR_FROM_DATE_BIGGER_THAN_TO_DATE as TEXT_ERROR_FROM_DATE_BIGGER_THAN_TO_DATE,
  ERROR_OVERLAPPING_DATES as TEXT_ERROR_OVERLAPPING_DATES,
} from "../../../constants/text";
import * as DEFAULT_VALUES from "../../../constants/defaultValues";

import {
  AuthUser,
  AuthUserPublicProfile,
} from "../../Firebase/Authentication/authUser.class";
import Firebase from "../../Firebase/firebase.class";
import FirebaseAnalyticEvent from "../../../constants/firebaseEvent";
import UserPublicProfile, {
  UserPublicProfileStatsFields,
} from "../../User/user.public.profile.class";
import {Operator, SortOrder} from "../../Firebase/Db/firebase.db.super.class";
import Role from "../../../constants/roles";
import {ChangeRecord} from "../../Shared/global.interface";
import FieldValidationError, {
  FormValidationFieldError,
} from "../../Shared/fieldValidation.error.class";
import EventShort from "./eventShort.class";
import _ from "lodash";
import Menuplan, {Menue} from "../Menuplan/menuplan.class";
import ShoppingListCollection from "../ShoppingList/shoppingListCollection.class";
import Recipe from "../../Recipe/recipe.class";
import UsedRecipes from "../UsedRecipes/usedRecipes.class";
import MaterialList from "../MaterialList/materialList.class";
import EventGroupConfiguration from "../GroupConfiguration/groupConfiguration.class";

export const EVENT_TYPES = {
  TYPE_ACTUAL: "actual",
  TYPE_HISTORY: "history",
};

export enum EventType {
  actual = "actual",
  history = "history",
}

export enum EventRefDocuments {
  usedRecipes = 1,
  shoppingList,
  materialList,
  recipeVariants,
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
  array: {[key: string]: any}[];
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
  localPicture?: File | null;
}
interface Delete {
  event: Event;
  firebase: Firebase;
  authUser: AuthUser;
}

interface UploadPicture {
  firebase: Firebase;
  file: File;
  event: Event;
  authUser: AuthUser;
}
interface DeletePicture {
  firebase: Firebase;
  event: Event;
  authUser: AuthUser;
  updateEventDocument?: boolean;
}

interface GetEvent {
  firebase: Firebase;
  uid: string;
}
interface GetEventListener {
  firebase: Firebase;
  uid: string;
  callback: (event: Event) => void;
}
interface GetEvents {
  firebase: Firebase;
  userUid: string;
  eventType: EventType;
}
interface AddRefDocument {
  refDocuments: Event["refDocuments"];
  newDocumentType: EventRefDocuments;
}
interface CheckIfDeletedDayArePlanned {
  event: Event;
  menuplan: Menuplan;
}
export default class Event {
  uid: string;
  name: string;
  motto: string;
  location: string;
  cooks: Cook[];
  numberOfDays: number;
  dates: EventDate[];
  maxDate: Date;
  pictureSrc: string;
  authUsers: string[];
  created: ChangeRecord;
  lastChange: ChangeRecord;
  refDocuments?: EventRefDocuments[];
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor() {
    this.uid = "";
    this.name = "";
    this.motto = "";
    this.location = "";
    this.pictureSrc = "";
    this.cooks = [];
    this.numberOfDays = 0;
    this.dates = [];
    this.maxDate = new Date(0);
    this.authUsers = [];
    this.created = {date: new Date(0), fromUid: "", fromDisplayName: ""};
    this.lastChange = {date: new Date(0), fromUid: "", fromDisplayName: ""};
  }
  /* =====================================================================
  // Factory
  // ===================================================================== */
  static factory(authUser: AuthUser) {
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
    event.created = Utils.createChangeRecord(authUser);
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
    array = Utils.renumberArray({array: array, field: renumberByField});
    return array;
  }
  /* =====================================================================
  // Daten prüfen
  // ===================================================================== */
  static checkEventData(event: Event) {
    let formValidation: FormValidationFieldError[] = [];
    if (!event.name) {
      formValidation.push({
        priority: 1,
        fieldName: "name",
        errorMessage: TEXT_ERROR_EVENT_NAME_CANT_BE_EMPTY,
      });
    }

    if (event.cooks.length === 0) {
      formValidation.push({
        priority: 4,
        fieldName: "cooks",
        errorMessage: TEXT_ERROR_EVENT_MUST_HAVE_MIN_ONE_COOK,
      });
    }

    // Prüfen ob Von- und Bis-Datum konsistent
    event.dates.forEach((date, counter) => {
      if (date.from.getTime() == new Date(0).getTime()) {
        formValidation.push({
          priority: 2,
          fieldName: "dateFrom_" + date.uid,
          errorMessage: TEXT_ERROR_FROM_DATE_EMPTY,
          errorObject: date,
        });
        // throw new Error(`Bei der Position ${counter + 1} fehlt das Von-Datum.`);
      }
      if (date.to.getTime() == new Date(0).getTime()) {
        formValidation.push({
          priority: 2,
          fieldName: "dateTo_" + date.uid,
          errorMessage: TEXT_ERROR_TO_DATE_EMPTY,
          errorObject: date,
        });
      }
      if (date.from > date.to && date.to.getFullYear() != 1970) {
        formValidation.push({
          priority: 3,
          fieldName: "dateFrom_" + date.uid,
          errorMessage: TEXT_ERROR_FROM_DATE_BIGGER_THAN_TO_DATE,
          errorObject: date,
        });
        // Beide Felder als Fehler markieren
        formValidation.push({
          priority: 3,
          fieldName: "dateTo_" + date.uid,
          errorMessage: "",
          errorObject: date,
        });
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
            formValidation.push({
              priority: 3,
              fieldName: "dateFrom_" + outerDate.uid,
              errorMessage: TEXT_ERROR_OVERLAPPING_DATES(innerCounter + 1),
              errorObject: outerDate,
            });
            formValidation.push({
              priority: 3,
              fieldName: "dateTo_" + outerDate.uid,
              errorMessage: "",
              errorObject: outerDate,
            });
            // Die Überlappung auch als Fehler markieren
            formValidation.push({
              priority: 3,
              fieldName: "dateFrom_" + innerDate.uid,
              errorMessage: TEXT_ERROR_OVERLAPPING_DATES(outerCounter + 1),
              errorObject: innerCounter,
            });
            formValidation.push({
              priority: 3,
              fieldName: "dateTo_" + innerDate.uid,
              errorMessage: "",
              errorObject: innerCounter,
            });
          }
        }
      });
    });
    // wenn nicht leer, Exception
    if (formValidation.length != 0) {
      throw new FieldValidationError(
        TEXT_ERROR_FORM_VALIDATION,
        formValidation
      );
    }
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
    array = Utils.renumberArray({array: array, field: renumberByField});
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
    event,
  }: AddCookToEvent) => {
    // Neue Person in Kochmannschaft aufnehmen
    event.cooks.push({
      displayName: cookPublicProfile.displayName,
      motto: cookPublicProfile.motto,
      pictureSrc: cookPublicProfile.pictureSrc,
      uid: cookPublicProfile.uid,
    });

    if (event.uid) {
      // Änderungen direkt speichern - aber nur, wenn der Anlass schon existiert
      await Event.save({
        firebase: firebase,
        event: event,
        authUser: authUser,
      });

      // Dem User Credit geben
      UserPublicProfile.incrementField({
        firebase: firebase,
        uid: cookPublicProfile.uid,
        field: UserPublicProfileStatsFields.noEvents,
        step: 1,
      });

      // Feed
      Feed.createFeedEntry({
        firebase: firebase,
        authUser: authUser,
        feedType: FeedType.eventCookAdded,
        feedVisibility: Role.basic,
        objectUid: event.uid,
        objectName: event.name,
        textElements: [event.name],
        objectPictureSrc: event.pictureSrc,
        objectUserUid: cookPublicProfile.uid,
        objectUserDisplayName: cookPublicProfile.displayName,
        objectUserPictureSrc: cookPublicProfile.pictureSrc,
      });
      firebase.analytics.logEvent(FirebaseAnalyticEvent.eventCookAdded);
    }
    // Analytik

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

    if (event.uid) {
      // Änderungen direkt speichern - aber nur, wenn der Event auf der DB
      // schon existiert... sonst ist es nur eine Manipulation des Arrays
      await Event.save({
        firebase: firebase,
        event: event,
        authUser: authUser,
      });

      // Dem User Credit nehmen
      UserPublicProfile.incrementField({
        firebase: firebase,
        field: UserPublicProfileStatsFields.noEvents,
        uid: cookUidToRemove,
        step: -1,
      }).catch((error) => {
        console.error(error);
        throw error;
      });
    }
    firebase.analytics.logEvent(FirebaseAnalyticEvent.eventCookRemoved);

    return event.cooks;
  };
  /* =====================================================================
  // Daten in Firebase SPEICHERN
  // ===================================================================== */
  static async save({firebase, event, authUser, localPicture}: Save) {
    let newEvent = false;
    let eventData = _.cloneDeep(event);
    eventData.dates = Event.deleteEmptyDates(eventData.dates);
    eventData = Event.prepareSave(eventData);
    Event.checkEventData(eventData);

    if (!eventData.uid) {
      newEvent = true;
      await firebase.event
        .create<Event>({value: eventData, authUser: authUser})
        .then(async (result) => {
          eventData = result;

          // Bild hochladen, wenn vorhanden
          if (localPicture instanceof File) {
            await Event.uploadPicture({
              firebase: firebase,
              event: eventData,
              file: localPicture,
              authUser: authUser,
            }).then((result) => (event.pictureSrc = result));
          }
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    } else {
      if (localPicture instanceof File) {
        // Falls ein Bild bereits vorhanden ist, zuerst löschen
        if (eventData.pictureSrc) {
          await Event.deletePicture({
            firebase: firebase,
            event: event,
            authUser: authUser,
          });
        }

        await Event.uploadPicture({
          firebase: firebase,
          event: eventData,
          file: localPicture,
          authUser: authUser,
        }).then((result) => {
          eventData.pictureSrc = result;
        });
      }

      await firebase.event
        .update<Event>({
          uids: [event.uid],
          value: eventData,
          authUser: authUser,
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    }

    // übersichtsfile anpassen
    await firebase.eventShort.updateFields({
      uids: [""], // wird in der Klasse bestimmt,
      values: {
        [eventData.uid]: EventShort.createShortEventFromEvent(eventData),
      },
      authUser: authUser,
    });

    if (newEvent) {
      // Event auslösen
      firebase.analytics.logEvent(FirebaseAnalyticEvent.eventCreated);
      // Statistik
      Stats.incrementStat({
        firebase: firebase,
        field: StatsField.noEvents,
        value: 1,
      });

      // Allen Teammitgliedern Credits geben
      event.cooks.forEach((cook) =>
        UserPublicProfile.incrementField({
          firebase: firebase,
          uid: cook.uid,
          field: UserPublicProfileStatsFields.noEvents,
          step: 1,
        })
      );
      // Feed Eintrag
      Feed.createFeedEntry({
        firebase: firebase,
        authUser: authUser,
        feedType: FeedType.eventCreated,
        feedVisibility: Role.basic,
        textElements: [eventData.name],
        objectUid: eventData.uid,
        objectName: eventData.name,
        objectPictureSrc: eventData.pictureSrc,
      });
    }

    // sicherstellen, dass Daten mindestens einen Eintrag haben
    if (eventData.dates.length === 0) {
      event.dates.push(Event.createDateEntry());
    }
    return eventData;
  }
  /* =====================================================================
  // Speichern vorbereiten
  // ===================================================================== */
  static prepareSave(event: Event) {
    // Max-Datum bestimmen
    event.maxDate = event.dates.reduce((max, date) => {
      return date.to > max ? date.to : max;
    }, new Date());

    event.maxDate = new Date(event.maxDate.setHours(0, 0, 0, 0));

    // Anzahl Tage Total berechnen
    event.numberOfDays = Event.defineEventDuration(event.dates);

    // Dates sortieren
    event.dates = Utils.sortArray({
      array: event.dates,
      attributeName: "from",
    });
    event.dates = Utils.renumberArray({
      array: event.dates,
      field: "pos",
    });

    // Bild URL kopieren falls nicht auf eigenem Server
    // if (
    //   (!event.pictureSrc.includes("firebasestorage.googleapis") &&
    //     !event.pictureSrc.includes("chuchipirat") &&
    //     !event.pictureSrc) ||
    //   !event.pictureSrcFullSize
    // ) {
    //   event.pictureSrcFullSize = event.pictureSrc;
    // }

    event.authUsers = this.getAuthUsersFromCooks(event.cooks);

    return event;
  }
  // ===================================================================== */
  /**
   * Anlass löschen
   * @param Object - Objekt mit Event, Firebase, Authuser
   */
  static delete = async ({event, firebase, authUser}: Delete) => {
    if (!event.cooks.find((cook) => cook.uid == authUser.uid)) {
      return;
    }

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 1);
    })
      .then(async () => {
        // Zuerst alle angehörigen Dokumente löschen
        if (event.refDocuments?.includes(EventRefDocuments.recipeVariants)) {
          await Recipe.deleteAllVariants({
            eventUid: event.uid,
            firebase: firebase,
            authUser: authUser,
          });
        }
      })
      .then(async () => {
        if (event.refDocuments?.includes(EventRefDocuments.usedRecipes)) {
          await UsedRecipes.delete({
            eventUid: event.uid,
            firebase: firebase,
          }).catch((error) => {
            console.error(error);
            throw error;
          });
        }
      })
      .then(async () => {
        if (event.refDocuments?.includes(EventRefDocuments.shoppingList)) {
          await ShoppingListCollection.delete({
            eventUid: event.uid,
            firebase: firebase,
          }).catch((error) => {
            console.error(error);
            throw error;
          });
        }
      })
      .then(async () => {
        if (event.refDocuments?.includes(EventRefDocuments.materialList)) {
          await MaterialList.delete({
            eventUid: event.uid,
            firebase: firebase,
          }).catch((error) => {
            console.error(error);
            throw error;
          });
        }
      })
      .then(async () => {
        await EventGroupConfiguration.delete({
          eventUid: event.uid,
          firebase: firebase,
        }).catch((error) => {
          console.error(error);
          throw error;
        });
      })
      .then(async () => {
        await Menuplan.delete({eventUid: event.uid, firebase: firebase}).catch(
          (error) => {
            console.error(error);
            throw error;
          }
        );
      })
      .then(async () => {
        // Feld aus übersicht löschen
        await EventShort.delete({event: event, firebase: firebase}).catch(
          (error) => {
            console.error(error);
            throw error;
          }
        );
      })
      .then(async () => {
        // Statistik anpassen
        Stats.incrementStat({
          firebase: firebase,
          field: StatsField.noEvents,
          value: -1,
        });
      })
      .then(async () => {
        // Credits den Köchen wieder enthnehmen
        event.cooks.forEach((cook) =>
          UserPublicProfile.incrementField({
            firebase: firebase,
            field: UserPublicProfileStatsFields.noEvents,
            uid: cook.uid,
            step: -1,
          })
        );
      })
      .then(async () => {
        if (event.pictureSrc) {
          Event.deletePicture({
            firebase: firebase,
            event: event,
            authUser: authUser,
            updateEventDocument: false,
          });
        }
      })
      .then(async () => {
        await firebase.event.delete({uids: [event.uid]}).catch((error) => {
          console.error(error);
          throw error;
        });
      });

    firebase.analytics.logEvent(FirebaseAnalyticEvent.eventDeleted);
  };
  /* =====================================================================
  // Dauer des Event bestimmen
  // ===================================================================== */
  static defineEventDuration(dates: Event["dates"]) {
    return dates.reduce((result, dateSlice) => {
      let difference = Utils.differenceBetweenTwoDates({
        dateFrom: dateSlice.from,
        dateTo: dateSlice.to,
      });

      if (difference) {
        result += difference;
      }

      return result;
    }, 0);
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
  /* =====================================================================
  // Leere Daten löschen
  // ===================================================================== */
  static deleteEmptyDates(dates: EventDate[]) {
    return dates.filter((date, counter) => {
      if (
        date.from.getFullYear() == 1970 &&
        date.to.getFullYear() == 1970 &&
        counter != 0
      ) {
        return false;
      } else {
        return true;
      }
    });
  }
  // /* =====================================================================
  // // Bild in Firebase Storage hochladen
  // // ===================================================================== */
  // HACK: Wegen Fehler im Firebase Interface kann hier nicht auf das Klassen-
  // HACK: konstukt firebase.storage.class gewechselt werden. nach dem Upgrade
  // HACK: wieder prüfen.
  static async uploadPicture({firebase, file, event, authUser}: UploadPicture) {
    let pictureSrc = "";
    // const eventDoc = firebase.eventDoc(event.uid);

    await firebase.fileStore.events
      .uploadFile({file: file, filename: event.uid})
      .then(async (result) => {
        // Redimensionierte Varianten holen
        await firebase.fileStore.events
          .getPictureVariants({
            uid: event.uid,
            sizes: [ImageSize.size_500],
            oldDownloadUrl: result,
          })
          .then((result) => {
            // Wir wollen nur eine Grösse
            pictureSrc = result[0].downloadURL;
          });
      })
      .then(() => {
        // Den Wert updaten
        firebase.event.updateFields({
          uids: [event.uid],
          authUser: authUser,
          values: {pictureSrc: pictureSrc, lastChange: {}},
          updateChangeFields: true,
        });
      })
      .then(() => {
        // Analytik
        firebase.analytics.logEvent(FirebaseAnalyticEvent.uploadPicture, {
          folder: "events",
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return pictureSrc;
  }
  /* =====================================================================
  // Bild löschen
  // ===================================================================== */
  static deletePicture = async ({
    firebase,
    event,
    authUser,
    updateEventDocument = true,
  }: DeletePicture) => {
    await firebase.fileStore.events
      .deleteFile(`${event.uid}${IMAGES_SUFFIX.size500.suffix}`)
      .then(() => {
        // Event-Doc updaten
        if (updateEventDocument) {
          firebase.event.updateFields({
            uids: [event.uid],
            authUser: authUser,
            values: {pictureSrc: "", lastChange: {}},
            updateChangeFields: true,
          });
        }
        firebase.analytics.logEvent(FirebaseAnalyticEvent.deletePicture, {
          folder: "events",
        });
      })
      .catch((error) => {
        throw error;
      });
  };
  /* =====================================================================
  // Event lesen
  // ===================================================================== */
  static getEvent = async ({firebase, uid}: GetEvent) => {
    let event = <Event>{};

    await firebase.event
      .read<Event>({uids: [uid]})
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
   * Listener holen
   * @param object - Objekt mit Firebase, UID, und Callback-Funktion
   * @returns listener
   */
  static getEventListener = async ({
    firebase,
    uid,
    callback,
  }: GetEventListener) => {
    let eventListener = () => {};

    const eventCallback = (event: Event) => {
      // Menüplan mit UID anreichern
      event.uid = uid;
      callback(event);
    };

    const errorCallback = (error: any) => {
      console.error(error);
      throw error;
    };

    await firebase.event
      .listen<Event>({
        uids: [uid],
        callback: eventCallback,
        errorCallback: errorCallback,
      })
      .then((result) => {
        eventListener = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return eventListener;
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
        orderBy: {field: "maxDate", sortOrder: SortOrder.asc},
        where: [
          {
            field: "authUsers",
            operator: Operator.ArrayContains,
            value: userUid,
          },
          {
            field: "maxDate",
            operator: whereOperator,
            value: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        ],
      })
      .then((result) => {
        events = result as Event[];
      });

    return events;
  }
  // ===================================================================== */
  /**
   * Neuer Dokumententyp hinzufügen
   * @param object - Objekt mit RefDocumentes und neuer Typ zum hinzufügen
   * @returns angepasstes Array mit RefDocuments
   */
  static addRefDocument = ({refDocuments, newDocumentType}: AddRefDocument) => {
    let updatedDocuments: Event["refDocuments"] = [];
    if (refDocuments) {
      updatedDocuments = [...refDocuments];
    }
    updatedDocuments.push(newDocumentType);
    return updatedDocuments;
  };
  // ===================================================================== */
  /**
   * Prüfung ob die angepassten Tage (allenfalls gelöscht) - bereits geplante
   * Tage sind
   * Anhand der Zeitscheiben, ein Array mit allen Daten erstellen
   * @param Object - Objekt mit Angepasstem Event und Menüplan
   * @returns boolean - Hat die Anpassung zur Folge, dass geplante Tage
   *                    gelöscht werden.
   */
  static checkIfDeletedDayArePlanned = ({
    event,
    menuplan,
  }: CheckIfDeletedDayArePlanned) => {
    let newDayList = Menuplan._getEventDateList({event: event}).map((date) =>
      Utils.dateAsString(date)
    );
    let menuplanDates = menuplan.dates.map((date) => Utils.dateAsString(date));

    let missingDates = menuplanDates.filter(
      (date) => !newDayList.includes(date)
    );

    let affectedMeals = Object.values(menuplan.meals).filter((meal) =>
      missingDates.includes(meal.date)
    );
    let affectedMenues: Menue["uid"][] = affectedMeals.reduce<Menue["uid"][]>(
      (accumulator, meal) => accumulator.concat(meal.menuOrder),
      []
    );

    let planedObjects = affectedMenues.reduce<number>(
      (accumulator, mealUid) => {
        return (
          accumulator +
          menuplan.menues[mealUid].mealRecipeOrder.length +
          menuplan.menues[mealUid].productOrder.length +
          menuplan.menues[mealUid].materialOrder.length
        );
      },
      0
    );
    return Boolean(planedObjects !== 0);
  };
}
