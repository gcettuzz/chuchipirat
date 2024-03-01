import Firebase from "../firebase.class";
import FirebaseStorageSuper from "./firebase.storage.super.class";

export class FirebaseStorageEvents extends FirebaseStorageSuper {
  firebase: Firebase;

  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
  }
  /* =====================================================================
  // Verzeichnis
  // ===================================================================== */
  getFolder() {
    return "events/";
  }
}
export default FirebaseStorageEvents;
