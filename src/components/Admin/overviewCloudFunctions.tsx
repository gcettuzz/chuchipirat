import React from "react";
import {compose} from "react-recompose";

import {
  MONITOR as TEXT_MONITOR,
  OVERVIEW as TEXT_OVERVIEW,
  DELETE as TEXT_DELETE,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  UID as TEXT_UID,
  NAME as TEXT_NAME,
  FIRSTNAME as TEXT_FIRSTNAME,
  LASTNAME as TEXT_LASTNAME,
  EMAIL as TEXT_EMAIL,
  DATE as TEXT_DATE,
  CLOUD_FX as TEXT_CLOUD_FX,
  DELETE_CLOUD_FX_TRIGGER_DOCS as TEXT_DELETE_CLOUD_FX_TRIGGER_DOCS,
  DELETE_CLOUD_FX_TRIGGER_DOCS_OLDER_THAN as TEXT_DELETE_CLOUD_FX_TRIGGER_DOCS_OLDER_THAN,
  CLOUD_FX_TRIGGER_DOCS as TEXT_CLOUD_FX_TRIGGER_DOCS,
  FROM as TEXT_FROM,
  OPEN as TEXT_OPEN,
  INVOKED as TEXT_INVOKED,
  CLOUD_FX_TRIGGER_DOCS_DELETED as TEXT_CLOUD_FX_TRIGGER_DOCS_DELETED,
  PROCESSED_DOCUMENTS as TEXT_PROCESSED_DOCUMENTS,
} from "../../constants/text";

import {OpenInNew as OpenInNewIcon} from "@mui/icons-material";

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
} from "@mui/material";
import AlertMessage from "../Shared/AlertMessage";
import SearchPanel from "../Shared/searchPanel";

import {FormListItem} from "../Shared/formListItem";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";
import {CustomRouterProps} from "../Shared/global.interface";
import {
  DataGrid,
  GridColDef,
  GridValueFormatterParams,
  deDE,
} from "@mui/x-data-grid";
import CloudFx, {CloudFxLogEntry} from "./cloudFx.class";
import {CloudFunctionType} from "../Firebase/Db/firebase.db.cloudfunction.super.class";
import UserPublicProfile from "../User/user.public.profile.class";
import User from "../User/user.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  CLOUD_FX_LOG_FETCH_INIT,
  CLOUD_FX_LOG_FETCH_SUCCESS,
  CLOUD_FX_FETCH_INIT,
  CLOUD_FX_FETCH_SUCCESS,
  CLOUD_FX_DELETING_INIT,
  CLOUD_FX_DELETING_SUCCESS,
  SNACKBAR_SET,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}

enum TabValue {
  overview,
  delete,
}

interface CloudFxLogOverviewStructure {
  uid: CloudFx["uid"];
  cloudFunctionType: CloudFunctionType;
  date: Date;
  displayName: UserPublicProfile["displayName"];
  processedDocuments: number;
  email: User["email"];
  firstName: User["firstName"];
  lastName: User["lastName"];
  userUid: User["uid"];
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  cloudFxLog: CloudFxLogEntry[];
  cloudFxTriggerDocument: {[key: CloudFx["uid"]]: CloudFx};
  error: Error | null;
  isLoading: boolean;
  isDeleting: boolean;
  snackbar: Snackbar;
};

const inititialState: State = {
  cloudFxLog: [],
  cloudFxTriggerDocument: {},
  error: null,
  isLoading: false,
  isDeleting: false,
  snackbar: SNACKBAR_INITIAL_STATE_VALUES,
};

const cloudFxReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.CLOUD_FX_LOG_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.CLOUD_FX_LOG_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        cloudFxLog: action.payload.value as CloudFxLogEntry[],
      };
    case ReducerActions.CLOUD_FX_FETCH_INIT:
      return {...state, isLoading: true};
    case ReducerActions.CLOUD_FX_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        cloudFxTriggerDocument: {
          ...state.cloudFxTriggerDocument,
          [action.payload.uid]: action.payload,
        },
      };
    case ReducerActions.CLOUD_FX_DELETING_INIT:
      return {...state, isDeleting: true};
    case ReducerActions.CLOUD_FX_DELETING_SUCCESS:
      return {
        ...state,
        cloudFxLog: action.payload.cloudFxLog,
        isDeleting: false,
        snackbar: {
          severity: "success",
          message: `${action.payload.counter} ${TEXT_CLOUD_FX_TRIGGER_DOCS_DELETED}`,
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
const OverviewCloudFxPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <OverviewCloudFxBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
interface OverviewCloudFxBaseProps {
  selectedCloudFxTriggerDoc: null | CloudFx;
  logEntry: CloudFxLogEntry | null;
  open: boolean;
}
const OverviewCloudFxBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const theme = useTheme();

  const [state, dispatch] = React.useReducer(cloudFxReducer, inititialState);
  const [tabValue, setTabValue] = React.useState(TabValue.overview);
  const [dialogValues, setDialogValues] =
    React.useState<OverviewCloudFxBaseProps>({
      selectedCloudFxTriggerDoc: null,
      logEntry: null,
      open: false,
    });
  /* ------------------------------------------
	// Daten aus DB holen
	// ------------------------------------------ */
  React.useEffect(() => {
    dispatch({
      type: ReducerActions.CLOUD_FX_LOG_FETCH_INIT,
      payload: {},
    });

    CloudFx.getCloudFxLog({firebase: firebase})
      .then((result) => {
        dispatch({
          type: ReducerActions.CLOUD_FX_LOG_FETCH_SUCCESS,
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
  const onOpenDialog = async (cloudFxLogUid: CloudFxLogEntry["uid"]) => {
    if (!cloudFxLogUid) {
      return;
    }
    const logEntry = state.cloudFxLog.find(
      (logEntry) => logEntry.uid === cloudFxLogUid
    );

    if (!logEntry) {
      return;
    }

    //   // Prüfen ob wir dieses Dokument bereits gelesen haben.
    if (
      !Object.prototype.hasOwnProperty.call(
        state.cloudFxTriggerDocument,
        cloudFxLogUid
      )
    ) {
      dispatch({
        type: ReducerActions.CLOUD_FX_FETCH_INIT,
        payload: {},
      });
      await CloudFx.getCloudFunctionTriggerFile({
        firebase: firebase,
        cloudFunctionType: logEntry.cloudFunctionType,
        triggerFileUid: cloudFxLogUid,
      }).then((result) => {
        dispatch({
          type: ReducerActions.CLOUD_FX_FETCH_SUCCESS,
          payload: result,
        });
        setDialogValues({
          selectedCloudFxTriggerDoc: result,
          logEntry: logEntry,
          open: true,
        });
      });
    } else {
      setDialogValues({
        selectedCloudFxTriggerDoc: state.cloudFxTriggerDocument[cloudFxLogUid],
        logEntry: logEntry,
        open: true,
      });
    }
  };
  const onDialogClose = () => {
    setDialogValues({
      open: false,
      selectedCloudFxTriggerDoc: null,
      logEntry: null,
    });
  };

  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
  // Handling Dokumente löschen
  // ------------------------------------------ */
  const onDeleteCloudFxTriggerDocuments = (days: number) => {
    dispatch({type: ReducerActions.CLOUD_FX_DELETING_INIT, payload: {}});

    CloudFx.deleteCloudFxTriggerDocuments({
      firebase: firebase,
      authUser: authUser,
      dayOffset: days,
      cloudFxLog: state.cloudFxLog,
    }).then((result) => {
      dispatch({
        type: ReducerActions.CLOUD_FX_DELETING_SUCCESS,
        payload: {counter: result.counter, cloudFxLog: result.cloudFxLog},
      });
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
      <PageTitle title={`${TEXT_CLOUD_FX} ${TEXT_MONITOR}`} />

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
          <CloudFxTable
            dbClodFxLog={state.cloudFxLog}
            onCloudFxLogSelect={onOpenDialog}
          />
        )}
        {tabValue === TabValue.delete && (
          <Container
            className={classes.container}
            component="main"
            maxWidth="sm"
          >
            <DeleteDocumentTriggerDocumentsPanel
              onDelete={onDeleteCloudFxTriggerDocuments}
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
      {dialogValues.selectedCloudFxTriggerDoc !== null && (
        <DialogCloudFxTriggerDocument
          dialogOpen={dialogValues.open}
          handleClose={onDialogClose}
          logEntry={dialogValues.logEntry!}
          cloudFxTrigger={dialogValues.selectedCloudFxTriggerDoc}
        />
      )}
    </React.Fragment>
  );
};
/* ===================================================================
// ========================= Clod-FX-Log Panel =======================
// =================================================================== */
interface CloudFxTableProps {
  dbClodFxLog: CloudFxLogEntry[];
  onCloudFxLogSelect: (cloudFxLogUid: CloudFxLogEntry["uid"]) => void;
}

const CloudFxTable = ({dbClodFxLog, onCloudFxLogSelect}: CloudFxTableProps) => {
  const [searchString, setSearchString] = React.useState("");
  const [cloudFxLog, setCloudFxLog] = React.useState<
    CloudFxLogOverviewStructure[]
  >([]);

  const [filteredCloudFxlogUi, setFilteredCloudFxlogUi] = React.useState<
    CloudFxLogOverviewStructure[]
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
          onCloudFxLogSelect(params.id as string);
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
      field: "cloudFunctionType",
      headerName: TEXT_CLOUD_FX,
      editable: false,
      width: 250,
    },
    {
      field: "date",
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
      field: "processedDocuments",
      headerName: TEXT_PROCESSED_DOCUMENTS,
      editable: false,
      width: 150,
    },
    {
      field: "displayName",
      headerName: `${TEXT_INVOKED}: ${TEXT_NAME}`,
      editable: false,
      width: 250,
    },
    {
      field: "firstName",
      headerName: `${TEXT_INVOKED}: ${TEXT_FIRSTNAME}`,
      editable: false,
      hide: true,
      width: 250,
    },
    {
      field: "lastName",
      headerName: `${TEXT_INVOKED}: ${TEXT_LASTNAME}`,
      editable: false,
      hide: true,
      width: 250,
    },
    {
      field: "email",
      headerName: `${TEXT_INVOKED}: ${TEXT_EMAIL}`,
      editable: false,
      hide: true,
      width: 250,
    },
    {
      field: "userUid",
      headerName: `${TEXT_INVOKED}: ${TEXT_UID}`,
      editable: false,
      hide: true,
      width: 275,
      cellClassName: () => `super-app ${classes.typographyCode}`,
    },
  ];

  /* ------------------------------------------
  // Suche
  // ------------------------------------------ */
  const clearSearchString = () => {
    setSearchString("");
    setFilteredCloudFxlogUi(filterCloudFxLog(cloudFxLog, ""));
  };
  const updateSearchString = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearchString(event.target.value);
    setFilteredCloudFxlogUi(
      filterCloudFxLog(cloudFxLog, event.target.value as string)
    );
  };
  /* ------------------------------------------
  // Filter-Logik
  // ------------------------------------------ */
  const filterCloudFxLog = (
    cloudFxLog: CloudFxLogOverviewStructure[],
    searchString: string
  ) => {
    let filteredCloudFxLog: CloudFxLogOverviewStructure[] = [];
    if (searchString) {
      searchString = searchString.toLowerCase();
      filteredCloudFxLog = cloudFxLog.filter(
        (logEntry) =>
          logEntry.uid!.toLocaleLowerCase().includes(searchString) ||
          logEntry.cloudFunctionType.toLowerCase().includes(searchString) ||
          logEntry.displayName.toLowerCase().includes(searchString)
      );
    } else {
      filteredCloudFxLog = cloudFxLog;
    }
    return filteredCloudFxLog;
  };
  /* ------------------------------------------
  // Initiale Werte
  // ------------------------------------------ */
  if (dbClodFxLog.length > 0 && cloudFxLog.length === 0) {
    // Deep-Copy, damit der Cancel-Befehl wieder die DB-Daten zeigt,
    // werden die Daten hier für die Tabelle geklont.
    const cloudFxLogUiStructure: CloudFxLogOverviewStructure[] = [];

    dbClodFxLog.forEach((logEntry) =>
      cloudFxLogUiStructure.push({
        cloudFunctionType: logEntry.cloudFunctionType,
        uid: logEntry.uid,
        date: logEntry.date,
        displayName: logEntry.invokedBy.displayName,
        email: logEntry.invokedBy.email,
        firstName: logEntry.invokedBy.firstName,
        lastName: logEntry.invokedBy.lastName,
        userUid: logEntry.invokedBy.uid,
        processedDocuments: logEntry.processedDocuments,
      })
    );
    setCloudFxLog(cloudFxLogUiStructure);
  }

  if (
    !searchString &&
    cloudFxLog.length > 0 &&
    filteredCloudFxlogUi.length === 0
  ) {
    // Initialer Aufbau
    setFilteredCloudFxlogUi(filterCloudFxLog(cloudFxLog, ""));
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
              {filteredCloudFxlogUi.length == cloudFxLog.length
                ? `${cloudFxLog.length} ${TEXT_CLOUD_FX_TRIGGER_DOCS}`
                : `${filteredCloudFxlogUi.length} ${TEXT_FROM.toLowerCase()} ${
                    cloudFxLog.length
                  } ${TEXT_CLOUD_FX_TRIGGER_DOCS}`}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <div style={{display: "flex", height: "100%"}}>
              <div style={{flexGrow: 1}}>
                <DataGrid
                  autoHeight
                  rows={filteredCloudFxlogUi}
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
interface DialogCloudFxTriggerDocumentProps {
  dialogOpen: boolean;
  logEntry: CloudFxLogEntry;
  cloudFxTrigger: CloudFx;
  handleClose: () => void;
}
const DialogCloudFxTriggerDocument = ({
  dialogOpen,
  cloudFxTrigger,
  logEntry,
  handleClose,
}: DialogCloudFxTriggerDocumentProps) => {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialog cloudFxTrigger"
      fullWidth={true}
      maxWidth="sm"
    >
      {cloudFxTrigger?.["templateData"]?.["headerPictureSrc"] ? (
        <DialogTitle
          className={classes.dialogHeaderWithPicture}
          style={{
            backgroundImage: `url(${cloudFxTrigger?.["templateData"]?.["headerPictureSrc"]})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          disableTypography
        >
          {logEntry.cloudFunctionType}
        </DialogTitle>
      ) : (
        <DialogTitle>{logEntry.cloudFunctionType}</DialogTitle>
      )}
      <DialogContent style={{overflow: "unset"}}>
        <List dense style={{marginBottom: theme.spacing(2)}}>
          {Object.entries(cloudFxTrigger).map(([key, value]) => {
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
        {Object.entries(cloudFxTrigger).map(([key, value]) => {
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
  !!authUser && !!authUser.roles.includes(Role.admin);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(OverviewCloudFxPage);
