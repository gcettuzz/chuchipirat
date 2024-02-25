import React from "react";
import qs from "qs";

import VerifyEmail from "./verifyEmail";
import RecoverEmail from "./recoverEmail";
import ChangePassword from "../PasswordChange/passwordChange";
import AlertMessage from "../Shared/AlertMessage";

import * as TEXT from "../../constants/text";

import {RouteComponentProps} from "react-router";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const AUTH_SERVICE_HANDLER_MODE = {
  VERIFY_EMAIL: "verifyEmail",
  RESET_PASSWORD: "resetPassword",
  RECOVER_EMAIL: "recoverEmail",
};
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const AuthServiceHandlerPage: React.FC<RouteComponentProps> = (props) => {
  // Anhand des Actions-Mode entscheiden welche Seite angezeigt wird.
  let mode = "";
  let queryString = "";
  let oobCode = "";

  // Die URL enthält den Actioncode, --> Mode entscheidet welche Aktion
  // nötig ist.
  if (props.location.search && (!mode || !oobCode)) {
    queryString = props.location.search;
    if (queryString.charAt(0) === "?") {
      queryString = queryString.slice(1, -1);
    }
    mode = qs.parse(queryString).mode;
    oobCode = qs.parse(queryString).oobCode;
  }
  return (
    <React.Fragment>
      {mode === AUTH_SERVICE_HANDLER_MODE.VERIFY_EMAIL && (
        <VerifyEmail {...props} />
      )}
      {mode === AUTH_SERVICE_HANDLER_MODE.RESET_PASSWORD && (
        <ChangePassword oobCode={oobCode} />
      )}
      {mode === AUTH_SERVICE_HANDLER_MODE.RECOVER_EMAIL && (
        <RecoverEmail oobCode={oobCode} />
      )}
      {!mode && <AlertMessage body={TEXT.AUTH_SERVICE_HANLDER_NO_MODE} />}
    </React.Fragment>
  );
};

export default AuthServiceHandlerPage;
