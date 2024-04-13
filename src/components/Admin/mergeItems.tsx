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
  MERGE_ITEM_EXPLANATION as TEXT_MERGE_ITEM_EXPLANATION,
  CHANGED_DOCUMENTS as TEXT_CHANGED_DOCUMENTS,
  MERGE_ERROR_SAME_ITEMS as TEXT_MERGE_ERROR_SAME_ITEMS,
  TIME_TO_CLEAN_UP as TEXT_TIME_TO_CLEAN_UP,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  MERGE_PRODUCT_SELECTION as TEXT_MERGE_PRODUCT_SELECTION,
  MERGE_MATERIAL_SELECTION as TEXT_MERGE_MATERIAL_SELECTION,
  MERGE_ITEMS as TEXT_MERGE_ITEMS,
  LOG as TEXT_LOG,
  PRODUCT as TEXT_PRODUCT,
  PRODUCTS as TEXT_PRODUCTS,
  MATERIAL as TEXT_MATERIAL,
  MATERIALS as TEXT_MATERIALS,
  MATERIAL_TYPE_KEY_TEXT as TEXT_MATERIAL_TYPE_KEY_TEXT,
  UID as TEXT_UID,
  NAME as TEXT_NAME,
  DEPARTMENT as TEXT_DEPARTMENT,
  SHOPPING_UNIT as TEXT_SHOPPING_UNIT,
  DIET_TYPES as TEXT_DIET_TYPES,
  ALLERGEN_KEY_TEXT as TEXT_ALLERGEN_KEY_TEXT,
  RESTRICTIONS as TEXT_RESTRICTIONS,
  ALLERGENS as TEXT_ALLERGENS,
  TYPE as TEXT_TYPE,
} from "../../constants/text";
import {Role} from "../../constants/roles";

import Product, {MergeProductsCallbackDocument} from "../Product/product.class";

import {withFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import ProductAutocomplete from "../Product/productAutocomplete";
import {ListItemText, Tab, Tabs, useTheme} from "@material-ui/core";
import {
  STORAGE_OBJECT_PROPERTY,
  SessionStorageHandler,
} from "../Firebase/Db/sessionStorageHandler.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {CustomRouterProps} from "../Shared/global.interface";
import Material, {
  MergeMaterialsCallbackDocument,
} from "../Material/material.class";
import MaterialAutocomplete from "../Material/materialAutocomplete";
import {FormListItem} from "../Shared/formListItem";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  PRODUCTS_FETCH_INIT,
  PRODUCTS_FETCH_SUCCESS,
  PRODUCTS_CHANGE_PRODUCT,
  PRODUCT_MERGE_START,
  PRODUCT_MERGE_FINISHED,
  MATERIALS_FETCH_INIT,
  MATERIALS_FETCH_SUCCESS,
  MATERIALS_CHANGE_MATERIAL,
  MATERIAL_MERGE_START,
  MATERIAL_MERGE_FINISHED,
  CLEAR_MERGE_PROTOCOL,
  GENERIC_ERROR,
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  products: Product[];
  materials: Material[];
  product_A: {uid: ""; name: ""}; // muss so heissen, kommt so aus dem AutoComplete
  product_B: {uid: ""; name: ""};
  material_A: {uid: ""; name: ""};
  material_B: {uid: ""; name: ""};
  mergeProtocol:
    | MergeProductsCallbackDocument
    | MergeMaterialsCallbackDocument
    | null;
  isLoading: boolean;
  isMerging: boolean;
  error: Error | null;
  snackbar: {open: false; severity: "success"; message: ""};
};

const inititialState: State = {
  products: [],
  materials: [],
  product_A: {uid: "", name: ""},
  product_B: {uid: "", name: ""},
  material_A: {uid: "", name: ""},
  material_B: {uid: "", name: ""},
  mergeProtocol: null,
  isLoading: false,
  isMerging: false,
  error: null,
  snackbar: {open: false, severity: "success", message: ""},
};

enum TabValue {
  products,
  materials,
}

const mergeProductsReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.PRODUCTS_FETCH_INIT:
    case ReducerActions.MATERIALS_FETCH_INIT:
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
    case ReducerActions.MATERIALS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        materials: action.payload as Material[],
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
    case ReducerActions.MATERIALS_CHANGE_MATERIAL: {
      let material;
      if (!action.payload.value) {
        material = {uid: "", name: ""};
      } else {
        material = {
          uid: action.payload.value.uid,
          name: action.payload.value.name,
        };
      }

      return {
        ...state,
        [action.payload.field]: material,
        error: null,
      };
    }
    case ReducerActions.PRODUCT_MERGE_START:
    case ReducerActions.MATERIAL_MERGE_START:
      return {
        ...state,
        mergeProtocol: null,
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
        mergeProtocol: action.payload as MergeProductsCallbackDocument,
        products: products,
        product_A: {uid: "", name: ""},
        product_B: {uid: "", name: ""},
        isMerging: false,
        error: null,
      };
    }
    case ReducerActions.MATERIAL_MERGE_FINISHED: {
      const materials = state.materials.filter(
        (material) => material.uid !== state.material_A.uid
      );
      // Den Session-Storage auch anpassen
      SessionStorageHandler.deleteDocument({
        storageObjectProperty: STORAGE_OBJECT_PROPERTY.MATERIALS,
        documentUid: "materials",
        prefix: "",
      });
      return {
        ...state,
        mergeProtocol: action.payload as MergeMaterialsCallbackDocument,
        material_A: {uid: "", name: ""},
        material_B: {uid: "", name: ""},
        materials: materials,
        isMerging: false,
        error: null,
      };
    }
    case ReducerActions.CLEAR_MERGE_PROTOCOL:
      return {
        ...state,
        mergeProtocol: null,
      };
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
const MegeItemsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <MergeItemsBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const MergeItemsBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const theme = useTheme();

  const [state, dispatch] = React.useReducer(
    mergeProductsReducer,
    inititialState
  );
  const [tabValue, setTabValue] = React.useState(TabValue.products);

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatch({
      type: ReducerActions.PRODUCTS_FETCH_INIT,
      payload: {},
    });

    Product.getAllProducts({
      firebase: firebase,
      onlyUsable: true,
      withDepartmentName: true,
    })
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
  React.useEffect(() => {
    dispatch({
      type: ReducerActions.MATERIALS_FETCH_INIT,
      payload: {},
    });

    Material.getAllMaterials({firebase: firebase, onlyUsable: true})
      .then((result) => {
        dispatch({
          type: ReducerActions.MATERIALS_FETCH_SUCCESS,
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
  const onChangeMaterialSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Material | null,
    action?: AutocompleteChangeReason
  ) => {
    if (action == "blur") {
      return;
    }

    dispatch({
      type: ReducerActions.MATERIALS_CHANGE_MATERIAL,
      payload: {
        field: event.target.id.split("-")[0],
        value: newValue,
      },
    });
  };
  /* ------------------------------------------
  // Merge starten (CloudFunction)
  // ------------------------------------------ */
  const onMergeProducts = () => {
    if (state.product_A.uid === state.product_B.uid) {
      dispatch({
        type: ReducerActions.GENERIC_ERROR,
        payload: {message: TEXT_MERGE_ERROR_SAME_ITEMS(TEXT_PRODUCT)},
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
  const onMegerMaterials = () => {
    if (state.material_A.uid === state.material_B.uid) {
      dispatch({
        type: ReducerActions.GENERIC_ERROR,
        payload: {message: TEXT_MERGE_ERROR_SAME_ITEMS(TEXT_MATERIAL)},
      });
      return;
    }
    dispatch({type: ReducerActions.MATERIAL_MERGE_START, payload: {}});
    Material.mergeMaterials({
      firebase: firebase,
      materialToReplace: state.material_A,
      materialToReplaceWith: state.material_B,
      authUser: authUser as AuthUser,
      callbackDone: (mergeResult) => {
        console.log(mergeResult);
        dispatch({
          type: ReducerActions.MATERIAL_MERGE_FINISHED,
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
	// Tab-Handler
	// ------------------------------------------ */
  const handleTabChange = (
    event: React.ChangeEvent<Record<string, unknown>>,
    newValue: number
  ) => {
    setTabValue(newValue);
    dispatch({type: ReducerActions.CLEAR_MERGE_PROTOCOL, payload: {}});
  };
  console.log(state);
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_MERGE_ITEMS} subTitle={TEXT_TIME_TO_CLEAN_UP} />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {state.error && (
          <AlertMessage
            error={state.error!}
            messageTitle={TEXT_ALERT_TITLE_UUPS}
          />
        )}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
          style={{marginBottom: theme.spacing(2)}}
        >
          <Tab label={TEXT_PRODUCTS} />
          <Tab label={TEXT_MATERIALS} />
        </Tabs>

        {tabValue === TabValue.products ? (
          <PanelMergeProducts
            mergeItems={state}
            onChangeProductSelection={onChangeProductSelection}
            onMergeProducts={onMergeProducts}
            mergeProtocol={state.mergeProtocol as MergeProductsCallbackDocument}
          />
        ) : (
          <PanelMergeMaterials
            mergeItems={state}
            onChangeMaterialSelection={onChangeMaterialSelection}
            onMergeMaterials={onMegerMaterials}
            mergeProtocol={
              state.mergeProtocol as MergeMaterialsCallbackDocument
            }
          />
        )}
      </Container>
    </React.Fragment>
  );
};

/* ===================================================================
// ======================== Merge Product Card =======================
// =================================================================== */
interface PanelMergeProductsProps {
  mergeItems: State;
  onChangeProductSelection: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Product | null,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => void;
  onMergeProducts: () => void;
  mergeProtocol: MergeProductsCallbackDocument | null;
}
const PanelMergeProducts = ({
  mergeItems,
  onChangeProductSelection,
  onMergeProducts,
  mergeProtocol,
}: PanelMergeProductsProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_MERGE_PRODUCT_SELECTION}
        </Typography>
        <Typography gutterBottom={true}>
          {TEXT_MERGE_ITEM_EXPLANATION(TEXT_PRODUCT)}
        </Typography>
        <br />
        <ProductAutocomplete
          componentKey={"A"}
          product={mergeItems.product_A}
          products={mergeItems.products}
          onChange={onChangeProductSelection}
          label={`${TEXT_PRODUCT} A`}
          allowCreateNewProduct={false}
        />

        <ProductDetailList
          productUid={mergeItems.product_A.uid}
          products={mergeItems.products}
        />
        <br />
        <ProductAutocomplete
          componentKey={"B"}
          product={mergeItems.product_B}
          products={mergeItems.products}
          onChange={onChangeProductSelection}
          label={`${TEXT_PRODUCT} B`}
          allowCreateNewProduct={false}
        />
        <ProductDetailList
          productUid={mergeItems.product_B.uid}
          products={mergeItems.products}
        />
        <br />

        {mergeItems.isMerging && (
          <React.Fragment>
            <br />
            <LinearProgress />
          </React.Fragment>
        )}
        <Button
          fullWidth
          disabled={!mergeItems?.product_A?.uid || !mergeItems?.product_B?.uid}
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={onMergeProducts}
        >
          {TEXT_MERGE_ITEMS}
        </Button>
        {mergeProtocol !== null && (
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
                    primary={`${TEXT_PRODUCT} A: ${mergeProtocol
                      .productToReplace.name!}`}
                    secondary={mergeProtocol.productToReplace.uid}
                  />
                </ListItem>
                <ListItem divider key={"listItem_productB"}>
                  <ListItemText
                    primary={`${TEXT_PRODUCT} B: ${mergeProtocol.productToReplaceWith.name}`}
                    secondary={mergeProtocol.productToReplaceWith.uid}
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
                {mergeProtocol.documentList.map((document, counter) => (
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
        )}
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ====================== Detail-Anzeige Produkt =====================
// =================================================================== */
interface ProductDetailListProps {
  productUid: Product["uid"];
  products: Product[];
}

const ProductDetailList = ({products, productUid}: ProductDetailListProps) => {
  const theme = useTheme();
  const product = products.find((product) => product.uid === productUid);

  if (!product) {
    return null;
  }

  return (
    <List dense style={{marginBottom: theme.spacing(2)}}>
      <FormListItem
        key={product.uid + "_uid"}
        id={product.uid + "_uid"}
        value={product.uid}
        label={TEXT_UID}
        displayAsCode={true}
      />
      <FormListItem
        key={product.uid + "_name"}
        id={product.uid + "_name"}
        value={product.name}
        label={TEXT_NAME}
      />
      <FormListItem
        key={product.uid + "_department"}
        id={product.uid + "_department"}
        value={product.department.name}
        label={TEXT_DEPARTMENT}
      />
      <FormListItem
        key={product.uid + "_unit"}
        id={product.uid + "_unit"}
        value={product.shoppingUnit}
        label={TEXT_SHOPPING_UNIT}
      />
      <FormListItem
        key={product.uid + "_diet"}
        id={product.uid + "_diet"}
        value={TEXT_DIET_TYPES[product.dietProperties.diet]}
        label={TEXT_RESTRICTIONS}
      />
      <FormListItem
        key={product.uid + "_allergens"}
        id={product.uid + "_allergens"}
        value={product.dietProperties.allergens
          .map((allergen) => TEXT_ALLERGEN_KEY_TEXT[allergen])
          .join(", ")}
        label={TEXT_ALLERGENS}
      />
    </List>
  );
};
/* ===================================================================
// ======================== Merge Material Card ======================
// =================================================================== */
interface PanelMergeMaterialsProps {
  mergeItems: State;
  onChangeMaterialSelection: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Material | null,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => void;
  onMergeMaterials: () => void;
  mergeProtocol: MergeMaterialsCallbackDocument | null;
}
const PanelMergeMaterials = ({
  mergeItems,
  onChangeMaterialSelection,
  onMergeMaterials,
  mergeProtocol,
}: PanelMergeMaterialsProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_MERGE_MATERIAL_SELECTION}
        </Typography>
        <Typography gutterBottom={true}>
          {TEXT_MERGE_ITEM_EXPLANATION(TEXT_MATERIAL)}
        </Typography>
        <br />
        <MaterialAutocomplete
          componentKey={"A"}
          label={`${TEXT_MATERIAL} A`}
          material={mergeItems.material_A}
          materials={mergeItems.materials}
          allowCreateNewMaterial={false}
          onChange={onChangeMaterialSelection}
          disabled={false}
        />
        <MaterialDetailList
          materialUid={mergeItems.material_A.uid}
          materials={mergeItems.materials}
        />
        <br />

        <MaterialAutocomplete
          componentKey={"B"}
          label={`${TEXT_MATERIAL} B`}
          material={mergeItems.material_B}
          materials={mergeItems.materials}
          allowCreateNewMaterial={false}
          onChange={onChangeMaterialSelection}
          disabled={false}
        />
        <MaterialDetailList
          materialUid={mergeItems.material_B.uid}
          materials={mergeItems.materials}
        />
        <br />
        {mergeItems.isMerging && (
          <React.Fragment>
            <br />
            <LinearProgress />
          </React.Fragment>
        )}
        <Button
          fullWidth
          disabled={
            !mergeItems?.material_A?.uid || !mergeItems?.material_B?.uid
          }
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={onMergeMaterials}
        >
          {TEXT_MERGE_ITEMS}
        </Button>
        {mergeProtocol !== null && (
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
                <ListItem divider key={"listItem_materialA"}>
                  <ListItemText
                    primary={`${TEXT_MATERIAL} A: ${mergeProtocol.materialToReplace.name}`}
                    secondary={mergeProtocol.materialToReplace.uid}
                  />
                </ListItem>
                <ListItem divider key={"listItem_materialB"}>
                  <ListItemText
                    primary={`${TEXT_PRODUCT} B: ${mergeProtocol.materialToReplaceWith.name}`}
                    secondary={mergeProtocol.materialToReplaceWith.uid}
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
                {mergeProtocol.documentList.map((document, counter) => (
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
        )}
      </CardContent>
    </Card>
  );
}; /* ===================================================================
// ====================== Detail-Anzeige Produkt =====================
// =================================================================== */
interface MaterialDetailListProps {
  materialUid: Material["uid"];
  materials: Material[];
}

const MaterialDetailList = ({
  materials,
  materialUid,
}: MaterialDetailListProps) => {
  const theme = useTheme();
  const material = materials.find((material) => material.uid === materialUid);

  if (!material) {
    return null;
  }

  return (
    <List dense style={{marginBottom: theme.spacing(2)}}>
      <FormListItem
        key={material.uid + "_uid"}
        id={material.uid + "_uid"}
        value={material.uid}
        label={TEXT_UID}
        displayAsCode={true}
      />
      <FormListItem
        key={material.uid + "_name"}
        id={material.uid + "_name"}
        value={material.name}
        label={TEXT_NAME}
      />
      <FormListItem
        key={material.uid + "_type"}
        id={material.uid + "_type"}
        value={TEXT_MATERIAL_TYPE_KEY_TEXT[material.type]}
        label={TEXT_TYPE}
      />
    </List>
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
)(MegeItemsPage);
