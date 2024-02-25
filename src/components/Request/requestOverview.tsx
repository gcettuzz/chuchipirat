import React from "react";
import {compose} from "react-recompose";

import {
  Container,
  Backdrop,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@material-ui/core";

import {ToggleButton, ToggleButtonGroup} from "@material-ui/lab";

import {
  REQUESTS as TEXT_REQUESTS,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  UID as TEXT_UID,
  NUMBER as TEXT_NUMBER,
  REQUEST_STATUS as TEXT_REQUEST_STATUS,
  NAME as TEXT_NAME,
  REQUEST_CREATION_DATE as TEXT_REQUEST_CREATION_DATE,
  REQUEST_ASSIGNEE_DISPLAYNAME as TEXT_REQUEST_ASSIGNEE_DISPLAYNAME,
  ACTIVE_REQUESTS as TEXT_ACTIVE_REQUESTS,
  ALL_REQUESTS as TEXT_ALL_REQUESTS,
  NO_OPEN_REQUESTS_FOUND as TEXT_NO_OPEN_REQUESTS_FOUND,
} from "../../constants/text";

import useStyles from "../../constants/styles";
import PageTitle from "../Shared/pageTitle";

import {Request} from "./internal";

import {Snackbar} from "../Shared/customSnackbar";
import AlertMessage from "../Shared/AlertMessage";
import EnhancedTable, {
  TableColumnTypes,
  ColumnTextAlign,
} from "../Shared/enhancedTable";

import DialogRequest from "./dialogRequest";
import SearchPanel from "../Shared/searchPanel";
import {
  NavigationValuesContext,
  NavigationObject,
} from "../Navigation/navigationContext";
import Action from "../../constants/actions";
import withEmailVerification from "../Session/withEmailVerification";
import {withFirebase} from "../Firebase/firebaseContext";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../Shared/global.interface";
import {
  RECIPE_DRAWER_DATA_INITIAL_VALUES,
  RecipeDrawer,
  RecipeDrawerData,
} from "../Event/Menuplan/menuplan";
import EventGroupConfiguration from "../Event/GroupConfiguration/groupConfiguration.class";
import Recipe, {RecipeType, Recipes} from "../Recipe/recipe.class";
import {RequestStatus, RequestType} from "./request.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  FETCH_INIT,
  FETCH_SUCCESS,
  FETCH_CLOSED_REQUESTS,
  FETCH_RECIPE_INIT,
  FETCH_RECIPE_SUCCESS,
  UPDATE_REQUEST_SELECTION,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
  UPDATE_SINGLE_REQUEST,
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  requests: Request[];
  recipes: Recipes;
  activeRequests: Request[];
  closedRequests: Request[];
  isLoading: boolean;
  snackbar: Snackbar;
  closedRequestsFetched: boolean;
  error: Error | null;
};

const inititialState: State = {
  requests: [],
  recipes: {},
  activeRequests: [],
  closedRequests: [],
  isLoading: false,
  snackbar: {} as Snackbar,
  closedRequestsFetched: false,
  error: null,
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
  author: Request["author"];
  assignee: Request["assignee"];
  comments: Request["comments"];
  changeLog: Request["changeLog"];
  createDate: Request["createDate"];
  resolveDate: Request["resolveDate"];
  requestObject: Request["requestObject"];
  requestType: Request["requestType"];
  transitions: Request["transitions"];
}

enum RequestStateFilter {
  Active = "active",
  All = "all",
}

interface StatusChipsProps {
  status: RequestStatus;
}

const requestReducer = (state: State, action: DispatchAction): State => {
  let tmpRequests: Request[] = [];
  let index: number;
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
      action.payload.newStateFilter == RequestStateFilter.All
        ? (tmpRequests = [...state.activeRequests, ...state.closedRequests])
        : (tmpRequests = state.activeRequests);
      return {
        ...state,
        requests: tmpRequests,
      };
    case ReducerActions.FETCH_RECIPE_INIT:
      return {...state, isLoading: true};
    case ReducerActions.FETCH_RECIPE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        recipes: {...state.recipes, [action.payload.uid]: action.payload},
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
      tmpRequests = state.requests;
      index = tmpRequests.findIndex(
        (request) => request.uid === action.payload.uid
      );
      if (index !== -1) {
        tmpRequests[index] = action.payload as Request;
      }
      return {
        ...state,
        requests: tmpRequests,
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
const RequestOverviewPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <RequestOverviewBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const RequestOverviewBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const navigationValuesContext = React.useContext(NavigationValuesContext);

  const [state, dispatch] = React.useReducer(requestReducer, inititialState);
  const [requestStateFilter, setRequestStateFilter] = React.useState(
    RequestStateFilter.Active
  );

  const [requestPopupValues, setRequestPopupValues] = React.useState({
    selectedRequest: {} as Request,
    open: false,
  });
  const [recipeDrawerData, setRecipeDrawerData] =
    React.useState<RecipeDrawerData>(RECIPE_DRAWER_DATA_INITIAL_VALUES);

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
    if (!authUser) {
      return;
    }
    dispatch({type: ReducerActions.FETCH_INIT, payload: {}});

    Request.getActiveRequests({firebase: firebase, authUser: authUser})
      .then((result) => {
        dispatch({type: ReducerActions.FETCH_SUCCESS, payload: result});
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  }, [authUser]);
  if (!authUser) {
    return null;
  }

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
      Request.getClosedRequests({firebase: firebase, authUser: authUser})
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
  /* ------------------------------------------
  // Recipe-Drawer-Handling
  // ------------------------------------------ */
  const onRecipeDrawerOpen = async (recipeUid: string) => {
    let recipe = new Recipe();

    if (Object.prototype.hasOwnProperty.call(state.recipes, recipeUid)) {
      recipe = state.recipes[recipeUid];
    } else {
      // Rezept muss noch geholt werden
      dispatch({type: ReducerActions.FETCH_RECIPE_INIT, payload: {}});
      await Recipe.getRecipe({
        firebase: firebase,
        uid: recipeUid,
        authUser: authUser,
        userUid: authUser.uid,
        type:
          requestPopupValues.selectedRequest.requestType ===
          RequestType.recipePublish
            ? RecipeType.private
            : RecipeType.public,
      }).then((result) => {
        dispatch({type: ReducerActions.FETCH_RECIPE_SUCCESS, payload: result});
        recipe = result;
      });
    }

    setRecipeDrawerData({
      ...recipeDrawerData,
      recipe: recipe,
      open: true,
    });
  };
  const onRecipeDrawerClose = () => {
    setRecipeDrawerData({...recipeDrawerData, open: false});
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_REQUESTS} />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
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
        handleRecipeOpen={onRecipeDrawerOpen}
      />
      <RecipeDrawer
        drawerSettings={recipeDrawerData}
        recipe={recipeDrawerData.recipe}
        mealPlan={recipeDrawerData.mealPlan}
        groupConfiguration={{} as EventGroupConfiguration}
        scaledPortions={recipeDrawerData.scaledPortions}
        editMode={false}
        disableFunctionality={true}
        firebase={firebase}
        authUser={authUser}
        onClose={onRecipeDrawerClose}
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
      label: TEXT_UID,
      visible: false,
    },
    {
      id: "number",
      type: TableColumnTypes.number,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT_NUMBER,
      visible: true,
    },
    {
      id: "requestObject.name",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT_NAME,
      visible: true,
    },
    {
      id: "status",
      type: TableColumnTypes.JSX,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT_REQUEST_STATUS,
      visible: true,
    },
    {
      id: "createDate",
      type: TableColumnTypes.date,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT_REQUEST_CREATION_DATE,
      visible: true,
    },
    {
      id: "assignee.displayName",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT_REQUEST_ASSIGNEE_DISPLAYNAME,
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

    const requestui = filteredRequests.map((request) => {
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
                {TEXT_ACTIVE_REQUESTS}
              </ToggleButton>
              <ToggleButton
                value={RequestStateFilter.All}
                aria-label="centered"
              >
                {TEXT_ALL_REQUESTS}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid>
            <EnhancedTable
              tableData={requestsUi}
              tableColumns={TABLE_COLUMS}
              keyColum={"number"}
              onRowClick={onClick}
            />
            {requestsUi.length == 0 && isLoading == false && !searchString && (
              <Typography
                variant="subtitle1"
                align="center"
                style={{marginTop: "2ex"}}
              >
                {TEXT_NO_OPEN_REQUESTS_FOUND}
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

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

const condition = (authUser: AuthUser | null) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(RequestOverviewPage);
