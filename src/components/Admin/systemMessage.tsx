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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  CardActions,
  SelectChangeEvent,
  Alert,
  AlertTitle,
  Stack,
} from "@mui/material";

import {DatePicker} from "@mui/x-date-pickers/DatePicker";

import AlertMessage from "../Shared/AlertMessage";
import PageTitle from "../Shared/pageTitle";

import SystemMessage from "./systemMessage.class";
// TODO: Löschen in Package.json:
// TODO: @material-ui/pickers
import {
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  EDITOR as TEXT_EDITOR,
  TITLE as TEXT_TITLE,
  PREVIEW as TEXT_PREVIEW,
  SYSTEM_MESSAGE as TEXT_SYSTEM_MESSAGE,
  ATENTION_IMPORTANT_ANNOUNCEMENT as TEXT_ATENTION_IMPORTANT_ANNOUNCEMENT,
  TYPE as TEXT_TYPE,
  VALID_TO as TEXT_VALID_TO,
  SAVE as TEXT_SAVE,
  SAVE_SUCCESS as TEXT_SAVE_SUCCESS,
} from "../../constants/text";
import useCustomStyles from "../../constants/styles";
import Role from "../../constants/roles";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CustomSnackbar, {
  SNACKBAR_INITIAL_STATE_VALUES,
  Snackbar,
} from "../Shared/customSnackbar";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  SYSTEM_MESSAGE_FETCH_INIT,
  SYSTEM_MESSAGE_FETCH_SUCCESS,
  SYSTEM_MESSAGE_FIELD_UPDATE,
  SYSTEM_MESSAGE_SAVE,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  systemMessage: SystemMessage;
  isLoading: boolean;
  error: Error | null;
  snackbar: Snackbar;
};

const inititialState: State = {
  systemMessage: new SystemMessage(),
  isLoading: false,
  error: null,
  snackbar: SNACKBAR_INITIAL_STATE_VALUES,
};

const mailConsoleReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.SYSTEM_MESSAGE_FETCH_INIT:
      return {...state, isLoading: true};
    case ReducerActions.SYSTEM_MESSAGE_FIELD_UPDATE:
      return {
        ...state,
        systemMessage: {
          ...state.systemMessage,
          [action.payload.key]: action.payload.value,
        },
      };
    case ReducerActions.SYSTEM_MESSAGE_FETCH_SUCCESS:
      return {
        ...state,
        systemMessage: action.payload as SystemMessage,
        isLoading: false,
      };
    case ReducerActions.SYSTEM_MESSAGE_SAVE:
      return {
        ...state,
        snackbar: {
          open: true,
          severity: "success",
          message: TEXT_SAVE_SUCCESS,
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
const SystemMessagePage = () => {
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
  // INitialier DB- Read
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatch({type: ReducerActions.SYSTEM_MESSAGE_FETCH_INIT, payload: {}});
    SystemMessage.getSystemMessage({
      firebase: firebase,
      mustBeValid: false,
    }).then((result) => {
      if (result == null) {
        result = new SystemMessage();
      }

      dispatch({
        type: ReducerActions.SYSTEM_MESSAGE_FETCH_SUCCESS,
        payload: result,
      });
    });
  }, []);
  /* ------------------------------------------
  // Field-Handler
  // ------------------------------------------ */
  const onFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ReducerActions.SYSTEM_MESSAGE_FIELD_UPDATE,
      payload: {key: event.target.id, value: event.target.value},
    });
  };
  const onChangeType = (event: SelectChangeEvent) => {
    dispatch({
      type: ReducerActions.SYSTEM_MESSAGE_FIELD_UPDATE,
      payload: {key: "type", value: event.target.value},
    });
  };
  const onValidToChange = (date: Date | null) => {
    dispatch({
      type: ReducerActions.SYSTEM_MESSAGE_FIELD_UPDATE,
      payload: {key: "validTo", value: date},
    });
  };
  const onSystemMessageTextChange = (value: string) => {
    dispatch({
      type: ReducerActions.SYSTEM_MESSAGE_FIELD_UPDATE,
      payload: {key: "text", value: value},
    });
  };
  /* ------------------------------------------
  // Speichern
  // ------------------------------------------ */
  const onSave = () => {
    SystemMessage.save({
      firebase: firebase,
      systemMessage: state.systemMessage,
      authUser: authUser,
    })
      .then(() => {
        dispatch({type: ReducerActions.SYSTEM_MESSAGE_SAVE, payload: {}});
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
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
        title={TEXT_SYSTEM_MESSAGE}
        subTitle={TEXT_ATENTION_IMPORTANT_ANNOUNCEMENT}
      />
      {/* ===== BODY ===== */}
      <Container sx={classes.container} component="main" maxWidth="sm">
        <Backdrop sx={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Stack spacing={2}>
          {state.error && (
            <AlertMessage
              error={state.error!}
              messageTitle={TEXT_ALERT_TITLE_WAIT_A_MINUTE}
            />
          )}

          <SystemMessageForm
            systemMessage={state.systemMessage}
            onFieldChange={onFieldChange}
            onChangeType={onChangeType}
            onDatePickerUpdate={onValidToChange}
            onSystemMessageTextChange={onSystemMessageTextChange}
            onSave={onSave}
          />
          <Typography variant="h5">{TEXT_PREVIEW}</Typography>
          <br />
          <AlertSystemMessage systemMessage={state.systemMessage} />
          <CustomSnackbar
            message={state.snackbar.message}
            severity={state.snackbar.severity}
            snackbarOpen={state.snackbar.open}
            handleClose={handleSnackbarClose}
          />
        </Stack>
      </Container>
    </React.Fragment>
  );
};

/* ===================================================================
// ========================== Meldungseditor =========================
// =================================================================== */

interface SystemMessageFormProps {
  systemMessage: SystemMessage;
  onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeType: (event: SelectChangeEvent) => void;
  onDatePickerUpdate: (date: Date | null) => void;
  onSystemMessageTextChange: (value: string) => void;
  onSave: () => void;
}
const SystemMessageForm = ({
  systemMessage,
  onFieldChange,
  onChangeType,
  onDatePickerUpdate,
  onSystemMessageTextChange,
  onSave,
}: SystemMessageFormProps) => {
  const classes = useCustomStyles();
  const theme = useTheme();

  return (
    <Card sx={[classes.card, {marginBottom: theme.spacing(2)}]}>
      <CardHeader title={TEXT_EDITOR} />
      <CardContent>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="select-label-type">{TEXT_TYPE}</InputLabel>
            <Select
              labelId="select-label-type"
              id="select-role"
              value={systemMessage.type}
              label={TEXT_TYPE}
              onChange={onChangeType}
            >
              <MenuItem value={"success"}>success</MenuItem>
              <MenuItem value={"info"}>info</MenuItem>
              <MenuItem value={"warning"}>warning</MenuItem>
              <MenuItem value={"error"}>error</MenuItem>
            </Select>
          </FormControl>
          <TextField
            value={systemMessage.title}
            fullWidth
            id="title"
            label={TEXT_TITLE}
            onChange={onFieldChange}
            variant="outlined"
          />
          {/* validto */}
          <DatePicker
            key={"validto"}
            label={TEXT_VALID_TO}
            inputFormat="dd.MM.yyyy"
            value={systemMessage.validTo}
            onChange={onDatePickerUpdate}
            renderInput={(params) => <TextField {...params} />}
          />

          <ReactQuill
            theme="snow"
            onChange={onSystemMessageTextChange}
            value={systemMessage.text}
            style={{marginTop: theme.spacing(2)}}
          />
        </Stack>{" "}
      </CardContent>
      <CardActions>
        <Button color="primary" variant="outlined" onClick={onSave}>
          {TEXT_SAVE}
        </Button>
      </CardActions>
    </Card>
  );
};

/* ===================================================================
// ============================ Vorschau =============================
// =================================================================== */
interface PreviewProps {
  systemMessage: SystemMessage;
}

export const AlertSystemMessage = ({systemMessage}: PreviewProps) => {
  return (
    <Alert severity={systemMessage.type}>
      {systemMessage.title && <AlertTitle>{systemMessage.title}</AlertTitle>}
      <div dangerouslySetInnerHTML={{__html: systemMessage.text}} />
    </Alert>
  );
};

export default SystemMessagePage;
