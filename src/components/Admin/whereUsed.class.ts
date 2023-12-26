import Firebase from "../Firebase/firebase.class";
import FirebaseAnalyticEvent from "../../constants/firebaseEvent";

import { ERROR_PARAMETER_NOT_PASSED } from "../../constants/text";
import { ValueObject } from "../Firebase/Db/firebase.db.super.class";
import AuthUser from "../Firebase/Authentication/authUser.class";

interface TraceRecipe {
  firebase: Firebase;
  uid: string;
  traceListener: any;
  authUser: AuthUser;
}

export class WhereUsed {
  // ===================================================================== */
  /**
   * Trace auf Rezept ausführen
   * @param param0
   * @returns
   */
  static traceRecipe = async ({
    uid,
    traceListener,
    firebase,
    authUser,
  }: TraceRecipe) => {
    let documentId: string;
    let documentData: ValueObject = {};
    if (!firebase || !uid) {
      throw new Error(ERROR_PARAMETER_NOT_PASSED);
    }
    // Cloudfunction ausführen
    documentId = firebase.cloudFunction.recipeTrace.triggerCloudFunction({
      values: { uid: uid },
      authUser: authUser,
    });

    firebase.analytics.logEvent(FirebaseAnalyticEvent.cloudFunctionExecuted);
    // //FIXME: sobald Struktur klar...
    //     // Listener
    //     firebase.cloudFunctionRecipeTrace
    //       .listen<ValueObject>({
    //         uids: [documentId],
    //       })
    //       .then((result) => {
    //         documentData = result.data;
    //         if (result.data?.done) {
    //           // Wenn das Feld DONE vorhanden ist, ist die Cloud-Function durch
    //           result.unsubscribe();
    //         }
    //       });

    //     return documentData;
  };
}

export default WhereUsed;
