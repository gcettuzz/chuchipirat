import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import Department from "./department.class";
import * as TEXT from "../../constants/text";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
export const DEPARTMENT_INITIAL_STATE = {
  name: "",
};
/* ===================================================================
// ==================== Pop Up Abteilung hinzufügen ==================
// =================================================================== */
const DialogDepartment = ({
  firebase,
  dialogOpen,
  handleCreate,
  handleClose,
  handleError,
  nextHigherPos = 99,
}) => {
  const [formFields, setFormFields] = React.useState(DEPARTMENT_INITIAL_STATE);
  const [validation, setValidation] = React.useState({
    name: { hasError: false, errorText: "" },
  });

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
  const onOkClick = () => {
    //  Prüfung Name ausgefüllt
    let hasError = false;
    if (!formFields.name) {
      setValidation({
        ...validation,
        name: {
          hasError: true,
          errorText: TEXT.FORM_GIVE_DEPARTMENT_NAME,
        },
      });
      hasError = true;
    }

    if (hasError) {
      return;
    }
    // Neue Abteilung anlegen
    Department.createDepartment({
      firebase: firebase,
      name: formFields.name,
      pos: nextHigherPos,
    })
      .then((result) => {
        handleCreate(result);
        setFormFields(DEPARTMENT_INITIAL_STATE);
      })
      .catch((error) => {
        handleError(error);
      });
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
      aria-labelledby="dialogDeparment"
      disableBackdropClick
    >
      <DialogTitle id="dialogTitleDeparment">
        {TEXT.DIALOG_TITLE_DEPARTMENT}
      </DialogTitle>
      <DialogContent>
        <TextField
          error={validation.name.hasError}
          margin="dense"
          id="name"
          name="name"
          value={formFields.name}
          required
          fullWidth
          onChange={onChangeField}
          label={TEXT.FIELD_DEPARTMENT}
          type="text"
          helperText={validation.name.errorText}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick} color="primary" variant="outlined">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button onClick={onOkClick} color="primary" variant="contained">
          {TEXT.BUTTON_CREATE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDepartment;
