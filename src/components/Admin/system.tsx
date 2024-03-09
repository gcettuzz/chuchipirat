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
  Delete as DeleteIcon,
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
} from "@material-ui/icons";

import {
  ADMIN as TEXT_ADMIN,
  WELCOME_ON_THE_BRIDGE_CAPTAIN as TEXT_WELCOME_ON_THE_BRIDGE_CAPTAIN,
  GLOBAL_SETTINGS as TEXT_GLOBAL_SETTINGS,
  SYSTEM_GLOBAL_DESCRIPTION as TEXT_SYSTEM_GLOBAL_DESCRIPTION,
  DELETE_FEED as TEXT_DELETE_FEED,
  DELETE_FEED_DESCRIPTION as TEXT_DELETE_FEED_DESCRIPTION,
  WHERE_USED as TEXT_WHERE_USED,
  WHERE_USED_DESCRIPTION as TEXT_WHERE_USED_DESCRIPTION,
  MERGE_PRODUCTS as TEXT_MERGE_PRODUCTS,
  MERGE_PRODUCT_DESCRIPTION as TEXT_MERGE_PRODUCT_DESCRIPTION,
  CONVERT_PRODUCT_TO_MATERIAL as TEXT_CONVERT_PRODUCT_TO_MATERIAL,
  CONVERT_PRODUCT_TO_MATERIAL_DESCRIPTION as TEXT_CONVERT_PRODUCT_TO_MATERIAL_DESCRIPTION,
  JOBS as TEXT_JOBS,
  JOBS_DESCRIPTION as TEXT_JOBS_DESCRIPTION,
  DB_INDICES as TEXT_DB_INDICES,
  DB_INDICES_DESCRIPTION as TEXT_DB_INDICES_DESCRIPTION,
  OVERVIEW as TEXT_OVERVIEW,
  RECIPES as TEXT_RECIPES,
  EVENTS as TEXT_EVENTS,
  ACTIVATE_SUPPORT_USER as TEXT_ACTIVATE_SUPPORT_USER,
  ACTIVATE_SUPPORT_USER_DESCRIPTION as TEXT_ACTIVATE_SUPPORT_USER_DESCRIPTION,
} from "../../constants/text";
import Role from "../../constants/roles";
import {
  SYSTEM_GLOBAL_SETTINGS as ROUTE_SYSTEM_GLOBAL_SETTINGS,
  SYSTEM_FEED_DELETE as ROUTE_SYSTEM_FEED_DELETE,
  SYSTEM_WHERE_USED as ROUTE_SYSTEM_WHERE_USED,
  TEMP as ROUTE_TEMP,
  SYSTEM_MERGE_PRODUCT as ROUTE_SYSTEM_MERGE_PRODUCT,
  SYSTEM_CONVERT_PRODUCT_TO_MATERIAL as ROUTE_SYSTEM_CONVERT_PRODUCT_TO_MATERIAL,
  SYSTEM_JOBS as ROUTES_SYSTEM_JOBS,
  SYSTEM_DB_INDICES as ROUTE_SYSTEM_DB_INDICES,
  SYSTEM_OVERVIEW_RECIPES as ROUTE_SYSTEM_OVERVIEW_RECIPES,
  SYSTEM_OVERVIEW_EVENTS as ROUTE_SYSTEM_OVERVIEW_EVENTS,
  SYSTEM_ACTIVATE_SUPPORT_USER as ROUTE_SYSTEM_ACTIVATE_SUPPORT_USER,
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
  // Globale Einstelllungen
  // ------------------------------------------ */
  const goToGlobalSettings = () => {
    push({
      pathname: ROUTE_SYSTEM_GLOBAL_SETTINGS,
    });
  };

  /* ------------------------------------------
  // Feed löschen
  // ------------------------------------------ */
  const goToDeleteFeed = () => {
    push({
      pathname: ROUTE_SYSTEM_FEED_DELETE,
    });
  };
  // /* ------------------------------------------
  // Verfolgungsnachweis
  // ------------------------------------------ */
  const goToWhereUsed = () => {
    push({
      pathname: ROUTE_SYSTEM_WHERE_USED,
    });
  };
  /* ------------------------------------------
  // Produkte mergen
  // ------------------------------------------ */
  const goToMergeProducts = () => {
    push({
      pathname: ROUTE_SYSTEM_MERGE_PRODUCT,
    });
  };
  /* ------------------------------------------
  // Produkte umwandeln
  // ------------------------------------------ */
  const goToConvertProductToMaterial = () => {
    push({
      pathname: ROUTE_SYSTEM_CONVERT_PRODUCT_TO_MATERIAL,
    });
  };
  /* ------------------------------------------
  // Support-User aktivieren
  // ------------------------------------------ */
  const goToActivateSupportUser = () => {
    push({
      pathname: ROUTE_SYSTEM_ACTIVATE_SUPPORT_USER,
    });
  };

  const goToTemp = () => {
    push({
      pathname: ROUTE_TEMP,
    });
  };
  /* ------------------------------------------
  // Job ausführen 
  // ------------------------------------------ */
  const goToJobs = () => {
    push({
      pathname: ROUTES_SYSTEM_JOBS,
    });
  };
  const goToDbIndices = () => {
    push({
      pathname: ROUTE_SYSTEM_DB_INDICES,
    });
  };

  const onShowRecipes = () => {
    push({
      pathname: ROUTE_SYSTEM_OVERVIEW_RECIPES,
    });
  };
  const onShowEvents = () => {
    push({
      pathname: ROUTE_SYSTEM_OVERVIEW_EVENTS,
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
              <AdminTile
                id={"globalSettings"}
                text={TEXT_GLOBAL_SETTINGS}
                description={TEXT_SYSTEM_GLOBAL_DESCRIPTION}
                icon={<TuneIcon />}
                action={goToGlobalSettings}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <OverviewTile
              id={"overview"}
              onShowRecipes={onShowRecipes}
              onShowEvents={onShowEvents}
              icon={<ViewListIcon />}
            />
          </Grid>
          {authUser.roles.includes(Role.admin) && (
            <Grid item xs={12} md={6}>
              <AdminTile
                id={"deleteFeeds"}
                text={TEXT_DELETE_FEED}
                description={TEXT_DELETE_FEED_DESCRIPTION}
                icon={<DeleteIcon />}
                action={goToDeleteFeed}
              />
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <AdminTile
              id={"whereUsed"}
              text={TEXT_WHERE_USED}
              description={TEXT_WHERE_USED_DESCRIPTION}
              icon={<ZoomOutMapIcon />}
              action={goToWhereUsed}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AdminTile
              id={"merge"}
              text={TEXT_MERGE_PRODUCTS}
              description={TEXT_MERGE_PRODUCT_DESCRIPTION}
              icon={<CallMergeIcon />}
              action={goToMergeProducts}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AdminTile
              id={"convert"}
              text={TEXT_CONVERT_PRODUCT_TO_MATERIAL}
              description={TEXT_CONVERT_PRODUCT_TO_MATERIAL_DESCRIPTION}
              icon={<CachedIcon />}
              action={goToConvertProductToMaterial}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AdminTile
              id={"support"}
              text={TEXT_ACTIVATE_SUPPORT_USER}
              description={TEXT_ACTIVATE_SUPPORT_USER_DESCRIPTION}
              icon={<HeadsetMicIcon />}
              action={goToActivateSupportUser}
            />
          </Grid>
          {authUser.roles.includes(Role.admin) && (
            <Grid item xs={12} md={6} lg={4}>
              <AdminTile
                id={"jobs"}
                text={TEXT_JOBS}
                description={TEXT_JOBS_DESCRIPTION}
                icon={<TimelapseIcon />}
                action={goToJobs}
              />
            </Grid>
          )}
          {authUser.roles.includes(Role.admin) && (
            <Grid item xs={12} md={6} lg={4}>
              <AdminTile
                id={"dbIndices"}
                text={TEXT_DB_INDICES}
                description={TEXT_DB_INDICES_DESCRIPTION}
                icon={<FindInPageIcon />}
                action={goToDbIndices}
              />
            </Grid>
          )}
          {authUser.roles.includes(Role.admin) && (
            <Grid item xs={12} md={6} lg={4}>
              <AdminTile
                id={"temp"}
                text={"Temp"}
                description={""}
                icon={<CallMergeIcon />}
                action={goToTemp}
              />
            </Grid>
          )}
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
  action: () => void;
}
const AdminTile = ({id, text, description, icon, action}: AdminTileProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"card_" + id}>
      <CardActionArea onClick={action}>
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
// ====================== Überblick Kachel Tile  =====================
// =================================================================== */
interface OverviewTileProps {
  id: string;
  onShowRecipes: () => void;
  onShowEvents: () => void;
  icon: JSX.Element;
}
const OverviewTile = ({
  id,
  onShowRecipes,
  onShowEvents,
  icon,
}: OverviewTileProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"card_" + id}>
      <CardHeader
        title={TEXT_OVERVIEW}
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
            <ListItemText primary={TEXT_RECIPES} onClick={onShowRecipes} />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary={TEXT_EVENTS} onClick={onShowEvents} />
          </ListItem>
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
