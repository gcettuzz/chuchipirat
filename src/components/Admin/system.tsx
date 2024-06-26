import React from "react";
import {useHistory} from "react-router";
import {compose} from "react-recompose";

import {
  Container,
  Grid,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  CardActionArea,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";

import {
  Forward as ForwardIcon,
  ZoomOutMap as ZoomOutMapIcon,
  CallMerge as CallMergeIcon,
  Tune as TuneIcon,
  Timelapse as TimelapseIcon,
  ViewList as ViewListIcon,
  Event as EventIcon,
  Fastfood as FastfoodIcon,
  FindInPage as FindInPageIcon,
  Cached as CachedIcon,
  HeadsetMic as HeadsetMicIcon,
  Mail as MailIcon,
  Send as SendIcon,
  Cloud as CloudIcon,
  RssFeed as RssFeedIcon,
  Build as BuildIcon,
  Feedback as FeedbackIcon,
} from "@material-ui/icons";

import {
  ADMIN as TEXT_ADMIN,
  WELCOME_ON_THE_BRIDGE_CAPTAIN as TEXT_WELCOME_ON_THE_BRIDGE_CAPTAIN,
  GLOBAL_SETTINGS as TEXT_GLOBAL_SETTINGS,
  WHERE_USED as TEXT_WHERE_USED,
  WHERE_USED_DESCRIPTION as TEXT_WHERE_USED_DESCRIPTION,
  MERGE_ITEMS as TEXT_MERGE_ITEMS,
  MERGE_ITEMS_DESCRIPTION as TEXT_MERGE_ITEMS_DESCRIPTION,
  CONVERT_ITEM as TEXT_CONVERT_ITEM,
  CONVERT_PRODUCT_ITEM_DESCRIPTION as TEXT_CONVERT_PRODUCT_ITEM_DESCRIPTION,
  JOBS as TEXT_JOBS,
  JOBS_DESCRIPTION as TEXT_JOBS_DESCRIPTION,
  DB_INDICES as TEXT_DB_INDICES,
  DB_INDICES_DESCRIPTION as TEXT_DB_INDICES_DESCRIPTION,
  OVERVIEW_DIFFERENT_ELEMENTS as TEXT_OVERVIEW_DIFFERENT_ELEMENTS,
  RECIPES as TEXT_RECIPES,
  EVENTS as TEXT_EVENTS,
  ACTIVATE_SUPPORT_USER as TEXT_ACTIVATE_SUPPORT_USER,
  ACTIVATE_SUPPORT_USER_DESCRIPTION as TEXT_ACTIVATE_SUPPORT_USER_DESCRIPTION,
  MAIL_CONSOLE as TEXT_MAIL_CONSOLE,
  MAIL_CONSOLE_DESCRIPTION as TEXT_MAIL_CONSOLE_DESCRIPTION,
  MAILBOX as TEXT_MAILBOX,
  CLOUD_FX as TEXT_CLOUD_FX,
  FEEDS as TEXT_FEEDS,
  SYSTEM_MESSAGE as TEXT_SYSTEM_MESSAGE,
} from "../../constants/text";
import Role from "../../constants/roles";
import {
  SYSTEM_GLOBAL_SETTINGS as ROUTE_SYSTEM_GLOBAL_SETTINGS,
  SYSTEM_WHERE_USED as ROUTE_SYSTEM_WHERE_USED,
  TEMP as ROUTE_TEMP,
  SYSTEM_MERGE_ITEM as ROUTE_SYSTEM_MERGE_PRODUCT,
  SYSTEM_CONVERT_ITEM as ROUTE_SYSTEM_CONVERT_ITEM,
  SYSTEM_JOBS as ROUTES_SYSTEM_JOBS,
  SYSTEM_DB_INDICES as ROUTE_SYSTEM_DB_INDICES,
  SYSTEM_OVERVIEW_RECIPES as ROUTE_SYSTEM_OVERVIEW_RECIPES,
  SYSTEM_OVERVIEW_EVENTS as ROUTE_SYSTEM_OVERVIEW_EVENTS,
  SYSTEM_ACTIVATE_SUPPORT_USER as ROUTE_SYSTEM_ACTIVATE_SUPPORT_USER,
  SYSTEM_MAIL_CONSOLE as ROUTE_SYSTEM_MAIL_CONSOLE,
  SYSTEM_OVERVIEW_MAILBOX as ROUTE_SYSTEM_OVERVIEW_MAILBOX,
  SYSTEM_OVERVIEW_CLOUDFX as ROUTE_SYSTEM_OVERVIEW_CLOUDFX,
  SYSTEM_OVERVIEW_FEEDS as ROUTE_OVERVIEW_FEEDS,
  SYSTEM_SYSTEM_MESSAGE as ROUTE_SYSTEM_SYSTEM_MESSAGE,
} from "../../constants/routes";

import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../Shared/global.interface";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const SystemPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <SystemBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const SystemBase: React.FC<CustomRouterProps & {authUser: AuthUser | null}> = ({
  authUser,
}) => {
  const classes = useStyles();
  const {push} = useHistory();

  if (!authUser) {
    return null;
  }

  /* ------------------------------------------
  // Ziel ansteuern
  // ------------------------------------------ */
  const goToDestination = (routeDestination: string) => {
    push({
      pathname: routeDestination,
    });
  };

  return (
    <>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT_ADMIN}
        subTitle={TEXT_WELCOME_ON_THE_BRIDGE_CAPTAIN}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
        <Grid container spacing={2}>
          {authUser.roles.includes(Role.admin) && (
            <Grid item xs={12} md={6}>
              <SettingsTile goToDestination={goToDestination} />
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <OverviewTile
              id={"overview"}
              onShowRecipes={goToDestination}
              onShowEvents={goToDestination}
              onShowMailbox={goToDestination}
              onShowCloudFx={goToDestination}
              onShowFeeds={goToDestination}
              icon={<ViewListIcon />}
              authUser={authUser}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <AdminTile
              id={"support"}
              text={TEXT_ACTIVATE_SUPPORT_USER}
              description={TEXT_ACTIVATE_SUPPORT_USER_DESCRIPTION}
              icon={<HeadsetMicIcon />}
              action={goToDestination}
              routeDestination={ROUTE_SYSTEM_ACTIVATE_SUPPORT_USER}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <AdminTile
              id={"whereUsed"}
              text={TEXT_WHERE_USED}
              description={TEXT_WHERE_USED_DESCRIPTION}
              icon={<ZoomOutMapIcon />}
              action={goToDestination}
              routeDestination={ROUTE_SYSTEM_WHERE_USED}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AdminTile
              id={"merge"}
              text={TEXT_MERGE_ITEMS}
              description={TEXT_MERGE_ITEMS_DESCRIPTION}
              icon={<CallMergeIcon />}
              action={goToDestination}
              routeDestination={ROUTE_SYSTEM_MERGE_PRODUCT}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AdminTile
              id={"convert"}
              text={TEXT_CONVERT_ITEM}
              description={TEXT_CONVERT_PRODUCT_ITEM_DESCRIPTION}
              icon={<CachedIcon />}
              action={goToDestination}
              routeDestination={ROUTE_SYSTEM_CONVERT_ITEM}
            />
          </Grid>
          {authUser.roles.includes(Role.admin) && (
            <React.Fragment>
              <Grid item xs={12} md={6} lg={4}>
                <AdminTile
                  id={"jobs"}
                  text={TEXT_JOBS}
                  description={TEXT_JOBS_DESCRIPTION}
                  icon={<TimelapseIcon />}
                  action={goToDestination}
                  routeDestination={ROUTES_SYSTEM_JOBS}
                />
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <AdminTile
                  id={"dbIndices"}
                  text={TEXT_DB_INDICES}
                  description={TEXT_DB_INDICES_DESCRIPTION}
                  icon={<FindInPageIcon />}
                  action={goToDestination}
                  routeDestination={ROUTE_SYSTEM_DB_INDICES}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <AdminTile
                  id={"mailConsole"}
                  text={TEXT_MAIL_CONSOLE}
                  description={TEXT_MAIL_CONSOLE_DESCRIPTION}
                  icon={<MailIcon />}
                  action={goToDestination}
                  routeDestination={ROUTE_SYSTEM_MAIL_CONSOLE}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <AdminTile
                  id={"temp"}
                  text={"Temp"}
                  description={""}
                  icon={<CallMergeIcon />}
                  action={goToDestination}
                  routeDestination={ROUTE_TEMP}
                />
              </Grid>
            </React.Fragment>
          )}{" "}
        </Grid>
      </Container>
    </>
  );
};
/* ===================================================================
// ============================ Admin Tile  ==========================
// =================================================================== */
interface AdminTileProps {
  id: string;
  text: string;
  description: string;
  icon: JSX.Element;
  action: (routeDestination: string) => void;
  routeDestination: string;
}
const AdminTile = ({
  id,
  text,
  description,
  icon,
  action,
  routeDestination,
}: AdminTileProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"card_" + id}>
      <CardActionArea onClick={() => action(routeDestination)}>
        <CardHeader
          title={text}
          action={
            <IconButton aria-label={"admin Card " + text}>
              {icon ? icon : <ForwardIcon />}
            </IconButton>
          }
        />
        <CardContent>
          <Typography>{description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
/* ===================================================================
// ======================= Einstellungen Kachel ======================
// =================================================================== */
interface SettingsTileProps {
  goToDestination: (route: string) => void;
}
const SettingsTile = ({goToDestination}: SettingsTileProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"card_settings"}>
      <CardHeader
        title={TEXT_GLOBAL_SETTINGS}
        action={
          <IconButton aria-label={"settings Card "}>
            <BuildIcon />
          </IconButton>
        }
      />
      <CardContent>
        <List component="nav" aria-label="Mögliche Einstullen">
          <ListItem button>
            <ListItemIcon>
              <TuneIcon />
            </ListItemIcon>
            <ListItemText
              primary={TEXT_GLOBAL_SETTINGS}
              onClick={() => goToDestination(ROUTE_SYSTEM_GLOBAL_SETTINGS)}
            />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <FeedbackIcon />
            </ListItemIcon>
            <ListItemText
              primary={TEXT_SYSTEM_MESSAGE}
              onClick={() => goToDestination(ROUTE_SYSTEM_SYSTEM_MESSAGE)}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ====================== Überblick Kachel Tile  =====================
// =================================================================== */
interface OverviewTileProps {
  id: string;
  onShowRecipes: (routeDestination: string) => void;
  onShowEvents: (routeDestination: string) => void;
  onShowMailbox: (routeDestination: string) => void;
  onShowCloudFx: (routeDestination: string) => void;
  onShowFeeds: (routeDestination: string) => void;
  icon: JSX.Element;
  authUser: AuthUser;
}
const OverviewTile = ({
  id,
  onShowRecipes,
  onShowEvents,
  onShowMailbox,
  onShowCloudFx,
  onShowFeeds,
  icon,
  authUser,
}: OverviewTileProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"card_" + id}>
      <CardHeader
        title={TEXT_OVERVIEW_DIFFERENT_ELEMENTS}
        action={
          <IconButton aria-label={"admin Card "}>
            {icon ? icon : <ForwardIcon />}
          </IconButton>
        }
      />
      <CardContent>
        <List component="nav" aria-label="Mögliche Übersichtslisten">
          <ListItem button>
            <ListItemIcon>
              <FastfoodIcon />
            </ListItemIcon>
            <ListItemText
              primary={TEXT_RECIPES}
              onClick={() => onShowRecipes(ROUTE_SYSTEM_OVERVIEW_RECIPES)}
            />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText
              primary={TEXT_EVENTS}
              onClick={() => onShowEvents(ROUTE_SYSTEM_OVERVIEW_EVENTS)}
            />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <RssFeedIcon />
            </ListItemIcon>
            <ListItemText
              primary={TEXT_FEEDS}
              onClick={() => onShowFeeds(ROUTE_OVERVIEW_FEEDS)}
            />
          </ListItem>
          {authUser.roles.includes(Role.admin) && (
            <React.Fragment>
              <ListItem button>
                <ListItemIcon>
                  <SendIcon />
                </ListItemIcon>
                <ListItemText
                  primary={TEXT_MAILBOX}
                  onClick={() => onShowMailbox(ROUTE_SYSTEM_OVERVIEW_MAILBOX)}
                />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <CloudIcon />
                </ListItemIcon>
                <ListItemText
                  primary={TEXT_CLOUD_FX}
                  onClick={() => onShowCloudFx(ROUTE_SYSTEM_OVERVIEW_CLOUDFX)}
                />
              </ListItem>
            </React.Fragment>
          )}
        </List>
      </CardContent>
    </Card>
  );
};
const condition = (authUser) =>
  !!authUser &&
  (!!authUser.roles?.includes(Role.admin) ||
    !!authUser.roles?.includes(Role.communityLeader));

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(SystemPage);
