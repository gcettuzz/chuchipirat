import React from "react";
import {pdf} from "@react-pdf/renderer";
import fileSaver from "file-saver";

import {
  Grid,
  Container,
  Switch,
  Button,
  Card,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  CardContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListSubheader,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Tooltip,
  Divider,
  ListItemText,
  CssBaseline,
} from "@material-ui/core";
import {alpha} from "@material-ui/core/styles/colorManipulator";

import {ToggleButtonGroup, ToggleButton} from "@material-ui/lab";

import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  Build as BuildIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Notes as NotesIcon,
  Edit,
  DeleteSweep as DeleteSweepIcon,
} from "@material-ui/icons";

import useStyles from "../../../constants/styles";

import Menuplan, {
  MealType,
  Menue,
  Note,
  Meal,
  PlanedDiet,
  PlanedIntolerances,
  PortionPlan,
  PlanedMealsRecipe,
  MealRecipe,
  GoodsType,
  GoodsPlanMode,
  MenuplanMaterial,
  MenuplanProduct,
  MealRecipes,
  MealRecipeDeletedPrefix,
} from "./menuplan.class";
import {AutocompleteChangeReason} from "@material-ui/lab/Autocomplete";

import {OnRecipeCardClickProps} from "../../Recipe/recipes";
import {
  SHOW_DETAILS as TEXT_SHOW_DETAILS,
  ADD_MEAL as TEXT_ADD_MEAL,
  RENAME as TEXT_RENAME,
  DELETE as TEXT_DELETE,
  MEAL as TEXT_MEAL,
  NOTE as TEXT_NOTE,
  EDIT as TEXT_EDIT,
  ADD as TEXT_ADD,
  CLOSE as TEXT_CLOSE,
  CANCEL as TEXT_CANCEL,
  APPLY as TEXT_APPLY,
  NEW_MENU as TEXT_NEW_MENU,
  ADD_RECIPE as TEXT_ADD_RECIPE,
  EDIT_MENUE as TEXT_EDIT_MENUE,
  ADD_PRODUCT as TEXT_ADD_PRODUCT,
  ADD_MATERIAL as TEXT_ADD_MATERIAL,
  PRODUCTS as TEXT_PRODUCTS,
  MATERIAL as TEXT_MATERIAL,
  RECIPES as TEXT_RECIPES,
  RECIPES_DRAWER_TITLE as TEXT_RECIPES_DRAWER_TITLE,
  MENUE as TEXT_MENUE,
  DIALOG_PLAN_RECIPE_PORTIONS_TITLE as TEXT_DIALOG_PLAN_RECIPE_PORTIONS_TITLE,
  DIALOG_PLAN_GOODS_PORTIONS_TITLE as TEXT_DIALOG_PLAN_GOODS_PORTIONS_TITLE,
  ALL as TEXT_ALL,
  FIX_PORTIONS as TEXT_FIX_PORTIONS,
  ON_DATE as TEXT_ON_DATE,
  KEEP_PLANED_PORTIONS_IN_SYNC as TEXT_KEEP_PLANED_PORTIONS_IN_SYNC,
  FACTOR as TEXT_FACTOR,
  TOTAL_PORTIONS as TEXT_TOTAL_PORTIONS,
  FACTOR_TOOLTIP as TEXT_FACTOR_TOOLTIP,
  PORTIONS as TEXT_PORTIONS,
  PORTION as TEXT_PORTION,
  YOUR_SELECTION_MAKES_X_SERVINGS as TEXT_YOUR_SELECTION_MAKES_X_SERVINGS,
  BACK as TEXT_BACK,
  NO_OF_SERVINGS as TEXT_NO_OF_SERVINGS,
  PLEASE_PROVIDE_VALID_FACTOR as TEXT_PLEASE_PROVIDE_VALID_FACTOR,
  MISSING_FACTOR as TEXT_MISSING_FACTOR,
  NO_GROUP_SELECTED as TEXT_NO_GROUP_SELECTED,
  NO_PORTIONS_GIVEN as TEXT_NO_PORTIONS_GIVEN,
  DELETE_MENUE as TEXT_DELETE_MENUE,
  TOTAL as TEXT_TOTAL,
  PER_PORTION as TEXT_PER_PORTION,
  EXPLANATION_DIALOG_GOODS_TYPE_PRODUCT as TEXT_EXPLANATION_DIALOG_GOODS_TYPE_PRODUCT,
  EXPLANATION_DIALOG_GOODS_TYPE_MATERIAL as TEXT_EXPLANATION_DIALOG_GOODS_TYPE_MATERIAL,
  EXPLANATION_DIALOG_GOODS_OPTION_TOTAL as TEXT_EXPLANATION_DIALOG_GOODS_OPTION_TOTAL,
  EXPLANATION_DIALOG_GOODS_OPTION_PER_PORTION as TEXT_EXPLANATION_DIALOG_GOODS_OPTION_PER_PORTION,
  QUANTITY as TEXT_QUANTITY,
  OK as TEXT_OK,
  PRINTVERSION as TEXT_PRINTVERSION,
  SUFFIX_PDF as TEXT_SUFFIX_PDF,
  ALL_MEAL_AND_VALUES_WILL_BE_DELETED as TEXT_ALL_MEAL_AND_VALUES_WILL_BE_DELETED,
  ATTENTION as TEXT_ATTENTION,
  ALL_RECIPES_AND_VALUES_WILL_BE_DELETED as TEXT_ALL_RECIPES_AND_VALUES_WILL_BE_DELETED,
  VARIANT as TEXT_VARIANT,
  RECIPE_WIHOUT_PORTIONPLAN as TEXT_RECIPE_WIHOUT_PORTIONPLAN,
  DIALOG_CHOOSE_MENUES_TITLE as TEXT_DIALOG_CHOOSE_MENUES_TITLE,
  PRODUCT as TEXT_PRODUCT,
} from "../../../constants/text";
import {
  FetchMissingDataType,
  FetchMissingDataProps,
  OnMasterdataCreateProps,
  MasterDataCreateType,
} from "../Event/event";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import MenuplanPdf from "./menuplanPdf";
import Utils from "../../Shared/utils.class";
import Firebase from "../../Firebase/firebase.class";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import Action from "../../../constants/actions";

import {RecipeSearch} from "../../Recipe/recipes";
import RecipeShort from "../../Recipe/recipeShort.class";
import RecipeView, {OnAddToEvent} from "../../Recipe/recipe.view";
import Recipe, {RecipeType, Recipes} from "../../Recipe/recipe.class";
import EventGroupConfiguration, {
  Intolerance,
  Diet,
} from "../GroupConfiguration/groupConfiguration.class";
import {FormValidationFieldError} from "../../Shared/fieldValidation.error.class";
import UnitAutocomplete from "../../Unit/unitAutocomplete";
import Unit from "../../Unit/unit.class";
import Product from "../../Product/product.class";
import ProductAutocomplete from "../../Product/productAutocomplete";
import MaterialAutocomplete from "../../Material/materialAutocomplete";
import Material from "../../Material/material.class";
import DialogMaterial, {
  MATERIAL_POP_UP_VALUES_INITIAL_STATE,
  MaterialDialog,
} from "../../Material/dialogMaterial";
import DialogProduct, {
  PRODUCT_POP_UP_VALUES_INITIAL_STATE,
  ProductDialog,
} from "../../Product/dialogProduct";
import Department from "../../Department/department.class";
import Event, {EventRefDocuments} from "../Event/event.class";
import {
  DialogType,
  SingleTextInputResult,
  useCustomDialog,
} from "../../Shared/customDialogContext";
import RecipeEdit from "../../Recipe/recipe.edit";
import {
  DialogSelectMenues,
  DialogSelectMenuesForRecipeDialogValues,
} from "./dialogSelectMenues";
import {
  NavigationValuesContext,
  NavigationObject,
} from "../../Navigation/navigationContext";

/* ===================================================================
// ============================== Global =============================
// =================================================================== */

interface MenuplanSettings {
  showDetails: boolean;
}

interface onMenuplanUpdate {
  [key: string]: any;
}
enum DragDropTypes {
  MEALTYPE = "MEALTYPE",
  MENU = "MENU",
  MEALRECIPE = "RECIPE",
  PRODUCT = "PRODUCT",
  MATERIAL = "MATERIAL",
}
enum MenueEditTypes {
  NOTE = "NOTE",
  MEALRECIPE = "MEALRECIPE",
  PRODUCT = "PRODUCT",
  MATERIAL = "MATERIAL",
}
interface DrawerSettings {
  open: boolean;
  isLoadingData: boolean;
}
export interface RecipeDrawerData extends DrawerSettings {
  recipe: Recipe;
  mealPlan: Array<PlanedMealsRecipe>;
  scaledPortions: number;
  editMode: boolean;
}
interface RecipeSearchDrawerData extends DrawerSettings {
  menue: Menue | null;
}
interface OnRecipeSelection {
  // event: React.MouseEvent<HTMLButtonElement>;
  recipe: RecipeShort;
}
interface GeneratePlanedPortionsTextProps {
  uid: string;
  portionPlan: PortionPlan[];
  groupConfiguration: EventGroupConfiguration;
}

export const generatePlanedPortionsText = ({
  uid,
  portionPlan,
  groupConfiguration,
}: GeneratePlanedPortionsTextProps) => {
  return portionPlan.map((plan, index) => (
    <React.Fragment key={"listItem" + uid + "_" + index}>
      {`${plan.factor != 1 ? `${plan.factor} × ` : ``} ${
        plan.diet == PlanedDiet.ALL
          ? TEXT_ALL
          : plan.diet == PlanedDiet.FIX
          ? ""
          : groupConfiguration.diets.entries[plan.diet].name
      }${
        plan.intolerance == PlanedIntolerances.ALL
          ? ""
          : plan.intolerance == PlanedIntolerances.FIX
          ? ""
          : `, ${
              groupConfiguration.intolerances.entries[plan.intolerance].name
            }`
      } (${plan.totalPortions} ${
        plan.totalPortions == 1 ? TEXT_PORTION : TEXT_PORTIONS
      })`}

      {index !== portionPlan.length - 1 && <br />}
      {/* Zeilenumbruch, außer beim letzten Element */}
    </React.Fragment>
  ));
};

/* ===================================================================
// ============================= Menüplan ============================
// =================================================================== */
interface MenuplanPageProps {
  menuplan: Menuplan;
  recipes: Recipes;
  recipeList: RecipeShort[];
  groupConfiguration: EventGroupConfiguration;
  event: Event;
  units: Unit[];
  products: Product[];
  materials: Material[];
  departments: Department[];
  firebase: Firebase;
  authUser: AuthUser;
  onMenuplanUpdate: (menuplan: Menuplan) => void;
  fetchMissingData: ({type, recipeShort}: FetchMissingDataProps) => void;
  onMasterdataCreate: ({type, value}: OnMasterdataCreateProps) => void;
  onRecipeUpdate: (recipe: Recipe) => void;
}
interface DialogSelectMenueData {
  open: boolean;
  menues: DialogSelectMenuesForRecipeDialogValues;
  selectedRecipe: RecipeShort;
}
interface DialogPlanPortionsData {
  open: boolean;
  menues: DialogSelectMenuesForRecipeDialogValues | null;
  mealRecipeUid: MealRecipe["uid"];
  portionPlan: PortionPlan[];
  planedMaterial: MenuplanMaterial | null;
  planedProduct: MenuplanProduct | null;
  planedObject: PlanedObject;
}
interface DialotEditMenue {
  open: boolean;
  menueUid: Menue["uid"];
}
interface DialogGoods {
  open: boolean;
  menueUid: Menue["uid"];
  goodsType: GoodsType;
  product: MenuplanProduct | null;
  material: MenuplanMaterial | null;
}
export const RECIPE_DRAWER_DATA_INITIAL_VALUES: RecipeDrawerData = {
  open: false,
  isLoadingData: false,
  recipe: new Recipe(),
  mealPlan: [],
  scaledPortions: 0,
  editMode: false,
};
const MenuplanPage = ({
  menuplan,
  groupConfiguration,
  event,
  recipes,
  recipeList,
  firebase,
  authUser,
  units,
  products,
  materials,
  departments,
  onMenuplanUpdate: onMenuplanUpdateSuper,
  onRecipeUpdate: onRecipeUpdateSuper,
  fetchMissingData,
  onMasterdataCreate,
}: MenuplanPageProps) => {
  const classes = useStyles();
  const {customDialog} = useCustomDialog();
  const navigationValuesContext = React.useContext(NavigationValuesContext);

  const [menuplanSettings, setMenuPlanSettings] =
    React.useState<MenuplanSettings>({showDetails: false});
  const [recipeSearchDrawerData, setRecipeSearchDrawerData] =
    React.useState<RecipeSearchDrawerData>({
      open: false,
      isLoadingData: false,
      menue: null,
    });

  const [recipeDrawerData, setRecipeDrawerData] =
    React.useState<RecipeDrawerData>(RECIPE_DRAWER_DATA_INITIAL_VALUES);
  const [dialogSelectMenueData, setDialogSelectMenueData] =
    React.useState<DialogSelectMenueData>({
      open: false,
      menues: {} as DialogSelectMenuesForRecipeDialogValues,
      selectedRecipe: {} as RecipeShort,
    });
  const [dialogPlanPortionsData, setDialogPlanPortionsData] =
    React.useState<DialogPlanPortionsData>({
      open: false,
      menues: null,
      mealRecipeUid: "",
      portionPlan: [],
      planedMaterial: null,
      planedProduct: null,
      planedObject: PlanedObject.RECIPE,
    });
  const [dialogEditMenue, setDialogEditMenue] = React.useState<DialotEditMenue>(
    {open: false, menueUid: ""}
  );
  const GOODS_DATA_DIALOG_INITIAL_DATA: DialogGoods = {
    open: false,
    menueUid: "",
    goodsType: GoodsType.NONE,
    product: null,
    material: null,
  };
  // Dialog für Produkte und Material ==> Goods
  const [dialogGoodsData, setDialogGoodsData] = React.useState<DialogGoods>(
    GOODS_DATA_DIALOG_INITIAL_DATA
  );
  /* ------------------------------------------
  // Navigation-Handler
  // ------------------------------------------ */
  React.useEffect(() => {
    navigationValuesContext?.setNavigationValues({
      action: Action.NONE,
      object: NavigationObject.menueplan,
    });
  }, []);

  /* ------------------------------------------
  // Initiale-Einstellungen vornehmen
  // ------------------------------------------ */
  if (recipeSearchDrawerData.isLoadingData && recipeList.length > 0) {
    // Loading-Anzeige der Rezepte wieder abstellen
    setRecipeSearchDrawerData({
      ...recipeSearchDrawerData,
      isLoadingData: false,
    });
  }
  if (recipeDrawerData.isLoadingData) {
    if (!recipeDrawerData.recipe.name) {
      // Aktualisierte Werte setzen // es wurden erst die Infos aus der
      // RecipeShort gesetzt. Diese mal anzeigen
      setRecipeDrawerData({
        ...recipeDrawerData,
        isLoadingData:
          recipes[recipeDrawerData.recipe.uid].portions > 0 ? false : true,
        recipe: recipes[recipeDrawerData.recipe.uid],
      });
    } else if (
      recipeDrawerData.recipe?.portions == 0 &&
      recipes[recipeDrawerData.recipe.uid]?.portions > 0
    ) {
      // Nun ist alles da. Loading-Kreis ausblenden
      setRecipeDrawerData({
        ...recipeDrawerData,
        isLoadingData: false,
        recipe: recipes[recipeDrawerData.recipe.uid],
      });
    }
  }
  /* ------------------------------------------
  // Setting-Handling
  // ------------------------------------------ */
  const onSwitchShowDetails = () =>
    setMenuPlanSettings({
      ...menuplanSettings,
      showDetails: !menuplanSettings.showDetails,
    });
  /* ------------------------------------------
  // Change-Handler
  // ------------------------------------------ */
  const onMealTypeUpdate = async ({action, mealType}: OnMealTypeUpdate) => {
    const tempMealTypes = {...menuplan.mealTypes};
    let mealTypes = {} as Menuplan["mealTypes"];
    let meals = {} as Menuplan["meals"];
    let menues = {} as Menuplan["menues"];
    let mealRecipes = {} as Menuplan["mealRecipes"];
    let products = {} as Menuplan["products"];
    let materials = {} as Menuplan["materials"];
    let isConfirmed: boolean;
    switch (action) {
      case Action.DELETE:
        isConfirmed = (await customDialog({
          dialogType: DialogType.Confirm,
          text: TEXT_ALL_MEAL_AND_VALUES_WILL_BE_DELETED,
          title: `⚠️  ${TEXT_ATTENTION}`,
          buttonTextConfirm: TEXT_DELETE,
        })) as boolean;
        if (!isConfirmed) {
          return;
        }

        ({mealTypes, meals, menues, mealRecipes, products, materials} =
          Menuplan.deleteMealType({
            mealTypeToDelete: mealType,
            mealTypes: menuplan.mealTypes,
            meals: menuplan.meals,
            menues: menuplan.menues,
            mealRecipes: menuplan.mealRecipes,
            products: menuplan.products,
            materials: menuplan.materials,
          }));
        onMenuplanUpdateSuper({
          ...menuplan,
          mealTypes: mealTypes,
          meals: meals,
          menues: menues,
          mealRecipes: mealRecipes,
          products: products,
          materials: materials,
        });

        break;
      case Action.ADD:
        ({mealTypes, meals, menues} = Menuplan.addMealType({
          mealType: mealType,
          mealTypes: menuplan.mealTypes,
          meals: menuplan.meals,
          menues: menuplan.menues,
          dates: menuplan.dates,
        }));
        onMenuplanUpdateSuper({
          ...menuplan,
          mealTypes: mealTypes,
          meals: meals,
          menues: menues,
        });
        break;
      case Action.EDIT:
        tempMealTypes.entries[mealType.uid] = {...mealType};
        onMenuplanUpdateSuper({...menuplan, mealTypes: tempMealTypes});
        break;
    }
  };
  const onMenuplanUpdate = (valuesToUpdate: onMenuplanUpdate) => {
    // die geänderten Daten mit den aktuellen Menüplan mergen
    onMenuplanUpdateSuper({...menuplan, ...valuesToUpdate});
  };
  const onNoteUpdate = ({action, note}: OnNoteUpdate) => {
    const updatedNotes = {...menuplan.notes};
    let updatedNote: Note;
    switch (action) {
      case Action.ADD:
        updatedNotes[note.uid] = note;
        break;
      case Action.EDIT:
        updatedNote = {...updatedNotes[note.uid]};
        updatedNote.text = note.text;
        updatedNotes[note.uid] = updatedNote;
        break;
      case Action.DELETE:
        delete updatedNotes[note.uid];
        break;
    }
    onMenuplanUpdate({...menuplan, notes: updatedNotes});
  };
  /* ------------------------------------------
  // PDF generieren
  // ------------------------------------------ */
  const onPrint = () => {
    pdf(<MenuplanPdf event={event} menuplan={menuplan} authUser={authUser} />)
      .toBlob()
      .then((result) => {
        fileSaver.saveAs(result, "Menueplan " + event.name + TEXT_SUFFIX_PDF);
      });
  };
  /* ------------------------------------------
  // Drag & Drop Handler
  // ------------------------------------------ */
  const onDragEnd = (result: DropResult) => {
    const {destination, source, type} = result;
    let draggableId = result.draggableId;

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

    let newMealTypeOrder: MealType["uid"][];
    let newMealRecipeOrder: Meal["uid"][];
    let sourceMenue: Menue;
    let destinationMenue: Menue;
    let sourceMealRecipeOrder: MealRecipe["uid"][];
    let destinationMealRecipeOrder: MealRecipe["uid"][];
    let sourceMeal: Meal;
    let destinationMeal: Meal;
    let newMealOrder: Meal["uid"][];
    let sourceMealMenuOrder: Meal["menuOrder"];
    let destinationMealMenuOrder: Meal["menuOrder"];

    // let sourceMealProducts: Menue[""]
    // destinationMealProducts
    // newMealProductsOrder
    let sourceMenueProductOrder: Menue["productOrder"];
    let destinationMenueProductsOrder: Menue["productOrder"];
    switch (type) {
      case DragDropTypes.MEALTYPE:
        newMealTypeOrder = Array.from(menuplan.mealTypes.order);
        newMealTypeOrder.splice(source.index, 1);
        newMealTypeOrder.splice(destination.index, 0, draggableId);
        onMenuplanUpdateSuper({
          ...menuplan,
          mealTypes: {
            entries: menuplan.mealTypes.entries,
            order: newMealTypeOrder,
          },
        });
        break;
      case DragDropTypes.MEALRECIPE:
        sourceMenue = {...menuplan.menues[source.droppableId]};
        destinationMenue = {
          ...menuplan.menues[destination.droppableId],
        };

        if (source.droppableId === destination.droppableId) {
          // Reihenfolge im gleichen Menü angepasst
          newMealRecipeOrder = Array.from(sourceMenue.mealRecipeOrder);
          newMealRecipeOrder.splice(source.index, 1);
          newMealRecipeOrder.splice(destination?.index, 0, draggableId);

          onMenuplanUpdateSuper({
            ...menuplan,
            menues: {
              ...menuplan.menues,
              [sourceMenue.uid]: {
                ...sourceMenue,
                mealRecipeOrder: newMealRecipeOrder,
              },
            },
          });
        } else {
          // In ein anderes Menü verschoben
          sourceMealRecipeOrder = Array.from(sourceMenue.mealRecipeOrder);
          destinationMealRecipeOrder = Array.from(
            destinationMenue.mealRecipeOrder
          );
          sourceMealRecipeOrder.splice(source.index, 1);
          destinationMealRecipeOrder.splice(destination.index, 0, draggableId);

          onMenuplanUpdateSuper({
            ...menuplan,
            menues: {
              ...menuplan.menues,
              [sourceMenue.uid]: {
                ...sourceMenue,
                mealRecipeOrder: sourceMealRecipeOrder,
              },
              [destinationMenue.uid]: {
                ...destinationMenue,
                mealRecipeOrder: destinationMealRecipeOrder,
              },
            },
          });
        }
        break;
      case DragDropTypes.MENU:
        sourceMeal = {...menuplan.meals[source.droppableId]};
        destinationMeal = {...menuplan.meals[destination.droppableId]};

        if (source.droppableId === destination.droppableId) {
          // Reihenfolge des gleichen Menü angepasst
          newMealOrder = Array.from(sourceMeal.menuOrder);
          newMealOrder.splice(source.index, 1);
          newMealOrder.splice(destination?.index, 0, draggableId);

          onMenuplanUpdateSuper({
            ...menuplan,
            meals: {
              ...menuplan.meals,
              [sourceMeal.uid]: {
                ...sourceMeal,
                menuOrder: newMealOrder,
              },
            },
          });
        } else {
          // In ein anderes Menü verschoben
          sourceMealMenuOrder = Array.from(sourceMeal.menuOrder);
          destinationMealMenuOrder = Array.from(destinationMeal.menuOrder);
          sourceMealMenuOrder.splice(source.index, 1);
          destinationMealMenuOrder.splice(destination.index, 0, draggableId);

          onMenuplanUpdateSuper({
            ...menuplan,
            meals: {
              ...menuplan.meals,
              [sourceMeal.uid]: {
                ...sourceMeal,
                menuOrder: sourceMealMenuOrder,
              },
              [destinationMeal.uid]: {
                ...destinationMeal,
                menuOrder: destinationMealMenuOrder,
              },
            },
          });
        }

        break;
      case DragDropTypes.PRODUCT:
        sourceMenue = {...menuplan.menues[source.droppableId]};
        destinationMenue = {...menuplan.menues[destination.droppableId]};

        if (source.droppableId === destination.droppableId) {
          // Reihenfolge im gleichen Menü angepasst
          const newMealProductsOrder = Array.from(sourceMenue.productOrder);
          newMealProductsOrder.splice(source.index, 1);
          newMealProductsOrder.splice(destination?.index, 0, draggableId);

          onMenuplanUpdateSuper({
            ...menuplan,
            menues: {
              ...menuplan.menues,
              [sourceMenue.uid]: {
                ...sourceMenue,
                productOrder: newMealProductsOrder,
              },
            },
          });
        } else {
          // In ein anderes Menü verschoben
          sourceMenueProductOrder = Array.from(sourceMenue.productOrder);
          destinationMenueProductsOrder = Array.from(
            destinationMenue.productOrder
          );
          sourceMenueProductOrder.splice(source.index, 1);
          destinationMenueProductsOrder.splice(
            destination.index,
            0,
            draggableId
          );

          onMenuplanUpdateSuper({
            ...menuplan,
            menues: {
              ...menuplan.menues,
              [sourceMenue.uid]: {
                ...sourceMenue,
                productOrder: sourceMenueProductOrder,
              },
              [destinationMenue.uid]: {
                ...destinationMenue,
                productOrder: destinationMenueProductsOrder,
              },
            },
          });
        }
        break;
      case DragDropTypes.MATERIAL:
        sourceMenue = {...menuplan.menues[source.droppableId]};
        destinationMenue = {...menuplan.menues[destination.droppableId]};

        if (source.droppableId === destination.droppableId) {
          // Reihenfolge im gleichen Menü angepasst
          const newMealMaterialsOrder = Array.from(sourceMenue.materialOrder);
          newMealMaterialsOrder.splice(source.index, 1);
          newMealMaterialsOrder.splice(destination?.index, 0, draggableId);

          onMenuplanUpdateSuper({
            ...menuplan,
            menues: {
              ...menuplan.menues,
              [sourceMenue.uid]: {
                ...sourceMenue,
                materialOrder: newMealMaterialsOrder,
              },
            },
          });
        } else {
          // In ein anderes Menü verschoben
          const sourceMealProductOrder = Array.from(sourceMenue.materialOrder);
          const destinationMealMaterialsOrder = Array.from(
            destinationMenue.materialOrder
          );
          sourceMealProductOrder.splice(source.index, 1);
          destinationMealMaterialsOrder.splice(
            destination.index,
            0,
            draggableId
          );

          onMenuplanUpdateSuper({
            ...menuplan,
            menues: {
              ...menuplan.menues,
              [sourceMenue.uid]: {
                ...sourceMenue,
                materialOrder: sourceMealProductOrder,
              },
              [destinationMenue.uid]: {
                ...destinationMenue,
                materialOrder: destinationMealMaterialsOrder,
              },
            },
          });
        }
        break;
    }
  };
  /* ------------------------------------------
  // Drawer-Handling
  // ------------------------------------------ */
  const onAddRecipe = (menue: Menue) => {
    setRecipeSearchDrawerData({
      ...recipeSearchDrawerData,
      open: true,
      isLoadingData: recipeList.length == 0 ? true : false,
      menue: menue,
    });

    if (recipeList.length == 0) {
      fetchMissingData({type: FetchMissingDataType.RECIPES});
    }
  };
  const onRecipeSearchDrawerClose = () => {
    setRecipeSearchDrawerData({
      ...recipeSearchDrawerData,
      open: false,
    });
  };
  const onRecipeDrawerClose = () => {
    setRecipeDrawerData(RECIPE_DRAWER_DATA_INITIAL_VALUES);
  };
  const onRecipeCardClick = ({recipe: recipeShort}: OnRecipeCardClickProps) => {
    let recipe = new Recipe();
    recipe.uid = recipeShort.uid;

    if (Object.prototype.hasOwnProperty.call(recipes, recipeShort.uid)) {
      recipe = recipes[recipeShort.uid] as Recipe;
    } else {
      // Rezept noch nicht vorhanden --> holen
      fetchMissingData({
        type: FetchMissingDataType.RECIPE,
        recipeShort: recipeShort,
      });
    }
    setRecipeDrawerData({
      ...recipeDrawerData,
      open: true,
      isLoadingData: !Object.prototype.hasOwnProperty.call(
        recipes,
        recipeShort.uid
      ),
      recipe: recipe,
      scaledPortions: 0,
    });
  };
  const onRecipeSelection = ({recipe: recipeShort}: OnRecipeSelection) => {
    setDialogSelectMenueData({
      ...dialogSelectMenueData,
      open: true,
      menues: {
        [recipeSearchDrawerData?.menue?.uid as Menuplan["uid"]]: true,
      },
      selectedRecipe: recipeShort,
    });
  };
  const onRecipeUpdate = (recipe: Recipe) => {
    if (recipe.type == RecipeType.variant) {
      if (recipe.uid == "") {
        // Variante wird gerade neu erstellt. Noch nicht hochgeben
        // Erst wenn die Variante angelegt wurde.
        recipe = Recipe.createEmptyListEntries({recipe: recipe});

        setRecipeDrawerData({
          ...recipeDrawerData,
          recipe: recipe,
          editMode: true,
        });
        // Noch nicht weiter hochgeben. Rezept wurde noch nicht gespeichert
        return;
      } else if (recipe.uid !== "" && recipeDrawerData.recipe.uid == "") {
        if (!event.refDocuments?.includes(EventRefDocuments.recipeVariants)) {
          // sichern das es auch Rezept-Varianten gibt
          Event.save({
            event: {
              ...event,
              refDocuments: Event.addRefDocument({
                refDocuments: event.refDocuments,
                newDocumentType: EventRefDocuments.recipeVariants,
              }),
            },
            firebase: firebase,
            authUser: authUser,
          });
        }
        // Variante wurde erstellt. jetzt wurde gespeichert
        if (recipeDrawerData.mealPlan.length > 0) {
          // Aus Rezept eine Variante erstellt . Bestehendes in MealRecipe austauschen
          const updatedMealRecipes = {...menuplan.mealRecipes};
          updatedMealRecipes[
            recipeDrawerData.mealPlan[0].mealPlanRecipe
          ].recipe = {
            ...updatedMealRecipes[recipeDrawerData.mealPlan[0].mealPlanRecipe]
              .recipe,
            name: recipe.name,
            variantName: recipe.variantProperties?.variantName,
            recipeUid: recipe.uid,
            type: recipe.type,
          };
          onMenuplanUpdate({
            mealRecipes: updatedMealRecipes,
          });
        }
        setDialogSelectMenueData({
          ...dialogSelectMenueData,
          selectedRecipe: RecipeShort.createShortRecipeFromRecipe(recipe),
        });
        setRecipeDrawerData({
          ...recipeDrawerData,
          recipe: recipe,
          editMode: false,
        });
      } else {
        if (recipeDrawerData.mealPlan.length > 0) {
          const updatedMealRecipes = {} as MealRecipes;
          recipeDrawerData.mealPlan.forEach((mealPlan) => {
            if (
              updatedMealRecipes[mealPlan.mealPlanRecipe].recipe.variantName !=
              recipe.variantProperties?.variantName
            ) {
              updatedMealRecipes[mealPlan.mealPlanRecipe] =
                menuplan.mealRecipes[mealPlan.mealPlanRecipe];

              // Falls der Variantenname angepasst wurde, dies im Menüplan
              // entsprechen anpassen.
              updatedMealRecipes[mealPlan.mealPlanRecipe].recipe.variantName =
                recipe.variantProperties?.variantName;
            }
          });
          if (Object.keys(updatedMealRecipes).length > 0) {
            // Menüplan anpassen
            onMenuplanUpdate({
              ...menuplan,
              mealRecipes: {...menuplan.mealRecipes, ...updatedMealRecipes},
            });
          }
        }
      }
    } else {
      if (
        recipe.type == RecipeType.private &&
        recipeDrawerData.mealPlan.length > 0
      ) {
        // Fall beim privaten Rezept über den Menüplan der Namen
        // angepasst wurde, muss das hier übernommen werden.
        const updatedMealRecipes = {} as MealRecipes;
        recipeDrawerData.mealPlan.forEach((mealPlan) => {
          if (
            menuplan.mealRecipes[mealPlan.mealPlanRecipe].recipe.name !=
            recipe.name
          ) {
            updatedMealRecipes[mealPlan.mealPlanRecipe] =
              menuplan.mealRecipes[mealPlan.mealPlanRecipe];

            // Falls der Variantenname angepasst wurde, dies im Menüplan
            // entsprechen anpassen.
            updatedMealRecipes[mealPlan.mealPlanRecipe].recipe.name =
              recipe.name;
          }
        });
        if (Object.keys(updatedMealRecipes).length > 0) {
          // Menüplan anpassen
          onMenuplanUpdate({
            ...menuplan,
            mealRecipes: {...menuplan.mealRecipes, ...updatedMealRecipes},
          });
        }
      }
      // Privates Rezept
      // Anzeige umschiessen, falls gerade gespeichert wurde
      const editMode =
        !recipeDrawerData.recipe.uid && recipe.uid != ""
          ? false
          : recipeDrawerData.editMode;

      // angepasstes Rezept auch so anzeigen
      setRecipeDrawerData({
        ...recipeDrawerData,
        recipe: recipe,
        editMode: editMode,
      });
    }
    onRecipeUpdateSuper(recipe);
  };
  const onNewRecipe = () => {
    // Neues Rezept anlegen
    setRecipeDrawerData({
      ...RECIPE_DRAWER_DATA_INITIAL_VALUES,
      open: true,
      editMode: true,
    });
  };
  const onRecipeSwitchEditMode = () => {
    setRecipeDrawerData({
      ...recipeDrawerData,
      editMode: !recipeDrawerData.editMode,
    });
  };
  const onRecipeDelete = () => {
    // Rezepte auch aus dem Menüplan entfernen
    const updatedMealRecipes = {...menuplan.mealRecipes};

    delete updatedMealRecipes[recipeDrawerData.mealPlan[0].mealPlanRecipe];

    onMenuplanUpdate({mealRecipes: updatedMealRecipes});

    setRecipeDrawerData(RECIPE_DRAWER_DATA_INITIAL_VALUES);
  };
  /* ------------------------------------------
  // Material-Handling
  // ------------------------------------------ */
  const onAddMaterial = (menueUid: Menue["uid"]) => {
    setDialogGoodsData({
      open: true,
      menueUid: menueUid,
      goodsType: GoodsType.MATERIAL,
      product: null,
      material: null,
    });

    if (units.length == 0) {
      fetchMissingData({type: FetchMissingDataType.UNITS});
    }
    if (materials.length == 0) {
      fetchMissingData({type: FetchMissingDataType.MATERIALS});
    }
  };
  const onAddProduct = (menueUid: Menue["uid"]) => {
    setDialogGoodsData({
      open: true,
      menueUid: menueUid,
      goodsType: GoodsType.PRODUCT,
      product: null,
      material: null,
    });
    if (units.length == 0) {
      fetchMissingData({type: FetchMissingDataType.UNITS});
    }
    if (products.length == 0) {
      fetchMissingData({type: FetchMissingDataType.PRODUCTS});
    }
    if (departments.length == 0) {
      fetchMissingData({type: FetchMissingDataType.DEPARTMENTS});
    }
  };
  const onDialogGoodsCancel = () => {
    setDialogGoodsData(GOODS_DATA_DIALOG_INITIAL_DATA);
  };
  const onDialogGoodsOk = ({
    planMode,
    quantity,
    unit,
    product,
    material,
  }: OnAddGoodToMenuProps) => {
    const newMenues = {...menuplan.menues};

    let newMaterial: MenuplanMaterial | null = null;
    let newProduct: MenuplanProduct | null = null;

    if (dialogGoodsData.goodsType === GoodsType.MATERIAL && material) {
      dialogGoodsData.material
        ? (newMaterial = dialogGoodsData.material)
        : (newMaterial = Menuplan.createMaterial());

      newMaterial.quantity = quantity;
      newMaterial.unit = unit;
      newMaterial.materialName = material.name;
      newMaterial.materialUid = material.uid;
      newMaterial.planMode = planMode;
      newMaterial.plan = [];
    } else if (dialogGoodsData.goodsType === GoodsType.PRODUCT && product) {
      dialogGoodsData.product
        ? (newProduct = dialogGoodsData.product)
        : (newProduct = Menuplan.createProduct());

      newProduct.quantity = quantity;
      newProduct.unit = unit;
      newProduct.productName = product.name;
      newProduct.productUid = product.uid;
      newProduct.planMode = planMode;
    }

    if (planMode === GoodsPlanMode.TOTAL) {
      // Fixe Zuordnung der Menge
      if (
        dialogGoodsData.goodsType === GoodsType.MATERIAL &&
        newMaterial !== null
      ) {
        const newMaterials = {...menuplan.materials};
        newMaterial.planMode = GoodsPlanMode.TOTAL;
        newMaterial.totalQuantity = newMaterial.quantity;
        newMaterials[newMaterial.uid] = newMaterial;
        newMaterial.plan = [];
        !dialogGoodsData.material &&
          newMenues[dialogGoodsData.menueUid].materialOrder.push(
            newMaterial.uid
          );

        onMenuplanUpdateSuper({
          ...menuplan,
          menues: newMenues,
          materials: newMaterials,
        });
      } else if (
        dialogGoodsData.goodsType === GoodsType.PRODUCT &&
        newProduct !== null
      ) {
        const newProducts = {...menuplan.products};

        newProduct.planMode = GoodsPlanMode.TOTAL;
        newProduct.totalQuantity = newProduct.quantity;
        newProducts[newProduct.uid] = newProduct;
        newProduct.plan = [];
        !dialogGoodsData.product &&
          newMenues[dialogGoodsData.menueUid].productOrder.push(newProduct.uid);

        onMenuplanUpdateSuper({
          ...menuplan,
          menues: newMenues,
          products: newProducts,
        });
      }
    } else if (planMode === GoodsPlanMode.PER_PORTION) {
      let portionPlan: PortionPlan[] = [];

      if (dialogGoodsData.goodsType == GoodsType.PRODUCT) {
        dialogGoodsData.product?.plan
          ? (portionPlan = dialogGoodsData.product.plan)
          : (portionPlan = []);
      } else if (dialogGoodsData.goodsType == GoodsType.MATERIAL) {
        dialogGoodsData.material?.plan
          ? (portionPlan = dialogGoodsData.material.plan)
          : (portionPlan = []);
      }

      setDialogPlanPortionsData({
        open: true,
        menues: {[dialogGoodsData.menueUid]: true},
        mealRecipeUid: "",
        portionPlan: portionPlan,
        planedMaterial: newMaterial,
        planedProduct: newProduct,
        planedObject: PlanedObject.GOOD,
      });
    }
    setDialogGoodsData(GOODS_DATA_DIALOG_INITIAL_DATA);
  };
  /* ------------------------------------------
  // Dialog Menü-Einträge ändern
  // ------------------------------------------ */
  const onEditMenue = (menueUid: Menue["uid"]) => {
    // Dialog öffnen mit Stift / Deletebutton
    setDialogEditMenue({open: true, menueUid: menueUid});
  };
  const onCloseDialogEditMenue = () => {
    setDialogEditMenue({open: false, menueUid: ""});
  };
  const onEditMenueEditObject = ({
    objectType,
    uid,
  }: EditMenueObjectManipulation) => {
    switch (objectType) {
      case MenueEditTypes.NOTE:
        // Gibt es nicht....
        break;
      case MenueEditTypes.MEALRECIPE:
        // Portionen-Dialog hervorrufen
        onEditRecipeMealPlan(uid);
        break;
      case MenueEditTypes.PRODUCT:
        onEditProductPlan(uid);
        break;
      case MenueEditTypes.MATERIAL:
        onEditMaterialPlan(uid);

        break;
    }
  };
  const onEditMenueDeleteObject = ({
    objectType,
    uid,
  }: EditMenueObjectManipulation) => {
    const updatedNotes = {...menuplan.notes};
    const updatedMealRecipes = {...menuplan.mealRecipes};
    const updateProducts = {...menuplan.products};
    const updatedMaterials = {...menuplan.materials};
    const updatedMenues = {...menuplan.menues};
    let menue: Menue | undefined;
    switch (objectType) {
      case MenueEditTypes.NOTE:
        delete updatedNotes[uid];
        break;
      case MenueEditTypes.MEALRECIPE:
        menue = Menuplan.findMenueOfMealRecipe({
          mealRecipeUid: uid,
          menues: menuplan.menues,
        });
        if (menue) {
          delete updatedMealRecipes[uid];
          updatedMenues[menue?.uid].mealRecipeOrder = updatedMenues[
            menue?.uid
          ].mealRecipeOrder.filter((mealRecipe) => mealRecipe !== uid);
        }
        break;
      case MenueEditTypes.PRODUCT:
        menue = Menuplan.findMenueOfMealProduct({
          productUid: uid,
          menues: menuplan.menues,
        });
        if (menue) {
          delete updateProducts[uid];
          updatedMenues[menue?.uid].productOrder = updatedMenues[
            menue?.uid
          ].productOrder.filter((productUid) => productUid !== uid);
        }
        break;
      case MenueEditTypes.MATERIAL:
        menue = Menuplan.findMenueOfMealMaterial({
          materialUid: uid,
          menues: menuplan.menues,
        });
        if (menue) {
          delete updatedMaterials[uid];
          updatedMenues[menue?.uid].materialOrder = updatedMenues[
            menue?.uid
          ].materialOrder.filter((materialUid) => materialUid !== uid);
        }
        break;
    }
    onMenuplanUpdate({
      ...menuplan,
      notes: updatedNotes,
      menues: updatedMenues,
      mealRecipes: updatedMealRecipes,
      products: updateProducts,
      materials: updatedMaterials,
    });

    // Wenn alle Objekte in diesem Menü leer, Dialog gleich schliessen
    if (
      updatedMenues[dialogEditMenue.menueUid].materialOrder.length == 0 &&
      updatedMenues[dialogEditMenue.menueUid].mealRecipeOrder.length == 0 &&
      updatedMenues[dialogEditMenue.menueUid].productOrder.length == 0
    ) {
      setDialogEditMenue({open: false, menueUid: ""});
    }
  };
  const onMaterialCreate = (material: Material) => {
    onMasterdataCreate({
      type: MasterDataCreateType.MATERIAL,
      value: material,
    });
  };
  const onProductCreate = (product: Product) => {
    onMasterdataCreate({
      type: MasterDataCreateType.PRODUCT,
      value: product,
    });
  };
  /* ------------------------------------------
  // Dialog Menü-Auswahl Handling
  // ------------------------------------------ */
  const onDialogSelectMenueClose = () => {
    setDialogSelectMenueData({
      ...dialogSelectMenueData,
      open: false,
      // menues: {} as DialogSelectMenuesForRecipeDialogValues,
      // selectedRecipe: {} as RecipeShort,
    });
  };
  const onDialogSelectMenueContinue = (
    selectedMenues: DialogSelectMenuesForRecipeDialogValues
  ) => {
    setDialogPlanPortionsData({
      open: true,
      menues: selectedMenues,
      mealRecipeUid: "",
      portionPlan: [],
      planedMaterial: null,
      planedProduct: null,
      planedObject: PlanedObject.RECIPE,
    });
    setDialogSelectMenueData({
      ...dialogSelectMenueData,
      open: false,
      menues: {} as DialogSelectMenuesForRecipeDialogValues,
      // selectedRecipe: {} as RecipeShort,
    });
  };
  /* ------------------------------------------
  // Dialog Zuordnung der Gruppen-Konfig Handling
  // ------------------------------------------ */
  const onDialogPlanPortionsBack = () => {
    setDialogPlanPortionsData({
      ...dialogPlanPortionsData,
      open: false,
      menues: null,
    });
    setDialogSelectMenueData({
      ...dialogSelectMenueData,
      open: true,
      menues:
        dialogPlanPortionsData.menues as DialogSelectMenuesForRecipeDialogValues,
    });
  };
  const onDialogPlanPortionsClose = () => {
    setDialogPlanPortionsData({
      open: false,
      menues: {} as DialogSelectMenuesForRecipeDialogValues,
      mealRecipeUid: "",
      portionPlan: [],
      planedMaterial: null,
      planedProduct: null,
      planedObject: PlanedObject.RECIPE,
    });
  };
  const onDialogPlanPortionsAdd = (plan: {
    [key: Menue["uid"]]: DialogPlanPortionsMealPlanning;
  }) => {
    const updatedMenues = {...menuplan.menues};
    const updatedMealRecipes = {...menuplan.mealRecipes};
    const updatedMaterials = {...menuplan.materials};
    const updatedProducts = {...menuplan.products};

    if (dialogPlanPortionsData.planedObject == PlanedObject.RECIPE) {
      // Rezept
      if (
        dialogPlanPortionsData.portionPlan.length == 0 &&
        dialogPlanPortionsData.mealRecipeUid == ""
      ) {
        // Neuer Eintrag
        Object.keys(plan).forEach((menuUid) => {
          const mealRecipe = Menuplan.createMealRecipe({
            recipe: dialogSelectMenueData.selectedRecipe,
            plan: plan[menuUid],
          });
          updatedMealRecipes[mealRecipe.uid] = mealRecipe;
          updatedMenues[menuUid].mealRecipeOrder.push(mealRecipe.uid);
        });
      } else {
        // Eintrag wird geändert
        Object.values(plan).forEach((planOfMealRecipe) => {
          updatedMealRecipes[dialogPlanPortionsData.mealRecipeUid].plan =
            Object.keys(planOfMealRecipe).map((key) => {
              return {
                diet: planOfMealRecipe[key].diet,
                intolerance: key,
                factor: parseFloat(planOfMealRecipe[key].factor),
                totalPortions: planOfMealRecipe[key].total,
              };
            });
          updatedMealRecipes[
            dialogPlanPortionsData.mealRecipeUid
          ].totalPortions = updatedMealRecipes[
            dialogPlanPortionsData.mealRecipeUid
          ].plan.reduce((runningSum, intolerance) => {
            runningSum = runningSum + intolerance.totalPortions;
            return runningSum;
          }, 0);
        });
      }
    } else if (
      dialogPlanPortionsData.planedObject == PlanedObject.GOOD &&
      dialogPlanPortionsData.planedProduct !== null
    ) {
      // Plan umbiegen
      Object.keys(plan).forEach((menueUid) => {
        const newProduct = Menuplan.addPlanToGood<MenuplanProduct>({
          // plan muss rausgelöscht werden, sonst wird dieser verdoppelt
          good: {...dialogPlanPortionsData.planedProduct!, plan: []},
          plan: plan[menueUid],
        });
        // Neue Totalmenge berechnen
        newProduct.totalQuantity =
          newProduct.quantity * newProduct.totalQuantity;
        updatedProducts[newProduct.uid] = newProduct;
        if (!updatedMenues[menueUid].productOrder.includes(newProduct.uid)) {
          // Nur hinzufügen, wenn nicht bereits drin. Sonst reicht ein Update
          updatedMenues[menueUid].productOrder.push(newProduct.uid);
        }
      });
    } else if (
      dialogPlanPortionsData.planedObject == PlanedObject.GOOD &&
      dialogPlanPortionsData.planedMaterial !== null
    ) {
      // Plan umbiegen
      Object.keys(plan).forEach((menueUid) => {
        const newMaterial = Menuplan.addPlanToGood<MenuplanMaterial>({
          good: {...dialogPlanPortionsData.planedMaterial!, plan: []},
          plan: plan[menueUid],
        });
        // Neue Totalmenge berechnen
        newMaterial.totalQuantity =
          newMaterial.quantity * newMaterial.totalQuantity;
        updatedMaterials[newMaterial.uid] = newMaterial;
        if (!updatedMenues[menueUid].materialOrder.includes(newMaterial.uid)) {
          updatedMenues[menueUid].materialOrder.push(newMaterial.uid);
        }
      });
    }

    onMenuplanUpdate({
      menues: updatedMenues,
      mealRecipes: updatedMealRecipes,
      products: updatedProducts,
      materials: updatedMaterials,
    });
    setDialogPlanPortionsData({
      open: false,
      menues: null,
      mealRecipeUid: "",
      portionPlan: [],
      planedMaterial: null,
      planedProduct: null,
      planedObject: PlanedObject.RECIPE,
    });
    setDialogSelectMenueData({
      open: false,
      menues: {} as DialogSelectMenuesForRecipeDialogValues,
      selectedRecipe: {} as RecipeShort,
    });

    setRecipeDrawerData(RECIPE_DRAWER_DATA_INITIAL_VALUES);
    setRecipeSearchDrawerData({
      open: false,
      isLoadingData: false,
      menue: null,
    });
  };
  /* ------------------------------------------
  // MenuCard-Handling
  // ------------------------------------------ */
  const onMealRecipeOpen = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const [, , mealRecipeUid] = event.currentTarget.id.split("_");
    let loadingData = false;
    const mealPlan: Array<PlanedMealsRecipe> = [];

    let recipe = new Recipe();
    recipe.uid = menuplan.mealRecipes[mealRecipeUid].recipe.recipeUid;
    recipe.name = menuplan.mealRecipes[mealRecipeUid].recipe.name;

    Object.values(menuplan.mealRecipes).forEach((mealRecipe) => {
      let meal: Meal | undefined;
      let menue: Menue | undefined;
      if (mealRecipe.recipe.recipeUid == recipe.uid) {
        // Menü suchen, in dem das Rezept eingefügt wurde
        menue = Object.values(menuplan.menues).find((menue) =>
          menue.mealRecipeOrder.includes(mealRecipe.uid)
        );
        if (menue != undefined) {
          // Die Mahlzeit suchen, in der das Menü ist
          meal = Object.values(menuplan.meals).find((meal) =>
            meal.menuOrder.includes(menue!.uid!)
          );
        }
        if (meal != undefined && menue != undefined) {
          mealPlan.push({
            mealPlanRecipe: mealRecipe.uid,
            menue: {...menue},
            meal: {
              ...meal,
              mealType: menuplan.mealTypes.entries[meal.mealType].uid,
              mealTypeName: menuplan.mealTypes.entries[meal.mealType].name,
            },
            mealPlan: mealRecipe.plan,
          });
        }
      }
    });

    // Sortiere das Array nach dem Datum (aufsteigend) und dann nach der Zahl (absteigend)
    mealPlan.sort((a, b) => {
      if (a.meal.date < b.meal.date) {
        return -1;
      } else if (a.meal.date > b.meal.date) {
        return 1;
      } else {
        // Anhand des Index der Mahlzeit bestimmen
        return (
          menuplan.mealTypes.order.indexOf(a.meal.mealType) -
          menuplan.mealTypes.order.indexOf(b.meal.mealType)
        );
      }
    });

    if (Object.prototype.hasOwnProperty.call(recipes, recipe.uid)) {
      recipe = recipes[recipe.uid] as Recipe;
    } else {
      // Rezept noch nicht vorhanden --> holen
      fetchMissingData({
        type: FetchMissingDataType.RECIPE,
        recipeShort: {
          uid: recipe.uid,
          name: recipe.name,
          type: menuplan.mealRecipes[mealRecipeUid].recipe.type,
          created: {
            fromUid: menuplan.mealRecipes[mealRecipeUid].recipe.createdFromUid,
          },
        } as RecipeShort,
      });
      loadingData = true;
    }
    // Drawer mit dem Rezept öffnen
    setRecipeDrawerData({
      ...recipeDrawerData,
      open: true,
      isLoadingData: loadingData,
      recipe: recipe,
      mealPlan: mealPlan,
      scaledPortions: menuplan.mealRecipes[mealRecipeUid].plan.reduce(
        (runningSum, portion) => runningSum + portion.totalPortions,
        0
      ),
    });
  };
  /* ------------------------------------------
  // Handling Einplanung
  // ------------------------------------------ */
  const onEditRecipeMealPlan = (mealRecipeUid: MealRecipe["uid"]) => {
    const menue = Menuplan.findMenueOfMealRecipe({
      mealRecipeUid: mealRecipeUid,
      menues: menuplan.menues,
    });
    if (!menue) {
      return;
    }
    // Dialog für Portionen aufrufen
    setDialogPlanPortionsData({
      open: true,
      menues: {[menue.uid]: true},
      mealRecipeUid: mealRecipeUid,
      portionPlan: menuplan.mealRecipes[mealRecipeUid].plan,
      planedMaterial: null,
      planedProduct: null,
      planedObject: PlanedObject.RECIPE,
    });
    //   // Falls keine Einplanung vorhandne ist (bspw. durch Löschung einer Diät/Intoleran),
    //   // wird gleich vorgegangen, wie wenn ein Rezept neu eingeplannt wird (wobei) die Tage
    //   // bereits bestimmt sind.
    //   setDialogSelectMenueData({
    //     ...dialogSelectMenueData,
    //     selectedRecipe: {
    //       uid: menuplan.mealRecipes[mealRecipeUid].recipe.recipeUid,
    //       name: menuplan.mealRecipes[mealRecipeUid].recipe.name,
    //       type: menuplan.mealRecipes[mealRecipeUid].recipe.type,
    //       created: {
    //         date: new Date(),
    //         fromUid: menuplan.mealRecipes[mealRecipeUid].recipe.createdFromUid,
    //         fromDisplayName: "",
    //       },
    //     } as RecipeShort,
    //   });
  };
  const onEditProductPlan = (productUid: MenuplanProduct["uid"]) => {
    const menue = Menuplan.findMenueOfMealProduct({
      productUid: productUid,
      menues: menuplan.menues,
    });
    if (!menue) {
      return;
    }
    if (units.length == 0) {
      fetchMissingData({type: FetchMissingDataType.UNITS});
    }
    if (products.length == 0) {
      fetchMissingData({type: FetchMissingDataType.PRODUCTS});
    }
    if (departments.length == 0) {
      fetchMissingData({type: FetchMissingDataType.DEPARTMENTS});
    }
    // Dialog für fixe Menge öffnen
    setDialogGoodsData({
      open: true,
      menueUid: menue.uid,
      goodsType: GoodsType.PRODUCT,
      product: menuplan.products[productUid],
      material: null,
    });
  };
  const onEditMaterialPlan = (materialUid: MenuplanProduct["uid"]) => {
    const menue = Menuplan.findMenueOfMealMaterial({
      materialUid: materialUid,
      menues: menuplan.menues,
    });
    if (!menue) {
      return;
    }
    if (units.length == 0) {
      fetchMissingData({type: FetchMissingDataType.UNITS});
    }
    if (materials.length == 0) {
      fetchMissingData({type: FetchMissingDataType.MATERIALS});
    }
    // Dialog für fixe Menge öffnen
    setDialogGoodsData({
      open: true,
      menueUid: menue.uid,
      goodsType: GoodsType.MATERIAL,
      product: null,
      material: menuplan.materials[materialUid],
    });
  };

  if (
    new Set(menuplan.mealTypes.order).size !== menuplan.mealTypes.order.length
  ) {
    console.warn("Doppelte MealTypes: ", menuplan.mealTypes.order);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="mealTypes"
          type={DragDropTypes.MEALTYPE}
          key={"droppable_MealRow"}
        >
          {(provided, snapshot) => (
            <Container
              key={"container_menuplan_rows"}
              innerRef={provided.innerRef}
              {...provided.droppableProps}
              className={
                snapshot.isDraggingOver
                  ? classes.mealRowOnDrop
                  : classes.mealRowNoDrop
              }
              style={{display: "flex", flexDirection: "column"}}
            >
              <MenuplanHeaderRow
                dates={menuplan.dates}
                notes={menuplan.notes}
                menuplanSettings={menuplanSettings}
                onSwitchShowDetails={onSwitchShowDetails}
                onMealTypeUpdate={onMealTypeUpdate}
                onNoteUpdate={onNoteUpdate}
                onPrint={onPrint}
              />
              {/* <Container
                key={"container_mealtype_rows"}
                innerRef={provided.innerRef}
                {...provided.droppableProps}
                className={
                  snapshot.isDraggingOver
                    ? classes.mealRowOnDrop
                    : classes.mealRowNoDrop
                }
                // style={{flexGrow: 1}}
              > */}
              {menuplan.mealTypes.order.map((mealTypeUid, index) => (
                <Draggable
                  draggableId={mealTypeUid}
                  index={index}
                  key={"draggableMealTypRow_" + mealTypeUid}
                  isDragDisabled={menuplan.mealTypes.order.length <= 1}
                >
                  {(provided, snapshot) => {
                    return (
                      <MealTypeRow
                        key={"mealTypeRow_" + mealTypeUid}
                        mealType={menuplan.mealTypes.entries[mealTypeUid]}
                        dates={menuplan.dates}
                        meals={menuplan.meals}
                        menues={menuplan.menues}
                        notes={menuplan.notes}
                        products={menuplan.products}
                        materials={menuplan.materials}
                        mealRecipes={menuplan.mealRecipes}
                        menuplanSettings={menuplanSettings}
                        groupConfiguration={groupConfiguration}
                        draggableProvided={provided}
                        draggableSnapshot={snapshot}
                        onMealTypeUpdate={onMealTypeUpdate}
                        onMenuplanUpdate={onMenuplanUpdate}
                        fetchMissingData={fetchMissingData}
                        onAddRecipe={onAddRecipe}
                        onAddProduct={onAddProduct}
                        onAddMaterial={onAddMaterial}
                        onEditMenue={onEditMenue}
                        onMealRecipeOpen={onMealRecipeOpen}
                        onMealProductOpen={onEditProductPlan}
                        onMealMaterialOpen={onEditMaterialPlan}
                        onNoteUpdate={onNoteUpdate}
                      />
                    );
                  }}
                </Draggable>
              ))}
              {provided.placeholder}
              {/* </Container> */}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
      {/* Rezept-Übersicht Drawer */}
      <RecipeSearchDrawer
        drawerSettings={recipeSearchDrawerData}
        recipes={recipeList}
        onClose={onRecipeSearchDrawerClose}
        onRecipeCardClick={onRecipeCardClick}
        onRecipeSelection={onRecipeSelection}
        onNewRecipe={onNewRecipe}
        authUser={authUser}
      />
      {/* Rezept-Drawer */}
      <RecipeDrawer
        drawerSettings={recipeDrawerData}
        recipe={recipeDrawerData.recipe}
        mealPlan={recipeDrawerData.mealPlan}
        groupConfiguration={groupConfiguration}
        scaledPortions={recipeDrawerData.scaledPortions}
        editMode={recipeDrawerData.editMode}
        firebase={firebase}
        authUser={authUser}
        onClose={onRecipeDrawerClose}
        onAddToEvent={onRecipeSelection}
        onEditRecipeMealPlan={onEditRecipeMealPlan}
        onRecipeUpdate={onRecipeUpdate}
        onSwitchEditMode={onRecipeSwitchEditMode}
        onRecipeDelete={onRecipeDelete}
      />
      {/* Dialog Menüwahl */}
      <DialogSelectMenues
        open={dialogSelectMenueData.open}
        title={TEXT_DIALOG_CHOOSE_MENUES_TITLE}
        dates={menuplan.dates}
        mealTypes={menuplan.mealTypes}
        meals={menuplan.meals}
        menues={menuplan.menues}
        preSelectedMenue={dialogSelectMenueData.menues}
        onClose={onDialogSelectMenueClose}
        onConfirm={onDialogSelectMenueContinue}
      />
      {/* Dialog Portionenauswahl */}
      <DialogPlanPortions
        open={dialogPlanPortionsData.open}
        selectedMenues={dialogPlanPortionsData.menues}
        meals={menuplan.meals}
        menues={menuplan.menues}
        mealTypes={menuplan.mealTypes}
        groupConfiguration={groupConfiguration}
        planedMealRecipe={dialogPlanPortionsData.portionPlan}
        planedObject={dialogPlanPortionsData.planedObject}
        onBackClick={onDialogPlanPortionsBack}
        onCancelClick={onDialogPlanPortionsClose}
        onAddClick={onDialogPlanPortionsAdd}
      />
      {/* Dialog Menüeinträge ändern */}
      <DialogEditMenue
        open={dialogEditMenue.open}
        menue={menuplan.menues[dialogEditMenue.menueUid]}
        note={Object.values(menuplan.notes).find(
          (note) => note.menueUid == dialogEditMenue.menueUid
        )}
        mealRecipes={menuplan.mealRecipes}
        products={menuplan.products}
        materials={menuplan.materials}
        groupConfiguration={groupConfiguration}
        onCloseDialog={onCloseDialogEditMenue}
        onEditObject={onEditMenueEditObject}
        onDeleteObject={onEditMenueDeleteObject}
      />
      <DialogGoods
        open={dialogGoodsData.open}
        goodsType={dialogGoodsData.goodsType}
        units={units}
        products={products}
        materials={materials}
        departments={departments}
        productToUpdate={dialogGoodsData.product}
        materialToUpdate={dialogGoodsData.material}
        firebase={firebase}
        authUser={authUser}
        onCancel={onDialogGoodsCancel}
        onOk={onDialogGoodsOk}
        onMaterialCreate={onMaterialCreate}
        onProductCreate={onProductCreate}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ========================= Tag-Überschriften =======================
// =================================================================== */
interface MenuplanHeaderRowProps {
  dates: Menuplan["dates"];
  notes: Menuplan["notes"];
  menuplanSettings: MenuplanSettings;
  onSwitchShowDetails: () => void;
  onMealTypeUpdate: ({action, mealType}: OnMealTypeUpdate) => void;
  onNoteUpdate: ({action, note}: OnNoteUpdate) => void;
  onPrint: () => void;
}

interface DaysRowContextMenuState {
  date: string;
  note: Note | undefined;
}
const CONTEXT_MENU_INITIAL_STATE: DaysRowContextMenuState = {
  date: "",
  note: undefined,
};
const MenuplanHeaderRow = ({
  dates,
  notes,
  menuplanSettings,
  onSwitchShowDetails,
  onMealTypeUpdate,
  onNoteUpdate,
  onPrint,
}: MenuplanHeaderRowProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const {customDialog} = useCustomDialog();
  const [contextMenuAnchorElement, setContextMenuAnchorElement] =
    React.useState<HTMLElement | null>(null);

  const [contextMenuState, setContextMenuState] =
    React.useState<DaysRowContextMenuState>(CONTEXT_MENU_INITIAL_STATE);
  /* ------------------------------------------
  // Button-Handling
  // ------------------------------------------ */
  const onAddMeal = async () => {
    let userInput = {valid: false, input: ""} as SingleTextInputResult;

    userInput = (await customDialog({
      dialogType: DialogType.SingleTextInput,
      title: `${TEXT_MEAL} ${TEXT_ADD} `,
      singleTextInputProperties: {
        initialValue: "",
        textInputLabel: TEXT_MEAL,
      },
    })) as SingleTextInputResult;

    if (userInput?.valid && userInput.input != "") {
      const newMealType = Menuplan.createMealType({
        newMealName: userInput.input,
      });
      onMealTypeUpdate({action: Action.ADD, mealType: newMealType});
    }
  };
  /* ------------------------------------------
  // Kontext-Menü
  // ------------------------------------------ */
  const onContextMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    const selectedDate = Utils.dateAsString(
      new Date(event.currentTarget.id.split("_")[1])
    );

    setContextMenuAnchorElement(event.currentTarget);
    setContextMenuState({
      date: selectedDate,
      note: Object.values(notes).find((note) => note.date == selectedDate),
    });
  };
  const closeContextMenu = () => {
    setContextMenuAnchorElement(null);
    setContextMenuState(CONTEXT_MENU_INITIAL_STATE);
  };
  const onDeleteNote = () => {
    if (!contextMenuState.note) {
      return;
    }
    onNoteUpdate({
      action: Action.DELETE,
      note: contextMenuState.note,
    });
    setContextMenuState(CONTEXT_MENU_INITIAL_STATE);
    setContextMenuAnchorElement(null);
  };
  const onModifyNote = async () => {
    // Input holen
    const userInput = (await customDialog({
      dialogType: DialogType.SingleTextInput,
      title: `${TEXT_NOTE} ${
        contextMenuState.note?.text ? TEXT_EDIT : TEXT_ADD
      }`,
      text: "",
      singleTextInputProperties: {
        initialValue: contextMenuState.note?.text
          ? contextMenuState.note.text
          : "",
        textInputLabel: TEXT_NOTE,
      },
    })) as SingleTextInputResult;

    if (userInput?.valid && userInput.input != "") {
      // Notiz anlegen resp. ändern
      let note: Note;
      if (!contextMenuState.note?.uid) {
        note = Menuplan.createEmptyNote();
        note.date = contextMenuState.date as string;
      } else {
        note = contextMenuState.note;
      }
      note.text = userInput.input;

      onNoteUpdate({
        action: contextMenuState.note?.uid ? Action.EDIT : Action.ADD,
        note: note,
      });
    }
    setContextMenuState(CONTEXT_MENU_INITIAL_STATE);
    setContextMenuAnchorElement(null);
  };
  return (
    <div
      className={classes.menuplanRow}
      // style={{display: "flex", flexDirection: "row"}}
    >
      <Container
        className={classes.menuplanItem}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexWrap: "nowrap",
          justifyContent: "center",
          padding: theme.spacing(1),
          paddingBottom: theme.spacing(2),
        }}
      >
        <FormGroup style={{marginBottom: "1em"}}>
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={menuplanSettings.showDetails}
                onChange={onSwitchShowDetails}
              />
            }
            label={TEXT_SHOW_DETAILS}
          />
        </FormGroup>
        <Button
          color="primary"
          onClick={onAddMeal}
          variant="outlined"
          size="small"
          style={{marginBottom: "1em"}}
        >
          {TEXT_ADD_MEAL}
        </Button>
        <Button
          color="primary"
          onClick={onPrint}
          size="small"
          variant="outlined"
        >
          {TEXT_PRINTVERSION}
        </Button>
      </Container>

      {dates.map((date) => {
        const note = Object.values(notes).find(
          (note) => note.date == Utils.dateAsString(date) && note.menueUid == ""
        );
        return (
          <Container
            className={classes.menuplanItem}
            key={"dayCardContainer_" + date}
            style={{
              display: "flex",
              padding: theme.spacing(1),
              paddingBottom: theme.spacing(2),
            }}
          >
            <Card
              key={"date_card_" + date}
              className={classes.cardDate}
              style={{width: "100%"}}
              variant="outlined"
            >
              <CardHeader
                key={"date_cardHeader_" + date}
                align="center"
                action={
                  <IconButton
                    id={"MoreBtn_" + date}
                    aria-label="settings"
                    onClick={onContextMenuClick}
                  >
                    <MoreVertIcon />
                  </IconButton>
                }
                title={date.toLocaleString("default", {weekday: "long"})}
                titleTypographyProps={{variant: "h6"}}
                subheader={date.toLocaleString("de-CH", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              />
              {note && (
                <CardContent>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                  >
                    <em>{note.text}</em>
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Container>
        );
      })}

      <Menu
        open={Boolean(contextMenuAnchorElement)}
        keepMounted
        anchorEl={contextMenuAnchorElement}
        onClose={closeContextMenu}
      >
        {/* Entweder ist es leer --> dann nur hinzufügen --> sonst ändern und löschen*/}
        <MenuItem onClick={onModifyNote}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {`${TEXT_NOTE} ${contextMenuState.note ? TEXT_EDIT : TEXT_ADD}`}
          </Typography>
        </MenuItem>

        {contextMenuState.note && (
          <MenuItem onClick={onDeleteNote}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>
              {`${TEXT_NOTE} ${TEXT_DELETE}`}
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};
/* ===================================================================
// ========================== Mahlzeit-Reihe =========================
// =================================================================== */
interface MealTypeRowProps {
  mealType: MealType;
  dates: Menuplan["dates"];
  meals: Menuplan["meals"];
  menues: Menuplan["menues"];
  notes: Menuplan["notes"];
  products: Menuplan["products"];
  materials: Menuplan["materials"];
  mealRecipes: Menuplan["mealRecipes"];
  menuplanSettings: MenuplanSettings;
  groupConfiguration: EventGroupConfiguration;
  draggableProvided: DraggableProvided;
  draggableSnapshot: DraggableStateSnapshot;
  onMealTypeUpdate: ({action, mealType}: OnMealTypeUpdate) => void;
  onMenuplanUpdate: (updatedValues: onMenuplanUpdate) => void;
  fetchMissingData: ({type, recipeShort}: FetchMissingDataProps) => void;
  onAddRecipe: (menue: Menue) => void;
  onEditMenue: (menueUid: Menue["uid"]) => void;
  onAddProduct: (menueUid: Menue["uid"]) => void;
  onAddMaterial: (menueUid: Menue["uid"]) => void;
  onMealRecipeOpen: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  onMealProductOpen: (uid: MenuplanProduct["uid"]) => void;
  onMealMaterialOpen: (uid: MenuplanMaterial["uid"]) => void;
  onNoteUpdate: ({action, note}: OnNoteUpdate) => void;
}
const MealTypeRow = ({
  mealType,
  dates,
  meals,
  menues,
  notes,
  products,
  materials,
  mealRecipes,
  menuplanSettings,
  draggableProvided,
  groupConfiguration,
  onMealTypeUpdate,
  onMenuplanUpdate,
  fetchMissingData,
  onAddRecipe,
  onAddProduct,
  onAddMaterial,
  onEditMenue,
  onMealRecipeOpen,
  onMealProductOpen,
  onMealMaterialOpen,
  onNoteUpdate,
}: MealTypeRowProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const {customDialog} = useCustomDialog();

  /* ------------------------------------------
  // Menü-Handling
  // ------------------------------------------ */
  const onCreateMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newMenu = Menuplan.createMenu();
    const mealsToUpdate = {...meals};
    const mealToUpdate = Object.values(mealsToUpdate).find(
      (meal) => meal.uid == event.currentTarget.id.split("_")[1]
    );
    const menuesToUpdate = {...menues};

    if (!mealToUpdate || !menuesToUpdate) {
      return;
    }
    mealToUpdate.menuOrder.push(newMenu.uid);
    menuesToUpdate[newMenu.uid] = newMenu;

    onMenuplanUpdate({
      meals: {...meals, [mealToUpdate.uid]: mealToUpdate},
      menues: menuesToUpdate,
    });
  };
  const onUpdateMenue = (menue: Menue) => {
    onMenuplanUpdate({
      menues: {...menues, [menue.uid]: menue},
    });
  };
  const onDeleteMenue = async (menueUid: Menue["uid"]) => {
    // Alle Rezepte, Produkte, Materialien entfernen,
    // die in diesem Menü sind

    const isConfirmed = await customDialog({
      dialogType: DialogType.Confirm,
      text: TEXT_ALL_RECIPES_AND_VALUES_WILL_BE_DELETED,
      title: `⚠️  ${TEXT_ATTENTION}`,
      buttonTextConfirm: TEXT_DELETE,
    });
    if (!isConfirmed) {
      return;
    }

    const updatedMealRecipes = {...mealRecipes};
    const updatedMenues = {...menues};
    const updatedMeals = {...meals};
    const updateProducts = {...products};
    const updateMaterials = {...materials};
    //
    menues[menueUid].mealRecipeOrder.forEach(
      (recipeUid) => delete updatedMealRecipes[recipeUid]
    );
    menues[menueUid].productOrder.forEach(
      (productUid) => delete updateProducts[productUid]
    );
    menues[menueUid].materialOrder.forEach(
      (materialUid) => delete updateMaterials[materialUid]
    );
    delete updatedMenues[menueUid];

    Object.values(updatedMeals).forEach((meal) => {
      if (meal.menuOrder.includes(menueUid)) {
        meal.menuOrder = meal.menuOrder.filter(
          (mealMenuUid) => mealMenuUid != menueUid
        );
      }
    });

    onMenuplanUpdate({
      menues: updatedMenues,
      mealRecipes: updatedMealRecipes,
      meals: updatedMeals,
      products: updateProducts,
      materials: updateMaterials,
    });
  };
  return (
    <div
      key={"mealtype_row_container_" + mealType.uid}
      id={"mealtype_row_container_" + mealType.uid}
      ref={draggableProvided.innerRef}
      {...draggableProvided.draggableProps}
      {...draggableProvided.dragHandleProps}
      className={
        classes.menuplanRow
        // draggableSnapshot.isDragging
        //   ? classes.menuplanRowOnDrag
        //   : classes.menuplanRowNoDrag
      }
    >
      <Container
        className={classes.menuplanItem}
        style={{
          display: "flex",
          padding: theme.spacing(1),
          paddingBottom: theme.spacing(2),
        }}
      >
        <MealTypeCard
          mealType={mealType}
          onMealTypeUpdate={onMealTypeUpdate}
          draggableProvided={draggableProvided}
        />
      </Container>
      {dates.map((date) => {
        let actualMeal = {} as Meal;
        Object.values(meals).forEach((meal) => {
          if (
            meal.mealType == mealType.uid &&
            meal.date == Utils.dateAsString(date)
          ) {
            actualMeal = meal;
          }
        });
        return (
          <Droppable
            droppableId={actualMeal.uid}
            type={DragDropTypes.MENU}
            key={"droppable_meal_" + actualMeal.uid}
          >
            {(provided) => (
              <Container
                className={classes.menuplanItem}
                style={{
                  display: "flex",
                  padding: theme.spacing(1),
                  paddingBottom: theme.spacing(2),
                  flexDirection: "column",
                }}
                key={
                  "mealCardContainer_" +
                  Utils.dateAsString(date) +
                  "_" +
                  mealType.uid
                }
                innerRef={provided.innerRef}
                {...provided.droppableProps}
              >
                {actualMeal.menuOrder?.length > 0 ? (
                  actualMeal.menuOrder.map((menueUid, index) => (
                    <Draggable
                      draggableId={menueUid}
                      index={index}
                      key={"draggableMeal_" + menueUid}
                    >
                      {(provided) => (
                        <MenueCard
                          menue={menues[menueUid]}
                          notes={notes}
                          mealRecipes={mealRecipes}
                          draggableProvided={provided}
                          menuplanSettings={menuplanSettings}
                          groupConfiguration={groupConfiguration}
                          products={products}
                          materials={materials}
                          onUpdateMenue={onUpdateMenue}
                          onDeleteMenue={onDeleteMenue}
                          fetchMissingData={fetchMissingData}
                          onAddRecipe={onAddRecipe}
                          onAddProduct={onAddProduct}
                          onAddMaterial={onAddMaterial}
                          onEditMenue={onEditMenue}
                          onMealRecipeOpen={onMealRecipeOpen}
                          onMealProductOpen={onMealProductOpen}
                          onMealMaterialOpen={onMealMaterialOpen}
                          onNoteUpdate={onNoteUpdate}
                        />
                      )}
                    </Draggable>
                  ))
                ) : (
                  // Kein Menü vorhanden - MenuCard erstellen.....
                  <Container
                    className={classes.emptyMealBox}
                    style={{display: "flex"}}
                  >
                    <Container
                      className={classes.centerCenter}
                      style={{display: "flex"}}
                    >
                      <Button
                        id={"onCreateMenu_" + actualMeal.uid}
                        onClick={onCreateMenu}
                      >
                        {TEXT_NEW_MENU}
                      </Button>
                    </Container>
                  </Container>
                )}
                {provided.placeholder}
              </Container>
            )}
          </Droppable>
        );
      })}
    </div>
  );
};
/* ===================================================================
// ======================== Mahlzeit-Typ-Karte =======================
// =================================================================== */
interface OnMealTypeUpdate {
  action: Action;
  mealType: MealType;
}
interface OnNoteUpdate {
  action: Action;
  note: Note;
}
interface MealTypeCardProps {
  mealType: MealType;
  onMealTypeUpdate: ({action, mealType}: OnMealTypeUpdate) => void;
  draggableProvided: DraggableProvided;
}
// interface MealTypeContextMenuState {
//   mealType: MealType;
// }
// const MEAL_TYPE_CONTEXT_MENU_INITIAL_STATE: MealTypeContextMenuState = {
//   mealType: { uid: "", name: "" },
// };
const MealTypeCard = ({
  mealType,
  draggableProvided,
  onMealTypeUpdate,
}: MealTypeCardProps) => {
  const classes = useStyles();
  const {customDialog} = useCustomDialog();
  const [contextMenuAnchorElement, setContextMenuAnchorElement] =
    React.useState<HTMLElement | null>(null);
  /* ------------------------------------------
  // Kontexmenü
  // ------------------------------------------ */
  const onContextMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setContextMenuAnchorElement(event.currentTarget);
  };
  const closeContextMenu = () => {
    setContextMenuAnchorElement(null);
  };
  /* ------------------------------------------
  // Kontexmenü-Handler
  // ------------------------------------------ */
  const onRenameItem = async () => {
    let userInput = {valid: false, input: ""} as SingleTextInputResult;

    userInput = (await customDialog({
      dialogType: DialogType.SingleTextInput,
      title: `${TEXT_MEAL} ${TEXT_EDIT} `,
      text: "",
      singleTextInputProperties: {
        initialValue: mealType.name,
        textInputLabel: TEXT_MEAL,
      },
    })) as SingleTextInputResult;

    if (userInput?.valid && userInput.input != "") {
      onMealTypeUpdate({
        action: Action.EDIT,
        mealType: {...mealType, name: userInput.input},
      });
    }
    setContextMenuAnchorElement(null);
  };
  const onDeleteItem = () => {
    onMealTypeUpdate({
      action: Action.DELETE,
      mealType: mealType,
    });
    setContextMenuAnchorElement(null);
    // setContextMenuState(MEAL_TYPE_CONTEXT_MENU_INITIAL_STATE);
  };
  return (
    <React.Fragment>
      <Card
        key={"mealtype_card_" + mealType.uid}
        className={classes.cardMealType}
        // style={{ width: "100%" }}
        variant="outlined"
        {...draggableProvided.dragHandleProps}
        // innerRef={draggableProvided.innerRef}
      >
        <CardHeader
          key={"mealtype_cardHeader_" + mealType.uid}
          action={
            <IconButton
              id={"MoreBtn_" + mealType.uid}
              aria-label="settings"
              onClick={onContextMenuClick}
            >
              <MoreVertIcon />
            </IconButton>
          }
          title={mealType.name}
          titleTypographyProps={{variant: "h6"}}
        />
      </Card>
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
        <MenuItem onClick={onDeleteItem}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {TEXT_DELETE}
          </Typography>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================ Menü-Karte ===========================
// =================================================================== */
interface MenuCardProps {
  menue: Menue;
  notes: Menuplan["notes"];
  // recipeList: RecipeShort[];
  mealRecipes: Menuplan["mealRecipes"];
  draggableProvided: DraggableProvided;
  menuplanSettings: MenuplanSettings;
  groupConfiguration: EventGroupConfiguration;
  products: Menuplan["products"];
  materials: Menuplan["materials"];
  onUpdateMenue: (menue: Menue) => void;
  onDeleteMenue: (menueUid: Menue["uid"]) => void;
  fetchMissingData: ({type, recipeShort}: FetchMissingDataProps) => void;
  onAddRecipe: (menue: Menue) => void;
  onAddProduct: (menueUid: Menue["uid"]) => void;
  onAddMaterial: (menueUid: Menue["uid"]) => void;
  onEditMenue: (menueUid: Menue["uid"]) => void;
  onMealRecipeOpen: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  onMealProductOpen: (uid: MenuplanProduct["uid"]) => void;
  onMealMaterialOpen: (uid: MenuplanMaterial["uid"]) => void;
  onNoteUpdate: ({action, note}: OnNoteUpdate) => void;
}
const MenueCard = ({
  menue,
  notes,
  mealRecipes,
  menuplanSettings,
  draggableProvided,
  groupConfiguration,
  products,
  materials,
  onUpdateMenue,
  onDeleteMenue: onDeleteMenueSuper,
  onMealRecipeOpen,
  onMealMaterialOpen,
  onMealProductOpen,
  onAddRecipe: onAddRecipeSuper,
  onAddProduct: onAddProductSuper,
  onAddMaterial: onAddMaterialSuper,
  onEditMenue: onEditMenueSuper,
  onNoteUpdate,
}: // onLoadRecipes,
MenuCardProps) => {
  const classes = useStyles();
  const {customDialog} = useCustomDialog();
  const [contextMenuAnchorElement, setContextMenuAnchorElement] =
    React.useState<HTMLElement | null>(null);
  const [menueName, setMenueName] = React.useState<Menue["name"]>("");
  const theme = useTheme();

  if (menue.name && !menueName) {
    setMenueName(menue.name);
  }

  const note = Object.values(notes).find((note) => note.menueUid == menue.uid);
  /* ------------------------------------------
  // Kontexmenü
  // ------------------------------------------ */
  const onContextMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setContextMenuAnchorElement(event.currentTarget);
  };
  const closeContextMenu = () => {
    setContextMenuAnchorElement(null);
  };
  /* ------------------------------------------
  // Kontex-Menü-Handler
  // ------------------------------------------ */
  const onEditMenue = () => {
    if (contextMenuAnchorElement?.id) {
      onEditMenueSuper(contextMenuAnchorElement.id.split("_")[1]);
    }
    setContextMenuAnchorElement(null);
  };
  const onDeleteMenue = () => {
    if (contextMenuAnchorElement?.id) {
      onDeleteMenueSuper(contextMenuAnchorElement.id.split("_")[1]);
    }
  };
  const onAddProduct = () => {
    if (contextMenuAnchorElement?.id) {
      onAddProductSuper(contextMenuAnchorElement.id.split("_")[1]);
    }
    setContextMenuAnchorElement(null);
  };
  const onAddMaterial = () => {
    if (contextMenuAnchorElement?.id) {
      onAddMaterialSuper(contextMenuAnchorElement.id.split("_")[1]);
    }
    setContextMenuAnchorElement(null);
  };
  const onEditNote = async () => {
    let userInput = {valid: false, input: ""} as SingleTextInputResult;

    const existingNote = Object.values(notes).find(
      (note) => note.menueUid == menue.uid
    );

    userInput = (await customDialog({
      dialogType: DialogType.SingleTextInput,
      title: `${TEXT_NOTE} ${existingNote?.text ? TEXT_EDIT : TEXT_ADD}`,
      singleTextInputProperties: {
        initialValue: existingNote?.text ? existingNote?.text : "",
        textInputLabel: TEXT_NOTE,
      },
    })) as SingleTextInputResult;

    if (userInput?.valid && userInput.input != "") {
      let note: Note;
      if (!existingNote?.text) {
        note = Menuplan.createEmptyNote();
      } else {
        note = existingNote;
      }
      note.text = userInput.input;
      note.menueUid = menue.uid;
      note.date = "";
      onNoteUpdate({
        action: existingNote?.text ? Action.EDIT : Action.ADD,
        note: note,
      });
    }
    setContextMenuAnchorElement(null);
  };
  /* ------------------------------------------
  // Input-Handler
  // ------------------------------------------ */
  const onChangeMenueName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value == "") {
      // Wert gelöscht --> hochgeben
      onUpdateMenue({...menue, name: ""});
    }
    setMenueName(event.target.value);
  };
  const onMenueNameBlur = () => {
    // Name im Controller updaten, aber erst
    // wenn dieser fertig erfasst wurde
    onUpdateMenue({...menue, name: menueName});
  };
  const onAddRecipe = () => {
    // Drawer anzeigen
    onAddRecipeSuper(menue);
  };
  return (
    <React.Fragment>
      <Card
        className={classes.menuCard}
        innerRef={draggableProvided.innerRef}
        {...draggableProvided.draggableProps}
        {...draggableProvided.dragHandleProps}
      >
        <CardHeader
          key={"menu_cardHeader_" + menue.uid}
          action={
            <IconButton
              id={"MoreBtn_" + menue.uid}
              aria-label="settings"
              onClick={onContextMenuClick}
            >
              <MoreVertIcon />
            </IconButton>
          }
          title={
            <TextField
              fullWidth
              value={menueName}
              onChange={onChangeMenueName}
              onBlur={onMenueNameBlur}
              label={TEXT_MENUE}
            />
          }
        />

        <CardContent className={classes.centerCenter}>
          <Grid container>
            {note && (
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                >
                  <em>{note.text}</em>
                </Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Droppable
                droppableId={`${menue.uid}_${DragDropTypes.MEALRECIPE}`}
                type={DragDropTypes.MEALRECIPE}
              >
                {(provided, snapshot) => (
                  <List
                    key={"listMealRecipes_" + menue.uid}
                    innerRef={provided.innerRef}
                    {...provided.droppableProps}
                    className={
                      snapshot.isDraggingOver
                        ? classes.ListOnDrop
                        : classes.ListNoDrop
                    }
                    style={{minHeight: "3em"}}
                  >
                    {menue.mealRecipeOrder.map((mealRecipeUid, index) => (
                      <React.Fragment
                        key={
                          "draggableMealRecipeDiv_" +
                          menue.uid +
                          "_" +
                          mealRecipeUid
                        }
                      >
                        <Draggable
                          draggableId={mealRecipeUid}
                          index={index}
                          key={
                            "draggableMealRecipe_" +
                            menue.uid +
                            "_" +
                            mealRecipeUid
                          }
                        >
                          {(provided, snapshot) => (
                            <ListItem
                              button
                              dense
                              key={
                                "listitem_" + menue.uid + "_" + mealRecipeUid
                              }
                              id={"listitem_" + menue.uid + "_" + mealRecipeUid}
                              innerRef={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={
                                snapshot.isDragging
                                  ? classes.listItemOnDrag
                                  : classes.listItemNoDrag
                              }
                              onClick={(event) => {
                                if (
                                  !mealRecipes[
                                    mealRecipeUid
                                  ]?.recipe.recipeUid.includes(
                                    MealRecipeDeletedPrefix
                                  )
                                ) {
                                  onMealRecipeOpen(event);
                                }
                              }}
                            >
                              <ListItemText
                                key={
                                  "listitemText_" +
                                  menue.uid +
                                  "_" +
                                  mealRecipeUid
                                }
                                style={{margin: 0}}
                                primary={
                                  mealRecipes[
                                    mealRecipeUid
                                  ]?.recipe.recipeUid.includes(
                                    MealRecipeDeletedPrefix
                                  ) ? (
                                    <span
                                      style={{
                                        color: theme.palette.text.secondary,
                                      }}
                                    >
                                      {/* Das Rezept wurde gelöscht... */}
                                      {mealRecipes[mealRecipeUid]?.recipe.name}
                                    </span>
                                  ) : (
                                    <span>
                                      {mealRecipes[mealRecipeUid]?.recipe.name}
                                      <span
                                        style={{
                                          color: theme.palette.text.secondary,
                                        }}
                                      >
                                        {mealRecipes[mealRecipeUid]?.recipe
                                          .type === RecipeType.variant
                                          ? ` [${TEXT_VARIANT}: ${mealRecipes[mealRecipeUid]?.recipe.variantName}]`
                                          : ``}
                                      </span>
                                    </span>
                                  )
                                }
                                secondary={
                                  mealRecipes[mealRecipeUid]?.plan.length ==
                                  0 ? (
                                    <span
                                      style={{
                                        color: theme.palette.error.main,
                                      }}
                                    >
                                      {TEXT_RECIPE_WIHOUT_PORTIONPLAN}
                                    </span>
                                  ) : menuplanSettings.showDetails &&
                                    mealRecipes[mealRecipeUid]?.plan.length >
                                      0 ? (
                                    generatePlanedPortionsText({
                                      uid: mealRecipeUid,
                                      portionPlan:
                                        mealRecipes[mealRecipeUid].plan,
                                      groupConfiguration: groupConfiguration,
                                    })
                                  ) : null
                                }
                              />
                            </ListItem>
                          )}
                        </Draggable>
                      </React.Fragment>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </Grid>
            <Grid item xs={12} className={classes.centerCenter}>
              <Button
                onClick={onAddRecipe}
                color="primary"
                endIcon={<AddIcon />}
              >
                {TEXT_ADD_RECIPE}
              </Button>
            </Grid>
            {/* Produkt-Liste */}
            <Grid item xs={12}>
              <Droppable
                droppableId={`${menue.uid}_${DragDropTypes.PRODUCT}`}
                type={DragDropTypes.PRODUCT}
              >
                {(provided, snapshot) => (
                  <List
                    key={"listMealProducts_" + menue.uid}
                    innerRef={provided.innerRef}
                    {...provided.droppableProps}
                    className={
                      snapshot.isDraggingOver
                        ? classes.ListOnDrop
                        : classes.ListNoDrop
                    }
                    style={{minHeight: "3em"}}
                  >
                    {menue.productOrder.map((productUid, index) => (
                      <Draggable
                        draggableId={productUid}
                        index={index}
                        key={
                          "draggableMealProduct" + menue.uid + "_" + productUid
                        }
                      >
                        {(provided, snapshot) => (
                          <ListItem
                            button
                            dense
                            key={"listitem_" + menue.uid + "_" + productUid}
                            id={"listitem_" + menue.uid + "_" + productUid}
                            innerRef={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={
                              snapshot.isDragging
                                ? classes.listItemOnDrag
                                : classes.listItemNoDrag
                            }
                            onClick={() => onMealProductOpen(productUid)}
                          >
                            <ListItemText
                              key={
                                "listitemText_" + menue.uid + "_" + productUid
                              }
                              style={{margin: 0}}
                              primary={`${
                                menuplanSettings.showDetails &&
                                products[productUid]?.totalQuantity > 0
                                  ? `${products[productUid]?.totalQuantity} ${
                                      products[productUid].unit
                                        ? products[productUid].unit
                                        : " ×"
                                    }`
                                  : ``
                              } ${products[productUid]?.productName}
                                ${
                                  products[productUid]?.planMode ==
                                    GoodsPlanMode.PER_PORTION &&
                                  menuplanSettings.showDetails
                                    ? `(${products[productUid].quantity} ${products[productUid].unit} ${TEXT_PER_PORTION})`
                                    : ``
                                }`}
                              secondary={
                                menuplanSettings.showDetails
                                  ? products[productUid]?.planMode ==
                                    GoodsPlanMode.PER_PORTION
                                    ? generatePlanedPortionsText({
                                        uid: productUid,
                                        portionPlan: products[productUid].plan,
                                        groupConfiguration: groupConfiguration,
                                      })
                                    : ``
                                  : null
                              }
                            />
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </Grid>
            {/* Material-Liste */}
            <Grid item xs={12}>
              <Droppable
                droppableId={`${menue.uid}_${DragDropTypes.MATERIAL}`}
                type={DragDropTypes.MATERIAL}
              >
                {(provided, snapshot) => (
                  <List
                    key={"listMealMaterials_" + menue.uid}
                    innerRef={provided.innerRef}
                    {...provided.droppableProps}
                    className={
                      snapshot.isDraggingOver
                        ? classes.ListOnDrop
                        : classes.ListNoDrop
                    }
                    style={{minHeight: "3em"}}
                  >
                    {menue.materialOrder.map((materialUid, index) => (
                      <Draggable
                        draggableId={materialUid}
                        index={index}
                        key={
                          "draggableMealMaterial_" +
                          menue.uid +
                          "_" +
                          materialUid
                        }
                      >
                        {(provided, snapshot) => (
                          <ListItem
                            button
                            dense
                            key={"listitem_" + menue.uid + "_" + materialUid}
                            id={"listitem_" + menue.uid + "_" + materialUid}
                            innerRef={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={
                              snapshot.isDragging
                                ? classes.listItemOnDrag
                                : classes.listItemNoDrag
                            }
                            onClick={() => onMealMaterialOpen(materialUid)}
                          >
                            <ListItemText
                              key={
                                "listitemText_" + menue.uid + "_" + materialUid
                              }
                              style={{margin: 0}}
                              primary={`${
                                menuplanSettings.showDetails &&
                                materials[materialUid]?.totalQuantity > 0
                                  ? `${materials[materialUid]?.totalQuantity} ${
                                      materials[materialUid].unit
                                        ? materials[materialUid].unit
                                        : " ×"
                                    }`
                                  : ``
                              } ${materials[materialUid]?.materialName}
                                ${
                                  materials[materialUid]?.planMode ==
                                    GoodsPlanMode.PER_PORTION &&
                                  menuplanSettings.showDetails
                                    ? `(${materials[materialUid].quantity} ${materials[materialUid].unit} ${TEXT_PER_PORTION})`
                                    : ``
                                }`}
                              secondary={
                                menuplanSettings.showDetails
                                  ? materials[materialUid]?.planMode ==
                                    GoodsPlanMode.PER_PORTION
                                    ? generatePlanedPortionsText({
                                        uid: materialUid,
                                        portionPlan:
                                          materials[materialUid].plan,
                                        groupConfiguration: groupConfiguration,
                                      })
                                    : ``
                                  : null
                              }
                            />
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Menu
        open={Boolean(contextMenuAnchorElement)}
        keepMounted
        anchorEl={contextMenuAnchorElement}
        onClose={closeContextMenu}
      >
        <MenuItem
          onClick={onEditMenue}
          disabled={
            menue.materialOrder.length == 0 &&
            menue.productOrder.length == 0 &&
            menue.mealRecipeOrder.length == 0 &&
            note == undefined
          }
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {TEXT_EDIT_MENUE}
          </Typography>
        </MenuItem>
        <MenuItem onClick={onAddProduct}>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {TEXT_ADD_PRODUCT}
          </Typography>
        </MenuItem>
        <MenuItem onClick={onAddMaterial}>
          <ListItemIcon>
            <BuildIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {TEXT_ADD_MATERIAL}
          </Typography>
        </MenuItem>
        <MenuItem onClick={onEditNote}>
          <ListItemIcon>
            <NotesIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {`${TEXT_NOTE} ${note ? TEXT_EDIT : TEXT_ADD}`}
          </Typography>
        </MenuItem>
        {note && (
          <MenuItem
            onClick={() => onNoteUpdate({action: Action.DELETE, note: note})}
          >
            <ListItemIcon>
              <DeleteSweepIcon />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>
              {`${TEXT_NOTE} ${TEXT_DELETE}`}
            </Typography>
          </MenuItem>
        )}

        <MenuItem onClick={onDeleteMenue}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {TEXT_DELETE_MENUE}
          </Typography>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};
/* ===================================================================
// ====================== Rezepte-Suchen-Drawer ======================
// =================================================================== */
interface RecipeSearchDrawerProps {
  drawerSettings: DrawerSettings;
  recipes: RecipeShort[];
  authUser: AuthUser;
  onClose: () => void;
  onRecipeCardClick: ({event, recipe}: OnRecipeCardClickProps) => void;
  onRecipeSelection: ({recipe}: OnRecipeSelection) => void;
  onNewRecipe: () => void;
}
const RecipeSearchDrawer = ({
  drawerSettings,
  recipes,
  onClose,
  onRecipeCardClick,
  onRecipeSelection,
  onNewRecipe,
  authUser,
}: RecipeSearchDrawerProps) => {
  const classes = useStyles();

  return (
    <Drawer
      anchor="bottom"
      open={drawerSettings.open}
      onClose={onClose}
      className={classes.recipeDrawerBackground}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <IconButton
        color="inherit"
        size="small"
        aria-label="close"
        className={classes.closeDrawerIconButton}
        onClick={onClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <Container style={{marginTop: "2rem", width: "100vw", height: "100vh"}}>
        <Typography variant="h2" align="center" style={{marginBottom: "2rem"}}>
          {TEXT_RECIPES_DRAWER_TITLE}{" "}
        </Typography>
        <RecipeSearch
          recipes={recipes}
          embeddedMode={true}
          fabButtonIcon={<AddIcon />}
          onFabButtonClick={onRecipeSelection}
          onNewClick={onNewRecipe}
          onCardClick={onRecipeCardClick}
          isLoading={drawerSettings.isLoadingData}
          authUser={authUser}
        />
      </Container>
    </Drawer>
  );
};
/* ===================================================================
// ========================== Rezept-Drawer ==========================
// =================================================================== */
interface RecipeDrawerProps {
  drawerSettings: DrawerSettings;
  recipe: Recipe;
  mealPlan: Array<PlanedMealsRecipe>;
  groupConfiguration: EventGroupConfiguration;
  scaledPortions: number;
  editMode: boolean;
  disableFunctionality?: boolean;
  firebase: Firebase;
  authUser: AuthUser;
  onClose: () => void;
  onAddToEvent?: ({recipe}: OnAddToEvent) => void;
  onEditRecipeMealPlan?: (mealRecipeUid: MealRecipe["uid"]) => void;
  onRecipeUpdate?: (recipe: Recipe) => void;
  onSwitchEditMode?: () => void;
  onRecipeDelete?: () => void;
}
export const RecipeDrawer = ({
  drawerSettings,
  recipe,
  mealPlan,
  groupConfiguration,
  editMode,
  disableFunctionality = false,
  scaledPortions,
  firebase,
  authUser,
  onClose,
  onAddToEvent,
  onEditRecipeMealPlan,
  onSwitchEditMode,
  onRecipeDelete,
  onRecipeUpdate: onRecipeUpdateSuper,
}: RecipeDrawerProps) => {
  const classes = useStyles();

  const onRecipeUpdate = ({recipe}) => {
    // Umbiegen der Signatur
    if (onRecipeUpdateSuper) {
      onRecipeUpdateSuper(recipe);
    }
  };
  return (
    <Drawer
      anchor="bottom"
      open={drawerSettings.open}
      onClose={onClose}
      className={classes.recipeDrawerBackground}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <IconButton
        color="inherit"
        size="small"
        aria-label="close"
        className={classes.closeDrawerIconButton}
        onClick={onClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <Container style={{width: "100vw", height: "100vh", padding: "0"}}>
        {editMode ? (
          <RecipeEdit
            dbRecipe={recipe}
            mealPlan={mealPlan}
            firebase={firebase}
            isLoading={false}
            isEmbedded={true}
            switchEditMode={onSwitchEditMode}
            onUpdateRecipe={onRecipeUpdate}
            authUser={authUser}
          />
        ) : (
          <RecipeView
            recipe={recipe}
            mealPlan={mealPlan}
            firebase={firebase}
            isEmbedded={true}
            isLoading={drawerSettings.isLoadingData}
            error={null}
            disableFunctionality={disableFunctionality}
            groupConfiguration={groupConfiguration}
            scaledPortions={scaledPortions}
            switchEditMode={onSwitchEditMode}
            onUpdateRecipe={onRecipeUpdate}
            onEditRecipeMealPlan={onEditRecipeMealPlan}
            onAddToEvent={onAddToEvent}
            onRecipeDelete={onRecipeDelete}
            authUser={authUser}
          />
        )}
      </Container>
    </Drawer>
  );
};

/* ===================================================================
// ==================== Einplanung der Portionen =====================
// =================================================================== */
interface DialogPlanPortionsProps {
  open: boolean;
  selectedMenues: DialogSelectMenuesForRecipeDialogValues | null;
  meals: Menuplan["meals"];
  menues: Menuplan["menues"];
  mealTypes: Menuplan["mealTypes"];
  groupConfiguration: EventGroupConfiguration;
  planedMealRecipe: PortionPlan[];
  planedObject: PlanedObject;
  onCancelClick: () => void;
  onBackClick: () => void;
  onAddClick: (plan: {
    [key: Menue["uid"]]: DialogPlanPortionsMealPlanning;
  }) => void;
}
const KEEP_IN_SYNC_KEY = "SYNC";
interface DialogPlanPortionsMealPlanning {
  [key: Intolerance["uid"]]: {
    active: boolean;
    factor: string;
    portions: number;
    total: number;
    diet: Diet["uid"];
  };
}
enum PlanedObject {
  RECIPE,
  GOOD,
}

interface DialogPlanPortionsMealPlan {
  [key: Menue["uid"]]: DialogPlanPortionsMealPlanning | null;
}

interface DialogPlanPortionsDialogValues {
  keepMenuPortionsInSync: boolean;
  selectedDiets: {[key: Menue["uid"]]: PortionPlan["diet"]} | null;
  menueList: string[] | null;
  plan: DialogPlanPortionsMealPlan | null;
}
const DialogPlanPortions = ({
  open,
  selectedMenues,
  meals,
  mealTypes,
  groupConfiguration,
  planedMealRecipe,
  planedObject,
  onCancelClick: onCancelClickSuper,
  onBackClick: onBackClickSuper,
  onAddClick: onAddClickSuper,
}: DialogPlanPortionsProps) => {
  const classes = useStyles();
  const theme = useTheme();

  const DIALOG_VALUES_INITIAL_VALUES = {
    keepMenuPortionsInSync: true,
    selectedDiets: null,
    menueList: null,
    plan: null,
  };

  const [dialogValues, setDialogValues] =
    React.useState<DialogPlanPortionsDialogValues>(
      DIALOG_VALUES_INITIAL_VALUES
    );
  const [dialogValidation, setDialogValidation] = React.useState<
    Array<FormValidationFieldError>
  >([]);
  /* ------------------------------------------
  // Initialisierung
  // ------------------------------------------ */
  if (
    (!dialogValues.plan || Object.values(dialogValues.plan).includes(null)) &&
    selectedMenues &&
    Object.keys(selectedMenues).length > 0
  ) {
    let dietButtons = {} as {[key: Menue["uid"]]: PortionPlan["diet"]};
    let menueList: string[] = [];

    if (!dialogValues.menueList) {
      if (
        Object.keys(selectedMenues).length > 1 &&
        dialogValues.keepMenuPortionsInSync
      ) {
        menueList[0] = KEEP_IN_SYNC_KEY;
      } else {
        Object.keys(selectedMenues).forEach((menueUid) =>
          menueList.push(menueUid)
        );
      }
    } else {
      menueList = dialogValues.menueList;
    }

    if (!dialogValues.selectedDiets && planedMealRecipe.length === 0) {
      menueList.forEach((menueUid) => {
        dietButtons[menueUid] = PlanedDiet.ALL;
      });
    } else if (
      dialogValues.selectedDiets == null &&
      planedMealRecipe.length > 0
    ) {
      dietButtons[menueList[0]] = planedMealRecipe[0].diet;
    } else {
      dietButtons = dialogValues.selectedDiets as {
        [key: Menue["uid"]]: PortionPlan["diet"];
      };
    }

    let plan = {};
    if (!dialogValues.plan) {
      menueList.forEach((menueUid) => (plan[menueUid] = null));
    } else {
      plan = dialogValues.plan;
    }

    // Zuerst die Alle und Fix Portionen
    Object.keys(plan).forEach((menuUid) => {
      if (plan[menuUid] == null) {
        const mealPlan = {} as DialogPlanPortionsMealPlanning;
        if (dietButtons[menuUid] == PlanedDiet.FIX) {
          // Fixe-Portionen
          mealPlan[PlanedDiet.FIX] = {
            active: true,
            portions: 0,
            factor: "1.0",
            total: 0,
            diet: dietButtons[menuUid],
          };
        } else {
          groupConfiguration.intolerances.order.forEach((intoleranceUid) => {
            mealPlan[intoleranceUid] = {
              active: false,
              portions:
                dietButtons[menuUid] == PlanedDiet.ALL
                  ? groupConfiguration.intolerances.entries[intoleranceUid]
                      .totalPortions
                  : groupConfiguration.portions[dietButtons[menuUid]][
                      intoleranceUid
                    ],
              factor: "1.0",
              total: 0,
              diet: dietButtons[menuUid],
            };
          });
          // Totalsumme einfügen
          mealPlan[PlanedDiet.ALL] = {
            active: false,
            portions:
              dietButtons[menuUid] == PlanedDiet.ALL
                ? groupConfiguration.totalPortions
                : groupConfiguration.diets.entries[dietButtons[menuUid]]
                    .totalPortions,
            factor: "1.0",
            total: 0,
            diet: dietButtons[menuUid],
          };
        }

        plan[menuUid] = mealPlan;
      }
    });

    if (dialogValues.selectedDiets == null && planedMealRecipe.length > 0) {
      // Vorauswahl setzen
      dietButtons[menueList[0]] = planedMealRecipe[0].diet;
    }

    if (
      planedMealRecipe.length > 0 &&
      plan &&
      dietButtons[menueList[0]] == planedMealRecipe[0].diet
    ) {
      // Werte übernehmen --> im Change Modus
      Object.values(plan as DialogPlanPortionsMealPlan).forEach(
        (planOfMenu) =>
          planOfMenu &&
          planedMealRecipe.forEach(
            (mealPlan) =>
              (planOfMenu[mealPlan.intolerance] = {
                ...planOfMenu[mealPlan.intolerance],
                active: true,
                diet: mealPlan.diet,
                factor: mealPlan.factor.toFixed(1),
                total: mealPlan.totalPortions,
                portions:
                  mealPlan.intolerance == PlanedDiet.FIX
                    ? mealPlan.totalPortions
                    : planOfMenu[mealPlan.intolerance].portions,
              })
          )
      );
    }
    setDialogValues({
      ...dialogValues,
      plan: plan,
      selectedDiets: dietButtons,
      menueList: menueList,
    });
  }
  /* ------------------------------------------
  // Feld-Änderungen
  // ------------------------------------------ */
  const onFieldUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedField = event.target.id.split("_");
    let factor = "";
    let active = false;
    let portions = 0;
    const [, changedField, menueUid, intoleranceUid] = updatedField;

    if (
      !dialogValues.plan ||
      !dialogValues.plan[menueUid] ||
      dialogValues.plan[menueUid] === null
    ) {
      return;
    }
    const mealPlanning = dialogValues.plan[menueUid];
    if (!mealPlanning || mealPlanning[intoleranceUid] === null) {
      return;
    }
    if (changedField == "active") {
      active = event.target.checked;
      factor = mealPlanning[intoleranceUid]?.factor;
      portions = mealPlanning[intoleranceUid].portions;
    } else if (changedField == "factor") {
      active = mealPlanning[intoleranceUid].active;
      factor = event.target.value.replace(",", ".");
      portions = mealPlanning[intoleranceUid].portions;
    } else if (changedField == "total") {
      active = true;
      factor = "1.0";
      portions = parseInt(event.target.value);
    }

    let total = active ? Math.round(portions * parseFloat(factor)) : 0;

    if (isNaN(total)) {
      total = 0;
    }

    if (changedField == "active") {
      const menuePlan = dialogValues.plan[menueUid];
      if (menuePlan === null) {
        return;
      }
      // Gesetzte Werte übernehmen
      menuePlan[intoleranceUid].active = active;
      menuePlan[intoleranceUid].factor = factor;
      menuePlan[intoleranceUid].total = total;

      if (intoleranceUid == PlanedIntolerances.ALL) {
        // Wenn die 'Alle' Checkbox markiert ist, die anderen demarkieren.
        Object.keys(menuePlan).forEach((menueKey) => {
          if (menueKey !== PlanedIntolerances.ALL) {
            menuePlan![menueKey].active = false;
            menuePlan![menueKey].factor = "1.0";
            menuePlan![menueKey].total = 0;
          }
        });
      } else if (intoleranceUid != PlanedIntolerances.ALL) {
        // Die 'Alle' Checkbox demarkieren
        menuePlan[PlanedIntolerances.ALL].active = false;
        menuePlan[PlanedIntolerances.ALL].factor = "1.0";
        menuePlan[PlanedIntolerances.ALL].total = 0;
      }
      setDialogValues({
        ...dialogValues,
        plan: {
          ...dialogValues.plan,
          [menueUid]: menuePlan,
        },
      });
    } else {
      setDialogValues({
        ...dialogValues,
        plan: {
          ...dialogValues.plan,
          [menueUid]: {
            ...dialogValues.plan[menueUid],
            [intoleranceUid]: {
              ...mealPlanning[intoleranceUid],
              portions: portions,
              active: active,
              factor: factor,
              total: total,
            },
          },
        },
      });
    }
  };
  const onSwitchSyncAllMenues = () => {
    setDialogValues({
      ...dialogValues,
      selectedDiets: null,
      keepMenuPortionsInSync: !dialogValues.keepMenuPortionsInSync,
      plan: null,
      menueList: null, // diese muss neu aufgebaut werden
    });
  };
  /* ------------------------------------------
  // ToggleButton-Handling
  // ------------------------------------------ */
  const onToggleButtonClick = (
    event: React.MouseEvent<HTMLElement>,
    activeButton: string | null
  ) => {
    if (activeButton == null) {
      // Etwas muss markiert sein.
      return;
    }
    const [, menuUid] = event.currentTarget.id.split("_");

    setDialogValues({
      ...dialogValues,
      selectedDiets: {
        ...dialogValues.selectedDiets,
        [menuUid]: activeButton,
      },
      //  Darf nur für das Menü neu aufebaut werden, für das eine neue Diät-Gruppe gewählt wurde
      plan: {...dialogValues.plan, [menuUid]: null}, // sicherstellen, dass dieser neu-aufgebaut wird
    });
  };
  /* ------------------------------------------
  // Dialog-Schliessen-Handling
  // ------------------------------------------ */
  const onAddClick = () => {
    // Prüfen ob Checkboxen markiert sind ohne Faktor!
    if (!dialogValues.plan) {
      return;
    }

    const dialogValidationMessages: FormValidationFieldError[] = [];
    //Prüfen ob es aktivierte Checkboxen ohne Faktor gibt, dass kann nicht gerechnet werden
    Object.keys(dialogValues.plan).forEach((menueUid) => {
      if (
        Object.values(dialogValues.plan![menueUid]!).reduce(
          (innerRunningCounter, intolerance) => {
            if (intolerance.active == true && !intolerance.factor) {
              innerRunningCounter++;
            }
            return innerRunningCounter;
          },
          0
        ) > 0
      ) {
        dialogValidationMessages.push({
          priority: 1,
          fieldName: menueUid,
          errorMessage: TEXT_MISSING_FACTOR,
        });
      }
    });

    // Prüfen ob pro Menü überhaupt eine Checkbox aktiviert wurde
    Object.keys(dialogValues.plan).forEach((menueUid) => {
      if (
        Object.values(dialogValues.plan![menueUid]!).reduce(
          (innerRunningCounter, intolerance) => {
            if (intolerance.active == true) {
              innerRunningCounter++;
            }
            return innerRunningCounter;
          },
          0
        ) == 0
      ) {
        dialogValidationMessages.push({
          priority: 1,
          fieldName: menueUid,
          errorMessage: TEXT_NO_GROUP_SELECTED,
        });
      }
    });

    // Prüfen ob fixe Portionen eingegeben wurden
    Object.keys(dialogValues.plan).forEach((menueUid) => {
      if (
        Object.keys(dialogValues.plan![menueUid]!).includes(PlanedDiet.FIX) &&
        (dialogValues.plan![menueUid]![PlanedDiet.FIX].portions == 0 ||
          !dialogValues.plan![menueUid]![PlanedDiet.FIX].portions)
      ) {
        dialogValidationMessages.push({
          priority: 1,
          fieldName: menueUid,
          errorMessage: TEXT_NO_PORTIONS_GIVEN,
        });
      }
    });

    if (dialogValidationMessages.length == 0) {
      // Zurückmelden, was alles aktiv ist.
      setDialogValidation([]);
      const selectedPlans = {};

      Object.keys(dialogValues.plan).forEach((menuUid) => {
        const intolerances = {};
        Object.keys(dialogValues.plan![menuUid]!).forEach((intoleraceUid) => {
          if (dialogValues.plan![menuUid]![intoleraceUid].active === true) {
            intolerances[intoleraceUid] =
              dialogValues.plan![menuUid]![intoleraceUid];
          }
        });
        selectedPlans[menuUid] = intolerances;
      });

      if (
        Object.keys(selectedMenues!).length > 1 &&
        dialogValues.keepMenuPortionsInSync
      ) {
        Object.keys(selectedMenues!).forEach((menueUid) => {
          selectedPlans[menueUid] = selectedPlans[KEEP_IN_SYNC_KEY];
        });
        delete selectedPlans?.[KEEP_IN_SYNC_KEY];
      }

      // Wenn SYNC --> auf alles Menüs umbiegen
      // Objekt erzeugen --> menueUid: {intolerance {factore}}
      onAddClickSuper(selectedPlans);
      setDialogValues(DIALOG_VALUES_INITIAL_VALUES);
    } else {
      setDialogValidation(dialogValidationMessages);
    }
  };
  const onBackClick = () => {
    setDialogValues(DIALOG_VALUES_INITIAL_VALUES);
    setDialogValidation([]);
    onBackClickSuper();
  };
  const onCancelClick = () => {
    setDialogValues(DIALOG_VALUES_INITIAL_VALUES);
    setDialogValidation([]);
    onCancelClickSuper();
  };

  return (
    <React.Fragment>
      {selectedMenues ? (
        <Dialog open={open} maxWidth="md">
          <DialogTitle>
            {planedObject == PlanedObject.RECIPE
              ? TEXT_DIALOG_PLAN_RECIPE_PORTIONS_TITLE
              : TEXT_DIALOG_PLAN_GOODS_PORTIONS_TITLE}
          </DialogTitle>
          <DialogContent>
            {Object.keys(selectedMenues).length > 1 && (
              <FormGroup style={{marginBottom: "1em"}}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={dialogValues.keepMenuPortionsInSync}
                      onChange={onSwitchSyncAllMenues}
                    />
                  }
                  label={TEXT_KEEP_PLANED_PORTIONS_IN_SYNC}
                />
              </FormGroup>
            )}
            {dialogValues.menueList &&
              // Für alle gewählten Menü, den Block aufbauen
              dialogValues.menueList.map((menueUid, counter) => {
                let meal: Meal = {
                  uid: "",
                  date: "",
                  mealType: "",
                  mealTypeName: "",
                  menuOrder: [],
                };
                if (menueUid !== KEEP_IN_SYNC_KEY) {
                  meal = Menuplan.findMealOfMenu({
                    menueUid: menueUid,
                    meals: meals,
                  });
                }
                return (
                  <React.Fragment
                    key={"dialogPlanPortionsDetailBlock_" + menueUid}
                  >
                    {counter > 0 && (
                      <Divider
                        key={"dialogPortion_Divider_" + menueUid}
                        variant="fullWidth"
                        style={{
                          marginTop: theme.spacing(4),
                          marginBottom: theme.spacing(4),
                          marginRight: theme.spacing(-2),
                          marginLeft: theme.spacing(-2),
                          backgroundColor: theme.palette.primary.main,
                          height: "2px",
                        }}
                      />
                    )}
                    {menueUid == KEEP_IN_SYNC_KEY ? (
                      <React.Fragment>
                        <Typography variant="subtitle1">
                          {`${TEXT_ON_DATE}: `}
                        </Typography>
                        {Object.keys(selectedMenues).map((menueUid) => {
                          meal = Menuplan.findMealOfMenu({
                            menueUid: menueUid,
                            meals: meals,
                          });

                          return (
                            <Typography
                              variant="subtitle1"
                              key={"date_" + menueUid + counter}
                            >
                              <strong>
                                {`${new Date(meal.date).toLocaleString(
                                  "default",
                                  {
                                    weekday: "long",
                                  }
                                )}`}
                              </strong>
                              {` ${new Date(meal.date).toLocaleString("de-CH", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })} - ${mealTypes.entries[meal.mealType].name}`}
                            </Typography>
                          );
                        })}
                      </React.Fragment>
                    ) : (
                      <Typography variant="subtitle1">
                        {`${TEXT_ON_DATE}: `}
                        <strong>
                          {`${new Date(meal.date).toLocaleString("default", {
                            weekday: "long",
                          })}`}
                        </strong>
                        {` ${new Date(meal.date).toLocaleString("de-CH", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })} - ${mealTypes.entries[meal.mealType].name}`}
                      </Typography>
                    )}
                    <ToggleButtonGroup
                      key={"dialogPortion_ToggleButtonGroup_" + menueUid}
                      id={"dialogPortion_ToggleButtonGroup_" + menueUid}
                      exclusive
                      value={dialogValues.selectedDiets}
                      onChange={onToggleButtonClick}
                      aria-label="Mögliche-Gruppen"
                      style={{
                        display: "flex",
                      }}
                      className={classes.toggleButtonGroup}
                    >
                      <ToggleButton
                        key={
                          "dialogPlanPortionsMealBlockDietButton_" +
                          menueUid +
                          "_" +
                          PlanedDiet.ALL
                        }
                        id={
                          "dialogPlanPortionsMealBlockDietButton_" +
                          menueUid +
                          "_" +
                          PlanedDiet.ALL
                        }
                        value={PlanedDiet.ALL}
                        aria-label={TEXT_ALL}
                        className={classes.toggleButton}
                        style={{
                          ...(dialogValues.selectedDiets &&
                            dialogValues.selectedDiets[menueUid] ===
                              PlanedDiet.ALL && {
                              color: theme.palette.primary.main,
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                            }),
                        }}
                      >
                        {TEXT_ALL}
                      </ToggleButton>
                      {groupConfiguration?.diets.order.map((dietUid) => (
                        <ToggleButton
                          key={
                            "dialogPlanPortionsMealBlockDietButton_" +
                            menueUid +
                            "_" +
                            dietUid
                          }
                          id={
                            "dialogPlanPortionsMealBlockDietButton_" +
                            menueUid +
                            "_" +
                            dietUid
                          }
                          value={dietUid}
                          aria-label={
                            groupConfiguration.diets.entries[dietUid].name
                          }
                          className={classes.toggleButton}
                          style={{
                            ...(dialogValues.selectedDiets &&
                              dialogValues.selectedDiets[menueUid] ===
                                dietUid && {
                                color: theme.palette.primary.main,
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                              }),
                          }}
                        >
                          {groupConfiguration.diets.entries[dietUid].name}
                        </ToggleButton>
                      ))}
                      <ToggleButton
                        id={
                          "dialogPlanPortionsMealBlockDietButton_" +
                          menueUid +
                          "_" +
                          PlanedDiet.FIX
                        }
                        value={PlanedDiet.FIX}
                        aria-label={TEXT_FIX_PORTIONS}
                        className={classes.toggleButton}
                        style={{
                          ...(dialogValues.selectedDiets &&
                            dialogValues.selectedDiets[menueUid] ===
                              PlanedDiet.FIX && {
                              color: theme.palette.primary.main,
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                            }),
                        }}
                      >
                        {TEXT_FIX_PORTIONS}
                      </ToggleButton>
                    </ToggleButtonGroup>

                    {dialogValues.selectedDiets && (
                      <DialogPlanPortionsMealBlock
                        key={"dialogPlanPortionsMealBlock_" + menueUid}
                        selectedDietUid={dialogValues.selectedDiets[menueUid]}
                        plan={dialogValues.plan}
                        menueUid={menueUid}
                        groupConfiguration={groupConfiguration}
                        onFieldUpdate={onFieldUpdate}
                      />
                    )}
                    {/* Fehlermeldung anzeigen falls notwendig */}
                    {dialogValidation.length > 0 &&
                      dialogValidation.some(
                        (errorMessage) => errorMessage.fieldName === menueUid
                      ) && (
                        <Container
                          style={{
                            marginTop: theme.spacing(4),
                            paddingLeft: 0,
                            paddingRight: 0,
                          }}
                        >
                          {dialogValidation
                            .filter((message) => message.fieldName == menueUid)
                            .map((errorMessage) => (
                              <Typography color="error" key="errormessage">
                                {errorMessage.errorMessage}
                              </Typography>
                            ))}
                        </Container>
                      )}
                  </React.Fragment>
                );
              })}
          </DialogContent>
          <DialogActions style={{marginTop: theme.spacing(2)}}>
            {/* Abbrechen, Bestägigen, Zurück */}
            <Button onClick={onCancelClick} color="primary" variant="outlined">
              {TEXT_CANCEL}
            </Button>
            {planedObject == PlanedObject.RECIPE &&
              planedMealRecipe.length == 0 && (
                // Nur anzeigen, wenn neues Rezept hinzugeüfgt wird.
                <Button
                  onClick={onBackClick}
                  color="primary"
                  variant="outlined"
                >
                  {TEXT_BACK}
                </Button>
              )}
            <Button onClick={onAddClick} color="primary" variant="contained">
              {planedMealRecipe.length == 0 ? TEXT_ADD : TEXT_APPLY}
            </Button>
          </DialogActions>
        </Dialog>
      ) : (
        <React.Fragment />
      )}
    </React.Fragment>
  );
};
/* ===================================================================
// ========== Einplanung der Portionen - Block pro Mahlzeit===========
// =================================================================== */
interface DialogPlanPortionsMealBlockProps {
  menueUid: Menue["uid"];
  selectedDietUid: PortionPlan["diet"];
  groupConfiguration: EventGroupConfiguration;
  plan: DialogPlanPortionsDialogValues["plan"];
  onFieldUpdate: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const DialogPlanPortionsMealBlock = ({
  menueUid,
  plan,
  selectedDietUid,
  groupConfiguration,
  onFieldUpdate,
}: DialogPlanPortionsMealBlockProps) => {
  return (
    plan &&
    (selectedDietUid == PlanedDiet.FIX ? (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            id={
              "dialogPlanPortionsMealBlockIntolerance_total_" +
              menueUid +
              "_" +
              PlanedDiet.FIX
            }
            key={
              "dialogPlanPortionsMealBlockIntolerance_total_" +
              menueUid +
              "_" +
              PlanedDiet.FIX
            }
            label={TEXT_NO_OF_SERVINGS}
            type="outlined"
            onChange={onFieldUpdate}
            value={plan[Object.keys(plan)[0]]!.FIX.total}
            fullWidth
          />
        </Grid>
      </Grid>
    ) : (
      <Grid container spacing={2}>
        <Grid item xs={8} />
        <Grid item xs={2}>
          <Typography>
            <strong>{TEXT_FACTOR} </strong>
            <Tooltip title={TEXT_FACTOR_TOOLTIP} placement="bottom" arrow>
              <InfoIcon fontSize="small" style={{marginLeft: "0.5em"}} />
            </Tooltip>
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <strong>{TEXT_TOTAL_PORTIONS}</strong>
        </Grid>
        {/* Zuerst eine Zeile mit für das Total der gewählten Diät-Gruppe */}
        <DialogPlanPortionsMealBlockRow
          key={
            "dialogPlanPortionsMealBlockRow_" +
            menueUid +
            "_" +
            PlanedIntolerances.ALL
          }
          intoleranceUid={PlanedIntolerances.ALL}
          menueUid={menueUid}
          intoleranceName={TEXT_ALL}
          portionsOfIntolerance={
            selectedDietUid == PlanedDiet.ALL
              ? groupConfiguration.totalPortions
              : groupConfiguration.diets.entries[selectedDietUid].totalPortions
          }
          active={plan[menueUid]?.[PlanedIntolerances.ALL]?.active}
          factor={plan[menueUid]?.[PlanedIntolerances.ALL]?.factor}
          totalPortions={plan[menueUid]?.[PlanedIntolerances.ALL]?.total}
          onFieldUpdate={onFieldUpdate}
        />
        {groupConfiguration.intolerances.order.map((intoleranceUid) => (
          <DialogPlanPortionsMealBlockRow
            key={
              "dialogPlanPortionsMealBlockRow_" +
              menueUid +
              "_" +
              intoleranceUid
            }
            intoleranceUid={intoleranceUid}
            menueUid={menueUid}
            intoleranceName={
              groupConfiguration.intolerances.entries[intoleranceUid].name
            }
            portionsOfIntolerance={
              selectedDietUid == PlanedDiet.ALL
                ? groupConfiguration.intolerances.entries[intoleranceUid]
                    .totalPortions
                : groupConfiguration.portions[selectedDietUid][intoleranceUid]
            }
            active={plan[menueUid]?.[intoleranceUid]?.active}
            factor={plan[menueUid]?.[intoleranceUid]?.factor}
            totalPortions={plan[menueUid]?.[intoleranceUid]?.total}
            onFieldUpdate={onFieldUpdate}
          />
        ))}
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={8}>
          <Typography>
            <strong>{TEXT_YOUR_SELECTION_MAKES_X_SERVINGS}</strong>
          </Typography>
        </Grid>
        <Grid item xs={2} />
        <Grid item xs={2}>
          <TextField
            fullWidth
            disabled
            value={
              plan && plan[menueUid]
                ? Object.values(plan[menueUid]!)
                    .filter((portion) => portion !== null && portion.active)
                    .reduce(
                      (runningSum, portion) => runningSum + portion.total,
                      0
                    )
                : ""
            }
            label={TEXT_TOTAL_PORTIONS}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <strong>=</strong>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    ))
  );
};
/* ===================================================================
// ================ Einplanung der Portionen - Reihe =================
// =================================================================== */
interface DialogPlanPortionsMealBlockRowProps {
  active: boolean | undefined;
  menueUid: Menue["uid"];
  intoleranceUid: PortionPlan["intolerance"];
  intoleranceName: Intolerance["name"];
  portionsOfIntolerance: number;
  factor: string | undefined;
  totalPortions: PortionPlan["totalPortions"] | undefined;
  onFieldUpdate: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export const DialogPlanPortionsMealBlockRow = ({
  active,
  menueUid,
  intoleranceUid,
  intoleranceName,
  portionsOfIntolerance,
  factor,
  totalPortions,
  onFieldUpdate,
}: DialogPlanPortionsMealBlockRowProps) => {
  const theme = useTheme();

  return (
    <React.Fragment
      key={
        "dialogPlanPortionsMealBlockIntoleranceRow_" +
        menueUid +
        "_" +
        intoleranceUid
      }
    >
      <Grid item xs={8}>
        <FormControlLabel
          key={
            "dialogPlanPortionsMealBlockIntoleranceFormcontroll_" +
            menueUid +
            intoleranceUid
          }
          style={{width: "100%"}}
          control={
            <Checkbox
              id={
                "dialogPlanPortionsMealBlockIntolerance_active_" +
                menueUid +
                "_" +
                intoleranceUid
              }
              checked={active}
              onChange={onFieldUpdate}
              color="primary"
            />
          }
          label={
            <Typography variant="body1">
              {intoleranceName}
              <span
                style={{
                  color: theme.palette.text.secondary,
                  marginLeft: theme.spacing(1),
                }}
              >
                {`(${portionsOfIntolerance} ${
                  portionsOfIntolerance == 1 ? TEXT_PORTION : TEXT_PORTIONS
                })`}
              </span>
            </Typography>
          }
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          id={
            "dialogPlanPortionsMealBlockIntolerance_factor_" +
            menueUid +
            "_" +
            intoleranceUid
          }
          fullWidth
          value={active ? factor : ""}
          error={
            !factor
              ? false
              : factor != "" &&
                !/^(\d+|\d+\.\d*|\d*\.\d+|1\.|\.|,)?$/.test(factor)
          }
          helperText={
            factor && !/^(\d+|\d+\.\d*|\d*\.\d+|1\.|\.|,)?$/.test(factor)
              ? TEXT_PLEASE_PROVIDE_VALID_FACTOR
              : ""
          }
          disabled={!active}
          onChange={onFieldUpdate}
          label={TEXT_FACTOR}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          id={
            "dialogPlanPortionsMealBlockIntolerance_totalPortions_" +
            menueUid +
            "_" +
            intoleranceUid
          }
          fullWidth
          disabled
          value={totalPortions == 0 ? "" : totalPortions}
          // onChange={onChangeMenueName}
          label={TEXT_TOTAL_PORTIONS}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <strong>=</strong>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </React.Fragment>
  );
};
/* ===================================================================
// ====================== Dialog Menü ändern =========================
// =================================================================== */
interface DialogEditMenueProps {
  open: boolean;
  menue: Menue;
  note: Note | undefined;
  mealRecipes: Menuplan["mealRecipes"];
  products: Menuplan["products"];
  materials: Menuplan["materials"];
  groupConfiguration: EventGroupConfiguration;
  onCloseDialog: () => void;
  onEditObject: ({objectType, uid}: EditMenueObjectManipulation) => void;
  onDeleteObject: ({objectType, uid}: EditMenueObjectManipulation) => void;
}
interface EditMenueObjectManipulation {
  objectType: MenueEditTypes;
  uid: string;
}

export const DialogEditMenue = ({
  open,
  menue,
  note,
  mealRecipes,
  products,
  materials,
  groupConfiguration,
  onCloseDialog,
  onEditObject,
  onDeleteObject,
}: DialogEditMenueProps) => {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Dialog open={open} maxWidth="sm" onClose={onCloseDialog} fullWidth>
        {menue?.name && <DialogTitle>{menue.name}</DialogTitle>}
        <DialogContent>
          {/* Notiz  */}
          {note && (
            <List dense>
              <ListItem>
                <ListItemText primary={note.text} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() =>
                      onDeleteObject({
                        objectType: MenueEditTypes.NOTE,
                        uid: note.uid,
                      })
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          )}
          {menue?.mealRecipeOrder.length > 0 && (
            <List
              dense
              subheader={
                <ListSubheader disableGutters>{TEXT_RECIPES}</ListSubheader>
              }
            >
              {menue.mealRecipeOrder.map((mealRecipeUid) => (
                <ListItem key={"listItemMealRecipe_" + mealRecipeUid}>
                  <ListItemText
                    primary={
                      <span>
                        {mealRecipes[mealRecipeUid]?.recipe.name}
                        <span
                          style={{
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {mealRecipes[mealRecipeUid]?.recipe.type ===
                          RecipeType.variant
                            ? ` [${TEXT_VARIANT}: ${mealRecipes[mealRecipeUid]?.recipe.variantName}]`
                            : ``}
                        </span>
                      </span>
                    }
                    secondary={generatePlanedPortionsText({
                      uid: mealRecipeUid,
                      portionPlan: mealRecipes[mealRecipeUid].plan,
                      groupConfiguration: groupConfiguration,
                    })}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() =>
                        onEditObject({
                          objectType: MenueEditTypes.MEALRECIPE,
                          uid: mealRecipeUid,
                        })
                      }
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() =>
                        onDeleteObject({
                          objectType: MenueEditTypes.MEALRECIPE,
                          uid: mealRecipeUid,
                        })
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
          {/* Produkte und Material */}
          {menue?.productOrder.length > 0 && (
            <List
              dense
              subheader={
                <ListSubheader disableGutters>{TEXT_PRODUCTS}</ListSubheader>
              }
            >
              {menue.productOrder.map((productUid) => (
                <ListItem key={"listItemProducts_" + productUid}>
                  <ListItemText
                    primary={`${
                      products[productUid]?.totalQuantity > 0
                        ? `${products[productUid]?.totalQuantity} ${
                            products[productUid].unit
                              ? products[productUid].unit
                              : " ×"
                          }`
                        : ``
                    } ${products[productUid]?.productName}
                      ${
                        products[productUid]?.planMode ==
                        GoodsPlanMode.PER_PORTION
                          ? `(${products[productUid].quantity} ${products[productUid].unit} ${TEXT_PER_PORTION})`
                          : ``
                      }`}
                    secondary={
                      products[productUid]?.planMode ==
                      GoodsPlanMode.PER_PORTION
                        ? generatePlanedPortionsText({
                            uid: productUid,
                            portionPlan: products[productUid].plan,
                            groupConfiguration: groupConfiguration,
                          })
                        : ``
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() =>
                        onEditObject({
                          objectType: MenueEditTypes.PRODUCT,
                          uid: productUid,
                        })
                      }
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() =>
                        onDeleteObject({
                          objectType: MenueEditTypes.PRODUCT,
                          uid: productUid,
                        })
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          {menue?.materialOrder.length > 0 && (
            <List
              dense
              subheader={
                <ListSubheader disableGutters>{TEXT_MATERIAL}</ListSubheader>
              }
            >
              {menue.materialOrder.map((materialUid) => (
                <ListItem key={"listItemMaterials_" + materialUid}>
                  <ListItemText
                    primary={`${
                      materials[materialUid]?.totalQuantity > 0
                        ? `${materials[materialUid]?.totalQuantity} ${
                            materials[materialUid].unit
                              ? materials[materialUid].unit
                              : " ×"
                          }`
                        : ``
                    } ${materials[materialUid]?.materialName}
                      ${
                        materials[materialUid]?.planMode ==
                        GoodsPlanMode.PER_PORTION
                          ? `(${materials[materialUid].quantity} ${materials[materialUid].unit} ${TEXT_PER_PORTION})`
                          : ``
                      }`}
                    secondary={
                      materials[materialUid]?.planMode ==
                      GoodsPlanMode.PER_PORTION
                        ? generatePlanedPortionsText({
                            uid: materialUid,
                            portionPlan: materials[materialUid].plan,
                            groupConfiguration: groupConfiguration,
                          })
                        : ``
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() =>
                        onEditObject({
                          objectType: MenueEditTypes.MATERIAL,
                          uid: materialUid,
                        })
                      }
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() =>
                        onDeleteObject({
                          objectType: MenueEditTypes.MATERIAL,
                          uid: materialUid,
                        })
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions style={{marginTop: theme.spacing(2)}}>
          {/* schliessen */}
          <Button onClick={onCloseDialog} color="primary" variant="contained">
            {TEXT_CLOSE}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};
/* ===================================================================
// ================== Dialog Produkte/Material =======================
// =================================================================== */
interface DialogGoodsProps {
  open: boolean;
  goodsType: GoodsType;
  units: Unit[];
  products: Product[];
  materials: Material[];
  productToUpdate: MenuplanProduct | null;
  materialToUpdate: MenuplanMaterial | null;
  departments: Department[];
  authUser: AuthUser;
  onCancel: () => void;
  onOk: ({
    planMode,
    quantity,
    unit,
    product,
    material,
  }: OnAddGoodToMenuProps) => void;
  onMaterialCreate: (material: Material) => void;
  onProductCreate: (product: Product) => void;
  firebase: Firebase;
}
interface DialogGoodsValues {
  planMode: GoodsPlanMode;
  quantity: number;
  unit: Unit["key"];
  product: Product | null;
  material: Material | null;
  dialogOpen: boolean;
}
interface OnAddGoodToMenuProps {
  planMode: GoodsPlanMode;
  quantity: number;
  unit: Unit["key"];
  product: Product | null;
  material: Material | null;
}

const DIALOG_VALUES_INITIAL_STATE = {
  planMode: GoodsPlanMode.TOTAL,
  quantity: 0,
  unit: "",
  product: null,
  material: null,
  // Die Werte werden erst mit dem React.useState gesetzt. Dann darf der Dialog nicht
  // bereits geöffnet seind, darum wird der Zustand auch über den useState gesteuert
  // ansonsten wäre der Autocomplete jeweils leer
  dialogOpen: false,
};

export const DialogGoods = ({
  open,
  goodsType,
  units,
  products,
  materials,
  productToUpdate,
  materialToUpdate,
  departments,
  firebase,
  authUser,
  onCancel: onCancelSuper,
  onOk: onOkSuper,
  onMaterialCreate: onMaterialCreateSuper,
  onProductCreate: onProductCreateSuper,
}: DialogGoodsProps) => {
  const theme = useTheme();
  const [dialogValues, setDialogValues] = React.useState<DialogGoodsValues>(
    DIALOG_VALUES_INITIAL_STATE
  );
  const [materialAddPopupValues, setMaterialAddPopupValues] = React.useState({
    ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
    ...{popUpOpen: false},
  });
  const [productAddPopupValues, setProductAddPopupValues] = React.useState({
    ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
    ...{popUpOpen: false},
  });
  // Falls initialer Wert kommt diesen übernehmen

  if (
    goodsType == GoodsType.PRODUCT &&
    productToUpdate !== null &&
    !dialogValues.product
  ) {
    const product = products.find(
      (product) => product.uid == productToUpdate.productUid
    );

    if (product) {
      setDialogValues({
        ...dialogValues,
        planMode: productToUpdate.planMode,
        quantity: productToUpdate.quantity,
        unit: productToUpdate.unit,
        product: product,
        dialogOpen: open,
      });
    }
  } else if (
    goodsType == GoodsType.MATERIAL &&
    materialToUpdate !== null &&
    !dialogValues.material
  ) {
    const material = materials.find(
      (material) => material.uid == materialToUpdate.materialUid
    );
    if (material) {
      setDialogValues({
        ...dialogValues,
        planMode: materialToUpdate.planMode,
        quantity: materialToUpdate.quantity,
        unit: materialToUpdate.unit,
        material: material,
        dialogOpen: open,
      });
    }
  } else if (open === true && dialogValues.dialogOpen === false) {
    // Item wird neu hinzugefügt, einfach den Dialog öffnen
    setDialogValues({...dialogValues, dialogOpen: true});
  }
  /* ------------------------------------------
  // Typ der Einplanung
  // ------------------------------------------ */
  const onTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null
  ) => {
    if (newValue === null) {
      // Ein Button muss immer aktiv sein
      return;
    }

    setDialogValues({
      ...dialogValues,
      planMode: newValue as unknown as GoodsPlanMode,
    });
  };
  /* ------------------------------------------
  // Feld-Änderung
  // ------------------------------------------ */
  const onChangeField = (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Unit | Product | Material | null,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => {
    let material: Material;
    let product: Product;

    if (
      (action === "select-option" || action === "blur") &&
      objectId?.startsWith("material")
    ) {
      // Prüfen ob neues Material angelegt wird
      material = newValue as Material;
      if (typeof material === "object" && material?.name.endsWith(TEXT_ADD)) {
        // Begriff Hinzufügen und Anführzungszeichen entfernen
        const materialName = material.name.match('".*"')![0].slice(1, -1);

        // Neues Produkt. PopUp Anzeigen und nicht weiter
        setMaterialAddPopupValues({
          ...materialAddPopupValues,
          name: materialName,
          popUpOpen: true,
        });
        return;
      } else {
        if (typeof newValue === "string") {
          material = materials.find((mat) => mat.name == newValue)!;
        }
        if (material) {
          setDialogValues({
            ...dialogValues,
            material: material ? material : null,
          });
        }
        return;
      }
    } else if (
      (action === "select-option" || action === "blur") &&
      objectId?.startsWith("product")
    ) {
      // Prüfen ob neues Produkt angelegt wird
      product = newValue as Product;
      if (typeof product === "object" && product.name.endsWith(TEXT_ADD)) {
        // Begriff Hinzufügen und Anführzungszeichen entfernen
        const productName = product.name.match('".*"')![0].slice(1, -1);

        // Neues Produkt. PopUp Anzeigen und nicht weiter
        setProductAddPopupValues({
          ...productAddPopupValues,
          name: productName,
          popUpOpen: true,
        });
        return;
      } else {
        if (typeof newValue === "string") {
          product = products.find((prd) => prd.name == newValue)!;
        }
        if (product) {
          setDialogValues({
            ...dialogValues,
            product: product ? product : null,
          });
        }
        return;
      }
    } else if (action === "clear" && objectId?.startsWith("material")) {
      setDialogValues({
        ...dialogValues,
        material: null,
      });
      return;
    } else if (action === "clear" && objectId?.startsWith("product")) {
      setDialogValues({
        ...dialogValues,
        product: null,
      });
      return;
    }

    if (objectId == "product_" || objectId == "material_") {
      setDialogValues({
        ...dialogValues,
        [objectId.slice(0, -1)]: newValue,
      });
    } else if (objectId == "unit_" || objectId == "unit") {
      const newUnit = newValue as Unit;

      setDialogValues({
        ...dialogValues,
        unit: newUnit?.key ? newUnit.key : "",
      });
    } else {
      if (isNaN(parseFloat(event.target.value))) {
        setDialogValues({
          ...dialogValues,
          [event.target.id]: event.target.value,
        });
      } else {
        setDialogValues({
          ...dialogValues,
          [event.target.id]: parseFloat(event.target.value),
        });
      }
    }
  };
  /* ------------------------------------------
  // Pop-Up Handler Material/Produkt
  // ------------------------------------------ */
  const onMaterialCreate = (material: Material) => {
    setDialogValues({...dialogValues, material: material});
    setMaterialAddPopupValues({
      ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });

    onMaterialCreateSuper(material);
  };
  const onProductCreate = (product: Product) => {
    setDialogValues({...dialogValues, product: product});
    setProductAddPopupValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
    onProductCreateSuper(product);
  };
  const onProductChooseExisting = (product: Product) => {
    setDialogValues({...dialogValues, product: product});
    setProductAddPopupValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  const onCloseDialogMaterial = () => {
    setMaterialAddPopupValues({
      ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  const onCloseDialogProduct = () => {
    setProductAddPopupValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  const onOk = () => {
    onOkSuper({
      planMode: dialogValues.planMode,
      quantity: dialogValues.quantity,
      unit: dialogValues.unit,
      product: dialogValues.product,
      material: dialogValues.material,
    });
    setMaterialAddPopupValues({
      ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
      ...{popUpOpen: false},
    });
    setProductAddPopupValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      ...{popUpOpen: false},
    });

    setDialogValues(DIALOG_VALUES_INITIAL_STATE);
  };
  const onCancel = () => {
    setMaterialAddPopupValues({
      ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
      ...{popUpOpen: false},
    });
    setProductAddPopupValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      ...{popUpOpen: false},
    });

    setDialogValues(DIALOG_VALUES_INITIAL_STATE);
    onCancelSuper();
  };
  return (
    <React.Fragment>
      <Dialog
        aria-labelledby="Dialog Goods"
        open={dialogValues.dialogOpen}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {goodsType === GoodsType.MATERIAL ? TEXT_MATERIAL : TEXT_PRODUCTS}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {goodsType == GoodsType.MATERIAL
              ? TEXT_EXPLANATION_DIALOG_GOODS_TYPE_MATERIAL
              : TEXT_EXPLANATION_DIALOG_GOODS_TYPE_PRODUCT}
          </Typography>
          <br />
          <ToggleButtonGroup
            value={dialogValues.planMode}
            exclusive
            onChange={onTypeChange}
            style={{marginBottom: theme.spacing(2), width: "100%"}}
          >
            <ToggleButton
              value={GoodsPlanMode.TOTAL}
              aria-label={TEXT_TOTAL}
              style={{width: "100%"}}
            >
              {TEXT_TOTAL}
            </ToggleButton>
            <ToggleButton
              value={GoodsPlanMode.PER_PORTION}
              aria-label={TEXT_PER_PORTION}
              style={{width: "100%"}}
            >
              {TEXT_PER_PORTION}
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" color="textSecondary">
            {dialogValues.planMode == GoodsPlanMode.TOTAL
              ? TEXT_EXPLANATION_DIALOG_GOODS_OPTION_TOTAL(
                  goodsType == GoodsType.MATERIAL
                    ? TEXT_MATERIAL
                    : TEXT_PRODUCTS
                )
              : TEXT_EXPLANATION_DIALOG_GOODS_OPTION_PER_PORTION}
          </Typography>
          <br />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {goodsType === GoodsType.PRODUCT ? (
                <ProductAutocomplete
                  componentKey={""}
                  product={
                    dialogValues.product ? dialogValues.product : new Product()
                  }
                  products={products}
                  onChange={onChangeField}
                  label={TEXT_PRODUCT}
                />
              ) : (
                <MaterialAutocomplete
                  componentKey={""}
                  disabled={false}
                  material={
                    dialogValues.material
                      ? dialogValues.material
                      : ({} as Material)
                  }
                  materials={materials}
                  onChange={onChangeField}
                />
              )}
            </Grid>

            <Grid item xs={goodsType === GoodsType.PRODUCT ? 6 : 12}>
              <TextField
                key={"quantity"}
                id={"quantity"}
                value={
                  Number.isNaN(dialogValues.quantity) ||
                  dialogValues.quantity === 0
                    ? ""
                    : dialogValues.quantity
                }
                label={TEXT_QUANTITY}
                type="number"
                inputProps={{min: 0}}
                onChange={onChangeField}
                fullWidth
              />
            </Grid>
            {goodsType === GoodsType.PRODUCT && (
              <Grid item xs={6}>
                <UnitAutocomplete
                  componentKey={""}
                  unitKey={dialogValues.unit}
                  units={units}
                  onChange={onChangeField}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          {/* schliessen */}
          <Button onClick={onCancel} color="primary" variant="outlined">
            {TEXT_CANCEL}
          </Button>
          <Button
            onClick={onOk}
            disabled={!dialogValues.material?.uid && !dialogValues.product?.uid}
            //   Object.keys(dialogValues.material).length == 0 &&
            //   Object.keys(dialogValues.product).length == 0
            // }
            color="primary"
            variant="contained"
          >
            {TEXT_OK}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog um neues Material anzulegen */}
      <DialogMaterial
        materialName={materialAddPopupValues.name}
        materialUid={materialAddPopupValues.uid}
        materialType={materialAddPopupValues.type}
        materialUsable={materialAddPopupValues.usable}
        materials={materials}
        dialogType={MaterialDialog.CREATE}
        dialogOpen={materialAddPopupValues.popUpOpen}
        handleOk={onMaterialCreate}
        handleClose={onCloseDialogMaterial}
        authUser={authUser}
        firebase={firebase}
      />
      <DialogProduct
        firebase={firebase}
        productName={productAddPopupValues.name}
        productUid={productAddPopupValues.uid}
        productDietProperties={productAddPopupValues.dietProperties}
        usable={productAddPopupValues.usable}
        dialogType={ProductDialog.CREATE}
        dialogOpen={productAddPopupValues.popUpOpen}
        handleOk={onProductCreate}
        handleClose={onCloseDialogProduct}
        handleChooseExisting={onProductChooseExisting}
        products={products}
        units={units}
        departments={departments}
        authUser={authUser}
      />
    </React.Fragment>
  );
};
export default MenuplanPage;
