import React from "react";
import {pdf} from "@react-pdf/renderer";
import fileSaver from "file-saver";

import {
  Grid,
  Button,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  IconButton,
  Container,
  Checkbox,
} from "@material-ui/core";

import {
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  WHICH_MENUES_FOR_RECIPE_GENERATION as TEXT_WHICH_MENUES_FOR_RECIPE_GENERATION,
  SUFFIX_PDF as TEXT_SUFFIX_PDF,
  NAME as TEXT_NAME,
  NEW_LIST as TEXT_NEW_LIST,
  GIVE_THE_NEW_LIST_A_NAME as TEXT_GIVE_THE_NEW_LIST_A_NAME,
  MATERIAL_LIST as TEXT_MATERIAL_LIST,
  MATERIAL_LIST_MENUE_SELECTION_DESCRIPTION as TEXT_MATERIAL_LIST_MENUE_SELECTION_DESCRIPTION,
  ADD_ITEM as TEXT_ADD_ITEM,
  QUANTITY as TEXT_QUANTITY,
  CANCEL as TEXT_CANCEL,
  ADD as TEXT_ADD,
  MATERIAL as TEXT_MATERIAL,
  PLEASE_GIVE_VALUE_FOR_FIELD as TEXT_PLEASE_GIVE_VALUE_FOR_FIELD,
  CHANGE as TEXT_CHANGE,
  LIST_ENTRY_MAYBE_OUT_OF_DATE as TEXT_LIST_ENTRY_MAYBE_OUT_OF_DATE,
  KEEP_MANUALLY_ADDED_PRODUCTS as TEXT_KEEP_MANUALLY_ADDED_PRODUCTS,
  MANUALLY_ADDED_PRODUCTS as TEXT_MANUALLY_ADDED_PRODUCTS,
  KEEP as TEXT_KEEP,
  DELETE as TEXT_DELETE,
} from "../../../constants/text";

import {MoreVert as MoreVertIcon} from "@material-ui/icons";

import useStyles from "../../../constants/styles";

import Firebase from "../../Firebase";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import Event from "../Event/event.class";
import EventGroupConfiguration from "../GroupConfiguration/groupConfiguration.class";
import {Snackbar} from "../../Shared/customSnackbar";
import AlertMessage from "../../Shared/AlertMessage";
import {
  DialogSelectMenues,
  DialogSelectMenuesForRecipeDialogValues,
  decodeSelectedMenues,
} from "../Menuplan/dialogSelectMenues";
import Menuplan, {
  MealRecipe,
  Menue,
  MenueCoordinates,
} from "../Menuplan/menuplan.class";
import {
  DialogType,
  SingleTextInputResult,
  useCustomDialog,
} from "../../Shared/customDialogContext";
import Utils from "../../Shared/utils.class";
import {
  NavigationValuesContext,
  NavigationObject,
} from "../../Navigation/navigationContext";
import Action from "../../../constants/actions";
import {
  UnitConversionBasic,
  UnitConversionProducts,
} from "../../Unit/unitConversion.class";
import {
  FetchMissingDataProps,
  FetchMissingDataType,
  MasterDataCreateType,
  OnMasterdataCreateProps,
} from "../Event/event";
import MaterialList, {MaterialListEntry} from "./materialList.class";
import Material from "../../Material/material.class";
import {
  DialogTraceItem,
  EventListCard,
  PositionContextMenu,
} from "../Event/eventSharedComponents";
import DialogMaterial, {
  MATERIAL_DIALOG_TYPE,
  MATERIAL_POP_UP_VALUES_INITIAL_STATE,
} from "../../Material/dialogMaterial";
import MaterialAutocomplete from "../../Material/materialAutocomplete";
import {AutocompleteChangeReason} from "@material-ui/lab";
import {
  RECIPE_DRAWER_DATA_INITIAL_VALUES,
  RecipeDrawer,
  RecipeDrawerData,
} from "../Menuplan/menuplan";
import Recipe, {Recipes} from "../../Recipe/recipe.class";
import RecipeShort from "../../Recipe/recipeShort.class";
import MaterialListPdf from "./materialListPdf";
import FirebaseAnalyticEvent from "../../../constants/firebaseEvent";
import Stats, {StatsField} from "../../Shared/stats.class";

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
  materialUid: Material["uid"];
}

const CONTEXT_MENU_SELECTE_ITEM_INITIAL_STATE: ContextMenuSeletedItemsProps = {
  anchor: null,
  materialUid: "",
};
const ADD_MATERIAL_DIALOG_INITIAL_VALUES = {
  open: false,
  material: {} as Material,
  quantity: "",
};
const TRACE_ITEM_DIALOG_INITIAL_VALUES = {
  open: false,
  sortedMenues: [] as MenueCoordinates[],
};

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
interface EventMaterialListPageProps {
  firebase: Firebase;
  authUser: AuthUser;
  materialList: MaterialList;
  event: Event;
  groupConfiguration: EventGroupConfiguration;
  menuplan: Menuplan;
  materials: Material[];
  recipes: Recipes;
  unitConversionBasic: UnitConversionBasic | null;
  unitConversionProducts: UnitConversionProducts | null;
  fetchMissingData: ({type, recipeShort}: FetchMissingDataProps) => void;
  onMaterialListUpdate: (materialList: MaterialList) => void;
  onMasterdataCreate: ({type, value}: OnMasterdataCreateProps) => void;
}
const EventMaterialListPage = ({
  firebase,
  authUser,
  materialList,
  event,
  groupConfiguration,
  menuplan,
  materials,
  recipes,
  unitConversionBasic,
  unitConversionProducts,
  fetchMissingData,
  onMaterialListUpdate,
  onMasterdataCreate,
}: EventMaterialListPageProps) => {
  const classes = useStyles();

  const navigationValuesContext = React.useContext(NavigationValuesContext);
  const {customDialog} = useCustomDialog();

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
  const [handleMaterialDialogValues, setHandleMaterialDialogValues] =
    React.useState(ADD_MATERIAL_DIALOG_INITIAL_VALUES);
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
      object: NavigationObject.usedRecipes,
    });
  }, []);

  React.useEffect(() => {
    if (materials.length == 0) {
      fetchMissingData({type: FetchMissingDataType.MATERIALS});
    }
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
      text: TEXT_GIVE_THE_NEW_LIST_A_NAME,
      singleTextInputProperties: {
        initialValue: "",
        textInputLabel: TEXT_NAME,
      },
    })) as SingleTextInputResult;
    setDialogSelectMenueData({...dialogSelectMenueData, open: false});

    if (userInput.valid) {
      // Wait anzeigen
      dispatch({type: ReducerActions.SHOW_LOADING, payload: {isLoading: true}});
      // Rezepte holen und Material sammeln
      MaterialList.createNewList({
        name: userInput.input,
        selectedMenues: Object.keys(selectedMenues).map((menueUid) => menueUid),
        menueplan: menuplan,
        materials: materials,
        firebase: firebase,
        authUser: authUser,
      })
        .then(async (result) => {
          let updatedMaterialList = {...materialList};
          updatedMaterialList.lists[result.properties.uid] = result;
          updatedMaterialList.noOfLists++;
          updatedMaterialList.uid = event.uid;

          // Statistik mitführen
          Stats.incrementStat({
            firebase: firebase,
            field: StatsField.noMaterialLists,
            value: 1,
          });

          firebase.analytics.logEvent(
            FirebaseAnalyticEvent.materialListGenerated
          );

          onMaterialListUpdate(updatedMaterialList);
          dispatch({
            type: ReducerActions.SHOW_LOADING,
            payload: {isLoading: false},
          });
        })
        .catch((error) => {
          dispatch({
            type: ReducerActions.GENERIC_ERROR,
            payload: error,
          });
        });
    }
  };
  /* ------------------------------------------
  // Kontext-Menü-Handler
  // ------------------------------------------ */
  const onOpenContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    let pressedButton = event.currentTarget.id.split("_");

    setContextMenuSelectedItem({
      anchor: event.currentTarget,
      materialUid: pressedButton[1],
    });
  };
  const onCloseContextMenu = () => {
    setContextMenuSelectedItem(CONTEXT_MENU_SELECTE_ITEM_INITIAL_STATE);
  };
  const onContextMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    let pressedButton = event.currentTarget.id.split("_");
    switch (pressedButton[1]) {
      case Action.EDIT:
        let material = materials.find(
          (material) => material.uid == contextMenuSelectedItem.materialUid
        );

        if (!material) {
          return;
        }

        let quantity = materialList?.lists[state.selectedListItem!].items.find(
          (material) => material.uid == contextMenuSelectedItem.materialUid
        )?.quantity;
        setHandleMaterialDialogValues({
          open: true,
          material: material,
          quantity: quantity ? quantity.toString() : "",
        });
        break;
      case Action.DELETE:
        materialList.lists[state.selectedListItem!].items =
          MaterialList.deleteMaterialFromList({
            list: materialList.lists[state.selectedListItem!].items,
            materialUid: contextMenuSelectedItem.materialUid,
          });

        // Statistik mitführen
        Stats.incrementStat({
          firebase: firebase,
          field: StatsField.noMaterialLists,
          value: -1,
        });

        firebase.analytics.logEvent(FirebaseAnalyticEvent.materialListDeleted);

        onMaterialListUpdate(materialList);
      case Action.TRACE:
        setTraceItemDialogValues({
          open: true,
          sortedMenues: Menuplan.sortSelectedMenues({
            menueList:
              materialList.lists[state.selectedListItem!].properties
                .selectedMenues,
            menuplan: menuplan,
          }),
        });
        break;
    }
    setContextMenuSelectedItem({...contextMenuSelectedItem, anchor: null});
  };
  /* ------------------------------------------
  // List-Einträge-Handling
  // ------------------------------------------ */
  const onCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Umschiessen und speichern!
    const pressedCheckbox = event.target.name.split("_");
    let material = materialList.lists[state.selectedListItem!].items.find(
      (material) => material.uid == pressedCheckbox[1]
    );
    if (!material) {
      return;
    }
    material.checked = !material.checked;
    onMaterialListUpdate(materialList);
  };
  /* ------------------------------------------
  // List-Handling
  // ------------------------------------------ */
  const onRefreshLists = async () => {
    let keepManuallyAddedItems = false;

    if (
      materialList.lists[state.selectedListItem!].items.some((material) =>
        material.trace.some((trace) => trace.manualAdd == true)
      )

      // Sollen die manuell hinzugefügten Artikel behalten werden.
    ) {
      let userInput = (await customDialog({
        dialogType: DialogType.selectOptions,
        title: TEXT_MANUALLY_ADDED_PRODUCTS,
        text: TEXT_KEEP_MANUALLY_ADDED_PRODUCTS(TEXT_MATERIAL_LIST),
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
    // Alle Liste aktualisieren
    dispatch({type: ReducerActions.SHOW_LOADING, payload: {isLoading: true}});

    MaterialList.refreshList({
      listUidToRefresh: state.selectedListItem!,
      keepManuallyAddedItems: keepManuallyAddedItems,
      materialList: materialList,
      materials: materials,
      menueplan: menuplan,
      firebase: firebase,
      authUser: authUser,
    }).then((result) => {
      onMaterialListUpdate(result);

      firebase.analytics.logEvent(FirebaseAnalyticEvent.materialListGenerated);

      dispatch({
        type: ReducerActions.SHOW_LOADING,
        payload: {isLoading: false},
      });
    });
  };
  const onListElementSelect = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // Menües in der richtigen Reihenfolge aufbauen, damit diese dann auch richtig angezeigt werden
    let selectedListItem = event.currentTarget.id.split("_")[1];
    if (state.selectedListItem == selectedListItem) {
      // Element bereits aktiv
      return;
    }

    dispatch({
      type: ReducerActions.SET_SELECTED_LIST_ITEM,
      payload: {
        uid: selectedListItem,
      },
    });
  };
  const onListElementDelete = (event: React.MouseEvent<HTMLElement>) => {
    let selectedList = event.currentTarget.id.split("_")[1];
    if (!selectedList) {
      return;
    }
    let updatedMaterialList = MaterialList.deleteList({
      materialList: materialList,
      listUidToDelete: selectedList,
      authUser: authUser,
    });
    onMaterialListUpdate(updatedMaterialList);

    dispatch({
      type: ReducerActions.SET_SELECTED_LIST_ITEM,
      payload: {
        uid: "",
      },
    });
  };
  const onListElementEdit = async (event: React.MouseEvent<HTMLElement>) => {
    let selectedList = event.currentTarget.id.split("_")[1];
    if (!selectedList) {
      return;
    }
    let userInput = (await customDialog({
      dialogType: DialogType.SingleTextInput,
      title: "Namen anpassen",
      singleTextInputProperties: {
        initialValue: materialList.lists[selectedList].properties.name,
        textInputLabel: "Name",
      },
    })) as SingleTextInputResult;
    if (userInput.valid) {
      let updatedMaterialList = MaterialList.editListName({
        materialList: materialList,
        listUidToEdit: selectedList,
        newName: userInput.input,
        authUser: authUser,
      });
      onMaterialListUpdate(updatedMaterialList);
    }
  };
  /* ------------------------------------------
  // Artikel hinzufügen Dialog
  // ------------------------------------------ */
  const onAddMaterialClick = () => {
    setHandleMaterialDialogValues({...handleMaterialDialogValues, open: true});
  };
  const onAddMaterialDialogClose = () => {
    setHandleMaterialDialogValues(ADD_MATERIAL_DIALOG_INITIAL_VALUES);
  };
  const onAddMaterialDialogAdd = ({material, quantity}: OnDialogAddItemOk) => {
    if (!handleMaterialDialogValues.material.uid) {
      // Neuer Eintrag
      materialList.lists[state.selectedListItem!].items =
        MaterialList.addMaterialToList({
          material: material,
          list: materialList.lists[state.selectedListItem!].items,
          quantity: quantity,
          planedPortions: 0,
          manuelAdd: true,
        });
    } else {
      // Eintrag ändern
      let materialInList = materialList.lists[
        state.selectedListItem!
      ].items.find((materialInList) => materialInList.uid == material.uid);

      if (!materialInList) {
        return;
      }

      materialInList.quantity = quantity;
      materialInList.manualEdit = true;
    }
    onMaterialListUpdate(materialList);
    setHandleMaterialDialogValues(ADD_MATERIAL_DIALOG_INITIAL_VALUES);
  };
  const onMaterialCreate = (material: Material) => {
    onMasterdataCreate({
      type: MasterDataCreateType.MATERIAL,
      value: material,
    });
  };
  /* ------------------------------------------
  // Artikel Trace Dialog
  // ------------------------------------------ */
  const onDialogTraceItemClose = () => {
    setTraceItemDialogValues({...traceItemDialogValues, open: false});
  };
  /* ------------------------------------------
  // Recipe-Drawer-Handler
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
  /* ------------------------------------------
  // PDF erzeugen
  // ------------------------------------------ */
  const onGeneratePrintVersion = () => {
    pdf(
      <MaterialListPdf
        materialList={materialList.lists[state.selectedListItem!]}
        materialListSelectedTimeSlice={decodeSelectedMenues({
          selectedMenues:
            materialList.lists[state.selectedListItem!].properties
              .selectedMenues,
          menuplan: menuplan,
        })}
        eventName={event.name}
        authUser={authUser}
      />
    )
      .toBlob()
      .then((result) => {
        fileSaver.saveAs(
          result,
          event.name + " " + TEXT_MATERIAL_LIST + TEXT_SUFFIX_PDF
        );
      });
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
          <Backdrop className={classes.backdrop} open={state.isLoading}>
            <CircularProgress color="inherit" />
          </Backdrop>
        </Grid>
        <Grid item xs={12}>
          <EventListCard
            cardTitle={TEXT_MATERIAL_LIST}
            cardDescription={TEXT_MATERIAL_LIST_MENUE_SELECTION_DESCRIPTION}
            outOfDateWarnMessage={TEXT_LIST_ENTRY_MAYBE_OUT_OF_DATE(
              TEXT_MATERIAL_LIST
            )}
            selectedListItem={state.selectedListItem}
            lists={materialList.lists}
            noOfLists={materialList.noOfLists}
            menuplan={menuplan}
            onShowDialogSelectMenues={onShowDialogSelectMenues}
            onListElementSelect={onListElementSelect}
            onListElementDelete={onListElementDelete}
            onListElementEdit={onListElementEdit}
            onRefreshLists={onRefreshLists}
            onGeneratePrintVersion={onGeneratePrintVersion}
          />
        </Grid>
        {state.selectedListItem && materialList && (
          <React.Fragment>
            <Grid item container justifyContent="center" xs={12}>
              <Button color="primary" onClick={onAddMaterialClick}>
                {TEXT_ADD_ITEM}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <EventMaterialListList
                materialList={materialList.lists[state.selectedListItem]}
                menuplan={menuplan}
                groupConfiguration={groupConfiguration}
                unitConversionBasic={unitConversionBasic}
                unitConversionProducts={unitConversionProducts}
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
      <PositionContextMenu
        anchorEl={contextMenuSelectedItem.anchor}
        handleMenuClick={onContextMenuClick}
        handleMenuClose={onCloseContextMenu}
      />
      <DialogHandleMaterial
        dialogOpen={handleMaterialDialogValues.open}
        material={handleMaterialDialogValues.material}
        quantity={handleMaterialDialogValues.quantity}
        materials={materials}
        editMode={handleMaterialDialogValues.material.uid ? true : false}
        handleOk={onAddMaterialDialogAdd}
        handleClose={onAddMaterialDialogClose}
        onMaterialCreate={onMaterialCreate}
      />

      {state.selectedListItem && contextMenuSelectedItem.materialUid && (
        // kann nur generiert werden, wenn auch etwas ausgewählt ist
        <DialogTraceItem
          dialogOpen={traceItemDialogValues.open}
          trace={
            materialList.lists[state.selectedListItem!]?.items.find(
              (material) => material.uid == contextMenuSelectedItem.materialUid
            )?.trace!
          }
          menuePlan={menuplan}
          sortedMenues={traceItemDialogValues.sortedMenues}
          hasBeenManualyEdited={Boolean(
            materialList.lists[state.selectedListItem!]?.items.find(
              (material) => material.uid == contextMenuSelectedItem.materialUid
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
// ======================= Liste der Materialien =====================
// =================================================================== */
interface EventMaterialListListProps {
  materialList: MaterialListEntry;
  menuplan: Menuplan;
  groupConfiguration: EventGroupConfiguration;
  unitConversionBasic: UnitConversionBasic | null;
  unitConversionProducts: UnitConversionProducts | null;
  onCheckboxClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenContexMenü: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const EventMaterialListList = ({
  materialList,
  onCheckboxClick,
  onOpenContexMenü,
}: EventMaterialListListProps) => {
  const classes = useStyles();
  return (
    <Container
      className={classes.container}
      component="main"
      maxWidth="sm"
      key={"MaterialListContainer"}
    >
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid item xs={12}>
          <List className={classes.listShoppingList} key={"materialList"}>
            {Utils.sortArray({
              array: materialList.items,
              attributeName: "name",
            }).map((material) => (
              <ListItem
                key={"shoppingListItem_" + material.uid}
                className={classes.listShoppingListItem}
              >
                <ListItemIcon>
                  <Checkbox
                    key={"checkbox_" + material.uid}
                    name={"checkbox_" + material.uid}
                    onChange={onCheckboxClick}
                    checked={material.checked}
                    color={"primary"}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  className={classes.shoppingListItemTextQuantity}
                  primaryTypographyProps={
                    material.checked
                      ? {color: "textSecondary"}
                      : {color: "textPrimary"}
                  }
                  key={"quantity" + material.uid}
                  primary={
                    material.checked ? (
                      <del>
                        {Number.isNaN(material.quantity) ||
                        material.quantity == 0
                          ? ""
                          : new Intl.NumberFormat("de-CH", {
                              maximumSignificantDigits: 3,
                            }).format(material.quantity)}
                      </del>
                    ) : Number.isNaN(material.quantity) ||
                      material.quantity == 0 ? (
                      ""
                    ) : (
                      new Intl.NumberFormat("de-CH", {
                        maximumSignificantDigits: 3,
                      }).format(material.quantity)
                    )
                  }
                />
                <ListItemText
                  className={classes.shoppingListItemTextProduct}
                  primaryTypographyProps={
                    material.checked
                      ? {color: "textSecondary"}
                      : {color: "textPrimary"}
                  }
                  key={"itemName_" + material.uid}
                  primary={
                    material.checked ? (
                      <del>{material.name}</del>
                    ) : (
                      material.name
                    )
                  }
                />
                <ListItemSecondaryAction
                  key={"SecondaryAction_" + material.uid}
                >
                  <IconButton
                    key={"MoreBtn_" + material.uid}
                    id={"MoreBtn_" + material.uid}
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
    </Container>
  );
};
/* ===================================================================
// ==================== Dialog Material hinzufügen ===================
// =================================================================== */
interface DialogHandleMaterialProps {
  dialogOpen: boolean;
  material: Material | null;
  quantity: string;
  materials: Material[];
  editMode: boolean;
  handleOk: ({material, quantity}: OnDialogAddItemOk) => void;
  handleClose: () => void;
  onMaterialCreate: (material: Material) => void;
}
interface OnDialogAddItemOk {
  material: Material;
  quantity: number;
}
const DIALOG_VALUES_INITIAL_STATE = {
  quantity: "",
  material: {} as Material | null,
};
const DIALOG_VALUES_VALIDATION_INITIAL_STATE = {
  isError: false,
  errorText: "",
};
const DialogHandleMaterial = ({
  dialogOpen,
  material,
  quantity,
  materials,
  editMode,
  handleOk: handleOkSuper,
  handleClose: handleCloseSuper,
  onMaterialCreate: onMaterialCreateSuper,
}: DialogHandleMaterialProps) => {
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
  if (dialogValues == DIALOG_VALUES_INITIAL_STATE && material?.uid) {
    setDialogValues({
      quantity: quantity,
      material: material,
    });
  }

  /* ------------------------------------------
  // Button-Handler Dialog
  // ------------------------------------------ */
  const handleClose = () => {
    setDialogValues(DIALOG_VALUES_INITIAL_STATE);
    setDialogValidation(DIALOG_VALUES_VALIDATION_INITIAL_STATE);
    handleCloseSuper();
  };
  const handleOk = () => {
    // Prüfen ob Eingaben korrekt (Produkt muss vorhanden sein)
    if (!dialogValues.material || !dialogValues.material.uid) {
      setDialogValidation({
        isError: true,
        errorText: TEXT_PLEASE_GIVE_VALUE_FOR_FIELD(TEXT_MATERIAL),
      });
      return;
    }
    handleOkSuper({
      material: dialogValues.material,
      quantity: parseFloat(dialogValues.quantity),
    });
    setDialogValues(DIALOG_VALUES_INITIAL_STATE);
    setDialogValidation(DIALOG_VALUES_VALIDATION_INITIAL_STATE);
  };
  /* ------------------------------------------
  // Change-Handler Dialog
  // ------------------------------------------ */
  const onQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDialogValues({
      ...dialogValues,
      quantity: event.target.value,
    });
  };
  const onChangeMaterial = async (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: string | Material | null,
    action: AutocompleteChangeReason,
    objectId: string
  ) => {
    if (typeof newValue === "string" || !newValue) {
      return;
    }

    if (newValue.name.endsWith(TEXT_ADD)) {
      // Begriff "Hinzufügen" und Anführzungszeichen entfernen
      let materiaName = newValue?.name.match('".*"')![0].slice(1, -1);

      // Fenster anzeigen um neues Produkt zu erfassen
      setMaterialAddPopupValues({
        ...materialAddPopupValues,
        name: materiaName,
        popUpOpen: true,
      });
    } else {
      setDialogValues({...dialogValues, material: newValue});
    }
  };
  /* ------------------------------------------
  // Pop-Up Handler Material-Create
  // ------------------------------------------ */
  const onMaterialCreate = (material: Material) => {
    setDialogValues({...dialogValues, material: material});

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

  return (
    <React.Fragment>
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{TEXT_ADD_ITEM}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {/* Material */}
              <MaterialAutocomplete
                componentKey=""
                material={dialogValues.material}
                materials={materials}
                disabled={editMode}
                onChange={onChangeMaterial}
                error={dialogValidation}
              />
            </Grid>
            {/* Menge */}
            <Grid item xs={12}>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="primary" variant="outlined" onClick={handleClose}>
            {TEXT_CANCEL}
          </Button>
          <Button color="primary" variant="contained" onClick={handleOk}>
            {material?.uid ? TEXT_CHANGE : TEXT_ADD}
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
      />
    </React.Fragment>
  );
};

export default EventMaterialListPage;
