import React from "react";
import { compose } from "recompose";
import qs from "qs";

import useStyles from "../../constants/styles";

import VerifyEmail from "./verifyEmail";
import RecoverEmail from "./recoverEmail";
import ChangePassword from "../PasswordChange/passwordChange";
import AlertMessage from "../Shared/AlertMessage";

import * as TEXT from "../../constants/text";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";

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
const AuthServiceHandlerPage = (props) => {
  return (
    // <AuthUserContext.Consumer>
    //   {(authUser) => (
    <AuthServiceHandlerBase props={props} />
    //   )}
    // </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const AuthServiceHandlerBase = ({ props }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  //TODO: Anhand des Actions-Mode entscheiden welche Seite angezeigt wird.
  let mode;
  let queryString;
  let oobCode;

  // Die URL enthält den Actioncode, --> Mode entscheidet welche Aktion
  // nötig ist.
  if (props.location.search && (!mode || !oobCode)) {
    queryString = props.location.search;
    if (queryString.charAt(0) === "?") {
      queryString = queryString.slice(1, -1);
    }
    mode = qs.parse(queryString).mode;
    oobCode = qs.parse(queryString).oobCode;
  } else if (false) {
    //TODO: übergeben falls intern.. weiss noch nicht wo das passiert...
  }

  return (
    <React.Fragment>
      {mode === AUTH_SERVICE_HANDLER_MODE.VERIFY_EMAIL && (
        <VerifyEmail props={props} />
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

export default compose(
  //withEmailVerification,
  // withAuthorization(condition),
  withFirebase
)(AuthServiceHandlerPage);
