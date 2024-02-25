import React from "react";
import {compose} from "react-recompose";

import {Link} from "react-router-dom";

import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import {Alert, AlertTitle} from "@material-ui/lab";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import InputAdornment from "@material-ui/core/InputAdornment";

import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import PasswordStrengthMeter from "../Shared/passwordStrengthMeter";
import PageTitle from "../Shared/pageTitle";
import useStyles from "../../constants/styles";
import AlertMessage from "../Shared/AlertMessage";
import DialogReauthenticate from "../SignIn/dialogReauthenticate";
import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";

import {AuthMessages} from "../../constants/firebaseMessages";
import * as ROUTES from "../../constants/routes";
import {
  EMAIL as TEXT_EMAIL,
  PASSWORD_CHANGE as TEXT_PASSWORD_CHANGE,
  LOGIN_CHANGE as TEXT_LOGIN_CHANGE,
  PASSWORD_CHANGE_ARE_YOU_READY as TEXT_PASSWORD_CHANGE_ARE_YOU_READY,
  LOGIN_CHANGE_ARE_YOU_READY as TEXT_LOGIN_CHANGE_ARE_YOU_READY,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  PASSWORD_RESET_EXPIRED as TEXT_PASSWORD_RESET_EXPIRED,
  ONE_TWO_TRHEE_DONE as TEXT_ONE_TWO_TRHEE_DONE,
  PASSWORD_HAS_BEEN_CHANGED as TEXT_PASSWORD_HAS_BEEN_CHANGED,
  EMAIL_HAS_BEEN_CHANGED as TEXT_EMAIL_HAS_BEEN_CHANGED,
  VERIFICATION_EMAIL_SENT as TEXT_VERIFICATION_EMAIL_SENT,
  GIVE_VALID_EMAIL as TEXT_GIVE_VALID_EMAIL,
  CHANGE_EMAIL as TEXT_CHANGE_EMAIL,
  PASSWORD as TEXT_PASSWORD,
  SHOW_PASSWORD as TEXT_SHOW_PASSWORD,
  CHANGE_PASSWORD as TEXT_CHANGE_PASSWORD,
  LOGIN_SUCCESSFULL as TEXT_LOGIN_SUCCESSFULL,
  NEW_EMAIL_IDENTICAL as TEXT_NEW_EMAIL_IDENTICAL,
} from "../../constants/text";
import {ImageRepository} from "../../constants/imageRepository";
import LocalStorageKey from "../../constants/localStorage";
import {ForgotPasswordLink} from "../AuthServiceHandler/passwordReset";
import Utils from "../Shared/utils.class";
import User from "../User/user.class";
import {FirebaseError} from "@firebase/util";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../Shared/global.interface";

// ===================================================================
// ======================== globale Funktionen =======================
// ===================================================================
enum ReducerActions {
  UPDATE_FIELD,
  GENERIC_ERROR,
  SUCCESS_MAIL_CHANGE,
  SUCCESS_PW_CHANGE,
  SUCCESS_REAUTHENTICATION,
  SNACKBAR_CLOSE,
}

type PasswordChangeData = {
  email: string;
  password: string;
};

type State = {
  passwordChangeData: PasswordChangeData;
  successPwChange: boolean;
  successEmailChange: boolean;
  error: FirebaseError | null;
  snackbar: Snackbar;
};
type DispatchAction = {
  type: ReducerActions;
  payload: any;
};

const inititialState: State = {
  passwordChangeData: {
    email: "",
    password: "",
  },
  error: null,
  successPwChange: false,
  successEmailChange: false,
  snackbar: {open: false, severity: "info", message: ""},
};

const passwordChangeReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.UPDATE_FIELD:
      return {
        ...state,
        passwordChangeData: {
          ...state.passwordChangeData,
          [action.payload.field]: action.payload.value,
        },
      };
    case ReducerActions.SNACKBAR_CLOSE:
      return {
        ...state,
        snackbar: {...state.snackbar, open: false},
      };
    case ReducerActions.SUCCESS_MAIL_CHANGE:
      return {...state, successEmailChange: true};
    case ReducerActions.SUCCESS_PW_CHANGE:
      return {...state, successPwChange: true};
    case ReducerActions.SUCCESS_REAUTHENTICATION:
      return {
        ...state,
        snackbar: {
          open: true,
          severity: "success",
          message: TEXT_LOGIN_SUCCESSFULL,
        },
      };
    case ReducerActions.GENERIC_ERROR:
      return {...state, error: action.payload as FirebaseError};
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const PasswordChangePage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <PasswordChangeBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const PasswordChangeBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  let resetCode = props.oobCode as string;

  const [state, dispatch] = React.useReducer(
    passwordChangeReducer,
    inititialState
  );

  // kommt die Anfrage aus der Passwort-Zurücksetzen-Mail.
  // Dann ist in der URL der objektCode
  if (props?.oobCode && !resetCode) {
    resetCode = props.oobCode;
  }
  /* ------------------------------------------
  // Email-setzen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (!state.passwordChangeData.email && resetCode && !state.error) {
      // Mailadresse herausfinden
      firebase
        .getEmailFromVerifyCode(resetCode)
        .then((result) => {
          dispatch({
            type: ReducerActions.UPDATE_FIELD,
            payload: {field: "email", value: result},
          });
        })
        .catch((error) => {
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
    } else if (!state.passwordChangeData.email && authUser) {
      dispatch({
        type: ReducerActions.UPDATE_FIELD,
        payload: {field: "email", value: authUser.email},
      });
    }
  }, []);

  // Neu Authentifizieren, wenn nicht über resetCode eingestiegen
  const [reauthenticattion, setReauthenticattion] = React.useState({
    needed: resetCode !== undefined ? false : true,
    done: false,
  });

  /* ------------------------------------------
  // E-Mail ändern
  // ------------------------------------------ */
  const onEmailChange = () => {
    if (!authUser) {
      // um die Mailadresse zu wechseln, muss man angemeldet seint
      return;
    }

    if (authUser.email == state.passwordChangeData.email) {
      dispatch({
        type: ReducerActions.GENERIC_ERROR,
        payload: {code: "", message: TEXT_NEW_EMAIL_IDENTICAL},
      });
      return;
    }

    firebase
      .emailChange(state.passwordChangeData.email)
      .then(() => {
        // Profilfelder updaten
        User.updateEmail({
          firebase: firebase,
          newEmail: state.passwordChangeData.email,
          authUser: authUser,
        }).then(() => {
          dispatch({type: ReducerActions.SUCCESS_MAIL_CHANGE, payload: {}});
        });
      })
      .then(() => {
        // Local Storage anpassen
        updateLocalStorage();
      })
      .then(() => {
        //Email verification code
        firebase.sendEmailVerification().catch((error) => {
          console.error(error);
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  /* ------------------------------------------
  // Session-Storage auf Änderungen umbiegen
  // ------------------------------------------ */
  const updateLocalStorage = () => {
    // Nach dem ändern der Mailadresse muss der Auth-Prozess gestartet werden.
    const user = JSON.parse(localStorage.getItem(LocalStorageKey.AUTH_USER)!);
    user.email = state.passwordChangeData.email;
    user.emailVerified = false;
    localStorage.setItem(LocalStorageKey.AUTH_USER, JSON.stringify(user));
  };
  /* ------------------------------------------
  // Passwort ändern
  // ------------------------------------------ */
  const onPwChange = () => {
    if (!resetCode && authUser) {
      // User angemeldet und ändert PW
      firebase
        .passwordUpdate({password: state.passwordChangeData.password})
        .then(() => {
          dispatch({type: ReducerActions.SUCCESS_PW_CHANGE, payload: {}});
        })
        .catch((error) => {
          console.error(error);
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
    } else if (resetCode) {
      // PW Anhand Reset-Code zurücksetzen
      firebase
        .confirmPasswordReset({
          resetCode: resetCode,
          password: state.passwordChangeData.password,
        })
        .then(() => {
          dispatch({type: ReducerActions.SUCCESS_PW_CHANGE, payload: {}});
        })
        .catch((error) => {
          console.error(error);
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
    }
  };
  /* ------------------------------------------
  // Feldwert ändern
  // ------------------------------------------ */
  const onFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ReducerActions.UPDATE_FIELD,
      payload: {field: event.target.name, value: event.target.value},
    });
  };
  /* ------------------------------------------
// Authentifzierung abbrechen
// ------------------------------------------ */
  const onReauthenticattionCancel = () => {
    props.history.goBack();
  };
  /* ------------------------------------------
  // Authentifzierung erledigt
  // ------------------------------------------ */
  const onReauthenticattionOk = () => {
    dispatch({type: ReducerActions.SUCCESS_REAUTHENTICATION, payload: {}});
    setReauthenticattion({...reauthenticattion, done: true});
  };
  /* ------------------------------------------
  // Snackbar schliessen
  // ------------------------------------------ */
  const onSnackbarClose = () => {
    dispatch({type: ReducerActions.SNACKBAR_CLOSE, payload: {}});
  };

  return (
    <React.Fragment>
      <PageTitle title={resetCode ? TEXT_PASSWORD_CHANGE : TEXT_LOGIN_CHANGE} />
      <Container className={classes.container} component="main" maxWidth="xs">
        <PasswordChangeForm
          resetCode={resetCode}
          passwordChangeData={state.passwordChangeData}
          successEmailChange={state.successEmailChange}
          successPwChange={state.successPwChange}
          error={state.error}
          onFieldChange={onFieldChange}
          onEmailChange={onEmailChange}
          onPwChange={onPwChange}
        />

        {/* PopUp für Reauthentifizierung */}
        {(!authUser || reauthenticattion.needed) && (
          <DialogReauthenticate
            firebase={firebase}
            dialogOpen={reauthenticattion.needed && !reauthenticattion.done}
            handleOk={onReauthenticattionOk}
            handleClose={onReauthenticattionCancel}
            authUser={authUser!}
          />
        )}
        <CustomSnackbar
          message={state.snackbar.message}
          severity={state.snackbar.severity}
          snackbarOpen={state.snackbar.open}
          handleClose={onSnackbarClose}
        />
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// ================================ Form =============================
// =================================================================== */
interface PasswordChangeFormProps {
  resetCode: string;
  passwordChangeData: PasswordChangeData;
  onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error: FirebaseError | null;
  successPwChange: boolean;
  successEmailChange: boolean;
  onEmailChange: () => void;
  onPwChange: () => void;
}
const PasswordChangeForm = ({
  resetCode,
  passwordChangeData,
  onFieldChange,
  onEmailChange,
  onPwChange,
  successPwChange,
  successEmailChange,
  error,
}: PasswordChangeFormProps) => {
  const classes = useStyles();
  const [showPassword, setShowPassword] = React.useState(false);

  const isValidEmail = Utils.isEmail(passwordChangeData.email);

  /* ------------------------------------------
  // PW Feld-Handler
  // ------------------------------------------ */
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <React.Fragment>
      <Card>
        <CardMedia
          className={classes.cardMedia}
          image={ImageRepository.getEnviromentRelatedPicture().SIGN_IN_HEADER}
          title={"Logo"}
        />
        <CardContent className={classes.cardContent}>
          <Typography
            gutterBottom={true}
            variant="h5"
            align="center"
            component="h2"
          >
            {resetCode
              ? TEXT_PASSWORD_CHANGE_ARE_YOU_READY
              : TEXT_LOGIN_CHANGE_ARE_YOU_READY}
          </Typography>
          {error &&
          (error.code === AuthMessages.EXPIRED_ACTION_CODE ||
            error.code === AuthMessages.INVALID_ACTION_CODE) ? (
            <Alert severity="warning">
              <AlertTitle>{TEXT_ALERT_TITLE_UUPS}</AlertTitle>
              {TEXT_PASSWORD_RESET_EXPIRED}
              <ForgotPasswordLink />
            </Alert>
          ) : null}
          {successPwChange && (
            <Alert severity="success">
              <AlertTitle>{TEXT_ONE_TWO_TRHEE_DONE}</AlertTitle>
              {TEXT_PASSWORD_HAS_BEEN_CHANGED}
            </Alert>
          )}
          {successEmailChange && (
            <Alert severity="success">
              <AlertTitle>{TEXT_EMAIL_HAS_BEEN_CHANGED}</AlertTitle>
              {TEXT_VERIFICATION_EMAIL_SENT}
            </Alert>
          )}
          {error && <AlertMessage error={error} severity="error" />}
          {/* Mailadresse */}
          <TextField
            type="email"
            margin="normal"
            disabled={resetCode !== undefined}
            fullWidth
            id="email"
            label={TEXT_EMAIL}
            name="email"
            autoComplete="email"
            autoFocus
            value={passwordChangeData.email}
            onChange={onFieldChange}
          />
          {!isValidEmail && (
            <Typography color="error">{TEXT_GIVE_VALID_EMAIL}</Typography>
          )}
          {!resetCode && (
            <Button
              disabled={!isValidEmail}
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={onEmailChange}
            >
              {TEXT_CHANGE_EMAIL}
            </Button>
          )}

          {/* Passwort*/}
          <TextField
            type={showPassword ? "text" : "password"}
            margin="normal"
            required
            fullWidth
            id="password"
            name="password"
            label={TEXT_PASSWORD}
            value={passwordChangeData.password}
            onChange={onFieldChange}
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
          {/* Stärke Passwort */}
          <PasswordStrengthMeter password={passwordChangeData.password} />
          <Button
            disabled={
              passwordChangeData.password === "" ||
              passwordChangeData.password.length < 6
            }
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onPwChange}
          >
            {TEXT_CHANGE_PASSWORD}
          </Button>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

// ===================================================================
// =============================== Link ==============================
// ===================================================================
export const PasswordChangeLink = () => (
  <Typography variant="body2">
    <Link to={ROUTES.PASSWORD_RESET}>{TEXT_PASSWORD_CHANGE}</Link>
  </Typography>
);

export default compose(withEmailVerification, withFirebase)(PasswordChangePage);
