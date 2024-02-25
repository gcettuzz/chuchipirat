import Role from "../../../constants/roles";
import {Picture} from "../../Shared/global.interface";
import app from "firebase/app";

// import Firebase from "./firebase.class";
// import {
//   DocumentReference,
//   DocumentData,
//   CollectionReference,
// } from "@firebase/firestore-types";

// export interface FirebaseCrud {
//   /**
//    * neues Dokument anlegen
//    * @param value: Wert für neues Dokument (als Objekt)
//    * @returns Soeben gespeicherte Werte.
//    */
//   create(value: Create): Object;
//   read(uid?: string): DocumentData;
//   update({ uid, value }: Update): void;
//   delete({}: Delete): void;
// }
// export interface FirebaseReference {
//   getDocument(uid?: string): DocumentReference;
//   getDocuments({}: GetDocuments): void;
//   getCollection(): CollectionReference;
// }
// //  export interface Create {[key:string]:any}
// // export interface Read {
// //   uid?: string;
// // }
// export interface Update {
//   uid?: string;
//   value: object;
// }
// export interface Delete {}

// // export interface GetDocument {
// //   uid?: string;
// // }
// export interface GetDocuments {}
export interface AuthUserPublicProfile {
  displayName: string;
  motto: string;
  pictureSrc: Picture;
}

export class AuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  providerData: (app.UserInfo | null)[];
  firstName: string;
  lastName: string;
  roles: Role[];
  publicProfile: AuthUserPublicProfile;
  constructor() {
    this.uid = "";
    this.email = "";
    this.emailVerified = false;
    this.providerData = [null];
    this.firstName = "";
    this.lastName = "";
    this.roles = [];
    this.publicProfile = {
      displayName: "",
      motto: "",
      pictureSrc: {smallSize: "", normalSize: "", fullSize: ""},
    };
  }
}

export default AuthUser;
