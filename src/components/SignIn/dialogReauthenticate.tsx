import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";

import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import {
  REAUTHENTICATE_DIALOG_TITLE as TEXT_REAUTHENTICATE_DIALOG_TITLE,
  SIGN_IN_WHY_REAUTHENTICATE as TEXT_SIGN_IN_WHY_REAUTHENTICATE,
  EMAIL as TEXT_EMAIL,
  PASSWORD as TEXT_PASSWORD,
  SHOW_PASSWORD as TEXT_SHOW_PASSWORD,
  CANCEL as TEXT_CANCEL,
  SIGN_IN as TEXT_SIGN_IN,
} from "../../constants/text";
import User from "../User/user.class";

import AlertMessage from "../Shared/AlertMessage";
import {ForgotPasswordLink} from "../AuthServiceHandler/passwordReset";
import {FirebaseError} from "@firebase/util";
import Firebase from "../Firebase/firebase.class";
import AuthUser from "../Firebase/Authentication/authUser.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  UPDATE_FIELD,
  SET_INITIAL_VALUES,
  GENERIC_ERROR,
}

type ReAuthData = {
  email: string;
  password: string;
};
type State = {
  reAuthData: ReAuthData;
  error: FirebaseError | null;
};

type DispatchAction = {
  type: ReducerActions;
  payload: any;
};

const inititialState: State = {
  reAuthData: {
    email: "",
    password: "",
  },
  error: null,
};
const reAuthenticateReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.UPDATE_FIELD:
      return {
        ...state,
        reAuthData: {
          ...state.reAuthData,
          [action.payload.field]: action.payload.value,
        },
      };
    case ReducerActions.SET_INITIAL_VALUES:
      return inititialState;
    case ReducerActions.GENERIC_ERROR:
      return {...state, error: action.payload as FirebaseError};
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// ==================== Pop Up Abteilung hinzufügen ==================
// =================================================================== */
interface DialogReauthenticateProps {
  firebase: Firebase;
  dialogOpen: boolean;
  handleOk: () => void;
  handleClose: () => void;
  authUser: AuthUser | null;
}
const DialogReauthenticate = ({
  firebase,
  dialogOpen,
  handleOk,
  handleClose: handleCloseSuper,
  authUser = null,
}: DialogReauthenticateProps) => {
  const [state, dispatch] = React.useReducer(
    reAuthenticateReducer,
    inititialState
  );
  const [showPassword, setShowPassword] = React.useState(false);

  if (!state.reAuthData.email && authUser) {
    dispatch({
      type: ReducerActions.UPDATE_FIELD,
      payload: {field: "email", value: authUser.email},
    });
  }

  /* ------------------------------------------
  // Change Ereignis Felder
  // ------------------------------------------ */
  const onChangeField = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ReducerActions.UPDATE_FIELD,
      payload: {field: event.target.id, value: event.target.value},
    });
  };
  /* ------------------------------------------
  // PopUp Ok
  // ------------------------------------------ */
  const onSignIn = async () => {
    let hasError = false;
    await firebase
      .reauthenticateWithCredential({
        email: state.reAuthData.email,
        password: state.reAuthData.password,
      })
      .then(() => {
        // Login in eigener Sammlung registrieren
        User.registerSignIn({
          firebase: firebase,
          authUser: authUser!,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        hasError = true;
      });

    if (!hasError) {
      handleOk();
      dispatch({type: ReducerActions.SET_INITIAL_VALUES, payload: {}});
    }
  };
  /* ------------------------------------------
  // PopUp Schliessen
  // ------------------------------------------ */
  const handleClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      // Versehntliches Klicken ausserhalb des Dialog
      // schliesst diesen nicht
      return;
    }
    handleCloseSuper();
  };
  /* ------------------------------------------
  // Password-Button-Handler
  // ------------------------------------------ */
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialogReauthenticate"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="dialogTitleReauthenticate">
        {TEXT_REAUTHENTICATE_DIALOG_TITLE}
      </DialogTitle>
      <DialogContent>
        {!state.error && (
          <AlertMessage
            severity={"info"}
            body={TEXT_SIGN_IN_WHY_REAUTHENTICATE}
          />
        )}
        {state.error && (
          <AlertMessage
            error={state.error}
            body={
              state.error.code === "auth/too-many-requests" ? (
                <ForgotPasswordLink />
              ) : (
                ""
              )
            }
          />
        )}
        {/* Mailadresse */}
        <TextField
          disabled={authUser ? true : false}
          type="email"
          margin="normal"
          required
          fullWidth
          id="email"
          label={TEXT_EMAIL}
          name="reAuth_email"
          autoFocus
          value={state.reAuthData.email}
          onChange={onChangeField}
        />
        {/* Passwort */}
        <TextField
          type={showPassword ? "text" : "password"}
          margin="normal"
          required
          fullWidth
          id="password"
          name="password"
          label={TEXT_PASSWORD}
          autoComplete="new-password"
          value={state.reAuthData.password}
          onChange={onChangeField}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={TEXT_SHOW_PASSWORD}
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="outlined">
          {TEXT_CANCEL}
        </Button>
        <Button onClick={onSignIn} color="primary" variant="contained">
          {TEXT_SIGN_IN}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogReauthenticate;
