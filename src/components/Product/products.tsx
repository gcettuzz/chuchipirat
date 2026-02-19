import React, {SyntheticEvent} from "react";

import {
  Backdrop,
  CircularProgress,
  Container,
  Typography,
  Card,
  CardContent,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  useTheme,
  Box,
  SnackbarCloseReason,
} from "@mui/material";

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
  // PRODUCT as TEXT_PRODUCT,
  SHOPPING_UNIT as TEXT_SHOPPING_UNIT,
  HAS_LACTOSE as TEXT_HAS_LACTOSE,
  HAS_GLUTEN as TEXT_HAS_GLUTEN,
  DIET as TEXT_DIET,
  USABLE as TEXT_USABLE,
  // IS_MEAT as TEXT_IS_MEAT,
  // IS_VEGETARIAN as TEXT_IS_VEGETARIAN,
  // IS_VEGAN as TEXT_IS_VEGAN,
  FROM as TEXT_FROM,
  NAME as TEXT_NAME,
  MATERIAL_TYPE_USAGE as TEXT_MATERIAL_TYPE_USAGE,
  MATERIAL_TYPE_CONSUMABLE as TEXT_MATERIAL_TYPE_CONSUMABLE,
  CHOOSE_MATERIAL_TYPE as TEXT_CHOOSE_MATERIAL_TYPE,
  MATERIAL_TYPE as TEXT_MATERIAL_TYPE,
  PRODUCT_CONVERTED_TO_MATERIAL as TEXT_PRODUCT_CONVERTED_TO_MATERIAL,
  OPEN as TEXT_OPEN,
  DIET_TYPES as TEXT_DIET_TYPES,
  SHOW_ALL_PRODUCTS as TEXT_SHOW_ALL_PRODUCTS,
  SHOW_ONLY_NEWEST_PRODUCTS as TEXT_SHOW_ONLY_NEWEST_PRODUCTS,
  NO_NEWEST_PRODUCTS_FOUND as TEXT_NO_NEWEST_PRODUCTS_FOUND,
} from "../../constants/text";
import Roles from "../../constants/roles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import DialogProduct, {ProductDialog} from "./dialogProduct";
import AlertMessage from "../Shared/AlertMessage";

import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Cached as CachedIcon,
} from "@mui/icons-material";

import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";
import useCustomStyles from "../../constants/styles";

import SearchPanel from "../Shared/searchPanel";

import Product, {Allergen, Diet} from "./product.class";
import Unit, {UnitDimension} from "../Unit/unit.class";
import Department from "../Department/department.class";

import AuthUser from "../Firebase/Authentication/authUser.class";
import Material, {MaterialType} from "../Material/material.class";
import Role from "../../constants/roles";
import {
  DialogType,
  SingleTextInputResult,
  useCustomDialog,
} from "../Shared/customDialogContext";
import {useAuthUser} from "../Session/authUserContext";
import {useFirebase} from "../Firebase/firebaseContext";
import {DataGrid, GridColDef, deDE, gridClasses} from "@mui/x-data-grid";
import Feed, {FeedType} from "../Shared/feed.class";
import Firebase from "../Firebase/firebase.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  PRODUCTS_FETCH_INIT,
  PRODUCTS_FETCH_SUCCESS,
  PRODUCTS_SAVED,
  NEWEST_PRODUCTS_FETCH_INIT,
  NEWEST_PRODUCTS_FETCH_SUCCESS,
  NEWEST_PRODUCTS_CLEAR,
  PRODUCT_CONVERTED_TO_MATERIAL,
  DEPARTMENT_FETCH_INIT,
  DEPARTMENTS_FETCH_SUCCESS,
  UNITS_FETCH_INIT,
  UNITS_FETCH_SUCCESS,
  SNACKBAR_SHOW,
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
  newestProducts: Feed[];
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
  newestProducts: [],
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
    case ReducerActions.NEWEST_PRODUCTS_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: {...state.isLoading, overall: false},
        newestProducts: action.payload as Feed[],
      };
    case ReducerActions.NEWEST_PRODUCTS_FETCH_INIT:
      return {...state, isLoading: {...state.isLoading, overall: true}};
    case ReducerActions.NEWEST_PRODUCTS_CLEAR:
      return {...state, newestProducts: []};
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
    case ReducerActions.SNACKBAR_SHOW:
      return {
        ...state,
        isLoading: {...state.isLoading, overall: false},
        snackbar: {
          severity: action.payload.severity,
          message: action.payload.message,
          open: true,
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
  shoppingUnit: {key: "", name: "", dimension: UnitDimension.dimensionless},
  usable: false,
  popUpOpen: false,
  dietProperties: Product.createEmptyDietProperty(),
};
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const ProductsPage = () => {
  const firebase = useFirebase();
  const authUser = useAuthUser();
  const classes = useCustomStyles();
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
            result.push({
              key: "",
              name: "",
              dimension: UnitDimension.dimensionless,
            });

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
  const loadNewestProducts = () => {
    if (state.newestProducts.length === 0) {
      dispatch({type: ReducerActions.NEWEST_PRODUCTS_FETCH_INIT, payload: {}});
      Feed.getNewestFeeds({
        firebase: firebase,
        limitTo: 100,
        visibility: Role.communityLeader,
        feedType: FeedType.productCreated,
        daysOffset: 10,
      }).then((result) => {
        if (result.length > 0) {
          dispatch({
            type: ReducerActions.NEWEST_PRODUCTS_FETCH_SUCCESS,
            payload: result,
          });
        } else {
          dispatch({
            type: ReducerActions.SNACKBAR_SHOW,
            payload: {severity: "info", message: TEXT_NO_NEWEST_PRODUCTS_FOUND},
          });
        }
      });
    } else {
      // löschen, damit alle wieder angezeigt werden
      dispatch({type: ReducerActions.NEWEST_PRODUCTS_CLEAR, payload: {}});
    }
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
    event: Event | SyntheticEvent<any, Event>,
    reason: SnackbarCloseReason
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
        onLoadNewestProducts={loadNewestProducts}
        showLoadNewestProducts={state.newestProducts.length === 0}
        authUser={authUser}
      />
      {/* ===== BODY ===== */}
      <Container sx={classes.container} component="main" maxWidth="xl">
        <Backdrop sx={classes.backdrop} open={state.isLoading.overall}>
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
          newestProducts={state.newestProducts}
          saveTrigger={saveTrigger}
          cancelTrigger={cancelTrigger}
          onSave={onSave}
          onCancel={onCancel}
          onConvertProductToMaterial={onConvertProductToMaterial}
          firebase={firebase}
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
  onLoadNewestProducts: () => void;
  showLoadNewestProducts: boolean;
  authUser: AuthUser;
}
const ProductsButtonRow = ({
  editMode,
  onEdit,
  onCancel,
  onSave,
  onLoadNewestProducts,
  showLoadNewestProducts,
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
          id: "newestProducts",
          hero: true,
          visible: showLoadNewestProducts,
          label: TEXT_SHOW_ONLY_NEWEST_PRODUCTS,
          variant: "outlined",
          color: "primary",
          onClick: onLoadNewestProducts,
        },
        {
          id: "showAll",
          hero: true,
          visible: !showLoadNewestProducts,
          label: TEXT_SHOW_ALL_PRODUCTS,
          variant: "outlined",
          color: "primary",
          onClick: onLoadNewestProducts,
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
  newestProducts: Feed[];
  editMode: boolean;
  saveTrigger: any;
  cancelTrigger: any;
  onSave: (editedProducts: Product[]) => void;
  onCancel: () => void;
  onConvertProductToMaterial: (product: Product) => void;
  firebase: Firebase;
  authUser: AuthUser;
}
// Aufbau der UI-Tabelle
interface ProductLineUi {
  uid: Product["uid"];
  name: Product["name"];
  departmentName: Department["name"];
  shoppingUnit: Unit["name"];
  containsLactose: boolean;
  containsGluten: boolean;
  diet: Diet;
  usable: boolean;
  // context: JSX.Element;
}

const ProductsTable = ({
  dbProducts,
  departments,
  units,
  newestProducts,
  editMode,
  saveTrigger,
  cancelTrigger,
  onSave,
  onCancel,
  onConvertProductToMaterial: onConvertProductToMaterialSuper,
  firebase,
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
  const [pageSize, setPageSize] = React.useState(100);

  const classes = useCustomStyles();
  const theme = useTheme();

  const DATA_GRID_COLUMNS: GridColDef[] = [
    {
      field: "open",
      headerName: TEXT_OPEN,
      sortable: false,
      renderCell: (params) => {
        const onClick = () => openPopUp(params.id as string); // onFeedLogSelect(params.id as string);

        return (
          <IconButton
            aria-label="open User"
            style={{margin: theme.spacing(1)}}
            size="small"
            disabled={!editMode}
            onClick={onClick}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
        );
      },
    },
    {
      field: "uid",
      headerName: TEXT_UID,
      editable: false,
      hide: true,
      width: 200,
      cellClassName: () => `super-app ${classes.typographyCode}`,
    },
    {
      field: "name",
      headerName: TEXT_NAME,
      editable: false,
      width: 200,
    },
    {
      field: "departmentName",
      headerName: TEXT_DEPARTMENT,
      editable: false,
      width: 200,
    },
    {
      field: "shoppingUnit",
      headerName: TEXT_SHOPPING_UNIT,
      editable: false,
      width: 200,
    },
    {
      field: "containsLactose",
      headerName: TEXT_HAS_LACTOSE,
      editable: false,
      width: 200,
      renderCell: (params) => (
        <Checkbox
          checked={params.value as boolean}
          disabled={!editMode}
          onChange={handleCheckboxChange}
          key={"checkbox_" + Allergen.Lactose + "_" + params.id}
          name={"checkbox_" + Allergen.Lactose + "_" + params.id}
        />
      ),
    },
    {
      field: "containsGluten",
      headerName: TEXT_HAS_GLUTEN,
      editable: false,
      width: 200,
      renderCell: (params) => (
        <Checkbox
          checked={params.value as boolean}
          disabled={!editMode}
          onChange={handleCheckboxChange}
          key={"checkbox_" + Allergen.Gluten + "_" + params.id}
          name={"checkbox_" + Allergen.Gluten + "_" + params.id}
        />
      ),
    },
    {
      field: "diet",
      headerName: TEXT_DIET,
      editable: false,
      width: 200,
      renderCell: (params) => TEXT_DIET_TYPES[params.value as number],
    },
    {
      field: "usable",
      headerName: TEXT_USABLE,
      editable: false,
      width: 200,
      renderCell: (params) => (
        <Checkbox
          checked={params.value as boolean}
          disabled={!editMode}
          onChange={handleCheckboxChange}
          key={"checkbox_usable_" + params.id}
          name={"checkbox_usable_" + params.id}
        />
      ),
    },
    {
      field: "context",
      headerName: "",
      editable: false,
      width: 200,
      renderCell: (params) => {
        const onClick = (event: React.MouseEvent<HTMLElement>) =>
          openContextMenu(event, params.id as string);

        return (
          <IconButton
            aria-label="open User"
            style={{margin: theme.spacing(1)}}
            size="small"
            disabled={!editMode}
            onClick={onClick}
          >
            <MoreVertIcon fontSize="inherit" />
          </IconButton>
        );
      },
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
    if (searchString) {
      setFilteredProductsUi(
        prepareProductsListForUi(filterProducts(products, searchString))
      );
    }
  }, [editMode]);
  /* ------------------------------------------
  // Neueste Produkte anzeigen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (newestProducts.length > 0) {
      // setProducts(newestProductsList);
      setFilteredProductsUi(
        prepareProductsListForUi(filterProducts(dbProducts, ""))
      );
    } else if (products.length !== 0 && newestProducts.length === 0) {
      setFilteredProductsUi(
        prepareProductsListForUi(filterProducts(dbProducts, ""))
      );
    }
  }, [newestProducts.length]);
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

    if (newestProducts.length > 0) {
      // alles herausfiltern, dass nicht in den letzten Tagen angelegt wurde
      filteredProducts = filteredProducts.filter((product) =>
        newestProducts.some((feed) => feed.sourceObject.uid === product.uid)
      );
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
        containsLactose: product.dietProperties?.allergens?.includes(
          Allergen.Lactose
        ),
        containsGluten: product.dietProperties?.allergens?.includes(
          Allergen.Gluten
        ),
        diet: product.dietProperties.diet,
        usable: product.usable,
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

    if (pressedCheckbox[1] === "usable") {
      changedProduct.usable = event.target.checked;
    } else {
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
    }

    setProducts(tempProducts);
    setFilteredProductsUi(
      prepareProductsListForUi(filterProducts(tempProducts, searchString))
    );
  };
  /* ------------------------------------------
	// Context-Menü 
	// ------------------------------------------ */
  const openContextMenu = (
    event: React.MouseEvent<HTMLElement>,
    productUid: Product["uid"]
  ) => {
    setContextMenuAnchorElement(event.currentTarget);
    setContextMenuProductUid(productUid);
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
    setProducts(
      dbProducts.filter((product) => product.uid !== contextMenuProductUid)
    );
    setContextMenuAnchorElement(null);
    setContextMenuProductUid("");
  };

  /* ------------------------------------------
	// PopUp 
	// ------------------------------------------ */
  const openPopUp = (productUid: string) => {
    let product = {} as Product;

    product = products.find((product) => product.uid === productUid) as Product;

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
      shoppingUnit: {
        key: product.shoppingUnit,
        name: "",
        dimension: UnitDimension.dimensionless,
      },
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
  const onPopUpChooseExisting = () => {
    console.info("");
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
      <Card sx={classes.card} key={"requestTablePanel"}>
        <CardContent sx={classes.cardContent} key={"requestTableContent"}>
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
          <Box sx={{width: "100%"}}>
            <DataGrid
              autoHeight
              rows={filteredProductsUi}
              columns={DATA_GRID_COLUMNS}
              getRowId={(row) => row.uid}
              pagination
              localeText={deDE.components.MuiDataGrid.defaultProps.localeText}
              getRowClassName={(params) => {
                if (params.row?.disabled) {
                  return `super-app ${classes.dataGridDisabled}`;
                } else {
                  return `super-app-theme`;
                }
              }}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[20, 50, 100]}
              sx={(theme) => ({
                [`.${gridClasses.main}`]: {
                  overflow: "unset",
                },
                [`.${gridClasses.columnHeaders}`]: {
                  position: "sticky",
                  top: 0,
                  backgroundColor: theme.palette.background.paper,
                  zIndex: 1,
                },
                [`.${gridClasses.virtualScroller}`]: {
                  marginTop: "0 !important",
                },
              })}
            />
          </Box>

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
        handleChooseExisting={onPopUpChooseExisting}
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
        firebase={firebase}
      />
    </React.Fragment>
  );
};

export default ProductsPage;
