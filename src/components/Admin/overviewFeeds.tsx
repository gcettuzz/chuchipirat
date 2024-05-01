import React from "react";
import {compose} from "react-recompose";

import {
  MONITOR as TEXT_MONITOR,
  OVERVIEW as TEXT_OVERVIEW,
  DELETE as TEXT_DELETE,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  UID as TEXT_UID,
  DATE as TEXT_DATE,
  FEEDS as TEXT_FEEDS,
  DELETE_CLOUD_FX_TRIGGER_DOCS as TEXT_DELETE_CLOUD_FX_TRIGGER_DOCS,
  DELETE_CLOUD_FX_TRIGGER_DOCS_OLDER_THAN as TEXT_DELETE_CLOUD_FX_TRIGGER_DOCS_OLDER_THAN,
  CLOUD_FX_TRIGGER_DOCS as TEXT_CLOUD_FX_TRIGGER_DOCS,
  FROM as TEXT_FROM,
  OPEN as TEXT_OPEN,
  X_FEEDS_DELETED as TEXT_X_FEEDS_DELETED,
  TITLE as TEXT_TITLE,
  TYPE as TEXT_TYPE,
  VISIBILITY as TEXT_VISIBILITY,
  CREATED_FROM as TEXT_CREATED_FROM,
  ATTENTION as TEXT_ATTENTION,
  SHOULD_FEED_ENTRY_BE_DELETED as TEXT_SHOULD_FEED_ENTRY_BE_DELETED,
  CLOSE as TEXT_CLOSE,
} from "../../constants/text";

import {OpenInNew as OpenInNewIcon} from "@material-ui/icons";

import PageTitle from "../Shared/pageTitle";

import Role from "../../constants/roles";
import useStyles from "../../constants/styles";
import CustomSnackbar, {
  SNACKBAR_INITIAL_STATE_VALUES,
  Snackbar,
} from "../Shared/customSnackbar";
import {
  Backdrop,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  Dialog,
  // DialogActions,
  DialogContent,
  DialogTitle,
  // FormControl,
  // FormControlLabel,
  // FormGroup,
  // FormLabel,
  Grid,
  IconButton,
  List,
  // Switch,
  Typography,
  useTheme,
  LinearProgress,
  Button,
  TextField,
  DialogActions,
} from "@material-ui/core";
import AlertMessage from "../Shared/AlertMessage";
import SearchPanel from "../Shared/searchPanel";

import {FormListItem} from "../Shared/formListItem";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";
import {ChangeRecord, CustomRouterProps} from "../Shared/global.interface";
import {
  DataGrid,
  GridColDef,
  GridValueFormatterParams,
  deDE,
} from "@mui/x-data-grid";
import Feed, {FeedLogEntry} from "../Shared/feed.class";
import {DialogType, useCustomDialog} from "../Shared/customDialogContext";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  FEED_LOG_FETCH_INIT,
  FEED_LOG_FETCH_SUCCESS,
  FEED_FETCH_INIT,
  FEED_FETCH_SUCCESS,
  FEED_DELETING_INIT,
  FEED_DELETING_SUCCESS,
  SNACKBAR_SET,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}

enum TabValue {
  overview,
  delete,
}

interface FeedLogOverviewStructure {
  uid: Feed["uid"];
  title: Feed["title"];
  text: Feed["text"];
  type: Feed["type"];
  visibility: Feed["visibility"];
  createdDate: ChangeRecord["date"];
  createdFromUid: ChangeRecord["fromUid"];
  createdFromDisplayName: ChangeRecord["fromDisplayName"];
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  feedLog: FeedLogEntry[];
  feedDocuments: {[key: Feed["uid"]]: Feed};
  error: Error | null;
  isLoading: boolean;
  isDeleting: boolean;
  snackbar: Snackbar;
};

const inititialState: State = {
  feedLog: [],
  feedDocuments: {},
  error: null,
  isLoading: false,
  isDeleting: false,
  snackbar: SNACKBAR_INITIAL_STATE_VALUES,
};

const feedsOverviewReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.FEED_LOG_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.FEED_LOG_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        feedLog: action.payload.value as FeedLogEntry[],
      };
    case ReducerActions.FEED_FETCH_INIT:
      return {...state, isLoading: true};
    case ReducerActions.FEED_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        feedDocuments: {
          ...state.feedDocuments,
          [action.payload.uid]: action.payload,
        },
      };
    case ReducerActions.FEED_DELETING_INIT:
      return {...state, isDeleting: true};
    case ReducerActions.FEED_DELETING_SUCCESS:
      return {
        ...state,
        feedLog: action.payload.feedLog,
        feedDocuments: action.payload.feedDocuments,
        isDeleting: false,
        snackbar: {
          severity: "success",
          message: TEXT_X_FEEDS_DELETED(action.payload.counter),
          open: true,
        },
      };
    case ReducerActions.SNACKBAR_SET:
      return {
        ...state,
        snackbar: action.payload as Snackbar,
      };
    case ReducerActions.SNACKBAR_CLOSE:
      // Snackbar schliessen
      return {
        ...state,
        snackbar: SNACKBAR_INITIAL_STATE_VALUES,
      };
    case ReducerActions.GENERIC_ERROR:
      // allgemeiner Fehler
      return {
        ...state,
        error: action.payload as Error,
        isLoading: false,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const OverviewFeedsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <OverviewFeedsBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
interface OverviewFeedsBaseProps {
  selectedFeedDoc: null | Feed;
  logEntry: FeedLogEntry | null;
  open: boolean;
}
const OverviewFeedsBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const theme = useTheme();
  const {customDialog} = useCustomDialog();

  const [state, dispatch] = React.useReducer(
    feedsOverviewReducer,
    inititialState
  );
  const [tabValue, setTabValue] = React.useState(TabValue.overview);
  const [dialogValues, setDialogValues] =
    React.useState<OverviewFeedsBaseProps>({
      selectedFeedDoc: null,
      logEntry: null,
      open: false,
    });
  /* ------------------------------------------
	// Daten aus DB holen
	// ------------------------------------------ */
  React.useEffect(() => {
    dispatch({
      type: ReducerActions.FEED_LOG_FETCH_INIT,
      payload: {},
    });

    Feed.getFeedsLog({firebase: firebase})
      .then((result) => {
        dispatch({
          type: ReducerActions.FEED_LOG_FETCH_SUCCESS,
          payload: {value: result},
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({
          type: ReducerActions.GENERIC_ERROR,
          payload: error,
        });
      });
  }, []);
  /* ------------------------------------------
	// Tab-Handler
	// ------------------------------------------ */
  const handleTabChange = (
    event: React.ChangeEvent<Record<string, unknown>>,
    newValue: number
  ) => {
    setTabValue(newValue);
  };
  /* ------------------------------------------
  // User-Profil-PopUp-Handling
  // ------------------------------------------ */
  const onOpenDialog = async (feedLogUid: FeedLogEntry["uid"]) => {
    if (!feedLogUid) {
      return;
    }
    const logEntry = state.feedLog.find(
      (logEntry) => logEntry.uid === feedLogUid
    );
    if (!logEntry) {
      return;
    }
    // Prüfen ob wir dieses Dokument bereits gelesen haben.
    if (
      !Object.prototype.hasOwnProperty.call(state.feedDocuments, feedLogUid)
    ) {
      dispatch({
        type: ReducerActions.FEED_FETCH_INIT,
        payload: {},
      });
      await Feed.getFeed({
        firebase: firebase,
        feedUid: logEntry.uid,
      }).then((result) => {
        dispatch({
          type: ReducerActions.FEED_FETCH_SUCCESS,
          payload: result,
        });
        setDialogValues({
          selectedFeedDoc: result,
          logEntry: logEntry,
          open: true,
        });
      });
    } else {
      setDialogValues({
        selectedFeedDoc: state.feedDocuments[feedLogUid],
        logEntry: logEntry,
        open: true,
      });
    }
  };
  const onDialogClose = () => {
    setDialogValues({
      open: false,
      selectedFeedDoc: null,
      logEntry: null,
    });
  };

  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
  // Handling Dokumente löschen
  // ------------------------------------------ */
  const onDeleteFeedEntry = async () => {
    // gelöscht wird der Eintrag im Dialog

    if (!dialogValues.logEntry?.uid) {
      return;
    }

    const isConfirmed = await customDialog({
      dialogType: DialogType.Confirm,
      text: TEXT_SHOULD_FEED_ENTRY_BE_DELETED,
      title: `⚠️  ${TEXT_ATTENTION}`,
      buttonTextConfirm: TEXT_DELETE,
    });
    if (!isConfirmed) {
      return;
    }

    Feed.deleteFeed({firebase: firebase, feedUid: dialogValues.logEntry.uid})
      .then(() => {
        const newFeedDocuments = {...state.feedDocuments};
        delete newFeedDocuments[dialogValues.logEntry!.uid];
        dispatch({
          type: ReducerActions.FEED_DELETING_SUCCESS,
          payload: {
            feedLog: state.feedLog.filter(
              (logEntry) => logEntry.uid !== dialogValues.logEntry?.uid
            ),
            feedDocuments: newFeedDocuments,
            counter: 1,
          },
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
    setDialogValues({
      open: false,
      selectedFeedDoc: null,
      logEntry: null,
    });
  };
  const onDeleteFeedDocuments = (days: number) => {
    dispatch({type: ReducerActions.FEED_DELETING_INIT, payload: {}});

    Feed.deleteFeedsDaysOffset({
      firebase: firebase,
      daysOffset: days,
      authUser: authUser as AuthUser,
      callbackDone: async (noOfDeletedDocuments: number) => {
        await Feed.getFeedsLog({firebase}).then((result) => {
          // Neues Log holen (ohne die gelöschten)
          dispatch({
            type: ReducerActions.FEED_DELETING_SUCCESS,
            payload: {
              counter: noOfDeletedDocuments,
              feedLog: result,
              feedDocuments: state.feedDocuments,
            },
          });
        });
      },
    }).catch((error) => {
      console.error(error);
      dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
    });
  };
  /* ------------------------------------------
  // Snackbar
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
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
      {/*===== HEADER ===== */}
      <PageTitle title={`${TEXT_FEEDS} ${TEXT_MONITOR}`} />

      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="xl">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {state.error && (
          <AlertMessage
            error={state.error}
            severity="error"
            messageTitle={TEXT_ALERT_TITLE_UUPS}
          />
        )}

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
          style={{marginBottom: theme.spacing(2)}}
        >
          <Tab label={TEXT_OVERVIEW} />
          <Tab label={TEXT_DELETE} />
        </Tabs>
        {tabValue === TabValue.overview && (
          <FeedLogTable
            dbFeedLog={state.feedLog}
            onFeedLogSelect={onOpenDialog}
          />
        )}
        {tabValue === TabValue.delete && (
          <Container
            className={classes.container}
            component="main"
            maxWidth="sm"
          >
            <DeleteDocumentTriggerDocumentsPanel
              onDelete={onDeleteFeedDocuments}
              isDeleting={state.isDeleting}
            />
          </Container>
        )}
      </Container>
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={handleSnackbarClose}
      />
      {dialogValues.selectedFeedDoc !== null && (
        <DialogFeedEntry
          dialogOpen={dialogValues.open}
          handleClose={onDialogClose}
          onDeleteFeedEntry={onDeleteFeedEntry}
          logEntry={dialogValues.logEntry!}
          feed={dialogValues.selectedFeedDoc}
        />
      )}
    </React.Fragment>
  );
};
/* ===================================================================
// ========================= Clod-FX-Log Panel =======================
// =================================================================== */
interface FeedLogTableProps {
  dbFeedLog: FeedLogEntry[];
  onFeedLogSelect: (cloudFxLogUid: FeedLogEntry["uid"]) => void;
}

const FeedLogTable = ({dbFeedLog, onFeedLogSelect}: FeedLogTableProps) => {
  const [searchString, setSearchString] = React.useState("");
  const [feedLog, setFeedLog] = React.useState<FeedLogOverviewStructure[]>([]);

  const [filteredFeedLogUi, setFilteredFeedLogUi] = React.useState<
    FeedLogOverviewStructure[]
  >([]);
  const classes = useStyles();
  const theme = useTheme();

  const DATA_GRID_COLUMNS: GridColDef[] = [
    {
      field: "open",
      headerName: TEXT_OPEN,
      sortable: false,
      renderCell: (params) => {
        const onClick = () => {
          onFeedLogSelect(params.id as string);
        };

        return (
          <IconButton
            aria-label="open User"
            style={{margin: theme.spacing(1)}}
            size="small"
            onClick={onClick}
          >
            <OpenInNewIcon fontSize="inherit" />
          </IconButton>
        );
      },
    },
    {
      field: "uid",
      headerName: TEXT_UID,
      editable: false,
      width: 200,
      cellClassName: () => `super-app ${classes.typographyCode}`,
    },
    {
      field: "type",
      headerName: TEXT_TYPE,
      editable: false,
      width: 150,
    },
    {
      field: "createdDate",
      headerName: TEXT_DATE,
      editable: false,
      width: 200,
      valueFormatter: (params: GridValueFormatterParams) => {
        if (params.value && params.value instanceof Date) {
          return params.value.toLocaleString("de-CH", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } else {
          return "";
        }
      },
    },
    {
      field: "title",
      headerName: TEXT_TITLE,
      editable: false,
      width: 150,
    },
    {
      field: "visibility",
      headerName: TEXT_VISIBILITY,
      editable: false,
      width: 150,
    },
    {
      field: "createdFromDisplayName",
      headerName: TEXT_CREATED_FROM,
      editable: false,
      width: 150,
    },
  ];

  /* ------------------------------------------
  // Suche
  // ------------------------------------------ */
  const clearSearchString = () => {
    setSearchString("");
    setFilteredFeedLogUi(filterFeedLog(feedLog, ""));
  };
  const updateSearchString = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearchString(event.target.value);
    setFilteredFeedLogUi(filterFeedLog(feedLog, event.target.value as string));
  };
  /* ------------------------------------------
  // Filter-Logik
  // ------------------------------------------ */
  const filterFeedLog = (
    feedLog: FeedLogOverviewStructure[],
    searchString: string
  ) => {
    let filteredFeedLog: FeedLogOverviewStructure[] = [];
    if (searchString) {
      searchString = searchString.toLowerCase();
      filteredFeedLog = feedLog.filter(
        (logEntry) =>
          logEntry.uid!.toLocaleLowerCase().includes(searchString) ||
          logEntry.title.toLowerCase().includes(searchString) ||
          logEntry.type.toLowerCase().includes(searchString) ||
          logEntry.createdFromDisplayName
            .toLocaleLowerCase()
            .includes(searchString) ||
          logEntry.createdDate
            .toLocaleString("de-CH", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
            .includes(searchString)
      );
    } else {
      filteredFeedLog = feedLog;
    }
    return filteredFeedLog;
  };
  /* ------------------------------------------
  // Initiale Werte
  // ------------------------------------------ */
  if (
    (dbFeedLog.length > 0 && feedLog.length === 0) ||
    (dbFeedLog.length > 0 && dbFeedLog.length !== feedLog.length)
  ) {
    // Deep-Copy, damit der Cancel-Befehl wieder die DB-Daten zeigt,
    // werden die Daten hier für die Tabelle geklont.
    const feedLogUiStructure: FeedLogOverviewStructure[] = [];

    dbFeedLog.forEach((logEntry) =>
      feedLogUiStructure.push({
        uid: logEntry.uid,
        title: logEntry.title,
        text: logEntry.text,
        type: logEntry.type,
        visibility: logEntry.visibility,
        createdDate: logEntry.created.date,
        createdFromUid: logEntry.created.fromUid,
        createdFromDisplayName: logEntry.created.fromDisplayName,
      })
    );
    setFeedLog(feedLogUiStructure);
    setFilteredFeedLogUi(filterFeedLog(feedLogUiStructure, searchString));
  }

  if (!searchString && feedLog.length > 0 && filteredFeedLogUi.length === 0) {
    // Initialer Aufbau
    setFilteredFeedLogUi(filterFeedLog(feedLog, ""));
  }

  return (
    <Card
      className={classes.card}
      key={"requestTablePanel"}
      style={{marginBottom: "4em"}}
    >
      <CardContent className={classes.cardContent} key={"requestTableContent"}>
        <Grid container>
          <Grid item xs={12}>
            <SearchPanel
              searchString={searchString}
              onUpdateSearchString={updateSearchString}
              onClearSearchString={clearSearchString}
            />
            <Typography
              variant="body2"
              style={{marginTop: "0.5em", marginBottom: "2em"}}
            >
              {filteredFeedLogUi.length == feedLog.length
                ? `${feedLog.length} ${TEXT_FEEDS}`
                : `${filteredFeedLogUi.length} ${TEXT_FROM.toLowerCase()} ${
                    feedLog.length
                  } ${TEXT_FEEDS}`}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <div style={{display: "flex", height: "100%"}}>
              <div style={{flexGrow: 1}}>
                <DataGrid
                  autoHeight
                  rows={filteredFeedLogUi}
                  columns={DATA_GRID_COLUMNS}
                  getRowId={(row) => row.uid}
                  localeText={deDE.props.MuiDataGrid.localeText}
                  getRowClassName={(params) => {
                    if (params.row?.disabled) {
                      return `super-app ${classes.dataGridDisabled}`;
                    } else {
                      `super-app-theme`;
                    }
                  }}
                />
              </div>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

/* ===================================================================
// ========================= Dialog-Protokoll ========================
// =================================================================== */
interface DialogFeedEntryProps {
  dialogOpen: boolean;
  logEntry: FeedLogEntry;
  feed: Feed;
  handleClose: () => void;
  onDeleteFeedEntry: () => void;
}
const DialogFeedEntry = ({
  dialogOpen,
  feed,
  logEntry,
  handleClose,
  onDeleteFeedEntry,
}: DialogFeedEntryProps) => {
  const theme = useTheme();
  const classes = useStyles();
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialog feed"
      fullWidth={true}
      maxWidth="sm"
    >
      {feed.sourceObject.pictureSrc ? (
        <DialogTitle
          className={classes.dialogHeaderWithPicture}
          style={{
            backgroundImage: `url(${feed.sourceObject.pictureSrc})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          disableTypography
        >
          {logEntry.type}
        </DialogTitle>
      ) : (
        <DialogTitle>{logEntry.type}</DialogTitle>
      )}
      <DialogContent style={{overflow: "unset"}}>
        <List dense style={{marginBottom: theme.spacing(2)}}>
          {Object.entries(feed).map(([key, value]) => {
            switch (typeof value) {
              case "string":
              case "number":
              case "boolean":
                return (
                  <FormListItem
                    key={key}
                    id={key}
                    value={value.toString()}
                    label={key}
                    displayAsCode={key.toLocaleLowerCase().includes("uid")}
                  />
                );
            }
          })}
        </List>
        {Object.entries(feed).map(([key, value]) => {
          if (Array.isArray(value)) {
            return (
              <React.Fragment key={`fragment_${key}`}>
                <Typography>{key}</Typography>
                <List dense style={{marginBottom: theme.spacing(2)}}>
                  {value.map((value, counter) => (
                    <FormListItem
                      key={`${key}_${counter}`}
                      id={`${key}_${counter}`}
                      value={value.toString()}
                      label={key}
                    />
                  ))}
                </List>
              </React.Fragment>
            );
          } else if (typeof value === "object") {
            return (
              <React.Fragment key={`fragment_${key}`}>
                <Typography>{key}</Typography>
                <List dense style={{marginBottom: theme.spacing(2)}}>
                  {Object.entries(value).map(([key, value]) => (
                    <FormListItem
                      key={key}
                      id={key}
                      value={value.toString()}
                      label={key}
                      displayAsCode={key.toLocaleLowerCase().includes("uid")}
                    />
                  ))}
                </List>
              </React.Fragment>
            );
          }
        })}
      </DialogContent>
      <DialogActions>
        <Button
          className={classes.deleteButton}
          variant="outlined"
          onClick={onDeleteFeedEntry}
        >
          {TEXT_DELETE}
        </Button>
        <Button variant="outlined" color="primary" onClick={handleClose}>
          {TEXT_CLOSE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ===================================================================
// ================= Cloud-Fx-Trigger-Dokumente löschen ==============
// =================================================================== */
interface DeleteDocumentTriggerDocumentsPanelProps {
  isDeleting: boolean;
  onDelete: (days: number) => void;
}
const DeleteDocumentTriggerDocumentsPanel = ({
  isDeleting,
  onDelete,
}: DeleteDocumentTriggerDocumentsPanelProps) => {
  const classes = useStyles();
  const theme = useTheme();

  const [daysOffset, setDaysOffset] = React.useState(180);

  const onChangeDayOffset = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDaysOffset(parseInt(event.target.value));
  };

  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_DELETE_CLOUD_FX_TRIGGER_DOCS}
        </Typography>

        <TextField
          id={"daysOffset"}
          key={"daysOffset"}
          type="number"
          InputProps={{inputProps: {min: 100}}}
          label={TEXT_DELETE_CLOUD_FX_TRIGGER_DOCS_OLDER_THAN}
          name={"daysOffset"}
          required
          value={daysOffset}
          onChange={onChangeDayOffset}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
        {isDeleting && (
          <React.Fragment>
            <br />
            <LinearProgress style={{marginTop: theme.spacing(1)}} />
          </React.Fragment>
        )}
        <Button
          fullWidth
          disabled={!daysOffset}
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={() => onDelete(daysOffset)}
        >
          {`${TEXT_CLOUD_FX_TRIGGER_DOCS} ${TEXT_DELETE}`}
        </Button>
      </CardContent>
    </Card>
  );
};

const condition = (authUser: AuthUser | null) =>
  !!authUser && !!authUser.roles.includes(Role.communityLeader);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(OverviewFeedsPage);
