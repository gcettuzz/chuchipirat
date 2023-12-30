import React from "react";
import {useHistory} from "react-router";
import {useTheme} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import Recipe, {
  Ingredient,
  IngredientProduct,
  PreparationStep,
  RecipeMaterialPosition,
  RecipeProduct,
  // Section,
  MenuType,
  RecipeType,
  PositionType,
  Section,
  RecipeObjectStructure,
} from "./recipe.class";
import recipe, {
  OnUpdateRecipeProps,
  RecipeDivider,
  SwitchEditMode,
} from "./recipe";

import {
  Backdrop,
  CircularProgress,
  Container,
  TextField,
  Typography,
  Tooltip,
  Grid,
  GridSize,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  Chip,
  IconButton,
  Switch,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Input,
  Select,
  Checkbox,
  Link,
} from "@material-ui/core";

import {AutocompleteChangeReason} from "@material-ui/lab/Autocomplete";

import AddIcon from "@material-ui/icons/Add";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import ViewDayIcon from "@material-ui/icons/ViewDay";
import DeleteIcon from "@material-ui/icons/Delete";

import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";
import ButtonRow from "../Shared/buttonRow";
import {FormListItem} from "../Shared/formListItem";
import ProductAutocomplete from "../Product/productAutocomplete";
import DialogProduct, {
  PRODUCT_POP_UP_VALUES_INITIAL_STATE,
  PRODUCT_DIALOG_TYPE,
} from "../Product/dialogProduct";
import {
  MATERIAL_DIALOG_TYPE,
  MATERIAL_POP_UP_VALUES_INITIAL_STATE,
} from "../Material/dialogMaterial";
import UnitAutocomplete from "../Unit/unitAutocomplete";
import MaterialAutocomplete from "../Material/materialAutocomplete";

import useStyles from "../../constants/styles";
import Action from "../../constants/actions";

import Product from "../Product/product.class";
import Unit from "../Unit/unit.class";
import Utils from "../Shared/utils.class";
import Department from "../Department/department.class";
import AlertMessage from "../Shared/AlertMessage";

import * as IMAGE_REPOSITORY from "../../constants/imageRepository";
import * as TEXT from "../../constants/text";
import * as ROUTES from "../../constants/routes";

import Firebase from "../Firebase";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {DialogTagAdd} from "./recipe.view";
import Material from "../Material/material.class";
import DialogMaterial from "../Material/dialogMaterial";
import RecipeShort from "./recipeShort.class";
import {
  RecipeInfoPanel as RecipeInfoPanelView,
  MealPlanPanel as MealPlanPanelView,
} from "./recipe.view";
import EventGroupConfiguration from "../Event/GroupConfiguration/groupConfiguration.class";
import {PlanedMealsRecipe} from "../Event/Menuplan/menuplan.class";
import {DialogType, useCustomDialog} from "../Shared/customDialogContext";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
} from "react-beautiful-dnd";
import {
  NavigationValuesContext,
  NavigationObject,
} from "../Navigation/navigationContext";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  SET_RECIPE = "SET_RECIPE",
  UNITS_FETCH_INIT = "UNITS_FETCH_INIT",
  UNITS_FETCH_SUCCESS = "UNITS_FETCH_SUCCESS",
  PRODUCTS_FETCH_INIT = "PRODUCTS_FETCH_INIT",
  PRODUCTS_FETCH_SUCCESS = "PRODUCTS_FETCH_SUCCESS",
  DEPARTMENTS_FETCH_INIT = "DEPARTMENTS_FETCH_INIT",
  DEPARTMENTS_FETCH_SUCCESS = "DEPARTMENTS_FETCH_SUCCESS",
  MATERIALS_FETCH_INIT = "MATERIALS_FETCH_INIT",
  MATERIALS_FETCH_SUCCESS = "MATERIALS_FETCH_SUCCESS",
  DRAG_AND_DROP_UDPATE = "DRAG_AND_DROP_UDPATE",
  ON_FIELD_CHANGE = "ON_FIELD_CHANGE",
  ON_INGREDIENT_CHANGE = "ON_INGREDIENT_CHANGE",
  ON_INGREDIENT_ADD_NEW_PRODUCT = "ON_INGREDIENT_ADD_NEW_PRODUCT",
  ON_INGREDIENT_DELETE_NAME = "ON_INGREDIENT_DELETE_NAME",
  ON_MATERIAL_CHANGE = "ON_MATERIAL_CHANGE",
  ON_MATERIAL_DELETE_NAME = "ON_MATERIAL_DELETE_NAME",
  ON_MATERIAL_ADD_NEW_PRODUCT = "ON_MATERIAL_ADD_NEW_PRODUCT",
  ON_PREPARATIONSTEP_CHANGE = "ON_PREPARATIONSTEP_CHANGE",
  ON_UPDATE_LIST = "ON_UPDATE_LIST",
  GENERIC_ERROR = "GENERIC_ERROR",
  SNACKBAR_CLOSE = "SNACKBAR_CLOSE",
  SNACKBAR_SHOW = "SNACKBAR_SHOW",
  CLEAR_STATE = "CLEAR_STATE",
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};
type State = {
  recipe: Recipe;
  // recipeSavedVersion: Recipe;
  units: Unit[];
  products: Product[];
  departments: Department[];
  materials: Material[];
  // scaledPortions: number;
  // scaledIngredients: Ingredient[];
  // allRecipes: [],
  isLoading: boolean;
  isError: boolean;
  error: object;
  snackbar: Snackbar;
  // _loadingRecipe: boolean;
  _loadingUnits: boolean;
  _loadingProducts: boolean;
  _loadingDepartments: boolean;
  _loadingMaterials: boolean;
  // _loadingRecipes: boolean;
};

const inititialState: State = {
  recipe: new Recipe(),
  // recipeSavedVersion: new Recipe(),
  units: [],
  products: [],
  departments: [],
  materials: [],
  // scaledPortions: 0,
  // scaledIngredients: [],
  // allRecipes: [],
  isLoading: false,
  isError: false,
  error: {},
  snackbar: {open: false, severity: "success", message: ""},
  // _loadingRecipe: false,
  _loadingUnits: false,
  _loadingProducts: false,
  _loadingDepartments: false,
  _loadingMaterials: false,
  // _loadingRecipes: false,
};

enum DragDropTypes {
  INGREDIENT = "INGREDIENT",
  PREPARATIONSTEP = "PREPARATIONSTEPS",
  MATERIAL = "MATERIAL",
}

enum RecipeBlock {
  none = "none",
  ingredients = "ingredients",
  prepartionSteps = "preparationSteps",
  materials = "materials",
}

const recipesReducer = (state: State, action: DispatchAction): State => {
  let field: string;
  let value: any;
  let updatedMaterials: Recipe["materials"];

  switch (action.type) {
    case ReducerActions.SET_RECIPE:
      return {...state, recipe: action.payload.recipe};
    case ReducerActions.ON_FIELD_CHANGE:
      if (action.payload.field.includes(".")) {
        //ATTENTION:
        // Verschachtelter Wert --> Attribut holen
        // --> Name vor dem Punkt und Wert setzen
        // 💥 Achtung! Funktioniert nur mit einer Verschachtelungs-
        //             tiefe von 1.
        field = action.payload.field.split(".")[0];
        value = state.recipe[field];
        value[action.payload.field.split(".")[1]] = action.payload.value;
      } else {
        field = action.payload.field;
        value = action.payload.value;
      }
      return {
        ...state,
        recipe: {
          ...state.recipe,
          [field]: value,
        },
      };
    case ReducerActions.ON_INGREDIENT_CHANGE:
      let tmpIngredients = {...state.recipe.ingredients};
      tmpIngredients.entries[action.payload.uid][action.payload.field] =
        action.payload.value;

      // Wenn das die letzte Zutat (also kein Abschnitt) ist, automatisch eine neue einfügen
      if (
        action.payload.uid ==
        tmpIngredients.order.reduce((result, ingredientUid) => {
          // Über Reduce die letzte Zutat holen
          if (
            state.recipe.ingredients.entries[ingredientUid].posType ==
            PositionType.ingredient
          ) {
            // UID zurückggeben
            return ingredientUid;
          }
          return result;
        }, "")
      ) {
        let newObject = Recipe.createEmptyIngredient();
        tmpIngredients.entries[newObject.uid] = newObject;
        tmpIngredients.order.push(newObject.uid);
      }

      return {
        ...state,
        recipe: {
          ...state.recipe,
          ingredients: tmpIngredients,
        },
      };
    case ReducerActions.ON_INGREDIENT_DELETE_NAME:
      let ingredients = state.recipe.ingredients;
      //TODO: TEST ME
      Object.values(ingredients.entries).forEach((ingredient) => {
        ingredient = ingredient as Ingredient;
        if (ingredient.uid === action.payload.uid) {
          ingredient.product.name = "";
          ingredient.product.uid = "";
        }
      });

      return {
        ...state,
        recipe: {
          ...state.recipe,
          ingredients: ingredients,
        },
      };
    case ReducerActions.ON_INGREDIENT_ADD_NEW_PRODUCT:
      // Das neue Produkt in Produkte speichern (für Dropdown)
      let products = state.products;
      let product = products.find(
        (product) => product.uid === action.payload.uid
      );
      // Wenn es das schon gibt, nichts tun
      if (!product) {
        products.push(action.payload as Product);
      }
      return {
        ...state,
        products: products,
      };
    case ReducerActions.ON_UPDATE_LIST:
      // Zutaten, Zubereitungsschritte oder Material updaten
      return {
        ...state,
        recipe: {
          ...state.recipe,
          [action.payload.fieldName]: action.payload.value,
        },
      };
    case ReducerActions.ON_PREPARATIONSTEP_CHANGE:
      let preparationStepsToUpdate = {...state.recipe.preparationSteps};

      preparationStepsToUpdate.entries[action.payload.uid][
        action.payload.fieldName
      ] = action.payload.value;
      // Wenn das die letzte Zeile ist, automatisch eine neue einfügen
      // Wenn das die letzte Zutat (also kein Abschnitt) ist, automatisch eine neue einfügen
      if (
        action.payload.uid ==
        preparationStepsToUpdate.order.reduce((result, preparationStepUid) => {
          // Über Reduce die letzte Zutat holen
          if (
            state.recipe.preparationSteps.entries[preparationStepUid].posType ==
            PositionType.preparationStep
          ) {
            // UID zurückggeben
            return preparationStepUid;
          }
          return result;
        }, "")
      ) {
        let newObject = Recipe.createEmptyPreparationStep();

        preparationStepsToUpdate.entries[newObject.uid] = newObject;
        preparationStepsToUpdate.order.push(newObject.uid);
      }
      return {
        ...state,
        recipe: {
          ...state.recipe,
          preparationSteps: preparationStepsToUpdate,
        },
      };
    case ReducerActions.ON_MATERIAL_CHANGE:
      let tmpMaterials = {...state.recipe.materials};

      tmpMaterials.entries[action.payload.uid][action.payload.field] =
        action.payload.value;

      // Wenn das die letzte Zeile ist, automatisch eine neue einfügen
      if (
        action.payload.uid ===
        state.recipe.materials.order[state.recipe.materials.order.length - 1]
      ) {
        let newObject = Recipe.createEmptyMaterial();
        tmpMaterials.entries[newObject.uid] = newObject;
        tmpMaterials.order.push(newObject.uid);
      }

      return {
        ...state,
        recipe: {
          ...state.recipe,
          materials: tmpMaterials,
        },
      };
    case ReducerActions.ON_MATERIAL_DELETE_NAME:
      updatedMaterials = {...state.recipe.materials};

      //TODO: TEST ME
      Object.values(updatedMaterials.entries).forEach((material) => {
        if (material.uid === action.payload.uid) {
          material.material.name = "";
          material.material.uid = "";
        }
      });

      return {
        ...state,
        recipe: {
          ...state.recipe,
          materials: updatedMaterials,
        },
      };
    case ReducerActions.ON_MATERIAL_ADD_NEW_PRODUCT:
      // Das neue Material in Produkte speichern (für Dropdown)
      let materials = state.materials;
      let material = materials.find(
        (material) => material.uid === action.payload.uid
      );
      // Wenn es das schon gibt, nichts tun
      if (!material) {
        materials.push(action.payload as Material);
      }
      return {
        ...state,
        materials: materials,
      };
    case ReducerActions.UNITS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
        _loadingUnits: true,
      };
    case ReducerActions.UNITS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: deriveIsLoading(
          state._loadingProducts,
          false,
          state._loadingDepartments,
          state._loadingMaterials
        ),
        isError: false,
        units: action.payload as Unit[],
        _loadingUnits: false,
      };
    case ReducerActions.PRODUCTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
        _loadingProducts: true,
      };
    case ReducerActions.PRODUCTS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: deriveIsLoading(
          false,
          state._loadingUnits,
          state._loadingDepartments,
          state._loadingMaterials
        ),
        isError: false,
        products: action.payload as Product[],
        _loadingProducts: false,
      };
    case ReducerActions.DEPARTMENTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
        _loadingDepartments: true,
      };
    case ReducerActions.DEPARTMENTS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: deriveIsLoading(
          state._loadingProducts,

          state._loadingUnits,
          false,
          state._loadingMaterials
        ),
        isError: false,
        departments: action.payload as Department[],
        _loadingDepartments: false,
      };
    case ReducerActions.MATERIALS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
        _loadingMaterials: true,
      };
    case ReducerActions.MATERIALS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: deriveIsLoading(
          state._loadingProducts,
          state._loadingUnits,
          state._loadingDepartments,
          false
        ),
        isError: false,
        materials: action.payload as Material[],
        _loadingMaterials: false,
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
    case ReducerActions.DRAG_AND_DROP_UDPATE:
      return {
        ...state,
        recipe: {
          ...state.recipe,
          [action.payload.field]: {
            ...state.recipe[action.payload.field],
            order: action.payload.value,
          },
        },
      };
    case ReducerActions.GENERIC_ERROR:
      return {
        ...state,
        isError: true,
        isLoading: false,
        error: action.payload ? action.payload : {},
      };
    case ReducerActions.CLEAR_STATE:
      // Hiermiet wird alles gelöscht!
      return action.payload as State;
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};
const deriveIsLoading = (
  loadingProducts: boolean,
  loadingUnits: boolean,
  loadingDepartment: boolean,
  loadingMaterials: boolean
) => {
  if (
    loadingProducts === false &&
    loadingUnits === false &&
    loadingDepartment === false &&
    loadingMaterials === false
  ) {
    return false;
  } else {
    return true;
  }
};
interface ColumnSizeTypes {
  xs: GridSize;
  sm: GridSize;
}
interface GridSizeColums {
  pos: ColumnSizeTypes;
  quantity: ColumnSizeTypes;
  unit: ColumnSizeTypes;
  scalingFactor: ColumnSizeTypes;
  product: ColumnSizeTypes;
  detail: ColumnSizeTypes;
  buttons: ColumnSizeTypes;
}
interface ColumnSizes {
  ScaleFactorOff: GridSizeColums;
  ScaleFactorOn: GridSizeColums;
}
const GRIDSIZE_COLUMNS: ColumnSizes = {
  ScaleFactorOff: {
    pos: {xs: 1, sm: 1},
    quantity: {xs: 2, sm: 2},
    unit: {xs: 2, sm: 1},
    scalingFactor: {xs: 1, sm: 1},
    product: {xs: 4, sm: 4},
    detail: {xs: 3, sm: 3},
    buttons: {xs: 1, sm: 1},
  },
  ScaleFactorOn: {
    pos: {xs: 1, sm: 1},
    quantity: {xs: 5, sm: 2},
    unit: {xs: 4, sm: 1},
    scalingFactor: {xs: 2, sm: 1},
    product: {xs: 6, sm: 3},
    detail: {xs: 5, sm: 3},
    buttons: {xs: 1, sm: 1},
  },
};
/* ===================================================================
// ========================== Ändern-Sicht ===========================
// =================================================================== */
interface RecipeEditProps {
  dbRecipe: Recipe;
  mealPlan: Array<PlanedMealsRecipe>;
  groupConfiguration?: EventGroupConfiguration;
  firebase: Firebase;
  isLoading: boolean;
  isEmbedded: boolean; // in einer Drawer eingebetettet, oder so...
  switchEditMode: ({ignoreState}: SwitchEditMode) => void;
  onUpdateRecipe: ({recipe, snackbar}: OnUpdateRecipeProps) => void;
  onError?: (error: Error) => void;
  authUser: AuthUser;
}
interface PositionMenuSelectedItem {
  type: RecipeBlock; // In welchem Abschnitt wurde das Menü geöffnet
  uid: string; // UID des Eintrages
}
const RecipeEdit = ({
  dbRecipe,
  mealPlan,
  groupConfiguration,
  firebase,
  isLoading,
  isEmbedded,
  switchEditMode,
  onUpdateRecipe,
  onError,
  authUser,
}: RecipeEditProps) => {
  const classes = useStyles();
  const {replace} = useHistory();
  const navigationValuesContext = React.useContext(NavigationValuesContext);

  const [state, dispatch] = React.useReducer(recipesReducer, inititialState);
  const [tagAddDialogOpen, setTagAddDialogOpen] = React.useState(false);
  const [triggeredIngredientUid, setTriggeredIngredientUid] =
    React.useState("");
  const [positionMenuSelectedItem, setPositionMenuSelectedItem] =
    React.useState<PositionMenuSelectedItem>({
      type: RecipeBlock.none,
      uid: "",
    });
  const [positionMenuAnchorElement, setPositionMenuAnchorElement] =
    React.useState<HTMLElement | null>(null);
  const [productAddPopupValues, setProductAddPopupValues] = React.useState({
    ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
    ...{popUpOpen: false},
  });
  const [triggeredMaterialUid, setTriggeredMaterialUid] = React.useState("");
  const [materialAddPopupValues, setMaterialAddPopupValues] = React.useState({
    ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
    ...{popUpOpen: false},
  });
  const {customDialog} = useCustomDialog();
  /* ------------------------------------------
  // Navigation-Handler
  // ------------------------------------------ */
  React.useEffect(() => {
    navigationValuesContext?.setNavigationValues({
      action: Action.EDIT,
      object: NavigationObject.usedRecipes,
    });
  }, []);

  /* ------------------------------------------
  // Rezept, dass übergeben wurde in eigenen State speichern
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatch({
      type: ReducerActions.SET_RECIPE,
      payload: {
        recipe: dbRecipe,
      },
    });
  }, []);
  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (state.units.length === 0) {
      dispatch({
        type: ReducerActions.UNITS_FETCH_INIT,
        payload: {},
      });

      Unit.getAllUnits({firebase: firebase})
        .then((result) => {
          // leeres Feld gehört auch dazu
          result.push({key: "", name: ""});

          dispatch({
            type: ReducerActions.UNITS_FETCH_SUCCESS,
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
    }
    if (state.products.length === 0) {
      dispatch({
        type: ReducerActions.PRODUCTS_FETCH_INIT,
        payload: {},
      });
      Product.getAllProducts({
        firebase: firebase,
        onlyUsable: true,
      })
        .then((result) => {
          dispatch({
            type: ReducerActions.PRODUCTS_FETCH_SUCCESS,
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
    }
    if (state.departments.length === 0) {
      dispatch({
        type: ReducerActions.DEPARTMENTS_FETCH_INIT,
        payload: {},
      });
      Department.getAllDepartments({firebase: firebase})
        .then((result) => {
          dispatch({
            type: ReducerActions.DEPARTMENTS_FETCH_SUCCESS,
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
    }
    if (state.materials.length === 0) {
      dispatch({
        type: ReducerActions.MATERIALS_FETCH_INIT,
        payload: {},
      });
      Material.getAllMaterials({firebase: firebase})
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
    }
  }, []);
  /* ------------------------------------------
  // Feldwert ändern - onChange
  // ------------------------------------------ */
  const onChangeField = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<{[key: string]: any}>
  ) => {
    let value: any;

    if (event.target.name === "outdoorKitchenSuitable") {
      value = event.target.checked;
    } else if (event.target.name === "menuTypes") {
      let selectedMenuTypes: MenuType[] = event.target.value.map(
        (value: string) => parseInt(value)
      );

      let newValue: MenuType;
      // Der Wert wird als String zurückgegeben, wir speichern ihn aber als Number
      // Wenn das Array nun zwei mal den gleichen Wert hat (als String und als Number)
      // müssen beide Werte entfernt werden --> Checkbox deselektiert.
      // der Neuste Wert ist immer der letzte im Array. Nach diesem kann gesucht werden
      if (selectedMenuTypes.length > 0) {
        newValue = selectedMenuTypes.slice(-1)[0];
      }

      if (selectedMenuTypes.filter((value) => value == newValue).length > 1) {
        // Mehrere Einträge... alles löschen was dem neuen Wert entspricht
        selectedMenuTypes = selectedMenuTypes.filter(
          (value) => value != newValue
        );
      }

      value = selectedMenuTypes;
      value.sort();
    } else {
      value = event.target.value;
    }
    dispatch({
      type: ReducerActions.ON_FIELD_CHANGE,
      payload: {
        field: event.target.name,
        value: value,
      },
    });
  };
  const onChangeIngredient = (
    event?: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Unit | Product | null,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => {
    let ingredientPos: string[];
    let product: Product;

    if (!event?.target.id && action !== "clear") {
      return;
    }

    if (event?.target.id) {
      // alt id={"quantity_" + ingredient.uid + "_" + ingredient.pos}
      // neu id={"quantity_" + ingredient.uid}

      ingredientPos = event.target.id.split("_");
    } else {
      if (!objectId) {
        return;
      }
      ingredientPos = objectId.split("_");
    }

    let fieldName = ingredientPos[0];
    let ingredientUid = ingredientPos[1];
    if (ingredientUid.includes("-")) {
      ingredientUid = ingredientUid.split("-")[0];
    }

    let value: string | IngredientProduct;
    if (
      (action === "select-option" || action === "blur") &&
      objectId?.startsWith("product_") &&
      typeof newValue == "object"
    ) {
      // Prüfen ob neues Produkt angelegt wird
      product = newValue as Product;
      if (product.name.endsWith(TEXT.ADD)) {
        // Begriff Hinzufügen und Anführzungszeichen entfernen
        let productName = product.name.match('".*"')![0].slice(1, -1);

        // Neues Produkt. PopUp Anzeigen und nicht weiter
        setProductAddPopupValues({
          ...productAddPopupValues,
          name: productName,
          popUpOpen: true,
        });
        // ID der Position speichern, die das Ereignis
        // auslöst (im Falle eines Abbruchs)
        setTriggeredIngredientUid(ingredientUid);
        return;
      }
    }
    if (fieldName === "unit") {
      // Die Autocomplete Komponente liefert den Event anders zurück
      // hier wird die gewählte Option als -Option# zurückgegeben
      // diese Info muss umgeschlüsselt werden
      if (action !== "clear") {
        value = (newValue as Unit).key;
      } else {
        value = "";
      }
    } else if (fieldName === "product") {
      product = newValue as Product;
      // Nur Produkte, die wir kennen (und somit eine UID haben)
      if (action !== "clear" && (!product || !product.uid)) {
        return;
      }
      if (!newValue) {
        value = {uid: "", name: ""};
      } else {
        value = {uid: product.uid, name: product.name};
      }
    } else {
      value = event?.target.value as string;
    }
    dispatch({
      type: ReducerActions.ON_INGREDIENT_CHANGE,
      payload: {field: fieldName, value: value, uid: ingredientUid},
    });
  };
  const onChangePreparationStep = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let prepparationStepPos = event.target.id.split("_");

    dispatch({
      type: ReducerActions.ON_PREPARATIONSTEP_CHANGE,
      payload: {
        fieldName: prepparationStepPos[0],
        uid: prepparationStepPos[1],
        value: event.target.value,
      },
    });
  };
  const onChangeMaterial = (
    event?: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Material,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => {
    let materialPos: string[];
    let material: Material;

    if (!event?.target.id && action !== "clear") {
      return;
    }

    if (event?.target.id) {
      materialPos = event.target.id.split("_");
    } else {
      if (!objectId) {
        return;
      }
      materialPos = objectId.split("_");
    }

    let fieldName = materialPos[0];
    let materialUid = materialPos[1];
    if (materialUid.includes("-")) {
      // Falls über Dropdown ausgewählt, kommt noch der präfix -Option-1 zurück
      materialUid = materialUid.split("-")[0];
    }
    let value: string | RecipeProduct;

    if (
      (action === "select-option" || action === "blur") &&
      objectId?.startsWith("material_")
    ) {
      // Prüfen ob neues Material angelegt wird
      material = newValue as Material;
      if (typeof material === "object" && material?.name.endsWith(TEXT.ADD)) {
        // Begriff Hinzufügen und Anführzungszeichen entfernen
        let materialName = material.name.match('".*"')![0].slice(1, -1);

        // Neues Produkt. PopUp Anzeigen und nicht weiter
        setMaterialAddPopupValues({
          ...materialAddPopupValues,
          name: materialName,
          popUpOpen: true,
        });
        // ID der Position speichern, die das Ereignis
        // auslöst (im Falle eines Abbruchs)
        setTriggeredMaterialUid(materialUid);
        return;
      }
    }
    if (fieldName === "material") {
      material = newValue as Material;
      // Nur Produkte, die wir kennen (und somit eine UID haben)
      if (action !== "clear" && (!material || !material.uid)) {
        return;
      }
      if (!newValue) {
        value = {
          uid: "",
          name: "",
        };
      } else {
        value = {uid: material.uid, name: material.name};
      }
    } else {
      value = event?.target.value as string;
    }
    dispatch({
      type: ReducerActions.ON_MATERIAL_CHANGE,
      payload: {field: fieldName, value: value, uid: materialUid},
    });
  };
  /* ------------------------------------------
  // Snackback 
  // ------------------------------------------ */
  const handleSnackbarClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch({
      type: ReducerActions.SNACKBAR_CLOSE,
      payload: {},
    });
  };
  /* ------------------------------------------
  // Save // Cancel
  // ------------------------------------------ */
  const onSave = async () => {
    let recipe = {} as Recipe;

    try {
      Recipe.checkRecipeData(state.recipe);
    } catch (error) {
      console.error(error);
      dispatch({
        type: ReducerActions.GENERIC_ERROR,
        payload: error,
      });
      return;
    }
    await Recipe.save({
      firebase: firebase,
      recipe: state.recipe,
      products: state.products,
      authUser: authUser,
    })
      .then((result) => {
        if (
          state.recipe.uid == "" &&
          result.type !== RecipeType.variant &&
          !isEmbedded
        ) {
          switchEditMode({});

          // Umleiten auf neue URL
          replace({
            pathname: `${ROUTES.RECIPE}/${result.created.fromUid}/${result.uid}`,
            state: {
              action: Action.VIEW,
              recipe: result,
            },
          });
          dispatch({
            type: ReducerActions.SNACKBAR_SHOW,
            payload: {
              severity: "success",
              message: TEXT.RECIPE_SAVE_SUCCESS,
              open: true,
            },
          });
        } else {
          // Angepasstes Rezept Hochgeben und in den Read-Modus wechseln
          onUpdateRecipe({
            recipe: result,
            snackbar: {
              message: TEXT.RECIPE_SAVE_SUCCESS,
              severity: "success",
              open: true,
            },
          });

          // Der State ist erst nach dem Roundtrip aktuell!
          switchEditMode({ignoreState: true});

          // Meldung auf gleicher Seite anzeigen
          dispatch({
            type: ReducerActions.SNACKBAR_SHOW,
            payload: {
              severity: "success",
              message: TEXT.RECIPE_SAVE_SUCCESS,
              open: true,
            },
          });
        }
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  const onCancel = async () => {
    const isConfirmed = await customDialog({
      dialogType: DialogType.Confirm,
      text: TEXT.CONFIRM_CHANGES_ARE_LOST,
      title: TEXT.UNSAVED_CHANGES,
      buttonTextConfirm: TEXT.DISCARD_CHANGES,
    });
    if (!isConfirmed) {
      return;
    }

    // Clear State!
    dispatch({
      type: ReducerActions.CLEAR_STATE,
      payload: inititialState,
    });
    switchEditMode({});
  };
  /* ------------------------------------------
  // Tags
  // ------------------------------------------ */
  const onTagAdd = () => {
    setTagAddDialogOpen(true);
  };
  const handleTagAddDialogClose = () => {
    setTagAddDialogOpen(false);
  };
  const handleTagAddDialogAdd = (tags: string[]) => {
    let listOfTags = state.recipe.tags.concat(tags);

    dispatch({
      type: ReducerActions.ON_FIELD_CHANGE,
      payload: {
        field: "tags",
        value: listOfTags,
      },
    });

    setTagAddDialogOpen(false);
  };
  const onTagDelete = (tagToDelete: string) => {
    let listOfTags = Recipe.deleteTag({
      tags: state.recipe.tags,
      tagToDelete: tagToDelete,
    });
    dispatch({
      type: ReducerActions.ON_FIELD_CHANGE,
      payload: {
        field: "tags",
        value: listOfTags,
      },
    });
  };
  /* ------------------------------------------
  // ContextMenü für Postionen
  // ------------------------------------------ */
  const onPositionMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    // Zwischenspeichern bei welchem Element das Menü auf-
    // gerufen wurde
    let pressedButton = event.currentTarget.id.split("_");
    // Button-ID-Aufbau
    // 0 = Name des Buttons (moreClick)
    // 1 = Abschnitt in dem er geklickt wurde (ingredients)
    // 2 = UID der Position
    setPositionMenuSelectedItem({
      type: pressedButton[1] as RecipeBlock,
      uid: pressedButton[2],
    });
    setPositionMenuAnchorElement(event.currentTarget);
  };
  const onPostionMoreContextMenuClick = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    let indexToInsert = 0;
    let pressedButton = event.currentTarget.id.split("_");
    // // 0 = in Welchem Block (Ingredient/PreparationStep/Materials )
    // // 1 = Aktion (Add, Delete)
    // // 2 = UID des Elements

    let entriesToUpdate = {...state.recipe[pressedButton[0]]} as
      | RecipeObjectStructure<Ingredient | Section>
      | RecipeObjectStructure<PreparationStep | Section>
      | RecipeObjectStructure<RecipeMaterialPosition | Section>;
    let newObject:
      | Ingredient
      | PreparationStep
      | RecipeMaterialPosition
      | Section;
    if (positionMenuSelectedItem.type === RecipeBlock.none) {
      return;
    }
    switch (pressedButton[1]) {
      case Action.ADD:
        switch (pressedButton[0]) {
          case RecipeBlock.ingredients:
            newObject = Recipe.createEmptyIngredient();
            break;
          case RecipeBlock.prepartionSteps:
            newObject = Recipe.createEmptyPreparationStep();
            break;
          case RecipeBlock.materials:
            newObject = Recipe.createEmptyMaterial();
            break;
          default:
            throw Error("Block unbekannt");
        }
        entriesToUpdate.entries[newObject.uid] = newObject;

        indexToInsert = entriesToUpdate.order.findIndex(
          (objectUid) => objectUid == pressedButton[2]
        );
        entriesToUpdate.order.splice(indexToInsert + 1, 0, newObject.uid);

        break;
      case Action.NEWSECTION:
        newObject = Recipe.createEmptySection();
        entriesToUpdate.entries[newObject.uid] = newObject;

        indexToInsert = entriesToUpdate.order.findIndex(
          (objectUid) => objectUid == pressedButton[2]
        );
        entriesToUpdate.order.splice(indexToInsert + 1, 0, newObject.uid);
        break;
      case Action.DELETE:
        delete entriesToUpdate.entries[pressedButton[2]];
        entriesToUpdate.order = entriesToUpdate.order.filter(
          (uid) => uid !== pressedButton[2]
        );
        break;
    }

    dispatch({
      type: ReducerActions.ON_UPDATE_LIST,
      payload: {
        fieldName: pressedButton[0],
        value: entriesToUpdate,
      },
    });
    setPositionMenuAnchorElement(null);
  };
  const onPositionMoreContextMenuClose = () => {
    setPositionMenuAnchorElement(null);
  };
  /* ------------------------------------------
  // PopUp Produkt Hinzufügen
  // ------------------------------------------ */
  const onCloseProductToAdd = () => {
    // Wert löschen.... der das ausgelöst hat.
    dispatch({
      type: ReducerActions.ON_INGREDIENT_DELETE_NAME,
      payload: {pos: triggeredIngredientUid},
    });

    setTriggeredIngredientUid("");
    setProductAddPopupValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  const onCreateProductToAdd = (product: Product) => {
    dispatch({
      type: ReducerActions.ON_INGREDIENT_CHANGE,
      payload: {
        field: "product",
        value: {uid: product.uid, name: product.name},
        uid: triggeredIngredientUid,
      },
    });

    dispatch({
      type: ReducerActions.ON_INGREDIENT_ADD_NEW_PRODUCT,
      payload: product,
    });

    dispatch({
      type: ReducerActions.SNACKBAR_SHOW,
      payload: {
        message: TEXT.PRODUCT_CREATED(product.name),
        severity: "success",
      },
    });
    setTriggeredIngredientUid("");
    setProductAddPopupValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  /* ------------------------------------------
  // PopUp Material Hinzufügen - 
  // ------------------------------------------ */
  const onCreateMaterialToAdd = (material: Material) => {
    dispatch({
      type: ReducerActions.ON_MATERIAL_CHANGE,
      payload: {
        field: "material",
        value: {uid: material.uid, name: material.name},
        uid: triggeredMaterialUid,
      },
    });

    dispatch({
      type: ReducerActions.ON_MATERIAL_ADD_NEW_PRODUCT,
      payload: material,
    });

    dispatch({
      type: ReducerActions.SNACKBAR_SHOW,
      payload: {
        message: TEXT.MATERIAL_CREATED(material.name),
        severity: "success",
      },
    });
    setTriggeredMaterialUid("");
    setMaterialAddPopupValues({
      ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  const onCloseMaterialToAdd = () => {
    // Wert löschen.... der das ausgelöst hat.
    dispatch({
      type: ReducerActions.ON_MATERIAL_DELETE_NAME,
      payload: {uid: triggeredMaterialUid},
    });

    setTriggeredMaterialUid("");
    setMaterialAddPopupValues({
      ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  /* ------------------------------------------
  // Drag & Drop Handler
  // ------------------------------------------ */
  const onDragEnd = (result: DropResult) => {
    let {destination, source, draggableId, type} = result;

    if (draggableId.includes("_")) {
      draggableId = draggableId.split("_")[1];
    }
    // GateKeeper
    if (!destination) {
      return;
    }
    if (
      destination?.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (destination.droppableId.includes("_")) {
      destination.droppableId = destination.droppableId.split("_")[0];
    }
    if (source.droppableId.includes("_")) {
      source.droppableId = source.droppableId.split("_")[0];
    }
    switch (type) {
      case DragDropTypes.INGREDIENT:
        let newIngredientsOrder = [...state.recipe.ingredients.order];

        if (source.droppableId === destination.droppableId) {
          // Reihenfolge in der gleichen Box angepasst
          newIngredientsOrder.splice(source.index, 1);
          newIngredientsOrder.splice(destination?.index, 0, draggableId);

          dispatch({
            type: ReducerActions.DRAG_AND_DROP_UDPATE,
            payload: {field: "ingredients", value: newIngredientsOrder},
          });
        } else {
          throw Error("Drag&Drop Error");
        }
        break;
      case DragDropTypes.PREPARATIONSTEP:
        let newPreparationStepsOrder = [...state.recipe.preparationSteps.order];
        if (source.droppableId === destination.droppableId) {
          // Reihenfolge in der gleichen Box angepasst
          newPreparationStepsOrder.splice(source.index, 1);
          newPreparationStepsOrder.splice(destination?.index, 0, draggableId);

          dispatch({
            type: ReducerActions.DRAG_AND_DROP_UDPATE,
            payload: {
              field: "preparationSteps",
              value: newPreparationStepsOrder,
            },
          });
        } else {
          throw Error("Drag&Drop Error");
        }
        break;
      case DragDropTypes.MATERIAL:
        let newMaterialsOrder = [...state.recipe.materials.order];
        if (source.droppableId === destination.droppableId) {
          // Reihenfolge in der gleichen Box angepasst
          newMaterialsOrder.splice(source.index, 1);
          newMaterialsOrder.splice(destination?.index, 0, draggableId);

          dispatch({
            type: ReducerActions.DRAG_AND_DROP_UDPATE,
            payload: {field: "materials", value: newMaterialsOrder},
          });
        } else {
          throw Error("Drag&Drop Error");
        }
        break;
    }
  };
  /* ------------------------------------------
  // XXX
  // ------------------------------------------ */
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <React.Fragment>
        {/* wenn Variante auch Komponenten aus dem View holen!*/}
        {state.recipe.type == RecipeType.variant ? (
          <RecipeHeaderVariant recipe={state.recipe} onChange={onChangeField} />
        ) : (
          <RecipeHeader recipe={state.recipe} onChange={onChangeField} />
        )}

        <RecipeButtonRow onSave={onSave} onCancel={onCancel} />
        <RecipeDivider />
        <Container className={classes.container} component="main" maxWidth="md">
          <Backdrop className={classes.backdrop} open={isLoading}>
            <CircularProgress color="inherit" />
          </Backdrop>

          <Grid container spacing={4} justifyContent="center">
            {state.isError && (
              <Grid item key={"error"} xs={12}>
                <AlertMessage
                  error={state.error}
                  messageTitle={TEXT.ALERT_TITLE_WAIT_A_MINUTE}
                />
              </Grid>
            )}
            {mealPlan.length > 0 && groupConfiguration && (
              <Grid item xs={12} sm={6}>
                <MealPlanPanelView
                  mealPlan={mealPlan}
                  groupConfiguration={groupConfiguration}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              {state.recipe.type == RecipeType.variant ? (
                // Die Variante darf die generellen Infos nicht anpassen
                <RecipeInfoPanelView
                  recipe={state.recipe}
                  onTagDelete={onTagDelete}
                  onTagAdd={onTagAdd}
                  authUser={authUser}
                />
              ) : (
                <RecipeInfoPanel
                  recipe={state.recipe}
                  onTagDelete={onTagDelete}
                  onTagAdd={onTagAdd}
                  onChange={onChangeField}
                  authUser={authUser}
                />
              )}
            </Grid>
            <RecipeDivider style={{marginTop: "1em", marginBottom: "1em"}} />
            <Grid item xs={12}>
              <RecipeIngredients
                recipe={state.recipe}
                units={state.units}
                products={state.products}
                onChangeField={onChangeField}
                onChangeIngredient={onChangeIngredient}
                // onChangeSection={onChangeSection}
                onPositionMoreClick={onPositionMoreClick}
              />
            </Grid>
            <RecipeDivider style={{marginTop: "1em", marginBottom: "1em"}} />
            <Grid item xs={12}>
              <RecipePreparationSteps
                recipe={state.recipe}
                onChange={onChangePreparationStep}
                // onChangeSection={onChangeSection}
                onPositionMoreClick={onPositionMoreClick}
              />
            </Grid>
            <RecipeDivider style={{marginTop: "1em", marginBottom: "1em"}} />
            <Grid item xs={12}>
              <RecipeMaterial
                recipe={state.recipe}
                materials={state.materials}
                onChange={onChangeMaterial}
                // onChangeSection={onChangeSection}
                onPositionMoreClick={onPositionMoreClick}
              />
            </Grid>
            {state.recipe.type == RecipeType.variant && (
              <Grid item xs={12}>
                <RecipeVariantNote
                  recipe={state.recipe}
                  onChange={onChangeField}
                />
              </Grid>
            )}
          </Grid>
          <RecipeButtonRow onSave={onSave} onCancel={onCancel} />
        </Container>
        <PositionMoreClickContextMenu
          anchorEl={positionMenuAnchorElement}
          handleMenuClick={onPostionMoreContextMenuClick}
          handleMenuClose={onPositionMoreContextMenuClose}
          recipeBlock={positionMenuSelectedItem.type}
          uid={positionMenuSelectedItem.uid}
          // positionType={positionMenuSelectedItem.positionType}
          // noListEntries={positionMenuSelectedItem.noOfPostitions}
        />
        <DialogProduct
          productName={productAddPopupValues.name}
          dialogType={PRODUCT_DIALOG_TYPE.CREATE}
          dialogOpen={productAddPopupValues.popUpOpen}
          handleOk={onCreateProductToAdd}
          handleClose={onCloseProductToAdd}
          products={state.products}
          units={state.units}
          departments={state.departments}
          authUser={authUser}
        />
        <DialogMaterial
          materialName={materialAddPopupValues.name}
          materials={state.materials}
          dialogType={MATERIAL_DIALOG_TYPE.CREATE}
          dialogOpen={materialAddPopupValues.popUpOpen}
          handleOk={onCreateMaterialToAdd}
          handleClose={onCloseMaterialToAdd}
          authUser={authUser}
        />
        <DialogTagAdd
          dialogOpen={tagAddDialogOpen}
          handleClose={handleTagAddDialogClose}
          handleAddTags={handleTagAddDialogAdd}
        />
        <CustomSnackbar
          message={state.snackbar.message}
          severity={state.snackbar.severity}
          snackbarOpen={state.snackbar.open}
          handleClose={handleSnackbarClose}
        />
      </React.Fragment>
    </DragDropContext>
  );
};
/* ===================================================================
// ============================= Header ==============================
// =================================================================== */
interface RecipeHeaderProps {
  recipe: Recipe;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const RecipeHeader = ({recipe, onChange}: RecipeHeaderProps) => {
  const classes = useStyles();
  document.title = recipe.name ? recipe.name : TEXT.NEW_RECIPE;

  return (
    <React.Fragment>
      <Container
        maxWidth="md"
        className={classes.recipeHeader}
        style={{
          position: "relative",
          backgroundImage: `url(${
            recipe.pictureSrc
              ? recipe.pictureSrc
              : IMAGE_REPOSITORY.getEnviromentRelatedPicture()
                  .CARD_PLACEHOLDER_MEDIA
          })`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className={classes.recipeHeaderTitle}>
          <TextField
            id="name"
            key="name"
            name="name"
            required
            fullWidth
            label={TEXT.FIELD_NAME}
            value={recipe.name}
            onChange={onChange}
            autoFocus
            style={{marginBottom: "2ex"}}
          />
          <Tooltip title={TEXT.TOOLTIP_RECIPE_IMAGE_SOURCE} arrow>
            <TextField
              id="pictureSrc"
              key="pictureSrc"
              name="pictureSrc"
              fullWidth
              label={TEXT.FIELD_IMAGE_SOURCE}
              value={recipe.pictureSrc}
              onChange={onChange}
              helperText={TEXT.HELPERTEXT_RECIPE_IMAGE_SOURCE}
            />
          </Tooltip>
        </div>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================= Header ==============================
// =================================================================== */
interface RecipeHeaderVariantProps {
  recipe: Recipe;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const RecipeHeaderVariant = ({recipe, onChange}: RecipeHeaderVariantProps) => {
  const classes = useStyles();
  document.title = recipe.name ? recipe.name : TEXT.NEW_RECIPE;

  return (
    <React.Fragment>
      <Container
        maxWidth="md"
        className={classes.recipeHeader}
        style={{
          position: "relative",
          backgroundImage: `url(${
            recipe.pictureSrc
              ? recipe.pictureSrc
              : IMAGE_REPOSITORY.getEnviromentRelatedPicture()
                  .CARD_PLACEHOLDER_MEDIA
          })`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className={classes.recipeHeaderTitle}>
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="textPrimary"
            style={{display: "block"}}
            gutterBottom
          >
            {recipe.name}
          </Typography>
          <TextField
            id="variantProperties.variantName"
            key="variantProperties.variantName"
            name="variantProperties.variantName"
            required
            fullWidth
            label={TEXT.FIELD_VARIANT_NAME}
            value={recipe.variantProperties?.variantName}
            placeholder={TEXT.DESCRIBE_YOUR_VARIANT}
            onChange={onChange}
            autoFocus
            style={{marginBottom: "2ex"}}
          />
        </div>
        {recipe.pictureSrc && (
          <div className={classes.recipeHeaderPictureSource}>
            <Tooltip title={TEXT.IMAGE_MAY_BE_SUBJECT_OF_COPYRIGHT} arrow>
              <Typography variant="body2">
                {TEXT.IMAGE_SOURCE}
                <Link href={recipe.pictureSrc} target="_blank">
                  {Utils.getDomain(recipe.pictureSrc)}
                </Link>
              </Typography>
            </Tooltip>
          </div>
        )}
      </Container>
    </React.Fragment>
  );
};

/* ===================================================================
// ============================ Buttons ==============================
// =================================================================== */
interface RecipeButtonRowProps {
  onSave: () => void;
  onCancel: () => void;
}
const RecipeButtonRow = ({onSave, onCancel}: RecipeButtonRowProps) => {
  return (
    <React.Fragment>
      <ButtonRow
        key="action_buttons"
        buttons={[
          {
            id: "save",
            hero: true,
            visible: true,
            label: TEXT.BUTTON_SAVE,
            variant: "contained",
            color: "primary",
            onClick: onSave,
          },
          {
            id: "cancel",
            hero: true,
            visible: true,
            label: TEXT.BUTTON_CANCEL,
            variant: "outlined",
            color: "primary",
            onClick: onCancel,
          },
        ]}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Info Panel ============================
// =================================================================== */
interface RecipeInfoPanelProps {
  recipe: Recipe;
  onTagDelete: (tagToDelete: string) => void;
  onTagAdd: () => void;
  onChange: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<{value: unknown}>
  ) => void;

  authUser: AuthUser;
}
const RecipeInfoPanel = ({
  recipe,
  onTagDelete,
  onTagAdd,
  onChange,
  authUser,
}: RecipeInfoPanelProps) => {
  const classes = useStyles();

  const [tipsAndTagsSectionOpen, setTipsAndTagsSectionOpen] =
    React.useState(false);

  const handleOnTipsAndTagsClick = () => {
    setTipsAndTagsSectionOpen(!tipsAndTagsSectionOpen);
  };
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <List dense>
          {/* Quelle */}
          <FormListItem
            key={"source"}
            id={"source"}
            value={recipe.source}
            label={TEXT.SOURCE}
            editMode={true}
            helperText={TEXT.HELPTER_TEXT_RECIPE_SOURCE}
            onChange={onChange}
          />
          {/* Zubereitungszeit */}
          <FormListItem
            key={"times.preparation"}
            id={"times.preparation"}
            value={recipe.times.preparation}
            label={TEXT.FIELD_PREPARATION_TIME}
            editMode={true}
            onChange={onChange}
            endAdornment={
              <InputAdornment position="end">{TEXT.UNIT_MIN}</InputAdornment>
            }
          />
          {/* Ruhezeit */}
          <FormListItem
            key={"times.rest"}
            id={"times.rest"}
            value={recipe.times.rest}
            label={TEXT.FIELD_REST_TIME}
            editMode={true}
            onChange={onChange}
            endAdornment={
              <InputAdornment position="end">{TEXT.UNIT_MIN}</InputAdornment>
            }
          />
          {/* Kochzeit */}
          <FormListItem
            key={"times.cooking"}
            id={"times.cooking"}
            value={recipe.times.cooking}
            label={TEXT.FIELD_COOK_TIME}
            editMode={true}
            onChange={onChange}
            endAdornment={
              <InputAdornment position="end">{TEXT.UNIT_MIN}</InputAdornment>
            }
          />
          {/* Menüarten */}
          <ListItem>
            <FormControl className={classes.formControl} fullWidth>
              <InputLabel id="menuTypesLabel">{TEXT.MENU_TYPE}</InputLabel>
              <Select
                labelId="menuTypesLabel"
                id="menuTypes"
                key="menuTypes"
                name="menuTypes"
                multiple
                value={recipe.menuTypes}
                onChange={onChange}
                input={<Input fullWidth />}
                renderValue={(selected) => {
                  let selectedValues = selected as unknown as string[];
                  let textArray = selectedValues.map(
                    (value) => TEXT.MENU_TYPES[value]
                  ) as string[];
                  return (textArray as string[]).join(", ");
                }}
                MenuProps={MenuProps}
                fullWidth
              >
                {Object.keys(MenuType).map(
                  (menuType) =>
                    parseInt(menuType) > 0 && (
                      <MenuItem key={menuType} value={menuType}>
                        <Checkbox
                          checked={
                            recipe.menuTypes.indexOf(parseInt(menuType)) > -1
                          }
                          color="primary"
                        />
                        <ListItemText primary={TEXT.MENU_TYPES[menuType]} />
                      </MenuItem>
                    )
                )}
              </Select>
            </FormControl>
          </ListItem>
          {/* Geeignet für Outdoorküche */}
          <ListItem>
            <ListItemText>{TEXT.OUTDOOR_KITCHEN_SUITABLE}</ListItemText>
            <ListItemSecondaryAction>
              <Switch
                checked={recipe.outdoorKitchenSuitable}
                onChange={onChange}
                name={"outdoorKitchenSuitable"}
                key={"outdoorKitchenSuitable"}
                id={"outdoorKitchenSuitable"}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
          {/*Hinweis */}
          <FormListItem
            key={"note"}
            id={"note"}
            value={recipe.note}
            label={TEXT.FIELD_HINT}
            editMode={true}
            onChange={onChange}
            multiLine={true}
          />
          {/* Tags */}
          <FormListItem
            key={"tags"}
            id={"tags"}
            value={
              <React.Fragment>
                {recipe.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => onTagDelete(tag)}
                    className={classes.chip}
                    size="small"
                  />
                ))}
              </React.Fragment>
            }
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="Tag hinzufügen"
                onClick={onTagAdd}
              >
                <AddIcon />
              </IconButton>
            }
            label={TEXT.FIELD_TAGS}
          />
          {/* <Switch
        checked={state.checkedA}
        onChange={handleChange}
        name="checkedA"
        inputProps={{ 'aria-label': 'secondary checkbox' }}
      /> */}
        </List>
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ============================= Zutaten  ============================
// =================================================================== */
interface RecipeIngredientsProps {
  recipe: Recipe;
  units: Unit[];
  products: Product[];
  onChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeIngredient: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Unit | Product | null,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => void;
  // onChangeSection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPositionMoreClick: (event: React.MouseEvent<HTMLElement>) => void;
}
const RecipeIngredients = ({
  recipe,
  units,
  products,
  onChangeField,
  onChangeIngredient,
  // onChangeSection,
  onPositionMoreClick,
}: RecipeIngredientsProps) => {
  const classes = useStyles();

  const [gridSize, setGridSize] = React.useState(
    GRIDSIZE_COLUMNS.ScaleFactorOff
  );
  const [showScaleFactors, setShowScaleFactors] = React.useState(false);

  const onToggleScaleFactors = () => {
    showScaleFactors
      ? setGridSize(GRIDSIZE_COLUMNS.ScaleFactorOff)
      : setGridSize(GRIDSIZE_COLUMNS.ScaleFactorOn);
    setShowScaleFactors(!showScaleFactors);
  };
  return (
    <React.Fragment>
      <Typography
        component="h2"
        variant="h4"
        align="center"
        style={{display: "block"}}
        gutterBottom
      >
        {TEXT.INGREDIENTS}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item className={classes.centerCenter} xs={6}>
          <TextField
            id={"portions"}
            key={"portions"}
            name={"portions"}
            label={TEXT.FIELD_PORTIONS}
            required
            value={recipe.portions}
            onChange={onChangeField}
            disabled={recipe.type == RecipeType.variant}
          />
        </Grid>
        <Grid item className={classes.centerCenter} xs={6}>
          <Typography variant="body2">
            {TEXT.FIELD_SHOW_SCALE_FACTORS}
          </Typography>
          <Switch
            checked={showScaleFactors}
            onChange={onToggleScaleFactors}
            name="checkedShowScaleFactors"
            color="primary"
            size="small"
          />
        </Grid>
        {/* Zutaten auflsiten */}
        <Droppable
          droppableId={"ingredients"}
          type={DragDropTypes.INGREDIENT}
          key={"droppable_ingredients"}
        >
          {(provided, snapshot) => (
            <Grid item className={classes.centerCenter} xs={12}>
              <List
                key={"listIngredients"}
                innerRef={provided.innerRef}
                {...provided.droppableProps}
                className={
                  snapshot.isDraggingOver
                    ? classes.ListOnDrop
                    : classes.ListNoDrop
                }
                style={{flexGrow: 1}}
              >
                {recipe.ingredients.order.map((ingredientUid, counter) => {
                  return (
                    <Draggable
                      draggableId={ingredientUid}
                      index={counter}
                      key={"draggableIngredient" + ingredientUid}
                      isDragDisabled={recipe.ingredients.order.length <= 1}
                    >
                      {(provided, snapshot) => (
                        <ListItem
                          key={"listitem_ingredient" + ingredientUid}
                          id={"listitem_ingredient" + ingredientUid}
                          innerRef={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={
                            snapshot.isDragging
                              ? classes.listItemOnDrag
                              : classes.listItemNoDrag
                          }
                        >
                          {recipe.ingredients.entries[ingredientUid].posType ==
                          PositionType.section ? (
                            <SectionPosition
                              key={ingredientUid}
                              counter={counter}
                              section={
                                recipe.ingredients.entries[
                                  ingredientUid
                                ] as Section
                              }
                              recipeBock={RecipeBlock.ingredients}
                              onChangeSection={onChangeIngredient}
                              onPositionMoreClick={onPositionMoreClick}
                            />
                          ) : (
                            <IngredientPosition
                              position={counter + 1}
                              key={ingredientUid}
                              ingredient={
                                recipe.ingredients.entries[
                                  ingredientUid
                                ] as Ingredient
                              }
                              units={units}
                              products={products}
                              gridSize={gridSize}
                              showScaleFactors={showScaleFactors}
                              onChangeIngredient={onChangeIngredient}
                              onPositionMoreClick={onPositionMoreClick}
                            />
                          )}
                        </ListItem>
                      )}
                    </Draggable>
                  );
                })}
              </List>
            </Grid>
          )}
        </Droppable>
      </Grid>
    </React.Fragment>
  );
};
/* ===================================================================
// ========================= Zutaten Position ========================
// =================================================================== */
interface IngredientPositionProps {
  position: number;
  ingredient: Ingredient;
  units: Unit[];
  products: Product[];
  showScaleFactors: boolean;
  gridSize: GridSizeColums;
  onChangeIngredient: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Unit | Product | null,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => void;
  onPositionMoreClick: (event: React.MouseEvent<HTMLElement>) => void;
}
const IngredientPosition = ({
  position,
  ingredient,
  units,
  products,
  showScaleFactors,
  gridSize,
  onChangeIngredient,
  onPositionMoreClick,
}: IngredientPositionProps) => {
  const classes = useStyles();

  const theme = useTheme();
  const breakpointIsXs = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <React.Fragment>
      <ListItemText>
        <Grid container spacing={2} alignItems="center">
          {!breakpointIsXs && (
            <Grid
              item
              key={"ingredient_pos_grid_" + ingredient.uid}
              xs={gridSize.pos.xs}
              sm={gridSize.pos.sm}
              className={classes.centerCenter}
            >
              <Typography
                key={"ingredient_pos_" + ingredient.uid}
                color="primary"
              >
                {position}
              </Typography>
            </Grid>
          )}
          <Grid
            item
            key={"ingredient_quantity_grid_" + ingredient.uid}
            xs={gridSize.quantity.xs}
            sm={gridSize.quantity.sm}
          >
            <TextField
              key={"quantity_" + ingredient.uid}
              id={"quantity_" + ingredient.uid}
              value={
                Number.isNaN(ingredient.quantity) || ingredient.quantity === 0
                  ? ""
                  : ingredient.quantity
              }
              label={TEXT.FIELD_QUANTITY}
              type="number"
              inputProps={{min: 0}}
              onChange={onChangeIngredient}
              fullWidth
            />
          </Grid>

          {/* Einheit */}
          <Grid
            item
            key={"ingredient_unit_grid_" + ingredient.uid}
            xs={gridSize.unit.xs}
            sm={gridSize.unit.sm}
          >
            <UnitAutocomplete
              componentKey={ingredient.uid}
              unitKey={ingredient.unit}
              units={units}
              onChange={onChangeIngredient}
            />
          </Grid>
          {/* Skalierungsfaktor */}
          {showScaleFactors && (
            <Grid
              item
              key={"ingredient_scalingFractor_grid_" + ingredient.uid}
              xs={gridSize.scalingFactor.xs}
              sm={gridSize.scalingFactor.sm}
            >
              <TextField
                value={ingredient.scalingFactor}
                id={"scalingFactor_" + ingredient.uid}
                key={"scalingFactor_" + ingredient.uid}
                label={TEXT.FIELD_SCALING_FACTOR}
                type="number"
                onChange={onChangeIngredient}
                size="small"
                fullWidth
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
            xs={gridSize.product.xs}
            sm={gridSize.product.sm}
          >
            <ProductAutocomplete
              componentKey={ingredient.uid}
              product={ingredient.product}
              products={products}
              onChange={onChangeIngredient}
            />
          </Grid>
          <Grid
            item
            key={"ingredient_detail_grid_" + ingredient.uid}
            xs={gridSize.detail.xs}
            sm={gridSize.detail.sm}
          >
            <TextField
              value={ingredient.detail}
              key={"detail_" + ingredient.uid}
              id={"detail_" + ingredient.uid}
              label={TEXT.FIELD_DETAILS}
              onChange={onChangeIngredient}
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
      </ListItemText>

      <ListItemSecondaryAction>
        <IconButton
          id={"MoreBtn_" + RecipeBlock.ingredients + "_" + ingredient.uid + "_"}
          aria-label="position-options"
          onClick={onPositionMoreClick}
        >
          <MoreVertIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Zubereitung  ==========================
// =================================================================== */
interface RecipePreparationStepsProps {
  recipe: Recipe;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Unit | Product,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => void;
  // onChangeSection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPositionMoreClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const RecipePreparationSteps = ({
  recipe,
  onChange,
  // onChangeSection,
  onPositionMoreClick,
}: RecipePreparationStepsProps) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Typography
        component="h2"
        variant="h4"
        align="center"
        style={{display: "block"}}
        gutterBottom
      >
        {TEXT.PREPARATION}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Droppable
          droppableId={"preparationSteps"}
          type={DragDropTypes.PREPARATIONSTEP}
          key={"droppable_preparationSteps"}
        >
          {(provided, snapshot) => (
            <Grid item className={classes.centerCenter} xs={12}>
              <List
                key={"listPreparationSteps"}
                innerRef={provided.innerRef}
                {...provided.droppableProps}
                className={
                  snapshot.isDraggingOver
                    ? classes.ListOnDrop
                    : classes.ListNoDrop
                }
                style={{flexGrow: 1}}
              >
                {/* Zutaten auflsiten */}
                {recipe.preparationSteps.order.map(
                  (preparationStepUid, mapCounter) => {
                    return (
                      <Draggable
                        draggableId={preparationStepUid}
                        index={mapCounter}
                        key={"draggablePreparationStep" + preparationStepUid}
                        isDragDisabled={
                          recipe.preparationSteps.order.length <= 1
                        }
                      >
                        {(provided, snapshot) => (
                          <ListItem
                            key={
                              "listitem_preparationStep" + preparationStepUid
                            }
                            id={"listitem_preparationStep" + preparationStepUid}
                            innerRef={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={
                              snapshot.isDragging
                                ? classes.listItemOnDrag
                                : classes.listItemNoDrag
                            }
                          >
                            {recipe.preparationSteps.entries[preparationStepUid]
                              .posType == PositionType.section ? (
                              // Abschnitt anzeigen
                              <SectionPosition
                                key={preparationStepUid}
                                counter={mapCounter}
                                section={
                                  recipe.preparationSteps.entries[
                                    preparationStepUid
                                  ] as Section
                                }
                                recipeBock={RecipeBlock.prepartionSteps}
                                onChangeSection={onChange}
                                onPositionMoreClick={onPositionMoreClick}
                              />
                            ) : (
                              // Zubereitungsschritt
                              <PreparationStepPosition
                                key={preparationStepUid}
                                position={mapCounter + 1}
                                preparationStep={
                                  recipe.preparationSteps.entries[
                                    preparationStepUid
                                  ] as PreparationStep
                                }
                                onChange={onChange}
                                onPositionMoreClick={onPositionMoreClick}
                              />
                            )}
                          </ListItem>
                        )}
                      </Draggable>
                    );
                  }
                )}
              </List>
            </Grid>
          )}
        </Droppable>
      </Grid>
    </React.Fragment>
  );
};
/* ===================================================================
// ================== Zubereitungsschritt Position ===================
// =================================================================== */
interface PreparationStepPositionProps {
  position: number;
  preparationStep: PreparationStep;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPositionMoreClick: (event: React.MouseEvent<HTMLElement>) => void;
}
const PreparationStepPosition = ({
  position,
  preparationStep,
  onChange,
  onPositionMoreClick,
}: PreparationStepPositionProps) => {
  const classes = useStyles();

  const theme = useTheme();
  const breakpointIsXs = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <React.Fragment>
      <ListItemText>
        <Grid container spacing={2} alignItems="center">
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
              {position}
            </Typography>
          </Grid>

          <Grid
            item
            key={"preparationstep_step_grid_" + preparationStep.uid}
            xs={10}
          >
            {"step" in preparationStep ? (
              <TextField
                id={"step_" + preparationStep.uid}
                key={"step_" + preparationStep.uid}
                label={TEXT.FIELD_STEP + " " + position}
                name={"step_" + preparationStep.uid}
                autoComplete={"preparationStep"}
                value={preparationStep.step}
                multiline
                fullWidth
                onChange={onChange}
              />
            ) : null}
          </Grid>
        </Grid>
      </ListItemText>
      <ListItemSecondaryAction>
        <IconButton
          id={
            "MoreBtn_" + RecipeBlock.prepartionSteps + "_" + preparationStep.uid
          }
          aria-label="position-options"
          onClick={onPositionMoreClick}
        >
          <MoreVertIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================= Material  ===========================
// =================================================================== */
interface RecipeMaterialProps {
  recipe: Recipe;
  materials: Material[];
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Material,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => void;
  // onChangeSection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPositionMoreClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const RecipeMaterial = ({
  recipe,
  materials,
  onChange,
  onPositionMoreClick,
}: RecipeMaterialProps) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography
        component="h2"
        variant="h4"
        align="center"
        style={{display: "block"}}
        gutterBottom
      >
        {TEXT.MATERIAL}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Droppable
          droppableId={"materials"}
          type={DragDropTypes.MATERIAL}
          key={"droppable_materials"}
        >
          {(provided, snapshot) => (
            <Grid item className={classes.centerCenter} xs={12}>
              <List
                key={"listMaterials"}
                innerRef={provided.innerRef}
                {...provided.droppableProps}
                className={
                  snapshot.isDraggingOver
                    ? classes.ListOnDrop
                    : classes.ListNoDrop
                }
                style={{flexGrow: 1}}
              >
                {recipe.materials.order.map((materialUid, counter) => (
                  <Draggable
                    draggableId={materialUid}
                    index={counter}
                    key={"draggableMaterial" + materialUid}
                    isDragDisabled={recipe.materials.order.length <= 1}
                  >
                    {(provided, snapshot) => (
                      <ListItem
                        key={"listitem_materials_" + materialUid}
                        id={"listitem_materials_" + materialUid}
                        innerRef={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={
                          snapshot.isDragging
                            ? classes.listItemOnDrag
                            : classes.listItemNoDrag
                        }
                      >
                        <MaterialPosition
                          position={counter + 1}
                          key={materialUid}
                          material={recipe.materials.entries[materialUid]}
                          materials={materials}
                          onChangeMaterial={onChange}
                          onPositionMoreClick={onPositionMoreClick}
                        />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
              </List>
            </Grid>
          )}
        </Droppable>
      </Grid>
    </React.Fragment>
  );
};
/* ===================================================================
// ======================= Material Position =========================
// =================================================================== */
interface MaterialPositionProps {
  position: number;
  material: RecipeMaterialPosition;
  materials: Material[];
  onChangeMaterial: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPositionMoreClick: (event: React.MouseEvent<HTMLElement>) => void;
}
const MaterialPosition = ({
  position,
  material,
  materials,
  onChangeMaterial,
  onPositionMoreClick,
}: MaterialPositionProps) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <ListItemText>
        <Grid container spacing={2} alignItems="center">
          <Grid
            item
            key={"material_pos_grid_" + material.uid}
            xs={1}
            className={classes.centerCenter}
          >
            <Typography key={"material_pos_" + material.uid} color="primary">
              {position}
            </Typography>
          </Grid>

          <Grid item key={"material_quantity_grid_" + material.uid} xs={2}>
            <TextField
              key={"quantity_" + material.uid}
              id={"quantity_" + material.uid}
              value={
                Number.isNaN(material.quantity) || material.quantity === 0
                  ? ""
                  : material.quantity
              }
              label={TEXT.FIELD_QUANTITY}
              type="number"
              inputProps={{min: 0}}
              onChange={onChangeMaterial}
              fullWidth
            />
          </Grid>
          <Grid item key={"material_name_grid_" + material.uid} xs={8}>
            <MaterialAutocomplete
              componentKey={material.uid}
              material={material.material}
              materials={materials}
              onChange={onChangeMaterial}
            />
          </Grid>
        </Grid>
      </ListItemText>
      <ListItemSecondaryAction>
        <IconButton
          id={"MoreBtn_" + RecipeBlock.materials + "_" + material.uid}
          aria-label="position-options"
          onClick={onPositionMoreClick}
        >
          <MoreVertIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </React.Fragment>
  );
};

/* ===================================================================
// ================ Abschnitt für Zutaten/Zubereitung ================
// =================================================================== */
interface SectionPositionProps {
  counter: number;
  section: Section;
  recipeBock: RecipeBlock;
  onChangeSection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPositionMoreClick: (event: React.MouseEvent<HTMLElement>) => void;
}
const SectionPosition = ({
  counter,
  section,
  recipeBock,
  onChangeSection,
  onPositionMoreClick,
}: SectionPositionProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const breakpointIsXs = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <React.Fragment>
      <ListItemText>
        <Grid container spacing={2} alignItems="center">
          {counter !== 1 && <Grid item xs={12} style={{marginTop: "0.5em"}} />}
          {!breakpointIsXs && (
            <Grid
              item
              key={"section_pos_grid_" + section.uid}
              xs={1}
              sm={1}
              className={classes.centerCenter}
            />
          )}

          <Grid item key={"section_name_grid_" + section.uid} xs={11} sm={10}>
            <TextField
              key={"name" + section.uid}
              id={"name_" + section.uid}
              value={section.name}
              label={TEXT.FIELD_SECTION_NAME}
              onChange={onChangeSection}
              fullWidth
            />
          </Grid>
        </Grid>
      </ListItemText>
      <ListItemSecondaryAction>
        <IconButton
          id={"MoreBtn_" + recipeBock + "_" + section.uid}
          aria-label="position-options"
          onClick={onPositionMoreClick}
        >
          <MoreVertIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </React.Fragment>
  );
};
/* ===================================================================
// ==================== Kontextmenü für Positionen ===================
// =================================================================== */
interface PositionMoreClickContextMenuProps {
  anchorEl: HTMLElement | null;
  handleMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  handleMenuClose: () => void;
  recipeBlock: RecipeBlock;
  uid: string;
}
const PositionMoreClickContextMenu = ({
  anchorEl,
  handleMenuClick,
  handleMenuClose,
  recipeBlock,
  uid,
}: PositionMoreClickContextMenuProps) => {
  return (
    <Menu
      keepMounted
      id={"positionMenu"}
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem
        id={recipeBlock + "_" + Action.ADD + "_" + uid}
        onClick={handleMenuClick}
      >
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{TEXT.TOOLTIP_ADD_POS}</Typography>
      </MenuItem>
      <MenuItem
        id={recipeBlock + "_" + Action.NEWSECTION + "_" + uid}
        onClick={handleMenuClick}
      >
        <ListItemIcon>
          <ViewDayIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{TEXT.TOOLTIP_ADD_SECTION}</Typography>
      </MenuItem>
      <MenuItem
        id={recipeBlock + "_" + Action.DELETE + "_" + uid}
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
  );
};
/* ===================================================================
// ========================= Varianten-Notiz =========================
// =================================================================== */
interface RecipeVariantNoteProps {
  recipe: Recipe;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const RecipeVariantNote = ({recipe, onChange}: RecipeVariantNoteProps) => {
  return (
    <React.Fragment>
      <Typography
        component="h2"
        variant="h4"
        align="center"
        style={{display: "block"}}
        gutterBottom
      >
        {TEXT.VARIANT_NOTE}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item key={"grid_pos_note"} xs={1} />
        <Grid item key={"grid_note_note"} xs={11}>
          <TextField
            id="variantProperties.note"
            key="variantProperties.note"
            name="variantProperties.note"
            multiline
            maxRows={4}
            fullWidth
            label={TEXT.NOTE}
            value={recipe.variantProperties?.note}
            onChange={onChange}
            style={{marginBottom: "2ex"}}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
export default RecipeEdit;
