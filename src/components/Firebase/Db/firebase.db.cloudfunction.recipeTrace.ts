import Firebase from "../firebase.class";
import FirebaseDbCloudFunctionSuper, {
  TriggerCloudFunction,
  CloudFunctionType,
} from "./firebase.db.cloudfunction.super.class";

export class FirebaseDbCloudFunctionRecipeTrace extends FirebaseDbCloudFunctionSuper {
  firebase: Firebase;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
  }
  /* =====================================================================
  // Trigger für CloudFunction
  // ===================================================================== */
  getCollection() {
    return this.firebase.db.collection(
      "_cloudFunctions/waitingArea/recipeTrace"
    );
  }
}
export default FirebaseDbCloudFunctionRecipeTrace;
