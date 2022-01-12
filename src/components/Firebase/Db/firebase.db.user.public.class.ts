import Firebase from "../firebase.class";
import FirebaseDbUserPublicProfile from "./firebase.db.user.public.profile.class";
import FirebaseUserPublicSearchFields from "./firebase.db.user.public.searchFields.class";

export class FirebaseDbUserPublic {
  profile: FirebaseDbUserPublicProfile;
  searchFields: FirebaseUserPublicSearchFields;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    this.profile = new FirebaseDbUserPublicProfile(firebase);
    this.searchFields = new FirebaseUserPublicSearchFields(firebase);
  }
}
export default FirebaseDbUserPublic;
