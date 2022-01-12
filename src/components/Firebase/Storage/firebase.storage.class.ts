import Firebase from "../firebase.class";
import FirebaseStorageRecipe from "./firebase.storage.recipe.class";
// import FirebaseCloudFunctionUserMotto from "./firebase.cloudfunction.userMotto.class";
// import FirebaseCloudFunctionUserDisplayName from "./firebase.cloudfunction.userDisplayName.class";
// import FirebaseCloudFunctionUserPictureSrc from "./firebase.cloudfunction.userPictureSrc.class";

export class FirebaseStorage {
  recipe: FirebaseStorageRecipe;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    this.recipe = new FirebaseStorageRecipe(firebase);
  }
}
export default FirebaseStorage;
