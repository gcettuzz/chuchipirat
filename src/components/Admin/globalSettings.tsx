import React from "react";
import {compose} from "react-recompose";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Switch from "@material-ui/core/Switch";

import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import {
  SAVE_SUCCESS as TEXT_SAVE_SUCCESS,
  GLOBAL_SETTINGS as TEXT_GLOBAL_SETTINGS,
  EDIT as TEXT_EDIT,
  SAVE as TEXT_SAVE,
  CANCEL as TEXT_CANCEL,
  SIGN_OUT as TEXT_SIGN_OUT,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  GLOBAL_SETTINGS_ALLOW_SIGNUP_LABEL as TEXT_GLOBAL_SETTINGS_ALLOW_SIGNUP_LABEL,
  GLOBAL_SETTINGS_ALLOW_SIGNUP_DESCRIPTION as TEXT_GLOBAL_SETTINGS_ALLOW_SIGNUP_DESCRIPTION,
  GLOBAL_SETTINGS_MAINTENANCE_MODE_LABEL as TEXT_GLOBAL_SETTINGS_MAINTENANCE_MODE_LABEL,
  GLOBAL_SETTINGS_MAINTENANCE_MODE_DESCRIPTION as TEXT_GLOBAL_SETTINGS_MAINTENANCE_MODE_DESCRIPTION,
  SIGN_OUT_ALL_USERS as TEXT_SIGN_OUT_ALL_USERS,
  SIGN_OUT_ALL_USERS_DESCRIPTION as TEXT_SIGN_OUT_ALL_USERS_DESCRIPTION,
  SIGN_OUT_EVERYBODY as TEXT_SIGN_OUT_EVERYBODY,
  DIALOG_SIGNOUT_USERS_CONFIRMATION as TEXT_DIALOG_SIGNOUT_USERS_CONFIRMATION,
  DIALOG_SUBTITLE_SIGNOUT_USERS_CONFIRMATION as TEXT_DIALOG_SUBTITLE_SIGNOUT_USERS_CONFIRMATION,
  DIALOG_TEXT_SIGNOUT_USERS_CONFIRMATION as TEXT_DIALOG_TEXT_SIGNOUT_USERS_CONFIRMATION,
  USERS_ARE_LOGGED_OUT as TEXT_USERS_ARE_LOGGED_OUT,
} from "../../constants/text";

import GlobalSettings from "./globalSettings.class";
import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";

import AlertMessage from "../Shared/AlertMessage";

import AuthUser from "../Firebase/Authentication/authUser.class";
import Role from "../../constants/roles";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";
import {CustomRouterProps} from "../Shared/global.interface";
import {Button, ListItem, useTheme} from "@material-ui/core";
import {DialogType, useCustomDialog} from "../Shared/customDialogContext";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  GLOBAL_SETTINGS_FETCH_INIT,
  GLOBAL_SETTINGS_FETCH_SUCCESS,
  GLOBAL_SETTINGS_SAVE_SUCCESS,
  GLOBAL_SETTINGS_ON_CHANGE,
  SIGN_OUT_ALL_USERS,
  CLOSE_SNACKBAR,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  globalSettings: GlobalSettings;
  isError: boolean;
  error: Error | null;
  isLoading: boolean;
  snackbar: Snackbar;
};

const inititialState: State = {
  globalSettings: new GlobalSettings(),
  error: null,
  isError: false,
  isLoading: false,
  snackbar: {open: false, severity: "success", message: ""},
};

const globalSettingsReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.GLOBAL_SETTINGS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case ReducerActions.GLOBAL_SETTINGS_FETCH_SUCCESS:
      return {
        ...state,
        globalSettings: action.payload as GlobalSettings,
        isLoading: false,
        isError: false,
      };
    case ReducerActions.GLOBAL_SETTINGS_ON_CHANGE:
      return {
        ...state,
        globalSettings: {
          ...state.globalSettings,
          ...action.payload,
        },
      };
    case ReducerActions.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isError: true,
        error: action.payload as Error,
      };
    case ReducerActions.GLOBAL_SETTINGS_SAVE_SUCCESS:
      return {
        ...state,
        isError: false,
        error: null,
        snackbar: {
          severity: "success",
          message: TEXT_SAVE_SUCCESS,
          open: true,
        },
      };
    case ReducerActions.SIGN_OUT_ALL_USERS:
      return {
        ...state,
        isError: false,
        error: null,
        snackbar: {
          severity: "success",
          message: TEXT_USERS_ARE_LOGGED_OUT,
          open: true,
        },
      };
    case ReducerActions.CLOSE_SNACKBAR:
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
      {(authUser) => <GlobalSettingsBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const GlobalSettingsBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const {customDialog} = useCustomDialog();

  const [editMode, setEditMode] = React.useState(false);

  const [state, dispatch] = React.useReducer(
    globalSettingsReducer,
    inititialState
  );

  /* ------------------------------------------
  // Globale Einstellungen holen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatch({
      type: ReducerActions.GLOBAL_SETTINGS_FETCH_INIT,
      payload: {},
    });
    GlobalSettings.getGlobalSettings({firebase})
      .then((result) => {
        dispatch({
          type: ReducerActions.GLOBAL_SETTINGS_FETCH_SUCCESS,
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
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // let newValue;

    // if (event.target.name === "allowSignUp") {
    //   newValue = event.target.checked;
    // } else {
    //   newValue = event.target.value;
    // }

    dispatch({
      type: ReducerActions.GLOBAL_SETTINGS_ON_CHANGE,
      payload: {[event.target.name]: event.target.checked},
    });
  };
  /* ------------------------------------------
  // Alle abmelden
  // ------------------------------------------ */
  const onSignOutAllUsers = async () => {
    // Löschung wurde bestätigt. Löschen kann losgehen
    const isConfirmed = await customDialog({
      dialogType: DialogType.ConfirmSecure,
      deletionDialogProperties: {confirmationString: "logoff"},
      title: TEXT_DIALOG_SIGNOUT_USERS_CONFIRMATION,
      subtitle: TEXT_DIALOG_SUBTITLE_SIGNOUT_USERS_CONFIRMATION,
      text: TEXT_DIALOG_TEXT_SIGNOUT_USERS_CONFIRMATION,
      buttonTextCancel: TEXT_CANCEL,
      buttonTextConfirm: TEXT_SIGN_OUT,
    });
    if (!isConfirmed) {
      return;
    }
    GlobalSettings.signOutAllUsers({firebase: firebase, authUser: authUser!})
      .then(() => {
        dispatch({
          type: ReducerActions.SIGN_OUT_ALL_USERS,
          payload: {},
        });
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  /* ------------------------------------------
  // Einstellungen speichern
  // ------------------------------------------ */
  const onSaveClick = () => {
    GlobalSettings.save({
      firebase: firebase,
      globalSettings: state.globalSettings,
      authUser: authUser as AuthUser,
    })
      .then(() => {
        dispatch({
          type: ReducerActions.GLOBAL_SETTINGS_SAVE_SUCCESS,
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
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch({
      type: ReducerActions.CLOSE_SNACKBAR,
      payload: {},
    });
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_GLOBAL_SETTINGS} />

      <ButtonRow
        key="buttons_edit"
        buttons={[
          {
            id: "edit",
            hero: true,
            visible: true,

            label: TEXT_EDIT,
            variant: "contained",
            color: "primary",
            onClick: toggleEditMode,
          },
          {
            id: "save",
            hero: true,
            visible: true,
            label: TEXT_SAVE,
            variant: "outlined",
            color: "primary",
            disabled: !editMode,
            onClick: onSaveClick,
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
                error={state.error!}
                messageTitle={TEXT_ALERT_TITLE_UUPS}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <PanelGlobalSettings
              editMode={editMode}
              globalSettings={state.globalSettings}
              onChange={onChange}
              onSignOutAllUsers={onSignOutAllUsers}
            />
          </Grid>
        </Grid>
      </Container>
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
// /* ===================================================================
// // ======================== Feed Einträge löschen ====================
// // =================================================================== */
interface PanelGlobalSettingsProps {
  editMode: boolean;
  globalSettings: GlobalSettings;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSignOutAllUsers: () => void;
}
const PanelGlobalSettings = ({
  editMode,
  globalSettings,
  onChange,
  onSignOutAllUsers,
}: PanelGlobalSettingsProps) => {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <List>
          <ListItem>
            <ListItemText
              primary={TEXT_GLOBAL_SETTINGS_ALLOW_SIGNUP_LABEL}
              secondary={TEXT_GLOBAL_SETTINGS_ALLOW_SIGNUP_DESCRIPTION}
            />
            <ListItemSecondaryAction>
              <Switch
                checked={globalSettings.allowSignUp}
                onChange={onChange}
                name={"allowSignUp"}
                id={"allowSignUp"}
                color="primary"
                disabled={!editMode}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary={TEXT_GLOBAL_SETTINGS_MAINTENANCE_MODE_LABEL}
              secondary={TEXT_GLOBAL_SETTINGS_MAINTENANCE_MODE_DESCRIPTION}
            />
            <ListItemSecondaryAction>
              <Switch
                checked={globalSettings.maintenanceMode}
                onChange={onChange}
                name={"maintenanceMode"}
                id={"maintenanceMode"}
                color="primary"
                disabled={!editMode}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary={TEXT_SIGN_OUT_ALL_USERS}
              secondary={TEXT_SIGN_OUT_ALL_USERS_DESCRIPTION}
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                style={{color: theme.palette.error.main}}
                onClick={onSignOutAllUsers}
              >
                {TEXT_SIGN_OUT_EVERYBODY}
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

const condition = (authUser: AuthUser | null) =>
  !!authUser && !!authUser.roles.includes(Role.admin);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(GlobalSettingsPage);
