import React from "react";
import {pdf} from "@react-pdf/renderer";
import fileSaver from "file-saver";

import {
  Grid,
  Button,
  Backdrop,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Divider,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  IconButton,
  Container,
  Checkbox,
  useTheme,
  Menu,
  MenuItem,
  Link,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  FormControl,
} from "@material-ui/core";

import {
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  MENUE_SELECTION as TEXT_MENUE_SELECTION,
  SHOPPING_LIST_MENUE_SELECTION_DESCRIPTION as TEXT_SHOPPING_LIST_MENUE_SELECTION_DESCRIPTION,
  PRINTVERSION as TEXT_PRINTVERSION,
  REFRESH as TEXT_REFRESH,
  CREATE_NEW_LIST as TEXT_CREATE_NEW_LIST,
  WHICH_MENUES_FOR_RECIPE_GENERATION as TEXT_WHICH_MENUES_FOR_RECIPE_GENERATION,
  EXISTING_LISTS as TEXT_EXISTING_LISTS,
  USED_RECIPES_OF_SHOPPINGLIST_POSSIBLE_OUT_OF_DATE as TEXT_USED_RECIPES_OF_SHOPPINGLIST_POSSIBLE_OUT_OF_DATE,
  NAME as TEXT_NAME,
  NEW_LIST as TEXT_NEW_LIST,
  GIVE_THE_NEW_SHOPPINGLIST_A_NAME as GIVE_THE_NEW_SHOPPINGLIST_A_NAME,
  CHANGE as TEXT_CHANGE,
  DELETE as TEXT_DELETE,
  WHERE_DOES_THIS_PRODUCT_COME_FROM as TEXT_WHERE_DOES_THIS_PRODUCT_COME_FROM,
  ERROR_NO_RECIPES_FOUND as TEXT_ERROR_NO_RECIPES_FOUND,
  ADD_ITEM as TEXT_ADD_ITEM,
  CANCEL as TEXT_CANCEL,
  ADD as TEXT_ADD,
  QUANTITY as TEXT_QUANTITY,
  NEW_ITEM as TEXT_NEW_ITEM,
  WHAT_KIND_OF_ITEM_ARE_YOU_CREATING as TEXT_WHAT_KIND_OF_ITEM_ARE_YOU_CREATING,
  FOOD as TEXT_FOOD,
  MATERIAL as TEXT_MATERIAL,
  CLOSE as TEXT_CLOSE,
  WHERE_IS_THIS_PRODUCT_USE as TEXT_WHERE_IS_THIS_PRODUCT_USE,
  THE_QUANTITY_HAS_BEEN_MANUALY_EDITED as TEXT_THE_QUANTITY_HAS_BEEN_MANUALY_EDITED,
  ADDED_MANUALY as TEXT_ADDED_MANUALY,
  ARTICLE_ALREADY_ADDED as TEXT_ARTICLE_ALREADY_ADDED,
  ADD_OR_REPLACE_ARTICLE as TEXT_ADD_OR_REPLACE_ARTICLE,
  REPLACE as TEXT_REPLACE,
  SUM as TEXT_SUM,
  ADD_OR_REPLACE_ARTICLE,
  KEEP_MANUALLY_ADDED_PRODUCTS as TEXT_KEEP_MANUALLY_ADDED_PRODUCTS,
  MANUALLY_ADDED_PRODUCTS as TEXT_MANUALLY_ADDED_PRODUCTS,
  KEEP as TEXT_KEEP,
  SHOPPING_LIST as TEXT_SHOPPING_LIST,
  SUFFIX_PDF as TEXT_SUFFIX_PDF,
} from "../../../constants/text";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ErrorOutline as ErrorOutlineIcon,
  MoreVert as MoreVertIcon,
  CallSplit as CallSplitIcon,
  Info as InfoIcon,
} from "@material-ui/icons";

import useStyles from "../../../constants/styles";

import Firebase from "../../Firebase";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import Menuplan, {
  MealRecipe,
  MealType,
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
  ProductTrace,
  ShoppingListProperties,
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
  decodeSelectedMenues,
} from "../Menuplan/dialogSelectMenues";
import Product from "../../Product/product.class";
import {
  UnitConversionBasic,
  UnitConversionProducts,
} from "../../Unit/unitConversion.class";
import Department from "../../Department/department.class";
import Material, {MaterialType} from "../../Material/material.class";
import Event from "../Event/event.class";
import UnitAutocomplete from "../../Unit/unitAutocomplete";
import ItemAutocomplete, {MaterialItem, ProductItem} from "./itemAutocomplete";
import Unit from "../../Unit/unit.class";
import {AutocompleteChangeReason} from "@material-ui/lab";
import {convertToObject} from "typescript";
import Recipe, {PositionType, Recipes} from "../../Recipe/recipe.class";
import DialogMaterial, {
  MATERIAL_DIALOG_TYPE,
  MATERIAL_POP_UP_VALUES_INITIAL_STATE,
} from "../../Material/dialogMaterial";
import {
  FetchMissingDataProps,
  FetchMissingDataType,
  MasterDataCreateType,
  OnMasterdataCreateProps,
} from "../Event/event";
import DialogProduct, {
  PRODUCT_DIALOG_TYPE,
  PRODUCT_POP_UP_VALUES_INITIAL_STATE,
} from "../../Product/dialogProduct";
import Utils from "../../Shared/utils.class";
import {
  RECIPE_DRAWER_DATA_INITIAL_VALUES,
  RecipeDrawer,
  RecipeDrawerData,
} from "../Menuplan/menuplan";
import EventGroupConfiguration from "../GroupConfiguration/groupConfiguration.class";
import recipes from "../../Recipe/recipes";
import RecipeShort from "../../Recipe/recipeShort.class";
import ShoppingListPdf from "./shoppingListPdf";

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
  isError: boolean;
  isLoading: boolean;
  error: object;
  snackbar: Snackbar;
};
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};
const inititialState: State = {
  selectedListItem: null,
  isError: false,
  isLoading: false,
  error: {},
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
        isError: true,
        isLoading: false,
        error: action.payload,
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
    shoppingListCollection: ShoppingListCollection
  ) => void;
  onMasterdataCreate: ({type, value}: OnMasterdataCreateProps) => void;
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
  onMasterdataCreate,
}: EventShoppingListPageProps) => {
  const classes = useStyles();
  const {customDialog} = useCustomDialog();

  const navigationValuesContext = React.useContext(NavigationValuesContext);

  const [state, dispatch] = React.useReducer(
    usedRecipesReducer,
    inititialState
  );
  const [dialogSelectMenueData, setDialogSelectMenueData] = React.useState({
    open: false,
    menues: {} as DialogSelectMenuesForRecipeDialogValues,
  });
  const [contextMenuSelectedItem, setContextMenuSelectedItem] = React.useState(
    CONTEXT_MENU_SELECTE_ITEM_INITIAL_STATE
  );
  const [handleItemDialogValues, setHandleItemDialogValues] = React.useState(
    ADD_ITEM_DIALOG_INITIAL_VALUES
  );
  const [traceItemDialogValues, setTraceItemDialogValues] = React.useState(
    TRACE_ITEM_DIALOG_INITIAL_VALUES
  );
  const [recipeDrawerData, setRecipeDrawerData] =
    React.useState<RecipeDrawerData>(RECIPE_DRAWER_DATA_INITIAL_VALUES);
  /* ------------------------------------------
  // Initialisierung
  // ------------------------------------------ */
  if (
    recipeDrawerData.isLoadingData &&
    recipes.hasOwnProperty(recipeDrawerData.recipe.uid)
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
  const onShowDialogSelectMenues = () => {
    setDialogSelectMenueData({...dialogSelectMenueData, open: true});
  };
  const onCloseDialogSelectMenues = () => {
    setDialogSelectMenueData({...dialogSelectMenueData, open: false});
  };
  const onConfirmDialogSelectMenues = async (
    selectedMenues: DialogSelectMenuesForRecipeDialogValues
  ) => {
    let userInput = (await customDialog({
      dialogType: DialogType.SingleTextInput,
      title: TEXT_NEW_LIST,
      text: GIVE_THE_NEW_SHOPPINGLIST_A_NAME,
      singleTextInputProperties: {
        initialValue: "",
        textInputLabel: TEXT_NAME,
      },
    })) as SingleTextInputResult;
    setDialogSelectMenueData({...dialogSelectMenueData, open: false});

    if (userInput.valid) {
      // Wait anzeigen
      dispatch({type: ReducerActions.SHOW_LOADING, payload: {isLoading: true}});

      // Rezepte holen und Liste erstellen
      await ShoppingListCollection.createNewList({
        name: userInput.input,
        shoppingListCollection: shoppingListCollection,
        selectedMenues: Object.keys(selectedMenues).map((menueUid) => menueUid),
        menueplan: menuplan,
        eventUid: event.uid,
        products: products,
        materials: materials,
        departments: departments,
        unitConversionBasic: unitConversionBasic!,
        unitConversionProducts: unitConversionProducts!,
        firebase: firebase,
        authUser: authUser,
      })
        .then((result) => {
          fetchMissingData({
            type: FetchMissingDataType.SHOPPING_LIST,
            objectUid: result,
          });
          // liste gleich anzeigen!

          dispatch({
            type: ReducerActions.SET_SELECTED_LIST_ITEM,
            payload: {uid: result},
          });
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
        });
    }
  };
  /* ------------------------------------------
  // Listen aktualisieren
  // ------------------------------------------ */
  const onRefreshLists = async () => {
    let keepManuallyAddedItems = false;

    if (
      shoppingListCollection.lists[shoppingList?.uid!].properties
        .hasManuallyAddedItems
    ) {
      let userInput = (await customDialog({
        dialogType: DialogType.selectOptions,
        title: TEXT_MANUALLY_ADDED_PRODUCTS,
        text: TEXT_KEEP_MANUALLY_ADDED_PRODUCTS,
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

    dispatch({type: ReducerActions.SHOW_LOADING, payload: {isLoading: true}});

    // Alle Listen aktualisieren
    ShoppingListCollection.refreshList({
      shoppingListCollection: shoppingListCollection,
      shoppingList: shoppingList!,
      keepManuallyAddedItems: keepManuallyAddedItems,
      menueplan: menuplan,
      eventUid: event.uid,
      products: products,
      materials: materials,
      unitConversionBasic: unitConversionBasic!,
      unitConversionProducts: unitConversionProducts!,
      departments: departments,
      firebase: firebase,
      authUser: authUser,
    })
      .then((result) => {
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
    pdf(
      <ShoppingListPdf
        shoppingList={shoppingList!}
        shoppingListName={
          shoppingListCollection.lists[state.selectedListItem!].properties.name
        }
        shoppingListSelectedTimeSlice={decodeSelectedMenues({
          selectedMenues:
            shoppingListCollection.lists[state.selectedListItem!].properties
              .selectedMenues,
          menuplan: menuplan,
        })}
        eventName={event.name}
        authUser={authUser}
      />
    )
      .toBlob()
      .then((result) => {
        console.log(result);
        fileSaver.saveAs(
          result,
          event.name + " " + TEXT_SHOPPING_LIST + TEXT_SUFFIX_PDF
        );
      });
  };
  /* ------------------------------------------
  // Snackbar-Handling
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
  // List-Handling
  // ------------------------------------------ */
  const onListElementSelect = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    let selectedListItem = event.currentTarget.id.split("_")[1];

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
    actionEvent: React.MouseEvent<HTMLElement>
  ) => {
    let selectedList = actionEvent.currentTarget.id.split("_")[1];

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
    actionEvent: React.MouseEvent<HTMLElement>
  ) => {
    let selectedList = actionEvent.currentTarget.id.split("_")[1];
    if (!selectedList) {
      return;
    }

    let userInput = (await customDialog({
      dialogType: DialogType.SingleTextInput,
      title: "Namen anpassen",
      singleTextInputProperties: {
        initialValue:
          shoppingListCollection.lists[selectedList].properties.name,
        textInputLabel: "Name",
      },
    })) as SingleTextInputResult;

    if (userInput.valid) {
      let updatedShoppingListCollection = ShoppingListCollection.editListName({
        shoppingListCollection: shoppingListCollection,
        listUidToEdit: selectedList,
        newName: userInput.input,
        authUser: authUser,
      });
      ShoppingListCollection.save({
        shoppingListCollection: updatedShoppingListCollection,
        eventUid: event.uid,
        firebase: firebase,
        authUser: authUser,
      });
    }
  };
  const onCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Umschiessen und speichern!
    const pressedCheckbox = event.target.name.split("_");

    let item = shoppingList!.list[pressedCheckbox[1]].items.find(
      (item: ShoppingListItem) =>
        item.item.uid == pressedCheckbox[2] && item.unit == pressedCheckbox[3]
    ) as ShoppingListItem;
    item.checked = !item.checked;
    onShoppingListUpdate(shoppingList!);
  };
  /* ------------------------------------------
  // Kontext-Menü-Handler
  // ------------------------------------------ */
  const onOpenContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    let pressedButton = event.currentTarget.id.split("_");

    let item = shoppingList?.list[parseInt(pressedButton[1])].items.find(
      (item) => item.item.uid == pressedButton[2]
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
    let pressedButton = event.currentTarget.id.split("_");
    switch (pressedButton[1]) {
      case Action.EDIT:
        let item = {} as ProductItem | MaterialItem | undefined;

        let quantity = shoppingList?.list[
          contextMenuSelectedItem.departmentKey
        ].items.find(
          (item) => item.item.uid == contextMenuSelectedItem.productUid
        )?.quantity;

        if (contextMenuSelectedItem.itemType == ItemType.food) {
          item = products.find(
            (product) => product.uid == contextMenuSelectedItem.productUid
          ) as ProductItem;
        } else {
          item = materials.find(
            (material) => material.uid == contextMenuSelectedItem.productUid
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
        let updatedShoppingList = ShoppingList.deleteItem({
          shoppingListReference: shoppingList!,
          departmentKey: contextMenuSelectedItem.departmentKey,
          unit: contextMenuSelectedItem.unit,
          itemUid: contextMenuSelectedItem.productUid,
        });

        let updatedTrace = ShoppingListCollection.deleteTraceEntry({
          trace: shoppingListCollection.lists[state.selectedListItem!].trace,
          itemUid: contextMenuSelectedItem.productUid,
        });
        let updatedShoppingListCollection = {
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
  const onAddArticleClick = () => {
    setHandleItemDialogValues({...handleItemDialogValues, open: true});
  };
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
          (department) => department.uid == product.department.uid
        );
      } else {
        // Material
        department = departments.find(
          (department) => department.name.toUpperCase() == "NON FOOD"
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
          shoppingListItem.item.uid == item.uid && shoppingListItem.unit == unit
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
            shoppingListItem.quantity.toString()
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
        });
      }
      if (trace) {
        let tempShoppingListCollection = {...shoppingListCollection};
        tempShoppingListCollection.lists[state.selectedListItem!].trace = trace;
        onShoppingCollectionUpdate(tempShoppingListCollection);
      }
    } else {
      // Bestehende Position ändern
      let item = shoppingList?.list[
        contextMenuSelectedItem.departmentKey
      ].items.find(
        (item) =>
          item.item.uid == contextMenuSelectedItem.productUid &&
          item.unit == contextMenuSelectedItem.unit
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
  // Artikel Trace Dialog
  // ------------------------------------------ */
  const onDialogTraceItemClose = () => {
    setTraceItemDialogValues({...traceItemDialogValues, open: false});
  };
  /* ------------------------------------------
  // Recipe-Drawer-Hanlder
  // ------------------------------------------ */
  const onOpenRecipeDrawer = (
    menueUid: Menue["uid"],
    recipeUid: Recipe["uid"]
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

    if (recipes.hasOwnProperty(recipeUid)) {
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
    <React.Fragment>
      {state.isError && (
        <Grid item key={"error"} xs={12}>
          <AlertMessage
            error={state.error}
            messageTitle={TEXT_ALERT_TITLE_WAIT_A_MINUTE}
          />
        </Grid>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Backdrop
            className={classes.backdrop}
            open={state.isLoading || recipeDrawerData.isLoadingData}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </Grid>
        <Grid item xs={12}>
          <EventShoppingListCard
            selectedListItem={state.selectedListItem}
            shoppingListCollection={shoppingListCollection}
            menuplan={menuplan}
            onShowDialogSelectMenues={onShowDialogSelectMenues}
            onListElementSelect={onListElementSelect}
            onListElementDelete={onListElementDelete}
            onListElementEdit={onListElementEdit}
            onRefreshLists={onRefreshLists}
            onGeneratePrintVersion={onGeneratePrintVersion}
          />
        </Grid>
        {state.selectedListItem && shoppingList && (
          <React.Fragment>
            <Grid item container justifyContent="center" xs={12}>
              <Button color="primary" onClick={onAddArticleClick}>
                {TEXT_ADD_ITEM}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <EventShoppingListList
                menueplan={menuplan}
                shoppingList={shoppingList}
                shoppingListProperties={
                  shoppingListCollection.lists[state.selectedListItem]
                    ?.properties
                }
                shoppingListTrace={
                  shoppingListCollection.lists[state.selectedListItem]?.trace
                }
                onCheckboxClick={onCheckboxClick}
                onOpenContexMenü={onOpenContextMenu}
              />
            </Grid>
          </React.Fragment>
        )}
      </Grid>
      <DialogSelectMenues
        open={dialogSelectMenueData.open}
        title={TEXT_WHICH_MENUES_FOR_RECIPE_GENERATION}
        dates={menuplan.dates}
        preSelectedMenue={{}}
        mealTypes={menuplan.mealTypes}
        meals={menuplan.meals}
        menues={menuplan.menues}
        showSelectAll={true}
        onClose={onCloseDialogSelectMenues}
        onConfirm={onConfirmDialogSelectMenues}
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
        authUser={authUser}
        handleOk={onDialogHandleItemOk}
        handleClose={onDialogHandleItemClose}
        onProductCreate={onProductCreate}
        onMaterialCreate={onMaterialCreate}
      />
      <PositionContextMenu
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
            shoppingListCollection.lists[state.selectedListItem!]?.trace[
              contextMenuSelectedItem.productUid
            ]
          }
          menuePlan={menuplan}
          sortedMenues={traceItemDialogValues.sortedMenues}
          hasBeenManualyEdited={Boolean(
            shoppingList!.list[
              contextMenuSelectedItem.departmentKey
            ]?.items.find(
              (item) => item.item.uid == contextMenuSelectedItem.productUid
            )?.manualEdit
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
          onAddToEvent={() => {}}
          onEditRecipeMealPlan={() => {}}
          onRecipeUpdate={() => {}}
          onSwitchEditMode={() => {}}
          onRecipeDelete={() => {}}
        />
      )}
    </React.Fragment>
  );
};
/* ===================================================================
// ======================= Einstellungen-Card ========================
// =================================================================== */
interface EventShoppingListCardProps {
  selectedListItem: string | null;
  shoppingListCollection: ShoppingListCollection;
  menuplan: Menuplan;
  onShowDialogSelectMenues: () => void;
  onListElementSelect: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  onListElementDelete: (event: React.MouseEvent<HTMLElement>) => void;
  onListElementEdit: (event: React.MouseEvent<HTMLElement>) => void;
  onRefreshLists: () => void;
  onGeneratePrintVersion: () => void;
}
const EventShoppingListCard = ({
  selectedListItem,
  shoppingListCollection,
  menuplan,
  onShowDialogSelectMenues,
  onListElementSelect,
  onListElementDelete,
  onListElementEdit,
  onRefreshLists,
  onGeneratePrintVersion,
}: EventShoppingListCardProps) => {
  const classes = useStyles();

  return (
    <Container
      className={classes.container}
      component="main"
      maxWidth="md"
      key={"ShoppingListContainer"}
    >
      <Card>
        <CardHeader
          title={TEXT_MENUE_SELECTION}
          subheader={TEXT_SHOPPING_LIST_MENUE_SELECTION_DESCRIPTION}
        />
        <CardContent>
          {Object.keys(shoppingListCollection.lists).length > 0 && (
            <List>
              <ListSubheader>{TEXT_EXISTING_LISTS}</ListSubheader>
              {Object.values(shoppingListCollection.lists).map((list) => (
                <ListItem
                  key={"listItem_" + list?.properties.uid}
                  id={"listItem_" + list?.properties.uid}
                  button
                  selected={selectedListItem == list?.properties.uid}
                  onClick={onListElementSelect}
                >
                  <ListItemText
                    primary={list?.properties.name}
                    secondary={
                      list?.properties.selectedMenues &&
                      decodeSelectedMenues({
                        selectedMenues: list?.properties.selectedMenues,
                        menuplan: menuplan,
                      })
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      id={"EditBtn_" + list?.properties.uid}
                      onClick={onListElementEdit}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      id={"DeleteBtn_" + list?.properties.uid}
                      onClick={onListElementDelete}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          {selectedListItem &&
            shoppingListCollection.lists[selectedListItem!] &&
            menuplan.lastChange.date >
              shoppingListCollection.lists[selectedListItem!].properties
                .generated.date && (
              <Grid container>
                <Grid
                  item
                  xs={1}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ErrorOutlineIcon color="error" />
                </Grid>
                <Grid item xs={11}>
                  <Typography color="error">
                    {TEXT_USED_RECIPES_OF_SHOPPINGLIST_POSSIBLE_OUT_OF_DATE}
                  </Typography>
                </Grid>
              </Grid>
            )}
        </CardContent>
        <CardActions style={{justifyContent: "flex-end"}}>
          <Button
            color="primary"
            variant="outlined"
            onClick={onShowDialogSelectMenues}
          >
            {TEXT_CREATE_NEW_LIST}
          </Button>
          {shoppingListCollection.noOfLists > 0 && (
            <Button
              color="primary"
              variant="outlined"
              disabled={shoppingListCollection.noOfLists == 0}
              onClick={onRefreshLists}
            >
              {TEXT_REFRESH}
            </Button>
          )}
          {shoppingListCollection.noOfLists > 0 && (
            <Button
              color="primary"
              variant="contained"
              disabled={selectedListItem == null}
              onClick={onGeneratePrintVersion}
            >
              {TEXT_PRINTVERSION}
            </Button>
          )}
        </CardActions>
      </Card>
    </Container>
  );
};
/* ===================================================================
// ========================= Einkaufsliste ===========================
// =================================================================== */
interface EventShoppingListListProps {
  menueplan: Menuplan;
  shoppingList: ShoppingList;
  shoppingListProperties: ShoppingListProperties;
  shoppingListTrace: ShoppingListTrace;
  onCheckboxClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenContexMenü: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const EventShoppingListList = ({
  menueplan,
  shoppingList,
  shoppingListProperties,
  shoppingListTrace,
  onCheckboxClick,
  onOpenContexMenü,
}: EventShoppingListListProps) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Container
      className={classes.container}
      component="main"
      maxWidth="sm"
      key={"ShoppingListContainer"}
    >
      <Grid
        container
        justifyContent="center"
        spacing={2}
        key={"ShoppingListGridContainer"}
      >
        {Object.entries(shoppingList.list).map(
          ([departmentKey, department]: [string, ShoppingListDepartment]) => (
            <Grid item xs={12} key={"GridItemDepartment_" + departmentKey}>
              <Typography
                component={"h2"}
                variant={"h5"}
                align="center"
                gutterBottom
              >
                {department.departmentName}
              </Typography>
              <Grid item xs={12} style={{marginBottom: theme.spacing(3)}}>
                <List
                  className={classes.listShoppingList}
                  key={"shoppingListList_" + department.departmentUid}
                >
                  {Utils.sortArray({
                    array: department.items,
                    attributeName: "item.name",
                  }).map((item) => (
                    <ListItem
                      key={
                        "shoppingListItem_" + item.item.uid + "_" + item.unit
                      }
                      className={classes.listShoppingListItem}
                    >
                      <ListItemIcon>
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
                          color={"primary"}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        className={classes.shoppingListItemTextQuantity}
                        primaryTypographyProps={
                          item.checked
                            ? {color: "textSecondary"}
                            : {color: "textPrimary"}
                        }
                        key={"quantity" + item.item.uid + "_" + item.unit}
                        primary={
                          item.checked ? (
                            <del>
                              {Number.isNaN(item.quantity) || item.quantity == 0
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
                              maximumSignificantDigits: 3,
                            }).format(item.quantity)
                          )
                        }
                      />
                      <ListItemText
                        className={classes.shoppingListItemTextUnit}
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
                        className={classes.shoppingListItemTextProduct}
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
                      <ListItemSecondaryAction
                        key={
                          "SecondaryAction_" +
                          departmentKey +
                          "_" +
                          item.item.uid +
                          "_" +
                          item.unit
                        }
                      >
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
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )
        )}
      </Grid>
    </Container>
  );
};
/* ===================================================================
// ========================== Kontext-Menü ===========================
// =================================================================== */
interface PositionContextMenuProps {
  anchorEl: HTMLElement | null;
  handleMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  handleMenuClose: () => void;
}
const PositionContextMenu = ({
  anchorEl,
  handleMenuClick,
  handleMenuClose,
}: PositionContextMenuProps) => {
  return (
    <Menu
      keepMounted
      id={"positionMenu"}
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem id={"ContextMenuItem_" + Action.EDIT} onClick={handleMenuClick}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{TEXT_CHANGE}</Typography>
      </MenuItem>
      <MenuItem
        id={"ContextMenuItem_" + Action.TRACE}
        onClick={handleMenuClick}
      >
        <ListItemIcon>
          <CallSplitIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">
          {TEXT_WHERE_DOES_THIS_PRODUCT_COME_FROM}
        </Typography>
      </MenuItem>
      <MenuItem
        id={"ContextMenuItem_" + Action.DELETE}
        onClick={handleMenuClick}
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{TEXT_DELETE}</Typography>
      </MenuItem>
    </Menu>
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
  authUser: AuthUser;
  handleOk: ({item, quantity, unit}: OnDialogAddItemOk) => void;
  handleClose: () => void;
  onMaterialCreate: (material: Material) => void;
  onProductCreate: (product: Product) => void;
}
interface OnDialogAddItemOk {
  item: ProductItem | MaterialItem;
  quantity: number;
  unit: Unit["key"];
}
const DIALOG_VALUES_INITIAL_STATE = {
  quantity: "",
  unit: "",
  item: {} as ProductItem | MaterialItem | null,
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
  authUser,
  handleOk: handleOkSuper,
  handleClose: handleCloseSuper,
  onMaterialCreate: onMaterialCreateSuper,
  onProductCreate: onProductCreateSuper,
}: DialogHandleItemProps) => {
  const classes = useStyles();
  const {customDialog} = useCustomDialog();

  const [dialogValues, setDialogValues] = React.useState(
    DIALOG_VALUES_INITIAL_STATE
  );
  const [dialogValidation, setDialogValidation] = React.useState(
    DIALOG_VALUES_VALIDATION_INITIAL_STATE
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
    action: AutocompleteChangeReason,
    objectId: string
  ) => {
    if (typeof newValue === "string" || !newValue) {
      return;
    }

    if (newValue.name.endsWith(TEXT_ADD)) {
      // Herausfinden ob ein Produkt oder Material angelegt werden soll
      let userInput = (await customDialog({
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
        let itemName = newValue?.name.match('".*"')![0].slice(1, -1);

        let selectedItemType = parseInt(userInput.input) as ItemType;
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
    action: AutocompleteChangeReason,
    objectId: string
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
        errorText: "Bitte Artikel eingeben.",
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
    let item: MaterialItem = {...material, itemType: ItemType.material};
    setDialogValues({...dialogValues, item: item});

    setMaterialAddPopupValues({
      ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
    onMaterialCreateSuper(material);
  };
  const onCloseDialogMaterial = () => {
    setMaterialAddPopupValues({
      ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
  };
  const onProductCreate = (product: Product) => {
    let item: ProductItem = {...product, itemType: ItemType.food};
    setDialogValues({...dialogValues, item: item});

    setProductAddPopupValues({
      ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
      popUpOpen: false,
    });
    onProductCreateSuper(product);
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
            <Grid item xs={12}>
              {/* Produkt */}
              <ItemAutocomplete
                componentKey={"x"}
                item={dialogValues.item}
                materials={materials}
                products={products}
                disable={editMode}
                onChange={onChangeItem}
                error={dialogValidation}
              />
            </Grid>
            {/* Menge */}
            <Grid item xs={6}>
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
            {/* HACK: MUI kann die Felder noch nicht zu 100% sauber ausrichten */}
            <Grid item xs={6} style={{marginTop: "3px"}}>
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
            {TEXT_ADD}
          </Button>
        </DialogActions>
      </Dialog>

      <DialogMaterial
        materialName={materialAddPopupValues.name}
        materials={materials}
        dialogType={MATERIAL_DIALOG_TYPE.CREATE}
        dialogOpen={materialAddPopupValues.popUpOpen}
        handleOk={onMaterialCreate}
        handleClose={onCloseDialogMaterial}
        authUser={authUser}
      />
      <DialogProduct
        productName={productAddPopupValues.name}
        dialogType={PRODUCT_DIALOG_TYPE.CREATE}
        dialogOpen={productAddPopupValues.popUpOpen}
        handleOk={onProductCreate}
        handleClose={onCloseDialogProduct}
        products={products}
        units={units}
        departments={departments}
        authUser={authUser}
      />
    </React.Fragment>
  );
};
/* ===================================================================
// ================== Dialog Artikel Nachverfolgung ==================
// =================================================================== */
interface DialogTraceItem {
  dialogOpen: boolean;
  trace: ProductTrace[];
  menuePlan: Menuplan;
  sortedMenues: MenueCoordinates[];
  hasBeenManualyEdited: boolean;
  handleClose: () => void;
  onShowRecipe: (menuUid: Menue["uid"], recipeUid: Recipe["uid"]) => void;
}
const DialogTraceItem = ({
  dialogOpen,
  trace,
  menuePlan,
  sortedMenues,
  hasBeenManualyEdited,
  handleClose,
  onShowRecipe,
}: DialogTraceItem) => {
  const classes = useStyles();
  let traceSortedByMenue: ProductTrace[] = [];

  /* ------------------------------------------
  // Rezept Handler
  // ------------------------------------------ */
  const onListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    let pressedButton = event.currentTarget.id.split("_");

    if (pressedButton.length == 4 && pressedButton[3] != "undefined") {
      onShowRecipe(pressedButton[1], pressedButton[3]);
    }
  };

  if (!trace) {
    return null;
  } else if (trace && trace.length > 1) {
    // die Menüs in die richtige Reihenfolge setzen
    traceSortedByMenue = trace.sort((a, b) => {
      const indexA = sortedMenues.findIndex(
        (menue) => menue.menueUid == a.menueUid
      );
      const indexB = sortedMenues.findIndex(
        (menue) => menue.menueUid == b.menueUid
      );

      return indexA - indexB;
    });
  } else {
    traceSortedByMenue = trace;
  }
  return (
    <Dialog open={dialogOpen} maxWidth="xs" fullWidth style={{zIndex: 500}}>
      <DialogTitle>{TEXT_WHERE_DOES_THIS_PRODUCT_COME_FROM}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {hasBeenManualyEdited && (
            <React.Fragment>
              <Grid item xs={2}>
                <InfoIcon fontSize="small" color="disabled" />
              </Grid>
              <Grid xs={10}>
                <Typography variant="body1">
                  {TEXT_THE_QUANTITY_HAS_BEEN_MANUALY_EDITED}
                </Typography>
              </Grid>
            </React.Fragment>
          )}
          <Grid item xs={12}>
            <List key={`list_for_trace`}>
              {sortedMenues.map((menue) => {
                let traceItems = trace.filter(
                  (item) => item.menueUid == menue.menueUid
                );
                return (
                  <React.Fragment key={`menue_container_${menue.menueUid}`}>
                    {traceItems.length > 0 && (
                      <React.Fragment key={`menue_${menue.menueUid}`}>
                        <ListSubheader disableGutters>
                          {menue.menueName && `${menue.menueName}, `}
                          {`${menue.date.toLocaleString("de-CH", {
                            weekday: "long",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })} - ${menue.mealType.name}`}
                        </ListSubheader>
                        {traceItems.map((item, counter) => (
                          <React.Fragment key={`${item}_${counter}`}>
                            {item.recipe.uid ? (
                              // List-Item nur mit Button, wenn auch ein Rezept dahinter steckt
                              <ListItem
                                button
                                onClick={onListItemClick}
                                id={`listItemButton_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                key={`listItemButton_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                              >
                                <ListItemText
                                  primary={
                                    item.recipe.name
                                      ? item.recipe.name
                                      : TEXT_ADDED_MANUALY
                                  }
                                  secondary={
                                    item?.planedPortions &&
                                    `${item.planedPortions} Portionen`
                                  }
                                  id={`listItemTextItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                  key={`listItemTextItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                />
                                <ListItemText
                                  primary={`${
                                    Number.isNaN(item.quantity) ||
                                    item.quantity == 0
                                      ? ""
                                      : item.quantity
                                  } ${item.unit}`}
                                  className={classes.listItemTextAlignRight}
                                  id={`listItemTextQuantity_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                  key={`listItemTextQuantity_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                />
                              </ListItem>
                            ) : (
                              <ListItem
                                id={`listItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                key={`listItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                              >
                                <ListItemText
                                  primary={
                                    item.recipe.name
                                      ? item.recipe.name
                                      : TEXT_ADDED_MANUALY
                                  }
                                  secondary={
                                    item?.planedPortions &&
                                    `${item.planedPortions} Portionen`
                                  }
                                  id={`listItemTextItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                  key={`listItemTextItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                />
                                <ListItemText
                                  primary={`${
                                    Number.isNaN(item.quantity) ||
                                    item.quantity == 0
                                      ? ""
                                      : item.quantity
                                  } ${item.unit}`}
                                  className={classes.listItemTextAlignRight}
                                  id={`listItemTextQuantity_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                  key={`listItemTextQuantity_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                />
                              </ListItem>
                            )}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    )}
                  </React.Fragment>
                );
              })}
              {/* Die manuell hinzugefügten Artikel auflisten */}
              {trace
                .filter((item) => item?.manualAdd)
                .map((item, counter) => (
                  <ListItem key={`manualItem_${counter}`}>
                    <ListItemText
                      primary={TEXT_ADDED_MANUALY}
                      key={`manualItemTextItem_${counter}`}
                    />
                    <ListItemText
                      primary={`${
                        Number.isNaN(item.quantity) || item.quantity == 0
                          ? ""
                          : item.quantity
                      } ${item.unit}`}
                      className={classes.listItemTextAlignRight}
                      key={`manualItemTextQuantity_${counter}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          {TEXT_CLOSE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventShoppingListPage;
