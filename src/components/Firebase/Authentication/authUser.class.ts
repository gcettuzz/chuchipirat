import Role from "../../../constants/roles";
import {Picture} from "../../Shared/global.interface";
import app from "firebase/app";
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
