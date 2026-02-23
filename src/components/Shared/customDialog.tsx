import React from "react";
import {createPortal} from "react-dom";
import {DialogType, useCustomDialog} from "./customDialogContext";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  TextField,
  Box,
  useTheme,
} from "@mui/material";

import WarningIcon from "@mui/icons-material/Warning";

import {
  DIALOG_DELETION_CONFIRMATION_STRING_DOES_NOT_MATCH as TEXT_DIALOG_DELETION_CONFIRMATION_STRING_DOES_NOT_MATCH,
  REQUIRED as TEXT_REQUIRED,
} from "../../constants/text";
import useCustomStyles from "../../constants/styles";

interface FormFieldsState {
  userInput: string;
  confirmationString: string;
  inputMatches: boolean;
  roundtripDone: boolean;
}

const FORM_FIELDS_INITIAL_STATE: FormFieldsState = {
  userInput: "",
  confirmationString: "",
  inputMatches: false,
  roundtripDone: false,
};

const CustomDialog = () => {
  const classes = useCustomStyles();
  const theme = useTheme();

  const {dialogState, onConfirm, onCancel} = useCustomDialog();
  const portalElement = document.getElementById("portal");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [confirmDeletionValidation, setConfirmDeletionValidation] =
    React.useState({
      confirmationString: {hasError: false, errorText: ""},
    });
  const [validation, setValidation] = React.useState({
    confirmationString: {hasError: false, errorText: ""},
  });
  /* ------------------------------------------
  // Spezielles Handling für Single-Text-Input
  // ------------------------------------------ */
  const [formFields, setFormFields] = React.useState(FORM_FIELDS_INITIAL_STATE);
  // Initialisierung
  if (
    !formFields.roundtripDone &&
    !formFields.userInput &&
    dialogState.singleTextInputProperties?.initialValue
  ) {
    setFormFields({
      ...formFields,
      roundtripDone: true,
      userInput: dialogState.singleTextInputProperties?.initialValue,
    });
  }
  const onFieldUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormFields({
      ...formFields,
      [event.target.id]: event.target.value,
      roundtripDone: true,
    });
  };
  const onOkSingleTextInput = () => {
    onConfirm(formFields.userInput);
    setFormFields(FORM_FIELDS_INITIAL_STATE);
  };
  const onCancelSingleTextInput = () => {
    onCancel("");
    setFormFields(FORM_FIELDS_INITIAL_STATE);
  };
  /* ------------------------------------------
  // Spezielles Handling für Confirm Deletion
  // ------------------------------------------ */
  const onConfirmDeletionConfirmationStringUpdate = (
    // Prüfen ob der Eintrag auch übereinstimmt
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const confirmationStringValidation = {hasError: false, errorText: ""};

    setFormFields({
      ...formFields,
      [event.target.id]: event.target.value,
      inputMatches: false,
      roundtripDone: true,
    });

    if (
      event.target.value ==
      dialogState.deletionDialogProperties?.confirmationString
    ) {
      // Kurzer Wait - macht einem nochmals klar, das gelöscht wird!
      setTimeout(function () {
        setFormFields({
          ...formFields,
          [event.target.id]: event.target.value,
          inputMatches: true,
          roundtripDone: true,
        });
      }, 300);
    }

    if (!event.target.value) {
      confirmationStringValidation.hasError = true;
      confirmationStringValidation.errorText = TEXT_REQUIRED;
    } else if (event.target.value !== formFields.confirmationString) {
      confirmationStringValidation.hasError = true;
      confirmationStringValidation.errorText =
        TEXT_DIALOG_DELETION_CONFIRMATION_STRING_DOES_NOT_MATCH;
    }
    setValidation({
      ...validation,
      confirmationString: confirmationStringValidation,
    });
  };
  const onOkConfirmDeletion = () => {
    clearDialogFields();
    onConfirm();
  };
  const onCancelConfirmDeletion = () => {
    clearDialogFields();
    onCancel();
  };

  const onOptionSelection = (id: number | string) => {
    onConfirm(id);
  };

  const clearDialogFields = () => {
    setFormFields(FORM_FIELDS_INITIAL_STATE);
    setValidation({confirmationString: {hasError: false, errorText: ""}});
  };

  const component = dialogState.visible ? (
    dialogState.dialogType == DialogType.Confirm ? (
      // Simpler Dialog
      (<Dialog
        open={dialogState.visible}
        onClose={(event, reason) => reason !== "backdropClick" && onCancel()}
        aria-labelledby="confirm-dialog"
      >
        <DialogTitle id="confirm-dialog-title">{dialogState.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogState.text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">
            {dialogState.buttonTextCancel}
          </Button>
          <Button onClick={onConfirm} color="primary" autoFocus>
            {dialogState.buttonTextConfirm}
          </Button>
        </DialogActions>
      </Dialog>)
    ) : dialogState.dialogType == DialogType.SingleTextInput ? (
      // Single Text Input Dialog
      (<Dialog open={dialogState.visible} maxWidth="xs" fullWidth>
        {dialogState.title != "" && (
          <DialogTitle id="dialogTitle">{dialogState.title}</DialogTitle>
        )}
        <DialogContent>
          <Typography sx={{marginBottom: theme.spacing(1)}}>
            {dialogState.text}
          </Typography>
          <TextField
            fullWidth
            autoFocus
            id="userInput"
            name="userInput"
            label={dialogState.singleTextInputProperties?.textInputLabel}
            value={formFields.userInput}
            onChange={onFieldUpdate}
            multiline={
              dialogState.singleTextInputProperties?.textInputMultiline
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onCancelSingleTextInput}
            color="primary"
            variant="outlined"
          >
            {dialogState.buttonTextCancel}
          </Button>
          <Button
            onClick={onOkSingleTextInput}
            color="primary"
            variant="contained"
            disabled={!formFields.userInput}
          >
            {dialogState.buttonTextConfirm}
          </Button>
        </DialogActions>
      </Dialog>)
    ) : dialogState.dialogType == DialogType.ConfirmSecure ? (
      // Löschung bestätigen
      (<Dialog
        open={dialogState.visible}
        onClose={onCancel}
        aria-labelledby="confirm-dialog"
      >
        <DialogTitle
          id="dialogDeletionConfirmation"
          sx={classes.dialogDeletionConfirmationTitle}
        >
          <Box
            component="div"
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <WarningIcon sx={classes.dialogDeletionConfirmationWarningIcon} />
            <span>{dialogState.title}</span>
          </Box>
          <DialogContentText sx={classes.dialogDeletionConfirmationText}>
            {dialogState.subtitle}
          </DialogContentText>
        </DialogTitle>
        <DialogContent>
          {dialogState.text}{" "}
          <strong>
            {dialogState.deletionDialogProperties?.confirmationString}
          </strong>
          <TextField
            error={confirmDeletionValidation.confirmationString.hasError}
            margin="dense"
            id="confirmationString"
            name="confirmationString"
            value={formFields.confirmationString}
            autoFocus
            required
            fullWidth
            onChange={onConfirmDeletionConfirmationStringUpdate}
            variant="outlined"
            placeholder={
              dialogState.deletionDialogProperties?.confirmationString
            }
            type="text"
            helperText={confirmDeletionValidation.confirmationString.errorText}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelConfirmDeletion}>
            {dialogState.buttonTextCancel}
          </Button>
          <Button
            sx={classes.dialogDeletedeleteButton}
            disabled={!formFields.inputMatches}
            onClick={onOkConfirmDeletion}
            variant="contained"
          >
            {dialogState.buttonTextConfirm}
          </Button>
        </DialogActions>
      </Dialog>)
    ) : dialogState.dialogType == DialogType.selectOptions ? (
      <Dialog
        open={dialogState.visible}
        onClose={onCancel}
        aria-labelledby="confirm-dialog"
      >
        <DialogTitle id="confirm-dialog-title">{dialogState.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogState.text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">
            {dialogState.buttonTextCancel}
          </Button>
          {dialogState.options.map((option) => (
            <Button
              key={"button_" + option.key}
              onClick={() => onOptionSelection(option.key)}
              color="primary"
              variant={option.variant ? option.variant : "outlined"}
            >
              {option.text}
            </Button>
          ))}
        </DialogActions>
      </Dialog>
    ) : null
  ) : null;

  return createPortal(component, portalElement!);
};
export default CustomDialog;
