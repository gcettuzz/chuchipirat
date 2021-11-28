import React, { useReducer } from "react";
import { compose } from "recompose";
import { useHistory } from "react-router";
import { useTheme } from "@material-ui/core/styles";

import useMediaQuery from "@material-ui/core/useMediaQuery";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";

import * as ROUTES from "../../constants/routes";
import * as ACTIONS from "../../constants/actions";
import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";
import RecipeSearchDrawer from "../Recipe/recipeDrawer";
import RecipeCard from "../Recipe/recipeCard";

import Utils from "../Shared/utils.class";
import Product from "../Product/product.class";
import Recipe from "../Recipe/recipe.class";

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
  PRODUCTS_FETCH_INIT: "PRODUCTS_FETCH_INIT",
  PRODUCTS_FETCH_SUCCESS: "PRODUCTS_FETCH_SUCCESS",
  PRODUCT_TRACE_START: "PRODUCT_TRACE_START",
  PRODUCT_TRACE_FINISHED: "PRODUCT_TRACE_FINISHED",
  PRODUCT_TRACE_CLEAR: "PRODUCT_TRACE_CLEAR",
  RECIPES_FETCH_SUCCESS: "RECIPES_FETCH_SUCCESS",
  RECIPE_TRACE_START: "RECIPE_TRACE_START",
  RECIPE_TRACE_FINISHED: "RECIPE_TRACE_FINISHED",
  RECIPE_TRACE_CLEAR: "RECIPE_TRACE_CLEAR",
  SNACKBAR_CLOSE: "SNACKBAR_CLOSE",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const whereUsedReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.PRODUCTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS:
      // Produkte geholt
      return {
        ...state,
        products: action.payload,
        isLoading: false,
      };
    case REDUCER_ACTIONS.RECIPES_FETCH_SUCCESS:
      //Rezepte geholt
      return {
        ...state,
        recipes: action.payload,
        isLoading: false,
      };
    case REDUCER_ACTIONS.PRODUCT_TRACE_START:
      // Ladebalken anzeigen
      return {
        ...state,
        isTracing: true,
      };
    case REDUCER_ACTIONS.PRODUCT_TRACE_FINISHED:
      return {
        ...state,
        data: { ...state.data, product: action.payload },
        isTracing: false,
        isError: false,
      };
    case REDUCER_ACTIONS.PRODUCT_TRACE_CLEAR:
      return {
        ...state,
        data: { ...state.data, product: [] },
        isTracing: false,
        isError: false,
      };
    case REDUCER_ACTIONS.RECIPE_TRACE_START:
      // Ladebalken anzeigen
      return {
        ...state,
        isTracing: true,
      };
    case REDUCER_ACTIONS.RECIPE_TRACE_FINISHED:
      return {
        ...state,
        data: { ...state.data, recipe: action.payload },
        isTracing: false,
        isError: false,
      };
    case REDUCER_ACTIONS.RECIPE_TRACE_CLEAR:
      return {
        ...state,
        data: { ...state.data, recipe: [] },
        isTracing: false,
        isError: false,
      };
    case REDUCER_ACTIONS.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isError: true,
        isTracing: false,
        error: action.payload,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

const TRACE_TYPE = {
  PRODUCT: "product",
  RECIPE: "recipe",
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const WhereUsedPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <WhereUsedBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const WhereUsedBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [whereUsed, dispatchWhereUsed] = React.useReducer(whereUsedReducer, {
    data: {},
    products: [],
    recipes: [],
    isError: false,
    isLoading: false,
    isTracing: false,
    error: {},
    snackbar: { open: false, severity: "success", message: "" },
  });

  const [tabValue, setTabValue] = React.useState(0);

  /* ------------------------------------------
  // Produkte, Rezepte lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (whereUsed.products.length === 0) {
      dispatchWhereUsed({
        type: REDUCER_ACTIONS.PRODUCTS_FETCH_INIT,
      });
      Product.getAllProducts({ firebase: firebase, onlyUsable: false })
        .then((result) => {
          dispatchWhereUsed({
            type: REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          console.error(error);
          dispatchWhereUsed({
            type: REDUCER_ACTIONS.GENERIC_FAILURE,
            error: error,
          });
        });
    }
    if (whereUsed.recipes.length === 0) {
      Recipe.getRecipes({ firebase: firebase, authUser: authUser })
        .then((result) => {
          // Object in Array umwandeln
          let recipes = [];
          Object.keys(result).forEach((uid) => {
            recipes.push({
              uid: uid,
              name: result[uid].name,
              pictureSrc: result[uid].pictureSrc,
              tags: result[uid].tags,
            });
          });

          recipes = Utils.sortArrayWithObjectByText({
            list: recipes,
            attributeName: "name",
          });

          dispatchWhereUsed({
            type: REDUCER_ACTIONS.RECIPES_FETCH_SUCCESS,
            payload: recipes,
          });
        })
        .catch((error) => {
          dispatchWhereUsed({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    }
  }, []);

  /* ------------------------------------------
	// Tab wechseln
	// ------------------------------------------ */
  const onTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  /* ------------------------------------------
  // Trace starten
  // ------------------------------------------ */
  const onTrace = async ({ type, uid }) => {
    switch (type) {
      case TRACE_TYPE.PRODUCT:
        dispatchWhereUsed({ type: REDUCER_ACTIONS.PRODUCT_TRACE_START });
        Product.traceProduct({
          firebase: firebase,
          uid: uid,
          traceListener: productTraceListener,
        }).catch((error) => {
          dispatchWhereUsed({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
        break;
      case TRACE_TYPE.RECIPE:
        dispatchWhereUsed({ type: REDUCER_ACTIONS.RECIPE_TRACE_START });
        Recipe.traceRecipe({
          firebase: firebase,
          uid: uid,
          traceListener: recipeTraceListener,
        }).catch((error) => {
          dispatchWhereUsed({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
        break;
    }
  };
  /* ------------------------------------------
  // Listener für Produkt Trace
  // ------------------------------------------ */
  const productTraceListener = (snapshot) => {
    // Werte setzen, wenn durch
    if (snapshot?.done) {
      dispatchWhereUsed({
        type: REDUCER_ACTIONS.PRODUCT_TRACE_FINISHED,
        payload: snapshot,
      });
    }
  };
  /* ------------------------------------------
   // Listener für Recipe Trace
   // ------------------------------------------ */
  const recipeTraceListener = (snapshot) => {
    // Werte setzen, wenn durch
    if (snapshot?.done) {
      dispatchWhereUsed({
        type: REDUCER_ACTIONS.RECIPE_TRACE_FINISHED,
        payload: snapshot,
      });
    }
  };

  /* ------------------------------------------
  // Snackbar schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatchWhereUsed({
      type: REDUCER_ACTIONS.SNACKBAR_CLOSE,
    });
  };
  /* ------------------------------------------
  // Liste mit Dokumente löschen
  // ------------------------------------------ */
  const clearDocumentList = ({ type }) => {
    switch (type) {
      case TRACE_TYPE.PRODUCT:
        dispatchWhereUsed({ type: REDUCER_ACTIONS.PRODUCT_TRACE_CLEAR });
        break;
      case TRACE_TYPE.RECIPE:
        dispatchWhereUsed({ type: REDUCER_ACTIONS.RECIPE_TRACE_CLEAR });
        break;
    }
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT.PAGE_TITLE_ADMIN_WHERE_USED}
        subTitle={TEXT.PAGE_SUBTITLE_ADMIN_WHERE_USED}
      />

      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={whereUsed.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid container spacing={2}>
          {whereUsed.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={whereUsed.error}
                messageTitle={TEXT.ALERT_TITLE_UUPS}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Tabs
              className={classes.tabs}
              value={tabValue}
              onChange={onTabChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label={TEXT.PRODUCT} />
              <Tab label={TEXT.RECIPE} />
            </Tabs>
          </Grid>
          {tabValue === 0 && (
            <Grid item xs={12}>
              <ProductPanel
                whereUsed={whereUsed}
                products={whereUsed.products}
                onTrace={onTrace}
                clearTraceList={clearDocumentList}
              />
            </Grid>
          )}
          {tabValue === 1 && (
            <Grid item xs={12}>
              <RecipePanel
                whereUsed={whereUsed}
                recipes={whereUsed.recipes}
                onTrace={onTrace}
                clearTraceList={clearDocumentList}
              />
            </Grid>
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Panel Produkt =========================
// =================================================================== */
const ProductPanel = ({ whereUsed, products, onTrace, clearTraceList }) => {
  const classes = useStyles();

  const [product, setProduct] = React.useState(null);
  /* ------------------------------------------
  // Feldänderung
  // ------------------------------------------ */
  const onFieldChange = (event, newValue, action) => {
    setProduct(newValue);
    clearTraceList({ type: TRACE_TYPE.PRODUCT });
  };
  return (
    <Card className={classes.card} key={"cardProduct"}>
      <CardContent className={classes.cardContent} key={"cardContentProduct"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PRODUCT}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              key={"product"}
              id={"product"}
              value={product}
              options={products}
              autoSelect={!product}
              autoHighlight
              getOptionLabel={(option) => {
                if (typeof option === "string") {
                  return option;
                }
                if (option.inputValue) {
                  return option.inputValue;
                }
                return option.name;
              }}
              onChange={onFieldChange}
              fullWidth
              renderOption={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={TEXT.FIELD_INGREDIENT}
                  size="small"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              disabled={!product?.uid}
              fullWidth
              variant="contained"
              color="primary"
              onClick={() =>
                onTrace({ type: TRACE_TYPE.PRODUCT, uid: product.uid })
              }
              component="span"
            >
              {TEXT.BUTTON_TRACE}
            </Button>
          </Grid>
          {whereUsed.isTracing && (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          )}
          {whereUsed.data?.product?.documentList && (
            <React.Fragment>
              <Grid item xs={12}>
                <List
                  subheader={
                    <ListSubheader component="div" id="subheader-product-trace">
                      {TEXT.TRACE_RESULT}
                    </ListSubheader>
                  }
                >
                  {whereUsed.data.product.documentList.map(
                    (document, counter) => (
                      <ListItem divider key={"listItem_" + counter}>
                        <ListItemText
                          primary={document.name}
                          secondary={document.document}
                        />
                      </ListItem>
                    )
                  )}
                </List>
              </Grid>
            </React.Fragment>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ========================== Rezept Produkt =========================
// =================================================================== */
const RecipePanel = ({ whereUsed, onTrace, clearTraceList }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { push } = useHistory();

  const [recipeSearchDrawer, setRecipeSearchDrawer] = React.useState({
    anchor: useMediaQuery(theme.breakpoints.down("xs"), { noSsr: true })
      ? "bottom"
      : "right",
    open: false,
  });
  const [recipeToTrace, setRecipeToTrace] = React.useState();

  /* ------------------------------------------
  // Drawer öffnen
  // ------------------------------------------ */
  const onRecipeSearch = () => {
    setRecipeSearchDrawer({ ...recipeSearchDrawer, open: true });
  };

  /* ------------------------------------------
  // Rezept anzeigen 
  // ------------------------------------------ */
  const onRecipeShow = (event, recipe) => {
    push({
      pathname: `${ROUTES.RECIPE}/${recipe.uid}`,
      state: {
        action: ACTIONS.VIEW,
        recipeName: recipe.name,
        recipePictureSrc: recipe.pictureSrc,
      },
    });
  };
  /* ------------------------------------------
  // Rezept hinzufügen - PopUp öffnen 
  // ------------------------------------------ */
  const onRecipeAdd = (event, recipe) => {
    setRecipeToTrace(recipe);
    clearTraceList({ type: TRACE_TYPE.RECIPE });
    setRecipeSearchDrawer({ ...recipeSearchDrawer, open: false });
  };
  /* ------------------------------------------
  // Rezept-Such-Drawer
  // ------------------------------------------ */
  const toggleRecipeSearchDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setRecipeSearchDrawer({ ...recipeSearchDrawer, open: open });
  };

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button
            fullWidth
            color="primary"
            onClick={onRecipeSearch}
            component="span"
          >
            {TEXT.BUTTON_CHOOSE_RECIPE}
          </Button>
        </Grid>
        {recipeToTrace && (
          <Grid item xs={12}>
            <RecipeCard recipe={recipeToTrace} />
          </Grid>
        )}
        <Grid item xs={12}>
          <Button
            disabled={!recipeToTrace}
            fullWidth
            variant="contained"
            color="primary"
            onClick={() =>
              onTrace({ type: TRACE_TYPE.RECIPE, uid: recipeToTrace.uid })
            }
            component="span"
          >
            {TEXT.BUTTON_TRACE}
          </Button>
        </Grid>
        {whereUsed.isTracing && (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        )}

        {whereUsed.data?.recipe?.documentList && (
          <Grid item xs={12}>
            <Card className={classes.card} key={"cardRecipe"}>
              <CardContent
                className={classes.cardContent}
                key={"cardContentRecipe"}
              >
                <Grid item xs={12}>
                  <List
                    subheader={
                      <ListSubheader
                        component="div"
                        id="subheader-recipe-trace"
                      >
                        {TEXT.TRACE_RESULT}
                      </ListSubheader>
                    }
                  >
                    {whereUsed.data.recipe.documentList.map(
                      (document, counter) => (
                        <ListItem divider key={"listItem_" + counter}>
                          <ListItemText
                            primary={document.name}
                            secondary={document.document}
                          />
                        </ListItem>
                      )
                    )}
                  </List>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
      {whereUsed?.recipes && (
        <RecipeSearchDrawer
          allRecipes={whereUsed.recipes}
          drawerState={recipeSearchDrawer}
          toggleRecipeSearch={toggleRecipeSearchDrawer}
          onRecipeShow={onRecipeShow}
          onRecipeAdd={onRecipeAdd}
          onRecipeAddButtonText={TEXT.BUTTON_ADD}
        />
      )}
    </React.Fragment>
  );
};
const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(WhereUsedPage);
