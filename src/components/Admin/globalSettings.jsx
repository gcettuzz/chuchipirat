import React, { useReducer } from "react";
import { compose } from "recompose";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Switch from "@material-ui/core/Switch";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import GlobalSettings from "./globalSettings.class";
import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import CustomSnackbar from "../Shared/customSnackbar";

import AlertMessage from "../Shared/AlertMessage";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import Feed from "../Shared/feed.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const REDUCER_ACTIONS = {
  GLOBAL_SETTINGS_FETCH_INIT: "GLOBAL_SETTINGS_FETCH_INIT",
  GLOBAL_SETTINGS_FETCH_SUCCESS: "GLOBAL_SETTINGS_FETCH_SUCCESS",
  GLOBAL_SETTINGS_SAVE_SUCCESS: "GLOBAL_SETTINGS_SAVE_SUCCESS",
  GLOBAL_SETTINGS_ON_CHANGE: "GLOBAL_SETTINGS_ON_CHANGE",
  CLOSE_SNACKBAR: "CLOSE_SNACKBAR",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const globalSettingsReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.GLOBAL_SETTINGS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case REDUCER_ACTIONS.GLOBAL_SETTINGS_FETCH_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          allowSignUp: action.payload.allowSignUp,
        },
        isLoading: false,
        isError: false,
      };
    case REDUCER_ACTIONS.GLOBAL_SETTINGS_ON_CHANGE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
      };
    case REDUCER_ACTIONS.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isError: true,
        error: action.payload,
      };
    case REDUCER_ACTIONS.GLOBAL_SETTINGS_SAVE_SUCCESS:
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
    case REDUCER_ACTIONS.CLOSE_SNACKBAR:
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

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const GlobalSettingsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <GlobalSettingsBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const GlobalSettingsBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [editMode, setEditMode] = React.useState(false);

  const [globalSettings, dispatchGlobalSettings] = React.useReducer(
    globalSettingsReducer,
    {
      data: { allowSignUp: false },
      error: {},
      isError: false,
      isLoading: false,
      snackbar: { open: false, severity: "success", message: "" },
    }
  );

  /* ------------------------------------------
  // Globale Einstellungen holen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatchGlobalSettings({
      type: REDUCER_ACTIONS.GLOBAL_SETTINGS_FETCH_INIT,
    });
    GlobalSettings.getGlobalSettings({ firebase })
      .then((result) => {
        dispatchGlobalSettings({
          type: REDUCER_ACTIONS.GLOBAL_SETTINGS_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatchGlobalSettings({
          type: REDUCER_ACTIONS.GENERIC_FAILURE,
          error: error,
        });
      });
  }, []);
  /* ------------------------------------------
  // Edit Mode wechsel
  // ------------------------------------------ */
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  /* ------------------------------------------
  // Feldwert ändern
  // ------------------------------------------ */
  const onChange = (event) => {
    let newValue;

    if (event.target.name === "allowSignUp") {
      newValue = event.target.checked;
    } else {
      newValue = event.target.value;
    }

    dispatchGlobalSettings({
      type: REDUCER_ACTIONS.GLOBAL_SETTINGS_ON_CHANGE,
      field: event.target.name,
      value: newValue,
    });
  };
  /* ------------------------------------------
  // Einstellungen speichern
  // ------------------------------------------ */
  const onSaveClick = () => {
    GlobalSettings.setGlobalSettings({
      firebase: firebase,
      globalSettings: globalSettings.data,
    })
      .then(() => {
        dispatchGlobalSettings({
          type: REDUCER_ACTIONS.GLOBAL_SETTINGS_SAVE_SUCCESS,
        });
      })
      .catch((error) => {
        dispatchGlobalSettings({
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
    dispatchGlobalSettings({
      type: REDUCER_ACTIONS.CLOSE_SNACKBAR,
    });
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT.PAGE_TITLE_GLOBAL_SETTINGS} />

      <ButtonRow
        key="buttons_edit"
        buttons={[
          {
            id: "edit",
            hero: true,
            visible: true,

            label: TEXT.BUTTON_EDIT,
            variant: "contained",
            color: "primary",
            onClick: toggleEditMode,
          },
          {
            id: "save",
            hero: true,
            visible: true,
            label: TEXT.BUTTON_SAVE,
            variant: "outlined",
            color: "primary",
            disabled: !editMode,
            onClick: onSaveClick,
          },
        ]}
      />

      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={globalSettings.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          {globalSettings.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={globalSettings.error}
                messageTitle={TEXT.ALERT_TITLE_UUPS}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <PanelGlobalSettings
              editMode={editMode}
              globalSettings={globalSettings.data}
              onChange={onChange}
            />
          </Grid>
        </Grid>
      </Container>
      <CustomSnackbar
        message={globalSettings.snackbar.message}
        severity={globalSettings.snackbar.severity}
        snackbarOpen={globalSettings.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
// /* ===================================================================
// // ======================== Feed Einträge löschen ====================
// // =================================================================== */
const PanelGlobalSettings = ({ editMode, globalSettings, onChange }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <List>
          <ListItemText
            primary={TEXT.GLOBAL_SETTINGS_ALLOW_SIGNUP_LABEL}
            secondary={TEXT.GLOBAL_SETTINGS_ALLOW_SIGNUP_DESCRIPTION}
          />
          <ListItemSecondaryAction>
            <Switch
              checked={globalSettings.allowSignUp}
              onChange={onChange}
              name={"allowSignUp"}
              color="primary"
              disabled={!editMode}
            />
          </ListItemSecondaryAction>
        </List>
      </CardContent>
    </Card>
  );
};

const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(GlobalSettingsPage);
