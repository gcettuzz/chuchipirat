import React from "react";
import { compose } from "recompose";
import { useHistory } from "react-router";

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

import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";

import AddIcon from "@material-ui/icons/Add";

import {
  RECIPE as ROUTE_RECIPE,
  RECIPES as ROUTE_RECIPES,
} from "../../constants/routes";
import Action from "../../constants/actions";
import * as TEXT from "../../constants/text";

import useStyles from "../../constants/styles";

import RecipeShort from "./recipeShort.class";
import Recipe, { MenuType, RecipeType } from "./recipe.class";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import SearchPanel from "../Shared/searchPanel";

import RecipeCard, { RecipeCardActions, RecipeCardLoading } from "./recipeCard";
import AlertMessage from "../Shared/AlertMessage";
import CustomSnackbar, { Snackbar } from "../Shared/customSnackbar";

import { Lock as LockIcon, Category as CategoryIcon } from "@material-ui/icons";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
// import SessionStorageHandler from "../Shared/sessionStorageHandler.class";
import { Allergen, Diet } from "../Product/product.class";
import {
  STORAGE_OBJECT_PROPERTY,
  SessionStorageHandler,
} from "../Firebase/Db/sessionStorageHandler.class";
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
  payload: object | [];
};

type State = {
  recipes: RecipeShort[];
  isLoading: boolean;
  snackbar: Snackbar;
  isError: boolean;
  error: object;
};

const inititialState: State = {
  recipes: [],
  isLoading: false,
  snackbar: {} as Snackbar,
  isError: false,
  error: {},
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
        isError: false,
      };
    case ReducerActions.RECIPES_FETCH_SUCCESS:
      return {
        ...state,
        recipes: action.payload as RecipeShort[],
        error: {},
        isLoading: false,
        isError: false,
      };
    case ReducerActions.RECIPES_FETCH_ERROR:
      return {
        ...state,
        error: action.payload,
        isError: true,
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
  outdoorKitchenSuitable: false,
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const RecipesPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <RecipesBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// ============================ Rezept Suche =========================
// =================================================================== */
//FIXME: localstorage über suchergebnisse muss noch angepasst werden!!!!
const RecipesBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const { push } = useHistory();

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
      payload: props.location.state.snackbar,
    });
  }

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatch({ type: ReducerActions.RECIPES_FETCH_INIT, payload: {} });
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
  }, []);
  React.useEffect(() => {
    // Prüfen ob die Daten aus dem Session-Storage wiederhergestellt werden müssen.
    const history = window.history;
    const isBackNavigation = history.state && history.state.isBackNavigation;
    history.replaceState({ isBackNavigation: true }, "");
  }, []);
  /* ------------------------------------------
    // Neues Rezept anlegen
    // ------------------------------------------ */
  const onNewClick = () => {
    push({
      pathname: ROUTE_RECIPE,
      state: { action: Action.NEW },
    });
  };
  /* ------------------------------------------
  // Klick auf Rezept-Karte
  // ------------------------------------------ */
  const onCardClick = ({ event, recipe }: OnRecipeCardClickProps) => {
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
    delete props.location.state.snackbar;
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
        title={TEXT.PAGE_TITLE_RECIPES}
        subTitle={TEXT.PAGE_SUBTITLE_RECIPES}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="lg">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {state.isError && (
          <AlertMessage
            error={state.error}
            severity="error"
            messageTitle={TEXT.ALERT_TITLE_UUPS}
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
          cardActions={[
            { key: "show", name: TEXT.BUTTON_SHOW, onClick: onCardClick },
          ]}
          isLoading={state.isLoading}
        />
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
// /* ===================================================================
// // ============================ Rezept Suche =========================
// // =================================================================== */

interface RecipeSearchProps {
  recipes: RecipeShort[];
  // filteredData: RecipeShort[];
  onNewClick: () => void;
  onCardClick: ({ event, recipe }: OnRecipeCardClickProps) => void;
  onFabButtonClick?: ({ event, recipe }: OnRecipeCardClickProps) => void;
  // searchSettings: SearchSettings;
  // onSearch: (event) => void;
  // onSearchSettings: (searchSettings: SearchSettings) => void;
  // onClearSearchString: () => void;
  cardActions: RecipeCardActions[];
  embeddedMode?: boolean;
  fabButtonIcon?: JSX.Element;
  error?: object;
  isLoading?: boolean;
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
}

const RecipeSearch = ({
  // filteredData = [],
  recipes,
  error,
  onNewClick: onNewClickSuper,
  onCardClick: onCardClickSuper,
  onFabButtonClick: onFabButtonClickSuper,
  // searchSettings,
  // onSearch,
  // onSearchSettings,
  // onClearSearchString,
  cardActions,
  embeddedMode = false,
  fabButtonIcon,
  isLoading = false,
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
      let searchString = searchSettings.searchString;
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
    let newSearchSettings = {
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
    let newSearchSettings = { ...searchSettings, searchString: "" };
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
    let newSearchSettings = { ...searchSettings, diet: parseInt(value) };
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
      let newValue = parseInt(
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
    let newSearchSettings = { ...searchSettings, allergens: selectedAllergens };
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
    event: React.ChangeEvent<{ [key: string]: any }>
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
    let newSearchSettings = { ...searchSettings, menuTypes: selectedMenuTypes };
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
    let newSearchSettings = {
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
    let selectedRecipe = recipes.find(
      (recipe) => recipe.uid == event.currentTarget.id.split("_")[1]
    );
    if (!selectedRecipe) {
      return;
    }
    onCardClickSuper({ event: event, recipe: selectedRecipe });
  };
  const onFabButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    let selectedRecipe = recipes.find(
      (recipe) => recipe.uid == event.currentTarget.id.split("_")[1]
    );

    if (!selectedRecipe || !onFabButtonClickSuper) {
      return;
    }
    onFabButtonClickSuper({ event: event, recipe: selectedRecipe });
  };

  const onNewClick = (
    event: React.MouseEvent<HTMLButtonElement> | undefined
  ) => {
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
  const filterRecipes = ({ searchSettings, recipes }: FilterRecipesProps) => {
    let searchResult = recipes;
    // Zuerst Text filtern
    if (searchSettings.searchString) {
      searchResult = searchResult.filter(
        (recipe) =>
          recipe.name
            .toLowerCase()
            .includes(searchSettings.searchString.toLowerCase()) ||
          recipe.tags.filter(
            (tag) =>
              tag
                .toLowerCase()
                .includes(searchSettings.searchString.toLocaleLowerCase()) ||
              recipe.variantName
                ?.toLowerCase()
                .includes(searchSettings.searchString.toLocaleLowerCase())
          ).length > 0
      );
    }

    // Diät aufiltern
    if (searchSettings.diet != Diet.Meat) {
      searchResult = searchResult.filter(
        (recipe) => recipe.dietProperties?.diet === searchSettings.diet
      );
    }
    // Allergene ausfiltern
    if (!searchSettings.allergens.includes(Allergen.None)) {
      searchSettings.allergens.forEach((allergen) => {
        searchResult = searchResult.filter(
          (recipe) => !recipe.dietProperties.allergens.includes(allergen)
        );
      });
    }

    // Menütypen ausfiltern
    if (searchSettings.menuTypes.length > 0) {
      searchResult = searchResult.filter((recipe) =>
        // Some --> eines der gewählten Filterkriterien muss im Rezept vorkommen
        searchSettings.menuTypes.some((menuType) =>
          recipe.menuTypes.includes(menuType)
        )
      );
    }
    // Geeignet für Outdoorküche
    if (searchSettings.outdoorKitchenSuitable) {
      searchResult = searchResult.filter(
        (recipe) => recipe.outdoorKitchenSuitable
      );
    }
    return searchResult;
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
    let sessionStorage = SessionStorageHandler.getDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.SEARCH_SETTINGS,
      documentUid: "recipes",
    });

    if (sessionStorage) {
      setSearchSettings(sessionStorage);
      setFilteredData(
        filterRecipes({
          searchSettings: sessionStorage,
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
      <Container maxWidth="md" style={{ marginBottom: "4em" }}>
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
              {TEXT.ADVANCED_SEARCH}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{`${filteredData.length} ${
              filteredData.length != 1 ? TEXT.RECIPES : TEXT.RECIPE
            }`}</Typography>
          </Grid>
        </Grid>

        <Collapse
          in={searchSettings.showAdvancedSearch}
          style={{ marginTop: "1em" }}
        >
          <Grid container spacing={2}>
            <Grid item xs={4} sm={2} md={2} className={classes.centerCenter}>
              <Typography variant="body2">{TEXT.RESTRICTIONS}</Typography>
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
                  {TEXT.NONE_RESTRICTION}
                </ToggleButton>
                <ToggleButton value={Diet.Vegetarian} aria-label="Vegetarisch">
                  {TEXT.IS_VEGETARIAN}
                </ToggleButton>
                <ToggleButton value={Diet.Vegan} aria-label="Vegan">
                  {TEXT.IS_VEGAN}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={4} sm={2} md={2} className={classes.centerCenter}>
              <Typography variant="body2">
                {TEXT.CONSIDER_INTOLERANCES}
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
                  {TEXT.NONE_RESTRICTION}
                </ToggleButton>
                <ToggleButton value={Allergen.Lactose} aria-label="Laktose">
                  {TEXT.LACTOSE}
                </ToggleButton>
                <ToggleButton value={Allergen.Gluten} aria-label="Laktose">
                  {TEXT.GLUTEN}
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
                <InputLabel id="menuTypesLabel">{TEXT.MENU_TYPE}</InputLabel>
                <Select
                  labelId="menuTypesLabel"
                  id="menuTypes"
                  key="menuTypes"
                  name="menuTypes"
                  multiple
                  value={searchSettings.menuTypes}
                  onChange={onSearchSettingMenuTypeUpdate}
                  input={<OutlinedInput fullWidth label={TEXT.MENU_TYPE} />}
                  renderValue={(selected) => {
                    let selectedValues = selected as unknown as string[];
                    let textArray = selectedValues.map(
                      (value) => TEXT.MENU_TYPES[value]
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
                          <ListItemText primary={TEXT.MENU_TYPES[menuType]} />
                        </MenuItem>
                      )
                  )}
                </Select>
              </FormControl>
            </Grid>
            {/* Ideal für Outdoorküche */}
            <Grid item xs={12} sm={12} md={4}>
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
                      {TEXT.OUTDOOR_KITCHEN_SUITABLE}
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
              {TEXT.BUTTON_CREATE_RECIPE}
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
                          tooltip: TEXT.TOOLTIP_PRIVATE_RECIPE,
                          cssProperty: "cardRibbon  cardRibbon--red",
                          icon: <LockIcon fontSize="small" />,
                        }
                      : recipe.type === RecipeType.variant
                      ? {
                          tooltip: TEXT.TOOLTIP_VARIANT_RECIPE,
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
                  {TEXT.NO_RECIPE_FOUND}
                </Typography>

                <Typography align="center" paragraph>
                  {TEXT.CREATE_A_NEW_ONE}
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
const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(RecipesPage);

export { RecipeSearch };
