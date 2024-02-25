import React from "react";
import {compose} from "react-recompose";

import Product from "../Product/product.class";
import Role from "../../constants/roles";
import {withFirebase} from "../Firebase/firebaseContext";
import useStyles from "../../constants/styles";
import PageTitle from "../Shared/pageTitle";

import {
  CONVERT_PRODUCT_TO_MATERIAL as TEXT_CONVERT_PRODUCT_TO_MATERIAL,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  PRODUCT as TEXT_PRODUCT,
  LOG as TEXT_LOG,
  MERGE_PRODUCT_SELECTION as TEXT_MERGE_PRODUCT_SELECTION,
  CONVERT_PRODUCT_TO_MATERIAL_EXPLANATION as TEXT_CONVERT_PRODUCT_TO_MATERIAL_EXPLANATION,
  CHANGED_DOCUMENTS as TEXT_CHANGED_DOCUMENTS,
  MATERIAL_TYPE_CONSUMABLE as TEXT_MATERIAL_TYPE_CONSUMABLE,
  MATERIAL_TYPE_USAGE as TEXT_MATERIAL_TYPE_USAGE,
  MATERIAL_TYPE as TEXT_MATERIAL_TYPE,
} from "../../constants/text";
import {
  Backdrop,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import AlertMessage from "../Shared/AlertMessage";
import ProductAutocomplete from "../Product/productAutocomplete";
import {AutocompleteChangeReason} from "@material-ui/lab";
import Material, {
  ConvertProductToMaterialCallbackDocument,
  MaterialType,
} from "../Material/material.class";
import {
  STORAGE_OBJECT_PROPERTY,
  SessionStorageHandler,
} from "../Firebase/Db/sessionStorageHandler.class";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {CustomRouterProps} from "../Shared/global.interface";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  PRODUCTS_FETCH_INIT,
  PRODUCTS_FETCH_SUCCESS,
  PRODUCT_CONVERT_START,
  PRODUCT_CONVERT_FINISHED,
  PRODUCTS_CHANGE_PRODUCT,
  CHANGE_MATERIAL_TYPE,
  GENERIC_ERROR,
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  products: Product[];
  product: {uid: ""; name: ""};
  materialProperty: {type: Material["type"]};
  changedFiles: ConvertProductToMaterialCallbackDocument["documentList"];
  isLoading: boolean;
  isConverting: boolean;
  error: Error | null;
  snackbar: {open: false; severity: "success"; message: ""};
};

const inititialState: State = {
  products: [],
  product: {uid: "", name: ""},
  materialProperty: {type: MaterialType.none},
  changedFiles: [],
  isLoading: false,
  isConverting: false,
  error: null,
  snackbar: {open: false, severity: "success", message: ""},
};

const convertProductToMaterialReducer = (
  state: State,
  action: DispatchAction
): State => {
  let product: State["product"];
  let products: Product[] = [];
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
    case ReducerActions.PRODUCTS_CHANGE_PRODUCT:
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
        product: product,
        error: null,
      };
    case ReducerActions.CHANGE_MATERIAL_TYPE:
      return {
        ...state,
        materialProperty: {
          type: action.payload.value as unknown as MaterialType,
        },
      };
    case ReducerActions.PRODUCT_CONVERT_START:
      return {...state, isConverting: true};
    case ReducerActions.PRODUCT_CONVERT_FINISHED:
      products = state.products.filter(
        (product) => product.uid !== state.product.uid
      );

      // Den Session-Storage auch anpassen
      SessionStorageHandler.deleteDocument({
        storageObjectProperty: STORAGE_OBJECT_PROPERTY.PRODUCTS,
        documentUid: "products",
        prefix: "",
      });
      SessionStorageHandler.deleteDocument({
        storageObjectProperty: STORAGE_OBJECT_PROPERTY.MATERIALS,
        documentUid: "materials",

        prefix: "",
      });

      return {
        ...state,
        changedFiles: action.payload
          .documentList as ConvertProductToMaterialCallbackDocument["documentList"],
        products: products,
        isConverting: false,
        error: null,
      };
    case ReducerActions.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isConverting: false,
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
const ConvertProductToMaterialPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => (
        <ConvertProductToMaterialBase {...props} authUser={authUser} />
      )}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const ConvertProductToMaterialBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [state, dispatch] = React.useReducer(
    convertProductToMaterialReducer,
    inititialState
  );

  /* ------------------------------------------
  // Daten aus der DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (authUser && state.products.length === 0) {
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
    }
  }, [authUser]);
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
  const onConvertProductToMaterial = () => {
    dispatch({type: ReducerActions.PRODUCT_CONVERT_START, payload: {}});

    Material.createMaterialFromProduct({
      firebase: firebase,
      product: state.product,
      newMaterialType: state.materialProperty.type,
      authUser: authUser!,
      callbackDone: (mergeResult) => {
        dispatch({
          type: ReducerActions.PRODUCT_CONVERT_FINISHED,
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
  const onChangeMaterialType = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ReducerActions.CHANGE_MATERIAL_TYPE,
      payload: {value: parseInt((event.target as HTMLInputElement).value)},
    });
  };
  if (!authUser) {
    return null;
  }

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_CONVERT_PRODUCT_TO_MATERIAL} />
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
            <PanelConvertProductToMaterial
              product={state.product}
              products={state.products}
              materialProperty={state.materialProperty}
              isConverting={state.isConverting}
              changedFiles={state.changedFiles}
              onChangeProductSelection={onChangeProductSelection}
              onConvertProduct={onConvertProductToMaterial}
              onChangeMaterialType={onChangeMaterialType}
            />
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// ====================== Convert Product Card =======================
// =================================================================== */
interface PanelConvertProductToMaterialProps {
  product: State["product"];
  products: State["products"];
  materialProperty: State["materialProperty"];
  isConverting: boolean;
  changedFiles: State["changedFiles"];
  onChangeProductSelection: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Product | null,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => void;
  onConvertProduct: () => void;
  onChangeMaterialType: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const PanelConvertProductToMaterial = ({
  product,
  products,
  materialProperty,
  isConverting,
  changedFiles,
  onChangeProductSelection,
  onConvertProduct,
  onChangeMaterialType,
}: PanelConvertProductToMaterialProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_MERGE_PRODUCT_SELECTION}
        </Typography>
        <Typography gutterBottom={true}>
          {TEXT_CONVERT_PRODUCT_TO_MATERIAL_EXPLANATION}
        </Typography>
        <br />
        <ProductAutocomplete
          componentKey={"product"}
          product={product}
          products={products}
          onChange={onChangeProductSelection}
          label={TEXT_PRODUCT}
        />
        <br />
        <Typography variant="subtitle1">{TEXT_MATERIAL_TYPE}</Typography>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="materialtyp"
            name="materialtype"
            id="materialtype"
            value={materialProperty.type}
            onChange={onChangeMaterialType}
            row
          >
            <FormControlLabel
              value={MaterialType.consumable}
              control={<Radio color="primary" required />}
              label={TEXT_MATERIAL_TYPE_CONSUMABLE}
              id="materialtype"
            />
            <FormControlLabel
              value={MaterialType.usage}
              control={<Radio color="primary" required />}
              label={TEXT_MATERIAL_TYPE_USAGE}
              id="materialtype"
            />
          </RadioGroup>
        </FormControl>
        {isConverting && (
          <React.Fragment>
            <br />
            <LinearProgress />
          </React.Fragment>
        )}
        <Button
          fullWidth
          disabled={
            product?.uid == "" || materialProperty.type == MaterialType.none
          }
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={onConvertProduct}
        >
          {TEXT_CONVERT_PRODUCT_TO_MATERIAL}
        </Button>
        {changedFiles?.length > 0 && (
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
                    primary={`${TEXT_PRODUCT}: ${product.name}`}
                    secondary={product.uid}
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
                {changedFiles.map((document, counter) => (
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
)(ConvertProductToMaterialPage);
