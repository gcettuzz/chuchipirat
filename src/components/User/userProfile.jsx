import React from "react";
import { compose } from "recompose";

import { useHistory } from "react-router";

import CssBaseline from "@material-ui/core/CssBaseline";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";

import Typography from "@material-ui/core/Typography";
import Fab from "@material-ui/core/Fab";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import LinearProgress from "@material-ui/core/LinearProgress";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";

import LocalActivityIcon from "@material-ui/icons/LocalActivity";
import HowToRegIcon from "@material-ui/icons/HowToReg";
import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import DeleteIcon from "@material-ui/icons/Delete";

import * as ROUTES from "../../constants/routes";
import * as ACTIONS from "../../constants/action";
import * as TEXT from "../../constants/text";
import * as DEFAULT_VALUES from "../../constants/defaultValues";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";
import * as FIREBASEMESSSAGES from "../../constants/firebaseMessages";

import useStyles from "../../constants/styles";

import User from "./user.class";
import Utils from "../Shared/utils.class";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import { AchievedRewardsList } from "./publicProfile";
import CustomSnackbar from "../Shared/customSnackbar";

import SearchInputWithButton from "../Shared/searchInputWithButton";
import AlertMessage from "../Shared/AlertMessage";

import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import { Delete } from "@material-ui/icons";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const REDUCER_ACTIONS = {
  USER_PROFILE_FETCH_INIT: "USER_FETCH_INIT",
  USER_PROFILE_FETCH_SUCCESS: "USER_PROFILE_FETCH_SUCCESS",
  USER_PROFILE_ON_CHANGE: "USER_PROFILE_ON_CHANGE",
  USER_PROFILE_ON_SAVE: "USER_PROFILE_ON_SAVE",
  PICTURE_UPLOAD_INIT: "PICTURE_UPLOAD_INIT",
  PICTURE_UPLOAD_SUCCESS: "PICTURE_UPLOAD_SUCCESS",
  PICTURE_DELETE: "PICTURE_DELETE",
  CLOSE_SNACKBAR: "CLOSE_SNACKBAR",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const userProfileReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.USER_PROFILE_FETCH_INIT:
      // Ladeanezeige
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.USER_PROFILE_FETCH_SUCCESS:
      // Profil setzen
      return {
        ...state,
        data: action.payload,
        isLoading: false,
      };
    case REDUCER_ACTIONS.USER_PROFILE_ON_CHANGE:
      // Feldwert geändert
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
      };
    case REDUCER_ACTIONS.USER_PROFILE_ON_SAVE:
      // Daten gespeichern
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: TEXT.USER_PROFILE_SUCCESSFULLY_UPDATED,
          open: true,
        },
        isError: false,
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
        isLoadingPicture: false,
        snackbar: {
          open: true,
          severity: "success",
          message: TEXT.PROFILE_PICTURE_UPLOAD_SUCCESS,
        },
      };
    case REDUCER_ACTIONS.PICTURE_DELETE:
      // Bild gelöscht
      return {
        ...state,
        data: {
          ...state.data,
          pictureSrc: "",
          pictureSrcFullSize: "",
          isLoadingPicture: false,
          snackbar: {
            severity: "info",
            message: TEXT.PICTURE_HAS_BEEN_DELETED,
            open: true,
          },
        },
      };
    case REDUCER_ACTIONS.CLOSE_SNACKBAR:
      // Snackbar schliessen
      return {
        ...state,
        isError: false,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case REDUCER_ACTIONS.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isError: true,
        isLoading: false,
        isLoadingPicture: false,
        error: action.payload,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const UserProfilePage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <UserProfileBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const UserProfileBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const { push } = useHistory();
  let urlUid;

  const [userProfile, dispatchUserProfile] = React.useReducer(
    userProfileReducer,
    {
      data: null,
      isLoading: false,
      isLoadingPicture: false,
      isError: false,
      error: {},
      snackbar: { open: false, severity: "success", message: "" },
    }
  );

  const [editMode, setEditMode] = React.useState(false);

  if (!urlUid) {
    urlUid = props.match.params.id;
    if (!urlUid) {
      urlUid = authUser.uid;
    }
  }
  /* ------------------------------------------
  // Daten aus DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatchUserProfile({ type: REDUCER_ACTIONS.USER_PROFILE_FETCH_INIT });
    console.log(firebase, urlUid);
    User.getFullProfile({ firebase: firebase, uid: urlUid })
      .then((profile) => {
        dispatchUserProfile({
          type: REDUCER_ACTIONS.USER_PROFILE_FETCH_SUCCESS,
          payload: profile,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatchUserProfile({
          type: REDUCER_ACTIONS.GENERIC_ERROR,
          payload: error,
        });
      });
  }, []);
  /* ------------------------------------------
  // Änderungsmodus aktivieren
  // ------------------------------------------ */
  const onEditClick = () => {
    setEditMode(true);
  };
  /* ------------------------------------------
  // Werte speichern
  // ------------------------------------------ */
  const onSaveClick = () => {
    User.saveFullProfile({
      firebase: firebase,
      userProfile: userProfile.data,
    })
      .then(() => {
        dispatchUserProfile({ type: REDUCER_ACTIONS.USER_PROFILE_ON_SAVE });
      })
      .catch((error) => {
        dispatchUserProfile({
          type: REDUCER_ACTIONS.GENERIC_ERROR,
          payload: error,
        });
      });
  };
  /* ------------------------------------------
  // Feldwert ändern -- onChange
  // ------------------------------------------ */
  const onChangeField = (event) => {
    dispatchUserProfile({
      type: REDUCER_ACTIONS.USER_PROFILE_ON_CHANGE,
      field: event.target.name,
      value: event.target.value,
    });
  };
  /* ------------------------------------------
  // Passwort ändern
  // ------------------------------------------ */
  const onPasswordChangeClick = () => {
    push({
      pathname: ROUTES.PASSWORD_CHANGE,
    });
  };
  /* ------------------------------------------
  // Bild in Firebase Storage hochladen
  // ------------------------------------------ */
  const onPictureUpload = async (triggeredEvent) => {
    triggeredEvent.persist();
    var file = triggeredEvent.target.files[0];

    // Upload Start...
    dispatchUserProfile({
      type: REDUCER_ACTIONS.PICTURE_UPLOAD_INIT,
    });
    console.log(userProfile.data);
    console.log(file);
    await User.uploadPicture({
      firebase: firebase,
      file: file,
      userProfile: userProfile.data,
      authUser: authUser,
    })
      .then((downloadURL) => {
        dispatchUserProfile({
          type: REDUCER_ACTIONS.PICTURE_UPLOAD_SUCCESS,
          payload: downloadURL,
        });
      })
      .catch((error) => {
        dispatchUserProfile({
          type: REDUCER_ACTIONS.GENERIC_ERROR,
          payload: error,
        });
      });
  };
  /* ------------------------------------------
  // Bild löschen
  // ------------------------------------------ */
  const onPictureDelete = () => {
    if (window.confirm(TEXT.QUESTION_DELETE_IMAGE)) {
      User.deletePicture({
        uid: userProfile.data.uid,
        firebase: firebase,
        authUser: authUser,
      })
        .then(() => {
          dispatchUserProfile({
            type: REDUCER_ACTIONS.PICTURE_DELETE,
          });
        })
        .catch((error) => {
          dispatchUserProfile({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    }
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatchUserProfile({
      type: REDUCER_ACTIONS.CLOSE_SNACKBAR,
    });
  };
  /* ------------------------------------------
  // ================= AUSGABE ================
  // ------------------------------------------ */
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      {userProfile.error.code !==
        FIREBASEMESSSAGES.GENERAL.PERMISSION_DENIED && (
        <PageHeader
          authUser={authUser}
          editMode={editMode}
          onEditClick={onEditClick}
          onSaveClick={onSaveClick}
          onPasswordChangeClick={onPasswordChangeClick}
          isError={userProfile.error}
        />
      )}

      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={userProfile.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          {userProfile.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={userProfile.error}
                messageTitle={TEXT.ALERT_TITLE_WAIT_A_MINUTE}
              />
            </Grid>
          )}

          {userProfile.data?.uid && (
            <React.Fragment>
              <Grid item key={"profileCard"} xs={12}>
                <ProfileCard
                  userProfile={userProfile.data}
                  editMode={editMode}
                  isLoadingPicture={userProfile.isLoadingPicture}
                  onChange={onChangeField}
                  onUpload={onPictureUpload}
                  onDelete={onPictureDelete}
                />
              </Grid>
              <Grid item key={"publicProfileCard"} xs={12}>
                <PublicProfileCard
                  userProfile={userProfile.data}
                  editMode={editMode}
                  onChange={onChangeField}
                />
              </Grid>
              <Grid item key={"achievedRewardsCard"} xs={12}>
                <AchievedRewardsCard publicProfile={userProfile.data} />
              </Grid>
            </React.Fragment>
          )}
        </Grid>
      </Container>
      <CustomSnackbar
        message={userProfile.snackbar.message}
        severity={userProfile.snackbar.severity}
        snackbarOpen={userProfile.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ============================ Seiten Kopf ==========================
// =================================================================== */
const PageHeader = ({
  authUser,
  editMode,
  onEditClick,
  onSaveClick,
  onPasswordChangeClick,
}) => {
  return (
    <React.Fragment>
      <PageTitle
        title={TEXT.PAGE_USER_PROFILE_TITLE(authUser.publicProfile.displayName)}
        subTitle={TEXT.PAGE_USER_PROFILE_SUBTITLE}
      />
      <ButtonRow
        key="buttons_header"
        buttons={[
          {
            id: "edit",
            hero: true,
            visible: true,
            label: TEXT.BUTTON_EDIT,
            variant: "contained",
            color: "primary",
            onClick: onEditClick,
            visible: !editMode,
          },
          {
            id: "save",
            hero: true,
            visible: true,
            label: TEXT.BUTTON_SAVE,
            variant: "contained",
            color: "primary",
            onClick: onSaveClick,
            visible: editMode,
          },
          {
            id: "pw_change",
            hero: true,
            visible: true,
            label: TEXT.BUTTON_CHANGE_MAIL_PASSWORD,
            variant: "outlined",
            color: "primary",
            onClick: onPasswordChangeClick,
          },
        ]}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ============================ Person Card  =========================
// =================================================================== */
const ProfileCard = ({
  userProfile,
  isLoadingPicture,
  editMode,
  onChange,
  onUpload,
  onDelete,
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <div style={{ position: "relative" }}>
        <CardMedia
          className={classes.cardMedia}
          image={
            userProfile.pictureSrcFullSize
              ? userProfile.pictureSrcFullSize
              : IMAGE_REPOSITORY.getEnviromentRelatedPicture()
                  .CARD_PLACEHOLDER_MEDIA
          }
          title={
            userProfile.firstName && userProfile.lastName
              ? userProfile.firstName + " " + userProfile.lastName
              : userProfile.displayName
          }
        />
        <div className={classes.userProfileCardNameOnImageBackground}>
          {editMode && (
            <div>
              <input
                accept="image/*"
                className={classes.imageButtonInput}
                id="icon-button-file"
                type="file"
                onChange={onUpload}
              />
              <label htmlFor="icon-button-file">
                <Fab
                  component="span"
                  color="primary"
                  size="small"
                  className={classes.userProfileCardIconButton}
                >
                  <PhotoCamera />
                </Fab>
              </label>
              {userProfile.pictureSrcFullSize && (
                <Fab
                  component="span"
                  size="small"
                  className={classes.userProfileCardIconButtonDelete}
                  onClick={onDelete}
                >
                  <DeleteIcon />
                </Fab>
              )}
            </div>
          )}
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
            <Grid container>
              <Typography
                className={classes.userProfileCardNameOnImage}
                variant="h2"
              >
                {userProfile.firstName && userProfile.lastName
                  ? userProfile.firstName + " " + userProfile.lastName
                  : userProfile.displayName}
              </Typography>
            </Grid>
            <Grid container></Grid>
          </Grid>
          {/* </div> */}
        </div>
      </div>
      {isLoadingPicture && <LinearProgress />}
      <CardContent className={classes.cardContent}>
        <List>
          <FormListItem
            id={"firstName"}
            key={"firstName"}
            value={userProfile.firstName}
            label={TEXT.FIELD_FIRSTNAME}
            editMode={editMode}
            onChange={onChange}
          />
          <FormListItem
            id={"lastName"}
            key={"lastName"}
            value={userProfile.lastName}
            label={TEXT.FIELD_LASTNAME}
            editMode={editMode}
            onChange={onChange}
          />
          <FormListItem
            id={"email"}
            key={"email"}
            value={userProfile.email}
            label={TEXT.FIELD_EMAIL}
            disabled={true}
            editMode={editMode}
            onChange={onChange}
          />
          <FormListItem
            id={"lastLogin"}
            key={"lastLogin"}
            value={userProfile.lastLogin.toLocaleString("de-CH", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
            label={TEXT.FIELD_LAST_LOGIN}
            disabled={true}
          />
          <FormListItem
            id={"noLogins"}
            key={"noLogins"}
            value={userProfile.noLogins}
            label={TEXT.FIELD_NO_LOGINS}
            disabled={true}
          />
        </List>
      </CardContent>
    </Card>
  );
};

{
  /*  */
}
/* ===================================================================
// ======================== Public Profile Card  =====================
// =================================================================== */
const PublicProfileCard = ({ userProfile, editMode, onChange }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_INTRODUCE_YOURSELF}
        </Typography>
        <List>
          <FormListItem
            id={"displayName"}
            key={"displayName"}
            value={userProfile.displayName}
            label={TEXT.FIELD_DISPLAYNAME}
            icon={<AssignmentIndIcon fontSize="small" />}
            required={true}
            editMode={editMode}
            onChange={onChange}
          />
          <FormListItem
            id={"motto"}
            key={"motto"}
            value={userProfile.motto}
            label={TEXT.FIELD_MOTTO}
            icon={<LocalActivityIcon fontSize="small" />}
            editMode={editMode}
            onChange={onChange}
          />
          <FormListItem
            id={"memberSince"}
            key={"memberSince"}
            value={
              userProfile.memberSince instanceof Date
                ? userProfile.memberSince.toLocaleString("de-CH", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : ""
            }
            label={TEXT.FIELD_ON_BOARD_SINCE}
            icon={<HowToRegIcon fontSize="small" />}
          />
        </List>

        {/* <PublicProfileList
          userProfile={userProfile}
          editMode={editMode}
          onChangeField={onChangeField}
        /> */}
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ========================= Gefundene Schätze =======================
// =================================================================== */
const AchievedRewardsCard = ({ publicProfile }) => {
  const classes = useStyles();
  return (
    <Card>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.FOUND_TREASURES}
        </Typography>
        <AchievedRewardsList userProfile={publicProfile} />
      </CardContent>
    </Card>
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
  required = false,
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
            required={required}
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

// nur ich darf
const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(UserProfilePage);
