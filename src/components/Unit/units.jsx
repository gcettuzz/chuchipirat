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
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import EnhancedTable, { TABLE_COLUMN_TYPES } from "../Shared/enhancedTable";
import DialogCreateUnit from "./dialogCreateUnit";
import CustomSnackbar from "../Shared/customSnackbar";
import AlertMessage from "../Shared/AlertMessage";

import useStyles from "../../constants/styles";

import Unit from "./unit.class";
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
  UNITS_FETCH_INIT: "UNITS_FETCH_INIT",
  UNITS_FETCH_SUCCESS: "UNITS_FETCH_SUCCESS",
  UNITS_NEW_UNIT_ADDED: "UNITS_NEW_UNIT_ADDED",
  UNITS_SAVED: "UNITS_SAVED",
  UNITS_ON_CHANGE: "UNITS_ON_CHANGE",
  SNACKBAR_CLOSE: "SNACKBAR_CLOSE",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const unitsReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.UNITS_FETCH_INIT:
      // Daten werden geladen
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.UNITS_FETCH_SUCCESS:
      // Daten erfolgreich geholt
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isError: false,
      };
    case REDUCER_ACTIONS.UNITS_NEW_UNIT_ADDED:
      // Neue Einheit wurde angelegt
      return {
        ...state,
        isError: false,
        data: state.data.concat([{ key: action.key, name: action.name }]),
        snackbar: {
          severity: action.snackbarSeverity,
          message: action.snackbarText,
          open: true,
        },
      };
    case REDUCER_ACTIONS.UNITS_ON_CHANGE:
      // Änderung des Feldes
      return {
        ...state,
        data: state.data.map((unit) => {
          if (unit.key === action.key) {
            unit[action.field] = action.value;
          }
          return unit;
        }),
      };
    case REDUCER_ACTIONS.UNITS_SAVED:
      // Alle gespeichert
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
    case REDUCER_ACTIONS.GENERIC_ERROR:
      // allgemeiner Fehler
      return {
        ...state,
        isError: true,
        error: action.payload,
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
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

const TABLE_COLUMS = [
  {
    id: "key",
    type: TABLE_COLUMN_TYPES.STRING,
    textAlign: "left",
    disablePadding: false,
    label: TEXT.FIELD_UNIT,
    visible: true,
  },
  {
    id: "name",
    type: TABLE_COLUMN_TYPES.STRING,
    textAlign: "left",
    disablePadding: false,
    label: TEXT.FIELD_NAME,
    visible: true,
  },
];
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const UnitsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <UnitsBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const UnitsBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [units, dispatchUnits] = React.useReducer(unitsReducer, {
    data: [],
    error: {},
    isError: false,
    isLoading: false,
    snackbar: { open: false, severity: "success", message: "" },
  });
  const [unitCreateValues, setUnitCreateValues] = React.useState({
    popUpOpen: false,
  });
  const [editMode, setEditMode] = React.useState(false);

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatchUnits({ type: REDUCER_ACTIONS.UNITS_FETCH_INIT });
    Unit.getAllUnits(firebase)
      .then((result) => {
        dispatchUnits({
          type: REDUCER_ACTIONS.UNITS_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        dispatchUnits({ type: REDUCER_ACTIONS.GENERIC_ERROR, payload: error });
      });
  }, []);
  /* ------------------------------------------
  // onChangeField
  // ------------------------------------------ */
  const onChangeField = (event) => {
    let unitField = event.target.id.split("_");

    dispatchUnits({
      type: REDUCER_ACTIONS.UNITS_ON_CHANGE,
      key: unitField[1],
      field: unitField[0],
      value: event.target.value,
    });
  };
  /* ------------------------------------------
  // Speichern
  // ------------------------------------------ */
  const onSaveClick = () => {
    Unit.saveUnits(firebase, units.data)
      .then(() => {
        dispatchUnits({ type: REDUCER_ACTIONS.UNITS_SAVED });
      })
      .catch((error) => {
        dispatchUnits({ type: REDUCER_ACTIONS.GENERIC_ERROR, payload: error });
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
    setUnitCreateValues({ ...unitCreateValues, popUpOpen: true });
  };
  /* ------------------------------------------
  // Einheit hinzufügen --> PopUp schliessen
  // ------------------------------------------ */
  const onPopUpClose = () => {
    setUnitCreateValues({ ...unitCreateValues, popUpOpen: false });
  };
  /* ------------------------------------------
  // Fehler beim anlegen der Einheit
  // ------------------------------------------ */
  const onPopUpError = (error) => {
    console.error(error);
    dispatchUnits({ type: REDUCER_ACTIONS.GENERIC_ERROR, payload: error });
    setUnitCreateValues({ ...unitCreateValues, popUpOpen: false });
  };
  /* ------------------------------------------
  // Einheit wurde angelegt
  // ------------------------------------------ */
  const onAddUnit = (key, name) => {
    // Snackbar
    dispatchUnits({
      type: REDUCER_ACTIONS.UNITS_NEW_UNIT_ADDED,
      key: key,
      name: name,
      snackbarSeverity: "success",
      snackbarText: TEXT.UNIT_CREATED(key + " - " + name),
    });
    setUnitCreateValues({ ...unitCreateValues, popUpOpen: false });
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatchUnits({
      type: REDUCER_ACTIONS.SNACKBAR_CLOSE,
    });
  };

  return (
    <React.Fragment>
      <CssBaseline />
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT.PAGE_TITLE_UNITS}
        subTitle={TEXT.PAGE_SUBTITLE_UNITS}
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
            variant: "outlined",
            color: "primary",
            onClick: onSaveClick,
          },
          {
            id: "add",
            hero: true,
            visible:
              authUser.roles.includes(ROLES.SUB_ADMIN) ||
              authUser.roles.includes(ROLES.ADMIN),
            label: TEXT.BUTTON_ADD,
            // variant: "",
            color: "primary",
            onClick: onAddUnitClick,
          },
        ]}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={units.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          {units.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={units.error}
                messageTitle={TEXT.ALERT_TITLE_UUPS}
              />
            </Grid>
          )}
          {/* Tabelle */}
          <Grid item key={"error"} xs={12}>
            <TablePanel
              units={units.data}
              editMode={editMode}
              onChangeField={onChangeField}
            />
          </Grid>
        </Grid>
      </Container>
      <DialogCreateUnit
        firebase={firebase}
        dialogOpen={unitCreateValues.popUpOpen}
        handleCreate={onAddUnit}
        handleClose={onPopUpClose}
        handleError={onPopUpError}
      />
      <CustomSnackbar
        message={units.snackbar.message}
        severity={units.snackbar.severity}
        snackbarOpen={units.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// =============================== Table =============================
// =================================================================== */
const TablePanel = ({ units, onChangeField, editMode }) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Card className={classes.card} key={"cardUnits"}>
        <CardContent className={classes.cardContent} key={"cardContentUnits"}>
          {editMode ? (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle1">{TEXT.FIELD_UNIT}</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="subtitle1">{TEXT.FIELD_NAME}</Typography>
              </Grid>
              <Divider />
              {units.map((unit) => (
                <React.Fragment key={"unitFragment_" + unit.key}>
                  <Grid item xs={4} key={"gridItemKey_" + unit.key}>
                    <TextField
                      id={"key_" + unit.key}
                      key={"key_" + unit.key}
                      disabled
                      value={unit.key}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={8} key={"gridItemName_" + unit.key}>
                    <TextField
                      id={"name_" + unit.key}
                      key={"name_" + unit.key}
                      value={unit.name}
                      onChange={onChangeField}
                      fullWidth
                    />
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

const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(UnitsPage);
