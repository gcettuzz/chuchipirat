import React from "react";
import {compose} from "react-recompose";

import {
  Container,
  Typography,
  TextField,
  Divider,
  Card,
  CardContent,
  Grid,
  Backdrop,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  SnackbarCloseReason,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import {
  SAVE_SUCCESS as TEXT_SAVE_SUCCESS,
  UID as TEXT_UID,
  DENOMINATOR as TEXT_DENOMINATOR,
  NUMERATOR as TEXT_NUMERATOR,
  UNIT_FROM as TEXT_UNIT_FROM,
  UNIT_TO as TEXT_UNIT_TO,
  PRODUCT as TEXT_PRODUCT,
  TYPE_UNKNOWN as TEXT_TYPE_UNKNOWN,
  PAGE_TITLE_UNIT_CONVERSION as TEXT_PAGE_TITLE_UNIT_CONVERSION,
  PAGE_SUBTITLE_UNIT_CONVERSION as TEXT_PAGE_SUBTITLE_UNIT_CONVERSION,
  EDIT as TEXT_EDIT,
  SAVE as TEXT_SAVE,
  ADD as TEXT_ADD,
  BASIC as TEXT_BASIC,
  PRODUCT_SPECIFIC as TEXT_PRODUCT_SPECIFIC,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
} from "../../constants/text";
import Role from "../../constants/roles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import EnhancedTable, {
  Column,
  ColumnTextAlign,
  TableColumnTypes,
} from "../Shared/enhancedTable";
import AlertMessage from "../Shared/AlertMessage";

import DialogCreateUnitConversion, {
  UnitConversionType,
} from "./dialogCreateUnitConversion";

import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";
import useCustomStyles from "../../constants/styles";

import Unit from "./unit.class";
import UnitConversion from "./unitConversion.class";
import Product from "../Product/product.class";

import Utils from "../Shared/utils.class";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";
import {CustomRouterProps} from "../Shared/global.interface";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  FETCH_INIT,
  UNIT_CONVERSION_BASIC_FETCH_SUCCESS,
  UNIT_CONVERSION_PRODUCTS_FETCH_SUCCESS,
  SNACKBAR_CLOSE,
  PRODUCTS_FETCH_SUCCESS,
  UNITS_FETCH_SUCCESS,
  NEW_UNIT_CONVERSION_BASIC,
  NEW_UNIT_CONVERSION_PRODUCT,
  UNIT_CONVERSION_BASIC_ON_CHANGE,
  UNIT_CONVERSION_PRODUCT_ON_CHANGE,
  UNIT_CONVERSIONS_SAVED,
  DELETE_BASIC_UNIT_CONVERSION,
  DELETE_PRODUCT_UNIT_CONVERSION,
  GENERIC_ERROR,
}

type isLoading = {
  overall: boolean;
  products: boolean;
  units: boolean;
  unitConversionBasic: boolean;
  unitConversionProduct: boolean;
};

type State = {
  unitConversionBasic: UnitConversion[];
  unitConversionProduct: UnitConversion[];
  products: Product[];
  units: Unit[];
  error: Error | null;
  isLoading: isLoading;
  snackbar: Snackbar;
};
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

const inititialState: State = {
  unitConversionBasic: [],
  unitConversionProduct: [],
  products: [],
  units: [],
  error: null,
  isLoading: {
    overall: false,
    products: false,
    units: false,
    unitConversionBasic: false,
    unitConversionProduct: false,
  },
  snackbar: {open: false, severity: "success", message: ""},
};

const unitConversionReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.FETCH_INIT:
      // Daten werden geladen
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          overall: true,
          [action.payload.field]: true,
        },
      };
    case ReducerActions.UNIT_CONVERSION_BASIC_FETCH_SUCCESS:
      // Basic Umrechnung erfolgreich gelesen
      return {
        ...state,
        unitConversionBasic: action.payload as UnitConversion[],
        isLoading: {
          ...state.isLoading,
          unitConversionBasic: false,
          overall: deriveIsLoading(
            state.isLoading,
            "unitConversionBasic",
            false
          ),
        },
      };
    case ReducerActions.UNIT_CONVERSION_PRODUCTS_FETCH_SUCCESS:
      // Produkte Umrechnung erfolgreich gelesen
      return {
        ...state,
        unitConversionProduct: action.payload as UnitConversion[],
        isLoading: {
          ...state.isLoading,
          unitConversionProduct: false,
          overall: deriveIsLoading(
            state.isLoading,
            "unitConversionProduct",
            false
          ),
        },
      };
    case ReducerActions.PRODUCTS_FETCH_SUCCESS:
      // Produkte erfolgreich gelesen
      return {
        ...state,
        products: action.payload as Product[],
        isLoading: {
          ...state.isLoading,
          products: false,
          overall: deriveIsLoading(state.isLoading, "products", false),
        },
      };
    case ReducerActions.UNITS_FETCH_SUCCESS:
      // Produkte erfolgreich gelesen
      return {
        ...state,
        units: action.payload as Unit[],
        isLoading: {
          ...state.isLoading,
          overall: deriveIsLoading(state.isLoading, "units", false),
          units: false,
        },
      };
    case ReducerActions.UNIT_CONVERSION_BASIC_ON_CHANGE:
      // änderung der Feldwerte
      return {
        ...state,
        unitConversionBasic: state.unitConversionBasic.map((unitConversion) => {
          if (unitConversion.uid === action.payload.uid) {
            unitConversion[action.payload.field] = action.payload.value;
          }
          return unitConversion;
        }) as UnitConversion[],
      };
    case ReducerActions.UNIT_CONVERSION_PRODUCT_ON_CHANGE:
      // änderung der Feldwerte
      return {
        ...state,
        unitConversionProduct: state.unitConversionProduct.map(
          (unitConversion) => {
            if (unitConversion.uid === action.payload.uid) {
              unitConversion[action.payload.field] = action.payload.value;
            }
            return unitConversion;
          }
        ) as UnitConversion[],
      };
    case ReducerActions.NEW_UNIT_CONVERSION_BASIC: {
      // Neue Umrechnung wurde erfasst
      const tempUnitConversionBasic = [...state.unitConversionBasic];
      tempUnitConversionBasic.push(action.payload as UnitConversion);
      return {
        ...state,
        unitConversionBasic: tempUnitConversionBasic,
      };
    }
    case ReducerActions.NEW_UNIT_CONVERSION_PRODUCT: {
      const tempUnitConversionProduct = [...state.unitConversionProduct];
      tempUnitConversionProduct.push(action.payload as UnitConversion);
      return {
        ...state,
        unitConversionProduct: tempUnitConversionProduct,
      };
    }
    case ReducerActions.DELETE_BASIC_UNIT_CONVERSION:
      // Einzelne Unit Conversion wurde gelöscht
      return {
        ...state,
        unitConversionBasic: UnitConversion.deleteUnitConversion({
          unitConversion: state.unitConversionBasic,
          unitConversionUidToDelete: action.payload.uid,
        }),
      };
    case ReducerActions.DELETE_PRODUCT_UNIT_CONVERSION:
      // Einzelne Unit Conversion wurde gelöscht
      return {
        ...state,
        unitConversionProduct: UnitConversion.deleteUnitConversion({
          unitConversion: state.unitConversionProduct,
          unitConversionUidToDelete: action.payload.uid,
        }),
      };
    case ReducerActions.UNIT_CONVERSIONS_SAVED:
      // Alles  gepeichert
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: TEXT_SAVE_SUCCESS,
          open: true,
        } as Snackbar,
      };
    case ReducerActions.SNACKBAR_CLOSE:
      // Snackbar schliessen
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        } as Snackbar,
      };
    case ReducerActions.GENERIC_ERROR:
      // allgemeiner Fehler
      return {
        ...state,
        error: action.payload as Error,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
/* ------------------------------------------
// Ableiten ob Daten noch geladen werden
// ------------------------------------------ */
const deriveIsLoading = (
  actualState: isLoading,
  newField: string,
  newValue: boolean
) => {
  let counterTrue = 0;
  actualState[newField] = newValue;

  Object.keys(actualState).forEach((key) => {
    if (key !== "overall" && actualState[key] == true) {
      counterTrue += 1;
    }
  });

  if (counterTrue === 0) {
    return false;
  } else {
    return true;
  }
};
const BASIC_TABLE_COLUMS: Column[] = [
  {
    id: "uid",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_UID,
    visible: false,
  },
  {
    id: "denominator",
    type: TableColumnTypes.number,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_DENOMINATOR,
    visible: true,
  },
  {
    id: "fromUnit",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_UNIT_FROM,
    visible: true,
  },
  {
    id: "numerator",
    type: TableColumnTypes.number,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_NUMERATOR,
    visible: true,
  },
  {
    id: "toUnit",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_UNIT_TO,
    visible: true,
  },
];
const PRODUCT_TABLE_COLUMS: Column[] = [
  {
    id: "uid",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_UID,
    visible: false,
  },
  {
    id: "productName",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.left,
    disablePadding: false,
    label: TEXT_PRODUCT,
    visible: true,
  },
  {
    id: "denominator",
    type: TableColumnTypes.number,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_DENOMINATOR,
    visible: true,
  },
  {
    id: "fromUnit",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_UNIT_TO,
    visible: true,
  },
  {
    id: "numerator",
    type: TableColumnTypes.number,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_NUMERATOR,
    visible: true,
  },
  {
    id: "toUnit",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_UNIT_TO,
    visible: true,
  },
];
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const UnitConversionPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <UnitConversionBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const UnitConversionBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useCustomStyles();

  const [state, dispatch] = React.useReducer(
    unitConversionReducer,
    inititialState
  );

  const [unitConversionCreateValues, setUnitConversionCreateValues] =
    React.useState({
      popUpOpen: false,
      unitConversionType: UnitConversionType.NONE,
    });
  const [editMode, setEditMode] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);

  /* ------------------------------------------
	// Daten aus der db holen
	// ------------------------------------------ */
  React.useEffect(() => {
    // Umrechnungen Basic holen
    dispatch({
      type: ReducerActions.FETCH_INIT,
      payload: {field: "unitConversionBasic"},
    });

    UnitConversion.getAllConversionBasic({firebase: firebase}).then(
      (result) => {
        // Die Werte werden als Array benötigt, damit die Tabelle damit umgehen kann
        const unitConversionBasic = Utils.convertObjectToArray(result, "uid");
        dispatch({
          type: ReducerActions.UNIT_CONVERSION_BASIC_FETCH_SUCCESS,
          payload: unitConversionBasic,
        });
      }
    );
    // Umrechnungen Produkte holen
    UnitConversion.getAllConversionProducts({firebase: firebase}).then(
      (result) => {
        const unitConversionBasicProducts = Utils.convertObjectToArray(
          result,
          "uid"
        );
        dispatch({
          type: ReducerActions.UNIT_CONVERSION_PRODUCTS_FETCH_SUCCESS,
          payload: unitConversionBasicProducts,
        });
      }
    );
  }, []);
  React.useEffect(() => {
    if (editMode) {
      // Produkte holen
      if (state.products.length === 0) {
        dispatch({
          type: ReducerActions.FETCH_INIT,
          payload: {field: "products"},
        });
        Product.getAllProducts({firebase: firebase, onlyUsable: true})
          .then((result) => {
            dispatch({
              type: ReducerActions.PRODUCTS_FETCH_SUCCESS,
              payload: result,
            });
          })
          .catch((error) => {
            console.error(error);
            dispatch({
              type: ReducerActions.GENERIC_ERROR,
              payload: error,
            });
          });
      }
      // Einheiten holen
      if (state.units.length === 0) {
        dispatch({
          type: ReducerActions.FETCH_INIT,
          payload: {field: "units"},
        });
        Unit.getAllUnits({firebase: firebase})
          .then((result) => {
            dispatch({
              type: ReducerActions.UNITS_FETCH_SUCCESS,
              payload: result,
            });
          })
          .catch((error) => {
            dispatch({
              type: ReducerActions.GENERIC_ERROR,
              payload: error,
            });
          });
      }
    }
  }, [editMode]);
  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
	// Edit Mode wechsel
	// ------------------------------------------ */
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  /* ------------------------------------------
	// Tab wechseln
	// ------------------------------------------ */
  const onTabChange = (event: React.BaseSyntheticEvent, value: any) => {
    setTabValue(value);
  };
  /* ------------------------------------------
	// PopUp öffnen um neue Umrechnung anzulegen
	// ------------------------------------------ */
  const onAddUnitConversionClick = () => {
    let conversionType: UnitConversionType;

    switch (tabValue) {
      case 0:
        conversionType = UnitConversionType.BASIC;
        break;
      case 1:
        conversionType = UnitConversionType.PRODUCT;
        break;
      default:
        throw new Error(TEXT_TYPE_UNKNOWN);
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
  const onPopUpError = (error: Error) => {
    dispatch({
      type: ReducerActions.GENERIC_ERROR,
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
  const onAddUnitConversion = (unitConversion: UnitConversion) => {
    switch (unitConversionCreateValues.unitConversionType) {
      case UnitConversionType.BASIC:
        dispatch({
          type: ReducerActions.NEW_UNIT_CONVERSION_BASIC,
          payload: unitConversion,
        });
        break;
      case UnitConversionType.PRODUCT:
        dispatch({
          type: ReducerActions.NEW_UNIT_CONVERSION_PRODUCT,
          payload: unitConversion,
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
    UnitConversion.saveUnitConversions({
      firebase: firebase,
      unitConversionBasic: state.unitConversionBasic,
      unitConversionProducts: state.unitConversionProduct,
      authUser: authUser,
    })
      .then(() => {
        dispatch({
          type: ReducerActions.UNIT_CONVERSIONS_SAVED,
          payload: {},
        });
      })
      .catch((error) => {
        dispatch({
          type: ReducerActions.GENERIC_ERROR,
          payload: error,
        });
      });
  };
  /* ------------------------------------------
	// Snackback schliessen
	// ------------------------------------------ */
  const handleSnackbarClose = (
    event: Event | React.SyntheticEvent<any, Event>,
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch({
      type: ReducerActions.SNACKBAR_CLOSE,
      payload: {},
    });
  };
  /* ------------------------------------------
	// OnChange der EditTable
	// ------------------------------------------ */
  const onChangeEditTableField = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const unitConversionField = event.target.id.split("_");
    switch (tabValue) {
      case 0:
        dispatch({
          type: ReducerActions.UNIT_CONVERSION_BASIC_ON_CHANGE,
          payload: {
            uid: unitConversionField[1],
            field: unitConversionField[0],
            value: event.target.value,
          },
        });
        break;
      case 1:
        dispatch({
          type: ReducerActions.UNIT_CONVERSION_PRODUCT_ON_CHANGE,
          payload: {
            uid: unitConversionField[1],
            field: unitConversionField[0],
            value: event.target.value,
          },
        });
        break;
      default:
        throw new Error(TEXT_TYPE_UNKNOWN);
    }
  };
  /* ------------------------------------------
	// Eintrag aus Tabelle löschen
	// ------------------------------------------ */
  const onTableRowDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    const pressedButton = event.currentTarget.id.split("_");
    switch (tabValue) {
      case 0:
        dispatch({
          type: ReducerActions.DELETE_BASIC_UNIT_CONVERSION,
          payload: {uid: pressedButton[1]},
        });

        break;
      case 1:
        dispatch({
          type: ReducerActions.DELETE_PRODUCT_UNIT_CONVERSION,
          payload: {uid: pressedButton[1]},
        });
        break;
      default:
        throw new Error(TEXT_TYPE_UNKNOWN);
    }
  };
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT_PAGE_TITLE_UNIT_CONVERSION}
        subTitle={TEXT_PAGE_SUBTITLE_UNIT_CONVERSION}
      />
      <ButtonRow
        key="buttons_edit"
        buttons={[
          {
            id: "edit",
            hero: true,
            visible: !editMode && authUser.roles.includes(Role.communityLeader),
            label: TEXT_EDIT,
            variant: "contained",
            color: "primary",
            onClick: toggleEditMode,
          },
          {
            id: "save",
            hero: true,
            visible: editMode && authUser.roles.includes(Role.communityLeader),
            label: TEXT_SAVE,
            variant: "contained",
            color: "primary",
            onClick: onSaveClick,
          },
          {
            id: "add",
            hero: true,
            visible: authUser.roles.includes(Role.communityLeader) && editMode,
            label: TEXT_ADD,
            variant: "outlined",
            color: "primary",
            onClick: onAddUnitConversionClick,
          },
        ]}
      />
      {/* ===== BODY ===== */}
      <Container sx={classes.container} component="main" maxWidth="md">
        <Backdrop sx={classes.backdrop} open={state.isLoading.overall}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          <Grid item key={"gridTabs"} xs={12}>
            <Tabs value={tabValue} onChange={onTabChange} centered>
              <Tab
                // className={classes.tabs}
                label={TEXT_BASIC}
              />
              <Tab label={TEXT_PRODUCT_SPECIFIC} />
            </Tabs>
          </Grid>

          {state.error && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={state.error}
                messageTitle={TEXT_ALERT_TITLE_UUPS}
              />
            </Grid>
          )}

          {/* Tabs */}
          {tabValue === 0 && (
            <Grid item key={"BasicConversionPanel"} xs={12}>
              <br />
              <BasicConversionPanel
                unitConversions={state.unitConversionBasic}
                onChangeField={onChangeEditTableField}
                onDeleteClick={onTableRowDelete}
                editMode={editMode}
              />
            </Grid>
          )}
          {tabValue === 1 && (
            <Grid item key={"BasicConversionPanel"} xs={12}>
              <br />
              <ProductConversionPanel
                unitConversions={state.unitConversionProduct}
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
        units={state.units}
        products={state.products}
        dialogOpen={unitConversionCreateValues.popUpOpen}
        unitConversionType={unitConversionCreateValues.unitConversionType}
        handleCreate={onAddUnitConversion}
        handleClose={onPopUpClose}
        handleError={onPopUpError}
      />
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ====================== Basic Conversion Panel  ====================
// =================================================================== */
interface BasicConversionPanelProps {
  unitConversions: UnitConversion[];
  onChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  editMode: boolean;
}
const BasicConversionPanel = ({
  unitConversions,
  onChangeField,
  onDeleteClick,
  editMode,
}: BasicConversionPanelProps) => {
  const classes = useCustomStyles();

  return (
    <Card sx={classes.card} key={"cardBasicUnitConversion"}>
      <CardContent sx={classes.cardContent} key={"cardTagsContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_BASIC}
        </Typography>
        {editMode ? (
          <Grid container spacing={2}>
            {/* Überschriften */}
            <Grid item xs={3}>
              <Typography variant="subtitle1" align="center">
                {TEXT_DENOMINATOR}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle1" align="center">
                {TEXT_UNIT_FROM}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle1" align="center">
                {TEXT_NUMERATOR}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle1" align="center">
                {TEXT_UNIT_TO}
              </Typography>
            </Grid>
            <Grid item xs={2} />

            <Divider />
            {unitConversions.map((conversionRule) => (
              <BasicConversionEditRow
                key={"basicConversionRow_" + conversionRule.uid}
                unitConversion={conversionRule}
                onChangeField={onChangeField}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </Grid>
        ) : (
          <EnhancedTable
            tableData={unitConversions}
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
interface BasicConversionEditRowProps {
  unitConversion: UnitConversion;
  onChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const BasicConversionEditRow = ({
  unitConversion,
  onChangeField,
  onDeleteClick,
}: BasicConversionEditRowProps) => {
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
          inputProps={{style: {textAlign: "center"}}}
        />
      </Grid>
      <Grid item xs={2} key={"grid_fromUnit_" + unitConversion.uid}>
        <Typography color="textSecondary" align="center">
          {unitConversion.fromUnit}
        </Typography>
      </Grid>
      <Grid item xs={3} key={"grid_numerator_" + unitConversion.uid}>
        <TextField
          id={"numerator_" + unitConversion.uid}
          key={"numerator_" + unitConversion.uid}
          value={unitConversion.numerator}
          onChange={onChangeField}
          fullWidth
          inputProps={{style: {textAlign: "center"}}}
        />
      </Grid>
      <Grid item xs={2} key={"grid_toUnit_" + unitConversion.uid}>
        <Typography color="textSecondary" align="center">
          {unitConversion.toUnit}
        </Typography>
      </Grid>
      <Grid item xs={2} key={"grid_deleteRow_" + unitConversion.uid}>
        <IconButton
          color="primary"
          component="span"
          id={"deleteRow_" + unitConversion.uid}
          onClick={onDeleteClick}
          size="large"
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
interface ProductConversionPanelProps {
  unitConversions: UnitConversion[];
  onChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  editMode: boolean;
}
const ProductConversionPanel = ({
  unitConversions,
  onChangeField,
  onDeleteClick,
  editMode,
}: ProductConversionPanelProps) => {
  const classes = useCustomStyles();

  return (
    <Card sx={classes.card} key={"cardBasicUnitConversion"}>
      <CardContent sx={classes.cardContent} key={"cardTagsContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_PRODUCT_SPECIFIC}
        </Typography>
        {editMode ? (
          <Grid container spacing={2}>
            {/* Überschriften */}
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1">{TEXT_PRODUCT}</Typography>
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography variant="subtitle1" align="center">
                {TEXT_DENOMINATOR}
              </Typography>
            </Grid>
            <Grid item xs={2} sm={1}>
              <Typography variant="subtitle1" align="center">
                {TEXT_UNIT_FROM}
              </Typography>
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography variant="subtitle1" align="center">
                {TEXT_NUMERATOR}
              </Typography>
            </Grid>
            <Grid item xs={2} sm={1}>
              <Typography variant="subtitle1" align="center">
                {TEXT_UNIT_TO}
              </Typography>
            </Grid>
            <Grid item xs={2} />

            <Divider />
            {unitConversions.map((conversionRule) => (
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
            tableData={unitConversions}
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
interface ProductConversionEditRowProps {
  unitConversion: UnitConversion;
  onChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const ProductConversionEditRow = ({
  unitConversion,
  onChangeField,
  onDeleteClick,
}: ProductConversionEditRowProps) => {
  return (
    <React.Fragment>
      <Grid item xs={12} sm={4} key={"grid_productName_" + unitConversion.uid}>
        <Typography color="textSecondary">
          {unitConversion.productName}
        </Typography>
      </Grid>
      <Grid item xs={3} sm={2} key={"grid_denominator_" + unitConversion.uid}>
        <TextField
          id={"denominator_" + unitConversion.uid}
          key={"denominator_" + unitConversion.uid}
          value={unitConversion.denominator}
          onChange={onChangeField}
          fullWidth
          inputProps={{style: {textAlign: "center"}}}
        />
      </Grid>
      <Grid item xs={2} sm={1} key={"grid_fromUnit_" + unitConversion.uid}>
        <Typography color="textSecondary" align="center">
          {unitConversion.fromUnit}
        </Typography>
      </Grid>
      <Grid item xs={3} sm={2} key={"grid_numerator_" + unitConversion.uid}>
        <TextField
          id={"numerator_" + unitConversion.uid}
          key={"numerator_" + unitConversion.uid}
          value={unitConversion.numerator}
          onChange={onChangeField}
          fullWidth
          inputProps={{style: {textAlign: "center"}}}
        />
      </Grid>
      <Grid item xs={2} sm={1} key={"grid_toUnit_" + unitConversion.uid}>
        <Typography color="textSecondary" align="center">
          {unitConversion.toUnit}
        </Typography>
      </Grid>
      <Grid item xs={2} sm={2} key={"grid_deleteRow_" + unitConversion.uid}>
        <IconButton
          color="primary"
          component="span"
          id={"deleteRow_" + unitConversion.uid}
          onClick={onDeleteClick}
          size="large"
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

const condition = (authUser: AuthUser | null) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(UnitConversionPage);
