import Firebase from "../firebase.class";
import FirebaseCloudFunctionUserMotto from "./firebase.db.cloudfunction.userMotto.class";
import FirebaseCloudFunctionUserDisplayName from "./firebase.db.cloudfunction.userDisplayName.class";
import FirebaseCloudFunctionUserPictureSrc from "./firebase.db.cloudfunction.userPictureSrc.class";
import FirebaseDbCloudFunctionRecipeUpdate from "./firebase.db.cloudfunction.recipeUpdate";
import FirebaseDbCloudFunctionRecipeTrace from "./firebase.db.cloudfunction.recipeTrace";
import FirebaseDbCloudFunctionRecipeDelete from "./firebase.db.cloudfunction.recipeDelete";
import FirebaseDbCloudFunctionMailcommunityLeaders from "./firebase.db.cloudfunction.mailCommunityLeaders";
import FirebaseDbCloudFunctionRequestPublishRecipe from "./firebase.db.cloudfunction.requestPublishRecipe";
import FirebaseDbCloudFunctionMailUser from "./firebase.db.cloudfunction.mailUser";
export class FirebaseDbCloudFunction {
  recipeUpdate: FirebaseDbCloudFunctionRecipeUpdate;
  recipeTrace: FirebaseDbCloudFunctionRecipeTrace;
  recipeDelete: FirebaseDbCloudFunctionRecipeDelete;
  userMotto: FirebaseCloudFunctionUserMotto;
  userDisplayName: FirebaseCloudFunctionUserDisplayName;
  userPictureSrc: FirebaseCloudFunctionUserPictureSrc;
  mailCommunityLeaders: FirebaseDbCloudFunctionMailcommunityLeaders;
  requestRecipePublish: FirebaseDbCloudFunctionRequestPublishRecipe;
  mailUser: FirebaseDbCloudFunctionMailUser;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    this.recipeUpdate = new FirebaseDbCloudFunctionRecipeUpdate(firebase);
    this.recipeTrace = new FirebaseDbCloudFunctionRecipeTrace(firebase);
    this.recipeDelete = new FirebaseDbCloudFunctionRecipeDelete(firebase);

    this.mailCommunityLeaders = new FirebaseDbCloudFunctionMailcommunityLeaders(
      firebase
    );
    this.userMotto = new FirebaseCloudFunctionUserMotto(firebase);
    this.userDisplayName = new FirebaseCloudFunctionUserDisplayName(firebase);
    this.userPictureSrc = new FirebaseCloudFunctionUserPictureSrc(firebase);
    this.requestRecipePublish = new FirebaseDbCloudFunctionRequestPublishRecipe(
      firebase
    );
    this.mailUser = new FirebaseDbCloudFunctionMailUser(firebase);
  }
}
export default FirebaseDbCloudFunction;
