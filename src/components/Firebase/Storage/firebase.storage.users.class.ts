import Firebase from "../firebase.class";
import FirebaseStorageSuper from "./firebase.storage.super.class";

export class FirebaseStorageUsers extends FirebaseStorageSuper {
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
    return "users/";
  }
}
export default FirebaseStorageUsers;
