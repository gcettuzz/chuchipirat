import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import Unit from "./unit.class";
import * as TEXT from "../../constants/text";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
export const UNIT_ADD_INITIAL_STATE = {
  key: "",
  name: "",
};
/* ===================================================================
// ===================== Pop Up Einheit hinzufügen ===================
// =================================================================== */
const DialogCreateUnit = ({
  firebase,
  dialogOpen,
  handleCreate,
  handleClose,
  handleError,
}) => {
  const [formFields, setFormFields] = React.useState(UNIT_ADD_INITIAL_STATE);

  const [validation, setValidation] = React.useState({
    key: { hasError: false, errorText: "" },
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
    // Prüfung Abteilung und Name gesetzt

    let hasError = false;
    if (!formFields.name) {
      setValidation({
        ...validation,
        name: { hasError: true, errorText: TEXT.FORM_GIVE_UNIT },
      });
      hasError = true;
    }
    if (!formFields.key) {
      setValidation({
        ...validation,
        key: {
          hasError: true,
          errorText: TEXT.FORM_GIVE_UNIT,
        },
      });
      hasError = true;
    }
    if (hasError) {
      return;
    }

    // Neue Einheit anlegen
    Unit.createUnit(firebase, formFields.key, formFields.name)
      .then(() => {
        handleCreate(formFields.key, formFields.name);
        setFormFields(UNIT_ADD_INITIAL_STATE);
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
      aria-labelledby="dialogAddUnit"
      disableBackdropClick
    >
      <DialogTitle id="dialogAddProduct">
        {TEXT.DIALOG_TITLE_UNIT_CREATE}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{TEXT.DIALOG_TEXT_UNIT_CREATE}</DialogContentText>
        <TextField
          error={validation.key.hasError}
          margin="dense"
          id="key"
          name="key"
          value={formFields.key}
          required
          fullWidth
          onChange={onChangeField}
          label={TEXT.FIELD_UNIT_ABREVIATION}
          type="text"
          helperText={validation.key.errorText}
        />
        <TextField
          error={validation.name.hasError}
          margin="dense"
          id="name"
          name="name"
          value={formFields.name}
          required
          fullWidth
          onChange={onChangeField}
          label={TEXT.FIELD_UNIT}
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

export default DialogCreateUnit;
