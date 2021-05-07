import React from "react";
import { compose } from "recompose";
import { useHistory } from "react-router";
import { useTheme } from "@material-ui/core/styles";

import useMediaQuery from "@material-ui/core/useMediaQuery";

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import Pagination from "@material-ui/lab/Pagination";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Drawer from "@material-ui/core/Drawer";

import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import CardMedia from "@material-ui/core/CardMedia";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
// import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import CakeIcon from "@material-ui/icons/Cake";
import UpdateIcon from "@material-ui/icons/Update";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import RestaurantIcon from "@material-ui/icons/Restaurant";
import InputIcon from "@material-ui/icons/Input";

import * as ROUTES from "../../constants/routes";
import * as ACTIONS from "../../constants/actions";
import * as TEXT from "../../constants/text";
import * as DEFAULT_VALUES from "../../constants/defaultValues";
import * as FIREBASE_MESSAGES from "../../constants/firebaseMessages";
import Event from "../Event/event.class";
import Recipe from "../Recipe/recipe.class";
import Menuplan from "./menuplan.class";
import MenuplanPdf from "./menuplanPdf";
import Utils from "../Shared/utils.class";
import RecipeSearchDrawer from "../Recipe/recipeDrawer";
import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import AlertMessage from "../Shared/AlertMessage";
import CustomSnackbar from "../Shared/customSnackbar";
import { RecipeSearch } from "../Recipe/recipes";
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
  MENUPLAN_FETCH_INIT: "MENUPLAN_FETCH_INIT",
  MENUPLAN_FETCH_SUCCESS: "MENUPLAN_FETCH_SUCCESS",
  MENUPLAN_SAVE_SUCCESS: "MENUPLAN_SAVE_SUCCESS",
  MENUPLAN_CLOSE_SNACKBAR: "MENUPLAN_CLOSE_SNACKBAR",
  RECIPES_FETCH_SUCCESS: "RECIPES_FETCH_SUCCESS",
  EVENT_FETCH_SUCCESS: "EVENT_FETCH_SUCCES",
  PAGINATION_CHANGE: "PAGINATION_CHANGE",
  SETTINGS_CHANGE: "SETTINGS_CHANGE",
  MEAL_ADD: "MEAL_ADD",
  MEAL_CHANGE: "MEAL_CHANGE",
  MEAL_DELETE: "MEAL_DELETE",
  MEAL_POS_UP: "MEAL_POS_UP",
  MEAL_POS_DOWN: "MEAL_POS_DOWN",
  NOTE_ADD: "NOTE_ADD",
  NOTE_CHANGE: "NOTE_CHANGE",
  NOTE_DELETE: "NOTE_DELETE",
  RECIPE_ADD: "RECIPE_ADD",
  RECIPE_CHANGE: "RECIPE_CHANGE",
  RECIPE_DELETE: "RECIPE_DELETE",
  GENERIC_ERROR: "GENERIC_ERROR",
};

export const NOTE_TYPES = {
  BIRTHDAY: {
    key: 1,
    text: TEXT.MENUPLAN_NOTE_TYPE_BIRTHDAY,
    icon: <CakeIcon />,
  },
  PREPARE: {
    key: 2,
    text: TEXT.MENUPLAN_NOTE_TYPE_PREPARE,
    icon: <UpdateIcon />,
  },
  SHOPPING: {
    key: 3,
    text: TEXT.MENUPLAN_NOTE_TYPE_SHOPPING,
    icon: <ShoppingCartIcon />,
  },
  IDEA: {
    key: 4,
    text: TEXT.MENUPLAN_NOTE_TYPE_IDEA,
    icon: <EmojiObjectsIcon />,
  },
  HINT: {
    key: 5,
    text: TEXT.MENUPLAN_NOTE_TYPE_HINT,
    icon: <PriorityHighIcon />,
  },
};

const COLUMN_SETTINGS = [
  // Die Anzahl Spalten beziehen sich auf die Anzahl angezeiten
  // Tage. Die Mahlzeitspalte füllt die Differenz zu 12 auf
  // --> dayColumnWidth * noOfColumns + mealColumnWidth = 12
  { noOfColumns: 1, mealColumnWidth: 4, dayColumnWidth: 8 },
  { noOfColumns: 2, mealColumnWidth: 4, dayColumnWidth: 4 },
  { noOfColumns: 3, mealColumnWidth: 3, dayColumnWidth: 3 },
  { noOfColumns: 4, mealColumnWidth: 4, dayColumnWidth: 2 },
  { noOfColumns: 5, mealColumnWidth: 2, dayColumnWidth: 2 },
  { noOfColumns: 11, mealColumnWidth: 1, dayColumnWidth: 1 },
];

const DIALOG_VALIDATION = {
  hasError: false,
  errorText: "",
};

const ACTION_TYPE = {
  EDIT: "edit",
  NEW: "new",
};

const menuplanReducer = (state, action) => {
  let tmpNotes = [];
  let tmpRecipes = [];
  let note = null;
  let mealRecipe = null;

  switch (action.type) {
    case REDUCER_ACTIONS.MENUPLAN_FETCH_INIT:
      // Ladeanezeige
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.EVENT_FETCH_SUCCESS:
      // Event setzen
      return {
        ...state,
        event: action.payload,
      };
    case REDUCER_ACTIONS.MENUPLAN_FETCH_SUCCESS:
      // Menuplan setzen
      return {
        ...state,
        data: action.payload,
        paginationControl: {
          ...state.paginationControl,
          arrayStartIndex: defineArrayStartIndex({
            paginationControl: state.paginationControl,
            settings: state.settings,
          }),
          arrayEndIndex: defineArrayEndIndex({
            paginationControl: state.paginationControl,
            settings: state.settings,
          }),
          noOfElements: defineNoOfPaginatorItems({
            noOfDates: action.payload.dates.length,
            noOfColumns: state.settings.noOfColumns,
          }),
          columnSettings: getColumnSettings(state.settings.noOfColumns),
        },
        isLoading: false,
      };
    case REDUCER_ACTIONS.MENUPLAN_SAVE_SUCCESS:
      // Speicher-Meldung anzeigen
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: TEXT.SAVE_SUCCESS,
          open: true,
        },
      };

    case REDUCER_ACTIONS.PAGINATION_CHANGE:
      // Änderung Paginator
      return {
        ...state,
        paginationControl: {
          ...state.paginationControl,
          arrayStartIndex: defineArrayStartIndex({
            paginationControl: state.paginationControl,
            settings: state.settings,
            actualElement: action.payload,
          }),
          arrayEndIndex: defineArrayEndIndex({
            paginationControl: state.paginationControl,
            settings: state.settings,
            actualElement: action.payload,
          }),
          actualElement: action.payload,
        },
      };
    case REDUCER_ACTIONS.SETTINGS_CHANGE:
      // Einstellungen wurden geändert
      return {
        ...state,
        paginationControl: {
          ...state.paginationControl,
          arrayStartIndex: defineArrayStartIndex({
            paginationControl: state.paginationControl,
            settings: action.payload,
          }),
          arrayEndIndex: defineArrayEndIndex({
            paginationControl: state.paginationControl,
            settings: action.payload,
          }),
          noOfElements: defineNoOfPaginatorItems({
            noOfDates: state.data.dates.length,
            noOfColumns: action.payload.noOfColumns,
          }),
          columnSettings: getColumnSettings(action.payload.noOfColumns),
        },
        settings: action.payload,
      };
    case REDUCER_ACTIONS.MEAL_ADD:
      // Neue Mahlzeit hinzufügen
      let meal = Menuplan.createMeal({
        meals: state.data.meals,
        mealName: action.payload.name,
      });
      let tmpMeal = state.data.meals;
      tmpMeal.push(meal);
      // let tmpPlan = Menuplan.addMealToPlan({
      //   plan: state.data.plan,
      //   meal: meal,
      // });

      return {
        ...state,
        data: {
          ...state.data,
          meals: tmpMeal,
        },
      };
    case REDUCER_ACTIONS.MEAL_CHANGE:
      // Mahlzeit wurde geändert
      return {
        ...state,
        data: {
          ...state.data,
          meals: state.data.meals.map((meal) => {
            if (meal.uid === action.payload.uid) {
              meal.name = action.payload.name;
            }
            return meal;
          }),
        },
      };
    case REDUCER_ACTIONS.MEAL_POS_UP:
      // Mahlzeit eine Position hoch schieben
      return {
        ...state,
        data: {
          ...state.data,
          meals: Menuplan.moveMealUp({
            meals: state.data.meals,
            meal: action.payload,
          }),
        },
      };
    case REDUCER_ACTIONS.MEAL_POS_DOWN:
      // Mahlzeit eine Position runter schieben
      return {
        ...state,
        data: {
          ...state.data,
          meals: Menuplan.moveMealDown({
            meals: state.data.meals,
            meal: action.payload,
          }),
        },
      };
    case REDUCER_ACTIONS.MEAL_DELETE:
      // Mahlzeit löschen
      return {
        ...state,
        data: {
          ...state.data,
          meals: state.data.meals.filter(
            (meal) => meal.uid !== action.payload.uid
          ),
        },
      };
    case REDUCER_ACTIONS.NOTE_ADD:
      // Neue Notiz hinzugefügt
      note = Menuplan.createNote({
        date: action.payload.date,
        mealUid: action.payload.mealUid,
        type: action.payload.type,
        text: action.payload.text,
      });
      tmpNotes = state.data.notes;
      tmpNotes.push(note);
      return {
        ...state,
        data: {
          ...state.data,
          notes: tmpNotes,
        },
      };
    case REDUCER_ACTIONS.NOTE_CHANGE:
      // Notiz geändert
      tmpNotes = state.data.notes;

      note = tmpNotes.find((note) => note.uid === action.payload.uid);
      note.date = action.payload.date;
      note.mealUid = action.payload.mealUid;
      note.type = action.payload.type;
      note.text = action.payload.text;

      return {
        ...state,
        data: {
          ...state.data,
          notes: tmpNotes,
        },
      };
    case REDUCER_ACTIONS.NOTE_DELETE:
      // Notiz löschen
      return {
        ...state,
        data: {
          ...state.data,
          notes: state.data.notes.filter((note) => note.uid !== action.payload),
        },
      };
    case REDUCER_ACTIONS.RECIPES_FETCH_SUCCESS:
      // Rezepte geholt
      return {
        ...state,
        allRecipes: action.payload,
        isLoading: false,
        isError: false,
      };
    case REDUCER_ACTIONS.RECIPE_ADD:
      // Neues Rezept hinzugefügt
      mealRecipe = Menuplan.createMealRecipe({
        date: action.payload.date,
        mealUid: action.payload.mealUid,
        recipeUid: action.payload.recipeUid,
        recipeName: action.payload.recipeName,
        pictureSrc: action.payload.pictureSrc,
        noOfServings: action.payload.noOfServings,
      });
      tmpRecipes = state.data.recipes;
      tmpRecipes.push(mealRecipe);
      return {
        ...state,
        data: {
          ...state.data,
          recipes: tmpRecipes,
        },
      };
    case REDUCER_ACTIONS.RECIPE_CHANGE:
      // Rezept geändert
      tmpRecipes = state.data.recipes;

      mealRecipe = tmpRecipes.find(
        (mealRecipe) => mealRecipe.uid === action.payload.uid
      );
      mealRecipe.date = action.payload.date;
      mealRecipe.mealUid = action.payload.mealUid;
      mealRecipe.noOfServings = action.payload.noOfServings;

      return {
        ...state,
        data: {
          ...state.data,
          recipes: tmpRecipes,
        },
      };
    case REDUCER_ACTIONS.RECIPE_DELETE:
      // Rezept löschen
      return {
        ...state,
        data: {
          ...state.data,
          recipes: state.data.recipes.filter(
            (mealRecipe) => mealRecipe.uid !== action.payload
          ),
        },
      };
    case REDUCER_ACTIONS.MENUPLAN_CLOSE_SNACKBAR:
      //Snackbar schliessen
      return {
        ...state,
        isError: false,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case REDUCER_ACTIONS.GENERIC_ERROR:
      // Allgemeiner Fehler
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
/* ------------------------------------------
// Anzahl Elemente im Paginator bestimmen
// ------------------------------------------ */
const defineNoOfPaginatorItems = ({ noOfDates, noOfColumns }) => {
  return Math.ceil(noOfDates / noOfColumns);
};
/* ------------------------------------------
// Start für Loop (über Array definieren)
// ------------------------------------------ */
const defineArrayStartIndex = ({
  paginationControl,
  settings,
  actualElement,
}) => {
  if (!actualElement) {
    actualElement = paginationControl.actualElement;
  }
  return (actualElement - 1) * settings.noOfColumns;
};
/* ------------------------------------------
// End für Loop (über Array definieren)
// ------------------------------------------ */
const defineArrayEndIndex = ({
  paginationControl,
  settings,
  actualElement,
}) => {
  if (!actualElement) {
    actualElement = paginationControl.actualElement;
  }
  return actualElement * settings.noOfColumns - 1;
};
/* ------------------------------------------
// Spalteneinstellung finden
// ------------------------------------------ */
const getColumnSettings = (noOfColumns) => {
  return COLUMN_SETTINGS.find(
    (columnSetting) => columnSetting.noOfColumns === noOfColumns
  );
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const MenuplanPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <MenuPlanBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const MenuPlanBase = ({ props, authUser }) => {
  const classes = useStyles();
  const theme = useTheme();

  const firebase = props.firebase;
  const { push } = useHistory();

  let urlUid;

  let isXsBreakpoints = useMediaQuery(theme.breakpoints.down("xs"), {
    noSsr: true,
  });
  let isSmBreakpoint = useMediaQuery(theme.breakpoints.down("sm"), {
    noSsr: true,
  });
  let isMdBreakpoint = useMediaQuery(theme.breakpoints.down("md"), {
    noSsr: true,
  });
  let isLgBreakpoint = useMediaQuery(theme.breakpoints.down("lg"), {
    noSsr: true,
  });
  let isXlBreakpoint = useMediaQuery(theme.breakpoints.down("xl"), {
    noSsr: true,
  });

  // xs, sm, md, lg, and xl
  const [menuplan, dispatchMenuplan] = React.useReducer(menuplanReducer, {
    data: { dates: [], meals: [], notes: [], recipes: [] },
    event: {},
    settings: {
      noOfColumns: isXsBreakpoints
        ? DEFAULT_VALUES.MENUPLAN_NO_OF_COLUMS_MOBILE
        : isMdBreakpoint
        ? DEFAULT_VALUES.MENUPLAN_NO_OF_COLUMS_NORMAL
        : isLgBreakpoint
        ? DEFAULT_VALUES.MENUPLAN_NO_OF_COLUMS_LARGE
        : DEFAULT_VALUES.MENUPLAN_NO_OF_COLUMS_X_LARGE,
      showRecipePictures: false,
    },
    paginationControl: {
      arrayStartIndex: 0,
      arrayEndIndex: 0,
      actualElement: 1,
      noOfElements: 1,
      columnSettings: getColumnSettings(
        isXsBreakpoints
          ? DEFAULT_VALUES.MENUPLAN_NO_OF_COLUMS_MOBILE
          : isMdBreakpoint
          ? DEFAULT_VALUES.MENUPLAN_NO_OF_COLUMS_NORMAL
          : isLgBreakpoint
          ? DEFAULT_VALUES.MENUPLAN_NO_OF_COLUMS_LARGE
          : DEFAULT_VALUES.MENUPLAN_NO_OF_COLUMS_X_LARGE
      ),
    },
    allRecipes: [],
    isLoading: false,
    isError: false,
    error: null,
    snackbar: { open: false, severity: "success", message: "" },
  });

  const [settingPopUpValues, setSettingPopUpValues] = React.useState({
    open: false,
  });
  const [mealsPopUpValues, setMealsPopUpValues] = React.useState({
    actionType: "",
    open: false,
    meal: null,
  });
  const [notePopUpValues, setNotePopUpValues] = React.useState({
    actionType: "",
    open: false,
    note: null,
  });
  const [recipePopUpValues, setRecipePopUpValues] = React.useState({
    mealRecipe: null,
    actionType: "",
    open: false,
  });

  const [recipeSearchDrawer, setRecipeSearchDrawer] = React.useState({
    anchor: useMediaQuery(theme.breakpoints.down("xs"), { noSsr: true })
      ? "bottom"
      : "right",
    open: false,
  });

  if (props.location.state && !menuplan.event.name) {
    dispatchMenuplan({
      type: REDUCER_ACTIONS.EVENT_FETCH_SUCCESS,
      payload: props.location.state.event,
    });
  }

  if (!urlUid) {
    urlUid = props.match.params.id;
  }
  /* ------------------------------------------
  // Daten aus DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatchMenuplan({ type: REDUCER_ACTIONS.MENUPLAN_FETCH_INIT });

    if (!props.location.state) {
      // Event nachlesen
      Event.getEvent({ firebase: firebase, uid: urlUid })
        .then((result) => {
          dispatchMenuplan({
            type: REDUCER_ACTIONS.EVENT_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          console.error(error);
          dispatchMenuplan({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    }

    // Menuplan lesen wenn leer, neuer generieren mit Event
    Menuplan.getMenuplan({ firebase: firebase, uid: urlUid })
      .then((result) => {
        // Wenn leer, neuen Menuplan generieren
        if (!Object.keys(result).length) {
          result = Menuplan.factory({ event: menuplan.event });
        }
        dispatchMenuplan({
          type: REDUCER_ACTIONS.MENUPLAN_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatchMenuplan({
          type: REDUCER_ACTIONS.GENERIC_ERROR,
          payload: error,
        });
      });
  }, []);
  /* ------------------------------------------
  // Daten speichern
  // ------------------------------------------ */
  const onSave = () => {
    Menuplan.save({
      firebase: firebase,
      uid: menuplan.event.uid,
      dates: menuplan.data.dates,
      meals: menuplan.data.meals,
      notes: menuplan.data.notes,
      recipes: menuplan.data.recipes,
      eventName: menuplan.event.name,
      createdAt: menuplan.data.createdAt,
      createdFromUid: menuplan.data.createdFromUid,
      createdFromDisplayName: menuplan.data.createdFromDisplayName,
      authUser: authUser,
    }).catch((error) => {
      dispatchMenuplan({
        type: REDUCER_ACTIONS.GENERIC_ERROR,
        payload: error,
      });
      return;
    });

    dispatchMenuplan({
      type: REDUCER_ACTIONS.MENUPLAN_SAVE_SUCCESS,
    });
  };

  /* ------------------------------------------
  // Postizettel öffnen
  // ------------------------------------------ */
  const onShoppinglistClick = () => {
    push({
      pathname: `${ROUTES.SHOPPINGLIST}/${menuplan.event.uid}`,
      state: {
        action: ACTIONS.VIEW,
        menuplan: menuplan.data,
        event: menuplan.event,
      },
    });
  };
  /* ------------------------------------------
  //  Mengenberechnung öffnen
  // ------------------------------------------ */
  const onQuantityCalculation = (xy) => {
    push({
      pathname: `${ROUTES.QUANTITY_CALCULATION}/${menuplan.event.uid}`,
      state: {
        action: ACTIONS.VIEW,
        menuplan: menuplan.data,
        event: menuplan.event,
      },
    });
  };
  /* ------------------------------------------
  // Menüplan als PDF
  // ------------------------------------------ */
  const onPrintversion = async () => {
    const doc = (
      <MenuplanPdf
        event={menuplan.event}
        menuplan={menuplan.data}
        noOfColums={menuplan.settings.noOfColums}
        authUser={authUser}
      />
    );
    const asPdf = pdf([]);
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    saveAs(blob, TEXT.MENUPLAN + " " + menuplan.event.name + TEXT.SUFFIX_PDF);
  };
  /* ------------------------------------------
  // Mahlzeit hinzufügen
  // ------------------------------------------ */
  const onMealAdd = () => {
    setMealsPopUpValues({
      ...mealsPopUpValues,
      actionType: ACTION_TYPE.NEW,
      open: true,
      meal: null,
    });
  };
  /* ------------------------------------------
  // Malzeit schliessen
  // ------------------------------------------ */
  const onMealClose = () => {
    setMealsPopUpValues({ ...mealsPopUpValues, meal: null, open: false });
  };
  /* ------------------------------------------
  // Mahlzeit wurde geändert
  // ------------------------------------------ */
  const onMealChange = (dialogValues) => {
    switch (mealsPopUpValues.actionType) {
      case ACTION_TYPE.EDIT:
        dispatchMenuplan({
          type: REDUCER_ACTIONS.MEAL_CHANGE,
          payload: dialogValues,
        });
        break;
      case ACTION_TYPE.NEW:
        dispatchMenuplan({
          type: REDUCER_ACTIONS.MEAL_ADD,
          payload: dialogValues,
        });
        break;
      default:
        return;
    }
    setMealsPopUpValues({ ...mealsPopUpValues, meal: null, open: false });
  };
  /* ------------------------------------------
  // Notiz PopUp öffnen - Neu
  // ------------------------------------------ */
  const onNoteAdd = () => {
    setNotePopUpValues({
      ...notePopUpValues,
      actionType: ACTION_TYPE.NEW,
      open: true,
      note: null,
    });
  };
  /* ------------------------------------------
  // Notiz PopUp öffnen - Ändern
  // ------------------------------------------ */
  const onNoteEdit = (event) => {
    let pressedMenuItem = event.currentTarget.id.split("_");

    switch (pressedMenuItem[0]) {
      case ACTIONS.EDIT:
        let note = menuplan.data.notes.find(
          (note) => note.uid === pressedMenuItem[1]
        );
        setNotePopUpValues({
          ...notePopUpValues,
          actionType: ACTION_TYPE.EDIT,
          open: true,
          note: note,
        });
        break;
      case ACTIONS.DELETE:
        dispatchMenuplan({
          type: REDUCER_ACTIONS.NOTE_DELETE,
          payload: pressedMenuItem[1],
        });
        break;
    }
  };
  /* ------------------------------------------
  // Notiz PopUp schliessen
  // ------------------------------------------ */
  const onNoteClose = () => {
    setNotePopUpValues({ ...notePopUpValues, note: null, open: false });
  };
  /* ------------------------------------------
  // Notiz wurde geändert/erfasst
  // ------------------------------------------ */
  const onNoteChange = (dialogValues) => {
    switch (notePopUpValues.actionType) {
      case ACTION_TYPE.EDIT:
        dispatchMenuplan({
          type: REDUCER_ACTIONS.NOTE_CHANGE,
          payload: dialogValues,
        });
        break;
      case ACTION_TYPE.NEW:
        dispatchMenuplan({
          type: REDUCER_ACTIONS.NOTE_ADD,
          payload: dialogValues,
        });
        break;
      default:
        return;
    }
    setNotePopUpValues({ ...notePopUpValues, note: null, open: false });
  };
  /* ------------------------------------------
  // Einstellungen öffnen
  // ------------------------------------------ */
  const onSettingOpen = () => {
    setSettingPopUpValues({ ...settingPopUpValues, open: true });
  };
  /* ------------------------------------------
  // Einstellungen schliessen
  // ------------------------------------------ */
  const onSettingClose = () => {
    setSettingPopUpValues({ ...settingPopUpValues, open: false });
  };
  /* ------------------------------------------
  // Einstellungen wurden geändert
  // ------------------------------------------ */
  const onSettingChange = (dialogValues) => {
    dispatchMenuplan({
      type: REDUCER_ACTIONS.SETTINGS_CHANGE,
      payload: dialogValues,
    });
    setSettingPopUpValues({ ...settingPopUpValues, open: false });
  };
  /* ------------------------------------------
  // Paginator Change
  // ------------------------------------------ */
  const onPaginationChange = (event, value) => {
    dispatchMenuplan({
      type: REDUCER_ACTIONS.PAGINATION_CHANGE,
      payload: value,
    });
  };
  /* ------------------------------------------
  // Mahlzeit Aktion
  // ------------------------------------------ */
  const handleMealAction = (event, meal) => {
    let pressedMenuItem = event.currentTarget.id.split("_");
    let dipatcherType;
    switch (pressedMenuItem[0]) {
      case ACTIONS.EDIT:
        setMealsPopUpValues({
          ...mealsPopUpValues,
          actionType: ACTION_TYPE.EDIT,
          open: true,
          meal: meal,
        });
        return;
      case ACTIONS.MOVE_UP:
        dipatcherType = REDUCER_ACTIONS.MEAL_POS_UP;
        break;
      case ACTIONS.MOVE_DOWN:
        dipatcherType = REDUCER_ACTIONS.MEAL_POS_DOWN;
        break;
      case ACTIONS.DELETE:
        dipatcherType = REDUCER_ACTIONS.MEAL_DELETE;
        break;
      default:
        console.error("Unbekannter pressedMenuItem: ", pressedMenuItem[0]);
        return;
    }

    dispatchMenuplan({
      type: dipatcherType,
      payload: meal,
    });
  };
  /* ------------------------------------------
  // Rezept anzeigen 
  // ------------------------------------------ */
  const onRecipeShow = (event, recipe) => {
    push({
      pathname: `${ROUTES.RECIPE}/${recipe.uid}`,
      state: {
        action: ACTIONS.VIEW,
        recipeName: recipe.name,
        recipePictureSrc: recipe.pictureSrc,
      },
    });
  };
  /* ------------------------------------------
  // Rezept hinzufügen - Drawer öffnen 
  // ------------------------------------------ */
  const onRecipeSearch = async () => {
    if (menuplan.allRecipes.length === 0) {
      // Rezepte lesen
      dispatchMenuplan({ type: REDUCER_ACTIONS.MENUPLAN_FETCH_INIT });

      await Recipe.getRecipes({ firebase: firebase })
        .then((result) => {
          // Object in Array umwandeln
          let recipes = [];
          Object.keys(result).forEach((uid) => {
            recipes.push({
              uid: uid,
              name: result[uid].name,
              pictureSrc: result[uid].pictureSrc,
              tags: result[uid].tags,
            });
          });

          recipes = Utils.sortArrayWithObjectByText({
            list: recipes,
            attributeName: "name",
          });

          dispatchMenuplan({
            type: REDUCER_ACTIONS.RECIPES_FETCH_SUCCESS,
            payload: recipes,
          });
        })
        .catch((error) => {
          dispatchMenuplan({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    }

    setRecipeSearchDrawer({ ...recipeSearchDrawer, open: true });
  };
  /* ------------------------------------------
  // Rezept hinzufügen - PopUp öffnen 
  // ------------------------------------------ */
  const onRecipeAdd = (event, recipe) => {
    setRecipePopUpValues({
      mealRecipe: {
        date: "",
        mealUid: "",
        recipeUid: recipe.uid,
        recipeName: recipe.name,
        pictureSrc: recipe.pictureSrc,
        noOfServings: menuplan.event.participants,
        uid: "",
      },
      actionType: ACTION_TYPE.NEW,
      open: true,
    });
    setRecipeSearchDrawer({ ...recipeSearchDrawer, open: false });
  };
  /* ------------------------------------------
  // Rezept PopUp öffnen - Ändern
  // ------------------------------------------ */
  const onRecipeEdit = (event) => {
    let pressedMenuItem = event.currentTarget.id.split("_");
    let mealRecipe = null;

    switch (pressedMenuItem[0]) {
      case ACTIONS.EDIT:
        mealRecipe = menuplan.data.recipes.find(
          (mealRecipe) => mealRecipe.uid === pressedMenuItem[1]
        );

        setRecipePopUpValues({
          mealRecipe: {
            date: mealRecipe.date,
            mealUid: mealRecipe.mealUid,
            recipeUid: mealRecipe.recipeUid,
            recipeName: mealRecipe.recipeName,
            pictureSrc: mealRecipe.pictureSrc,
            noOfServings: mealRecipe.noOfServings,
            uid: mealRecipe.uid,
          },
          actionType: ACTION_TYPE.EDIT,
          open: true,
        });
        break;
      case ACTIONS.VIEW:
        //Rezept anzeigen
        mealRecipe = menuplan.data.recipes.find(
          (mealRecipe) => mealRecipe.uid === pressedMenuItem[1]
        );

        push({
          pathname: `${ROUTES.RECIPE}/${mealRecipe.recipeUid}`,
          state: {
            action: ACTIONS.VIEW,
          },
        });
        break;
      case ACTIONS.DELETE:
        // Rezept löschen
        dispatchMenuplan({
          type: REDUCER_ACTIONS.RECIPE_DELETE,
          payload: pressedMenuItem[1],
        });
        break;
    }
  };
  /* ------------------------------------------
  // Rezept PopUp schliessen
  // ------------------------------------------ */
  const onRecipeClose = () => {
    setRecipePopUpValues({
      mealRecipe: null,
      actionType: "",
      open: false,
    });
  };
  /* ------------------------------------------
  // Rezept wurde geändert/erfasst
  // ------------------------------------------ */
  const onRecipeChange = (dialogValues) => {
    switch (recipePopUpValues.actionType) {
      case ACTION_TYPE.EDIT:
        dispatchMenuplan({
          type: REDUCER_ACTIONS.RECIPE_CHANGE,
          payload: dialogValues,
        });
        break;
      case ACTION_TYPE.NEW:
        dispatchMenuplan({
          type: REDUCER_ACTIONS.RECIPE_ADD,
          payload: dialogValues,
        });
        break;
      default:
        return;
    }
    setRecipePopUpValues({
      ...recipePopUpValues,
      mealRecipe: null,
      actionType: "",
      open: false,
    });
  };
  /* ------------------------------------------
  // Rezept-Such-Drawer
  // ------------------------------------------ */
  const toggleRecipeSearchDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setRecipeSearchDrawer({ ...recipeSearchDrawer, open: open });
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatchMenuplan({
      type: REDUCER_ACTIONS.MENUPLAN_CLOSE_SNACKBAR,
    });
  };

  /* ------------------------------------------
  // ================= AUSGABE ================
  // ------------------------------------------ */
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      {menuplan.error?.code !== FIREBASE_MESSAGES.GENERAL.PERMISSION_DENIED && (
        <PageHeader
          event={menuplan.event}
          menuplan={menuplan.data}
          handleSave={onSave}
          handleShoppinglist={onShoppinglistClick}
          handleQuantityCalculation={onQuantityCalculation}
          handlePrintversion={onPrintversion}
        />
      )}
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="xl">
        <Backdrop className={classes.backdrop} open={menuplan.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid container spacing={2}>
          {menuplan.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={menuplan.error}
                messageTitle={TEXT.ALERT_TITLE_WAIT_A_MINUTE}
              />
            </Grid>
          )}

          {menuplan.error?.code !==
            FIREBASE_MESSAGES.GENERAL.PERMISSION_DENIED && (
            <Grid item key={"gridActionButtons"} xs={12}>
              {/* TextButtons für Aktionen */}
              <TableHeaderButtons
                onMealAdd={onMealAdd}
                onNoteAdd={onNoteAdd}
                onRecipeSearch={onRecipeSearch}
                onSettingClick={onSettingOpen}
              />
            </Grid>
          )}
          {/* TabellenKopf */}
          <TableHeader
            dates={menuplan.data.dates}
            paginationControl={menuplan.paginationControl}
          />
          {/* Kopfnotizen */}
          <HeadNotesRow
            dates={menuplan.data.dates}
            notes={menuplan.data.notes}
            paginationControl={menuplan.paginationControl}
            onNoteAction={onNoteEdit}
          />
          {/* Tabelle */}
          <TableBody
            dates={menuplan.data.dates}
            meals={menuplan.data.meals}
            notes={menuplan.data.notes}
            recipes={menuplan.data.recipes}
            paginationControl={menuplan.paginationControl}
            settings={menuplan.settings}
            handleMealAction={handleMealAction}
            handleNoteAction={onNoteEdit}
            handleMealRecipeAction={onRecipeEdit}
          />
          {/* Paginator */}
          {menuplan.data.dates.length > 0 && (
            <Grid container key={"paginator"} justify="center">
              <TablePaginator
                noOfElements={menuplan.paginationControl.noOfElements}
                onChange={onPaginationChange}
              />
            </Grid>
          )}
        </Grid>
      </Container>

      <RecipeSearchDrawer
        allRecipes={menuplan.allRecipes}
        drawerState={recipeSearchDrawer}
        toggleRecipeSearch={toggleRecipeSearchDrawer}
        onRecipeShow={onRecipeShow}
        onRecipeAdd={onRecipeAdd}
      />

      {/* PopUps */}
      <DialogSettings
        dialogOpen={settingPopUpValues.open}
        noOfColumns={menuplan.settings.noOfColumns}
        showRecipePictures={menuplan.settings.showRecipePictures}
        handleDialogOk={onSettingChange}
        handleDialogCancel={onSettingClose}
      />
      <DialogMeals
        dialogOpen={mealsPopUpValues.open}
        actionType={mealsPopUpValues.actionType}
        meal={mealsPopUpValues.meal}
        handleDialogOk={onMealChange}
        handleDialogCancel={onMealClose}
      />
      <DialogNote
        dialogOpen={notePopUpValues.open}
        actionType={notePopUpValues.actionType}
        note={notePopUpValues.note}
        dates={menuplan.data.dates}
        meals={menuplan.data.meals}
        handleDialogOk={onNoteChange}
        handleDialogCancel={onNoteClose}
      />
      <DialogRecipe
        dialogOpen={recipePopUpValues.open}
        actionType={recipePopUpValues.actionType}
        mealRecipe={recipePopUpValues.mealRecipe}
        dates={menuplan.data.dates}
        meals={menuplan.data.meals}
        handleDialogOk={onRecipeChange}
        handleDialogCancel={onRecipeClose}
      />
      <CustomSnackbar
        message={menuplan.snackbar.message}
        severity={menuplan.snackbar.severity}
        snackbarOpen={menuplan.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ============================== Header =============================
// =================================================================== */
const PageHeader = ({
  event,
  handleSave,
  handleShoppinglist,
  handlePrintversion,
  handleQuantityCalculation,
}) => {
  const theme = useTheme();

  const secondaryButtons = [
    {
      id: "quantityCalculation",
      hero: true,
      visible: true,
      label: TEXT.BUTTON_QUANTITY_CALCULATION,
      variant: "outlined",
      color: "primary",
      onClick: handleQuantityCalculation,
    },
    {
      id: "shoppinglist",
      hero: true,
      visible: true,
      label: TEXT.BUTTON_SHOPPINGLIST,
      variant: "outlined",
      color: "primary",
      onClick: handleShoppinglist,
    },
    {
      id: "printVersion",
      hero: true,
      visible: true,
      label: TEXT.BUTTON_PRINTVERSION,
      variant: "outlined",
      color: "primary",
      onClick: handlePrintversion,
    },
  ];

  return (
    <React.Fragment>
      <PageTitle title={TEXT.PAGE_TITLE_MENUPLAN} subTitle={event.name} />
      <ButtonRow
        key="buttons_edit"
        buttons={[
          {
            id: "save",
            hero: true,
            visible: true,
            label: TEXT.BUTTON_SAVE,
            variant: "contained",
            color: "primary",
            onClick: handleSave,
          },
        ]}
        buttonGroup={
          useMediaQuery(theme.breakpoints.down("xs"), { noSsr: true })
            ? null
            : secondaryButtons
        }
        splitButtons={
          useMediaQuery(theme.breakpoints.down("xs"), { noSsr: true })
            ? secondaryButtons
            : null
        }
      />
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Buttons Tabelle =======================
// =================================================================== */
const TableHeaderButtons = ({
  onMealAdd,
  onNoteAdd,
  onRecipeSearch,
  onSettingClick,
}) => {
  return (
    <ButtonRow
      key="add_meal"
      buttons={[
        {
          id: "addNote",
          visible: true,
          label: TEXT.BUTTON_ADD_NOTE,
          color: "primary",
          onClick: onNoteAdd,
        },
        {
          id: "addRecipe",
          visible: true,
          label: TEXT.BUTTON_ADD_RECIPE,
          color: "primary",
          onClick: onRecipeSearch,
        },
        {
          id: "addMeal",
          visible: true,
          label: TEXT.BUTTON_ADD_MEAL,
          color: "primary",
          onClick: onMealAdd,
        },
        {
          id: "settings",
          visible: true,
          label: TEXT.BUTTON_SETTINGS,
          color: "primary",
          onClick: onSettingClick,
        },
      ]}
    />
  );
};
/* ===================================================================
// =========================== Tabellen Kopf =========================
// =================================================================== */
const TableHeader = ({ dates, paginationControl }) => {
  const classes = useStyles();
  const jsxElements = [];
  let date;

  // Statt MAP über FOR loop rein. Dann können nur die nötigen
  // Elemente gelesen werden
  for (
    let i = paginationControl.arrayStartIndex;
    i <= paginationControl.arrayEndIndex;
    i++
  ) {
    date = dates[i];
    jsxElements.push(
      <React.Fragment key={"date_" + i}>
        {isNaN(date) ? (
          <Grid
            item
            key={"day_header_" + i}
            xs={paginationControl.columnSettings.dayColumnWidth}
          />
        ) : (
          <Grid
            item
            key={"day_header_" + date}
            xs={paginationControl.columnSettings.dayColumnWidth}
          >
            <Card className={classes.card} align="center">
              <Typography variant="h6" component="h2">
                {date.toLocaleString("default", { weekday: "long" })}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {date.toLocaleString("de-CH", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </Typography>
            </Card>
          </Grid>
        )}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {/* leeres Grid für über die Mahlzeiten */}
      <Grid item xs={paginationControl.columnSettings.mealColumnWidth} />
      {jsxElements}
    </React.Fragment>
  );
};
/* ===================================================================
// ========================= Kopfnotizen Reihe =======================
// =================================================================== */
const HeadNotesRow = ({ dates, notes, paginationControl, onNoteAction }) => {
  let headNotes = [];

  // Kopfnotizen sammeln
  for (
    let i = paginationControl.arrayStartIndex;
    i <= paginationControl.arrayEndIndex;
    i++
  ) {
    i >= dates.length || isNaN(dates[i])
      ? headNotes.push({ dateIndex: i, notes: [] })
      : headNotes.push({
          dateIndex: i,
          notes: notes.filter(
            (note) =>
              note.date.getTime() === dates[i].getTime() && !note.mealUid
          ),
        });
  }

  if (headNotes.length === 0) {
    return null;
  }

  return (
    <React.Fragment key="headNoteRow">
      {/* leeres Grid für über die Mahlzeiten */}
      <Grid
        item
        key={"day_headNote_meal"}
        xs={paginationControl.columnSettings.mealColumnWidth}
      />
      {headNotes.map((dayNotes) => (
        <Grid
          item
          key={"day_headNote_" + dayNotes.dateIndex}
          xs={paginationControl.columnSettings.dayColumnWidth}
        >
          <Grid container spacing={1}>
            {dayNotes.notes.map((headNote) => (
              <Grid item xs={12} key={"grid_headNote" + headNote.uid}>
                <NoteCard
                  key={"headNoteCard_" + headNote.uid}
                  note={headNote}
                  onNoteAction={onNoteAction}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      ))}
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Tabellen Body =========================
// =================================================================== */
const TableBody = ({
  dates,
  meals,
  notes,
  recipes,
  paginationControl,
  settings,
  handleMealAction,
  // handleMealEdit,
  // handleMealMoveUp,
  // handleMealMoveDown,
  // handleMealdDelete,
  handleNoteAction,
  handleMealRecipeAction,
}) => {
  const classes = useStyles();
  let date;

  return (
    <React.Fragment key={"tablebody"}>
      {meals.map((meal) => (
        <React.Fragment key={"meal_row_" + meal.uid}>
          <Grid
            item
            key={"grid_meal_row" + meal.uid}
            xs={paginationControl.columnSettings.mealColumnWidth}
          >
            <MealCard
              id={"mealCard_" + meal.uid}
              meal={meal}
              noOfMeals={meals.length}
              handleMealAction={handleMealAction}
              // handleEdit={handleMealEdit}
              // handleMoveUp={handleMealMoveUp}
              // handleMoveDown={handleMealMoveDown}
              // handleDelete={handleMealdDelete}
            />
          </Grid>
          <TableContentRow
            meal={meal}
            dates={dates}
            notes={notes}
            recipes={recipes}
            paginationControl={paginationControl}
            settings={settings}
            onNoteAction={handleNoteAction}
            onMealRecipeAction={handleMealRecipeAction}
          />
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};
/* ===================================================================
// =================== Reihe mit Rezepte und Notizen =================
// =================================================================== */
const TableContentRow = ({
  meal,
  dates,
  notes,
  recipes,
  paginationControl,
  settings,
  onNoteAction,
  onMealRecipeAction,
}) => {
  const jsxElements = [];

  let mealRecipes = [];
  let mealNotes = [];

  // Statt MAP über FOR loop rein. Dann können nur die nötigen
  // Elemente gelesen werden
  for (
    let i = paginationControl.arrayStartIndex;
    i <= paginationControl.arrayEndIndex;
    i++
  ) {
    if (i >= dates.length) {
      // Leerer Eintrag
      jsxElements.push(
        <Grid
          item
          key={"meal_row_" + meal.uid + "_" + i}
          xs={paginationControl.columnSettings.dayColumnWidth}
        />
      );
    } else {
      mealRecipes = recipes.filter(
        (recipe) =>
          recipe.date.getTime() === dates[i].getTime() &&
          recipe.mealUid === meal.uid
      );
      mealNotes = notes.filter(
        (note) =>
          note.date.getTime() === dates[i].getTime() &&
          note.mealUid === meal.uid
      );

      jsxElements.push(
        <Grid
          item
          key={"meal_row" + meal.uid + "-" + i}
          xs={paginationControl.columnSettings.dayColumnWidth}
        >
          {mealRecipes.length === 0 && mealNotes.length === 0 ? (
            // Leere gestrichelter Karte
            <EmptyCard />
          ) : (
            <React.Fragment key={"meal_container_" + meal.uid + "_" + i}>
              {/* Notiz einfügen */}
              {mealNotes.length > 0 && (
                <Grid container spacing={1}>
                  {mealNotes.map((note) => (
                    <Grid item xs={12} key={"grid_note" + note.uid}>
                      <NoteCard
                        key={"noteCard_" + note.uid}
                        note={note}
                        onNoteAction={onNoteAction}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
              {/* Rezept einfügen */}
              {mealRecipes.length > 0 && (
                <Grid container spacing={1}>
                  {mealRecipes.map((recipe) => (
                    <Grid item xs={12} key={"grid_recipe" + recipe.uid}>
                      <RecipeCard
                        mealRecipe={recipe}
                        showPicture={settings.showRecipePictures}
                        onMealRecipeAction={onMealRecipeAction}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </React.Fragment>
          )}
        </Grid>
      );
    }
  }
  return jsxElements;
};
/* ===================================================================
// ============================ leere Karte ==========================
// =================================================================== */
const EmptyCard = () => {
  const classes = useStyles();

  return <Card className={classes.cardMenuEmpty} />;
  // <Card className={classes.cardMenuEmpty}>
  //   <Typography gutterBottom={true} variant="h6" component="h2">
  //     {""}
  //   </Typography>
  // </Card>;
};
/* ===================================================================
// ============================ Notiz Karte ==========================
// =================================================================== */
const NoteCard = ({ note, onNoteAction }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  /* ------------------------------------------
  // Menü öffnen
  // ------------------------------------------ */
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  /* ------------------------------------------
  // Menü Click: Löschen // Ändern
  // ------------------------------------------ */
  const handleMenuClick = (event) => {
    onNoteAction(event);
    setAnchorEl(null);
  };
  /* ------------------------------------------
  // Menü schliessen
  // ------------------------------------------ */
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card id={"noteCard_" + note.uid}>
      <CardHeader
        avatar={
          note.type
            ? Object.values(NOTE_TYPES).find(
                (noteType) => noteType.key === note.type
              ).icon
            : null
        }
        action={
          <React.Fragment key={"note_" + note.uid}>
            <IconButton aria-label="noteCardsettings" onClick={handleClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              id={"menuNoteCard_" + note.uid}
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                id={ACTIONS.EDIT + "_" + note.uid}
                onClick={handleMenuClick}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">{TEXT.BUTTON_CHANGE}</Typography>
              </MenuItem>
              <MenuItem
                id={ACTIONS.DELETE + "_" + note.uid}
                onClick={handleMenuClick}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  {TEXT.BUTTON_DELETE}
                </Typography>
              </MenuItem>
            </Menu>
          </React.Fragment>
        }
        disableTypography
        title={<Typography>{note.text}</Typography>}
      />
    </Card>
  );
};

/* ===================================================================
// ============================ Rezept Karte =========================
// =================================================================== */
const RecipeCard = ({ mealRecipe, showPicture, onMealRecipeAction }) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);

  /* ------------------------------------------
  // Menü öffnen
  // ------------------------------------------ */
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  /* ------------------------------------------
  // Menü Click: Löschen // Ändern
  // ------------------------------------------ */
  const handleMenuClick = (event) => {
    onMealRecipeAction(event);
    setAnchorEl(null);
  };
  /* ------------------------------------------
  // Menü schliessen
  // ------------------------------------------ */
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card className={classes.cardMenu}>
      <CardHeader
        avatar={!showPicture ? <RestaurantIcon /> : null}
        disableTypography
        title={<Typography>{mealRecipe.recipeName}</Typography>}
        subheader={
          <Typography variant="subtitle1" color="textSecondary">
            {"Portionen: " + mealRecipe.noOfServings}
          </Typography>
        }
        action={
          <React.Fragment key={"mealRecipe_" + mealRecipe.uid}>
            <IconButton
              aria-label="mealRecipeCardsettings"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id={"menuMealRecipe_" + mealRecipe.uid}
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                id={ACTIONS.EDIT + "_" + mealRecipe.uid}
                onClick={handleMenuClick}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">{TEXT.BUTTON_CHANGE}</Typography>
              </MenuItem>
              <MenuItem
                id={ACTIONS.VIEW + "_" + mealRecipe.uid}
                onClick={handleMenuClick}
              >
                <ListItemIcon>
                  <InputIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">{TEXT.BUTTON_SHOW}</Typography>
              </MenuItem>
              <MenuItem
                id={ACTIONS.DELETE + "_" + mealRecipe.uid}
                onClick={handleMenuClick}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  {TEXT.BUTTON_DELETE}
                </Typography>
              </MenuItem>
            </Menu>
          </React.Fragment>
        }
      />
      {showPicture ? (
        <CardMedia
          className={classes.cardMedia}
          image={mealRecipe.pictureSrc}
        />
      ) : null}
    </Card>
  );
};
/* ===================================================================
// =========================== Malzeit Card ==========================
// =================================================================== */
const MealCard = ({
  meal,
  noOfMeals,
  handleMealAction,
  // handleEdit,
  // handleMoveUp,
  // handleMoveDown,
  // handleDelete,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = React.useState(null);

  /* ------------------------------------------
  // Menü öffnen
  // ------------------------------------------ */
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  /* ------------------------------------------
  // Menü Click: Löschen // Ändern
  // ------------------------------------------ */
  const handleMenuClick = (event, meal) => {
    handleMealAction(event, meal);
    setAnchorEl(null);
  };
  /* ------------------------------------------
  // Menü schliessen
  // ------------------------------------------ */
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h6" component="h2">
          {meal.name}
        </Typography>
      </CardContent>

      {useMediaQuery(theme.breakpoints.down("xs"), { noSsr: true }) ? (
        <CardActions className={classes.cardActionRight}>
          <IconButton
            size="small"
            edge="end"
            aria-label="position edit"
            id={ACTIONS.EDIT + "_" + meal.uid + "_" + meal.pos}
            // color="primary"
            onClick={(event) => handleMenuClick(event, meal)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            style={{ marginLeft: "auto" }}
            aria-label="mealMoreMenu"
            onClick={handleClick}
            size="small"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            id={"mealMenu_" + meal.uid}
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem
              id={ACTIONS.MOVE_UP + "_" + meal.uid + "_" + meal.pos}
              disabled={meal.pos === 1}
              onClick={(event) => handleMenuClick(event, meal)}
            >
              <ListItemIcon>
                <KeyboardArrowUpIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">{TEXT.BUTTON_POS_UP}</Typography>
            </MenuItem>
            <MenuItem
              id={ACTIONS.MOVE_DOWN + "_" + meal.uid + "_" + meal.pos}
              disabled={meal.pos === noOfMeals}
              onClick={(event) => handleMenuClick(event, meal)}
            >
              <ListItemIcon>
                <KeyboardArrowDownIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">{TEXT.BUTTON_POS_DOWN}</Typography>
            </MenuItem>
            <MenuItem
              id={ACTIONS.DELETE + "_" + meal.uid + "_" + meal.pos}
              onClick={(event) => handleMenuClick(event, meal)}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit" noWrap>
                {TEXT.BUTTON_DELETE}
              </Typography>
            </MenuItem>
          </Menu>
        </CardActions>
      ) : (
        <CardActions>
          <Grid container spacing={1}>
            <Grid item sm={2}>
              <IconButton
                size="small"
                edge="end"
                aria-label="position edit"
                id={ACTIONS.EDIT + "_" + meal.uid + "_" + meal.pos}
                // color="primary"
                onClick={(event) => handleMenuClick(event, meal)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Grid>
            <Grid item sm={2}>
              <IconButton
                size="small"
                edge="end"
                disabled={meal.pos === 1}
                aria-label="position up"
                id={ACTIONS.MOVE_UP + "_" + meal.uid + "_" + meal.pos}
                key={meal.pos}
                // color="primary"
                onClick={(event) => handleMenuClick(event, meal)}
              >
                <KeyboardArrowUpIcon fontSize="small" />
              </IconButton>
            </Grid>
            <Grid item sm={2}>
              <IconButton
                size="small"
                edge="end"
                disabled={meal.pos === noOfMeals}
                aria-label="position down"
                id={ACTIONS.MOVE_DOWN + "_" + meal.uid + "_" + meal.pos}
                // color="primary"
                onClick={(event) => handleMenuClick(event, meal)}
              >
                <KeyboardArrowDownIcon fontSize="small" />
              </IconButton>
            </Grid>
            <Grid item sm={3}></Grid>
            <Grid item sm={2}>
              <IconButton
                size="small"
                edge="end"
                aria-label="delete"
                id={ACTIONS.DELETE + "_" + meal.uid + "_" + meal.pos}
                // color="primary"
                onClick={(event) => handleMenuClick(event, meal)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        </CardActions>
      )}
    </Card>
  );
};

/* ===================================================================
// ============================ Pagination  ==========================
// =================================================================== */
const TablePaginator = ({ noOfElements, onChange }) => {
  const classes = useStyles();
  return (
    <Pagination
      className={classes.pagination}
      count={noOfElements}
      onChange={onChange}
    />
  );
};

/* ===================================================================
// =========================== Setting Dialog ========================
// =================================================================== */
const DialogSettings = ({
  dialogOpen,
  noOfColumns,
  showRecipePictures,
  handleDialogOk,
  handleDialogCancel,
}) => {
  const classes = useStyles();
  const [dialogValues, setDialogValues] = React.useState({
    noOfColumns: noOfColumns,
    showRecipePictures: showRecipePictures,
  });

  /* ------------------------------------------
  // Change-Handler
  // ------------------------------------------ */
  const onFieldChange = (event) => {
    let value;

    switch (event.target.name) {
      case "noOfColumns":
        value = event.target.value;
        break;
      case "showRecipePictures":
        value = event.target.checked;
        break;
      default:
        return;
    }

    setDialogValues({
      ...dialogValues,
      [event.target.name]: value,
    });
  };
  /* ------------------------------------------
  // Dialog schliessen - Werte hochschicken
  // ------------------------------------------ */
  const onDialogOk = () => {
    handleDialogOk(dialogValues);
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleDialogCancel}
      maxWidth={"sm"}
      fullWidth
    >
      <DialogTitle id="form_dialog_title">{TEXT.SETTINGS}</DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <FormControl
              // marginNormal
              fullWidth
              className={classes.formControl}
            >
              <InputLabel id="label_no_of_columns">
                {TEXT.FIELD_NO_OF_COLUMNS}
              </InputLabel>
              <Select
                name="noOfColumns"
                value={dialogValues.noOfColumns}
                onChange={onFieldChange}
                label="Anzahl Spalten"
              >
                {COLUMN_SETTINGS.map((columnSetting) => (
                  <MenuItem
                    id={"noOfColumns_" + columnSetting.noOfColumns}
                    value={columnSetting.noOfColumns}
                    key={"select_noOfColumn_" + columnSetting.noOfColumns}
                  >
                    {columnSetting.noOfColumns}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
          <ListItem>
            <ListItemText
              id="switch-show-recipe-pictures"
              primary={TEXT.MENUPLAN_SETTINGS_SHOW_RECIPE_PICTURE}
            />
            <ListItemSecondaryAction>
              <Switch
                checked={dialogValues.showRecipePictures}
                onChange={onFieldChange}
                color="primary"
                name="showRecipePictures"
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogCancel} color="primary">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button onClick={onDialogOk} color="primary" variant="outlined">
          {TEXT.BUTTON_OK}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ===================================================================
// ========================= Mahlzeiten Dialog =======================
// =================================================================== */
const DialogMeals = ({
  dialogOpen,
  meal,
  actionType,
  handleDialogOk,
  handleDialogCancel,
}) => {
  const DIALOG_INITIAL_STATE = {
    name: "",
    uid: "",
    pos: 0,
  };
  const classes = useStyles();
  const [dialogValues, setDialogValues] = React.useState(DIALOG_INITIAL_STATE);

  if (!dialogValues.name && meal) {
    setDialogValues(meal);
  }
  /* ------------------------------------------
  // Change-Handler
  // ------------------------------------------ */
  const onFieldChange = (event) => {
    setDialogValues({
      ...dialogValues,
      [event.target.id]: event.target.value,
    });
  };
  /* ------------------------------------------
  // Dialog schliessen - Werte hochschicken
  // ------------------------------------------ */
  const onDialogOk = () => {
    handleDialogOk(dialogValues);
    setDialogValues(DIALOG_INITIAL_STATE);
  };
  /* ------------------------------------------
  // Dialog schliessen
  // ------------------------------------------ */
  const onDialogCancel = () => {
    setDialogValues(DIALOG_INITIAL_STATE);
    handleDialogCancel();
  };
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleDialogCancel}
      fullWidth
      maxWidth={"sm"}
    >
      <DialogTitle id="dialog_settings_title">{TEXT.MEAL}</DialogTitle>
      <DialogContent>
        <List>
          <ListItem className={classes.formListItem}>
            <FormControl fullWidth>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                value={dialogValues.name}
                onChange={onFieldChange}
                label={TEXT.FIELD_MEAL}
                fullWidth
              />
            </FormControl>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDialogCancel} color="primary">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button
          onClick={onDialogOk}
          color="primary"
          variant="outlined"
          disabled={!dialogValues.name}
        >
          {actionType === ACTION_TYPE.NEW
            ? TEXT.BUTTON_ADD
            : TEXT.BUTTON_CHANGE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
/* ===================================================================
// =========================== Notiz Dialog ==========================
// =================================================================== */
const DialogNote = ({
  dialogOpen,
  note,
  dates = [],
  meals,
  actionType,
  handleDialogOk,
  handleDialogCancel,
}) => {
  const DIALOG_INITIAL_STATE = {
    type: "",
    headNote: true,
    date: "",
    mealUid: "",
    text: "",
    uid: "",
  };
  const classes = useStyles();
  const [dialogValues, setDialogValues] = React.useState(DIALOG_INITIAL_STATE);

  const [validation, setValidation] = React.useState({
    date: DIALOG_VALIDATION,
  });

  if (!dialogValues.date && note) {
    setDialogValues({
      type: note.type,
      headNote: !note.mealUid,
      date: note.date,
      mealUid: note.mealUid,
      text: note.text,
      uid: note.uid,
    });
  }
  /* ------------------------------------------
  // Change-Handler
  // ------------------------------------------ */
  const onFieldChange = (event) => {
    switch (event.target.name) {
      case "headNote":
        setDialogValues({
          ...dialogValues,
          [event.target.name]: event.target.checked,
          mealUid: "",
        });
        break;
      default:
        setDialogValues({
          ...dialogValues,
          [event.target.name]: event.target.value,
        });
    }
  };
  /* ------------------------------------------
  // Dialog schliessen - Werte hochschicken
  // ------------------------------------------ */
  const onDialogOk = () => {
    //Check ob alles gefüllt wurde
    let hasError = false;

    let errorDate = DIALOG_VALIDATION;
    // let errorMeal = DIALOG_VALIDATION;

    if (!dialogValues.date) {
      hasError = true;
      errorDate = {
        hasError: true,
        errorText: TEXT.ERROR_GIVE_FIELD_VALUE(TEXT.FIELD_DAY),
      };
    }
    // if (!dialogValues.mealUid) {
    //   hasError = true;
    //   errorMeal = {
    //     hasError: true,
    //     errorText: TEXT.ERROR_GIVE_FIELD_VALUE(TEXT.FIELD_MEAL),
    //   };
    // }

    setValidation({
      date: errorDate,
      // mealUid: errorMeal,
    });

    if (!hasError) {
      handleDialogOk(dialogValues);
      setDialogValues(DIALOG_INITIAL_STATE);
    }
  };
  /* ------------------------------------------
  // Dialog schliessen
  // ------------------------------------------ */
  const onDialogCancel = () => {
    setDialogValues(DIALOG_INITIAL_STATE);
    handleDialogCancel();
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleDialogCancel}
      fullWidth
      maxWidth={"sm"}
    >
      <DialogTitle id="dialog_note_title">{TEXT.NOTE}</DialogTitle>
      <DialogContent>
        <List>
          <ListItem className={classes.formListItem}>
            <FormControl fullWidth error={validation.date.hasError}>
              <InputLabel required id="label_add_recipe_day">
                {TEXT.FIELD_DAY}
              </InputLabel>
              <Select
                id="date"
                name="date"
                value={dialogValues.date}
                onChange={onFieldChange}
                label={TEXT.FIELD_DAY}
              >
                {dates.map((date) => (
                  <MenuItem value={date} key={"selectdate_" + date}>
                    {date.toLocaleString("de-CH", { weekday: "long" }) +
                      ", " +
                      date.toLocaleString("de-CH", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validation.date.errorText}</FormHelperText>
            </FormControl>
          </ListItem>
          <ListItem className={classes.formListItem}>
            <ListItemText
              id="switch-list-label-headNote"
              primary={
                <Typography color="textSecondary">
                  {TEXT.FIELD_HEAD_NOTE}
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                checked={dialogValues.headNote}
                onChange={onFieldChange}
                color="primary"
                name="headNote"
              />
            </ListItemSecondaryAction>
          </ListItem>
          {!dialogValues.headNote && (
            <ListItem className={classes.formListItem}>
              <FormControl fullWidth>
                <InputLabel id="label_add_recipe_meal">{TEXT.MEAL}</InputLabel>
                <Select
                  id="mealUid"
                  name="mealUid"
                  value={dialogValues.mealUid}
                  onChange={onFieldChange}
                  label={TEXT.FIELD_MEAL}
                >
                  {meals.map((meal) => (
                    <MenuItem value={meal.uid} key={"selectMeal_" + meal.uid}>
                      {meal.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ListItem>
          )}
          <ListItem className={classes.formListItem}>
            <FormControl fullWidth>
              <InputLabel id="label_note_icon">
                {TEXT.FIELD_NOTE_TYPE}
              </InputLabel>

              <Select
                id="type"
                name="type"
                value={dialogValues.type}
                onChange={onFieldChange}
                label={TEXT.FIELD_NOTE_TYPE}
              >
                {Object.keys(NOTE_TYPES).map((type) => (
                  <MenuItem value={NOTE_TYPES[type].key} key={"type_" + type}>
                    {NOTE_TYPES[type].icon} &nbsp;
                    {NOTE_TYPES[type].text}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
          <ListItem className={classes.formListItem}>
            <FormControl fullWidth>
              <TextField
                autoFocus
                margin="dense"
                id="text"
                name="text"
                value={dialogValues.text}
                onChange={onFieldChange}
                label={TEXT.FIELD_NOTE}
                type="text"
              />
            </FormControl>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDialogCancel} color="primary">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button onClick={onDialogOk} color="primary" variant="outlined">
          {actionType === ACTION_TYPE.NEW
            ? TEXT.BUTTON_ADD
            : TEXT.BUTTON_CHANGE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ===================================================================
// =========================== Rezept Dialog =========================
// =================================================================== */
const DialogRecipe = ({
  dialogOpen,
  mealRecipe,
  dates = [],
  meals,
  actionType,
  handleDialogOk,
  handleDialogCancel,
}) => {
  const DIALOG_INITIAL_STATE = {
    date: "",
    mealUid: "",
    recipeUid: "",
    recipeName: "",
    pictureSrc: "",
    noOfServings: "",
    uid: "",
  };
  const classes = useStyles();
  const [dialogValues, setDialogValues] = React.useState(DIALOG_INITIAL_STATE);
  const [validation, setValidation] = React.useState({
    date: DIALOG_VALIDATION,
    mealUid: DIALOG_VALIDATION,
    noOfServings: DIALOG_VALIDATION,
  });

  if (!dialogValues.recipeUid && mealRecipe) {
    setDialogValues({
      date: mealRecipe.date,
      mealUid: mealRecipe.mealUid,
      recipeUid: mealRecipe.recipeUid,
      recipeName: mealRecipe.recipeName,
      pictureSrc: mealRecipe.pictureSrc,
      noOfServings: mealRecipe.noOfServings,
      uid: mealRecipe.uid,
    });
  }
  /* ------------------------------------------
  // Change-Handler
  // ------------------------------------------ */
  const onFieldChange = (event) => {
    // switch (event.target.name) {
    //   case "headNote":
    //     setDialogValues({
    //       ...dialogValues,
    //       [event.target.name]: event.target.checked,
    //       mealUid: "",
    //     });
    //     break;
    //   default:
    setDialogValues({
      ...dialogValues,
      [event.target.name]: event.target.value,
    });
    // }
  };
  /* ------------------------------------------
  // Dialog schliessen - Werte hochschicken
  // ------------------------------------------ */
  const onDialogOk = () => {
    let hasError = false;

    let errorDate = DIALOG_VALIDATION;
    let errorMeal = DIALOG_VALIDATION;
    let noOfServings = DIALOG_VALIDATION;

    if (!dialogValues.date) {
      hasError = true;
      errorDate = {
        hasError: true,
        errorText: TEXT.ERROR_GIVE_FIELD_VALUE(TEXT.FIELD_DAY),
      };
    }
    if (!dialogValues.mealUid) {
      hasError = true;
      errorMeal = {
        hasError: true,
        errorText: TEXT.ERROR_GIVE_FIELD_VALUE(TEXT.FIELD_MEAL),
      };
    }
    if (!dialogValues.noOfServings) {
      hasError = true;
      noOfServings = {
        hasError: true,
        errorText: TEXT.ERROR_GIVE_FIELD_VALUE(TEXT.FIELD_NO_OF_SERVINGS),
      };
    }

    setValidation({
      date: errorDate,
      mealUid: errorMeal,
      noOfServings: noOfServings,
    });

    if (!hasError) {
      handleDialogOk(dialogValues);
      setDialogValues(DIALOG_INITIAL_STATE);
    }
  };
  /* ------------------------------------------
  // Dialog schliessen
  // ------------------------------------------ */
  const onDialogCancel = () => {
    setDialogValues(DIALOG_INITIAL_STATE);
    handleDialogCancel();
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={onDialogCancel}
      fullWidth
      maxWidth={"sm"}
    >
      <DialogTitle id="dialog_note_title">
        {TEXT.MENUPLAN_DIALOG_ADD_RECIPE(dialogValues.recipeName)}
      </DialogTitle>
      <DialogContent>
        <List>
          <ListItem className={classes.formListItem}>
            <FormControl fullWidth error={validation.date.hasError}>
              <InputLabel id="label_add_recipe_day" required>
                {TEXT.FIELD_DAY}
              </InputLabel>
              <Select
                id="date"
                name="date"
                value={dialogValues.date}
                onChange={onFieldChange}
                label={TEXT.FIELD_DAY}
                autoFocus
                required
              >
                {dates.map((date) => (
                  <MenuItem value={date} key={"selectdate_" + date}>
                    {date.toLocaleString("de-CH", { weekday: "long" }) +
                      ", " +
                      date.toLocaleString("de-CH", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validation.date.errorText}</FormHelperText>
            </FormControl>
          </ListItem>
          <ListItem className={classes.formListItem}>
            <FormControl fullWidth error={validation.mealUid.hasError}>
              <InputLabel id="label_add_recipe_meal" required>
                {TEXT.MEAL}
              </InputLabel>
              <Select
                id="mealUid"
                name="mealUid"
                value={dialogValues.mealUid}
                onChange={onFieldChange}
                label={TEXT.FIELD_MEAL}
                required
              >
                {meals.map((meal) => (
                  <MenuItem value={meal.uid} key={"selectMeal_" + meal.uid}>
                    {meal.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validation.mealUid.errorText}</FormHelperText>
            </FormControl>
          </ListItem>
          <ListItem className={classes.formListItem}>
            <FormControl fullWidth>
              <TextField
                margin="dense"
                name="noOfServings"
                value={dialogValues.noOfServings}
                onChange={onFieldChange}
                label={TEXT.FIELD_NO_OF_SERVINGS}
                error={validation.noOfServings.hasError}
                helperText={validation.noOfServings.errorText}
                type="Number"
                required
              />
            </FormControl>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDialogCancel} color="primary">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button onClick={onDialogOk} color="primary" variant="outlined">
          {actionType === ACTION_TYPE.NEW
            ? TEXT.BUTTON_ADD
            : TEXT.BUTTON_CHANGE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(MenuplanPage);
