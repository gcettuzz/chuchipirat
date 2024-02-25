import Firebase from "../../Firebase/firebase.class";
import {ChangeRecord} from "../../Shared/global.interface";
import Event from "./event.class";

interface Delete {
  event: Event;
  firebase: Firebase;
}

export class EventShort {
  uid: string;
  name: string;
  motto: string;
  location: string;
  noOfCooks: number;
  numberOfDays: number;
  startDate: Date;
  created: ChangeRecord;

  // ===================================================================== */
  /**
   * Konstruktor der Klasse
   */
  constructor() {
    this.uid = "";
    this.name = "";
    this.motto = "";
    this.location = "";
    this.noOfCooks = 0;
    this.numberOfDays = 0;
    this.startDate = new Date(0);
    this.created = {date: new Date(0), fromUid: "", fromDisplayName: ""};
  }
  // ===================================================================== */
  /**
   * Kurz-Event aus Event erzeugen
   * @param event Objekt Event
   * @returns Kurz-Event
   */
  static createShortEventFromEvent(event: Event): EventShort {
    return {
      uid: event.uid,
      name: event.name,
      motto: event.motto,
      location: event.location,
      noOfCooks: event.authUsers.length,
      numberOfDays: Event.defineEventDuration(event.dates),
      startDate: event.dates[0].from,
      created: event.created,
    };
  }
  // ===================================================================== */
  /**
   * Eintrag löschen
   * Anhand der Zeitscheiben, ein Array mit allen Daten erstellen
   * @param Object - Objekt mit Angepasstem Event und Menüplan
   * @returns boolean - Hat die Anpassung zur Folge, dass geplante Tage
   *                    gelöscht werden.
   */
  static delete = async ({event, firebase}: Delete) => {
    firebase.eventShort
      .deleteField({fieldName: event.uid, uids: []})
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
}

export default EventShort;
