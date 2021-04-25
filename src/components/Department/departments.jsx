import React, { useReducer } from "react";
import { compose } from "recompose";

import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";

import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import EnhancedTable, { TABLE_COLUMN_TYPES } from "../Shared/enhancedTable";
import AlertMessage from "../Shared/AlertMessage";

import CustomSnackbar from "../Shared/customSnackbar";
import useStyles from "../../constants/styles";

import Department from "./department.class";
import DialogDepartment from "./dialogDepartment";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const REDUCER_ACTIONS = {
  FETCH_INIT: "FETCH_INIT",
  DEPARTMENTS_FETCH_SUCCESS: "DEPARTMENTS_FETCH_SUCCESS",
  DEPARTMENT_ON_CHANGE: "DEPARTMENT_ON_CHANGE",
  DEPARTMENTS_SAVED: "DEPARTMENTS_SAVED",
  NEW_DEPARTMENT_CREATED: "NEW_DEPARTMENT_CREATED",
  SET_NEW_POSITION_FOR_DEPARTMENT: "SET_NEW_POSITION_FOR_DEPARTMENT",
  SNACKBAR_CLOSE: "SNACKBAR_CLOSE",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const departmentsReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.FETCH_INIT:
      // Daten werden geladen
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.DEPARTMENTS_FETCH_SUCCESS:
      // Abteilungen geholt
      let positionList = [];

      return {
        ...state,
        data: action.payload,
        positionList: createPositionList(action.payload),
        isLoading: false,
      };
    case REDUCER_ACTIONS.DEPARTMENT_ON_CHANGE:
      // Feldwert geändert
      return {
        ...state,
        data: state.data.map((department) => {
          if (department.uid === action.key) {
            department[action.field] = action.value;
          }
          return department;
        }),
      };
    case REDUCER_ACTIONS.SET_NEW_POSITION_FOR_DEPARTMENT:
      // Position geänder
      return { ...state, data: action.payload };
    case REDUCER_ACTIONS.DEPARTMENTS_SAVED:
      // Alle Einträge gespeichert
      return {
        ...state,
        isError: false,
        error: null,
        snackbar: {
          severity: "success",
          message: TEXT.SAVE_SUCCESS,
          open: true,
        },
      };
    case REDUCER_ACTIONS.NEW_DEPARTMENT_CREATED:
      // Neue Abteilung wurde angelegt
      return {
        ...state,
        isError: false,
        data: state.data.concat([action.department]),
        positionList: createPositionList(
          state.data.concat([action.department])
        ),
        snackbar: {
          severity: action.snackbarSeverity,
          message: action.snackbarText,
          open: true,
        },
      };
    case REDUCER_ACTIONS.SNACKBAR_CLOSE:
      // Snackbar schliessen
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case REDUCER_ACTIONS.GENERIC_ERROR:
      // Fehler
      return {
        ...state,
        isError: true,
        isLoading: false,
        error: action.payload,
      };

    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
const TABLE_COLUMS = [
  {
    id: "uid",
    type: TABLE_COLUMN_TYPES.STRING,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.COLUMN_UID,
    visible: false,
  },
  {
    id: "name",
    type: TABLE_COLUMN_TYPES.STRING,
    textAlign: "left",
    disablePadding: false,
    label: TEXT.COLUMN_DEPARTMENT,
    visible: true,
  },
  {
    id: "pos",
    type: TABLE_COLUMN_TYPES.NUMBER,
    textAlign: "center",
    disablePadding: false,
    label: TEXT.COLUMN_RANK,
    visible: true,
  },
];

const createPositionList = (array) => {
  let positionList = [];
  for (let i = 0; i < array.length; i++) {
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
      {(authUser) => <DepartmentsBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const DepartmentsBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [editMode, setEditMode] = React.useState(false);

  const [departments, dispatchDepartments] = React.useReducer(
    departmentsReducer,
    {
      data: [],
      error: {},
      positionList: [],
      isError: false,
      isLoading: false,
      snackbar: { open: false, severity: "success", message: "" },
    }
  );

  const [departmentsPopUpValue, setDepartmentsPopUpValue] = React.useState({
    popUpOpen: false,
  });

  /* ------------------------------------------
  // Daten aus der DB holen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatchDepartments({
      type: REDUCER_ACTIONS.FETCH_INIT,
    });

    // Abteilungen holen
    Department.getAllDepartments(firebase)
      .then((result) => {
        dispatchDepartments({
          type: REDUCER_ACTIONS.DEPARTMENTS_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatchDepartments({
          type: REDUCER_ACTIONS.GENERIC_ERROR,
          error: error,
        });
      });
  }, []);

  /* ------------------------------------------
	// Edit Mode wechsel
	// ------------------------------------------ */
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  /* ------------------------------------------
  // PopUp öffnen
  // ------------------------------------------ */
  const onAddDepartmentClick = () => {
    setDepartmentsPopUpValue({
      ...departmentsPopUpValue,
      popUpOpen: true,
    });
  };
  /* ------------------------------------------
  //  PopUp schliessen
  // ------------------------------------------ */
  const onPopUpClose = () => {
    setDepartmentsPopUpValue({
      ...departmentsPopUpValue,
      popUpOpen: false,
    });
  };
  /* ------------------------------------------
  // Fehler beim anlegen der Einheit
  // ------------------------------------------ */
  const onPopUpError = (error) => {
    console.error(error);
    dispatchDepartments({
      type: REDUCER_ACTIONS.GENERIC_ERROR,
      payload: error,
    });
    setDepartmentsPopUpValue({
      ...departmentsPopUpValue,
      popUpOpen: false,
    });
  };
  /* ------------------------------------------
  // Abteilung wurde angelegt
  // ------------------------------------------ */
  const onAddDepartment = (department) => {
    // Snackbar
    dispatchDepartments({
      type: REDUCER_ACTIONS.NEW_DEPARTMENT_CREATED,
      department: department,
      snackbarSeverity: "success",
      snackbarText: TEXT.DEPARTMENT_CREATED(department.name),
    });
    setDepartmentsPopUpValue({
      ...departmentsPopUpValue,
      popUpOpen: false,
    });
  };
  /* ------------------------------------------
  // Feldwert geändert
  // ------------------------------------------ */
  const onChangeField = (event) => {
    let departmentField = event.target.id.split("_");
    dispatchDepartments({
      type: REDUCER_ACTIONS.DEPARTMENT_ON_CHANGE,
      field: departmentField[0],
      key: departmentField[1],
      value: event.target.value,
    });
  };
  /* ------------------------------------------
  //  Position von Abteilung ändern
  // ------------------------------------------ */
  const onChangeSelect = (event, child) => {
    // Zum Teil wird die Option mitgebgen, diese weglöschen
    // let targetId = event.target.id.split("-option")[0];
    let selectedItem = child.props.id.split("_");

    dispatchDepartments({
      type: REDUCER_ACTIONS.SET_NEW_POSITION_FOR_DEPARTMENT,
      payload: Department.setPositionForDepartment({
        list: departments.data,
        departmentUid: selectedItem[0],
        newPos: parseInt(event.target.value),
      }),
    });
  };
  /* ------------------------------------------
  // Speichern
  // ------------------------------------------ */
  const onSaveClick = () => {
    Department.saveDepartments({
      firebase: firebase,
      departments: departments.data,
    })
      .then(() => {
        dispatchDepartments({
          type: REDUCER_ACTIONS.DEPARTMENTS_SAVED,
        });
      })
      .catch((error) => {
        dispatchDepartments({
          type: REDUCER_ACTIONS.GENERIC_ERROR,
          payload: error,
        });
      });
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatchDepartments({
      type: REDUCER_ACTIONS.SNACKBAR_CLOSE,
    });
  };

  return (
    <React.Fragment>
      <CssBaseline />
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT.PAGE_TITLE_DEPARTMENTS}
        subTitle={TEXT.PAGE_SUBTITLE_DEPARTMENTS}
      />
      <ButtonRow
        key="buttons_edit"
        buttons={[
          {
            id: "edit",
            hero: true,
            visible:
              !editMode &&
              (authUser.roles.includes(ROLES.SUB_ADMIN) ||
                authUser.roles.includes(ROLES.ADMIN)),
            label: TEXT.BUTTON_EDIT,
            variant: "contained",
            color: "primary",
            onClick: toggleEditMode,
          },
          {
            id: "save",
            hero: true,
            visible:
              editMode &&
              (authUser.roles.includes(ROLES.SUB_ADMIN) ||
                authUser.roles.includes(ROLES.ADMIN)),
            label: TEXT.BUTTON_SAVE,
            variant: "contained",
            color: "primary",
            onClick: onSaveClick,
          },
          {
            id: "add",
            hero: true,
            visible:
              (authUser.roles.includes(ROLES.SUB_ADMIN) ||
                authUser.roles.includes(ROLES.ADMIN)) &&
              editMode,
            label: TEXT.BUTTON_ADD_DEPARTMENT,
            variant: "outlined",
            color: "primary",
            onClick: onAddDepartmentClick,
          },
        ]}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={departments.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}></Grid>
        {/* Fehler anzeigen? */}
        {departments.isError && (
          <Grid item key={"error"} xs={12}>
            <AlertMessage
              error={departments.error}
              messageTitle={TEXT.ALERT_TITLE_UUPS}
            />
          </Grid>
        )}
        <Grid item key={"DepartmentsPanel"} xs={12}>
          <br />
          <DepartmentPanel
            departments={departments.data}
            positionList={departments.positionList}
            onChangeField={onChangeField}
            onChangeSelect={onChangeSelect}
            // onEditProduct={onEditProduct}
            editMode={editMode}
          />
        </Grid>
      </Container>
      <DialogDepartment
        firebase={firebase}
        dialogOpen={departmentsPopUpValue.popUpOpen}
        nextHigherPos={departments.positionList.length + 1}
        handleCreate={onAddDepartment}
        handleClose={onPopUpClose}
        handleError={onPopUpError}
      />
      <CustomSnackbar
        message={departments.snackbar.message}
        severity={departments.snackbar.severity}
        snackbarOpen={departments.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ====================== Departments Panel ==================
// =================================================================== */
const DepartmentPanel = ({
  departments,
  positionList,
  onChangeField,
  onChangeSelect,
  editMode,
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardDepartmentsPanel"}>
      <CardContent className={classes.cardContent} key={"cardDepartments"}>
        {editMode ? (
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Typography variant="subtitle1">
                {TEXT.FIELD_DEPARTMENT}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle1">{TEXT.FIELD_ORDER}</Typography>
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
                    label={TEXT.FIELD_DEPARTMENT}
                    onChange={onChangeField}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4} key={"gridItemPos_" + department.uid}>
                  <FormControl fullWidth className={classes.formControl}>
                    <InputLabel key="label_pos">
                      {TEXT.FIELD_POSITION}
                    </InputLabel>
                    <Select
                      labelId="label_pos"
                      id={"pos_" + department.uid}
                      key={"pos_" + department.uid}
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

const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(DepartmentsPage);
