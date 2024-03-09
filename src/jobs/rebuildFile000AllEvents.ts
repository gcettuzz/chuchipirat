import AuthUser from "../components/Firebase/Authentication/authUser.class";
import {ValueObject} from "../components/Firebase/Db/firebase.db.super.class";
import Firebase from "../components/Firebase/firebase.class";
import Event from "../components/Event/Event/event.class";
import EventShort from "../components/Event/Event/eventShort.class";

export async function rebuildFile000AllEvents(firebase: Firebase) {
  const allEvents: ValueObject = {};
  let counter = 0;

  const events = await Event.getAllEvents({firebase: firebase});

  events.forEach((event) => {
    counter++;
    if (event.uid) {
      allEvents[event.uid] = EventShort.createShortEventFromEvent(event);
    }
  });
  console.log(allEvents, counter);
  firebase.eventShort
    .set({
      uids: [],
      value: allEvents,
      authUser: {} as AuthUser,
    })
    .catch((error) => console.error(error));

  return counter;
}
