import React from "react";

import Grid from "@mui/material/Grid";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import {Alert, AlertTitle} from "@mui/lab";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";

import {
  FormControl,
  FormLabel,
  FormGroup,
  RadioGroup,
  Radio,
  ListItem,
  List,
  Typography,
} from "@mui/material";
import FormHelperText from "@mui/material/FormHelperText";
import FormControlLabel from "@mui/material/FormControlLabel";

import Product, {Allergen, Diet} from "./product.class";
import AlertMessage from "../Shared/AlertMessage";
import {
  GIVE_PRODUCT as TEXT_GIVE_PRODUCT,
  GIVE_DEPARTMENT as TEXT_GIVE_DEPARTMENT,
  ERROR_PRODUCT_WITH_THIS_NAME_ALREADY_EXISTS as TEXT_ERROR_PRODUCT_WITH_THIS_NAME_ALREADY_EXISTS,
  ERROR_PARAMETER_NOT_PASSED as TEXT_ERROR_PARAMETER_NOT_PASSED,
  PRODUCT_ADD as TEXT_PRODUCT_ADD,
  PRODUCT_EDIT as TEXT_PRODUCT_EDIT,
  PRODUCT as TEXT_PRODUCT,
  ATTENTION as TEXT_ATTENTION,
  WARNING_PRODUCT_1 as TEXT_WARNING_PRODUCT_1,
  WARNING_PRODUCT_2 as TEXT_WARNING_PRODUCT_2,
  WARNING_PRODUCT_3 as TEXT_WARNING_PRODUCT_3,
  SHOPPING_UNIT_INFO as TEXT_SHOPPING_UNIT_INFO,
  USABLE as TEXT_USABLE,
  INTOLERANCES as TEXT_INTOLERANCES,
  HAS_LACTOSE as TEXT_HAS_LACTOSE,
  HAS_GLUTEN as TEXT_HAS_GLUTEN,
  PRODUCT_PROPERTY as TEXT_PRODUCT_PROPERTY,
  // RECORD_INGREDIENT_WITH_NECCESSARY_INFO as TEXT_RECORD_INGREDIENT_WITH_NECCESSARY_INFO,
  IS_MEAT as TEXT_IS_MEAT,
  IS_VEGETARIAN as TEXT_IS_VEGETARIAN,
  IS_VEGAN as TEXT_IS_VEGAN,
  DIALOG_INFO_DIET_PROPERTIES as TEXT_INFO_DIET_PROPERTIES,
  CANCEL as TEXT_CANCEL,
  OK as TEXT_OK,
  CREATE as TEXT_CREATE,
  GUIDELINES_NEW_PRODUCT as TEXT_GUIDELINES_NEW_PRODUCT,
  NEW_PRODUCT as TEXT_NEW_PRODUCT,
  SIMILAR_PRODUCTS as TEXT_SIMILAR_PRODUCTS,
  EXISTING_PRODUCTS as TEXT_EXISTING_PRODUCTS,
  THERE_ARE_SIMILAR_PRODUCTS as TEXT_THERE_ARE_SIMILAR_PRODUCTS,
} from "../../constants/text";
import Department from "../Department/department.class";
import Unit, {UnitDimension} from "../Unit/unit.class";
import AuthUser from "../Firebase/Authentication/authUser.class";
import UnitAutocomplete from "../Unit/unitAutocomplete";

import Firebase from "../Firebase/firebase.class";
import {ValueObject} from "../Firebase/Db/firebase.db.super.class";
import DepartmentAutocomplete from "../Department/departmentAutocomplete";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
export const PRODUCT_POP_UP_VALUES_INITIAL_STATE = {
  uid: "",
  name: "",
  shoppingUnit: new Unit({key: "", name: ""}),
  department: new Department(),
  dietProperties: {
    allergens: [] as Allergen[],
    diet: Diet.Meat,
  },
  usable: true,
  clear: false,
  showNameWarning: false,
  roundtripDone: false,
};
export const SIMILIAR_PRODCTUS_POP_UP_VALUES_INITIAL_STATE = {
  similarProducts: [] as Product[],
  popUpOpen: false,
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
  // Muss nicht übergeben werden, da diese vom Export (ganz unten) versorgt wird
  firebase?: Firebase;
  dialogType: ProductDialog;
  productName: Product["name"];
  productUid: Product["uid"];
  productDietProperties: Product["dietProperties"];
  productUsable?: Product["usable"];
  products: Product[];
  dialogOpen: boolean;
  handleOk: (product: Product) => void;
  handleClose: () => void;
  handleChooseExisting: (product: Product) => void;
  selectedDepartment?: Department;
  selectedUnit?: Unit;
  usable?: boolean;
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
  handleChooseExisting,
  selectedDepartment = {} as Department,
  selectedUnit = {key: "", name: "", dimension: UnitDimension.dimensionless},
  usable = true,
  departments = [],
  units = [],
  authUser,
}: DialogProductProps) => {
  const [productPopUpValues, setProductPopUpValues] = React.useState(
    PRODUCT_POP_UP_VALUES_INITIAL_STATE
  );
  const [similarProductPopupValues, setSimilarProductPopupValues] =
    React.useState(SIMILIAR_PRODCTUS_POP_UP_VALUES_INITIAL_STATE);

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
    let value: string | ValueObject | boolean;
    let field: string;

    if (event.target.id) {
      field = event.target.id.split("-")[0];
    } else {
      objectId ? (field = objectId) : (field = "");
    }

    switch (field) {
      case "unit_shoppingUnit":
        if (action !== "clear") {
          value = newValue;
        } else {
          value = "";
        }
        field = "shoppingUnit";
        break;
      case "department":
        if (action !== "clear") {
          value = newValue;
        } else {
          value = "";
        }
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
    const dietProperties = productPopUpValues.dietProperties;

    switch (event.target.id) {
      case "dietProperties.allergens.containsLactose":
        if (event.target.checked) {
          // Hinzufügen
          dietProperties.allergens.push(Allergen.Lactose);
        } else {
          dietProperties.allergens = dietProperties.allergens.filter(
            (allergen) => allergen != Allergen.Lactose
          );
        }
        break;
      case "dietProperties.allergens.containsGluten":
        if (event.target.checked) {
          // Hinzufügen
          dietProperties.allergens.push(Allergen.Gluten);
        } else {
          dietProperties.allergens = dietProperties.allergens.filter(
            (allergen) => allergen != Allergen.Gluten
          );
        }
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
    const dietProperties = productPopUpValues.dietProperties;

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
        name: {hasError: true, errorText: TEXT_GIVE_PRODUCT},
      });
      hasError = true;
    }
    if (
      !productPopUpValues.department ||
      !Object.prototype.hasOwnProperty.call(
        productPopUpValues.department,
        "name"
      )
    ) {
      setValidation({
        ...validation,
        department: {
          hasError: true,
          errorText: TEXT_GIVE_DEPARTMENT,
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
          errorText: TEXT_ERROR_PRODUCT_WITH_THIS_NAME_ALREADY_EXISTS,
        },
      });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    const product = new Product();

    switch (dialogType) {
      case PRODUCT_DIALOG_TYPE.CREATE:
        if (!firebase) {
          // Firebase fehlt
          throw new Error(TEXT_ERROR_PARAMETER_NOT_PASSED);
        }
        //Neues Produkt anlegen
        Product.createProduct({
          firebase: firebase,
          name: productPopUpValues.name,
          departmentUid: productPopUpValues?.department?.uid,
          shoppingUnit: productPopUpValues?.shoppingUnit?.key,
          dietProperties: productPopUpValues.dietProperties,
          authUser: authUser,
        }).then((result) => {
          handleOk(result);
          setProductPopUpValues({
            ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
            clear: true,
          });
        });
        break;
      case PRODUCT_DIALOG_TYPE.EDIT:
        // PopUp Werte aufbereiten für aufrufende Komponente

        product.uid = productPopUpValues.uid;
        product.name = productPopUpValues.name;
        product.department = productPopUpValues.department;
        product.shoppingUnit = productPopUpValues.shoppingUnit.key;
        product.usable = productPopUpValues.usable;
        product.dietProperties.diet = productPopUpValues.dietProperties.diet;
        if (
          productPopUpValues.dietProperties.allergens.includes(Allergen.Lactose)
        ) {
          product.dietProperties.allergens.push(Allergen.Lactose);
        }
        if (
          productPopUpValues.dietProperties.allergens.includes(Allergen.Gluten)
        ) {
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
  const onClose = (event: ValueObject, reason: string) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      handleClose();
    }
  };

  // Werte setzen, wenn das erste Mal PopUp geöffnet wird
  if (
    productPopUpValues.name === "" &&
    productName &&
    !productPopUpValues.roundtripDone
  ) {
    // Prüfen ob es bereits ein ähnliches Produkt gibt, wenn ja, dann
    // die Liste mit diesen Produkten über diesen Dialog anzeigen.
    if (dialogType === ProductDialog.CREATE) {
      const similarProducts = Product.findSimilarProducts({
        productName: productName,
        existingProducts: products,
      });

      if (similarProducts.length !== 0) {
        // Liste zeigen mit den möglichen Produkten
        setSimilarProductPopupValues({
          similarProducts: similarProducts,
          popUpOpen: true,
        });
      }
    }

    setProductPopUpValues({
      ...productPopUpValues,
      uid: productUid,
      name: productName.trim(),
      department: selectedDepartment,
      shoppingUnit: selectedUnit,
      dietProperties: {
        allergens: productDietProperties?.allergens
          ? productDietProperties.allergens
          : [],
        diet: productDietProperties?.diet
          ? productDietProperties.diet
          : Diet.Meat,
      },
      usable: usable,
    });
  }
  /* ------------------------------------------
  // Similar Product PopUp - Handling
  // ------------------------------------------ */
  const onSimilarProductPopUpChooseProduct = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const proudctUid = event.currentTarget.id.split("_")[1];
    const product = products.find((product) => product.uid === proudctUid);

    if (!product) {
      return;
    }

    handleChooseExisting(product);
    setSimilarProductPopupValues(SIMILIAR_PRODCTUS_POP_UP_VALUES_INITIAL_STATE);
    setProductPopUpValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      clear: true,
    });
  };
  const onSimilarProductPopUpClose = () => {
    setSimilarProductPopupValues(SIMILIAR_PRODCTUS_POP_UP_VALUES_INITIAL_STATE);
  };
  return (
    <React.Fragment>
      <Dialog
        open={dialogOpen}
        onClose={onClose}
        aria-labelledby="dialogAddProduct"
        maxWidth="sm"
      >
        <DialogTitle id="dialogAddProduct">
          {dialogType === PRODUCT_DIALOG_TYPE.CREATE
            ? TEXT_PRODUCT_ADD
            : TEXT_PRODUCT_EDIT}
        </DialogTitle>

        <DialogContent>
          {/* <Alert severity="info">
          {TEXT_RECORD_INGREDIENT_WITH_NECCESSARY_INFO}
        </Alert>
        <br /> */}
          {dialogType === ProductDialog.CREATE && (
            <Alert severity="warning">
              <AlertTitle>{`${TEXT_NEW_PRODUCT}?`}</AlertTitle>
              <div>
                {TEXT_GUIDELINES_NEW_PRODUCT.line1}
                <ul>
                  <li>{TEXT_GUIDELINES_NEW_PRODUCT.line2}</li>
                  <li>{TEXT_GUIDELINES_NEW_PRODUCT.line3}</li>
                  <li>{TEXT_GUIDELINES_NEW_PRODUCT.line4}</li>
                </ul>
                {TEXT_GUIDELINES_NEW_PRODUCT.line5}
              </div>
            </Alert>
          )}
          <DialogContentText>
            {dialogType === PRODUCT_DIALOG_TYPE.CREATE && TEXT_PRODUCT}
          </DialogContentText>
          {dialogType === PRODUCT_DIALOG_TYPE.EDIT &&
            productPopUpValues.showNameWarning && (
              <AlertMessage
                severity="warning"
                messageTitle={TEXT_ATTENTION}
                body={
                  <React.Fragment>
                    {TEXT_WARNING_PRODUCT_1}
                    <strong>{TEXT_WARNING_PRODUCT_2}</strong>
                    {TEXT_WARNING_PRODUCT_3}
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
                label={TEXT_PRODUCT}
                type="text"
                helperText={validation.name.errorText}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <DepartmentAutocomplete
                  department={productPopUpValues.department}
                  departments={departments}
                  disabled={false}
                  onChange={onChangeField}
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
                <FormHelperText>{TEXT_SHOPPING_UNIT_INFO}</FormHelperText>
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
                  label={TEXT_USABLE}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel component="legend">{TEXT_INTOLERANCES}</FormLabel>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={productPopUpValues.dietProperties?.allergens?.includes(
                          Allergen.Lactose
                        )}
                        onChange={onChangeDietCheckbox}
                        name="dietProperties.allergens.containsLactose"
                        id="dietProperties.allergens.containsLactose"
                        color="primary"
                      />
                    }
                    label={TEXT_HAS_LACTOSE}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={productPopUpValues.dietProperties?.allergens?.includes(
                          Allergen.Gluten
                        )}
                        onChange={onChangeDietCheckbox}
                        name="dietProperties.allergens.containsGluten"
                        id="dietProperties.allergens.containsGluten"
                        color="primary"
                      />
                    }
                    label={TEXT_HAS_GLUTEN}
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormGroup>
                  <FormLabel component="legend">
                    {TEXT_PRODUCT_PROPERTY}
                  </FormLabel>
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
                      label={TEXT_IS_MEAT}
                    />
                    <FormControlLabel
                      value={Diet.Vegetarian}
                      control={<Radio size="small" color="primary" />}
                      label={TEXT_IS_VEGETARIAN}
                    />
                    <FormControlLabel
                      value={Diet.Vegan}
                      control={<Radio size="small" color="primary" />}
                      label={TEXT_IS_VEGAN}
                    />
                  </RadioGroup>
                </FormGroup>
              </FormControl>
            </Grid>
            {dialogType === ProductDialog.CREATE && (
              <Grid item xs={12}>
                <FormHelperText>{TEXT_INFO_DIET_PROPERTIES}</FormHelperText>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelClick} color="primary" variant="outlined">
            {TEXT_CANCEL}
          </Button>
          <Button onClick={onOkClick} color="primary" variant="contained">
            {dialogType === PRODUCT_DIALOG_TYPE.CREATE ? TEXT_CREATE : TEXT_OK}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={similarProductPopupValues.popUpOpen}
        aria-labelledby="similarProducts"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="dialogSimilarProducts">
          {TEXT_SIMILAR_PRODUCTS}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {TEXT_THERE_ARE_SIMILAR_PRODUCTS}
          </Typography>
          <br />
          <Typography variant="h6">{TEXT_EXISTING_PRODUCTS}</Typography>
          <List dense>
            {similarProductPopupValues.similarProducts.map((product) => (
              <ListItem
                key={"similarProduct_" + product.uid}
                id={"similarProduct_" + product.uid}
                button
                onClick={onSimilarProductPopUpChooseProduct}
              >
                {product.name}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onSimilarProductPopUpClose}
            color="primary"
            variant="contained"
          >
            {`${TEXT_PRODUCT} ${TEXT_CREATE}`}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default DialogProduct;
