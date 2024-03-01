import Firebase from "../firebase.class";
import FirebaseStorageUsers from "./firebase.storage.users.class";
import FirebaseStorageEvents from "./firebase.storage.events.class";

export class FirebaseStorage {
  events: FirebaseStorageEvents;
  users: FirebaseStorageUsers;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    this.events = new FirebaseStorageEvents(firebase);
    this.users = new FirebaseStorageUsers(firebase);
  }
}
export default FirebaseStorage;
