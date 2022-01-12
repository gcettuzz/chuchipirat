import React from "react";
import { compose } from "recompose";
import { useHistory } from "react-router";

import CssBaseline from "@material-ui/core/CssBaseline";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Link from "@material-ui/core/Link";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import LinearProgress from "@material-ui/core/LinearProgress";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import { Alert, AlertTitle } from "@material-ui/lab";

import format from "date-fns/format";
import deLocale from "date-fns/locale/de";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import CustomSnackbar from "../Shared/customSnackbar";
import DialogAddUser from "../User/dialogAddUser";
import LoadingIndicator from "../Shared/loadingIndicator";
import AlertMessage from "../Shared/AlertMessage";

import Event from "./event.class";
import User from "../User/user.class";
import Utils from "../Shared/utils.class";
import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";

import * as ROUTES from "../../constants/routes";
import * as ACTIONS from "../../constants/actions";
import * as TEXT from "../../constants/text";
import * as FIREBASEMESSSAGES from "../../constants/firebaseMessages";

import LocalActivityIcon from "@material-ui/icons/LocalActivity";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import PeopleIcon from "@material-ui/icons/People";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import PersonIcon from "@material-ui/icons/Person";
import TodayIcon from "@material-ui/icons/Today";
import ImageIcon from "@material-ui/icons/Image";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import PhotoFilterIcon from "@material-ui/icons/PhotoFilter";

import useStyles from "../../constants/styles";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */

class DeLocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "dd.MM.yyyy", { locale: this.locale });
  }
}
const REDUCER_ACTIONS = {
  EVENT_FETCH_INIT: "EVENT_FETCH_INIT",
  EVENT_FETCH_SUCCESS: "EVENT_FETCH_SUCCESS",
  EVENT_ON_CHANGE: "EVENT_ON_CHANGE",
  EVENT_ON_ERROR: "EVENT_ON_ERROR",
  EVENT_ON_SAVE: "EVENT_ON_SAVE",
  EVENT_CLOSE_SNACKBAR: "EVENT_CLOSE_SNACKBAR",
  EVENT_UPDATE_COOKS: "EVENT_UPDATE_COOKS",
  DATES_ON_CHANGE: "DATES_ON_CHANGE",
  DATES_UPDATE_LIST: "DATES_UPDATE_LIST",
  PICTURE_UPLOAD_INIT: "PICTURE_UPLOAD_INIT",
  PICTURE_UPLOAD_SUCCESS: "PICTURE_UPLOAD_SUCCESS",
  DELETE_PICTURE_SUCCESS: "DELETE_PICTURE_SUCCESS",
  SNACKBAR_SET_MESSAGE: "SNACKBAR_SET_MESSAGE",
  RESTORE_DB_VERSION: "RESTORE_DB_VERSION",
};

const DEFAULT_ERROR = {
  code: "",
  name: "",
};

const eventReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.EVENT_FETCH_INIT:
      // Ladebalken anzeigen
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.EVENT_FETCH_SUCCESS:
      // Event setzen
      return {
        ...state,
        data: {
          ...state.data,
          uid: action.payload.uid,
          name: action.payload.name,
          motto: action.payload.motto,
          location: action.payload.location,
          participants: action.payload.participants,
          participantsOld: action.payload.participants,
          pictureSrc: action.payload.pictureSrc,
          dates: action.payload.dates,
          cooks: action.payload.cooks,
          createdAt: action.payload.createdAt,
          createdFromUid: action.payload.createdFromUid,
          createdFromDisplayName: action.payload.createdFromDisplayName,
        },
        dbVersion: {
          ...state.dbVersion,
          uid: action.payload.uid,
          name: action.payload.name,
          motto: action.payload.motto,
          location: action.payload.location,
          participants: action.payload.participants,
          pictureSrc: action.payload.pictureSrc,
          dates: action.payload.dates,
          cooks: action.payload.cooks,
          createdAt: action.payload.createdAt,
          createdFromUid: action.payload.createdFromUid,
          createdFromDisplayName: action.payload.createdFromDisplayName,
        },
        isLoading: false,
        isError: false,
        error: DEFAULT_ERROR,
      };
    case REDUCER_ACTIONS.EVENT_ON_CHANGE:
      // OnChange eines Feldes
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
      };
    case REDUCER_ACTIONS.EVENT_ON_SAVE:
      // Erfolgreiches speichern
      return {
        ...state,
        data: { ...state.data, uid: action.payload },
        dbVersion: { ...state.data, uid: action.payload },
        snackbar: {
          severity: "success",
          message: TEXT.EVENT_SAVE_SUCCESS(state.data.name),
          open: true,
        },
        isError: false,
      };
    case REDUCER_ACTIONS.EVENT_UPDATE_COOKS:
      // Neuer Koch
      return {
        ...state,
        data: { ...state.data, cooks: action.payload },
        dbVersion: { ...state.data, cooks: action.payload },
        snackbar: {
          severity: action.snackbarSeverity,
          message: action.snackbarText,
          open: true,
        },
      };
    case REDUCER_ACTIONS.EVENT_ON_ERROR:
      // Fehler anzeigen
      return {
        ...state,
        isError: true,
        isLoading: false,
        error: action.payload,
      };
    case REDUCER_ACTIONS.SNACKBAR_SET_MESSAGE:
      // Snackbar Meldung setzen
      return {
        ...state,
        isError: false,
        snackbar: {
          severity: action.severity,
          message: action.snackbarText,
          open: true,
        },
      };
    case REDUCER_ACTIONS.EVENT_CLOSE_SNACKBAR:
      return {
        ...state,
        isError: false,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case REDUCER_ACTIONS.DATES_ON_CHANGE:
      // Datepicker Änderung
      return {
        ...state,
        data: {
          ...state.data,
          dates: state.data.dates.map((date) => {
            if (date.uid === action.uid) {
              date[action.field] = action.value;
            }
            return date;
          }),
        },
      };
    case REDUCER_ACTIONS.DATES_UPDATE_LIST:
      // Array (Daten) updaten
      return {
        ...state,
        data: {
          ...state.data,
          dates: action.payload,
        },
      };
    case REDUCER_ACTIONS.PICTURE_UPLOAD_INIT:
      // Bild wird hochgeladen
      return {
        ...state,
        isLoadingPicture: true,
      };
    case REDUCER_ACTIONS.PICTURE_UPLOAD_SUCCESS:
      // Bild erfolgreich hochgeladen
      return {
        ...state,
        data: {
          ...state.data,
          pictureSrc: action.payload.pictureSrc,
          pictureSrcFullSize: action.payload.pictureSrcFullSize,
        },
        dbVersion: {
          ...state.dbVersion,
          pictureSrc: action.payload,
          pictureSrcFullSize: action.payload.pictureSrcFullSize,
        },
        isLoadingPicture: false,
      };
    case REDUCER_ACTIONS.DELETE_PICTURE_SUCCESS:
      // Bild gelöscht
      return {
        ...state,
        data: {
          ...state.data,
          pictureSrc: "",
          pictureSrcFullSize: "",
        },
        dbVersion: {
          ...state.dbVersion,
          pictureSrc: "",
          pictureSrcFullSize: "",
        },
        isLoadingPicture: false,
        snackbar: {
          severity: "info",
          message: TEXT.PICTURE_HAS_BEEN_DELETED,
          open: true,
        },
      };
    case REDUCER_ACTIONS.RESTORE_DB_VERSION:
      // DB Version wieder anzeigen
      return {
        ...state,
        data: {
          uid: state.dbVersion.uid,
          name: state.dbVersion.name,
          motto: state.dbVersion.motto,
          location: state.dbVersion.location,
          participants: state.dbVersion.participants,
          pictureSrc: state.dbVersion.pictureSrc,
          dates: state.dbVersion.dates,
          cooks: state.dbVersion.cooks,
          createdAt: state.dbVersion.createdAt,
          createdFromUid: state.dbVersion.createdFromUid,
          createdFromDisplayName: state.dbVersion.createdFromDisplayName,
        },
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */

const EventPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <EventBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const EventBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const { push } = useHistory();

  let dbEvent = null;
  let action;
  let urlUid;
  const [editMode, setEditMode] = React.useState(false);
  const [event, dispatchEvent] = React.useReducer(eventReducer, {
    data: Event.factory(authUser),
    dbVersion: Event.factory(authUser),
    isError: false,
    isLoading: false,
    isLoadingPicture: false,
    error: DEFAULT_ERROR,
    snackbar: { open: false, severity: "success", message: "" },
  });
  const [userAddValues, setUserAddValues] = React.useState({
    popUpOpen: false,
  });

  if (props.location.state) {
    dbEvent = props.location.state.event;
    action = props.location.state.action;
  } else {
    action = ACTIONS.VIEW;
  }

  if (!urlUid) {
    urlUid = props.match.params.id;
    if (!urlUid) {
      action = ACTIONS.NEW;
      urlUid = ACTIONS.NEW;
    }
  }

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    // Wen das Ereignis NEW ist, wird ein neues Rezept angelegt.
    // Ansonsten wird aus der DB das geforderte gelesen
    if (action === ACTIONS.NEW) {
      let newEvent = Event.factory(authUser);
      dispatchEvent({
        type: REDUCER_ACTIONS.EVENT_FETCH_SUCCESS,
        payload: newEvent,
      });
      setEditMode(true);
    } else {
      if (!dbEvent) {
        dispatchEvent({ type: REDUCER_ACTIONS.EVENT_FETCH_INIT });
        Event.getEvent({ firebase: firebase, uid: urlUid })
          .then((result) => {
            dispatchEvent({
              type: REDUCER_ACTIONS.EVENT_FETCH_SUCCESS,
              payload: result,
            });
          })
          .catch((error) => {
            dispatchEvent({
              type: REDUCER_ACTIONS.EVENT_ON_ERROR,
              payload: error,
            });
            return;
          });
      } else {
        dispatchEvent({
          type: REDUCER_ACTIONS.EVENT_FETCH_SUCCESS,
          payload: dbEvent,
        });
      }
      if (action === ACTIONS.EDIT) {
        setEditMode(true);
      }
    }
  }, [action]);

  /* ------------------------------------------
  // Änderungsmodus aktivieren
  // ------------------------------------------ */
  const onEditClick = () => {
    setEditMode(true);
  };
  /* ------------------------------------------
  // Menuplaner öffnen
  // ------------------------------------------ */
  const onMenuplanClick = (triggeredEvent, event) => {
    push({
      pathname: `${ROUTES.MENUPLAN}/${event.uid}`,
      state: {
        event: event,
      },
    });
  };
  /* ------------------------------------------
  // Änderungsmodus Abbrechen
  // ------------------------------------------ */
  const onCancelClick = () => {
    //Bei Abbruch db Event anzeigen...
    dispatchEvent({
      type: REDUCER_ACTIONS.RESTORE_DB_VERSION,
    });
    setEditMode(false);
  };
  /* ------------------------------------------
  // Event speichern
  // ------------------------------------------ */
  const onSaveClick = async () => {
    try {
      Event.checkEventData(event.data);
    } catch (error) {
      dispatchEvent({
        type: REDUCER_ACTIONS.EVENT_ON_ERROR,
        payload: error,
      });
      return;
    }
    let newEvent = {};
    try {
      newEvent = await Event.save({
        firebase: firebase,
        event: event.data,
        authUser: authUser,
      });
    } catch (error) {
      dispatchEvent({
        type: REDUCER_ACTIONS.EVENT_ON_ERROR,
        payload: error,
      });
      return;
    }
    dispatchEvent({
      type: REDUCER_ACTIONS.EVENT_ON_SAVE,
      payload: newEvent.uid,
    });
  };

  /* ------------------------------------------
  // Feldwert ändern -- onChange
  // ------------------------------------------ */
  const onChangeField = (event) => {
    dispatchEvent({
      type: REDUCER_ACTIONS.EVENT_ON_CHANGE,
      // data: recipe,
      field: event.target.name,
      value: event.target.value,
    });
  };
  /* ------------------------------------------
  // Feldwert Datumpicker ändern -- onChange
  // ------------------------------------------ */
  const onChangeDate = (uid) => (triggeredEvent) => {
    let changedDatePicker = uid.split("_");

    dispatchEvent({
      type: REDUCER_ACTIONS.DATES_ON_CHANGE,
      field: changedDatePicker[1],
      value: triggeredEvent,
      uid: changedDatePicker[0],
    });
  };
  /* ------------------------------------------
  // Datumszeile Button Action
  // ------------------------------------------ */
  const onDatesButtonRowClick = (triggeredEvent) => {
    let pressedButton = triggeredEvent.currentTarget.id.split("_");

    let oldList = [];
    let newList = [];
    let newObject = {};

    oldList = event.data.dates;
    newObject = Event.createDateEntry();

    switch (pressedButton[1]) {
      case "add":
        newList = Event.addEmptyEntry({
          array: oldList,
          pos: parseInt(pressedButton[2]),
          emptyObject: newObject,
          renumberByField: "pos",
        });
        break;
      case "delete":
        newList = Event.deleteEntry({
          array: oldList,
          fieldValue: parseInt(pressedButton[2]),
          fieldName: "pos",
          emptyObject: newObject,
          renumberByField: "pos",
        });
        break;
      default:
        console.error("Unbekannter ButtonEvent: ", pressedButton[1]);
        throw new Error();
    }

    dispatchEvent({
      type: REDUCER_ACTIONS.DATES_UPDATE_LIST,
      payload: newList,
    });
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatchEvent({
      type: REDUCER_ACTIONS.EVENT_CLOSE_SNACKBAR,
    });
  };
  /* ------------------------------------------
  // Koch löschen
  // ------------------------------------------ */
  const onDeleteCook = async (cookUid) => {
    await Event.removeCookFromEvent({
      firebase: firebase,
      authUser: authUser,
      cookUidToRemove: cookUid,
      event: event.data,
    })
      .then((result) => {
        // Köche updaten
        dispatchEvent({
          type: REDUCER_ACTIONS.EVENT_UPDATE_COOKS,
          payload: result,
          snackbarSeverity: "info",
          snackbarText: TEXT.EVENT_COOK_DELETED,
        });
      })
      .catch((error) => {
        dispatchEvent({
          type: REDUCER_ACTIONS.EVENT_ON_ERROR,
          payload: error,
        });
        return;
      });
  };
  /* ------------------------------------------
  // Koch hinzufügen --> PopUp schliessen
  // ------------------------------------------ */
  const onCloseUserToAdd = () => {
    setUserAddValues({ popUpOpen: false });
  };
  /* ------------------------------------------
  // User hinzufügen PopUp
  // ------------------------------------------ */
  const onAddUser = async (email) => {
    setUserAddValues({ popUpOpen: false });
    let cookPublicProfile = {};
    let cookUid = "";
    let userFound = false;

    await User.getUidByEmail({ firebase: firebase, email: email })
      .then(async (result) => {
        cookUid = result;
        // Prüfen, dass nicht bereits vorhanden...
        event.data.cooks.forEach((cook) => {
          if (cook.uid === cookUid) {
            // Meldung setzen
            dispatchEvent({
              type: REDUCER_ACTIONS.SNACKBAR_SET_MESSAGE,
              severity: "warning",
              snackbarText: TEXT.EVENT_COOK_ALLREADY_ADDED,
            });
            userFound = true;
          }
        });

        if (userFound) {
          return;
        }

        await User.getPublicProfile({ firebase: firebase, uid: cookUid })
          .then((result) => {
            cookPublicProfile = result;
          })
          .then(async () => {
            console.log(cookPublicProfile);
            await Event.addCookToEvent(
              firebase,
              authUser,
              cookPublicProfile,
              cookUid,
              event.data
            ).then((result) => {
              // Köche updaten
              dispatchEvent({
                type: REDUCER_ACTIONS.EVENT_UPDATE_COOKS,
                payload: result,
                snackbarSeverity: "info",
                snackbarText: TEXT.EVENT_COOK_ADDED_SUCCES(
                  cookPublicProfile.displayName
                ),
              });
            });
          });
      })
      .catch((error) => {
        dispatchEvent({
          type: REDUCER_ACTIONS.EVENT_ON_ERROR,
          payload: error,
        });
        return;
      });
  };
  /* ------------------------------------------
  // User hinzufügen PopUp öffnen
  // ------------------------------------------ */
  const onOpenAddCookPopUp = () => {
    setUserAddValues({ popUpOpen: true });
  };
  /* ------------------------------------------
  // Bild in Firebase Storage hochladen
  // ------------------------------------------ */
  const onPictureUpload = async (triggeredEvent) => {
    triggeredEvent.persist();
    var file = triggeredEvent.target.files[0];

    // Upload Start...
    dispatchEvent({
      type: REDUCER_ACTIONS.PICTURE_UPLOAD_INIT,
    });
    await Event.uploadPicture({
      firebase: firebase,
      file: file,
      event: event.data,
      authUser: authUser,
    }).then((downloadURLs) => {
      dispatchEvent({
        type: REDUCER_ACTIONS.PICTURE_UPLOAD_SUCCESS,
        payload: downloadURLs,
      });
    });
  };
  /* ------------------------------------------
  // Bild löschen
  // ------------------------------------------ */
  const onPictureDelete = () => {
    if (window.confirm(TEXT.QUESTION_DELETE_IMAGE)) {
      Event.deletePicture({
        firebase: firebase,
        event: event.data,
        authUser: authUser,
      })
        .then(() => {
          dispatchEvent({
            type: REDUCER_ACTIONS.DELETE_PICTURE_SUCCESS,
          });
        })
        .catch((error) => {
          dispatchEvent({
            type: REDUCER_ACTIONS.EVENT_ON_ERROR,
            payload: error,
          });
        });
    }
  };

  /* ------------------------------------------
  // Bild aus Google Maps generieren
  // ------------------------------------------ */
  //NEXT_FEATURE: Bild anhand von Ort generieren
  // const onPictureGenerate = async () => {
  //   Event.generatePictureUrlByLocation(event.data.location);
  // };
  /* ------------------------------------------
  // ================= AUSGABE ================
  // ------------------------------------------ */
  return (
    <React.Fragment>
      <CssBaseline />
      {/*===== HEADER ===== */}
      {event.error.code !== FIREBASEMESSSAGES.GENERAL.PERMISSION_DENIED && (
        <EventHeader
          event={event.data}
          editMode={editMode}
          onEditClick={onEditClick}
          onMenuplanClick={onMenuplanClick}
          onSaveClick={onSaveClick}
          onCancelClick={onCancelClick}
        />
      )}
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
        <Backdrop className={classes.backdrop} open={event.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <br />
        <Grid container spacing={2}>
          {event.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={event.error}
                messageTitle={TEXT.ALERT_TITLE_WAIT_A_MINUTE}
              />
            </Grid>
          )}
          {/* Bei Berechtigungsfehler nichts anzeigen */}
          {event.error.code !== FIREBASEMESSSAGES.GENERAL.PERMISSION_DENIED && (
            <React.Fragment>
              {editMode && (
                <Grid item key={"header"} xs={12}>
                  <NamePanel
                    key={"namePanel"}
                    event={event.data}
                    onChange={onChangeField}
                  />
                </Grid>
              )}
              <Grid item key={"infos"} xs={12}>
                <InfoPanel
                  key={"infoPanel"}
                  event={event.data}
                  editMode={editMode}
                  onChange={onChangeField}
                />
              </Grid>
              <Grid item key={"dates"} xs={12} sm={6}>
                <DatesPanel
                  key={"datesPanel"}
                  event={event.data}
                  editMode={editMode}
                  onChangeDate={onChangeDate}
                  onDatesButtonRowClick={onDatesButtonRowClick}
                />
              </Grid>
              <Grid item key={"cooks"} xs={12} sm={6}>
                <CookPanel
                  key={"cookPanel"}
                  event={event.data}
                  // editMode={editMode}
                  onAddCook={onOpenAddCookPopUp}
                  onChange={onChangeField}
                  onDeleteCook={onDeleteCook}
                  authUser={authUser}
                />
              </Grid>
              <Grid item key={"image"} xs={12}>
                <ImagePanel
                  key={"imagePanel"}
                  event={event.data}
                  editMode={editMode}
                  isLoadingPicture={event.isLoadingPicture}
                  editMode={editMode}
                  onChange={onChangeField}
                  onUpload={onPictureUpload}
                  onDelete={onPictureDelete}
                  // onGenerate={onPictureGenerate}
                />
              </Grid>
            </React.Fragment>
          )}
        </Grid>
      </Container>
      <DialogAddUser
        firebase={firebase}
        dialogOpen={userAddValues.popUpOpen}
        handleAdd={onAddUser}
        handleClose={onCloseUserToAdd}
      />
      <CustomSnackbar
        message={event.snackbar.message}
        severity={event.snackbar.severity}
        snackbarOpen={event.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ============================== Header =============================
// =================================================================== */
const EventHeader = ({
  event,
  editMode,
  onEditClick,
  onMenuplanClick,
  onSaveClick,
  onCancelClick,
}) => {
  return (
    <React.Fragment>
      {!editMode ? (
        <React.Fragment>
          <PageTitle
            title={event.name}
            subTitle={event.motto}
            pictureSrc={event.pictureSrc}
          />
          <ButtonRow
            key="buttons_view"
            buttons={[
              {
                id: "edit",
                hero: true,
                label: TEXT.BUTTON_EDIT,
                variant: "contained",
                color: "primary",
                visible: true,
                onClick: onEditClick,
              },
              {
                id: "menuplan",
                hero: true,
                label: TEXT.BUTTON_MENUPLAN,
                variant: "outlined",
                color: "primary",
                visible: true,
                onClick: (triggeredEvent) =>
                  onMenuplanClick(triggeredEvent, event),
              },
            ]}
          />
        </React.Fragment>
      ) : (
        <ButtonRow
          key="buttons_edit"
          buttons={[
            {
              id: "save",
              hero: true,
              label: TEXT.BUTTON_SAVE,
              variant: "contained",
              color: "primary",
              visible: true,
              onClick: onSaveClick,
            },
            {
              id: "cancel",
              hero: true,
              label: TEXT.BUTTON_CANCEL,
              variant: "outlined",
              color: "primary",
              visible: true,
              onClick: onCancelClick,
            },
          ]}
        />
      )}
    </React.Fragment>
  );
};
/* ===================================================================
// =============================== Name ==============================
// =================================================================== */
const NamePanel = ({ event, onChange }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_EVENT}
        </Typography>

        <TextField
          id="name"
          key="name"
          autoComplete="eventName"
          name="name"
          required
          fullWidth
          label={TEXT.FIELD_NAME}
          value={event.name}
          onChange={onChange}
          autoFocus
        />
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// =========================== Infos Panel ===========================
// =================================================================== */
const InfoPanel = ({ event, editMode, onChange }) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Card className={classes.card} key={"cardInfo"}>
        <CardContent className={classes.cardContent} key={"cardContentInfo"}>
          <Typography gutterBottom={true} variant="h5" component="h2">
            {TEXT.PANEL_INFO}
          </Typography>
          <List key={"infoList"}>
            <FormListItem
              id={"motto"}
              key={"motto"}
              value={event.motto}
              label={TEXT.FIELD_MOTTO}
              icon={<LocalActivityIcon fontSize="small" />}
              editMode={editMode}
              onChange={onChange}
            />
            <FormListItem
              id={"location"}
              key={"location"}
              value={event.location}
              label={TEXT.FIELD_LOCATION}
              icon={<LocationOnIcon fontSize="small" />}
              editMode={editMode}
              onChange={onChange}
            />
            <FormListItem
              id={"participants"}
              key={"participants"}
              type={"number"}
              value={event.participants}
              label={TEXT.FIELD_PARTICIPANTS}
              icon={<PeopleIcon fontSize="small" />}
              editMode={editMode}
              onChange={onChange}
            />
            {!editMode && (
              <React.Fragment>
                <FormListItem
                  id={"createdFromDisplayName"}
                  key={"createdFromDisplayName"}
                  value={event.createdFromDisplayName}
                  label={TEXT.FIELD_CREATED_FROM}
                  icon={<PersonIcon fontSize="small" />}
                  editMode={editMode}
                />
                <FormListItem
                  value={
                    event.createdAt &&
                    event.createdAt.toLocaleString("de-CH", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  }
                  id={"createdAt"}
                  key={"createdAt"}
                  label={TEXT.FIELD_CREATED_AT}
                  icon={<TodayIcon fontSize="small" />}
                  editMode={editMode}
                />
              </React.Fragment>
            )}
          </List>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================= List Item ===========================
// =================================================================== */
const FormListItem = ({
  value,
  id,
  label,
  icon,
  type,
  multiLine = false,
  disabled = false,
  editMode,
  onChange,
  isLink,
}) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <ListItem key={"listItem_" + id}>
        {icon && (
          <ListItemIcon className={classes.listItemIcon}>{icon}</ListItemIcon>
        )}
        {editMode ? (
          <TextField
            id={id}
            key={id}
            type={type}
            InputProps={type === "number" ? { inputProps: { min: 0 } } : null}
            label={label}
            name={id}
            disabled={disabled}
            autoComplete={id}
            value={value}
            onChange={onChange}
            multiline={multiLine}
            fullWidth
          />
        ) : (
          <React.Fragment>
            <ListItemText className={classes.listItemTitle} secondary={label} />
            {isLink && value ? (
              <ListItemText className={classes.listItemContent}>
                <Link href={value}>{Utils.getDomain(value)}</Link>
              </ListItemText>
            ) : (
              <ListItemText
                className={classes.listItemContent}
                primary={value}
              />
            )}
          </React.Fragment>
        )}
      </ListItem>
      {!editMode && <Divider />}
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Cook Panel ===========================
// =================================================================== */
const CookPanel = ({
  event,
  editMode,
  onChange,
  onDeleteCook,
  onAddCook,
  authUser,
}) => {
  const classes = useStyles();
  const { push } = useHistory();

  /* ------------------------------------------
  // Öffentliches Profil besuchen
  // ------------------------------------------ */
  const onClick = (cook) => {
    push({
      pathname: `${ROUTES.USER_PUBLIC_PROFILE}/${cook.uid}`,
      state: {
        action: ACTIONS.VIEW,
        displayName: cook.displayName,
        pictureSrc: cook.pictureSrc,
      },
    });
  };
  return (
    <React.Fragment>
      <Card className={classes.card} key={"cardInfo"}>
        <CardContent className={classes.cardContent} key={"cardContentInfo"}>
          <Typography gutterBottom={true} variant="h5" component="h2">
            {TEXT.PANEL_COOKS}
          </Typography>
          <List className={classes.list} key={"cookList"}>
            {event.cooks.map((cook, counter) => (
              <React.Fragment key={"cook_" + counter}>
                {counter > 0 && <Divider variant="inset" component="li" />}
                <ListItem
                  alignItems="flex-start"
                  key={"cookListItem_" + cook.uid}
                  button
                  onClick={() => onClick(cook)}
                >
                  <ListItemAvatar>
                    {cook.pictureSrc ? (
                      <Avatar
                        alt={cook.displayName}
                        src={String(cook.pictureSrc)}
                      />
                    ) : (
                      <Avatar alt={cook.displayName}>
                        {cook.displayName.charAt(0)}
                      </Avatar>
                    )}
                  </ListItemAvatar>

                  <ListItemText
                    primary={cook.displayName}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          className={classes.inline}
                          color="textSecondary"
                        >
                          {cook.motto}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  {event.cooks.length > 1 && cook.uid !== authUser.uid ? (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete cook"
                        id={"delete_cook_" + cook.name}
                        color="primary"
                        onClick={() => onDeleteCook(cook.uid)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  ) : null}
                </ListItem>
              </React.Fragment>
            ))}
          </List>
          <Grid container spacing={2} justifyContent="center">
            <Button size="small" onClick={onAddCook}>
              {TEXT.BUTTON_ADD_PERSON}{" "}
            </Button>
          </Grid>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Dates Panel ===========================
// =================================================================== */
const DatesPanel = ({
  event,
  editMode,
  onChangeDate,
  onDatesButtonRowClick,
}) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Card className={classes.card} key={"cardDates"}>
        <CardContent className={classes.cardContent} key={"cardContentDates"}>
          <Typography gutterBottom={true} variant="h5" component="h2">
            {TEXT.PANEL_DATES}
          </Typography>
          {
            // Fehler
          }
          {editMode ? (
            <Grid container spacing={2}>
              {event.dates.map((date, counter) => (
                <React.Fragment key={"date_" + date.uid}>
                  <MuiPickersUtilsProvider
                    utils={DeLocalizedUtils}
                    locale={deLocale}
                  >
                    {/* <Grid item xs={1} sm={1} className={classes.centerCenter}>
                      <Typography>{date.pos}</Typography>
                    </Grid> */}
                    <Grid item xs={5}>
                      <KeyboardDatePicker
                        disableToolbar
                        // variant="inline"
                        format="dd.MM.yyyy"
                        margin="normal"
                        id={"dateFrom_" + date.uid}
                        key={"dateFrom_" + date.uid}
                        label={TEXT.FIELD_FROM}
                        value={
                          date.from.getTime() == new Date(0).getTime()
                            ? null
                            : date.from
                        }
                        fullWidth
                        onChange={onChangeDate(date.uid + "_from")}
                        KeyboardButtonProps={{
                          "aria-label": "change date",
                        }}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <KeyboardDatePicker
                        disableToolbar
                        // variant="inline"
                        format="dd.MM.yyyy"
                        margin="normal"
                        id={"dateTo_" + date.uid}
                        key={"dateTo_" + date.uid}
                        label={TEXT.FIELD_TO}
                        value={
                          date.to.getTime() == new Date(0).getTime()
                            ? null
                            : date.to
                        }
                        fullWidth
                        onChange={onChangeDate(date.uid + "_to")}
                        KeyboardButtonProps={{
                          "aria-label": "change date",
                        }}
                      />
                    </Grid>
                    <Grid item xs={2} className={classes.centerCenter}>
                      <React.Fragment>
                        <Tooltip title={TEXT.TOOLTIP_ADD_POS}>
                          <span>
                            <IconButton
                              id={"date_add_" + date.pos}
                              aria-label="new"
                              color="primary"
                              onClick={onDatesButtonRowClick}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={TEXT.TOOLTIP_DEL_POS}>
                          <span>
                            <IconButton
                              id={"date_delete_" + date.pos}
                              aria-label="delete"
                              onClick={onDatesButtonRowClick}
                              color="primary"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </React.Fragment>
                    </Grid>
                  </MuiPickersUtilsProvider>
                  {event.dates.length > 1 && event.dates.length !== counter ? (
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                  ) : null}
                </React.Fragment>
              ))}
            </Grid>
          ) : (
            <List className={classes.list}>
              {event.dates.map((date, counter) => (
                <React.Fragment key={"date_" + date.uid}>
                  {event.dates.length > 1 && counter !== 0 ? (
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                  ) : null}
                  <ListItem
                    alignItems="flex-start"
                    key={"dateItem_" + date.uid}
                  >
                    {date.from && (
                      <ListItemText
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              className={classes.inline}
                              color="textPrimary"
                            >
                              {date.from.toLocaleString("de-CH", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }) +
                                " - " +
                                date.to.toLocaleString("de-CH", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                })}
                            </Typography>
                            {" - "}{" "}
                            {Utils.differenceBetweenTwoDates({
                              dateFrom: date.from,
                              dateTo: date.to,
                            }) + " Tage"}
                          </React.Fragment>
                        }
                      />
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

/* ===================================================================
// ============================ Image Panel ==========================
// =================================================================== */
const ImagePanel = ({
  event,
  isLoadingPicture,
  editMode,
  onChange,
  onUpload,
  onDelete,
  // onGenerate,
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"imageCard"}>
      {!isLoadingPicture && event.pictureSrc && (
        <CardMedia
          key={"imageCardMedia"}
          className={classes.cardMedia}
          image={event.pictureSrc}
          title={event.name}
        />
      )}
      <CardContent className={classes.cardContent} key={"imageCardContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_IMAGE}
        </Typography>
        {isLoadingPicture && <LinearProgress />}
        <Grid container spacing={2}>
          {!event.pictureSrc.includes("firebasestorage.googleapis") &&
            !event.pictureSrc.includes("chuchipirat") && (
              <Grid item key={"grid_pictureSrc"} xs={12}>
                {/* <List> */}
                <FormListItem
                  value={
                    editMode
                      ? event.pictureSrc
                      : Utils.getDomain(event.pictureSrc)
                  }
                  id={"pictureSrc"}
                  key={"pictureSrc"}
                  label={TEXT.FIELD_IMAGE_SOURCE}
                  icon={<ImageIcon fontSize="small" />}
                  multiLine={false}
                  disabled={
                    !event.pictureSrc
                      ? false
                      : event.pictureSrc.includes(
                          "firebasestorage.googleapis"
                        ) && event.pictureSrc.includes("chuchipirat")
                  }
                  editMode={editMode}
                  onChange={onChange}
                />
              </Grid>
            )}
          {event.pictureSrc.includes("firebasestorage.googleapis") &&
            event.pictureSrc.includes("chuchipirat") && (
              <Grid item key={"grid_pictureDelete"} xs={12}>
                <Button
                  disabled={!event.pictureSrc}
                  fullWidth
                  variant="outlined"
                  color="default"
                  onClick={onDelete}
                  startIcon={<DeleteIcon />}
                  component="span"
                >
                  {TEXT.BUTTON_DELETE}
                </Button>
              </Grid>
            )}
          <Grid item key={"grid_imageUpload"} xs={12}>
            <React.Fragment>
              <input
                accept="image/*"
                className={classes.inputFileUpload}
                id="icon-button-file"
                type="file"
                onChange={onUpload}
              />
              <label htmlFor="icon-button-file">
                <Button
                  disabled={!event.uid}
                  fullWidth
                  variant="contained"
                  color="default"
                  className={classes.button}
                  startIcon={<CloudUploadIcon />}
                  component="span"
                >
                  {TEXT.BUTTON_UPLOAD}
                </Button>
              </label>
            </React.Fragment>
          </Grid>
          {/* NEXT_FEATURE: Bild anhand Ort generieren */}
          {/* <Grid item key={"grid_imageGenerate"} xs={6}>
            <Button
              fullWidth
              variant="contained"
              color="default"
              className={classes.button}
              startIcon={<PhotoFilterIcon />}
              component="span"
              onClick={onGenerate}
            >
              Generieren
            </Button>
          </Grid> */}
          {!event.uid && (
            <Grid item key={"grid_imageInfo"} xs={12}>
              <Alert severity="info">{TEXT.ALERT_TEXT_IMAGE_SAVE_FIRST} </Alert>
            </Grid>
          )}
          <Grid item key={"grid_imageText"} xs={12}>
            <Typography color="textSecondary" variant="body2">
              {TEXT.ALERT_TEXT_IMAGE_SOURCE}{" "}
            </Typography>
            {/* <Typography color="textSecondary" variant="body2">
              Du kannst die URL eines Bildes im Netz angeben, dein eigenes Bild
              (.jpg) hochladen oder du holst dir ein Bild von Google Maps.
            </Typography> 
            <br />
            <Typography color="textSecondary" variant="body2">
              Dabei wird anhand des Ortes auf Google Maps das entsprechende Bild
              gesucht. Für bessere Suchresultate füge das Kantonskürzel hinter
              den Ort.
            </Typography>*/}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(EventPage);
