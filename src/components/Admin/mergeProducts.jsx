import React, { useReducer } from "react";
import { compose } from "recompose";
import { useHistory } from "react-router";
import { useTheme } from "@material-ui/core/styles";

import useStyles from "../../constants/styles";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";

import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import Product from "../Product/product.class";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import { CodeOutlined } from "@material-ui/icons";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const REDUCER_ACTIONS = {
  PRODUCTS_FETCH_INIT: "PRODUCTS_FETCH_INIT",
  PRODUCTS_FETCH_SUCCESS: "PRODUCTS_FETCH_SUCCESS",
  PRODUCTS_CHANGE_PRODUCT: "PRODUCTS_CHANGE_PRODUCT",
  PRODUCT_MERGE_START: "PRODUCT_MERGE_START",
  PRODUCT_MERGE_FINISHED: "PRODUCT_MERGE_FINISHED",
  // PRODUCT_TRACE_START: "PRODUCT_TRACE_START",
  // PRODUCT_TRACE_FINISHED: "PRODUCT_TRACE_FINISHED",
  // PRODUCT_TRACE_CLEAR: "PRODUCT_TRACE_CLEAR",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const mergeProductsReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.PRODUCTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        products: action.payload,
      };
    case REDUCER_ACTIONS.PRODUCTS_CHANGE_PRODUCT:
      let product;
      if (!action.payload) {
        product = new Product({
          uid: null,
          name: null,
          departmentName: null,
          departmentUid: null,
          shoppingUnit: null,
          usable: null,
        });
      } else {
        product = action.payload;
      }

      return {
        ...state,
        ["product" + action.id.toUpperCase()]: product,
        isError: false,
        error: null,
      };
    case REDUCER_ACTIONS.PRODUCT_MERGE_START:
      return {
        ...state,
        isMerging: true,
      };
    case REDUCER_ACTIONS.PRODUCT_MERGE_FINISHED:
      let products = state.products.map(
        (product) => product.uid !== state.productA.uid
      );
      return {
        ...state,
        changedFiles: action.payload.documentList,
        mergedProductA: action.payload.productA,
        mergedProductB: action.payload.productB,
        products: products,
        productA: new Product({
          uid: null,
          name: null,
          departmentName: null,
          departmentUid: null,
          shoppingUnit: null,
          usable: null,
        }),
        productB: new Product({
          uid: null,
          name: null,
          departmentName: null,
          departmentUid: null,
          shoppingUnit: null,
          usable: null,
        }),
        isMerging: false,
        isError: false,
        error: null,
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

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const MergeProductsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <MergeProductsBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const MergeProductsBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [mergeProducts, dispatchMergeProducts] = React.useReducer(
    mergeProductsReducer,
    {
      products: [],
      productA: { uid: "", name: "" },
      productB: { uid: "", name: "" },
      changedFiles: [],
      isError: false,
      isLoading: false,
      isMerging: false,
      error: {},
      snackbar: { open: false, severity: "success", message: "" },
    }
  );

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatchMergeProducts({
      type: REDUCER_ACTIONS.PRODUCTS_FETCH_INIT,
    });

    Product.getAllProducts({ firebase: firebase, onlyUsable: true })
      .then((result) => {
        dispatchMergeProducts({
          type: REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatchMergeProducts({
          type: REDUCER_ACTIONS.GENERIC_FAILURE,
          error: error,
        });
      });
  }, []);
  /* ------------------------------------------
  // Change im Select-Feld
  // ------------------------------------------ */
  const onChangeProductSelection = (event, newValue, action, id) => {
    dispatchMergeProducts({
      type: REDUCER_ACTIONS.PRODUCTS_CHANGE_PRODUCT,
      id: id,
      payload: newValue,
    });
  };
  /* ------------------------------------------
  // Merge Prodct starten (CloudFunction)
  // ------------------------------------------ */
  const onMergeProduct = () => {
    if (mergeProducts.productA.uid === mergeProducts.productB.uid) {
      dispatchMergeProducts({
        type: REDUCER_ACTIONS.GENERIC_ERROR,
        payload: { message: TEXT.MERGE_ERROR_SAME_PRODUCTS },
      });
      return;
    }

    dispatchMergeProducts({ type: REDUCER_ACTIONS.PRODUCT_MERGE_START });
    Product.mergeProducts({
      firebase: firebase,
      productA: mergeProducts.productA,
      productB: mergeProducts.productB,
      authUser: authUser,
      traceListener: productMergeListener,
    }).catch((error) => {
      dispatchMergeProducts({
        type: REDUCER_ACTIONS.GENERIC_ERROR,
        payload: error,
      });
    });
  };
  /* ------------------------------------------
  // Listener für Produkt Trace
  // ------------------------------------------ */
  const productMergeListener = (snapshot) => {
    // Werte setzen, wenn durch
    if (snapshot?.done) {
      dispatchMergeProducts({
        type: REDUCER_ACTIONS.PRODUCT_MERGE_FINISHED,
        payload: snapshot,
      });
    }
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT.PAGE_TITLE_MERGE_PRODUCTS}
        subTitle={TEXT.PAGE_SUBTITLE_MERGE_PRODUCTS}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={mergeProducts.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          {mergeProducts.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={mergeProducts.error}
                messageTitle={TEXT.ALERT_TITLE_UUPS}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <PanelMergeProducts
              mergeProducts={mergeProducts}
              onChangeProductSelection={onChangeProductSelection}
              onMergeProduct={onMergeProduct}
            />
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

/* ===================================================================
// ======================== Merge Product Card =======================
// =================================================================== */
const PanelMergeProducts = ({
  mergeProducts,
  onChangeProductSelection,
  onMergeProduct,
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.MERGE_PRODUCT_SELECTION}
        </Typography>
        <Typography gutterBottom={true}>
          {TEXT.MERGE_PRODUCT_EXPLANATION}
        </Typography>
        {/* <Typography gutterBottom={true} variant="h6" component="h3">
          {TEXT.MERGE_PRODUCT_A}
        </Typography> */}
        <br />
        <ProductSelect
          id={"A"}
          labelText={TEXT.MERGE_PRODUCT_A}
          products={mergeProducts.products}
          selectedProduct={mergeProducts.productA}
          onChangeProductSelection={onChangeProductSelection}
        />
        <br />
        <ProductSelect
          id={"B"}
          labelText={TEXT.MERGE_PRODUCT_B}
          products={mergeProducts.products}
          selectedProduct={mergeProducts.productB}
          onChangeProductSelection={onChangeProductSelection}
        />
        {mergeProducts.isMerging && (
          <React.Fragment>
            <br />
            <LinearProgress />
          </React.Fragment>
        )}
        <Button
          fullWidth
          disabled={
            !mergeProducts?.productA?.uid || !mergeProducts?.productB?.uid
          }
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={onMergeProduct}
        >
          {TEXT.BUTTON_MERGE_PRODUCTS}
        </Button>
        {/* 
        {deleteFeeds.isDeleted && (
          <AlertMessage severity={"success"} body={deleteFeeds.message} />
        )}
        {deleteFeeds.error && (
          <AlertMessage
            error={deleteFeeds.error}
            messageTitle={TEXT.ALERT_TITLE_UUPS}
          />
        )}
         */}
        {mergeProducts?.changedFiles.length > 0 && (
          <React.Fragment>
            <br />
            <Grid item xs={12}>
              <List
                subheader={
                  <ListSubheader component="div" id="subheader-log-result">
                    {TEXT.LOG}
                  </ListSubheader>
                }
              >
                <ListItem divider key={"listItem_productA"}>
                  <ListItemText
                    primary={
                      TEXT.MERGE_PRODUCT_A +
                      ": " +
                      mergeProducts.mergedProductA.name
                    }
                    secondary={mergeProducts.mergedProductA.uid}
                  />
                </ListItem>
                <ListItem divider key={"listItem_productB"}>
                  <ListItemText
                    primary={
                      TEXT.MERGE_PRODUCT_B +
                      ": " +
                      mergeProducts.mergedProductB.name
                    }
                    secondary={mergeProducts.mergedProductB.uid}
                  />
                </ListItem>
              </List>

              {/* <Typography gutterBottom={true} variant="h5" component="h2">
                {TEXT.LOG}
              </Typography>
              <Typography variant="subtitle1">
                {TEXT.MERGE_PRODUCT_A}
              </Typography>
              <Typography variant="body2">
                {mergeProducts.mergedProductA.name} (
                {mergeProducts.mergedProductA.uid})
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                {TEXT.MERGE_PRODUCT_B}
              </Typography>
              <Typography variant="body2">
                {mergeProducts.mergedProductB.name} (
                {mergeProducts.mergedProductB.uid})
              </Typography> */}
              <br />
            </Grid>
            <Grid item xs={12}>
              <List
                subheader={
                  <ListSubheader component="div" id="subheader-merge-result">
                    {TEXT.MERGE_RESULT}
                  </ListSubheader>
                }
              >
                {mergeProducts.changedFiles.map((document, counter) => (
                  <ListItem divider key={"listItem_" + counter}>
                    <ListItemText
                      primary={document.name}
                      secondary={document.document}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </React.Fragment>
        )}{" "}
      </CardContent>
    </Card>
  );
};

/* ===================================================================
// ========================= Produkte Select  ========================
// =================================================================== */
const ProductSelect = ({
  id,
  labelText,
  products,
  selectedProduct,
  onChangeProductSelection,
}) => {
  const classes = useStyles();
  return (
    <Autocomplete
      key={"productSelect_" + id}
      id={"productSelect_" + id}
      value={selectedProduct?.name}
      options={products}
      autoSelect
      autoHighlight
      getOptionSelected={(product) => product?.uid === selectedProduct?.uid}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        if (option.inputValue) {
          return option.inputValue;
        }
        return option.name;
      }}
      onChange={(event, newValue, action) =>
        onChangeProductSelection(event, newValue, action, id)
      }
      fullWidth
      renderInput={(params) => (
        <TextField
          value={selectedProduct?.uid}
          {...params}
          label={labelText}
          size="small"
        />
      )}
    />
  );
};
const condition = (authUser) => !!authUser?.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(MergeProductsPage);
