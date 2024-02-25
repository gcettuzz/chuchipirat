import React from "react";
import {compose} from "react-recompose";

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
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import {
  X_FEEDS_DELETED as TEXT_X_FEEDS_DELETED,
  DELETE_FEED_BY_DAYS as TEXT_DELETE_FEED_BY_DAYS,
  DELETE_FEED_SELECTIV as TEXT_DELETE_FEED_SELECTIV,
  NO_OF_FEED_ENTRIES as TEXT_NO_OF_FEED_ENTRIES,
  DELETE_FEED as TEXT_DELETE_FEED,
  GET_FEEDS as TEXT_GET_FEEDS,
  DELETE_CHECKED_FEEDS as TEXT_DELETE_CHECKED_FEEDS,
} from "../../constants/text";
import Role from "../../constants/roles";

import useStyles from "../../constants/styles";

// import DialogDeletionConfirmation from "../Shared/dialogDeletionConfirmation";

import {withFirebase} from "../Firebase/firebaseContext";
import Feed from "../Shared/feed.class";
import AuthUser from "../Firebase/Authentication/authUser.class";
import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";
import {DialogType, useCustomDialog} from "../Shared/customDialogContext";
import {useTheme} from "@material-ui/core";
import withEmailVerification from "../Session/withEmailVerification";
import {CustomRouterProps} from "../Shared/global.interface";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  GET_FEEDS_INIT = 1,
  GET_FEEDS_SUCCESS,
  FEED_UPDATE_PROPERTIES,
  FEED_DELETE_INIT,
  FEED_DELETE_SUCCESS_BY_OFFSET,
  FEED_DELETE_SUCCESS_BY_SELECTION,
  FEED_DELETE_ERROR,
  FEED_CHECKBOX_UPDATE,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

interface FeedDeleteProperties {
  daysOffset: number;
  noOfEntries: number;
}

interface UiFeeds extends Feed {
  checked: boolean;
}

type State = {
  feeds: UiFeeds[];
  isError: boolean;
  properties: FeedDeleteProperties;
  error: Error;
  isLoading: boolean;
  isDeleting: boolean;
  snackbar: Snackbar;
};

//   const [deleteFeeds, dispatchDeleteFeeds] = React.useReducer(
//     deleteFeedsReducer,
//     {
//       properties: {
//         isDeleting: false,
//         deletedFeeds: "",
//         daysOffset: 30,
//         noOfEntries: 50,
//       },
//       feeds: [],
//       loading: false,
//       isError: false,
//       error: {},
//     }
//   );

const inititialState: State = {
  feeds: [],
  error: {} as Error,
  properties: {daysOffset: 30, noOfEntries: 50},
  isError: false,
  isDeleting: false,
  isLoading: false,
  snackbar: {open: false, severity: "success", message: ""},
};

const deleteFeedsReducer = (state: State, action: DispatchAction): State => {
  let tmpFeeds: UiFeeds[] = [];
  switch (action.type) {
    case ReducerActions.GET_FEEDS_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.GET_FEEDS_SUCCESS:
      tmpFeeds = action.payload as UiFeeds[];
      tmpFeeds = tmpFeeds.map((feed) => ({...{checked: false}, ...feed}));
      return {
        ...state,
        feeds: tmpFeeds,
        isLoading: false,
        isError: false,
      };
    case ReducerActions.FEED_UPDATE_PROPERTIES:
      return {
        ...state,
        properties: {...state.properties, ...action.payload},
      };
    case ReducerActions.FEED_DELETE_INIT:
      return {
        ...state,
        isDeleting: true,
      };
    case ReducerActions.FEED_DELETE_SUCCESS_BY_SELECTION: {
      tmpFeeds = state.feeds.filter((feed) => !feed.checked);
      const noOfDeletedFeeds = state.feeds.length - tmpFeeds.length;
      return {
        ...state,
        feeds: tmpFeeds,
        isDeleting: false,
        snackbar: {
          open: true,
          severity: "success",
          message: TEXT_X_FEEDS_DELETED(noOfDeletedFeeds.toString()),
        },
      };
    }
    case ReducerActions.FEED_DELETE_SUCCESS_BY_OFFSET:
      return {
        ...state,
        feeds: tmpFeeds,
        isDeleting: false,
        snackbar: {
          open: true,
          severity: "success",
          message: TEXT_X_FEEDS_DELETED(action.payload.noOfDeletedDocuments),
        },
      };
    case ReducerActions.FEED_DELETE_ERROR:
      return {
        ...state,
        isDeleting: false,
      };
    case ReducerActions.FEED_CHECKBOX_UPDATE: {
      tmpFeeds = state.feeds;

      const feed = tmpFeeds.find((feed) => feed.uid === action.payload.uid);

      feed!.checked = !feed!.checked;
      return {
        ...state,
        feeds: tmpFeeds,
      };
    }
    case ReducerActions.SNACKBAR_CLOSE:
      // Snackbar schliessen
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case ReducerActions.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isError: true,
        error: action.payload as Error,
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
      {(authUser) => <FeedDeleteBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const FeedDeleteBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const {customDialog} = useCustomDialog();

  const [state, dispatch] = React.useReducer(
    deleteFeedsReducer,
    inititialState
  );

  /* ------------------------------------------
    // Delete Feeds Wert setzen
    // ------------------------------------------ */
  const onChangeDeleteFeedField = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch({
      type: ReducerActions.FEED_UPDATE_PROPERTIES,
      payload: {[event.target.name]: event.target.value},
    });
  };
  /* ------------------------------------------
  // Feeds löschen
  // ------------------------------------------ */
  const onFeedDeleteConfirmation = async () => {
    // Löschung wurde bestätigt. Löschen kann losgehen
    const isConfirmed = await customDialog({
      dialogType: DialogType.ConfirmDeletion,
      deletionDialogProperties: {confirmationString: "feeds"},
    });
    if (!isConfirmed) {
      return;
    }

    dispatch({type: ReducerActions.FEED_DELETE_INIT, payload: {}});

    Feed.deleteFeedsDaysOffset({
      firebase: firebase,
      daysOffset: state.properties.daysOffset,
      authUser: authUser as AuthUser,
      callbackDone: (noOfDeletedDocuments: number) => {
        dispatch({
          type: ReducerActions.FEED_DELETE_SUCCESS_BY_OFFSET,
          payload: {noOfDeletedDocuments: noOfDeletedDocuments},
        });
      },
    }).catch((error) => {
      console.error(error);
      dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
    });
  };
  //   /* ------------------------------------------
  //   // Delete Feeds PopUp Ok
  //   // ------------------------------------------ */
  //   const onFeedDeleteOk = async () => {
  //     dispatchDeleteFeeds({type: REDUCER_ACTIONS.FEED_DELETE_INIT});

  //     await Feed.deleteFeeds({
  //       firebase: firebase,
  //       daysOffset: deleteFeeds.properties.daysOffset,
  //       authUser: authUser,
  //       traceListener: feedDeleteListener,
  //     }).catch((error) => {
  //       dispatchDeleteFeeds({
  //         type: REDUCER_ACTIONS.GENERIC_ERROR,
  //         payload: error,
  //       });
  //     });

  //     setDeletFeedsPopUp({...deletFeedsPopUp, open: false});
  //   };

  //   /* ------------------------------------------
  //   // Listener für Produkt Trace
  //   // ------------------------------------------ */
  //   const feedDeleteListener = (snapshot) => {
  //     // Werte setzen, wenn durch
  //     if (snapshot?.done) {
  //       dispatchDeleteFeeds({
  //         type: REDUCER_ACTIONS.FEED_DELETE_SUCCESS,
  //         payload: snapshot.noOfDeletedDocuments,
  //       });
  //     }
  //   };
  /* ------------------------------------------
  // Feeds holen
  // ------------------------------------------ */
  const onGetFeeds = () => {
    dispatch({type: ReducerActions.GET_FEEDS_INIT, payload: {}});

    Feed.getNewestFeeds({
      firebase: firebase,
      limitTo: state.properties.noOfEntries,
      visibility: "*",
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.GET_FEEDS_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({
          type: ReducerActions.GENERIC_ERROR,
          payload: error,
        });
      });
  };
  /* ------------------------------------------
    // Feed-Checkbox markiere / entmarkieren
    // ------------------------------------------ */
  const onCheckboxChange = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    dispatch({
      type: ReducerActions.FEED_CHECKBOX_UPDATE,
      payload: {uid: event.currentTarget.id},
    });
  };
  /* ------------------------------------------
    // markierte Feeds löschen
    // ------------------------------------------ */
  const onDeleteSelectiveFeeds = () => {
    state.feeds.forEach(async (feed) => {
      if (feed.checked) {
        await Feed.deleteFeed({firebase: firebase, feedUid: feed.uid}).catch(
          (error) => {
            dispatch({
              type: ReducerActions.GENERIC_ERROR,
              payload: error,
            });
          }
        );
      }
    });
    dispatch({
      type: ReducerActions.FEED_DELETE_SUCCESS_BY_SELECTION,
      payload: {},
    });
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
    dispatch({
      type: ReducerActions.SNACKBAR_CLOSE,
      payload: {},
    });
  };

  return (
    <React.Fragment>
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <PanelDeleteFeedsByDays
              properties={state.properties}
              isDeleting={state.isDeleting}
              onChangeField={onChangeDeleteFeedField}
              onFeedDeleteConfirm={onFeedDeleteConfirmation}
            />
          </Grid>

          <Grid item xs={12}>
            <PanelDeleteFeedsSelectiv
              properties={state.properties}
              onGetFeeds={onGetFeeds}
              onCheckboxChange={onCheckboxChange}
              feeds={state.feeds}
              onChangeField={onChangeDeleteFeedField}
              onDeleteSelectiveFeeds={onDeleteSelectiveFeeds}
            />
          </Grid>
        </Grid>
        <CustomSnackbar
          message={state.snackbar.message}
          severity={state.snackbar.severity}
          snackbarOpen={state.snackbar.open}
          handleClose={handleSnackbarClose}
        />
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
================== Feed Einträge nach Tagen löschen ===============
=================================================================== */
interface PanelDeleteFeedsByDaysProps {
  properties: FeedDeleteProperties;
  isDeleting: boolean;
  onChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFeedDeleteConfirm: () => void;
}
const PanelDeleteFeedsByDays = ({
  properties,
  isDeleting,
  onChangeField,
  onFeedDeleteConfirm,
}: PanelDeleteFeedsByDaysProps) => {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_DELETE_FEED_BY_DAYS}
        </Typography>

        <TextField
          id={"daysOffset"}
          key={"daysOffset"}
          type="number"
          InputProps={{inputProps: {min: 30}}}
          label={TEXT_DELETE_FEED_BY_DAYS}
          name={"daysOffset"}
          required
          value={properties.daysOffset}
          onChange={onChangeField}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
        {/* {properties.isDeleted && (
          <AlertMessage severity={"success"} body={properties.message} />
        )}
        {properties.error && (
          <AlertMessage
            error={properties.error}
            messageTitle={TEXT.ALERT_TITLE_UUPS}
          />
        )}*/}
        {isDeleting && (
          <React.Fragment>
            <br />
            <LinearProgress style={{marginTop: theme.spacing(1)}} />
          </React.Fragment>
        )}
        <Button
          fullWidth
          disabled={!properties.daysOffset}
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={onFeedDeleteConfirm}
        >
          {TEXT_DELETE_FEED}
        </Button>
      </CardContent>
    </Card>
  );
};

/* ===================================================================
=================== Feed Einträge selektiv löschen ================
=================================================================== */
interface PanelDeleteFeedsSelectivProps {
  properties: FeedDeleteProperties;
  feeds: UiFeeds[];
  onCheckboxChange: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  onGetFeeds: () => void;
  onChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteSelectiveFeeds: () => void;
}

const PanelDeleteFeedsSelectiv = ({
  properties,
  feeds,
  onCheckboxChange,
  onGetFeeds,
  onChangeField,
  onDeleteSelectiveFeeds,
}: PanelDeleteFeedsSelectivProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_DELETE_FEED_SELECTIV}
        </Typography>
        <TextField
          id={"noOfEntries"}
          key={"noOfEntries"}
          type="number"
          label={TEXT_NO_OF_FEED_ENTRIES}
          name={"noOfEntries"}
          required
          value={properties.noOfEntries}
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
          {TEXT_GET_FEEDS}
        </Button>
        <Button
          fullWidth
          disabled={!feeds.some((feed) => feed.checked === true)}
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={onDeleteSelectiveFeeds}
        >
          {TEXT_DELETE_CHECKED_FEEDS}
        </Button>
        <List className={classes.root}>
          {feeds.map((feed) => (
            <ListItem
              id={feed.uid}
              key={feed.uid}
              dense
              button
              onClick={onCheckboxChange}
            >
              <ListItemIcon>
                <Checkbox
                  key={feed.uid}
                  checked={feed.checked}
                  inputProps={{"aria-labelledby": feed.uid}}
                  color="primary"
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                primary={`${feed.type}: ${feed.sourceObject.name}`}
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      {feed.created.fromDisplayName}
                    </Typography>
                    {" - " +
                      feed.uid +
                      " | " +
                      feed.created.date.toLocaleString("de-CH", {
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
      </CardContent>
    </Card>
  );
};

const condition = (authUser: AuthUser | null) =>
  !!authUser && !!authUser.roles.includes(Role.admin);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(FeedDeletePage);
