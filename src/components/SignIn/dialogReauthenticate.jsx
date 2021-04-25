import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";

import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import * as TEXT from "../../constants/text";
import User from "../User/user.class";

import AlertMessage from "../Shared/AlertMessage";
import { ForgotPasswordLink } from "../PasswordReset/passwordReset";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
export const REAUTHENTICATION_INITIAL_STATE = {
  reAUth_email: "",
  reAuth_password: "",
  showPassword: false,
  error: null,
};
/* ===================================================================
// ==================== Pop Up Abteilung hinzufügen ==================
// =================================================================== */
const DialogReauthenticate = ({
  firebase,
  dialogOpen,
  handleOk,
  handleClose,
  authUser = null,
}) => {
  const [formFields, setFormFields] = React.useState(
    REAUTHENTICATION_INITIAL_STATE
  );
  // const [validation, setValidation] = React.useState({
  //   name: { hasError: false, errorText: "" },
  // });
  if (!formFields.reAUth_email && authUser) {
    setFormFields({
      ...formFields,
      reAUth_email: authUser.email,
    });
  }

  /* ------------------------------------------
  // Change Ereignis Felder
  // ------------------------------------------ */
  const onChangeField = (event, newValue) => {
    let field = event.target.id.split("-")[0];

    setFormFields({
      ...formFields,
      [field]: event.target.value,
    });
  };
  /* ------------------------------------------
  // PopUp Ok
  // ------------------------------------------ */
  const onOkClick = async () => {
    let hasError = false;
    await firebase
      .reauthenticateWithCredential({
        email: formFields.reAUth_email,
        password: formFields.reAuth_password,
      })
      .then(() => {
        // Login in eigener Sammlung registrieren
        User.registerSignIn(firebase, authUser.uid);
      })
      .catch((error) => {
        console.error(error);
        hasError = true;
        setFormFields({ ...formFields, error: error });
      });

    if (!hasError) {
      handleOk();
      setFormFields(REAUTHENTICATION_INITIAL_STATE);
    }
  };
  /* ------------------------------------------
  // PopUp Abbrechen
  // ------------------------------------------ */
  const onCancelClick = () => {
    handleClose();
  };

  const handleClickShowPassword = () => {
    setFormFields({ ...formFields, showPassword: !formFields.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialogDeparment"
      disableBackdropClick
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="dialogTitleDeparment">
        {TEXT.PAGE_REAUTHENTICATE_DIALOG_TITLE}
      </DialogTitle>
      <DialogContent>
        {!formFields.error && (
          <AlertMessage
            severity={"info"}
            body={TEXT.SIGN_IN_WHY_REAUTHENTICATE}
          />
        )}
        {formFields.error && (
          <AlertMessage
            error={formFields.error}
            body={
              formFields.error.code === "auth/too-many-requests" && (
                <ForgotPasswordLink />
              )
            }
          />
        )}
        {/* Mailadresse */}
        <TextField
          disabled={authUser && true}
          type="email"
          margin="normal"
          required
          fullWidth
          id="reAuth_email"
          label={TEXT.FIELD_EMAIL}
          name="reAuth_email"
          autoFocus
          value={formFields.reAUth_email}
          onChange={onChangeField}
        />
        {/* Passwort */}
        <TextField
          type={formFields.showPassword ? "text" : "password"}
          margin="normal"
          required
          fullWidth
          id="reAuth_password"
          name="reAuth_password"
          label={TEXT.FIELD_PASSWORD}
          autoComplete="new-password"
          value={formFields.reAuth_password}
          onChange={onChangeField}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={TEXT.BUTTON_SHOW_PASSWORD}
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {formFields.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick} color="primary" variant="outlined">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button onClick={onOkClick} color="primary" variant="contained">
          {TEXT.BUTTON_SIGN_IN}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogReauthenticate;
