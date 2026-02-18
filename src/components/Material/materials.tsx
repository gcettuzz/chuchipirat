import React, {SyntheticEvent} from "react";
import {compose} from "react-recompose";

import {
  Container,
  Backdrop,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Stack,
  useTheme,
  SnackbarCloseReason,
} from "@mui/material";

import * as TEXT from "../../constants/text";
import Roles, {Role} from "../../constants/roles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import EnhancedTable, {
  TableColumnTypes,
  ColumnTextAlign,
} from "../Shared/enhancedTable";
import DialogMaterial, {MaterialDialog} from "./dialogMaterial";
import AlertMessage from "../Shared/AlertMessage";

import EditIcon from "@mui/icons-material/Edit";

import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";
import useCustomStyles from "../../constants/styles";
import SearchPanel from "../Shared/searchPanel";

import AuthUser from "../Firebase/Authentication/authUser.class";
import Material, {MaterialType} from "./material.class";
import {withFirebase} from "../Firebase/firebaseContext";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {CustomRouterProps} from "../Shared/global.interface";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  MATERIALS_FETCH_INIT = 1,
  MATERIALS_FETCH_SUCCESS,
  MATERIALS_SAVED,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};
type State = {
  materials: Material[];
  error: Error | null;
  isLoading: boolean;
  snackbar: Snackbar;
};

const inititialState: State = {
  materials: [],
  error: null,
  isLoading: false,
  snackbar: {open: false, severity: "success", message: ""},
};

const materialsReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.MATERIALS_FETCH_INIT:
      // Daten werden geladen
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.MATERIALS_FETCH_SUCCESS:
      // Produkte erfolgreich geladen
      return {
        ...state,
        materials: action.payload as Material[],
        isLoading: false,
      };
    case ReducerActions.MATERIALS_SAVED:
      return {
        ...state,
        materials: action.payload as Material[],
        snackbar: {
          open: true,
          severity: "success",
          message: TEXT.SAVE_SUCCESS,
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

const MATERIAL_POPUP_VALUES = {
  materialName: "",
  materialUid: "",
  materialType: MaterialType.none,
  usable: false,
  popUpOpen: false,
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const MaterialPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <MaterialBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const MaterialBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useCustomStyles();

  const [state, dispatch] = React.useReducer(materialsReducer, inititialState);
  const [editMode, setEditMode] = React.useState(false);
  const [saveTrigger, setSaveTrigger] = React.useState(0);
  const [cancelTrigger, setCancelTrigger] = React.useState(0);
  /* ------------------------------------------
	// Daten aus DB holen
	// ------------------------------------------ */
  React.useEffect(() => {
    dispatch({
      type: ReducerActions.MATERIALS_FETCH_INIT,
      payload: {},
    });
    Material.getAllMaterials({
      firebase: firebase,
      onlyUsable: false,
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.MATERIALS_FETCH_SUCCESS,
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
  }, []);
  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
	// Edit Mode wechseln
	// ------------------------------------------ */
  // Die Triggerfunktionen werden benötigt, damit
  // useEffect() Methode in der Unterkomponente
  // reagiert und danach die Callback-Methode onXXX
  // aufruft
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  const raiseSaveTrigger = () => {
    setSaveTrigger((trigger) => trigger + 1);
  };
  const onSave = (materials: Material[]) => {
    Material.saveAllMaterials({
      firebase: firebase,
      materials: materials,
      authUser: authUser,
    })
      .then((result) => {
        dispatch({type: ReducerActions.MATERIALS_SAVED, payload: result});
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  const raiseCancelTrigger = () => {
    setCancelTrigger((trigger) => trigger + 1);
  };
  const onCancel = () => {
    toggleEditMode();
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (
    event: Event | SyntheticEvent<any, Event>,
    reason: SnackbarCloseReason
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
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT.MATERIALS}
        // subTitle={TEXT.PAGE_SUBTITLE_PRODUCTS}
      />
      <MaterialsButtonRow
        editMode={editMode}
        onEdit={toggleEditMode}
        onSave={raiseSaveTrigger}
        onCancel={raiseCancelTrigger}
        authUser={authUser}
      />
      {/* ===== BODY ===== */}
      <Container sx={classes.container} component="main" maxWidth="xl">
        <Backdrop sx={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {state.error && (
          <AlertMessage
            error={state.error}
            severity="error"
            messageTitle={TEXT.ALERT_TITLE_UUPS}
          />
        )}
        <MaterialsTable
          editMode={editMode}
          dbMaterials={state.materials}
          saveTrigger={saveTrigger}
          cancelTrigger={cancelTrigger}
          onSave={onSave}
          onCancel={onCancel}
          authUser={authUser}
        />
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
// ============================ Buttons ==============================
// =================================================================== */
interface MaterialsButtonRowProps {
  editMode: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  authUser: AuthUser;
}
const MaterialsButtonRow = ({
  editMode,
  onEdit,
  onCancel,
  onSave,
  authUser,
}: MaterialsButtonRowProps) => {
  return (
    <ButtonRow
      key="action_buttons"
      buttons={[
        {
          id: "edit",
          hero: true,
          visible:
            !editMode &&
            (authUser.roles.includes(Roles.communityLeader) ||
              authUser.roles.includes(Roles.admin)),
          label: TEXT.BUTTON_EDIT,
          variant: "contained",
          color: "primary",
          onClick: onEdit,
        },
        {
          id: "save",
          hero: true,
          visible: editMode,
          label: TEXT.BUTTON_SAVE,
          variant: "contained",
          color: "primary",
          onClick: onSave,
        },
        {
          id: "cancel",
          hero: true,
          visible: editMode,
          label: TEXT.BUTTON_CANCEL,
          variant: "outlined",
          color: "primary",
          onClick: onCancel,
        },
      ]}
    />
  );
};
/* ===================================================================
// =========================== Material Panel ========================
// =================================================================== */
interface MaterialsTableProps {
  dbMaterials: Material[];
  editMode: boolean;
  saveTrigger: any;
  cancelTrigger: any;
  onSave: (editedMaterials: Material[]) => void;
  onCancel: () => void;
  authUser: AuthUser;
}
// Aufbau der UI-Tabelle
interface MaterialLineUi {
  uid: Material["uid"];
  name: Material["name"];
  type: JSX.Element;
  usable: JSX.Element;
}

const MaterialsTable = ({
  dbMaterials,
  editMode,
  saveTrigger,
  cancelTrigger,
  onSave,
  onCancel,
  authUser,
}: MaterialsTableProps) => {
  const [searchString, setSearchString] = React.useState("");
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [filteredMaterialsUi, setFilteredMaterialsUi] = React.useState<
    MaterialLineUi[]
  >([]);
  const [materialPopUpValues, setMaterialPopUpValues] = React.useState(
    MATERIAL_POPUP_VALUES
  );

  const classes = useCustomStyles();
  const theme = useTheme();

  const TABLE_COLUMS = [
    {
      id: "edit",
      type: TableColumnTypes.button,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      visible: editMode,
      label: "",
      iconButton: <EditIcon fontSize="small" />,
    },
    {
      id: "uid",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT.UID,
      visible: false,
    },
    {
      id: "name",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT.FIELD_PRODUCT,
      visible: true,
    },
    {
      id: "type",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT.MATERIAL_TYPE,
      visible: true,
    },
    {
      id: "usable",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT.USABLE,
      visible: true,
    },
  ];
  /* ------------------------------------------
  // Mutierte Daten hochschieben
  // ------------------------------------------ */
  React.useEffect(() => {
    if (saveTrigger) {
      onSave(materials);
    }
  }, [saveTrigger]);
  React.useEffect(() => {
    // Änderungen verwerfen
    if (cancelTrigger) {
      // Werte kopieren --> sonst werden Referenzen übergeben
      // und bei einem Abbruch (Cancel-Klick) werden die Änderungen
      // nicht rücktgängig gemacht
      setMaterials(
        dbMaterials.map((material) => {
          return {
            ...material,
          };
        })
      );

      setFilteredMaterialsUi(
        prepareMaterialsListForUi(filterMaterials(dbMaterials, searchString))
      );
      onCancel();
    }
  }, [cancelTrigger]);
  /* ------------------------------------------
  // Änderung des Edit-Mode verarbeiten
  // ------------------------------------------ */
  React.useEffect(() => {
    setFilteredMaterialsUi(
      prepareMaterialsListForUi(filterMaterials(materials, searchString))
    );
  }, [editMode]);
  /* ------------------------------------------
  // Suche
  // ------------------------------------------ */
  const clearSearchString = () => {
    setSearchString("");
    setFilteredMaterialsUi(
      prepareMaterialsListForUi(filterMaterials(materials, ""))
    );
  };
  const updateSearchString = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearchString(event.target.value);
    setFilteredMaterialsUi(
      prepareMaterialsListForUi(
        filterMaterials(materials, event.target.value as string)
      )
    );
  };
  /* ------------------------------------------
  // Filter-Logik 
  // ------------------------------------------ */
  const filterMaterials = (materials: Material[], searchString: string) => {
    let filteredMaterials: Material[] = [];
    if (searchString) {
      searchString = searchString.toLowerCase();
      filteredMaterials = materials.filter((material) =>
        material.name.toLowerCase().includes(searchString)
      );
    } else {
      filteredMaterials = materials;
    }
    return filteredMaterials;
  };
  /* ------------------------------------------
  // Daten für UI aufbereiten 
  // ------------------------------------------ */
  const prepareMaterialsListForUi = (materials: Material[]) => {
    return materials.map((material) => {
      return {
        uid: material.uid,
        name: material.name,
        usable: (
          <Checkbox
            id={"checkbox_" + material.uid}
            disabled={!editMode}
            checked={material.usable}
            onChange={handleCheckBoxChange}
          />
        ),
        type: (
          <RadioGroup
            aria-label="Typ"
            name={"radioGroup_" + material.uid}
            key={"radioGroup_" + material.uid}
            value={material.type}
            onChange={handleRadioButtonChange}
            row
          >
            <FormControlLabel
              value={MaterialType.consumable}
              control={<Radio size="small" disabled={!editMode} />}
              label={TEXT.MATERIAL_TYPE_CONSUMABLE}
            />
            <FormControlLabel
              value={MaterialType.usage}
              control={<Radio size="small" disabled={!editMode} />}
              label={TEXT.MATERIAL_TYPE_USAGE}
            />
          </RadioGroup>
        ),
      };
    });
  };
  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pressedRadioButtonGroup = event.target.name.split("_");
    const tempMaterials = materials;
    const changedMaterial = tempMaterials.find(
      (material) => material.uid === pressedRadioButtonGroup[1]
    );
    if (!changedMaterial) {
      return;
    }
    changedMaterial.type = parseInt(event.target.value) as MaterialType;
    setMaterials(tempMaterials);
    setFilteredMaterialsUi(
      prepareMaterialsListForUi(filterMaterials(tempMaterials, searchString))
    );
  };
  const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pressedCheckbox = event.target.id.split("_");
    const tempMaterials = materials;
    const changedMaterial = tempMaterials.find(
      (material) => material.uid === pressedCheckbox[1]
    );
    if (!changedMaterial) {
      return;
    }
    changedMaterial.usable = event.target.checked;
    setMaterials(tempMaterials);
    setFilteredMaterialsUi(
      prepareMaterialsListForUi(filterMaterials(tempMaterials, searchString))
    );
  };
  /* ------------------------------------------
	// PopUp 
	// ------------------------------------------ */
  const openPopUp = (
    event:
      | React.MouseEvent<HTMLSpanElement, MouseEvent>
      | React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    materialToEdit: MaterialLineUi | string
  ) => {
    let material = {} as Material;

    if (typeof materialToEdit === "string") {
      material = materials.find(
        (material) => material.uid === materialToEdit
      ) as Material;
    } else {
      material = materials.find(
        (material) => material.uid === materialToEdit.uid
      ) as Material;
    }

    if (!material) {
      return;
    }
    setMaterialPopUpValues({
      materialUid: material.uid,
      materialName: material.name,
      materialType: material.type,
      usable: material.usable,
      popUpOpen: true,
    });
  };
  const onPopUpClose = () => {
    setMaterialPopUpValues(MATERIAL_POPUP_VALUES);
  };
  const onPopUpOk = (changedMaterial: Material) => {
    // angepasstes Produkt updaten
    const tempMaterials = materials;

    const index = tempMaterials.findIndex(
      (material) => material.uid === changedMaterial.uid
    );
    if (index === -1) {
      return;
    }

    tempMaterials[index] = {
      ...changedMaterial,
    };

    setMaterials(tempMaterials);
    setFilteredMaterialsUi(
      prepareMaterialsListForUi(filterMaterials(tempMaterials, searchString))
    );
    setMaterialPopUpValues(MATERIAL_POPUP_VALUES);
  };
  if (dbMaterials.length > 0 && materials.length == 0) {
    // Deep-Copy, damit der Cancel-Befehl wieder die DB-Daten zeigt,
    // werden die Daten hier für die Tabelle geklont.
    setMaterials([...dbMaterials]);
  }
  if (
    !searchString &&
    materials.length > 0 &&
    filteredMaterialsUi.length === 0
  ) {
    // Initialer Aufbau
    setFilteredMaterialsUi(
      prepareMaterialsListForUi(filterMaterials(materials, ""))
    );
  }

  return (
    <React.Fragment>
      <Card sx={classes.card} key={"requestTablePanel"}>
        <CardContent sx={classes.cardContent} key={"requestTableContent"}>
          <Stack sx={{marginBottom: theme.spacing(1)}}>
            <SearchPanel
              searchString={searchString}
              onUpdateSearchString={updateSearchString}
              onClearSearchString={clearSearchString}
            />
            <Typography
              variant="body2"
              style={{marginTop: "0.5em", marginBottom: "2em"}}
            >
              {filteredMaterialsUi.length == materials.length
                ? `${materials.length} ${TEXT.MATERIALS}`
                : `${filteredMaterialsUi.length} ${TEXT.FROM.toLowerCase()} ${
                    materials.length
                  } ${TEXT.MATERIALS}`}
            </Typography>

            <EnhancedTable
              tableData={filteredMaterialsUi}
              tableColumns={TABLE_COLUMS}
              keyColum={"uid"}
              onIconClick={openPopUp}
            />
          </Stack>
        </CardContent>
      </Card>
      <DialogMaterial
        dialogType={MaterialDialog.EDIT}
        materialUid={materialPopUpValues.materialUid}
        materialName={materialPopUpValues.materialName}
        materialType={materialPopUpValues.materialType}
        materialUsable={materialPopUpValues.usable}
        materials={materials}
        dialogOpen={materialPopUpValues.popUpOpen}
        handleOk={onPopUpOk}
        handleClose={onPopUpClose}
        authUser={authUser}
      />
    </React.Fragment>
  );
};

const condition = (authUser) =>
  !!authUser &&
  (!!authUser.roles.includes(Role.admin) ||
    !!authUser.roles.includes(Role.communityLeader));

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(MaterialPage);
