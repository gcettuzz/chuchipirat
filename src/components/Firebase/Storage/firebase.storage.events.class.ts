import { Reference } from "@firebase/storage-types";
import Firebase from "../firebase.class";
import FirebaseStorageSuper from "./firebase.storage.super.class";
// import FirebaseCloudFunctionUserMotto from "./firebase.cloudfunction.userMotto.class";
// import FirebaseCloudFunctionUserDisplayName from "./firebase.cloudfunction.userDisplayName.class";
// import FirebaseCloudFunctionUserPictureSrc from "./firebase.cloudfunction.userPictureSrc.class";

export class FirebaseStorageEvents extends FirebaseStorageSuper {
  firebase: Firebase;

  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
  }
  /* =====================================================================
  // Verzeichnis
  // ===================================================================== */
  getFolder() {
    return "events/";
  }
  /* =====================================================================
  // Datei
  // ===================================================================== */
  // getFile(filename:string):Reference  {
  //   // return this.firebase.storage.ref(`${this.getFolder()}${filename}`);
  //   //  return this.firebase.storage.ref("a");
  // }
}
export default FirebaseStorageEvents;
