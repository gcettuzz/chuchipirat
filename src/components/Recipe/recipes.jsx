import React from "react";
import { compose } from "recompose";

import { useHistory } from "react-router";

import CssBaseline from "@material-ui/core/CssBaseline";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import Fab from "@material-ui/core/Fab";
import Button from "@material-ui/core/Button";
// import { Alert, AlertTitle } from "@material-ui/lab";

import AddIcon from "@material-ui/icons/Add";

import * as ROUTES from "../../constants/routes";
import * as ACTIONS from "../../constants/actions";
import * as TEXT from "../../constants/text";
import * as DEFAULT_VALUES from "../../constants/defaultValues";

import useStyles from "../../constants/styles";

import Recipe from "./recipe.class";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import SearchInputWithButton from "../Shared/searchInputWithButton";
import LoadingIndicator from "../Shared/loadingIndicator";
import RecipeCard from "./recipeCard";
import AlertMessage from "../Shared/AlertMessage";

import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const REDUCER_ACTIONS = {
  RECIPES_FETCH_INIT: "RECIPES_FETCH_INIT",
  RECIPES_FETCH_SUCCESS: "RECIPES_FETCH_SUCCESS",
  RECIPES_FETCH_PAGINATION: "RECIPES_FETCH_PAGINATION",
  RECIPES_FETCH_ERROR: "RECIPES_FETCH_ERROR",
};

const recipesReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.RECIPES_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.RECIPES_FETCH_SUCCESS:
      // Resultat setzen, Wenn die Resultatemenge gleich gross ist
      // wie die Anzahl Defaultwerte, gibt es wohl noch mehr Resultate
      // somit ist "showLoadMore" wahr (Button um weitere Einträge) zu
      // laden
      return {
        ...state,
        data: action.payload,
        error: null,
        isLoading: false,
        showLoadMore: action.payload.length === DEFAULT_VALUES.RECIPES_SEARCH,
        searchExecuted: true,
      };
    case REDUCER_ACTIONS.RECIPES_FETCH_PAGINATION:
      return {
        ...state,
        data: state.data.concat(action.payload),
        error: null,
        isLoading: false,
        showLoadMore: action.payload.length === DEFAULT_VALUES.RECIPES_SEARCH,
        searchExecuted: true,
      };
    case REDUCER_ACTIONS.RECIPES_FETCH_ERROR:
      return {
        ...state,
        error: action.error,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const RecipesPage = (props) => {
  const classes = useStyles();
  const { push } = useHistory();

  const firebase = props.firebase;

  /* ------------------------------------------
  // Neues Rezept anlegen
  // ------------------------------------------ */
  const onNewClick = () => {
    push({
      pathname: ROUTES.RECIPE,
      state: { action: ACTIONS.NEW },
    });
  };
  /* ------------------------------------------
  // Klick auf Rezept-Karte
  // ------------------------------------------ */
  const onCardClick = (event, recipe) => {
    // let pressedButton = event.currentTarget.id.split("_");
    push({
      pathname: `${ROUTES.RECIPE}/${recipe.uid}`,
      state: {
        action: ACTIONS.VIEW,
        recipeHead: recipe,
      },
    });
  };

  return (
    <AuthUserContext.Consumer>
      {(authUser) => (
        <React.Fragment>
          <CssBaseline />
          {/*===== HEADER ===== */}
          <PageTitle
            title={TEXT.PAGE_TITLE_RECIPES}
            subTitle={TEXT.PAGE_SUBTITLE_RECIPES}
          />
          <ButtonRow
            key="buttons_create"
            buttons={[
              {
                id: "new",
                hero: true,
                label: TEXT.BUTTON_CREATE_RECIPE,
                variant: "outlined",
                color: "primary",
                visible: true,
                onClick: onNewClick,
              },
            ]}
          />
          {/* ===== BODY ===== */}
          <Container
            className={classes.container}
            component="main"
            maxWidth="md"
          >
            <RecipeSearch
              onNewClick={onNewClick}
              cardActions={[
                { key: "show", name: TEXT.BUTTON_SHOW, onClick: onCardClick },
              ]}
              firebase={firebase}
            />
          </Container>
        </React.Fragment>
      )}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// ============================ Rezept Suche =========================
// =================================================================== */
const RecipeSearch = ({
  onNewClick,
  cardActions,
  firebase,
  embededMode = false,
}) => {
  const [recipes, dispatchRecipes] = React.useReducer(recipesReducer, {
    data: [],
    isLoading: false,
    error: null,
    searchExecuted: false,
    showLoadMore: false,
  });
  const [searchString, setSearchString] = React.useState("");

  /* ------------------------------------------
  // Rezepte suchen
  // ------------------------------------------ */
  const onSearch = (event) => {
    // DB Aufruf
    Recipe.searchRecipes({ firebase: firebase, searchString: searchString })
      .then((result) => {
        dispatchRecipes({
          type: REDUCER_ACTIONS.RECIPES_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        dispatchRecipes({
          type: REDUCER_ACTIONS.RECIPES_FETCH_ERROR,
          error: error,
        });
      });
    event.preventDefault();
  };
  /* ------------------------------------------
  // Weitere Rezepte anzeigen - Pagination
  // ------------------------------------------ */
  const onRecipePagination = (event) => {
    Recipe.searchRecipes({
      firebase: firebase,
      searchString: searchString,
      lastPaginationName: recipes.data[recipes.data.length - 1].name,
    })
      .then((result) => {
        dispatchRecipes({
          type: REDUCER_ACTIONS.RECIPES_FETCH_PAGINATION,
          payload: result,
        });
      })
      .catch((error) => {
        dispatchRecipes({
          type: REDUCER_ACTIONS.RECIPES_FETCH_ERROR,
          error: error,
        });
      });
    event.preventDefault();
  };
  /* ------------------------------------------
  // Suchfeld clearen
  // ------------------------------------------ */
  const onSearchClear = () => {
    setSearchString("");
  };
  /* ------------------------------------------
  // Suchwert ändern - onChange
  // ------------------------------------------ */
  const onSearchChange = (event) => {
    setSearchString(event.target.value);
  };

  return (
    <React.Fragment>
      <SearchInputWithButton
        id="recipeSearch"
        label={TEXT.BUTTON_SEARCH}
        value={searchString}
        onInputChange={onSearchChange}
        onInputClear={onSearchClear}
        onSearch={onSearch}
        isFocused={true}
      />
      {/* Prüfen ob Loading */}
      <Grid container spacing={2}>
        {recipes.isLoading && (
          <Grid item key={"loadingIndicator"} xs={12}>
            <LoadingIndicator />
          </Grid>
        )}
        {recipes.error && (
          <Grid item xs={12}>
            <AlertMessage
              error={recipes.error}
              severity="error"
              messageTitle={TEXT.ALERT_TITLE_MUTINY_ON_THE_HIGH_SEAS}
            />
          </Grid>
        )}
        {recipes.data.map((recipe) => (
          <Grid
            item
            key={"recipe_" + recipe.uid}
            xs={12}
            sm={embededMode ? 12 : 6}
            md={embededMode ? 6 : 4}
            lg={embededMode ? 4 : 3}
            xl={embededMode ? 3 : 2}
          >
            <RecipeCard
              key={"recipe_card_" + recipe.uid}
              recipe={recipe}
              // name={recipe.name}
              // pictureSrc={recipe.pictureSrc}
              cardActions={cardActions}
            />
          </Grid>
        ))}
        {/* Button für Pagination */}
        {recipes.showLoadMore && (
          <Grid container key={"loadMore"} justify="center">
            <Button onClick={onRecipePagination}>
              {TEXT.BUTTON_LOAD_MORE_RECIPES}
            </Button>
          </Grid>
        )}
        {/* Keine Rezepte gefunden --> Neues Erfassen? */}
        {recipes.searchExecuted && recipes.data.length === 0 && (
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
            {/* <div className={classes.heroButtons}> */}
            <Grid container spacing={2} justify="center">
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
            {/* </div> */}
          </Grid>
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
