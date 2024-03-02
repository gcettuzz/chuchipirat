import React from "react";
import {compose} from "react-recompose";

import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
} from "@material-ui/core";

import {
  DEPARTMENT as TEXT_DEPARTMENT,
  SAVE_SUCCESS as TEXT_SAVE_SUCCESS,
  PRODUCTS as TEXT_PRODUCTS,
  NOTHING_WORKS_WITHOUT_US as TEXT_NOTHING_WORKS_WITHOUT_US,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  EDIT as TEXT_EDIT,
  SAVE as TEXT_SAVE,
  CANCEL as TEXT_CANCEL,
  UID as TEXT_UID,
  PRODUCT as TEXT_PRODUCT,
  SHOPPING_UNIT as TEXT_SHOPPING_UNIT,
  HAS_LACTOSE as TEXT_HAS_LACTOSE,
  HAS_GLUTEN as TEXT_HAS_GLUTEN,
  DIET as TEXT_DIET,
  USABLE as TEXT_USABLE,
  IS_MEAT as TEXT_IS_MEAT,
  IS_VEGETARIAN as TEXT_IS_VEGETARIAN,
  IS_VEGAN as TEXT_IS_VEGAN,
  FROM as TEXT_FROM,
  NAME as TEXT_NAME,
  MATERIAL_TYPE_USAGE as TEXT_MATERIAL_TYPE_USAGE,
  MATERIAL_TYPE_CONSUMABLE as TEXT_MATERIAL_TYPE_CONSUMABLE,
  CHOOSE_MATERIAL_TYPE as TEXT_CHOOSE_MATERIAL_TYPE,
  MATERIAL_TYPE as TEXT_MATERIAL_TYPE,
  PRODUCT_CONVERTED_TO_MATERIAL as TEXT_PRODUCT_CONVERTED_TO_MATERIAL,
} from "../../constants/text";
import Roles from "../../constants/roles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import EnhancedTable, {
  TableColumnTypes,
  ColumnTextAlign,
} from "../Shared/enhancedTable";
import DialogProduct, {ProductDialog} from "./dialogProduct";
import AlertMessage from "../Shared/AlertMessage";

import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Cached as CachedIcon,
} from "@material-ui/icons";

import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";
import useStyles from "../../constants/styles";
import SearchPanel from "../Shared/searchPanel";

import Product, {Allergen, Diet} from "./product.class";
import Unit from "../Unit/unit.class";
import Department from "../Department/department.class";

import AuthUser from "../Firebase/Authentication/authUser.class";
import Material, {MaterialType} from "../Material/material.class";
import Role from "../../constants/roles";
import {
  DialogType,
  SingleTextInputResult,
  useCustomDialog,
} from "../Shared/customDialogContext";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";
import {CustomRouterProps} from "../Shared/global.interface";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  PRODUCTS_FETCH_INIT,
  PRODUCTS_FETCH_SUCCESS,
  PRODUCTS_SAVED,
  // PRODUCTS_FILTER_LIST= "PRODUCTS_FILTER_LIST",
  // PRODUCT_UPDATED= "PRODUCT_UPDATED",
  PRODUCT_CONVERTED_TO_MATERIAL,
  DEPARTMENT_FETCH_INIT,
  DEPARTMENTS_FETCH_SUCCESS,
  UNITS_FETCH_INIT,
  UNITS_FETCH_SUCCESS,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};
type State = {
  products: Product[];
  departments: Department[];
  units: Unit[];
  error: Error | null;
  isLoading: {
    overall: boolean;
    products: boolean;
    units: boolean;
    departments: boolean;
  };
  snackbar: Snackbar;
};

const inititialState: State = {
  products: [],
  departments: [],
  units: [],
  error: null,
  isLoading: {
    overall: false,
    products: false,
    units: false,
    departments: false,
  },
  snackbar: {open: false, severity: "success", message: ""},
};

const productsReducer = (state: State, action: DispatchAction): State => {
  let products: State["products"] = [];
  switch (action.type) {
    case ReducerActions.PRODUCTS_FETCH_INIT:
      // Daten werden geladen
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          overall: true,
          products: true,
        },
      };
    case ReducerActions.PRODUCTS_FETCH_SUCCESS:
      // Produkte erfolgreich geladen
      return {
        ...state,
        products: action.payload as Product[],
        isLoading: {
          ...state.isLoading,
          overall: deriveIsLoading(state.isLoading, "products", false),
          products: false,
        },
      };
    case ReducerActions.PRODUCTS_SAVED:
      return {
        ...state,
        products: action.payload as Product[],
        snackbar: {
          open: true,
          severity: "success",
          message: TEXT_SAVE_SUCCESS,
        },
      };
    case ReducerActions.DEPARTMENT_FETCH_INIT:
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          overall: true,
          departments: true,
        },
      };
    case ReducerActions.DEPARTMENTS_FETCH_SUCCESS:
      // Abteilungen erfolgreich geladen
      return {
        ...state,
        departments: action.payload as Department[],
        isLoading: {
          ...state.isLoading,
          overall: deriveIsLoading(state.isLoading, "departments", false),
          departments: false,
        },
      };
    case ReducerActions.UNITS_FETCH_INIT:
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          overall: true,
          units: true,
        },
      };
    case ReducerActions.UNITS_FETCH_SUCCESS:
      // Einheiten erfolgreich geladen
      return {
        ...state,
        units: action.payload as Unit[],
        isLoading: {
          ...state.isLoading,
          overall: deriveIsLoading(state.isLoading, "units", false),
          units: false,
        },
      };

    // case REDUCER_ACTIONS.PRODUCT_UPDATED:
    // Einzelnes Produkt wurde angepasst
    // return {
    //   ...state,
    //   data: state.data.map((product) => {
    //     if (product.uid === action.payload.uid) {
    //       product.name = action.payload.name;
    //       product.departmentName = action.payload.department.name;
    //       product.departmentUid = action.payload.department.uid;
    //       product.shoppingUnit = action.payload.shoppingUnit;
    //       product.usable = action.payload.usable;
    //     }
    //     return product;
    //   }),
    //   snackbar: {
    //     open: true,
    //     severity: "success",
    //     message: TEXT.PRODUCT_EDITED(action.payload.name),
    //   },
    // };
    case ReducerActions.PRODUCT_CONVERTED_TO_MATERIAL:
      // Konvertiertes Produkt aus Liste löschen
      products = state.products.filter(
        (product) => product.uid !== action.payload.uid
      );

      return {
        ...state,
        products: products,
        snackbar: {
          severity: "success",
          open: true,
          message: TEXT_PRODUCT_CONVERTED_TO_MATERIAL(action.payload.name),
        },
      };
    case ReducerActions.SNACKBAR_CLOSE:
      // Snackbar schliessen
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case ReducerActions.GENERIC_ERROR:
      // allgemeiner Fehler
      return {
        ...state,
        error: action.payload as Error,
        isLoading: {...state.isLoading, overall: false},
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ------------------------------------------
// Ableiten ob Daten noch geladen werden
// ------------------------------------------ */
const deriveIsLoading = (actualState, newField, newValue) => {
  let counterTrue = 0;
  actualState[newField] = newValue;

  for (const [key, value] of Object.entries(actualState)) {
    if (key !== "overall" && value === true) {
      counterTrue += 1;
    }
  }
  if (counterTrue === 0) {
    return false;
  } else {
    return true;
  }
};

const PRODUCT_POPUP_VALUES = {
  productName: "",
  productUid: "",
  department: {name: "", uid: ""},
  shoppingUnit: {key: "", name: ""},
  usable: false,
  popUpOpen: false,
  dietProperties: Product.createEmptyDietProperty(),
};
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const ProductsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <ProductsBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const ProductsBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const {customDialog} = useCustomDialog();

  const [state, dispatch] = React.useReducer(productsReducer, inititialState);
  const [editMode, setEditMode] = React.useState(false);
  const [saveTrigger, setSaveTrigger] = React.useState(0);
  const [cancelTrigger, setCancelTrigger] = React.useState(0);
  /* ------------------------------------------
	// Daten aus DB holen
	// ------------------------------------------ */
  React.useEffect(() => {
    dispatch({
      type: ReducerActions.PRODUCTS_FETCH_INIT,
      payload: {},
    });
    Product.getAllProducts({
      firebase: firebase,
      onlyUsable: false,
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
    if (editMode) {
      if (state.departments.length === 0) {
        dispatch({
          type: ReducerActions.DEPARTMENT_FETCH_INIT,
          payload: {},
        });
        Department.getAllDepartments({firebase: firebase})
          .then((result) => {
            dispatch({
              type: ReducerActions.DEPARTMENTS_FETCH_SUCCESS,
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
      if (state.units.length === 0) {
        dispatch({
          type: ReducerActions.UNITS_FETCH_INIT,
          payload: {},
        });
        Unit.getAllUnits({firebase: firebase})
          .then((result) => {
            // leeres Feld gehört auch dazu
            result.push({key: "", name: ""});

            dispatch({
              type: ReducerActions.UNITS_FETCH_SUCCESS,
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
    }
  }, [editMode]);
  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
	// Edit Mode wechseln
	// ------------------------------------------ */
  // Die Triggerfunktionen werden benötigt, damit
  // useEffect() Methode in der Unterkomponente
  // reagiert und danach die Callback-Methode onXXX
  // aufruft
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  const raiseSaveTrigger = () => {
    setSaveTrigger((trigger) => trigger + 1);
  };
  const onSave = (products: Product[]) => {
    Product.saveAllProducts({
      firebase: firebase,
      products: products,
      authUser: authUser,
    })
      .then((result) => {
        dispatch({type: ReducerActions.PRODUCTS_SAVED, payload: result});
      })
      .catch((error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };
  const raiseCancelTrigger = () => {
    setCancelTrigger((trigger) => trigger + 1);
  };
  const onCancel = () => {
    toggleEditMode();
  };
  const onConvertProductToMaterial = async (product: Product) => {
    // Fragen welcher Material-Typ gesetzt werden soll?

    const userInput = (await customDialog({
      dialogType: DialogType.selectOptions,
      title: TEXT_MATERIAL_TYPE,
      text: TEXT_CHOOSE_MATERIAL_TYPE,
      singleTextInputProperties: {
        initialValue: "",
        textInputLabel: TEXT_NAME,
      },
      options: [
        {key: MaterialType.usage, text: TEXT_MATERIAL_TYPE_USAGE},
        {key: MaterialType.consumable, text: TEXT_MATERIAL_TYPE_CONSUMABLE},
      ],
    })) as SingleTextInputResult;

    if (userInput.valid) {
      // Cloud-FX triggern.
      Material.createMaterialFromProduct({
        firebase: firebase,
        product: {uid: product.uid, name: product.name},
        newMaterialType: parseInt(userInput.input) as MaterialType,
        authUser: authUser,
      }).then(() => {
        //TODO: snackbar, product aus der liste löschen
        dispatch({
          type: ReducerActions.PRODUCT_CONVERTED_TO_MATERIAL,
          payload: product,
        });
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
    dispatch({
      type: ReducerActions.SNACKBAR_CLOSE,
      payload: {},
    });
  };

  return (
    <React.Fragment>
      <CssBaseline />
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT_PRODUCTS}
        subTitle={TEXT_NOTHING_WORKS_WITHOUT_US}
      />
      <ProductsButtonRow
        editMode={editMode}
        onEdit={toggleEditMode}
        onSave={raiseSaveTrigger}
        onCancel={raiseCancelTrigger}
        authUser={authUser}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="xl">
        <Backdrop className={classes.backdrop} open={state.isLoading.overall}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {state.error && (
          <AlertMessage
            error={state.error}
            severity="error"
            messageTitle={TEXT_ALERT_TITLE_UUPS}
          />
        )}
        <ProductsTable
          editMode={editMode}
          dbProducts={state.products}
          departments={state.departments}
          units={state.units}
          saveTrigger={saveTrigger}
          cancelTrigger={cancelTrigger}
          onSave={onSave}
          onCancel={onCancel}
          onConvertProductToMaterial={onConvertProductToMaterial}
          authUser={authUser}
        />
        <CustomSnackbar
          message={state.snackbar.message}
          severity={state.snackbar.severity}
          snackbarOpen={state.snackbar.open}
          handleClose={handleSnackbarClose}
        />
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================ Buttons ==============================
// =================================================================== */
interface ProductsButtonRowProps {
  editMode: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  authUser: AuthUser;
}
const ProductsButtonRow = ({
  editMode,
  onEdit,
  onCancel,
  onSave,
  authUser,
}: ProductsButtonRowProps) => {
  return (
    <ButtonRow
      key="action_buttons"
      buttons={[
        {
          id: "edit",
          hero: true,
          visible:
            !editMode &&
            (authUser.roles.includes(Roles.communityLeader) ||
              authUser.roles.includes(Roles.admin)),
          label: TEXT_EDIT,
          variant: "contained",
          color: "primary",
          onClick: onEdit,
        },
        {
          id: "save",
          hero: true,
          visible: editMode,
          label: TEXT_SAVE,
          variant: "contained",
          color: "primary",
          onClick: onSave,
        },
        {
          id: "cancel",
          hero: true,
          visible: editMode,
          label: TEXT_CANCEL,
          variant: "outlined",
          color: "primary",
          onClick: onCancel,
        },
      ]}
    />
  );
};
/* ===================================================================
// =========================== Produkte Panel ========================
// =================================================================== */
interface ProductsTableProps {
  dbProducts: Product[];
  departments: Department[];
  units: Unit[];
  editMode: boolean;
  saveTrigger: any;
  cancelTrigger: any;
  onSave: (editedProducts: Product[]) => void;
  onCancel: () => void;
  onConvertProductToMaterial: (product: Product) => void;
  authUser: AuthUser;
}
// Aufbau der UI-Tabelle
interface ProductLineUi {
  uid: Product["uid"];
  name: Product["name"];
  departmentName: Department["name"];
  shoppingUnit: Unit["name"];
  containsLactose: JSX.Element;
  containsGluten: JSX.Element;
  diet: JSX.Element;
  usable: JSX.Element;
  context: JSX.Element;
}

const ProductsTable = ({
  dbProducts,
  departments,
  units,
  editMode,
  saveTrigger,
  cancelTrigger,
  onSave,
  onCancel,
  onConvertProductToMaterial: onConvertProductToMaterialSuper,
  authUser,
}: ProductsTableProps) => {
  const [searchString, setSearchString] = React.useState("");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [filteredProductsUi, setFilteredProductsUi] = React.useState<
    ProductLineUi[]
  >([]);
  const [productPopUpValues, setProductPopUpValues] =
    React.useState(PRODUCT_POPUP_VALUES);
  const [contextMenuAnchorElement, setContextMenuAnchorElement] =
    React.useState<HTMLElement | null>(null);
  const [contextMenuProductUid, setContextMenuProductUid] = React.useState("");
  const classes = useStyles();
  const TABLE_COLUMS = [
    {
      id: "edit",
      type: TableColumnTypes.button,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      visible: editMode,
      label: "",
      iconButton: <EditIcon fontSize="small" />,
    },
    {
      id: "uid",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT_UID,
      visible: false,
    },
    {
      id: "name",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT_PRODUCT,
      visible: true,
    },
    {
      id: "departmentName",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT_DEPARTMENT,
      visible: true,
    },
    {
      id: "shoppingUnit",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT_SHOPPING_UNIT,
      visible: true,
    },
    {
      id: "containsLactose",
      type: TableColumnTypes.JSX,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT_HAS_LACTOSE,
      visible: true,
    },
    {
      id: "containsGluten",
      type: TableColumnTypes.JSX,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT_HAS_GLUTEN,
      visible: true,
    },
    {
      id: "diet",
      type: TableColumnTypes.JSX,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT_DIET,
      visible: true,
    },
    {
      id: "usable",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT_USABLE,
      visible: true,
    },
    {
      id: "context",
      type: TableColumnTypes.JSX,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: "",
      visible: editMode,
    },
  ];
  /* ------------------------------------------
  // Mutierte Daten hochschieben
  // ------------------------------------------ */
  React.useEffect(() => {
    if (saveTrigger) {
      onSave(products);
    }
  }, [saveTrigger]);
  React.useEffect(() => {
    // Änderungen verwerfen
    if (cancelTrigger) {
      // Werte kopieren --> sonst werden Referenzen übergeben
      // und bei einem Abbruch (Cancel-Klick) werden die Änderungen
      // nicht rücktgängig gemacht
      setProducts(
        dbProducts.map((product) => {
          return {
            ...product,
            dietProperties: {
              ...product.dietProperties,
              allergens: product.dietProperties?.allergens.map(
                (allergen) => allergen
              ),
            },
          };
        })
      );

      setFilteredProductsUi(
        prepareProductsListForUi(filterProducts(dbProducts, searchString))
      );
      onCancel();
    }
  }, [cancelTrigger]);
  /* ------------------------------------------
  // Änderung des Edit-Mode verarbeiten
  // ------------------------------------------ */
  React.useEffect(() => {
    setFilteredProductsUi(
      prepareProductsListForUi(filterProducts(products, searchString))
    );
  }, [editMode]);
  /* ------------------------------------------
  // Suche
  // ------------------------------------------ */
  const clearSearchString = () => {
    setSearchString("");
    setFilteredProductsUi(
      prepareProductsListForUi(filterProducts(products, ""))
    );
  };
  const updateSearchString = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearchString(event.target.value);
    setFilteredProductsUi(
      prepareProductsListForUi(
        filterProducts(products, event.target.value as string)
      )
    );
  };
  /* ------------------------------------------
  // Filter-Logik 
  // ------------------------------------------ */
  const filterProducts = (products: Product[], searchString: string) => {
    let filteredProducts: Product[] = [];
    if (searchString) {
      searchString = searchString.toLowerCase();
      filteredProducts = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchString) ||
          product?.department?.name.toLowerCase().includes(searchString) ||
          product?.shoppingUnit?.toLowerCase().includes(searchString)
      );
    } else {
      filteredProducts = products;
    }
    return filteredProducts;
  };
  /* ------------------------------------------
  // Daten für UI aufbereiten 
  // ------------------------------------------ */
  const prepareProductsListForUi = (products: Product[]) => {
    return products.map((product) => {
      return {
        uid: product.uid,
        name: product.name,
        departmentName: product.department.name,
        shoppingUnit: product.shoppingUnit,
        containsLactose: (
          <Checkbox
            checked={product.dietProperties.allergens.includes(
              Allergen.Lactose
            )}
            color="primary"
            disabled={!editMode}
            onChange={handleCheckboxChange}
            key={"checkbox_" + Allergen.Lactose + "_" + product.uid}
            name={"checkbox_" + Allergen.Lactose + "_" + product.uid}
          />
        ),
        containsGluten: (
          <Checkbox
            checked={product.dietProperties.allergens.includes(Allergen.Gluten)}
            color="primary"
            disabled={!editMode}
            onChange={handleCheckboxChange}
            key={"checkbox_" + Allergen.Gluten + "_" + product.uid}
            name={"checkbox_" + Allergen.Gluten + "_" + product.uid}
          />
        ),
        diet: (
          <RadioGroup
            aria-label="Diät"
            name={"radioGroup_" + product.uid}
            key={"radioGroup_" + product.uid}
            value={product.dietProperties.diet}
            onChange={handleRadioButtonChange}
            row
          >
            <FormControlLabel
              value={Diet.Meat}
              control={
                <Radio size="small" color="primary" disabled={!editMode} />
              }
              label={TEXT_IS_MEAT}
            />
            <FormControlLabel
              value={Diet.Vegetarian}
              control={
                <Radio size="small" color="primary" disabled={!editMode} />
              }
              label={TEXT_IS_VEGETARIAN}
            />
            <FormControlLabel
              value={Diet.Vegan}
              control={
                <Radio size="small" color="primary" disabled={!editMode} />
              }
              label={TEXT_IS_VEGAN}
            />
          </RadioGroup>
        ),
        usable: (
          <Checkbox
            id={"checkbox_" + product.uid}
            disabled={!editMode}
            checked={product.usable}
            color="primary"
            onChange={handleCheckBoxChange}
          />
        ),
        context: (
          <IconButton id={"context_" + product.uid} onClick={openContextMenu}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
      };
    });
  };
  /* ------------------------------------------
  // Checkboxen/RadioButton-Edit
  // ------------------------------------------ */
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pressedCheckbox = event.target.name.split("_");

    const tempProducts = products;
    const changedProduct = tempProducts.find(
      (product) => product.uid === pressedCheckbox[2]
    );
    if (!changedProduct) {
      return;
    }
    const changedAllergene = parseInt(pressedCheckbox[1]) as Allergen;

    if (event.target.checked) {
      // Wert hinzufügen
      changedProduct.dietProperties.allergens.push(changedAllergene);
    } else {
      // Wert entfernen
      const index =
        changedProduct.dietProperties.allergens.indexOf(changedAllergene);
      if (index > -1) {
        changedProduct.dietProperties.allergens.splice(index, 1);
      }
    }
    setProducts(tempProducts);
    setFilteredProductsUi(
      prepareProductsListForUi(filterProducts(tempProducts, searchString))
    );
  };
  const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pressedCheckbox = event.target.id.split("_");
    const tempProducts = products;
    const changedProduct = tempProducts.find(
      (product) => product.uid === pressedCheckbox[1]
    );
    if (!changedProduct) {
      return;
    }
    changedProduct.usable = event.target.checked;
    setProducts(tempProducts);

    setFilteredProductsUi(
      prepareProductsListForUi(filterProducts(tempProducts, searchString))
    );
  };
  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pressedRadioButtonGroup = event.target.name.split("_");
    const tempProducts = products;
    const changedProduct = tempProducts.find(
      (product) => product.uid === pressedRadioButtonGroup[1]
    );
    if (!changedProduct) {
      return;
    }
    changedProduct.dietProperties.diet = parseInt(event.target.value) as Diet;
    setProducts(tempProducts);
    setFilteredProductsUi(
      prepareProductsListForUi(filterProducts(tempProducts, searchString))
    );
  };
  /* ------------------------------------------
	// Context-Menü 
	// ------------------------------------------ */
  const openContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    setContextMenuAnchorElement(event.currentTarget);
    setContextMenuProductUid(event.currentTarget.id.split("_")[1]);
  };
  const closeContextMenu = () => {
    setContextMenuAnchorElement(null);
    setContextMenuProductUid("");
  };
  const onConvertProductToMaterial = () => {
    const product = dbProducts.find(
      (product) => product.uid === contextMenuProductUid
    );
    if (!product) {
      return;
    }
    onConvertProductToMaterialSuper(product);
    setContextMenuAnchorElement(null);
    setContextMenuProductUid("");
  };

  /* ------------------------------------------
	// PopUp 
	// ------------------------------------------ */
  const openPopUp = (
    event:
      | React.MouseEvent<HTMLSpanElement, MouseEvent>
      | React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    productToEdit: ProductLineUi | string
  ) => {
    let product = {} as Product;

    if (typeof productToEdit === "string") {
      product = products.find(
        (product) => product.uid === productToEdit
      ) as Product;
    } else {
      product = products.find(
        (product) => product.uid === productToEdit.uid
      ) as Product;
    }

    if (!product) {
      return;
    }
    setProductPopUpValues({
      productUid: product.uid,
      productName: product.name,
      department: {
        uid: product.department.uid,
        name: product.department.name,
      },
      shoppingUnit: {key: product.shoppingUnit, name: ""},
      dietProperties: product.dietProperties,
      usable: product.usable,
      popUpOpen: true,
    });
  };
  const onPopUpClose = () => {
    setProductPopUpValues(PRODUCT_POPUP_VALUES);
  };
  const onPopUpOk = (changedProduct: Product) => {
    // angepasstes Produkt updaten
    const tempProducts = products;

    const index = tempProducts.findIndex(
      (product) => product.uid === changedProduct.uid
    );
    if (index === -1) {
      return;
    }

    tempProducts[index] = {
      ...changedProduct,
      department: {
        uid: changedProduct.department.uid,
        name: changedProduct.department.name,
      },
    };

    if (!tempProducts[index].shoppingUnit) {
      tempProducts[index].shoppingUnit = "";
    }

    setProducts(tempProducts);
    setFilteredProductsUi(
      prepareProductsListForUi(filterProducts(tempProducts, searchString))
    );
    setProductPopUpValues(PRODUCT_POPUP_VALUES);
  };
  if (dbProducts.length > 0 && products.length == 0) {
    // Deep-Copy, damit der Cancel-Befehl wieder die DB-Daten zeigt,
    // werden die Daten hier für die Tabelle geklont.
    setProducts(
      dbProducts.map((product) => {
        return {
          ...product,
          dietProperties: {
            ...product.dietProperties,
            allergens: product.dietProperties?.allergens.map(
              (allergen) => allergen
            ),
          },
        };
      })
    );
  }
  if (!searchString && products.length > 0 && filteredProductsUi.length === 0) {
    // Initialer Aufbau
    setFilteredProductsUi(
      prepareProductsListForUi(filterProducts(products, ""))
    );
  }

  return (
    <React.Fragment>
      <Card className={classes.card} key={"requestTablePanel"}>
        <CardContent
          className={classes.cardContent}
          key={"requestTableContent"}
        >
          <Grid container>
            <Grid item xs={12} style={{marginBottom: "2ex"}}>
              <SearchPanel
                searchString={searchString}
                onUpdateSearchString={updateSearchString}
                onClearSearchString={clearSearchString}
              />
              <Typography
                variant="body2"
                style={{marginTop: "0.5em", marginBottom: "2em"}}
              >
                {filteredProductsUi.length == products.length
                  ? `${products.length} ${TEXT_PRODUCTS}`
                  : `${filteredProductsUi.length} ${TEXT_FROM.toLowerCase()} ${
                      products.length
                    } ${TEXT_PRODUCTS}`}
              </Typography>

              <EnhancedTable
                tableData={filteredProductsUi}
                tableColumns={TABLE_COLUMS}
                keyColum={"uid"}
                onIconClick={openPopUp}
              />
              <Menu
                open={Boolean(contextMenuAnchorElement)}
                keepMounted
                anchorEl={contextMenuAnchorElement}
                onClose={closeContextMenu}
              >
                <MenuItem onClick={onConvertProductToMaterial}>
                  <ListItemIcon>
                    <CachedIcon />
                  </ListItemIcon>
                  <Typography variant="inherit" noWrap>
                    Zu Material umwandeln
                  </Typography>
                </MenuItem>
              </Menu>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <DialogProduct
        dialogType={ProductDialog.EDIT}
        productUid={productPopUpValues.productUid}
        productName={productPopUpValues.productName}
        productDietProperties={productPopUpValues.dietProperties}
        productUsable={productPopUpValues.usable}
        products={products}
        dialogOpen={productPopUpValues.popUpOpen}
        handleOk={onPopUpOk}
        handleClose={onPopUpClose}
        selectedDepartment={
          departments.find(
            (department) => department.uid === productPopUpValues.department.uid
          )!
        }
        selectedUnit={productPopUpValues.shoppingUnit}
        usable={productPopUpValues.usable}
        departments={departments}
        units={units}
        authUser={authUser}
      />
    </React.Fragment>
  );
};

const condition = (authUser) =>
  !!authUser &&
  (!!authUser.roles.includes(Role.admin) ||
    !!authUser.roles.includes(Role.communityLeader));

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(ProductsPage);
