import React, { useReducer } from "react";
import { compose } from "recompose";
import { useHistory } from "react-router";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import IconButton from "@material-ui/core/IconButton";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActionArea from "@material-ui/core/CardActionArea";

import List from "@material-ui/core/List";
import ListItem, { ListItemProps } from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import ForwardIcon from "@material-ui/icons/Forward";
import DeleteIcon from "@material-ui/icons/Delete";
import ZoomOutMapIcon from "@material-ui/icons/ZoomOutMap";
import CallMergeIcon from "@material-ui/icons/CallMerge";
import TuneIcon from "@material-ui/icons/Tune";
import Timelapse from "@material-ui/icons/Timelapse";
import ViewListIcon from "@material-ui/icons/ViewList";
import EventIcon from "@material-ui/icons/Event";
import FastfoodIcon from "@material-ui/icons/Fastfood";
import FindInPageIcon from "@material-ui/icons/FindInPage";

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";
import * as ROUTES from "../../constants/routes";

import useStyles from "../../constants/styles";

import AlertMessage from "../Shared/AlertMessage";
import PageTitle from "../Shared/pageTitle";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";

import { SvgIconComponent } from "@material-ui/icons";
import { Typography } from "@material-ui/core";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const SystemPage = (props) => {
  return (
    //@ts-ignore
    <AuthUserContext.Consumer>
      {(authUser) => <SystemBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const SystemBase = ({ props, authUser }) => {
  const classes = useStyles();
  const { push } = useHistory();

  /* ------------------------------------------
  // Globale Einstelllungen
  // ------------------------------------------ */
  const goToGlobalSettings = () => {
    push({
      pathname: ROUTES.SYSTEM_GLOBAL_SETTINGS,
    });
  };

  /* ------------------------------------------
  // Feed löschen
  // ------------------------------------------ */
  const goToDeleteFeed = () => {
    push({
      pathname: ROUTES.SYSTEM_FEED_DELETE,
    });
  };
  /* ------------------------------------------
  // Verfolgungsnachweis
  // ------------------------------------------ */
  const goToWhereUsed = () => {
    push({
      pathname: ROUTES.SYSTEM_WHERE_USED,
    });
  };
  /* ------------------------------------------
  // Produkte mergen
  // ------------------------------------------ */
  const goToMergeProducts = () => {
    push({
      pathname: ROUTES.SYSTEM_MERGE_PRODUCT,
    });
  };
  const goToTemp = () => {
    push({
      pathname: ROUTES.TEMP,
    });
  };
  /* ------------------------------------------
  // Job ausführen 
  // ------------------------------------------ */
  const goToJobs = () => {
    push({
      pathname: ROUTES.SYSTEM_JOBS,
    });
  };
  const goToDbIndices = () => {
    push({
      pathname: ROUTES.SYSTEM_DB_INDICES,
    });
  };

  const onShowRecipes = () => {
    push({
      pathname: ROUTES.SYSTEM_OVERVIEW_RECIPES,
    });
  };
  const onShowEvents = () => {
    push({
      pathname: ROUTES.SYSTEM_OVERVIEW_EVENTS,
    });
  };
  return (
    <>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT.PAGE_TITLE_ADMIN}
        subTitle={TEXT.PAGE_SUBTITLE_ADMIN}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <AdminTile
              id={"globalSettings"}
              text={TEXT.PANEL_SYSTEM_GLOBAL_SETTINGS}
              description={TEXT.PANEL_SYSTEM_GLOBAL_DESCRIPTION}
              icon={<TuneIcon />}
              action={goToGlobalSettings}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <OverviewTile
              id={"overview"}
              onShowRecipes={onShowRecipes}
              onShowEvents={onShowEvents}
              icon={<ViewListIcon />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <AdminTile
              id={"deleteFeeds"}
              text={TEXT.PANEL_SYSTEM_DELETE_FEED}
              description={TEXT.PANEL_SYSTEM_DELETE_FEED_DESCRIPTION}
              icon={<DeleteIcon />}
              action={goToDeleteFeed}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AdminTile
              id={"whereUsed"}
              text={TEXT.PANEL_SYSTEM_WHERE_USED}
              description={TEXT.PANEL_SYSTEM_WHERE_USED_DESCRIPTION}
              icon={<ZoomOutMapIcon />}
              action={goToWhereUsed}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AdminTile
              id={"merge"}
              text={TEXT.PANEL_SYTEM_MERGE}
              description={TEXT.PANEL_SYSTEM_MERGE_DESCRICPTION}
              icon={<CallMergeIcon />}
              action={goToMergeProducts}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AdminTile
              id={"jobs"}
              text={TEXT.PANEL_SYSTEM_JOBS}
              description={TEXT.PANEL_SYSTEM_JOBS_DESCRIPTION}
              icon={<Timelapse />}
              action={goToJobs}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AdminTile
              id={"dbIndices"}
              text={TEXT.DB_INDICES}
              description={TEXT.DB_INDICES_DESCRIPTION}
              icon={<FindInPageIcon />}
              action={goToDbIndices}
            />
          </Grid>

          {/* <Grid item xs={12} md={6} lg={4}>
            <AdminTile
              id={"merge"}
              text={"Temp"}
              // description={TEXT.PANEL_SYSTEM_MERGE_DESCRICPTION}
              // icon={<CallMergeIcon />}
              action={goToTemp}
            />
          </Grid> */}
        </Grid>
      </Container>
    </>
  );
};
/* ===================================================================
// ============================ Admin Tile  ==========================
// =================================================================== */
const AdminTile = ({ id, text, description, icon, action }) => {
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
  icon: object;
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
        title={TEXT.PANEL_OVERVIEW}
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
            <ListItemText primary={TEXT.RECIPES} onClick={onShowRecipes} />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText
              primary={TEXT.NAVIGATION_EVENTS}
              onClick={onShowEvents}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(SystemPage);
