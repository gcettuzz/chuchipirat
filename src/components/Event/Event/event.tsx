import React from "react";
import {compose} from "recompose";
import {useHistory} from "react-router";

import {
  Container,
  Backdrop,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
} from "@material-ui/core";

import useStyles from "../../../constants/styles";

import Event from "./event.class";
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
} from "../../../constants/text";

import Recipe, {Recipes} from "../../Recipe/recipe.class";
import Unit from "../../Unit/unit.class";
import Firebase, {withFirebase} from "../../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../../Session";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import EventGroupConfiguration from "../GroupConfiguration/groupConfiguration.class";
import MenuplanPage from "../Menuplan/menuplan";
import EventGroupConfigurationPage from "../GroupConfiguration/groupConfigruation";
import EventUsedRecipesPage from "../UsedRecipes/usedRecipes";
import Menuplan from "../Menuplan/menuplan.class";
import UsedRecipes from "../UsedRecipes/usedRecipes.class";
import Utils from "../../Shared/utils.class";
import LocalStorageHandler from "../../Shared/localStorageHandler.class";
import RecipeShort from "../../Recipe/recipeShort.class";
import Material from "../../Material/material.class";
import Product, {Diet} from "../../Product/product.class";
import CustomSnackbar, {Snackbar} from "../../Shared/customSnackbar";
import Department from "../../Department/department.class";
import {convertToObject} from "typescript";
import {group} from "console";
import UnitConversion, {
  ConversionType,
  UnitConversionBasic,
  UnitConversionProducts,
} from "../../Unit/unitConversion.class";
import unitConversion from "../../Unit/unitConversion";
import EventShoppingListPage from "../ShoppingList/shoppingList";
import ShoppingListCollection from "../ShoppingList/shoppingListCollection.class";
import {stat} from "fs";
import ShoppingList from "../ShoppingList/shoppingList.class";
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
  event: Event;
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
  value: any;
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
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const EventPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <EventBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
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
  loadingComponents: {
    event: boolean;
    groupConfig: boolean;
    menuplan: boolean;
    usedRecipes: boolean;
    shoppingListCollection: boolean;
    shoppingLists: boolean;
    recipe: boolean;
    recipes: boolean;
    units: boolean;
    products: boolean;
    materials: boolean;
    departments: boolean;
    unitCoversion: boolean;
  };
  isError: boolean;
  error: object;
};

const eventReducer = (state: State, action: DispatchAction): State => {
  let newRecipes = {} as Recipes;
  switch (action.type) {
    case ReducerActions.EVENT_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, event: true},
      };
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
    case ReducerActions.RECIPE_FETCH_INIT:
      newRecipes = {...state.recipes};
      // Werte der Recipe-Short zwinschenspeichern damit
      // schon mal was angezeigt wird
      let tempRecipe = {
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
    case ReducerActions.RECIPE_FETCH_SUCCESS:
      // Einzelnes Rezept aus der DB
      newRecipes = {...state.recipes};
      let recipe = action.payload as Recipe;
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
    case ReducerActions.ON_MASTERDATA_CREATE:
      let memberName = `${action.payload.type.toLowerCase()}s`;
      let newValues = state[memberName];
      let newValue = newValues.find(
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
    case ReducerActions.ON_RECIPE_UPDATE:
      let newRecipe = action.payload as Recipe;
      let updatedRecipeList = [...state.recipeList];
      let updatedRecipes = {...state.recipes};
      updatedRecipes[newRecipe.uid] = newRecipe;

      let arrayIndex = updatedRecipeList.findIndex(
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
        error: action.payload ? action.payload : {},
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
  loadingComponents: {
    event: false,
    groupConfig: false,
    menuplan: false,
    usedRecipes: false,
    shoppingListCollection: false,
    shoppingLists: false,
    recipe: false,
    recipes: false,
    units: false,
    products: false,
    materials: false,
    departments: false,
    unitCoversion: false,
  },
  isError: false,
  error: {},
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const EventBase = ({props, authUser}) => {
  const firebase = props.firebase as Firebase;
  const {replace} = useHistory();
  const theme = useTheme();

  const classes = useStyles();
  let eventUid: string = "";

  const [state, dispatch] = React.useReducer(eventReducer, INITITIAL_STATE);
  const [activeTab, setActiveTab] = React.useState(EventTabs.menuplan);
  // const [activeTab, setActiveTab] = React.useState(EventTabs.menuplan);

  if (!state.event.uid) {
    if (props.location.state) {
      dispatch({
        type: ReducerActions.EVENT_FETCH_SUCCESS,
        payload: props.location.state.event,
      });
      dispatch({
        type: ReducerActions.GROUP_CONFIG_FETCH_SUCCESS,
        payload: props.location.state.groupConfig,
      });
    }
  }
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
    if (!props.location.state?.event) {
      dispatch({type: ReducerActions.EVENT_FETCH_INIT, payload: {}});
      Event.getEvent({
        firebase: firebase,
        uid: eventUid,
      })
        .then((result) => {
          dispatch({
            type: ReducerActions.EVENT_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
    }
  }, []);
  React.useEffect(() => {
    //Group-Config
    let unsubscribe: () => void;
    if (!props.location.state?.groupConfig) {
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
    }
    return function cleanup() {
      console.warn("unsubscribe group-config");
      unsubscribe();
    };
  }, []);
  React.useEffect(() => {
    //Menüplan
    let unsubscribe: () => void;
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
      console.warn("unsubscribe menueplan");
      unsubscribe();
    };
  }, []);
  React.useEffect(() => {
    // ShoppingList-Collection
    let unsubscribe: () => void;
    if (!state.menuplan.uid) {
      dispatch({
        type: ReducerActions.SHOPPINGLIST_COLLECTION_FETCH_INIT,
        payload: {},
      });
      ShoppingListCollection.getShoppingListCollectionListener({
        firebase: firebase,
        uid: eventUid,
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
    }

    return function cleanup() {
      console.warn("unsubscribe shoppinglistCollection");
      unsubscribe();
    };
  }, []);
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
          let unitConversionBasic = result;
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
    if (activeTab == EventTabs.shoppingList && state.materials.length == 0) {
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
  /* ------------------------------------------
  // Tab-Handling
  // ------------------------------------------ */
  const onTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };
  /* ------------------------------------------
  // Change-Handling
  // ------------------------------------------ */
  const onMenuplanUpdate = (menuplan: Menuplan) => {
    Menuplan.save({
      menuplan: menuplan,
      firebase: firebase,
      authUser: authUser,
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
    let menuplan = Menuplan.recalculatePortions({
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
    console.warn(shoppingList);
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
            console.warn("=== UNITS GELESEN ===");
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
            let unitConversionBasic = result;
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
          console.warn("unsubscribe shoppinglist");
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
  console.log(state);
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={state.event.name} subTitle={state.event.motto} />
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
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
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
            />
          </Container>
        ) : activeTab == EventTabs.shoppingList ? (
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
        ) : (
          <p>TODO</p>
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

const condition = (authUser: AuthUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(EventPage);
