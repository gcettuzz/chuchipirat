import React from "react";
import {compose} from "react-recompose";

import Product, {
  Allergen,
  Diet,
  DietProperties,
  ConvertMaterialToProductCallbackDocument,
} from "../Product/product.class";
import Role from "../../constants/roles";
import {withFirebase} from "../Firebase/firebaseContext";
import useStyles from "../../constants/styles";
import PageTitle from "../Shared/pageTitle";

import {
  CONVERT_ITEM as TEXT_CONVERT_ITEM,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  PRODUCT as TEXT_PRODUCT,
  MATERIAL as TEXT_MATERIAL,
  LOG as TEXT_LOG,
  MERGE_PRODUCT_SELECTION as TEXT_MERGE_PRODUCT_SELECTION,
  MERGE_MATERIAL_SELECTION as TEXT_MERGE_MATERIAL_SELECTION,
  CONVERT_ITEM_EXPLANATION as TEXT_CONVERT_ITEM_EXPLANATION,
  CHANGED_DOCUMENTS as TEXT_CHANGED_DOCUMENTS,
  MATERIAL_TYPE_CONSUMABLE as TEXT_MATERIAL_TYPE_CONSUMABLE,
  MATERIAL_TYPE_USAGE as TEXT_MATERIAL_TYPE_USAGE,
  MATERIAL_TYPE as TEXT_MATERIAL_TYPE,
  PRODUCT_PROPERTY as TEXT_PRODUCT_PROPERTY,
  INTOLERANCES as TEXT_INTOLERANCES,
  HAS_LACTOSE as TEXT_HAS_LACTOSE,
  HAS_GLUTEN as TEXT_HAS_GLUTEN,
  IS_MEAT as TEXT_IS_MEAT,
  IS_VEGETARIAN as TEXT_IS_VEGETARIAN,
  IS_VEGAN as TEXT_IS_VEGAN,
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
  Tab,
  Tabs,
  useTheme,
  FormLabel,
  FormGroup,
  Checkbox,
} from "@mui/material";
import AlertMessage from "../Shared/AlertMessage";
import ProductAutocomplete from "../Product/productAutocomplete";
import {AutocompleteChangeReason} from "@mui/lab";
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
import Department from "../Department/department.class";
import Unit, {UnitDimension} from "../Unit/unit.class";
import MaterialAutocomplete from "../Material/materialAutocomplete";
import {MaterialDetailList, ProductDetailList} from "./mergeItems";
import DepartmentAutocomplete from "../Department/departmentAutocomplete";
import UnitAutocomplete from "../Unit/unitAutocomplete";

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
  MATERIALS_FETCH_INIT,
  MATERIALS_FETCH_SUCCESS,
  MATERIALS_CONVERT_START,
  MATERIALS_CONVERT_FINISHED,
  MATERIALS_CHANGE_MATERIAL,
  MATERIAL_CHANGE_PRODUCT_PROPERTY,
  GENERIC_ERROR,
}

enum TabValue {
  products,
  materials,
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  products: Product[];
  materials: Material[];
  departments: Department[];
  units: Unit[];
  product: {uid: ""; name: ""};
  material: {uid: ""; name: ""};
  materialProperty: {type: Material["type"]};
  productProperty: {
    department: Department;
    unit: Unit;
    dietProperties: DietProperties;
  };
  convertProtocol:
    | ConvertProductToMaterialCallbackDocument
    | ConvertMaterialToProductCallbackDocument
    | null;
  isLoading: boolean;
  isConverting: boolean;
  error: Error | null;
  snackbar: {open: false; severity: "success"; message: ""};
};

const inititialState: State = {
  products: [],
  materials: [],
  departments: [],
  units: [],
  product: {uid: "", name: ""},
  material: {uid: "", name: ""},
  materialProperty: {type: MaterialType.none},
  productProperty: {
    department: {uid: "", name: "", pos: 0, usable: true},
    unit: {key: "", name: "", dimension: UnitDimension.dimensionless},
    dietProperties: {allergens: [], diet: Diet.Meat},
  },
  convertProtocol: null,
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
  let material: State["material"];
  let products: Product[] = [];
  let materials: Material[] = [];
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
        units: action.payload.units,
        materials: action.payload.materials,
        departments: action.payload.departments,
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
    case ReducerActions.MATERIALS_CHANGE_MATERIAL:
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
        material: material,
        error: null,
      };

    case ReducerActions.CHANGE_MATERIAL_TYPE:
      return {
        ...state,
        materialProperty: {
          type: action.payload.value as unknown as MaterialType,
        },
      };
    case ReducerActions.MATERIAL_CHANGE_PRODUCT_PROPERTY:
      return {
        ...state,
        productProperty: {
          ...state.productProperty,
          [action.payload.key]: action.payload.value,
        },
      };
    case ReducerActions.PRODUCT_CONVERT_START:
    case ReducerActions.MATERIALS_CONVERT_START:
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
        convertProtocol:
          action.payload as ConvertProductToMaterialCallbackDocument,
        products: products,
        isConverting: false,
        error: null,
      };
    case ReducerActions.MATERIALS_CONVERT_FINISHED:
      materials = state.materials.filter(
        (material) => material.uid !== state.material.uid
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
        convertProtocol:
          action.payload as ConvertProductToMaterialCallbackDocument,
        materials: materials,
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
const ConvertItemPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <ConvertItemBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const ConvertItemBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const theme = useTheme();

  const [state, dispatch] = React.useReducer(
    convertProductToMaterialReducer,
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
  React.useEffect(() => {
    const fetchMasterdata = async () => {
      // useEffect darf nicht asynchron sein. Darum separate Funktion,
      // die weiter unten aufgerufen wird.
      if (tabValue === TabValue.materials && state.units.length == 0) {
        dispatch({
          type: ReducerActions.PRODUCTS_FETCH_INIT,
          payload: {},
        });
        let units: Unit[] = [];
        let departments: Department[] = [];
        let materials: Material[] = [];
        const fetchMasterdata: Promise<
          void | Unit[] | Department[] | Material[]
        >[] = [];

        fetchMasterdata.push(
          Unit.getAllUnits({firebase: firebase})
            .then((result) => (units = result))
            .catch((error) => {
              console.error(error);
              dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
            })
        );

        fetchMasterdata.push(
          Department.getAllDepartments({firebase: firebase})
            .then((result) => (departments = result))
            .catch((error) => {
              console.error(error);
              dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
            })
        );

        fetchMasterdata.push(
          Material.getAllMaterials({firebase: firebase})
            .then((result) => (materials = result))
            .catch((error) => {
              console.error(error);
              dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
            })
        );

        await Promise.all(fetchMasterdata);
        dispatch({
          type: ReducerActions.MATERIALS_FETCH_SUCCESS,
          payload: {
            units: units,
            departments: departments,
            materials: materials,
          },
        });
      }
    };

    fetchMasterdata();
  }, [tabValue]);
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
  const onChangeAutocompleteSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Material | Department | Unit | null,
    action?: AutocompleteChangeReason
  ) => {
    if (action == "blur") {
      return;
    }
    let field = "";

    if (event.target.id) {
      field = event.target.id.split("-")[0];
    }

    if (field === "material") {
      dispatch({
        type: ReducerActions.MATERIALS_CHANGE_MATERIAL,
        payload: {
          key: event.target.id.split("-")[0],
          value: newValue,
        },
      });
    } else {
      dispatch({
        type: ReducerActions.MATERIAL_CHANGE_PRODUCT_PROPERTY,
        payload: {
          key: event.target.id.split("-")[0],
          value: newValue,
        },
      });
    }
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
  const onConvertMaterial = () => {
    dispatch({type: ReducerActions.MATERIALS_CONVERT_START, payload: {}});

    Product.createProductFromMaterial({
      firebase: firebase,
      material: state.material,
      department: state.productProperty.department,
      shoppingUnit: state.productProperty.unit,
      dietProperties: state.productProperty.dietProperties,
      authUser: authUser!,
      callbackDone: (mergeResult) => {
        dispatch({
          type: ReducerActions.MATERIALS_CONVERT_FINISHED,
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
  const onChangeAllergens = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dietProperties = state.productProperty.dietProperties;

    switch (event.target.id) {
      case "dietProperties.allergens.containsLactose":
        if (event.target.checked) {
          // Hinzufügen
          dietProperties.allergens.push(Allergen.Lactose);
        } else {
          dietProperties.allergens = dietProperties.allergens.filter(
            (allergen) => allergen != Allergen.Lactose
          );
        }
        break;
      case "dietProperties.allergens.containsGluten":
        if (event.target.checked) {
          // Hinzufügen
          dietProperties.allergens.push(Allergen.Gluten);
        } else {
          dietProperties.allergens = dietProperties.allergens.filter(
            (allergen) => allergen != Allergen.Gluten
          );
        }
        break;
    }
    dispatch({
      type: ReducerActions.MATERIAL_CHANGE_PRODUCT_PROPERTY,
      payload: {key: "dietProperties", value: dietProperties},
    });
  };
  const onChangeDiet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dietProperties = state.productProperty.dietProperties;
    dietProperties.diet = parseInt(event.target.value);
    dispatch({
      type: ReducerActions.MATERIAL_CHANGE_PRODUCT_PROPERTY,
      payload: {key: "dietProperties", value: dietProperties},
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
    // dispatch({type: ReducerActions.CLEAR_MERGE_PROTOCOL, payload: {}});
  };

  if (!authUser) {
    return null;
  }
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_CONVERT_ITEM} />
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
          <Tab label={TEXT_PRODUCT} />
          <Tab label={TEXT_MATERIAL} />
        </Tabs>

        {tabValue === TabValue.products ? (
          <PanelConvertProductToMaterial
            product={state.product}
            products={state.products}
            materialProperty={state.materialProperty}
            isConverting={state.isConverting}
            convertProtocol={
              state.convertProtocol as ConvertProductToMaterialCallbackDocument | null
            }
            onChangeProductSelection={onChangeProductSelection}
            onConvertProduct={onConvertProductToMaterial}
            onChangeMaterialType={onChangeMaterialType}
          />
        ) : (
          <PanelConvertMaterialToProduct
            material={state.material}
            materials={state.materials}
            departments={state.departments}
            units={state.units}
            productProperty={state.productProperty}
            isConverting={state.isConverting}
            convertProtocol={
              state.convertProtocol as ConvertMaterialToProductCallbackDocument
            }
            onChangeAutocompleteSelection={onChangeAutocompleteSelection}
            onConvertMaterial={onConvertMaterial}
            onChangeAllergens={onChangeAllergens}
            onChangeDiet={onChangeDiet}
          />
        )}
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
  convertProtocol: ConvertProductToMaterialCallbackDocument | null;
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
  convertProtocol,
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
          {TEXT_CONVERT_ITEM_EXPLANATION(TEXT_PRODUCT, TEXT_MATERIAL)}
        </Typography>
        <br />
        <ProductAutocomplete
          componentKey={"product"}
          product={product}
          products={products}
          onChange={onChangeProductSelection}
          label={TEXT_PRODUCT}
          allowCreateNewProduct={false}
        />
        <ProductDetailList productUid={product.uid} products={products} />
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
          {TEXT_CONVERT_ITEM}
        </Button>
        {convertProtocol !== null && (
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
                    primary={`${TEXT_PRODUCT}: ${convertProtocol.product.name}`}
                    secondary={convertProtocol.product.uid}
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
                {convertProtocol.documentList.map((document, counter) => (
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
// ====================== Convert Product Card =======================
// =================================================================== */
interface PanelConvertMaterialToProductProps {
  material: State["material"];
  materials: State["materials"];
  departments: State["departments"];
  units: State["units"];
  productProperty: State["productProperty"];
  isConverting: boolean;
  convertProtocol: ConvertMaterialToProductCallbackDocument | null;
  onChangeAutocompleteSelection: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: string | Material | Department | Unit | null,
    action?: AutocompleteChangeReason,
    objectId?: string
  ) => void;
  onChangeAllergens: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDiet: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onConvertMaterial: () => void;
  // onChangeMaterialType: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const PanelConvertMaterialToProduct = ({
  material,
  materials,
  departments,
  units,
  productProperty,
  isConverting,
  convertProtocol,
  onChangeAllergens,
  onChangeDiet,
  onChangeAutocompleteSelection,
  onConvertMaterial,
}: // onChangeMaterialType,
PanelConvertMaterialToProductProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography gutterBottom={true} variant="h5" component="h2">
              {TEXT_MERGE_MATERIAL_SELECTION}
            </Typography>

            <Typography gutterBottom={true}>
              {TEXT_CONVERT_ITEM_EXPLANATION(TEXT_MATERIAL, TEXT_PRODUCT)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <MaterialAutocomplete
              material={material}
              materials={materials}
              allowCreateNewMaterial={false}
              onChange={onChangeAutocompleteSelection}
              disabled={false}
            />
          </Grid>
          <Grid item xs={12}>
            <MaterialDetailList
              materialUid={material.uid}
              materials={materials}
            />
          </Grid>
          <br />
          <Grid item xs={12}>
            <DepartmentAutocomplete
              department={productProperty.department}
              departments={departments}
              disabled={false}
              onChange={onChangeAutocompleteSelection}
            />
          </Grid>
          <Grid item xs={12}>
            <UnitAutocomplete
              unitKey={productProperty.unit.key}
              units={units}
              onChange={onChangeAutocompleteSelection}
            />
          </Grid>
          <br />
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <FormLabel component="legend">{TEXT_INTOLERANCES}</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={productProperty.dietProperties?.allergens?.includes(
                        Allergen.Lactose
                      )}
                      onChange={onChangeAllergens}
                      name="dietProperties.allergens.containsLactose"
                      id="dietProperties.allergens.containsLactose"
                      color="primary"
                    />
                  }
                  label={TEXT_HAS_LACTOSE}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={productProperty.dietProperties?.allergens?.includes(
                        Allergen.Gluten
                      )}
                      onChange={onChangeAllergens}
                      name="dietProperties.allergens.containsGluten"
                      id="dietProperties.allergens.containsGluten"
                      color="primary"
                    />
                  }
                  label={TEXT_HAS_GLUTEN}
                />
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <FormGroup>
                <FormLabel component="legend">
                  {TEXT_PRODUCT_PROPERTY}
                </FormLabel>
                <RadioGroup
                  aria-label="Diät"
                  name={"radioGroup_Diet"}
                  key={"radioGroup_Diet"}
                  value={productProperty.dietProperties.diet}
                  onChange={onChangeDiet}
                >
                  <FormControlLabel
                    value={Diet.Meat}
                    control={<Radio size="small" color="primary" />}
                    label={TEXT_IS_MEAT}
                  />
                  <FormControlLabel
                    value={Diet.Vegetarian}
                    control={<Radio size="small" color="primary" />}
                    label={TEXT_IS_VEGETARIAN}
                  />
                  <FormControlLabel
                    value={Diet.Vegan}
                    control={<Radio size="small" color="primary" />}
                    label={TEXT_IS_VEGAN}
                  />
                </RadioGroup>
              </FormGroup>
            </FormControl>
          </Grid>
          {isConverting && (
            <React.Fragment>
              <br />
              <LinearProgress />
            </React.Fragment>
          )}
          <Button
            fullWidth
            disabled={
              material?.uid == "" || productProperty.department.uid == ""
            }
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onConvertMaterial}
          >
            {TEXT_CONVERT_ITEM}
          </Button>
          {convertProtocol !== null && (
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
                      primary={`${TEXT_MATERIAL}: ${convertProtocol.material.name}`}
                      secondary={convertProtocol.material.uid}
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
                  {convertProtocol.documentList.map((document, counter) => (
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
        </Grid>
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
)(ConvertItemPage);
