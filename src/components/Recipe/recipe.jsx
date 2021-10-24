import React from "react";
import { compose } from "recompose";
import { useHistory } from "react-router";

import { useTheme } from "@material-ui/core/styles";

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import CssBaseline from "@material-ui/core/CssBaseline";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";

import TextField from "@material-ui/core/TextField";
import Input from "@material-ui/core/Input";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import Rating from "@material-ui/lab/Rating";
import Chip from "@material-ui/core/Chip";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Tooltip from "@material-ui/core/Tooltip";
import Avatar from "@material-ui/core/Avatar";
import LinearProgress from "@material-ui/core/LinearProgress";

import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import CustomSnackbar from "../Shared/customSnackbar";
import LoadingIndicator from "../Shared/loadingIndicator";
import DialogProduct, {
  PRODUCT_POP_UP_VALUES_INITIAL_STATE,
  PRODUCT_DIALOG_TYPE,
} from "../Product/dialogProduct";
import DialogScaleRecipe from "./dialogScaleRecipe";
import AlertMessage from "../Shared/AlertMessage";

import Recipe from "./recipe.class";
import Product from "../Product/product.class";
import Unit from "../Unit/unit.class";
import Utils from "../Shared/utils.class";
import Department from "../Department/department.class";
import RecipePdf from "./recipePdf";
import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";

// import * as ROLES from "../../constants/roles";
import * as ACTIONS from "../../constants/actions";
import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";
import * as ROUTES from "../../constants/routes";

import PieChartIcon from "@material-ui/icons/PieChart";
import BookmarkIcon from "@material-ui/icons/Bookmark";
import TimerIcon from "@material-ui/icons/Timer";
import KitchenIcon from "@material-ui/icons/Kitchen";
import OutdoorGrillIcon from "@material-ui/icons/OutdoorGrill";
import ImageIcon from "@material-ui/icons/Image";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import PersonIcon from "@material-ui/icons/Person";
import TodayIcon from "@material-ui/icons/Today";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import SendIcon from "@material-ui/icons/Send";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import useStyles from "../../constants/styles";

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
  RECIPE_FETCH_INIT: "RECIPE_HEAD_FETCH_INIT",
  RECIPE_FETCH_SUCCESS: "RECIPE_HEAD_FETCH_SUCCESS",
  RECIPE_SET_PROPS: "RECIPE_SET_PROPS",
  RESTORE_DB_VERSION: "RESTORE_DB_VERSION",
  RECIPE_FETCH_FAILURE: "RECIPE_FETCH_FAILURE",
  RECIPE_ON_CHANGE: "RECIPE_ON_CHANGE",
  RECIPE_ON_SAVE: "RECIPE_ON_SAVE",
  RECIPE_ON_ERROR: "RECIPE_ON_ERROR",
  RECIPE_ON_SCALE: "RECIPE_ON_SCALE",
  CLOSE_SNACKBAR: "CLOSE_SNACKBAR",
  SNACKBAR_SHOW: "SNACKBAR_SHOW",

  UPLOAD_PICTURE_SUCCESS: "UPLOAD_PICTURE_SUCCESS",
  UPLOAD_PICTURE_INIT: "UPLOAD_PICTURE_INIT",
  DELETE_PICTURE_SUCCESS: "DELETE_PICTURE_SUCCESS",
  SET_TAGS: "SET_TAGS",

  RATING_UPDATE: "RATING_UPDATE",
  INGREDIENT_ONCHANGE: "INGREDIENT_ONCHANGE",
  PREPARATIONSTEP_ONCHANGE: "PREPARATIONSTEP_ONCHANGE",
  COMMENT_ADD: "COMMENT_ADD",
  COMMENT_LOAD_PREVIOUS: "COMMENT_LOAD_PREVIOUS",
  RECIPE_UPDATE_LIST: "RECIPE_UPDATE_LIST",
  DELETE_INGREDIENT_NAME: "DELETE_INGREDIENT_NAME",
  UNITS_FETCH_INIT: "UNITS_FETCH_INIT",
  UNITS_FETCH_SUCCESS: "UNITS_FETCH_SUCCESS",
  PRODUCTS_FETCH_INIT: "PRODUCTS_FETCH_INIT",
  PRODUCTS_FETCH_SUCCESS: "PRODUCTS_FETCH_SUCCESS",
  ADD_NEW_PRODUCT: "ADD_NEW_PRODUCT",
  DEPARTMENTS_FETCH_INIT: "DEPARTMENTS_FETCH_INIT",
  DEPARTMENTS_FETCH_SUCCESS: "DEPARTMENTS_FETCH_SUCCESS",
  GENERIC_FAILURE: "GENERIC_FAILURE",
};

const recipeReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.RECIPE_ON_CHANGE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
      };
    case REDUCER_ACTIONS.INGREDIENT_ONCHANGE:
      let tmpIngredients = state.data.ingredients;
      tmpIngredients[action.pos - 1][action.field] = action.value;

      // Wenn das die letzte Zeile ist, automatisch eine neue einfügen
      if (parseInt(action.pos) === state.data.ingredients.length) {
        let newObject = Recipe.createEmptyIngredient();

        tmpIngredients = Recipe.addEmptyEntry({
          array: tmpIngredients,
          pos: parseInt(action.pos),
          emptyObject: newObject,
          renumberByField: "pos",
        });
      }

      return {
        ...state,
        data: {
          ...state.data,
          ingredients: tmpIngredients,
        },
      };
    case REDUCER_ACTIONS.RECIPE_UPDATE_LIST:
      // Zutaten oder Zubereitungsschritte updaten
      return {
        ...state,
        data: {
          ...state.data,
          [action.array]: action.payload,
        },
      };
    case REDUCER_ACTIONS.PREPARATIONSTEP_ONCHANGE:
      let tmpPreparationSteps = state.data.preparationSteps;
      tmpPreparationSteps[action.pos - 1][action.field] = action.value;

      // Wenn das die letzte Zeile ist, automatisch eine neue einfügen
      if (parseInt(action.pos) === state.data.preparationSteps.length) {
        let newObject = Recipe.createEmptyPreparationStep();

        tmpPreparationSteps = Recipe.addEmptyEntry({
          array: tmpPreparationSteps,
          pos: parseInt(action.pos),
          emptyObject: newObject,
          renumberByField: "pos",
        });
      }

      return {
        ...state,
        data: {
          ...state.data,
          preparationSteps: tmpPreparationSteps,
        },
      };
    case REDUCER_ACTIONS.DELETE_INGREDIENT_NAME:
      return {
        ...state,
        data: {
          ...state.data,
          ingredients: state.data.ingredients.map((ingredient) => {
            if (ingredient.uid === action.uid) {
              ingredient.product = "";
            }
            return ingredient;
          }),
        },
      };
    case REDUCER_ACTIONS.RECIPE_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
        _loadingRecipe: true,
      };
    case REDUCER_ACTIONS.RECIPE_FETCH_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          uid: action.payload.uid,
          name: action.payload.name,
          pictureSrc: action.payload.pictureSrc,
          pictureSrcFullSize: action.payload.pictureSrcFullSize,
          createdFromUid: action.payload.createdFromUid,
          createdFromDisplayName: action.payload.createdFromDisplayName,
          createdAt: action.payload.createdAt,
          portions: action.payload.portions,
          source: action.payload.source,
          preparationTime: action.payload.preparationTime,
          restTime: action.payload.restTime,
          cookTime: action.payload.cookTime,
          note: action.payload.note,
          tags: action.payload.tags,
          ingredients: action.payload.ingredients,
          preparationSteps: action.payload.preparationSteps,
          comments: action.payload.comments,
          rating: action.payload.rating,
          noComments: action.payload.noComments,
        },
        dbVersion: {
          ...state.dbVersion,
          uid: action.payload.uid,
          name: action.payload.name,
          pictureSrc: action.payload.pictureSrc,
          pictureSrcFullSize: action.payload.pictureSrcFullSize,
          createdFromUid: action.payload.createdFromUid,
          createdFromDisplayName: action.payload.createdFromDisplayName,
          createdAt: action.payload.createdAt,
          portions: action.payload.portions,
          source: action.payload.source,
          preparationTime: action.payload.preparationTime,
          restTime: action.payload.restTime,
          cookTime: action.payload.cookTime,
          note: action.payload.note,
          tags: action.payload.tags,
          ingredients: action.payload.ingredients,
          preparationSteps: action.payload.preparationSteps,
          comments: action.payload.comments,
          rating: action.payload.rating,
          noComments: action.payload.noComments,
        },
        isLoading: deriveIsLoading(
          state._loadingProducts,
          false,
          state._loadingUnits,
          state._loadingDepartments
        ),
        scaledPortions: action?.scaledPortions,
        scaledIngredients: action?.scaledIngredients,
        _loadingRecipe: false,
        isError: false,
      };
    case REDUCER_ACTIONS.RECIPE_SET_PROPS:
      // Übergabeparameter setzen
      return {
        ...state,
        data: {
          ...state.data,
          uid: action.payload.uid,
          name: action.payload.name,
          pictureSrcFullSize: action.payload.pictureSrc,
        },
      };
    case REDUCER_ACTIONS.RESTORE_DB_VERSION:
      // Version aus DB wieder anzeigen
      return {
        ...state,
        data: {
          ...state.data,
          name: state.dbVersion.name,
          pictureSrc: state.dbVersion.pictureSrc,
          pictureSrcFullSize: state.dbVersion.pictureSrcFullSize,
          createdFromUid: state.dbVersion.createdFromUid,
          createdFromDisplayName: state.dbVersion.createdFromDisplayName,
          createdAt: state.dbVersion.createdAt,
          portions: state.dbVersion.portions,
          source: state.dbVersion.source,
          preparationTime: state.dbVersion.preparationTime,
          restTime: state.dbVersion.restTime,
          cookTime: state.dbVersion.cookTime,
          note: state.dbVersion.note,
          tags: state.dbVersion.tags,
          ingredients: state.dbVersion.ingredients,
          preparationSteps: state.dbVersion.preparationSteps,
          comments: state.dbVersion.comments,
          rating: state.dbVersion.rating,
          noComments: state.dbVersion.noComments,
        },
      };
    case REDUCER_ACTIONS.UNITS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
        _loadingUnits: true,
      };
    case REDUCER_ACTIONS.UNITS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: deriveIsLoading(
          state._loadingProducts,
          state._loadingRecipe,
          false,
          state._loadingDepartments
        ),
        isError: false,
        units: action.payload,
        _loadingUnits: false,
      };
    case REDUCER_ACTIONS.PRODUCTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
        _loadingProducts: true,
      };
    case REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: deriveIsLoading(
          false,
          state._loadingRecipe,
          state._loadingUnits,
          state._loadingDepartments
        ),
        isError: false,
        products: action.payload,
        _loadingProducts: false,
      };
    case REDUCER_ACTIONS.ADD_NEW_PRODUCT:
      // Das neue Produkt in Produkte speichern (für Dropdown)
      let products = state.products;
      let product = products.find(
        (product) => product.uid === action.value.uid
      );
      // Wenn es das schon gibt, nichts tun
      if (!product) {
        products.push(action.value);
      }
      return {
        ...state,
        products: products,
      };
    case REDUCER_ACTIONS.DEPARTMENTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
        _loadingDepartments: true,
      };
    case REDUCER_ACTIONS.DEPARTMENTS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: deriveIsLoading(
          state._loadingProducts,
          state._loadingRecipe,
          state._loadingUnits,
          false
        ),
        isError: false,
        departments: action.payload,
        _loadingDepartments: false,
      };
    case REDUCER_ACTIONS.RECIPE_ON_SAVE:
      return {
        ...state,
        data: { ...state.data, uid: action.payload },
        dbVersion: { ...state.data, uid: action.payload },
        snackbar: {
          severity: "success",
          message: TEXT.RECIPE_SAVE_SUCCESS,
          open: true,
        },
        isError: false,
        error: null,
      };
    case REDUCER_ACTIONS.RECIPE_ON_ERROR ||
      REDUCER_ACTIONS.RECIPE_FETCH_FAILURE:
      return {
        ...state,
        isLoading: false,
        isError: true,
        error: action.payload,
      };
    case REDUCER_ACTIONS.CLOSE_SNACKBAR:
      return {
        ...state,
        // isLoading: false,
        // isError: true,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case REDUCER_ACTIONS.UPLOAD_PICTURE_INIT:
      return {
        ...state,
        isLoadingPicture: true,
      };
    case REDUCER_ACTIONS.UPLOAD_PICTURE_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          pictureSrc: action.payload.pictureSrc,
          pictureSrcFullSize: action.payload.pictureSrcFullSize,
        },
        dbVersion: {
          ...state.dbVersion,
          pictureSrc: action.payload.pictureSrc,
          pictureSrcFullSize: action.payload.pictureSrcFullSize,
        },
        isLoadingPicture: false,
      };
    case REDUCER_ACTIONS.DELETE_PICTURE_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          pictureSrc: "",
          pictureSrcFullSize: "",
        },
        dbVersion: {
          ...state.dbVersion,
          pictureSrc: "",
          pictureSrcFullSize: "",
        },
        isLoadingPicture: false,
        snackbar: {
          severity: "info",
          message: TEXT.PICTURE_HAS_BEEN_DELETED,
          open: true,
        },
      };
    case REDUCER_ACTIONS.SET_TAGS:
      return {
        ...state,
        data: {
          ...state.data,
          tags: action.payload,
        },
      };
    case REDUCER_ACTIONS.RATING_UPDATE:
      // Rating des Rezeptes anpassen
      return {
        ...state,
        data: {
          ...state.data,
          rating: action.payload,
        },
        dbVersion: {
          ...state.dbVersion,
          rating: action.payload,
        },
      };
    case REDUCER_ACTIONS.SNACKBAR_SHOW:
      return {
        ...state,
        snackbar: {
          severity: action.severity,
          message: action.message,
          open: true,
        },
      };
    case REDUCER_ACTIONS.COMMENT_ADD:
      // Neuer Kommentar hinzugefügt
      let newComments = state.data.comments;
      newComments.push(action.payload);

      return {
        ...state,
        data: {
          ...state.data,
          noComments: state.data.noComments + 1,
          comments: newComments,
        },
      };
    case REDUCER_ACTIONS.COMMENT_LOAD_PREVIOUS:
      // Aus Pagination neue Kommentare einfügen
      return {
        ...state,
        data: {
          ...state.data,
          comments: action.payload.concat(...state.data.comments),
        },
      };
    case REDUCER_ACTIONS.RECIPE_ON_SCALE:
      // Rezept skaliert
      return {
        ...state,
        scaledPortions: parseInt(action.scaledPortions),
        scaledIngredients: action.scaledIngredients,
      };
    case REDUCER_ACTIONS.GENERIC_FAILURE:
      // Allgemeiner Fehler
      return {
        ...state,
        isError: true,
        isLoading: false,
        error: action.error,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
/* =====================================================================
// Setter für Loading Indikator
// ===================================================================== */
const deriveIsLoading = (
  loadingProducts,
  loadingRecipe,
  loadingUnits,
  loadingDepartment
) => {
  if (
    loadingProducts === false &&
    loadingRecipe === false &&
    loadingUnits === false &&
    loadingDepartment === false
  ) {
    return false;
  } else {
    return true;
  }
};

const INGREDIENT_COLS = {
  PROFI_MODE_OFF: {
    pos: { xs: 2, sm: 1 },
    quantity: { xs: 6, sm: 2 },
    unit: { xs: 6, sm: 1 },
    scalingFactor: { xs: 2, sm: 1 },
    product: { xs: 6, sm: 4 },
    detail: { xs: 5, sm: 3 },
    buttons: { xs: 1, sm: 1 },
  },
  PROFI_MODE_ON: {
    pos: { xs: 2, sm: 1 },
    quantity: { xs: 5, sm: 2 },
    unit: { xs: 5, sm: 1 },
    scalingFactor: { xs: 2, sm: 1 },
    product: { xs: 6, sm: 3 },
    detail: { xs: 5, sm: 3 },
    buttons: { xs: 1, sm: 1 },
  },
};

const CONSTANTS = {
  PANELPREFIX: {
    INGREDIENTS: "ingredients",
    PREPARATIONSTEPS: "preparationSteps",
  },
};
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const RecipePage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <RecipeBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const RecipeBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const { push } = useHistory();

  let action;
  let urlUid;
  let scaledPortions;

  // const [dbRecipe, setDbRecipe] = React.useState();
  const [editMode, setEditMode] = React.useState(false);
  const [ingredientProfiModus, setIngredientProfiModus] = React.useState(false);
  const [gridIngredientsCols, setsetIngredientsCols] = React.useState(
    INGREDIENT_COLS.PROFI_MODE_OFF
  );
  const [productAddValues, setProductAddValues] = React.useState({
    ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
    ...{ popUpOpen: false },
  });
  const [dialogScaleRecipe, setDialogScaleRecipe] = React.useState({
    popUpOpen: false,
  });
  // Position die das PopUp ausgelöst
  const [triggeredIngredientPos, setTriggeredIngredientPos] = React.useState();
  const [tagInput, setTagInput] = React.useState("");
  const [recipe, dispatchRecipe] = React.useReducer(recipeReducer, {
    data: new Recipe(),
    dbVersion: new Recipe(),
    units: [],
    products: [],
    departments: [],
    scaledPortions: null,
    scaledIngredients: [],
    isLoading: false,
    isLoadingPicture: false,
    isError: false,
    error: {},
    snackbar: { open: false, severity: "success", message: "" },
    _loadingRecipe: false,
    _loadingUnits: false,
    _loadingProducts: false,
    _loadingDepartments: false,
  });
  const [menuItemAnchorEl, setMenuItemAnchorEl] = React.useState(null);
  const [selectedItem, setSelectedItem] = React.useState({
    type: null,
    ingredient: null,
    pos: null,
    noOfPostitions: null,
  });

  if (props.location.state) {
    action = props.location.state.action;
    scaledPortions = props.location.state?.scaledPortions;
  } else {
    action = ACTIONS.VIEW;
  }

  if (!urlUid) {
    urlUid = props.match.params.id;
    if (!urlUid) {
      action = ACTIONS.NEW;
      urlUid = ACTIONS.NEW;
    }
  }

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    // Wen das Ereignis NEW ist, wird ein neues Rezept angelegt.
    // Ansonsten wird aus der DB das geforderte gelesen
    let scaledIngredients = [];

    if (action === ACTIONS.NEW) {
      let newRecipe = new Recipe();
      // setDbRecipe(newRecipe);
      dispatchRecipe({
        type: REDUCER_ACTIONS.RECIPE_FETCH_SUCCESS,
        payload: newRecipe,
      });
      setEditMode(true);
    } else {
      dispatchRecipe({
        type: REDUCER_ACTIONS.RECIPE_SET_PROPS,
        payload: {
          uid: urlUid,
          name: props.location.state?.recipeName,
          pictureSrc: props.location.state?.recipePictureSrc,
        },
      });
      dispatchRecipe({ type: REDUCER_ACTIONS.RECIPE_FETCH_INIT });
      // Über URL eingestiegen ... Rezept lesen
      Recipe.getRecipe({
        firebase: firebase,
        uid: urlUid,
        userUid: authUser.uid,
      })
        .then((result) => {
          if (scaledPortions && !Number.isNaN(scaledPortions)) {
            // Rezept gleich hochskalieren auf Anzahl Portionen
            scaledIngredients = Recipe.scale({
              recipe: result,
              portionsToScale: scaledPortions,
            });
          }
          dispatchRecipe({
            type: REDUCER_ACTIONS.RECIPE_FETCH_SUCCESS,
            payload: result,
            scaledPortions: scaledPortions,
            scaledIngredients: scaledIngredients,
          });
        })
        .catch((error) => {
          console.error(error);
          dispatchRecipe({
            type: REDUCER_ACTIONS.GENERIC_FAILURE,
            error: error,
          });
        });
    }
  }, [action]);
  /* ------------------------------------------
  // Einheiten, Produkte, Abteilungen lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (recipe.units.length === 0 && editMode) {
      dispatchRecipe({
        type: REDUCER_ACTIONS.UNITS_FETCH_INIT,
      });
      Unit.getAllUnits(firebase)
        .then((result) => {
          // in flaches Array ohne Texte verwandeln
          let units = result.map((unit) => unit.key);
          // leeres Feld gehört auch dazu
          units.push("");

          dispatchRecipe({
            type: REDUCER_ACTIONS.UNITS_FETCH_SUCCESS,
            payload: units,
          });
        })
        .catch((error) => {
          console.error(error);
          dispatchRecipe({
            type: REDUCER_ACTIONS.GENERIC_FAILURE,
            error: error,
          });
        });
    }
    if (recipe.products.length === 0 && editMode) {
      dispatchRecipe({
        type: REDUCER_ACTIONS.PRODUCTS_FETCH_INIT,
      });
      Product.getAllProducts({ firebase: firebase, onlyUsable: true })
        .then((result) => {
          dispatchRecipe({
            type: REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          console.error(error);
          dispatchRecipe({
            type: REDUCER_ACTIONS.GENERIC_FAILURE,
            error: error,
          });
        });
    }
    if (recipe.departments.length === 0 && editMode) {
      dispatchRecipe({
        type: REDUCER_ACTIONS.DEPARTMENTS_FETCH_INIT,
      });
      Department.getAllDepartments(firebase)
        .then((result) => {
          dispatchRecipe({
            type: REDUCER_ACTIONS.DEPARTMENTS_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          console.error(error);
          dispatchRecipe({
            type: REDUCER_ACTIONS.GENERIC_FAILURE,
            error: error,
          });
        });
    }
  }, [editMode]);
  /* ------------------------------------------
  // Feldwert ändern -- onChange
  // ------------------------------------------ */
  const onChangeField = (event) => {
    dispatchRecipe({
      type: REDUCER_ACTIONS.RECIPE_ON_CHANGE,
      data: recipe,
      field: event.target.name,
      value: event.target.value,
    });
  };
  /* ------------------------------------------
  // Rezept speichern
  // ------------------------------------------ */
  const onSaveClick = async (authUser) => {
    try {
      Recipe.checkRecipeData(recipe.data);
    } catch (error) {
      dispatchRecipe({
        type: REDUCER_ACTIONS.RECIPE_ON_ERROR,
        payload: error,
      });
      return;
    }

    let newRecipe = {};

    try {
      newRecipe = await Recipe.save({
        firebase: firebase,
        recipe: recipe.data,
        authUser: authUser,
        triggerCloudfunction:
          recipe.dbVersion.name !== recipe.data.name ||
          recipe.dbVersion.pictureSrcFullSize !==
            recipe.data.pictureSrcFullSize,
      });
    } catch (error) {
      alert("error");
      console.error(error);
      dispatchRecipe({
        type: REDUCER_ACTIONS.RECIPE_ON_ERROR,
        payload: error,
      });
      return;
    }
    dispatchRecipe({
      type: REDUCER_ACTIONS.RECIPE_ON_SAVE,
      payload: newRecipe.uid,
    });
    // setDbRecipe(newRecipe);
  };
  /* ------------------------------------------
  // Änderungsmodus Abbrechen
  // ------------------------------------------ */
  const onCancelClick = () => {
    //Bei Abbruch db Rezept anzeigen...
    if (!recipe.dbVersion.uid && props.location.state.action === ACTIONS.NEW) {
      push({
        pathname: ROUTES.RECIPES,
      });
    } else {
      dispatchRecipe({
        type: REDUCER_ACTIONS.RESTORE_DB_VERSION,
      });
      setEditMode(false);
    }
  };

  /* ------------------------------------------
  // Änderungsmodus aktivieren
  // ------------------------------------------ */
  const onEditClick = () => {
    setEditMode(true);
  };
  /* ------------------------------------------
  // Feldwert Tag ändern - onChange
  // ------------------------------------------ */
  const onChangeTagInput = (event) => {
    setTagInput(event.target.value);
  };
  /* ------------------------------------------
  // Tag hinzufügen
  // ------------------------------------------ */
  const onAddTag = () => {
    if (tagInput) {
      let tags = Recipe.addTag({
        tags: recipe.data.tags,
        tagsToAdd: tagInput,
      });

      dispatchRecipe({
        type: REDUCER_ACTIONS.SET_TAGS,
        payload: tags,
      });
      if (!editMode) {
        // Speichern
        Recipe.save({
          firebase: firebase,
          recipe: { ...recipe.data, tags: tags },
          authUser: authUser,
          triggerCloudfunction: false,
        });
      }
      setTagInput("");
    }
  };
  /* ------------------------------------------
  // Tag löschen
  // ------------------------------------------ */
  const onTagDelete = (tagToDelete) => {
    let tags = Recipe.deleteTag({
      tags: recipe.data.tags,
      tagToDelete: tagToDelete,
    });

    dispatchRecipe({
      type: REDUCER_ACTIONS.SET_TAGS,
      payload: tags,
    });
    if (!editMode) {
      // Speichern
      Recipe.save({
        firebase: firebase,
        recipe: { ...recipe.data, tags: tags },
        authUser: authUser,
        triggerCloudfunction: false,
      });
    }
  };
  /* ------------------------------------------
  // Rating setzen
  // ------------------------------------------ */
  const onSetRating = (event, newValue) => {
    // DB
    if (newValue === recipe.data.rating.myRating) {
      return;
    }

    const rating = Recipe.updateRating(
      firebase,
      recipe.data.uid,
      recipe.data.rating,
      newValue,
      authUser.uid
    );

    // Reducer setzen
    dispatchRecipe({
      type: REDUCER_ACTIONS.RATING_UPDATE,
      payload: rating,
    });
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatchRecipe({
      type: REDUCER_ACTIONS.CLOSE_SNACKBAR,
    });
  };

  /* ------------------------------------------
  // Bild in Firebase Storage hochladen
  // ------------------------------------------ */
  const onPictureUpload = async (event) => {
    event.persist();
    var file = event.target.files[0];

    // Upload Start...
    dispatchRecipe({
      type: REDUCER_ACTIONS.UPLOAD_PICTURE_INIT,
    });

    await Recipe.uploadPicture({
      firebase: firebase,
      file: file,
      recipe: recipe.data,
      authUser: authUser,
    }).then((downloadURLs) => {
      dispatchRecipe({
        type: REDUCER_ACTIONS.UPLOAD_PICTURE_SUCCESS,
        payload: downloadURLs,
      });
    });
  };
  /* ------------------------------------------
  // Bild löschen
  // ------------------------------------------ */
  const onPictureDelete = () => {
    if (window.confirm(TEXT.QUESTION_DELETE_IMAGE)) {
      Recipe.deletePicture({
        firebase: firebase,
        recipe: recipe.data,
        authUser: authUser,
      })
        .then(() => {
          dispatchRecipe({
            type: REDUCER_ACTIONS.DELETE_PICTURE_SUCCESS,
          });
        })
        .catch((error) => {
          dispatchRecipe({
            type: REDUCER_ACTIONS.RECIPE_ON_ERROR,
            payload: error,
          });
        });
    }
  };
  /* ------------------------------------------
  // Profi Modus umschalten
  // ------------------------------------------ */
  const onToggleProfiModus = () => {
    if (ingredientProfiModus) {
      setsetIngredientsCols(INGREDIENT_COLS.PROFI_MODE_OFF);
    } else {
      setsetIngredientsCols(INGREDIENT_COLS.PROFI_MODE_ON);
    }
    setIngredientProfiModus(!ingredientProfiModus);
  };
  /* ------------------------------------------
  // Zutat - OnChange
  // ------------------------------------------ */
  const onChangeIngredient = (event, newValue, action, objectId) => {
    let ingredientPos;

    if (!event.target.id && action !== "clear") {
      return;
    }

    if (event.target.id) {
      ingredientPos = event.target.id.split("_");
    } else {
      ingredientPos = objectId.split("_");
    }
    ingredientPos[2] = ingredientPos[2].split("-")[0];
    let value;

    if (newValue && newValue.inputValue) {
      // Neues Produkt. PopUp Anzeigen und nicht weiter
      setProductAddValues({
        ...productAddValues,
        productName: newValue.inputValue,
        popUpOpen: true,
      });
      // ID der Position speichern, die das Ereignis
      // auslöst (im Falle eines Abbruchs)
      setTriggeredIngredientPos(ingredientPos[2]);
      return;
    }
    if (ingredientPos[0] === "unit") {
      // Die Autocomplete Komponente liefert den Event anders zurück
      // hier wird die gewählte Option als -Option# zurückgegeben
      // diese Info muss umgeschlüsselt werden
      value = newValue;
    } else if (ingredientPos[0] === "product") {
      // Nur Produkte, die wir kennen (und somit eine UID haben)
      if (action !== "clear" && (!newValue || !newValue.uid)) {
        return;
      }
      if (!newValue) {
        value = { uid: "", name: "" };
      } else {
        value = { uid: newValue.uid, name: newValue.name };
      }
    } else {
      value = event.target.value;
    }

    dispatchRecipe({
      type: REDUCER_ACTIONS.INGREDIENT_ONCHANGE,
      field: ingredientPos[0],
      value: value,
      pos: ingredientPos[2],
      // uid: ingredientPos[1],
    });
  };
  /* ------------------------------------------
  // Zubereitungsschritt - onChange
  // ------------------------------------------ */
  const onChangePreparationStep = (event) => {
    let prepparationStepPos = event.target.id.split("_");

    dispatchRecipe({
      type: REDUCER_ACTIONS.PREPARATIONSTEP_ONCHANGE,
      field: prepparationStepPos[1],
      value: event.target.value,
      pos: parseInt(prepparationStepPos[3]),
    });
  };
  /* ------------------------------------------
  // PopUp Produkt Hinzufügen - onClose
  // ------------------------------------------ */
  const onCloseProductToAdd = () => {
    // Wert löschen.... der das ausgelöst hat.

    dispatchRecipe({
      type: REDUCER_ACTIONS.DELETE_INGREDIENT_NAME,
      uid: triggeredIngredientPos,
    });

    setTriggeredIngredientPos();
    setProductAddValues({ ...productAddValues, popUpOpen: false });
  };
  /* ------------------------------------------
  // PopUp Produkt Hinzufügen - onCreate
  // ------------------------------------------ */
  const onCreateProductToAdd = (productToAdd, product) => {
    dispatchRecipe({
      type: REDUCER_ACTIONS.INGREDIENT_ONCHANGE,
      field: "product",
      value: { uid: product.uid, name: product.name },
      pos: triggeredIngredientPos,
    });

    dispatchRecipe({
      type: REDUCER_ACTIONS.ADD_NEW_PRODUCT,
      value: product,
      // value: { uid: newUid, name: productToAdd.name },
    });

    dispatchRecipe({
      type: REDUCER_ACTIONS.SNACKBAR_SHOW,
      message: TEXT.PRODUCT_CREATED(product.name),
      severity: "success",
    });

    setTriggeredIngredientPos();
    setProductAddValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  /* ------------------------------------------
  // ContextMenü für Postionen
  // ------------------------------------------ */
  const onPositionMoreClick = (event) => {
    // Zwischenspeichern bei welchem Element das Menü auf-
    // gerufen wurde
    let pressedButton = event.currentTarget.id.split("_");
    setSelectedItem({
      type: pressedButton[1],
      ingredient: pressedButton[2],
      pos: parseInt(pressedButton[3]),
      noOfPostitions:
        pressedButton[1] === CONSTANTS.PANELPREFIX.INGREDIENTS
          ? recipe.data.ingredients.length
          : recipe.data.preparationSteps.length,
    });
    setMenuItemAnchorEl(event.currentTarget);
  };
  /* ------------------------------------------
  // Kontextmenü Klick
  // ------------------------------------------ */
  const onItemContextMenuClick = (event) => {
    let pressedButton = event.currentTarget.id.split("_");
    // 0 = in Welchem Block (Ingredient/PreparationStep)
    // 1 = Aktion (Add, Delete, MoveUp, MoveDown)
    // 2 = Position des Elements
    let oldList = [];
    let newList = [];
    let newObject = {};

    switch (pressedButton[0]) {
      case CONSTANTS.PANELPREFIX.INGREDIENTS:
        oldList = recipe.data.ingredients;
        newObject = Recipe.createEmptyIngredient();
        break;
      case CONSTANTS.PANELPREFIX.PREPARATIONSTEPS:
        oldList = recipe.data.preparationSteps;
        newObject = Recipe.createEmptyPreparationStep();
        break;
      default:
        return;
    }

    switch (pressedButton[1]) {
      case ACTIONS.ADD:
        newList = Recipe.addEmptyEntry({
          array: oldList,
          pos: parseInt(pressedButton[2]),
          emptyObject: newObject,
          renumberByField: "pos",
        });
        break;
      case ACTIONS.DELETE:
        newList = Recipe.deleteEntry({
          array: oldList,
          fieldValue: parseInt(pressedButton[2]),
          fieldName: "pos",
          emptyObject: newObject,
          renumberByField: "pos",
        });
        break;
      case ACTIONS.MOVE_UP:
        newList = Recipe.moveArrayEntryUp({
          array: oldList,
          posToMoveUp: parseInt(pressedButton[2]),
          renumberByField: "pos",
        });
        break;
      case ACTIONS.MOVE_DOWN:
        newList = Recipe.moveArrayEntryDown({
          array: oldList,
          posToMoveDown: parseInt(pressedButton[2]),
          renumberByField: "pos",
        });
        break;
      default:
        return;
    }

    dispatchRecipe({
      type: REDUCER_ACTIONS.RECIPE_UPDATE_LIST,
      payload: newList,
      array: pressedButton[0],
    });

    setMenuItemAnchorEl(null);
  };
  /* ------------------------------------------
  // Kontextmenü schliessen
  // ------------------------------------------ */
  const onItemContextMenuClose = () => {
    setMenuItemAnchorEl();
    setMenuItemAnchorEl(null);
  };

  /* ------------------------------------------
  // Buttons Zutaten - onClick
  // ------------------------------------------ */
  const onFormButonRowClick = (event) => {
    let pressedButton = event.currentTarget.id.split("_");
    // 0 = in Welchem Block (Ingredient/PreparationStep)
    // 1 = Aktion (Add, Delete, MoveUp, MoveDown)
    // 2 = Position des Elements
    let oldList = [];
    let newList = [];
    let newObject = {};

    switch (pressedButton[0]) {
      case CONSTANTS.PANELPREFIX.INGREDIENTS:
        oldList = recipe.data.ingredients;
        newObject = Recipe.createEmptyIngredient();
        break;
      case CONSTANTS.PANELPREFIX.PREPARATIONSTEPS:
        oldList = recipe.data.preparationSteps;
        newObject = Recipe.createEmptyPreparationStep();
        break;
      default:
        return;
    }

    switch (pressedButton[1]) {
      case "add":
        newList = Recipe.addEmptyEntry({
          array: oldList,
          pos: parseInt(pressedButton[2]),
          emptyObject: newObject,
          renumberByField: "pos",
        });
        break;
      case "delete":
        newList = Recipe.deleteEntry({
          array: oldList,
          fieldValue: parseInt(pressedButton[2]),
          fieldName: "pos",
          emptyObject: newObject,
          renumberByField: "pos",
        });
        break;
      case "up":
        newList = Recipe.moveArrayEntryUp({
          array: oldList,
          posToMoveUp: parseInt(pressedButton[2]),
          renumberByField: "pos",
        });
        break;
      case "down":
        newList = Recipe.moveArrayEntryDown({
          array: oldList,
          posToMoveDown: parseInt(pressedButton[2]),
          renumberByField: "pos",
        });
        break;
      default:
        return;
    }

    dispatchRecipe({
      type: REDUCER_ACTIONS.RECIPE_UPDATE_LIST,
      payload: newList,
      array: pressedButton[0],
    });
  };
  /* ------------------------------------------
  // Kommentar speichern
  // ------------------------------------------ */
  const onSaveComment = async (newComment) => {
    const comment = await Recipe.saveComment(
      firebase,
      recipe.data.uid,
      newComment,
      authUser
    );
    dispatchRecipe({
      type: REDUCER_ACTIONS.COMMENT_ADD,
      payload: comment,
    });
  };
  /* ------------------------------------------
  // Kommentare laden
  // ------------------------------------------ */
  const onLoadPreviousComments = async () => {
    const newComments = await Recipe.getPreviousComments(
      firebase,
      recipe.data.uid,
      recipe.data.comments[0]
    );

    dispatchRecipe({
      type: REDUCER_ACTIONS.COMMENT_LOAD_PREVIOUS,
      payload: newComments,
    });
  };
  /* ------------------------------------------
  // PopUp Rezept Skalieren öffnen
  // ------------------------------------------ */
  const onOpenRecipeScaleDialog = () => {
    setDialogScaleRecipe({ ...dialogScaleRecipe, popUpOpen: true });
  };
  /* ------------------------------------------
  // PopUp Rezept Skalieren schliessen (cancel)
  // ------------------------------------------ */
  const onCloseRecipeScaleDialog = () => {
    setDialogScaleRecipe({ ...dialogScaleRecipe, popUpOpen: false });
  };
  /* ------------------------------------------
  // PopUp Rezept wurde mit OK geschlossen
  // ------------------------------------------ */
  const onRecipeScale = (scaledPortions) => {
    let scaledIngredients = [];
    if (!Number.isNaN(scaledPortions) && parseInt(scaledPortions) > 0) {
      scaledIngredients = Recipe.scale({
        recipe: recipe.data,
        portionsToScale: scaledPortions,
      });
    }
    dispatchRecipe({
      type: REDUCER_ACTIONS.RECIPE_ON_SCALE,
      scaledPortions: scaledPortions,
      scaledIngredients: scaledIngredients,
    });
    //PopUp schliessen
    setDialogScaleRecipe({ ...dialogScaleRecipe, popUpOpen: false });
  };
  /* ------------------------------------------
// Printversion erzeugen
// ------------------------------------------ */
  const onPrintVersionClick = async () => {
    const doc = (
      <RecipePdf
        recipe={recipe.data}
        scaledPortions={recipe.scaledPortions}
        scaledIngredients={recipe.scaledIngredients}
        authUser={authUser}
      />
    );
    const asPdf = pdf([]);
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    saveAs(blob, recipe.data.name + TEXT.SUFFIX_PDF);
  };
  /* ------------------------------------------
  // ================= AUSGABE ================
  // ------------------------------------------ */
  return (
    <React.Fragment>
      <CssBaseline />
      {/*===== HEADER ===== */}

      <RecipeHeader
        recipe={recipe.data}
        authUser={authUser}
        editMode={editMode}
        onEditClick={onEditClick}
        onSaveClick={() => onSaveClick(authUser)}
        onCancelClick={onCancelClick}
        onScaleClick={onOpenRecipeScaleDialog}
        onPrintversionClick={onPrintVersionClick}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
        <Backdrop className={classes.backdrop} open={recipe.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid container spacing={2}>
          {recipe.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={recipe.error}
                messageTitle={TEXT.ALERT_TITLE_WAIT_A_MINUTE}
              />
            </Grid>
          )}
          {editMode && (
            <Grid item key={"header"} xs={12}>
              <NamePanel
                key={"namePanel"}
                recipe={recipe}
                onChange={onChangeField}
              />
            </Grid>
          )}
          <Grid item key={"infos"} xs={12} sm={6}>
            <InfoPanel
              key={"infoPanel"}
              recipe={recipe.data}
              editMode={editMode}
              onChange={onChangeField}
              scaledPortions={recipe.scaledPortions}
            />
          </Grid>
          {editMode && (
            <Grid item key={"image"} xs={12} sm={6}>
              <ImagePanel
                key={"imagePanel"}
                recipeUid={recipe.data.uid}
                pictureSrc={recipe.data.pictureSrc}
                recipeName={recipe.data.name}
                isLoadingPicture={recipe.isLoadingPicture}
                editMode={editMode}
                onChange={onChangeField}
                onUpload={onPictureUpload}
                onDelete={onPictureDelete}
              />
            </Grid>
          )}
          {!editMode && (
            <Grid item key={"stats"} xs={12} sm={6}>
              <StatsPanel
                key={"statsPanel"}
                rating={recipe.data.rating}
                onChange={onSetRating}
              />
            </Grid>
          )}
          <Grid item key={"notes"} xs={12} sm={6}>
            <NotesPanel
              key={"notesPanel"}
              note={recipe.data.note}
              editMode={editMode}
              onChange={onChangeField}
            />
          </Grid>
          <Grid item key={"tags"} xs={12} sm={6}>
            <TagsPanel
              key={"tagsPanel"}
              tags={recipe.data.tags}
              onChange={onChangeField}
              tagInput={tagInput}
              onChangeTagInput={onChangeTagInput}
              onAddTag={onAddTag}
              onTagDelete={onTagDelete}
            />
          </Grid>
          <Grid item key={"ingredients"} xs={12} sm={12}>
            <IngredientsPanel
              key={"ingredientsPanel"}
              ingredients={recipe.data.ingredients}
              products={recipe.products}
              units={recipe.units}
              editMode={editMode}
              onChangeIngredient={onChangeIngredient}
              ingredientProfiModus={ingredientProfiModus}
              onToggleProfiModus={onToggleProfiModus}
              gridIngredientsCols={gridIngredientsCols}
              onPositionMoreClick={onPositionMoreClick}
              scaledIngredients={recipe.scaledIngredients}
            />
          </Grid>
          <Grid item key={"prepartionSteps"} xs={12} sm={12}>
            <PrepartionStepsPanel
              key={"preparationStepsPanel"}
              preparationSteps={recipe.data.preparationSteps}
              editMode={editMode}
              onChangePrepartionStep={onChangePreparationStep}
              onPositionMoreClick={onPositionMoreClick}
            />
          </Grid>
          {!editMode && (
            <Grid item key={"comments"} xs={12} sm={12}>
              <CommentPanel
                recipe={recipe}
                onSaveComment={onSaveComment}
                onLoadPrevious={onLoadPreviousComments}
              />
            </Grid>
          )}
        </Grid>
      </Container>
      {/* Kontextmenü Positionen */}
      <PositionContextMenu
        anchorEl={menuItemAnchorEl}
        handleMenuClick={onItemContextMenuClick}
        handleMenuClose={onItemContextMenuClose}
        type={selectedItem.type}
        pos={selectedItem.pos}
        noListEntries={selectedItem.noOfPostitions}
      />
      {/* Neues Produkt hinzufügen PopUp */}
      <DialogProduct
        productName={productAddValues.productName}
        dialogType={PRODUCT_DIALOG_TYPE.CREATE}
        dialogOpen={productAddValues.popUpOpen}
        handleOk={onCreateProductToAdd}
        handleClose={onCloseProductToAdd}
        products={recipe.products}
        units={recipe.units}
        departments={recipe.departments}
      />
      <DialogScaleRecipe
        dialogOpen={dialogScaleRecipe.popUpOpen}
        scaledPortions={
          recipe.data.scaledPortions
            ? recipe.data.scaledPortions
            : recipe.data.portions
        }
        handleOk={onRecipeScale}
        handleClose={onCloseRecipeScaleDialog}
      />
      <CustomSnackbar
        message={recipe.snackbar.message}
        severity={recipe.snackbar.severity}
        snackbarOpen={recipe.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ============================== Header =============================
// =================================================================== */
const RecipeHeader = ({
  recipe,
  authUser,
  editMode,
  onEditClick,
  onSaveClick,
  onCancelClick,
  onScaleClick,
  onPrintversionClick,
}) => {
  return (
    <React.Fragment>
      {!editMode ? (
        <React.Fragment>
          <PageTitle
            title={recipe.name}
            // subTitle={recipe.uid}
            pictureSrc={recipe.pictureSrcFullSize}
          />
          {/* Bearbeitung nur durch Berechtigte Person */}
          <ButtonRow
            key="buttons_view"
            buttons={[
              {
                id: "edit",
                hero: true,
                visible:
                  recipe.createdFromUid === authUser.uid ||
                  authUser.roles.includes(ROLES.SUB_ADMIN) ||
                  authUser.roles.includes(ROLES.ADMIN),
                label: TEXT.BUTTON_EDIT,
                variant: "contained",
                color: "primary",
                onClick: onEditClick,
              },
              {
                id: "scale",
                hero: true,
                visible: true,
                label: TEXT.BUTTON_SCALE,
                variant: "outlined",
                color: "primary",
                onClick: onScaleClick,
              },
              {
                id: "print",
                hero: true,
                visible: true,
                label: TEXT.BUTTON_PRINTVERSION,
                variant: "outlined",
                color: "primary",
                onClick: onPrintversionClick,
              },
              //NEXT_FEATURE: zu Event hinzufügen --> neues PopUp!
              // {
              //   id: "addToEvent",
              //   label: "Zu Anlass hinzufügen",
              //   variant: "outlined",
              //   color: "primary",
              //   // onClick: onEditClick,
              // },
              // {
              //   id: "addToEvent",
              //   hero: true,
              //   label: TEXT.BUTTON_ADD_TO_EVENT,
              //   variant: "outlined",
              //   color: "primary",
              //   visible: true,
              //   // onClick: onEditClick,
              // },
            ]}
          />
        </React.Fragment>
      ) : (
        <ButtonRow
          key="buttons_edit"
          buttons={[
            {
              id: "save",
              hero: true,
              label: TEXT.BUTTON_SAVE,
              variant: "contained",
              color: "primary",
              visible: true,
              onClick: onSaveClick,
            },
            {
              id: "cancel",
              hero: true,
              label: TEXT.BUTTON_CANCEL,
              variant: "outlined",
              color: "primary",
              visible: true,
              onClick: onCancelClick,
            },
          ]}
        />
      )}
    </React.Fragment>
  );
};
/* ===================================================================
// =============================== Name ==============================
// =================================================================== */
const NamePanel = ({ recipe, onChange }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          Rezept
        </Typography>

        <TextField
          id="name"
          key="name"
          autoComplete="recipeName"
          name="name"
          required
          fullWidth
          label={TEXT.FIELD_NAME}
          value={recipe.data.name}
          onChange={onChange}
          autoFocus
        />
      </CardContent>
    </Card>
  );
};

/* ===================================================================
// ============================ Image Panel ==========================
// =================================================================== */
const ImagePanel = ({
  recipeUid,
  pictureSrc,
  recipeName,
  isLoadingPicture,
  editMode,
  onChange,
  onUpload,
  onDelete,
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"imageCard"}>
      {!isLoadingPicture && pictureSrc && (
        <CardMedia
          key={"imageCardMedia"}
          className={classes.cardMedia}
          image={pictureSrc}
          title={recipeName}
        />
      )}
      <CardContent className={classes.cardContent} key={"imageCardContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          Bild
        </Typography>
        {isLoadingPicture && <LinearProgress />}
        <Grid container spacing={2}>
          {/* URL nur anzeigen, wenn nicht auf eigenem Server */}
          {!pictureSrc.includes("firebasestorage.googleapis") &&
            !pictureSrc.includes("chuchipirat") && (
              <Grid item key={"grid_pictureSrc"} xs={12}>
                <FormListItem
                  value={editMode ? pictureSrc : Utils.getDomain(pictureSrc)}
                  id={"pictureSrc"}
                  key={"pictureSrc"}
                  label={TEXT.FIELD_IMAGE_SOURCE}
                  icon={<ImageIcon fontSize="small" />}
                  disabled={
                    !pictureSrc
                      ? false
                      : pictureSrc.includes("firebasestorage.googleapis") &&
                        pictureSrc.includes("chuchipirat")
                  }
                  editMode={editMode}
                  onChange={onChange}
                />
              </Grid>
            )}
          {pictureSrc.includes("firebasestorage.googleapis") &&
            pictureSrc.includes("chuchipirat") && (
              <Grid item key={"grid_pictureDelete"} xs={12}>
                <Button
                  disabled={!pictureSrc}
                  fullWidth
                  variant="outlined"
                  color="default"
                  onClick={onDelete}
                  startIcon={<DeleteIcon />}
                  component="span"
                >
                  {TEXT.BUTTON_DELETE}
                </Button>
              </Grid>
            )}
          <Grid item key={"grid_imageUpload"} xs={12}>
            <React.Fragment>
              <input
                accept="image/*"
                className={classes.inputFileUpload}
                id="icon-button-file"
                type="file"
                onChange={onUpload}
              />
              <label htmlFor="icon-button-file">
                <Button
                  disabled={!recipeUid}
                  fullWidth
                  variant="contained"
                  color="default"
                  startIcon={<CloudUploadIcon />}
                  component="span"
                >
                  {TEXT.BUTTON_UPLOAD}
                </Button>
              </label>
            </React.Fragment>
          </Grid>
          {!recipeUid && (
            <Grid item key={"grid_imageInfo"} xs={12}>
              <AlertMessage
                severity="info"
                body={TEXT.RECIPE_SAVE_BEFORE_UPLOAD_PICTURE}
              />
            </Grid>
          )}
          <Grid item key={"grid_imageText"} xs={12}>
            <Typography color="textSecondary" variant="body2">
              {TEXT.ALERT_TEXT_IMAGE_SOURCE}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

/* ===================================================================
// =========================== Infos Panel ===========================
// =================================================================== */
const InfoPanel = ({ recipe, editMode, onChange, scaledPortions }) => {
  const classes = useStyles();
  const { push } = useHistory();

  const onCreatedByClick = (userUid) => {
    push({
      pathname: `${ROUTES.USER_PUBLIC_PROFILE}/${recipe.createdFromUid}`,
      state: {
        action: ACTIONS.VIEW,
        displayName: recipe.createdFromDisplayName,
      },
    });
  };

  return (
    <React.Fragment>
      <Card className={classes.card} key={"cardInfo"}>
        <CardContent className={classes.cardContent} key={"cardContentInfo"}>
          <Typography gutterBottom={true} variant="h5" component="h2">
            Infos
          </Typography>
          <List key={"infoList"}>
            <FormListItem
              id={"portions"}
              key={"portions"}
              value={
                !editMode &&
                scaledPortions &&
                recipe.portions !== scaledPortions
                  ? scaledPortions
                  : recipe.portions
              }
              label={TEXT.FIELD_PORTIONS}
              icon={<PieChartIcon fontSize="small" />}
              type="number"
              required
              editMode={editMode}
              onChange={onChange}
            />
            <FormListItem
              id={"source"}
              key={"source"}
              value={recipe.source}
              label={TEXT.FIELD_SOURCE}
              icon={<BookmarkIcon fontSize="small" />}
              editMode={editMode}
              onChange={onChange}
              isLink={Utils.isUrl(recipe.source)}
            />
            <FormListItem
              id={"preparationTime"}
              key={"preparationTime"}
              value={recipe.preparationTime}
              label={TEXT.FIELD_PREPARATION_TIME}
              icon={<TimerIcon fontSize="small" />}
              editMode={editMode}
              onChange={onChange}
            />
            <FormListItem
              id={"restTime"}
              key={"restTime"}
              value={recipe.restTime}
              label={TEXT.FIELD_REST_TIME}
              icon={<KitchenIcon fontSize="small" />}
              editMode={editMode}
              onChange={onChange}
            />
            <FormListItem
              id={"cookTime"}
              key={"cookTime"}
              value={recipe.cookTime}
              label={TEXT.FIELD_COOK_TIME}
              icon={<OutdoorGrillIcon fontSize="small" />}
              editMode={editMode}
              onChange={onChange}
            />

            {!editMode && (
              <React.Fragment>
                <FormListItem
                  id={"createdFromDisplayName"}
                  key={"createdFromDisplayName"}
                  value={recipe.createdFromDisplayName}
                  label={TEXT.FIELD_CREATED_FROM}
                  icon={<PersonIcon fontSize="small" />}
                  editMode={editMode}
                  onClick={onCreatedByClick}
                />
                <FormListItem
                  value={
                    recipe.createdAt &&
                    recipe.createdAt.toLocaleString("de-CH", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  }
                  id={"createdAt"}
                  key={"createdAt"}
                  label={TEXT.FIELD_CREATED_AT}
                  icon={<TodayIcon fontSize="small" />}
                  editMode={editMode}
                />
              </React.Fragment>
            )}
          </List>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

//*===================================================================
// ======================== Statistik und Tags =======================
// =================================================================== */
const StatsPanel = ({ rating, onChange }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardStats"}>
      <CardContent className={classes.cardContent} key={"cardStatsContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_STATS}
        </Typography>

        <div className={classes.statKpiBox} align="center">
          <Rating
            name="avgRating"
            value={rating.avgRating}
            precision={0.1}
            readOnly
          />
          <Typography color="textSecondary" align="center">
            {TEXT.FIELD_AVG_RATING}
          </Typography>
          {rating.noRatings === 1 ? (
            <Typography color="textSecondary" align="center" variant="body2">
              {`${rating.noRatings} ${TEXT.VOTE}`}
            </Typography>
          ) : rating.noRatings > 1 ? (
            <Typography color="textSecondary" align="center" variant="body2">
              {`${rating.noRatings} ${TEXT.VOTES}`}
            </Typography>
          ) : null}
        </div>
        <div className={classes.statKpiBox} align="center">
          <Rating
            name="myRating"
            value={rating.myRating}
            precision={0.5}
            onChange={onChange}
          />
          <Typography color="textSecondary" align="center">
            {TEXT.FIELD_YOUR_RATING}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};

//*===================================================================
// ============================== Hinweis ============================
// =================================================================== */
const NotesPanel = ({ note, editMode, onChange }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardNotes"}>
      <CardContent className={classes.cardContent} key={"cardNotesContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_NOTES}
        </Typography>
        <List>
          <FormListItem
            id={"note"}
            key={"note"}
            value={note}
            label={TEXT.FIELD_HINT}
            // icon={<KitchenIcon fontSize="small" />}
            editMode={editMode}
            onChange={onChange}
            multiLine
          />
        </List>
      </CardContent>
    </Card>
  );
};
//*===================================================================
// ================================ Tags =============================
// =================================================================== */
const TagsPanel = ({
  tags,
  tagInput,
  onChangeTagInput,
  onAddTag,
  onTagDelete,
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardTags"}>
      <CardContent className={classes.cardContent} key={"cardTagsContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_TAGS}
        </Typography>
        <List>
          <Input
            id={"tag"}
            key={"tag"}
            label={TEXT.FIELD_DAY}
            name={"tag"}
            autoComplete={"tag"}
            value={tagInput}
            onChange={onChangeTagInput}
            onKeyPress={(event) => {
              if (event.key === "Enter" && tagInput) {
                onAddTag();
              }
            }}
            fullWidth
          />
          {/* onKeyPress={(event) => {
                if (event.key === "Enter") {
                  onSearch();
                }
              }} */}

          {/* <FormListItem
            id={"tag"}
            key={"tag"}
            value={tagInput}
            label={TEXT.FIELD_DAY}
            // icon={<KitchenIcon fontSize="small" />}
            editMode={true}
            onChange={onChangeTagInput}
          /> */}
          <ListItemSecondaryAction>
            <IconButton
              onClick={onAddTag}
              edge="end"
              aria-label="addTag"
              disabled={!tagInput}
            >
              <AddCircleIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </List>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => onTagDelete(tag)}
            className={classes.chip}
          />
        ))}
      </CardContent>
    </Card>
  );
};

/* ===================================================================
// ============================= List Item ===========================
// =================================================================== */
const FormListItem = ({
  value,
  id,
  label,
  icon,
  type,
  multiLine = false,
  disabled = false,
  required = false,
  editMode,
  onChange,
  isLink,
  onClick,
}) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <ListItem key={"listItem_" + id}>
        {icon && (
          <ListItemIcon className={classes.listItemIcon}>{icon}</ListItemIcon>
        )}
        {editMode ? (
          <TextField
            id={id}
            key={id}
            type={type}
            InputProps={type === "number" ? { inputProps: { min: 0 } } : null}
            label={label}
            name={id}
            disabled={disabled}
            required={required}
            autoComplete={id}
            value={value}
            onChange={onChange}
            multiline={multiLine}
            fullWidth
          />
        ) : (
          <React.Fragment>
            <ListItemText className={classes.listItemTitle} secondary={label} />
            {isLink && value ? (
              <ListItemText className={classes.listItemContent}>
                <Link href={value}>{Utils.getDomain(value)}</Link>
              </ListItemText>
            ) : onClick ? (
              <ListItemText className={classes.listItemContent}>
                <Link onClick={() => onClick()}>{value}</Link>
                {/* <Link onClick={() => onClick("test")}>{value}</Link> */}
              </ListItemText>
            ) : (
              <ListItemText
                className={classes.listItemContent}
                primary={value}
              />
            )}
          </React.Fragment>
        )}
      </ListItem>
      {!editMode && <Divider />}
    </React.Fragment>
  );
};
//*===================================================================
// =============================== Zutaten ===========================
// =================================================================== */
const IngredientsPanel = ({
  ingredients,
  units,
  products,
  editMode,
  onChangeIngredient,
  ingredientProfiModus,
  onToggleProfiModus,
  gridIngredientsCols,
  onPositionMoreClick,
  scaledIngredients,
}) => {
  const classes = useStyles();

  // Entscheiden ob skalierte Zutaten angezeigt werden sollen
  let ingredientsToDisplay = [];
  if (!editMode && scaledIngredients.length > 0) {
    ingredientsToDisplay = scaledIngredients;
  } else {
    ingredientsToDisplay = ingredients;
  }

  return (
    <Card className={classes.card} key={"ingredientsCard"}>
      <CardContent
        className={classes.cardContent}
        key={"ingredientsCardContent"}
      >
        <Grid container>
          <Grid item xs={8} sm={9} md={9}>
            <Typography gutterBottom={true} variant="h5" component="h2">
              {TEXT.PANEL_INGREDIENTS}
            </Typography>
          </Grid>
          <Grid item xs={4} sm={3} md={3}>
            {editMode && (
              <FormControlLabel
                control={
                  <Switch
                    checked={ingredientProfiModus}
                    onChange={onToggleProfiModus}
                    name="checkedProfiMode"
                    color="primary"
                  />
                }
                label={TEXT.FIELD_PROFI_MODE}
              />
            )}
          </Grid>
        </Grid>
        {/* Edit Modus wird im Grid aufgebaut
            View Modus wird im List Style aufgebaut*/}
        {editMode ? (
          <Grid container spacing={2}>
            {ingredientsToDisplay.map((ingredient) => (
              <IngredientPosition
                key={ingredient.uid}
                ingredient={ingredient}
                units={units}
                products={products}
                editMode={editMode}
                ingredientProfiModus={ingredientProfiModus}
                gridIngredientsCols={gridIngredientsCols}
                noListEntries={ingredients.length}
                onChangeIngredient={onChangeIngredient}
                onPositionMoreClick={onPositionMoreClick}
              />
            ))}
          </Grid>
        ) : (
          <List key={"ingredientsList"}>
            {ingredientsToDisplay.map((ingredient) => (
              <IngredientPosition
                key={ingredient.uid}
                ingredient={ingredient}
                editMode={editMode}
                ingredientProfiModus={ingredientProfiModus}
                gridIngredientsCols={gridIngredientsCols}
              />
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ============================ Pos Zutaten ==========================
// =================================================================== */
const IngredientPosition = ({
  ingredient,
  units,
  products,
  editMode,
  ingredientProfiModus,
  gridIngredientsCols,
  onChangeIngredient,
  noListEntries,
  handleFormButtonRowClick,
  onPositionMoreClick,
}) => {
  const classes = useStyles();
  // Handler für Zutaten/Produkt hinzufügen
  const filter = createFilterOptions();

  const theme = useTheme();
  const breakpointIsXs = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <React.Fragment>
      {editMode ? (
        <React.Fragment>
          {!breakpointIsXs && (
            <Grid
              item
              key={"ingredient_pos_grid_" + ingredient.uid}
              xs={gridIngredientsCols.pos.xs}
              sm={gridIngredientsCols.pos.sm}
              className={classes.centerCenter}
            >
              <Typography
                key={"ingredient_pos_" + ingredient.uid}
                color="primary"
              >
                {ingredient.pos}
              </Typography>
            </Grid>
          )}
          <Grid
            item
            key={"ingredient_quantity_grid_" + ingredient.uid}
            xs={gridIngredientsCols.quantity.xs}
            sm={gridIngredientsCols.quantity.sm}
          >
            <IngredientFormField
              key={"quantity_" + ingredient.uid}
              id={"quantity_" + ingredient.uid + "_" + ingredient.pos}
              value={
                Number.isNaN(ingredient.quantity) ? "" : ingredient.quantity
              }
              label={TEXT.FIELD_QUANTITY}
              type="number"
              inputProps={{ min: 0 }}
              onChange={onChangeIngredient}
            />
          </Grid>
          {/* Einheit */}
          <Grid
            item
            key={"ingredient_unit_grid_" + ingredient.uid}
            xs={gridIngredientsCols.unit.xs}
            sm={gridIngredientsCols.unit.sm}
          >
            <Autocomplete
              key={"unit_" + ingredient.uid}
              id={"unit_" + ingredient.uid + "_" + ingredient.pos}
              value={ingredient.unit}
              options={units}
              autoSelect={!ingredient.unit}
              autoHighlight
              getOptionSelected={(unit) => unit === ingredient.unit}
              getOptionLabel={(unit) => unit}
              onChange={(event, newValue, action) =>
                onChangeIngredient(
                  event,
                  newValue,
                  action,
                  "unit_" + ingredient.uid + "_" + ingredient.pos
                )
              }
              fullWidth
              renderInput={(params) => (
                <TextField
                  // value={ingredient.unit}
                  {...params}
                  label={TEXT.FIELD_UNIT}
                  size="small"
                />
              )}
            />
          </Grid>
          {/* Skalierungsfaktor */}
          {ingredientProfiModus && (
            <Grid
              item
              key={"ingredient_scalingFractor_grid_" + ingredient.uid}
              xs={gridIngredientsCols.scalingFactor.xs}
              sm={gridIngredientsCols.scalingFactor.sm}
            >
              <IngredientFormField
                value={ingredient.scalingFactor}
                id={"scalingFactor_" + ingredient.uid + "_" + ingredient.pos}
                key={"scalingFactor_" + ingredient.uid}
                label={TEXT.FIELD_SCALING_FACTOR}
                type="number"
                onChange={onChangeIngredient}
                size="small"
                inputProps={{
                  min: "0.1",
                  max: "1",
                  step: "0.1",
                }}
              />
            </Grid>
          )}

          <Grid
            item
            key={"ingredient_product_grid_" + ingredient.uid}
            xs={gridIngredientsCols.product.xs}
            sm={gridIngredientsCols.product.sm}
          >
            <Autocomplete
              id={"product_" + ingredient.uid + "_" + ingredient.pos}
              key={"product_" + ingredient.uid}
              value={ingredient.product.name}
              options={products}
              autoSelect
              autoHighlight
              getOptionSelected={(product) =>
                product.name === ingredient.product.name
              }
              getOptionLabel={(option) => {
                //e.g value selected with enter, right from the input
                if (typeof option === "string") {
                  return option;
                }
                if (option.inputValue) {
                  return option.inputValue;
                }
                return option.name;
              }}
              onChange={(event, newValue, action) =>
                onChangeIngredient(
                  event,
                  newValue,
                  action,
                  "product_" + ingredient.uid + "_" + ingredient.pos
                )
              }
              fullWidth
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                if (
                  params.inputValue !== "" &&
                  // Sicherstellen, dass kein Produkt mit gleichem Namen erfasst wird
                  products.find(
                    (product) =>
                      product.name.toLowerCase() ===
                      params.inputValue.toLowerCase()
                  ) === undefined
                ) {
                  filtered.push({
                    inputValue: params.inputValue,
                    name: `"${params.inputValue}" ${TEXT.ADD}`,
                  });
                }
                return filtered;
              }}
              renderOption={(option) => option.name}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={TEXT.FIELD_INGREDIENT}
                  size="small"
                />
              )}
            />
          </Grid>
          <Grid
            item
            key={"ingredient_detail_grid_" + ingredient.uid}
            xs={gridIngredientsCols.detail.xs}
            sm={gridIngredientsCols.detail.sm}
          >
            <IngredientFormField
              value={ingredient.detail}
              key={"detail_" + ingredient.uid}
              id={"detail_" + ingredient.uid + "_" + ingredient.pos}
              label={TEXT.FIELD_DETAILS}
              onChange={onChangeIngredient}
              size="small"
            />
          </Grid>
          <Grid
            item
            xs={gridIngredientsCols.buttons.xs}
            sm={gridIngredientsCols.buttons.sm}
            className={classes.centerCenter}
          >
            <IconButton
              id={
                "MoreBtn_" +
                CONSTANTS.PANELPREFIX.INGREDIENTS +
                "_" +
                ingredient.uid +
                "_" +
                ingredient.pos
              }
              aria-label="settings"
              onClick={onPositionMoreClick}
            >
              <MoreVertIcon />
            </IconButton>
          </Grid>
          <Grid
            item
            key={"ingredient_divider_grid_" + ingredient.uid}
            xs={12}
            sm={12}
          >
            <Divider />
          </Grid>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <ListItem key={"ingredient_listItem_" + ingredient.uid}>
            <ListItemText
              className={classes.listItemQuantity}
              primary={
                Number.isNaN(ingredient.quantity)
                  ? ""
                  : ingredient.quantity.toLocaleString("de-CH")
              }
              key={"ingredient_listItem_quantity" + ingredient.uid}
            />
            <ListItemText
              className={classes.listItemUnit}
              secondary={ingredient.unit}
              key={"ingredient_listItem_unit" + ingredient.uid}
            />
            <ListItemText
              className={classes.listItemName}
              primary={ingredient.product.name}
              key={"ingredient_listItem_name" + ingredient.uid}
              // key={"ingredientName_" + ingredient.pos}
            />
            <ListItemText
              className={classes.listItemDetail}
              secondary={ingredient.detail}
              key={"ingredient_listItem_detail" + ingredient.uid}
            />
          </ListItem>
          <Grid item xs={12} sm={12}>
            <Divider />
          </Grid>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
/* ===================================================================
// ============================ Zutat Feld ===========================
// =================================================================== */
const IngredientFormField = ({
  value,
  id,
  label,
  type,
  inputProps,
  onChange,
  size,
}) => {
  // const classes = useStyles();

  return (
    <React.Fragment>
      <TextField
        type={type}
        id={id}
        key={id}
        label={label}
        name={id}
        autoComplete={id}
        value={value}
        InputProps={{ inputProps: inputProps }}
        size={size}
        fullWidth
        onChange={onChange}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ==================== Kontextmenü für Positionen ===================
// =================================================================== */
const PositionContextMenu = ({
  anchorEl,
  handleMenuClick,
  handleMenuClose,
  type,
  pos,
  noListEntries,
}) => {
  return (
    <Menu
      keepMounted
      id={"positionMenu"}
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem
        id={type + "_" + ACTIONS.ADD + "_" + pos}
        onClick={handleMenuClick}
      >
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{TEXT.TOOLTIP_ADD_POS}</Typography>
      </MenuItem>
      <MenuItem
        id={type + "_" + ACTIONS.DELETE + "_" + pos}
        onClick={handleMenuClick}
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {TEXT.BUTTON_DELETE}
        </Typography>
      </MenuItem>
      <MenuItem
        id={type + "_" + ACTIONS.MOVE_UP + "_" + pos}
        onClick={handleMenuClick}
        disabled={pos === 1}
      >
        <ListItemIcon>
          <KeyboardArrowUpIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {TEXT.TOOLTIP_MOVE_POS_UP}
        </Typography>
      </MenuItem>
      <MenuItem
        id={type + "_" + ACTIONS.MOVE_DOWN + "_" + pos}
        onClick={handleMenuClick}
        disabled={pos === noListEntries}
      >
        <ListItemIcon>
          <KeyboardArrowDownIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {TEXT.TOOLTIP_MOVE_POS_DOWN}
        </Typography>
      </MenuItem>
    </Menu>
  );
};
/* ===================================================================
// ========================= Zubereitung Panel =======================
// =================================================================== */
const PrepartionStepsPanel = ({
  preparationSteps,
  editMode,
  onChangePrepartionStep,
  // handleFormButtonRowClick,
  onPositionMoreClick,
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"preparationStepsCard"}>
      <CardContent
        className={classes.cardContent}
        key={"preparationStepsCardContent"}
      >
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_PREPARATION}
        </Typography>
        {editMode ? (
          <Grid container spacing={2}>
            {preparationSteps.map((preparationStep) => (
              <PreparationStepPosition
                key={preparationStep.uid}
                preparationStep={preparationStep}
                editMode={editMode}
                noPreparationSteps={preparationSteps.length}
                onChangePreparationStep={onChangePrepartionStep}
                onPositionMoreClick={onPositionMoreClick}
              />
            ))}
          </Grid>
        ) : (
          <List key={"preparationStepsList"}>
            {preparationSteps.map((preparationStep) => (
              <PreparationStepPosition
                key={preparationStep.uid}
                preparationStep={preparationStep}
                editMode={editMode}
                noPreparationSteps={preparationSteps.length}
              />
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ======================Zubereitung Position Panel===================
// =================================================================== */
const PreparationStepPosition = ({
  preparationStep,
  editMode,
  onChangePreparationStep,
  noPreparationSteps,
  // handleFormButtonRowClick,
  onPositionMoreClick,
}) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      {editMode ? (
        <React.Fragment>
          <Grid
            item
            key={"preparationstep_pos_grid_" + preparationStep.uid}
            xs={1}
            className={classes.centerCenter}
          >
            <Typography
              key={"preparationstep_pos_" + preparationStep.uid}
              color="primary"
            >
              {preparationStep.pos}
            </Typography>
          </Grid>
          <Grid
            item
            key={"preparationstep_step_grid_" + preparationStep.uid}
            xs={11}
            sm={8}
          >
            {/* Schritt */}
            <TextField
              id={
                "preparationstep_step_" +
                preparationStep.uid +
                "_" +
                preparationStep.pos
              }
              key={
                "preparationstep_step_" +
                preparationStep.uid +
                "_" +
                preparationStep.pos
              }
              label={TEXT.FIELD_STEP + " " + preparationStep.pos}
              name={"preparationstep_step_" + preparationStep.uid}
              autoComplete={"preparationStep"}
              value={preparationStep.step}
              multiline
              fullWidth
              onChange={onChangePreparationStep}
            />
          </Grid>
          <Grid
            item
            key={"preparationstep_buttonRow_grid_" + preparationStep.uid}
            xs={12}
            sm={3}
            className={classes.centerCenter}
          >
            <IconButton
              id={
                "MoreBtn_" +
                CONSTANTS.PANELPREFIX.PREPARATIONSTEPS +
                "_" +
                preparationStep.uid +
                "_" +
                preparationStep.pos
              }
              aria-label="settings"
              onClick={onPositionMoreClick}
            >
              <MoreVertIcon />
            </IconButton>
          </Grid>
          {noPreparationSteps > 1 && (
            <Grid
              item
              key={"preparationstep_divider_grid_" + preparationStep.uid}
              xs={12}
              sm={12}
            >
              <Divider />
            </Grid>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <ListItem key={"preparationStep" + preparationStep.uid}>
            <ListItemText
              // className={classes.listItemQuantity}
              primary={preparationStep.step}
              // key={"ingredientQuantity_" + ingredient.pos}
            />
            {noPreparationSteps !== preparationStep.pos && <Divider />}
          </ListItem>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

/* ===================================================================
// ========================== Kommentar Panel ========================
// =================================================================== */
const CommentPanel = ({ recipe, onSaveComment, onLoadPrevious }) => {
  const classes = useStyles();
  const [newComment, setNewComment] = React.useState("");
  const { push } = useHistory();

  var dateOptions = {
    year: "2-digit",
    month: "2-digit",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  const onChangeComment = (event) => {
    setNewComment(event.target.value);
  };

  const onClickSave = () => {
    onSaveComment(newComment);
    setNewComment("");
  };

  const onClickUser = (userUid, displayName) => {
    push({
      pathname: `${ROUTES.USER_PUBLIC_PROFILE}/${userUid}`,
      state: {
        action: ACTIONS.VIEW,
        displayName: displayName,
      },
    });
  };

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_COMMENTS}
        </Typography>
        <br />
        {recipe.data.noComments > recipe.data.comments.length && (
          <Box textAlign="center">
            <Link component="button" variant="caption" onClick={onLoadPrevious}>
              {TEXT.BUTTON_LOAD_OLDER_COMMENTS}
            </Link>
          </Box>
        )}
        <List className={classes.list}>
          {recipe.data.comments.map((comment, counter) => (
            <React.Fragment key={"comment_" + comment.uid}>
              {counter > 0 ? <Divider variant="inset" component="li" /> : null}
              <ListItem
                alignItems="flex-start"
                key={"comment_listitem" + comment.uid}
              >
                <ListItemAvatar>
                  <Avatar alt={comment.displayName} src={comment.pictureSrc} />
                </ListItemAvatar>
                <ListItemText
                  primary={comment.comment}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        className={classes.inline}
                        color="textPrimary"
                      >
                        <Link
                          onClick={() =>
                            onClickUser(comment.userUid, comment.displayName)
                          }
                        >
                          {comment.displayName}
                        </Link>
                      </Typography>
                      {" — "}
                      {comment.createdAt.toLocaleString("de-CH", dateOptions)}
                    </React.Fragment>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
        {/* Zuerst anzeigen, dann erfassen */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="comment_input"
              key="comment_input"
              label={TEXT.FIELD_YOUR_COMMENT}
              multiline
              rows={3}
              fullWidth
              placeholder={TEXT.FIELD_PLACEHOLDER_COMMENT}
              variant="outlined"
              value={newComment}
              onChange={onChangeComment}
            />
          </Grid>
          <Grid item xs={12} className={classes.centerCenter}>
            <Button
              variant="outlined"
              color="primary"
              disabled={!newComment || !newComment.replace(/\s/g, "").length}
              className={classes.button}
              endIcon={<SendIcon />}
              onClick={onClickSave}
            >
              {TEXT.BUTTON_SAVE_COMMENT}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(RecipePage);
