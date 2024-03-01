import React from "react";
import {compose} from "react-recompose";

import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";

import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import useStyles from "../../constants/styles";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import InputAdornment from "@material-ui/core/InputAdornment";

import PageTitle from "../Shared/pageTitle";
import {SignUpLink} from "../SignUp/signUp";
import {FirebaseError} from "@firebase/util";

import {
  COME_IN as TEXT_COME_IN,
  SIGN_IN as TEXT_SIGN_IN,
  EMAIL as TEXT_EMAIL,
  PASSWORD as TEXT_PASSWORD,
  SHOW_PASSWORD as TEXT_SHOW_PASSWORD,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
} from "../../constants/text";
import {AuthMessages} from "../../constants/firebaseMessages";
import {HOME as ROUTE_HOME} from "../../constants/routes";
import {ImageRepository} from "../../constants/imageRepository";
import AlertMessage from "../Shared/AlertMessage";
import {ForgotPasswordLink} from "../AuthServiceHandler/passwordReset";
import {withFirebase} from "../Firebase/firebaseContext";
import User from "../User/user.class";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {useHistory} from "react-router";
import Utils from "../Shared/utils.class";
import {Backdrop, CircularProgress} from "@material-ui/core";
import {CustomRouterProps} from "../Shared/global.interface";

// ===================================================================
// ======================== globale Funktionen =======================
// ===================================================================
enum ReducerActions {
  UPDATE_FIELD,
  SIGN_IN,
  GENERIC_ERROR,
}

type SignInData = {
  email: string;
  password: string;
};

type State = {
  signInData: SignInData;
  error: FirebaseError | null;
  isSigningIn: boolean;
  showPassword: boolean;
};

type DispatchAction = {
  type: ReducerActions;
  payload: any;
};

const inititialState: State = {
  signInData: {
    email: "",
    password: "",
  },
  isSigningIn: false,
  error: null,
  showPassword: false,
};

const signInReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.UPDATE_FIELD:
      return {
        ...state,
        signInData: {
          ...state.signInData,
          [action.payload.field]: action.payload.value,
        },
      };
    case ReducerActions.SIGN_IN:
      return {...state, isSigningIn: true};
    case ReducerActions.GENERIC_ERROR:
      return {
        ...state,
        error: action.payload as FirebaseError,
        isSigningIn: false,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// ================================ Page =============================
// =================================================================== */
const SignInPage: React.FC<CustomRouterProps> = ({...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const {push} = useHistory();

  const [state, dispatch] = React.useReducer(signInReducer, inititialState);
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
  const onSignIn = async () => {
    dispatch({type: ReducerActions.SIGN_IN, payload: {}});
    await firebase
      .signInWithEmailAndPassword({
        email: state.signInData.email,
        password: state.signInData.password,
      })
      .then(async (user) => {
        if (user.user) {
          User.registerSignIn({
            firebase: firebase,
            authUser: {uid: user.user.uid} as AuthUser,
          });
        }

        // Kurz warten, damit der Auth-Context nach mag
        await new Promise(function (resolve) {
          setTimeout(resolve, 2000);
        });

        push({pathname: ROUTE_HOME});
      })
      .catch((error: FirebaseError) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };

  return (
    <React.Fragment>
      <PageTitle smallTitle={TEXT_COME_IN} />
      <Backdrop className={classes.backdrop} open={state.isSigningIn}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container className={classes.container} component="main" maxWidth="xs">
        <Card className={classes.card}>
          <CardMedia
            className={classes.cardMedia}
            image={ImageRepository.getEnviromentRelatedPicture().SIGN_IN_HEADER}
            title={"Logo"}
          />
          <CardContent className={classes.cardContent}>
            <SignInForm
              signInData={state.signInData}
              onFieldChange={onFieldChange}
              onSignIn={onSignIn}
            />
            {state.error && (
              <AlertMessage
                error={state.error}
                severity={"error"}
                messageTitle={TEXT_ALERT_TITLE_UUPS}
                body={
                  state.error.code! === AuthMessages.INTERNAL_ERROR ? (
                    <ForgotPasswordLink />
                  ) : (
                    ""
                  )
                }
              />
            )}
            <SignUpLink />
          </CardContent>
        </Card>
      </Container>
    </React.Fragment>
  );
};

// ===================================================================
// ====================== Formular Email/Passwort ====================
// ===================================================================
interface SignInFormProps {
  signInData: SignInData;
  onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSignIn: () => void;
}
const SignInForm = ({signInData, onFieldChange, onSignIn}: SignInFormProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const classes = useStyles();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <React.Fragment>
      <Typography
        gutterBottom={true}
        variant="h5"
        align="center"
        component="h2"
      >
        {TEXT_SIGN_IN}
      </Typography>
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
        autoFocus
        value={signInData.email}
        onChange={onFieldChange}
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
        value={signInData.password}
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
      <Button
        disabled={
          !signInData.email ||
          !signInData.email.includes("@") ||
          !signInData.password ||
          !Utils.isEmail(signInData.email)
        }
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
        onClick={onSignIn}
      >
        {TEXT_SIGN_IN}
      </Button>
    </React.Fragment>
  );
};

export default compose(withFirebase)(SignInPage);
