import React, {Suspense, SyntheticEvent, lazy} from "react";
import {useNavigate, useLocation} from "react-router";

import Action from "../../constants/actions";
import {Container, Divider, SnackbarCloseReason} from "@mui/material";
import Recipe, {RecipeType} from "./recipe.class";

import RecipeView from "./recipe.view";
import FallbackLoading from "../Shared/fallbackLoading";
import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";

import {RECIPES as ROUTE_RECIPES} from "../../constants/routes";
import RecipeShort from "./recipeShort.class";
import {ValueObject} from "../Firebase/Db/firebase.db.super.class";
import {
  DialogType,
  useCustomDialog,
  SingleTextInputResult,
} from "../Shared/customDialogContext";

import {
  PROCEED as TEXT_PROCEED,
  ARE_YOU_SURE_YOU_WANT_TO_CHANGE as TEXT_ARE_YOU_SURE_YOU_WANT_TO_CHANGE,
  PUBLIC_RECIPE as TEXT_PUBLIC_RECIPE,
} from "../../constants/text";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {useAuthUser} from "../Session/authUserContext";
import {useFirebase} from "../Firebase/firebaseContext";

// Lazy Loading
const RecipeEdit = lazy(() => import("./recipe.edit"));

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  RECIPE_FETCH_INIT = "RECIPE_FETCH_INIT",
  RECIPE_FETCH_SUCCESS = "RECIPE_FETCH_SUCCESS",
  RECIPE_UPDATE = "RECIPE_UPDATE",
  RECIPE_CHECK_POSITIONS = "RECIPE_CHECK_POSITIONS",
  SET_PROPS = "SET_PROPS",
  MANAGE_LOADING_SCREEN = "MANAGE_LOADING_SCREEN",
  GENERIC_ERROR = "GENERIC_ERROR",
  SNACKBAR_CLOSE = "SNACKBAR_CLOSE",
  SNACKBAR_SHOW = "SNACKBAR_SHOW",
}
export interface OnUpdateRecipeProps {
  recipe: Recipe;
  snackbar?: Snackbar;
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};
type State = {
  recipe: Recipe;
  isLoading: boolean;
  isLoadingPicture: boolean;
  error: Error | null;
  snackbar: Snackbar;
};

const inititialState: State = {
  recipe: new Recipe(),
  isLoading: false,
  isLoadingPicture: false,
  error: null,
  snackbar: {open: false, severity: "success", message: ""},
};
export interface SwitchEditMode {
  ignoreState?: boolean;
}
const recipeReducer = (state: State, action: DispatchAction): State => {
  let tempSnackbar: Snackbar;
  let tempIngredients: Recipe["ingredients"];
  let tempPreparationSteps: Recipe["preparationSteps"];
  let tempMaterials: Recipe["materials"];

  switch (action.type) {
    case ReducerActions.RECIPE_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        // _loadingRecipe: true,
      };
    case ReducerActions.RECIPE_FETCH_SUCCESS:
      // Achtung: Payload ist ein Objekt -->
      // {recipe, scaledPortions, scaledIngredients}
      return {
        ...state,
        recipe: action.payload.recipe as Recipe,
        isLoading: false,
      };
    case ReducerActions.SET_PROPS:
      // Übergabeparameter setzen
      if (action.payload.recipe) {
        return {
          ...state,
          recipe: action.payload.recipe,
        };
      } else {
        return {
          ...state,
          recipe: {
            ...state.recipe,
            uid: action.payload.uid,
            name: action.payload.name,
            pictureSrc: action.payload.pictureSrc,
          },
        };
      }
    case ReducerActions.RECIPE_UPDATE:
      // Falls das Rezept von einer "Unter"-Seite angepasst wurde
      // erhalten wir hier das Update
      tempSnackbar = {...state.snackbar};
      if (action.payload.snackbar) {
        tempSnackbar = action.payload.snackbar;
      }

      return {
        ...state,
        recipe: action.payload.recipe,
        snackbar: tempSnackbar,
      };
    case ReducerActions.RECIPE_CHECK_POSITIONS:
      // Prüfen, dass sicher eine Position vorhanden ist,
      // wenn die letzte nicht leer ist, eine neue einfügen
      tempIngredients = {...state.recipe.ingredients};
      tempPreparationSteps = {...state.recipe.preparationSteps};
      tempMaterials = {...state.recipe.materials};
      tempIngredients = Recipe.createEmptyListEntryIngredients(tempIngredients);
      tempPreparationSteps =
        Recipe.createEmptyListEntryPreparationSteps(tempPreparationSteps);
      tempMaterials = Recipe.createEmptyListEntryMaterials(tempMaterials);

      return {
        ...state,
        recipe: {
          ...state.recipe,
          ingredients: tempIngredients,
          preparationSteps: tempPreparationSteps,
          materials: tempMaterials,
        },
      };

      break;
    case ReducerActions.MANAGE_LOADING_SCREEN:
      return {
        ...state,
        isLoading: action.payload.isLoading,
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
        isLoading: false,
        error: action.payload as Error,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

interface LocationState {
  action: any;
  scaledPortions?: string;
  recipeShort?: RecipeShort;
  recipe?: Recipe;
}

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const RecipePage = () => {
  const firebase = useFirebase();
  const authUser = useAuthUser();
  const location = useLocation();
  const navigate = useNavigate();
  const {customDialog} = useCustomDialog();

  let action: Action;
  let recipeUid = "";
  let recipeType: RecipeType;
  let userUid: string;
  let scaledPortions = 0;

  const [editMode, setEditMode] = React.useState(false);
  const [state, dispatch] = React.useReducer(recipeReducer, inititialState);

  if (location.state) {
    action = location?.state?.action;
    if (
      Object.prototype.hasOwnProperty.call(
        location.state,
        "scaledPortions"
      )
    ) {
      scaledPortions = parseInt(location.state!.scaledPortions!);
    } else {
      scaledPortions = 0;
    }
  } else {
    action = Action.VIEW;
  }
  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (!recipeUid) {
      const urlParameter: string[] = location.pathname.split("/");
      if (urlParameter.length === 2) {
        // Beispiel: /recipe/
        action = Action.NEW;
      } else if (urlParameter.length === 3) {
        // öffentliches Rezepte
        // Beispiel: /recipe/HWEvHBnRM56GDapkWtsd
        recipeUid = urlParameter[2];
        recipeType = RecipeType.public;
      } else if (urlParameter.length === 4) {
        // privates Rezept
        // Beispiel: /recipe/tasT02c6mxOWDstBdvwzjbs5Tfc2/t3jKjgl5QnDpe9EHDWZ9
        userUid = urlParameter[2];
        recipeUid = urlParameter[3];
        recipeType = RecipeType.private;
      }
    }
    // Wen das Ereignis NEW ist, wird ein neues Rezept angelegt.
    // Ansonsten wird aus der DB das geforderte gelesen
    // let scaledIngredients: Ingredient[] = [];
    if (action === Action.NEW) {
      dispatch({
        type: ReducerActions.RECIPE_FETCH_SUCCESS,
        payload: {recipe: new Recipe()},
      });
      setEditMode(true);
    } else {
      dispatch({
        type: ReducerActions.SET_PROPS,
        payload: {
          uid: location.state?.recipeShort?.uid,
          name: location.state?.recipeShort?.name,
          pictureSrc: location.state?.recipeShort?.pictureSrc,
          recipe: location.state?.recipe,
        },
      });
      if (!location.state?.recipe) {
        //TODO: Wenn das ganze Rezept übergeben wird, muss nicht nachgelesen werden.
        dispatch({type: ReducerActions.RECIPE_FETCH_INIT, payload: {}});
        // Rezept lesen (es können auch fremde private Rezepte gelesen werden -
        // darum wird hier nicht die eigene User-ID übergeben)
        Recipe.getRecipe({
          firebase: firebase,
          authUser: authUser!,
          uid: recipeUid,
          userUid: userUid,
          type: recipeType,
        })
          .then((result) => {
            dispatch({
              type: ReducerActions.RECIPE_FETCH_SUCCESS,
              payload: {
                recipe: result,
              },
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
      // }
    }
  }, [action]);
  if (!authUser) {
    return null;
  }

  /* ------------------------------------------
  // Edit-Modus umschiessen
  // ------------------------------------------ */
  const switchEditMode = async (
    {ignoreState}: SwitchEditMode = {ignoreState: false}
  ) => {
    // Wenn der ignoreState true ist, wird nicht geprüft
    // ob die UID leer ist. --> dies damit nach dem speichern
    // eines neuen Rezeptes dies angezeit wird.
    // Wenn bei der Rezeptanalage abgrebrochen wird, muss
    // zurück zur Rezeptübersicht
    if (editMode == true && !state.recipe.uid && !ignoreState) {
      navigate(ROUTE_RECIPES);
      return;
    }

    // sicherstellen, dass alle Positionen, mindestens 1x vokommen
    dispatch({type: ReducerActions.RECIPE_CHECK_POSITIONS, payload: {}});

    // falls das Rezept öffentlich ist, kurz warnen! (unbeabsichtigte Änderungen verhinern)
    if (state.recipe.type === RecipeType.public && !editMode) {
      const userInput = (await customDialog({
        dialogType: DialogType.Confirm,
        title: TEXT_PUBLIC_RECIPE,
        text: TEXT_ARE_YOU_SURE_YOU_WANT_TO_CHANGE,
        buttonTextConfirm: TEXT_PROCEED,
      })) as SingleTextInputResult;

      if (!userInput) {
        return;
      }
    }
    setEditMode(!editMode);
  };
  /* ------------------------------------------
  // Rezept wurde angepasst
  // ------------------------------------------ */
  const onUpdateState = ({recipe, snackbar}: OnUpdateRecipeProps) => {
    dispatch({
      type: ReducerActions.RECIPE_UPDATE,
      payload: {
        recipe: recipe,
        snackbar: snackbar,
      },
    });
  };
  const onError = (error: Error) => {
    console.error(error);
    dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
  };

  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (
    event: Event | SyntheticEvent<any, Event>,
    reason: SnackbarCloseReason
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
    <Suspense fallback={<FallbackLoading />}>
      {editMode ? (
        <RecipeEdit
          dbRecipe={state.recipe}
          mealPlan={[]}
          firebase={firebase}
          isLoading={state.isLoading}
          isEmbedded={false}
          switchEditMode={switchEditMode}
          onUpdateRecipe={onUpdateState}
          authUser={authUser}
        />
      ) : (
        <RecipeView
          recipe={state.recipe}
          scaledPortions={scaledPortions}
          firebase={firebase}
          mealPlan={[]}
          isLoading={state.isLoading}
          error={state.error}
          switchEditMode={switchEditMode}
          onUpdateRecipe={onUpdateState}
          onError={onError}
          authUser={authUser}
        />
      )}
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </Suspense>
  );
};

/* ===================================================================
// ============================= Divider =============================
// =================================================================== */
interface RecipeDividerProps {
  style?: ValueObject;
}
export const RecipeDivider = ({style}: RecipeDividerProps) => {
  return (
    <Container maxWidth="lg" style={style}>
      <Divider />
    </Container>
  );
};

export default RecipePage;
