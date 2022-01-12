import React from "react";
import { compose } from "recompose";
import { useHistory } from "react-router";

import CssBaseline from "@material-ui/core/CssBaseline";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";

import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";

import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";

import { Alert, AlertTitle } from "@material-ui/lab";
import Button from "@material-ui/core/Button";
import Skeleton from "@material-ui/lab/Skeleton";

import PageTitle from "../Shared/pageTitle";
import RecipeCard, { RecipeCardLoading } from "../Recipe/recipeCard";

import NewReleasesIcon from "@material-ui/icons/NewReleases";

import useStyles from "../../constants/styles";
import * as ROUTES from "../../constants/routes";
import * as ACTIONS from "../../constants/actions";
import * as TEXT from "../../constants/text";
import * as DEFAULT_VALUES from "../../constants/defaultValues";

import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";

import Stats, { STATS_CAPTIONS } from "../Shared/stats.class";
import Recipe from "../Recipe/recipe.class";
import Event, { EVENT_TYPES, EventType } from "../Event/event.class";
import Feed, { FEED_TYPE } from "../Shared/feed.class";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import reactDom from "react-dom";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */

const INITIAL_STATE_KPI = [
  {
    id: "noEvents",
    value: 0,
    caption: TEXT.HOME_STATS_CAPTIONS.EVENTS,
  },
  {
    id: "noIngredients",
    value: 0,
    caption: TEXT.HOME_STATS_CAPTIONS.INGREDIENTS,
  },
  {
    id: "noParticipants",
    value: 0,
    caption: TEXT.HOME_STATS_CAPTIONS.PARTICIPANTS,
  },
  {
    id: "noRecipes",
    value: 0,
    caption: TEXT.HOME_STATS_CAPTIONS.RECIPES,
  },
  {
    id: "noUsers",
    value: 0,
    caption: TEXT.HOME_STATS_CAPTIONS.USERS,
  },
  {
    id: "noShoppingLists",
    value: 0,
    caption: TEXT.HOME_STATS_CAPTIONS.SHOPPING_LISTS,
  },
];

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const HomePage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <HomeBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const HomeBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [isLoadingKpi, setIsLoadingKpi] = React.useState(true);
  const [isLoadingRecipe, setIsLoadingRecipe] = React.useState(true);
  const [isLoadingEvent, setIsLoadingEvent] = React.useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = React.useState(true);
  const [error, setError] = React.useState();

  const [kpi, setKpi] = React.useState(INITIAL_STATE_KPI);
  const [recipes, setRecipes] = React.useState([{}, {}, {}]);
  const [events, setEvents] = React.useState([{}]);
  const [feeds, setFeeds] = React.useState([{}]);
  /* ------------------------------------------
  // Daten aus DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    Stats.getStats(firebase)
      .then((result) => {
        setKpi(result);
        setIsLoadingKpi(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });

    Feed.getNewestFeedsOfType({
      firebase: firebase,
      limitTo: DEFAULT_VALUES.RECIPE_DISPLAY,
      feedType: FEED_TYPE.RECIPE_CREATED,
    })
      .then((result) => {
        setRecipes(result);
        setIsLoadingRecipe(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });

    Event.getEventsOfUser({
      firebase: firebase,
      userUid: authUser.uid,
      eventType: EventType.actual,
    })
      .then((result) => {
        setEvents(result);
        setIsLoadingEvent(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });

    Feed.getNewestFeeds({
      firebase: firebase,
      limitTo: DEFAULT_VALUES.FEEDS_DISPLAY,
    })
      .then((result) => {
        console.log(result);
        setFeeds(result);
        setIsLoadingFeed(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT.PAGE_TITLE_HOME(authUser.publicProfile.displayName)}
        subTitle={TEXT.PAGE_SUBTITLE_HOME}
      />
      {/* ===== BODY ===== */}
      <Container component="main" maxWidth="md" className={classes.container}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {error && (
              <Alert severity="error">
                <AlertTitle>
                  {TEXT.ALERT_TITLE_MUTINY_ON_THE_HIGH_SEAS}
                </AlertTitle>
                {FirebaseMessageHandler.translateMessage(error)}
              </Alert>
            )}
          </Grid>
          <Grid item xs={12}>
            <KpiPanel kpi={kpi} isLoading={isLoadingKpi} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <EventsPanel events={events} isLoading={isLoadingEvent} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FeedPanel feeds={feeds} isLoading={isLoadingFeed} />
          </Grid>
          <br />
          <Grid item xs={12}>
            <RecipesPanel recipes={recipes} isLoading={isLoadingRecipe} />
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================= KPI Panel ===========================
// =================================================================== */
const KpiPanel = ({ kpi, isLoading }) => {
  return (
    <Grid container spacing={2}>
      {kpi.map((keyfigure) => (
        <Grid item key={keyfigure.id} xs={6} sm={6} md={3}>
          <KpiCard
            value={keyfigure.value}
            caption={keyfigure.caption}
            isLoading={isLoading}
          />
        </Grid>
      ))}
    </Grid>
  );
};
/* ===================================================================
// ============================= KPI Card ============================
// =================================================================== */
const KpiCard = ({ value, caption, isLoading }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography
          gutterBottom={true}
          variant="h3"
          component="h2"
          align="center"
        >
          {isLoading ? (
            <Skeleton />
          ) : isNaN(value) ? (
            value
          ) : (
            value.toLocaleString("de-CH")
          )}
        </Typography>
        <Typography color="textSecondary" align="center">
          {caption}
        </Typography>
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// =========================== Event Panel ===========================
// =================================================================== */
const EventsPanel = ({ events, isLoading }) => {
  const classes = useStyles();
  const { push } = useHistory();

  /* ------------------------------------------
  // Event öffnen
  // ------------------------------------------ */
  const handleEventListItemClick = (eventUid, event) => {
    push({
      pathname: `${ROUTES.EVENT}/${eventUid}`,
      state: {
        action: ACTIONS.VIEW,
        event: event,
      },
    });
  };
  /* ------------------------------------------
  // Event erstellen
  // ------------------------------------------ */
  const handleNewEventButtonClick = (event) => {
    push({
      pathname: ROUTES.EVENT,
      state: {
        action: ACTIONS.NEW,
      },
    });
  };
  /* ------------------------------------------
  // Gehe zu Events
  // ------------------------------------------ */
  const handleMyEventsButtonClick = (event) => {
    push({
      pathname: ROUTES.EVENTS,
    });
  };
  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_NEXT_EVENTS}
        </Typography>
        <List className={classes.list}>
          {isLoading ? (
            <LoadingListElement />
          ) : (
            <React.Fragment>
              {events.length === 0 ? (
                <React.Fragment>
                  <Typography align="center">
                    {TEXT.EVENT_NOTHING_UP_TO}
                  </Typography>
                  <Typography align="center">
                    {TEXT.EVENT_PLAN_A_NEW_ONE}
                  </Typography>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {events.map((event, counter) => (
                    <React.Fragment key={"event_" + event.uid}>
                      {counter > 0 ? <Divider /> : null}

                      <ListItem
                        button
                        className={classes.listItem}
                        onClick={() =>
                          handleEventListItemClick(event.uid, event)
                        }
                        key={"eventListItem_" + event.uid}
                      >
                        <ListItemIcon>
                          <NewReleasesIcon />
                        </ListItemIcon>

                        <ListItemText
                          primary={event.name}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                className={classes.inline}
                                color="textPrimary"
                              >
                                {event.location}
                              </Typography>
                              {" - "} {event.motto}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </List>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={handleMyEventsButtonClick}
        >
          {TEXT.BUTTON_MY_EVENTS}
        </Button>
        <Button
          size="small"
          color="primary"
          onClick={handleNewEventButtonClick}
        >
          {TEXT.BUTTON_EVENT_CREATE}
        </Button>
      </CardActions>
    </Card>
  );
};
/* ===================================================================
// ============================ Feed Panel ===========================
// =================================================================== */
const FeedPanel = ({ feeds, isLoading }) => {
  const classes = useStyles();
  const { push } = useHistory();

  //FIXME:

  /* ------------------------------------------
  // Öffentliches Profil besuchen
  // ------------------------------------------ */
  const onClick = (feed) => {
    // NEXT_FEATURE: Dauer anzeigen, wie lange der Feedeintrag her ist.
    switch (feed.feedType) {
      case FEED_TYPE.RECIPE_CREATED:
        // Rezept anzeigen
        push({
          pathname: `${ROUTES.RECIPE}/${feed.objectUid}`,
          state: {
            action: ACTIONS.VIEW,
          },
        });
        break;
      default:
        // Wenn nichts vorhanden, User anzeigen,
        // der/die den Feed generiert hat
        push({
          pathname: `${ROUTES.USER_PUBLIC_PROFILE}/${feed.userUid}`,
          state: {
            action: ACTIONS.VIEW,
            displayName: feed.displayName,
            pictureSrc: feed.pictureSrc,
          },
        });
    }
  };

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_FEED}
        </Typography>
        <List className={classes.list}>
          {isLoading ? (
            <LoadingListElement />
          ) : (
            <React.Fragment>
              {feeds.map((feed, counter) => (
                <React.Fragment key={"feed_" + feed.uid}>
                  {counter > 0 ? (
                    <Divider variant="inset" component="li" />
                  ) : null}
                  <ListItem
                    alignItems="flex-start"
                    key={"feedListItem_" + feed.uid}
                    button
                    onClick={() => onClick(feed)}
                  >
                    <ListItemAvatar>
                      {feed.objectPictureSrc ? (
                        <Avatar
                          alt={feed.displayName}
                          src={String(feed.objectPictureSrc)}
                        />
                      ) : (
                        <Avatar alt={feed.displayName}>
                          {feed.displayName.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={feed.title}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            className={classes.inline}
                            color="textPrimary"
                          >
                            {feed.displayName}
                          </Typography>
                          {" - " + feed.text}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </React.Fragment>
          )}
        </List>
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// =========================== Recipe Panel ==========================
// =================================================================== */
const RecipesPanel = ({ recipes, isLoading }) => {
  const classes = useStyles();
  const { push } = useHistory();

  // !! ℹ️ die Rezpte stammen aus dem Feed
  const onCardClick = (event, recipe) => {
    push({
      pathname: `${ROUTES.RECIPE}/${recipe.uid}`,
      state: {
        action: ACTIONS.VIEW,
        recipeName: recipe.name,
        recipePictureSrc: recipe.pictureSrc,
      },
    });
  };
  return (
    <Grid container spacing={2}>
      <Grid item key={"newRecipes"} xs={12}>
        <Typography
          align="center"
          gutterBottom={true}
          variant="h5"
          component="h2"
        >
          {TEXT.PANEL_NEWEST_RECIPES}
        </Typography>
      </Grid>
      {recipes.map((recipe, counter) => (
        <Grid item key={"recipe_" + counter} xs={12} sm={6} md={4}>
          {isLoading ? (
            <RecipeCardLoading />
          ) : (
            <RecipeCard
              recipe={{
                name: recipe.objectName,
                pictureSrc: recipe.objectPictureSrc,
                uid: recipe.objectUid,
              }}
              cardActions={[
                { key: "show", name: "Anzeigen", onClick: onCardClick },
              ]}
            />
          )}
        </Grid>
      ))}
    </Grid>
  );
};

/* ===================================================================
// ======================== Loading List Element =====================
// =================================================================== */
const LoadingListElement = () => {
  const classes = useStyles();
  return (
    <ListItem className={classes.listItem} key={"eventListItem_skelleton"}>
      <ListItemIcon>
        <Skeleton animation="wave" variant="circle" width={40} height={40} />
      </ListItemIcon>
      <ListItemText primary={<Skeleton />} secondary={<Skeleton />} />
    </ListItem>
  );
};
const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(HomePage);
