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
  OPEN as TEXT_OPEN,
  EDIT_AUTHORIZATION as TEXT_EDIT_AUTHORIZATION,
  EDIT_AUTHORIZATION_DESCRIPTION as TEXT_EDIT_AUTHORIZATION_DESCRIPTION,
  RE_SIGN_IN_REQUIRED as TEXT_RE_SIGN_IN_REQUIRED,
  RE_SIGN_IN_REQUIRED_AFTER_ROLES_ASSIGNMENT as TEXT_RE_SIGN_IN_REQUIRED_AFTER_ROLES_ASSIGNMENT,
  ROLE_TYPES as TEXT_ROLE_TYPES,
  CANCEL as TEXT_CANCEL,
  SAVE as TEXT_SAVE,
  ROLES_UPDATED_SUCCSESSFULLY as TEXT_ROLES_UPDATED_SUCCSESSFULLY,
  YOU_CANT_UPDATE_YOUR_OWN_AUTHORIZATION as TEXT_YOU_CANT_UPDATE_YOUR_OWN_AUTHORIZATION,
} from "../../constants/text";

import {OpenInNew as OpenInNewIcon} from "@material-ui/icons";

import PageTitle from "../Shared/pageTitle";

import User, {UserFullProfile, UserOverviewStructure} from "../User/user.class";

import Role from "../../constants/roles";
import useStyles from "../../constants/styles";
import CustomSnackbar, {
  SNACKBAR_INITIAL_STATE_VALUES,
  Snackbar,
} from "../Shared/customSnackbar";
import {
  Backdrop,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  List,
  Switch,
  Typography,
  useTheme,
} from "@material-ui/core";
import AlertMessage from "../Shared/AlertMessage";
// import EnhancedTable, {
//   Column,
//   ColumnTextAlign,
//   TableColumnTypes,
// } from "../Shared/enhancedTable";
import SearchPanel from "../Shared/searchPanel";

import {ImageRepository} from "../../constants/imageRepository";
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
import {Alert, AlertTitle} from "@material-ui/lab";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  USERS_FETCH_INIT,
  USERS_FETCH_SUCCESS,
  USER_FULL_PROFILE_FETCH_INIT,
  USER_FULL_PROFILE_FETCH_SUCCESS,
  USER_UPDATE,
  SNACKBAR_SET,
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
  let tempUsers: State["users"] = [];
  let index: number;
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
    case ReducerActions.USER_UPDATE:
      tempUsers = state.users;
      index = state.users.findIndex((user) => user?.uid === action.payload.uid);

      if (index < 0) {
        return state;
      }

      tempUsers[index] = {...tempUsers[index], ...action.payload};

      return {
        ...state,
        users: tempUsers,
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
const ROLE_DIALOG_INITIAL_STATE = {
  open: false,
  userUid: "" as User["uid"],
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
  const [roleDialog, setRoleDialog] = React.useState(ROLE_DIALOG_INITIAL_STATE);
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
  // User-Profil-PopUp-Handling
  // ------------------------------------------ */
  const onOpenDialog = async (userUid: User["uid"]) => {
    if (!userUid) {
      return;
    }

    // const onOpenDialog = async (
    //   event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    //   user: UserOverviewStructure
    // ) => {

    // Prüfen ob wir dieses Profil bereits gelesen haben.

    if (!Object.prototype.hasOwnProperty.call(state.userProfiles, userUid)) {
      dispatch({
        type: ReducerActions.USER_FULL_PROFILE_FETCH_INIT,
        payload: {},
      });
      await User.getFullProfile({firebase: firebase, uid: userUid}).then(
        (result) => {
          dispatch({
            type: ReducerActions.USER_FULL_PROFILE_FETCH_SUCCESS,
            payload: result,
          });
          setDialogValues({...dialogValues, selectedUser: result, open: true});
        }
      );
    } else {
      setDialogValues({
        ...dialogValues,
        selectedUser: state.userProfiles[userUid],
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
  /* ------------------------------------------
  // Berechtigungen-PopUp-Handling
  // ------------------------------------------ */
  const onDialogEditRolesClose = () => {
    setRoleDialog(ROLE_DIALOG_INITIAL_STATE);
  };
  const onDialogEditRolesUpdate = (newRoles: User["roles"]) => {
    User.updateRoles({
      firebase: firebase,
      userUid: dialogValues.selectedUser.uid,
      newRoles: newRoles,
      authUser: authUser,
    })
      .then(() => {
        dispatch({
          type: ReducerActions.SNACKBAR_SET,
          payload: {
            severity: "success",
            message: TEXT_ROLES_UPDATED_SUCCSESSFULLY,
            open: true,
          },
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });

    setRoleDialog(ROLE_DIALOG_INITIAL_STATE);
  };
  const showRoleDialog = (userUid: User["uid"]) => {
    setRoleDialog({open: true, userUid: userUid});
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
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={handleSnackbarClose}
      />
      <DialogEditRoles
        open={roleDialog.open}
        roles={dialogValues.selectedUser.roles}
        userUid={dialogValues.selectedUser.uid}
        authUser={authUser}
        handleClose={onDialogEditRolesClose}
        handleUpdate={onDialogEditRolesUpdate}
      />

      <DialogUser
        dialogOpen={dialogValues.open}
        handleClose={onDialogClose}
        userFullProfile={dialogValues.selectedUser}
        // onDeactivateUser={deactivateUser}
        // onResetPassword={resetPassword}
        onEditRoles={showRoleDialog}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ============================ Users Panel ==========================
// =================================================================== */
interface UsersTableProps {
  dbUsers: UserOverviewStructure[];
  onUserSelect: (userUid: User["uid"]) => void;
}

const UsersTable = ({dbUsers, onUserSelect}: UsersTableProps) => {
  const [searchString, setSearchString] = React.useState("");
  const [users, setUsers] = React.useState<UserOverviewStructure[]>([]);
  const [filteredUsersUi, setFilteredUsersUi] = React.useState<
    UserOverviewStructure[]
  >([]);
  const classes = useStyles();
  const theme = useTheme();

  const DATA_GRID_COLUMNS: GridColDef[] = [
    {
      field: "edit",
      headerName: TEXT_OPEN,
      sortable: false,
      renderCell: (params) => {
        const onClick = () => {
          onUserSelect(params.id as string);
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
      width: 270,
      cellClassName: () => `super-app ${classes.typographyCode}`,
    },
    {
      field: "displayName",
      headerName: TEXT_DISPLAYNAME,
      editable: false,
      width: 150,
    },
    {
      field: "firstName",
      headerName: TEXT_FIRSTNAME,
      editable: false,
      width: 150,
    },
    {
      field: "lastName",
      headerName: TEXT_LASTNAME,
      editable: false,
      width: 150,
    },
    {
      field: "email",
      headerName: TEXT_EMAIL,
      editable: false,
      width: 350,
    },
    {
      field: "memberId",
      headerName: TEXT_MEMBER_ID,
      editable: false,
      width: 150,
    },
    {
      field: "memberSince",
      headerName: TEXT_MEMBER_SINCE,
      editable: false,
      width: 150,
      valueFormatter: (params: GridValueFormatterParams) => {
        if (params.value && params.value instanceof Date) {
          return params.value.toLocaleString("de-CH", {
            dateStyle: "medium",
          });
        } else {
          return "";
        }
      },
    },
  ];

  // const TABLE_COLUMS: Column[] = [
  //   {
  //     id: "edit",
  //     type: TableColumnTypes.button,
  //     textAlign: ColumnTextAlign.center,
  //     disablePadding: false,
  //     visible: true,
  //     label: "",
  //     iconButton: <EditIcon fontSize="small" />,
  //   },
  //   {
  //     id: "uid",
  //     type: TableColumnTypes.string,
  //     textAlign: ColumnTextAlign.center,
  //     disablePadding: false,
  //     label: TEXT_UID,
  //     visible: false,
  //     monoSpaces: true,
  //   },
  //   {
  //     id: "displayName",
  //     type: TableColumnTypes.string,
  //     textAlign: ColumnTextAlign.left,
  //     disablePadding: false,
  //     label: TEXT_DISPLAYNAME,
  //     visible: true,
  //   },
  //   {
  //     id: "firstName",
  //     type: TableColumnTypes.string,
  //     textAlign: ColumnTextAlign.left,
  //     disablePadding: false,
  //     label: TEXT_FIRSTNAME,
  //     visible: true,
  //   },
  //   {
  //     id: "lastName",
  //     type: TableColumnTypes.string,
  //     textAlign: ColumnTextAlign.left,
  //     disablePadding: false,
  //     label: TEXT_LASTNAME,
  //     visible: true,
  //   },
  //   {
  //     id: "email",
  //     type: TableColumnTypes.string,
  //     textAlign: ColumnTextAlign.left,
  //     disablePadding: false,
  //     label: TEXT_EMAIL,
  //     visible: true,
  //   },
  //   {
  //     id: "memberId",
  //     type: TableColumnTypes.number,
  //     textAlign: ColumnTextAlign.center,
  //     disablePadding: false,
  //     label: TEXT_MEMBER_ID,
  //     visible: true,
  //   },
  //   {
  //     id: "memberSince",
  //     type: TableColumnTypes.date,
  //     textAlign: ColumnTextAlign.center,
  //     disablePadding: false,
  //     label: TEXT_MEMBER_SINCE,
  //     visible: true,
  //   },
  // ];

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
          </Grid>
          <Grid item xs={12}>
            <div style={{display: "flex", height: "100%"}}>
              <div style={{flexGrow: 1}}>
                <DataGrid
                  autoHeight
                  rows={filteredUsersUi}
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
// ============================ Dialog-User ==========================
// =================================================================== */
interface DialogUserProps {
  dialogOpen: boolean;
  userFullProfile: UserFullProfile;
  handleClose: () => void;
  // onResetPassword: (userUid: User["uid"]) => void;
  // onDeactivateUser: (userUid: User["uid"]) => void;
  onEditRoles: (userUid: User["uid"]) => void;
}
const DialogUser = ({
  dialogOpen,
  userFullProfile,
  handleClose,
  // onResetPassword,
  // onDeactivateUser,
  onEditRoles,
}: DialogUserProps) => {
  const classes = useStyles();
  const theme = useTheme();
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
        <List style={{marginBottom: theme.spacing(2)}}>
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
        <Button
          onClick={() => onEditRoles(userFullProfile.uid)}
          color="primary"
        >
          {TEXT_EDIT_AUTHORIZATION}
        </Button>
      </DialogContent>
      <DialogActions>
        {/* <Button
          onClick={() => onResetPassword(userFullProfile.uid)}
          color="primary"
        >
          Password-zurücksetzen
        </Button> */}
        {/* <Button
          onClick={() => onEditRoles(userFullProfile.uid)}
          color="primary"
        >
          {TEXT_EDIT_AUTHORIZATION}
        </Button> */}
        {/* <Button
          onClick={() => onDeactivateUser(userFullProfile.uid)}
          color="primary"
        >
          User deaktivieren
        </Button> */}
      </DialogActions>
    </Dialog>
  );
};
/* ===================================================================
// ============================ Rollen ==========================
// =================================================================== */
interface DialogEditRolesProps {
  open: boolean;
  roles: User["roles"];
  userUid: User["uid"];
  authUser: AuthUser;
  handleClose: () => void;
  handleUpdate: (roles: User["roles"]) => void;
}
const ROLE_SELECTION_INITIAL_STATE = {
  basic: false,
  communityLeader: false,
  admin: false,
  roundtripDone: false,
};

const DialogEditRoles = ({
  open,
  roles,
  userUid,
  authUser,
  handleClose,
  handleUpdate,
}: DialogEditRolesProps) => {
  const theme = useTheme();
  const [roleSelection, setRoleSelection] = React.useState(
    ROLE_SELECTION_INITIAL_STATE
  );
  /* ------------------------------------------
	// Switch-Handling
	// ------------------------------------------ */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tempRoleSelection = roleSelection;

    // Logik abbilden, dass die unterliegenden Berechtigungen mitvergeben werden
    switch (event.target.name) {
      case "basic":
        tempRoleSelection.basic = event.target.checked;
        tempRoleSelection.communityLeader = false;
        tempRoleSelection.admin = false;
        break;
      case "communityLeader":
        tempRoleSelection.basic = true;
        tempRoleSelection.communityLeader = event.target.checked;
        tempRoleSelection.admin = false;
        break;
      case "admin":
        tempRoleSelection.admin = event.target.checked;
        tempRoleSelection.communityLeader = event.target.checked
          ? true
          : tempRoleSelection.communityLeader;
        break;
    }

    setRoleSelection({
      ...roleSelection,
      // [event.target.name]: event.target.checked,
    });
  };
  /* ------------------------------------------
	// Werte übernehmen
	// ------------------------------------------ */
  const updateAuthentification = () => {
    const newRoles: User["roles"] = [];
    Object.entries(roleSelection).forEach(([key, value]) => {
      if (value && key !== "roundtripDone") newRoles.push(key as Role);
    });
    handleUpdate(newRoles);
  };
  /* ------------------------------------------
	// Initiale Werte übernehmen
	// ------------------------------------------ */
  if (
    roleSelection === ROLE_SELECTION_INITIAL_STATE &&
    !roleSelection.roundtripDone &&
    roles?.length > 0
  ) {
    // Die Rollen des Users übernehmen
    const tempRoleSelection = roleSelection;
    roles.forEach((role) => (tempRoleSelection[role] = true));
    tempRoleSelection.roundtripDone = true;
    setRoleSelection(tempRoleSelection);
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{TEXT_EDIT_AUTHORIZATION}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid xs={12} item>
            <Typography>{TEXT_EDIT_AUTHORIZATION_DESCRIPTION}</Typography>
          </Grid>
          <Grid xs={12} item>
            {userUid === authUser.uid ? (
              <Alert severity="warning" style={{marginTop: theme.spacing(1)}}>
                {TEXT_YOU_CANT_UPDATE_YOUR_OWN_AUTHORIZATION}
              </Alert>
            ) : (
              <Alert severity="info" style={{marginTop: theme.spacing(1)}}>
                <AlertTitle>{TEXT_RE_SIGN_IN_REQUIRED}</AlertTitle>
                {TEXT_RE_SIGN_IN_REQUIRED_AFTER_ROLES_ASSIGNMENT}
              </Alert>
            )}
          </Grid>
          <Grid xs={12} item>
            <FormControl component="fieldset">
              <FormLabel component="legend">Berechtigungen</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={roleSelection.basic}
                      onChange={handleChange}
                      name="basic"
                      disabled
                    />
                  }
                  label={TEXT_ROLE_TYPES.basic}
                />
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={roleSelection.communityLeader}
                      onChange={handleChange}
                      name="communityLeader"
                      disabled={userUid === authUser.uid}
                    />
                  }
                  label={TEXT_ROLE_TYPES.communityLeader}
                />
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={roleSelection.admin}
                      onChange={handleChange}
                      name="admin"
                      disabled={userUid === authUser.uid}
                    />
                  }
                  label={TEXT_ROLE_TYPES.admin}
                />
              </FormGroup>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="outlined">
          {TEXT_CANCEL}
        </Button>
        <Button
          onClick={updateAuthentification}
          color="primary"
          variant="outlined"
          disabled={userUid === authUser.uid}
        >
          {TEXT_SAVE}
        </Button>
      </DialogActions>
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
