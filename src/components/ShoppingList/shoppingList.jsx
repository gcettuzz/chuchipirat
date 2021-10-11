import React from "react";
import { compose } from "recompose";

import { useHistory } from "react-router";
import { useTheme } from "@material-ui/core/styles";

import useMediaQuery from "@material-ui/core/useMediaQuery";

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import * as ROUTES from "../../constants/routes";
import * as ACTIONS from "../../constants/actions";
import * as TEXT from "../../constants/text";
import * as DEFAULT_VALUES from "../../constants/defaultValues";
import * as FIREBASE_MESSAGES from "../../constants/firebaseMessages";

import MoreVertIcon from "@material-ui/icons/MoreVert";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";

import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import AlertMessage from "../Shared/AlertMessage";
import CustomSnackbar from "../Shared/customSnackbar";

import Event from "../Event/event.class";
import Product from "../Product/product.class";
import Unit from "../Unit/unit.class";
import Menuplan from "../Menuplan/menuplan.class";
import Department from "../Department/department.class";
import ShoppingList from "./shoppingList.class";
import UnitConversion from "../Unit/unitConversion.class";
import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";
import DialogGenerateShoppingList from "./dialogGenerateShoppingList";
import DialogShoppingListItem, {
  DIALOG_TYPE as ITEM_DIALOG_TYPE,
} from "./dialogShoppingListItem";
import ShoppingListPdf from "./shoppingListPdf";

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
  INITIAL_TRANSFER: "INITIAL_TRANSFER",
  SHOPPING_LIST_FETCH_INIT: "SHOPPING_LIST_FETCH_INIT",
  SHOPPING_LIST_FETCH_SUCCESS: "SHOPPING_LIST_FETCH_SUCCESS",
  SHOPPING_LIST_CREATED: "SHOPPING_LIST_CREATED",
  SHOPPING_LIST_ON_SAVE: "SHOPPING_LIST_ON_SAVE",
  SHOPPING_LIST_UPDATE_POSITION_CHECKED: "SHOPPING_LIST_UPDATE_ITEM",
  SHOPPING_LIST_DELETE_ITEM: "SHOPPING_LIST_DELETE_ITEM",
  SHOPPING_LIST_ADD_ITEM: "SHOPPING_LIST_ADD_ITEM",
  SHOPPING_LIST_EDIT_ITEM: "SHOPPING_LIST_EDIT_ITEM",
  EVENT_FETCH_SUCCES: "EVENT_FETCH_SUCCES",
  UNITS_FETCH_SUCCESS: "UNITS_FETCH_SUCCESS",
  PRODUCTS_FETCH_SUCCESS: "PRODUCTS_FETCH_SUCCESS",
  PRODUCT_CREATED: "PRODUCT_CREATED",
  DEPARTMENTS_FETCH_SUCCES: "DEPARTMENTS_FETCH_SUCCES",
  UNIT_CONVERSION_BASIC_FETCH_SUCCESS: "UNIT_CONVERSION_BASIC_FETCH_SUCCESS",
  UNIT_CONVERSION_PRODUCTS_FETCH_SUCCESS:
    "UNIT_CONVERSION_PRODUCTS_FETCH_SUCCESS",
  MENUPLAN_FETCH_SUCCESS: "MENUPLAN_FETCH_SUCCESS",
  CLOSE_SNACKBAR: "CLOSE_SNACKBAR",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const shoppingListReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.INITIAL_TRANSFER:
      // Daten aus Props übernehmen
      return {
        ...state,
        menuplan: action.menuplan,
        event: action.event,
      };
    case REDUCER_ACTIONS.SHOPPING_LIST_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.SHOPPING_LIST_FETCH_SUCCESS:
      // Einkaufsliste gelesen
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isError: false,
        error: null,
      };
    case REDUCER_ACTIONS.SHOPPING_LIST_CREATED:
      // Einkaufsliste generiert
      return {
        ...state,
        data: {
          ...state.data,
          list: action.payload,
          dateFrom: action.dateFrom,
          dateTo: action.dateTo,
          mealFrom: action.mealFrom,
          mealTo: action.mealTo,
          generatedFromDisplayName: action.generatedFromDisplayName,
          generatedFromUid: action.generatedFromUid,
          generatedOn: action.generatedOn,
        },
        isLoading: false,
      };
    case REDUCER_ACTIONS.SHOPPING_LIST_ON_SAVE:
      // Einkaufsliste gespeichert
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: TEXT.SAVE_SUCCESS,
          open: true,
        },
      };
    case REDUCER_ACTIONS.SHOPPING_LIST_UPDATE_POSITION_CHECKED: {
      // Position updaten
      let tmpList = state.data.list;
      let department = tmpList.find(
        (department) => department.uid === action.departmentUid
      );
      let item = department.items.find(
        (item) => item.uid === action.itemUid && item.unit === action.itemUnit
      );

      // Checkbox umkehren
      item.checked = !item.checked;

      return {
        ...state,
        data: { ...state.data, list: tmpList },
      };
    }
    case REDUCER_ACTIONS.SHOPPING_LIST_DELETE_ITEM: {
      // Position löschen
      let tmpList = state.data.list;
      let department = tmpList.find(
        (department) => department.uid === action.departmentUid
      );

      department.items = department.items.filter(
        (item) => item.uid !== action.itemUid || item.unit !== action.itemUnit
      );

      // Eine Abteilung ohne Produkte, muss weggelöscht werden.
      if (department.items.length === 0) {
        tmpList = tmpList.filter(
          (department) => department.uid !== action.departmentUid
        );
      }
      return {
        ...state,
        data: { ...state.data, list: tmpList },
      };
    }
    case REDUCER_ACTIONS.SHOPPING_LIST_ADD_ITEM:
      // neue Position einfügen
      let tmpList = state.data.list;
      tmpList = ShoppingList.addProductToShoppingList({
        list: tmpList,
        productToAdd: action.payload.product,
        quantity: parseFloat(action.payload.quantity),
        unit: action.payload.unit ? action.payload.unit : "",
        products: state.products,
        departments: state.departments,
        manualAdded: true,
      });
      return {
        ...state,
        data: { ...state.data, list: tmpList },
      };
    case REDUCER_ACTIONS.SHOPPING_LIST_EDIT_ITEM: {
      // Position updaten
      let tmpList = state.data.list;
      let department = tmpList.find(
        (department) => department.uid === action.departmentUid
      );
      let item = department.items.find(
        (item) => item.uid === action.payload.product.uid
      );

      item.quantity = action.payload.quantity;
      item.unit = action.payload.unit ? action.payload.unit : "";
      item.manualEdit = true;
      return {
        ...state,
        data: { ...state.data, list: tmpList },
      };
    }
    case REDUCER_ACTIONS.EVENT_FETCH_SUCCES:
      // Event setzen
      return {
        ...state,
        event: action.payload,
      };
    case REDUCER_ACTIONS.UNITS_FETCH_SUCCESS:
      // Einheiten geholt
      return {
        ...state,
        units: action.payload,
        isLoading: false,
      };
    case REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS:
      // Produkte geholt
      return {
        ...state,
        products: action.payload,
      };
    case REDUCER_ACTIONS.PRODUCT_CREATED:
      // Neues Produkt generiert
      let tmpProducts = state.products;
      tmpProducts.push(action.payload);

      return {
        ...state,
        products: tmpProducts,
      };
    case REDUCER_ACTIONS.DEPARTMENTS_FETCH_SUCCES:
      // Abteilungen geholt
      return {
        ...state,
        departments: action.payload,
      };
    case REDUCER_ACTIONS.UNIT_CONVERSION_BASIC_FETCH_SUCCESS:
      // Umrechnungen geholt
      return {
        ...state,
        unitConversionBasic: action.payload,
      };
    case REDUCER_ACTIONS.UNIT_CONVERSION_PRODUCTS_FETCH_SUCCESS:
      // Produktumrechnungen geholt
      return {
        ...state,
        unitConversionProducts: action.payload,
      };
    case REDUCER_ACTIONS.MENUPLAN_FETCH_SUCCESS:
      // Menüplan setzen
      return {
        ...state,
        menuplan: action.payload,
      };
    case REDUCER_ACTIONS.GENERIC_ERROR:
      return {
        ...state,
        isLoading: false,
        isError: true,
        error: action.payload,
      };
    case REDUCER_ACTIONS.CLOSE_SNACKBAR:
      return {
        ...state,
        isError: false,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const ShoppingListPage = (props) => {
  const classes = useStyles();
  const { push } = useHistory();

  const firebase = props.firebase;

  return (
    <AuthUserContext.Consumer>
      {(authUser) => <ShoppingListBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const ShoppingListBase = ({ props, authUser }) => {
  const classes = useStyles();
  const firebase = props.firebase;

  const { push } = useHistory();

  const [shoppingList, dispatchShoppingList] = React.useReducer(
    shoppingListReducer,
    {
      data: [],
      event: {},
      menuplan: {},
      products: [],
      units: [],
      departments: [],
      unitConversionBasic: [],
      unitConversionProducts: [],
      isLoading: false,
      isError: false,
      error: null,
      snackbar: { open: false, severity: "success", message: "" },
    }
  );

  const [generateShoppingListPopUp, setGenerateShoppingListPopUp] =
    React.useState({
      open: false,
    });
  const [shoppingListItemPopUp, setShoppingListItemPopUp] = React.useState({
    item: null,
    open: false,
  });

  // Handler für Mehr-Menü bei den einzelen Positionen
  const [menuItemAnchorEl, setMenuItemAnchorEl] = React.useState(null);
  const [selectedItem, setSelectedItem] = React.useState();

  let urlUid;
  if (!urlUid) {
    urlUid = props.match.params.id;
  }
  /* ------------------------------------------
  // Daten aus DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    if (!props.location.state) {
      dispatchShoppingList({
        type: REDUCER_ACTIONS.SHOPPING_LIST_FETCH_INIT,
      });

      // Event nachlesen
      Event.getEvent({ firebase: firebase, uid: urlUid })
        .then((result) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.EVENT_FETCH_SUCCES,
            payload: result,
          });
        })
        .catch((error) => {
          console.error(error);
          dispatchShoppingList({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });

      // Menuplan lesen
      Menuplan.getMenuplan({ firebase: firebase, uid: urlUid })
        .then((result) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.MENUPLAN_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          console.error(error);
          dispatchShoppingList({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    } else {
      dispatchShoppingList({
        type: REDUCER_ACTIONS.INITIAL_TRANSFER,
        event: props.location.state.event,
        menuplan: props.location.state.menuplan,
      });
    }
    if (shoppingList.products.length === 0) {
      // Produkte und Abteilungen im Hintergrund nachlesen
      Product.getAllProducts({
        firebase: firebase,
        onlyUsable: false,
        withDepartmentName: true,
      })
        .then((result) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    }
    if (shoppingList.units.length === 0) {
      // Einheiten holen
      dispatchShoppingList({
        type: REDUCER_ACTIONS.SHOPPING_LIST_FETCH_INIT,
      });

      Unit.getAllUnits(firebase)
        .then((result) => {
          let units = result.map((unit) => unit.key);

          dispatchShoppingList({
            type: REDUCER_ACTIONS.UNITS_FETCH_SUCCESS,
            payload: units,
          });
        })
        .catch((error) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    }
  }, []);

  React.useEffect(() => {
    // Shoppingliste holen
    dispatchShoppingList({
      type: REDUCER_ACTIONS.SHOPPING_LIST_FETCH_INIT,
    });

    if (shoppingList.event?.uid) {
      ShoppingList.getShoppingList({
        firebase: firebase,
        eventUid: shoppingList.event.uid,
      })
        .then((result) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.SHOPPING_LIST_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    }
  }, [shoppingList.event]);
  /* ------------------------------------------
  // Postizettel speichern
  // ------------------------------------------ */
  const onSave = () => {
    ShoppingList.save({
      firebase: firebase,
      eventUid: shoppingList.event.uid,
      shoppingList: shoppingList.data,
      authUser: authUser,
    })
      .then(() => {
        dispatchShoppingList({
          type: REDUCER_ACTIONS.SHOPPING_LIST_ON_SAVE,
        });
      })
      .catch((error) => {
        dispatchShoppingList({
          type: REDUCER_ACTIONS.GENERIC_ERROR,
          payload: error,
        });
      });
  };
  /* ------------------------------------------
  //  Mengenberechnung öffnen
  // ------------------------------------------ */
  const onMenuplan = () => {
    push({
      pathname: `${ROUTES.MENUPLAN}/${shoppingList.event.uid}`,
      state: {
        action: ACTIONS.VIEW,
        menuplan: shoppingList.menuplan,
        event: shoppingList.event,
      },
    });
  };
  /* ------------------------------------------
  //  PDF generieren
  // ------------------------------------------ */
  const onPrintVersion = async () => {
    const doc = (
      <ShoppingListPdf
        event={shoppingList.event}
        shoppingList={shoppingList.data}
        authUser={authUser}
      />
    );
    const asPdf = pdf([]);
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    saveAs(
      blob,
      TEXT.SHOPPING_LIST + " " + shoppingList.event.name + TEXT.SUFFIX_PDF
    );
  };
  /* ------------------------------------------
  //  Produkt hinzufügen
  // ------------------------------------------ */
  const onAddProduct = () => {
    if (shoppingList.departments.length === 0) {
      // Abteilungen nachlesen
      Department.getAllDepartments(firebase)
        .then((result) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.DEPARTMENTS_FETCH_SUCCES,
            payload: result,
          });
        })
        .catch((error) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    }

    setShoppingListItemPopUp({
      ...shoppingListItemPopUp,
      dialogType: ITEM_DIALOG_TYPE.ADD,
      open: true,
    });
  };
  /* ------------------------------------------
  // Einkaufszettel generieren
  // ------------------------------------------ */
  const onGenerateShoppingList = (dialogValues) => {
    // Warten anzeigen
    dispatchShoppingList({
      type: REDUCER_ACTIONS.SHOPPING_LIST_FETCH_INIT,
    });
    ShoppingList.generateShoppingList({
      firebase: firebase,
      dateFrom: dialogValues.dateFrom,
      dateTo: dialogValues.dateTo,
      mealFrom: dialogValues.mealFrom,
      mealTo: dialogValues.mealTo,
      convertUnits: dialogValues.convertUnits,
      products: shoppingList.products,
      menuplan: shoppingList.menuplan,
      departments: shoppingList.departments,
      unitConversionBasic: shoppingList.unitConversionBasic,
      unitConversionProducts: shoppingList.unitConversionProducts,
    })
      .then((result) => {
        dispatchShoppingList({
          type: REDUCER_ACTIONS.SHOPPING_LIST_CREATED,
          payload: result,
          dateFrom: dialogValues.dateFrom,
          dateTo: dialogValues.dateTo,
          mealFrom: dialogValues.mealFrom,
          mealTo: dialogValues.mealTo,
          generatedFromDisplayName: authUser.publicProfile.displayName,
          generatedFromUid: authUser.uid,
          generatedOn: new Date(),
        });
      })
      .catch((error) => {
        dispatchShoppingList({
          type: REDUCER_ACTIONS.GENERIC_ERROR,
          payload: error,
        });
      });

    setGenerateShoppingListPopUp({
      ...generateShoppingListPopUp,
      open: false,
    });
  };
  /* ------------------------------------------
  // Einkaufszettel PopUp -  öffnen
  // ------------------------------------------ */
  const onGenerateShoppingListOpen = () => {
    // if (shoppingList.products.length === 0) {
    //   // Produkte und Abteilungen im Hintergrund nachlesen
    //   Product.getAllProducts({
    //     firebase: firebase,
    //     onlyUsable: false,
    //     withDepartmentName: true,
    //   })
    //     .then((result) => {
    //       dispatchShoppingList({
    //         type: REDUCER_ACTIONS.PRODUCTS_FETCH_SUCCESS,
    //         payload: result,
    //       });
    //     })
    //     .catch((error) => {
    //       dispatchShoppingList({
    //         type: REDUCER_ACTIONS.GENERIC_ERROR,
    //         payload: error,
    //       });
    //     });
    // }
    //UnitConversions holen
    if (shoppingList.unitConversionBasic.length === 0) {
      UnitConversion.getAllConversionBasic(firebase)
        .then((result) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.UNIT_CONVERSION_BASIC_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    }
    if (shoppingList.unitConversionProducts.length === 0) {
      UnitConversion.getAllConversionProducts(firebase)
        .then((result) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.UNIT_CONVERSION_PRODUCTS_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    }
    if (shoppingList.departments.length === 0) {
      // Abteilungen nachlesen
      Department.getAllDepartments(firebase)
        .then((result) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.DEPARTMENTS_FETCH_SUCCES,
            payload: result,
          });
        })
        .catch((error) => {
          dispatchShoppingList({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    }

    setGenerateShoppingListPopUp({
      ...generateShoppingListPopUp,
      open: true,
    });
  };
  /* ------------------------------------------
  // Einkaufszettel PopUp -  schliessen
  // ------------------------------------------ */
  const onGenerateShoppingListClose = () => {
    setGenerateShoppingListPopUp({
      ...generateShoppingListPopUp,
      open: false,
    });
  };
  /* ------------------------------------------
  // Item PopUp -  Bestätigt
  // ------------------------------------------ */
  const onShoppingListItemPopUpOk = (dialogValues) => {
    switch (shoppingListItemPopUp.dialogType) {
      case ITEM_DIALOG_TYPE.ADD:
        dispatchShoppingList({
          type: REDUCER_ACTIONS.SHOPPING_LIST_ADD_ITEM,
          payload: dialogValues,
        });
        break;
      case ITEM_DIALOG_TYPE.EDIT:
        dispatchShoppingList({
          type: REDUCER_ACTIONS.SHOPPING_LIST_EDIT_ITEM,
          payload: dialogValues,
          departmentUid: selectedItem.departmentUid,
        });

        break;
    }

    setShoppingListItemPopUp({
      ...shoppingListItemPopUp,
      item: null,
      open: false,
    });
    setSelectedItem();
  };
  /* ------------------------------------------
  // Item PopUp -  schliessen
  // ------------------------------------------ */
  const onShoppingListItemPopUpClose = () => {
    setShoppingListItemPopUp({
      ...shoppingListItemPopUp,
      open: false,
    });
  };
  /* ------------------------------------------
  // Checkbox aus Liste setzen
  // ------------------------------------------ */
  const onItemCheckboxChange = (event) => {
    let pressedCheckbox = event.target.name.split("_");

    dispatchShoppingList({
      type: REDUCER_ACTIONS.SHOPPING_LIST_UPDATE_POSITION_CHECKED,
      departmentUid: pressedCheckbox[1],
      itemUid: pressedCheckbox[2],
      itemUnit: pressedCheckbox[3],
    });
  };
  /* ------------------------------------------
  // Kontexmenü öffnen
  // ------------------------------------------ */
  const onItemContextMenuOpen = (event) => {
    // Zwischenspeichern bei welchem Element das Menü auf-
    // gerufen wurde
    let pressedButton = event.currentTarget.id.split("_");
    setSelectedItem({
      departmentUid: pressedButton[1],
      productId: pressedButton[2],
      unit: pressedButton[3],
    });
    setMenuItemAnchorEl(event.currentTarget);
  };
  /* ------------------------------------------
  // Kontextmenü schliessen
  // ------------------------------------------ */
  const onItemContextMenuClose = () => {
    setMenuItemAnchorEl();
    setMenuItemAnchorEl(null);
  };
  /* ------------------------------------------
  // Kontextmenü Klick
  // ------------------------------------------ */
  const onItemContextMenuClick = (event) => {
    let pressedButton = event.currentTarget.id.split("_");

    switch (pressedButton[0]) {
      case ACTIONS.EDIT:
        setShoppingListItemPopUp({
          ...shoppingListItemPopUp,
          dialogType: ITEM_DIALOG_TYPE.EDIT,
          open: true,
          item: shoppingList.data.list
            .find((department) => department.uid === selectedItem.departmentUid)
            .items.find((item) => item.uid === selectedItem.productId),
        });

        break;
      case ACTIONS.DELETE:
        dispatchShoppingList({
          type: REDUCER_ACTIONS.SHOPPING_LIST_DELETE_ITEM,
          departmentUid: selectedItem.departmentUid,
          itemUid: selectedItem.productId,
          itemUnit: selectedItem.unit,
        });
        break;
    }

    setMenuItemAnchorEl(null);
  };
  /* ------------------------------------------
  // Ein neues Produkt wurde angelegt
  // ------------------------------------------ */
  // In Liste aufnehmen, damit es während der Session
  // ohne DB-Read  auch noch zur Verfügung steht.
  const onProductCreate = (newProduct) => {
    dispatchShoppingList({
      type: REDUCER_ACTIONS.PRODUCT_CREATED,
      payload: newProduct,
    });
  };
  /* ------------------------------------------
  // Snackback schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatchShoppingList({
      type: REDUCER_ACTIONS.CLOSE_SNACKBAR,
    });
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      {shoppingList.error?.code !==
        FIREBASE_MESSAGES.GENERAL.PERMISSION_DENIED && (
        <PageHeader
          shoppingList={shoppingList}
          onGenerate={onGenerateShoppingListOpen}
          onSave={onSave}
          onMenuplan={onMenuplan}
          onPrintVersion={onPrintVersion}
          authUser={authUser}
        />
      )}
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Backdrop className={classes.backdrop} open={shoppingList.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container justify="center" alignItems="flex-start" spacing={2}>
          {shoppingList.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={shoppingList.error}
                messageTitle={TEXT.ALERT_TITLE_WAIT_A_MINUTE}
              />
            </Grid>
          )}
          {shoppingList.error?.code !==
            FIREBASE_MESSAGES.GENERAL.PERMISSION_DENIED && (
            <Grid item key={"gridActionButtons"} xs={12}>
              {/* TextButtons für Aktionen */}
              <ListHeaderButtons onAddProduct={onAddProduct} />
            </Grid>
          )}
          {shoppingList.data.dateFrom && (
            <PeriodBlock shoppingList={shoppingList} />
          )}
          {shoppingList.data.list && (
            <ListBlock
              shoppingList={shoppingList}
              onItemCheckboxChange={onItemCheckboxChange}
              onItemContextMenuClick={onItemContextMenuOpen}
            />
          )}
        </Grid>
      </Container>
      <PositionMenu
        anchorEl={menuItemAnchorEl}
        handleMenuClick={onItemContextMenuClick}
        handleMenuClose={onItemContextMenuClose}
      />
      <DialogGenerateShoppingList
        firebase={firebase}
        dialogOpen={generateShoppingListPopUp.open}
        handleOk={onGenerateShoppingList}
        handleClose={onGenerateShoppingListClose}
        dates={shoppingList.menuplan.dates}
        meals={shoppingList.menuplan.meals}
      />
      <DialogShoppingListItem
        dialogOpen={shoppingListItemPopUp.open}
        handleOk={onShoppingListItemPopUpOk}
        handleClose={onShoppingListItemPopUpClose}
        dialogType={shoppingListItemPopUp.dialogType}
        product={{
          name: shoppingListItemPopUp.item?.name,
          uid: shoppingListItemPopUp.item?.uid,
        }}
        quantity={shoppingListItemPopUp.item?.quantity}
        unit={shoppingListItemPopUp.item?.unit}
        products={shoppingList.products}
        units={shoppingList.units}
        departments={shoppingList.departments}
        handleProductCreate={onProductCreate}
      />
      <CustomSnackbar
        message={shoppingList.snackbar.message}
        severity={shoppingList.snackbar.severity}
        snackbarOpen={shoppingList.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </React.Fragment>
  );
};

/* ===================================================================
// ============================= Page Header =========================
// =================================================================== */
const PageHeader = ({
  shoppingList,
  onGenerate,
  onSave,
  onMenuplan,
  onPrintVersion,
  authUser,
}) => {
  const theme = useTheme();

  const secondaryButtons = [
    {
      id: "menuplan",
      hero: true,
      label: TEXT.BUTTON_MENUPLAN,
      variant: "outlined",
      color: "primary",
      visible: true,
      onClick: onMenuplan,
    },
    {
      id: "print",
      hero: true,
      label: TEXT.BUTTON_PRINTVERSION,
      variant: "contained",
      color: "primary",
      visible: true,
      onClick: onPrintVersion,
    },
  ];

  return (
    <React.Fragment>
      <PageTitle
        title={TEXT.PAGE_TITLE_SHOPPING_LIST}
        subTitle={shoppingList.event.name}
      />
      <ButtonRow
        key="buttons_create"
        buttons={[
          {
            id: "generate",
            hero: true,
            label: TEXT.BUTTON_GENERATE,
            variant: "contained",
            color: "primary",
            visible: true,
            onClick: onGenerate,
          },
          {
            id: "save",
            hero: true,
            label: TEXT.BUTTON_SAVE,
            variant: "outlined",
            color: "primary",
            visible: true,
            onClick: onSave,
          },
        ]}
        buttonGroup={
          useMediaQuery(theme.breakpoints.down("xs"), { noSsr: true })
            ? null
            : secondaryButtons
        }
        splitButtons={
          useMediaQuery(theme.breakpoints.down("xs"), { noSsr: true })
            ? secondaryButtons
            : null
        }
      />
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Buttons Tabelle =======================
// =================================================================== */
const ListHeaderButtons = ({ onAddProduct }) => {
  return (
    <ButtonRow
      buttons={[
        {
          id: "addProduct",
          visible: true,
          label: TEXT.BUTTON_ADD_PRODUCT,
          color: "primary",
          onClick: onAddProduct,
        },
      ]}
    />
  );
};

/* ===================================================================
// ======================= Zeitraum Einkaufsliste ====================
// =================================================================== */
const PeriodBlock = ({ shoppingList }) => {
  return (
    <Grid item xs={12}>
      <Typography variant="subtitle1" align="center">
        {shoppingList.data.dateFrom.toLocaleString("default", {
          weekday: "long",
        }) +
          ", " +
          shoppingList.data.dateFrom.toLocaleString("de-CH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }) +
          " " +
          shoppingList.data.mealFrom.name +
          " – " +
          shoppingList.data.dateTo.toLocaleString("default", {
            weekday: "long",
          }) +
          ", " +
          shoppingList.data.dateTo.toLocaleString("de-CH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }) +
          " " +
          shoppingList.data.mealTo.name}
      </Typography>
      <Typography variant="subtitle2" align="center" color="textSecondary">
        {TEXT.SHOPPING_LIST_GENERATED_ON}
        {shoppingList.data.generatedOn.toLocaleString("de-CH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}
        {" - "}
        {TEXT.SHOPPING_LIST_GENERATED_FROM}
        {shoppingList.data.generatedFromDisplayName}
      </Typography>
    </Grid>
  );
};
/* ===================================================================
// =============================== Liste =============================
// =================================================================== */
const ListBlock = ({
  shoppingList,
  onItemCheckboxChange,
  onItemContextMenuClick,
}) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {shoppingList.data.list.map(
        (department) =>
          department.items.length > 0 && (
            <Grid item xs={12} key={"grid_" + department.uid}>
              <Typography
                variant="h6"
                component="h2"
                className={classes.typographyShoppingListDepartment}
              >
                {department.name}
              </Typography>
              <DepartmentItemsBlock
                departmentUid={department.uid}
                items={department.items}
                onCheckboxChange={onItemCheckboxChange}
                onContextMenuClick={onItemContextMenuClick}
              />
            </Grid>
          )
        // );
      )}
    </React.Fragment>
  );
};

/* ===================================================================
// ====================== Einträge pro Abteilung =====================
// =================================================================== */
const DepartmentItemsBlock = ({
  departmentUid,
  items,
  onCheckboxChange,
  onContextMenuClick,
}) => {
  const classes = useStyles();

  return (
    <List dense={false} className={classes.listShoppingList}>
      {items.map((item) => (
        <ListItem
          key={"listitem_" + departmentUid + "_" + item.uid + "_" + item.unit}
          button
          className={classes.listShoppingListItem}
        >
          <ListItemIcon>
            <Checkbox
              key={
                "checkbox_" + departmentUid + "_" + item.uid + "_" + item.unit
              }
              name={
                "checkbox_" + departmentUid + "_" + item.uid + "_" + item.unit
              }
              onChange={onCheckboxChange}
              checked={item.checked}
              color={"primary"}
              disableRipple
            />
          </ListItemIcon>
          <ListItemText
            className={classes.shoppingListItemTextQuantity}
            primaryTypographyProps={
              item.checked
                ? { color: "textSecondary" }
                : { color: "textPrimary" }
            }
            key={"quantity" + departmentUid + "_" + item.uid + "_" + item.unit}
            primary={
              item.checked ? (
                <del>
                  {Number.isNaN(item.quantity)
                    ? ""
                    : new Intl.NumberFormat("de-CH", {
                        maximumSignificantDigits: 3,
                      }).format(item.quantity)}
                </del>
              ) : Number.isNaN(item.quantity) ? (
                ""
              ) : (
                new Intl.NumberFormat("de-CH", {
                  maximumSignificantDigits: 3,
                }).format(item.quantity)
              )
            }
          />
          <ListItemText
            className={classes.shoppingListItemTextUnit}
            primaryTypographyProps={
              item.checked
                ? { color: "textSecondary" }
                : { color: "textPrimary" }
            }
            key={"unit_" + departmentUid + "_" + item.uid + "_" + item.unit}
            primary={item.checked ? <del>{item.unit}</del> : item.unit}
          />
          <ListItemText
            className={classes.shoppingListItemTextProduct}
            primaryTypographyProps={
              item.checked
                ? { color: "textSecondary" }
                : { color: "textPrimary" }
            }
            key={"itemName_" + departmentUid + "_" + item.uid + "_" + item.unit}
            primary={item.checked ? <del>{item.name}</del> : item.name}
          />
          <ListItemSecondaryAction>
            <div>
              <IconButton
                id={
                  "MoreBtn_" + departmentUid + "_" + item.uid + "_" + item.unit
                }
                aria-label="settings"
                onClick={onContextMenuClick}
              >
                <MoreVertIcon />
              </IconButton>
            </div>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};
/* ===================================================================
// ===================== Kontextmenü für Positionen ==================
// =================================================================== */
const PositionMenu = ({ anchorEl, handleMenuClick, handleMenuClose }) => {
  return (
    <Menu
      keepMounted
      id={"positionMenu"}
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem id={ACTIONS.EDIT + "_item"} onClick={handleMenuClick}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{TEXT.BUTTON_CHANGE}</Typography>
      </MenuItem>
      <MenuItem id={ACTIONS.DELETE + "_item"} onClick={handleMenuClick}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {TEXT.BUTTON_DELETE}
        </Typography>
      </MenuItem>
    </Menu>
  );
};

const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(ShoppingListPage);
