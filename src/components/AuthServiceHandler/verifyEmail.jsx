import React from "react";
import { useHistory } from "react-router";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";

import { Alert, AlertTitle } from "@material-ui/lab";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import { withFirebase } from "../Firebase/index.js";
import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";

import * as ROUTES from "../../constants/routes";
import * as TEXT from "../../constants/text";
import * as LOCAL_STORAGE from "../../constants/localStorage";
import useStyles from "../../constants/styles";
import PageTitle from "../Shared/pageTitle";
import { Typography } from "@material-ui/core";

import { AuthUserContext } from "../Session";

// ===================================================================
// ============================ Funktionen ===========================
// ===================================================================
const updateLocalStorage = () => {
  // Nach dem verifizieren der Person, muss der LocalStorage angepasst
  // werden. Sonst funktioniert die Weiterleitung nicht korrekt.
  let user = JSON.parse(localStorage.getItem(LOCAL_STORAGE.AUTH_USER));
  // wenn es nicht genau der gleiche Browser ist, ist der LocalStorage
  // nicht vorhanden.
  if (!user) {
    throw "noLocalStorageFound";
  }
  user.emailVerified = true;
  localStorage.setItem(LOCAL_STORAGE.AUTH_USER, JSON.stringify(user));
};

// ===================================================================
// =============================== Page ==============================
// ===================================================================
const VerifyEmailPage = ({ props }) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <VerifyEmailBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// ============================== Formular ===========================
// =================================================================== */
const VerifyEmailBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const [timer, setTimer] = React.useState(10);
  const [isVerified, setIsVerified] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [forwardDestination, setForwardDestination] = React.useState(
    ROUTES.HOME
  );
  const { push } = useHistory();
  const classes = useStyles();

  let oobCode;
  let qs = require("qs");

  // Die URL enthält einen ObjektCode. Mit diesem kann die Adresse
  // verifziert werden....
  props.location.search && (oobCode = qs.parse(props.location.search).oobCode);

  // Verifizierung ausführen
  React.useEffect(async () => {
    await firebase
      .applyActionCode(oobCode)
      .then(() => {
        setIsVerified(true);

        try {
          updateLocalStorage();
        } catch (error) {
          setForwardDestination(ROUTES.SIGN_IN);
        }
        setTimer(9);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });
  }, [firebase, oobCode]);

  // Nach 10 Sekunden auf Home umleiten
  React.useEffect(() => {
    if (isVerified) {
      if (timer === 0) {
        setTimeout(() => push({ pathname: forwardDestination }), 500);
      } else {
        setTimeout(() => setTimer(timer - 1), 1000);
      }
    }
  }, [timer, isVerified, push]);

  return (
    <React.Fragment>
      <PageTitle
        title={TEXT.PAGE_TITLE_VERIFY_EMAIL}
        subTitle={TEXT.PAGE_SUBTITLE_VERIFY_EMAIL}
      />
      <Container className={classes.container} component="main" maxWidth="xs">
        {error ? (
          <Alert severity="error">
            <AlertTitle>{TEXT.ALERT_TITLE_UUPS}</AlertTitle>
            {FirebaseMessageHandler.translateMessage(error)}
          </Alert>
        ) : (
          <Alert severity="info">
            <AlertTitle>
              {TEXT.ALERT_TITLE_WELCOME_ON_BOARD} - {TEXT.REDIRECTION_IN}{" "}
              {timer}
            </AlertTitle>
            <Typography>
              {TEXT.WELCOME_ON_BOARD_REDIRECT}
              <br />
              {TEXT.OR_CLICK}
              <Link onClick={() => push({ pathname: ROUTES.HOME })}>
                {TEXT.HERE}
              </Link>
              {", "}
              {TEXT.IF_YOU_ARE_IMPATIENT}.
            </Typography>
          </Alert>
        )}
      </Container>
    </React.Fragment>
  );
};

export default VerifyEmailPage;

// export default VerifyEmailPage;
// const VerifyEmailForm = compose(withRouter, withFirebase)(VerifyEmailBase);
