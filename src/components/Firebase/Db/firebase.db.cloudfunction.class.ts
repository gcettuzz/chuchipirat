import Firebase from "../firebase.class";
import FirebaseDbCloudFunctionUserPictureSrcUpdate from "./firebase.db.cloudfunction.userPictureSrcUpdate.class";
import FirebaseDbCloudFunctionUserMottoUpdate from "./firebase.db.cloudfunction.userMottoUpdate.class";
import FirebaseDbCloudFunctionRecipeUpdate from "./firebase.db.cloudfunction.recipeUpdate.class";
import FirebaseDbCloudFunctionRecipeTrace from "./firebase.db.cloudfunction.recipeTrace.class";
import FirebaseDbCloudFunctionRecipeDelete from "./firebase.db.cloudfunction.recipeDelete.class";
import FirebaseDbCloudFunctionMailcommunityLeaders from "./firebase.db.cloudfunction.mailCommunityLeaders.class";
import FirebaseDbCloudFunctionRequestPublishRecipe from "./firebase.db.cloudfunction.requestPublishRecipe.class";
import FirebaseDbCloudFunctionMailUser from "./firebase.db.cloudfunction.mailUser.class";
import FirebaseDbCloudFunctionFeedsDelete from "./firebase.db.cloudfunction.feedsDelete.class";
import FirebaseDbCloudFunctionMergeProducts from "./firebase.db.cloudfunction.mergeProducts.class";
import FirebaseDbCloudFunctionUserDisplayNameUpdate from "./firebase.db.cloudfunction.userDisplayNameUpdate.class";
import FirebaseDbCloudFunctionProductUpdate from "./firebase.db.cloudfunction.productUpdate";
import FirebaseDbCloudFunctionConvertProductToMaterial from "./firebase.db.cloudfunction.convertProductToMaterial.class";
export class FirebaseDbCloudFunction {
  recipeUpdate: FirebaseDbCloudFunctionRecipeUpdate;
  recipeTrace: FirebaseDbCloudFunctionRecipeTrace;
  recipeDelete: FirebaseDbCloudFunctionRecipeDelete;
  userMotto: FirebaseDbCloudFunctionUserMottoUpdate;
  updateUserDisplayName: FirebaseDbCloudFunctionUserDisplayNameUpdate;
  userPictureSrc: FirebaseDbCloudFunctionUserPictureSrcUpdate;
  mailCommunityLeaders: FirebaseDbCloudFunctionMailcommunityLeaders;
  requestRecipePublish: FirebaseDbCloudFunctionRequestPublishRecipe;
  mailUser: FirebaseDbCloudFunctionMailUser;
  feedsDelete: FirebaseDbCloudFunctionFeedsDelete;
  mergeProducts: FirebaseDbCloudFunctionMergeProducts;
  convertProductToMaterial: FirebaseDbCloudFunctionConvertProductToMaterial;
  productUpdate: FirebaseDbCloudFunctionProductUpdate;
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
    this.userMotto = new FirebaseDbCloudFunctionUserMottoUpdate(firebase);
    this.updateUserDisplayName =
      new FirebaseDbCloudFunctionUserDisplayNameUpdate(firebase);
    this.userPictureSrc = new FirebaseDbCloudFunctionUserPictureSrcUpdate(
      firebase
    );
    this.requestRecipePublish = new FirebaseDbCloudFunctionRequestPublishRecipe(
      firebase
    );
    this.mailUser = new FirebaseDbCloudFunctionMailUser(firebase);
    this.feedsDelete = new FirebaseDbCloudFunctionFeedsDelete(firebase);
    this.mergeProducts = new FirebaseDbCloudFunctionMergeProducts(firebase);
    this.convertProductToMaterial =
      new FirebaseDbCloudFunctionConvertProductToMaterial(firebase);
    this.productUpdate = new FirebaseDbCloudFunctionProductUpdate(firebase);
  }
}
export default FirebaseDbCloudFunction;
