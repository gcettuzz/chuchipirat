import React, {SyntheticEvent} from "react";

import {
  Stack,
  Button,
  Backdrop,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  GridSize,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  useTheme,
  Box,
  SnackbarCloseReason,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import {
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  GROUP_CONFIGURATION_SETTINGS as TEXT_GROUP_CONFIGURATION_SETTINGS,
  GROUP_CONFIGURATION_SETTINGS_DESCRIPTION as TEXT_GROUP_CONFIGURATION_SETTINGS_DESCRIPTION,
  GROUPS as TEXT_GROUPS,
  ADD_DIET as TEXT_ADD_DIET,
  TOTAL as TEXT_TOTAL,
  PORTIONS as TEXT_PORTIONS,
  RENAME as TEXT_RENAME,
  DELETE as TEXT_DELETE,
  INTOLERANCE as TEXT_INTOLERANCE,
  DIET_GROUP as TEXT_DIET_GROUP,
  EDIT as TEXT_EDIT,
  ADD as TEXT_ADD,
  NAME as TEXT_NAME,
  CONFIRM_CHANGES_ARE_LOST as TEXT_CONFIRM_CHANGES_ARE_LOST,
  UNSAVED_CHANGES as TEXT_UNSAVED_CHANGES,
  DISCARD_CHANGES as TEXT_DISCARD_CHANGES,
  RECALCULATE_PORTIONS as TEXT_RECALCULATE_PORTIONS,
  PORTIONS_RECALCULATED as TEXT_PORTIONS_RECALCULATED,
  AND as TEXT_AND,
  SAVE as TEXT_SAVE,
} from "../../../constants/text";

import useCustomStyles from "../../../constants/styles";
import {ButtonAction} from "../../Shared/global.interface";
import AlertMessage from "../../Shared/AlertMessage";
import Event from "../Event/event.class";
import EventGroupConfiguration from "./groupConfiguration.class";

import Firebase from "../../Firebase/firebase.class";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import {
  DialogType,
  SingleTextInputResult,
  useCustomDialog,
} from "../../Shared/customDialogContext";
import _ from "lodash";
import CustomSnackbar, {Snackbar} from "../../Shared/customSnackbar";
import {
  NavigationValuesContext,
  NavigationObject,
} from "../../Navigation/navigationContext";
import Action from "../../../constants/actions";
/* ===================================================================
// ============================== Global =============================
// =================================================================== */
/* ===================================================================
// ============================ Dispatcher ===========================
// =================================================================== */
enum ReducerActions {
  UPDATE_FIELD = "UPDATE_FIELD",
  UPDATE_GROUP_CONFIG = "UPDATE_GROUP_CONFIG",
  SAVE_EVENT_INIT = "SAVE_EVENT_INIT",
  SAVE_EVENT_SUCCESS = "SAVE_EVENT_SUCCESS",
  GENERIC_ERROR = "GENERIC_ERROR",
  SNACKBAR_SHOW = "SNACKBAR_SHOW",
  SNACKBAR_CLOSE = "SNACKBAR_CLOSE",
}

enum GroupConfigDimension {
  diet,
  intolerance,
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};
type State = {
  groupConfig: EventGroupConfiguration;
  isError: boolean;
  isLoading: boolean;
  error: Error | null;
  snackbar: Snackbar;
};

const inititialState: State = {
  groupConfig: EventGroupConfiguration.factory(),
  isError: false,
  isLoading: false,
  error: null,
  snackbar: {open: false, severity: "success", message: ""},
};

const groupConfigurationReducer = (
  state: State,
  action: DispatchAction
): State => {
  switch (action.type) {
    case ReducerActions.UPDATE_FIELD:
      return {
        ...state,
        groupConfig: {
          ...state.groupConfig,
          [action.payload.field]: action.payload.value,
        },
      };
    case ReducerActions.GENERIC_ERROR:
      return {
        ...state,
        isError: true,
        error: action.payload as Error,
      };
    case ReducerActions.UPDATE_GROUP_CONFIG:
      return {
        ...state,
        groupConfig: action.payload as EventGroupConfiguration,
      };
    case ReducerActions.SNACKBAR_SHOW:
      return {
        ...state,
        snackbar: {
          severity: action.payload.severity,
          message: action.payload.message,
          open: true,
        },
      };
    case ReducerActions.SNACKBAR_CLOSE:
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
interface EventGroupConfigurationPageProps {
  firebase: Firebase;
  authUser: AuthUser;
  event: Event;
  groupConfiguration?: EventGroupConfiguration;
  onConfirm?: ButtonAction;
  onCancel?: ButtonAction;
  onGroupConfigurationUpdate?: (
    groupConfiguration: EventGroupConfiguration
  ) => void;
}
const EventGroupConfigurationPage = ({
  firebase,
  authUser,
  event,
  groupConfiguration,
  onConfirm,
  onCancel,
  onGroupConfigurationUpdate,
}: EventGroupConfigurationPageProps) => {
  const classes = useCustomStyles();
  const theme = useTheme();
  const {customDialog} = useCustomDialog();
  const navigationValuesContext = React.useContext(NavigationValuesContext);

  const [state, dispatch] = React.useReducer(
    groupConfigurationReducer,
    inititialState
  );
  const [contextMenuAnchorElement, setContextMenuAnchorElement] =
    React.useState<HTMLElement | null>(null);
  const [contextMenuSelectedItem, setContextMenuSelectedItem] = React.useState({
    intoleranceUid: "",
    dietUid: "",
  });
  const [showUpdateConfigButtons, setShowUpdateConfigButtons] =
    React.useState(false);

  if (!state.groupConfig.uid) {
    // UID des Events aufnhemen
    dispatch({
      type: ReducerActions.UPDATE_FIELD,
      payload: {field: "uid", value: event.uid},
    });
    if (groupConfiguration) {
      dispatch({
        type: ReducerActions.UPDATE_GROUP_CONFIG,
        payload: groupConfiguration,
      });
    }
  }
  if (groupConfiguration) {
    if (
      // Wenn die Config von jemand anderem geändert wurde,
      // muss der State auch angepasst werden
      state.groupConfig.lastChange.date < groupConfiguration.lastChange.date
    ) {
      dispatch({
        type: ReducerActions.UPDATE_GROUP_CONFIG,
        payload: _.cloneDeep(groupConfiguration),
      });
    }
  }

  /* ------------------------------------------
  // Navigation-Handler
  // ------------------------------------------ */
  React.useEffect(() => {
    navigationValuesContext?.setNavigationValues({
      action: Action.NONE,
      object: NavigationObject.groupConfigruation,
    });
  }, []);
  /* ------------------------------------------
  // Weiter // Zurück
  // ------------------------------------------ */
  const saveEvent = (event: React.MouseEvent<HTMLButtonElement>) => {
    EventGroupConfiguration.save({
      firebase: firebase,
      authUser: authUser,
      groupConfig: state.groupConfig,
    }).then(() => {
      onConfirm?.onClick && onConfirm.onClick(event, state.groupConfig);
    });
  };
  const cancelCreate = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onCancel?.onClick) {
      if (state.groupConfig.totalPortions != 0) {
        const isConfirmed = await customDialog({
          dialogType: DialogType.Confirm,
          text: TEXT_CONFIRM_CHANGES_ARE_LOST,
          title: TEXT_UNSAVED_CHANGES,
          buttonTextConfirm: TEXT_DISCARD_CHANGES,
        });
        if (!isConfirmed) {
          return;
        }
        onCancel.onClick(event);
      } else {
        onCancel.onClick(event);
      }
    }
  };
  const onDiscardChanges = () => {
    dispatch({
      type: ReducerActions.UPDATE_GROUP_CONFIG,
      payload: _.cloneDeep(groupConfiguration as EventGroupConfiguration),
    });
  };
  const onRecalculatePortions = () => {
    if (!onGroupConfigurationUpdate) {
      return;
    }

    // Speichern
    EventGroupConfiguration.save({
      firebase: firebase,
      authUser: authUser,
      groupConfig: state.groupConfig,
    }).catch((error) =>
      dispatch({type: ReducerActions.GENERIC_ERROR, payload: error})
    );

    // Neue Mengen hochgeben, damit der Menüplan neu berechnet wird!
    onGroupConfigurationUpdate(state.groupConfig);

    // Meldung ausgeben
    dispatch({
      type: ReducerActions.SNACKBAR_SHOW,
      payload: {severity: "success", message: TEXT_PORTIONS_RECALCULATED},
    });
    setShowUpdateConfigButtons(false);
  };
  /* ------------------------------------------
  // Portion anpassen
  // ------------------------------------------ */
  const onPortionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let updatedGroupConfig = {...state.groupConfig};
    const changedField = event.target.id.split("_");
    const changedDiet = changedField[1];
    const changedIntolerance = changedField[2];

    updatedGroupConfig.portions[changedDiet][changedIntolerance] = Number.isNaN(
      parseInt(event.target.value)
    )
      ? 0
      : parseInt(event.target.value);

    updatedGroupConfig = EventGroupConfiguration.calculateTotals({
      groupConfig: updatedGroupConfig,
    });

    // Nur wenn die FX versorgt ist
    onGroupConfigurationUpdate && setShowUpdateConfigButtons(true);

    dispatch({
      type: ReducerActions.UPDATE_GROUP_CONFIG,
      payload: updatedGroupConfig,
    });
  };
  /* ------------------------------------------
  // Kontex-Menü-Befehle
  // ------------------------------------------ */
  const openIntoleranceContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    const pressedButton = event.currentTarget.id.split("_");
    setContextMenuSelectedItem({
      dietUid: "",
      intoleranceUid: pressedButton[2],
    });
    setContextMenuAnchorElement(event.currentTarget);
  };
  const openDietContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    const pressedButton = event.currentTarget.id.split("_");

    setContextMenuSelectedItem({
      intoleranceUid: "",
      dietUid: pressedButton[2],
    });
    setContextMenuAnchorElement(event.currentTarget);
  };
  const closeContextMenu = () => {
    setContextMenuAnchorElement(null);
    setContextMenuSelectedItem({intoleranceUid: "", dietUid: ""});
  };
  const onRenameItem = async () => {
    let userInput = {valid: false, input: ""} as SingleTextInputResult;

    userInput = (await customDialog({
      dialogType: DialogType.SingleTextInput,
      title: `${
        contextMenuSelectedItem.dietUid ? TEXT_DIET_GROUP : TEXT_INTOLERANCE
      } ${TEXT_EDIT}`,
      text: "",
      singleTextInputProperties: {
        initialValue: contextMenuSelectedItem.dietUid
          ? state.groupConfig.diets.entries[contextMenuSelectedItem.dietUid]
              .name
          : state.groupConfig.intolerances.entries[
              contextMenuSelectedItem.intoleranceUid
            ].name,
        textInputLabel: TEXT_NAME,
      },
    })) as SingleTextInputResult;

    if (userInput.valid && userInput.input != "") {
      if (contextMenuSelectedItem.dietUid) {
        const diets = {...state.groupConfig.diets};
        const diet = diets.entries[contextMenuSelectedItem.dietUid];
        diet.name = userInput.input;
        dispatch({
          type: ReducerActions.UPDATE_FIELD,
          payload: {field: "diets", value: diets},
        });
      } else if (contextMenuSelectedItem.intoleranceUid) {
        const updatedIntolerances = {...state.groupConfig.intolerances};
        const intolerance =
          updatedIntolerances.entries[contextMenuSelectedItem.intoleranceUid];
        intolerance.name = userInput.input;
        dispatch({
          type: ReducerActions.UPDATE_FIELD,
          payload: {field: "intolerances", value: updatedIntolerances},
        });
      }
    }
    // Nur wenn die FX versorgt ist
    onGroupConfigurationUpdate && setShowUpdateConfigButtons(true);
    setContextMenuAnchorElement(null);
    setContextMenuSelectedItem({intoleranceUid: "", dietUid: ""});
  };
  const onDeleteItem = () => {
    setContextMenuAnchorElement(null);
    let updatedGroupConfig = {...state.groupConfig};
    if (contextMenuSelectedItem.intoleranceUid) {
      updatedGroupConfig = EventGroupConfiguration.deleteIntolerance({
        groupConfig: state.groupConfig,
        intoleranceUidToDelete: contextMenuSelectedItem.intoleranceUid,
      });
    } else if (contextMenuSelectedItem.dietUid) {
      updatedGroupConfig = EventGroupConfiguration.deleteDiet({
        groupConfig: state.groupConfig,
        dietUidToDelete: contextMenuSelectedItem.dietUid,
      });
    }
    dispatch({
      type: ReducerActions.UPDATE_GROUP_CONFIG,
      payload: updatedGroupConfig,
    });
    // Nur wenn die FX versorgt ist
    onGroupConfigurationUpdate && setShowUpdateConfigButtons(true);
    setContextMenuSelectedItem({intoleranceUid: "", dietUid: ""});
  };
  const onAddItem = async (type: GroupConfigDimension) => {
    let userInput = {valid: false, input: ""} as SingleTextInputResult;

    userInput = (await customDialog({
      dialogType: DialogType.SingleTextInput,
      title: `${
        type == GroupConfigDimension.diet ? TEXT_DIET_GROUP : TEXT_INTOLERANCE
      } ${TEXT_ADD}`,
      text: "",
      singleTextInputProperties: {
        initialValue: "",
        textInputLabel: TEXT_NAME,
      },
    })) as SingleTextInputResult;

    if (userInput.valid && userInput.input != "") {
      if (type == GroupConfigDimension.diet) {
        let groupConfig = state.groupConfig;
        groupConfig = EventGroupConfiguration.addDietGroup({
          groupConfig: state.groupConfig,
          dietGroupName: userInput.input,
        });
        dispatch({
          type: ReducerActions.UPDATE_GROUP_CONFIG,
          payload: groupConfig,
        });
      } else if (type == GroupConfigDimension.intolerance) {
        let updatedGroupConfig = {...state.groupConfig};
        updatedGroupConfig = EventGroupConfiguration.addIntolerance({
          groupConfig: updatedGroupConfig,
          intoleranceName: userInput.input,
        });
        dispatch({
          type: ReducerActions.UPDATE_GROUP_CONFIG,
          payload: updatedGroupConfig,
        });
      }
    }
    // Nur wenn die FX versorgt ist
    onGroupConfigurationUpdate && setShowUpdateConfigButtons(true);
    setContextMenuAnchorElement(null);
    setContextMenuSelectedItem({intoleranceUid: "", dietUid: ""});
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (
    event: globalThis.Event | SyntheticEvent<any, globalThis.Event>,
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
      <Stack spacing={1}>
        {state.isError && (
          <AlertMessage
            error={state.error as Error}
            messageTitle={TEXT_ALERT_TITLE_WAIT_A_MINUTE}
          />
        )}

        <Backdrop sx={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <EventGroupConfigurationCard
          groupConfig={state.groupConfig}
          onAddItem={onAddItem}
          openIntoleranceContextMenu={openIntoleranceContextMenu}
          openDietContextMenu={openDietContextMenu}
          onPortionChange={onPortionChange}
          onDiscardChanges={onDiscardChanges}
          onRecalculatePortions={onRecalculatePortions}
          showUpdateConfigButtons={showUpdateConfigButtons}
        />
        <Box component="div" sx={{display: "flex", justifyContent: "flex-end"}}>
          {onCancel && (
            <Button variant="outlined" color="primary" onClick={cancelCreate}>
              {onCancel.buttonText}
            </Button>
          )}
          {onConfirm && (
            <Button
              variant="contained"
              color="primary"
              style={{
                marginLeft: theme.spacing(2),
              }}
              onClick={saveEvent}
            >
              {onConfirm.buttonText}
            </Button>
          )}
        </Box>
      </Stack>
      <Menu
        open={Boolean(contextMenuAnchorElement)}
        keepMounted
        anchorEl={contextMenuAnchorElement}
        onClose={closeContextMenu}
      >
        <MenuItem onClick={onRenameItem}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {TEXT_RENAME}
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={onDeleteItem}
          disabled={
            contextMenuSelectedItem.dietUid &&
            Object.keys(state.groupConfig.diets.entries).length == 1
              ? true
              : contextMenuSelectedItem.intoleranceUid &&
                Object.keys(state.groupConfig.intolerances.entries).length == 1
              ? true
              : false
          }
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {TEXT_DELETE}
          </Typography>
        </MenuItem>
      </Menu>
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ========================= Group-Config-Card =======================
// =================================================================== */
interface EventGroupConfigurationCardProps {
  groupConfig: EventGroupConfiguration;
  onAddItem: (type: GroupConfigDimension) => void;
  openIntoleranceContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
  openDietContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onPortionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDiscardChanges: () => void;
  onRecalculatePortions: () => void;
  showUpdateConfigButtons?: boolean;
}
const EventGroupConfigurationCard = ({
  groupConfig,
  onAddItem,
  openIntoleranceContextMenu,
  openDietContextMenu,
  onPortionChange,
  onDiscardChanges,
  onRecalculatePortions,
  showUpdateConfigButtons = false,
}: EventGroupConfigurationCardProps) => {
  const classes = useCustomStyles();
  const theme = useTheme();

  return (
    <div style={{overflowX: "scroll", minWidth: "750px"}}>
      <Card sx={classes.card}>
        <CardHeader
          title={TEXT_GROUP_CONFIGURATION_SETTINGS}
          subheader={TEXT_GROUP_CONFIGURATION_SETTINGS_DESCRIPTION}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={3}>
              <EventGroupConfigLeadColumn
                groupConfig={groupConfig}
                onAddIntolerance={() =>
                  onAddItem(GroupConfigDimension.intolerance)
                }
              />
            </Grid>
            <Grid xs={5}>
              <EventGroupConfigDietColumn
                groupConfig={groupConfig}
                openDietContextMenu={openDietContextMenu}
                onFieldChange={onPortionChange}
              />
            </Grid>
            <Grid xs={1} style={{justifyContent: "center"}}>
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
              >
                <Grid sx={classes.itemGroupConfigurationRow}>
                  <Tooltip title={TEXT_ADD_DIET}>
                    <IconButton
                      aria-label="Diät hinzufügen"
                      color="primary"
                      onClick={() => onAddItem(GroupConfigDimension.diet)}
                      size="large"
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
              <Box
                component="div"
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Divider
                  orientation="vertical"
                  flexItem
                  style={{height: "80%", display: "flex"}}
                />
              </Box>
            </Grid>
            <Grid xs={2}>
              <EventGroupConfigTotalColumn
                groupConfig={groupConfig}
                openIntoleranceContextMenu={openIntoleranceContextMenu}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {showUpdateConfigButtons && (
        <Box
          component="div"
          style={{
            marginTop: theme.spacing(2),
            justifyContent: "flex-end",
            display: "flex",
          }}
        >
          <Button
            color="primary"
            variant="outlined"
            onClick={onDiscardChanges}
            sx={{marginRight: theme.spacing(2)}}
          >
            {TEXT_DISCARD_CHANGES}
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={onRecalculatePortions}
          >
            {TEXT_SAVE} {TEXT_AND} {TEXT_RECALCULATE_PORTIONS}
          </Button>
        </Box>
      )}
    </div>
  );
};
/* ===================================================================
// ============================ Lead-Spalte ==========================
// =================================================================== */
interface EventGroupConfigLeadColumnProps {
  groupConfig: EventGroupConfiguration;
  onAddIntolerance: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const EventGroupConfigLeadColumn = ({
  groupConfig,
  onAddIntolerance,
}: EventGroupConfigLeadColumnProps) => {
  const classes = useCustomStyles();

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid sx={classes.itemGroupConfigurationRow}>
          <Typography variant="h6" component="h2">
            {TEXT_GROUPS}
          </Typography>
        </Grid>
        {groupConfig.intolerances.order.map((intoleranceUid) => (
          <Grid
            sx={classes.itemGroupConfigurationRow}
            xs={12}
            key={"intolerance_grid_" + intoleranceUid}
          >
            <Typography variant="body1">
              {groupConfig.intolerances.entries[intoleranceUid].name}
            </Typography>
          </Grid>
        ))}
        <Grid
          sx={classes.itemGroupConfigurationRow}
          style={{alignItems: "center"}}
        >
          <Button
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddIntolerance}
            style={{whiteSpace: "nowrap", minWidth: "auto"}}
          >
            {TEXT_INTOLERANCE}
          </Button>
        </Grid>

        <Divider flexItem />

        <Grid xs={12}>
          <Divider />
        </Grid>
        <Grid sx={classes.itemGroupConfigurationRow}>
          <Typography variant="h6" component="h2">
            {TEXT_TOTAL}
          </Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Diät-Spalte ===========================
// =================================================================== */
interface EventGroupConfigDietColumnProps {
  groupConfig: EventGroupConfiguration;
  openDietContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const EventGroupConfigDietColumn = ({
  groupConfig,
  openDietContextMenu,
  onFieldChange,
}: EventGroupConfigDietColumnProps) => {
  const classes = useCustomStyles();

  const gridSize = Math.floor(
    12 / Object.keys(groupConfig.diets.entries).length
  ) as GridSize;
  return (
    <React.Fragment>
      <Grid container spacing={2}>
        {groupConfig.diets.order.map((dietUid) => (
          <Grid xs={gridSize} key={"grid_diet" + dietUid}>
            <Grid container>
              <Grid
                xs={11}
                sx={[classes.itemGroupConfigurationRow, {flexGrow: 1}]}
              >
                <Typography variant="h6" component="h2">
                  {groupConfig.diets.entries[dietUid].name}
                </Typography>
              </Grid>
              <Grid xs={1} sx={classes.itemGroupConfigurationRow}>
                <IconButton
                  id={"MoreBtn_diet_" + dietUid}
                  aria-label="position-options"
                  style={{paddingRight: "0px"}}
                  size="small"
                  onClick={openDietContextMenu}
                  sx={{alignContent: "end"}}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>

            {groupConfig.intolerances.order.map((intoleranceUid) => (
              <Grid
                xs={12}
                sx={classes.itemGroupConfigurationRow}
                key={
                  "grid_column_" + dietUid + "_intolerance_" + intoleranceUid
                }
              >
                <TextField
                  key={"portions_" + dietUid + "_" + intoleranceUid}
                  id={"portions_" + dietUid + "_" + intoleranceUid}
                  label={TEXT_PORTIONS}
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{
                    inputProps: {
                      min: 0,
                      step: 1,
                    },
                    inputComponent: "input",
                  }}
                  onWheel={(event) =>
                    event.target instanceof HTMLElement && event.target.blur()
                  }
                  value={groupConfig.portions[dietUid][intoleranceUid]}
                  onChange={onFieldChange}
                />
              </Grid>
            ))}

            <Grid xs={12} sx={classes.itemGroupConfigurationRow} />
            {/* Leer da Button nicht nötig */}
            <Grid xs={12}>
              <Divider flexItem />
            </Grid>
            <Grid xs={12} sx={classes.itemGroupConfigurationRow}>
              <TextField
                key={"total_diet_" + dietUid}
                id={"total_diet_" + dietUid}
                label={TEXT_PORTIONS}
                variant="outlined"
                disabled
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <strong>=</strong>
                    </InputAdornment>
                  ),
                }}
                value={groupConfig.diets.entries[dietUid].totalPortions}
              />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Diät-Spalte ===========================
// =================================================================== */
interface EventGroupConfigTotalColumnProps {
  groupConfig: EventGroupConfiguration;
  openIntoleranceContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
}
const EventGroupConfigTotalColumn = ({
  groupConfig,
  openIntoleranceContextMenu,
}: EventGroupConfigTotalColumnProps) => {
  const classes = useCustomStyles();

  return (
    <React.Fragment>
      <Grid container>
        <Grid sx={classes.itemGroupConfigurationRow}>
          <Typography variant="h6" component="h2">
            {TEXT_TOTAL}
          </Typography>
        </Grid>
        {groupConfig.intolerances.order.map((intoleranceUid) => (
          <React.Fragment key={"grid_total_colum_" + intoleranceUid}>
            <Grid
              sx={classes.itemGroupConfigurationRow}
              xs={11}
              key={"intolerance_grid_" + intoleranceUid}
            >
              <TextField
                label={TEXT_PORTIONS}
                variant="outlined"
                size="small"
                fullWidth
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <strong>=</strong>
                    </InputAdornment>
                  ),
                }}
                value={
                  groupConfig.intolerances.entries[intoleranceUid].totalPortions
                }
              />
            </Grid>
            <Grid
              xs={1}
              sx={classes.itemGroupConfigurationRow}
              key={"intolerance_grid_moreBtn_" + intoleranceUid}
            >
              <IconButton
                id={"MoreBtn_intolerance_" + intoleranceUid}
                aria-label="position-options"
                onClick={openIntoleranceContextMenu}
                size="large"
              >
                <MoreVertIcon />
              </IconButton>
            </Grid>
          </React.Fragment>
        ))}
        <Grid
          xs={12}
          sx={classes.itemGroupConfigurationRow}
          style={{alignItems: "center"}}
        >
          <div> </div>
        </Grid>

        <Divider flexItem />

        <Grid xs={12}>
          <Divider />
        </Grid>
        <Grid sx={classes.itemGroupConfigurationRow}>
          <TextField
            label={TEXT_PORTIONS}
            variant="outlined"
            size="small"
            fullWidth
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <strong>=</strong>
                </InputAdornment>
              ),
            }}
            value={groupConfig.totalPortions}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default EventGroupConfigurationPage;
