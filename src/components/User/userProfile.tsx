import React from "react";
import {compose} from "react-recompose";

import {useHistory} from "react-router";

import {
  Container,
  Grid,
  Backdrop,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Fab,
  LinearProgress,
  List,
} from "@material-ui/core";

import {
  LocalActivity as LocalActivityIcon,
  HowToReg as HowToRegIcon,
  AssignmentInd as AssignmentIndIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";

import {PASSWORD_CHANGE as ROUTE_PASSWORD_CHANGE} from "../../constants/routes";
import {
  USER_PROFILE_SUCCESSFULLY_UPDATED as TEXT_USER_PROFILE_SUCCESSFULLY_UPDATED,
  PICTURE_HAS_BEEN_DELETED as TEXT_PICTURE_HAS_BEEN_DELETED,
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  FOUND_TREASURES as TEXT_FOUND_TREASURES,
  HELLO_NAME as TEXT_HELLO_NAME,
  SHOW_US_WHO_YOU_ARE as TEXT_SHOW_US_WHO_YOU_ARE,
  EDIT as TEXT_EDIT,
  SAVE as TEXT_SAVE,
  CHANGE_MAIL_PASSWORD as TEXT_CHANGE_MAIL_PASSWORD,
  FIRSTNAME as TEXT_FIRSTNAME,
  LASTNAME as TEXT_LASTNAME,
  MOTTO as TEXT_MOTTO,
  EMAIL as TEXT_EMAIL,
  LAST_LOGIN as TEXT_LAST_LOGIN,
  NO_LOGINS as TEXT_NO_LOGINS,
  INTRODUCE_YOURSELF as TEXT_INTRODUCE_YOURSELF,
  DISPLAYNAME as TEXT_DISPLAYNAME,
  ON_BOARD_SINCE as TEXT_ON_BOARD_SINCE,
  CONFIRM_DELETE_PICTURE as TEXT_CONFIRM_DELETE_PICTURE,
  DELETE_PICTURE as TEXT_DELETE_PICTURE,
  DELETE as TEXT_DELETE,
} from "../../constants/text";
import {ImageRepository} from "../../constants/imageRepository";

import useStyles from "../../constants/styles";

import User, {UserFullProfile} from "./user.class";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import {AchievedRewardsList} from "./publicProfile";
import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";

import AlertMessage from "../Shared/AlertMessage";

import UserPublicProfile from "./user.public.profile.class";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {FormListItem} from "../Shared/formListItem";
import {DialogType, useCustomDialog} from "../Shared/customDialogContext";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";
import {CustomRouterProps} from "../Shared/global.interface";
import LocalStorageKey from "../../constants/localStorage";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  USER_PROFILE_FETCH_INIT,
  USER_PROFILE_FETCH_SUCCESS,
  USER_PROFILE_VALUE_CHANGE,
  USER_PROFILE_ON_SAVE,
  USER_PICTURE_SET,
  USER_PICTURE_DELETED,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}

type State = {
  userProfile: UserFullProfile;
  localPicture: File | null;
  isLoading: boolean;
  isLoadingPicture: boolean;
  error: Error | null;
  snackbar: Snackbar;
};

type DispatchAction = {
  type: ReducerActions;
  payload: any;
};

const inititialState: State = {
  userProfile: {...new User(), ...new UserPublicProfile()},
  localPicture: null,
  isLoading: false,
  isLoadingPicture: false,
  error: null,
  snackbar: {open: false, severity: "info", message: ""},
};

const userProfileReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.USER_PROFILE_FETCH_INIT:
      // Ladeanezeige
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          displayName: action.payload.displayname,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          motto: action.payload.publicProfile.motto,
          pictureSrc: action.payload.publicProfile.pictureSrc,
        },

        isLoading: true,
      };
    case ReducerActions.USER_PROFILE_FETCH_SUCCESS:
      // Profil setzen
      return {
        ...state,
        userProfile: action.payload,
        isLoading: false,
      };
    case ReducerActions.USER_PROFILE_VALUE_CHANGE:
      // Feldwert geändert
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          [action.payload.field]: action.payload.value,
        },
      };
    case ReducerActions.USER_PROFILE_ON_SAVE:
      // Daten gespeichern
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: TEXT_USER_PROFILE_SUCCESSFULLY_UPDATED,
          open: true,
        },
      };
    case ReducerActions.USER_PICTURE_SET:
      // Gewähltes Bild zwischenspeichern
      return {
        ...state,
        localPicture: action.payload,
      };
    case ReducerActions.USER_PICTURE_DELETED:
      return {
        ...state,
        localPicture: null,
        userProfile: {
          ...state.userProfile,
          pictureSrc: {smallSize: "", normalSize: "", fullSize: ""},
        },
        snackbar: {
          severity: "info",
          message: TEXT_PICTURE_HAS_BEEN_DELETED,
          open: true,
        },
      };
    // case ReducerActions.PICTURE_UPLOAD_INIT:
    //   // Bild wird hochgeladen
    //   return {
    //     ...state,
    //     isLoadingPicture: true,
    //   };
    // case ReducerActions.PICTURE_UPLOAD_SUCCESS:
    //   // Bild erfolgreich hochgeladen
    //   return {
    //     ...state,
    //     userProfile: {
    //       ...state.userProfile,
    //       pictureSrc: action.payload.pictureSrc,
    //     },
    //     isLoadingPicture: false,
    //     snackbar: {
    //       open: true,
    //       severity: "success",
    //       message: TEXT_PROFILE_PICTURE_UPLOAD_SUCCESS,
    //     },
    //   };
    // case ReducerActions.PICTURE_DELETE:
    //   // Bild gelöscht
    //   return {
    //     ...state,
    //     isLoadingPicture: false,
    //     userProfile: {
    //       ...state.userProfile,
    //       pictureSrc: {fullSize: "", normalSize: "", smallSize: ""},
    //     },
    //     snackbar: {
    //       severity: "info",
    //       message: TEXT_PICTURE_HAS_BEEN_DELETED,
    //       open: true,
    //     },
    //   };
    case ReducerActions.SNACKBAR_CLOSE:
      // Snackbar schliessen
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case ReducerActions.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
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
      {(authUser) => <UserProfileBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const UserProfileBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const {push} = useHistory();
  const {customDialog} = useCustomDialog();

  const [state, dispatch] = React.useReducer(
    userProfileReducer,
    inititialState
  );

  const [editMode, setEditMode] = React.useState(false);
  /* ------------------------------------------
  // Daten aus DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (!authUser) {
      return;
    }
    dispatch({type: ReducerActions.USER_PROFILE_FETCH_INIT, payload: authUser});
    User.getFullProfile({firebase: firebase, uid: authUser.uid})
      .then((result) => {
        dispatch({
          type: ReducerActions.USER_PROFILE_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({
          type: ReducerActions.GENERIC_ERROR,
          payload: error,
        });
      });
  }, []);
  /* ------------------------------------------
  // Änderungsmodus aktivieren
  // ------------------------------------------ */
  const onEditClick = () => {
    setEditMode(!editMode);
  };
  /* ------------------------------------------
  // Werte speichern
  // ------------------------------------------ */
  const onSaveClick = () => {
    // Prüfung ob auch alles in Ordung ist.
    try {
      User.checkUserProfileData(state.userProfile);
    } catch (error) {
      console.error(error);
      dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      return;
    }

    User.saveFullProfile({
      firebase: firebase,
      userProfile: state.userProfile,
      localPicture: state.localPicture,
      authUser: authUser!,
    })
      .then(() => {
        dispatch({type: ReducerActions.USER_PROFILE_ON_SAVE, payload: {}});

        // Den Auth-User zwingen das ganze neu zu lesen
        localStorage.removeItem(LocalStorageKey.AUTH_USER);
      })
      .catch((error) => {
        dispatch({
          type: ReducerActions.GENERIC_ERROR,
          payload: error,
        });
      });
  };
  /* ------------------------------------------
  // Feldwert ändern -- onChange
  // ------------------------------------------ */
  const onChangeField = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ReducerActions.USER_PROFILE_VALUE_CHANGE,
      payload: {field: event.target.name, value: event.target.value},
    });
  };
  /* ------------------------------------------
  // Passwort ändern
  // ------------------------------------------ */
  const onPasswordChangeClick = () => {
    push({
      pathname: ROUTE_PASSWORD_CHANGE,
    });
  };
  /* ------------------------------------------
  // Bild in Firebase Storage hochladen
  // ------------------------------------------ */
  const onPictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] || null;

    dispatch({type: ReducerActions.USER_PICTURE_SET, payload: selectedFile});
  };
  /* ------------------------------------------
  // Bild löschen
  // ------------------------------------------ */
  const onPictureDelete = async () => {
    const isConfirmed = await customDialog({
      dialogType: DialogType.Confirm,
      text: TEXT_CONFIRM_DELETE_PICTURE,
      title: TEXT_DELETE_PICTURE,
      buttonTextConfirm: TEXT_DELETE,
    });

    if (!isConfirmed) {
      return;
    }

    User.deletePicture({
      firebase: firebase,
      authUser: authUser!,
    })
      .then(() =>
        dispatch({type: ReducerActions.USER_PICTURE_DELETED, payload: {}})
      )
      .catch((error) => {
        dispatch({
          type: ReducerActions.GENERIC_ERROR,
          payload: error,
        });
      });
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = () => {
    dispatch({type: ReducerActions.SNACKBAR_CLOSE, payload: {}});
  };
  /* ------------------------------------------
  // ================= AUSGABE ================
  // ------------------------------------------ */
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      {authUser?.uid && (
        <PageHeader
          authUser={authUser}
          editMode={editMode}
          onEditClick={onEditClick}
          onSaveClick={onSaveClick}
          onPasswordChangeClick={onPasswordChangeClick}
        />
      )}

      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          {state.error && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={state.error}
                messageTitle={TEXT_ALERT_TITLE_WAIT_A_MINUTE}
              />
            </Grid>
          )}

          {state.userProfile?.uid && (
            <React.Fragment>
              <Grid item key={"profileCard"} xs={12}>
                <ProfileCard
                  userProfile={state.userProfile}
                  previewPictureUrl={
                    state.localPicture
                      ? URL.createObjectURL(state.localPicture)
                      : ""
                  }
                  editMode={editMode}
                  isLoadingPicture={state.isLoadingPicture}
                  onFieldChange={onChangeField}
                  onUpload={onPictureUpload}
                  onDelete={onPictureDelete}
                />
              </Grid>
              <Grid item key={"publicProfileCard"} xs={12}>
                <PublicProfileCard
                  userProfile={state.userProfile}
                  editMode={editMode}
                  onFieldChange={onChangeField}
                />
              </Grid>
              <Grid item key={"achievedRewardsCard"} xs={12}>
                <AchievedRewardsCard publicProfile={state.userProfile} />
              </Grid>
            </React.Fragment>
          )}
        </Grid>
      </Container>
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ============================ Seiten Kopf ==========================
// =================================================================== */
interface PageHeaderProps {
  authUser: AuthUser;
  editMode: boolean;
  onEditClick: () => void;
  onSaveClick: () => void;
  onPasswordChangeClick: () => void;
}
const PageHeader = ({
  authUser,
  editMode,
  onEditClick,
  onSaveClick,
  onPasswordChangeClick,
}: PageHeaderProps) => {
  return (
    <React.Fragment>
      <PageTitle
        title={TEXT_HELLO_NAME(authUser.publicProfile.displayName)}
        subTitle={TEXT_SHOW_US_WHO_YOU_ARE}
      />
      <ButtonRow
        key="buttons_header"
        buttons={[
          {
            id: "edit",
            hero: true,
            visible: true,
            label: TEXT_EDIT,
            variant: "contained",
            color: "primary",
            onClick: onEditClick,
          },
          {
            id: "save",
            hero: true,
            label: TEXT_SAVE,
            variant: "contained",
            color: "primary",
            onClick: onSaveClick,
            visible: editMode,
          },
          {
            id: "pw_change",
            hero: true,
            visible: true,
            label: TEXT_CHANGE_MAIL_PASSWORD,
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
interface ProfileCardProps {
  userProfile: UserFullProfile;
  previewPictureUrl: string | null;
  isLoadingPicture: boolean;
  editMode: boolean;
  onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
}
const ProfileCard = ({
  userProfile,
  previewPictureUrl,
  isLoadingPicture,
  editMode,
  onFieldChange,
  onUpload,
  onDelete,
}: ProfileCardProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <div style={{position: "relative"}}>
        <CardMedia
          className={classes.cardMedia}
          image={
            userProfile.pictureSrc.normalSize
              ? userProfile.pictureSrc.normalSize
              : previewPictureUrl
              ? previewPictureUrl
              : ImageRepository.getEnviromentRelatedPicture()
                  .CARD_PLACEHOLDER_MEDIA
          }
          title={
            userProfile.firstName && userProfile.lastName
              ? userProfile.firstName + " " + userProfile.lastName
              : userProfile.displayName
          }
        />
        <div className={classes.textOnCardMediaImage}>
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
                  <PhotoCameraIcon />
                </Fab>
              </label>
              {userProfile.pictureSrc.normalSize && (
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
            label={TEXT_FIRSTNAME}
            editMode={editMode}
            onChange={onFieldChange}
          />
          <FormListItem
            id={"lastName"}
            key={"lastName"}
            value={userProfile.lastName}
            label={TEXT_LASTNAME}
            editMode={editMode}
            onChange={onFieldChange}
          />
          <FormListItem
            id={"email"}
            key={"email"}
            value={userProfile.email}
            label={TEXT_EMAIL}
            disabled={true}
            editMode={editMode}
            onChange={onFieldChange}
          />
          <FormListItem
            id={"lastLogin"}
            key={"lastLogin"}
            value={userProfile.lastLogin.toLocaleString("de-CH", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
            label={TEXT_LAST_LOGIN}
            disabled={true}
          />
          <FormListItem
            id={"noLogins"}
            key={"noLogins"}
            value={userProfile.noLogins}
            label={TEXT_NO_LOGINS}
            disabled={true}
          />
        </List>
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ======================== Public Profile Card  =====================
// =================================================================== */
interface PublicProfileCard {
  userProfile: UserFullProfile;
  editMode: boolean;
  onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const PublicProfileCard = ({
  userProfile,
  editMode,
  onFieldChange,
}: PublicProfileCard) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_INTRODUCE_YOURSELF}
        </Typography>
        <List>
          <FormListItem
            id={"displayName"}
            key={"displayName"}
            value={userProfile.displayName}
            label={TEXT_DISPLAYNAME}
            icon={<AssignmentIndIcon fontSize="small" />}
            required={true}
            editMode={editMode}
            onChange={onFieldChange}
          />
          <FormListItem
            id={"motto"}
            key={"motto"}
            value={userProfile.motto}
            label={TEXT_MOTTO}
            icon={<LocalActivityIcon fontSize="small" />}
            editMode={editMode}
            onChange={onFieldChange}
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
            label={TEXT_ON_BOARD_SINCE}
            icon={<HowToRegIcon fontSize="small" />}
          />
        </List>
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ========================= Gefundene Schätze =======================
// =================================================================== */
interface AchievedRewardsCard {
  publicProfile: UserFullProfile;
}
const AchievedRewardsCard = ({publicProfile}: AchievedRewardsCard) => {
  const classes = useStyles();
  return (
    <Card>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_FOUND_TREASURES}
        </Typography>
        <AchievedRewardsList userProfile={publicProfile} />
      </CardContent>
    </Card>
  );
};

const condition = (authUser: AuthUser | null) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(UserProfilePage);
