import React from "react";

import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import { Alert, AlertTitle } from "@material-ui/lab";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";

import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";

import useStyles from "../../constants/styles";

import * as TEXT from "../../constants/text";
import { Typography } from "@material-ui/core";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
export const SHOPPING_LIST_POP_UP_VALUES_INITIAL_STATE = {
  dateFrom: "",
  dateTo: "",
  mealFrom: "",
  mealTo: "",
  convertUnits: false,
};
const DIALOG_VALIDATION = {
  hasError: false,
  errorText: "",
};
/* ===================================================================
// ===================== Pop Up Produkt hinzufügen ===================
// =================================================================== */
const DialogGenerateShoppingList = ({
  // firebase,
  dialogOpen,
  handleOk,
  handleClose,
  dates = [],
  meals = [],
}) => {
  const [dialogValues, setDialogValues] = React.useState(
    SHOPPING_LIST_POP_UP_VALUES_INITIAL_STATE
  );
  const [validation, setValidation] = React.useState({
    dateFrom: DIALOG_VALIDATION,
    dateTo: DIALOG_VALIDATION,
    mealFrom: DIALOG_VALIDATION,
    mealTo: DIALOG_VALIDATION,
    general: DIALOG_VALIDATION,
  });
  const classes = useStyles();
  /* ------------------------------------------
  // Change-Handler
  // ------------------------------------------ */
  const onFieldChange = (event) => {
    let value;

    switch (event.target.name) {
      case "convertUnits":
        value = event.target.checked;
        break;
      default:
        value = event.target.value;
    }

    setDialogValues({
      ...dialogValues,
      [event.target.name]: value,
    });
    // }
  };
  /* ------------------------------------------
  // PopUp Ok
  // ------------------------------------------ */
  const onOkClick = () => {
    // Prüfung der Werte

    let hasError = false;

    let dateFrom = DIALOG_VALIDATION;
    let dateTo = DIALOG_VALIDATION;
    let mealFrom = DIALOG_VALIDATION;
    let mealTo = DIALOG_VALIDATION;
    let general = DIALOG_VALIDATION;

    if (!dialogValues.dateFrom) {
      hasError = true;
      dateFrom = {
        hasError: true,
        errorText: TEXT.WE_NEED_THIS_VALUE,
      };
    }
    if (!dialogValues.mealFrom) {
      hasError = true;
      mealFrom = {
        hasError: true,
        errorText: TEXT.WE_NEED_THIS_VALUE,
      };
    }
    if (!dialogValues.dateTo) {
      hasError = true;
      dateTo = {
        hasError: true,
        errorText: TEXT.WE_NEED_THIS_VALUE,
      };
    }
    if (!dialogValues.mealTo) {
      hasError = true;
      mealTo = {
        hasError: true,
        errorText: TEXT.WE_NEED_THIS_VALUE,
      };
    }

    // Prüfen ob Bis Zeitpunkt kleiner Von Zeitpunkt
    if (dialogValues?.dateFrom > dialogValues?.dateTo) {
      hasError = true;
      general = {
        hasError: true,
        errorText: TEXT.FORM_DATE_TO_LOWER_THAN_DATE_FROM,
      };
    } else if (
      dialogValues?.dateFrom === dialogValues?.dateTo &&
      dialogValues.mealFrom?.pos > dialogValues.mealTo?.pos
    ) {
      // Prüfen ob bei gleichem Tag ob die Mahlzeitreihenfloge stimmt
      hasError = true;
      general = {
        hasError: true,
        errorText: TEXT.FORM_MEAL_TO_LOWER_THAN_MEAL_TO,
      };
    }

    setValidation({
      dateFrom: dateFrom,
      dateTo: dateTo,
      mealFrom: mealFrom,
      mealTo: mealTo,
      general: general,
    });

    if (hasError) {
      return;
    }

    handleOk(dialogValues);
    setDialogValues(SHOPPING_LIST_POP_UP_VALUES_INITIAL_STATE);
  };
  /* ------------------------------------------
  // PopUp Abbrechen
  // ------------------------------------------ */
  const onCancelClick = () => {
    handleClose();
    setDialogValues(SHOPPING_LIST_POP_UP_VALUES_INITIAL_STATE);
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      maxWidth={"sm"}
      fullWidth
      aria-labelledby="Dialog Postizettel generieren"
    >
      <DialogTitle id="dialogAddProduct">
        {TEXT.DIALOG_TITLE_GENERATE_SHOPPING_LIST}
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning">
          <AlertTitle>{TEXT.ATTENTION}</AlertTitle>
          {TEXT.SHOPPING_LIST_WARNING_EXISTING_WILL_BE_OVERWRITEN}
        </Alert>
        <List>
          {/* Tag von */}
          <ListItem className={classes.formListItem}>
            <FormControl fullWidth error={validation.dateFrom.hasError}>
              <InputLabel id="label_date_from" required>
                {TEXT.FIELD_DAY_FROM}
              </InputLabel>
              <Select
                id="dateFrom"
                name="dateFrom"
                value={dialogValues.dateFrom}
                onChange={onFieldChange}
                label={TEXT.FIELD_DAY_FROM}
                autoFocus
                required
              >
                {dates.map((date) => (
                  <MenuItem value={date} key={"selectdate_" + date}>
                    {date.toLocaleString("de-CH", { weekday: "long" }) +
                      ", " +
                      date.toLocaleString("de-CH", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validation.dateFrom.errorText}</FormHelperText>
            </FormControl>
          </ListItem>
          {/* Mahlzeit von */}
          <ListItem className={classes.formListItem}>
            <FormControl fullWidth error={validation.mealFrom.hasError}>
              <InputLabel id="label_meal_from" required>
                {TEXT.FIELD_MEAL_FROM}
              </InputLabel>
              <Select
                id="mealFrom"
                name="mealFrom"
                value={dialogValues.mealFrom}
                onChange={onFieldChange}
                label={TEXT.FIELD_MEAL}
                required
              >
                {meals.map((meal) => (
                  <MenuItem value={meal} key={"selectMeal_" + meal.uid}>
                    {meal.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validation.mealFrom.errorText}</FormHelperText>
            </FormControl>
          </ListItem>
          {/* Tag Bis */}
          <ListItem className={classes.formListItem}>
            <FormControl fullWidth error={validation.dateTo.hasError}>
              <InputLabel id="label_meal_to" required>
                {TEXT.FIELD_DAY_TO}
              </InputLabel>
              <Select
                id="dateTo"
                name="dateTo"
                value={dialogValues.dateTo}
                onChange={onFieldChange}
                label={TEXT.FIELD_DAY_TO}
                required
              >
                {dates.map((date) => (
                  <MenuItem value={date} key={"selectdate_" + date}>
                    {date.toLocaleString("de-CH", { weekday: "long" }) +
                      ", " +
                      date.toLocaleString("de-CH", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validation.dateTo.errorText}</FormHelperText>
            </FormControl>
          </ListItem>

          <ListItem className={classes.formListItem}>
            <FormControl fullWidth error={validation.mealTo.hasError}>
              <InputLabel id="label_meal_to" required>
                {TEXT.FIELD_MEAL_TO}
              </InputLabel>
              <Select
                id="mealTo"
                name="mealTo"
                value={dialogValues.mealTo}
                onChange={onFieldChange}
                label={TEXT.FIELD_MEAL_TO}
                required
              >
                {meals.map((meal) => (
                  <MenuItem value={meal} key={"selectMeal_" + meal.uid}>
                    {meal.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validation.mealTo.errorText}</FormHelperText>
            </FormControl>
          </ListItem>
          <ListItem className={classes.formListItem}>
            <ListItemText
              id="switch-show-convert-units"
              primary={TEXT.FIELD_CONVERT_UNITS}
            />
            <ListItemSecondaryAction>
              <Switch
                checked={dialogValues.convertUnits}
                onChange={onFieldChange}
                color="primary"
                name="convertUnits"
              />
            </ListItemSecondaryAction>
          </ListItem>
          {validation.general.hasError && (
            <ListItem className={classes.formListItem}>
              <ListItemText>
                <Typography color="error">
                  {validation.general.errorText}
                </Typography>
              </ListItemText>
            </ListItem>
          )}
        </List>
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

export default DialogGenerateShoppingList;
