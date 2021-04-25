import React from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { useHistory } from "react-router";

import CssBaseline from "@material-ui/core/CssBaseline";

import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import SvgIcon from "@material-ui/core/SvgIcon";

import TextField from "@material-ui/core/TextField";
import { Alert, AlertTitle } from "@material-ui/lab";

// import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import useStyles from "../../constants/styles";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import InputAdornment from "@material-ui/core/InputAdornment";
import FacebookIcon from "@material-ui/icons/Facebook";

import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";
import User from "../User/user.class";

import PageTitle from "../Shared/pageTitle";
import { withFirebase } from "../Firebase/index.js";
import { SignUpLink } from "../SignUp/signUp";
import { ForgotPasswordLink } from "../PasswordReset/passwordReset";
import AlertMessage from "../Shared/AlertMessage";

import * as FIREBASE_MSG from "../../constants/firebaseMessages";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import * as TEXT from "../../constants/text";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";

// ===================================================================
// ======================== globale Funktionen =======================
// ===================================================================
const INITIAL_STATE = {
  email: "",
  password: "",
  error: null,
  showPassword: false,
};
/* ===================================================================
// ================================ Page =============================
// =================================================================== */
const SignInPage = () => {
  const classes = useStyles();
  const [error, setError] = React.useState(null);

  return (
    <React.Fragment>
      <PageTitle smallTitle={TEXT.PAGE_TITLE_SIGN_IN} />
      <Container className={classes.container} component="main" maxWidth="xs">
        <Card className={classes.card}>
          <CardMedia
            className={classes.cardMedia}
            image={
              IMAGE_REPOSITORY.getEnviromentRelatedPicture().SIGN_IN_HEADER
            }
            title={"Logo"}
          />
          <CardContent className={classes.cardContent}>
            <SignInForm errorSetter={setError} />
            {error && (
              <AlertMessage
                error={error}
                severity={"error"}
                messageTitle={TEXT.ALERT_TITLE_UUPS}
                body={
                  error.code === FIREBASE_MSG.AUTH.WRONG_PASSWORD && (
                    <ForgotPasswordLink />
                  )
                }
              />
            )}
            {/* 
            NEXT_FEATURE: hier müssen wir nochmals ran... --> V2
            <SignInGoogle errorSetter={setError} />
            <SignInFacebook errorSetter={setError} /> */}
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
const SignInFormBase = (props) => {
  const setError = props.errorSetter;
  const classes = useStyles();
  const { push } = useHistory();

  // Werte aus dem Form
  const [formValues, setFormValues] = React.useState(INITIAL_STATE);

  const isInvalid = formValues.password === "" || formValues.email === "";

  const handleClickShowPassword = () => {
    setFormValues({ ...formValues, showPassword: !formValues.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Anmeldung durchführen
  const onSubmit = (event) => {
    props.firebase
      .signInWithEmailAndPassword(formValues.email, formValues.password)
      .then((authUser) => {
        // Login in eigener Sammlung registrieren
        User.registerSignIn(props.firebase, authUser.user.uid);
      })
      .then(() => {
        setFormValues({ ...INITIAL_STATE });
        push({
          pathname: ROUTES.HOME,
        });
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });

    event.preventDefault();
  };

  const onChange = (event) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  };

  return (
    <form onSubmit={onSubmit}>
      <Typography
        gutterBottom={true}
        variant="h5"
        align="center"
        component="h2"
      >
        {TEXT.PANEL_SIGN_IN}
      </Typography>
      {/* Mailadresse */}
      <TextField
        type="email"
        margin="normal"
        required
        fullWidth
        id="email"
        label={TEXT.FIELD_EMAIL}
        name="email"
        autoComplete="email"
        autoFocus
        value={formValues.email}
        onChange={onChange}
      />
      {/* Passwort */}
      <TextField
        type={formValues.showPassword ? "text" : "password"}
        margin="normal"
        required
        fullWidth
        id="password"
        name="password"
        label={TEXT.FIELD_PASSWORD}
        autoComplete="new-password"
        value={formValues.password}
        onChange={onChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={TEXT.BUTTON_SHOW_PASSWORD}
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
              >
                {formValues.showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        disabled={isInvalid}
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        {TEXT.BUTTON_SIGN_IN}
      </Button>
    </form>
  );
};

// ===================================================================
// ========================== Formular Google ========================
// ===================================================================
const SignInGoogleBase = (props) => {
  const setError = props.errorSetter;
  const classes = useStyles();
  const { push } = useHistory();

  const onSubmit = (event) => {
    props.firebase
      .signInWithGoogle()
      .then((socialAuthUser) => {
        // Neuen user in eigener DB anlegen/updaten
        User.createUpdateSocialUser(
          props.firebase,
          socialAuthUser.user.uid,
          socialAuthUser.additionalUserInfo.profile.given_name,
          socialAuthUser.additionalUserInfo.profile.family_name,
          socialAuthUser.user.email,
          socialAuthUser.additionalUserInfo.profile.picture,
          socialAuthUser.additionalUserInfo.isNewUser
        );
      })
      .then(() => {
        setError(null);
        push({
          pathname: ROUTES.HOME,
        });
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });
    event.preventDefault();
  };

  return (
    <React.Fragment>
      <form onSubmit={onSubmit}>
        <Button
          type="submit"
          fullWidth
          variant="outlined"
          color="primary"
          className={classes.submit}
          startIcon={
            <SvgIcon>
              {/* Google Logo - einfarbig */}
              <path
                d="M17.5,7.4H9v3.5h4.8C13.6,12,13,12.9,12,13.6c-0.8,0.5-1.8,0.9-3,0.9c-2.3,0-4.3-1.6-5-3.7
                C3.8,10.2,3.7,9.6,3.7,9S3.8,7.8,4,7.3c0.7-2.1,2.7-3.7,5-3.7c1.3,0,2.5,0.5,3.4,1.3L15,2.3C13.5,0.9,11.4,0,9,0C5.5,0,2.4,2,1,5
                C0.3,6.2,0,7.5,0,9s0.3,2.8,1,4c1.5,2.9,4.5,5,8,5c2.4,0,4.5-0.8,6-2.2c1.7-1.6,2.7-3.9,2.7-6.6C17.6,8.6,17.6,8,17.5,7.4z"
              />
            </SvgIcon>
          }
        >
          {TEXT.BUTTON_SIGN_IN_GOOGLE}
        </Button>
      </form>
    </React.Fragment>
  );
};

// ===================================================================
// ========================= Formular Facebook =======================
// ===================================================================
const SignInFacebookBase = (props) => {
  const setError = props.errorSetter;
  const classes = useStyles();
  const { push } = useHistory();

  const onSubmit = (event) => {
    props.firebase
      .signInWithFacebook()
      .then((socialAuthUser) => {
        // Neuen user in eigener DB anlegen/updaten
        User.createUpdateSocialUser(
          props.firebase,
          socialAuthUser.user.uid,
          socialAuthUser.additionalUserInfo.profile.first_name,
          socialAuthUser.additionalUserInfo.profile.last_name,
          socialAuthUser.user.email,
          socialAuthUser.additionalUserInfo.profile.picture.data.url,
          socialAuthUser.additionalUserInfo.isNewUser
        );
      })
      .then(() => {
        setError(null);
        push({
          pathname: ROUTES.HOME,
        });
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });
    event.preventDefault();
  };

  return (
    <React.Fragment>
      <form onSubmit={onSubmit}>
        <Button
          type="submit"
          fullWidth
          variant="outlined"
          color="primary"
          className={classes.submit}
          startIcon={<FacebookIcon />}
        >
          {TEXT.BUTTON_SIGN_IN_FACEBOOK}
        </Button>
      </form>
    </React.Fragment>
  );
};

export default SignInPage;
const SignInForm = compose(withRouter, withFirebase)(SignInFormBase);
const SignInGoogle = compose(withRouter, withFirebase)(SignInGoogleBase);
const SignInFacebook = compose(withRouter, withFirebase)(SignInFacebookBase);

export { SignInForm, SignInGoogle, SignInFacebook };
