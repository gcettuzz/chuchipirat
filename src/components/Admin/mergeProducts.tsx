import React from "react";
import {compose} from "react-recompose";

import useStyles from "../../constants/styles";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import {AutocompleteChangeReason} from "@material-ui/lab/Autocomplete";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";

import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";

import {
  MERGE_PRODUCT_EXPLANATION as TEXT_MERGE_PRODUCT_EXPLANATION,
  CHANGED_DOCUMENTS as TEXT_CHANGED_DOCUMENTS,
  MERGE_ERROR_SAME_PRODUCTS as TEXT_MERGE_ERROR_SAME_PRODUCTS,
  TIME_TO_CLEAN_UP as TEXT_TIME_TO_CLEAN_UP,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  MERGE_PRODUCT_SELECTION as TEXT_MERGE_PRODUCT_SELECTION,
  MERGE_PRODUCTS as TEXT_MERGE_PRODUCTS,
  LOG as TEXT_LOG,
  PRODUCT as TEXT_PRODUCT,
} from "../../constants/text";
import {Role} from "../../constants/roles";

import Product, {MergeProductsCallbackDocument} from "../Product/product.class";

import {withFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import ProductAutocomplete from "../Product/productAutocomplete";
import {ListItemText} from "@material-ui/core";
import {
  STORAGE_OBJECT_PROPERTY,
  SessionStorageHandler,
} from "../Firebase/Db/sessionStorageHandler.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {CustomRouterProps} from "../Shared/global.interface";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  PRODUCTS_FETCH_INIT,
  PRODUCTS_FETCH_SUCCESS,
  PRODUCTS_CHANGE_PRODUCT,
  PRODUCT_MERGE_START,
  PRODUCT_MERGE_FINISHED,
  GENERIC_ERROR,
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  products: Product[];
  product_A: {uid: ""; name: ""}; // muss so heissen, kommt so aus dem AutoComplete
  product_B: {uid: ""; name: ""};
  changedFiles: MergeProductsCallbackDocument["documentList"];
  isLoading: boolean;
  isMerging: boolean;
  error: Error | null;
  snackbar: {open: false; severity: "success"; message: ""};
};

const inititialState: State = {
  products: [],
  product_A: {uid: "", name: ""},
  product_B: {uid: "", name: ""},
  changedFiles: [],
  isLoading: false,
  isMerging: false,
  error: null,
  snackbar: {open: false, severity: "success", message: ""},
};

const mergeProductsReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.PRODUCTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.PRODUCTS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        products: action.payload as Product[],
      };
    case ReducerActions.PRODUCTS_CHANGE_PRODUCT: {
      let product;
      if (!action.payload.value) {
        product = {uid: "", name: ""};
      } else {
        product = {
          uid: action.payload.value.uid,
          name: action.payload.value.name,
        };
      }

      return {
        ...state,
        [action.payload.field]: product,
        error: null,
      };
    }
    case ReducerActions.PRODUCT_MERGE_START:
      return {
        ...state,
        isMerging: true,
      };
    case ReducerActions.PRODUCT_MERGE_FINISHED: {
      const products = state.products.filter(
        (product) => product.uid !== state.product_A.uid
      );
      // Den Session-Storage auch anpassen
      SessionStorageHandler.deleteDocument({
        storageObjectProperty: STORAGE_OBJECT_PROPERTY.PRODUCTS,
        documentUid: "products",
        prefix: "",
      });
      return {
        ...state,
        changedFiles: action.payload
          .documentList as MergeProductsCallbackDocument["documentList"],
        products: products,
        isMerging: false,
        error: null,
      };
    }
    case ReducerActions.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isMerging: false,
        error: action.payload as Error,
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
      {(authUser) => <MergeProductsBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const MergeProductsBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [state, dispatch] = React.useReducer(
    mergeProductsReducer,
    inititialState
  );

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatch({
      type: ReducerActions.PRODUCTS_FETCH_INIT,
      payload: {},
    });

    Product.getAllProducts({firebase: firebase, onlyUsable: true})
      .then((result) => {
        dispatch({
          type: ReducerActions.PRODUCTS_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({
          type: ReducerActions.GENERIC_ERROR,
          payload: error,
        });
      });
  }, []);
  /* ------------------------------------------
  // Change im Select-Feld
  // ------------------------------------------ */
  const onChangeProductSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Product | null,
    action?: AutocompleteChangeReason
  ) => {
    if (action == "blur") {
      return;
    }

    dispatch({
      type: ReducerActions.PRODUCTS_CHANGE_PRODUCT,
      payload: {
        field: event.target.id.split("-")[0],
        value: newValue,
      },
    });
  };
  /* ------------------------------------------
  // Merge Prodct starten (CloudFunction)
  // ------------------------------------------ */
  const onMergeProducts = () => {
    if (state.product_A.uid === state.product_B.uid) {
      dispatch({
        type: ReducerActions.GENERIC_ERROR,
        payload: {message: TEXT_MERGE_ERROR_SAME_PRODUCTS},
      });
      return;
    }

    dispatch({type: ReducerActions.PRODUCT_MERGE_START, payload: {}});
    Product.mergeProducts({
      firebase: firebase,
      productToReplace: state.product_A,
      productToReplaceWith: state.product_B,
      authUser: authUser as AuthUser,
      callbackDone: (mergeResult) => {
        dispatch({
          type: ReducerActions.PRODUCT_MERGE_FINISHED,
          payload: mergeResult,
        });
      },
    }).catch((error) => {
      dispatch({
        type: ReducerActions.GENERIC_ERROR,
        payload: error,
      });
    });
  };
  /* ------------------------------------------
  // Listener für Produkt Trace
  // ------------------------------------------ */
  // const productMergeListener = (snapshot) => {
  //   // Werte setzen, wenn durch
  //   if (snapshot?.done) {
  //     dispatch({
  //       type: ReducerActions.PRODUCT_MERGE_FINISHED,
  //       payload: snapshot,
  //     });
  //   }
  // };
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_MERGE_PRODUCTS} subTitle={TEXT_TIME_TO_CLEAN_UP} />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          {state.error && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={state.error!}
                messageTitle={TEXT_ALERT_TITLE_UUPS}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <PanelMergeProducts
              mergeProducts={state}
              onChangeProductSelection={onChangeProductSelection}
              onMergeProducts={onMergeProducts}
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
interface PanelMergeProductsProps {
  mergeProducts: State;
  onChangeProductSelection: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Product | null,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => void;
  onMergeProducts: () => void;
}
const PanelMergeProducts = ({
  mergeProducts,
  onChangeProductSelection,
  onMergeProducts,
}: PanelMergeProductsProps) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_MERGE_PRODUCT_SELECTION}
        </Typography>
        <Typography gutterBottom={true}>
          {TEXT_MERGE_PRODUCT_EXPLANATION}
        </Typography>
        <br />
        <ProductAutocomplete
          componentKey={"A"}
          product={mergeProducts.product_A}
          products={mergeProducts.products}
          onChange={onChangeProductSelection}
          label={`${TEXT_PRODUCT} A`}
        />
        <br />
        <ProductAutocomplete
          componentKey={"B"}
          product={mergeProducts.product_B}
          products={mergeProducts.products}
          onChange={onChangeProductSelection}
          label={`${TEXT_PRODUCT} B`}
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
            !mergeProducts?.product_A?.uid || !mergeProducts?.product_B?.uid
          }
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={onMergeProducts}
        >
          {TEXT_MERGE_PRODUCTS}
        </Button>
        {mergeProducts?.changedFiles?.length > 0 && (
          <React.Fragment>
            <br />
            <Grid item xs={12}>
              <List
                subheader={
                  <ListSubheader component="div" id="subheader-log-result">
                    {TEXT_LOG}
                  </ListSubheader>
                }
              >
                <ListItem divider key={"listItem_productA"}>
                  <ListItemText
                    primary={`${TEXT_PRODUCT} A: ${mergeProducts.product_A.name}`}
                    secondary={mergeProducts.product_A.uid}
                  />
                </ListItem>
                <ListItem divider key={"listItem_productB"}>
                  <ListItemText
                    primary={`${TEXT_PRODUCT} B: ${mergeProducts.product_B.name}`}
                    secondary={mergeProducts.product_B.uid}
                  />
                </ListItem>
              </List>

              <br />
            </Grid>
            <Grid item xs={12}>
              <List
                subheader={
                  <ListSubheader component="div" id="subheader-merge-result">
                    {TEXT_CHANGED_DOCUMENTS}
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

const condition = (authUser: AuthUser | null) =>
  !!authUser &&
  (!!authUser.roles.includes(Role.admin) ||
    !!authUser.roles.includes(Role.communityLeader));

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(MergeProductsPage);
