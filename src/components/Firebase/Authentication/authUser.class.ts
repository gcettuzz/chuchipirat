import Role from "../../../constants/roles";
import {Picture} from "../../Shared/global.interface";
export interface AuthUserPublicProfile {
  displayName: string;
  motto: string;
  pictureSrc: Picture;
}

export class AuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  roles: Role[];
  publicProfile: AuthUserPublicProfile;
  constructor() {
    this.uid = "";
    this.email = "";
    this.emailVerified = false;
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
