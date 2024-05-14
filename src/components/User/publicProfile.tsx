import React from "react";
import {useHistory} from "react-router";
import {compose} from "react-recompose";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import List from "@material-ui/core/List";

import TodayIcon from "@material-ui/icons/Today";
import LocalActivityIcon from "@material-ui/icons/LocalActivity";
import HowToRegIcon from "@material-ui/icons/HowToReg";
import FastfoodIcon from "@material-ui/icons/Fastfood";
import BugReportIcon from "@material-ui/icons/BugReport";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";

import useStyles from "../../constants/styles";

import User from "./user.class";
import {
  INTRODUCING_NAME as TEXT_INTRODUCING_NAME,
  EDIT as TEXT_EDIT,
  FOUND_TREASURES as TEXT_FOUND_TREASURES,
  ON_BOARD_SINCE as TEXT_ON_BOARD_SINCE,
  MOTTO as TEXT_MOTTO,
  RECIPES_CREATED_PUBLIC as TEXT_RECIPES_CREATED_PUBLIC,
  RECIPES_CREATED_PRIVATE as TEXT_RECIPES_CREATED_PRIVATE,
  EVENTS_PARTICIPATED as TEXT_EVENTS_PARTICIPATED,
  FOUND_BUGS as TEXT_FOUND_BUGS,
} from "../../constants/text";
import Action from "../../constants/actions";
import * as ROUTES from "../../constants/routes";
import {ImageRepository} from "../../constants/imageRepository";

import {withFirebase} from "../Firebase/firebaseContext";
import {Typography} from "@material-ui/core";
import UserPublicProfile from "./user.public.profile.class";
import {FormListItem} from "../Shared/formListItem";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../Shared/global.interface";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  SET_IS_LOADING,
  FETCH_PUBLIC_PROFILE,
  FETCH_PUBLIC_PROFILE_SUCCESS,
  GENERIC_ERROR,
}
type State = {
  publicProfile: UserPublicProfile;
  isLoading: boolean;
  error: Error | null;
};

const inititialState: State = {
  publicProfile: new UserPublicProfile(),
  isLoading: false,
  error: null,
};
type DispatchAction = {
  type: ReducerActions;
  payload: any;
};
const publicProfileReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.FETCH_PUBLIC_PROFILE: {
      return {
        ...state,
        isLoading: true,
        publicProfile: {...state.publicProfile, ...action.payload},
      };
    }
    case ReducerActions.FETCH_PUBLIC_PROFILE_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        publicProfile: action.payload,
      };
    }
    case ReducerActions.SET_IS_LOADING:
      return {...state, isLoading: true};
    case ReducerActions.GENERIC_ERROR:
      return {...state, error: action.payload as Error};
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

interface MatchParams {
  id: string;
}
interface LocationState {
  displayName: string;
  pictureSrc: string;
}

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const PublicProfilePage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <PublicProfileBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const PublicProfileBase: React.FC<
  CustomRouterProps<MatchParams, LocationState> & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const {push} = useHistory();

  const [state, dispatch] = React.useReducer(
    publicProfileReducer,
    inititialState
  );

  let urlUid = "";

  if (!urlUid) {
    urlUid = props.match.params.id;
  }
  /* ------------------------------------------
  // Daten aus DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (
      props.location.state &&
      props.location.state.displayName &&
      props.location.state.pictureSrc
    ) {
      dispatch({
        type: ReducerActions.FETCH_PUBLIC_PROFILE,
        payload: {
          displayName: props.location.state.displayName,
          pictureSrc: props.location.state.pictureSrc,
        },
      });
    }

    User.getPublicProfile({firebase: firebase, uid: urlUid}).then((result) => {
      dispatch({
        type: ReducerActions.FETCH_PUBLIC_PROFILE_SUCCESS,
        payload: result,
      });
    });
  }, []);

  if (authUser === null) {
    return null;
  }

  /* ------------------------------------------
  // Zu eigenem Profil wechseln
  // ------------------------------------------ */
  const onEditClick = () => {
    push({
      pathname: `${ROUTES.USER_PROFILE}/${authUser!.uid}`,
      state: {action: Action.VIEW},
    });
  };
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT_INTRODUCING_NAME(state.publicProfile.displayName)}
      />
      {state.publicProfile.uid === authUser?.uid ? (
        // Nur Anzeigen wenn die Person das eigene Profil anschaut
        <ButtonRow
          key="buttons_view"
          buttons={[
            {
              id: "edit",
              hero: true,
              label: TEXT_EDIT,
              variant: "contained",
              color: "primary",
              visible: authUser.uid === urlUid,
              onClick: onEditClick,
            },
          ]}
        />
      ) : null}
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          <Grid item key={"pictureCard"} xs={12}>
            <Card className={classes.card}>
              <div style={{position: "relative"}}>
                {/* {publicProfile.pictureSrc ? ( */}
                <React.Fragment>
                  <CardMedia
                    className={classes.cardMedia}
                    image={
                      state.publicProfile.pictureSrc.normalSize
                        ? state.publicProfile.pictureSrc.normalSize
                        : ImageRepository.getEnviromentRelatedPicture()
                            .CARD_PLACEHOLDER_MEDIA
                    }
                    title={state.publicProfile.displayName}
                  />
                  <div className={classes.textOnCardMediaImage}>
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
                          {state.publicProfile.displayName}
                        </Typography>
                      </Grid>
                      <Grid container></Grid>
                    </Grid>
                    {/* </div> */}
                  </div>
                </React.Fragment>
                {/* ) : null} */}
              </div>
              <CardContent className={classes.cardContent}>
                {/* <br></br> */}
                <PublicProfileList userProfile={state.publicProfile} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item key={"achievedRewardsCard"} xs={12}>
            <Card>
              <CardContent className={classes.cardContent}>
                <Typography gutterBottom={true} variant="h5" component="h2">
                  {TEXT_FOUND_TREASURES}
                </Typography>
                <AchievedRewardsList userProfile={state.publicProfile} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// =================== Liste aller gefundenen Schätze ================
// =================================================================== */
interface PublicProfileListProps {
  userProfile: UserPublicProfile;
}
export const PublicProfileList = ({userProfile}: PublicProfileListProps) => {
  return (
    <React.Fragment>
      <List>
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
        <FormListItem
          id={"motto"}
          key={"motto"}
          value={userProfile.motto}
          label={TEXT_MOTTO}
          icon={<LocalActivityIcon fontSize="small" />}
        />
      </List>
    </React.Fragment>
  );
};
/* ===================================================================
// ========================== Gefunden Schätze =======================
// =================================================================== */
interface AchievedRewardsListProps {
  userProfile: UserPublicProfile;
}
export const AchievedRewardsList = ({
  userProfile,
}: AchievedRewardsListProps) => {
  return (
    <List>
      <FormListItem
        id={"noRecipesPrivate"}
        key={"noRecipesPrivate"}
        value={userProfile.stats.noRecipesPublic.toLocaleString("de-CH")}
        label={TEXT_RECIPES_CREATED_PUBLIC}
        icon={<FastfoodIcon fontSize="small" />}
      />
      <FormListItem
        id={"noRecipesPublic"}
        key={"noRecipesPublic"}
        value={userProfile.stats.noRecipesPrivate.toLocaleString("de-CH")}
        label={TEXT_RECIPES_CREATED_PRIVATE}
        icon={<FastfoodIcon fontSize="small" />}
      />

      <FormListItem
        id={"noEvents"}
        key={"noEvents"}
        value={userProfile.stats.noEvents.toLocaleString("de-CH")}
        label={TEXT_EVENTS_PARTICIPATED}
        icon={<TodayIcon fontSize="small" />}
      />
      {userProfile.stats?.noFoundBugs > 0 && (
        <FormListItem
          id={"noFoundBungs"}
          key={"noFoundBungs"}
          value={userProfile.stats.noFoundBugs.toLocaleString("de-CH")}
          label={TEXT_FOUND_BUGS}
          icon={<BugReportIcon fontSize="small" />}
        />
      )}
      {/* <FormListItem
        id={"noComments"}
        key={"noComments"}
        value={userProfile.noComments}
        label={TEXT.COMMENTS_LEFT}
        icon={<ChatBubbleIcon fontSize="small" />}
      /> */}
    </List>
  );
};

const condition = (authUser: AuthUser | null) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(PublicProfilePage);
