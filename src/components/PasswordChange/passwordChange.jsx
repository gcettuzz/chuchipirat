import React from "react";
import { compose } from "recompose";

import { Link } from "react-router-dom";

import CssBaseline from "@material-ui/core/CssBaseline";

import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import { Alert, AlertTitle } from "@material-ui/lab";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import InputAdornment from "@material-ui/core/InputAdornment";

import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";
import { AuthUserContext } from "../Session/index";
import PasswordStrengthMeter from "../Shared/passwordStrengthMeter";
import { withFirebase } from "../Firebase/index.js";
import PageTitle from "../Shared/pageTitle";
import useStyles from "../../constants/styles";
import AlertMessage from "../Shared/AlertMessage";
import DialogReauthenticate from "../SignIn/dialogReauthenticate";
import CustomSnackbar, {
  SNACKBAR_INITIAL_STATE_VALUES,
} from "../Shared/customSnackbar";

import * as FIREBASE_MSG from "../../constants/firebaseMessages";
import * as ROUTES from "../../constants/routes";
import * as TEXT from "../../constants/text";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";
import { ForgotPasswordLink } from "../PasswordReset/passwordReset";
import Utils from "../Shared/utils.class";

// ===================================================================
// ======================== globale Funktionen =======================
// ===================================================================
const INITIAL_STATE = {
  email: "",
  password: "",
  error: null,
  successPwChange: false,
  successEmailChange: false,
  showPassword: false,
  snackbar: SNACKBAR_INITIAL_STATE_VALUES,
};

// ===================================================================
// =============================== Page ==============================
// ===================================================================
const PasswordChangePage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <PasswordChangBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

// ===================================================================
// ============================= Formular ============================
// ===================================================================
const PasswordChangBase = ({ props, authUser }) => {
  const classes = useStyles();
  const firebase = props.firebase;

  let resetCode;
  // const { push } = useHistory();

  const [formValues, setFormValues] = React.useState(INITIAL_STATE);

  let qs = require("qs");

  // kommt die Anfrage aus der Passwort-Zurücksetzen-Mail.
  // Dann ist in der URL der objektCode
  props.location?.search &&
    (resetCode = qs.parse(props.location.search).oobCode);

  React.useEffect(() => {
    if (!formValues.email && resetCode && !formValues.error) {
      // Mailadresse herausfinden
      firebase
        .getEmailFromVerifyCode(resetCode)
        .then((result) => {
          setFormValues({ ...formValues, email: result, error: null });
        })
        .catch((error) => {
          setFormValues({ ...formValues, email: "", error: error });
        });
    } else if (!formValues.email && authUser) {
      setFormValues({ ...formValues, email: authUser.email });
    }
  }, []);

  // Neu Authentifizieren, wenn icht über ResetCode eingestiegen
  const [reauthenticattion, setReauthenticattion] = React.useState({
    needed: resetCode ? false : true,
    done: false,
  });

  /* ------------------------------------------
  // E-Mail ändern
  // ------------------------------------------ */
  const onEmailChangeSubmit = () => {
    firebase
      .emailChange(formValues.email)
      .then(() => {
        // link senden....
        firebase
          .sendEmailVerification()
          .then(() => {
            setFormValues({
              ...formValues,
              successEmailChange: true,
            });
          })
          .catch((error) => {
            setFormValues({
              ...formValues,
              error: error,
              successEmailChange: false,
            });
          });
      })
      .catch((error) => {
        setFormValues({
          ...formValues,
          error: error,
          successEmailChange: false,
        });
      });
  };

  /* ------------------------------------------
  // Passwort ändern
  // ------------------------------------------ */
  const onPwChangeSubmit = (event) => {
    if (!resetCode && authUser) {
      firebase
        .passwordUpdate(formValues.password)
        .then(() => {
          setFormValues({
            ...formValues,
            password: "",
            // passwordTwo: "",
            successPwChange: true,
          });
        })
        .catch((error) => {
          console.error(error);
          setFormValues({
            ...formValues,
            error: error,
            successPwChange: false,
          });
        });
    } else if (resetCode) {
      firebase
        .confirmPasswordReset(resetCode, formValues.password)
        .then(() => {
          setFormValues({
            ...formValues,
            password: "",
            // passwordTwo: "",
            successPwChange: true,
          });
        })
        .catch((error) => {
          console.error(error);
          setFormValues({
            ...formValues,
            error: error,
            successPwChange: false,
          });
        });
    }
    event.preventDefault();
  };
  /* ------------------------------------------
  // Feldwert ändern
  // ------------------------------------------ */
  const onChange = (event) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  };
  /* ------------------------------------------
  // Passwort anzeigen
  // ------------------------------------------ */
  const handleClickShowPassword = () => {
    setFormValues({ ...formValues, showPassword: !formValues.showPassword });
  };
  /* ------------------------------------------
  // Default verhindern
  // ------------------------------------------ */
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
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
    setFormValues({
      ...formValues,
      snackbar: {
        open: true,
        severity: "success",
        message: TEXT.LOGIN_SUCCESSFULL,
      },
    });
    setReauthenticattion({ ...reauthenticattion, done: true });
  };
  /* ------------------------------------------
  // Snackbar schliessen
  // ------------------------------------------ */
  const onSnackbarClose = () => {
    setFormValues({
      ...formValues,
      snackbar: SNACKBAR_INITIAL_STATE_VALUES,
    });
  };

  // Prüfung ob Button "Passwort ändern" angezeigt weden darf
  const isInvalid =
    formValues.password === "" || formValues.password.length < 6;

  // Prüfen ob EMail gültig
  let isValidEmail = Utils.isEmail(formValues.email);
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}

      <PageTitle
        title={
          resetCode
            ? TEXT.PAGE_TITLE_PASSWORD_CHANGE
            : TEXT.PAGE_TITLE_LOGIN_CHANGE
        }
      />

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
            <Typography
              gutterBottom={true}
              variant="h5"
              align="center"
              component="h2"
            >
              {resetCode
                ? TEXT.PASSOWRD_CHANGE_ARE_YOU_READY
                : TEXT.LOGIN_CHANGE_ARE_YOU_READY}
            </Typography>
            {formValues.error &&
            (formValues.error.code === FIREBASE_MSG.AUTH.EXPIRED_ACTION_CODE ||
              formValues.error.code ===
                FIREBASE_MSG.AUTH.INVALID_ACTION_CODE) ? (
              <Alert severity="warning">
                <AlertTitle>{TEXT.ALERT_TITLE_UUPS}</AlertTitle>
                {TEXT.PASSWORD_RESET_EXPIRED}
                <ForgotPasswordLink />
              </Alert>
            ) : null}
            {formValues.successPwChange && (
              <Alert severity="success">
                <AlertTitle>{TEXT.ALERT_TITLE_ONE_TWO_TRHEE_DONE}</AlertTitle>
                {TEXT.PASSWORD_HAS_BEEN_CHANGED}
              </Alert>
            )}
            {formValues.successEmailChange && (
              <Alert severity="success">
                <AlertTitle>{TEXT.EMAIL_HAS_BEEN_CHANGED}</AlertTitle>
                {TEXT.VERIFICATION_EMAIL_SENT}
              </Alert>
            )}
            {formValues.error && (
              <AlertMessage error={formValues.error} severity="error" />
            )}
            {/* Mailadresse */}
            <TextField
              type="email"
              margin="normal"
              disabled={resetCode && true}
              fullWidth
              id="email"
              label={TEXT.FIELD_EMAIL}
              name="email"
              autoComplete="email"
              autoFocus
              value={formValues.email}
              onChange={onChange}
            />
            {!isValidEmail && (
              <Typography color="error">
                {TEXT.FORM_GIVE_VALID_EMAIL}
              </Typography>
            )}
            {!resetCode && (
              <Button
                disabled={!isValidEmail}
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={onEmailChangeSubmit}
              >
                {TEXT.BUTTON_CHANGE_EMAIL}
              </Button>
            )}

            {/* Passwort 1*/}
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
            {/* Stärke Passwort */}
            <PasswordStrengthMeter password={formValues.password} />
            {/* Passwort 2*/}
            {/* <TextField
            type="password"
            margin="normal"
            required
            fullWidth
            id="passwordTwo"
            name="passwordTwo"
            label="Passwort wiederholen"
            autoComplete="new-password"
            value={formValues.passwordTwo}
            onChange={onChange}
          /> */}
            <Button
              disabled={isInvalid}
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={onPwChangeSubmit}
            >
              {TEXT.BUTTON_CHANGE_PASSWORD}
            </Button>
          </CardContent>
        </Card>
        {/* PopUP für Reauthentifizierung */}
        <DialogReauthenticate
          firebase={firebase}
          dialogOpen={reauthenticattion.needed && !reauthenticattion.done}
          handleOk={onReauthenticattionOk}
          handleClose={onReauthenticattionCancel}
          authUser={authUser}
        />
        <CustomSnackbar
          message={formValues.snackbar.message}
          severity={formValues.snackbar.severity}
          snackbarOpen={formValues.snackbar.open}
          handleClose={onSnackbarClose}
        />
      </Container>
    </React.Fragment>
  );
};

// ===================================================================
// =============================== Link ==============================
// ===================================================================
const PasswordChangeLink = () => (
  <Typography variant="body2">
    <Link to={ROUTES.PASSWORD_RESET}>{TEXT.PASSWORD_CHANGE}</Link>
  </Typography>
);

// const PasswordChangeForm = withFirebase(PasswordChangeFormBase);

export { PasswordChangeLink };

export default compose(withFirebase)(PasswordChangePage);
