import React, { useReducer } from "react";
import { compose } from "recompose";

import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Alert, AlertTitle } from "@material-ui/lab";

import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import DeleteIcon from "@material-ui/icons/Delete";

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import EnhancedTable, { TABLE_COLUMN_TYPES } from "../Shared/enhancedTable";
import AlertMessage from "../Shared/AlertMessage";

import DialogCreateUnitConversion, {
  UNIT_CONVERSION_TYPE,
} from "./dialogCreateUnitConversion";

import CustomSnackbar from "../Shared/customSnackbar";
import useStyles from "../../constants/styles";

import Unit from "./unit.class";
import UnitConversion from "./unitConversion.class";
import Product from "../Product/product.class";
import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const REDUCER_ACTIONS = {
  FETCH_INIT: "FETCH_INIT",
  UNIT_CONVERSION_BASIC_FETCH_SUCCESS: "UNIT_CONVERSION_BASIC_FETCH_SUCCESS",
  UNIT_CONVERSION_PRODUCTS_FETCH_SUCCESS:
    "UNIT_CONVERSION_PRODUCTS_FETCH_SUCCESS",
  SNACKBAR_CLOSE: "SNACKBAR_CLOSE",
  PRODUCTS_FETCH_SUCCESS: "PRODUCTS_FETCH_SUCCESS",
  UNITS_FETCH_SUCCESS: "UNITS_FETCH_SUCCESS",
  NEW_UNIT_CONVERSION_BASIC: "NEW_UNIT_CONVERSION_BASIC",
  NEW_UNIT_CONVERSION_PRODUCT: "NEW_UNIT_CONVERSION_PRODUCT",
  UNIT_CONVERSION_BASIC_ON_CHANGE: "UNIT_CONVERSION_BASIC_ON_CHANGE",
  UNIT_CONVERSION_PRODUCT_ON_CHANGE: "UNIT_CONVERSION_PRODUCT_ON_CHANGE",
  UNIT_CONVERSIONS_SAVED: "UNIT_CONVERSIONS_SAVED",
  DELETE_BASIC_UNIT_CONVERSION: "DELETE_BASIC_UNIT_CONVERSION",
  DELETE_PRODUCT_UNIT_CONVERSION: "DELETE_PRODUCT_UNIT_CONVERSION",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const unitConversionReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.FETCH_INIT:
      // Daten werden geladen
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          overall: true,
          [action.field]: true,
        },
      };
    case REDUCER_ACTIONS.UNIT_CONVERSION_BASIC_FETCH_SUCCESS:
      // Basic Umrechnung erfolgreich gelesen
      return {
        ...state,
        dataBasic: action.payload,
        isLoading: {
          ...state.isLoading,
          overall: deriveIsLoading(state.isLoading, "basicConversion", false),
          basicConversion: false,
        },
      };
    case REDUCER_ACTIONS.UNIT_CONVERSION_PRODUCTS_FETCH_SUCCESS:
      // Produkte Umrechnung erfolgreich gelesen
      return {
        ...state,
        dataProduct: action.payload,
        isLoading: {
          ...state.isLoading,
          overall: deriveIsLoading(state.isLoading, "productConversion", false),
          productConversion: false,
        },
      };
    case REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS:
      // Produkte erfolgreich gelesen
      return {
        ...state,
        products: action.payload,
        isLoading: {
          ...state.isLoading,
          overall: deriveIsLoading(state.isLoading, "products", false),
          products: false,
        },
      };
    case REDUCER_ACTIONS.UNITS_FETCH_SUCCESS:
      // Produkte erfolgreich gelesen
      return {
        ...state,
        units: action.payload,
        isError: false,
        error: null,
        isLoading: {
          ...state.isLoading,
          overall: deriveIsLoading(state.isLoading, "units", false),
          units: false,
        },
      };
    case REDUCER_ACTIONS.UNIT_CONVERSION_BASIC_ON_CHANGE:
      // änderung der Feldwerte
      return {
        ...state,
        dataBasic: state.dataBasic.map((unitConversion) => {
          if (unitConversion.uid === action.uid) {
            unitConversion[action.field] = action.value;
          }
          return unitConversion;
        }),
      };
    case REDUCER_ACTIONS.UNIT_CONVERSION_PRODUCT_ON_CHANGE:
      // änderung der Feldwerte
      return {
        ...state,
        dataProduct: state.dataProduct.map((unitConversion) => {
          if (unitConversion.uid === action.uid) {
            unitConversion[action.field] = action.value;
          }
          return unitConversion;
        }),
      };
    case REDUCER_ACTIONS.NEW_UNIT_CONVERSION_BASIC:
      // Neue Umrechnung wurde erfasst
      return {
        ...state,
        dataBasic: state.dataBasic.concat([action.payload]),
        isError: false,
        error: null,
        snackbar: {
          severity: "success",
          message: TEXT.UNIT_CONVERSION_BASIC_CREATED,
          open: true,
        },
      };
    case REDUCER_ACTIONS.NEW_UNIT_CONVERSION_PRODUCT:
      return {
        ...state,
        dataProduct: state.dataProduct.concat([action.payload]),
        isError: false,
        error: null,
        snackbar: {
          severity: "success",
          message: TEXT.UNIT_CONVERSION_PRODUCT_CREATED(
            action.payload.productName
          ),
          open: true,
        },
      };
    case REDUCER_ACTIONS.DELETE_BASIC_UNIT_CONVERSION:
      // Einzelne Unit Conversion wurde gelöscht
      return {
        ...state,
        dataBasic: state.dataBasic.filter(
          (basicConversion) => basicConversion.uid !== action.uid
        ),
        snackbar: {
          severity: "success",
          message: TEXT.ENTRY_DELETED,
          open: true,
        },
      };
    case REDUCER_ACTIONS.DELETE_PRODUCT_UNIT_CONVERSION:
      // Einzelne Unit Conversion wurde gelöscht
      return {
        ...state,
        dataProduct: state.dataProduct.filter(
          (productConversion) => productConversion.uid !== action.uid
        ),
        snackbar: {
          severity: "success",
          message: TEXT.ENTRY_DELETED,
          open: true,
        },
      };
    case REDUCER_ACTIONS.UNIT_CONVERSIONS_SAVED:
      // Alles  gepeichert
      return {
        ...state,
        isError: false,
        error: null,
        snackbar: {
          severity: "success",
          message: TEXT.SAVE_SUCCESS,
          open: true,
        },
      };
    case REDUCER_ACTIONS.SNACKBAR_CLOSE:
      // Snackbar schliessen
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case REDUCER_ACTIONS.GENERIC_ERROR:
      // allgemeiner Fehler
      return {
        ...state,
        isError: true,
        error: action.payload,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
/* ------------------------------------------
// Ableiten ob Daten noch geladen werden
// ------------------------------------------ */
const deriveIsLoading = (actualState, newField, newValue) => {
  let counterTrue = 0;
  actualState[newField] = newValue;

  for (const [key, value] of Object.entries(actualState)) {
    if (key !== "overall" && value === true) {
      counterTrue += 1;
    }
  }
  if (counterTrue === 0) {
    return false;
  } else {
    return true;
  }
};
const BASIC_TABLE_COLUMS = [
  {
    id: "uid",
    type: TABLE_COLUMN_TYPES.STRING,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.COLUMN_UID,
    visible: false,
  },
  {
    id: "denominator",
    type: TABLE_COLUMN_TYPES.NUMBER,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.FIELD_DENOMINATOR,
    visible: true,
    // inputComponent: TABLE_CELL_INPUT_COMPONENT.TEXTFIELD,
    // required: true,
    // inputType: "number",
  },
  {
    id: "fromUnit",
    type: TABLE_COLUMN_TYPES.STRING,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.FIELD_UNIT_FROM,
    visible: true,
  },
  {
    id: "numerator",
    type: TABLE_COLUMN_TYPES.NUMBER,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.FIELD_NUMERATOR,
    visible: true,
    // inputComponent: TABLE_CELL_INPUT_COMPONENT.TEXTFIELD,
    // required: true,
    // inputType: "number",
  },
  {
    id: "toUnit",
    type: TABLE_COLUMN_TYPES.STRING,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.FIELD_UNIT_TO,
    visible: true,
  },
  // {
  //   id: "deleteConversion",
  //   type: TABLE_COLUMN_TYPES.BUTTON,
  //   iconButton: <DeleteIcon fontSize="small" />,
  //   visible:
  //     editMode &&
  //     (authUser.roles.includes(ROLES.SUB_ADMIN) ||
  //       authUser.roles.includes(ROLES.ADMIN)),
  // },
];
const PRODUCT_TABLE_COLUMS = [
  {
    id: "uid",
    type: TABLE_COLUMN_TYPES.STRING,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.COLUMN_UID,
    visible: false,
  },
  {
    id: "productName",
    type: TABLE_COLUMN_TYPES.string,
    textAlign: "left",
    disablePadding: false,
    label: TEXT.FIELD_PRODUCT,
    visible: true,
  },
  {
    id: "denominator",
    type: TABLE_COLUMN_TYPES.NUMBER,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.FIELD_DENOMINATOR,
    visible: true,
  },
  {
    id: "fromUnit",
    type: TABLE_COLUMN_TYPES.STRING,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.FIELD_UNIT_TO,
    visible: true,
  },
  {
    id: "numerator",
    type: TABLE_COLUMN_TYPES.NUMBER,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.FIELD_NUMERATOR,
    visible: true,
  },
  {
    id: "toUnit",
    type: TABLE_COLUMN_TYPES.STRING,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.FIELD_UNIT_TO,
    visible: true,
  },
];

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const UnitConversionPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <UnitConversionBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const UnitConversionBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [unitConversion, dispatchUnitConversion] = React.useReducer(
    unitConversionReducer,
    {
      dataBasic: [],
      dataProduct: [],
      products: [],
      units: [],
      error: {},
      isError: false,
      isLoading: {
        overall: false,
        products: false,
        units: false,
        basicConversion: false,
        productConversion: false,
      },
      snackbar: { open: false, severity: "success", message: "" },
    }
  );
  const [
    unitConversionCreateValues,
    setUnitConversionCreateValues,
  ] = React.useState({
    popUpOpen: false,
    unitConversionType: "",
  });
  const [editMode, setEditMode] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);
  /* ------------------------------------------
	// Daten aus der db holen
	// ------------------------------------------ */
  React.useEffect(() => {
    // Umrechnungen Basic holen
    dispatchUnitConversion({
      type: REDUCER_ACTIONS.FETCH_INIT,
      field: "basicConversion",
    });

    UnitConversion.getAllConversionBasic(firebase).then((result) => {
      dispatchUnitConversion({
        type: REDUCER_ACTIONS.UNIT_CONVERSION_BASIC_FETCH_SUCCESS,
        payload: result,
      });
    });
    // Umrechnungen Produkte holen
    UnitConversion.getAllConversionProducts(firebase).then((result) => {
      dispatchUnitConversion({
        type: REDUCER_ACTIONS.UNIT_CONVERSION_PRODUCTS_FETCH_SUCCESS,
        payload: result,
      });
    });
  }, []);
  React.useEffect(() => {
    if (editMode) {
      // Produkte holen
      if (unitConversion.products.length === 0) {
        dispatchUnitConversion({
          type: REDUCER_ACTIONS.FETCH_INIT,
          field: "products",
        });
        Product.getAllProducts({ firebase: firebase, onlyUsable: true })
          .then((result) => {
            dispatchUnitConversion({
              type: REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS,
              payload: result,
            });
          })
          .catch((error) => {
            console.error(error);
            dispatchUnitConversion({
              type: REDUCER_ACTIONS.GENERIC_ERROR,
              error: error,
            });
          });
      }
      // Einheiten holen
      if (unitConversion.units.length === 0) {
        dispatchUnitConversion({
          type: REDUCER_ACTIONS.FETCH_INIT,
          field: "units",
        });
        Unit.getAllUnits(firebase)
          .then((result) => {
            let units = result.map((unit) => unit.key);

            dispatchUnitConversion({
              type: REDUCER_ACTIONS.UNITS_FETCH_SUCCESS,
              payload: units,
            });
          })
          .catch((error) => {
            dispatchUnitConversion({
              type: REDUCER_ACTIONS.GENERIC_ERROR,
              payload: error,
            });
          });
      }
    }
  }, [editMode]);
  /* ------------------------------------------
	// Edit Mode wechsel
	// ------------------------------------------ */
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  /* ------------------------------------------
	// Tab wechseln
	// ------------------------------------------ */
  const onTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  /* ------------------------------------------
	// PopUp öffnen um neue Umrechnung anzulegen
	// ------------------------------------------ */
  const onAddUnitConversionClick = () => {
    let conversionType;

    switch (tabValue) {
      case 0:
        conversionType = UNIT_CONVERSION_TYPE.BASIC;
        break;
      case 1:
        conversionType = UNIT_CONVERSION_TYPE.PRODUCT;
        break;
      default:
        throw new Error(TEXT.TYPE_UNKNOWN);
    }

    setUnitConversionCreateValues({
      ...unitConversionCreateValues,
      popUpOpen: true,
      unitConversionType: conversionType,
    });
  };
  /* ------------------------------------------
	// Einheit hinzufügen --> PopUp schliessen
	// ------------------------------------------ */
  const onPopUpClose = () => {
    setUnitConversionCreateValues({
      ...unitConversionCreateValues,
      popUpOpen: false,
    });
  };
  /* ------------------------------------------
	// Fehler beim anlegen der Einheit
	// ------------------------------------------ */
  const onPopUpError = (error) => {
    dispatchUnitConversion({
      type: REDUCER_ACTIONS.GENERIC_ERROR,
      payload: error,
    });
    setUnitConversionCreateValues({
      ...unitConversionCreateValues,
      popUpOpen: false,
    });
  };
  /* ------------------------------------------
	// Einheit wurde angelegt
	// ------------------------------------------ */
  const onAddUnitConversion = (newUnit) => {
    let newUid = Object.keys(newUnit)[0];

    switch (unitConversionCreateValues.unitConversionType) {
      case UNIT_CONVERSION_TYPE.BASIC:
        dispatchUnitConversion({
          type: REDUCER_ACTIONS.NEW_UNIT_CONVERSION_BASIC,
          payload: {
            uid: newUid,
            denominator: newUnit[newUid].denominator,
            numerator: newUnit[newUid].numerator,
            fromUnit: newUnit[newUid].fromUnit,
            toUnit: newUnit[newUid].toUnit,
          },
        });
        break;
      case UNIT_CONVERSION_TYPE.PRODUCT:
        dispatchUnitConversion({
          type: REDUCER_ACTIONS.NEW_UNIT_CONVERSION_PRODUCT,
          payload: {
            uid: newUid,
            productUid: newUnit[newUid].productUid,
            productName: newUnit[newUid].productName,
            denominator: newUnit[newUid].denominator,
            numerator: newUnit[newUid].numerator,
            fromUnit: newUnit[newUid].fromUnit,
            toUnit: newUnit[newUid].toUnit,
          },
        });
        break;
    }
    setUnitConversionCreateValues({
      ...unitConversionCreateValues,
      popUpOpen: false,
    });
  };
  /* ------------------------------------------
	// Änderungen speichern
	// ------------------------------------------ */
  const onSaveClick = () => {
    UnitConversion.saveUnitConversionBasic(firebase, unitConversion.dataBasic)
      .then(() => {
        UnitConversion.saveUnitConversionProduct(
          firebase,
          unitConversion.dataProduct
        ).then(() => {
          dispatchUnitConversion({
            type: REDUCER_ACTIONS.UNIT_CONVERSIONS_SAVED,
          });
        });
      })
      .catch((error) => {
        dispatchUnitConversion({
          type: REDUCER_ACTIONS.GENERIC_ERROR,
          payload: error,
        });
      });
  };
  /* ------------------------------------------
	// Snackback schliessen
	// ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatchUnitConversion({
      type: REDUCER_ACTIONS.SNACKBAR_CLOSE,
    });
  };
  /* ------------------------------------------
	// OnChange der EditTable
	// ------------------------------------------ */
  const onChangeEditTableField = (event) => {
    let unitConversionField = event.target.id.split("_");
    switch (tabValue) {
      case 0:
        dispatchUnitConversion({
          type: REDUCER_ACTIONS.UNIT_CONVERSION_BASIC_ON_CHANGE,
          uid: unitConversionField[1],
          field: unitConversionField[0],
          value: event.target.value,
        });
        break;
      case 1:
        dispatchUnitConversion({
          type: REDUCER_ACTIONS.UNIT_CONVERSION_PRODUCT_ON_CHANGE,
          uid: unitConversionField[1],
          field: unitConversionField[0],
          value: event.target.value,
        });
        break;
      default:
        throw new Error(TEXT.TYPE_UNKNOWN);
    }
  };
  /* ------------------------------------------
	// Eintrag aus Tabelle löschen
	// ------------------------------------------ */
  const onTableRowDelete = (event) => {
    let pressedButton = event.currentTarget.id.split("_");
    switch (tabValue) {
      case 0:
        UnitConversion.deleteUnitConversionBasic(firebase, pressedButton[1])
          .then(() => {
            // auch in der Anzeige löschen
            dispatchUnitConversion({
              type: REDUCER_ACTIONS.DELETE_BASIC_UNIT_CONVERSION,
              uid: pressedButton[1],
            });
          })
          .catch((error) => {
            dispatchUnitConversion({
              type: REDUCER_ACTIONS.GENERIC_ERROR,
              payload: error,
            });
          });
        break;
      case 1:
        UnitConversion.deleteUnitConversionProduct(firebase, pressedButton[1])
          .then(() => {
            // auch in der Anzeige löschen
            dispatchUnitConversion({
              type: REDUCER_ACTIONS.DELETE_PRODUCT_UNIT_CONVERSION,
              uid: pressedButton[1],
            });
          })
          .catch((error) => {
            dispatchUnitConversion({
              type: REDUCER_ACTIONS.GENERIC_ERROR,
              payload: error,
            });
          });
        break;
      default:
        throw new Error(TEXT.TYPE_UNKNOWN);
    }
  };
  return (
    <React.Fragment>
      <CssBaseline />
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT.PAGE_TITLE_UNIT_CONVERSION}
        subTitle={TEXT.PAGE_SUBTITLE_UNIT_CONVERSION}
      />
      <ButtonRow
        key="buttons_edit"
        buttons={[
          {
            id: "edit",
            hero: true,
            visible:
              !editMode &&
              (authUser.roles.includes(ROLES.SUB_ADMIN) ||
                authUser.roles.includes(ROLES.ADMIN)),
            label: TEXT.BUTTON_EDIT,
            variant: "contained",
            color: "primary",
            onClick: toggleEditMode,
          },
          {
            id: "save",
            hero: true,
            visible:
              editMode &&
              (authUser.roles.includes(ROLES.SUB_ADMIN) ||
                authUser.roles.includes(ROLES.ADMIN)),
            label: TEXT.BUTTON_SAVE,
            variant: "contained",
            color: "primary",
            onClick: onSaveClick,
          },
          {
            id: "add",
            hero: true,
            visible:
              (authUser.roles.includes(ROLES.SUB_ADMIN) ||
                authUser.roles.includes(ROLES.ADMIN)) &&
              editMode,
            label: TEXT.BUTTON_ADD,
            variant: "outlined",
            color: "primary",
            onClick: onAddUnitConversionClick,
          },
        ]}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop
          className={classes.backdrop}
          open={unitConversion.isLoading.overall}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          <Grid item key={"gridTabs"} xs={12}>
            <Tabs
              className={classes.tabs}
              value={tabValue}
              onChange={onTabChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab className={classes.tabs} label={TEXT.UNITS_TAB_BASIC} />
              <Tab label={TEXT.UNITS_TAB_PRODUCTS} />
            </Tabs>
          </Grid>

          {unitConversion.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={unitConversion.error}
                messageTitle={TEXT.ALERT_TITLE_UUPS}
              />
            </Grid>
          )}

          {/* Tabs */}
          {tabValue == 0 && (
            <Grid item key={"BasicConversionPanel"} xs={12}>
              <br />
              <BasicConversionPanel
                unitConversion={unitConversion.dataBasic}
                onChangeField={onChangeEditTableField}
                onDeleteClick={onTableRowDelete}
                editMode={editMode}
              />
            </Grid>
          )}
          {tabValue == 1 && (
            <Grid item key={"BasicConversionPanel"} xs={12}>
              <br />
              <ProductConversionPanel
                unitConversion={unitConversion.dataProduct}
                onChangeField={onChangeEditTableField}
                onDeleteClick={onTableRowDelete}
                editMode={editMode}
              />
            </Grid>
          )}
          <Grid item key={"empty"} xs={12}></Grid>
        </Grid>
      </Container>
      <DialogCreateUnitConversion
        firebase={firebase}
        units={unitConversion.units}
        products={unitConversion.products}
        dialogOpen={unitConversionCreateValues.popUpOpen}
        unitConversionType={unitConversionCreateValues.unitConversionType}
        handleCreate={onAddUnitConversion}
        handleClose={onPopUpClose}
        handleError={onPopUpError}
      />
      <CustomSnackbar
        message={unitConversion.snackbar.message}
        severity={unitConversion.snackbar.severity}
        snackbarOpen={unitConversion.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ====================== Basic Conversion Panel  ====================
// =================================================================== */
const BasicConversionPanel = ({
  unitConversion,
  onChangeField,
  onDeleteClick,
  editMode,
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"cardBasicUnitConversion"}>
      <CardContent className={classes.cardContent} key={"cardTagsContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_UNITS_BASIC}
        </Typography>
        {editMode ? (
          <Grid container spacing={2}>
            {/* Überschriften */}
            <Grid item xs={3}>
              <Typography variant="subtitle1" align="center">
                {TEXT.FIELD_DENOMINATOR}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle1" align="center">
                {TEXT.FIELD_UNIT_FROM}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle1" align="center">
                {TEXT.FIELD_NUMERATOR}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle1" align="center">
                {TEXT.FIELD_UNIT_TO}
              </Typography>
            </Grid>
            <Grid item xs={2} />

            <Divider />
            {unitConversion.map((conversionRule) => (
              <BasicConversionEditRow
                key={"basicConversionRow_" + conversionRule.uid}
                unitConversion={conversionRule}
                onChangeField={onChangeField}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </Grid>
        ) : (
          // <EnhancedEditTable
          //   tableData={unitConversion}
          //   tableColumns={BASIC_TABLE_COLUMS}
          //   keyColum={"uid"}
          //   onChangeField={onChangeField}
          //   onIconClick={onDeleteClick}
          // />
          <EnhancedTable
            tableData={unitConversion}
            tableColumns={BASIC_TABLE_COLUMS}
            keyColum={"uid"}
          />
        )}
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ====================== Reihe Conversion Basic  ===================£=
// =================================================================== */
const BasicConversionEditRow = ({
  unitConversion,
  onChangeField,
  onDeleteClick,
}) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {/* Überschriften */}
      <Grid item xs={3} key={"grid_denominator_" + unitConversion.uid}>
        <TextField
          id={"denominator_" + unitConversion.uid}
          key={"denominator_" + unitConversion.uid}
          value={unitConversion.denominator}
          onChange={onChangeField}
          fullWidth
          inputProps={{ style: { textAlign: "center" } }}
        />
      </Grid>
      <Grid item xs={2} key={"grid_fromUnit_" + unitConversion.uid}>
        <Typography color="textSecondary" align="center">
          {unitConversion.fromUnit}
        </Typography>
        {/* <TextField
          id={"fromUnit" + unitConversion.uid}
          key={"fromUnit" + unitConversion.uid}
          value={unitConversion.fromUnit}
          // onChange={onChangeField}
          fullWidth
          disabled
          inputProps={{ style: { textAlign: "center" } }}
        /> */}
      </Grid>
      <Grid item xs={3} key={"grid_numerator_" + unitConversion.uid}>
        <TextField
          id={"numerator_" + unitConversion.uid}
          key={"numerator_" + unitConversion.uid}
          value={unitConversion.numerator}
          onChange={onChangeField}
          fullWidth
          inputProps={{ style: { textAlign: "center" } }}
        />
      </Grid>
      <Grid item xs={2} key={"grid_toUnit_" + unitConversion.uid}>
        <Typography color="textSecondary" align="center">
          {unitConversion.toUnit}
        </Typography>
        {/* <TextField
          id={"toUnit" + unitConversion.uid}
          key={"toUnit" + unitConversion.uid}
          value={unitConversion.toUnit}
          // onChange={onChangeField}
          fullWidth
          disabled
          inputProps={{ style: { textAlign: "center" } }}
        /> */}
      </Grid>
      <Grid item xs={2} key={"grid_deleteRow_" + unitConversion.uid}>
        <IconButton
          color="primary"
          component="span"
          id={"deleteRow_" + unitConversion.uid}
          onClick={onDeleteClick}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Grid>
      <Grid item xs={12} key={"grid_divider" + unitConversion.uid}>
        <Divider />
      </Grid>
    </React.Fragment>
  );
};
/* ===================================================================
// ====================== Poduct Conversion Panel  ===================
// =================================================================== */
const ProductConversionPanel = ({
  unitConversion,
  onChangeField,
  onDeleteClick,
  editMode,
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"cardBasicUnitConversion"}>
      <CardContent className={classes.cardContent} key={"cardTagsContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_UNITS_PRODUCTS}
        </Typography>
        {editMode ? (
          <Grid container spacing={2}>
            {/* Überschriften */}
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1" align="center">
                {TEXT.FIELD_PRODUCT}
              </Typography>
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography variant="subtitle1" align="center">
                {TEXT.FIELD_DENOMINATOR}
              </Typography>
            </Grid>
            <Grid item xs={2} sm={1}>
              <Typography variant="subtitle1" align="center">
                {TEXT.FIELD_UNIT_FROM}
              </Typography>
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography variant="subtitle1" align="center">
                {TEXT.FIELD_NUMERATOR}
              </Typography>
            </Grid>
            <Grid item xs={2} sm={1}>
              <Typography variant="subtitle1" align="center">
                {TEXT.FIELD_UNIT_TO}
              </Typography>
            </Grid>
            <Grid item xs={2} />

            <Divider />
            {unitConversion.map((conversionRule) => (
              <ProductConversionEditRow
                key={"productConversionRow_" + conversionRule.uid}
                unitConversion={conversionRule}
                onChangeField={onChangeField}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </Grid>
        ) : (
          <EnhancedTable
            tableData={unitConversion}
            tableColumns={PRODUCT_TABLE_COLUMS}
            keyColum={"uid"}
          />
        )}
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ===================== Reihe Conversion Produkt  ===================
// =================================================================== */
const ProductConversionEditRow = ({
  unitConversion,
  onChangeField,
  onDeleteClick,
}) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Grid item xs={12} sm={4} key={"grid_productName_" + unitConversion.uid}>
        <Typography color="textSecondary" align="center">
          {unitConversion.productName}
        </Typography>
      </Grid>{" "}
      <Grid item xs={3} sm={2} key={"grid_denominator_" + unitConversion.uid}>
        <TextField
          id={"denominator_" + unitConversion.uid}
          key={"denominator_" + unitConversion.uid}
          value={unitConversion.denominator}
          onChange={onChangeField}
          fullWidth
          inputProps={{ style: { textAlign: "center" } }}
        />
      </Grid>
      <Grid item xs={2} sm={1} key={"grid_fromUnit_" + unitConversion.uid}>
        <Typography color="textSecondary" align="center">
          {unitConversion.fromUnit}
        </Typography>
        {/* <TextField
          id={"fromUnit" + unitConversion.uid}
          key={"fromUnit" + unitConversion.uid}
          value={unitConversion.fromUnit}
          // onChange={onChangeField}
          fullWidth
          disabled
          inputProps={{ style: { textAlign: "center" } }}
        /> */}
      </Grid>
      <Grid item xs={3} sm={2} key={"grid_numerator_" + unitConversion.uid}>
        <TextField
          id={"numerator_" + unitConversion.uid}
          key={"numerator_" + unitConversion.uid}
          value={unitConversion.numerator}
          onChange={onChangeField}
          fullWidth
          inputProps={{ style: { textAlign: "center" } }}
        />
      </Grid>
      <Grid item xs={2} sm={1} key={"grid_toUnit_" + unitConversion.uid}>
        <Typography color="textSecondary" align="center">
          {unitConversion.toUnit}
        </Typography>
        {/* <TextField
          id={"toUnit" + unitConversion.uid}
          key={"toUnit" + unitConversion.uid}
          value={unitConversion.toUnit}
          // onChange={onChangeField}
          fullWidth
          disabled
          inputProps={{ style: { textAlign: "center" } }}
        /> */}
      </Grid>
      <Grid item xs={2} sm={2} key={"grid_deleteRow_" + unitConversion.uid}>
        <IconButton
          color="primary"
          component="span"
          id={"deleteRow_" + unitConversion.uid}
          onClick={onDeleteClick}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Grid>
      <Grid item xs={12} key={"grid_divider" + unitConversion.uid}>
        <Divider />
      </Grid>
    </React.Fragment>
  );
};

const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(UnitConversionPage);
