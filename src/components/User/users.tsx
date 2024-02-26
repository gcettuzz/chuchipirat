import React from "react";
import {compose} from "react-recompose";

import {
  USER_LIST as TEXT_USER_LIST,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  UID as TEXT_UID,
  FIRSTNAME as TEXT_FIRSTNAME,
  LASTNAME as TEXT_LASTNAME,
  DISPLAYNAME as TEXT_DISPLAYNAME,
  USERS as TEXT_USERS,
  FROM as TEXT_FROM,
  EMAIL as TEXT_EMAIL,
  MEMBER_ID as TEXT_MEMBER_ID,
  MEMBER_SINCE as TEXT_MEMBER_SINCE,
  MOTTO as TEXT_MOTTO,
  ROLES as TEXT_ROLES,
} from "../../constants/text";

import {Edit as EditIcon} from "@material-ui/icons";

import PageTitle from "../Shared/pageTitle";

import User, {UserFullProfile, UserOverviewStructure} from "../User/user.class";

import Role from "../../constants/roles";
import useStyles from "../../constants/styles";
import {
  SNACKBAR_INITIAL_STATE_VALUES,
  Snackbar,
} from "../Shared/customSnackbar";
import {
  Backdrop,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  Typography,
} from "@material-ui/core";
import AlertMessage from "../Shared/AlertMessage";
import EnhancedTable, {
  Column,
  ColumnTextAlign,
  TableColumnTypes,
} from "../Shared/enhancedTable";
import SearchPanel from "../Shared/searchPanel";

import {ImageRepository} from "../../constants/imageRepository";
import {FormListItem} from "../Shared/formListItem";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";
import {CustomRouterProps} from "../Shared/global.interface";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  USERS_FETCH_INIT,
  USERS_FETCH_SUCCESS,
  USER_FULL_PROFILE_FETCH_INIT,
  USER_FULL_PROFILE_FETCH_SUCCESS,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  users: UserOverviewStructure[];
  userProfiles: {[key: User["uid"]]: UserFullProfile};
  error: Error | null;
  isLoading: boolean;
  snackbar: Snackbar;
};

const inititialState: State = {
  users: [],
  userProfiles: {},
  error: null,
  isLoading: false,
  snackbar: SNACKBAR_INITIAL_STATE_VALUES,
};

const usersReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.USERS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.USERS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        users: action.payload as UserOverviewStructure[],
      };
    case ReducerActions.USER_FULL_PROFILE_FETCH_INIT:
      return {...state, isLoading: true};
    case ReducerActions.USER_FULL_PROFILE_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        userProfiles: {
          ...state.userProfiles,
          [action.payload.uid]: action.payload,
        },
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
const UsersPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <UsersBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const UsersBase: React.FC<CustomRouterProps & {authUser: AuthUser | null}> = ({
  authUser,
  ...props
}) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [state, dispatch] = React.useReducer(usersReducer, inititialState);
  const [dialogValues, setDialogValues] = React.useState({
    selectedUser: {} as UserFullProfile,
    open: false,
  });
  /* ------------------------------------------
	// Daten aus DB holen
	// ------------------------------------------ */
  React.useEffect(() => {
    dispatch({
      type: ReducerActions.USERS_FETCH_INIT,
      payload: {},
    });

    User.getUsersOverview({firebase: firebase})
      .then((result) => {
        dispatch({type: ReducerActions.USERS_FETCH_SUCCESS, payload: result});
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
  // PopUp-Handling
  // ------------------------------------------ */
  const onOpenDialog = async (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    user: UserOverviewStructure
  ) => {
    // Prüfen ob wir dieses Profil bereits gelesen haben.

    if (!Object.prototype.hasOwnProperty.call(state.userProfiles, user.uid)) {
      dispatch({
        type: ReducerActions.USER_FULL_PROFILE_FETCH_INIT,
        payload: {},
      });
      await User.getFullProfile({firebase: firebase, uid: user.uid!}).then(
        (result) => {
          dispatch({
            type: ReducerActions.USER_FULL_PROFILE_FETCH_SUCCESS,
            payload: result,
          });
          console.log(result);
          setDialogValues({...dialogValues, selectedUser: result, open: true});
        }
      );
    } else {
      setDialogValues({
        ...dialogValues,
        selectedUser: state.userProfiles[user.uid!],
        open: true,
      });
    }
  };
  const onDialogClose = () => {
    setDialogValues({...dialogValues, open: false});
  };
  if (!authUser) {
    return null;
  }

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT_USER_LIST}
        // subTitle={TEXT.PAGE_SUBTITLE_USERS}
      />

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

        <UsersTable dbUsers={state.users} onUserSelect={onOpenDialog} />
      </Container>
      <DialogUser
        dialogOpen={dialogValues.open}
        handleClose={onDialogClose}
        userFullProfile={dialogValues.selectedUser}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ============================ Users Panel ==========================
// =================================================================== */
interface UsersTableProps {
  dbUsers: UserOverviewStructure[];
  onUserSelect: (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    user: UserOverviewStructure
  ) => void;
}

const UsersTable = ({dbUsers, onUserSelect}: UsersTableProps) => {
  const [searchString, setSearchString] = React.useState("");
  const [users, setUsers] = React.useState<UserOverviewStructure[]>([]);
  const [filteredUsersUi, setFilteredUsersUi] = React.useState<
    UserOverviewStructure[]
  >([]);
  const classes = useStyles();

  const TABLE_COLUMS: Column[] = [
    {
      id: "edit",
      type: TableColumnTypes.button,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      visible: true,
      label: "",
      iconButton: <EditIcon fontSize="small" />,
    },
    {
      id: "uid",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT_UID,
      visible: false,
      monoSpaces: true,
    },
    {
      id: "displayName",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT_DISPLAYNAME,
      visible: true,
    },
    {
      id: "firstName",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT_FIRSTNAME,
      visible: true,
    },
    {
      id: "lastName",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT_LASTNAME,
      visible: true,
    },
    {
      id: "email",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT_EMAIL,
      visible: true,
    },
    {
      id: "memberId",
      type: TableColumnTypes.number,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT_MEMBER_ID,
      visible: true,
    },
    {
      id: "memberSince",
      type: TableColumnTypes.date,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT_MEMBER_SINCE,
      visible: true,
    },
  ];

  /* ------------------------------------------
  // Suche
  // ------------------------------------------ */
  const clearSearchString = () => {
    setSearchString("");
    setFilteredUsersUi(filterUsers(users, ""));
  };
  const updateSearchString = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearchString(event.target.value);
    setFilteredUsersUi(filterUsers(users, event.target.value as string));
  };
  /* ------------------------------------------
  // Filter-Logik 
  // ------------------------------------------ */
  const filterUsers = (
    users: UserOverviewStructure[],
    searchString: string
  ) => {
    let filteredUsers: UserOverviewStructure[] = [];
    if (searchString) {
      searchString = searchString.toLowerCase();
      filteredUsers = users.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchString) ||
          user.lastName.toLowerCase().includes(searchString) ||
          user.displayName.toLowerCase().includes(searchString) ||
          user.email.toLowerCase().includes(searchString)
      );
    } else {
      filteredUsers = users;
    }
    return filteredUsers;
  };
  /* ------------------------------------------
  // Initiale Werte
  // ------------------------------------------ */
  if (dbUsers.length > 0 && users.length === 0) {
    // Deep-Copy, damit der Cancel-Befehl wieder die DB-Daten zeigt,
    // werden die Daten hier für die Tabelle geklont.
    setUsers([...dbUsers]);
  }

  if (!searchString && users.length > 0 && filteredUsersUi.length === 0) {
    // Initialer Aufbau
    setFilteredUsersUi(filterUsers(users, ""));
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
              {filteredUsersUi.length == users.length
                ? `${users.length} ${TEXT_USERS}`
                : `${filteredUsersUi.length} ${TEXT_FROM.toLowerCase()} ${
                    users.length
                  } ${TEXT_USERS}`}
            </Typography>

            <EnhancedTable
              tableData={filteredUsersUi}
              tableColumns={TABLE_COLUMS}
              keyColum={"uid"}
              //TODO: werte auslesen, darstellung wie bei REquest.
              // möglichkeit geben pw, zurückzusetzen, user deaktivieren,
              // Rollen vergeben.
              onIconClick={onUserSelect}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

/* ===================================================================
// ============================ Dialog-User ==========================
// =================================================================== */
interface DialogUserProps {
  dialogOpen: boolean;
  userFullProfile: UserFullProfile;
  handleClose: () => void;
}
const DialogUser = ({
  dialogOpen,
  userFullProfile,
  handleClose,
}: DialogUserProps) => {
  const classes = useStyles();

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialog Request"
      fullWidth={true}
      maxWidth="sm"
    >
      <DialogTitle
        className={classes.dialogHeaderWithPicture}
        style={{
          backgroundImage: `url(${
            userFullProfile?.pictureSrc?.normalSize
              ? userFullProfile?.pictureSrc?.normalSize
              : ImageRepository.getEnviromentRelatedPicture()
                  .CARD_PLACEHOLDER_MEDIA
          })`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        disableTypography
      >
        <Typography
          variant="h4"
          component="h1"
          className={classes.dialogHeaderWithPictureTitle}
          style={{paddingLeft: "2ex"}}
        >
          {userFullProfile.displayName}
        </Typography>
      </DialogTitle>
      <DialogContent style={{overflow: "unset"}}>
        <List>
          <FormListItem
            key={"displayName"}
            id={"displayName"}
            value={userFullProfile.displayName}
            label={TEXT_DISPLAYNAME}
          />
          <FormListItem
            key={"firstName"}
            id={"firstName"}
            value={userFullProfile.firstName}
            label={TEXT_FIRSTNAME}
          />
          <FormListItem
            key={"lastName"}
            id={"LastName"}
            value={userFullProfile.lastName}
            label={TEXT_LASTNAME}
          />
          <FormListItem
            key={"uid"}
            id={"uid"}
            value={userFullProfile.uid}
            label={TEXT_UID}
            displayAsCode
          />
          <FormListItem
            key={"email"}
            id={"email"}
            value={userFullProfile.email}
            label={TEXT_EMAIL}
          />
          <FormListItem
            key={"motto"}
            id={"motto"}
            value={userFullProfile.motto}
            label={TEXT_MOTTO}
          />
          <FormListItem
            key={"memberId"}
            id={"memberId"}
            value={userFullProfile.memberId}
            label={TEXT_MEMBER_ID}
          />
          <FormListItem
            key={"memberSincer"}
            id={"memnerSince"}
            value={userFullProfile.memberSince}
            label={TEXT_MEMBER_SINCE}
          />
          <FormListItem
            key={"roles"}
            id={"roles"}
            value={userFullProfile?.roles?.join(", ")}
            label={TEXT_ROLES}
          />
        </List>
      </DialogContent>
    </Dialog>
  );
};

const condition = (authUser: AuthUser | null) =>
  !!authUser && !!authUser.roles.includes(Role.admin);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(UsersPage);
