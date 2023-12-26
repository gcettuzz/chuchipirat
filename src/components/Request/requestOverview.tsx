import React from "react";
import {compose} from "recompose";
import {useHistory} from "react-router";

import Container from "@material-ui/core/Container";

import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import Grid from "@material-ui/core/Grid";

// import IconButton from "@material-ui/core/IconButton";

import Card from "@material-ui/core/Card";
// import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Chip from "@material-ui/core/Chip";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

import * as TEXT from "../../constants/text";
// import * as ROUTES from "../../constants/routes";

import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";

import Request, {
  RequestStatus,
  RequestAuthor,
  RequestAssignee,
  ChangeLog,
  RequestType,
  RequestTransition,
  Comment,
} from "./request.class";

import {Snackbar} from "../Shared/customSnackbar";
import AlertMessage from "../Shared/AlertMessage";
import EnhancedTable, {
  TableColumnTypes,
  ColumnTextAlign,
} from "../Shared/enhancedTable";

import Firebase, {withFirebase} from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";

import {ValueObject} from "../Firebase/Db/firebase.db.super.class";

import {TextField, Typography} from "@material-ui/core";
import DialogRequest from "./dialogRequest";
import SearchPanel from "../Shared/searchPanel";
import {request} from "https";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {
  NavigationValuesContext,
  NavigationObject,
} from "../Navigation/navigationContext";
import Action from "../../constants/actions";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  FETCH_INIT = "FETCH_INIT",
  FETCH_SUCCESS = "FETCH_SUCCESS",
  FETCH_CLOSED_REQUESTS = "FETCH_CLOSED_REQUESTS",
  UPDATE_REQUEST_SELECTION = "UPDATE_REQUEST_SELECTION",
  SNACKBAR_CLOSE = "SNACKBAR_CLOSE",
  GENERIC_ERROR = "GENERIC_ERROR",
  UPDATE_SINGLE_REQUEST = "UPDATE_SINGLE_REQUEST",
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  requests: Request[];
  activeRequests: Request[];
  closedRequests: Request[];
  isLoading: boolean;
  snackbar: Snackbar;
  isError: boolean;
  closedRequestsFetched: boolean;
  error: object;
};

const inititialState: State = {
  requests: [],
  activeRequests: [],
  closedRequests: [],
  isLoading: false,
  snackbar: {} as Snackbar,
  isError: false,
  closedRequestsFetched: false,
  error: {},
};

interface RequestTableProps {
  requests: Request[];
  onClick: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    name: string
  ) => void;
  isLoading: State["isLoading"];
  requestStateFilter: RequestStateFilter;
  handleStateFilterChange: (
    event: React.MouseEvent<HTMLElement>,
    newStateFilter: string
  ) => void;
}
// Interface für die Anzeige im UI
interface RequestUi {
  uid: string;
  number: number;
  status: JSX.Element;
  author: RequestAuthor;
  assignee: RequestAssignee;
  comments: Comment[];
  changeLog: ChangeLog[];
  createDate: Date;
  resolveDate: Date;
  requestObject: ValueObject;
  requestType: RequestType;
  transitions: RequestTransition[];
}

enum RequestStateFilter {
  Active = "active",
  All = "all",
}

interface StatusChipsProps {
  status: RequestStatus;
}

const requestReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.FETCH_INIT:
      // Daten werden geladen
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        requests: action.payload as Request[],
        activeRequests: action.payload as Request[],
      };
    case ReducerActions.FETCH_CLOSED_REQUESTS:
      return {
        ...state,
        isLoading: false,
        closedRequestsFetched: true,
        requests: [...state.activeRequests, ...(action.payload as Request[])],
        closedRequests: action.payload as Request[],
      };
    case ReducerActions.UPDATE_REQUEST_SELECTION:
      let tempRequests: Request[] = [];
      action.payload.newStateFilter == RequestStateFilter.All
        ? (tempRequests = [...state.activeRequests, ...state.closedRequests])
        : (tempRequests = state.activeRequests);
      return {
        ...state,
        requests: tempRequests,
      };
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
    case ReducerActions.UPDATE_SINGLE_REQUEST:
      // Einzelner Request anpassen
      let tmpRequests = state.requests;
      let request = tmpRequests.find(
        (request) => request.uid == action.payload.uid
      );
      request = action.payload as Request;

      return {
        ...state,
        requests: tmpRequests,
      };
    case ReducerActions.GENERIC_ERROR:
      // allgemeiner Fehler
      return {
        ...state,
        isError: true,
        error: action.payload,
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
const RequestOverviewPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <RequestOverviewBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const RequestOverviewBase = ({props, authUser}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const {push} = useHistory();
  const navigationValuesContext = React.useContext(NavigationValuesContext);

  const [state, dispatch] = React.useReducer(requestReducer, inititialState);
  const [requestStateFilter, setRequestStateFilter] = React.useState(
    RequestStateFilter.Active
  );

  const [requestPopupValues, setRequestPopupValues] = React.useState({
    selectedRequest: {} as Request,
    open: false,
  });
  /* ------------------------------------------
  // Navigation-Handler
  // ------------------------------------------ */
  React.useEffect(() => {
    navigationValuesContext?.setNavigationValues({
      action: Action.NONE,
      object: NavigationObject.none,
    });
  }, []);

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatch({type: ReducerActions.FETCH_INIT, payload: {}});

    Request.getAllActiveRequests({firebase: firebase, authUser: authUser})
      .then((result) => {
        dispatch({type: ReducerActions.FETCH_SUCCESS, payload: result});
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  }, []);

  /* ------------------------------------------
  // PopUp öffnen
  // ------------------------------------------ */
  const onRowClick = (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    requestNumber: string
  ) => {
    setRequestPopupValues({
      ...requestPopupValues,
      selectedRequest: state.requests.find(
        (request) => request.number == parseInt(requestNumber)
      ) as Request,
      open: true,
    });
  };

  /* ------------------------------------------
  // PopUp schliessen
  // ------------------------------------------ */
  const onPopUpClose = () => {
    setRequestPopupValues({...requestPopupValues, open: false});
  };
  /* ------------------------------------------
  // Status anpassen
  // ------------------------------------------ */
  const onUpdateStatus = (nextStatus: RequestStatus) => {
    Request.updateStatus({
      firebase: firebase,
      request: requestPopupValues.selectedRequest,
      nextStatus: nextStatus,
      authUser: authUser,
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.UPDATE_SINGLE_REQUEST,
          payload: result,
        });
        setRequestPopupValues({
          ...requestPopupValues,
          selectedRequest: result,
        });
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  /* ------------------------------------------
  // Request mir zuweisen
  // ------------------------------------------ */
  const onAssignToMe = () => {
    Request.assignToMe({
      request: requestPopupValues.selectedRequest,
      firebase: firebase,
      authUser: authUser,
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.UPDATE_SINGLE_REQUEST,
          payload: result,
        });
        setRequestPopupValues({
          ...requestPopupValues,
          selectedRequest: result,
        });
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  /* ------------------------------------------
  // Neuer Kommentar hinzufügen
  // ------------------------------------------ */
  const onAddComment = (newComment: string) => {
    Request.addComment({
      request: requestPopupValues.selectedRequest,
      comment: newComment,
      firebase: firebase,
      authUser: authUser,
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.UPDATE_SINGLE_REQUEST,
          payload: result,
        });
        setRequestPopupValues({
          ...requestPopupValues,
          selectedRequest: result,
        });
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  /* ------------------------------------------
  // Filter der Requests nach Status
  // ------------------------------------------ */
  const onStateFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newStateFilter: string
  ) => {
    if (
      state.closedRequestsFetched == false &&
      newStateFilter == RequestStateFilter.All
    ) {
      dispatch({type: ReducerActions.FETCH_INIT, payload: {}});
      // die geschlossenen Anträge holen
      console.info("los");
      Request.getAllClosedRequests({firebase: firebase, authUser: authUser})
        .then((result) => {
          dispatch({
            type: ReducerActions.FETCH_CLOSED_REQUESTS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
    } else {
      // state.requests mit den richtigen Informationen füllen.
      dispatch({
        type: ReducerActions.UPDATE_REQUEST_SELECTION,
        payload: {newStateFilter: newStateFilter},
      });
    }

    setRequestStateFilter(newStateFilter as RequestStateFilter);
  };
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT.PAGE_TITLE_REQUEST_OVERVIEW} />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {state.isError && (
          <AlertMessage
            error={state.error}
            severity="error"
            messageTitle={TEXT.ALERT_TITLE_UUPS}
          />
        )}

        <Grid item key={"RequestOverviewPanel"} xs={12}>
          <RequestTable
            requests={state.requests}
            onClick={onRowClick}
            isLoading={state.isLoading}
            requestStateFilter={requestStateFilter}
            handleStateFilterChange={onStateFilterChange}
          />
        </Grid>
      </Container>
      <DialogRequest
        request={requestPopupValues.selectedRequest}
        dialogOpen={requestPopupValues.open}
        authUser={authUser}
        handleClose={onPopUpClose}
        handleUpdateStatus={onUpdateStatus}
        handleAssignToMe={onAssignToMe}
        handleAddComment={onAddComment}
      />
    </React.Fragment>
  );
};

/* ===================================================================
// =========================== Produkte Panel ========================
// =================================================================== */

const RequestTable = ({
  requests,
  onClick,
  isLoading,
  requestStateFilter,
  handleStateFilterChange,
}: RequestTableProps) => {
  const TABLE_COLUMS = [
    {
      id: "uid",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT.COLUMN_UID,
      visible: false,
    },
    {
      id: "number",
      type: TableColumnTypes.number,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT.COLUMN_NUMBER,
      visible: true,
    },
    {
      id: "requestObject.name",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT.FIELD_NAME,
      visible: true,
    },
    {
      id: "status",
      type: TableColumnTypes.JSX,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT.REQUEST_STATUS,
      visible: true,
    },
    {
      id: "createDate",
      type: TableColumnTypes.date,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT.REQUEST_CREATION_DATE,
      visible: true,
    },
    {
      id: "assignee.displayName",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT.REQUEST_ASSIGNEE_DISPLAYNAME,
      visible: true,
    },
  ];
  const classes = useStyles();

  const [searchString, setSearchString] = React.useState("");
  const [requestsUi, setRequestsUi] = React.useState<RequestUi[]>([]);

  /* ------------------------------------------
  // Such-String löschen
  // ------------------------------------------ */
  const clearSearchString = () => {
    setSearchString("");
  };
  /* ------------------------------------------
  // Such-String löschen
  // ------------------------------------------ */
  const updateSearchString = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearchString(event.target.value);
    setRequestsUi(createRequestsForUi(requests, event.target.value));
  };
  /* ------------------------------------------
  // Tabelleninhalt für UI anpassen
  // ------------------------------------------ */
  const createRequestsForUi = (requests: Request[], searchString) => {
    let filteredRequests: Request[] = [];
    if (searchString) {
      searchString = searchString.toLowerCase();

      filteredRequests = requests.filter(
        (request) =>
          request.number.toString().includes(searchString) ||
          request.requestObject.name.toLowerCase().includes(searchString) ||
          request.assignee.displayName.toLowerCase().includes(searchString)
      );
    } else {
      filteredRequests = requests;
    }

    let requestui = filteredRequests.map((request) => {
      return {
        ...request,
        status: <StatusChips status={request.status} />,
      };
    });
    return requestui;
  };

  if (!searchString && requests.length > 0 && requestsUi.length === 0) {
    // Initialer Aufbau
    setRequestsUi(createRequestsForUi(requests, searchString));
  } else if (
    !searchString &&
    requests.length > 0 &&
    requests.length !== requestsUi.length
  ) {
    // Neues dazugekommen
    setRequestsUi(createRequestsForUi(requests, searchString));
  }

  return (
    <Card className={classes.card} key={"requestTablePanel"}>
      <CardContent className={classes.cardContent} key={"requestTableContent"}>
        <Grid container>
          <Grid item xs={12} style={{marginBottom: "2ex"}}>
            <SearchPanel
              searchString={searchString}
              onUpdateSearchString={updateSearchString}
              onClearSearchString={clearSearchString}
            />
          </Grid>
          <Grid item xs={12} style={{marginBottom: "2ex"}}>
            <ToggleButtonGroup
              value={requestStateFilter}
              exclusive
              onChange={handleStateFilterChange}
              aria-label="text alignment"
              size="small"
            >
              <ToggleButton
                value={RequestStateFilter.Active}
                aria-label="left aligned"
              >
                {TEXT.ACTIVE_REQUESTS}
              </ToggleButton>
              <ToggleButton
                value={RequestStateFilter.All}
                aria-label="centered"
              >
                {TEXT.ALL_REQUESTS}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid>
            <EnhancedTable
              tableData={requestsUi}
              tableColumns={TABLE_COLUMS}
              keyColum={"number"}
              onRowClick={onClick}
              onIconClick={() => {}}
            />
            {requestsUi.length == 0 && isLoading == false && !searchString && (
              <Typography
                variant="subtitle1"
                align="center"
                style={{marginTop: "2ex"}}
              >
                {TEXT.NO_OPEN_REQUESTS_FOUND}
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const condition = (authUser: AuthUser) => !!authUser;

// ===================================================================== */
/**
 * Status-Chip
 * @param status - Status, für den der Style ermittelt werden soll.
 */
export const StatusChips = ({status}: StatusChipsProps) => {
  const classes = useStyles();

  return (
    <Chip
      label={Request.translateStatus(status)}
      className={
        status == RequestStatus.done
          ? classes.workflowChipDone
          : status == RequestStatus.declined
          ? classes.workflowChipAborted
          : classes.workflowChipActive
      }
      size="small"
    />
  );
};

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(RequestOverviewPage);
