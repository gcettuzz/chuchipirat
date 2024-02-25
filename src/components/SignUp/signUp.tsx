import React from "react";
import {useHistory, withRouter} from "react-router";
import {compose} from "react-recompose";

import CssBaseline from "@material-ui/core/CssBaseline";

import {
  Button,
  IconButton,
  TextField,
  Typography,
  Container,
  Card,
  CardContent,
  CardMedia,
  InputAdornment,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";

import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@material-ui/icons";

import {ForgotPasswordLink} from "../AuthServiceHandler/passwordReset";

import PageTitle from "../Shared/pageTitle";
import PasswordStrengthMeter from "../Shared/passwordStrengthMeter";
import AlertMessage from "../Shared/AlertMessage";

import {withFirebase} from "../Firebase/firebaseContext";
import useStyles from "../../constants/styles";
import {
  SIGN_UP as ROUTE_SIGN_UP,
  HOME as ROUTE_HOME,
} from "../../constants/routes";
import {AuthMessages} from "../../constants/firebaseMessages";
import {NOT_REGISTERED_YET_SIGN_UP as TEXT_NOT_REGISTERED_YET_SIGN_UP} from "../../constants/text";
import {ImageRepository} from "../../constants/imageRepository";
import GlobalSettings from "../Admin/globalSettings.class";
import {FirebaseError} from "@firebase/util";

import {
  WE_NEED_SOME_DETAILS_ABOUT_YOU as TEXT_WE_NEED_SOME_DETAILS_ABOUT_YOU,
  SIGN_IN as TEXT_SIGN_IN,
  SIGN_UP_NOT_ALLOWED_TITLE as TEXT_SIGN_UP_NOT_ALLOWED_TITLE,
  SIGN_UP_NOT_ALLOWED_TEXT as TEXT_SIGN_UP_NOT_ALLOWED_TEXT,
  FIRSTNAME as TEXT_FIRSTNAME,
  LASTNAME as TEXT_LASTNAME,
  EMAIL as TEXT_EMAIL,
  PASSWORD as TEXT_PASSWORD,
  SHOW_PASSWORD as TEXT_SHOW_PASSWORD,
  CREATE_ACCOUNT as TEXT_CREATE_ACCOUNT,
  CLOSE as TEXT_CLOSE,
} from "../../constants/text";
import User from "../User/user.class";
import {PrivacyPolicyText} from "../App/privacyPolicy";
import {TermOfUseText} from "../App/termOfUse";
import Firebase from "../Firebase/firebase.class";
import {AuthUserContext} from "../Session/authUserContext";

// ===================================================================
// ======================== globale Funktionen =======================
// ===================================================================
enum ReducerActions {
  UPDATE_FIELD,
  UPDATE_CHECKBOX,
  SET_SIGN_UP_ALLOWED,
  GENERIC_ERROR,
}

type SignUpData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type State = {
  signUpData: SignUpData;
  error: FirebaseError | null;
  showPassword: boolean;
  signUpAllowed: boolean;
};

const inititialState: State = {
  signUpData: {firstName: "", lastName: "", email: "", password: ""},
  error: null,
  showPassword: false,
  signUpAllowed: false,
};
type DispatchAction = {
  type: ReducerActions;
  payload: any;
};

const signUpReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.UPDATE_FIELD:
      return {
        ...state,
        signUpData: {
          ...state.signUpData,
          [action.payload.field]: action.payload.value,
        },
      };
    case ReducerActions.SET_SIGN_UP_ALLOWED:
      return {
        ...state,
        signUpAllowed: action.payload.value,
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
const SignUpPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <SignUpBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
// ===================================================================
// =============================== Page ==============================
// ===================================================================
interface CustomRouterProps {
  history: History;
  firebase: Firebase;
}

const SignUpBase: React.FC<CustomRouterProps> = (props) => {
  const firebase = props.firebase;

  const classes = useStyles();
  const [state, dispatch] = React.useReducer(signUpReducer, inititialState);
  const {push} = useHistory();

  const [smallPrintDialogs, setSmallPrintDialogs] = React.useState({
    termOfUse: false,
    privacyPolicy: false,
  });

  /* ------------------------------------------
  // Einstellungen holen
  // ------------------------------------------ */
  React.useEffect(() => {
    GlobalSettings.getGlobalSettings({firebase}).then((result) => {
      dispatch({
        type: ReducerActions.SET_SIGN_UP_ALLOWED,
        payload: {value: result},
      });
    });
  }, []);
  /* ------------------------------------------
  // Feld-Änderungen
  // ------------------------------------------ */
  const onFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ReducerActions.UPDATE_FIELD,
      payload: {field: event.target.name, value: event.target.value},
    });
  };
  /* ------------------------------------------
  // Anmelden
  // ------------------------------------------ */
  const onSignUp = () => {
    firebase
      .createUserWithEmailAndPassword({
        email: state.signUpData.email,
        password: state.signUpData.password,
      })
      .then((user) => {
        if (user.user) {
          User.createUser({
            firebase: firebase,
            uid: user.user?.uid,
            firstName: state.signUpData.firstName,
            lastName: state.signUpData.lastName,
            email: state.signUpData.email,
          });
          firebase.sendEmailVerification();
          push({pathname: ROUTE_HOME});
        }
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  /* ------------------------------------------
  // Dialog-Handling
  // ------------------------------------------ */
  const onSmallPrintDialogOpen = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    setSmallPrintDialogs({
      ...smallPrintDialogs,
      [event.currentTarget.id]: true,
    });
  };
  const onSmallPrintDialogClose = () => {
    setSmallPrintDialogs({termOfUse: false, privacyPolicy: false});
  };
  return (
    <React.Fragment>
      <CssBaseline />
      <PageTitle subTitle={TEXT_WE_NEED_SOME_DETAILS_ABOUT_YOU} />

      <Container className={classes.container} component="main" maxWidth="xs">
        <SignUpForm
          signUpData={state.signUpData}
          signUpAllowed={state.signUpAllowed}
          error={state.error}
          onFieldChange={onFieldChange}
          onSignUp={onSignUp}
          openDialog={onSmallPrintDialogOpen}
        />
      </Container>
      <DialogTermOfUse
        open={smallPrintDialogs.termOfUse}
        onClose={onSmallPrintDialogClose}
      />
      <DialogPrivacyPolicy
        open={smallPrintDialogs.privacyPolicy}
        onClose={onSmallPrintDialogClose}
      />
    </React.Fragment>
  );
};

// ===================================================================
// ============================= Formular ============================
// ===================================================================
interface SignUpFormProps {
  signUpData: SignUpData;
  signUpAllowed: boolean;
  onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSignUp: () => void;
  openDialog: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  error: FirebaseError | null;
}
const SignUpForm = ({
  signUpData,
  signUpAllowed,
  onFieldChange,
  onSignUp,
  openDialog,
  error,
}: SignUpFormProps) => {
  const classes = useStyles();
  const [showPassword, setShowPassword] = React.useState(false);

  /* ------------------------------------------
  // Password-Feld Handler
  // ------------------------------------------ */
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <React.Fragment>
      <Card className={classes.card}>
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
            {TEXT_SIGN_IN}
          </Typography>
          {/* Meldung wenn SignUp nicht möglich ist */}
          {!signUpAllowed && (
            <AlertMessage
              error={null}
              severity={"info"}
              messageTitle={TEXT_SIGN_UP_NOT_ALLOWED_TITLE}
              body={TEXT_SIGN_UP_NOT_ALLOWED_TEXT}
            />
          )}
          {/* Vorname */}
          <TextField
            type="text"
            margin="normal"
            required
            fullWidth
            id="firstName"
            label={TEXT_FIRSTNAME}
            name="firstName"
            autoComplete="firstname"
            autoFocus
            value={signUpData.firstName}
            onChange={onFieldChange}
            disabled={!signUpAllowed}
          />
          {/* Nachname */}
          <TextField
            type="text"
            margin="normal"
            fullWidth
            id="lastName"
            label={TEXT_LASTNAME}
            name="lastName"
            autoComplete="lastname"
            value={signUpData.lastName}
            onChange={onFieldChange}
            disabled={!signUpAllowed}
          />
          {/* Mailadresse */}
          <TextField
            type="email"
            margin="normal"
            required
            fullWidth
            id="email"
            label={TEXT_EMAIL}
            name="email"
            autoComplete="email"
            value={signUpData.email}
            onChange={onFieldChange}
            disabled={!signUpAllowed}
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
            value={signUpData.password}
            onChange={onFieldChange}
            disabled={!signUpAllowed}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={TEXT_SHOW_PASSWORD}
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <br />
          {/* Stärke Passwort */}
          <PasswordStrengthMeter password={signUpData.password} />
          <br />
          <Typography>Indem du fortfährst, akzeptierst du:</Typography>

          <ul>
            <li>
              <Typography>
                die{" "}
                <Link id="termOfUse" onClick={openDialog}>
                  Nutzungsbedingungen
                </Link>{" "}
                für den chuchipirat.
              </Typography>
            </li>
            <li>
              <Typography>
                die{" "}
                <Link id="privacyPolicy" onClick={openDialog}>
                  Datenschutzbestimmungen
                </Link>{" "}
                des chuchipirats.
              </Typography>
            </li>
          </ul>
          <Button
            disabled={
              !signUpAllowed ||
              signUpData.password === "" ||
              signUpData.email === "" ||
              signUpData.firstName === ""
            }
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onSignUp}
          >
            {TEXT_CREATE_ACCOUNT}
          </Button>
          {error && (
            <AlertMessage
              error={error}
              severity={"error"}
              body={
                error.code === AuthMessages.EMAIL_ALREADY_IN_USE ? (
                  <ForgotPasswordLink />
                ) : (
                  ""
                )
              }
            />
          )}
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

// ===================================================================
// =============================== Link ==============================
// ===================================================================
export const SignUpLink = () => {
  const {push} = useHistory();

  const onSignUpClick = () => {
    push({
      pathname: ROUTE_SIGN_UP,
    });
  };

  return (
    <Button fullWidth color="primary" onClick={onSignUpClick}>
      {TEXT_NOT_REGISTERED_YET_SIGN_UP}
    </Button>
  );
};
// ===================================================================
// ===================== Dialog Nutzungsbestimmung ===================
// ===================================================================
interface DialogTermOfUseProps {
  open: boolean;
  onClose: () => void;
}
export const DialogTermOfUse = ({open, onClose}: DialogTermOfUseProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nutzungsbedingungen</DialogTitle>
      <DialogContent>
        <TermOfUseText />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{TEXT_CLOSE}</Button>
      </DialogActions>
    </Dialog>
  );
};
// ===================================================================
// ===================== Dialog Nutzungsbestimmung ===================
// ===================================================================
interface DialogPrivacyPolicyProps {
  open: boolean;
  onClose: () => void;
}
export const DialogPrivacyPolicy = ({
  open,
  onClose,
}: DialogPrivacyPolicyProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Datenschutzerklärung für die Webapp chuchipirat</DialogTitle>
      <DialogContent>
        <PrivacyPolicyText />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{TEXT_CLOSE}</Button>
      </DialogActions>
    </Dialog>
  );
};
export default compose(withRouter, withFirebase)(SignUpPage);
