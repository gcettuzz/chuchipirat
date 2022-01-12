import Firebase from "../firebase.class";
import FirebaseCloudFunctionUserMotto from "./firebase.db.cloudfunction.userMotto.class";
import FirebaseCloudFunctionUserDisplayName from "./firebase.db.cloudfunction.userDisplayName.class";
import FirebaseCloudFunctionUserPictureSrc from "./firebase.db.cloudfunction.userPictureSrc.class";
import FirebaseDbCloudFunctionRecipeUpdate from "./firebase.db.cloudfunction.recipeUpdate";
import FirebaseDbCloudFunctionRecipeTrace from "./firebase.db.cloudfunction.recipeTrace";

export class FirebaseDbCloudFunction {
  recipeUpdate: FirebaseDbCloudFunctionRecipeUpdate;
  recipeTrace: FirebaseDbCloudFunctionRecipeTrace;
  userMotto: FirebaseCloudFunctionUserMotto;
  userDisplayName: FirebaseCloudFunctionUserDisplayName;
  userPictureSrc: FirebaseCloudFunctionUserPictureSrc;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    this.recipeUpdate = new FirebaseDbCloudFunctionRecipeUpdate(firebase);
    this.recipeTrace = new FirebaseDbCloudFunctionRecipeTrace(firebase);
    this.userMotto = new FirebaseCloudFunctionUserMotto(firebase);
    this.userDisplayName = new FirebaseCloudFunctionUserDisplayName(firebase);
    this.userPictureSrc = new FirebaseCloudFunctionUserPictureSrc(firebase);
  }
}
export default FirebaseDbCloudFunction;
