import React from "react";
import {compose} from "react-recompose";

import {useHistory} from "react-router";

import {Alert, AlertTitle} from "@material-ui/lab";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import {withFirebase} from "../Firebase/firebaseContext";
import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";

import * as ROUTES from "../../constants/routes";
import {
  WELCOME_ON_BOARD as TEXT_WELCOME_ON_BOARD,
  WELCOME_ON_BOARD_REDIRECT as TEXT_WELCOME_ON_BOARD_REDIRECT,
  REDIRECTION_IN as TEXT_REDIRECTION_IN,
  OR_CLICK as TEXT_OR_CLICK,
  HERE as TEXT_HERE,
  IF_YOU_ARE_IMPATIENT as TEXT_IF_YOU_ARE_IMPATIENT,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  AYE_AYE_CAPTAIN as TEXT_AYE_AYE_CAPTAIN,
  THANK_YOU_FOR_VERIFYING_YOUR_EMAIL as TEXT_THANK_YOU_FOR_VERIFYING_YOUR_EMAIL,
} from "../../constants/text";
import useStyles from "../../constants/styles";
import PageTitle from "../Shared/pageTitle";
import {Typography} from "@material-ui/core";
import qs from "qs";
import {CustomRouterProps} from "../Shared/global.interface";
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const VerifyEmailPage: React.FC<CustomRouterProps> = ({...props}) => {
  const firebase = props.firebase;
  const [timer, setTimer] = React.useState(10);
  const [isVerified, setIsVerified] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [forwardDestination, setForwardDestination] = React.useState(
    ROUTES.SIGN_IN
  );
  const {push} = useHistory();
  const classes = useStyles();

  let oobCode = "";
  // Die URL enthält einen ObjektCode. Mit diesem kann die Adresse
  // verifziert werden....
  props.location.search &&
    (oobCode = qs.parse(props.location.search).oobCode as string);

  // Verifizierung ausführen
  React.useEffect(() => {
    firebase
      .applyActionCode(oobCode)
      .then(() => {
        setIsVerified(true);
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
  }, [firebase, oobCode]);

  // Nach 10 Sekunden auf Home umleiten
  React.useEffect(() => {
    if (isVerified) {
      if (timer === 0) {
        setTimeout(() => push({pathname: forwardDestination}), 500);
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
      <Container className={classes.container} component="main" maxWidth="xs">
        {error ? (
          <Alert severity="error">
            <AlertTitle>{TEXT_ALERT_TITLE_UUPS}</AlertTitle>
            {FirebaseMessageHandler.translateMessage(error)}
          </Alert>
        ) : (
          <Alert severity="info">
            <AlertTitle>
              {TEXT_WELCOME_ON_BOARD} - {TEXT_REDIRECTION_IN} {timer}
            </AlertTitle>
            <Typography>
              {TEXT_WELCOME_ON_BOARD_REDIRECT}
              <br />
              {TEXT_OR_CLICK}
              <Link onClick={() => push({pathname: ROUTES.HOME})}>
                {TEXT_HERE}
              </Link>
              {", "}
              {TEXT_IF_YOU_ARE_IMPATIENT}.
            </Typography>
          </Alert>
        )}
      </Container>
    </React.Fragment>
  );
};

export default compose(withFirebase)(VerifyEmailPage);
