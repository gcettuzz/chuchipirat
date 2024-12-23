import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import {
  GIVE_UNIT as TEXT_GIVE_UNIT,
  UNIT_CREATE as TEXT_UNIT_CREATE,
  UNIT_CREATE_EXPLANATION as TEXT_UNIT_CREATE_EXPLANATION,
  UNIT_ABREVIATION as TEXT_UNIT_ABREVIATION,
  UNIT as TEXT_UNIT,
  CANCEL as TEXT_CANCEL,
  CREATE as TEXT_CREATE,
} from "../../constants/text";
import Unit from "./unit.class";

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
interface DialogCreateUnitProps {
  dialogOpen: boolean;
  handleCreate: (unit: Unit) => void;
  handleClose: () => void;
}
const DialogCreateUnit = ({
  dialogOpen,
  handleCreate,
  handleClose,
}: DialogCreateUnitProps) => {
  const [formFields, setFormFields] = React.useState(UNIT_ADD_INITIAL_STATE);

  const [validation, setValidation] = React.useState({
    key: {hasError: false, errorText: ""},
    name: {hasError: false, errorText: ""},
  });

  /* ------------------------------------------
  // Change Ereignis Felder
  // ------------------------------------------ */
  const onChangeField = (event: React.ChangeEvent<HTMLInputElement>) => {
    const field = event.target.id.split("-")[0];

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
        name: {hasError: true, errorText: TEXT_GIVE_UNIT},
      });
      hasError = true;
    }
    if (!formFields.key) {
      setValidation({
        ...validation,
        key: {
          hasError: true,
          errorText: TEXT_GIVE_UNIT,
        },
      });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    handleCreate({key: formFields.key, name: formFields.name});
    setFormFields(UNIT_ADD_INITIAL_STATE);
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
    >
      <DialogTitle id="dialogAddProduct">{TEXT_UNIT_CREATE}</DialogTitle>
      <DialogContent>
        <DialogContentText>{TEXT_UNIT_CREATE_EXPLANATION}</DialogContentText>
        <TextField
          error={validation.key.hasError}
          margin="dense"
          id="key"
          name="key"
          value={formFields.key}
          required
          fullWidth
          onChange={onChangeField}
          label={TEXT_UNIT_ABREVIATION}
          type="text"
          helperText={validation.key.errorText}
          autoComplete="off"
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
          label={TEXT_UNIT}
          type="text"
          helperText={validation.name.errorText}
          autoComplete="off"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick} color="primary" variant="outlined">
          {TEXT_CANCEL}
        </Button>
        <Button onClick={onOkClick} color="primary" variant="contained">
          {TEXT_CREATE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogCreateUnit;
