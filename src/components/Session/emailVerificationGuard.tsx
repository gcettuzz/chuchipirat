import React, {useState} from "react";

import { Container, Stack, Alert } from "@mui/material";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";

import {
  VERIFY_YOUR_EMAIL as TEXT_VERIFY_YOUR_EMAIL,
  VERIFICATION_EMAIL_SENT as TEXT_VERIFICATION_EMAIL_SENT,
  ISNT_THERE_A_CAPTAIN_MISSING_SOMEWHERE as TEXT_ISNT_THERE_A_CAPTAIN_MISSING_SOMEWHERE,
} from "../../constants/text";
import LocalStorageKey from "../../constants/localStorage";
import {useFirebase} from "../Firebase/firebaseContext";
import {useAuthUser} from "./authUserContext";
import useCustomStyles from "../../constants/styles";

/* ===================================================================
// ============== Prüfung ob Email-Verifizierung nötig ist ===========
// =================================================================== */
const needsEmailVerification = (authUser) => {
  if (authUser && !authUser.emailVerified) {
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
export const EmailVerificationGuard: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const firebase = useFirebase();
  const authUser = useAuthUser();
  const [isSent, setIsSent] = useState(false);
  const classes = useCustomStyles();

  const onSendEmailVerification = () => {
    firebase.sendEmailVerification().then(() => setIsSent(true));
  };

  if (needsEmailVerification(authUser)) {
    return (
      <React.Fragment>
        <PageTitle
          subTitle={TEXT_ISNT_THERE_A_CAPTAIN_MISSING_SOMEWHERE}
        />
        <Container sx={classes.container} component="main" maxWidth="xs">
          <br />
          <Stack spacing={2}>
            {isSent ? (
              <Alert severity="success">
                {TEXT_VERIFICATION_EMAIL_SENT}
              </Alert>
            ) : (
              <Alert severity="info">{TEXT_VERIFY_YOUR_EMAIL}</Alert>
            )}
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
          </Stack>
        </Container>
      </React.Fragment>
    );
  }

  return <>{children}</>;
};

export default EmailVerificationGuard;
