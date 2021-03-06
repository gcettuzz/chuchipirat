import React from "react";

import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";
import { useHistory } from "react-router";

import CssBaseline from "@material-ui/core/CssBaseline";

import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

import TextField from "@material-ui/core/TextField";
import { Alert, AlertTitle } from "@material-ui/lab";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import InputAdornment from "@material-ui/core/InputAdornment";

import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import { ForgotPasswordLink } from "../AuthServiceHandler/passwordReset";

import PageTitle from "../Shared/pageTitle";
import PasswordStrengthMeter from "../Shared/passwordStrengthMeter";
import AlertMessage from "../Shared/AlertMessage";

import { withFirebase } from "../Firebase/index.js";
import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";
import useStyles from "../../constants/styles";
import * as ROUTES from "../../constants/routes";
import * as FIREBASE_MSG from "../../constants/firebaseMessages";
import * as TEXT from "../../constants/text";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";
import User from "../User/user.class";

// ===================================================================
// ======================== globale Funktionen =======================
// ===================================================================
const INITIAL_STATE = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  error: null,
  showPassword: false,
  isAdmin: false,
};

// ===================================================================
// =============================== Page ==============================
// ===================================================================
const SignUpPage = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <CssBaseline />
      <PageTitle subTitle={TEXT.PAGE_SUBTITLE_SIGN_UP} />

      <Container className={classes.container} component="main" maxWidth="xs">
        <SignUpForm />
      </Container>
    </React.Fragment>
  );
};

// ===================================================================
// ============================= Formular ============================
// ===================================================================
const SignUpFormBase = (props) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const { push } = useHistory();

  // Werte aus dem Form
  const [formValues, setFormValues] = React.useState(INITIAL_STATE);

  const isInvalid =
    formValues.password === "" ||
    formValues.email === "" ||
    formValues.firstName === "";

  const handleClickShowPassword = () => {
    setFormValues({ ...formValues, showPassword: !formValues.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Neuer User in Firebase anlegen
  const onSubmit = (event) => {
    firebase
      .createUserWithEmailAndPassword(formValues.email, formValues.password)
      .then((authUser) => {
        // Neuen user in eigener DB anlegen
        User.createUser(
          firebase,
          authUser.user.uid,
          formValues.firstName,
          formValues.lastName,
          formValues.email
        );
      })
      .then(() => {
        // Email Verifizierung versenden
        firebase.sendEmailVerification();
      })
      .then(() => {
        setFormValues({ ...INITIAL_STATE });
        push({
          pathname: ROUTES.HOME,
        });
      })
      .catch((error) => {
        console.error(error);
        setFormValues({ ...formValues, error: error });
      });

    event.preventDefault();
  };

  // Werte aus Form in State _formValues_ speichern
  const onChange = (event) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  };

  return (
    <form onSubmit={onSubmit}>
      <Card className={classes.card}>
        <CardMedia
          className={classes.cardMedia}
          image={IMAGE_REPOSITORY.getEnviromentRelatedPicture().SIGN_IN_HEADER}
          title={"Logo"}
        />
        <CardContent className={classes.cardContent}>
          <Typography
            gutterBottom={true}
            variant="h5"
            align="center"
            component="h2"
          >
            {TEXT.PANEL_SIGN_IN}
          </Typography>
          {/* Vorname */}
          <TextField
            type="text"
            margin="normal"
            required
            fullWidth
            id="firstName"
            label={TEXT.FIELD_FIRSTNAME}
            name="firstName"
            autoComplete="firstname"
            autoFocus
            value={formValues.firstName}
            onChange={onChange}
          />
          {/* Nachname */}
          <TextField
            type="text"
            margin="normal"
            fullWidth
            id="lastName"
            label={TEXT.FIELD_LASTNAME}
            name="lastName"
            autoComplete="lastname"
            value={formValues.lastName}
            onChange={onChange}
          />
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
                    {formValues.showPassword ? (
                      <Visibility />
                    ) : (
                      <VisibilityOff />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <br />
          {/* St??rke Passwort */}
          <PasswordStrengthMeter password={formValues.password} />
          <Button
            disabled={isInvalid}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {TEXT.BUTTON_REGISTER}
          </Button>
          {formValues.error && (
            <AlertMessage
              error={formValues.error}
              severity={"error"}
              body={
                formValues.error.code ===
                  FIREBASE_MSG.AUTH.EMAIL_ALREADY_IN_USE && (
                  <ForgotPasswordLink />
                )
              }
            />
            // <Alert severity="error">
            //   {FirebaseMessageHandler.translateMessage(formValues.error)}
            //   {formValues.error.code ===
            //     FIREBASE_MSG.AUTH.EMAIL_ALREADY_IN_USE && (
            //     <ForgotPasswordLink />
            //   )}
            // </Alert>
          )}
        </CardContent>
      </Card>
    </form>
  );
};

// ===================================================================
// =============================== Link ==============================
// ===================================================================

const SignUpLink = () => {
  const { push } = useHistory();

  const onSignUpClick = () => {
    push({
      pathname: ROUTES.SIGN_UP,
    });
  };

  return (
    // <Typography variant="body2" align="center">
    <Button fullWidth color="primary" onClick={onSignUpClick}>
      {TEXT.NOT_REGISTERED_YET_SIGN_UP}
    </Button>
    // <Link to={ROUTES.SIGN_UP} color="primary">
    // </Link>
    // </Typography>
  );
};

// Form mit Verbindung zur db
export default SignUpPage;

const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase);
export { SignUpForm, SignUpLink };
