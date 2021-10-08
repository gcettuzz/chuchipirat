import React from "react";
import Grid from "@material-ui/core/Grid";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import { Alert, AlertTitle } from "@material-ui/lab";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Checkbox from "@material-ui/core/Checkbox";

import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { withFirebase } from "../Firebase";
import Product from "./product.class";
import AlertMessage from "../Shared/AlertMessage";
import * as TEXT from "../../constants/text";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
export const PRODUCT_POP_UP_VALUES_INITIAL_STATE = {
  uid: "",
  name: "",
  department: null,
  shoppingUnit: null,
  usable: true,
};

export const PRODUCT_DIALOG_TYPE = {
  CREATE: "create",
  EDIT: "edit",
};

/* ===================================================================
// ===================== Pop Up Produkt hinzufügen ===================
// =================================================================== */
const DialogProduct = ({
  firebase,
  dialogType,
  productName = "",
  productUid = "",
  products = [],
  dialogOpen,
  handleOk,
  handleClose,
  selectedDepartment = null,
  selectedUnit = null,
  usable = true,
  departments = [],
  units = [],
}) => {
  const [productPopUpValues, setProductPopUpValues] = React.useState(
    PRODUCT_POP_UP_VALUES_INITIAL_STATE
  );
  const [validation, setValidation] = React.useState({
    name: { hasError: false, errorText: "" },
    department: { hasError: false, errorText: "" },
  });
  // const [units, setUnits] = React.useState([]);
  // const [departments, setDepartments] = React.useState([]);
  // const [department] = React.useState();
  // const [shoppingUnit] = React.useState();
  /* ------------------------------------------
  // Change Ereignis Felder
  // ------------------------------------------ */
  const onChangeField = (event, newValue, action, objectId) => {
    let value;
    let field;

    if (event.target.id) {
      field = event.target.id.split("-")[0];
    } else {
      field = objectId;
    }

    switch (field) {
      case "shoppingUnit":
        value = newValue;
        break;
      case "department":
        value = newValue;
        break;
      case "name":
        value = event.target.value;
        // productName = event.target.value;
        break;
      case "usable":
        value = event.target.checked;
        break;
      default:
        return;
    }

    setProductPopUpValues({
      ...productPopUpValues,
      [field]: value,
      clear: false,
    });
  };
  /* ------------------------------------------
  // PopUp Abbrechen
  // ------------------------------------------ */
  const onCancelClick = () => {
    setProductPopUpValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
    });
    handleClose();
  };
  /* ------------------------------------------
  // PopUp Ok - schliessen
  // ------------------------------------------ */
  const onOkClick = () => {
    // Prüfung Abteilung und Name gesetzt

    let hasError = false;
    let newUid = "";
    let product = null;

    if (!productPopUpValues.name) {
      setValidation({
        ...validation,
        name: { hasError: true, errorText: TEXT.FORM_GIVE_PRODUCT },
      });
      hasError = true;
    }
    if (!productPopUpValues.department) {
      setValidation({
        ...validation,
        department: {
          hasError: true,
          errorText: TEXT.FORM_GIVE_DEPARTMENT,
        },
      });
      hasError = true;
    }
    if (
      // Nur wenn keine UID
      !productPopUpValues.uid &&
      products.find(
        (product) =>
          product.name.toLowerCase() ===
          productPopUpValues.name.toLowerCase().trim()
      ) !== undefined
    ) {
      // Ein Produkt mit diesem Namen besteht schon. --> Abbruch
      setValidation({
        ...validation,
        name: {
          hasError: true,
          errorText: TEXT.ERROR_PRODUCT_WITH_THIS_NAME_ALREADY_EXISTS,
        },
      });
      hasError = true;
    }
    if (hasError) {
      return;
    }

    switch (dialogType) {
      case PRODUCT_DIALOG_TYPE.CREATE:
        //Neues Produkt anlegen
        Product.createProduct({
          firebase: firebase,
          name: productPopUpValues.name,
          departmentUid: productPopUpValues.department.uid,
          shoppingUnit: productPopUpValues.shoppingUnit,
        }).then((result) => {
          setProductPopUpValues({ ...productPopUpValues, uid: result.uid });
          handleOk(productPopUpValues, result);

          setProductPopUpValues({
            ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
            clear: true,
          });
        });
        break;
      case PRODUCT_DIALOG_TYPE.EDIT:
        // Produkt ändern
        Product.editProduct({
          firebase: firebase,
          uid: productPopUpValues.uid,
          name: productPopUpValues.name,
          departmentUid: productPopUpValues.department.uid,
          shoppingUnit: productPopUpValues.shoppingUnit,
          usable: productPopUpValues.usable,
          runCloudFunction: Boolean(productPopUpValues.name != productName),
        }).then((result) => {
          setProductPopUpValues({ ...productPopUpValues, uid: result.uid });
          handleOk(productPopUpValues, result);

          setProductPopUpValues({
            ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
            clear: true,
          });
        });
    }
  };

  // Werte setzen, wenn das erste Mal PopUp geöffnet wird
  if (!productPopUpValues.name && productName) {
    setProductPopUpValues({
      uid: productUid,
      name: productName.trim(),
      department: selectedDepartment,
      shoppingUnit: selectedUnit,
      usable: usable,
    });
  }
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialogAddProduct"
      disableBackdropClick
    >
      <DialogTitle id="dialogAddProduct">
        {dialogType === PRODUCT_DIALOG_TYPE.CREATE
          ? TEXT.DIALOG_TITLE_PRODUCT_ADD
          : TEXT.DIALOG_TITLE_PRODUCT_EDIT}
      </DialogTitle>

      <DialogContent>
        <Alert severity="info">
          {/* <AlertTitle>{TEXT.ATTENTION}</AlertTitle> */}
          {TEXT.DIALOG_ALERT_TEXT_ADD_PRODUCT}
        </Alert>
        <br />
        <DialogContentText>
          {dialogType === PRODUCT_DIALOG_TYPE.CREATE &&
            TEXT.DIALOG_TEXT_PRODUCT}
        </DialogContentText>
        {dialogType === PRODUCT_DIALOG_TYPE.EDIT && (
          <AlertMessage
            severity="warning"
            messageTitle={TEXT.ATTENTION}
            body={
              <React.Fragment>
                {TEXT.DIALOG_WARNING_PRODUCT_1}
                <strong>{TEXT.DIALOG_WARNING_PRODUCT_2}</strong>
                {TEXT.DIALOG_WARNING_PRODUCT_3}
              </React.Fragment>
            }
          />
        )}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              error={validation.name.hasError}
              margin="dense"
              id="name"
              name="name"
              value={productPopUpValues.name}
              required
              fullWidth
              onChange={onChangeField}
              label={TEXT.FIELD_PRODUCT}
              type="text"
              helperText={validation.name.errorText}
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Autocomplete
                id={"department"}
                value={productPopUpValues.department}
                options={departments}
                autoSelect
                autoHighlight
                // getOptionSelected={(department) =>
                //   department.uid === selectedDepartmentUid
                // }
                getOptionLabel={(department) => department.name}
                onChange={(event, newValue, action) => {
                  onChangeField(event, newValue, action, "department");
                }}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    error={validation.department.hasError}
                    {...params}
                    required
                    label={TEXT.FIELD_DEPARTMENT}
                    size="small"
                    helperText={validation.department.errorText}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={dialogType === PRODUCT_DIALOG_TYPE.EDIT ? 6 : 12}>
            <FormControl fullWidth>
              <Autocomplete
                id={"shoppingUnit"}
                value={productPopUpValues.shoppingUnit}
                options={units}
                autoSelect
                autoHighlight
                // getOptionSelected={(unit) =>
                //   unit === productPopUpValues.shoppingUnit
                // }
                getOptionLabel={(unit) => unit}
                onChange={(event, newValue, action) => {
                  onChangeField(event, newValue, action, "shoppingUnit");
                }}
                noOptionsText={TEXT.ERROR_NO_MATCHING_UNIT_FOUND}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={TEXT.FIELD_SHOPPING_UNIT}
                    size="small"
                  />
                )}
              />
              <FormHelperText>{TEXT.DIALOG_SHOPPING_UNIT_INFO}</FormHelperText>
            </FormControl>
          </Grid>
          {dialogType === PRODUCT_DIALOG_TYPE.EDIT && (
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="usable"
                    checked={productPopUpValues.usable}
                    onChange={onChangeField}
                    name="usable"
                    color="primary"
                  />
                }
                label={TEXT.FIELD_USABLE}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick} color="primary" variant="outlined">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button onClick={onOkClick} color="primary" variant="contained">
          {dialogType === PRODUCT_DIALOG_TYPE.CREATE
            ? TEXT.BUTTON_CREATE
            : TEXT.BUTTON_SAVE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default withFirebase(DialogProduct);
