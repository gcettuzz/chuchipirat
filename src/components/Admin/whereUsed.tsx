import React from "react";
import {compose} from "react-recompose";

import {
  Stack,
  Container,
  Backdrop,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  AutocompleteChangeReason,
} from "@mui/material";

import {
  TRACE as TEXT_TRACE,
  WHERE_ARE_YOUR as TEXT_WHERE_ARE_YOUR,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
  START_TRACE as TEXT_START_TRACE,
  WHERE_USED as TEXT_WHERE_USED,
  OR as TEXT_OR,
  RECIPE as TEXT_RECIPE,
  UID as TEXT_UID,
  FOUND_DOCUMENTS as TEXT_FOUND_DOCUMENTS,
} from "../../constants/text";
import Role from "../../constants/roles";

import useCustomStyles from "../../constants/styles";
import PageTitle from "../Shared/pageTitle";

import Product from "../Product/product.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../Shared/global.interface";
import {
  SNACKBAR_INITIAL_STATE_VALUES,
  Snackbar,
} from "../Shared/customSnackbar";
import Material from "../Material/material.class";
import AlertMessage from "../Shared/AlertMessage";
import Utils from "../Shared/utils.class";
import ItemAutocomplete, {
  MaterialItem,
  ProductItem,
} from "../Event/ShoppingList/itemAutocomplete";
import WhereUsed, {TraceObject} from "./whereUsed.class";
import Recipe from "../Recipe/recipe.class";
import {ItemType} from "../Event/ShoppingList/shoppingList.class";
import {TextFieldSize} from "../../constants/defaultValues";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  PRODUCTS_FETCH_INIT,
  PRODUCTS_FETCH_SUCCESS,
  MATERIALS_FETCH_INIT,
  MATERIALS_FETCH_SUCCESS,
  UPDATE_SELECTION,
  TRACE_START,
  TRACE_DONE,
  SNACKBAR_CLOSE,
  GENERIC_ERROR,
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  selectedItem: ProductItem | MaterialItem | null;
  selectedRecipeUid: Recipe["uid"];
  products: Product[];
  materials: Material[];
  isTracing: boolean;
  isLoading: boolean;
  loadingComponents: {
    materials: boolean;
    products: boolean;
  };
  error: Error | null;
  snackbar: Snackbar;
  tracedFiles: {document: string; name: string}[];
  noOfFoundFiles: number;
};

const inititialState: State = {
  selectedItem: null,
  selectedRecipeUid: "",
  products: [],
  materials: [],
  isTracing: false,
  isLoading: false,
  loadingComponents: {materials: false, products: false},
  error: null,
  snackbar: SNACKBAR_INITIAL_STATE_VALUES,
  tracedFiles: [],
  noOfFoundFiles: -1,
};

const whereUsedReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.PRODUCTS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, products: true},
      };
    case ReducerActions.PRODUCTS_FETCH_SUCCESS:
      // Produkte geholt
      return {
        ...state,
        products: action.payload as Product[],
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          products: false,
        }),
        loadingComponents: {...state.loadingComponents, products: false},
      };
    case ReducerActions.MATERIALS_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        loadingComponents: {...state.loadingComponents, materials: true},
      };
    case ReducerActions.MATERIALS_FETCH_SUCCESS:
      // Materiale geholt
      return {
        ...state,
        materials: action.payload as Material[],
        isLoading: Utils.deriveIsLoading({
          ...state.loadingComponents,
          materials: false,
        }),
        loadingComponents: {...state.loadingComponents, materials: false},
      };
    case ReducerActions.UPDATE_SELECTION:
      return {...state, ...action.payload};
    case ReducerActions.TRACE_START:
      // Ladebalken anzeigen
      return {
        ...state,
        isTracing: true,
        tracedFiles: inititialState.tracedFiles,
        noOfFoundFiles: inititialState.noOfFoundFiles,
      };
    case ReducerActions.TRACE_DONE:
      return {
        ...state,
        isTracing: false,
        tracedFiles: action.payload as State["tracedFiles"],
        noOfFoundFiles: action.payload.length,
      };
    case ReducerActions.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isTracing: false,
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
const WhereUsedPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <WhereUsedBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const WhereUsedBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useCustomStyles();

  const [state, dispatch] = React.useReducer(whereUsedReducer, inititialState);

  /* ------------------------------------------
  // Produkte, Materialien
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatch({type: ReducerActions.PRODUCTS_FETCH_INIT, payload: {}});
    Product.getAllProducts({
      firebase: firebase,
      onlyUsable: false,
      withDepartmentName: false,
    })
      .then((result) => {
        dispatch({
          type: ReducerActions.PRODUCTS_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  }, []);

  React.useEffect(() => {
    dispatch({type: ReducerActions.MATERIALS_FETCH_INIT, payload: {}});

    Material.getAllMaterials({firebase: firebase, onlyUsable: false})
      .then((result) => {
        dispatch({
          type: ReducerActions.MATERIALS_FETCH_SUCCESS,
          payload: result,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  }, []);

  /* ------------------------------------------
	// Felder Updatem
	// ------------------------------------------ */
  const onFieldUpdate = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>,
    newValue?: string | MaterialItem | ProductItem | null,
    action?: AutocompleteChangeReason,
  ) => {
    let updatedValues = {};
    switch (event.target.id.split("_")[0]) {
      case "recipeUid":
        updatedValues = {
          selectedRecipeUid: event.target?.value,
        };
        break;
      case "item":
        if (action === "blur" && typeof newValue === "string") {
          // Der Blur, bringt nur den Text-Eintrag
          // --> nicht das Objekt, daher Abbruch
          return;
        }
        updatedValues = {
          selectedItem: newValue,
        };
        break;
      default:
        if (action == "clear") {
          // Autocomplete wurde gelöscht
          updatedValues = {
            selectedItem: null,
          };
        } else {
          console.warn("Target-ID unbekannt: ", event.target.id);
          return;
        }
    }

    dispatch({type: ReducerActions.UPDATE_SELECTION, payload: updatedValues});
  };

  /* ------------------------------------------
  // Trace starten
  // ------------------------------------------ */
  const onStartTrace = async () => {
    if (
      !state.selectedRecipeUid &&
      (state.selectedItem === null || state.selectedItem.uid == "")
    ) {
      return;
    }

    dispatch({type: ReducerActions.TRACE_START, payload: {}});
    WhereUsed.trace({
      uid:
        state.selectedRecipeUid !== ""
          ? state.selectedRecipeUid
          : state.selectedItem!.uid,
      callback: (documentList) => {
        dispatch({type: ReducerActions.TRACE_DONE, payload: documentList});
      },
      objectType: state.selectedRecipeUid
        ? TraceObject.recipe
        : state.selectedItem?.itemType === ItemType.food
          ? TraceObject.product
          : state.selectedItem?.itemType === ItemType.material
            ? TraceObject.material
            : TraceObject.none,
      firebase: firebase,
      authUser: authUser!,
    }).catch((error) => {
      console.error(error);
      dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
    });
  };
  /* ------------------------------------------
  // Trace Resultat löschen
  // ------------------------------------------ */

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_TRACE} subTitle={TEXT_WHERE_ARE_YOUR} />

      {/* ===== BODY ===== */}
      <Container sx={classes.container} component="main" maxWidth="sm">
        <Backdrop sx={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Stack spacing={2}>
          {state.error && (
            <AlertMessage
              error={state.error}
              messageTitle={TEXT_ALERT_TITLE_UUPS}
            />
          )}

          {state.isLoading ? (
            <Skeleton />
          ) : (
            <SearchPanel
              products={state.products}
              materials={state.materials}
              selectedItem={state.selectedItem}
              selectedRecipe={state.selectedRecipeUid}
              isTracing={state.isTracing}
              onStartTrace={onStartTrace}
              onFieldUpdate={onFieldUpdate}
            />
          )}
          {state.noOfFoundFiles >= 0 && (
            <ResultPanel documentList={state.tracedFiles} />
          )}
        </Stack>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Panel Suche ))=========================
// =================================================================== */
interface SearchPanelProps {
  products: Product[];
  materials: Material[];
  selectedItem: ProductItem | MaterialItem | null;
  selectedRecipe: Recipe["uid"];
  isTracing: boolean;
  onFieldUpdate: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>,
    newValue?: string | MaterialItem | ProductItem | null,
  ) => void;
  onStartTrace: () => void;
}
const SearchPanel = ({
  products,
  materials,
  selectedItem,
  selectedRecipe,
  isTracing,
  onFieldUpdate,
  onStartTrace,
}: SearchPanelProps) => {
  const classes = useCustomStyles();

  return (
    <Card sx={classes.card} key={"cardProduct"}>
      <CardContent sx={classes.cardContent} key={"cardContentProduct"}>
        <Stack spacing={2}>
          <Typography gutterBottom={true} variant="h5" component="h2">
            {TEXT_WHERE_USED}
          </Typography>

          <ItemAutocomplete
            componentKey="item"
            materials={materials}
            products={products}
            item={selectedItem}
            disabled={false}
            onChange={onFieldUpdate}
            error={{isError: false, errorText: ""}}
            allowCreateNewItem={false}
            size={TextFieldSize.medium}
          />
          <Divider>{TEXT_OR.toLocaleUpperCase()}</Divider>
          <TextField
            margin="normal"
            id="recipeUid"
            key="recipeUid"
            label={`${TEXT_RECIPE} ${TEXT_UID}`}
            name={"recipeUid"}
            value={selectedRecipe}
            fullWidth
            onChange={onFieldUpdate}
          />
          <Button
            disabled={
              (selectedRecipe === "" &&
                (!selectedItem || selectedItem.uid === "")) ||
              (!!selectedItem &&
                selectedRecipe !== "" &&
                selectedItem.uid !== "")
            }
            fullWidth
            variant="contained"
            color="primary"
            onClick={onStartTrace}
            component="span"
          >
            {TEXT_START_TRACE}
          </Button>
          {isTracing && <LinearProgress />}
        </Stack>
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// =========================== Panel Ergebnis =========================
// =================================================================== */
interface ResultPanelProps {
  documentList: State["tracedFiles"];
}
const ResultPanel = ({documentList}: ResultPanelProps) => {
  const classes = useCustomStyles();

  return (
    <Card sx={classes.card} key={"cardProduct"}>
      <CardContent sx={classes.cardContent} key={"cardContentProduct"}>
        <Stack spacing={2}>
          <Typography gutterBottom={true} variant="h5" component="h2">
            {`${TEXT_FOUND_DOCUMENTS}: ${documentList.length}`}
          </Typography>
          <List sx={classes.root}>
            {documentList.map((document, counter) => (
              <ListItem divider key={"listItem_" + counter}>
                <ListItemText
                  primary={document.name}
                  secondary={document.document}
                />
              </ListItem>
            ))}
          </List>
        </Stack>
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
  withFirebase,
)(WhereUsedPage);
