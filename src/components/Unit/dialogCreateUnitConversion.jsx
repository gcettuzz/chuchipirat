import React from "react";
import Grid from "@material-ui/core/Grid";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";

import Autocomplete from "@material-ui/lab/Autocomplete";

import FormControl from "@material-ui/core/FormControl";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import { Alert, AlertTitle } from "@material-ui/lab";

import useStyles from "../../constants/styles";
import UnitConversion from "./unitConversion.class";
import * as TEXT from "../../constants/text";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const UNIT_CONVERSION_ADD_INITIAL_STATE = {
  product: null,
  denominator: "",
  fromUnit: null,
  numerator: "",
  toUnit: null,
};

const UNIT_CONVERSION_VALIDATION_INITIAL_STATE = {
  product: { hasError: false, helperText: "" },
  denominator: { hasError: false, helperText: "" },
  fromUnit: { hasError: false, helperText: "" },
  numerator: { hasError: false, helperText: "" },
  toUnit: { hasError: false, helperText: "" },
};

export const UNIT_CONVERSION_TYPE = {
  BASIC: "basic",
  PRODUCT: "product",
};

/* ===================================================================
// ===================== Pop Up Einheit hinzufügen ===================
// =================================================================== */
const DialogCreateUnitConversion = ({
  firebase,
  units,
  products,
  dialogOpen,
  unitConversionType,
  handleCreate,
  handleClose,
  handleError,
}) => {
  const classes = useStyles();

  const [formFields, setFormFields] = React.useState(
    UNIT_CONVERSION_ADD_INITIAL_STATE
  );
  const [validation, setValidation] = React.useState(
    UNIT_CONVERSION_VALIDATION_INITIAL_STATE
  );

  /* ------------------------------------------
  // Change Ereignis Felder
  // ------------------------------------------ */
  const onChangeField = (event, newValue) => {
    let value;
    let field = event.target.id.split("-")[0];

    switch (field) {
      // Textfield und Autocomplete sind unterschiedlich
      case "product":
      case "fromUnit":
      case "toUnit":
        value = newValue;
        break;
      case "denominator":
      case "numerator":
        value = event.target.value;
        break;
      default:
        return;
    }
    setFormFields({
      ...formFields,
      [field]: value,
    });
  };
  /* ------------------------------------------
  // PopUp Abbrechen
  // ------------------------------------------ */
  const onOkClick = () => {
    // // Neue Einheit anlegen
    if (!isInputValid()) {
      return;
    }
    switch (unitConversionType) {
      case UNIT_CONVERSION_TYPE.BASIC:
        UnitConversion.createUnitConversionBasic(
          firebase,
          formFields.denominator,
          formFields.numerator,
          formFields.fromUnit,
          formFields.toUnit
        )
          .then((result) => {
            handleCreate(result);
            setFormFields(UNIT_CONVERSION_ADD_INITIAL_STATE);
            setValidation(UNIT_CONVERSION_VALIDATION_INITIAL_STATE);
          })
          .catch((error) => {
            console.error(error);
            handleError(error);
          });
        break;
      case UNIT_CONVERSION_TYPE.PRODUCT:
        UnitConversion.createUnitConversionProduct(
          firebase,
          formFields.product,
          formFields.denominator,
          formFields.numerator,
          formFields.fromUnit,
          formFields.toUnit
        )
          .then((result) => {
            handleCreate(result);
            setFormFields(UNIT_CONVERSION_ADD_INITIAL_STATE);
            setValidation(UNIT_CONVERSION_VALIDATION_INITIAL_STATE);
          })
          .catch((error) => {
            console.error(error);
            handleError(error);
          });
        break;
        break;
      default:
        throw new Error(TEXT.DIALOG_ERROR_UNIT_CONVERSION_TYPE_MISSING);
    }
  };
  /* ------------------------------------------
  // Validation
  // ------------------------------------------ */
  const isInputValid = () => {
    let hasError = false;
    let validationCheck = validation;

    // Prüfung ob Werte gesetzt
    if (
      unitConversionType === UNIT_CONVERSION_TYPE.PRODUCT &&
      !formFields.product
    ) {
      validationCheck.product = {
        hasError: true,
        helperText: TEXT.FORM_GIVE_PRODUCT,
      };
      hasError = true;
    } else {
      validationCheck.product = {
        hasError: false,
        helperText: "",
      };
    }
    if (!formFields.denominator || formFields.denominator <= 0) {
      validationCheck.denominator = {
        hasError: true,
        helperText: TEXT.FORM_GIVE_GREATE_ZERO,
      };
      hasError = true;
    } else {
      validationCheck.denominator = {
        hasError: false,
        helperText: "",
      };
    }
    if (!formFields.numerator || formFields.numerator <= 0) {
      validationCheck.numerator = {
        hasError: true,
        helperText: TEXT.FORM_GIVE_GREATE_ZERO,
      };
      hasError = true;
    } else {
      validationCheck.numerator = {
        hasError: false,
        helperText: "",
      };
    }
    if (!formFields.fromUnit) {
      validationCheck.fromUnit = {
        hasError: true,
        helperText: TEXT.FORM_GIVE_UNIT,
      };
      hasError = true;
    } else {
      validationCheck.fromUnit = {
        hasError: false,
        helperText: "",
      };
    }
    if (!formFields.toUnit) {
      validationCheck.toUnit = {
        hasError: true,
        helperText: TEXT.FORM_GIVE_UNIT,
      };
      hasError = true;
    } else {
      validationCheck.toUnit = {
        hasError: false,
        helperText: "",
      };
    }

    setValidation({
      product: validationCheck.product,
      denominator: validationCheck.denominator,
      numerator: validationCheck.numerator,
      fromUnit: validationCheck.fromUnit,
      toUnit: validationCheck.toUnit,
    });

    // Wenn Fehler, ist Input nicht valide
    return !hasError;
  };
  /* ------------------------------------------
  // PopUp Ok
  // ------------------------------------------ */
  const onCancelClick = () => {
    setFormFields(UNIT_CONVERSION_ADD_INITIAL_STATE);
    setValidation(UNIT_CONVERSION_VALIDATION_INITIAL_STATE);
    handleClose();
  };
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialogAddUnitConversion"
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogTitle id="dialogAddProduct">
        {TEXT.DIALOG_TITLE_UNIT_CONVERSION_CREATE}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {TEXT.DIALOG_TEXT_UNIT_CONVERSION_CREATE}
        </DialogContentText>
        {unitConversionType === UNIT_CONVERSION_TYPE.PRODUCT && (
          <Alert severity="info">
            <AlertTitle>
              {TEXT.DIALOG_UNIT_CONVERSION_PRODUCT_ALERT_TITLE}
            </AlertTitle>
            {TEXT.DIALOG_UNIT_CONVERSION_PRODUCT_ALERT_TEXT}
          </Alert>
        )}
        <Grid container spacing={2}>
          {unitConversionType === UNIT_CONVERSION_TYPE.PRODUCT && (
            <Grid item xs={12}>
              <FormControl className={classes.formSelect} margin="normal">
                <Autocomplete
                  id={"product"}
                  value={formFields.product}
                  options={products}
                  autoSelect
                  autoHighlight
                  // getOptionSelected={(unit) =>
                  //   unit === productToAddValues.shoppingUnit
                  // }
                  getOptionLabel={(product) => product.name}
                  onChange={onChangeField}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={TEXT.FIELD_PRODUCT}
                      error={validation.product.hasError}
                      helperText={validation.product.helperText}
                    />
                  )}
                />
              </FormControl>
            </Grid>
          )}
          <Grid item xs={6}>
            <TextField
              error={validation.denominator.hasError}
              margin="dense"
              id="denominator"
              name="denominator"
              value={formFields.denominator}
              required
              onChange={onChangeField}
              label={TEXT.FIELD_DENOMINATOR}
              type="number"
              helperText={validation.denominator.helperText}
              margin="normal"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl className={classes.formSelect} margin="normal">
              <Autocomplete
                id={"fromUnit"}
                value={formFields.fromUnit}
                options={units}
                autoSelect
                autoHighlight
                // getOptionSelected={(unit) =>
                //   unit === productToAddValues.shoppingUnit
                // }
                getOptionLabel={(unit) => unit}
                onChange={onChangeField}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={TEXT.FIELD_UNIT_FROM}
                    error={validation.fromUnit.hasError}
                    helperText={validation.fromUnit.helperText}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              error={validation.numerator.hasError}
              margin="dense"
              id="numerator"
              name="numerator"
              value={formFields.numerator}
              required
              onChange={onChangeField}
              label={TEXT.FIELD_NUMERATOR}
              type="number"
              helperText={validation.numerator.helperText}
              margin="normal"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl className={classes.formSelect} margin="normal">
              <Autocomplete
                id={"toUnit"}
                value={formFields.toUnit}
                options={units}
                autoSelect
                autoHighlight
                // getOptionSelected={(unit) =>
                //   unit === productToAddValues.shoppingUnit
                // }
                getOptionLabel={(unit) => unit}
                onChange={onChangeField}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={TEXT.FIELD_UNIT_TO}
                    error={validation.toUnit.hasError}
                    helperText={validation.toUnit.helperText}

                    // size="small"
                    // margin="normal"
                  />
                )}
              />
            </FormControl>
          </Grid>
        </Grid>
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

export default DialogCreateUnitConversion;
