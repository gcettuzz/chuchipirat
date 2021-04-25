import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";

import WarningIcon from "@material-ui/icons/Warning";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import useStyles from "../../constants/styles";

import * as TEXT from "../../constants/text";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
export const DELETION_CONFIRMATION_INITIAL_STATE = {
  confirmationString: "",
};
/* ===================================================================
// ==================== Pop Up Abteilung hinzufügen ==================
// =================================================================== */
const DialogDeletionConfirmation = ({
  dialogOpen,
  handleOk,
  handleClose,
  confirmationString = "abc",
}) => {
  const [formFields, setFormFields] = React.useState(
    DELETION_CONFIRMATION_INITIAL_STATE
  );
  const [validation, setValidation] = React.useState({
    confirmationString: { hasError: false, errorText: "" },
  });

  const classes = useStyles();

  /* ------------------------------------------
  // Change Ereignis Felder
  // ------------------------------------------ */
  const onChangeField = (event, newValue) => {
    let field = event.target.id.split("-")[0];
    let confirmationStringValidation = { hasError: false, errorText: "" };

    setFormFields({
      ...formFields,
      [field]: event.target.value,
    });

    if (!event.target.value) {
      confirmationStringValidation.hasError = true;
      confirmationStringValidation.errorText = TEXT.REQUIRED;
    } else if (event.target.value !== confirmationString) {
      confirmationStringValidation.hasError = true;
      confirmationStringValidation.errorText =
        TEXT.DIALOG_DELETION_CONFIRMATION_STRING_DOES_NOT_MATCH;
    }
    setValidation({
      ...validation,
      confirmationString: confirmationStringValidation,
    });
  };
  /* ------------------------------------------
  // PopUp Ok
  // ------------------------------------------ */
  const onOkClick = () => {
    //  Prüfung
    if (confirmationString !== formFields.confirmationString) {
      return;
    }
    handleOk();
    setFormFields(DELETION_CONFIRMATION_INITIAL_STATE);
  };
  /* ------------------------------------------
  // PopUp Abbrechen
  // ------------------------------------------ */
  const onCancelClick = () => {
    handleClose();
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialogDeletionConfirmation"
    >
      <DialogTitle
        id="dialogDeletionConfirmation"
        className={classes.dialogDeletionConfirmationTitle}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <WarningIcon
            className={classes.dialogDeletionConfirmationWarningIcon}
          />
          <span>{TEXT.DIALOG_TITLE_DELETION_CONFIRMATION}</span>
        </div>
        <DialogContentText className={classes.dialogDeletionConfirmationText}>
          {TEXT.DIALOG_SUBTITLE_DELETION_CONFIRMATION}{" "}
        </DialogContentText>
      </DialogTitle>
      <DialogContent>
        {TEXT.DIALOG_TEXT_DELETION_CONFIRMATION}{" "}
        <strong>{confirmationString}</strong>
        <TextField
          error={validation.confirmationString.hasError}
          margin="dense"
          id="confirmationString"
          name="confirmationString"
          value={formFields.confirmationString}
          required
          fullWidth
          onChange={onChangeField}
          variant="outlined"
          placeholder={confirmationString}
          type="text"
          helperText={validation.confirmationString.errorText}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick} variant="outlined">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button
          disabled={formFields.confirmationString !== confirmationString}
          onClick={onOkClick}
          variant="contained"
          style={
            formFields.confirmationString === confirmationString
              ? { backgroundColor: "#C62828", color: "#FFFFFF" }
              : null
          }
        >
          {TEXT.BUTTON_DELETE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDeletionConfirmation;
