/* eslint-disable react/prop-types */ // TODO: upgrade to latest eslint tooling

import React from "react";
import {compose} from "react-recompose";

import {useHistory} from "react-router";

import CssBaseline from "@material-ui/core/CssBaseline";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import {
  Button,
  Collapse,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControl,
  FormControlLabel,
  Switch,
  Fab,
  Typography,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";

import {ToggleButton, ToggleButtonGroup} from "@material-ui/lab";

import AddIcon from "@material-ui/icons/Add";

import {RECIPE as ROUTE_RECIPE} from "../../constants/routes";
import Action from "../../constants/actions";
import {
  ALL as TEXT_ALL,
  PUBLIC as TEXT_PUBLIC,
  PRIVATE as TEXT_PRIVATE,
  VARIANT as TEXT_VARIANT,
  ADVANCED_SEARCH as TEXT_ADVANCED_SEARCH,
  RECIPE as TEXT_RECIPE,
  RECIPES as TEXT_RECIPES,
  RESTRICTIONS as TEXT_RESTRICTIONS,
  FIND_YOUR_FAVORITE_RECIPES as TEXT_FIND_YOUR_FAVORITE_RECIPES,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  CONSIDER_INTOLERANCES as TEXT_CONSIDER_INTOLERANCES,
  NONE_RESTRICTION as TEXT_NONE_RESTRICTION,
  LACTOSE as TEXT_LACTOSE,
  GLUTEN as TEXT_GLUTEN,
  IS_VEGAN as TEXT_IS_VEGAN,
  IS_VEGETARIAN as TEXT_IS_VEGETARIAN,
  RECIPETYPE as TEXT_RECIPETYPE,
  CREATE_RECIPE as TEXT_CREATE_RECIPE,
  PRIVATE_RECIPE as TEXT_PRIVATE_RECIPE,
  VARIANT_RECIPE as TEXT_VARIANT_RECIPE,
  NO_RECIPE_FOUND as TEXT_NO_RECIPE_FOUND,
  CREATE_A_NEW_ONE as TEXT_CREATE_A_NEW_ONE,
  MENU_TYPE as TEXT_MENU_TYPE,
  MENU_TYPES as TEXT_MENU_TYPES,
  OUTDOOR_KITCHEN_SUITABLE as TEXT_OUTDOOR_KITCHEN_SUITABLE,
  SHOW_ONLY_MY_RECIPES as TEXT_SHOW_ONLY_MY_RECIPES,
} from "../../constants/text";

import useStyles from "../../constants/styles";

import RecipeShort from "./recipeShort.class";
import {MenuType, RecipeType} from "./recipe.class";

import PageTitle from "../Shared/pageTitle";
import SearchPanel from "../Shared/searchPanel";

import RecipeCard, {RecipeCardLoading} from "./recipeCard";
import AlertMessage from "../Shared/AlertMessage";
import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";

import {Lock as LockIcon, Category as CategoryIcon} from "@material-ui/icons";

import {withFirebase} from "../Firebase/firebaseContext";
import {Allergen, Diet} from "../Product/product.class";
import {
  STORAGE_OBJECT_PROPERTY,
  SessionStorageHandler,
} from "../Firebase/Db/sessionStorageHandler.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../Shared/global.interface";
import ScrollDownOnKeyPress from "../Shared/ScrollDownOnKeyPress";

//TODO: alle kommentare löschen
/* ===================================================================
// ============================ Dispatcher ===========================
// =================================================================== */
enum ReducerActions {
  RECIPES_FETCH_INIT = "RECIPES_FETCH_INIT",
  RECIPES_FETCH_SUCCESS = "RECIPES_FETCH_SUCCESS",
  RECIPES_FETCH_ERROR = "RECIPES_FETCH_ERROR",
  SET_SNACKBAR = "SET_SNACKBAR",
  CLOSE_SNACKBAR = "CLOSE_SNACKBAR",
}

type DispatchAction = {
  type: ReducerActions;
  payload: any;
};

type State = {
  recipes: RecipeShort[];
  isLoading: boolean;
  snackbar: Snackbar;
  error: Error | null;
};

const inititialState: State = {
  recipes: [],
  isLoading: false,
  snackbar: {} as Snackbar,
  error: null,
};

interface FilterRecipesProps {
  searchSettings: SearchSettings;
  recipes: RecipeShort[];
}

const recipesReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.RECIPES_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.RECIPES_FETCH_SUCCESS:
      return {
        ...state,
        recipes: action.payload as RecipeShort[],
        error: null,
        isLoading: false,
      };
    case ReducerActions.RECIPES_FETCH_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case ReducerActions.SET_SNACKBAR:
      return {
        ...state,
        snackbar: action.payload as Snackbar,
      };
    case ReducerActions.CLOSE_SNACKBAR:
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
export const INITIAL_SEARCH_SETTINGS: SearchSettings = {
  showAdvancedSearch: false,
  searchString: "",
  allergens: [0],
  diet: Diet.Meat,
  menuTypes: [],
  recipeType: "all",
  outdoorKitchenSuitable: false,
  showOnlyMyRecipes: false,
};

interface LocationState {
  snackbar?: Snackbar;
}
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const RecipesPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <RecipesBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const RecipesBase: React.FC<
  CustomRouterProps<undefined, LocationState> & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const {push} = useHistory();

  const [state, dispatch] = React.useReducer(recipesReducer, inititialState);
  // Prüfen ob allenfalls eine Snackbar angezeigt werden soll
  // --> aus dem Prozess Rezept löschen
  if (
    props.location.state &&
    props.location.state.snackbar &&
    !state.snackbar.open
  ) {
    dispatch({
      type: ReducerActions.SET_SNACKBAR,
      payload: props.location.state.snackbar!,
    });
  }

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (!authUser) {
      return;
    }

    dispatch({type: ReducerActions.RECIPES_FETCH_INIT, payload: {}});
    RecipeShort.getShortRecipes({
      firebase: firebase,
      authUser: authUser,
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.RECIPES_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        dispatch({
          type: ReducerActions.RECIPES_FETCH_ERROR,
          payload: error,
        });
      });
  }, [authUser]);
  React.useEffect(() => {
    // Prüfen ob die Daten aus dem Session-Storage wiederhergestellt werden müssen.
    const history = window.history;
    history.replaceState({isBackNavigation: true}, "");
  }, []);

  if (!authUser) {
    return null;
  }

  /* ------------------------------------------
    // Neues Rezept anlegen
    // ------------------------------------------ */
  const onNewClick = () => {
    push({
      pathname: ROUTE_RECIPE,
      state: {action: Action.NEW},
    });
  };
  /* ------------------------------------------
  // Klick auf Rezept-Karte
  // ------------------------------------------ */
  const onCardClick = ({recipe}: OnRecipeCardClickProps) => {
    if (!recipe) {
      return;
    }
    if (recipe.type === RecipeType.private) {
      push({
        pathname: `${ROUTE_RECIPE}/${authUser.uid}/${recipe.uid}`,
        state: {
          action: Action.VIEW,
          recipeShort: recipe,
          recipeType: recipe.type,
        },
      });
    } else if (recipe.type === RecipeType.public) {
      push({
        pathname: `${ROUTE_RECIPE}/${recipe.uid}`,
        state: {
          action: Action.VIEW,
          recipeShort: recipe,
          recipeType: recipe.type,
        },
      });
    }
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
    delete props.location.state?.snackbar;
    dispatch({
      type: ReducerActions.CLOSE_SNACKBAR,
      payload: {},
    });
  };
  // TODO: die interaktion mit der Search muss in die untere Komponente
  // damit diese auch von andere nutzbar wird!

  /* ------------------------------------------
  // Rezepte suchen
  // ------------------------------------------ */
  // const onSearch = (
  //   event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  // ) => {
  // setSearchSettings({ ...searchSettings, searchString: event.target.value });
  // setFilteredData(
  //   filterRecipes({
  //     searchSettings: { ...searchSettings, searchString: event.target.value },
  //     recipes: state.recipes,
  //   })
  // );
  // };
  // const onSearchSettings = (updatedSearchSettings: SearchSettings) => {
  // setSearchSettings(updatedSearchSettings);
  // setFilteredData(
  //   filterRecipes({
  //     searchSettings: updatedSearchSettings,
  //     recipes: state.recipes,
  //   })
  // );
  // };
  /* ------------------------------------------
  // Suchstring löschen
  // ------------------------------------------ */
  // const onClearSearchString = () => {
  // setSearchSettings({ ...searchSettings, searchString: "" });
  // setFilteredData(state.recipes);
  // };

  // Alle Rezepte anzeigen, falls nichts gesucht wurde
  // if (
  //   searchSettings == INITIAL_SEARCH_SETTINGS &&
  //   state.recipes.length > 0 &&
  //   filteredData.length === 0
  // ) {
  //   setFilteredData(state.recipes);
  // }
  return (
    <React.Fragment>
      <CssBaseline />
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT_RECIPES}
        subTitle={TEXT_FIND_YOUR_FAVORITE_RECIPES}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="lg">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {state.error && (
          <AlertMessage
            error={state.error}
            severity="error"
            messageTitle={TEXT_ALERT_TITLE_UUPS}
          />
        )}
        <RecipeSearch
          recipes={state.recipes}
          // filteredData={filteredData}
          onNewClick={onNewClick}
          onCardClick={onCardClick}
          // onSearch={onSearch}
          // onSearchSettings={onSearchSettings}
          // searchSettings={searchSettings}
          // onClearSearchString={onClearSearchString}
          isLoading={state.isLoading}
          authUser={authUser}
        />
      </Container>
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={handleSnackbarClose}
      />
      <ScrollDownOnKeyPress />
    </React.Fragment>
  );
};
// /* ===================================================================
// // ============================ Rezept Suche =========================
// // =================================================================== */
interface RecipeSearchProps {
  recipes: RecipeShort[];
  // filteredData: RecipeShort[];
  onNewClick: () => void;
  onCardClick: ({event, recipe}: OnRecipeCardClickProps) => void;
  onFabButtonClick?: ({event, recipe}: OnRecipeCardClickProps) => void;
  // searchSettings: SearchSettings;
  // onSearch: (event) => void;
  // onSearchSettings: (searchSettings: SearchSettings) => void;
  // onClearSearchString: () => void;
  embeddedMode?: boolean;
  fabButtonIcon?: JSX.Element;
  error?: Error | null;
  isLoading?: boolean;
  authUser: AuthUser;
}
export interface OnRecipeCardClickProps {
  event: React.MouseEvent<HTMLButtonElement>;
  recipe: RecipeShort;
}
interface SearchSettings {
  showAdvancedSearch: boolean;
  searchString: string;
  allergens: Allergen[];
  diet: Diet;
  menuTypes: MenuType[];
  outdoorKitchenSuitable: boolean;
  recipeType: RecipeType | "all";
  showOnlyMyRecipes: boolean;
}

export const RecipeSearch = ({
  // filteredData = [],
  recipes,
  onNewClick: onNewClickSuper,
  onCardClick: onCardClickSuper,
  onFabButtonClick: onFabButtonClickSuper,
  // searchSettings,
  // onSearch,
  // onSearchSettings,
  // onClearSearchString,
  embeddedMode = false,
  fabButtonIcon,
  isLoading = false,
  authUser,
}: RecipeSearchProps) => {
  const classes = useStyles();
  const [searchSettings, setSearchSettings] = React.useState<SearchSettings>(
    INITIAL_SEARCH_SETTINGS
  );
  const [filteredData, setFilteredData] = React.useState([] as RecipeShort[]);
  /* ------------------------------------------
  // Update der Sucheigenschaften
  // ------------------------------------------ */
  const onAdvancedSearchClick = () => {
    // wenn die Erweiterte Suche geschlossen wird, die Einstellungen löschen
    if (searchSettings.showAdvancedSearch) {
      const searchString = searchSettings.searchString;
      setSearchSettings({
        ...INITIAL_SEARCH_SETTINGS,
        searchString: searchString,
        showAdvancedSearch: false,
      });
    } else {
      setSearchSettings({
        ...searchSettings,
        showAdvancedSearch: true,
      });
    }
  };
  const onSearch = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const newSearchSettings = {
      ...searchSettings,
      searchString: event.target.value,
    };
    setSearchSettings(newSearchSettings);
    setFilteredData(
      filterRecipes({
        searchSettings: newSearchSettings,
        recipes: recipes,
      })
    );
    SessionStorageHandler.upsertDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
      value: newSearchSettings,
    });
  };
  const onClearSearchString = () => {
    const newSearchSettings = {...searchSettings, searchString: ""};
    setSearchSettings(newSearchSettings);
    setFilteredData(recipes);
    SessionStorageHandler.upsertDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
      value: newSearchSettings,
    });
  };
  const onSearchSettingDietUpdate = (
    event: React.MouseEvent<HTMLElement>,
    value: string
  ) => {
    if (!value) {
      value = Diet.Meat.toString();
    }
    const newSearchSettings = {...searchSettings, diet: parseInt(value)};
    setSearchSettings(newSearchSettings);
    setFilteredData(
      filterRecipes({
        searchSettings: newSearchSettings,
        recipes: recipes,
      })
    );
    SessionStorageHandler.upsertDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
      value: newSearchSettings,
    });
  };
  const onSearchSettingAllergensUpdate = (
    event: React.MouseEvent<HTMLElement>,
    values: string[]
  ) => {
    let selectedAllergens: Allergen[] = [];
    if (values.length == 0) {
      selectedAllergens.push(0);
    } else {
      // Neuer Wert herausfinden
      const newValue = parseInt(
        values.filter(
          (value) => !searchSettings.allergens.includes(parseInt(value))
        )[0]
      );

      if (newValue === Allergen.None) {
        // Keine - Reset der anderen Buttons
        selectedAllergens = [Allergen.None];
      } else {
        // Keine wieder entfernen
        selectedAllergens = values.map((allergen) => parseInt(allergen));
        selectedAllergens = selectedAllergens.filter(
          (allergen) => allergen != Allergen.None
        );
      }
    }
    const newSearchSettings = {...searchSettings, allergens: selectedAllergens};
    setSearchSettings(newSearchSettings);
    setFilteredData(
      filterRecipes({
        searchSettings: newSearchSettings,
        recipes: recipes,
      })
    );
    SessionStorageHandler.upsertDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
      value: newSearchSettings,
    });
  };
  const onSearchSettingMenuTypeUpdate = (
    event: React.ChangeEvent<{[key: string]: any}>
  ) => {
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

    selectedMenuTypes.sort();
    const newSearchSettings = {...searchSettings, menuTypes: selectedMenuTypes};
    setSearchSettings(newSearchSettings);
    setFilteredData(
      filterRecipes({
        searchSettings: newSearchSettings,
        recipes: recipes,
      })
    );
    SessionStorageHandler.upsertDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
      value: newSearchSettings,
    });
  };
  const onSearchSettingOutdoorKitchenSuitableUpdate = () => {
    const newSearchSettings = {
      ...searchSettings,
      outdoorKitchenSuitable: !searchSettings.outdoorKitchenSuitable,
    };
    setSearchSettings(newSearchSettings);
    setFilteredData(
      filterRecipes({
        searchSettings: newSearchSettings,
        recipes: recipes,
      })
    );
    SessionStorageHandler.upsertDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
      value: newSearchSettings,
    });
  };
  const onSearchSettingRecipeTypeUpdate = (
    event: React.MouseEvent<HTMLElement>,
    value: SearchSettings["recipeType"]
  ) => {
    if (!value) {
      value = "all";
    }
    const newSearchSettings = {...searchSettings, recipeType: value};
    setSearchSettings(newSearchSettings);

    setFilteredData(
      filterRecipes({
        searchSettings: newSearchSettings,
        recipes: recipes,
      })
    );
    SessionStorageHandler.upsertDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
      value: newSearchSettings,
    });
  };
  const onSearchSettingShowOnlyMyRecipesUpdate = () => {
    const newSearchSettings: SearchSettings = {
      ...searchSettings,
      showOnlyMyRecipes: !searchSettings.outdoorKitchenSuitable,
    };
    setSearchSettings(newSearchSettings);
    setFilteredData(
      filterRecipes({
        searchSettings: newSearchSettings,
        recipes: recipes,
      })
    );
    SessionStorageHandler.upsertDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
      value: newSearchSettings,
    });
  };
  /* ------------------------------------------
  // Card-Aktionen
  // ------------------------------------------ */
  const onCardClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    SessionStorageHandler.upsertDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
      value: searchSettings,
    });

    // Neben dem Event auch recipeShort miteben
    const selectedRecipe = recipes.find(
      (recipe) => recipe.uid == event.currentTarget.id.split("_")[1]
    );
    if (!selectedRecipe) {
      return;
    }
    onCardClickSuper({event: event, recipe: selectedRecipe});
  };
  const onFabButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const selectedRecipe = recipes.find(
      (recipe) => recipe.uid == event.currentTarget.id.split("_")[1]
    );

    if (!selectedRecipe || !onFabButtonClickSuper) {
      return;
    }
    onFabButtonClickSuper({event: event, recipe: selectedRecipe});
  };

  const onNewClick = () => {
    // Sucheinstellungen speichern
    SessionStorageHandler.upsertDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
      value: searchSettings,
    });

    onNewClickSuper();
  };
  /* ------------------------------------------
  // Rezepte filtern
  // ------------------------------------------ */
  const filterRecipes = ({searchSettings, recipes}: FilterRecipesProps) => {
    return recipes.filter((recipe) => {
      // Zuerst prüfen ob Text stimmt
      if (
        searchSettings.searchString &&
        !recipe.name
          .toLowerCase()
          .includes(searchSettings.searchString.toLowerCase()) &&
        recipe.tags.filter(
          (tag) =>
            tag
              .toLowerCase()
              .includes(searchSettings.searchString.toLocaleLowerCase()) ||
            recipe.variantName
              ?.toLowerCase()
              .includes(searchSettings.searchString.toLocaleLowerCase())
        ).length == 0
      ) {
        return false;
      }

      // prüfen ob Diät passt
      if (
        searchSettings.diet != Diet.Meat &&
        recipe.dietProperties?.diet !== searchSettings.diet
      ) {
        return false;
      }

      // prüfen ob Allergie passt
      if (
        !searchSettings.allergens.includes(Allergen.None) &&
        searchSettings.allergens.filter((allergen) =>
          recipe.dietProperties.allergens.includes(allergen)
        ).length > 0
      ) {
        return false;
      }

      // prüfen ob Menütypen passen
      if (
        searchSettings.menuTypes.length > 0 &&
        searchSettings.menuTypes.filter((menuType) =>
          recipe.menuTypes.includes(menuType)
        ).length == 0
      ) {
        return false;
      }

      // prüfen ob Outdoorküche
      if (
        recipe.outdoorKitchenSuitable !== searchSettings.outdoorKitchenSuitable
      ) {
        return false;
      }

      // prüfen über Rezept-Typ
      if (
        searchSettings.recipeType !== "all" &&
        recipe.type !== searchSettings.recipeType
      ) {
        return false;
      }

      if (
        searchSettings.showOnlyMyRecipes &&
        recipe.created.fromUid !== authUser.uid
      ) {
        return false;
      }

      // Das Rezept hat allen Anforderungen entsprochen
      return true;
    });
  };
  /* ------------------------------------------
  // Select Menü - für Menütyp
  // ------------------------------------------ */
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
  /* ------------------------------------------
  // Zwischenspeichern der übergeordneten Werte
  // ------------------------------------------ */
  if (
    recipes.length > 0 &&
    searchSettings == INITIAL_SEARCH_SETTINGS &&
    filteredData.length == 0
  ) {
    // Schauen ob was im SessionStorage ist
    const sessionStorage = SessionStorageHandler.getDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
    });

    if (sessionStorage) {
      setSearchSettings(sessionStorage as SearchSettings);
      setFilteredData(
        filterRecipes({
          searchSettings: sessionStorage as SearchSettings,
          recipes: recipes,
        })
      );
    } else {
      setFilteredData(
        filterRecipes({
          searchSettings: INITIAL_SEARCH_SETTINGS,
          recipes: recipes,
        })
      );
    }
  }
  return (
    <React.Fragment>
      <Container maxWidth="md" style={{marginBottom: "4em"}}>
        <Grid container spacing={2}>
          <Grid item xs={9}>
            <SearchPanel
              searchString={searchSettings.searchString}
              onUpdateSearchString={onSearch}
              onClearSearchString={onClearSearchString}
            />
          </Grid>
          <Grid item xs={3} className={classes.centerCenter}>
            <Button color="primary" onClick={onAdvancedSearchClick}>
              {TEXT_ADVANCED_SEARCH}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{`${filteredData.length} ${
              filteredData.length != 1 ? TEXT_RECIPES : TEXT_RECIPE
            }`}</Typography>
          </Grid>
        </Grid>

        <Collapse
          in={searchSettings.showAdvancedSearch}
          style={{marginTop: "1em"}}
        >
          <Grid container spacing={2}>
            <Grid item xs={4} sm={2} md={2} className={classes.centerCenter}>
              <Typography variant="body2">{TEXT_RESTRICTIONS}</Typography>
            </Grid>
            <Grid item xs={8} sm={4} md={3}>
              <ToggleButtonGroup
                value={searchSettings.diet}
                exclusive
                onChange={onSearchSettingDietUpdate}
                size="small"
                aria-label="Diät"
                // color="primary"
                id="diet"
                key="diet"
              >
                <ToggleButton
                  color="primary"
                  value={Diet.Meat}
                  aria-label="Keine"
                >
                  {TEXT_NONE_RESTRICTION}
                </ToggleButton>
                <ToggleButton value={Diet.Vegetarian} aria-label="Vegetarisch">
                  {TEXT_IS_VEGETARIAN}
                </ToggleButton>
                <ToggleButton value={Diet.Vegan} aria-label="Vegan">
                  {TEXT_IS_VEGAN}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={4} sm={2} md={2} className={classes.centerCenter}>
              <Typography variant="body2">
                {TEXT_CONSIDER_INTOLERANCES}
              </Typography>
            </Grid>
            <Grid item xs={8} sm={4} md={3}>
              <ToggleButtonGroup
                value={searchSettings.allergens}
                onChange={onSearchSettingAllergensUpdate}
                size="small"
                aria-label="Allergene"
                color="primary"
                id="allergens"
                key="allergens"
              >
                <ToggleButton value={0} aria-label="Keine">
                  {TEXT_NONE_RESTRICTION}
                </ToggleButton>
                <ToggleButton value={Allergen.Lactose} aria-label="Laktose">
                  {TEXT_LACTOSE}
                </ToggleButton>
                <ToggleButton value={Allergen.Gluten} aria-label="Laktose">
                  {TEXT_GLUTEN}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} sm={12} md={2}>
              <FormControl
                variant="outlined"
                className={classes.formControl}
                fullWidth
                size="small"
              >
                <InputLabel id="menuTypesLabel">{TEXT_MENU_TYPE}</InputLabel>
                <Select
                  labelId="menuTypesLabel"
                  id="menuTypes"
                  key="menuTypes"
                  name="menuTypes"
                  multiple
                  value={searchSettings.menuTypes}
                  onChange={onSearchSettingMenuTypeUpdate}
                  input={<OutlinedInput fullWidth label={TEXT_MENU_TYPE} />}
                  renderValue={(selected) => {
                    const selectedValues = selected as unknown as string[];
                    const textArray = selectedValues.map(
                      (value) => TEXT_MENU_TYPES[value]
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
                              searchSettings.menuTypes.indexOf(
                                parseInt(menuType)
                              ) > -1
                            }
                            color="primary"
                          />
                          <ListItemText primary={TEXT_MENU_TYPES[menuType]} />
                        </MenuItem>
                      )
                  )}
                </Select>
              </FormControl>
            </Grid>
            {/* Ideal für Outdoorküche */}
            <Grid item xs={12} sm={12} md={3}>
              <FormControl
                className={classes.formControl}
                fullWidth
                size="small"
              >
                <FormControlLabel
                  value={searchSettings.outdoorKitchenSuitable}
                  onChange={onSearchSettingOutdoorKitchenSuitableUpdate}
                  control={<Switch color="primary" />}
                  label={
                    <Typography variant="body2">
                      {TEXT_OUTDOOR_KITCHEN_SUITABLE}
                    </Typography>
                  }
                  labelPlacement="start"
                />
              </FormControl>
            </Grid>
            {/* Rezept-Typ */}
            <Grid item xs={4} sm={1} md={1} className={classes.centerCenter}>
              <Typography variant="body2">{TEXT_RECIPETYPE}</Typography>
            </Grid>
            <Grid item xs={8} sm={4} md={4}>
              <ToggleButtonGroup
                value={searchSettings.recipeType}
                exclusive
                onChange={onSearchSettingRecipeTypeUpdate}
                size="small"
                aria-label="Diät"
                // color="primary"
                id="recipeType"
                key="recipeType"
              >
                <ToggleButton color="primary" value={"all"} aria-label="Alle">
                  {TEXT_ALL}
                </ToggleButton>
                <ToggleButton
                  color="primary"
                  value={RecipeType.public}
                  aria-label="öffentlich"
                >
                  {TEXT_PUBLIC}
                </ToggleButton>
                <ToggleButton value={RecipeType.private} aria-label="Privat">
                  {TEXT_PRIVATE}
                </ToggleButton>
                {embeddedMode && (
                  // in der allgemeinen Rezeptübersicht mach dieser Button keinen Sinn
                  <ToggleButton
                    value={RecipeType.variant}
                    aria-label="Variante"
                  >
                    {TEXT_VARIANT}
                  </ToggleButton>
                )}
              </ToggleButtonGroup>
            </Grid>

            {/* Nur Meine Rezept anzeigen */}
            <Grid item xs={12} sm={12} md={3}>
              <FormControl
                className={classes.formControl}
                fullWidth
                size="small"
              >
                <FormControlLabel
                  value={searchSettings.showOnlyMyRecipes}
                  onChange={onSearchSettingShowOnlyMyRecipesUpdate}
                  control={<Switch color="primary" />}
                  label={
                    <Typography variant="body2">
                      {TEXT_SHOW_ONLY_MY_RECIPES}
                    </Typography>
                  }
                  labelPlacement="start"
                />
              </FormControl>
            </Grid>
          </Grid>
        </Collapse>
        <Grid container>
          <Grid item xs={12} className={classes.centerCenter}>
            <Button
              className={classes.button}
              id={"new_recipe"}
              key={"new_recipe"}
              variant={"outlined"}
              color={"primary"}
              onClick={onNewClick}
            >
              {TEXT_CREATE_RECIPE}
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Grid container spacing={2}>
        {isLoading ? (
          // 8 Karten zum Überbrücken, bis die Daten da sind
          [1, 2, 3, 4, 5, 6, 7, 8].map((counter) => (
            <Grid
              item
              key={"recipeLoadingCardGrid_" + counter}
              xs={12}
              sm={embeddedMode ? 12 : 6}
              md={embeddedMode ? 6 : 4}
              lg={embeddedMode ? 4 : 3}
            >
              <RecipeCardLoading key={"recipeLoadingCard_" + counter} />
            </Grid>
          ))
        ) : (
          <React.Fragment>
            {filteredData.map((recipe) => (
              <Grid
                item
                key={"recipe_" + recipe.uid}
                xs={12}
                sm={embeddedMode ? 6 : 4}
                md={embeddedMode ? 4 : 3}
                // lg={embeddedMode ? 4 : 3}
                // xl={embededMode ? 3 : 2}
              >
                <RecipeCard
                  key={"recipe_card_" + recipe.uid}
                  recipe={recipe}
                  onCardClick={onCardClick}
                  ribbon={
                    recipe.type === RecipeType.private
                      ? {
                          tooltip: TEXT_PRIVATE_RECIPE,
                          cssProperty: "cardRibbon  cardRibbon--red",
                          icon: <LockIcon fontSize="small" />,
                        }
                      : recipe.type === RecipeType.variant
                      ? {
                          tooltip: TEXT_VARIANT_RECIPE,
                          cssProperty: "cardRibbon  cardRibbon--purple",
                          icon: <CategoryIcon fontSize="small" />,
                        }
                      : undefined
                  }
                  fabButtonIcon={fabButtonIcon}
                  onFabButtonClick={onFabButtonClickSuper && onFabButtonClick}
                />
              </Grid>
            ))}
            {/* Keine Rezepte gefunden --> Neues Erfassen? */}
            {filteredData.length === 0 && (
              <Grid item key={"noRecipe"} xs={12} sm={12} md={12}>
                <Typography
                  variant="h5"
                  align="center"
                  color="textSecondary"
                  paragraph
                >
                  {TEXT_NO_RECIPE_FOUND}
                </Typography>

                <Typography align="center" paragraph>
                  {TEXT_CREATE_A_NEW_ONE}
                </Typography>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item>
                    <Fab
                      onClick={onNewClick}
                      color="primary"
                      aria-label="neues Rezept"
                    >
                      <AddIcon />
                    </Fab>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </React.Fragment>
        )}
      </Grid>
    </React.Fragment>
  );
};

const condition = (authUser: AuthUser | null) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(RecipesPage);
