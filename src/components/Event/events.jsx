import React from "react";
import { compose } from "recompose";
import { useHistory } from "react-router";

import CssBaseline from "@material-ui/core/CssBaseline";

import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";

import Container from "@material-ui/core/Container";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import * as ROUTES from "../../constants/routes";
import * as ACTIONS from "../../constants/actions";
import * as TEXT from "../../constants/text";
import useStyles from "../../constants/styles";

import Event, { EVENT_TYPES } from "./event.class";
import EventCard from "./eventCard";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const REDUCER_ACTIONS = {
  EVENTS_FETCH_INIT: "RECIPES_FETCH_INIT",
  EVENTS_FETCH_SUCCESS: "RECIPES_FETCH_SUCCESS",
  EVENTS_FETCH_ERROR: "RECIPES_FETCH_ERROR",
};

const eventsReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.EVENTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.EVENTS_FETCH_SUCCESS:
      return {
        ...state,
        [action.array]: action.payload,
        isLoading: false,
        searchExecuted: true,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const EventsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <EventsBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const EventsBase = ({ props, authUser }) => {
  const classes = useStyles();
  const { push } = useHistory();

  const [events, dispatchEvents] = React.useReducer(eventsReducer, {
    dataActual: [],
    dataHistory: [],
    isLoading: true,
    isError: false,
  });

  const firebase = props.firebase;

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    Event.getEvents(firebase, authUser, EVENT_TYPES.TYPE_ACTUAL).then(
      (result) => {
        dispatchEvents({
          type: REDUCER_ACTIONS.EVENTS_FETCH_SUCCESS,
          array: "dataActual",
          payload: result,
        });
      }
    );
  }, []);
  /* ------------------------------------------
  // Vergangene Events holen
  // ------------------------------------------ */
  const readPastEvents = () => {
    dispatchEvents({ type: REDUCER_ACTIONS.EVENTS_FETCH_INIT });
    Event.getEvents(firebase, authUser, EVENT_TYPES.TYPE_HISTORY).then(
      (result) => {
        dispatchEvents({
          type: REDUCER_ACTIONS.EVENTS_FETCH_SUCCESS,
          array: "dataHistory",
          payload: result,
        });
      }
    );
  };
  /* ------------------------------------------
  // Neuer Anlass anlegen
  // ------------------------------------------ */
  const onNewClick = () => {
    push({
      pathname: ROUTES.EVENT,
      state: { action: ACTIONS.NEW },
    });
  };
  /* ------------------------------------------
  // Klick auf Event-Karte
  // ------------------------------------------ */
  const onCardClick = (triggeredEvent, event) => {
    let pressedButton = triggeredEvent.currentTarget.id.split("_");

    switch (pressedButton[0]) {
      case "show":
        push({
          pathname: `${ROUTES.EVENT}/${event.uid}`,
          state: {
            action: ACTIONS.VIEW,
            event: event,
          },
        });
        break;
      case "edit":
        push({
          pathname: `${ROUTES.EVENT}/${event.uid}`,
          state: {
            action: ACTIONS.EDIT,
            event: event,
          },
        });
        break;
      case "menuplan":
        push({
          pathname: `${ROUTES.MENUPLAN}/${event.uid}`,
          state: {
            event: event,
          },
        });
        break;
      default:
        return;
    }
  };

  return (
    <AuthUserContext.Consumer>
      {(authUser) => (
        <React.Fragment>
          <CssBaseline />
          {/*===== HEADER ===== */}
          <PageTitle
            title={TEXT.PAGE_TITLE_EVENTS}
            subTitle={TEXT.PAGE_SUBTITLE_EVENTS}
          />
          <ButtonRow
            key="buttons_create"
            buttons={[
              {
                id: "new",
                hero: true,
                label: TEXT.BUTTON_EVENT_CREATE,
                variant: "outlined",
                color: "primary",
                onClick: onNewClick,
              },
            ]}
          />
          {/* ===== BODY ===== */}
          <Container
            className={classes.container}
            component="main"
            maxWidth="md"
          >
            <Backdrop className={classes.backdrop} open={events.isLoading}>
              <CircularProgress color="inherit" />
            </Backdrop>
            <EventList
              eventList={events.dataActual}
              cardActions={[
                { key: "show", name: TEXT.BUTTON_SHOW, onClick: onCardClick },
                { key: "edit", name: TEXT.BUTTON_EDIT, onClick: onCardClick },
                {
                  key: "menuplan",
                  name: TEXT.BUTTON_MENUPLAN,
                  onClick: onCardClick,
                },
              ]}
            />

            <Grid container spacing={2} justify="center">
              <Grid item>
                <Box m={4}>
                  {events.dataHistory.length === 0 ? (
                    <Button
                      align="center"
                      color="primary"
                      className={classes.button}
                      onClick={readPastEvents}
                    >
                      {TEXT.EVENT_SHOW_PAST_EVENTS}{" "}
                    </Button>
                  ) : (
                    <Typography
                      variant="h5"
                      align="center"
                      color="textSecondary"
                      paragraph
                    >
                      {TEXT.EVENT_PAST_EVENTS}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
            <React.Fragment>
              <EventList
                eventList={events.dataHistory}
                cardActions={[
                  { key: "show", name: TEXT.BUTTON_SHOW, onClick: onCardClick },
                  { key: "edit", name: TEXT.BUTTON_EDIT, onClick: onCardClick },
                  {
                    key: "menuplan",
                    name: TEXT.BUTTON_MENUPLAN,
                    onClick: onCardClick,
                  },
                ]}
              />
            </React.Fragment>
          </Container>
        </React.Fragment>
      )}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// ============================ Aktuelle Anlässe =====================
// =================================================================== */
const EventList = ({ eventList, cardActions }) => {
  // const classes = useStyles();
  return (
    <Grid container spacing={4}>
      {eventList.map((event) => (
        <Grid item key={"event_" + event.uid} xs={12} sm={6} md={4}>
          <EventCard
            key={"event_card_" + event.uid}
            event={event}
            cardActions={cardActions}
          />
        </Grid>
      ))}
    </Grid>
  );
};
const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(EventsPage);
