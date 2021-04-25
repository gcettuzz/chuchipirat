import React from "react";

import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import FormControl from "@material-ui/core/FormControl";

import useStyles from "../../constants/styles";

import * as TEXT from "../../constants/text";

import CustomSnackbar from "../Shared/customSnackbar";

import DialogProduct, {
  PRODUCT_POP_UP_VALUES_INITIAL_STATE,
  PRODUCT_DIALOG_TYPE,
} from "../Product/dialogProduct";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const SHOPPING_LIST_POP_UP_VALUES_INITIAL_STATE = {
  product: { name: "", uid: "" },
  unit: null,
  quantity: "",
};
const DIALOG_VALIDATION = {
  hasError: false,
  errorText: "",
};

export const DIALOG_TYPE = {
  EDIT: "edit",
  ADD: "add",
};

/* ===================================================================
// ===================== Pop Up Produkt hinzufügen ===================
// =================================================================== */
const DialogShoppingListItem = ({
  firebase,
  dialogOpen,
  handleOk,
  handleClose,
  dialogType,
  product,
  quantity,
  unit,
  products = [],
  units = [],
  departments = [],
  handleProductCreate,
}) => {
  const [dialogValues, setDialogValues] = React.useState(
    SHOPPING_LIST_POP_UP_VALUES_INITIAL_STATE
  );
  const [validation, setValidation] = React.useState({
    product: DIALOG_VALIDATION,
    unit: DIALOG_VALIDATION,
    quantity: DIALOG_VALIDATION,
  });

  const [productAddValues, setProductAddValues] = React.useState({
    ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
    ...{ popUpOpen: false },
  });
  const [snackbar, setSnackbar] = React.useState({
    severity: "success",
    message: "",
    open: false,
  });
  const classes = useStyles();
  const filter = createFilterOptions();

  /* ------------------------------------------
  // Change-Handler
  // ------------------------------------------ */
  const onFieldChange = (event, newValue) => {
    let value;
    let field = event.target.id.split("-")[0];

    if (!event.target.id) {
      return;
    }

    if (newValue && newValue.inputValue) {
      // Neues Produkt. PopUp Anzeigen und nicht weiter
      setProductAddValues({
        ...productAddValues,
        productName: newValue.inputValue,
        popUpOpen: true,
      });
      return;
    }

    switch (field) {
      case "quantity":
        value = event.target.value;
        break;
      case "unit":
        value = newValue;
        break;
      case "product":
        // Nur Produkte, die wir kennen (und somit eine UID haben)
        if (!newValue || !newValue.uid) {
          return;
        }
        value = { uid: newValue.uid, name: newValue.name };
        break;
    }

    setDialogValues({
      ...dialogValues,
      [field]: value,
    });
    // }
  };
  /* ------------------------------------------
  // PopUp Ok
  // ------------------------------------------ */
  const onOkClick = () => {
    // Prüfung der Werte

    let hasError = false;

    let product = DIALOG_VALIDATION;
    // let unit = DIALOG_VALIDATION;
    // let quantity = DIALOG_VALIDATION;

    if (!dialogValues.product.uid) {
      hasError = true;
      product = {
        hasError: true,
        errorText: TEXT.ERROR_ADD_ITEM_PRODUCT_UNKNOWN,
      };
    }
    // if (!dialogValues.unit) {
    //   hasError = true;
    //   unit = {
    //     hasError: true,
    //     errorText: TEXT.WE_NEED_THIS_VALUE,
    //   };
    // }
    // if (!dialogValues.quantity) {
    //   hasError = true;
    //   quantity = {
    //     hasError: true,
    //     errorText: TEXT.WE_NEED_THIS_VALUE,
    //   };
    // }

    setValidation({
      product: product,
      //  unit: unit,
      //  quantity: quantity,
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

  /* ------------------------------------------
  // PopUp Produkt Hinzufügen - onCreate
  // ------------------------------------------ */
  const onPopUpAddProductOk = (productToAdd, newUid) => {
    let newProduct = {
      departmentName: productToAdd.department.name,
      departmentUid: productToAdd.department.uid,
      name: productToAdd.name,
      shoppingUnit: productToAdd.shoppingUnit,
      uid: newUid,
      usable: true,
    };

    setSnackbar({
      severity: "success",
      message: TEXT.PRODUCT_CREATED(newProduct.name),
      open: true,
    });

    setDialogValues({
      ...dialogValues,
      product: { name: newProduct.name, uid: newProduct.uid },
      unit: newProduct.shoppingUnit,
    });

    //neues Produkt in aufrufende Komponente pushen
    handleProductCreate(newProduct);

    setProductAddValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  /* ------------------------------------------
  // PopUp Produkt Hinzufügen - onClose
  // ------------------------------------------ */
  const onPopUpAddProductCancel = () => {
    setDialogValues({
      ...dialogValues,
      product: SHOPPING_LIST_POP_UP_VALUES_INITIAL_STATE.product,
    });
    setProductAddValues({ ...productAddValues, popUpOpen: false });
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({
      severity: "success",
      message: "",
      open: false,
    });
  };

  // Werte setzen, wenn das erste Mal PopUp geöffnet wird
  if (!dialogValues.product?.name && product?.name) {
    setDialogValues({
      product: product,
      quantity: quantity,
      unit: unit ? unit : null,
    });
  }

  return (
    <React.Fragment>
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth={"sm"}
        fullWidth
        aria-labelledby="Dialog Produkt zu Postizettel hinzufügen"
      >
        <DialogTitle id="dialogAddProduct">
          {dialogType === DIALOG_TYPE.ADD
            ? TEXT.DIALOG_TITLE_SHOPPING_LIST_ADD_ITEM
            : TEXT.DIALOG_TITLE_SHOPPING_LIST_EDIT_ITEM}
        </DialogTitle>
        <DialogContent>
          <List>
            {/* Produkt */}

            <Autocomplete
              id={"product"}
              key={"product"}
              value={dialogValues.product.name}
              options={products}
              disabled={dialogType === DIALOG_TYPE.EDIT}
              autoSelect
              autoHighlight
              getOptionSelected={(product) =>
                product.name === dialogValues.product?.name
              }
              getOptionLabel={(option) => {
                //e.g value selected with enter, right from the input
                if (typeof option === "string") {
                  return option;
                }
                if (option.inputValue) {
                  return option.inputValue;
                }
                return option.name;
              }}
              onChange={onFieldChange}
              fullWidth
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                if (params.inputValue !== "") {
                  filtered.push({
                    inputValue: params.inputValue,
                    name: `"${params.inputValue}" ${TEXT.ADD}`,
                  });
                }
                return filtered;
              }}
              renderOption={(option) => option.name}
              freeSolo
              renderInput={(params) => (
                <TextField
                  error={validation.product.hasError}
                  autoFocus
                  {...params}
                  label={TEXT.FIELD_PRODUCT}
                  size="small"
                  helperText={validation.product.errorText}
                />
              )}
            />
            {/* Menge */}
            <ListItem className={classes.formListItem}>
              <TextField
                // error={validation.quantity.hasError}
                margin="dense"
                type="number"
                id={"quantity"}
                key={"quantity"}
                label={TEXT.FIELD_QUANTITY}
                name={"quantity"}
                value={dialogValues.quantity}
                // size="small"
                fullWidth
                onChange={onFieldChange}
                // helperText={validation.quantity.errorText}
              />
            </ListItem>
            {/* Einheit */}
            <ListItem className={classes.formListItem}>
              <FormControl fullWidth>
                {/* <FormControl fullWidth error={validation.unit.hasError}> */}
                <Autocomplete
                  id={"unit"}
                  value={dialogValues.unit}
                  options={units}
                  autoSelect
                  autoHighlight
                  // getOptionSelected={(unit) =>
                  //   unit === productPopUpValues.shoppingUnit
                  // }
                  getOptionLabel={(unit) => unit}
                  onChange={onFieldChange}
                  noOptionsText={TEXT.ERROR_NO_MATCHING_UNIT_FOUND}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={TEXT.FIELD_UNIT}
                      size="small"
                    />
                  )}
                />
                {/* <FormHelperText>{validation.unit.errorText}</FormHelperText> */}
              </FormControl>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelClick} color="primary" variant="outlined">
            {TEXT.BUTTON_CANCEL}
          </Button>
          <Button onClick={onOkClick} color="primary" variant="contained">
            {dialogType === DIALOG_TYPE.ADD
              ? TEXT.BUTTON_ADD
              : TEXT.BUTTON_CHANGE}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Neues Produkt hinzufügen PopUp */}
      <DialogProduct
        firebase={firebase}
        productName={productAddValues.productName}
        dialogType={PRODUCT_DIALOG_TYPE.CREATE}
        dialogOpen={productAddValues.popUpOpen}
        handleOk={onPopUpAddProductOk}
        handleClose={onPopUpAddProductCancel}
        units={units}
        departments={departments}
      />
      <CustomSnackbar
        message={snackbar.message}
        severity={snackbar.severity}
        snackbarOpen={snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};

export default DialogShoppingListItem;
