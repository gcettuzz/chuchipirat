import React from "react";

import {useNavigate, useLocation} from "react-router";

import {Alert, AlertTitle} from "@mui/lab";
import Container from "@mui/material/Container";
import {useFirebase} from "../Firebase/firebaseContext";
import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";

import * as ROUTES from "../../constants/routes";
import {
  WELCOME_ON_BOARD as TEXT_WELCOME_ON_BOARD,
  WELCOME_ON_BOARD_REDIRECT as TEXT_WELCOME_ON_BOARD_REDIRECT,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  AYE_AYE_CAPTAIN as TEXT_AYE_AYE_CAPTAIN,
  THANK_YOU_FOR_VERIFYING_YOUR_EMAIL as TEXT_THANK_YOU_FOR_VERIFYING_YOUR_EMAIL,
} from "../../constants/text";
import useCustomStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import {Typography} from "@mui/material";
import qs from "qs";
import User from "../User/user.class";
import {checkActionCode, applyActionCode} from "firebase/auth";

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const VerifyEmailPage = () => {
  const firebase = useFirebase();
  const location = useLocation();
  const [timer, setTimer] = React.useState(10);
  const [isVerified, setIsVerified] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [forwardDestination, setForwardDestination] = React.useState(
    ROUTES.SIGN_IN
  );
  const navigate = useNavigate();
  const classes = useCustomStyles();

  let oobCode = "";
  // Die URL enthält einen ObjektCode. Mit diesem kann die Adresse
  // verifziert werden....
  location.search &&
    (oobCode = qs.parse(location.search).oobCode as string);

  // Verifizierung ausführen
  React.useEffect(() => {
    // Zuerst Infos holen, damit wir anhand des Action-Codes
    // Die E-Mailadresse des Users erhalten

    checkActionCode(firebase.auth, oobCode)
      .then(async (actionCodeInfo) => {
        applyActionCode(firebase.auth, oobCode)
          .then(async () => {
            setIsVerified(true);
            await User.createUserPublicData({
              firebase: firebase,
              email: actionCodeInfo.data.email as string,
            });
          })
          .then(() => {
            // damit die der Authuser sauber nochmals gelesen wird,
            // ist eine erneute Anmeldung nötig.
            firebase.signOut();
            setForwardDestination(ROUTES.SIGN_IN);
            setTimer(9);
          })
          .catch((error) => {
            console.error(error);
            setError(error);
          });
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
        setTimeout(() => navigate(forwardDestination), 500);
      } else {
        setTimeout(() => setTimer(timer - 1), 1000);
      }
    }
  }, [timer, isVerified, push]);

  return (
    <React.Fragment>
      <PageTitle
        title={TEXT_AYE_AYE_CAPTAIN}
        subTitle={TEXT_THANK_YOU_FOR_VERIFYING_YOUR_EMAIL}
      />
      <Container sx={classes.container} component="main" maxWidth="xs">
        {error ? (
          <Alert severity="error">
            <AlertTitle>{TEXT_ALERT_TITLE_UUPS}</AlertTitle>
            {FirebaseMessageHandler.translateMessage(error)}
          </Alert>
        ) : (
          <Alert severity="info">
            <AlertTitle>{TEXT_WELCOME_ON_BOARD}</AlertTitle>
            <Typography>{TEXT_WELCOME_ON_BOARD_REDIRECT(timer)}</Typography>
          </Alert>
        )}
      </Container>
    </React.Fragment>
  );
};

export default VerifyEmailPage;
