import Firebase from "../Firebase/firebase.class";

import {ERROR_PARAMETER_NOT_PASSED} from "../../constants/text";
import AuthUser from "../Firebase/Authentication/authUser.class";

interface Trace {
  firebase: Firebase;
  uid: string;
  objectType: TraceObject;
  authUser: AuthUser;
  callback: (documentList: {document: string; name: string}[]) => void;
}

export enum TraceObject {
  none,
  recipe,
  product,
  material,
}

export class WhereUsed {
  // ===================================================================== */
  /**
   * Trace auf Objekt ausführen
   * @param param0
   * @returns
   */
  static trace = async ({
    uid,
    objectType,
    callback: callbackSuper,
    firebase,
    authUser,
  }: Trace) => {
    if (!firebase || !uid || !callbackSuper) {
      throw new Error(ERROR_PARAMETER_NOT_PASSED);
    }
    let unsubscribe: () => void;
    let documentId = "";

    firebase.cloudFunction.objectTrace
      .triggerCloudFunction({
        values: {
          uid: uid,
          objectType: objectType,
        },
        authUser: authUser,
      })
      .then((result) => {
        documentId = result;
      })
      .then(() => {
        // Melden wenn fertig
        const callbackCaller = (data) => {
          if (data?.done) {
            callbackSuper(data.documentList);
            unsubscribe();
          }
        };

        firebase.cloudFunction.objectTrace
          .listen({
            uids: [documentId],
            callback: callbackCaller,
          })
          .then((result) => {
            unsubscribe = result;
          });
      })
      .catch((error) => {
        throw error;
      });
  };
}

export default WhereUsed;
