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
  useTheme,
  Box,
  Link,
} from "@material-ui/core";

import {
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  MENUE_SELECTION as TEXT_MENUE_SELECTION,
  USED_RECIPES_MENUE_SELECTION_DESCRIPTION as TEXT_USED_RECIPES_MENUE_SELECTION_DESCRIPTION,
  PRINTVERSION as TEXT_PRINTVERSION,
  REFRESH as TEXT_REFRESH,
  SELECT_MENUES as TEXT_SELECT_MENUES,
  WHICH_MENUES_FOR_RECIPE_GENERATION as TEXT_WHICH_MENUES_FOR_RECIPE_GENERATION,
  EXISTING_LISTS as TEXT_EXISTING_LISTS,
  USED_RECIPES_POSSIBLE_OUT_OF_DATE as TEXT_USED_RECIPES_POSSIBLE_OUT_OF_DATE,
  PLANED_FOR as TEXT_PLANED_FOR,
  FOR_DATIVE as TEXT_FOR_DATIVE,
  SOURCE as TEXT_SOURCE,
  NOTE as TEXT_NOTE,
  VARIANT_NOTE as TEXT_VARIANT_NOTE,
  SUFFIX_PDF as TEXT_SUFFIX_PDF,
  QUANTITY_CALCULATION as TEXT_QUANTITY_CALCULATION,
  NAME as TEXT_NAME,
  NEW_LIST as TEXT_NEW_LIST,
  GIVE_THE_NEW_LIST_A_NAME as TEXT_GIVE_THE_NEW_LIST_A_NAME,
} from "../../../constants/text";
import * as IMAGE_REPOSITORY from "../../../constants/imageRepository";

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@material-ui/icons";

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
  MealType,
  Menue,
  MenueCoordinates,
} from "../Menuplan/menuplan.class";
import {generatePlanedPortionsText} from "../Menuplan/menuplan";
import UsedRecipes, {UsedRecipeListEntry} from "./usedRecipes.class";
import {
  DialogType,
  SingleTextInputResult,
  useCustomDialog,
} from "../../Shared/customDialogContext";
import Recipe, {RecipeIndetifier, RecipeType} from "../../Recipe/recipe.class";
import Utils from "../../Shared/utils.class";
import {time} from "console";
import {FormListItem} from "../../Shared/formListItem";
import {
  RecipeIngredients,
  RecipeMaterial,
  RecipePreparation,
} from "../../Recipe/recipe.view";
import UsedRecipesPdf from "./usedRecipesPdf";
import {
  NavigationValuesContext,
  NavigationObject,
} from "../../Navigation/navigationContext";
import Action from "../../../constants/actions";
import Product from "../../Product/product.class";
import {
  UnitConversionBasic,
  UnitConversionProducts,
} from "../../Unit/unitConversion.class";
import {FetchMissingDataProps, FetchMissingDataType} from "../Event/event";
import unitConversion from "../../Unit/unitConversion";

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
  sortedMenueList: MenueCoordinates[];
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
  sortedMenueList: [],
  isError: false,
  isLoading: false,
  error: {},
  snackbar: {open: false, severity: "success", message: ""},
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
        sortedMenueList: action.payload.sortedMenueList,
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
interface EventUsedRecipesPageProps {
  firebase: Firebase;
  authUser: AuthUser;
  event: Event;
  groupConfiguration: EventGroupConfiguration;
  menuplan: Menuplan;
  usedRecipes: UsedRecipes;
  products: Product[];
  unitConversionBasic: UnitConversionBasic | null;
  unitConversionProducts: UnitConversionProducts | null;
  fetchMissingData: ({type, recipeShort}: FetchMissingDataProps) => void;
}
const EventUsedRecipesPage = ({
  firebase,
  authUser,
  event,
  groupConfiguration,
  menuplan,
  usedRecipes,
  products,
  unitConversionBasic,
  unitConversionProducts,
  fetchMissingData,
}: EventUsedRecipesPageProps) => {
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
    if (products.length == 0) {
      fetchMissingData({type: FetchMissingDataType.PRODUCTS});
    }
    if (!unitConversionBasic || !unitConversionProducts) {
      fetchMissingData({type: FetchMissingDataType.UNIT_CONVERSION});
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

      // Rezepte holen und berechnen
      UsedRecipes.createNewList({
        name: userInput.input,
        selectedMenues: Object.keys(selectedMenues).map((menueUid) => menueUid),
        menueplan: menuplan,
        firebase: firebase,
        authUser: authUser,
      })
        .then((result) => {
          let newUsedRecipes = {...usedRecipes};
          newUsedRecipes.lists[result.properties.uid] = result;
          newUsedRecipes.noOfLists++;

          UsedRecipes.save({
            usedRecipes: newUsedRecipes,
            firebase: firebase,
            authUser: authUser,
          });

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
  // List-Handling
  // ------------------------------------------ */
  const onRefreshLists = () => {
    // Alle Liste aktualisieren
    dispatch({type: ReducerActions.SHOW_LOADING, payload: {isLoading: true}});

    // Rezepte holen und berechnen
    UsedRecipes.refreshLists({
      usedRecipes: usedRecipes,
      menueplan: menuplan,
      firebase: firebase,
      authUser: authUser,
    }).then((result) => {
      UsedRecipes.save({
        usedRecipes: result,
        firebase: firebase,
        authUser: authUser,
      });

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
    dispatch({
      type: ReducerActions.SET_SELECTED_LIST_ITEM,
      payload: {
        uid: selectedListItem,
        sortedMenueList: Menuplan.sortSelectedMenues({
          menueList:
            usedRecipes.lists[selectedListItem!].properties.selectedMenues,
          menuplan: menuplan,
        }),
      },
    });
  };
  const onListElementDelete = (event: React.MouseEvent<HTMLElement>) => {
    let selectedList = event.currentTarget.id.split("_")[1];
    if (!selectedList) {
      return;
    }

    let updatedUsedRecipes = UsedRecipes.deleteList({
      usedRecipes: usedRecipes,
      listUidToDelete: selectedList,
      authUser: authUser,
    });

    UsedRecipes.save({
      usedRecipes: updatedUsedRecipes,
      firebase: firebase,
      authUser: authUser,
    });

    dispatch({
      type: ReducerActions.SET_SELECTED_LIST_ITEM,
      payload: {
        uid: "",
        sortedMenueList: [],
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
        initialValue: usedRecipes.lists[selectedList].properties.name,
        textInputLabel: "Name",
      },
    })) as SingleTextInputResult;

    if (userInput.valid) {
      let updatedUsedRecipes = UsedRecipes.editListName({
        usedRecipes: usedRecipes,
        listUidToEdit: selectedList,
        newName: userInput.input,
        authUser: authUser,
      });
      UsedRecipes.save({
        usedRecipes: updatedUsedRecipes,
        firebase: firebase,
        authUser: authUser,
      });

      dispatch({
        type: ReducerActions.SET_SELECTED_LIST_ITEM,
        payload: {
          uid: "",
          sortedMenueList: [],
        },
      });
    }
  };
  /* ------------------------------------------
  // PDF erzeugen
  // ------------------------------------------ */
  const onGeneratePrintVersion = () => {
    pdf(
      <UsedRecipesPdf
        list={usedRecipes.lists[state.selectedListItem!]}
        sortedMenueList={state.sortedMenueList}
        menueplan={menuplan}
        eventName={event.name}
        products={products}
        unitConversionBasic={unitConversionBasic}
        unitConversionProducts={unitConversionProducts}
        authUser={authUser}
      />
    )
      .toBlob()
      .then((result) => {
        fileSaver.saveAs(
          result,
          event.name + " " + TEXT_QUANTITY_CALCULATION + TEXT_SUFFIX_PDF
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
          <EventUsedRecipesCard
            selectedListItem={state.selectedListItem}
            usedRecipes={usedRecipes}
            menuplan={menuplan}
            onShowDialogSelectMenues={onShowDialogSelectMenues}
            onListElementSelect={onListElementSelect}
            onListElementDelete={onListElementDelete}
            onListElementEdit={onListElementEdit}
            onRefreshLists={onRefreshLists}
            onGeneratePrintVersion={onGeneratePrintVersion}
          />
        </Grid>
        {state.selectedListItem && (
          <EventUsedRecipes
            sortedMenueList={state.sortedMenueList}
            usedRecipes={usedRecipes.lists[state.selectedListItem].recipes}
            menuplan={menuplan}
            groupConfiguration={groupConfiguration}
            products={products}
            unitConversionBasic={unitConversionBasic}
            unitConversionProducts={unitConversionProducts}
          />
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
    </React.Fragment>
  );
};
/* ===================================================================
// ======================= Einstellungen-Card ========================
// =================================================================== */
interface EventUsedRecipesCardProps {
  selectedListItem: string | null;
  usedRecipes: UsedRecipes;
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
const EventUsedRecipesCard = ({
  selectedListItem,
  usedRecipes,
  menuplan,
  onShowDialogSelectMenues,
  onListElementSelect,
  onListElementDelete,
  onListElementEdit,
  onRefreshLists,
  onGeneratePrintVersion,
}: EventUsedRecipesCardProps) => {
  return (
    <Card>
      <CardHeader
        title={TEXT_MENUE_SELECTION}
        subheader={TEXT_USED_RECIPES_MENUE_SELECTION_DESCRIPTION}
      />
      <CardContent>
        {usedRecipes.noOfLists > 0 && (
          <List>
            <ListSubheader>{TEXT_EXISTING_LISTS}</ListSubheader>
            {Object.values(usedRecipes.lists).map((list) => (
              <ListItem
                key={"listItem_" + list.properties.uid}
                id={"listItem_" + list.properties.uid}
                button
                selected={selectedListItem == list.properties.uid}
                onClick={onListElementSelect}
              >
                <ListItemText
                  primary={list.properties.name}
                  secondary={decodeSelectedMenues({
                    selectedMenues: list.properties.selectedMenues,
                    menuplan: menuplan,
                  })}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    id={"EditBtn_" + list.properties.uid}
                    onClick={onListElementEdit}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    id={"DeleteBtn_" + list.properties.uid}
                    onClick={onListElementDelete}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {/* Warnung abgeben, wenn das Änderungsdatum des Menüplan kleiner ist, als der Listen */}
        {menuplan.lastChange.date > usedRecipes.lastChange.date &&
          usedRecipes.noOfLists > 0 && (
            <Grid container>
              <Grid
                item
                xs={1}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  // alignItems: "center",
                }}
              >
                <ErrorOutlineIcon color="error" />
              </Grid>
              <Grid item xs={11}>
                <Typography color="error">
                  {TEXT_USED_RECIPES_POSSIBLE_OUT_OF_DATE}
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
          {TEXT_SELECT_MENUES}
        </Button>
        {usedRecipes.noOfLists > 0 && (
          <Button
            color="primary"
            variant="outlined"
            disabled={usedRecipes.noOfLists == 0}
            onClick={onRefreshLists}
          >
            {TEXT_REFRESH}
          </Button>
        )}
        {usedRecipes.noOfLists > 0 && (
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
  );
};
/* ===================================================================
// ======================== Rezepte-Übersicht ========================
// =================================================================== */
interface EventUsedRecipesProps {
  sortedMenueList: MenueCoordinates[];
  usedRecipes: UsedRecipeListEntry["recipes"];
  menuplan: Menuplan;
  groupConfiguration: EventGroupConfiguration;
  products: Product[];
  unitConversionBasic: UnitConversionBasic | null;
  unitConversionProducts: UnitConversionProducts | null;
}
const EventUsedRecipes = ({
  sortedMenueList,
  usedRecipes,
  menuplan,
  groupConfiguration,
  products,
  unitConversionBasic,
  unitConversionProducts,
}: EventUsedRecipesProps) => {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <Container style={{marginTop: theme.spacing(2)}}>
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid item xs={12}>
          {sortedMenueList.map((menueCoordinate) => {
            return menuplan.menues[
              menueCoordinate.menueUid
            ].mealRecipeOrder.map((mealRecipeUid) => (
              <EventUsedMealRecipe
                recipe={
                  usedRecipes[
                    menuplan.mealRecipes[mealRecipeUid].recipe.recipeUid
                  ]
                }
                mealRecipe={menuplan.mealRecipes[mealRecipeUid]}
                menueCoordinate={menueCoordinate}
                groupConfiguration={groupConfiguration}
                products={products}
                unitConversionBasic={unitConversionBasic}
                unitConversionProducts={unitConversionProducts}
                key={"eventUsedRecipe_" + mealRecipeUid}
              />
            ));
          })}
        </Grid>
      </Grid>
    </Container>
  );
};
/* ===================================================================
// ======================== Einzelnes Rezept =========================
// =================================================================== */
interface EventUsedMealRecipeProps {
  recipe: Recipe;
  mealRecipe: MealRecipe;
  menueCoordinate: MenueCoordinates;
  groupConfiguration: EventGroupConfiguration;
  products: Product[];
  unitConversionBasic: UnitConversionBasic | null;
  unitConversionProducts: UnitConversionProducts | null;
}
const EventUsedMealRecipe = ({
  recipe,
  mealRecipe,
  menueCoordinate,
  groupConfiguration,
  products,
  unitConversionBasic,
  unitConversionProducts,
}: EventUsedMealRecipeProps) => {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <Container
      className={classes.container}
      component="main"
      maxWidth="md"
      key={"recipeContainer_" + mealRecipe.uid}
    >
      <Grid
        container
        justifyContent="center"
        spacing={2}
        key={"recipeGridUsedRecipe_" + mealRecipe.uid}
      >
        {/* Titel */}
        <EventUsedMealRecipeTitle
          recipe={recipe}
          menueCoordinate={menueCoordinate}
        />
        {/* Info-Block */}
        <EventUsedMealRecipeInfoBlock
          recipe={recipe}
          menueCoordinate={menueCoordinate}
          mealRecipe={mealRecipe}
          groupConfiguration={groupConfiguration}
        />
        {/* Zutaten */}
        <Grid
          item
          xs={12}
          sm={6}
          style={{marginTop: "2em", marginBottom: "2em"}}
          key={"recipeGridIngredients_" + mealRecipe.uid}
        >
          <EventUsedMealRecipeIngredientBlock
            recipe={recipe}
            mealRecipe={mealRecipe}
            products={products}
            unitConversionBasic={unitConversionBasic}
            unitConversionProducts={unitConversionProducts}
          />
        </Grid>
        {/* Zubereitung */}
        <Grid
          item
          xs={12}
          sm={6}
          style={{marginTop: "2em", marginBottom: "2em"}}
          key={"recipeGridPreparations_" + mealRecipe.uid}
        >
          <EventUsedMealRecipePreparationStepsBlock recipe={recipe} />
        </Grid>
        {/* Material */}
        {recipe?.materials?.order.length > 0 && (
          <Grid
            item
            xs={12}
            style={{marginTop: "2em", marginBottom: "2em"}}
            key={"recipeGridMaterials_" + mealRecipe.uid}
          >
            <EventUsedMealRecipeMaterialBlock
              recipe={recipe}
              mealRecipe={mealRecipe}
            />
          </Grid>
        )}
        {/* Divider */}
        <Grid
          container
          alignContent="center"
          alignItems="center"
          key={"recipeGridDivider_" + mealRecipe.uid}
        >
          <Grid item key={"recipeGridDividerLeft_" + mealRecipe.uid} xs={5}>
            <Divider
              className={classes.thickDivider}
              key={"recipeDividerLeft_" + mealRecipe.uid}
              style={{width: "100%"}}
            />
          </Grid>

          <Grid item container key={"recipeGridImage_" + mealRecipe.uid} xs={2}>
            <img
              className={classes.marginCenter}
              src={
                IMAGE_REPOSITORY.getEnviromentRelatedPicture().DIVIDER_ICON_SRC
              }
              alt=""
              width="50px"
            />
          </Grid>
          <Grid item key={"recipeGridDividerRight_" + mealRecipe.uid} xs={5}>
            <Divider
              className={classes.thickDivider}
              key={"recipeDividerRight_" + mealRecipe.uid}
              style={{width: "100%"}}
            />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
/* ===================================================================
// =========================  Rezept Title ===========================
// =================================================================== */
interface EventUsedMealRecipeTitleProps {
  recipe: Recipe;
  menueCoordinate: MenueCoordinates;
}
const EventUsedMealRecipeTitle = ({
  recipe,
  menueCoordinate,
}: EventUsedMealRecipeTitleProps) => {
  const theme = useTheme();
  return (
    <Grid item key={"recipeName_" + recipe.uid} xs={12}>
      <Typography
        component="h1"
        variant="h4"
        align="center"
        gutterBottom={recipe.type != RecipeType.variant}
      >
        {recipe.name}
      </Typography>
      {recipe.type == RecipeType.variant && (
        <Typography
          component="h2"
          variant="h5"
          align="center"
          gutterBottom
          color="textSecondary"
        >
          {"["}
          {recipe.variantProperties?.variantName}
          {"]"}
        </Typography>
      )}
      <Typography align="center">
        <Box component="span" color={theme.palette.text.secondary}>
          {TEXT_PLANED_FOR}
          {": "}
        </Box>
        {menueCoordinate.date.toLocaleString("default", {
          weekday: "long",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}
        <Box component="span" color={theme.palette.text.secondary}>
          {", "}
          {TEXT_FOR_DATIVE}
          {": "}
        </Box>
        {menueCoordinate.mealType.name}
      </Typography>
    </Grid>
  );
};
/* ===================================================================
// =========================  Rezept Info ============================
// =================================================================== */
interface EventUsedMealRecipeInfoBlockProps {
  recipe: Recipe;
  menueCoordinate: MenueCoordinates;
  mealRecipe: MealRecipe;
  groupConfiguration: EventGroupConfiguration;
}
const EventUsedMealRecipeInfoBlock = ({
  recipe,
  menueCoordinate,
  mealRecipe,
  groupConfiguration,
}: EventUsedMealRecipeInfoBlockProps) => {
  const classes = useStyles();
  return (
    <Grid
      item
      key={"recipeInfoBlockTime" + mealRecipe.uid}
      xs={12}
      // alignItems="center"
      // alignContent="center"
    >
      <Container maxWidth="sm">
        <List dense>
          <FormListItem
            id={"source"}
            value={
              Utils.isUrl(recipe.source) ? (
                <Link href={recipe.source as string} target="_blank">
                  {Utils.getDomain(recipe.source)}
                </Link>
              ) : (
                recipe.source
              )
            }
            label={TEXT_SOURCE}
          />
          <FormListItem
            id={"plan"}
            value={generatePlanedPortionsText({
              uid: mealRecipe.uid,
              portionPlan: mealRecipe.plan,
              groupConfiguration: groupConfiguration,
            })}
            label={TEXT_PLANED_FOR}
          />
          {recipe.note && (
            <FormListItem id={"plan"} value={recipe.note} label={TEXT_NOTE} />
          )}
          {recipe.type == RecipeType.variant &&
            recipe.variantProperties?.note && (
              <FormListItem
                id={"plan"}
                value={recipe.variantProperties?.note}
                label={TEXT_VARIANT_NOTE}
              />
            )}
        </List>
      </Container>
    </Grid>
  );
};
/* ===================================================================
// =======================  Rezept Zutaten ===========================
// =================================================================== */
interface EventUsedMealRecipeIngredientBlockProps {
  recipe: Recipe;
  mealRecipe: MealRecipe;
  products: Product[];
  unitConversionBasic: UnitConversionBasic | null;
  unitConversionProducts: UnitConversionProducts | null;
}
const EventUsedMealRecipeIngredientBlock = ({
  recipe,
  mealRecipe,
  products,
  unitConversionBasic,
  unitConversionProducts,
}: EventUsedMealRecipeIngredientBlockProps) => {
  const classes = useStyles();

  const scaledIngredients = Recipe.scaleIngredients({
    recipe: recipe,
    portionsToScale: mealRecipe.totalPortions,
    scalingOptions: {convertUnits: true}, // Hier fix WAHR
    products: products,
    unitConversionBasic: unitConversionBasic,
    unitConversionProducts: unitConversionProducts,
  });

  return (
    <RecipeIngredients
      recipe={recipe}
      scaledIngredients={scaledIngredients}
      scaledPortions={mealRecipe.totalPortions}
    />
  );
};
/* ===================================================================
// =======================  Rezept Zutaten ===========================
// =================================================================== */
interface EventUsedMealRecipePreparationStepsBlockProps {
  recipe: Recipe;
}
const EventUsedMealRecipePreparationStepsBlock = ({
  recipe,
}: EventUsedMealRecipePreparationStepsBlockProps) => {
  const classes = useStyles();
  return <RecipePreparation recipe={recipe} />;
};

/* ===================================================================
// =======================  Rezept Zutaten ===========================
// =================================================================== */
interface EventUsedMealRecipeMaterialBlockProps {
  recipe: Recipe;
  mealRecipe: MealRecipe;
}
const EventUsedMealRecipeMaterialBlock = ({
  recipe,
  mealRecipe,
}: EventUsedMealRecipeMaterialBlockProps) => {
  const classes = useStyles();

  const scaledMaterials = Recipe.scaleMaterials({
    recipe: recipe,
    portionsToScale: mealRecipe.totalPortions,
  });

  return (
    <RecipeMaterial
      recipe={recipe}
      scaledMaterials={scaledMaterials}
      scaledPortions={mealRecipe.totalPortions}
    />
  );
};

export default EventUsedRecipesPage;
