import React, {SyntheticEvent} from "react";
import {pdf} from "@react-pdf/renderer";
import fileSaver from "file-saver";

import {
  Stack,
  Button,
  Backdrop,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Container,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  FormControl,
  SnackbarCloseReason,
  useTheme,
  Box,
  AutocompleteChangeReason,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

import {
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  SHOPPING_LIST_MENUE_SELECTION_DESCRIPTION as TEXT_SHOPPING_LIST_MENUE_SELECTION_DESCRIPTION,
  WHICH_MENUES_FOR_SHOPPING_LIST_GENERATION as TEXT_WHICH_MENUES_FOR_SHOPPING_LIST_GENERATION,
  NAME as TEXT_NAME,
  NEW_LIST as TEXT_NEW_LIST,
  GIVE_THE_NEW_SHOPPINGLIST_A_NAME as GIVE_THE_NEW_SHOPPINGLIST_A_NAME,
  DELETE as TEXT_DELETE,
  ERROR_NO_RECIPES_FOUND as TEXT_ERROR_NO_RECIPES_FOUND,
  ADD_ITEM as TEXT_ADD_ITEM,
  CANCEL as TEXT_CANCEL,
  ADD as TEXT_ADD,
  QUANTITY as TEXT_QUANTITY,
  NEW_ITEM as TEXT_NEW_ITEM,
  WHAT_KIND_OF_ITEM_ARE_YOU_CREATING as TEXT_WHAT_KIND_OF_ITEM_ARE_YOU_CREATING,
  FOOD as TEXT_FOOD,
  MATERIAL as TEXT_MATERIAL,
  ARTICLE_ALREADY_ADDED as TEXT_ARTICLE_ALREADY_ADDED,
  REPLACE as TEXT_REPLACE,
  SUM as TEXT_SUM,
  ADD_OR_REPLACE_ARTICLE,
  KEEP_MANUALLY_ADDED_PRODUCTS as TEXT_KEEP_MANUALLY_ADDED_PRODUCTS,
  MANUALLY_ADDED_PRODUCTS as TEXT_MANUALLY_ADDED_PRODUCTS,
  CHECKED_ITEMS as TEXT_CHECKED_ITEMS,
  CHECKED_ITEMS_EXPLANATION as TEXT_CHECKED_ITEMS_EXPLANATION,
  KEEP as TEXT_KEEP,
  SHOPPING_LIST as TEXT_SHOPPING_LIST,
  SUFFIX_PDF as TEXT_SUFFIX_PDF,
  PLEASE_GIVE_VALUE_FOR_FIELD as TEXT_PLEASE_GIVE_VALUE_FOR_FIELD,
  ITEM as TEXT_ITEM,
  CHANGE as TEXT_CHANGE,
  USED_RECIPES_OF_SHOPPINGLIST_POSSIBLE_OUT_OF_DATE as TEXT_USED_RECIPES_OF_SHOPPINGLIST_POSSIBLE_OUT_OF_DATE,
  ERROR_NO_PRODUCTS_FOUND as TEXT_ERROR_NO_PRODUCTS_FOUND,
  ADD_DEPARTMENT as TEXT_ADD_DEPARTMENT,
  FIELD_QUANTITY as TEXT_FIELD_QUANTITY,
  SHOPPING_MODE as TEXT_SHOPPING_MODE,
  EDIT_MODE as TEXT_EDIT_MODE,
  SHOPPINTLIST_ITEM_MOVED_TO_RIGHT_DEPARTMENT as TEXT_SHOPPINTLIST_ITEM_MOVED_TO_RIGHT_DEPARTMENT,
} from "../../../constants/text";
import {MoreVert as MoreVertIcon} from "@mui/icons-material";

import useCustomStyles from "../../../constants/styles";

import Firebase from "../../Firebase/firebase.class";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import Menuplan, {
  MealRecipe,
  Menue,
  MenueCoordinates,
} from "../Menuplan/menuplan.class";
import CustomSnackbar, {Snackbar} from "../../Shared/customSnackbar";
import {
  DialogType,
  SingleTextInputResult,
  useCustomDialog,
} from "../../Shared/customDialogContext";
import {
  NavigationObject,
  NavigationValuesContext,
} from "../../Navigation/navigationContext";
import Action from "../../../constants/actions";
import AlertMessage from "../../Shared/AlertMessage";
import ShoppingListCollection, {
  ShoppingListTrace,
} from "./shoppingListCollection.class";
import ShoppingList, {
  ItemType,
  ShoppingListDepartment,
  ShoppingListItem,
} from "./shoppingList.class";

import {
  DialogSelectMenues,
  DialogSelectMenuesForRecipeDialogValues,
  decodeSelectedMeals,
} from "../Menuplan/dialogSelectMenues";
import Product from "../../Product/product.class";
import {
  UnitConversionBasic,
  UnitConversionProducts,
} from "../../Unit/unitConversion.class";
import Department from "../../Department/department.class";
import Event from "../Event/event.class";
import UnitAutocomplete from "../../Unit/unitAutocomplete";
import ItemAutocomplete, {
  ItemAutocompleteProps,
  MaterialItem,
  ProductItem,
} from "./itemAutocomplete";
import Unit from "../../Unit/unit.class";
import Recipe, {Recipes} from "../../Recipe/recipe.class";
import DialogMaterial, {
  MATERIAL_POP_UP_VALUES_INITIAL_STATE,
  MaterialDialog,
} from "../../Material/dialogMaterial";
import {
  FetchMissingDataProps,
  FetchMissingDataType,
  // MasterDataCreateType,
  // OnMasterdataCreateProps,
} from "../Event/event";
import DialogProduct, {
  PRODUCT_POP_UP_VALUES_INITIAL_STATE,
  ProductDialog,
} from "../../Product/dialogProduct";
import Utils from "../../Shared/utils.class";
import {
  RECIPE_DRAWER_DATA_INITIAL_VALUES,
  RecipeDrawer,
  RecipeDrawerData,
} from "../Menuplan/menuplan";
import EventGroupConfiguration from "../GroupConfiguration/groupConfiguration.class";
import RecipeShort from "../../Recipe/recipeShort.class";
import ShoppingListPdf from "./shoppingListPdf";
import {
  DialogTraceItem,
  EventListCard,
  PositionContextMenu,
  OperationType,
  ListMode,
} from "../Event/eventSharedComponents";
import Material from "../../Material/material.class";
import {TextFieldSize} from "../../../constants/defaultValues";
import {
  DialogSelectDepartments,
  SelectedDepartmentsForShoppingList,
} from "./dialogSelectDepartments";

/* ===================================================================
// ============================ Dispatcher ===========================
// =================================================================== */
enum ReducerActions {
  SHOW_LOADING,
  SET_SELECTED_LIST_ITEM,
  GENERIC_ERROR,
  SNACKBAR_SHOW,
  SNACKBAR_CLOSE,
}
type State = {
  selectedListItem: string | null;
  isLoading: boolean;
  error: Error | null;
  snackbar: Snackbar;
};
type DispatchAction = {
  type: ReducerActions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: {[key: string]: any};
};
const inititialState: State = {
  selectedListItem: null,
  isLoading: false,
  error: null,
  snackbar: {open: false, severity: "success", message: ""},
};
interface ContextMenuSeletedItemsProps {
  anchor: HTMLElement | null;
  departmentKey: Department["pos"];
  productUid: Product["uid"];
  itemType: ItemType;
  unit: Unit["key"];
}
const CONTEXT_MENU_SELECTE_ITEM_INITIAL_STATE: ContextMenuSeletedItemsProps = {
  anchor: null,
  departmentKey: 0,
  productUid: "",
  itemType: 0,
  unit: "",
};
enum AddItemAction {
  REPLACE = 1,
  ADD,
}

const usedRecipesReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.SHOW_LOADING:
      return {
        ...state,
        error: null,
        isLoading: action.payload.isLoading,
      };
    case ReducerActions.SET_SELECTED_LIST_ITEM:
      return {
        ...state,
        selectedListItem: action.payload.uid,
        isLoading: false,
      };
    case ReducerActions.GENERIC_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload as Error,
      };
    case ReducerActions.SNACKBAR_SHOW:
      return {
        ...state,
        isLoading: false,
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

const DIALOG_SELECT_MENUE_DATA_INITIAL_DATA = {
  open: false,
  menues: {} as DialogSelectMenuesForRecipeDialogValues,
  selectedListUid: "",
  operationType: OperationType.none,
};

enum DialogSelectDepartmentsCaller {
  CREATE = 1,
  ADD_DEPARTMENT,
}

const DIALOG_SELECT_DEPARTMENTS_INITIAL_DATA = {
  open: false,
  selectedDepartments: {} as SelectedDepartmentsForShoppingList,
  singleSelection: false,
  caller: DialogSelectDepartmentsCaller.CREATE,
};
/* ===================================================================
// ============================== Global =============================
// =================================================================== */
type ItemChange =
  | {
      source: "textfield";
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
      value: string;
    }
  | {
      source: "autocompleteItem";
      event: React.ChangeEvent<HTMLInputElement>;
      value: ItemAutocompleteProps["item"];
      reason: AutocompleteChangeReason;
      objectId: string;
    }
  | {
      source: "autocompleteUnit";
      event: React.ChangeEvent<HTMLInputElement>;
      value: Unit | null;
      reason: AutocompleteChangeReason;
      objectId: string;
    };

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
interface EventShoppingListPageProps {
  firebase: Firebase;
  authUser: AuthUser;
  menuplan: Menuplan;
  event: Event;
  products: Product[];
  materials: Material[];
  units: Unit[];
  recipes: Recipes;
  departments: Department[];
  unitConversionBasic: UnitConversionBasic | null;
  unitConversionProducts: UnitConversionProducts | null;
  shoppingListCollection: ShoppingListCollection;
  shoppingList: ShoppingList | null;
  fetchMissingData: ({type, recipeShort}: FetchMissingDataProps) => void;
  onShoppingListUpdate: (shoppingList: ShoppingList) => void;
  onShoppingCollectionUpdate: (
    shoppingListCollection: ShoppingListCollection,
  ) => void;
  // onMasterdataCreate: ({type, value}: OnMasterdataCreateProps) => void;
}
const ADD_ITEM_DIALOG_INITIAL_VALUES = {
  open: false,
  item: {} as ProductItem | MaterialItem,
  quantity: "",
  unit: "",
};
const TRACE_ITEM_DIALOG_INITIAL_VALUES = {
  open: false,
  sortedMenues: [] as MenueCoordinates[],
};

const EventShoppingListPage = ({
  firebase,
  authUser,
  menuplan,
  event,
  products,
  materials,
  units,
  recipes,
  departments,
  unitConversionBasic,
  unitConversionProducts,
  shoppingListCollection,
  shoppingList,
  fetchMissingData,
  onShoppingListUpdate,
  onShoppingCollectionUpdate,
  // onMasterdataCreate,
}: EventShoppingListPageProps) => {
  const classes = useCustomStyles();
  const theme = useTheme();
  const {customDialog} = useCustomDialog();

  const navigationValuesContext = React.useContext(NavigationValuesContext);

  const [state, dispatch] = React.useReducer(
    usedRecipesReducer,
    inititialState,
  );
  const [dialogSelectMenueData, setDialogSelectMenueData] = React.useState(
    DIALOG_SELECT_MENUE_DATA_INITIAL_DATA,
  );
  const [dialogSelectDepartments, setDialogSelectDepartments] = React.useState(
    DIALOG_SELECT_DEPARTMENTS_INITIAL_DATA,
  );
  const [contextMenuSelectedItem, setContextMenuSelectedItem] = React.useState(
    CONTEXT_MENU_SELECTE_ITEM_INITIAL_STATE,
  );
  const [handleItemDialogValues, setHandleItemDialogValues] = React.useState(
    ADD_ITEM_DIALOG_INITIAL_VALUES,
  );
  const [traceItemDialogValues, setTraceItemDialogValues] = React.useState(
    TRACE_ITEM_DIALOG_INITIAL_VALUES,
  );
  const [recipeDrawerData, setRecipeDrawerData] =
    React.useState<RecipeDrawerData>(RECIPE_DRAWER_DATA_INITIAL_VALUES);

  const [shoppingListModus, setShoppingListModus] = React.useState<ListMode>(
    ListMode.VIEW,
  );

  /* ------------------------------------------
  // Initialisierung
  // ------------------------------------------ */
  if (
    recipeDrawerData.isLoadingData &&
    Object.prototype.hasOwnProperty.call(recipes, recipeDrawerData.recipe.uid)
  ) {
    if (!recipeDrawerData.recipe.name) {
      // Aktualisierte Werte setzen // es wurden erst die Infos aus der
      // RecipeShort gesetzt. Diese mal anzeigen
      setRecipeDrawerData({
        ...recipeDrawerData,
        isLoadingData:
          recipes[recipeDrawerData.recipe.uid].portions > 0 ? false : true,
        open: true,
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
        open: true,
        recipe: recipes[recipeDrawerData.recipe.uid],
      });
    }
  }

  /* ------------------------------------------
  // Navigation-Handler
  // ------------------------------------------ */
  React.useEffect(() => {
    navigationValuesContext?.setNavigationValues({
      action: Action.NONE,
      object: NavigationObject.shoppingList,
    });
  }, []);
  /* ------------------------------------------
  // Dialog-Handling
  // ------------------------------------------ */
  const onCreateList = () => {
    setDialogSelectMenueData({
      ...dialogSelectMenueData,
      open: true,
      operationType: OperationType.Create,
    });
  };
  const onCloseDialogSelectMenues = () => {
    setDialogSelectMenueData(DIALOG_SELECT_MENUE_DATA_INITIAL_DATA);
  };
  const onConfirmDialogSelectMenues = async (
    selectedMenues: DialogSelectMenuesForRecipeDialogValues,
  ) => {
    // Gewählte Menüs speichern
    setDialogSelectMenueData({
      ...dialogSelectMenueData,
      menues: selectedMenues,
      open: false,
    });

    setDialogSelectDepartments({
      ...dialogSelectDepartments,
      open: true,
      caller: DialogSelectDepartmentsCaller.CREATE,
    });
  };
  const onCloseDialogSelectDepartments = () => {
    // Abbruch der Übung
    setDialogSelectMenueData(DIALOG_SELECT_MENUE_DATA_INITIAL_DATA);
    setDialogSelectDepartments(DIALOG_SELECT_DEPARTMENTS_INITIAL_DATA);
  };
  const onConfirmDialogSelectDepartments = async (
    selectedDepartments: SelectedDepartmentsForShoppingList,
  ) => {
    if (
      dialogSelectDepartments.caller ===
      DialogSelectDepartmentsCaller.ADD_DEPARTMENT
    ) {
      // Abteilung hinzufügen
      shoppingList = ShoppingList.addDepartmentToList({
        shoppingList: shoppingList!,
        departmentUid: Object.keys(selectedDepartments)![0]!,
        departments: departments,
      });
      onShoppingListUpdate(shoppingList!);
      setDialogSelectDepartments(DIALOG_SELECT_DEPARTMENTS_INITIAL_DATA);
      return;
    }

    // Gewählte Abteilungen speichern
    setDialogSelectDepartments({
      ...dialogSelectDepartments,
      open: false,
      selectedDepartments: selectedDepartments,
    });

    const userInput = (await customDialog({
      dialogType: DialogType.SingleTextInput,
      title: TEXT_NEW_LIST,
      text: GIVE_THE_NEW_SHOPPINGLIST_A_NAME,
      singleTextInputProperties: {
        initialValue:
          dialogSelectMenueData.operationType === OperationType.Update
            ? shoppingListCollection.lists[
                dialogSelectMenueData.selectedListUid
              ].properties.name
            : "",
        textInputLabel: TEXT_NAME,
      },
    })) as SingleTextInputResult;
    if (userInput.valid) {
      // Wait anzeigen
      dispatch({type: ReducerActions.SHOW_LOADING, payload: {isLoading: true}});
      if (dialogSelectMenueData.operationType === OperationType.Create) {
        // Rezepte holen und Liste erstellen
        await ShoppingListCollection.createNewList({
          name: userInput.input,
          shoppingListCollection: shoppingListCollection,
          selectedMenues: Object.keys(dialogSelectMenueData.menues),
          selectedDepartments: Object.keys(selectedDepartments),
          menueplan: menuplan,
          eventUid: event.uid,
          products: products,
          materials: materials,
          departments: departments,
          units: units,
          unitConversionBasic: unitConversionBasic!,
          unitConversionProducts: unitConversionProducts!,
          firebase: firebase,
          authUser: authUser,
        })
          .then(async (result) => {
            await onShoppingCollectionUpdate(result.shoppingListCollection);
            fetchMissingData({
              type: FetchMissingDataType.SHOPPING_LIST,
              objectUid: result.shoppingListUid,
            });
            // liste gleich anzeigen!
            dispatch({
              type: ReducerActions.SET_SELECTED_LIST_ITEM,
              payload: {uid: result.shoppingListUid},
            });
            setShoppingListModus(ListMode.EDIT);
          })
          .catch((error) => {
            if (error.toString().includes(TEXT_ERROR_NO_RECIPES_FOUND)) {
              dispatch({
                type: ReducerActions.SNACKBAR_SHOW,
                payload: {
                  severity: "info",
                  message: TEXT_ERROR_NO_RECIPES_FOUND,
                  open: true,
                },
              });
            } else {
              console.error(error);
              dispatch({
                type: ReducerActions.GENERIC_ERROR,
                payload: error,
              });
            }
          })
          .finally(() => {
            // Alle Dialoge reseten
            setDialogSelectMenueData(DIALOG_SELECT_MENUE_DATA_INITIAL_DATA);
            setDialogSelectDepartments(DIALOG_SELECT_DEPARTMENTS_INITIAL_DATA);
          });
      } else if (dialogSelectMenueData.operationType === OperationType.Update) {
        onRefreshLists(
          userInput.input,
          Object.keys(dialogSelectMenueData.menues),
          Object.keys(selectedDepartments),
        );
        setShoppingListModus(ListMode.EDIT);
      }
    } else {
      // Abbruch Fenster schliessen
      setDialogSelectMenueData(DIALOG_SELECT_MENUE_DATA_INITIAL_DATA);
      setDialogSelectDepartments(DIALOG_SELECT_DEPARTMENTS_INITIAL_DATA);
    }
  };
  /* ------------------------------------------
  // Listen aktualisieren
  // ------------------------------------------ */
  const onRefreshLists = async (
    newName?: string,
    selectedMenues?: Menue["uid"][],
    selectedDepartments?: Department["uid"][],
  ) => {
    let keepManuallyAddedItems = false;
    let keepCheckedItems = false;
    const shoppingListCollectionToRefresh = {...shoppingListCollection};

    if (!shoppingList?.uid) {
      return;
    }

    const checkedItems = ShoppingList.getCheckedItemsByDepartment({
      shoppingList: shoppingList,
    });

    if (
      shoppingList &&
      shoppingListCollection.lists[shoppingList.uid].properties
        .hasManuallyAddedItems
    ) {
      const userInput = (await customDialog({
        dialogType: DialogType.selectOptions,
        title: TEXT_MANUALLY_ADDED_PRODUCTS,
        text: TEXT_KEEP_MANUALLY_ADDED_PRODUCTS(TEXT_SHOPPING_LIST),
        options: [
          {key: Action.DELETE, text: TEXT_DELETE},
          {key: Action.KEEP, text: TEXT_KEEP},
        ],
      })) as SingleTextInputResult;

      if (!userInput.valid) {
        return;
      }
      keepManuallyAddedItems = userInput.input == Action.KEEP ? true : false;
    }

    if (Object.values(checkedItems).length > 0) {
      const userInput = (await customDialog({
        dialogType: DialogType.selectOptions,
        title: TEXT_CHECKED_ITEMS,
        text: TEXT_CHECKED_ITEMS_EXPLANATION(TEXT_SHOPPING_LIST),
        options: [
          {key: Action.DELETE, text: TEXT_DELETE},
          {key: Action.KEEP, text: TEXT_KEEP, variant: "contained"},
        ],
      })) as SingleTextInputResult;

      if (!userInput.valid) {
        return;
      }
      keepCheckedItems = userInput.input == Action.KEEP ? true : false;
    }

    dispatch({type: ReducerActions.SHOW_LOADING, payload: {isLoading: true}});

    if (dialogSelectMenueData.operationType === OperationType.Update) {
      // die neu gewählten Menüs und Name setzen
      shoppingListCollectionToRefresh.lists[
        dialogSelectMenueData.selectedListUid
      ].properties.name = newName!;

      shoppingListCollectionToRefresh.lists[
        dialogSelectMenueData.selectedListUid
      ].properties.selectedMenues = Object.keys(selectedMenues!);

      shoppingListCollectionToRefresh.lists[
        dialogSelectMenueData.selectedListUid
      ].properties.selectedDepartments = selectedDepartments!;

      shoppingListCollectionToRefresh.lists[
        dialogSelectMenueData.selectedListUid
      ].properties.selectedMeals = Menuplan.getMealsOfMenues({
        menuplan: menuplan,
        menues: selectedMenues!,
      });

      setDialogSelectMenueData(DIALOG_SELECT_MENUE_DATA_INITIAL_DATA);
    }
    // Alle Listen aktualisieren
    ShoppingListCollection.refreshList({
      shoppingListCollection: shoppingListCollectionToRefresh,
      shoppingList: shoppingList!,
      keepManuallyAddedItems: keepManuallyAddedItems,
      menueplan: menuplan,
      eventUid: event.uid,
      products: products,
      materials: materials,
      units: units,
      unitConversionBasic: unitConversionBasic!,
      unitConversionProducts: unitConversionProducts!,
      departments: departments,
      firebase: firebase,
      authUser: authUser,
    })
      .then((result) => {
        if (keepCheckedItems) {
          result.shoppingList = ShoppingList.restoreCheckedItems({
            shoppingList: result.shoppingList,
            checkedItems: checkedItems,
          });
        }

        onShoppingCollectionUpdate(result.shoppingListCollection);
        onShoppingListUpdate(result.shoppingList);

        dispatch({
          type: ReducerActions.SHOW_LOADING,
          payload: {isLoading: false},
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  /* ------------------------------------------
  // PDF generieren
  // ------------------------------------------ */
  const onGeneratePrintVersion = () => {
    if (
      Object.keys(shoppingListCollection.lists[state.selectedListItem!].trace)
        .length === 0
    ) {
      dispatch({
        type: ReducerActions.GENERIC_ERROR,
        payload: new Error(TEXT_ERROR_NO_PRODUCTS_FOUND),
      });
      return;
    }

    pdf(
      <ShoppingListPdf
        shoppingList={shoppingList!}
        shoppingListName={
          shoppingListCollection.lists[state.selectedListItem!].properties.name
        }
        shoppingListSelectedTimeSlice={decodeSelectedMeals({
          selectedMeals:
            shoppingListCollection.lists[state.selectedListItem!].properties
              .selectedMeals,
          menuplan: menuplan,
        })}
        eventName={event.name}
        authUser={authUser}
      />,
    )
      .toBlob()
      .then((result) => {
        fileSaver.saveAs(
          result,
          event.name + " " + TEXT_SHOPPING_LIST + TEXT_SUFFIX_PDF,
        );
      });
  };
  /* ------------------------------------------
  // Snackbar-Handling
  // ------------------------------------------ */
  const handleSnackbarClose = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: globalThis.Event | SyntheticEvent<any, globalThis.Event>,
    reason: SnackbarCloseReason,
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
  // List-Handling
  // ------------------------------------------ */
  const onListElementSelect = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const selectedListItem = event.currentTarget.id.split("_")[1];

    if (state.selectedListItem == selectedListItem) {
      // Element bereits aktiv
      return;
    }

    fetchMissingData({
      type: FetchMissingDataType.SHOPPING_LIST,
      objectUid: selectedListItem,
    });

    dispatch({
      type: ReducerActions.SET_SELECTED_LIST_ITEM,
      payload: {uid: selectedListItem},
    });
  };
  const onListElementDelete = async (
    actionEvent: React.MouseEvent<HTMLElement>,
  ) => {
    const selectedList = actionEvent.currentTarget.id.split("_")[1];

    if (!selectedList) {
      return;
    }
    await ShoppingListCollection.deleteList({
      firebase: firebase,
      shoppingListColection: shoppingListCollection,
      listUidToDelete: selectedList,
      eventUid: event.uid,
      authUser: authUser,
    }).then(async () => {
      await ShoppingList.delete({
        firebase: firebase,
        eventUid: event.uid,
        listUidToDelete: selectedList,
      })
        .then(() => {
          dispatch({
            type: ReducerActions.SET_SELECTED_LIST_ITEM,
            payload: {uid: ""},
          });
        })
        .catch((error) => {
          console.error(error);
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
    });
  };
  const onListElementEdit = async (
    actionEvent: React.MouseEvent<HTMLElement>,
  ) => {
    const selectedListUid = actionEvent.currentTarget.id.split("_")[1];
    if (!selectedListUid) {
      return;
    }
    // Element selektieren, damit der Fetch passiert und danach
    // die Shoppingliste aktualisiert werden kann.
    onListElementSelect(
      actionEvent as React.MouseEvent<HTMLDivElement, MouseEvent>,
    );
    const selectedMenuesForDialog: DialogSelectMenuesForRecipeDialogValues = {};
    const selectedDepartmentsForDialog: SelectedDepartmentsForShoppingList = {};

    let selectedMenues =
      shoppingListCollection.lists[selectedListUid].properties.selectedMenues;
    const selectedDepartments =
      shoppingListCollection.lists[selectedListUid].properties
        .selectedDepartments;

    // Prüfen ob die Menüs immer noch gleich sind
    if (
      !Utils.areStringArraysEqual(
        shoppingListCollection.lists[selectedListUid].properties.selectedMeals,
        Menuplan.getMealsOfMenues({
          menuplan: menuplan,
          menues:
            shoppingListCollection.lists[selectedListUid].properties
              .selectedMenues,
        }),
      ) ||
      // Sind neue Menü dazugekommen/ oder wurden Menüs aus der
      // Auswahl entfernt
      shoppingListCollection.lists[selectedListUid].properties.selectedMenues
        .length !==
        Menuplan.getMenuesOfMeals({
          menuplan: menuplan,
          meals:
            shoppingListCollection.lists[selectedListUid].properties
              .selectedMeals,
        }).length
    ) {
      selectedMenues = Menuplan.getMenuesOfMeals({
        menuplan: menuplan,
        meals:
          shoppingListCollection.lists[selectedListUid].properties
            .selectedMeals,
      });
    }

    // Auswahl in Objekt umwandeln
    selectedMenues.forEach(
      (menueUid) => (selectedMenuesForDialog[menueUid] = true),
    );
    selectedDepartments.forEach(
      (departmentUid) => (selectedDepartmentsForDialog[departmentUid] = true),
    );

    setDialogSelectMenueData({
      menues: selectedMenuesForDialog,
      open: true,
      selectedListUid: selectedListUid,
      operationType: OperationType.Update,
    });
    setDialogSelectDepartments({
      ...dialogSelectDepartments,
      selectedDepartments: selectedDepartmentsForDialog,
    });
  };
  const onCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Umschiessen und speichern!
    const pressedCheckbox = event.target.name.split("_");
    const departmentIndex = parseInt(pressedCheckbox[1], 10);

    if (isNaN(departmentIndex) || !shoppingList?.list[departmentIndex]) {
      return;
    }

    const item = shoppingList.list[departmentIndex].items.find(
      (item: ShoppingListItem) =>
        item.item.uid == pressedCheckbox[2] && item.unit == pressedCheckbox[3],
    ) as ShoppingListItem | undefined;

    if (!item) {
      return;
    }

    item.checked = !item.checked;
    onShoppingListUpdate(shoppingList);
  };
  const onChangeItem = async (change: ItemChange) => {
    const field = change.event.target.id.split("_");
    let newItem = false;
    let itemMovedToRightDepartment = false;
    let item = shoppingList?.list[parseInt(field[1])].items.find(
      (item) => item.item.uid == field[2],
    );
    let department: Department | undefined;
    let userInput = {valid: false, input: ""} as SingleTextInputResult;

    if (!shoppingList) {
      return;
    }
    if (!item) {
      // Neues Item (letzte Zeile, gibt es nur im UI)
      item = ShoppingList.createEmptyListItem();
      item.item.uid = field[2];
      newItem = true;
    }

    if (!newItem) {
      item.manualEdit = true;
    }
    switch (change.source) {
      case "textfield":
        item.quantity = parseFloat(change.value);

        if (newItem) {
          shoppingList.list[parseInt(field[1])].items.push(item);
        }

        break;
      case "autocompleteItem":
        if (change.reason === "clear") {
          item.item.name = "";
          break;
        }
        if (!change.value) {
          break;
        }

        if (
          typeof change.value == "object" &&
          Object.hasOwn(change.value, "uid")
        ) {
          item.item = {uid: change.value.uid, name: change.value.name};
          item.type = change.value.itemType;
        }

        if (typeof change.value === "string") {
          if (item.item.uid.length == 20) {
            // die Produkt UID muss weg, da es ein Freitext-Artikel ist
            item.item.uid = Utils.generateUid(10);
          }
          item.item.name = change.value;
          item.type = ItemType.custom;
        }

        // Prüfen ob es in der richtigen Abteilung ist
        switch (item.type) {
          case ItemType.food:
            department = departments.find(
              (department) =>
                department.uid == (change.value as ProductItem).department.uid,
            );
            break;
          case ItemType.material:
            department = departments.find(
              (department) => department.name.toUpperCase() == "NON FOOD",
            );
            break;
          case ItemType.custom:
          case ItemType.none:
            department = departments.find(
              (department) => department.pos == parseInt(field[1]),
            )!;
            break;
        }

        if (!department) {
          // Dann übernehmen wir das aus dem Block, der gewählt wurde
          department = departments.find(
            (department) => department.pos == parseInt(field[1]),
          )!;
        }
        if (!department) {
          console.error("Abteilung für Artikel nicht gefunden!");
          return;
        }
        if (department.pos != parseInt(field[1]) && !newItem) {
          // Artikel in die richtige Abteilung verschieben
          // aus der ursprünglichen Abteilung entfernen
          shoppingList.list[Number(field[1]) as Department["pos"]].items =
            shoppingList?.list[parseInt(field[1])].items.filter(
              (listItem) => listItem.item.uid != item.item.uid,
            );

          // in die richtige Abteilung hinzufügen
          shoppingList.list[department.pos].items.push(item);
        } else if (newItem) {
          if (!Object.hasOwn(shoppingList.list, department.pos)) {
            // Neu anlegen
            shoppingList.list[department.pos] = {
              departmentUid: department.uid,
              departmentName: department.name,
              items: [],
            };
          }
          shoppingList.list[department.pos].items.push(item);
          itemMovedToRightDepartment = department.pos != parseInt(field[1]);
        }
        // item.type = ItemType.custom;

        if (item.item.uid.length == 20) {
          // Prüfen ob es den Artikel gibt
          // Prüfen ob der Artikel bereits in der Liste vorhanden ist
          // != item -> damit wird ausgeschlossen, dass das selbe Item gefunden
          const existingShoppingListItem = shoppingList?.list[
            department.pos
          ]?.items.find(
            (shoppingListItem) =>
              shoppingListItem !== item &&
              shoppingListItem.item.uid == item.item.uid &&
              shoppingListItem.unit == item.unit,
          );

          if (existingShoppingListItem?.quantity == 0 && item.quantity == 0) {
            // Wenn es den Artikel bereits gibt, dann nicht nochmals hinzufügen, da beide keine Menge haben. Ansonsten hätten wir doppelte Artikel in der Liste.
            // Das soeben hinzugefügte Item wieder entfernen.
            shoppingList.list[department.pos].items = shoppingList.list[
              department.pos
            ].items.filter((listItem) => listItem !== item);
            itemMovedToRightDepartment = false;
            return;
          }

          if (existingShoppingListItem && item.quantity != 0) {
            userInput = (await customDialog({
              dialogType: DialogType.selectOptions,
              title: TEXT_ARTICLE_ALREADY_ADDED,
              text: ADD_OR_REPLACE_ARTICLE(
                item.item.name,
                item.unit,
                item.quantity.toString(),
                item.quantity.toString(),
              ),
              options: [
                {key: AddItemAction.REPLACE, text: TEXT_REPLACE},
                {key: AddItemAction.ADD, text: TEXT_SUM},
              ],
            })) as SingleTextInputResult;
            if (!userInput.valid) {
              // Abbrechen - Item wieder entfernen
              shoppingList.list[department.pos].items = shoppingList.list[
                department.pos
              ].items.filter((listItem) => listItem !== item);
              return;
            }

            switch (parseInt(userInput.input) as AddItemAction) {
              case AddItemAction.ADD: {
                //     // Dazuzählen
                const addedQuantity = item.quantity;
                existingShoppingListItem.quantity += addedQuantity;

                // Trace-Eintrag für die hinzugefügte Menge
                const trace = ShoppingListCollection.addTraceEntry({
                  trace:
                    shoppingListCollection.lists[state.selectedListItem!].trace,
                  menueUid: "",
                  recipe: {} as Recipe,
                  item: item.item as Product,
                  quantity: addedQuantity,
                  unit: item.unit,
                  addedManually: true,
                  itemType: item.type,
                });
                const tempShoppingListCollection = {
                  ...shoppingListCollection,
                };
                tempShoppingListCollection.lists[state.selectedListItem!].trace =
                  trace;
                onShoppingCollectionUpdate(tempShoppingListCollection);
                break;
              }
              case AddItemAction.REPLACE:
                // Das Item erhält die neue Menge
                existingShoppingListItem.quantity = item.quantity;
                break;
              default:
                console.warn("ENUM unbekannt:", userInput.input);
                return;
            }

            // Item entfernen, da die Menge ins bestehende übernommen wurde
            shoppingList.list[department.pos].items = shoppingList.list[
              department.pos
            ].items.filter((listItem) => listItem !== item);
            existingShoppingListItem.manualEdit = true;
          }
        }

        break;
      case "autocompleteUnit":
        if (!change.value) {
          item.unit = "";
        } else {
          item.unit = change.value.key;
        }
        break;
    }

    // Trace aktualisieren, wenn ein neues Item hinzugefügt wurde
    if (newItem && item.item.name) {
      const trace = ShoppingListCollection.addTraceEntry({
        trace: shoppingListCollection.lists[state.selectedListItem!].trace,
        menueUid: "",
        recipe: {} as Recipe,
        item: item.item as Product,
        quantity: item.quantity,
        unit: item.unit,
        addedManually: true,
        itemType: item.type,
      });
      const tempShoppingListCollection = {...shoppingListCollection};
      tempShoppingListCollection.lists[state.selectedListItem!].trace = trace;
      onShoppingCollectionUpdate(tempShoppingListCollection);
    }

    onShoppingListUpdate(shoppingList!);
    if (itemMovedToRightDepartment) {
      dispatch({
        type: ReducerActions.SNACKBAR_SHOW,
        payload: {
          severity: "info",
          message: TEXT_SHOPPINTLIST_ITEM_MOVED_TO_RIGHT_DEPARTMENT(
            item.item.name,
            department?.name as string,
          ),
          open: true,
        },
      });
    }
  };
  /* ------------------------------------------
  // Kontext-Menü-Handler
  // ------------------------------------------ */
  const onOpenContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    const pressedButton = event.currentTarget.id.split("_");

    const item = shoppingList?.list[parseInt(pressedButton[1])].items.find(
      (item) => item.item.uid == pressedButton[2],
    );

    setContextMenuSelectedItem({
      anchor: event.currentTarget,
      departmentKey: parseInt(pressedButton[1]),
      productUid: pressedButton[2],
      itemType: item!.type as ItemType,
      unit: pressedButton[3],
    });
  };
  const onCloseContextMenu = () => {
    setContextMenuSelectedItem(CONTEXT_MENU_SELECTE_ITEM_INITIAL_STATE);
  };
  const onContextMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    //FIXME: Hier knallts noch bei klick auf Context Menü
    const pressedButton = event.currentTarget.id.split("_");
    let quantity: number | undefined;
    let item = {} as ProductItem | MaterialItem | undefined;
    let updatedShoppingList: ShoppingList;
    let updatedTrace: ShoppingListTrace;
    let updatedShoppingListCollection: ShoppingListCollection;

    switch (pressedButton[1]) {
      case Action.EDIT:
        quantity = shoppingList?.list[
          contextMenuSelectedItem.departmentKey
        ].items.find(
          (item) => item.item.uid == contextMenuSelectedItem.productUid,
        )?.quantity;

        if (contextMenuSelectedItem.itemType == ItemType.food) {
          item = products.find(
            (product) => product.uid == contextMenuSelectedItem.productUid,
          ) as ProductItem;
        } else {
          item = materials.find(
            (material) => material.uid == contextMenuSelectedItem.productUid,
          ) as MaterialItem;
        }
        item.itemType = contextMenuSelectedItem.itemType;

        setHandleItemDialogValues({
          open: true,
          item: item!,
          quantity: quantity ? quantity.toString() : "",
          unit: contextMenuSelectedItem.unit,
        });

        break;
      case Action.DELETE:
        updatedShoppingList = ShoppingList.deleteItem({
          shoppingListReference: shoppingList!,
          departmentKey: contextMenuSelectedItem.departmentKey,
          unit: contextMenuSelectedItem.unit,
          itemUid: contextMenuSelectedItem.productUid,
        });

        updatedTrace = ShoppingListCollection.deleteTraceEntry({
          trace: shoppingListCollection.lists[state.selectedListItem!].trace,
          itemUid: contextMenuSelectedItem.productUid,
        });
        updatedShoppingListCollection = {
          ...shoppingListCollection,
          lists: {
            ...shoppingListCollection.lists,
            [state.selectedListItem!]: {
              ...shoppingListCollection.lists[state.selectedListItem!],
              trace: updatedTrace,
            },
          },
        };

        onShoppingListUpdate(updatedShoppingList!);
        onShoppingCollectionUpdate(updatedShoppingListCollection);
        break;
      case Action.TRACE:
        setTraceItemDialogValues({
          open: true,
          sortedMenues: Menuplan.sortSelectedMenues({
            menueList:
              shoppingListCollection.lists[state.selectedListItem!].properties
                .selectedMenues,
            menuplan: menuplan,
          }),
        });

        break;
    }
    setContextMenuSelectedItem({...contextMenuSelectedItem, anchor: null});
  };
  /* ------------------------------------------
  // Artikel hinzufügen Dialog
  // ------------------------------------------ */
  // const onAddArticleClick = () => {
  //   setHandleItemDialogValues({...handleItemDialogValues, open: true});
  // };
  const onDialogHandleItemClose = () => {
    setContextMenuSelectedItem(CONTEXT_MENU_SELECTE_ITEM_INITIAL_STATE);
    setHandleItemDialogValues(ADD_ITEM_DIALOG_INITIAL_VALUES);
  };
  const onDialogHandleItemOk = async ({
    item,
    quantity,
    unit,
  }: OnDialogAddItemOk) => {
    if (!handleItemDialogValues.item.uid) {
      // Neues Produkt hinzufügen
      let product: ProductItem;
      let department: Department | undefined;
      let trace: ShoppingListTrace | undefined;
      let userInput = {valid: false, input: ""} as SingleTextInputResult;
      let shoppingListItem: ShoppingListItem | undefined = undefined;

      shoppingListCollection.lists[
        state.selectedListItem!
      ].properties.hasManuallyAddedItems = true;

      if (item.itemType == ItemType.food) {
        product = item as ProductItem;
        department = departments.find(
          (department) => department.uid == product.department.uid,
        );
      } else {
        // Material
        department = departments.find(
          (department) => department.name.toUpperCase() == "NON FOOD",
        );
      }

      if (!department) {
        return;
      }
      // Prüfen ob es die Combo, Item / Einheit schon gibt und fragen
      // ob die neue Menge ersetzt oder hinzugefügt werden soll...
      // --> wenn neue Menge Leer, dann nicht! Dann gehen wir davon aus, dass
      // der*die Benuter"*in sicherstellen will, dass das Item sicher auf der Liste ist.
      shoppingListItem = shoppingList?.list[department.pos]?.items.find(
        (shoppingListItem) =>
          shoppingListItem.item.uid == item.uid &&
          shoppingListItem.unit == unit,
      );

      if (shoppingListItem && quantity != 0) {
        // Es gibt bereits eine Position mit diesen Schlüsseln
        userInput = (await customDialog({
          dialogType: DialogType.selectOptions,
          title: TEXT_ARTICLE_ALREADY_ADDED,
          text: ADD_OR_REPLACE_ARTICLE(
            shoppingListItem.item.name,
            unit,
            quantity.toString(),
            shoppingListItem.quantity.toString(),
          ),
          options: [
            {key: AddItemAction.REPLACE, text: TEXT_REPLACE},
            {key: AddItemAction.ADD, text: TEXT_SUM},
          ],
        })) as SingleTextInputResult;
        if (!userInput.valid) {
          // Abbrechen
          setContextMenuSelectedItem(CONTEXT_MENU_SELECTE_ITEM_INITIAL_STATE);
          setHandleItemDialogValues(ADD_ITEM_DIALOG_INITIAL_VALUES);
          return;
        }

        switch (parseInt(userInput.input) as AddItemAction) {
          case AddItemAction.ADD:
            // Dazuzählen
            shoppingListItem.quantity += quantity;
            break;
          case AddItemAction.REPLACE:
            // Das Item erhält die neue Menge
            shoppingListItem.quantity = quantity;
            break;
          default:
            console.warn("ENUM unbekannt:", userInput.input);
            return;
        }
        shoppingListItem.manualEdit = true;
      } else {
        // Neue Combo - kann einfach hinzugefügt werden.
        ShoppingList.addItem({
          shoppingListReference: shoppingList!,
          item: item,
          quantity: quantity,
          unit: unit,
          department: department,
          addedManually: true,
          itemType: item.itemType,
        });
      }

      if (!shoppingListItem || parseInt(userInput.input) == AddItemAction.ADD) {
        // Dann braucht einen Trance-Eintrag
        trace = ShoppingListCollection.addTraceEntry({
          trace: shoppingListCollection.lists[state.selectedListItem!].trace,
          menueUid: "",
          recipe: {} as Recipe,
          item: item,
          quantity: quantity,
          unit: unit,
          addedManually: true,
          itemType: item.itemType,
        });
      }
      if (trace) {
        const tempShoppingListCollection = {...shoppingListCollection};
        tempShoppingListCollection.lists[state.selectedListItem!].trace = trace;
        onShoppingCollectionUpdate(tempShoppingListCollection);
      }
    } else {
      // Bestehende Position ändern
      const item = shoppingList?.list[
        contextMenuSelectedItem.departmentKey
      ].items.find(
        (item) =>
          item.item.uid == contextMenuSelectedItem.productUid &&
          item.unit == contextMenuSelectedItem.unit,
      );

      if (item) {
        if (item.quantity !== quantity || item.unit !== unit) {
          item.manualEdit = true;
        }

        item.quantity = quantity;
        item.unit = unit;
      }
      // Kein Trace, da der Urpsrung dieser Position auch bei
      // einer Änderung bleibt.
    }

    ShoppingList.save({
      firebase: firebase,
      eventUid: event.uid,
      shoppingList: shoppingList!,
      authUser: authUser,
    }).catch((error) => {
      console.error(error);
      dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
    });

    setContextMenuSelectedItem(CONTEXT_MENU_SELECTE_ITEM_INITIAL_STATE);
    setHandleItemDialogValues(ADD_ITEM_DIALOG_INITIAL_VALUES);
  };
  // const onMaterialCreate = (material: Material) => {
  //   onMasterdataCreate({
  //     type: MasterDataCreateType.MATERIAL,
  //     value: material,
  //   });
  // };
  // const onProductCreate = (product: Product) => {
  //   onMasterdataCreate({
  //     type: MasterDataCreateType.PRODUCT,
  //     value: product,
  //   });
  // };
  /* ------------------------------------------
  // Abteilung hinzufügen Dialog
  // ------------------------------------------ */
  const onAddDepartmentClick = () => {
    setDialogSelectDepartments({
      ...dialogSelectDepartments,
      open: true,
      singleSelection: true,
      caller: DialogSelectDepartmentsCaller.ADD_DEPARTMENT,
    });
  };
  /* ------------------------------------------
  // Artikel Trace Dialog
  // ------------------------------------------ */
  const onDialogTraceItemClose = () => {
    setTraceItemDialogValues(TRACE_ITEM_DIALOG_INITIAL_VALUES);
    setContextMenuSelectedItem(CONTEXT_MENU_SELECTE_ITEM_INITIAL_STATE);
  };
  /* ------------------------------------------
  // Recipe-Drawer-Handler
  // ------------------------------------------ */
  const onOpenRecipeDrawer = (
    menueUid: Menue["uid"],
    recipeUid: Recipe["uid"],
  ) => {
    let mealRecipe = {} as MealRecipe;
    let recipe = new Recipe();
    recipe.uid = recipeUid;

    let loadingData = false;
    let openDrawer = false;

    menuplan.menues[menueUid].mealRecipeOrder.forEach((mealRecipeUid) => {
      if (menuplan.mealRecipes[mealRecipeUid].recipe.recipeUid == recipeUid) {
        mealRecipe = menuplan.mealRecipes[mealRecipeUid];
      }
    });

    if (!mealRecipe) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(recipes, recipeUid)) {
      recipe = recipes[recipeUid] as Recipe;
      openDrawer = true;
    } else {
      recipe.name = mealRecipe.recipe.name;

      fetchMissingData({
        type: FetchMissingDataType.RECIPE,
        recipeShort: {
          uid: mealRecipe.recipe.recipeUid,
          name: mealRecipe.recipe.name,
          type: mealRecipe.recipe.type,
          created: {
            fromUid: mealRecipe.recipe.createdFromUid,
          },
        } as RecipeShort,
      });
      loadingData = true;
    }
    // Erst öffnen, wenn die Daten auch da sind
    setRecipeDrawerData({
      ...recipeDrawerData,
      open: openDrawer,
      isLoadingData: loadingData,
      recipe: recipe,
      scaledPortions: mealRecipe.totalPortions,
    });
  };
  const onRecipeDrawerClose = () => {
    setRecipeDrawerData({...recipeDrawerData, open: false});
  };
  return (
    <Stack spacing={2}>
      {state.error && (
        <AlertMessage
          error={state.error}
          messageTitle={TEXT_ALERT_TITLE_WAIT_A_MINUTE}
        />
      )}
      <Backdrop
        sx={classes.backdrop}
        open={state.isLoading || recipeDrawerData.isLoadingData}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <EventListCard
        cardTitle={TEXT_SHOPPING_LIST}
        cardDescription={TEXT_SHOPPING_LIST_MENUE_SELECTION_DESCRIPTION}
        outOfDateWarnMessage={
          TEXT_USED_RECIPES_OF_SHOPPINGLIST_POSSIBLE_OUT_OF_DATE
        }
        selectedListItem={state.selectedListItem}
        lists={shoppingListCollection.lists}
        noOfLists={shoppingListCollection.noOfLists}
        menuplan={menuplan}
        onCreateList={onCreateList}
        onListElementSelect={onListElementSelect}
        onListElementDelete={onListElementDelete}
        onListElementEdit={onListElementEdit}
        onRefreshLists={onRefreshLists}
        onGeneratePrintVersion={onGeneratePrintVersion}
      />
      {state.selectedListItem && shoppingList && (
        <React.Fragment>
          <Box
            component="div"
            sx={{
              ...classes.container,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              mx: "auto",
            }}
          >
            <ToggleButtonGroup
              exclusive
              value={shoppingListModus}
              onChange={(event, newValue) => setShoppingListModus(newValue)}
              color="primary"
            >
              <ToggleButton
                value={ListMode.VIEW}
                aria-label={TEXT_SHOPPING_MODE}
              >
                {TEXT_SHOPPING_MODE}
              </ToggleButton>
              <ToggleButton value={ListMode.EDIT} aria-label={TEXT_EDIT_MODE}>
                {TEXT_EDIT_MODE}
              </ToggleButton>
            </ToggleButtonGroup>
            <Stack
              direction="row"
              spacing={2}
              sx={{marginTop: theme.spacing(2)}}
            >
              <Button
                color="primary"
                size="small"
                onClick={onAddDepartmentClick}
                variant="outlined"
                sx={{
                  marginTop: theme.spacing(2),
                }}
              >
                {TEXT_ADD_DEPARTMENT}
              </Button>
            </Stack>
          </Box>
          <Box component="div" sx={{justifyContent: "center", display: "flex"}}>
            <EventShoppingListList
              shoppingList={shoppingList}
              products={products}
              materials={materials}
              units={units}
              shoppingListModus={shoppingListModus}
              onCheckboxClick={onCheckboxClick}
              onChangeItem={onChangeItem}
              onOpenContexMenü={onOpenContextMenu}
            />
          </Box>
        </React.Fragment>
      )}
      <DialogSelectMenues
        open={dialogSelectMenueData.open}
        title={TEXT_WHICH_MENUES_FOR_SHOPPING_LIST_GENERATION}
        dates={menuplan.dates}
        preSelectedMenue={dialogSelectMenueData.menues}
        mealTypes={menuplan.mealTypes}
        meals={menuplan.meals}
        menues={menuplan.menues}
        showSelectAll={true}
        onClose={onCloseDialogSelectMenues}
        onConfirm={onConfirmDialogSelectMenues}
      />
      <DialogSelectDepartments
        open={dialogSelectDepartments.open}
        departments={
          dialogSelectDepartments.caller ===
          DialogSelectDepartmentsCaller.ADD_DEPARTMENT
            ? departments.filter(
                (department) =>
                  !Object.values(shoppingList?.list ?? {}).some(
                    (entry) => entry.departmentUid === department.uid,
                  ),
              )
            : departments
        }
        preSelecteDepartments={dialogSelectDepartments.selectedDepartments}
        singleSelection={dialogSelectDepartments.singleSelection}
        onClose={onCloseDialogSelectDepartments}
        onConfirm={onConfirmDialogSelectDepartments}
      />
      <DialogHandleItem
        dialogOpen={handleItemDialogValues.open}
        item={handleItemDialogValues.item}
        unit={handleItemDialogValues.unit}
        quantity={handleItemDialogValues.quantity}
        products={products}
        materials={materials}
        units={units}
        departments={departments}
        editMode={handleItemDialogValues.item.uid ? true : false}
        firebase={firebase}
        authUser={authUser}
        handleOk={onDialogHandleItemOk}
        handleClose={onDialogHandleItemClose}
        // onProductCreate={onProductCreate}
        // onMaterialCreate={onMaterialCreate}
      />
      <PositionContextMenu
        itemType={TEXT_ITEM}
        listMode={shoppingListModus}
        anchorEl={contextMenuSelectedItem.anchor}
        handleMenuClick={onContextMenuClick}
        handleMenuClose={onCloseContextMenu}
      />
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={handleSnackbarClose}
      />
      {state.selectedListItem && contextMenuSelectedItem.productUid && (
        // kann nur generiert werden, wenn auch etwas ausgewählt ist
        <DialogTraceItem
          dialogOpen={traceItemDialogValues.open}
          trace={
            shoppingListCollection.lists[state.selectedListItem!].trace[
              contextMenuSelectedItem.productUid
            ]
          }
          sortedMenues={traceItemDialogValues.sortedMenues}
          hasBeenManualyEdited={Boolean(
            shoppingList!.list[
              contextMenuSelectedItem.departmentKey
            ]?.items.find(
              (item) => item.item.uid == contextMenuSelectedItem.productUid,
            )?.manualEdit,
          )}
          handleClose={onDialogTraceItemClose}
          onShowRecipe={onOpenRecipeDrawer}
        />
      )}
      {recipeDrawerData.open && (
        <RecipeDrawer
          drawerSettings={recipeDrawerData}
          recipe={recipeDrawerData.recipe}
          mealPlan={recipeDrawerData.mealPlan}
          groupConfiguration={{} as EventGroupConfiguration}
          scaledPortions={recipeDrawerData.scaledPortions}
          editMode={false}
          disableFunctionality={true}
          firebase={firebase}
          authUser={authUser}
          onClose={onRecipeDrawerClose}
        />
      )}
    </Stack>
  );
};
/* ===================================================================
// ========================= Einkaufsliste ===========================
// =================================================================== */
interface EventShoppingListListProps {
  shoppingList: ShoppingList;
  units: Unit[];
  products: Product[];
  materials: Material[];
  shoppingListModus: ListMode;
  onCheckboxClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenContexMenü: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onChangeItem: (change: ItemChange) => void;
}
const EventShoppingListList = ({
  shoppingList,
  products,
  materials,
  units,
  shoppingListModus,
  onCheckboxClick,
  onOpenContexMenü,
  onChangeItem,
}: EventShoppingListListProps) => {
  const classes = useCustomStyles();
  const theme = useTheme();
  /* ------------------------------------------
  // Mapper für Autocomplete
  // ------------------------------------------ */
  const toAutocompleteItem = (shoppingListItem: ShoppingListItem) => {
    switch (shoppingListItem.type) {
      case ItemType.food:
        return {
          uid: shoppingListItem.item.uid,
          name: shoppingListItem.item.name,
          itemType: ItemType.food,
        } as ProductItem;
      case ItemType.material:
        return {
          uid: shoppingListItem.item.uid,
          name: shoppingListItem.item.name,
          itemType: ItemType.material,
        } as MaterialItem;
      case ItemType.custom:
        return shoppingListItem.item.name;
      default:
        return null;
    }
  };

  const prepareDepartmentItemsForDisplay = (items: ShoppingListItem[]) => {
    // Leere Zeilen ans Ende sortieren, damit sie nicht zwischen den anderen Items auftauchen
    const sortedList = [...items].sort((a, b) => {
      if (!a.item.name && !b.item.name) return 0;
      if (!a.item.name) return 1;
      if (!b.item.name) return -1;
      return a.item.name.localeCompare(b.item.name);
    });

    if (shoppingListModus === ListMode.VIEW) {
      return sortedList;
    }

    if (
      sortedList.length === 0 ||
      sortedList[sortedList.length - 1].item.name !== ""
    ) {
      const newItem = ShoppingList.createEmptyListItem();
      newItem.manualAdd = true;
      sortedList.push(newItem);
    }

    return sortedList;
  };

  return (
    <Container
      sx={{...classes.container, width: "100%"}}
      component="main"
      maxWidth="sm"
      key={"ShoppingListContainer"}
    >
      {Object.entries(shoppingList.list).map(
        ([departmentKey, department]: [string, ShoppingListDepartment]) => (
          <React.Fragment key={"GridItemDepartment_" + departmentKey}>
            <Typography
              component={"h2"}
              variant={"h5"}
              align="center"
              gutterBottom
              sx={{marginTop: theme.spacing(4)}}
            >
              {department.departmentName}
            </Typography>
            <List
              sx={classes.eventList}
              key={"shoppingListList_" + department.departmentUid}
            >
              {prepareDepartmentItemsForDisplay(department.items).map(
                (item) => (
                  <ListItem
                    key={"shoppingListItem_" + item.item.uid + "_" + item.unit}
                    sx={
                      shoppingListModus === ListMode.VIEW
                        ? {margin: 0, padding: 0}
                        : classes.eventListItem
                    }
                  >
                    <ListItemIcon
                      sx={
                        shoppingListModus === ListMode.VIEW
                          ? {minWidth: 36}
                          : undefined
                      }
                    >
                      <Checkbox
                        key={"checkbox_" + item.item.uid + "_" + item.unit}
                        name={
                          "checkbox_" +
                          departmentKey +
                          "_" +
                          item.item.uid +
                          "_" +
                          item.unit
                        }
                        onChange={onCheckboxClick}
                        checked={item.checked}
                        disableRipple
                        size={
                          shoppingListModus === ListMode.VIEW
                            ? "small"
                            : "medium"
                        }
                      />
                    </ListItemIcon>
                    {shoppingListModus === ListMode.VIEW ? (
                      <>
                        <ListItemText
                          sx={classes.eventListItemTextQuantity}
                          primaryTypographyProps={
                            item.checked
                              ? {color: "textSecondary"}
                              : {color: "textPrimary"}
                          }
                          key={"quantity" + item.item.uid + "_" + item.unit}
                          primary={
                            item.checked ? (
                              <del>
                                {Number.isNaN(item.quantity) ||
                                item.quantity == 0
                                  ? ""
                                  : new Intl.NumberFormat("de-CH", {
                                      maximumSignificantDigits: 3,
                                    }).format(item.quantity)}
                              </del>
                            ) : Number.isNaN(item.quantity) ||
                              item.quantity == 0 ? (
                              ""
                            ) : (
                              new Intl.NumberFormat("de-CH", {
                                maximumSignificantDigits: 2,
                              }).format(item.quantity)
                            )
                          }
                        />
                        <ListItemText
                          sx={classes.eventListItemTextUnit}
                          primaryTypographyProps={
                            item.checked
                              ? {color: "textSecondary"}
                              : {color: "textPrimary"}
                          }
                          key={"unit_" + item.item.uid + "_" + item.unit}
                          primary={
                            item.checked ? <del>{item.unit}</del> : item.unit
                          }
                        />
                        <ListItemText
                          sx={classes.eventListItemTextProduct}
                          primaryTypographyProps={
                            item.checked
                              ? {color: "textSecondary"}
                              : {color: "textPrimary"}
                          }
                          key={"itemName_" + item.item.uid + "_" + item.unit}
                          primary={
                            item.checked ? (
                              <del>{item.item.name}</del>
                            ) : (
                              item.item.name
                            )
                          }
                        />
                      </>
                    ) : (
                      <Grid
                        container
                        spacing={2}
                        alignItems="center"
                        sx={{flex: 1, minWidth: 0}}
                      >
                        <Grid
                          key={"quantity_grid_" + item.item.uid}
                          xs={5}
                          sm={3}
                        >
                          <TextField
                            key={
                              "quantity_" + departmentKey + "_" + item.item.uid
                            }
                            id={
                              "quantity_" + departmentKey + "_" + item.item.uid
                            }
                            value={
                              Number.isNaN(item.quantity) || item.quantity === 0
                                ? ""
                                : item.quantity
                            }
                            label={TEXT_FIELD_QUANTITY}
                            type="number"
                            inputProps={{min: 0, inputMode: "decimal"}}
                            onChange={(event) =>
                              onChangeItem({
                                source: "textfield",
                                event: event,
                                value: event.target.value,
                              })
                            }
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid key={"unit_grid_" + item.item.uid} xs={4} sm={3}>
                          <UnitAutocomplete
                            componentKey={departmentKey + "_" + item.item.uid}
                            unitKey={item.unit}
                            units={units}
                            size={TextFieldSize.small}
                            onChange={(event, newValue, reason, objectId) =>
                              onChangeItem({
                                source: "autocompleteUnit",
                                event,
                                value: newValue,
                                reason,
                                objectId,
                              })
                            }
                          />
                        </Grid>
                        <Grid key={"item_grid_" + item.item.uid} xs={12} sm={6}>
                          <ItemAutocomplete
                            componentKey={departmentKey + "_" + item.item.uid}
                            item={toAutocompleteItem(item)}
                            materials={materials}
                            products={products}
                            disabled={false}
                            allowCreateNewItem={false}
                            allowFreeText={true}
                            error={{isError: false, errorText: ""}}
                            size={TextFieldSize.small}
                            onChange={(event, newValue, reason, objectId) =>
                              onChangeItem({
                                source: "autocompleteItem",
                                event,
                                value: newValue,
                                reason,
                                objectId,
                              })
                            }
                          />
                        </Grid>
                      </Grid>
                    )}
                    <IconButton
                      key={
                        "MoreBtn_" +
                        departmentKey +
                        "_" +
                        item.item.uid +
                        "_" +
                        item.unit
                      }
                      id={
                        "MoreBtn_" +
                        departmentKey +
                        "_" +
                        item.item.uid +
                        "_" +
                        item.unit
                      }
                      aria-label="settings"
                      onClick={onOpenContexMenü}
                      size={
                        shoppingListModus === ListMode.VIEW ? "small" : "large"
                      }
                      sx={{flexShrink: 0}}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </ListItem>
                ),
              )}
            </List>
          </React.Fragment>
        ),
      )}
    </Container>
  );
};

/* ===================================================================
// ==================== Dialog Artikel hinzufügen ====================
// =================================================================== */
interface DialogHandleItemProps {
  dialogOpen: boolean;
  item: null | ProductItem | MaterialItem;
  quantity: string;
  unit: Unit["key"];
  products: Product[];
  materials: Material[];
  units: Unit[];
  departments: Department[];
  editMode: boolean;
  firebase: Firebase;
  authUser: AuthUser;
  handleOk: ({item, quantity, unit}: OnDialogAddItemOk) => void;
  handleClose: () => void;
  // onMaterialCreate: (material: Material) => void;
  // onProductCreate: (product: Product) => void;
}
interface OnDialogAddItemOk {
  item: ProductItem | MaterialItem;
  quantity: number;
  unit: Unit["key"];
}
interface DialogValues {
  quantity: string;
  unit: Unit["key"];
  item: ProductItem | MaterialItem | null;
}
const DIALOG_VALUES_INITIAL_STATE: DialogValues = {
  quantity: "",
  unit: "",
  item: {...new Product(), itemType: ItemType.none},
};
const DIALOG_VALUES_VALIDATION_INITIAL_STATE = {
  isError: false,
  errorText: "",
};
const DialogHandleItem = ({
  dialogOpen,
  item,
  quantity,
  unit,
  products,
  materials,
  units,
  departments,
  editMode,
  firebase,
  authUser,
  handleOk: handleOkSuper,
  handleClose: handleCloseSuper,
  // onMaterialCreate: onMaterialCreateSuper,
  // onProductCreate: onProductCreateSuper,
}: DialogHandleItemProps) => {
  const {customDialog} = useCustomDialog();

  const [dialogValues, setDialogValues] = React.useState(
    DIALOG_VALUES_INITIAL_STATE,
  );
  const [dialogValidation, setDialogValidation] = React.useState(
    DIALOG_VALUES_VALIDATION_INITIAL_STATE,
  );
  const [materialAddPopupValues, setMaterialAddPopupValues] = React.useState({
    ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
    ...{popUpOpen: false},
  });
  const [productAddPopupValues, setProductAddPopupValues] = React.useState({
    ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
    ...{popUpOpen: false},
  });

  if (dialogValues == DIALOG_VALUES_INITIAL_STATE && item?.uid) {
    setDialogValues({
      quantity: quantity,
      unit: unit,
      item: item,
    });
  }
  /* ------------------------------------------
  // Change-Handler Dialog
  // ------------------------------------------ */
  const onChangeItem = async (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: string | MaterialItem | ProductItem | null,
  ) => {
    if (typeof newValue === "string" || !newValue) {
      return;
    }
    if (newValue.name.endsWith(TEXT_ADD)) {
      // Herausfinden ob ein Produkt oder Material angelegt werden soll
      const userInput = (await customDialog({
        dialogType: DialogType.selectOptions,
        title: TEXT_NEW_ITEM,
        text: TEXT_WHAT_KIND_OF_ITEM_ARE_YOU_CREATING,
        singleTextInputProperties: {
          initialValue: "",
          textInputLabel: TEXT_NAME,
        },
        options: [
          {key: ItemType.food, text: TEXT_FOOD},
          {key: ItemType.material, text: TEXT_MATERIAL},
        ],
      })) as SingleTextInputResult;
      if (userInput.valid) {
        // Begriff Hinzufügen und Anführzungszeichen entfernen
        const itemName = newValue?.name.match('".*"')![0].slice(1, -1);

        const selectedItemType = parseInt(userInput.input) as ItemType;
        if (selectedItemType == ItemType.material) {
          // Fenster anzeigen um neues Material zu erfassen
          setMaterialAddPopupValues({
            ...materialAddPopupValues,
            name: itemName,
            popUpOpen: true,
          });
        } else {
          // Fenster anzeigen um neues Produkt zu erfassen
          setProductAddPopupValues({
            ...productAddPopupValues,
            name: itemName,
            popUpOpen: true,
          });
        }
      }
    } else {
      setDialogValues({...dialogValues, item: newValue});
    }
  };
  const onQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDialogValues({
      ...dialogValues,
      quantity: event.target.value,
    });
  };
  const onUnitChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: Unit | null,
  ) => {
    if (newValue) {
      setDialogValues({...dialogValues, unit: newValue.key});
    } else {
      // Wurde gelöscht
      setDialogValues({...dialogValues, unit: ""});
    }
  };
  /* ------------------------------------------
  // Button-Handler Dialog
  // ------------------------------------------ */
  const handleOk = () => {
    // Prüfen ob Eingaben korrekt (Produkt muss vorhanden sein)
    if (!dialogValues.item || !dialogValues.item.uid) {
      setDialogValidation({
        isError: true,
        errorText: TEXT_PLEASE_GIVE_VALUE_FOR_FIELD(TEXT_ITEM),
      });
      return;
    }
    handleOkSuper({
      item: dialogValues.item,
      quantity: parseFloat(dialogValues.quantity),
      unit: dialogValues.unit,
    });
    setDialogValues(DIALOG_VALUES_INITIAL_STATE);
    setDialogValidation(DIALOG_VALUES_VALIDATION_INITIAL_STATE);
  };
  const handleClose = () => {
    setDialogValues(DIALOG_VALUES_INITIAL_STATE);
    setDialogValidation(DIALOG_VALUES_VALIDATION_INITIAL_STATE);
    handleCloseSuper();
  };
  /* ------------------------------------------
  // Pop-Up Handler Material/Produkt
  // ------------------------------------------ */
  const onMaterialCreate = (material: Material) => {
    //FIXME:
    const item: MaterialItem = {...material, itemType: ItemType.material};
    setDialogValues({...dialogValues, item: item});

    setMaterialAddPopupValues({
      ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
    // onMaterialCreateSuper(material);
  };
  const onCloseDialogMaterial = () => {
    setMaterialAddPopupValues({
      ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  const onProductCreate = (product: Product) => {
    const item: ProductItem = {...product, itemType: ItemType.food};
    setDialogValues({...dialogValues, item: item});

    setProductAddPopupValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
    // onProductCreateSuper(product);
  };

  const onProductChooseExisting = (product: Product) => {
    const item: ProductItem = {...product, itemType: ItemType.food};
    setDialogValues({...dialogValues, item: item});

    setProductAddPopupValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };

  const onCloseDialogProduct = () => {
    setProductAddPopupValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  return (
    <React.Fragment>
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{TEXT_ADD_ITEM}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid xs={12}>
              {/* Produkt */}
              <ItemAutocomplete
                componentKey={"x"}
                item={dialogValues.item}
                materials={materials}
                products={products}
                disabled={editMode}
                size={TextFieldSize.medium}
                onChange={onChangeItem}
                error={dialogValidation}
              />
            </Grid>
            {/* Menge */}
            <Grid xs={6}>
              <TextField
                margin="normal"
                id={"quantity"}
                key={"quantity"}
                type="number"
                label={TEXT_QUANTITY}
                name={"quantity"}
                value={dialogValues.quantity}
                fullWidth
                onChange={onQuantityChange}
              />
            </Grid>
            <Grid xs={6}>
              {/* Einheit */}
              <FormControl fullWidth margin="normal">
                <UnitAutocomplete
                  componentKey="unit_"
                  unitKey={dialogValues.unit}
                  units={units}
                  onChange={onUnitChange}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="primary" variant="outlined" onClick={handleClose}>
            {TEXT_CANCEL}
          </Button>
          <Button color="primary" variant="contained" onClick={handleOk}>
            {item?.uid ? TEXT_CHANGE : TEXT_ADD}
          </Button>
        </DialogActions>
      </Dialog>

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
        firebase={firebase}
        authUser={authUser}
      />
      <DialogProduct
        firebase={firebase}
        productName={productAddPopupValues.name}
        productUid={productAddPopupValues.uid}
        productUsable={productAddPopupValues.usable}
        productDietProperties={productAddPopupValues.dietProperties}
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

export default EventShoppingListPage;
