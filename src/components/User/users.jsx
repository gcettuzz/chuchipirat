import React, { useReducer } from "react";
import { compose } from "recompose";

import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";

import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";

import EditIcon from "@material-ui/icons/Edit";
import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import EnhancedTable, { TABLE_COLUMN_TYPES } from "../Shared/enhancedTable";
// import DialogProduct, { PRODUCT_DIALOG_TYPE } from "./dialogProduct";
import AlertMessage from "../Shared/AlertMessage";

import SearchIcon from "@material-ui/icons/Search";

import CustomSnackbar from "../Shared/customSnackbar";
import useStyles from "../../constants/styles";

import Product from "../Product/product.class";
import Unit from "../Unit/unit.class";
import Department from "../Department/department.class";

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
  FETCH_INIT: "FETCH_INIT",
  PRODUCTS_FETCH_SUCCESS: "PRODUCTS_FETCH_SUCCESS",
  PRODUCTS_FILTER_LIST: "PRODUCTS_FILTER_LIST",
  PRODUCT_UPDATED: "PRODUCT_UPDATED",
  DEPARTMENTS_FETCH_SUCCESS: "DEPARTMENTS_FETCH_SUCCESS",
  UNITS_FETCH_SUCCESS: "UNITS_FETCH_SUCCESS",
  SNACKBAR_CLOSE: "SNACKBAR_CLOSE",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const productsReducer = (state, action) => {
  switch (action.type) {
    // case REDUCER_ACTIONS.FETCH_INIT:
    //   // Daten werden geladen
    //   return {
    //     ...state,
    //     isLoading: {
    //       ...state.isLoading,
    //       overall: true,
    //       [action.field]: true,
    //     },
    //   };
    // case REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS:
    //   // Produkte erfolgreich geladen
    //   return {
    //     ...state,
    //     data: action.payload,
    //     filteredData: action.payload,
    //     isLoading: {
    //       ...state.isLoading,
    //       overall: deriveIsLoading(state.isLoading, "products", false),
    //       products: false,
    //     },
    //   };
    // case REDUCER_ACTIONS.PRODUCTS_FILTER_LIST:
    //   // Einträge filtern
    //   let tmpList;
    //   if (action.payload) {
    //     tmpList = state.data.filter(
    //       (product) =>
    //         product.name.toLowerCase().includes(action.payload.toLowerCase()) ||
    //         product.departmentName
    //           .toLowerCase()
    //           .includes(action.payload.toLowerCase()) ||
    //         product.shoppingUnit
    //           .toLowerCase()
    //           .includes(action.payload.toLowerCase())
    //     );
    //   } else {
    //     tmpList = state.data;
    //   }
    //   return {
    //     ...state,
    //     filteredData: tmpList,
    //   };
    // case REDUCER_ACTIONS.DEPARTMENTS_FETCH_SUCCESS:
    //   // Abteilungen erfolgreich geladen
    //   return {
    //     ...state,
    //     departments: action.payload,
    //     isLoading: {
    //       ...state.isLoading,
    //       overall: deriveIsLoading(state.isLoading, "departments", false),
    //       departments: false,
    //     },
    //   };
    // case REDUCER_ACTIONS.UNITS_FETCH_SUCCESS:
    //   // Einheiten erfolgreich geholt
    //   return {
    //     ...state,
    //     units: action.payload,
    //     isLoading: {
    //       ...state.isLoading,
    //       overall: deriveIsLoading(state.isLoading, "units", false),
    //       units: false,
    //     },
    //   };
    // case REDUCER_ACTIONS.PRODUCT_UPDATED:
    //   // Einzelnes Produkt wurde angepasst
    //   return {
    //     ...state,
    //     data: state.data.map((product) => {
    //       if (product.uid === action.payload.uid) {
    //         product.name = action.payload.name;
    //         product.departmentName = action.payload.department.name;
    //         product.departmentUid = action.payload.department.uid;
    //         product.shoppingUnit = action.payload.shoppingUnit;
    //         product.usable = action.payload.usable;
    //       }
    //       return product;
    //     }),
    //     snackbar: {
    //       open: true,
    //       severity: "success",
    //       message: TEXT.PRODUCT_EDITED(action.payload.name),
    //     },
    //   };
    case REDUCER_ACTIONS.SNACKBAR_CLOSE:
      // Snackbar schliessen
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case REDUCER_ACTIONS.GENERIC_ERROR:
      // allgemeiner Fehler
      return {
        ...state,
        isError: true,
        error: action.payload,
        isLoading: false,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ------------------------------------------
// Ableiten ob Daten noch geladen werden
// ------------------------------------------ */
// const deriveIsLoading = (actualState, newField, newValue) => {
//   let counterTrue = 0;
//   actualState[newField] = newValue;

//   for (const [key, value] of Object.entries(actualState)) {
//     if (key !== "overall" && value === true) {
//       counterTrue += 1;
//     }
//   }
//   if (counterTrue === 0) {
//     return false;
//   } else {
//     return true;
//   }
// };

// const PRODUCT_POPUP_VALUES = {
//   productName: "",
//   department: { name: "", uid: "" },
//   shoppingUnit: "",
//   usable: false,
//   popUpOpen: false,
// };

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const UsersPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <UsersBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const UsersBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  // NEXT_FEATURE: liste mit unserInfos, passwort entsperren, blockieren,
  // User müssen zuerst gesucht werden, (nicht einfach alles anzeigen.)
  //

  // const [products, dispatchProducts] = React.useReducer(productsReducer, {
  //   data: [],
  //   filteredData: [],
  //   departments: [],
  //   units: [],
  //   error: {},
  //   isError: false,
  //   isLoading: {
  //     overall: false,
  //     products: false,
  //     units: false,
  //     departments: false,
  //   },
  //   snackbar: { open: false, severity: "success", message: "" },
  // });

  // const [productPopUpValues, setProductPopUpValues] = React.useState(
  //   PRODUCT_POPUP_VALUES
  // );

  // const [searchString, setSearchString] = React.useState("");

  // const [editMode, setEditMode] = React.useState(false);
  /* ------------------------------------------
	// Daten aus DB holen
	// ------------------------------------------ */
  // React.useEffect(() => {
  //   dispatchProducts({
  //     type: REDUCER_ACTIONS.FETCH_INIT,
  //     field: "products",
  //   });
  //   Product.getAllProducts({
  //     firebase: firebase,
  //     onlyUsable: false,
  //     withDepartmentName: true,
  //   })
  //     .then((result) => {
  //       dispatchProducts({
  //         type: REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS,
  //         payload: result,
  //       });
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       dispatchProducts({
  //         type: REDUCER_ACTIONS.GENERIC_ERROR,
  //         payload: error,
  //       });
  //     });
  // }, []);
  // React.useEffect(() => {
  //   if (editMode) {
  //     if (products.departments.length === 0) {
  //       dispatchProducts({
  //         type: REDUCER_ACTIONS.FETCH_INIT,
  //         field: "departments",
  //       });

  //       // Abteilungen holen
  //       Department.getAllDepartments(firebase)
  //         .then((result) => {
  //           dispatchProducts({
  //             type: REDUCER_ACTIONS.DEPARTMENTS_FETCH_SUCCESS,
  //             payload: result,
  //           });
  //         })
  //         .catch((error) => {
  //           console.error(error);
  //           dispatchProducts({
  //             type: REDUCER_ACTIONS.GENERIC_FAILURE,
  //             error: error,
  //           });
  //         });
  //     }
  //     if (products.units.length === 0) {
  //       dispatchProducts({
  //         type: REDUCER_ACTIONS.FETCH_INIT,
  //         field: "units",
  //       });
  //       Unit.getAllUnits(firebase)
  //         .then((result) => {
  //           let units = result.map((unit) => unit.key);

  //           dispatchProducts({
  //             type: REDUCER_ACTIONS.UNITS_FETCH_SUCCESS,
  //             payload: units,
  //           });
  //         })
  //         .catch((error) => {
  //           dispatchProducts({
  //             type: REDUCER_ACTIONS.GENERIC_ERROR,
  //             payload: error,
  //           });
  //         });
  //     }
  //   }
  //   // Einheiten holen
  // }, [editMode]);
  /* ------------------------------------------
	// Edit Mode wechsel
	// ------------------------------------------ */
  // const toggleEditMode = () => {
  //   setEditMode(!editMode);
  // };
  /* ------------------------------------------
	// onEdit Product
	// ------------------------------------------ */
  // const onEditProduct = (event, product) => {
  //   setProductPopUpValues({
  //     productUid: product.uid,
  //     productName: product.name,
  //     department: {
  //       uid: product.departmentUid,
  //       name: product.departmentName,
  //     },
  //     shoppingUnit: product.shoppingUnit,
  //     usable: product.usable,
  //     popUpOpen: true,
  //   });
  // };
  /* ------------------------------------------
	// PopUp close
	// ------------------------------------------ */
  // const onPopUpClose = () => {
  //   setProductPopUpValues(PRODUCT_POPUP_VALUES);
  // };
  /* ------------------------------------------
  // Produkt wurde angepasst
  // ------------------------------------------ */
  // const onProductEdited = (updatedProduct) => {
  //   dispatchProducts({
  //     type: REDUCER_ACTIONS.PRODUCT_UPDATED,
  //     payload: updatedProduct,
  //   });
  //   setProductPopUpValues(PRODUCT_POPUP_VALUES);
  // };

  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  // const handleSnackbarClose = (event, reason) => {
  //   if (reason === "clickaway") {
  //     return;
  //   }
  //   dispatchProducts({
  //     type: REDUCER_ACTIONS.SNACKBAR_CLOSE,
  //   });
  // };
  /* ------------------------------------------
  // Search String wurde angepasst
  // ------------------------------------------ */
  // const onUpdateSearchString = (event) => {
  //   setSearchString(event.target.value);
  //   dispatchProducts({
  //     type: REDUCER_ACTIONS.PRODUCTS_FILTER_LIST,
  //     payload: event.target.value,
  //   });
  // };
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT.PAGE_TITLE_USERS}
        subTitle={TEXT.PAGE_SUBTITLE_USERS}
      />
      {/* <ButtonRow
        key="buttons_edit"
        buttons={[
          {
            id: "edit",
            hero: true,
            visible: !editMode && authUser.roles.includes(ROLES.ADMIN),
            label: TEXT.BUTTON_EDIT,
            variant: "contained",
            color: "primary",
            onClick: toggleEditMode,
          },
          {
            id: "cancel",
            hero: true,
            visible:
              editMode &&
              (authUser.roles.includes(ROLES.SUB_ADMIN) ||
                authUser.roles.includes(ROLES.ADMIN)),
            label: TEXT.BUTTON_CANCEL,
            variant: "contained",
            color: "primary",
            onClick: toggleEditMode,
          },
        ]}
      /> */}
      {/* ===== BODY ===== */}
      {/* <Container className={classes.container} component="main" maxWidth="md">
        <Backdrop
          className={classes.backdrop}
          open={products.isLoading.overall}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}></Grid> */}
      {/* Fehler anzeigen? */}
      {/* {products.isError && (
          <Grid item key={"error"} xs={12}>
            <AlertMessage error={products.error} />
          </Grid>
        )}
        <Grid
          item
          key={"FilterPanel"}
          xs={12}
          className={classes.gridSearchInput}
        >
          <SearchInput
            searchString={searchString}
            onUpdateSearchString={onUpdateSearchString}
          />
        </Grid>
        <Grid item key={"ProductsPanel"} xs={12}>
          <br />
          <ProductsPanel
            products={products.filteredData}
            // onChangeField={onChangeEditTableField}
            onEditProduct={onEditProduct}
            editMode={editMode}
          />
        </Grid>
      </Container>
      <DialogProduct
        firebase={firebase}
        dialogType={PRODUCT_DIALOG_TYPE.EDIT}
        productUid={productPopUpValues.productUid}
        productName={productPopUpValues.productName}
        dialogOpen={productPopUpValues.popUpOpen}
        handleOk={onProductEdited}
        handleClose={onPopUpClose}
        selectedDepartment={products.departments.find(
          (department) => department.uid === productPopUpValues.department.uid
        )}
        selectedUnit={productPopUpValues.shoppingUnit}
        usable={productPopUpValues.usable}
        departments={products.departments}
        units={products.units}
      />
      <CustomSnackbar
        message={products.snackbar.message}
        severity={products.snackbar.severity}
        snackbarOpen={products.snackbar.open}
        handleClose={handleSnackbarClose}
      />*/}
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Produkte Panel ========================
// =================================================================== */

const ProductsPanel = ({
  products,
  onChangeField,
  onEditProduct,
  editMode,
}) => {
  const TABLE_COLUMS = [
    {
      id: "uid",
      type: TABLE_COLUMN_TYPES.STRING,
      textAlign: "center",
      disablePadding: false,
      label: TEXT.COLUMN_UID,
      visible: false,
    },
    {
      id: "name",
      type: TABLE_COLUMN_TYPES.STRING,
      textAlign: "left",
      disablePadding: false,
      label: TEXT.FIELD_PRODUCT,
      visible: true,
    },
    {
      id: "departmentName",
      type: TABLE_COLUMN_TYPES.STRING,
      textAlign: "left",
      disablePadding: false,
      label: TEXT.FIELD_DEPARTMENT,
      visible: true,
    },
    {
      id: "shoppingUnit",
      type: TABLE_COLUMN_TYPES.STRING,
      textAlign: "center",
      disablePadding: false,
      label: TEXT.FIELD_SHOPPING_UNIT,
      visible: true,
    },
    {
      id: "usable",
      type: TABLE_COLUMN_TYPES.CHECKBOX,
      textAlign: "center",
      disablePadding: false,
      label: TEXT.FIELD_USABLE,
      visible: true,
    },
    {
      id: "edit",
      type: TABLE_COLUMN_TYPES.BUTTON,
      textAlign: "center",
      disablePadding: false,
      iconButton: <EditIcon fontSize="small" />,
      visible: editMode,
    },
  ];
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardProductsPanel"}>
      <CardContent className={classes.cardContent} key={"cardPrdocutContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {products.length} {TEXT.PANEL_PRODUCTS}
        </Typography>

        <EnhancedTable
          tableData={products}
          tableColumns={TABLE_COLUMS}
          keyColum={"uid"}
          onIconClick={onEditProduct}
        />
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// =========================== Such Fenster ==========================
// =================================================================== */
const SearchInput = ({ searchString, onUpdateSearchString }) => {
  return (
    <React.Fragment>
      <InputLabel id={"SearchString"}>{TEXT.SEARCH_STRING}</InputLabel>
      <Input
        id={"searchString_input"}
        type={"text"}
        value={searchString}
        fullWidth={true}
        autoFocus
        autoComplete="off"
        onChange={onUpdateSearchString}
        endAdornment={
          <InputAdornment position="end">
            <IconButton aria-label="clear Search Term" edge="end" size="small">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </React.Fragment>
  );
};
const condition = (authUser) => authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(UsersPage);
