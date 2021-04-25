import React from "react";
import { Link } from "react-router-dom";

import CssBaseline from "@material-ui/core/CssBaseline";

import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { Alert, AlertTitle, type } from "@material-ui/lab";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";

import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";

import { withFirebase } from "../Firebase/index.js";
import PageTitle from "../Shared/pageTitle";
import useStyles from "../../constants/styles";
import AlertMessage from "../Shared/AlertMessage";
import * as ROUTES from "../../constants/routes";
import * as TEXT from "../../constants/text";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";

// ===================================================================
// ======================== globale Funktionen =======================
// ===================================================================

const INITIAL_STATE = {
  email: "",
  error: null,
  success: false,
};

// ===================================================================
// =============================== Page ==============================
// ===================================================================
const PasswordResetPage = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <CssBaseline />
      <PageTitle
        title={TEXT.PAGE_TITLE_PASSWORD_RESET}
        subTitle={TEXT.PAGE_SUBTITLE_PASSWORD_RESET}
      />
      <Container className={classes.container} component="main" maxWidth="xs">
        <PasswordResetForm />
      </Container>
    </React.Fragment>
  );
};

// ===================================================================
// ============================= Formular ============================
// ===================================================================
const PasswordResetFormBase = (props) => {
  const classes = useStyles();
  const firebase = props.firebase;
  // const { push } = useHistory();

  const [formValues, setFormValues] = React.useState(INITIAL_STATE);

  const onSubmit = (event) => {
    firebase
      .passwordReset(formValues.email)
      .then(() => {
        setFormValues({ ...INITIAL_STATE, success: true });
      })
      .catch((error) => {
        setFormValues({ ...formValues, error: error });
      });

    event.preventDefault();
  };

  const onChange = (event) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  };

  // Prüfung ob Button zurücksetzen angezeigt weden darf
  const isInvalid = formValues.email === "";

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
            {TEXT.PASSWORD_WHERE_SEND_MAGIC_LINK}
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
          <Button
            disabled={isInvalid}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {TEXT.BUTTON_RESET}
          </Button>
          {formValues.error && <AlertMessage error={formValues.error} />}
          {formValues.success && (
            <AlertMessage
              error={formValues.error}
              severity="success"
              messageTitle={TEXT.ALERT_TITLE_TATSCH_BANG_DONE}
              body={TEXT.PASSWORD_LINK_SENT}
            />
          )}
        </CardContent>
      </Card>
    </form>
  );
};

// ===================================================================
// =============================== Link ==============================
// ===================================================================

const ForgotPasswordLink = () => (
  <Typography variant="body2">
    <Link to={ROUTES.PASSWORD_RESET}>{TEXT.PASSWORD_RESET}</Link>
  </Typography>
);

const PasswordResetForm = withFirebase(PasswordResetFormBase);

export default PasswordResetPage;
export { ForgotPasswordLink };
