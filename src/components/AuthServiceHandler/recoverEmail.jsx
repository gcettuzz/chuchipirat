import React from "react";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import { useHistory } from "react-router";

import { Link } from "react-router-dom";

import Container from "@material-ui/core/Container";
import { Alert, AlertTitle } from "@material-ui/lab";

import PageTitle from "../Shared/pageTitle";

import useStyles from "../../constants/styles";
import { AuthUserContext } from "../Session/index";
import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";
import { withFirebase } from "../Firebase/index.js";
import User from "../User/user.class";

import * as ROUTES from "../../constants/routes";
import * as TEXT from "../../constants/text";
import * as LOCAL_STORAGE from "../../constants/localStorage";

// ===================================================================
// =============================== Page ==============================
// ===================================================================
const RecoverEmailPage = (props) => {
  const classes = useStyles();

  return (
    <AuthUserContext.Consumer>
      {(authUser) => <RecoverEmailBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// ============================== Formular ===========================
// =================================================================== */
const RecoverEmailBase = ({ props, authUser }) => {
  const classes = useStyles();

  const firebase = props.firebase;
  const actionCode = props.oobCode;
  const [error, setError] = React.useState(null);
  const [isRecovered, setIsRecovered] = React.useState(false);
  const { push } = useHistory();

  /* ------------------------------------------
  // E-Mail-Wechsel zurückbuchstabieren
  // ------------------------------------------ */
  React.useEffect(() => {
    if (!authUser) {
      authUser = JSON.parse(sessionStorage.getItem(LOCAL_STORAGE.AUTH_USER));
    }

    firebase.auth.checkActionCode(actionCode).then((actionCodeInfo) => {
      // Update muss vorher passieren. Nach Eingabe des Action-Code geschieht
      // automatisch der Log-Off. Somit kann die DB nicht mehr geändert werden
      User.updateEmail({
        firebase: firebase,
        uid: authUser.uid,
        newEmail: actionCodeInfo.data.email,
      });
      updateSessionStorage(actionCodeInfo.data.email);

      firebase
        .applyActionCode(actionCode)
        .then(() => {
          firebase.signOut();
          setIsRecovered(true);
        })
        .catch((error) => {
          console.error(error);
          setError(error);
        });
    });
  }, [firebase, actionCode]);

  /* ------------------------------------------
  // Session-Storage auf Änderungen umbiegen
  // ------------------------------------------ */
  const updateSessionStorage = (oldEmail) => {
    // alles löschen damit die alten Werte neu gelesen werden
    let user = JSON.parse(sessionStorage.getItem(LOCAL_STORAGE.AUTH_USER));
    user.email = oldEmail;
    user.emailVerified = true;
    sessionStorage.setItem(LOCAL_STORAGE.AUTH_USER, JSON.stringify(user));
  };

  return (
    <React.Fragment>
      <PageTitle
        title={TEXT.ALERT_TITLE_BACKSPELLED}
        // subTitle={TEXT.ALERT_TITLE_EMAIL_RECOVERED}
      />
      <Container className={classes.container} component="main" maxWidth="xs">
        {error && (
          <Alert severity="error">
            <AlertTitle>{TEXT.ALERT_TITLE_UUPS}</AlertTitle>
            {FirebaseMessageHandler.translateMessage(error)}
          </Alert>
        )}
        {isRecovered && (
          <Alert severity="info">
            <AlertTitle>{TEXT.ALERT_TITLE_EMAIL_RECOVERED}</AlertTitle>
            {TEXT.ALERT_TEXT_EMAIL_RECOVERED}
            <Link onClick={() => push({ pathname: ROUTES.SIGN_IN })}>
              {TEXT.NAVIGATION_SIGN_IN}
            </Link>
          </Alert>
        )}
      </Container>
    </React.Fragment>
  );
};

export default compose(withRouter, withFirebase)(RecoverEmailPage);
