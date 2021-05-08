import React from "react";
import { compose } from "recompose";
import qs from "qs";

import useStyles from "../../constants/styles";

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
    <AuthUserContext.Consumer>
      {(authUser) => (
        <AuthServiceHandlerBase props={props} authUser={authUser} />
      )}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const AuthServiceHandlerBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  //TODO: Anhand des Actions-Mode entscheiden welche Seite angezeigt wird.
  // let oobCode;
  // // Die URL enthält einen ObjektCode. Mit diesem kann die Adresse
  // // verifziert werden....
  // props.location.search && (oobCode = qs.parse(props.location.search).oobCode);

  // Die URL enthält einen ObjektCode. Mit diesem kann die Adresse
  // verifziert werden....

  //FIXME: die beiden Seiten in dieses Verzeichnis verschieben.

  return (
    <React.Fragment>
      {/* {mode === AUTH_SERVICE_HANDLER_MODE.VERIFY_EMAIL && (<VerifyEmail />)} */}
      {/* oder Push mit Props? */}
    </React.Fragment>
  );
};

export default compose(
  withEmailVerification,
  // withAuthorization(condition),
  withFirebase
)(AuthServiceHandlerPage);
