import React from "react";
import {useTheme} from "@material-ui/core/styles";
import {compose} from "react-recompose";

import {useHistory} from "react-router";

import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardHeader,
  CardActionArea,
  Container,
  Typography,
  Button,
  Divider,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Link,
} from "@material-ui/core";

import {Skeleton} from "@material-ui/lab";

import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";

import {
  PAGE_TITLE_HOME as TEXT_PAGE_TITLE_HOME,
  PAGE_SUBTITLE_HOME as TEXT_PAGE_SUBTITLE_HOME,
  CREATE_EVENT as TEXT_CREATE_EVENT,
  EVENT_SHOW_PAST_EVENTS as TEXT_EVENT_SHOW_PAST_EVENTS,
  EVENT_PAST_EVENTS as TEXT_EVENT_PAST_EVENTS,
  NEWEST_RECIPES as TEXT_NEWEST_RECIPES,
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  FEED as TEXT_FEED,
  STATS as TEXT_STATS,
  APP_NAME as TEXT_APP_NAME,
} from "../../constants/text";
import * as ROUTES from "../../constants/routes";

import {ImageRepository} from "../../constants/imageRepository";
import Event, {EventType} from "../Event/Event/event.class";
import EventCard, {EventCardLoading} from "../Event/Event/eventCard";

import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import Feed, {FeedType} from "../Shared/feed.class";
import {RecipeCardLoading} from "../Recipe/recipeCard";
import Action from "../../constants/actions";
import {RecipeType} from "../Recipe/recipe.class";
import Role from "../../constants/roles";
import {
  FEEDS_DISPLAY as DEFAULT_VALUES_FEEDS_DISPLAY,
  RECIPE_DISPLAY as DEFAULT_RECIPE_DISPLAY,
} from "../../constants/defaultValues";
import Stats, {Kpi} from "../Shared/stats.class";
import {
  NavigationValuesContext,
  NavigationObject,
} from "../Navigation/navigationContext";
import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";
import {withFirebase} from "../Firebase/firebaseContext";
import withEmailVerification from "../Session/withEmailVerification";
import {CustomRouterProps} from "../Shared/global.interface";
import Utils from "../Shared/utils.class";
import SystemMessage from "../Admin/systemMessage.class";
import {AlertSystemMessage} from "../Admin/systemMessage";
/* ===================================================================
// ============================ Dispatcher ===========================
// =================================================================== */

enum ReducerActions {
  EVENTS_FETCH_INIT,
  EVENTS_FETCH_SUCCESS,
  PASSED_EVENTS_FETCH_INIT,
  PASSED_EVENTS_FETCH_SUCCESS,
  NEWEST_RECIPES_FETCH_INIT,
  NEWEST_RECIPES_FETCH_SUCCESS,
  FEED_FETCH_INIT,
  FEED_FETCH_SUCCESS,
  STATS_FETCH_INIT,
  STATS_FETCH_SUCCESS,
  SYSTEM_MESSAGE_FETCH_SUCCESS,
  SET_SNACKBAR,
  CLOSE_SNACKBAR,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: any;
};

type State = {
  events: Event[];
  passedEvents: Event[];
  recipes: Feed[];
  feed: Feed[];
  stats: Kpi[];
  systemMessage: SystemMessage | null;
  snackbar: Snackbar;
  isLoadingEvents: boolean;
  isLoadingPassedEvents: boolean;
  isLoadingNewestRecipes: boolean;
  isLoadingFeed: boolean;
  isLoadingStats: boolean;
  error: Error | null;
};

const inititialState: State = {
  events: [],
  passedEvents: [],
  recipes: [],
  feed: [],
  stats: [],
  systemMessage: null,
  snackbar: {} as Snackbar,
  isLoadingEvents: false,
  isLoadingPassedEvents: false,
  isLoadingNewestRecipes: false,
  isLoadingFeed: false,
  isLoadingStats: false,
  error: null,
};

const homeReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.EVENTS_FETCH_INIT:
      return {
        ...state,
        isLoadingEvents: true,
      };
    case ReducerActions.EVENTS_FETCH_SUCCESS:
      return {
        ...state,
        isLoadingEvents: false,
        events: action.payload as Event[],
      };
    case ReducerActions.PASSED_EVENTS_FETCH_INIT:
      return {
        ...state,
        isLoadingPassedEvents: true,
      };
    case ReducerActions.PASSED_EVENTS_FETCH_SUCCESS:
      return {
        ...state,
        isLoadingPassedEvents: false,
        passedEvents: action.payload as Event[],
      };
    case ReducerActions.NEWEST_RECIPES_FETCH_INIT:
      return {
        ...state,
        isLoadingNewestRecipes: true,
      };
    case ReducerActions.NEWEST_RECIPES_FETCH_SUCCESS:
      return {
        ...state,
        isLoadingNewestRecipes: false,
        recipes: action.payload as Feed[],
      };
    case ReducerActions.FEED_FETCH_INIT:
      return {
        ...state,
        isLoadingFeed: true,
      };
    case ReducerActions.FEED_FETCH_SUCCESS:
      return {
        ...state,
        isLoadingFeed: false,
        feed: action.payload as Feed[],
      };
    case ReducerActions.STATS_FETCH_INIT:
      return {
        ...state,
        isLoadingStats: true,
      };
    case ReducerActions.STATS_FETCH_SUCCESS:
      return {
        ...state,
        isLoadingStats: false,
        stats: action.payload as Kpi[],
      };
    case ReducerActions.SYSTEM_MESSAGE_FETCH_SUCCESS:
      return {
        ...state,
        systemMessage: action.payload,
      };
    case ReducerActions.SET_SNACKBAR:
      return {
        ...state,
        snackbar: action.payload as Snackbar,
      };
    case ReducerActions.CLOSE_SNACKBAR:
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case ReducerActions.GENERIC_ERROR:
      return {...state, error: action.payload as Error};
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
interface LocationState {
  snackbar?: Snackbar;
}

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const HomePage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <HomeBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const HomeBase: React.FC<
  CustomRouterProps<undefined, LocationState> & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;

  const classes = useStyles();
  const {push} = useHistory();

  const navigationValuesContext = React.useContext(NavigationValuesContext);
  const [state, dispatch] = React.useReducer(homeReducer, inititialState);
  // Prüfen ob allenfalls eine Snackbar angezeigt werden soll
  // --> aus dem Prozess Anlass löschen
  if (
    props.location.state &&
    props.location.state?.["snackbar"] &&
    !state.snackbar.open
  ) {
    dispatch({
      type: ReducerActions.SET_SNACKBAR,
      payload: props.location.state?.["snackbar"],
    });
  }

  /* ------------------------------------------
  // Navigation-Handler
  // ------------------------------------------ */
  React.useEffect(() => {
    navigationValuesContext?.setNavigationValues({
      action: Action.NONE,
      object: NavigationObject.home,
    });
  }, []);

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (!authUser) {
      return;
    }
    dispatch({type: ReducerActions.EVENTS_FETCH_INIT, payload: {}});

    Event.getEventsOfUser({
      firebase: firebase,
      userUid: authUser.uid,
      eventType: EventType.actual,
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.EVENTS_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) =>
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error})
      );
  }, [authUser]);
  React.useEffect(() => {
    //Neuster freigegebene Rezepte
    dispatch({type: ReducerActions.NEWEST_RECIPES_FETCH_INIT, payload: {}});

    Feed.getNewestFeeds({
      firebase: firebase,
      limitTo: DEFAULT_RECIPE_DISPLAY,
      feedType: FeedType.recipePublished,
      visibility: Role.basic,
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.NEWEST_RECIPES_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) =>
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error})
      );
  }, []);
  React.useEffect(() => {
    //Feed Einträge
    dispatch({type: ReducerActions.FEED_FETCH_INIT, payload: {}});

    Feed.getNewestFeeds({
      firebase: firebase,
      limitTo: DEFAULT_VALUES_FEEDS_DISPLAY,
      visibility: Role.basic,
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.FEED_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) =>
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error})
      );
  }, []);
  React.useEffect(() => {
    //Statistik Einträge
    dispatch({type: ReducerActions.STATS_FETCH_INIT, payload: {}});

    Stats.getStats(firebase)
      .then((result) => {
        dispatch({
          type: ReducerActions.STATS_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) =>
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error})
      );
  }, []);
  React.useEffect(() => {
    SystemMessage.getSystemMessage({
      firebase: firebase,
      mustBeValid: true,
    })
      .then((result) => {
        if (result?.text) {
          dispatch({
            type: ReducerActions.SYSTEM_MESSAGE_FETCH_SUCCESS,
            payload: result,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  }, []);

  if (!authUser) {
    return null;
  }

  const onShowPassedEvents = () => {
    dispatch({type: ReducerActions.PASSED_EVENTS_FETCH_INIT, payload: {}});
    Event.getEventsOfUser({
      firebase: firebase,
      userUid: authUser.uid,
      eventType: EventType.history,
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.PASSED_EVENTS_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) =>
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error})
      );
  };
  /* ------------------------------------------
  // Objekte öffnen
  // ------------------------------------------ */
  const onEventClick = (raisedEvent: React.MouseEvent<HTMLButtonElement>) => {
    let event: Event | undefined;

    event = state.events.find(
      (event) => event.uid === raisedEvent.currentTarget.name.split("_")[1]
    );
    if (!event && state.passedEvents.length > 0) {
      event = state.passedEvents.find(
        (event) => event.uid === raisedEvent.currentTarget.name.split("_")[1]
      );
    }

    if (!event) {
      return;
    }
    push({
      pathname: `${ROUTES.EVENT}/${event.uid}`,
      state: {
        action: Action.VIEW,
        event: event,
      },
    });
  };
  const onCreateNewEvent = () => {
    push({
      pathname: `${ROUTES.CREATE_NEW_EVENT}`,
    });
  };
  const onRecipeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const recipeUid = event.currentTarget.name.split("_")[1];
    const recipe = state.recipes.find(
      (recipe) => recipe.sourceObject.uid == recipeUid
    );

    if (!recipe) {
      return;
    }
    push({
      pathname: `${ROUTES.RECIPE}/${recipeUid}`,
      state: {
        action: Action.VIEW,
        recipeShort: {
          uid: recipe.sourceObject.uid,
          name: recipe.sourceObject.name,
          pictureSrc: recipe.sourceObject.pictureSrc,
        },
        recipeType: RecipeType.public,
      },
    });
  };
  const onFeedEntryCllick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const feedEntry = state.feed.find(
      (feedEntry) => feedEntry.uid == event.currentTarget.id.split("_")[1]
    );
    if (!feedEntry) {
      return;
    }

    switch (feedEntry.type) {
      case FeedType.recipePublished:
        // Rezept anzeigen
        push({
          pathname: `${ROUTES.RECIPE}/${feedEntry.sourceObject.uid}`,
          state: {
            action: Action.VIEW,
          },
        });
        break;
      default:
        // Wenn nichts vorhanden, User anzeigen,
        // der/die den Feed generiert hat
        push({
          pathname: `${ROUTES.USER_PUBLIC_PROFILE}/${feedEntry.user.uid}`,
          state: {
            action: Action.VIEW,
            displayName: feedEntry.user.displayName,
            pictureSrc: feedEntry.user.pictureSrc,
          },
        });
    }
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    delete props.location.state?.snackbar;
    dispatch({
      type: ReducerActions.CLOSE_SNACKBAR,
      payload: {},
    });
  };
  return (
    <React.Fragment>
      <HomeHeader authUser={authUser} />
      <Container className={classes.container} component="main" maxWidth="md">
        <Grid container spacing={2} justifyContent="center">
          {state.error && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={state.error}
                messageTitle={TEXT_ALERT_TITLE_WAIT_A_MINUTE}
              />
            </Grid>
          )}
          {state.systemMessage !== null && (
            <Grid item key="systemMessage" xs={12}>
              <AlertSystemMessage systemMessage={state.systemMessage} />
            </Grid>
          )}
          <Grid item xs={12}>
            <HomeNextEvents
              events={state.events}
              isLoadingEvents={state.isLoadingEvents}
              onCardClick={onEventClick}
              onCreateNewEvent={onCreateNewEvent}
            />
          </Grid>
          <Grid item xs={12}>
            <HomePassedEvents
              events={state.passedEvents}
              isLoadingPassedEvents={state.isLoadingPassedEvents}
              onCardClick={onEventClick}
              onShowPassedEvents={onShowPassedEvents}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider style={{marginBottom: "2rem"}} />
          </Grid>
          {Utils.isTestEnviroment() && (
            <Grid item xs={12}>
              <Typography variant="h5" align="center" gutterBottom>
                Testing
              </Typography>
              <Typography variant="h5" align="center" gutterBottom>
                <Link
                  href="https://help.chuchipirat.ch/known_errors"
                  target="_blank"
                >
                  --» Aktuell bekannte Fehler «--
                </Link>
              </Typography>
              <br />
              <Divider style={{marginBottom: "2rem"}} />
            </Grid>
          )}
          <Grid item xs={12} md={4}>
            <HomeNewestRecipes
              recipes={state.recipes}
              isLoadingRecipes={state.isLoadingEvents}
              onCardClick={onRecipeClick}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <HomeFeed
              feed={state.feed}
              isLoadingFeed={state.isLoadingFeed}
              onListEntryClick={onFeedEntryCllick}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <HomeStats
              stats={state.stats}
              isLoadingStats={state.isLoadingStats}
            />
          </Grid>
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
// ============================= Header ==============================
// =================================================================== */
interface HomeHeaderProps {
  authUser: AuthUser;
}
const HomeHeader = ({authUser}: HomeHeaderProps) => {
  return (
    <PageTitle
      title={TEXT_PAGE_TITLE_HOME(authUser.publicProfile.displayName)}
      subTitle={TEXT_PAGE_SUBTITLE_HOME}
      windowTitle={`${TEXT_APP_NAME} | Home`}
    />
  );
};
/* ===================================================================
// ============================= Events ==============================
// =================================================================== */
interface HomeNextEventsProps {
  events: Event[];
  isLoadingEvents: boolean;
  onCardClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onCreateNewEvent: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const HomeNextEvents = ({
  events,
  isLoadingEvents,
  onCardClick,
  onCreateNewEvent,
}: HomeNextEventsProps) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="center">
        {isLoadingEvents && (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <EventCardLoading key={"loadingEventCard"} />
          </Grid>
        )}
        {events.map((event) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={"eventGrid_" + event.uid}
          >
            <EventCard
              event={event}
              onCardClick={onCardClick}
              key={"eventCard_" + event.uid}
            />
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card className={classes.card} key={"eventCardNew"}>
            <CardMedia
              className={classes.cardMedia}
              image={
                ImageRepository.getEnviromentRelatedPicture()
                  .CARD_PLACEHOLDER_MEDIA
              }
              title={TEXT_CREATE_EVENT}
            />
            <CardContent>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={onCreateNewEvent}
              >
                {TEXT_CREATE_EVENT}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
interface HomePassedEventsProps {
  events: Event[];
  onCardClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isLoadingPassedEvents: boolean;
  onShowPassedEvents: () => void;
}
const HomePassedEvents = ({
  events,
  onCardClick,
  isLoadingPassedEvents,
  onShowPassedEvents,
}: HomePassedEventsProps) => {
  const classes = useStyles();

  const [showLoadPassedEvents, setShowLoadPassedEvents] = React.useState(true);
  /* ------------------------------------------
  // Vergangene Anlässe lasen
  // ------------------------------------------ */
  const loadPassedEvents = () => {
    setShowLoadPassedEvents(false);
    onShowPassedEvents();
  };
  // Leere Containers erzeugen, damit die Cards je nach Layout schön auf-
  // gelistet werden
  const theme = useTheme();
  let rowFiller: number[] = [];
  const breakpointIsXs = useMediaQuery(theme.breakpoints.down("xs"));
  const breakpointIsSm = useMediaQuery(theme.breakpoints.down("sm"));
  breakpointIsXs
    ? (rowFiller = [])
    : breakpointIsSm
    ? (rowFiller = [...Array(events.length % 2).keys()])
    : (rowFiller = [...Array(events.length % 3).keys()]);

  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="center">
        {showLoadPassedEvents ? (
          <Grid item xs={12} className={classes.centerCenter}>
            <Button
              color="primary"
              className={classes.button}
              onClick={loadPassedEvents}
            >
              {TEXT_EVENT_SHOW_PAST_EVENTS}{" "}
            </Button>
          </Grid>
        ) : (
          <Grid item xs={12} className={classes.centerCenter}>
            <Typography
              variant="h5"
              align="center"
              color="textSecondary"
              style={{marginTop: "1rem"}}
            >
              {TEXT_EVENT_PAST_EVENTS}
            </Typography>
          </Grid>
        )}
        {isLoadingPassedEvents && (
          <React.Fragment>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <EventCardLoading />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <EventCardLoading />
            </Grid>
          </React.Fragment>
        )}
        {!showLoadPassedEvents &&
          events.map((event) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={"eventGrid_" + event.uid}
            >
              <EventCard
                event={event}
                onCardClick={onCardClick}
                key={"eventCard_" + event.uid}
              />
            </Grid>
          ))}
        {!showLoadPassedEvents &&
          rowFiller.map((number) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={"gridRowFiller_" + number}
            />
          ))}
      </Grid>
    </React.Fragment>
  );
};

/* ===================================================================
// ========================== Neuste Rezepte ==========================
// =================================================================== */
interface HomeNewestRecipesProps {
  recipes: Feed[];
  isLoadingRecipes: boolean;
  onCardClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const HomeNewestRecipes = ({
  recipes,
  isLoadingRecipes,
  onCardClick,
}: HomeNewestRecipesProps) => {
  const classes = useStyles();
  const [hover, setHover] = React.useState({recipeUid: "", hover: false});
  /* ------------------------------------------
  // Hover-Effekt Karte
  // ------------------------------------------ */
  const handleHover = (recipeUid: string) => {
    setHover({recipeUid: recipeUid, hover: true});
  };
  const handleMouseOut = () => {
    setHover({recipeUid: "", hover: false});
  };

  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12} key={"recipeTitle"}>
        <Typography
          align="center"
          gutterBottom={true}
          variant="h5"
          component="h2"
        >
          {TEXT_NEWEST_RECIPES}
        </Typography>
      </Grid>
      {isLoadingRecipes &&
        Array(DEFAULT_RECIPE_DISPLAY).map((emptyCard) => (
          <Grid item xs={12} key={"emptyRecipeGrid_" + emptyCard}>
            <RecipeCardLoading key={"emptyRecipeCard_" + emptyCard} />
          </Grid>
        ))}
      {recipes.map((recipe) => (
        <Grid item xs={12} key={"recipeGrid_" + recipe.uid}>
          <Card
            className={classes.card}
            onMouseOver={() => handleHover(recipe.uid)}
            onMouseOut={handleMouseOut}
            key={"recipeCard_" + recipe.uid}
          >
            <CardActionArea
              name={"recipeCardActionArea_" + recipe.sourceObject.uid}
              onClick={onCardClick}
              style={{height: "100%"}}
            >
              <div className={classes.card}>
                <div style={{overflow: "hidden"}}>
                  <CardMedia
                    className={classes.cardMedia}
                    image={
                      recipe.sourceObject.pictureSrc
                        ? recipe.sourceObject.pictureSrc
                        : ImageRepository.getEnviromentRelatedPicture()
                            .CARD_PLACEHOLDER_MEDIA
                    }
                    title={recipe.sourceObject.name}
                    style={{
                      transform:
                        hover.hover && hover.recipeUid === recipe.uid
                          ? "scale(1.05)"
                          : "scale(1)",
                      transition: "0.5s ease",
                    }}
                  />
                </div>
                <CardHeader title={recipe.sourceObject.name} />
              </div>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
/* ===================================================================
// ========================== Feed-Einträge ==========================
// =================================================================== */
interface HomeFeedProps {
  feed: Feed[];
  isLoadingFeed: boolean;
  onListEntryClick: (event) => void;
}
const HomeFeed = ({feed, isLoadingFeed, onListEntryClick}: HomeFeedProps) => {
  const classes = useStyles();
  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12}>
        <Typography
          align="center"
          gutterBottom={true}
          variant="h5"
          component="h2"
        >
          {TEXT_FEED}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.card}>
          <List>
            {isLoadingFeed &&
              [...Array(DEFAULT_VALUES_FEEDS_DISPLAY).keys()].map(
                (emptyElement) => (
                  <ListItem key={"eventListItem_skelleton" + emptyElement}>
                    <ListItemText
                      primary={<Skeleton />}
                      secondary={<Skeleton />}
                    />
                  </ListItem>
                )
              )}
            {feed.map((feedEntry, counter) => (
              <React.Fragment key={"feed_" + feedEntry.uid}>
                <ListItem
                  alignItems="flex-start"
                  key={"feedListItem_" + feedEntry.uid}
                  id={"feedListItem_" + feedEntry.uid}
                  button
                  onClick={onListEntryClick}
                >
                  <ListItemAvatar>
                    {feedEntry.user.pictureSrc ? (
                      <Avatar
                        alt={feedEntry.user.displayName}
                        src={String(feedEntry.user.pictureSrc)}
                      />
                    ) : (
                      <Avatar alt={feedEntry.user.displayName}>
                        {feedEntry.user.displayName.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={feedEntry.title}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          //  className={classes.inline}
                          color="textPrimary"
                        >
                          {feedEntry.user.displayName}
                        </Typography>
                        {" - " + feedEntry.text}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {counter != feed.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        </Card>
      </Grid>
    </Grid>
  );
};
/* ===================================================================
// ======================= Statistik-Einträge ========================
// =================================================================== */
interface HomeStatsProps {
  stats: Kpi[];
  isLoadingStats: boolean;
}
const HomeStats = ({stats, isLoadingStats}: HomeStatsProps) => {
  const classes = useStyles();
  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12}>
        <Typography
          align="center"
          gutterBottom={true}
          variant="h5"
          component="h2"
        >
          {TEXT_STATS}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.card}>
          <List>
            {isLoadingStats
              ? stats.map((emptyElement) => (
                  <ListItem key={"eventListItem_skelleton" + emptyElement}>
                    <ListItemText primary={<Skeleton />} />
                  </ListItem>
                ))
              : stats.map((stat, counter) => (
                  <React.Fragment key={"stat_" + stat.id}>
                    <ListItem
                      alignItems="flex-start"
                      key={"statListItem_" + stat.id}
                      id={"statListItem_" + stat.id}
                    >
                      <ListItemText primary={stat.caption} />
                      <ListItemText
                        primary={stat.value.toLocaleString("de-CH")}
                        style={{textAlign: "right"}}
                      />
                    </ListItem>
                    {counter != stats.length - 1 && (
                      <Divider
                        style={{marginLeft: "1rem", marginRight: "1rem"}}
                        component="li"
                      />
                    )}
                  </React.Fragment>
                ))}
          </List>
        </Card>
      </Grid>
    </Grid>
  );
};

const condition = (authUser: AuthUser | null) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(HomePage);
