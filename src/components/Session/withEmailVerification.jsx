import React from "react";

import Alert from "@material-ui/lab/Alert";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";

import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";

import * as TEXT from "../../constants/text";
import * as LOCAL_STORAGE from "../../constants/localStorage";

/* ===================================================================
// ============== Prüfung ob Email-Verifizierung nötig ist ===========
// =================================================================== */
const needsEmailVerification = (authUser) => {
  if (authUser && !authUser.emailVerified) {
    // Prüfen ob allenfalls LocalStorage ein update Erhalten hat
    let storageAuthUser = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE.AUTH_USER)
    );
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
const withEmailVerification = (Component) => {
  class WithEmailVerification extends React.Component {
    constructor(props) {
      super(props);
      this.state = { isSent: false };
    }

    onSendEmailVerification = () => {
      this.props.firebase
        .sendEmailVerification()
        .then(() => this.setState({ isSent: true }));
    };
    render() {
      return (
        <AuthUserContext.Consumer>
          {(authUser) =>
            needsEmailVerification(authUser) ? (
              <React.Fragment>
                <PageTitle
                  subTitle={TEXT.PAGE_SUBTITLE_WITH_EMAIL_VERIFICATION}
                />
                <Container component="main" maxWidth="xs">
                  <br></br>
                  <Grid container spacing={2}>
                    {this.state.isSent ? (
                      <Grid item key={"email_sent"} xs={12}>
                        <Alert severity="success">
                          {TEXT.VERIFICATION_EMAIL_SENT}
                        </Alert>
                      </Grid>
                    ) : (
                      <Grid item key={"verify_email"} xs={12}>
                        <Alert severity="info">{TEXT.VERIFY_YOUR_EMAIL}</Alert>
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
                            onClick: this.onSendEmailVerification,
                            disabled: this.state.isSent,
                            visible: true,
                          },
                        ]}
                      />
                    </Grid>
                  </Grid>
                </Container>
              </React.Fragment>
            ) : (
              <Component {...this.props} />
            )
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withFirebase(WithEmailVerification);
};

export default withEmailVerification;
