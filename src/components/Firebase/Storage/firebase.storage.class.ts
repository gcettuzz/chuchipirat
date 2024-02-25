import Firebase from "../firebase.class";
import FirebaseStorageEvents, {
  FirebaseStorageUsers,
} from "./firebase.storage.users.class";

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
