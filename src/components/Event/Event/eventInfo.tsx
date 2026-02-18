import React from "react";
import {useTheme} from "@mui/material/styles";
import {pdf} from "@react-pdf/renderer";
import fileSaver from "file-saver";

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
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  useMediaQuery,
  Box,
  Stack,
} from "@mui/material";
import {Alert} from "@mui/lab";
import {Delete as DeleteIcon, Add as AddIcon} from "@mui/icons-material";

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
  KITCHENCREW as TEXT_KITCHENCREW,
  COOKING_IS_COMMUNITY_SPORT as TEXT_COOKING_IS_COMMUNITY_SPORT,
  ADD_COOK_TO_EVENT as TEXT_ADD_COOK_TO_EVENT,
  QUESTION_DELETE_IMAGE as TEXT_QUESTION_DELETE_IMAGE,
  DELETE as TEXT_DELETE,
  RECEIPT as TEXT_RECEIPT,
  CREATE_RECEIPT as TEXT_CREATE_RECEIPT,
  SUFFIX_PDF as TEXT_SUFFIX_PDF,
} from "../../../constants/text";

import useCustomStyles from "../../../constants/styles";

import {ImageRepository} from "../../../constants/imageRepository";

import Event, {EventRefDocuments} from "./event.class";
import User from "../../User/user.class";

import Firebase from "../../Firebase/firebase.class";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import Utils from "../../Shared/utils.class";
import DialogAddUser from "../../User/dialogAddUser";
import {
  FormValidationFieldError,
  FormValidatorUtil,
} from "../../Shared/fieldValidation.error.class";
import {DialogType, useCustomDialog} from "../../Shared/customDialogContext";
import {
  NavigationObject,
  NavigationValuesContext,
} from "../../Navigation/navigationContext";
import Action from "../../../constants/actions";
import Receipt from "./receipt.class";
import EventReceiptPdf from "./eventRecipePdf";
import {DatePicker} from "@mui/x-date-pickers";

/* ===================================================================
// ============================== Global =============================
// =================================================================== */

/* ===================================================================
// ============================ Event-Info ===========================
// =================================================================== */
interface EventInfoPageProps {
  event: Event;
  localPicture: File | null;
  firebase: Firebase;
  authUser: AuthUser;
  formValidation: FormValidationFieldError[];
  onUpdateEvent: (event: Event) => void;
  onUpdatePicture: (picture: File | null) => void;
  onError?: (error: Error) => void;
}
const EventInfoPage = ({
  event,
  localPicture,
  firebase,
  authUser,
  formValidation,
  onUpdateEvent,
  onUpdatePicture,
  onError,
}: EventInfoPageProps) => {
  const navigationValuesContext = React.useContext(NavigationValuesContext);

  // Hier damit der AuthUser übergeben werden kann
  const [dialogAddUserOpen, setDialogAddUserOpen] = React.useState(false);
  const {customDialog} = useCustomDialog();
  /* ------------------------------------------
  // Navigation-Handler
  // ------------------------------------------ */
  React.useEffect(() => {
    navigationValuesContext?.setNavigationValues({
      action: Action.NONE,
      object: NavigationObject.eventSettings,
    });
  }, []);

  /* ------------------------------------------
  // Field-Change
  // ------------------------------------------ */
  const onFieldUpdate = (actionEvent: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateEvent({
      ...event,
      [actionEvent.target.name]: actionEvent.target.value,
    } as unknown as Event);
  };
  const onDatePickerUpdate = (date: Date | null, field: string) => {
    const changedPos = field.split("_");
    let tempDates = [...event.dates];
    const eventDate = tempDates.find(
      (eventDate) => eventDate.uid == changedPos[1]
    );
    if (!eventDate) {
      return;
    }
    date = new Date(date!.setHours(0, 0, 0, 0));
    eventDate[changedPos[0]] = date;
    // Wenn das Von-Datum gesetzt wurde und das Bis noch initial ist,
    // dieses Datum auch gleich setzen, damit nicht soweit gescrollt werden muss
    if (changedPos[0] == "from" && eventDate.to.getFullYear() == 1970) {
      eventDate.to = new Date(date);
      eventDate.to.setHours(23, 59, 59, 0);
    } else if (changedPos[0] == "to") {
      eventDate.to.setHours(23, 59, 59, 0);
    }

    // Wenn das die letzte Zeile ist, automatisch eine neue einfügen
    if (eventDate.pos == event.dates.length) {
      const newDate = Event.createDateEntry();
      newDate.pos = eventDate.pos + 1;
      tempDates.push(newDate);
    }
    tempDates = Utils.renumberArray({array: tempDates, field: "pos"});

    onUpdateEvent({...event, dates: tempDates} as Event);
  };
  const onDateDeleteClick = (
    actionEvent: React.MouseEvent<HTMLButtonElement>
  ) => {
    let tempDates = event.dates.filter(
      (eventDate) => eventDate.uid != actionEvent.currentTarget.id.split("_")[1]
    );
    tempDates = Utils.renumberArray({array: tempDates, field: "pos"});

    onUpdateEvent({...event, dates: tempDates} as Event);
  };
  /* ------------------------------------------
  // Bild-Handling
  // ------------------------------------------ */
  const onImageDelete = async () => {
    if (!event.uid || (event.uid && !event.pictureSrc)) {
      // setLocalPicture(null);
      onUpdatePicture(null);
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
        event: event,
        authUser: authUser,
      }).then(() => {
        onUpdateEvent({...event, pictureSrc: ""} as Event);
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
            event: event,
          }).then((result) => {
            onUpdateEvent({...event, cooks: result} as Event);
          });
        }
      );
    }
    setDialogAddUserOpen(false);
  };
  const onDeleteCook = (actionEvent: React.MouseEvent<HTMLButtonElement>) => {
    const cookUidToDelete = actionEvent.currentTarget.id.split("_")[1];
    if (!cookUidToDelete) {
      return;
    }

    // auf der DB entfernen
    Event.removeCookFromEvent({
      firebase: firebase,
      authUser: authUser,
      cookUidToRemove: cookUidToDelete,
      event: event,
    })
      .then((result) => {
        onUpdateEvent({...event, cooks: result} as Event);
      })
      .catch((error) => {
        onError && onError(error);
      });
  };
  /* ------------------------------------------
  // Quittung
  // ------------------------------------------ */
  const onDownloadReceipt = async () => {
    await Receipt.getReceipt({firebase: firebase, eventUid: event.uid})
      .then((result) => {
        pdf(<EventReceiptPdf receiptData={result} authUser={authUser} />)
          .toBlob()
          .then((result) => {
            fileSaver.saveAs(
              result,
              event.name + TEXT_CREATE_RECEIPT + TEXT_SUFFIX_PDF
            );
          })
          .catch((error) => {
            console.error(error);
            if (onError) {
              onError(error);
            }
          });
      })
      .catch((error) => {
        console.error(error);
        if (onError) {
          onError(error);
        }
      });
  };

  return (
    <React.Fragment>
      <Stack spacing={2}>
        <EventBasicInfoCard
          event={event}
          formValidation={formValidation}
          onFieldUpdate={onFieldUpdate}
          onDatePickerUpdate={onDatePickerUpdate}
          onDateDeleteClick={onDateDeleteClick}
          onImageUpload={onUpdatePicture}
          onImageDelete={onImageDelete}
          previewPictureUrl={
            localPicture ? URL.createObjectURL(localPicture) : ""
          }
          onDownloadReceipt={onDownloadReceipt}
        />
        <EventCookingTeamCard
          event={event}
          formValidation={formValidation}
          authUser={authUser}
          onAddCook={onOpenDialogAddUserDialog}
          onDeleteCook={onDeleteCook}
        />
      </Stack>
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
  onImageUpload: (file: File | null) => void;
  onImageDelete: () => void;
  onDownloadReceipt: () => void;
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
  onDownloadReceipt,
  previewPictureUrl,
}: EventBasicInfoCardProps) => {
  const classes = useCustomStyles();
  const theme = useTheme();

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const handleFileChange = async (
    actionEvent: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = actionEvent.target.files?.[0] || null;
    onImageUpload(selectedFile);
  };

  const handleChooseImageClick = () => {
    // Öffne das Dateiauswahlfenster, wenn der Button geklickt wird
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card sx={classes.card}>
      <CardHeader
        title={TEXT_EVENT_INFO}
        subheader={TEXT_DEFINE_BASIC_EVENT_DATA}
        action={
          event.refDocuments?.includes(EventRefDocuments.receipt) ? (
            <Button
              color="primary"
              variant="outlined"
              style={{
                marginTop: theme.spacing(1),
                marginRight: theme.spacing(0.6),
              }}
              onClick={onDownloadReceipt}
            >
              {TEXT_RECEIPT}
            </Button>
          ) : null
        }
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
                      <Grid item xs={5}>
                        <DatePicker
                          key={"dateFrom_" + eventDate.uid}
                          label={TEXT_FROM}
                          inputFormat="dd.MM.yyyy"
                          value={
                            eventDate.from?.getTime() == new Date(0).getTime()
                              ? null
                              : eventDate.from
                          }
                          onChange={(date) =>
                            onDatePickerUpdate(date, "from_" + eventDate.uid)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              helperText={FormValidatorUtil.getHelperText(
                                formValidation,
                                "dateFrom_" + eventDate.uid,
                                ""
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={1} sx={classes.centerCenter}>
                        <Typography>-</Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <DatePicker
                          key={"dateTo_" + eventDate.uid}
                          label={TEXT_TO}
                          inputFormat="dd.MM.yyyy"
                          value={
                            eventDate.to?.getTime() == new Date(0).getTime()
                              ? null
                              : eventDate.to
                          }
                          onChange={(date) =>
                            onDatePickerUpdate(date, "to_" + eventDate.uid)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              helperText={FormValidatorUtil.getHelperText(
                                formValidation,
                                "dateTo_" + eventDate.uid,
                                ""
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={1} sx={classes.centerCenter}>
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
                                size="large"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </React.Fragment>
                      </Grid>
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
                <Box
                  component="div"
                  sx={[classes.cardMedia, classes.backgroundGrey]}
                  style={{
                    backgroundImage: `url('${
                      previewPictureUrl
                        ? previewPictureUrl
                        : event.pictureSrc
                        ? event.pictureSrc
                        : ImageRepository.getEnviromentRelatedPicture()
                            .CARD_PLACEHOLDER_MEDIA
                    }')`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    borderRadius: "4px",
                    mixBlendMode: prefersDarkMode ? "normal" : "multiply",
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <input
                  accept="image/*"
                  style={{display: "none"}}
                  id="icon-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="icon-button-file">
                  <Button
                    color="primary"
                    startIcon={<AddIcon />}
                    onChange={handleChooseImageClick}
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
// ============================ Koch-Team ============================
// =================================================================== */
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
  const classes = useCustomStyles();
  return (
    <Card>
      <CardHeader
        title={TEXT_KITCHENCREW}
        subheader={TEXT_COOKING_IS_COMMUNITY_SPORT}
      />
      {FormValidatorUtil.isFieldErroneous(formValidation, "cooks") && (
        <CardContent>
          <Alert severity="error">
            {FormValidatorUtil.getHelperText(formValidation, "cooks", "")}
          </Alert>
        </CardContent>
      )}
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
                      size="large"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                ) : null}
              </ListItem>
            </React.Fragment>
          ))}
        </List>
        <Box component="div" sx={classes.centerCenter}>
          <Button
            size="small"
            color="primary"
            onClick={onAddCook}
            startIcon={<AddIcon />}
          >
            {TEXT_ADD_COOK_TO_EVENT}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventInfoPage;
