import React from "react";
import {compose} from "react-recompose";

import {
  Container,
  // Backdrop,
  // CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Card,
  CardContent,
  Typography,
  Link,
  Divider,
} from "@material-ui/core";

import PageTitle from "../Shared/pageTitle";
import CustomSnackbar, {Snackbar} from "../Shared/customSnackbar";
import AlertMessage from "../Shared/AlertMessage";

import {
  DB_INDICES as TEXT_DB_INDICES,
  ALERT_TITLE_UUPS as TEXT_ALERT_TITLE_UUPS,
} from "../../constants/text";
import useStyles from "../../constants/styles";
import Role from "../../constants/roles";

import {withFirebase} from "../Firebase/firebaseContext";
import {
  DialogType,
  useCustomDialog,
  SingleTextInputResult,
} from "../Shared/customDialogContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {CustomRouterProps} from "../Shared/global.interface";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  UPDATE_INDEX_RECIPE_VARIANTS,
  UPDATE_INDEX_EVENT_USED_RECIPES,
  UPDATE_INDEX_ACTIVE_REQUESTS_ASIGNEE,
  UPDATE_INDEX_ACTIVE_REQUESTS_AUTHOR,
  UPDATE_INDEX_USED_PRODUCTS_RECIPES,
  UPDATE_INDEX_USED_PRODUCTS_EVENT,
  UPDATE_INDEX_DISPLAYNAME_RECIPES,
  UPDATE_INDEX_DISPLAYNAME_EVENT,
  UPDATE_INDEX_ORIGINAL_RECIPE_UID_RECIPES,
  UPDATE_INDEX_USER_BY_ROLE,
  GENERIC_ERROR,
  SNACKBAR_CLOSE,
  SNACKBAR_SHOW,
}

interface IndexQueryResult {
  executed: boolean;
  error: {text: string; link: string} | null;
  resultCounter: number;
}

const INITITIAL_STATE: State = {
  indexRecipeVariants: {error: null, resultCounter: 0, executed: false},
  indexEventUsedRecipes: {error: null, resultCounter: 0, executed: false},
  indexActiveRequestsAsignee: {error: null, resultCounter: 0, executed: false},
  indexActiveRequestsAuthor: {error: null, resultCounter: 0, executed: false},
  indexUsedProductsRecipes: {error: null, resultCounter: 0, executed: false},
  indexUsedProductsEvents: {error: null, resultCounter: 0, executed: false},
  indexDisplayNameRecipes: {error: null, resultCounter: 0, executed: false},
  indexDisplayNameEvents: {error: null, resultCounter: 0, executed: false},
  indexOriginalRecipeUidVariant: {
    error: null,
    resultCounter: 0,
    executed: false,
  },
  indexUserByRole: {error: null, resultCounter: 0, executed: false},
  error: null,
  isError: false,
  isLoading: false,
  snackbar: {open: false, severity: "success", message: ""},
};

type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};
type State = {
  indexRecipeVariants: IndexQueryResult;
  indexEventUsedRecipes: IndexQueryResult;
  indexActiveRequestsAsignee: IndexQueryResult;
  indexActiveRequestsAuthor: IndexQueryResult;
  indexUsedProductsRecipes: IndexQueryResult;
  indexUsedProductsEvents: IndexQueryResult;
  indexDisplayNameRecipes: IndexQueryResult;
  indexDisplayNameEvents: IndexQueryResult;
  indexOriginalRecipeUidVariant: IndexQueryResult;
  indexUserByRole: IndexQueryResult;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  snackbar: Snackbar;
};

enum BuildIndex {
  recipeVariants,
  eventUsedRecipes,
  activeRequestsAsignee,
  activeRequestsAuthor,
  usedProductsRecipes,
  usedProductsEvents,
  displayNameRecipes,
  displayNameEvents,
  oringalRecipeUidRecipeVariant,
  userByRole,
}

const splitErrorText = (errorText) => {
  if (!errorText) {
    return {text: "", link: ""};
  }

  // Verwende die Stringmethode split, um den Text zu teilen
  const parts = errorText.split("https://console.firebase.google.com");

  if (parts.length === 2) {
    const previousText = parts[0];
    const url = "https://console.firebase.google.com" + parts[1];
    return {text: previousText, link: url};
  } else {
    return {text: "", link: ""};
  }
};

const buildIndicesReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.UPDATE_INDEX_RECIPE_VARIANTS:
      return {
        ...state,
        indexRecipeVariants: {
          error: splitErrorText(action.payload.error),
          resultCounter: action.payload.resultCounter,
          executed: true,
        },
      };
    case ReducerActions.UPDATE_INDEX_EVENT_USED_RECIPES:
      return {
        ...state,
        indexEventUsedRecipes: {
          error: splitErrorText(action.payload.error),
          resultCounter: action.payload.resultCounter,
          executed: true,
        },
      };
    case ReducerActions.UPDATE_INDEX_ACTIVE_REQUESTS_ASIGNEE:
      return {
        ...state,
        indexActiveRequestsAsignee: {
          error: splitErrorText(action.payload.error),
          resultCounter: action.payload.resultCounter,
          executed: true,
        },
      };
    case ReducerActions.UPDATE_INDEX_ACTIVE_REQUESTS_AUTHOR:
      return {
        ...state,
        indexActiveRequestsAuthor: {
          error: splitErrorText(action.payload.error),
          resultCounter: action.payload.resultCounter,
          executed: true,
        },
      };
    case ReducerActions.UPDATE_INDEX_USED_PRODUCTS_EVENT:
      return {
        ...state,
        indexUsedProductsEvents: {
          error: splitErrorText(action.payload.error),
          resultCounter: action.payload.resultCounter,
          executed: true,
        },
      };
    case ReducerActions.UPDATE_INDEX_USED_PRODUCTS_RECIPES:
      return {
        ...state,
        indexUsedProductsRecipes: {
          error: splitErrorText(action.payload.error),
          resultCounter: action.payload.resultCounter,
          executed: true,
        },
      };
    case ReducerActions.UPDATE_INDEX_DISPLAYNAME_RECIPES:
      return {
        ...state,
        indexDisplayNameRecipes: {
          error: splitErrorText(action.payload.error),
          resultCounter: action.payload.resultCounter,
          executed: true,
        },
      };
    case ReducerActions.UPDATE_INDEX_DISPLAYNAME_EVENT:
      return {
        ...state,
        indexDisplayNameEvents: {
          error: splitErrorText(action.payload.error),
          resultCounter: action.payload.resultCounter,
          executed: true,
        },
      };

    case ReducerActions.UPDATE_INDEX_ORIGINAL_RECIPE_UID_RECIPES:
      return {
        ...state,
        indexOriginalRecipeUidVariant: {
          error: splitErrorText(action.payload.error),
          resultCounter: action.payload.resultCounter,
          executed: true,
        },
      };
    case ReducerActions.UPDATE_INDEX_USER_BY_ROLE:
      return {
        ...state,
        indexUserByRole: {
          error: splitErrorText(action.payload.error),
          resultCounter: action.payload.resultCounter,
          executed: true,
        },
      };
    case ReducerActions.SNACKBAR_SHOW:
      return {
        ...state,
        snackbar: {
          severity: action.payload.severity,
          message: action.payload.message,
          open: true,
        },
      };
    case ReducerActions.SNACKBAR_CLOSE:
      return {
        ...state,
        snackbar: {
          severity: "success",
          message: "",
          open: false,
        },
      };
    case ReducerActions.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isError: true,
        isLoading: false,
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
const BuildIndicesPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <BuildIndicesBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const BuildIndicesBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const {customDialog} = useCustomDialog();
  const [state, dispatch] = React.useReducer(
    buildIndicesReducer,
    INITITIAL_STATE
  );

  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
  // Index aufbauen
  // ------------------------------------------ */
  const buildIndex = async (index: BuildIndex) => {
    let userInput = {valid: false, input: ""} as SingleTextInputResult;

    switch (index) {
      case BuildIndex.recipeVariants:
        // Wir brauchen eine Rezept-UID, wonach wir suchen sollen
        userInput = (await customDialog({
          dialogType: DialogType.SingleTextInput,
          title: "Rezept-UID",
          text: "Gibt eine Rezept-UID an, wonach in der GroupCollection 'recipeVariants' gesucht werden soll.",
          singleTextInputProperties: {
            initialValue: "",
            textInputLabel: "Rezept-UID",
          },
        })) as SingleTextInputResult;
        if (userInput?.valid && userInput.input != "") {
          firebase.db
            .collectionGroup("recipeVariants")
            .where("variantProperties.originalRecipeUid", "==", userInput.input)
            .get()
            .then((result) => {
              dispatch({
                type: ReducerActions.UPDATE_INDEX_RECIPE_VARIANTS,
                payload: {error: null, resultCounter: result.size},
              });
            })
            .catch((error) => {
              console.error(error);
              dispatch({
                type: ReducerActions.UPDATE_INDEX_RECIPE_VARIANTS,
                payload: {error: error.toString(), resultCounter: 0},
              });
            });
        }
        break;
      case BuildIndex.eventUsedRecipes:
        // Wir brauchen eine Rezept-UID, wonach wir suchen sollen
        userInput = (await customDialog({
          dialogType: DialogType.SingleTextInput,
          title: "Rezept-UID",
          text: "Gibt eine Rezept-UID an, wonach in der GroupCollection 'docs' gesucht werden soll.",
          singleTextInputProperties: {
            initialValue: "",
            textInputLabel: "Rezept-UID",
          },
        })) as SingleTextInputResult;

        if (userInput?.valid && userInput.input != "") {
          firebase.db
            .collectionGroup("docs")
            .where("usedRecipes", "array-contains", userInput.input)
            .get()
            .then((result) => {
              dispatch({
                type: ReducerActions.UPDATE_INDEX_EVENT_USED_RECIPES,
                payload: {error: null, resultCounter: result.size},
              });
            })
            .catch((error) => {
              console.error(error);
              dispatch({
                type: ReducerActions.UPDATE_INDEX_EVENT_USED_RECIPES,
                payload: {error: error.toString(), resultCounter: 0},
              });
            });
        }
        break;
      case BuildIndex.activeRequestsAsignee:
        firebase.db
          .collection("requests/active/requests")
          .where("assignee.uid", "==", "")
          .orderBy("number", "asc")
          .get()
          .then((result) => {
            dispatch({
              type: ReducerActions.UPDATE_INDEX_ACTIVE_REQUESTS_ASIGNEE,
              payload: {error: null, resultCounter: result.size},
            });
          })
          .catch((error) => {
            console.error(error);
            dispatch({
              type: ReducerActions.UPDATE_INDEX_ACTIVE_REQUESTS_ASIGNEE,
              payload: {error: error.toString(), resultCounter: 0},
            });
          });
        break;
      case BuildIndex.activeRequestsAuthor:
        firebase.db
          .collection("requests/active/requests")
          .where("author.uid", "==", "")
          .orderBy("number", "asc")
          .get()
          .then((result) => {
            dispatch({
              type: ReducerActions.UPDATE_INDEX_ACTIVE_REQUESTS_AUTHOR,
              payload: {error: null, resultCounter: result.size},
            });
          })
          .catch((error) => {
            console.error(error);
            dispatch({
              type: ReducerActions.UPDATE_INDEX_ACTIVE_REQUESTS_AUTHOR,
              payload: {error: error.toString(), resultCounter: 0},
            });
          });
        break;
      case BuildIndex.usedProductsRecipes:
        userInput = (await customDialog({
          dialogType: DialogType.SingleTextInput,
          title: "Product-UID",
          text: "Gibt eine Produkt-UID an, wonach in der GroupCollection 'usedProducts' gesucht werden soll.",
          singleTextInputProperties: {
            initialValue: "XXX",
            textInputLabel: "Product-UID",
          },
        })) as SingleTextInputResult;

        if (userInput?.valid && userInput.input != "") {
          firebase.db
            .collectionGroup("recipes")
            .where("usedProducts", "array-contains", userInput.input)
            .get()
            .then((result) => {
              console.info(result);
              result.forEach((document) => console.info(document.ref.path));
              dispatch({
                type: ReducerActions.UPDATE_INDEX_USED_PRODUCTS_RECIPES,
                payload: {error: null, resultCounter: result.size},
              });
            })
            .catch((error) => {
              console.error(error);
              dispatch({
                type: ReducerActions.UPDATE_INDEX_USED_PRODUCTS_RECIPES,
                payload: {error: error.toString(), resultCounter: 0},
              });
            });
        }
        break;
      case BuildIndex.usedProductsEvents:
        userInput = (await customDialog({
          dialogType: DialogType.SingleTextInput,
          title: "Product-UID",
          text: "Gibt eine Produkt-UID an, wonach in der GroupCollection 'docs' gesucht werden soll.",
          singleTextInputProperties: {
            initialValue: "VRbxCQCUWA7UC719ky9N",
            textInputLabel: "Product-UID",
          },
        })) as SingleTextInputResult;

        if (userInput?.valid && userInput.input != "") {
          firebase.db
            .collectionGroup("docs")
            .where("usedProducts", "array-contains", userInput.input)
            .get()
            .then((result) => {
              console.info(result);
              result.forEach((document) => {
                console.info(document.ref.parent!.parent!.id);
                console.info(document.ref.path);
              });
              dispatch({
                type: ReducerActions.UPDATE_INDEX_USED_PRODUCTS_EVENT,
                payload: {error: null, resultCounter: result.size},
              });
            })
            .catch((error) => {
              console.error(error);
              dispatch({
                type: ReducerActions.UPDATE_INDEX_USED_PRODUCTS_EVENT,
                payload: {error: error.toString(), resultCounter: 0},
              });
            });
        }
        break;
      case BuildIndex.displayNameRecipes:
        userInput = (await customDialog({
          dialogType: DialogType.SingleTextInput,
          title: "User-UID",
          text: "Gibt eine User-UID an, wonach in der GroupCollection 'recipes' gesucht werden soll.",
          singleTextInputProperties: {
            initialValue: "tasT02c6mxOWDstBdvwzjbs5Tfc2",
            textInputLabel: "User-UID",
          },
        })) as SingleTextInputResult;

        if (userInput?.valid && userInput.input != "") {
          firebase.db
            .collectionGroup("recipes")
            .where("created.fromUid", "==", userInput.input)
            .get()
            .then((result) => {
              console.info(result);
              result.forEach((document) => {
                console.info(document.ref.parent!.parent!.id);
                console.info(document.ref.path);
              });
              dispatch({
                type: ReducerActions.UPDATE_INDEX_DISPLAYNAME_RECIPES,
                payload: {error: null, resultCounter: result.size},
              });
            })
            .catch((error) => {
              console.error(error);
              dispatch({
                type: ReducerActions.UPDATE_INDEX_DISPLAYNAME_RECIPES,
                payload: {error: error.toString(), resultCounter: 0},
              });
            });
        }
        break;
      case BuildIndex.displayNameEvents:
        firebase.db
          .collectionGroup("docs")
          .where("created.fromUid", "==", "")
          .get()
          .then((result) => {
            console.info(result);
            result.forEach((document) => {
              console.info(document.ref.parent!.parent!.id);
              console.info(document.ref.path);
            });
            dispatch({
              type: ReducerActions.UPDATE_INDEX_DISPLAYNAME_EVENT,
              payload: {error: null, resultCounter: result.size},
            });
          })
          .catch((error) => {
            console.error(error);
            dispatch({
              type: ReducerActions.UPDATE_INDEX_DISPLAYNAME_EVENT,
              payload: {error: error.toString(), resultCounter: 0},
            });
          });
        break;
      case BuildIndex.oringalRecipeUidRecipeVariant:
        userInput = (await customDialog({
          dialogType: DialogType.SingleTextInput,
          title: "Rezept-UID",
          text: "Gibt eine Rezept-UID an, wonach in der GroupCollection 'recipes' gesucht werden soll (Original-Rezept einer Variante).",
          singleTextInputProperties: {
            initialValue: "659g6KMCUQJJG2lJId9a",
            textInputLabel: "Rezept-UID",
          },
        })) as SingleTextInputResult;

        if (userInput?.valid && userInput.input != "") {
          firebase.db
            .collectionGroup("recipes")
            .where("variantProperties.originalRecipeUid", "==", userInput.input)
            .get()
            .then((result) => {
              console.info(result);
              result.forEach((document) => {
                console.info(document.ref.parent!.parent!.id);
                console.info(document.ref.path);
              });
              dispatch({
                type: ReducerActions.UPDATE_INDEX_ORIGINAL_RECIPE_UID_RECIPES,
                payload: {error: null, resultCounter: result.size},
              });
            })
            .catch((error) => {
              console.error(error);
              dispatch({
                type: ReducerActions.UPDATE_INDEX_ORIGINAL_RECIPE_UID_RECIPES,
                payload: {error: error.toString(), resultCounter: 0},
              });
            });
        }
        break;
      case BuildIndex.userByRole:
        firebase.db
          .collectionGroup("users")
          .where("roles", "array-contains", "basic")
          .get()
          .then((result) => {
            console.info(result.size);
            dispatch({
              type: ReducerActions.UPDATE_INDEX_USER_BY_ROLE,
              payload: {error: null, resultCounter: result.size},
            });
          })
          .catch((error) => {
            console.error(error);
            dispatch({
              type: ReducerActions.UPDATE_INDEX_USER_BY_ROLE,
              payload: {error: error.toString(), resultCounter: 0},
            });
          });
        break;
      default:
    }
  };
  /* ------------------------------------------
  // Snackbar
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch({
      type: ReducerActions.SNACKBAR_CLOSE,
      payload: {},
    });
  };
  return (
    <>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_DB_INDICES} />

      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        {/* <Backdrop className={classes.backdrop} open={globalSettings.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop> */}
        <Grid container spacing={2}>
          {state.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={state.error as Error}
                messageTitle={TEXT_ALERT_TITLE_UUPS}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Card className={classes.card} key={"cardInfo"}>
              <CardContent
                className={classes.cardContent}
                key={"cardContentInfo"}
              >
                <List>
                  <ListItemBuildIndex
                    indexName={
                      "[variantProperties.originalRecipeUid] /../recipeVariants/${recipeDoc}"
                    }
                    buildIndexType={BuildIndex.recipeVariants}
                    buildIndexState={state.indexRecipeVariants}
                    onBuildIndex={buildIndex}
                  />
                  <ListItemBuildIndex
                    indexName={"[usedRecipes] /../docs/${anyRelatedEventDoc}"}
                    buildIndexType={BuildIndex.eventUsedRecipes}
                    buildIndexState={state.indexEventUsedRecipes}
                    onBuildIndex={buildIndex}
                  />
                  <ListItemBuildIndex
                    indexName={"[assignee.uid] /../active/${requestDocument}"}
                    buildIndexType={BuildIndex.activeRequestsAsignee}
                    buildIndexState={state.indexActiveRequestsAsignee}
                    onBuildIndex={buildIndex}
                  />
                  <ListItemBuildIndex
                    indexName={"[author.uid] /../active/${requestDocument}"}
                    buildIndexType={BuildIndex.activeRequestsAuthor}
                    buildIndexState={state.indexActiveRequestsAuthor}
                    onBuildIndex={buildIndex}
                  />
                  <ListItemBuildIndex
                    indexName={"[usedProducts] /.../recipes/${anyDocument}"}
                    buildIndexType={BuildIndex.usedProductsRecipes}
                    buildIndexState={state.indexUsedProductsRecipes}
                    onBuildIndex={buildIndex}
                  />

                  <ListItemBuildIndex
                    indexName={"[usedProducts] /.../docs/${anyDocument}"}
                    buildIndexType={BuildIndex.usedProductsEvents}
                    buildIndexState={state.indexUsedProductsEvents}
                    onBuildIndex={buildIndex}
                  />
                  <ListItemBuildIndex
                    indexName={
                      "[created.displayName] /.../recipes/${anyDocument}"
                    }
                    buildIndexType={BuildIndex.displayNameRecipes}
                    buildIndexState={state.indexDisplayNameRecipes}
                    onBuildIndex={buildIndex}
                  />
                  <ListItemBuildIndex
                    indexName={"[created.displayName] /.../docs/${anyDocument}"}
                    buildIndexType={BuildIndex.displayNameEvents}
                    buildIndexState={state.indexDisplayNameEvents}
                    onBuildIndex={buildIndex}
                  />
                  <ListItemBuildIndex
                    indexName={
                      "[variantProperties.originalRecipeUid] /.../recipes/${anyDocument}"
                    }
                    buildIndexType={BuildIndex.oringalRecipeUidRecipeVariant}
                    buildIndexState={state.indexOriginalRecipeUidVariant}
                    onBuildIndex={buildIndex}
                  />
                  <ListItemBuildIndex
                    indexName={"[user.roles] /users/${anyDocument}"}
                    buildIndexType={BuildIndex.userByRole}
                    buildIndexState={state.indexUserByRole}
                    onBuildIndex={buildIndex}
                  />
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <CustomSnackbar
        message={state.snackbar.message}
        severity={state.snackbar.severity}
        snackbarOpen={state.snackbar.open}
        handleClose={handleSnackbarClose}
      />
    </>
  );
};

// /* ===================================================================
// // ======================== Feed Einträge löschen ====================
// // =================================================================== */
interface ListItemBuildIndexProps {
  indexName: string;
  buildIndexType: BuildIndex;
  buildIndexState: IndexQueryResult;
  onBuildIndex: (index: BuildIndex) => void;
}
const ListItemBuildIndex = ({
  indexName,
  buildIndexType,
  buildIndexState,
  onBuildIndex,
}: ListItemBuildIndexProps) => {
  return (
    <React.Fragment>
      <ListItem>
        <ListItemText
          primary={indexName}
          secondary={
            buildIndexState.executed ? (
              buildIndexState.error && buildIndexState.error?.text != "" ? (
                <Typography color="error" variant="body2">
                  {buildIndexState.error.text}
                  <Link href={buildIndexState.error.link} target="_blank">
                    {buildIndexState.error.link}
                  </Link>
                </Typography>
              ) : (
                <Typography
                  color="textSecondary"
                  variant="body2"
                >{`Gefunden Einträge: ${buildIndexState.resultCounter}`}</Typography>
              )
            ) : (
              ""
            )
          }
        />
        <ListItemSecondaryAction>
          <Button color="primary" onClick={() => onBuildIndex(buildIndexType)}>
            Build
          </Button>
        </ListItemSecondaryAction>
      </ListItem>
      <Divider />
    </React.Fragment>
  );
};

const condition = (authUser: AuthUser | null) =>
  !!authUser &&
  (!!authUser.roles?.includes(Role.admin) ||
    !!authUser.roles?.includes(Role.communityLeader));

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(BuildIndicesPage);
