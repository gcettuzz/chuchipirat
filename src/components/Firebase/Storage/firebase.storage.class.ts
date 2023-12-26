import Firebase from "../firebase.class";
import FirebaseStorageEvents from "./firebase.storage.events.class";
import FirebaseStorageRecipes from "./firebase.storage.recipes.class";
// import FirebaseCloudFunctionUserMotto from "./firebase.cloudfunction.userMotto.class";
// import FirebaseCloudFunctionUserDisplayName from "./firebase.cloudfunction.userDisplayName.class";
// import FirebaseCloudFunctionUserPictureSrc from "./firebase.cloudfunction.userPictureSrc.class";

export class FirebaseStorage {
  recipes: FirebaseStorageRecipes;
  events: FirebaseStorageEvents;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    this.recipes = new FirebaseStorageRecipes(firebase);
    this.events = new FirebaseStorageEvents(firebase);
  }
}
export default FirebaseStorage;
