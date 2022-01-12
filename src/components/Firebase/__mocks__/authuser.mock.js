"use strict";
exports.__esModule = true;
var role_1 = require("../../../constants/role");
exports.authUser = {
    uid: "RvLIR9NDGOWPwos8PrSZVgfIZvj9",
    email: "test@chuchipirat.ch",
    emailVerified: true,
    providerData: [],
    firstName: "Test",
    lastName: "Jest",
    roles: [role_1["default"].basic],
    publicProfile: {
        displayName: "Test User",
        motto: "🤪 ich teste mich dumm und dämlich...",
        pictureSrc: "https://jestjs.io/img/opengraph.png"
    }
};
exports["default"] = exports.authUser;
