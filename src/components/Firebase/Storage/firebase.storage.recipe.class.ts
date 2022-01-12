import { Reference } from "@firebase/storage-types";
import Firebase from "../firebase.class";
import FirebaseStorageSuper from "./firebase.storage.super.class";

export class FirebaseStorageRecipe extends FirebaseStorageSuper {
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
    return "recipes/";
  }
  /* =====================================================================
  // Datei
  // ===================================================================== */
  // getFile(filename:string):Reference  {
  //   // return this.firebase.storage.ref(`${this.getFolder()}${filename}`);
  //   //  return this.firebase.storage.ref("a");
  // }
}
export default FirebaseStorageRecipe;
