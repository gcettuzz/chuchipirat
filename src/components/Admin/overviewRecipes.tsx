import React from "react";
import {compose} from "react-recompose";

import {useHistory} from "react-router";

import useStyles from "../../constants/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import {Typography} from "@material-ui/core";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";

import PageTitle from "../Shared/pageTitle";
import EnhancedTable, {
  TableColumnTypes,
  Column,
  ColumnTextAlign,
} from "../Shared/enhancedTable";
import AlertMessage from "../Shared/AlertMessage";
import SearchPanel from "../Shared/searchPanel";
import RecipeShort from "../Recipe/recipeShort.class";
import DialogRecipeQuickView from "../Recipe/dialogRecipeQuickView";

import * as TEXT from "../../constants/text";
import Role from "../../constants/roles";
import * as ROUTES from "../../constants/routes";
import Action from "../../constants/actions";

import Recipe, {RecipeType} from "../Recipe/recipe.class";
import {withFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {CustomRouterProps} from "../Shared/global.interface";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
//TODO: SessionState speichern
enum ReducerActions {
  RECIPES_FETCH_INIT = "RECIPES_FETCH_INIT",
  PUBLIC_RECIPES_FETCH_SUCCESS = "RECIPES_FETCH_SUCCESS",
  PRIVATE_RECIPES_FETCH_SUCCESS = "PRIVATE_FETCH_SUCCESS",
  GENERIC_ERROR = "GENERIC_ERROR",
  FILTER_RECIPE_LIST = "FILTER_RECIPE_LIST",
}
interface recipeOverview extends RecipeShort {
  typeIcon: JSX.Element;
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  publicRecipes: recipeOverview[];
  privateRecipes: recipeOverview[];
  filteredData: recipeOverview[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

const inititialState: State = {
  publicRecipes: [],
  privateRecipes: [],
  filteredData: [],
  isLoading: false,
  isError: false,
  error: null,
};

// interface OnRowClickProps {
//   event: React.MouseEvent<unknown>;
//   name: string;
// }

interface DialogQuickViewState {
  dialogOpen: boolean;
  selectedRecipe: RecipeShort;
}

const DIALOG_QUICK_VIEW_INITIAL_STATE: DialogQuickViewState = {
  dialogOpen: false,
  selectedRecipe: new RecipeShort(),
};

const recipesReducer = (state: State, action: DispatchAction): State => {
  // let field: string;
  // let value: any;

  switch (action.type) {
    case ReducerActions.RECIPES_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
      };
    case ReducerActions.PUBLIC_RECIPES_FETCH_SUCCESS:
      return {
        ...state,
        publicRecipes: action.payload as recipeOverview[],
        filteredData: action.payload as recipeOverview[],
        isLoading: false,
      };
    case ReducerActions.PRIVATE_RECIPES_FETCH_SUCCESS:
      return {
        ...state,
        privateRecipes: action.payload as recipeOverview[],
        // filteredData: action.payload as RecipeShort[],
        isLoading: false,
      };
    case ReducerActions.GENERIC_ERROR:
      return {
        ...state,
        isLoading: false,
        isError: true,
        error: action.payload as Error,
      };
    case ReducerActions.FILTER_RECIPE_LIST: {
      let tmpList: recipeOverview[] = [];

      switch (action.payload.scope) {
        case RecipeType.private:
          tmpList = state.privateRecipes;
          break;
        case RecipeType.public:
          tmpList = state.publicRecipes;
          break;
        case "all":
          tmpList = state.publicRecipes.concat(state.privateRecipes);
          break;
      }
      if (action.payload.searchString) {
        tmpList = tmpList.filter(
          (recipe) =>
            recipe.name
              .toLowerCase()
              .includes(action.payload.searchString.toLowerCase()) ||
            recipe.source
              .toLowerCase()
              .includes(action.payload.searchString.toLowerCase()) ||
            recipe.created.fromDisplayName
              .toLowerCase()
              .includes(action.payload.searchString.toLowerCase())
        );
      }
      return {
        ...state,
        filteredData: tmpList,
      };
    }
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const OverviewRecipePage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <OverviewRecipeBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const OverviewRecipeBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;

  const classes = useStyles();
  const {push} = useHistory();

  const [state, dispatch] = React.useReducer(recipesReducer, inititialState);
  const [dialogQuickView, setDialogQuickView] =
    React.useState<DialogQuickViewState>(DIALOG_QUICK_VIEW_INITIAL_STATE);
  const [searchString, setSearchString] = React.useState<string>("");
  const searchStringRef = React.useRef("");
  const [radioButtonSelection, setRadioButtonSelection] =
    React.useState("public");
  const radioButtonSelectionRef = React.useRef("public");
  const scrollPositionRef = React.useRef(0);
  /* ------------------------------------------
	// SessionHandling für speichern der letzten Werte
	// ------------------------------------------ */
  React.useEffect(() => {
    searchStringRef.current = searchString;
  }, [searchString]);
  React.useEffect(() => {
    radioButtonSelectionRef.current = radioButtonSelection;
  }, [radioButtonSelection]);

  // React.useEffect(() => {
  // if (props.history.action === "POP") {
  //   let sessionStorageValue = SessionStorageHandler.getSessionStorageEntry({
  //     path: props.location.pathname,
  //   });
  //   if (sessionStorageValue) {
  //     setRadioButtonSelection(sessionStorageValue.radioButtonSelection);
  //     setSearchString(sessionStorageValue.searchString);
  //     window.scrollTo(0, sessionStorageValue.scrollPosition);
  //   }
  // }

  // return function cleanup() {
  // SessionStorageHandler.setSessionStorageEntry({
  //   path: props.location.pathname,
  //   value: {
  //     searchString: searchStringRef.current,
  //     radioButtonSelection: radioButtonSelectionRef.current,
  //     scrollPositionRef: scrollPositionRef.current,
  //   },
  // });
  //   };
  // }, []);
  /* ------------------------------------------
	// Daten aus DB holen
	// ------------------------------------------ */
  React.useEffect(() => {
    if (state.publicRecipes.length === 0) {
      dispatch({
        type: ReducerActions.RECIPES_FETCH_INIT,
        payload: {},
      });
      RecipeShort.getShortRecipesPublic({
        firebase: firebase,
      })
        .then((result) => {
          const tmpTable: recipeOverview[] = result as recipeOverview[];
          // Icon setzen
          tmpTable.forEach(
            (recipe) => (recipe.typeIcon = <LockOpenIcon color="disabled" />)
          );
          dispatch({
            type: ReducerActions.PUBLIC_RECIPES_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
    }
    if (
      state.privateRecipes.length === 0 &&
      (radioButtonSelection === RecipeType.private ||
        radioButtonSelection === "all")
    ) {
      dispatch({
        type: ReducerActions.RECIPES_FETCH_INIT,
        payload: {},
      });

      RecipeShort.getShortRecipesPrivateAll({
        firebase: firebase,
      })
        .then((result) => {
          const tmpTable: recipeOverview[] = result as recipeOverview[];
          // Icon setzen
          tmpTable.forEach(
            (recipe) => (recipe.typeIcon = <LockIcon color="disabled" />)
          );

          dispatch({
            type: ReducerActions.PRIVATE_RECIPES_FETCH_SUCCESS,
            payload: tmpTable,
          });
          dispatch({
            type: ReducerActions.FILTER_RECIPE_LIST,
            payload: {
              scope: radioButtonSelection,
              searchString: searchString,
            },
          });
        })
        .catch((error) => {
          dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
        });
    }
  }, [radioButtonSelection]);
  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
  // Quick-View Dialog öffnen
  // ------------------------------------------ */
  const onRowClick = (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    name: string
  ) => {
    setDialogQuickView({
      dialogOpen: true,
      selectedRecipe: state.filteredData.find(
        (recipe) => recipe.uid === name
      ) as RecipeShort,
    });
  };

  /* ------------------------------------------
  // Quick-View Dialog schliessen
  // ------------------------------------------ */
  const onCloseDialogRecipeQuickView = () => {
    setDialogQuickView({
      ...dialogQuickView,
      dialogOpen: false,
    });
  };

  /* ------------------------------------------
  // Rezept aus Quick-View Dialog öffnen
  // ------------------------------------------ */
  const onOpenRecipeDialogRecipeQuickView = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined,
    recipe: Recipe
  ) => {
    if (recipe.type === RecipeType.public) {
      push({
        pathname: `${ROUTES.RECIPE}/${recipe.uid}`,
        state: {
          action: Action.VIEW,
          recipe: recipe,
        },
      });
    } else if (recipe.type === RecipeType.private) {
      push({
        pathname: `${ROUTES.RECIPE}/${recipe.created.fromUid}/${recipe.uid}`,
        state: {
          action: Action.VIEW,
          recipe: recipe,
        },
      });
    }
  };

  /* ------------------------------------------
  // Search String wurde angepasst
  // ------------------------------------------ */
  const onUpdateSearchString = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearchString(event.target.value);

    dispatch({
      type: ReducerActions.FILTER_RECIPE_LIST,
      payload: {
        scope: radioButtonSelection,
        searchString: event.target.value,
      },
    });
  };

  /* ------------------------------------------
  // Search String löschen
  // ------------------------------------------ */
  const onClearSearchString = () => {
    setSearchString("");
    dispatch({
      type: ReducerActions.FILTER_RECIPE_LIST,
      payload: {scope: radioButtonSelection, searchString: ""},
    });
  };
  /* ------------------------------------------
  // Handler für Radio Buttons
  // ------------------------------------------ */
  const onRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    setRadioButtonSelection(value);
    dispatch({
      type: ReducerActions.FILTER_RECIPE_LIST,
      payload: {scope: value, searchString: searchString},
    });
  };
  scrollPositionRef.current = window.pageYOffset;
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT.RECIPES}
        subTitle={TEXT.OVERVIEW_RECIPES_DESCRIPTION}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
        <Backdrop className={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {state.isError && (
          <Grid item key={"error"} xs={12}>
            <AlertMessage
              error={state.error!}
              messageTitle={TEXT.ALERT_TITLE_WAIT_A_MINUTE}
            />
          </Grid>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card className={classes.card} key={"cardProductsPanel"}>
              <CardContent>
                <SearchPanel
                  searchString={searchString}
                  onUpdateSearchString={onUpdateSearchString}
                  onClearSearchString={onClearSearchString}
                />
                <RadioGroup
                  aria-label="gender"
                  name="recipeType"
                  row
                  value={radioButtonSelection}
                  onChange={onRadioButtonChange}
                >
                  <FormControlLabel
                    value={RecipeType.public}
                    control={<Radio color="primary" />}
                    label={TEXT.PUBLIC_RECIPES}
                  />
                  <FormControlLabel
                    value={RecipeType.private}
                    control={<Radio color="primary" />}
                    label={TEXT.PRIVATE_RECIPES}
                  />
                  <FormControlLabel
                    value="all"
                    control={<Radio color="primary" />}
                    label={TEXT.ALL_RECIPES}
                  />
                </RadioGroup>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <RecipesPanel
              recipes={state.filteredData}
              onRowClick={onRowClick}
            />
          </Grid>
        </Grid>
      </Container>
      <DialogRecipeQuickView
        firebase={firebase}
        recipeShort={dialogQuickView.selectedRecipe}
        dialogOpen={dialogQuickView.dialogOpen}
        handleClose={onCloseDialogRecipeQuickView}
        dialogActions={[
          {
            key: "close",
            name: TEXT.BUTTON_CANCEL,
            variant: "text",
            onClick: onCloseDialogRecipeQuickView,
          },
          {
            key: "open",
            name: TEXT.RECIPE_OPEN,
            variant: "outlined",
            onClick: onOpenRecipeDialogRecipeQuickView,
          },
        ]}
        authUser={authUser}
      />
    </React.Fragment>
  );
};

/* ===================================================================
// =========================== Produkte Panel ========================
// =================================================================== */
interface RecipesPanelProps {
  recipes: RecipeShort[];
  onRowClick: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    name: string
  ) => void;
}
const RecipesPanel = ({recipes, onRowClick}: RecipesPanelProps) => {
  const TABLE_COLUMS: Column[] = [
    {
      id: "uid",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT.UID,
      visible: false,
    },
    {
      id: "name",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT.RECIPES,
      visible: true,
    },
    {
      id: "typeIcon",
      type: TableColumnTypes.icon,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT.VISIBILITY,
      visible: true,
    },
    {
      id: "source",
      type: TableColumnTypes.link,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT.SOURCE,
      visible: true,
    },
    {
      id: "created.date",
      type: TableColumnTypes.date,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT.FIELD_CREATED_AT,
      visible: true,
    },
    {
      id: "created.fromUid",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.center,
      disablePadding: false,
      label: TEXT.FIELD_CREATED_FROM,
      visible: false,
    },
    {
      id: "created.fromDisplayName",
      type: TableColumnTypes.string,
      textAlign: ColumnTextAlign.left,
      disablePadding: false,
      label: TEXT.FIELD_CREATED_FROM,
      visible: true,
    },
  ];
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardProductsPanel"}>
      <CardContent className={classes.cardContent} key={"cardPrdocutContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {recipes.length} {TEXT.RECIPES}
        </Typography>

        <EnhancedTable
          tableData={recipes}
          tableColumns={TABLE_COLUMS}
          keyColum={"uid"}
          onRowClick={onRowClick}
        />
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
)(OverviewRecipePage);
