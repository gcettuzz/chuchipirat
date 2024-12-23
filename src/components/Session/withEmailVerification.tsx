import React, {useState} from "react";

import {Container, Grid} from "@mui/material";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";

import {
  VERIFY_YOUR_EMAIL as TEXT_VERIFY_YOUR_EMAIL,
  VERIFICATION_EMAIL_SENT as TEXT_VERIFICATION_EMAIL_SENT,
  ISNT_THERE_A_CAPTAIN_MISSING_SOMEWHERE as TEXT_ISNT_THERE_A_CAPTAIN_MISSING_SOMEWHERE,
} from "../../constants/text";
import LocalStorageKey from "../../constants/localStorage";
import {withFirebase} from "../Firebase/firebaseContext";
import {AuthUserContext} from "./authUserContext";
import {Alert} from "@mui/lab";
import Firebase from "../Firebase/firebase.class";
import useStyles from "../../constants/styles";

/* ===================================================================
// ============== Prüfung ob Email-Verifizierung nötig ist ===========
// =================================================================== */
const needsEmailVerification = (authUser) => {
  if (authUser && !authUser.emailVerified) {
    // Prüfen ob allenfalls LocalStorage ein update Erhalten hat
    const storageContent = localStorage.getItem(LocalStorageKey.AUTH_USER);
    if (!storageContent) {
      return false;
    }

    const storageAuthUser = JSON.parse(storageContent);
    if (storageAuthUser && storageAuthUser.emailVerified) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};
/* ===================================================================
// ======== Prüfung und Anzeige der Verifizierungs-Nachricht =========
// =================================================================== */
interface WithEmailVerificationProps {
  firebase: Firebase;
}
const withEmailVerification = (Component: React.ComponentType<any>) => {
  const WithEmailVerification: React.FC<WithEmailVerificationProps> = (
    props
  ) => {
    const firebase = props.firebase as Firebase;
    const [isSent, setIsSent] = useState(false);
    const classes = useStyles();

    const onSendEmailVerification = () => {
      firebase.sendEmailVerification().then(() => setIsSent(true));
    };
    return (
      <AuthUserContext.Consumer>
        {(authUser) =>
          needsEmailVerification(authUser) ? (
            <React.Fragment>
              <PageTitle
                subTitle={TEXT_ISNT_THERE_A_CAPTAIN_MISSING_SOMEWHERE}
              />
              <Container
                className={classes.container}
                component="main"
                maxWidth="xs"
              >
                <br />
                <Grid container spacing={2}>
                  {isSent ? (
                    <Grid item key={"email_sent"} xs={12}>
                      <Alert severity="success">
                        {TEXT_VERIFICATION_EMAIL_SENT}
                      </Alert>
                    </Grid>
                  ) : (
                    <Grid item key={"verify_email"} xs={12}>
                      <Alert severity="info">{TEXT_VERIFY_YOUR_EMAIL}</Alert>
                    </Grid>
                  )}
                  <Grid item key={"buttons"} xs={12}>
                    <ButtonRow
                      buttons={[
                        {
                          id: "buttonResendConfirmationEmail",
                          hero: true,
                          label: "Bestätigungs-E-Mail erneut senden",
                          variant: "contained",
                          color: "primary",
                          onClick: onSendEmailVerification,
                          disabled: isSent,
                          visible: true,
                        },
                      ]}
                    />
                  </Grid>
                </Grid>
              </Container>
            </React.Fragment>
          ) : (
            <Component {...props} />
          )
        }
      </AuthUserContext.Consumer>
    );
  };

  return withFirebase(WithEmailVerification);
};

export default withEmailVerification;
