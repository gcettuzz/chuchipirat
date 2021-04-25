import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import Utils from "../Shared/utils.class";
import * as TEXT from "../../constants/text";

// import useStyles from "../../constants/styles";
import { withFirebase } from "../Firebase";

/* ===================================================================
// ====================== Pop Up User hinzufügen =====================
// =================================================================== */

const DialogAddUser = ({ firebase, dialogOpen, handleAdd, handleClose }) => {
  // const classes = useStyles();

  const [userEmail, setUserEmail] = React.useState("");
  const [formValidationState, setFormValidationState] = React.useState({
    error: false,
    errorText: "",
  });
  /* ------------------------------------------
  // OnChange
  // ------------------------------------------ */
  const onEmailChange = (event) => {
    setUserEmail(event.target.value);
  };
  /* ------------------------------------------
  // Go
  // ------------------------------------------ */
  const onSubmit = () => {
    if (Utils.isEmail(userEmail)) {
      handleAdd(userEmail);
      setUserEmail("");
    } else {
      setFormValidationState({
        error: true,
        errorText: TEXT.FORM_GIVE_VALID_EMAIL,
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
      aria-labelledby="form-dialog-title"
    >
      <form>
        <DialogTitle id="form-dialog-title">
          {TEXT.DIALOG_TITLE_EVENT_ADD_PERSON}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{TEXT.USER_ADD_BY_EMAIL}</DialogContentText>
          <DialogContentText>{TEXT.USER_MUST_BE_REGISTERED}</DialogContentText>
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
            label={TEXT.FIELD_EMAIL}
            type="text"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">
            {TEXT.BUTTON_CANCEL}
          </Button>
          <Button onClick={onSubmit} color="primary">
            {TEXT.BUTTON_ADD}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default withFirebase(DialogAddUser);
