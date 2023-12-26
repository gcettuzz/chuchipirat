import React from "react";

import { Alert } from "@material-ui/lab";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import Utils from "../Shared/utils.class";
import User from "../User/user.class";

import {
  GIVE_VALID_EMAIL as TEXT_GIVE_VALID_EMAIL,
  ADD_PERSON_TO_TEAM as TEXT_ADD_PERSON_TO_TEAM,
  USER_ADD_BY_EMAIL as TEXT_USER_ADD_BY_EMAIL,
  USER_MUST_BE_REGISTERED as TEXT_USER_MUST_BE_REGISTERED,
  USER_NOT_IDENTIFIED_BY_EMAIL as TEXT_USER_NOT_IDENTIFIED_BY_EMAIL,
  BUTTON_CANCEL as TEXT_BUTTON_CANCEL,
  BUTTON_ADD as TEXT_BUTTON_ADD,
  EMAIL as TEXT_EMAIL,
  YOU_CANNOT_ADD_YOURSELF as TEXT_YOU_CANNOT_ADD_YOURSELF,
} from "../../constants/text";

// import useStyles from "../../constants/styles";
import Firebase, { withFirebase } from "../Firebase";
import AuthUser from "../Firebase/Authentication/authUser.class";

/* ===================================================================
// ====================== Pop Up User hinzufügen =====================
// =================================================================== */
interface DialogAddUserProps {
  firebase: Firebase;
  authUser: AuthUser;
  dialogOpen: boolean;
  handleAddUser: (userUid: string) => void;
  handleClose: () => void;
}
const DialogAddUser = ({
  firebase,
  authUser,
  dialogOpen,
  handleAddUser,
  handleClose,
}: DialogAddUserProps) => {
  // const classes = useStyles();

  const [userEmail, setUserEmail] = React.useState("");
  const [formValidationState, setFormValidationState] = React.useState({
    error: false,
    errorText: "",
  });
  const [infoBox, setInfoBox] = React.useState({ visible: false, text: "" });

  /* ------------------------------------------
  // OnChange
  // ------------------------------------------ */
  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserEmail(event.target.value);
  };
  /* ------------------------------------------
  // Go
  // ------------------------------------------ */
  const onSubmit = async () => {
    if (Utils.isEmail(userEmail)) {
      if (userEmail.toLowerCase() == authUser.email) {
        setInfoBox({ visible: true, text: TEXT_YOU_CANNOT_ADD_YOURSELF });
        return;
      }
      //UID aus E-Mail-Adresse ermitteln
      await User.getUidByEmail({ firebase: firebase, email: userEmail })
        .then((result) => {
          console.log("uid ist", result);
          handleAddUser(result);
          setUserEmail("");
        })
        .catch((error) => {
          setInfoBox({ visible: true, text: error.toString() });
        });
    } else {
      setFormValidationState({
        error: true,
        errorText: TEXT_GIVE_VALID_EMAIL,
      });
    }
  };
  const onCancel = () => {
    setUserEmail("");
    handleClose();
  };
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="Benutzer*in hinzufügen"
    >
      <DialogTitle id="form-dialog-title">
        {TEXT_ADD_PERSON_TO_TEAM}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{TEXT_USER_ADD_BY_EMAIL}</DialogContentText>
        <DialogContentText>{TEXT_USER_MUST_BE_REGISTERED}</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="cook_email"
          error={formValidationState.error}
          helperText={formValidationState.errorText}
          required
          fullWidth
          value={userEmail}
          onChange={onEmailChange}
          label={TEXT_EMAIL}
          type="text"
        />
        {infoBox.visible && (
          <Alert severity="warning" style={{ marginTop: "1rem" }}>
            {infoBox.text}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary" variant="outlined">
          {TEXT_BUTTON_CANCEL}
        </Button>
        <Button onClick={onSubmit} color="primary" variant="contained">
          {TEXT_BUTTON_ADD}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withFirebase(DialogAddUser);
