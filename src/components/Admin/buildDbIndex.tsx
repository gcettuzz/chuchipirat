import React, {useContext} from "react";
import {compose} from "recompose";

import {
  Container,
  Backdrop,
  CircularProgress,
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

import Firebase, {withFirebase} from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import CustomDialogContext, {
  DialogType,
  useCustomDialog,
  SingleTextInputResult,
} from "../Shared/customDialogContext";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  UPDATE_INDEX_RECIPE_VARIANTS = "UPDATE_INDEX_RECIPE_VARIANTS",
  UPDATE_INDEX_EVENT_USED_RECIPES = "UPDATE_INDEX_EVENT_USED_RECIPES",
  UPDATE_INDEX_ACTIVE_REQUESTS = "UPDATE_INDEX_ACTIVE_REQUESTS",
  GENERIC_ERROR = "GENERIC_ERROR",
  SNACKBAR_CLOSE = "SNACKBAR_CLOSE",
  SNACKBAR_SHOW = "SNACKBAR_SHOW",
}

interface IndexQueryResult {
  executed: boolean;
  error: {text: string; link: string} | null;
  resultCounter: number;
}

const INITITIAL_STATE: State = {
  indexRecipeVariants: {error: null, resultCounter: 0, executed: false},
  indexEventUsedRecipes: {error: null, resultCounter: 0, executed: false},
  indexActiveRequests: {error: null, resultCounter: 0, executed: false},
  error: {},
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
  indexActiveRequests: IndexQueryResult;
  isLoading: boolean;
  isError: boolean;
  error: object;
  snackbar: Snackbar;
};

enum BuildIndex {
  recipeVariants,
  eventUsedRecipes,
  activeRequests,
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
    case ReducerActions.UPDATE_INDEX_ACTIVE_REQUESTS:
      return {
        ...state,
        indexActiveRequests: {
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
        error: action.payload ? action.payload : {},
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
// Diese Seite hilft um neue Indizes auf der DB zu erstellen
const BuildIndicesPage = (props) => {
  const authUser = useContext(AuthUserContext);

  return (
    <AuthUserContext.Consumer>
      {(authUser) => <BuildIndicesBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const BuildIndicesBase = ({props, authUser}) => {
  const firebase: Firebase = props.firebase;
  const classes = useStyles();
  const {customDialog} = useCustomDialog();
  const [state, dispatch] = React.useReducer(
    buildIndicesReducer,
    INITITIAL_STATE
  );
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
      case BuildIndex.activeRequests:
        firebase.db
          .collectionGroup("active")
          .where("assignee.uid", "==", "")
          .get()
          .then((result) => {
            dispatch({
              type: ReducerActions.UPDATE_INDEX_ACTIVE_REQUESTS,
              payload: {error: null, resultCounter: result.size},
            });
          })
          .catch((error) => {
            console.error(error);
            dispatch({
              type: ReducerActions.UPDATE_INDEX_ACTIVE_REQUESTS,
              payload: {error: error.toString(), resultCounter: 0},
            });
          });

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
                error={state.error}
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
                    indexName={"event/${event.uid}/recipeVariants"}
                    buildIndexType={BuildIndex.recipeVariants}
                    buildIndexState={state.indexRecipeVariants}
                    onBuildIndex={buildIndex}
                  />
                  <ListItemBuildIndex
                    indexName={"event/${event.uid}/docs"}
                    buildIndexType={BuildIndex.eventUsedRecipes}
                    buildIndexState={state.indexEventUsedRecipes}
                    onBuildIndex={buildIndex}
                  />
                  <ListItemBuildIndex
                    indexName={"requests/${requestType}/active"}
                    buildIndexType={BuildIndex.activeRequests}
                    buildIndexState={state.indexActiveRequests}
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
  const classes = useStyles();
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

const condition = (authUser) => !!authUser.roles.includes(Role.admin);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(BuildIndicesPage);
