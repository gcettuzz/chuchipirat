import React, {Suspense, lazy} from "react";
import {compose} from "recompose";
import {useHistory} from "react-router";

import Firebase, {withFirebase} from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import Action from "../../constants/actions";
import {Container, Divider} from "@material-ui/core";
import Recipe, {Ingredient, RecipeType, Recipes} from "./recipe.class";
import RecipeShort from "./recipeShort.class";

import RecipeView from "./recipe.view";
import FallbackLoading from "../Shared/fallbackLoading";
import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";

import {
  RECIPE as ROUTE_RECIPE,
  RECIPES as ROUTE_RECIPES,
} from "../../constants/routes";

// import SessionStorageHandler, {
//   SessionStoragePath,
// } from "../Shared/sessionStorageHandler.class";
// import { RecipeListSessionStorage } from "./recipes";

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

// Struktur des Session Storage, wenn Rezepte zwischengespeichert werden
// export interface RecipeSessionStorage {
//   date: Date;
//   recipes: Recipes;
// }

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
  isError: boolean;
  error: object;
  snackbar: Snackbar;
};

const inititialState: State = {
  recipe: new Recipe(),
  isLoading: false,
  isLoadingPicture: false,
  isError: false,
  error: {},
  snackbar: {open: false, severity: "success", message: ""},
};
export interface SwitchEditMode {
  ignoreState?: boolean;
}
const recipeReducer = (state: State, action: DispatchAction): State => {
  let field: string;
  let value: any;
  switch (action.type) {
    case ReducerActions.RECIPE_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
        // _loadingRecipe: true,
      };
    case ReducerActions.RECIPE_FETCH_SUCCESS:
      // Achtung: Payload ist ein Objekt -->
      // {recipe, scaledPortions, scaledIngredients}
      return {
        ...state,
        recipe: action.payload.recipe as Recipe,
        isLoading: false,
        isError: false,
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
      let tempSnackbar = {...state.snackbar};
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
      let tempIngredients = {...state.recipe.ingredients};
      let tempPreparationSteps = {...state.recipe.preparationSteps};
      let tempMaterials = {...state.recipe.materials};

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
        isError: true,
        isLoading: false,
        error: action.payload ? action.payload : {},
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
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
const RecipeBase = ({props, authUser}) => {
  const firebase: Firebase = props.firebase;

  const {push, replace} = useHistory();

  let action: Action;
  let recipeUid: string = "";
  let recipeType: RecipeType;
  let userUid: string;
  let scaledPortions: number = 0;

  const [editMode, setEditMode] = React.useState(false);
  const [state, dispatch] = React.useReducer(recipeReducer, inititialState);

  if (props.location.state) {
    action = props.location.state.action;
    if (props.location.state.hasOwnProperty("scaledPortions")) {
      scaledPortions = parseInt(props.location.state?.scaledPortions);
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
      let urlParameter: string[] = props.location.pathname.split("/");
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
          uid: props.location.state?.recipeShort?.uid,
          name: props.location.state?.recipeShort?.name,
          pictureSrc: props.location.state?.recipeShort?.pictureSrc,
          recipe: props.location.state?.recipe,
        },
      });
      if (!props.location.state?.recipe) {
        //TODO: Wenn das ganze Rezept übergeben wird, muss nicht nachgelesen werden.
        dispatch({type: ReducerActions.RECIPE_FETCH_INIT, payload: {}});
        // Rezept lesen (es können auch fremde private Rezepte gelesen werden -
        // darum wird hier nicht die eigene User-ID übergeben)
        Recipe.getRecipe({
          firebase: firebase,
          authUser: authUser,
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
  /* ------------------------------------------
  // Edit-Modus umschiessen
  // ------------------------------------------ */
  const switchEditMode = (
    {ignoreState}: SwitchEditMode = {ignoreState: false}
  ) => {
    // Wenn der ignoreState true ist, wird nicht geprüft
    // ob die UID leer ist. --> dies damit nach dem speichern
    // eines neuen Rezeptes dies angezeit wird.
    // Wenn bei der Rezeptanalage abgrebrochen wird, muss
    // zurück zur Rezeptübersicht
    if (editMode == true && !state.recipe.uid && !ignoreState) {
      push({
        pathname: ROUTE_RECIPES,
      });
      return;
    }

    // sicherstellen, dass alle Positionen, mindestens 1x vokommen
    dispatch({type: ReducerActions.RECIPE_CHECK_POSITIONS, payload: {}});

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
          onError={onError}
          authUser={authUser}
        />
      ) : (
        <RecipeView
          recipe={state.recipe}
          scaledPortions={scaledPortions}
          firebase={firebase}
          mealPlan={[]}
          isLoading={state.isLoading}
          isError={state.isError}
          error={state.error}
          switchEditMode={switchEditMode}
          onUpdateRecipe={onUpdateState}
          onEditRecipeMealPlan={() => {}}
          onAddToEvent={() => {}}
          onError={onError}
          authUser={authUser}
          onRecipeDelete={() => {}}
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
  style?: object;
}
export const RecipeDivider = ({style}: RecipeDividerProps) => {
  return (
    <Container maxWidth="lg" style={style}>
      <Divider />
    </Container>
  );
};

const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(RecipePage);
