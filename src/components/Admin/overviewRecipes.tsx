import React from "react";

import {useNavigate} from "react-router";

import useCustomStyles from "../../constants/styles";
import {
  Container,
  Backdrop,
  CircularProgress,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Box,
  Stack,
} from "@mui/material";

import {IconButton, Typography, useTheme} from "@mui/material";

import {
  OpenInNew as OpenInNewIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from "@mui/icons-material";

import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";
import SearchPanel from "../Shared/searchPanel";
import RecipeShort from "../Recipe/recipeShort.class";
import DialogRecipeQuickView from "../Recipe/dialogRecipeQuickView";

import {
  OPEN as TEXT_OPEN,
  UID as TEXT_UID,
  RECIPE as TEXT_RECIPE,
  RECIPES as TEXT_RECIPES,
  VISIBILITY as TEXT_VISIBILITY,
  SOURCE as TEXT_SOURCE,
  CREATED_AT as TEXT_CREATED_AT,
  CREATED_FROM as TEXT_CREATED_FROM,
  OVERVIEW_RECIPES_DESCRIPTION as TEXT_OVERVIEW_RECIPES_DESCRIPTION,
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  PUBLIC_RECIPES as TEXT_PUBLIC_RECIPES,
  PRIVATE_RECIPES as TEXT_PRIVATE_RECIPES,
  ALL_RECIPES as TEXT_ALL_RECIPES,
  CANCEL as TEXT_CANCEL,
  RECIPE_OPEN as TEXT_RECIPE_OPEN,
} from "../../constants/text";
import Role from "../../constants/roles";
import * as ROUTES from "../../constants/routes";
import Action from "../../constants/actions";

import Recipe, {RecipeType} from "../Recipe/recipe.class";
import {useFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {useAuthUser} from "../Session/authUserContext";
import {ChangeRecord} from "../Shared/global.interface";
import {
  DataGrid,
  GridColDef,
} from "@mui/x-data-grid";
import {deDE} from "@mui/x-data-grid/locales";
import Utils from "../Shared/utils.class";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  RECIPES_FETCH_INIT = "RECIPES_FETCH_INIT",
  PUBLIC_RECIPES_FETCH_SUCCESS = "RECIPES_FETCH_SUCCESS",
  PRIVATE_RECIPES_FETCH_SUCCESS = "PRIVATE_FETCH_SUCCESS",
  GENERIC_ERROR = "GENERIC_ERROR",
  FILTER_RECIPE_LIST = "FILTER_RECIPE_LIST",
}
interface RecipeOverview {
  name: RecipeShort["name"];
  uid: RecipeShort["uid"];
  type: RecipeShort["type"];
  source: RecipeShort["source"];
  create_date: ChangeRecord["date"];
  create_fromUid: ChangeRecord["fromUid"];
  create_fromDisplayName: ChangeRecord["fromDisplayName"];
}

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  publicRecipes: RecipeShort[];
  privateRecipes: RecipeShort[];
  filteredData: RecipeOverview[];
  isLoading: boolean;
  partialLoading: {privateRecipe: boolean; publicRecipe: boolean};
  isError: boolean;
  error: Error | null;
};

const inititialState: State = {
  publicRecipes: [],
  privateRecipes: [],
  filteredData: [],
  isLoading: false,
  partialLoading: {privateRecipe: false, publicRecipe: false},
  isError: false,
  error: null,
};

const moveDataToUiStructure = (recipes: RecipeShort[]): RecipeOverview[] => {
  const result: RecipeOverview[] = [];
  recipes.forEach((recipe) => {
    result.push({
      name: recipe.name,
      uid: recipe.uid,
      type: recipe.type,
      source: recipe.source,
      create_date: recipe.created.date,
      create_fromUid: recipe.created.fromUid,
      create_fromDisplayName: recipe.created.fromDisplayName,
    });
  });
  return result;
};

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
        partialLoading: {privateRecipe: true, publicRecipe: true},
      };
    case ReducerActions.PUBLIC_RECIPES_FETCH_SUCCESS:
      return {
        ...state,
        publicRecipes: action.payload as RecipeShort[],
        filteredData: moveDataToUiStructure(action.payload as RecipeShort[]),
        isLoading: Object.values({
          ...state.partialLoading,
          ...{publicRecipe: false},
        }).every((value) => value === true),
        partialLoading: {
          privateRecipe: state.partialLoading.privateRecipe,
          publicRecipe: false,
        },
      };
    case ReducerActions.PRIVATE_RECIPES_FETCH_SUCCESS:
      return {
        ...state,
        privateRecipes: action.payload as RecipeShort[],
        isLoading: Object.values({
          ...state.partialLoading,
          ...{privateRecipe: false},
        }).every((value) => value === true),
        partialLoading: {
          privateRecipe: false,
          publicRecipe: state.partialLoading.publicRecipe,
        },
      };
    case ReducerActions.GENERIC_ERROR:
      return {
        ...state,
        isLoading: false,
        isError: true,
        error: action.payload as Error,
      };
    case ReducerActions.FILTER_RECIPE_LIST: {
      let tmpList: RecipeOverview[] = [];

      switch (action.payload.scope) {
        case RecipeType.private:
          tmpList = moveDataToUiStructure(state.privateRecipes);
          break;
        case RecipeType.public:
          tmpList = moveDataToUiStructure(state.publicRecipes);
          break;
        case "all":
          tmpList = moveDataToUiStructure(
            state.publicRecipes.concat(state.privateRecipes)
          );
          break;
      }
      if (action.payload.searchString) {
        tmpList = tmpList.filter(
          (recipe) =>
            recipe.uid
              .toLocaleLowerCase()
              .includes(action.payload.searchString.toLowerCase()) ||
            recipe.name
              .toLowerCase()
              .includes(action.payload.searchString.toLowerCase()) ||
            recipe.source
              .toLowerCase()
              .includes(action.payload.searchString.toLowerCase()) ||
            recipe.create_fromDisplayName
              .toLowerCase()
              .includes(action.payload.searchString.toLowerCase()) ||
            recipe.create_fromUid
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

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const OverviewRecipePage = () => {
  const firebase = useFirebase();
  const authUser = useAuthUser();

  const classes = useCustomStyles();
  const navigate = useNavigate();

  const [state, dispatch] = React.useReducer(recipesReducer, inititialState);
  const [dialogQuickView, setDialogQuickView] =
    React.useState<DialogQuickViewState>(DIALOG_QUICK_VIEW_INITIAL_STATE);
  const [searchString, setSearchString] = React.useState<string>("");
  const searchStringRef = React.useRef("");
  const [radioButtonSelection, setRadioButtonSelection] =
    React.useState("public");
  const radioButtonSelectionRef = React.useRef("public");
  /* ------------------------------------------
	// SessionHandling für speichern der letzten Werte
	// ------------------------------------------ */
  React.useEffect(() => {
    searchStringRef.current = searchString;
  }, [searchString]);
  React.useEffect(() => {
    radioButtonSelectionRef.current = radioButtonSelection;
  }, [radioButtonSelection]);

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
          dispatch({
            type: ReducerActions.PRIVATE_RECIPES_FETCH_SUCCESS,
            payload: result,
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
  const onRecipeOpen = (uid: RecipeShort["uid"]) => {
    let recipeShort = {} as RecipeShort;

    if (
      state.filteredData.find((recipe) => recipe.uid === uid)?.type ===
      RecipeType.public
    ) {
      recipeShort = state.publicRecipes.find((recipe) => recipe.uid === uid)!;
    } else {
      recipeShort = state.privateRecipes.find((recipe) => recipe.uid === uid)!;
    }
    setDialogQuickView({
      dialogOpen: true,
      selectedRecipe: recipeShort,
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
      navigate(`${ROUTES.RECIPE}/${recipe.uid}`, {
        state: {
          action: Action.VIEW,
          recipe: recipe,
        }
      });
    } else if (recipe.type === RecipeType.private) {
      navigate(`${ROUTES.RECIPE}/${recipe.created.fromUid}/${recipe.uid}`, {
        state: {
          action: Action.VIEW,
          recipe: recipe,
        }
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

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={TEXT_RECIPES}
        subTitle={TEXT_OVERVIEW_RECIPES_DESCRIPTION}
      />
      {/* ===== BODY ===== */}
      <Container sx={classes.container} component="main" maxWidth="md">
        <Backdrop sx={classes.backdrop} open={state.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Stack spacing={2}>
          {state.isError && (
            <AlertMessage
              error={state.error!}
              messageTitle={TEXT_ALERT_TITLE_WAIT_A_MINUTE}
            />
          )}

          <Card sx={classes.card} key={"cardProductsPanel"}>
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
                  control={<Radio />}
                  label={TEXT_PUBLIC_RECIPES}
                />
                <FormControlLabel
                  value={RecipeType.private}
                  control={<Radio />}
                  label={TEXT_PRIVATE_RECIPES}
                />
                <FormControlLabel
                  value="all"
                  control={<Radio />}
                  label={TEXT_ALL_RECIPES}
                />
              </RadioGroup>
            </CardContent>
          </Card>
          <RecipesPanel
            recipes={state.filteredData}
            onRecipeOpen={onRecipeOpen}
          />
        </Stack>
      </Container>
      <DialogRecipeQuickView
        firebase={firebase}
        recipeShort={dialogQuickView.selectedRecipe}
        dialogOpen={dialogQuickView.dialogOpen}
        handleClose={onCloseDialogRecipeQuickView}
        dialogActions={[
          {
            key: "close",
            name: TEXT_CANCEL,
            variant: "text",
            onClick: onCloseDialogRecipeQuickView,
          },
          {
            key: "open",
            name: TEXT_RECIPE_OPEN,
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
  recipes: RecipeOverview[];
  onRecipeOpen: (recipeUid: Recipe["uid"]) => void;
}
const RecipesPanel = ({recipes, onRecipeOpen}: RecipesPanelProps) => {
  const theme = useTheme();
  const classes = useCustomStyles();

  const DATA_GRID_COLUMNS: GridColDef[] = [
    {
      field: "open",
      headerName: TEXT_OPEN,
      sortable: false,
      renderCell: (params) => {
        const onClick = () => {
          onRecipeOpen(params.id as string);
        };

        return (
          <IconButton
            aria-label="open User"
            style={{margin: theme.spacing(1)}}
            size="small"
            onClick={onClick}
          >
            <OpenInNewIcon fontSize="inherit" />
          </IconButton>
        );
      },
    },
    {
      field: "uid",
      headerName: TEXT_UID,
      editable: false,
      cellClassName: () => `super-app ${classes.typographyCode}`,
      width: 200,
    },
    {
      field: "name",
      headerName: TEXT_RECIPE,
      editable: false,
      width: 250,
    },
    {
      field: "type",
      headerName: TEXT_VISIBILITY,
      editable: false,
      renderCell: (params) => {
        if (params.value?.type === RecipeType.private) {
          return <LockIcon fontSize="inherit" />;
        } else if (params.value?.type === RecipeType.public) {
          return <LockOpenIcon fontSize="inherit" />;
        }
      },
      width: 50,
      filterable: false,
    },
    {
      field: "source",
      headerName: TEXT_SOURCE,
      editable: false,
      width: 150,
      valueGetter: (value) => {
        return Utils.isUrl(value as string)
          ? Utils.getDomain(value as string)
          : value;
      },
    },
    {
      field: "create_date",
      headerName: TEXT_CREATED_AT,
      editable: false,
      valueGetter: (value) => {
        return value?.toLocaleString("de-CH", {
          dateStyle: "medium",
        });
      },
      width: 100,
    },
    {
      field: "create_fromUid",
      headerName: `${TEXT_CREATED_FROM} ${TEXT_UID}`,
      editable: false,
      cellClassName: () => `super-app ${classes.typographyCode}`,
      valueGetter: (value) => {
        return value;
      },
      width: 200,
    },
    {
      field: "create_fromDisplayName",
      headerName: TEXT_CREATED_FROM,
      editable: false,
      valueGetter: (value) => {
        return value;
      },
      width: 200,
    },
  ];

  return (
    <Card sx={classes.card} key={"cardProductsPanel"}>
      <CardContent sx={classes.cardContent} key={"cardPrdocutContent"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {recipes.length} {TEXT_RECIPES}
        </Typography>
        <Box component="div" style={{display: "flex", height: "100%"}}>
          <Box component="div" style={{flexGrow: 1}}>
            <DataGrid
              autoHeight
              rows={recipes}
              columns={DATA_GRID_COLUMNS}
              getRowId={(row) => row.uid}
              localeText={deDE.components.MuiDataGrid.defaultProps.localeText}
              getRowClassName={(params) => {
                if (params.row?.disabled) {
                  return `super-app ${classes.dataGridDisabled}`;
                } else {
                  return `super-app-theme`;
                }
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OverviewRecipePage;
