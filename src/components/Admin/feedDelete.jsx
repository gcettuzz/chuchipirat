import React, { useReducer } from "react";
import { compose } from "recompose";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";

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
  FEED_DELETE_SET_DAYOFFSET: "FEED_DELETE_SET_DAYOFFSET",
  FEED_DELETE_INIT: "FEED_DELETE_INIT",
  FEED_DELETE_SUCCESS: "FEED_DELETE_SUCCESS",
  FEED_DELETE_ERROR: "FEED_DELETE_ERROR",
  // CLOSE_SNACKBAR: "CLOSE_SNACKBAR",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const deleteFeedsReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.FEED_DELETE_SET_DAYOFFSET:
      return {
        ...state,
        deleteFeeds: { ...state.deleteFeeds, dayOffset: action.payload },
      };
    case REDUCER_ACTIONS.FEED_DELETE_INIT:
      return {
        ...state,
        deleteFeeds: {
          ...state.deleteFeeds,
          isDeleting: true,
          isDeleted: false,
        },
      };
    case REDUCER_ACTIONS.FEED_DELETE_SUCCESS:
      return {
        ...state,
        deleteFeeds: {
          ...state.deleteFeeds,
          isDeleting: false,
          isDeleted: true,
          message: action.payload,
          error: null,
        },
      };
    case REDUCER_ACTIONS.FEED_DELETE_ERROR:
      return {
        ...state,
        deleteFeeds: {
          ...state.deleteFeeds,
          isDeleting: false,
          isDeleted: false,
          error: action.payload,
        },
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
      deleteFeeds: { isDeleting: false, deletedFeeds: "" },
      isError: false,
      error: {},
      // snackbar: { open: false, severity: "success", message: "" },
    }
  );

  const [deletFeedsPopUp, setDeletFeedsPopUp] = React.useState({ open: false });
  /* ------------------------------------------
  // Delete Feeds Wert setzen
  // ------------------------------------------ */
  const onChangeDeleteFeedField = (event) => {
    dispatchDeleteFeeds({
      type: REDUCER_ACTIONS.FEED_DELETE_SET_DAYOFFSET,
      payload: event.target.value,
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
    await Feed.callCloudFunctionDeleteFeeds({
      firebase: firebase,
      daysOffset: deleteFeeds.deleteFeeds.dayOffset,
    })
      .then((message) => {
        dispatchDeleteFeeds({
          type: REDUCER_ACTIONS.FEED_DELETE_SUCCESS,
          payload: message,
        });
      })
      .catch((error) => {
        dispatchDeleteFeeds({
          type: REDUCER_ACTIONS.FEED_DELETE_ERROR,
          payload: error,
        });
      });

    setDeletFeedsPopUp({ ...deletFeedsPopUp, open: false });
  };
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      {/* <PageTitle
        title={TEXT.PAGE_TITLE_ADMIN}
        
      /> */}
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <PanelDeleteFeeds
              deleteFeeds={deleteFeeds.deleteFeeds}
              onChangeField={onChangeDeleteFeedField}
              onOpenPopUp={onFeedDeletePopUpOpen}
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
// ======================== Feed Einträge löschen ====================
// =================================================================== */
const PanelDeleteFeeds = ({ deleteFeeds, onChangeField, onOpenPopUp }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_SYSTEM_DELETE_FEED}
        </Typography>
        {deleteFeeds.isDeleting && <LinearProgress />}
        <TextField
          id={"dayOffset"}
          key={"dayOffset"}
          type="number"
          InputProps={{ inputProps: { min: 30 } }}
          label={TEXT.FIELD_FEED_DELETE_AFTER_DAYS}
          name={"dayOffset"}
          required
          value={deleteFeeds.daysOffset}
          onChange={onChangeField}
          fullWidth
        />
        {deleteFeeds.isDeleted && (
          <AlertMessage severity={"success"} body={deleteFeeds.message} />
        )}
        {deleteFeeds.error && (
          <AlertMessage
            error={deleteFeeds.error}
            messageTitle={TEXT.ALERT_TITLE_UUPS}
          />
        )}
        <Button
          fullWidth
          disabled={!deleteFeeds.dayOffset}
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

const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(FeedDeletePage);
