import React from "react";
import {compose} from "react-recompose";

import {useHistory} from "react-router";
import _ from "lodash";

import {
  Container,
  Backdrop,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  Grid,
  Button,
  Typography,
} from "@material-ui/core";

import useStyles from "../../../constants/styles";

import Event, {EventRefDocuments} from "./event.class";
import PageTitle from "../../Shared/pageTitle";

import {
  MENUPLAN as TEXT_MENUPLAN,
  QUANTITY_CALCULATION as TEXT_QUANTITY_CALCULATION,
  PLANED_RECIPES as TEXT_PLANED_RECIPES,
  SHOPPING_LIST as TEXT_SHOPPING_LIST,
  MATERIAL_LIST as TEXT_MATERIAL_LIST,
  EVENT_INFO_SHORT as TEXT_EVENT_INFO_SHORT,
  MATERIAL_CREATED as TEXT_MATERIAL_CREATED,
  PRODUCT_CREATED as TEXT_PRODUCT_CREATED,
  DISCARD_CHANGES as TEXT_DISCARD_CHANGES,
  SAVE as TEXT_SAVE,
  DELETION_AFFECTS_PLANED_DAYS as TEXT_DELETION_AFFECTS_PLANED_DAYS,
  ATTENTION_ABOUT_TO_DELETE_PLANED_DAYS as TEXT_ATTENTION_ABOUT_TO_DELETE_PLANED_DAYS,
  PROCEED as TEXT_PROCEED,
  EVENT_SAVE_SUCCESS as TEXT_EVENT_SAVE_SUCCESS,
  IMAGE_IS_BEEING_UPLOADED as TEXT_IMAGE_IS_BEEING_UPLOADED,
  EVENT_IS_BEEING_SAVED as TEXT_EVENT_IS_BEEING_SAVED,
  DELETE_EVENT as TEXT_DELETE_EVENT,
} from "../../../constants/text";

import {HOME as ROUTE_HOME} from "../../../constants/routes";

import Recipe, {Recipes} from "../../Recipe/recipe.class";
import Unit from "../../Unit/unit.class";

import AuthUser from "../../Firebase/Authentication/authUser.class";
import EventGroupConfiguration from "../GroupConfiguration/groupConfiguration.class";
import MenuplanPage from "../Menuplan/menuplan";
import EventGroupConfigurationPage from "../GroupConfiguration/groupConfigruation";
import EventUsedRecipesPage from "../UsedRecipes/usedRecipes";
import Menuplan from "../Menuplan/menuplan.class";
import UsedRecipes from "../UsedRecipes/usedRecipes.class";
import Utils from "../../Shared/utils.class";
import RecipeShort from "../../Recipe/recipeShort.class";
import Material from "../../Material/material.class";
import Product from "../../Product/product.class";
import CustomSnackbar, {Snackbar} from "../../Shared/customSnackbar";
import Department from "../../Department/department.class";
import UnitConversion, {
  UnitConversionBasic,
  UnitConversionProducts,
} from "../../Unit/unitConversion.class";
import EventShoppingListPage from "../ShoppingList/shoppingList";
import ShoppingListCollection from "../ShoppingList/shoppingListCollection.class";
import ShoppingList from "../ShoppingList/shoppingList.class";
import EventMaterialListPage from "../MaterialList/materialList";
import MaterialList from "../MaterialList/materialList.class";
import EventInfoPage from "./eventInfo";
import {FormValidationFieldError} from "../../Shared/fieldValidation.error.class";
import {
  DialogType,
  SingleTextInputResult,
  useCustomDialog,
} from "../../Shared/customDialogContext";
import Action from "../../../constants/actions";
import {ValueObject} from "../../Firebase/Db/firebase.db.super.class";
import {withFirebase} from "../../Firebase/firebaseContext";
import {
  AuthUserContext,
  withAuthorization,
} from "../../Session/authUserContext";
import {CustomRouterProps} from "../../Shared/global.interface";
import withEmailVerification from "../../Session/withEmailVerification";

/* ===================================================================
// ============================== Global =============================
// =================================================================== */
enum EventTabs {
  menuplan,
  quantityCalculation,
  usedRecipes,
  shoppingList,
  materialList,
  eventInfo,
}
interface DeriveEventUid {
  event: Event | undefined;
  pathname: string;
}
const deriveEventUid = ({event, pathname}: DeriveEventUid) => {
  if (event?.uid) {
    return event.uid;
  } else {
    return pathname.split("/").slice(-1).toString();
  }
};
export interface OnMenuplanUpdate {
  field: string;
  value: ValueObject;
}
export interface FetchMissingDataProps {
  type: FetchMissingDataType;
  recipeShort?: RecipeShort;
  objectUid?: string;
}
export interface OnMasterdataCreateProps {
  type: MasterDataCreateType;
  value: Material | Product;
}
export enum FetchMissingDataType {
  RECIPE,
  RECIPES,
  UNITS,
  PRODUCTS,
  MATERIALS,
  DEPARTMENTS,
  UNIT_CONVERSION,
  SHOPPING_LIST,
}
export enum MasterDataCreateType {
  MATERIAL = "MATERIAL",
  PRODUCT = "PRODUCT",
}

function tabProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}
/* ===================================================================
// ============================ Dispatcher ===========================
// =================================================================== */
enum ReducerActions {
  EVENT_FETCH_INIT,
  EVENT_FETCH_SUCCESS,
  EVENT_SAVE_INIT,
  EVENT_SAVE_SUCCESS,
  EVENT_DELETE_START,
  GROUP_CONFIG_FETCH_INIT,
  GROUP_CONFIG_FETCH_SUCCESS,
  MENUPLAN_FETCH_INIT,
  MENUPLAN_FETCH_SUCCESS,
  USED_RECIPES_FETCH_INIT,
  USED_RECIPES_FETCH_SUCCESS,
  SHOPPINGLIST_COLLECTION_FETCH_INIT,
  SHOPPINGLIST_COLLECTION_FETCH_SUCCESS,
  SHOPPINGLIST_FETCH_INIT,
  SHOPPINGLIST_FETCH_SUCCESS_DATA,
  SHOPPINGLIST_FETCH_SUCCESS_LISTENER,
  MATERIALLIST_FETCH_INIT,
  MATERIALLIST_FETCH_SUCCESS,
  RECIPE_FETCH_INIT,
  RECIPE_FETCH_SUCCESS,
  RECIPES_FETCH_SUCCESS,
  RECIPE_LIST_FETCH_INIT,
  RECIPE_LIST_FETCH_SUCCESS,
  UNTIS_FETCH_INIT,
  UNITS_FETCH_SUCCESS,
  PRODUCTS_FETCH_INIT,
  PRODUCTS_FETCH_SUCCESS,
  MATERIALS_FETCH_INIT,
  MATERIALS_FETCH_SUCCESS,
  DEPARTMENTS_FETCH_INIT,
  DEPARTMENTS_FETCH_SUCCESS,
  UNIT_CONVERSION_FETCH_INIT,
  UNIT_CONVERSION_FETCH_SUCCES,
  ON_MASTERDATA_CREATE,
  ON_RECIPE_UPDATE,
  SNACKBAR_CLOSE,
  SNACKBAR_SHOW,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  event: Event;
  menuplan: Menuplan;
  groupConfig: EventGroupConfiguration;
  usedRecipes: UsedRecipes;
  shoppingListCollection: ShoppingListCollection;
  shoppingList: {value: ShoppingList | null; unsubscribe: (() => void) | null};
  materialList: MaterialList;
  recipes: Recipes;
  // Rezept-Übersicht
  recipeList: RecipeShort[];
  units: Unit[];
  products: Product[];
  materials: Material[];
  departments: Department[];
  unitConversionBasic: UnitConversionBasic | null;
  unitConversionProducts: UnitConversionProducts | null;
  snackbar: Snackbar;
  isLoading: boolean;
  isSaving: boolean;
  loadingComponents: {
    event: boolean;
    groupConfig: boolean;
    menuplan: boolean;
    usedRecipes: boolean;
    shoppingListCollection: boolean;
    shoppingLists: boolean;
    materialList: boolean;
    recipe: boolean;
    recipes: boolean;
    units: boolean;
    products: boolean;
    materials: boolean;
    departments: boolean;
    unitCoversion: boolean;
  };
  isError: boolean;
  error: Error | null;
};

const eventReducer = (state: State, action: DispatchAction): State => {
  let newRecipes = {} as Recipes;
  switch (action.type) {
    case ReducerActions.EVENT_FETCH_INIT: {
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, event: true},
      };
    }
    case ReducerActions.EVENT_SAVE_INIT:
      return {...state, isSaving: true};
    case ReducerActions.EVENT_SAVE_SUCCESS:
      return {...state, isSaving: false};
    case ReducerActions.EVENT_DELETE_START:
      return {...state, isLoading: true};
    case ReducerActions.GROUP_CONFIG_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, groupConfig: true},
      };
    case ReducerActions.MENUPLAN_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, menuplan: true},
      };
    case ReducerActions.EVENT_FETCH_SUCCESS:
      return {
        ...state,
        event: action.payload as Event,
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          event: false,
        }),
        loadingComponents: {...state.loadingComponents, event: false},
      };
    case ReducerActions.USED_RECIPES_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, usedRecipes: true},
      };
    case ReducerActions.USED_RECIPES_FETCH_SUCCESS:
      return {
        ...state,
        usedRecipes: action.payload as UsedRecipes,
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          usedRecipes: false,
        }),
        loadingComponents: {...state.loadingComponents, usedRecipes: false},
      };
    case ReducerActions.GROUP_CONFIG_FETCH_SUCCESS:
      return {
        ...state,
        groupConfig: action.payload as EventGroupConfiguration,
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          groupConfig: false,
        }),
        loadingComponents: {...state.loadingComponents, groupConfig: false},
      };
    case ReducerActions.MENUPLAN_FETCH_SUCCESS:
      return {
        ...state,
        menuplan: action.payload as Menuplan,
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          menuplan: false,
        }),
        loadingComponents: {...state.loadingComponents, menuplan: false},
      };
    case ReducerActions.SHOPPINGLIST_COLLECTION_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {
          ...state.loadingComponents,
          shoppingListCollection: true,
        },
      };
    case ReducerActions.SHOPPINGLIST_COLLECTION_FETCH_SUCCESS:
      return {
        ...state,
        shoppingListCollection: action.payload as ShoppingListCollection,
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          shoppingListCollection: false,
        }),
        loadingComponents: {
          ...state.loadingComponents,
          shoppingListCollection: false,
        },
      };
    case ReducerActions.SHOPPINGLIST_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, shoppingLists: true},
      };
    case ReducerActions.SHOPPINGLIST_FETCH_SUCCESS_DATA:
      return {
        ...state,
        shoppingList: {
          ...state.shoppingList,
          value: action.payload as ShoppingList,
        },
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          shoppingLists: false,
        }),
        loadingComponents: {
          ...state.loadingComponents,
          shoppingLists: false,
        },
      };
    case ReducerActions.SHOPPINGLIST_FETCH_SUCCESS_LISTENER:
      return {
        ...state,
        shoppingList: {
          ...state.shoppingList,
          unsubscribe: action.payload as () => void,
        },
      };
    case ReducerActions.MATERIALLIST_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, materialList: true},
      };
    case ReducerActions.MATERIALLIST_FETCH_SUCCESS:
      return {
        ...state,
        materialList: action.payload as MaterialList,
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          materialList: false,
        }),
        loadingComponents: {
          ...state.loadingComponents,
          materialList: false,
        },
      };
    case ReducerActions.RECIPE_FETCH_INIT: {
      newRecipes = {...state.recipes};
      // Werte der Recipe-Short zwinschenspeichern damit
      // schon mal was angezeigt wird
      const tempRecipe = {
        ...new Recipe(),
        uid: action.payload.uid,
        name: action.payload.name,
        pictureSrc: action.payload.pictureSrc,
      };
      newRecipes[tempRecipe.uid] = tempRecipe;
      return {
        ...state,
        recipes: newRecipes,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, recipe: true},
      };
    }
    case ReducerActions.RECIPE_FETCH_SUCCESS: {
      // Einzelnes Rezept aus der DB
      newRecipes = {...state.recipes};
      const recipe = action.payload as Recipe;
      newRecipes[recipe.uid] = recipe;

      return {
        ...state,
        recipes: newRecipes,
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          recipe: false,
        }),
        loadingComponents: {...state.loadingComponents, recipe: false},
      };
    }
    case ReducerActions.RECIPES_FETCH_SUCCESS:
      return {
        ...state,
        recipes: action.payload as Recipes,
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          recipe: false,
        }),
        loadingComponents: {...state.loadingComponents, recipe: false},
      };
    case ReducerActions.RECIPE_LIST_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, recipes: true},
      };
    case ReducerActions.RECIPE_LIST_FETCH_SUCCESS:
      return {
        ...state,
        recipeList: action.payload as RecipeShort[],
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          recipes: false,
        }),
        loadingComponents: {...state.loadingComponents, recipes: false},
      };
    case ReducerActions.UNTIS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, units: true},
      };
    case ReducerActions.UNITS_FETCH_SUCCESS:
      return {
        ...state,
        units: action.payload as Unit[],
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          units: false,
        }),
        loadingComponents: {...state.loadingComponents, units: false},
      };
    case ReducerActions.PRODUCTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, products: true},
      };
    case ReducerActions.PRODUCTS_FETCH_SUCCESS:
      return {
        ...state,
        products: action.payload as Product[],
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          products: false,
        }),
        loadingComponents: {...state.loadingComponents, products: false},
      };
    case ReducerActions.MATERIALS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, materials: true},
      };
    case ReducerActions.MATERIALS_FETCH_SUCCESS:
      return {
        ...state,
        materials: action.payload as Material[],
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          materials: false,
        }),
        loadingComponents: {...state.loadingComponents, materials: false},
      };
    case ReducerActions.DEPARTMENTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, departments: true},
      };
    case ReducerActions.DEPARTMENTS_FETCH_SUCCESS:
      return {
        ...state,
        departments: action.payload as Department[],
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          departments: false,
        }),
        loadingComponents: {...state.loadingComponents, departments: false},
      };
    case ReducerActions.ON_MASTERDATA_CREATE: {
      const memberName = `${action.payload.type.toLowerCase()}s`;
      let newValues = state[memberName];
      const newValue = newValues.find(
        (value) => value.uid == action.payload.value.uid
      );
      // Wenn es das schon gibt, nichts tun
      if (!newValue) {
        newValues.push(action.payload.value);

        newValues = Utils.sortArray({
          array: newValues,
          attributeName: "name",
        });
      }
      return {...state, [memberName]: newValues};
    }
    case ReducerActions.ON_RECIPE_UPDATE: {
      const newRecipe = action.payload as Recipe;
      let updatedRecipeList = [...state.recipeList];
      const updatedRecipes = {...state.recipes};
      updatedRecipes[newRecipe.uid] = newRecipe;

      const arrayIndex = updatedRecipeList.findIndex(
        (recipeShort) => recipeShort.uid == newRecipe.uid
      );

      if (arrayIndex !== -1) {
        updatedRecipeList[arrayIndex] =
          RecipeShort.createShortRecipeFromRecipe(newRecipe);
      } else {
        // Neues Rezept aufnehmen
        updatedRecipeList.push(
          RecipeShort.createShortRecipeFromRecipe(newRecipe)
        );
      }
      // Array sortieren
      updatedRecipeList = Utils.sortArray({
        array: updatedRecipeList,
        attributeName: "name",
      });

      return {
        ...state,
        recipeList: updatedRecipeList,
        recipes: updatedRecipes,
      };
    }
    case ReducerActions.UNIT_CONVERSION_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, unitCoversion: true},
      };
    case ReducerActions.UNIT_CONVERSION_FETCH_SUCCES:
      return {
        ...state,
        unitConversionBasic: action.payload
          .unitConversionBasic as UnitConversionBasic,
        unitConversionProducts: action.payload
          .unitConversionProducts as UnitConversionProducts,
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          unitCoversion: false,
        }),
        loadingComponents: {...state.loadingComponents, unitCoversion: false},
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
    case ReducerActions.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isError: true,
        isLoading: false,
        error: action.payload as Error,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

const INITITIAL_STATE: State = {
  event: new Event(),
  menuplan: new Menuplan(),
  groupConfig: new EventGroupConfiguration(),
  usedRecipes: new UsedRecipes(),
  shoppingListCollection: new ShoppingListCollection(),
  shoppingList: {value: null, unsubscribe: null},
  materialList: new MaterialList(),
  recipes: {} as Recipes,
  recipeList: [],
  units: [],
  products: [],
  materials: [],
  departments: [],
  snackbar: {} as Snackbar,
  unitConversionBasic: null,
  unitConversionProducts: null,
  isLoading: false,
  isSaving: false,
  loadingComponents: {
    event: false,
    groupConfig: false,
    menuplan: false,
    usedRecipes: false,
    shoppingListCollection: false,
    shoppingLists: false,
    materialList: false,
    recipe: false,
    recipes: false,
    units: false,
    products: false,
    materials: false,
    departments: false,
    unitCoversion: false,
  },
  isError: false,
  error: null,
};

interface EventDraftState {
  event: Event;
  localPicture: File | null;
  formValidation: FormValidationFieldError[];
}
const INTITIAL_STATE_EVENT_DRAF: EventDraftState = {
  event: new Event(),
  localPicture: null,
  formValidation: [],
};
interface LocationState {
  event: Event;
}
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const EventPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <EventBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const EventBase: React.FC<
  CustomRouterProps<undefined, LocationState> & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const theme = useTheme();
  const {customDialog} = useCustomDialog();
  const {push} = useHistory();

  const classes = useStyles();
  let eventUid = "";

  const [state, dispatch] = React.useReducer(eventReducer, INITITIAL_STATE);
  const [activeTab, setActiveTab] = React.useState(EventTabs.menuplan);
  const [eventDraft, setEventDraft] = React.useState(INTITIAL_STATE_EVENT_DRAF);

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  if (!eventUid) {
    eventUid = deriveEventUid({
      event: props.location.state?.event,
      pathname: props.location.pathname,
    });
  }

  React.useEffect(() => {
    // Event
    let unsubscribe: (() => void) | undefined;
    if (!state.event.uid) {
      dispatch({type: ReducerActions.EVENT_FETCH_INIT, payload: {}});
      Event.getEventListener({
        firebase: firebase,
        uid: eventUid,
        callback: (event) => {
          dispatch({
            type: ReducerActions.EVENT_FETCH_SUCCESS,
            payload: event,
          });
        },
      })
        .then((result) => {
          unsubscribe = result;
        })
        .catch((error) => {
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
    }
    return function cleanup() {
      unsubscribe && unsubscribe();
    };
  }, []);
  React.useEffect(() => {
    //Group-Config
    let unsubscribe: (() => void) | undefined;
    dispatch({type: ReducerActions.GROUP_CONFIG_FETCH_INIT, payload: {}});
    EventGroupConfiguration.getGroupConfigurationListener({
      firebase: firebase,
      uid: eventUid,
      callback: (groupConfigruation) => {
        dispatch({
          type: ReducerActions.GROUP_CONFIG_FETCH_SUCCESS,
          payload: groupConfigruation,
        });
      },
    })
      .then((result) => {
        unsubscribe = result;
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
    return function cleanup() {
      unsubscribe && unsubscribe();
    };
  }, []);
  React.useEffect(() => {
    //Menüplan
    let unsubscribe: (() => void) | undefined;
    if (!state.menuplan.uid) {
      dispatch({type: ReducerActions.MENUPLAN_FETCH_INIT, payload: {}});
      Menuplan.getMenuplanListener({
        firebase: firebase,
        uid: eventUid,
        callback: (menuplan) => {
          dispatch({
            type: ReducerActions.MENUPLAN_FETCH_SUCCESS,
            payload: menuplan,
          });
        },
      })
        .then((result) => {
          unsubscribe = result;
        })
        .catch((error) => {
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
    }

    return function cleanup() {
      unsubscribe && unsubscribe();
    };
  }, []);
  React.useEffect(() => {
    // ShoppingList-Collection
    if (
      activeTab == EventTabs.shoppingList &&
      !state.shoppingListCollection.eventUid &&
      state.event.refDocuments?.includes(EventRefDocuments.shoppingList)
    ) {
      let unsubscribe: (() => void) | undefined;
      dispatch({
        type: ReducerActions.SHOPPINGLIST_COLLECTION_FETCH_INIT,
        payload: {},
      });
      ShoppingListCollection.getShoppingListCollectionListener({
        firebase: firebase,
        eventUid: eventUid,
        callback: (shoppingListCollection) => {
          dispatch({
            type: ReducerActions.SHOPPINGLIST_COLLECTION_FETCH_SUCCESS,
            payload: shoppingListCollection,
          });
        },
      })
        .then((result) => {
          unsubscribe = result;
        })
        .catch((error) => {
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
      return function cleanup() {
        unsubscribe && unsubscribe();
      };
    }
  }, [activeTab, state.event.refDocuments]);
  React.useEffect(() => {
    // Unit Conversion
    if (
      (activeTab == EventTabs.quantityCalculation ||
        activeTab == EventTabs.shoppingList) &&
      (state.unitConversionBasic == null ||
        state.unitConversionProducts == null)
    ) {
      dispatch({type: ReducerActions.UNIT_CONVERSION_FETCH_INIT, payload: {}});

      UnitConversion.getAllConversionBasic({firebase: firebase})
        .then((result) => {
          const unitConversionBasic = result;
          UnitConversion.getAllConversionProducts({firebase: firebase}).then(
            (result) => {
              dispatch({
                type: ReducerActions.UNIT_CONVERSION_FETCH_SUCCES,
                payload: {
                  unitConversionBasic: unitConversionBasic,
                  unitConversionProducts: result,
                },
              });
            }
          );
        })
        .catch((error) => {
          dispatch({
            type: ReducerActions.GENERIC_ERROR,
            payload: error,
          });
        });
    }
  }, [activeTab]);
  React.useEffect(() => {
    // Produkte
    if (
      (activeTab == EventTabs.quantityCalculation ||
        activeTab == EventTabs.shoppingList) &&
      state.products.length == 0
    ) {
      dispatch({type: ReducerActions.PRODUCTS_FETCH_INIT, payload: {}});
      Product.getAllProducts({
        firebase: firebase,
        onlyUsable: true,
        withDepartmentName: false,
      })
        .then((result) => {
          dispatch({
            type: ReducerActions.PRODUCTS_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatch({
            type: ReducerActions.GENERIC_ERROR,
            payload: error,
          });
        });
    }
  }, [activeTab]);
  React.useEffect(() => {
    // Abteilungen
    if (activeTab == EventTabs.shoppingList && state.departments.length == 0) {
      dispatch({type: ReducerActions.DEPARTMENTS_FETCH_INIT, payload: {}});
      Department.getAllDepartments({firebase: firebase})
        .then((result) => {
          dispatch({
            type: ReducerActions.DEPARTMENTS_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatch({
            type: ReducerActions.GENERIC_ERROR,
            payload: error,
          });
        });
    }
  }, [activeTab]);
  React.useEffect(() => {
    // Materiale
    if (
      (activeTab == EventTabs.shoppingList ||
        activeTab == EventTabs.materialList) &&
      state.materials.length == 0
    ) {
      dispatch({type: ReducerActions.MATERIALS_FETCH_INIT, payload: {}});

      Material.getAllMaterials({
        firebase: firebase,
        onlyUsable: true,
      })
        .then((result) => {
          dispatch({
            type: ReducerActions.MATERIALS_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatch({
            type: ReducerActions.GENERIC_ERROR,
            payload: error,
          });
        });
    }
  }, [activeTab]);
  React.useEffect(() => {
    // Einheiten
    if (activeTab == EventTabs.shoppingList && state.units.length == 0) {
      dispatch({type: ReducerActions.UNTIS_FETCH_INIT, payload: {}});

      Unit.getAllUnits({
        firebase: firebase,
      })
        .then((result) => {
          dispatch({
            type: ReducerActions.UNITS_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatch({
            type: ReducerActions.GENERIC_ERROR,
            payload: error,
          });
        });
    }
  }, [activeTab]);
  React.useEffect(() => {
    // Verwendete Rezepte
    if (
      activeTab == EventTabs.usedRecipes &&
      !state.usedRecipes.uid &&
      state.event.refDocuments?.includes(EventRefDocuments.usedRecipes)
    ) {
      let unsubscribe: () => void;
      dispatch({type: ReducerActions.USED_RECIPES_FETCH_INIT, payload: {}});
      UsedRecipes.getUsedRecipesListener({
        firebase: firebase,
        uid: eventUid,
        callback: (usedRecipes) => {
          dispatch({
            type: ReducerActions.USED_RECIPES_FETCH_SUCCESS,
            payload: usedRecipes,
          });
        },
      })
        .then((result) => {
          unsubscribe = result;
        })
        .catch((error) => {
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
      return function cleanup() {
        unsubscribe();
      };
    }
  }, [activeTab, state.event.refDocuments]);
  React.useEffect(() => {
    // Materialliste
    if (
      activeTab == EventTabs.materialList &&
      !state.materialList.uid &&
      state.event.refDocuments?.includes(EventRefDocuments.materialList)
    ) {
      let unsubscribe: () => void;
      dispatch({type: ReducerActions.MATERIALLIST_FETCH_INIT, payload: {}});
      MaterialList.getMaterialListListener({
        firebase: firebase,
        uid: eventUid,
        callback: (materialList) => {
          dispatch({
            type: ReducerActions.MATERIALLIST_FETCH_SUCCESS,
            payload: materialList,
          });
        },
      })
        .then((result) => {
          unsubscribe = result;
        })
        .catch((error) => {
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
      return function cleanup() {
        unsubscribe();
      };
    }
  }, [activeTab, state.event.refDocuments]);
  React.useEffect(() => {
    if (activeTab === EventTabs.eventInfo && !eventDraft.event.uid) {
      setEventDraft(_.cloneDeep({...eventDraft, event: state.event}));
    }
  }, [activeTab]);
  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
  // Tab-Handling
  // ------------------------------------------ */
  const onTabChange = (
    event: React.ChangeEvent<Record<string, unknown>>,
    newValue: number
  ) => {
    setActiveTab(newValue);
  };
  /* ------------------------------------------
  // Change-Handling
  // ------------------------------------------ */
  const onMenuplanUpdate = (menuplan: Menuplan) => {
    Menuplan.save({
      menuplan: menuplan,
      firebase: firebase,
      authUser: authUser as AuthUser,
    }).catch((error) => {
      console.error(error);
      dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
    });
    // Kein zurückschreiben in den State, da der Listener, das wieder erhält....
  };
  const onRecipeUpdate = (recipe: Recipe) => {
    // in den bestehenden Rezepten anpassen
    dispatch({
      type: ReducerActions.ON_RECIPE_UPDATE,
      payload: recipe,
    });
  };
  const onGroupConfigurationUpdate = (
    // Alle Portionen im Menüplan neu berechnen und update
    groupConfiguration: EventGroupConfiguration
  ) => {
    const menuplan = Menuplan.recalculatePortions({
      menuplan: state.menuplan,
      groupConfig: groupConfiguration,
    });

    // neuer Menüplan speichern
    onMenuplanUpdate(menuplan);

    // Kein zurückschreiben in den State, da der Listener, das wieder erhält....

    // // neue GroupConfig in State aufnehmen
    // dispatch({
    //   type: ReducerActions.GROUP_CONFIG_FETCH_SUCCESS,
    //   payload: groupConfiguration,
    // });
  };
  const onShoppingListUpdate = (shoppingList: ShoppingList) => {
    ShoppingList.save({
      firebase: firebase,
      eventUid: state.event.uid,
      shoppingList: shoppingList,
      authUser: authUser,
    });
    // Kein zurückschreiben in den State, da der Listener, das wieder erhält....
  };
  const onShoppingCollectionUpdate = (
    shoppingListCollection: ShoppingListCollection
  ) => {
    ShoppingListCollection.save({
      firebase: firebase,
      eventUid: state.event.uid,
      shoppingListCollection: shoppingListCollection,
      authUser: authUser,
    }).then(() => {
      if (!state.event.refDocuments?.includes(EventRefDocuments.shoppingList)) {
        // Den Event-Updaten mit der Info, dass ein neues Dokument vorhanden ist
        // dann springt auch der Listener für die Used Recipes an.
        const updateRefDocuments = Event.addRefDocument({
          refDocuments: state.event.refDocuments,
          newDocumentType: EventRefDocuments.shoppingList,
        });
        Event.save({
          firebase: firebase,
          event: {...state.event, refDocuments: updateRefDocuments},
          authUser: authUser,
        });
      }
    });
  };
  const onUsedRecipesUpdate = (usedRecipes: UsedRecipes) => {
    UsedRecipes.save({
      firebase: firebase,
      usedRecipes: usedRecipes,
      authUser: authUser,
    }).then(() => {
      if (!state.event.refDocuments?.includes(EventRefDocuments.usedRecipes)) {
        // Den Event-Updaten mit der Info, dass ein neues Dokument vorhanden ist
        // dann springt auch der Listener für die Used Recipes an.
        const updateRefDocuments = Event.addRefDocument({
          refDocuments: state.event.refDocuments,
          newDocumentType: EventRefDocuments.usedRecipes,
        });
        Event.save({
          firebase: firebase,
          event: {...state.event, refDocuments: updateRefDocuments},
          authUser: authUser,
        });
      }
    });
  };
  const onMaterialListUpdate = (materialList: MaterialList) => {
    MaterialList.save({
      firebase: firebase,
      materialList: materialList,
      authUser: authUser,
    }).then(() => {
      if (!state.event.refDocuments?.includes(EventRefDocuments.materialList)) {
        // Den Event-Updaten mit der Info, dass ein neues Dokument vorhanden ist
        // dann springt auch der Listener für die Used Recipes an.
        const updateRefDocuments = Event.addRefDocument({
          refDocuments: state.event.refDocuments,
          newDocumentType: EventRefDocuments.materialList,
        });
        Event.save({
          firebase: firebase,
          event: {...state.event, refDocuments: updateRefDocuments},
          authUser: authUser,
        });
      }
    });
  };
  const onEventUpdate = (event: Event) => {
    // Der Event hat eine Schatteninstanz im React.State. Dies damit
    // die Änderungen erst beim Speichern in Kraft tretten.
    // Hintergrund. Im Schlimmsten Fall werden bei einer Anpassung der
    // Event-Eckpunkte Tage gelöscht. Dies muss bewusst stattfinden und
    // kann nicht mit Listener gleich umgesetzt werden. Darum muss die Person
    // bewusst auf speichern Klicken und der State-Wert des Events wird auf
    // die DB gespeichert und in den Globalen State übertragen
    setEventDraft({...eventDraft, event: event});
  };
  const onEventSave = async (event: Event) => {
    dispatch({type: ReducerActions.EVENT_SAVE_INIT, payload: {}});
    await Event.save({
      firebase: firebase,
      event: event,
      localPicture: eventDraft.localPicture,
      authUser: authUser,
    })
      .then(() => {
        setEventDraft({...eventDraft, event: event});
        dispatch({type: ReducerActions.EVENT_SAVE_SUCCESS, payload: {}});
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  const onEventPictureUpdate = (picture: File | null) => {
    setEventDraft({
      ...eventDraft,
      localPicture: picture,
    });
  };
  /* ------------------------------------------
  // Handling Einstellungen Event
  // ------------------------------------------ */
  const onEventDiscardChanges = () => {
    setEventDraft(_.cloneDeep({...eventDraft, event: state.event}));
  };
  const onEventSaveChanges = async () => {
    // Prüfen ob die Anzahl Tage unterschiedlich sind,
    // wenn durch die Änderung Tage gelöscht wurden und
    // im Menüplan in diesen Tage in den Menüs etwas steht
    // Warnmeldung ausgeben, dass Daten allefalls gelöscht
    // werden.

    if (
      Event.checkIfDeletedDayArePlanned({
        event: eventDraft.event,
        menuplan: state.menuplan,
      })
    ) {
      const userInput = (await customDialog({
        dialogType: DialogType.Confirm,
        title: TEXT_ATTENTION_ABOUT_TO_DELETE_PLANED_DAYS,
        text: TEXT_DELETION_AFFECTS_PLANED_DAYS,
        buttonTextConfirm: TEXT_PROCEED,
      })) as SingleTextInputResult;

      if (!userInput) {
        // Abbruch
        return;
      }
    }
    const updatedMenuplan = Menuplan.adjustMenuplanWithNewDays({
      menuplan: state.menuplan,
      newEvent: eventDraft.event,
      existingEvent: state.event,
    });

    onMenuplanUpdate(updatedMenuplan);
    onEventSave(eventDraft.event);
    dispatch({
      type: ReducerActions.SNACKBAR_SHOW,
      payload: {
        severity: "success",
        message: TEXT_EVENT_SAVE_SUCCESS(state.event.name),
      },
    });
  };
  const onEventDelete = async () => {
    const isConfirmed = await customDialog({
      dialogType: DialogType.ConfirmDeletion,
      deletionDialogProperties: {confirmationString: state.event.name},
    });
    if (!isConfirmed) {
      return;
    }
    dispatch({type: ReducerActions.EVENT_DELETE_START, payload: {}});
    await Event.delete({
      event: state.event,
      firebase: firebase,
      authUser: authUser,
    })
      .then(() => {
        // Kurzer Timeout, damit der Session-Storage nachmag
        setTimeout(function () {
          push({
            pathname: ROUTE_HOME,
            state: {
              acion: Action.DELETE,
              object: state.event.uid,
              snackbar: {
                open: true,
                severity: "success",
                message: `Anlass «${state.event.name}» wurde gelöscht.`,
              },
            },
          });
        }, 500);
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  /* ------------------------------------------
  // Fehlende Daten holen
  // ------------------------------------------ */
  const fetchMissingData = ({
    type,
    recipeShort,
    objectUid,
  }: FetchMissingDataProps) => {
    switch (type) {
      case FetchMissingDataType.RECIPES:
        dispatch({type: ReducerActions.RECIPE_LIST_FETCH_INIT, payload: {}});
        RecipeShort.getShortRecipes({
          firebase: firebase,
          authUser: authUser,
          eventUid: state.event.uid,
        })
          .then((result) => {
            dispatch({
              type: ReducerActions.RECIPE_LIST_FETCH_SUCCESS,
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

        break;
      case FetchMissingDataType.RECIPE:
        // Einzelnes Rezept lesen
        if (!recipeShort) {
          return;
        }

        dispatch({
          type: ReducerActions.RECIPE_FETCH_INIT,
          payload: recipeShort,
        });

        Recipe.getRecipe({
          firebase: firebase,
          authUser: authUser,
          uid: recipeShort.uid,
          type: recipeShort.type,
          userUid: recipeShort.created.fromUid,
          eventUid: state.event.uid,
        })
          .then((result) => {
            dispatch({
              type: ReducerActions.RECIPE_FETCH_SUCCESS,
              payload: result,
            });
          })
          .catch((error) => {
            dispatch({
              type: ReducerActions.GENERIC_ERROR,
              payload: error,
            });
          });

        break;
      case FetchMissingDataType.UNITS:
        dispatch({
          type: ReducerActions.UNTIS_FETCH_INIT,
          payload: {},
        });

        Unit.getAllUnits({firebase: firebase})
          .then((result) => {
            dispatch({
              type: ReducerActions.UNITS_FETCH_SUCCESS,
              payload: result,
            });
          })
          .catch((error) => {
            dispatch({
              type: ReducerActions.GENERIC_ERROR,
              payload: error,
            });
          });

        break;
      case FetchMissingDataType.PRODUCTS:
        dispatch({
          type: ReducerActions.PRODUCTS_FETCH_INIT,
          payload: {},
        });

        Product.getAllProducts({
          firebase: firebase,
          onlyUsable: true,
          withDepartmentName: false,
        })
          .then((result) => {
            dispatch({
              type: ReducerActions.PRODUCTS_FETCH_SUCCESS,
              payload: result,
            });
          })
          .catch((error) => {
            dispatch({
              type: ReducerActions.GENERIC_ERROR,
              payload: error,
            });
          });

        break;
      case FetchMissingDataType.MATERIALS:
        dispatch({
          type: ReducerActions.MATERIALS_FETCH_INIT,
          payload: {},
        });

        Material.getAllMaterials({
          firebase: firebase,
          onlyUsable: true,
        })
          .then((result) => {
            dispatch({
              type: ReducerActions.MATERIALS_FETCH_SUCCESS,
              payload: result,
            });
          })
          .catch((error) => {
            dispatch({
              type: ReducerActions.GENERIC_ERROR,
              payload: error,
            });
          });

        break;
      case FetchMissingDataType.DEPARTMENTS:
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
            dispatch({
              type: ReducerActions.GENERIC_ERROR,
              payload: error,
            });
          });
        break;
      case FetchMissingDataType.UNIT_CONVERSION:
        dispatch({
          type: ReducerActions.UNIT_CONVERSION_FETCH_INIT,
          payload: {},
        });
        UnitConversion.getAllConversionBasic({firebase: firebase})
          .then((result) => {
            const unitConversionBasic = result;
            UnitConversion.getAllConversionProducts({firebase: firebase}).then(
              (result) => {
                dispatch({
                  type: ReducerActions.UNIT_CONVERSION_FETCH_SUCCES,
                  payload: {
                    unitConversionBasic: unitConversionBasic,
                    unitConversionProducts: result,
                  },
                });
              }
            );
          })
          .catch((error) => {
            dispatch({
              type: ReducerActions.GENERIC_ERROR,
              payload: error,
            });
          });
        break;
      case FetchMissingDataType.SHOPPING_LIST:
        if (state.shoppingList.unsubscribe !== null) {
          // Vorheriger Listener beenden
          state.shoppingList.unsubscribe();
        }
        dispatch({type: ReducerActions.SHOPPINGLIST_FETCH_INIT, payload: {}});
        ShoppingList.getShoppingListListener({
          firebase: firebase,
          eventUid: eventUid,
          shoppingListUid: objectUid as string,
          callback: (shoppingList) => {
            dispatch({
              type: ReducerActions.SHOPPINGLIST_FETCH_SUCCESS_DATA,
              payload: shoppingList,
            });
          },
        })
          .then((result) => {
            dispatch({
              type: ReducerActions.SHOPPINGLIST_FETCH_SUCCESS_LISTENER,
              payload: result,
            });
          })
          .catch((error) => {
            console.error(error);
            dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
          });
    }
  };
  /* ------------------------------------------
  // Neue Stammdaten erstellt 
  // ------------------------------------------ */
  const onMasterdataCreate = ({type, value}: OnMasterdataCreateProps) => {
    // Neuer Wert in den State aufnehmen
    dispatch({
      type: ReducerActions.ON_MASTERDATA_CREATE,
      payload: {type: type, value: value},
    });

    dispatch({
      type: ReducerActions.SNACKBAR_SHOW,
      payload: {
        message:
          type == MasterDataCreateType.MATERIAL
            ? TEXT_MATERIAL_CREATED(value.name)
            : TEXT_PRODUCT_CREATED(value.name),
        severity: "success",
      },
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
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={state.event.name}
        subTitle={state.event.motto}
        windowTitle={`${state.event.name} | ${
          activeTab === EventTabs.menuplan
            ? TEXT_MENUPLAN
            : activeTab === EventTabs.quantityCalculation
            ? TEXT_QUANTITY_CALCULATION
            : activeTab === EventTabs.usedRecipes
            ? TEXT_PLANED_RECIPES
            : activeTab === EventTabs.shoppingList
            ? TEXT_SHOPPING_LIST
            : activeTab === EventTabs.materialList
            ? TEXT_MATERIAL_LIST
            : activeTab === EventTabs.eventInfo
            ? TEXT_EVENT_INFO_SHORT
            : ""
        }`}
      />
      {/* ===== BODY ===== */}
      <Container
        className={classes.container}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: theme.spacing(2),
        }}
        component="main"
        maxWidth="xl"
      >
        <Backdrop
          className={classes.backdrop}
          open={state.isLoading || state.isSaving}
        >
          <Grid container spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} className={classes.centerCenter}>
                <CircularProgress color="inherit" />
              </Grid>
              {state.isSaving && (
                <React.Fragment>
                  <Grid item xs={12} className={classes.centerCenter}>
                    <Typography>{TEXT_EVENT_IS_BEEING_SAVED}</Typography>
                  </Grid>
                  {eventDraft.localPicture && (
                    <Grid item xs={12} className={classes.centerCenter}>
                      <Typography>{TEXT_IMAGE_IS_BEEING_UPLOADED}</Typography>
                    </Grid>
                  )}
                </React.Fragment>
              )}
            </Grid>
          </Grid>
        </Backdrop>
        <div className={classes.menuplanTabsContainer}>
          <Tabs
            value={activeTab}
            className={classes.menuplanTabs}
            style={{
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "center",
            }}
            onChange={onTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Menuplan Tabs"
          >
            <Tab label={TEXT_MENUPLAN} {...tabProps(0)} />
            <Tab label={TEXT_QUANTITY_CALCULATION} {...tabProps(1)} />
            <Tab label={TEXT_PLANED_RECIPES} {...tabProps(2)} />
            <Tab label={TEXT_SHOPPING_LIST} {...tabProps(3)} />
            <Tab label={TEXT_MATERIAL_LIST} {...tabProps(4)} />
            <Tab label={TEXT_EVENT_INFO_SHORT} {...tabProps(5)} />
          </Tabs>
        </div>
        {activeTab == EventTabs.menuplan ? (
          <Container
            maxWidth="lg"
            style={{
              overflowX: "scroll",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <MenuplanPage
              menuplan={state.menuplan}
              groupConfiguration={state.groupConfig}
              event={state.event}
              recipeList={state.recipeList}
              recipes={state.recipes}
              units={state.units}
              products={state.products}
              materials={state.materials}
              departments={state.departments}
              firebase={firebase}
              authUser={authUser}
              onMenuplanUpdate={onMenuplanUpdate}
              fetchMissingData={fetchMissingData}
              onMasterdataCreate={onMasterdataCreate}
              onRecipeUpdate={onRecipeUpdate}
            />
          </Container>
        ) : activeTab == EventTabs.quantityCalculation ? (
          <Container>
            <EventGroupConfigurationPage
              firebase={firebase}
              authUser={authUser}
              event={state.event}
              groupConfiguration={state.groupConfig}
              // onConfirm=(()=>())
              // onCancel=(()=>())
              onGroupConfigurationUpdate={onGroupConfigurationUpdate}
            />
          </Container>
        ) : activeTab == EventTabs.usedRecipes ? (
          <Container>
            <EventUsedRecipesPage
              firebase={firebase}
              authUser={authUser}
              event={state.event}
              groupConfiguration={state.groupConfig}
              menuplan={state.menuplan}
              usedRecipes={state.usedRecipes}
              products={state.products}
              unitConversionBasic={state.unitConversionBasic}
              unitConversionProducts={state.unitConversionProducts}
              fetchMissingData={fetchMissingData}
              onUsedRecipesUpdate={onUsedRecipesUpdate}
            />
          </Container>
        ) : activeTab == EventTabs.shoppingList ? (
          <Container>
            <EventShoppingListPage
              firebase={firebase}
              authUser={authUser}
              menuplan={state.menuplan}
              event={state.event}
              products={state.products}
              materials={state.materials}
              units={state.units}
              departments={state.departments}
              recipes={state.recipes}
              unitConversionBasic={state.unitConversionBasic}
              unitConversionProducts={state.unitConversionProducts}
              shoppingListCollection={state.shoppingListCollection}
              shoppingList={state.shoppingList.value}
              fetchMissingData={fetchMissingData}
              onShoppingListUpdate={onShoppingListUpdate}
              onShoppingCollectionUpdate={onShoppingCollectionUpdate}
              onMasterdataCreate={onMasterdataCreate}
            />
          </Container>
        ) : activeTab == EventTabs.materialList ? (
          <Container>
            <EventMaterialListPage
              firebase={firebase}
              authUser={authUser}
              materialList={state.materialList}
              event={state.event}
              groupConfiguration={state.groupConfig}
              menuplan={state.menuplan}
              materials={state.materials}
              recipes={state.recipes}
              unitConversionBasic={state.unitConversionBasic}
              unitConversionProducts={state.unitConversionProducts}
              fetchMissingData={fetchMissingData}
              onMaterialListUpdate={onMaterialListUpdate}
              onMasterdataCreate={onMasterdataCreate}
            />
          </Container>
        ) : (
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <EventInfoPage
                  event={eventDraft.event}
                  localPicture={eventDraft.localPicture}
                  formValidation={eventDraft.formValidation}
                  firebase={firebase}
                  authUser={authUser}
                  onUpdateEvent={onEventUpdate}
                  onUpdatePicture={onEventPictureUpdate}
                />
              </Grid>
              {state.event != eventDraft.event && (
                <Grid item xs={12} container justifyContent="flex-end">
                  <Button
                    className={classes.deleteButton}
                    variant="outlined"
                    onClick={onEventDelete}
                  >
                    {TEXT_DELETE_EVENT}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    style={{marginLeft: "1rem"}}
                    onClick={onEventDiscardChanges}
                  >
                    {TEXT_DISCARD_CHANGES}
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    style={{marginLeft: "1rem"}}
                    onClick={onEventSaveChanges}
                  >
                    {TEXT_SAVE}
                  </Button>
                </Grid>
              )}
            </Grid>
          </Container>
        )}
      </Container>
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};

const condition = (authUser: AuthUser | null) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(EventPage);
