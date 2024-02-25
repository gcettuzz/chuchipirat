import React from "react";
import {compose} from "react-recompose";

import CssBaseline from "@material-ui/core/CssBaseline";
import {
  DEPARTMENTS as TEXT_DEPARTMENTS,
  SO_YOU_DONT_GET_LOST_IN_THE_STORE as TEXT_SO_YOU_DONT_GET_LOST_IN_THE_STORE,
  ADD_DEPARTMENT as TEXT_ADD_DEPARTMENT,
  EDIT as TEXT_EDIT,
  SAVE as TEXT_SAVE,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  UID as TEXT_UID,
  DEPARTMENT as TEXT_DEPARTMENT,
  RANK as TEXT_RANK,
  ORDER as TEXT_ORDER,
  PORTION as TEXT_POSITION,
  DEPARTMENT_CREATED as TEXT_DEPARTMENT_CREATED,
  SAVE_SUCCESS as TEXT_SAVE_SUCCESS,
} from "../../constants/text";

import {withFirebase} from "../Firebase/firebaseContext";
import CustomSnackbar, {
  SNACKBAR_INITIAL_STATE_VALUES,
  Snackbar,
} from "../Shared/customSnackbar";

import Roles, {Role} from "../../constants/roles";
import Department from "./department.class";
import ButtonRow from "../Shared/buttonRow";
import PageTitle from "../Shared/pageTitle";
import useStyles from "../../constants/styles";
import {
  Backdrop,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import AlertMessage from "../Shared/AlertMessage";
import EnhancedTable, {
  Column,
  ColumnTextAlign,
  TableColumnTypes,
} from "../Shared/enhancedTable";
import Utils from "../Shared/utils.class";
import DialogDepartment from "./dialogDepartment";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {CustomRouterProps} from "../Shared/global.interface";
import AuthUser from "../Firebase/Authentication/authUser.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  FETCH_INIT,
  DEPARTMENTS_FETCH_SUCCESS,
  DEPARTMENT_ON_CHANGE,
  DEPARTMENTS_SAVED,
  NEW_DEPARTMENT_CREATED,
  SET_NEW_POSITION_FOR_DEPARTMENT,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  departments: Department[];
  positionList: string[];
  error: Error | null;
  isLoading: boolean;
  snackbar: Snackbar;
};

const inititialState: State = {
  departments: [],
  positionList: [],
  error: null,
  isLoading: false,
  snackbar: SNACKBAR_INITIAL_STATE_VALUES,
};

const departmentsReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.FETCH_INIT:
      // Daten werden geladen
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.DEPARTMENTS_FETCH_SUCCESS:
      // Abteilungen geholt
      return {
        ...state,
        departments: action.payload as Department[],
        positionList: createPositionList(action.payload.length),
        isLoading: false,
      };
    case ReducerActions.DEPARTMENT_ON_CHANGE:
      // Feldwert geändert
      return {
        ...state,
        departments: state.departments.map((department) => {
          if (department.uid === action.payload.key) {
            department[action.payload.field] = action.payload.value;
          }
          return department;
        }),
      };
    case ReducerActions.SET_NEW_POSITION_FOR_DEPARTMENT:
      // Position geänder
      return {...state, departments: action.payload as Department[]};
    case ReducerActions.DEPARTMENTS_SAVED:
      // Alle Einträge gespeichert
      return {
        ...state,
        error: null,
        snackbar: {
          severity: "success",
          message: TEXT_SAVE_SUCCESS,
          open: true,
        },
      };
    case ReducerActions.NEW_DEPARTMENT_CREATED:
      // Neue Abteilung wurde angelegt
      return {
        ...state,
        departments: state.departments.concat([action.payload as Department]),
        positionList: createPositionList(state.departments.length + 1),
        snackbar: {
          severity: "success",
          message: TEXT_DEPARTMENT_CREATED(action.payload.name),
          open: true,
        },
      };
    case ReducerActions.SNACKBAR_CLOSE:
      // Snackbar schliessen
      return {
        ...state,
        snackbar: SNACKBAR_INITIAL_STATE_VALUES,
      };
    case ReducerActions.GENERIC_ERROR:
      // Fehler
      return {
        ...state,
        isLoading: false,
        error: action.payload as Error,
      };

    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
const TABLE_COLUMS: Column[] = [
  {
    id: "uid",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_UID,
    visible: false,
  },
  {
    id: "name",
    type: TableColumnTypes.string,
    textAlign: ColumnTextAlign.left,
    disablePadding: false,
    label: TEXT_DEPARTMENT,
    visible: true,
  },
  {
    id: "pos",
    type: TableColumnTypes.number,
    textAlign: ColumnTextAlign.center,
    disablePadding: false,
    label: TEXT_RANK,
    visible: true,
  },
];

const createPositionList = (arrayLength: number) => {
  const positionList: string[] = [];
  for (let i = 0; i < arrayLength; i++) {
    positionList.push(String(i + 1));
  }
  return positionList;
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const DepartmentsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <DepartmentsBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const DepartmentsBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [editMode, setEditMode] = React.useState(false);
  const [state, dispatch] = React.useReducer(
    departmentsReducer,
    inititialState
  );
  const [addDepartmentPopUp, setAddDepartmentPopUp] = React.useState({
    open: false,
  });

  /* ------------------------------------------
  // Daten aus der DB holen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatch({
      type: ReducerActions.FETCH_INIT,
      payload: {},
    });

    // Abteilungen holen
    Department.getAllDepartments({firebase: firebase})
      .then((result) => {
        dispatch({
          type: ReducerActions.DEPARTMENTS_FETCH_SUCCESS,
          payload: Utils.sortArray({array: result, attributeName: "pos"}),
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
  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
  // Edit Mode wechsel
  // ------------------------------------------ */
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  /* ------------------------------------------
  // PopUp Handler
  // ------------------------------------------ */
  const onAddDepartment = () => {
    setAddDepartmentPopUp({...addDepartmentPopUp, open: true});
  };
  const onPopUpClose = () => {
    setAddDepartmentPopUp({...addDepartmentPopUp, open: false});
  };
  const onPopUpError = (error: Error) => {
    dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
    setAddDepartmentPopUp({...addDepartmentPopUp, open: false});
  };
  /* ------------------------------------------
  // Abteilung wurde angelegt
  // ------------------------------------------ */
  const onCreateDepartment = (department: Department) => {
    dispatch({
      type: ReducerActions.NEW_DEPARTMENT_CREATED,
      payload: department,
    });
    setAddDepartmentPopUp({...addDepartmentPopUp, open: false});
  };
  /* ------------------------------------------
  // Feldwert geändert
  // ------------------------------------------ */
  const onChangeField = (event: React.ChangeEvent<HTMLInputElement>) => {
    const departmentField = event.target.id.split("_");
    dispatch({
      type: ReducerActions.DEPARTMENT_ON_CHANGE,
      payload: {
        field: departmentField[0],
        key: departmentField[1],
        value: event.target.value,
      },
    });
  };
  /* ------------------------------------------
  //  Position von Abteilung ändern
  // ------------------------------------------ */
  const onChangeSelect = (
    event: React.ChangeEvent<{name?: string; value: unknown}>
  ) => {
    const selectedItem = event.target?.name?.split("_");
    if (!selectedItem || selectedItem?.length === 0) {
      return;
    }

    const sortedDepartmentList = Department.setPositionForDepartment({
      departmentList: state.departments,
      departmentUid: selectedItem[1],
      newPos: parseInt(event.target.value as string),
    });

    if (!sortedDepartmentList) {
      return;
    }
    dispatch({
      type: ReducerActions.SET_NEW_POSITION_FOR_DEPARTMENT,
      payload: sortedDepartmentList,
    });
  };
  /* ------------------------------------------
  // Speichern
  // ------------------------------------------ */
  const onSave = () => {
    Department.saveAllDepartments({
      firebase: firebase,
      departments: state.departments,
      authUser: authUser,
    })
      .then(() => {
        dispatch({
          type: ReducerActions.DEPARTMENTS_SAVED,
          payload: {},
        });
      })
      .catch((error) => {
        dispatch({
          type: ReducerActions.GENERIC_ERROR,
          payload: error,
        });
      });
  };
  // /* ------------------------------------------
  // // Snackback schliessen
  // // ------------------------------------------ */
  const onSnackbarClose = (event, reason) => {
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
      <CssBaseline />
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT_DEPARTMENTS}
        subTitle={TEXT_SO_YOU_DONT_GET_LOST_IN_THE_STORE}
      />
      <ButtonRow
        key="buttons_edit"
        buttons={[
          {
            id: "edit",
            hero: true,
            visible: !editMode && authUser.roles.includes(Roles.admin),
            label: TEXT_EDIT,
            variant: "contained",
            color: "primary",
            onClick: toggleEditMode,
          },
          {
            id: "save",
            hero: true,
            visible: editMode && authUser.roles.includes(Roles.admin),
            label: TEXT_SAVE,
            variant: "contained",
            color: "primary",
            onClick: onSave,
          },
          {
            id: "add",
            hero: true,
            visible: authUser.roles.includes(Roles.admin) && editMode,
            label: TEXT_ADD_DEPARTMENT,
            variant: "outlined",
            color: "primary",
            onClick: onAddDepartment,
          },
        ]}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          {/* Fehler anzeigen? */}
          {state.error && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={state.error}
                messageTitle={TEXT_ALERT_TITLE_UUPS}
              />
            </Grid>
          )}
          <Grid item key={"DepartmentsPanel"} xs={12}>
            <br />
            <DepartmentTable
              departments={state.departments}
              positionList={state.positionList}
              onChangeField={onChangeField}
              onChangeSelect={onChangeSelect}
              editMode={editMode}
            />
          </Grid>
        </Grid>
      </Container>
      <DialogDepartment
        firebase={firebase}
        dialogOpen={addDepartmentPopUp.open}
        nextHigherPos={state.positionList.length + 1}
        handleCreate={onCreateDepartment}
        handleClose={onPopUpClose}
        handleError={onPopUpError}
        authUser={authUser}
      />
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={onSnackbarClose}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ========================= Departments Tabelle =====================
// =================================================================== */
interface DepartmentTableProps {
  departments: Department[];
  positionList: string[];
  onChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeSelect: (event: React.ChangeEvent<{value: unknown}>) => void;
  editMode: boolean;
}
const DepartmentTable = ({
  departments,
  positionList,
  onChangeField,
  onChangeSelect,
  editMode,
}: DepartmentTableProps) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardDepartmentsPanel"}>
      <CardContent className={classes.cardContent} key={"cardDepartments"}>
        {editMode ? (
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Typography variant="subtitle1">{TEXT_DEPARTMENT}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle1">{TEXT_ORDER}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>

            {departments.map((department) => (
              <React.Fragment key={"departmentFragment_" + department.uid}>
                <Grid item xs={8} key={"gridItemName_" + department.uid}>
                  <TextField
                    id={"name_" + department.uid}
                    key={"name_" + department.uid}
                    value={department.name}
                    label={TEXT_DEPARTMENT}
                    onChange={onChangeField}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4} key={"gridItemPos_" + department.uid}>
                  <FormControl fullWidth className={classes.formControl}>
                    <InputLabel key="label_pos">{TEXT_POSITION}</InputLabel>
                    <Select
                      labelId="label_pos"
                      id={"pos_" + department.uid}
                      name={"pos_" + department.uid}
                      value={department.pos}
                      onChange={onChangeSelect}
                    >
                      {positionList.map((pos) => (
                        <MenuItem
                          id={department.uid + "_" + pos.toString()}
                          key={department.uid + "_" + pos.toString()}
                          value={pos}
                        >
                          {pos.toString()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} key={"gridItemDivider_" + department.uid}>
                  <Divider />
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        ) : (
          <EnhancedTable
            tableData={departments}
            tableColumns={TABLE_COLUMS}
            keyColum={"uid"}
          />
        )}
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
)(DepartmentsPage);
