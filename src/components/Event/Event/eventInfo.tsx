import React from "react";
import clsx from "clsx";
import {makeStyles, Theme, createStyles} from "@material-ui/core/styles";

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  Divider,
  Typography,
  Tooltip,
  IconButton,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from "@material-ui/icons";

import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";

import format from "date-fns/format";
import deLocale from "date-fns/locale/de";
import DateFnsUtils from "@date-io/date-fns";

import {
  DEFINE_BASIC_EVENT_DATA as TEXT_DEFINE_BASIC_EVENT_DATA,
  EVENT_INFO as TEXT_EVENT_INFO,
  EVENT_NAME as TEXT_EVENT_NAME,
  EVENT_NAME_HELPERTEXT as TEXT_EVENT_NAME_HELPERTEXT,
  MOTTO as TEXT_MOTTO,
  MOTTO_HELPERTEXT as TEXT_MOTTO_HELPERTEXT,
  LOCATION as TEXT_LOCATION,
  LOCATION_HELPERTEXT as TEXT_LOCATION_HELPERTEXT,
  FROM as TEXT_FROM,
  TO as TEXT_TO,
  DATES as TEXT_DATES,
  DELETE_DATES as TEXT_DELETE_DATES,
  ADD_IMAGE as TEXT_ADD_IMAGE,
  DELETE_IMAGE as TEXT_DELETE_IMAGE,
  COVER_PICTURES as TEXT_COVER_PICTURES,
  ADD_LOGO_OR_CAMP_PICTURE_HERE as TEXT_ADD_LOGO_OR_CAMP_PICTURE_HERE,
  BACK_TO_OVERVIEW as TEXT_BACK_TO_OVERVIEW,
  CONTINUE as TEXT_CONTIUNE,
  CONFIRM_CHANGES_ARE_LOST as TEXT_CONFIRM_CHANGES_ARE_LOST,
  KITCHENCREW as TEXT_KITCHENCREW,
  COOKING_IS_COMMUNITY_SPORT as TEXT_COOKING_IS_COMMUNITY_SPORT,
  ADD_COOK_TO_EVENT as TEXT_ADD_COOK_TO_EVENT,
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  QUESTION_DELETE_IMAGE as TEXT_QUESTION_DELETE_IMAGE,
  EVENT_IS_BEEING_CREATED as TEXT_EVENT_IS_BEEING_CREATED,
  IMAGE_IS_BEEING_UPLOADED as TEXT_IMAGE_IS_BEEING_UPLOADED,
  DELETE as TEXT_DELETE,
  UNSAVED_CHANGES as TEXT_UNSAVED_CHANGES,
  DISCARD_CHANGES as TEXT_DISCARD_CHANGES,
} from "../../../constants/text";

import useStyles from "../../../constants/styles";
import {CARD_PLACEHOLDER_PICTURE} from "../../../constants/defaultValues";

import Event from "./event.class";
import Menuplan from "../Menuplan/menuplan.class";
import UsedRecipes from "../UsedRecipes/usedRecipes.class";
import User from "../../User/user.class";

import Firebase from "../../Firebase";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import Utils from "../../Shared/utils.class";
import AlertMessage from "../../Shared/AlertMessage";
import DialogAddUser from "../../User/dialogAddUser";
import {ButtonAction} from "../../Shared/global.interface";
import FieldValidationError, {
  FormValidationFieldError,
  FormValidatorUtil,
} from "../../Shared/fieldValidation.error.class";
import {DialogType, useCustomDialog} from "../../Shared/customDialogContext";
import ShoppingListCollection from "../ShoppingList/shoppingListCollection.class";
import MaterialList from "../MaterialList/materialList.class";
// import MaterialList from "../MaterialList/materialList.class";

/* ===================================================================
// ============================== Global =============================
// =================================================================== */
class DeLocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "dd.MM.yyyy", {locale: this.locale});
  }
}
/* ===================================================================
// ============================ Dispatcher ===========================
// =================================================================== */
enum ReducerActions {
  FIELD_UPDATE = "FIELD_UPDATE",
  UPLOAD_PICTURE_INIT = "UPLOAD_PICTURE_INIT",
  UPLOAD_PICTURE_SUCCESS = "UPLOAD_PICTURE_SUCCESS",
  SAVE_EVENT_INIT = "SAVE_EVENT_INIT",
  SAVE_EVENT_SUCCESS = "SAVE_EVENT_SUCCESS",
  GENERIC_ERROR = "GENERIC_ERROR",
}
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};
type State = {
  event: Event;
  isUpLoadingPicture: boolean;
  isSaving: boolean;
  isError: boolean;
  error: object;
};

const homeReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.FIELD_UPDATE:
      return {
        ...state,
        event: {...state.event, [action.payload.field]: action.payload.value},
      };
    case ReducerActions.UPLOAD_PICTURE_INIT:
      return {
        ...state,
        isUpLoadingPicture: true,
      };
    case ReducerActions.UPLOAD_PICTURE_SUCCESS:
      return {
        ...state,
        event: {
          ...state.event,
          pictureSrc: action.payload.pictureSrc as string,
        },
        isUpLoadingPicture: false,
      };
    case ReducerActions.SAVE_EVENT_INIT:
      return {...state, isSaving: true};
    case ReducerActions.SAVE_EVENT_SUCCESS:
      return {...state, isSaving: false, event: action.payload as Event};
    case ReducerActions.GENERIC_ERROR:
      return {
        ...state,
        isSaving: false,
        isError: true,
        error: action.payload,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
/* ===================================================================
// ============================ Event-Info ===========================
// =================================================================== */
interface EventInfoPageProps {
  firebase: Firebase;
  authUser: AuthUser;
  onConfirm?: ButtonAction;
  onCancel?: ButtonAction;
}
const EventInfoPage = ({
  firebase,
  authUser,
  onConfirm,
  onCancel,
}: EventInfoPageProps) => {
  // Hier damit der AuthUser übergeben werden kann
  const inititialState: State = {
    event: Event.factory(authUser),
    isUpLoadingPicture: false,
    isSaving: false,
    isError: false,
    error: {},
  };
  const [state, dispatch] = React.useReducer(homeReducer, inititialState);
  const [localPicture, setLocalPicture] = React.useState<File | null>(null);
  const [dialogAddUserOpen, setDialogAddUserOpen] = React.useState(false);
  const classes = useStyles();
  const [formValidation, setFormValidation] = React.useState<
    Array<FormValidationFieldError>
  >([]);
  const {customDialog} = useCustomDialog();

  /* ------------------------------------------
  // Field-Change
  // ------------------------------------------ */
  const onFieldUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ReducerActions.FIELD_UPDATE,
      payload: {field: event.target.name, value: event.target.value},
    });
  };
  const onDatePickerUpdate = (date: Date | null, field: string) => {
    let changedPos = field.split("_");
    let tempDates = [...state.event.dates];
    let eventDate = tempDates.find(
      (eventDate) => eventDate.uid == changedPos[1]
    );
    if (!eventDate) {
      return;
    }
    eventDate[changedPos[0]] = date;

    // Wenn das Von-Datum gesetzt wurde und das Bis noch initial ist,
    // dieses Datum auch gleich setzen, damit nicht soweit gescrollt werden muss
    if (changedPos[0] == "from" && eventDate.to.getFullYear() == 1970) {
      eventDate.to = date!;
    }

    // Wenn das die letzte Zeile ist, automatisch eine neue einfügen
    if (eventDate.pos == state.event.dates.length) {
      let newDate = Event.createDateEntry();
      newDate.pos = eventDate.pos + 1;
      tempDates.push(newDate);
    }
    tempDates = Utils.renumberArray({array: tempDates, field: "pos"});
    console.log(tempDates, eventDate);
    dispatch({
      type: ReducerActions.FIELD_UPDATE,
      payload: {field: "dates", value: tempDates},
    });
  };
  const onDateDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    let tempDates = state.event.dates.filter(
      (eventDate) => eventDate.uid != event.currentTarget.id.split("_")[1]
    );
    tempDates = Utils.renumberArray({array: tempDates, field: "pos"});
    dispatch({
      type: ReducerActions.FIELD_UPDATE,
      payload: {field: "dates", value: tempDates},
    });
  };
  /* ------------------------------------------
  // Bild-Handling
  // ------------------------------------------ */
  const onImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let file: File;
    if (event.target.files && event.target.files[0]) {
      file = event.target.files?.[0];
    } else {
      return;
    }

    setLocalPicture(file);
  };
  const onImageDelete = async () => {
    if (!state.event.uid) {
      setLocalPicture(null);
    } else {
      const isConfirmed = await customDialog({
        dialogType: DialogType.Confirm,
        text: TEXT_QUESTION_DELETE_IMAGE,
        title: `${TEXT_DELETE_IMAGE}?`,
        buttonTextConfirm: TEXT_DELETE,
      });
      if (!isConfirmed) {
        return;
      }

      Event.deletePicture({
        firebase: firebase,
        event: state.event,
        authUser: authUser,
      }).then(() => {
        dispatch({
          type: ReducerActions.FIELD_UPDATE,
          payload: {field: "pictureSrc", value: ""},
        });
      });
    }
  };
  /* ------------------------------------------
  // Köche-Handling
  // ------------------------------------------ */
  const onOpenDialogAddUserDialog = () => {
    setDialogAddUserOpen(true);
  };
  const onCloseDialogAddUserDialog = async () => {
    setDialogAddUserOpen(false);
  };
  const onAddUserToEvent = async (personUid: string) => {
    // Koch hinzufügen
    if (personUid) {
      await User.getPublicProfile({firebase: firebase, uid: personUid}).then(
        (result) => {
          Event.addCookToEvent({
            firebase: firebase,
            authUser: authUser,
            cookPublicProfile: result,
            event: state.event,
          }).then((result) => {
            dispatch({
              type: ReducerActions.FIELD_UPDATE,
              payload: {field: "cooks", value: result},
            });
          });
        }
      );
    }
    setDialogAddUserOpen(false);
  };
  const onDeleteCook = (event: React.MouseEvent<HTMLButtonElement>) => {
    let cookUidToDelete = event.currentTarget.id.split("_")[1];
    if (!cookUidToDelete) {
      return;
    }

    // auf der DB entfernen
    Event.removeCookFromEvent({
      firebase: firebase,
      authUser: authUser,
      cookUidToRemove: cookUidToDelete,
      event: state.event,
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.FIELD_UPDATE,
          payload: {
            field: "cooks",
            value: result,
          },
        });
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };

  /* ------------------------------------------
  // Weiter // Zurück
  // ------------------------------------------ */
  const saveEvent = async (event: React.MouseEvent<HTMLButtonElement>) => {
    dispatch({type: ReducerActions.SAVE_EVENT_INIT, payload: {}});
    let eventUid: string;

    let result = await Event.save({
      firebase: firebase,
      event: state.event,
      authUser: authUser,
      localPicture: localPicture ? localPicture : ({} as File),
    })
      //TODO: hier schauen wie das nacher mit dem bearbeiten geht.
      .then(async (result) => {
        eventUid = result.uid;
        dispatch({type: ReducerActions.SAVE_EVENT_SUCCESS, payload: result});

        // Menüplan erstellen und speichern.
        await Menuplan.save({
          menuplan: Menuplan.factory({
            event: {...state.event, uid: eventUid},
            authUser: authUser,
          }),
          firebase: firebase,
          authUser: authUser,
        }).catch((error) => {
          console.error(error);
          throw error;
        });

        // Es wurde auf OnConfirm geklick... weiter gehts
        onConfirm?.onClick(event, result);
      })
      .catch((error: FieldValidationError) => {
        console.warn("error!!!", error);
        if (error.formValidation) {
          setFormValidation(error.formValidation);
          // Neuer Fehler // ValidationError im Reducer
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
          // Zum 1. Fehler-Feld scrollen
          const element = document.getElementById(
            error.formValidation[0].fieldName
          );
          element && element.scrollIntoView({behavior: "smooth"});
          return;
        }
      });
    console.warn("ich laufe weiter....");
  };
  const cancelCreate = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onCancel?.onClick) {
      if (state.event != inititialState.event) {
        const isConfirmed = await customDialog({
          dialogType: DialogType.Confirm,
          text: TEXT_CONFIRM_CHANGES_ARE_LOST,
          title: TEXT_UNSAVED_CHANGES,
          buttonTextConfirm: TEXT_DISCARD_CHANGES,
        });
        if (!isConfirmed) {
          return;
        }

        onCancel.onClick(event);
      } else {
        onCancel.onClick(event);
      }
    }
  };
  return (
    <React.Fragment>
      {state.isError && (
        <Grid item key={"error"} xs={12}>
          <AlertMessage
            error={state.error}
            messageTitle={TEXT_ALERT_TITLE_WAIT_A_MINUTE}
          />
        </Grid>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Backdrop className={classes.backdrop} open={state.isSaving}>
            <Grid container spacing={2}>
              <Grid item xs={12} className={classes.centerCenter}>
                <CircularProgress color="inherit" />
              </Grid>
              <Grid item xs={12} className={classes.centerCenter}>
                <Typography>
                  {TEXT_EVENT_IS_BEEING_CREATED(state.event.name)}
                </Typography>
              </Grid>
              {localPicture && (
                <Grid item xs={12} className={classes.centerCenter}>
                  <Typography>{TEXT_IMAGE_IS_BEEING_UPLOADED}</Typography>
                </Grid>
              )}
            </Grid>
          </Backdrop>
          <EventBasicInfoCard
            event={state.event}
            formValidation={formValidation}
            onFieldUpdate={onFieldUpdate}
            onDatePickerUpdate={onDatePickerUpdate}
            onDateDeleteClick={onDateDeleteClick}
            onImageUpload={onImageUpload}
            onImageDelete={onImageDelete}
            previewPictureUrl={
              localPicture ? URL.createObjectURL(localPicture) : ""
            }
          />
        </Grid>
        <Grid item xs={12}>
          <EventCookingTeamCard
            event={state.event}
            formValidation={formValidation}
            authUser={authUser}
            onAddCook={onOpenDialogAddUserDialog}
            onDeleteCook={onDeleteCook}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} container justifyContent="flex-end">
              {onCancel && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={cancelCreate}
                >
                  {onCancel.buttonText}
                </Button>
              )}
              {onConfirm && (
                <Button
                  variant="contained"
                  color="primary"
                  style={{marginLeft: "1rem"}}
                  onClick={saveEvent}
                >
                  {onConfirm.buttonText}
                </Button>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <DialogAddUser
        firebase={firebase}
        authUser={authUser}
        dialogOpen={dialogAddUserOpen}
        handleAddUser={onAddUserToEvent}
        handleClose={onCloseDialogAddUserDialog}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ============================= Info-Card ===========================
// =================================================================== */
interface EventBasicInfoCardProps {
  event: Event;
  formValidation: FormValidationFieldError[];
  onFieldUpdate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDatePickerUpdate: (date: Date | null, field: string) => void;
  onDateDeleteClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => {};
  onImageDelete: () => void;
  previewPictureUrl: string | null;
}
const EventBasicInfoCard = ({
  event,
  formValidation,
  onFieldUpdate,
  onDatePickerUpdate,
  onDateDeleteClick,
  onImageUpload,
  onImageDelete,
  previewPictureUrl,
}: EventBasicInfoCardProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader
        title={TEXT_EVENT_INFO}
        subheader={TEXT_DEFINE_BASIC_EVENT_DATA}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="name"
                  name="name"
                  variant="outlined"
                  label={TEXT_EVENT_NAME}
                  value={event.name}
                  onChange={onFieldUpdate}
                  helperText={FormValidatorUtil.getHelperText(
                    formValidation,
                    "name",
                    TEXT_EVENT_NAME_HELPERTEXT
                  )}
                  error={FormValidatorUtil.isFieldErroneous(
                    formValidation,
                    "name"
                  )}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="motto"
                  name="motto"
                  variant="outlined"
                  label={TEXT_MOTTO}
                  helperText={TEXT_MOTTO_HELPERTEXT}
                  value={event.motto}
                  onChange={onFieldUpdate}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="location"
                  name="location"
                  variant="outlined"
                  label={TEXT_LOCATION}
                  helperText={TEXT_LOCATION_HELPERTEXT}
                  value={event.location}
                  onChange={onFieldUpdate}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">{TEXT_DATES}</Typography>
                  </Grid>
                  {event.dates.map((eventDate, counter) => (
                    <React.Fragment key={"date_" + eventDate.uid}>
                      <MuiPickersUtilsProvider
                        utils={DeLocalizedUtils}
                        locale={deLocale}
                      >
                        <Grid item xs={5}>
                          <KeyboardDatePicker
                            disableToolbar
                            inputVariant="outlined"
                            format="dd.MM.yyyy"
                            // margin="normal"
                            id={"dateFrom_" + eventDate.uid}
                            key={"dateFrom_" + eventDate.uid}
                            label={TEXT_FROM}
                            value={
                              eventDate.from?.getTime() == new Date(0).getTime()
                                ? null
                                : eventDate.from
                            }
                            error={FormValidatorUtil.isFieldErroneous(
                              formValidation,
                              "dateFrom_" + eventDate.uid
                            )}
                            helperText={FormValidatorUtil.getHelperText(
                              formValidation,
                              "dateFrom_" + eventDate.uid,
                              ""
                            )}
                            fullWidth
                            onChange={(date) =>
                              onDatePickerUpdate(date, "from_" + eventDate.uid)
                            }
                            KeyboardButtonProps={{
                              "aria-label": "Von Datum",
                            }}
                          />
                        </Grid>
                        <Grid item xs={1} className={classes.centerCenter}>
                          <Typography>-</Typography>
                        </Grid>
                        <Grid item xs={5}>
                          <KeyboardDatePicker
                            disableToolbar
                            inputVariant="outlined"
                            format="dd.MM.yyyy"
                            id={"to_" + eventDate.uid}
                            key={"to_" + eventDate.uid}
                            label={TEXT_TO}
                            value={
                              eventDate.to?.getTime() == new Date(0).getTime()
                                ? null
                                : eventDate.to
                            }
                            error={FormValidatorUtil.isFieldErroneous(
                              formValidation,
                              "dateTo_" + eventDate.uid
                            )}
                            helperText={FormValidatorUtil.getHelperText(
                              formValidation,
                              "dateTo_" + eventDate.uid,
                              ""
                            )}
                            fullWidth
                            onChange={(date) =>
                              onDatePickerUpdate(date, "to_" + eventDate.uid)
                            }
                            KeyboardButtonProps={{
                              "aria-label": "Bis Datum",
                            }}
                          />
                        </Grid>
                        <Grid item xs={1} className={classes.centerCenter}>
                          <React.Fragment>
                            <Tooltip title={TEXT_DELETE_DATES}>
                              <span>
                                <IconButton
                                  id={"dateDelete_" + eventDate.uid}
                                  aria-label="delete"
                                  onClick={onDateDeleteClick}
                                  color="primary"
                                  disabled={
                                    // 1970 = leeres Datum
                                    (eventDate.from?.getFullYear() == 1970 &&
                                      eventDate.to?.getFullYear() == 1970) ||
                                    (eventDate.pos == 1 &&
                                      event.dates.length == 1)
                                  }
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </React.Fragment>
                        </Grid>
                      </MuiPickersUtilsProvider>
                      {event.dates.length - 1 != counter ? (
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                      ) : null}
                    </React.Fragment>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">{TEXT_COVER_PICTURES}</Typography>
            <Typography color="textSecondary" gutterBottom>
              {TEXT_ADD_LOGO_OR_CAMP_PICTURE_HERE}{" "}
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <div
                  className={`${classes.cardMedia} ${classes.backgroundGrey}`}
                  style={{
                    backgroundImage: `url('${
                      event.pictureSrc
                        ? event.pictureSrc
                        : previewPictureUrl
                        ? previewPictureUrl
                        : CARD_PLACEHOLDER_PICTURE()
                    }')`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    borderRadius: "4px",
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <input
                  accept="image/*"
                  className={classes.inputFileUpload}
                  id="icon-button-file"
                  type="file"
                  onChange={onImageUpload}
                />
                <label htmlFor="icon-button-file">
                  <Button
                    color="primary"
                    startIcon={<AddIcon />}
                    onChange={onImageUpload}
                    fullWidth
                    component="span"
                  >
                    {TEXT_ADD_IMAGE}
                  </Button>
                </label>
              </Grid>
              <Grid item xs={6}>
                {(previewPictureUrl || event.pictureSrc) && (
                  <Button
                    color="primary"
                    startIcon={<DeleteIcon />}
                    onClick={onImageDelete}
                    fullWidth
                  >
                    {TEXT_DELETE_IMAGE}
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ========================== Kochmannschaft =========================
// =================================================================== */
const useStylesCookingTeam = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 345,
    },
    media: {
      height: 0,
      paddingTop: "56.25%", // 16:9
    },
    expand: {
      transform: "rotate(0deg)",
      marginLeft: "auto",
      transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: "rotate(180deg)",
    },
  })
);
interface EventCookingTeamCardProps {
  event: Event;
  formValidation: FormValidationFieldError[];
  authUser: AuthUser;
  onAddCook: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDeleteCook: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const EventCookingTeamCard = ({
  event,
  formValidation,
  authUser,
  onAddCook,
  onDeleteCook,
}: EventCookingTeamCardProps) => {
  const classesCookingTeam = useStylesCookingTeam();
  const [expanded, setExpanded] = React.useState(false);
  const classes = useStyles();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card>
      <CardHeader
        title={TEXT_KITCHENCREW}
        subheader={TEXT_COOKING_IS_COMMUNITY_SPORT}
        action={
          <IconButton
            className={clsx(classesCookingTeam.expand, {
              [classesCookingTeam.expandOpen]: expanded,
            })}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="zeig mehr"
          >
            <ExpandMoreIcon />
          </IconButton>
        }
      />
      {FormValidatorUtil.isFieldErroneous(formValidation, "cooks") && (
        <CardContent>
          <Alert severity="error">
            {FormValidatorUtil.getHelperText(formValidation, "cooks", "")}
          </Alert>
        </CardContent>
      )}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <List key={"cookList"}>
            {event.cooks.map((cook, counter) => (
              <React.Fragment key={"cook_" + cook.uid}>
                {counter > 0 && <Divider component="li" />}
                <ListItem
                  alignItems="flex-start"
                  key={"cookListItem_" + cook.uid}
                  id={"cookListItem_" + cook.uid}
                >
                  <ListItemAvatar>
                    {cook.pictureSrc.smallSize ? (
                      <Avatar
                        alt={cook.displayName}
                        src={String(cook.pictureSrc.smallSize)}
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
                        id={"deleteCook_" + cook.uid}
                        color="primary"
                        onClick={onDeleteCook}
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
            <Button
              size="small"
              color="primary"
              onClick={onAddCook}
              startIcon={<AddIcon />}
            >
              {TEXT_ADD_COOK_TO_EVENT}
            </Button>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default EventInfoPage;
