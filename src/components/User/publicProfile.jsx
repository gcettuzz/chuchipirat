import React from "react";
import { compose } from "recompose";
import { useHistory } from "react-router";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";

import TodayIcon from "@material-ui/icons/Today";
import LocalActivityIcon from "@material-ui/icons/LocalActivity";
import HowToRegIcon from "@material-ui/icons/HowToReg";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import FastfoodIcon from "@material-ui/icons/Fastfood";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";

import useStyles from "../../constants/styles";

import User from "../User/user.class";
import Utils from "../Shared/utils.class";
import * as TEXT from "../../constants/text";
import * as ACTIONS from "../../constants/actions";
import * as ROUTES from "../../constants/routes";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import { Typography } from "@material-ui/core";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */

const INITIAL_STATE = {
  displayName: "",
  pictureSrc: "",
};

/* ===================================================================
// ======================== Public Profile Page ======================
// =================================================================== */
const PublicProfilePage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <PublicProfileBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// ======================== Public Profile Base ======================
// =================================================================== */
const PublicProfileBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();
  let urlUid;

  const [publicProfile, setPublicProfile] = React.useState(INITIAL_STATE);
  const [isLoading, setIsLoading] = React.useState(true);
  const { push } = useHistory();

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
      setPublicProfile({
        ...publicProfile,
        displayName: props.location.state.displayName,
        pictureSrc: props.location.state.pictureSrc,
      });
    }

    User.getPublicProfile({ firebase: firebase, uid: urlUid }).then(
      (result) => {
        setPublicProfile(result);
        setIsLoading(false);
      }
    );
  }, []);
  /* ------------------------------------------
  // Zu eigenem Profil wechseln
  // ------------------------------------------ */
  const onEditClick = () => {
    push({
      action: ACTIONS.VIEW,
      pathname: `${ROUTES.USER_PROFILE}/${authUser.uid}`,
      state: {},
    });
  };
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT.PAGE_TITLE_PUBLIC_PROFILE(publicProfile.displayName)}
      />
      {true ? (
        // Nur Anzeigen wenn die Person das eigene Profil anschaut
        <ButtonRow
          key="buttons_view"
          buttons={[
            {
              id: "edit",
              hero: true,
              label: TEXT.BUTTON_EDIT,
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
        <Backdrop className={classes.backdrop} open={isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          <Grid item key={"pictureCard"} xs={12}>
            <Card className={classes.card}>
              <div style={{ position: "relative" }}>
                {/* {publicProfile.pictureSrc ? ( */}
                <React.Fragment>
                  <CardMedia
                    className={classes.cardMedia}
                    image={
                      publicProfile.pictureSrcFullSize
                        ? publicProfile.pictureSrcFullSize
                        : IMAGE_REPOSITORY.getEnviromentRelatedPicture()
                            .CARD_PLACEHOLDER_MEDIA
                    }
                    title={publicProfile.displayName}
                  />
                  <div className={classes.userProfileCardNameOnImageBackground}>
                    <Grid
                      container
                      direction="row"
                      alignItems="center"
                      justify="center"
                    >
                      <Grid container>
                        <Typography
                          className={classes.userProfileCardNameOnImage}
                          variant="h2"
                        >
                          {publicProfile.displayName}
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
                <br></br>
                {/* {!publicProfile.pictureSrc ? (
                  <Typography gutterBottom={true} variant="h5" component="h2">
                    {publicProfile.displayName}
                  </Typography>
                ) : null} */}
                <PublicProfileList userProfile={publicProfile} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item key={"achievedRewardsCard"} xs={12}>
            <Card>
              <CardContent className={classes.cardContent}>
                <Typography gutterBottom={true} variant="h5" component="h2">
                  {TEXT.FOUND_TREASURES}
                </Typography>
                <AchievedRewardsList userProfile={publicProfile} />
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
export const PublicProfileList = ({ userProfile }) => {
  const classes = useStyles();
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
          label={TEXT.FIELD_ON_BOARD_SINCE}
          icon={<HowToRegIcon fontSize="small" />}
        />
        <FormListItem
          id={"motto"}
          key={"motto"}
          value={userProfile.motto}
          label={TEXT.FIELD_MOTTO}
          icon={<LocalActivityIcon fontSize="small" />}
        />
      </List>
    </React.Fragment>
  );
};
/* ===================================================================
// ========================== Gefunden Schätze =======================
// =================================================================== */
export const AchievedRewardsList = ({ userProfile }) => {
  return (
    <List>
      <FormListItem
        id={"noRecipes"}
        key={"noRecipes"}
        value={userProfile.noRecipes}
        label={TEXT.RECIPES_CREATED}
        icon={<FastfoodIcon fontSize="small" />}
      />

      <FormListItem
        id={"noEvents"}
        key={"noEvents"}
        value={userProfile.noEvents}
        label={TEXT.EVENTS_PARTICIPATED}
        icon={<TodayIcon fontSize="small" />}
      />

      <FormListItem
        id={"noComments"}
        key={"noComments"}
        value={userProfile.noComments}
        label={TEXT.COMMENTS_LEFT}
        icon={<ChatBubbleIcon fontSize="small" />}
      />
    </List>
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

const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(PublicProfilePage);
