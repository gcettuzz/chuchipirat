import React from "react";

import {useFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {useAuthUser} from "../Session/authUserContext";
import {
  Backdrop,
  CardContent,
  CircularProgress,
  Container,
  Card,
  CardHeader,
  Typography,
  TextField,
  Button,
  CardActions,
  Divider,
  useTheme,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardMedia,
  SelectChangeEvent,
  Box,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import MailConsole, {Mail, RecipientType} from "./mailConsole.class";

import AlertMessage from "../Shared/AlertMessage";
import PageTitle from "../Shared/pageTitle";

import {
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  MAIL_CONSOLE as TEXT_MAIL_CONSOLE,
  BECAUSE_NEWSLETTER_ARE_ALWAYS_LOVED as TEXT_BECAUSE_NEWSLETTER_ARE_ALWAYS_LOVED,
  EDITOR as TEXT_EDITOR,
  SUBJECT as TEXT_SUBJECT,
  TITLE as TEXT_TITLE,
  SUB_TITLE as TEXT_SUB_TITLE,
  MAILTEXT as TEXT_MAILTEXT,
  RECIPIENT_TYPE as TEXT_RECIPIENT_TYPE,
  DIVIDE_MULTIPLE_VALUES_BY_SEMICOLON as TEXT_DIVIDE_MULTIPLE_VALUES_BY_SEMICOLON,
  ROLE_TYPES as TEXT_ROLE_TYPES,
  MAIL_HEADER_PICTURE_SRC as TEXT_MAIL_HEADER_PICTURE_SRC,
  PREVIEW as TEXT_PREVIEW,
  TEST_MAIL_SENT as TEXT_TEST_MAIL_SENT,
  SEND_TEST_MAIL as TEXT_SEND_TEST_MAIL,
  SENDT_MAIL_TO_RECIPIENTS as TEXT_SENDT_MAIL_TO_RECIPIENTS,
  BUTTON_TEXT as TEXT_BUTTON_TEXT,
  BUTTON_LINK as TEXT_BUTTON_LINK,
  MAIL_SENT_TO_RECIPIENTS as TEXT_MAIL_SENT_TO_RECIPIENTS,
} from "../../constants/text";
import Role from "../../constants/roles";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CustomSnackbar, {
  SNACKBAR_INITIAL_STATE_VALUES,
  Snackbar,
} from "../Shared/customSnackbar";
import useCustomStyles from "../../constants/styles";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  RECIPIENT_UPDATE_TYPE,
  RECIPIENT_UPDATE_RECIPIENTS,
  MAIL_FIELD_UPDATE,
  TEST_MAIL_SENT,
  MAIL_SENT,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  mailObject: Mail;
  recipientType: RecipientType;
  recipients: string;
  testMailSent: boolean;
  isLoading: boolean;
  error: Error | null;
  snackbar: Snackbar;
};

const inititialState: State = {
  mailObject: new Mail(),
  recipientType: RecipientType.none,
  recipients: "",
  testMailSent: false,
  isLoading: false,
  error: null,
  snackbar: SNACKBAR_INITIAL_STATE_VALUES,
};

const mailConsoleReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.MAIL_FIELD_UPDATE:
      return {
        ...state,
        mailObject: {
          ...state.mailObject,
          [action.payload.field]: action.payload.value,
        },
        testMailSent: false,
      };
    case ReducerActions.RECIPIENT_UPDATE_TYPE:
      return {
        ...state,
        recipientType: action.payload.value,
        // Empfänger löschen, falls sich die Auswahl geändert hat
        recipients:
          state.recipientType !== action.payload.value ? "" : state.recipients,
      };
    case ReducerActions.RECIPIENT_UPDATE_RECIPIENTS:
      return {
        ...state,
        recipients: action.payload.value,
      };
    case ReducerActions.TEST_MAIL_SENT:
      return {
        ...state,
        testMailSent: true,
        snackbar: {
          open: true,
          message: TEXT_TEST_MAIL_SENT,
          severity: "success",
        },
      };
    case ReducerActions.MAIL_SENT:
      return {
        ...state,
        testMailSent: false,
        snackbar: {
          open: true,
          message: TEXT_MAIL_SENT_TO_RECIPIENTS,
          severity: "success",
        },
      };
    case ReducerActions.SNACKBAR_CLOSE:
      return {
        ...state,
        snackbar: SNACKBAR_INITIAL_STATE_VALUES,
      };

    case ReducerActions.GENERIC_ERROR:
      return {...state, error: action.payload as Error};
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const MailConsolePage = () => {
  const firebase = useFirebase();
  const authUser = useAuthUser();
  const classes = useCustomStyles();

  const [state, dispatch] = React.useReducer(
    mailConsoleReducer,
    inititialState
  );

  if (!authUser) {
    return null;
  }

  /* ------------------------------------------
  // Field-Handler
  // ------------------------------------------ */
  const onEditorFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ReducerActions.MAIL_FIELD_UPDATE,
      payload: {field: event.target.id, value: event.target.value},
    });
  };
  const onMailTextChange = (value: string) => {
    dispatch({
      type: ReducerActions.MAIL_FIELD_UPDATE,
      payload: {field: "mailtext", value: value},
    });
  };
  const onSendTestMail = () => {
    MailConsole.send({
      firebase: firebase,
      authUser: authUser,
      mailContent: state.mailObject,
      recipients: authUser.uid,
      recipientType: RecipientType.uid,
    });

    dispatch({type: ReducerActions.TEST_MAIL_SENT, payload: {}});
  };
  const onSendMail = () => {
    MailConsole.send({
      firebase: firebase,
      authUser: authUser,
      mailContent: state.mailObject,
      recipients: state.recipients,
      recipientType: state.recipientType,
    });
    dispatch({type: ReducerActions.MAIL_SENT, payload: {}});
  };
  /* ------------------------------------------
  // Snackbar-Handler
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch({
      type: ReducerActions.SNACKBAR_CLOSE,
      payload: {},
    });
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT_MAIL_CONSOLE}
        subTitle={TEXT_BECAUSE_NEWSLETTER_ARE_ALWAYS_LOVED}
      />
      {/* ===== BODY ===== */}
      <Container sx={classes.container} component="main" maxWidth="md">
        <Backdrop sx={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {state.error && (
 <Grid size={12} key={"error"} >
            <AlertMessage
              error={state.error!}
              messageTitle={TEXT_ALERT_TITLE_WAIT_A_MINUTE}
            />
          </Grid>
        )}

        <Grid container spacing={2}>
 <Grid size={12} >
            <MailRecipients
              selectedRecipientType={state.recipientType}
              recipients={state.recipients}
              onChangeRecipientType={(event) =>
                dispatch({
                  type: ReducerActions.RECIPIENT_UPDATE_TYPE,
                  payload: {value: parseInt(event.target.value)},
                })
              }
              onChangeRecipients={(event) => {
                dispatch({
                  type: ReducerActions.RECIPIENT_UPDATE_RECIPIENTS,
                  payload: {value: event.target.value},
                });
              }}
              onChangeRole={(event) => {
                dispatch({
                  type: ReducerActions.RECIPIENT_UPDATE_RECIPIENTS,
                  payload: {value: event.target.value},
                });
              }}
            />
          </Grid>
 <Grid size={12} >
            <MailEditor
              mailObject={state.mailObject}
              onFieldChange={onEditorFieldChange}
              onMailTextChange={onMailTextChange}
              onSendTestMail={onSendTestMail}
              onSendMail={onSendMail}
              testMailSent={state.testMailSent}
              //TODO: Cloud-FX umschreiben, dass sie mit den verschiedenen Typen umgehen kann...
            />
          </Grid>
 <Grid size={12} >
            <Preview mailObject={state.mailObject} />
          </Grid>
        </Grid>
        <CustomSnackbar
          message={state.snackbar.message}
          severity={state.snackbar.severity}
          snackbarOpen={state.snackbar.open}
          handleClose={handleSnackbarClose}
        />
      </Container>
    </React.Fragment>
  );
};

/* ===================================================================
// ============================ Empfänger ============================
// =================================================================== */
interface MailRecipientsProps {
  selectedRecipientType: RecipientType;
  recipients: State["recipients"];
  onChangeRecipientType: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeRecipients: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeRole: (event: SelectChangeEvent) => void;
}
const MailRecipients = ({
  selectedRecipientType,
  recipients,
  onChangeRecipientType,
  onChangeRecipients,
  onChangeRole,
}: MailRecipientsProps) => {
  // const theme = useTheme();
  const classes = useCustomStyles();

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <Card>
      <CardHeader title={"Empfänger"} />
      <CardContent>
        <Grid container spacing={2}>
 <Grid size={12} >
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="recipient_type"
                name="radios"
                value={selectedRecipientType}
                onChange={onChangeRecipientType}
              >
                <Grid container spacing={2}>
 <Grid size={{ xs: 5, sm: 3, md: 2 }} >
                    <FormControlLabel
                      value={RecipientType.email}
                      control={<Radio />}
                      label={TEXT_RECIPIENT_TYPE[RecipientType.email]}
                    />
                  </Grid>
 <Grid size={{ xs: 7, sm: 9, md: 10 }} >
                    <TextField
                      label={TEXT_RECIPIENT_TYPE[RecipientType.email]}
                      variant="outlined"
                      fullWidth
                      value={
                        selectedRecipientType === RecipientType.email
                          ? recipients
                          : ""
                      }
                      onChange={onChangeRecipients}
                      disabled={selectedRecipientType !== RecipientType.email}
                    />
                  </Grid>
 <Grid size={{ xs: 5, sm: 3, md: 2 }} >
                    <FormControlLabel
                      value={RecipientType.uid}
                      control={<Radio />}
                      label={TEXT_RECIPIENT_TYPE[RecipientType.uid]}
                    />
                  </Grid>
 <Grid size={{ xs: 7, sm: 9, md: 10 }} >
                    <TextField
                      label="recipient_uids"
                      variant="outlined"
                      fullWidth
                      value={
                        selectedRecipientType === RecipientType.uid
                          ? recipients
                          : ""
                      }
                      onChange={onChangeRecipients}
                      disabled={selectedRecipientType !== RecipientType.uid}
                    />
                  </Grid>
 <Grid size={{ xs: 5, sm: 3, md: 2 }} >
                    <FormControlLabel
                      value={RecipientType.role}
                      control={<Radio />}
                      label={TEXT_RECIPIENT_TYPE[RecipientType.role]}
                    />
                  </Grid>
 <Grid size={{ xs: 7, sm: 9, md: 10 }} >
                    <FormControl
                      variant="outlined"
                      sx={classes.formControl}
                      fullWidth
                    >
                      <InputLabel id="select-label-role">
                        {TEXT_RECIPIENT_TYPE[RecipientType.role]}
                      </InputLabel>
                      <Select
                        labelId="select-label-role"
                        id="select-role"
                        value={
                          selectedRecipientType === RecipientType.role
                            ? recipients
                            : ""
                        }
                        onChange={onChangeRole}
                        variant="outlined"
                        MenuProps={MenuProps}
                        fullWidth
                        disabled={selectedRecipientType !== RecipientType.role}
                      >
                        {Object.keys(Role).map((key) => (
                          <MenuItem key={key} value={key}>
                            {TEXT_ROLE_TYPES[key]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </RadioGroup>
            </FormControl>
          </Grid>
 <Grid size={12} >
            <Typography color="textSecondary">
              {TEXT_DIVIDE_MULTIPLE_VALUES_BY_SEMICOLON}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

/* ===================================================================
// =========================== Mail Editor ===========================
// =================================================================== */
interface MailEditorProps {
  mailObject: Mail;
  testMailSent: State["testMailSent"];
  onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMailTextChange: (value: string) => void;
  onSendTestMail: () => void;
  onSendMail: () => void;
}
const MailEditor = ({
  mailObject,
  testMailSent,
  onFieldChange,
  onMailTextChange,
  onSendMail,
  onSendTestMail: onSendTestMailSuper,
}: MailEditorProps) => {
  const classes = useCustomStyles();
  const theme = useTheme();
  const [formValidation, setFormValidation] = React.useState({
    subject: false,
    mailtext: false,
    title: false,
  });

  const onSendTestMail = () => {
    const tempFormValidation = {...formValidation};
    // Überprüfen der Eingabe
    if (!mailObject.subject) {
      tempFormValidation.subject = true;
    } else {
      tempFormValidation.subject = false;
    }
    if (!mailObject.mailtext) {
      tempFormValidation.mailtext = true;
    } else {
      tempFormValidation.mailtext = false;
    }
    if (!mailObject.title) {
      tempFormValidation.title = true;
    } else {
      tempFormValidation.title = false;
    }

    if (Object.values(tempFormValidation).some((value) => value === true)) {
      setFormValidation(tempFormValidation);
    } else {
      onSendTestMailSuper();
    }
  };

  return (
    <Card sx={classes.card}>
      <CardHeader title={TEXT_EDITOR} />
      <CardContent>
        <Grid container spacing={2}>
 <Grid size={12} >
            <TextField
              id="subject"
              key="subject"
              variant="outlined"
              fullWidth
              onChange={onFieldChange}
              value={mailObject.subject}
              label={TEXT_SUBJECT}
              required
              error={formValidation.subject}
            />
          </Grid>
 <Grid size={12} >
            <Divider style={{margin: theme.spacing(2)}} />
          </Grid>
 <Grid size={12} >
            <TextField
              id="title"
              key="title"
              variant="outlined"
              fullWidth
              onChange={onFieldChange}
              value={mailObject.title}
              label={TEXT_TITLE}
              required
              error={formValidation.title}
            />
          </Grid>
 <Grid size={12} >
            <TextField
              id="subtitle"
              key="subtitle"
              variant="outlined"
              fullWidth
              value={mailObject.subtitle}
              onChange={onFieldChange}
              label={TEXT_SUB_TITLE}
            />
          </Grid>
 <Grid size={12} >
            <TextField
              id="headerPictureSrc"
              key="headerPictureSrc"
              variant="outlined"
              fullWidth
              value={mailObject.headerPictureSrc}
              onChange={onFieldChange}
              label={TEXT_MAIL_HEADER_PICTURE_SRC}
            />
          </Grid>
 <Grid size={12} >
            <Typography
              color={formValidation.mailtext ? "error" : "textSecondary"}
            >
              {TEXT_MAILTEXT}
            </Typography>
            <ReactQuill theme="snow" onChange={onMailTextChange} />
          </Grid>
 <Grid size={12} >
            <TextField
              id="buttonText"
              key="buttonText"
              variant="outlined"
              fullWidth
              value={mailObject.buttonText}
              onChange={onFieldChange}
              label={TEXT_BUTTON_TEXT}
            />
          </Grid>
 <Grid size={12} >
            <TextField
              id="buttonLink"
              key="buttonLink"
              variant="outlined"
              fullWidth
              value={mailObject.buttonLink}
              onChange={onFieldChange}
              label={TEXT_BUTTON_LINK}
            />
          </Grid>
        </Grid>
      </CardContent>
      <CardActions sx={classes.cardActionRight}>
        <Button color="primary" variant="outlined" onClick={onSendTestMail}>
          {TEXT_SEND_TEST_MAIL}{" "}
        </Button>
        <Button
          color="primary"
          variant="contained"
          disabled={!testMailSent}
          onClick={onSendMail}
        >
          {TEXT_SENDT_MAIL_TO_RECIPIENTS}
        </Button>
      </CardActions>
    </Card>
  );
};

/* ===================================================================
// ============================ Vorschau =============================
// =================================================================== */
interface PreviewProps {
  mailObject: Mail;
}

const Preview = ({mailObject}: PreviewProps) => {
  const classes = useCustomStyles();

  return (
    <Card>
      <CardHeader title={TEXT_PREVIEW} />
      <Box component="div" style={{position: "relative"}}>
        <CardMedia
          sx={classes.cardMedia}
          image={mailObject.headerPictureSrc}
          title={"Headerbild"}
        />
        <Box component="div" sx={classes.textOnCardMediaImage}>
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
 <Grid size={12} >
              <Typography align="center" variant="h2">
                {mailObject.title}
              </Typography>
            </Grid>
            {mailObject.subtitle && (
 <Grid size={12} >
                <Typography align="center" variant="h4">
                  {mailObject.subtitle}
                </Typography>
              </Grid>
            )}
            <Grid container></Grid>
          </Grid>
        </Box>
      </Box>
      <CardContent>
        <Grid container>
 <Grid size={12} >
            <Typography
              variant="body1"
              component="div"
              dangerouslySetInnerHTML={{__html: mailObject.mailtext}}
            />
          </Grid>
          {mailObject.buttonLink && mailObject.buttonText && (
            <Grid size={12}
              alignContent="center"
              justifyContent="center"
              style={{display: "flex"}}
            >
              <Button
                color="primary"
                variant="contained"
                target="_blank"
                href={mailObject.buttonLink}
              >
                {mailObject.buttonText}
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MailConsolePage;
