import React from "react";
import {compose} from "react-recompose";
// import {useHistory} from "react-router";

import useStyles from "../../constants/styles";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Backdrop,
  CircularProgress,
  useTheme,
  Typography,
  IconButton,
} from "@material-ui/core";

import {OpenInNew as OpenInNewIcon} from "@material-ui/icons";

import PageTitle from "../Shared/pageTitle";

import Role from "../../constants/roles";

import {withFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {ChangeRecord, CustomRouterProps} from "../Shared/global.interface";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import EventShort from "../Event/Event/eventShort.class";
import Event from "../Event/Event/event.class";
import {EVENT as ROUTE_EVENT} from "../../constants/routes";
import {
  EVENT as TEXT_EVENT,
  EVENTS as TEXT_EVENTS,
  OVERVIEW_EVENTS_DESCRIPTION as TEXT_OVERVIEW_EVENTS_DESCRIPTION,
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  OPEN as TEXT_OPEN,
  CANCEL as TEXT_CANCEL,
  UID as TEXT_UID,
  NAME as TEXT_NAME,
  MOTTO as TEXT_MOTTO,
  LOCATION as TEXT_LOCATION,
  NO_OF_DAYS as TEXT_NO_OF_DAYS,
  NO_OF_COOKS as TEXT_NO_OF_COOKS,
  START_DATE as TEXT_START_DATE,
  END_DATE as TEXT_END_DATE,
  CREATED_AT as TEXT_CREATED_AT,
  CREATED_FROM as TEXT_CREATED_FROM,
} from "../../constants/text";
import AlertMessage from "../Shared/AlertMessage";
import SearchPanel from "../Shared/searchPanel";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridValueFormatterParams,
  deDE,
} from "@mui/x-data-grid";
import DialogEventQuickView from "../Event/Event/dialogEventQuickView";
import {useHistory} from "react-router";
import Action from "../../constants/actions";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  EVENTS_FETCH_INIT,
  EVENTS_FETCH_SUCCESS,
  FILTER_EVENTS_LIST,
  GENERIC_ERROR,
}

interface EventOverview {
  name: EventShort["name"];
  uid: EventShort["uid"];
  location: EventShort["location"];
  motto: EventShort["motto"];
  noOfCooks: EventShort["noOfCooks"];
  startDate: EventShort["startDate"];
  endDate: EventShort["endDate"];
  numberOfDays: EventShort["numberOfDays"];
  pictureSrc: EventShort["pictureSrc"];
  create_date: ChangeRecord["date"];
  create_fromUid: ChangeRecord["fromUid"];
  create_fromDisplayName: ChangeRecord["fromDisplayName"];
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  events: EventShort[];
  filteredData: EventOverview[];
  isLoading: boolean;
  error: Error | null;
};

const inititialState: State = {
  events: [],
  filteredData: [],
  isLoading: false,
  error: null,
};

interface DialogQuickViewState {
  dialogOpen: boolean;
  selectedEvent: EventShort;
}

const DIALOG_QUICK_VIEW_INITIAL_STATE: DialogQuickViewState = {
  dialogOpen: false,
  selectedEvent: new EventShort(),
};

const moveDataToUiStructure = (events: EventShort[]): EventOverview[] => {
  const result: EventOverview[] = [];
  events.forEach((event) => {
    result.push({
      name: event.name,
      uid: event.uid,
      location: event.location,
      motto: event.motto,
      noOfCooks: event.noOfCooks,
      startDate: event.startDate,
      endDate: event.endDate,
      numberOfDays: event.numberOfDays,
      pictureSrc: event.pictureSrc,
      create_date: event.created?.date,
      create_fromUid: event.created?.fromUid,
      create_fromDisplayName: event.created?.fromDisplayName,
    });
  });
  return result;
};

const eventsReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.EVENTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.EVENTS_FETCH_SUCCESS:
      return {
        ...state,
        events: action.payload as EventShort[],
        filteredData: moveDataToUiStructure(action.payload as EventShort[]),
        isLoading: false,
      };
    case ReducerActions.GENERIC_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload as Error,
      };
    case ReducerActions.FILTER_EVENTS_LIST: {
      let tmpList: EventOverview[] = moveDataToUiStructure(state.events);

      if (action.payload.searchString) {
        tmpList = tmpList.filter(
          (event) =>
            event.uid
              .toLocaleLowerCase()
              .includes(action.payload.searchString.toLowerCase()) ||
            event.name
              .toLowerCase()
              .includes(action.payload.searchString.toLowerCase()) ||
            event.motto
              .toLowerCase()
              .includes(action.payload.searchString.toLowerCase()) ||
            event.location
              .toLowerCase()
              .includes(action.payload.searchString.toLowerCase()) ||
            event.create_fromDisplayName
              .toLowerCase()
              .includes(action.payload.searchString.toLowerCase()) ||
            event.create_fromUid
              .toLowerCase()
              .includes(action.payload.searchString.toLowerCase())
        );
      }
      return {
        ...state,
        filteredData: tmpList,
      };
    }
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const OverviewEventsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <OverviewEventsBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const OverviewEventsBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;

  const [state, dispatch] = React.useReducer(eventsReducer, inititialState);
  const [searchString, setSearchString] = React.useState<string>("");
  const [dialogQuickView, setDialogQuickView] =
    React.useState<DialogQuickViewState>(DIALOG_QUICK_VIEW_INITIAL_STATE);

  const classes = useStyles();
  const {push} = useHistory();

  /* ------------------------------------------
	// Daten aus DB holen
	// ------------------------------------------ */
  React.useEffect(() => {
    if (state.events.length === 0) {
      dispatch({
        type: ReducerActions.EVENTS_FETCH_INIT,
        payload: {},
      });
      EventShort.getShortEvents({firebase: firebase})
        .then((result) => {
          dispatch({
            type: ReducerActions.EVENTS_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
    }
  }, []);

  if (!authUser) {
    return null;
  }

  /* ------------------------------------------
  // Search String Handling
  // ------------------------------------------ */
  const onUpdateSearchString = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearchString(event.target.value);

    dispatch({
      type: ReducerActions.FILTER_EVENTS_LIST,
      payload: {
        searchString: event.target.value,
      },
    });
  };
  const onClearSearchString = () => {
    setSearchString("");
    dispatch({
      type: ReducerActions.FILTER_EVENTS_LIST,
      payload: {searchString: ""},
    });
  };
  /* ------------------------------------------
  // Quick-View Dialog öffnen
  // ------------------------------------------ */
  const onEventOpen = (uid: EventShort["uid"]) => {
    setDialogQuickView({
      dialogOpen: true,
      selectedEvent: state.events.find((event) => event.uid === uid)!,
    });
  };
  const onQuickViewClose = () => {
    setDialogQuickView(DIALOG_QUICK_VIEW_INITIAL_STATE);
  };
  const onQuickDialogOpenEvent = (
    actionEvent: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined,
    event: EventShort
  ) => {
    push({
      pathname: `${ROUTE_EVENT}/${event.uid}`,
      state: {
        action: Action.VIEW,
        event: event,
      },
    });
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT_EVENTS}
        subTitle={TEXT_OVERVIEW_EVENTS_DESCRIPTION}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {state.error && (
          <Grid item key={"error"} xs={12}>
            <AlertMessage
              error={state.error!}
              messageTitle={TEXT_ALERT_TITLE_WAIT_A_MINUTE}
            />
          </Grid>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card className={classes.card} key={"cardProductsPanel"}>
              <CardContent>
                <SearchPanel
                  searchString={searchString}
                  onUpdateSearchString={onUpdateSearchString}
                  onClearSearchString={onClearSearchString}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <EventsPanel
              events={state.filteredData}
              onEventOpen={onEventOpen}
            />
          </Grid>
        </Grid>
      </Container>
      <DialogEventQuickView
        firebase={firebase}
        eventShort={dialogQuickView.selectedEvent}
        dialogOpen={dialogQuickView.dialogOpen}
        handleClose={onQuickViewClose}
        dialogActions={[
          {
            key: "close",
            name: TEXT_CANCEL,
            variant: "text",
            onClick: onQuickViewClose,
          },
          {
            key: "open",
            name: `${TEXT_EVENT} ${TEXT_OPEN}`,
            variant: "outlined",
            onClick: onQuickDialogOpenEvent,
          },
        ]}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Event Panel ===========================
// =================================================================== */
interface EventsPanelProps {
  events: EventOverview[];
  onEventOpen: (eventUid: EventShort["uid"]) => void;
}

const EventsPanel = ({events, onEventOpen}: EventsPanelProps) => {
  const theme = useTheme();
  const classes = useStyles();

  /* ------------------------------------------
  // Spalten Definition
  // ------------------------------------------ */
  const DATA_GRID_COLUMNS: GridColDef[] = [
    {
      field: "open",
      headerName: TEXT_OPEN,
      sortable: false,
      renderCell: (params) => {
        const onClick = () => {
          onEventOpen(params.id as string);
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
      cellClassName: () => `super-app ${classes.typographyCode}`,
      width: 200,
    },
    {
      field: "name",
      headerName: TEXT_NAME,
      editable: false,
      width: 200,
    },
    {
      field: "location",
      headerName: TEXT_LOCATION,
      editable: false,
      width: 200,
    },
    {
      field: "motto",
      headerName: TEXT_MOTTO,
      editable: false,
      hide: true,
      width: 200,
    },
    {
      field: "noOfCooks",
      headerName: TEXT_NO_OF_COOKS,
      editable: false,
      type: "number",
      width: 100,
    },
    {
      field: "startDate",
      headerName: TEXT_START_DATE,
      editable: false,
      width: 150,
      valueGetter: (params: GridValueFormatterParams) => {
        return params?.value instanceof Date
          ? params.value.toLocaleString("de-CH", {
              dateStyle: "medium",
            })
          : "";
      },
    },
    {
      field: "endDate",
      headerName: TEXT_END_DATE,
      editable: false,
      width: 150,
      valueGetter: (params: GridValueFormatterParams) => {
        return params?.value instanceof Date
          ? params.value.toLocaleString("de-CH", {
              dateStyle: "medium",
            })
          : "";
      },
    },
    {
      field: "numberOfDays",
      headerName: TEXT_NO_OF_DAYS,
      editable: false,
      type: "number",
      width: 100,
    },
    {
      field: "create_date",
      headerName: TEXT_CREATED_AT,
      editable: false,
      valueGetter: (params: GridValueFormatterParams) => {
        return params?.value instanceof Date
          ? params.value.toLocaleString("de-CH", {
              dateStyle: "medium",
            })
          : "";
      },
      width: 100,
    },
    {
      field: "create_fromUid",
      headerName: `${TEXT_CREATED_FROM} ${TEXT_UID}`,
      editable: false,
      cellClassName: () => `super-app ${classes.typographyCode}`,
      valueGetter: (params: GridValueFormatterParams) => {
        return params.value;
      },
      width: 200,
    },
    {
      field: "create_fromDisplayName",
      headerName: TEXT_CREATED_FROM,
      editable: false,
      valueGetter: (params: GridValueFormatterParams) => {
        return params.value;
      },
      width: 200,
    },
  ];

  return (
    <Card className={classes.card} key={"cardProductsPanel"}>
      <CardContent className={classes.cardContent} key={"cardPrdocutContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {events.length} {TEXT_EVENTS}
        </Typography>

        <DataGrid
          autoHeight
          rows={events}
          columns={DATA_GRID_COLUMNS}
          getRowId={(row) => row.uid}
          localeText={deDE.props.MuiDataGrid.localeText}
          getRowClassName={(params) => {
            if (params.row?.disabled) {
              return `super-app ${classes.dataGridDisabled}`;
            } else {
              return `super-app-theme`; // Fehlendes 'return' ergänzt
            }
          }}
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </CardContent>
    </Card>
  );
};

const condition = (authUser: AuthUser | null) =>
  !!authUser &&
  (!!authUser.roles.includes(Role.admin) ||
    !!authUser.roles.includes(Role.communityLeader));

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(OverviewEventsPage);
