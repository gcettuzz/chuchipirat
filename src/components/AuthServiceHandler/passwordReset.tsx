import React from "react";

import {
  Container,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Link,
} from "@mui/material";

import PageTitle from "../Shared/pageTitle";
import useCustomStyles from "../../constants/styles";
import AlertMessage from "../Shared/AlertMessage";
import {PASSWORD_RESET as ROUTES_PASSWORD_RESET} from "../../constants/routes";
import {
  PASSWORD_RESET as TEXT_PASSWORD_RESET,
  EVERYBODY_FORGETS_SOMETHING as TEXT_EVERYBODY_FORGETS_SOMETHING,
  PASSWORD_MAGIC_LINK_IN_INBOX as TEXT_PASSWORD_WHERE_SEND_MAGIC_LINK,
  EMAIL as TEXT_EMAIL,
  RESET as TEXT_RESET,
  ALERT_TATSCH_BANG_DONE as TEXT_ALERT_TATSCH_BANG_DONE,
  PASSWORD_LINK_SENT as TEXT_PASSWORD_LINK_SENT,
  HAVE_YOU_FORGOTEN_YOUR_PASSWORD as TEXT_HAVE_YOU_FORGOTEN_YOUR_PASSWORD,
} from "../../constants/text";
import {ImageRepository} from "../../constants/imageRepository";
import {useHistory} from "react-router";
import {FirebaseError} from "@firebase/util";
import Utils from "../Shared/utils.class";
import {useFirebase} from "../Firebase/firebaseContext";

// ===================================================================
// ======================== globale Funktionen =======================
// ===================================================================
enum ReducerActions {
  UPDATE_FIELD,
  PASSWORD_LINK_SENT_SUCCESS,
  GENERIC_ERROR,
}
type State = {
  email: string;
  mailSent: boolean;
  error: FirebaseError | null;
};
type DispatchAction = {
  type: ReducerActions;
  payload: any;
};

const inititialState: State = {
  email: "",
  mailSent: false,
  error: null,
  // snackbar: Snackbar;
};
const passwordResetReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.UPDATE_FIELD:
      return {
        ...state,
        [action.payload.field]: action.payload.value,
      };
    case ReducerActions.PASSWORD_LINK_SENT_SUCCESS:
      return {
        ...state,
        mailSent: true,
      };
    case ReducerActions.GENERIC_ERROR:
      return {...state, error: action.payload as FirebaseError};
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

// ===================================================================
// =============================== Page ==============================
// ===================================================================
const PasswordResetPage = () => {
  const firebase = useFirebase();
  const classes = useCustomStyles();

  const [state, dispatch] = React.useReducer(
    passwordResetReducer,
    inititialState
  );

  /* ------------------------------------------
  // Feld-Handler
  // ------------------------------------------ */
  const onFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ReducerActions.UPDATE_FIELD,
      payload: {field: event.target.name, value: event.target.value},
    });
  };
  const onResetPassword = () => {
    firebase
      .passwordReset(state.email)
      .then(() => {
        dispatch({
          type: ReducerActions.PASSWORD_LINK_SENT_SUCCESS,
          payload: {},
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };

  return (
    <React.Fragment>
      <PageTitle
        title={TEXT_PASSWORD_RESET}
        subTitle={TEXT_EVERYBODY_FORGETS_SOMETHING}
      />
      <Container sx={classes.container} component="main" maxWidth="xs">
        <PasswordResetForm
          email={state.email}
          onFieldChange={onFieldChange}
          onResetPassword={onResetPassword}
          error={state.error}
          mailSent={state.mailSent}
        />
      </Container>
    </React.Fragment>
  );
};
// ===================================================================
// ============================= Formular ============================
// ===================================================================
interface PasswordResetFormProps {
  email: string;
  onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetPassword: () => void;
  error: FirebaseError | null;
  mailSent: boolean;
}
const PasswordResetForm = ({
  email,
  onFieldChange,
  onResetPassword,
  error,
  mailSent,
}: PasswordResetFormProps) => {
  const classes = useCustomStyles();

  return (
    <Card sx={classes.card}>
      <CardMedia
        style={{marginTop: "2rem"}}
        sx={classes.cardMedia}
        image={ImageRepository.getEnviromentRelatedPicture().SIGN_IN_HEADER}
        title={"Logo"}
      />
      <CardContent sx={classes.cardContent}>
        {mailSent && (
          <Typography
            gutterBottom={true}
            variant="h5"
            align="center"
            component="h2"
          >
            {TEXT_PASSWORD_WHERE_SEND_MAGIC_LINK}
          </Typography>
        )}
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
          value={email}
          onChange={onFieldChange}
          style={{marginBottom: "1rem"}}
        />
        <Button
          disabled={!Utils.isEmail(email)}
          fullWidth
          variant="contained"
          color="primary"
          onClick={onResetPassword}
        >
          {TEXT_RESET}
        </Button>
        {error && <AlertMessage error={error} />}
        {mailSent && (
          <AlertMessage
            error={error}
            severity="success"
            messageTitle={TEXT_ALERT_TATSCH_BANG_DONE}
            body={TEXT_PASSWORD_LINK_SENT}
          />
        )}
      </CardContent>
    </Card>
  );
};
// ===================================================================
// =============================== Link ==============================
// ===================================================================

export const ForgotPasswordLink = () => {
  const {push} = useHistory();

  const goToPasswordReset = () => {
    push({
      pathname: ROUTES_PASSWORD_RESET,
    });
  };

  return (
    <Typography variant="body2">
      {TEXT_HAVE_YOU_FORGOTEN_YOUR_PASSWORD}
      <Link onClick={goToPasswordReset}>{TEXT_PASSWORD_RESET}</Link>
    </Typography>
  );
};

export default PasswordResetPage;
