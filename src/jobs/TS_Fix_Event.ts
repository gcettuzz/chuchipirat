import Firebase from "../components/Firebase";

interface FixEventDocuments {
  firebase: Firebase;
  eventUid: string;
  event: object;
  menuplan: object;
}
// Anhand des JSON das Document wiederherstellen
export async function fixEventDocuments({
  firebase,
  eventUid,
  event,
  menuplan,
}: FixEventDocuments) {
  if (event) {
    // let event = JSON.parse(eventJSON);
    // Event zurückspeichern
    let eventDocumentReference = firebase.db.doc(`events/${eventUid}`);
    console.log(event);
    await eventDocumentReference.set(
      firebase.event.convertDateValuesToTimestamp(event)
    );
  }

  if (menuplan) {
    // let menuplan = JSON.parse(menuplanJSON);
    // Menüplan migrieren
    let menuplanDocument = firebase.db.doc(`events/${eventUid}/docs/menuplan`);
    console.log(menuplan);
    await menuplanDocument.set(
      firebase.event.menuplan.convertDateValuesToTimestamp(menuplan)
    );
  }
}
