import React, { useReducer } from "react";
import { compose } from "recompose";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import Feeds from "../Shared/feed.class";
import useStyles from "../../constants/styles";

import DialogDeletionConfirmation from "../Shared/dialogDeletionConfirmation";
import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import Feed from "../Shared/feed.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const REDUCER_ACTIONS = {
  GET_FEEDS_INIT: "FEED_DELETE_GET_FEEDS",
  GET_FEEDS_SUCCESS: "GET_FEEDS_SUCCESS",
  FEED_UPDATE_PROPERTIES: "FEED_UPDATE_PROPERTIES",
  FEED_DELETE_INIT: "FEED_DELETE_INIT",
  FEED_DELETE_SUCCESS: "FEED_DELETE_SUCCESS",
  FEED_DELETE_ERROR: "FEED_DELETE_ERROR",
  FEED_CHECKBOX_UPDATE: "FEED_CHECKBOX_UPDATE",
  // CLOSE_SNACKBAR: "CLOSE_SNACKBAR",
  GENERIC_ERROR: "GENERIC_ERROR",
};
let tmpFeeds;

const deleteFeedsReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.GET_FEEDS_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.GET_FEEDS_SUCCESS:
      tmpFeeds = action.payload;

      tmpFeeds = tmpFeeds.map((feed) => ({ ...{ checked: false }, ...feed }));

      return {
        ...state,
        feeds: tmpFeeds,
        isLoading: false,
        isError: false,
      };
    case REDUCER_ACTIONS.FEED_UPDATE_PROPERTIES:
      return {
        ...state,
        properties: { ...state.properties, [action.field]: action.value },
      };
    case REDUCER_ACTIONS.FEED_DELETE_INIT:
      return {
        ...state,
        properties: {
          ...state.properties,
          isDeleting: true,
          isDeleted: false,
        },
      };
    case REDUCER_ACTIONS.FEED_DELETE_SUCCESS:
      return {
        ...state,
        properties: {
          ...state.properties,
          isDeleting: false,
          isDeleted: true,
          // X Feed gelöscht
          message: TEXT.X_FEEDS_DELETED(action.payload),
          error: null,
        },
      };
    case REDUCER_ACTIONS.FEED_DELETE_ERROR:
      return {
        ...state,
        properties: {
          ...state.properties,
          isDeleting: false,
          isDeleted: false,
          error: action.payload,
        },
      };
    case REDUCER_ACTIONS.FEED_CHECKBOX_UPDATE:
      tmpFeeds = state.feeds;

      let feed = tmpFeeds.find((feed) => feed.uid === action.payload);

      feed.checked = !feed.checked;
      return {
        ...state,
        feeds: tmpFeeds,
      };
    case REDUCER_ACTIONS.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isError: true,
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
const FeedDeletePage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <FeedDeleteBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const FeedDeleteBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [deleteFeeds, dispatchDeleteFeeds] = React.useReducer(
    deleteFeedsReducer,
    {
      properties: {
        isDeleting: false,
        deletedFeeds: "",
        daysOffset: 30,
        noOfEntries: 50,
      },
      feeds: [],
      loading: false,
      isError: false,
      error: {},
    }
  );

  const [deletFeedsPopUp, setDeletFeedsPopUp] = React.useState({ open: false });
  /* ------------------------------------------
  // Delete Feeds Wert setzen
  // ------------------------------------------ */
  const onChangeDeleteFeedField = (event) => {
    dispatchDeleteFeeds({
      type: REDUCER_ACTIONS.FEED_UPDATE_PROPERTIES,
      field: event.target.name,
      value: event.target.value,
    });
  };
  /* ------------------------------------------
  // Delete Feeds PopUp öffnen
  // ------------------------------------------ */
  const onFeedDeletePopUpOpen = () => {
    setDeletFeedsPopUp({ ...deletFeedsPopUp, open: true });
  };
  /* ------------------------------------------
  // Delete Feeds PopUp Abbrechen
  // ------------------------------------------ */
  const onFeedDeleteCancel = () => {
    setDeletFeedsPopUp({ ...deletFeedsPopUp, open: false });
  };
  /* ------------------------------------------
  // Delete Feeds PopUp Ok
  // ------------------------------------------ */
  const onFeedDeleteOk = async () => {
    dispatchDeleteFeeds({ type: REDUCER_ACTIONS.FEED_DELETE_INIT });

    await Feed.deleteFeeds({
      firebase: firebase,
      daysOffset: deleteFeeds.properties.daysOffset,
      authUser: authUser,
      traceListener: feedDeleteListener,
    }).catch((error) => {
      dispatchDeleteFeeds({
        type: REDUCER_ACTIONS.GENERIC_ERROR,
        payload: error,
      });
    });

    setDeletFeedsPopUp({ ...deletFeedsPopUp, open: false });
  };

  /* ------------------------------------------
  // Listener für Produkt Trace
  // ------------------------------------------ */
  const feedDeleteListener = (snapshot) => {
    // Werte setzen, wenn durch
    if (snapshot?.done) {
      dispatchDeleteFeeds({
        type: REDUCER_ACTIONS.FEED_DELETE_SUCCESS,
        payload: snapshot.noOfDeletedDocuments,
      });
    }
  };
  /* ------------------------------------------
  // Feeds holen
  // ------------------------------------------ */
  const onGetFeeds = () => {
    dispatchDeleteFeeds({ type: REDUCER_ACTIONS.GET_FEEDS_INIT });
    Feeds.getNewestFeeds({
      firebase: firebase,
      limitTo: deleteFeeds.properties.noOfEntries,
    })
      .then((result) => {
        dispatchDeleteFeeds({
          type: REDUCER_ACTIONS.GET_FEEDS_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatchDeleteFeeds({
          type: REDUCER_ACTIONS.GENERIC_FAILURE,
          error: error,
        });
      });
  };
  /* ------------------------------------------
  // Feed-Checkbox markiere / entmarkieren
  // ------------------------------------------ */
  const onCheckboxChange = (uid) => {
    dispatchDeleteFeeds({
      type: REDUCER_ACTIONS.FEED_CHECKBOX_UPDATE,
      payload: uid,
    });
  };
  /* ------------------------------------------
  // markierte Feeds löschen
  // ------------------------------------------ */
  const onDeleteSelectiveFeeds = () => {
    deleteFeeds.feeds.forEach(async (feed) => {
      if (feed.checked) {
        await Feed.deleteFeed({ firebase: firebase, feedUid: feed.uid }).catch(
          (error) => {
            dispatchDeleteFeeds({
              type: REDUCER_ACTIONS.GENERIC_ERROR,
              error: error,
            });
          }
        );
      }
    });
    dispatchDeleteFeeds({
      type: REDUCER_ACTIONS.GET_FEEDS_SUCCESS,
      payload: deleteFeeds.feeds.filter((feed) => !feed.checked),
    });
  };

  return (
    <React.Fragment>
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={deleteFeeds.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <PanelDeleteFeedsByDays
              properties={deleteFeeds.properties}
              onChangeField={onChangeDeleteFeedField}
              onOpenPopUp={onFeedDeletePopUpOpen}
            />
          </Grid>

          <Grid item xs={12}>
            <PanelDeleteFeedsSelectiv
              onGetFeeds={onGetFeeds}
              onCheckboxChange={onCheckboxChange}
              deleteFeeds={deleteFeeds}
              onChangeField={onChangeDeleteFeedField}
              onDeleteSelectiveFeeds={onDeleteSelectiveFeeds}
            />
          </Grid>
        </Grid>
      </Container>
      <DialogDeletionConfirmation
        dialogOpen={deletFeedsPopUp.open}
        handleOk={onFeedDeleteOk}
        handleClose={onFeedDeleteCancel}
        confirmationString={"feeds"}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ================== Feed Einträge nach Tagen löschen ===============
// =================================================================== */
const PanelDeleteFeedsByDays = ({ properties, onChangeField, onOpenPopUp }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_SYSTEM_DELETE_FEED_BY_DAYS}
        </Typography>

        <TextField
          id={"daysOffset"}
          key={"daysOffset"}
          type="number"
          InputProps={{ inputProps: { min: 30 } }}
          label={TEXT.FIELD_FEED_DELETE_AFTER_DAYS}
          name={"daysOffset"}
          required
          value={properties.daysOffset}
          onChange={onChangeField}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
        {properties.isDeleted && (
          <AlertMessage severity={"success"} body={properties.message} />
        )}
        {properties.error && (
          <AlertMessage
            error={properties.error}
            messageTitle={TEXT.ALERT_TITLE_UUPS}
          />
        )}
        {properties.isDeleting && (
          <React.Fragment>
            <br />
            <LinearProgress />
          </React.Fragment>
        )}
        <Button
          fullWidth
          disabled={!properties.daysOffset}
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={onOpenPopUp}
        >
          {TEXT.BUTTON_DELETE_FEED}
        </Button>
      </CardContent>
    </Card>
  );
};

/* ===================================================================
// =================== Feed Einträge selektiv löschen ================
// =================================================================== */
const PanelDeleteFeedsSelectiv = ({
  deleteFeeds,
  onCheckboxChange,
  onGetFeeds,
  onChangeField,
  onDeleteSelectiveFeeds,
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_SYSTEM_DELETE_FEED_SELECTIV}
        </Typography>
        <TextField
          id={"noOfEntries"}
          key={"noOfEntries"}
          type="number"
          label={TEXT.FIELD_FEED_DELETE_NO_OF_ENTRIES}
          name={"noOfEntries"}
          required
          value={deleteFeeds.properties.noOfEntries}
          onChange={onChangeField}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          className={classes.submit}
          onClick={onGetFeeds}
        >
          {TEXT.BUTTON_GET_FEEDS}
        </Button>
        <Button
          fullWidth
          disabled={
            deleteFeeds.feeds.filter((feed) => feed.checked === true).length ===
            0
          }
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={onDeleteSelectiveFeeds}
        >
          {TEXT.BUTTON_DELETE_CHECKED_FEEDS}
        </Button>
        {deleteFeeds.feeds.length > 0 && (
          <List className={classes.root}>
            {deleteFeeds.feeds.map((feed) => (
              <ListItem
                name={feed.uid}
                key={feed.uid}
                // dense
                button
                onClick={() => onCheckboxChange(feed.uid)}
              >
                <ListItemIcon>
                  <Checkbox
                    key={feed.uid}
                    checked={feed.checked}
                    inputProps={{ "aria-labelledby": feed.uid }}
                    color="primary"
                    disableRipple
                  />
                </ListItemIcon>
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
                      {" - " +
                        feed.text +
                        " | " +
                        feed.createdAt.toLocaleString("de-CH", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(FeedDeletePage);
