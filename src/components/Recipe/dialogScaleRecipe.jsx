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
import { Alert, AlertTitle } from "@material-ui/lab";

import * as TEXT from "../../constants/text";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
// export const DELETION_CONFIRMATION_INITIAL_STATE = {
//   confirmationString: "",
// };
/* ===================================================================
// ==================== Pop Up Abteilung hinzufügen ==================
// =================================================================== */
const DialogScaleRecipe = ({
  dialogOpen,
  handleOk,
  handleClose,
  scaledPortions,
}) => {
  const [formFields, setFormFields] = React.useState({
    scaledPortions: null,
    initial: true,
  });

  const classes = useStyles();

  // Werte setzen aus dem Rezept
  if (!formFields.scaledPortions && scaledPortions && formFields.initial) {
    setFormFields({
      ...formFields,
      scaledPortions: scaledPortions,
      initial: false,
    });
  }
  /* ------------------------------------------
  // Change Ereignis Felder
  // ------------------------------------------ */
  const onChangeField = (event, newValue) => {
    setFormFields({
      ...formFields,
      scaledPortions: event.target.value,
      initial: false,
    });
  };
  /* ------------------------------------------
  // PopUp Ok
  // ------------------------------------------ */
  const onOkClick = () => {
    setFormFields({ ...formFields, initial: true });
    handleOk(formFields.scaledPortions);
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
      aria-labelledby="dialogScaleRecipe"
      fullWidth={true}
      maxWidth="xs"
    >
      <DialogTitle id="dialogScaleRecipe">
        {TEXT.DIALOG_TITLE_SCALE_RECIPE}
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          id="scaledPortions"
          name="scaledPortions"
          value={formFields.scaledPortions}
          // required
          fullWidth
          onChange={onChangeField}
          variant="outlined"
          label={TEXT.PORTIONS_TO_SCALE}
          type="number"
        />

        <Alert severity="info">
          <AlertTitle>{TEXT.INFO_PANEL_TITLE_SCALE}</AlertTitle>
          {TEXT.INFO_PANEL_TEXT_SCALE}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick} variant="outlined">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button
          // disabled={formFields.confirmationString !== confirmationString}
          onClick={onOkClick}
          variant="contained"
        >
          {TEXT.BUTTON_OK}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogScaleRecipe;
