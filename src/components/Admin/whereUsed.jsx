import React, { useReducer } from "react";
import { compose } from "recompose";

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

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";

import Product from "../Product/product.class";
import Recipe from "../Recipe/recipe.class";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import Feed from "../Shared/feed.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const REDUCER_ACTIONS = {
  PRODUCTS_FETCH_INIT: "PRODUCTS_FETCH_INIT",
  PRODUCTS_FETCH_SUCCESS: "PRODUCTS_FETCH_SUCCESS",
  PRODUCT_TRACE_START: "PRODUCT_TRACE_START",
  PRODUCT_TRACE_FINISHED: "PRODUCT_TRACE_FINISHED",
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
      // Produkte speichern
      return {
        ...state,
        products: action.payload,
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
  const [productListener, setProductListener] = React.useState();

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
        })
          .then((listener) => {
            setProductListener(listener);
          })
          .catch((error) => {
            dispatchWhereUsed({
              type: REDUCER_ACTIONS.GENERIC_ERROR,
              payload: error,
            });
          });
        break;
      case TRACE_TYPE.RECIPE:
        alert(uid);
        break;
    }
  };
  /* ------------------------------------------
  // Listener für Produkt Trace
  // ------------------------------------------ */
  const productTraceListener = (snapshot) => {
    console.log(snapshot);
    // Werte setzen, wenn durch
    if (snapshot?.done) {
      dispatchWhereUsed({
        type: REDUCER_ACTIONS.PRODUCT_TRACE_FINISHED,
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
              />
            </Grid>
          )}
          {tabValue === 1 && (
            <Grid item xs={12}>
              <RecipePanel />
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
const ProductPanel = ({ whereUsed, products, onTrace }) => {
  const classes = useStyles();

  const [product, setProduct] = React.useState(null);
  /* ------------------------------------------
  // Feldänderung
  // ------------------------------------------ */
  const onFieldChange = (event, newValue, action) => {
    setProduct(newValue);
  };
  console.log(whereUsed.data);
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
                    <ListSubheader component="div" id="nested-list-subheader">
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
const RecipePanel = () => {
  const classes = useStyles();

  /* ------------------------------------------
  // Drawer öffnen
  // ------------------------------------------ */
  const onRecipeSearch = () => {
    {
      /* TODO: Drawer übernehmen */
    }
  };

  return (
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
      <Grid item xs={12}>
        {/* TODO: Recipe Card */}
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.card} key={"cardRecipe"}>
          <CardContent
            className={classes.cardContent}
            key={"cardContentRecipe"}
          >
            <Typography gutterBottom={true} variant="h5" component="h2">
              {TEXT.RECIPE}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(WhereUsedPage);
