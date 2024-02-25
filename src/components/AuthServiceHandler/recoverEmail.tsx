import React from "react";
import {compose} from "react-recompose";

import {useHistory, withRouter} from "react-router";

import {Container, Link} from "@material-ui/core";
import {Alert, AlertTitle} from "@material-ui/lab";

import PageTitle from "../Shared/pageTitle";

import useStyles from "../../constants/styles";

import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";
import {withFirebase} from "../Firebase/firebaseContext";
import User from "../User/user.class";

import {SIGN_IN as ROUTE_SIGN_IN} from "../../constants/routes";
import {
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  BACKSPELLED as TEXT_BACKSPELLED,
  CHANGE_UNDONE as TEXT_CHANGE_UNDONE,
  EMAIL_RECOVERED as TEXT_EMAIL_RECOVERED,
  SIGN_IN as TEXT_SIGN_IN,
} from "../../constants/text";
import LocalStorageKey from "../../constants/localStorage";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../Shared/global.interface";

// ===================================================================
// =============================== Page ==============================
// ===================================================================
const RecoverEmailPage: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const actionCode = props?.oobCode;
  const [error, setError] = React.useState<Error | null>(null);
  const [isRecovered, setIsRecovered] = React.useState(false);
  const {push} = useHistory();
  const classes = useStyles();

  /* ------------------------------------------
  // E-Mail-Wechsel zurückbuchstabieren
  // ------------------------------------------ */
  React.useEffect(() => {
    if (!authUser) {
      authUser = JSON.parse(localStorage.getItem(LocalStorageKey.AUTH_USER)!);
    }

    if (!authUser) {
      setError({message: TEXT_ALERT_TITLE_UUPS, name: "undefined"});
      return;
    }

    firebase.auth.checkActionCode(actionCode).then((actionCodeInfo) => {
      // Update muss vorher passieren. Nach Eingabe des Action-Code geschieht
      // automatisch der Log-Off. Somit kann die DB nicht mehr geändert werden
      User.updateEmail({
        firebase: firebase,
        newEmail: actionCodeInfo.data.email,
        authUser: authUser!,
      });
      updateLocalStorage(actionCodeInfo.data.email);

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
  const updateLocalStorage = (oldEmail: string) => {
    // alles löschen damit die alten Werte neu gelesen werden
    const user = JSON.parse(
      localStorage.getItem(LocalStorageKey.AUTH_USER)!
    ) as AuthUser;
    user.email = oldEmail;
    user.emailVerified = true;
    localStorage.setItem(LocalStorageKey.AUTH_USER, JSON.stringify(user));
  };

  return (
    <React.Fragment>
      <PageTitle
        title={TEXT_BACKSPELLED}
        // subTitle={TEXT.ALERT_TITLE_EMAIL_RECOVERED}
      />
      <Container className={classes.container} component="main" maxWidth="xs">
        {error && (
          <Alert severity="error">
            <AlertTitle>{TEXT_ALERT_TITLE_UUPS}</AlertTitle>
            {FirebaseMessageHandler.translateMessage(error)}
          </Alert>
        )}
        {isRecovered && (
          <Alert severity="info">
            <AlertTitle>{TEXT_CHANGE_UNDONE}</AlertTitle>
            {TEXT_EMAIL_RECOVERED}
            <Link onClick={() => push({pathname: ROUTE_SIGN_IN})}>
              {TEXT_SIGN_IN}
            </Link>
          </Alert>
        )}
      </Container>
    </React.Fragment>
  );
};

export default compose(withRouter, withFirebase)(RecoverEmailPage);
