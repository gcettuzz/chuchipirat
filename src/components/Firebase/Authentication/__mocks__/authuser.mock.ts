import Role from "../../../../constants/roles";
import {AuthUser} from "../authUser.class";

export const authUser: AuthUser = {
  uid: "RvLIR9NDGOWPwos8PrSZVgfIZvj9",
  email: "test@chuchipirat.ch",
  emailVerified: true,
  firstName: "Test",
  lastName: "Jest",
  roles: [Role.basic],
  publicProfile: {
    displayName: "Test User",
    motto: "🤪 ich teste mich dumm und dämlich...",
    pictureSrc: {
      smallSize: "https://jestjs.io/img/opengraph.png",
      normalSize: "https://jestjs.io/img/opengraph.png",
      fullSize: "https://jestjs.io/img/opengraph.png",
    },
  },
};

export default authUser;
