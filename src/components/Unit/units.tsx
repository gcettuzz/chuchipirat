import React from "react";
import {compose} from "react-recompose";
import CssBaseline from "@material-ui/core/CssBaseline";

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
  Select,
  MenuItem,
} from "@material-ui/core";

import {
  NAME as TEXT_NAME,
  UNIT as TEXT_UNIT,
  DIMENSION as TEXT_DIMENSION,
  SAVE_SUCCESS as TEXT_SAVE_SUCCESS,
  UNIT_CREATED as TEXT_UNIT_CREATED,
  UNITS as TEXT_UNITS,
  EDIT as TEXT_EDIT,
  SAVE as TEXT_SAVE,
  ADD as TEXT_ADD,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  UNIT_DIMENSION as TEXT_UNIT_DIMENSION,
} from "../../constants/text";
import Role from "../../constants/roles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import EnhancedTable, {
  Column,
  ColumnTextAlign,
  TableColumnTypes,
} from "../Shared/enhancedTable";
import DialogCreateUnit from "./dialogCreateUnit";
import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";
import AlertMessage from "../Shared/AlertMessage";

import useStyles from "../../constants/styles";

import Unit, {UnitDimension} from "./unit.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../Shared/global.interface";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  UNITS_FETCH_INIT,
  UNITS_FETCH_SUCCESS,
  UNITS_NEW_UNIT_ADDED,
  UNITS_SAVED,
  UNITS_ON_CHANGE,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}

type State = {
  units: Unit[];
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
  snackbar: Snackbar;
};
interface DispatchAction {
  type: ReducerActions;
  payload: {[key: string]: any};
}

const inititialState: State = {
  units: [],
  isLoading: false,
  isError: false,
  error: null,
  snackbar: {open: false, severity: "success", message: ""},
};

const unitsReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.UNITS_FETCH_INIT:
      // Daten werden geladen
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.UNITS_FETCH_SUCCESS:
      // Daten erfolgreich geholt
      return {
        ...state,
        units: action.payload as Unit[],
        isLoading: false,
        isError: false,
      };
    case ReducerActions.UNITS_NEW_UNIT_ADDED:
      // Neue Einheit wurde angelegt
      return {
        ...state,
        isError: false,
        units: state.units.concat([
          {
            key: action.payload.key,
            name: action.payload.name,
            dimension: action.payload.dimension,
          },
        ]),
        snackbar: {
          severity: action.payload.snackbarSeverity,
          message: action.payload.snackbarText,
          open: true,
        } as Snackbar,
      };
    case ReducerActions.UNITS_ON_CHANGE:
      // Änderung des Feldes
      return {
        ...state,
        units: state.units.map((unit) => {
          if (unit.key === action.payload.key) {
            unit[action.payload.field] = action.payload.value;
          }
          return unit;
        }),
      };
    case ReducerActions.UNITS_SAVED:
      // Alle gespeichert
      return {
        ...state,
        isError: false,
        error: null,
        snackbar: {
          severity: "success",
          message: TEXT_SAVE_SUCCESS,
          open: true,
        } as Snackbar,
      };
    case ReducerActions.GENERIC_ERROR:
      // allgemeiner Fehler
      return {
        ...state,
        isError: true,
        error: action.payload as Error,
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
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

const TABLE_COLUMS: Column[] = [
  {
    id: "key",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.left,
    disablePadding: false,
    label: TEXT_UNIT,
    visible: true,
  },
  {
    id: "name",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.left,
    disablePadding: false,
    label: TEXT_NAME,
    visible: true,
  },
  {
    id: "dimension",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.left,
    disablePadding: false,
    label: TEXT_DIMENSION,
    visible: true,
  },
];

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const UnitsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <UnitsBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const UnitsBase: React.FC<CustomRouterProps & {authUser: AuthUser | null}> = ({
  authUser,
  ...props
}) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [state, dispatch] = React.useReducer(unitsReducer, inititialState);

  const [unitCreateValues, setUnitCreateValues] = React.useState({
    popUpOpen: false,
  });
  const [editMode, setEditMode] = React.useState(false);

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatch({type: ReducerActions.UNITS_FETCH_INIT, payload: {}});

    Unit.getAllUnits({firebase: firebase})
      .then((result) => {
        dispatch({
          type: ReducerActions.UNITS_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  }, []);
  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
  // onChangeField
  // ------------------------------------------ */
  const onChangeField = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<{value: unknown}>
  ) => {
    const unitField = event.target.name.split("_");

    dispatch({
      type: ReducerActions.UNITS_ON_CHANGE,
      payload: {
        key: unitField[1],
        field: unitField[0],
        value: event.target.value,
      },
    });
  };
  /* ------------------------------------------
  // Speichern
  // ------------------------------------------ */
  const onSaveClick = () => {
    Unit.saveUnits({firebase: firebase, units: state.units, authUser: authUser})
      .then(() => {
        dispatch({type: ReducerActions.UNITS_SAVED, payload: {}});
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  /* ------------------------------------------
  // Edit Mode wechsel
  // ------------------------------------------ */
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  /* ------------------------------------------
  // PopUp öffnen
  // ------------------------------------------ */
  const onAddUnitClick = () => {
    setUnitCreateValues({...unitCreateValues, popUpOpen: true});
  };
  /* ------------------------------------------
  // Einheit hinzufügen --> PopUp schliessen
  // ------------------------------------------ */
  const onPopUpClose = () => {
    setUnitCreateValues({...unitCreateValues, popUpOpen: false});
  };
  /* ------------------------------------------
  // Einheit wurde angelegt
  // ------------------------------------------ */
  const onAddUnit = (unit: Unit) => {
    Unit.createUnit({firebase: firebase, unit: unit, authUser: authUser})
      .then(() => {
        // Snackbar
        dispatch({
          type: ReducerActions.UNITS_NEW_UNIT_ADDED,
          payload: {
            key: unit.key,
            name: unit.name,
            snackbarSeverity: "success",
            snackbarText: TEXT_UNIT_CREATED(unit.key + " - " + unit.name),
          },
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });

    setUnitCreateValues({...unitCreateValues, popUpOpen: false});
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch({
      type: ReducerActions.SNACKBAR_CLOSE,
      payload: {},
    });
  };

  return (
    <React.Fragment>
      <CssBaseline />
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_UNITS} />
      <ButtonRow
        key="buttons_edit"
        buttons={[
          {
            id: "edit",
            hero: true,
            visible: !editMode && authUser.roles.includes(Role.admin),
            label: TEXT_EDIT,
            variant: "contained",
            color: "primary",
            onClick: toggleEditMode,
          },
          {
            id: "save",
            hero: true,
            visible: editMode && authUser.roles.includes(Role.admin),
            label: TEXT_SAVE,
            variant: "outlined",
            color: "primary",
            onClick: onSaveClick,
          },
          {
            id: "add",
            hero: true,
            visible: editMode && authUser.roles.includes(Role.admin),
            label: TEXT_ADD,
            variant: "contained",
            color: "primary",
            onClick: onAddUnitClick,
          },
        ]}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          {state.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={state.error as Error}
                messageTitle={TEXT_ALERT_TITLE_UUPS}
              />
            </Grid>
          )}
          {/* Tabelle */}
          <Grid item key={"error"} xs={12}>
            <TablePanel
              units={state.units}
              editMode={editMode}
              onChangeField={onChangeField}
            />
          </Grid>
        </Grid>
      </Container>
      <DialogCreateUnit
        dialogOpen={unitCreateValues.popUpOpen}
        handleCreate={onAddUnit}
        handleClose={onPopUpClose}
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
// =============================== Table =============================
// =================================================================== */
interface TablePanelProps {
  units: Unit[];
  onChangeField: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<{value: unknown}>
  ) => void;
  editMode: boolean;
}
const TablePanel = ({units, onChangeField, editMode}: TablePanelProps) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Card className={classes.card} key={"cardUnits"}>
        <CardContent className={classes.cardContent} key={"cardContentUnits"}>
          {editMode ? (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle1">{TEXT_UNIT}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle1">{TEXT_NAME}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle1">{TEXT_DIMENSION}</Typography>
              </Grid>
              <Divider />
              {units.map((unit) => (
                <React.Fragment key={"unitFragment_" + unit.key}>
                  <Grid item xs={4} key={"gridItemKey_" + unit.key}>
                    <TextField
                      id={"key_" + unit.key}
                      key={"key_" + unit.key}
                      name={"key_" + unit.key}
                      disabled
                      value={unit.key}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4} key={"gridItemName_" + unit.key}>
                    <TextField
                      id={"name_" + unit.key}
                      key={"name_" + unit.key}
                      name={"name_" + unit.key}
                      value={unit.name}
                      onChange={onChangeField}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4} key={"gridItemDim_" + unit.key}>
                    <Select
                      labelId="unit-dimension"
                      id={"dimension_" + unit.key}
                      name={"dimension_" + unit.key}
                      value={unit.dimension}
                      onChange={onChangeField}
                      fullWidth
                    >
                      <MenuItem value={UnitDimension.volume}>
                        {TEXT_UNIT_DIMENSION[UnitDimension.volume]}
                      </MenuItem>
                      <MenuItem value={UnitDimension.mass}>
                        {TEXT_UNIT_DIMENSION[UnitDimension.mass]}
                      </MenuItem>
                      <MenuItem value={UnitDimension.dimensionless}>
                        {TEXT_UNIT_DIMENSION[UnitDimension.dimensionless]}
                      </MenuItem>
                    </Select>
                    {/* <TextField
                      id={"dim_" + unit.key}
                      key={"dim_" + unit.key}
                      value={unit.dimension}
                      onChange={onChangeField}
                      fullWidth
                    /> */}
                  </Grid>
                  <Grid item xs={12} key={"gridItemDivider_" + unit.key}>
                    <Divider />
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          ) : (
            <EnhancedTable
              tableData={units}
              tableColumns={TABLE_COLUMS}
              keyColum={"key"}
            />
          )}
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

const condition = (authUser: AuthUser | null) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(UnitsPage);
