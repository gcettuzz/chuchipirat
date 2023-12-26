import React from "react";
import Grid from "@material-ui/core/Grid";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import {Alert} from "@material-ui/lab";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Checkbox from "@material-ui/core/Checkbox";

import {
  FormControl,
  FormLabel,
  FormGroup,
  RadioGroup,
  Radio,
} from "@material-ui/core";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import Firebase, {withFirebase} from "../Firebase";
import Product, {Allergen, Diet, DietProperties} from "./product.class";
import AlertMessage from "../Shared/AlertMessage";
import * as TEXT from "../../constants/text";
import Department from "../Department/department.class";
import Unit from "../Unit/unit.class";
import AuthUser from "../Firebase/Authentication/authUser.class";
import UnitAutocomplete from "../Unit/unitAutocomplete";
import {PRODUCTS as ROUTE_PRODUCTS} from "../../constants/routes";
import Utils from "../Shared/utils.class";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
export const PRODUCT_POP_UP_VALUES_INITIAL_STATE = {
  uid: "",
  name: "",
  department: new Department(),
  shoppingUnit: new Unit("", ""),
  dietProperties: {
    allergens: {containsLactose: false, containsGluten: false},
    diet: Diet.Meat,
  },
  usable: true,
  clear: false,
  showNameWarning: false,
  roundtripDone: false,
};

export enum ProductDialog {
  CREATE = "create",
  EDIT = "edit",
}
export const PRODUCT_DIALOG_TYPE = {
  CREATE: "create",
  EDIT: "edit",
};
/* ===================================================================
// ===================== Pop Up Produkt hinzufügen ===================
// =================================================================== */

interface DialogProductProps {
  firebase?: Firebase;
  dialogType: ProductDialog;
  productName: Product["name"];
  productUid: Product["uid"];
  productDietProperties: Product["dietProperties"];
  products: Product[];
  dialogOpen: boolean;
  handleOk: (product: Product) => void;
  handleClose: () => void;
  selectedDepartment: Department;
  selectedUnit: Unit;
  usable: boolean;
  departments: Department[];
  units: Unit[];
  authUser: AuthUser;
}

const DialogProduct = ({
  firebase,
  dialogType,
  productName = "",
  productUid = "",
  productDietProperties,
  products = [],
  dialogOpen,
  handleOk,
  handleClose,
  selectedDepartment = {} as Department,
  selectedUnit = {key: "", name: ""},
  usable = true,
  departments = [],
  units = [],
  authUser,
}: DialogProductProps) => {
  const [productPopUpValues, setProductPopUpValues] = React.useState(
    PRODUCT_POP_UP_VALUES_INITIAL_STATE
  );
  const [validation, setValidation] = React.useState({
    name: {hasError: false, errorText: ""},
    department: {hasError: false, errorText: ""},
  });

  /* ------------------------------------------
  // Change Ereignis Felder
  // ------------------------------------------ */
  const onChangeField = (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: any,
    action?: string,
    objectId?: string
  ) => {
    console.warn(event.target.id, newValue, action, objectId);
    let value: string | Object;
    let field: string;

    if (event.target.id) {
      field = event.target.id.split("-")[0];
    } else {
      objectId ? (field = objectId) : (field = "");
    }

    console.log(field, newValue);

    switch (field) {
      case "unit_shoppingUnit":
        value = newValue;
        field = "shoppingUnit";
        break;
      case "department":
        value = newValue;
        break;
      case "name":
        value = event.target.value;
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
      // Warnung anzeigen falls der Name geändert wird
      showNameWarning: field == "name",
      roundtripDone: true,
    });
  };
  const onChangeDietCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    let dietProperties = productPopUpValues.dietProperties;

    switch (event.target.id) {
      case "dietProperties.allergens.containsLactose":
        dietProperties.allergens.containsLactose = event.target.checked;
        break;
      case "dietProperties.allergens.containsGluten":
        dietProperties.allergens.containsGluten = event.target.checked;
        break;
    }

    setProductPopUpValues({
      ...productPopUpValues,
      dietProperties: dietProperties,
    });
  };
  const onChangeDietRadioButton = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let dietProperties = productPopUpValues.dietProperties;

    dietProperties.diet = parseInt(event.target.value);

    setProductPopUpValues({
      ...productPopUpValues,
      dietProperties: dietProperties,
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

    if (!productPopUpValues.name) {
      setValidation({
        ...validation,
        name: {hasError: true, errorText: TEXT.GIVE_PRODUCT},
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
        if (!firebase) {
          // Firebase fehlt
          throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
        }
        //Neues Produkt anlegen
        Product.createProduct({
          firebase: firebase,
          name: productPopUpValues.name,
          departmentUid: productPopUpValues?.department?.uid,
          shoppingUnit: productPopUpValues?.shoppingUnit?.key,
          authUser: authUser,
        }).then((result) => {
          setProductPopUpValues({...productPopUpValues, uid: result.uid});

          setProductPopUpValues({
            ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
            clear: true,
          });
          handleOk(result);
        });
        break;
      case PRODUCT_DIALOG_TYPE.EDIT:
        // PopUp Werte aufbereiten für aufrufende Komponente
        let product = new Product();

        product.uid = productPopUpValues.uid;
        product.name = productPopUpValues.name;
        product.department = productPopUpValues.department;
        product.shoppingUnit = productPopUpValues.shoppingUnit.key;
        product.usable = productPopUpValues.usable;
        product.dietProperties.diet = productPopUpValues.dietProperties.diet;
        if (productPopUpValues.dietProperties.allergens.containsLactose) {
          product.dietProperties.allergens.push(Allergen.Lactose);
        }
        if (productPopUpValues.dietProperties.allergens.containsGluten) {
          product.dietProperties.allergens.push(Allergen.Gluten);
        }
        handleOk(product);
        setProductPopUpValues({
          ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
          clear: true,
        });
    }
  };
  /* ------------------------------------------
  // PopUp Ok - schliessen
  // ------------------------------------------ */
  const onClose = (event: object, reason: string) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      handleClose();
    }
  };

  // Werte setzen, wenn das erste Mal PopUp geöffnet wird
  if (
    !productPopUpValues.name &&
    productName &&
    !productPopUpValues.roundtripDone
  ) {
    setProductPopUpValues({
      ...productPopUpValues,
      uid: productUid,
      name: productName.trim(),
      department: selectedDepartment,
      shoppingUnit: selectedUnit,
      dietProperties: {
        allergens: {
          containsGluten: productDietProperties?.allergens.includes(
            Allergen.Gluten
          ),
          containsLactose: productDietProperties?.allergens.includes(
            Allergen.Lactose
          ),
        },
        diet: productDietProperties?.diet
          ? productDietProperties.diet
          : Diet.Meat,
      },
      usable: usable,
    });
  }

  return (
    <Dialog
      open={dialogOpen}
      onClose={onClose}
      aria-labelledby="dialogAddProduct"
      maxWidth="sm"
    >
      <DialogTitle id="dialogAddProduct">
        {dialogType === PRODUCT_DIALOG_TYPE.CREATE
          ? TEXT.DIALOG_TITLE_PRODUCT_ADD
          : TEXT.DIALOG_TITLE_PRODUCT_EDIT}
      </DialogTitle>

      <DialogContent>
        <Alert severity="info">{TEXT.DIALOG_ALERT_TEXT_ADD_PRODUCT}</Alert>
        <br />
        <DialogContentText>
          {dialogType === PRODUCT_DIALOG_TYPE.CREATE &&
            TEXT.DIALOG_TEXT_PRODUCT}
        </DialogContentText>
        {dialogType === PRODUCT_DIALOG_TYPE.EDIT &&
          productPopUpValues.showNameWarning && (
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
                  onChangeField(
                    event as React.ChangeEvent<HTMLInputElement>,
                    newValue,
                    action,
                    "department"
                  );
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
              <UnitAutocomplete
                componentKey={"shoppingUnit"}
                unitKey={productPopUpValues.shoppingUnit.key}
                units={units}
                onChange={onChangeField}
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
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <FormLabel component="legend">{TEXT.INTOLERANCES}</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        productPopUpValues.dietProperties.allergens
                          .containsLactose
                      }
                      onChange={onChangeDietCheckbox}
                      name="dietProperties.allergens.containsLactose"
                      id="dietProperties.allergens.containsLactose"
                      color="primary"
                    />
                  }
                  label={TEXT.HAS_LACTOSE}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        productPopUpValues.dietProperties.allergens
                          .containsGluten
                      }
                      onChange={onChangeDietCheckbox}
                      name="dietProperties.allergens.containsGluten"
                      id="dietProperties.allergens.containsGluten"
                      color="primary"
                    />
                  }
                  label={TEXT.HAS_GLUTEN}
                />
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <FormGroup>
                <FormLabel component="legend">{TEXT.PRODUCT_PROPERY}</FormLabel>
                <RadioGroup
                  aria-label="Diät"
                  name={"radioGroup_Diet"}
                  key={"radioGroup_Diet"}
                  value={productPopUpValues.dietProperties.diet}
                  onChange={onChangeDietRadioButton}
                >
                  <FormControlLabel
                    value={Diet.Meat}
                    control={<Radio size="small" color="primary" />}
                    label={TEXT.IS_MEAT}
                  />
                  <FormControlLabel
                    value={Diet.Vegetarian}
                    control={<Radio size="small" color="primary" />}
                    label={TEXT.IS_VEGETARIAN}
                  />
                  <FormControlLabel
                    value={Diet.Vegan}
                    control={<Radio size="small" color="primary" />}
                    label={TEXT.IS_VEGAN}
                  />
                </RadioGroup>
              </FormGroup>
            </FormControl>
          </Grid>
          {dialogType === ProductDialog.CREATE && (
            <Grid item xs={12}>
              <FormHelperText>
                {TEXT.DIALOG_INFO_DIET_PROPERTIES}
              </FormHelperText>
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
            : TEXT.BUTTON_OK}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default withFirebase(DialogProduct);
