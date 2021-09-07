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
import Divider from "@material-ui/core/Divider";
import Link from "@material-ui/core/Link";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import * as ROUTES from "../../constants/routes";
import * as ACTIONS from "../../constants/actions";
import * as TEXT from "../../constants/text";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";
import * as FIREBASE_MESSAGES from "../../constants/firebaseMessages";

import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import AlertMessage from "../Shared/AlertMessage";

import Event from "../Event/event.class";
import Menuplan from "../Menuplan/menuplan.class";
import QuantityCalculation from "./quantityCalculation.class";
import QuantityCalculationPdf from "./quantityCalculationPdf";
import Utils from "../Shared/utils.class";

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
  QUANTITY_CALCULATION_FETCH_INIT: "QUANTITY_CALCULATION_FETCH_INIT",
  QUANTITY_CALCULATION_FETCH_SUCCESS: "QUANTITY_CALCULATION_FETCH_SUCCESS",
  EVENT_FETCH_SUCCES: "EVENT_FETCH_SUCCES",
  MENUPLAN_FETCH_SUCCESS: "MENUPLAN_FETCH_SUCCESS",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const quantityCalculationReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.INITIAL_TRANSFER:
      // Daten aus Props übernehmen
      return {
        ...state,
        menuplan: action.menuplan,
        event: action.event,
      };
    case REDUCER_ACTIONS.QUANTITY_CALCULATION_FETCH_INIT:
      // Ladeanezeige
      return {
        ...state,
        isLoading: true,
      };
    case REDUCER_ACTIONS.QUANTITY_CALCULATION_FETCH_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isError: false,
        error: null,
      };
    case REDUCER_ACTIONS.EVENT_FETCH_SUCCES:
      // Event setzen
      return {
        ...state,
        event: action.payload,
      };
    case REDUCER_ACTIONS.MENUPLAN_FETCH_SUCCESS:
      // Menüplan setzen
      return {
        ...state,
        menuplan: action.payload,
      };
    case REDUCER_ACTIONS.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isError: true,
        isLoading: false,
        error: action.payload,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const QuantityCalculationPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => (
        <QuantityCalculationBase props={props} authUser={authUser} />
      )}
    </AuthUserContext.Consumer>
  );
};

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const QuantityCalculationBase = ({ props, authUser }) => {
  const classes = useStyles();
  const { push } = useHistory();

  const firebase = props.firebase;
  let urlUid;
  const [quantityCalculation, dispatchQuantityCalculation] = React.useReducer(
    quantityCalculationReducer,
    {
      data: [],
      event: {},
      menuplan: { dates: [], recipes: [] },
      isLoading: false,
      isError: false,
      error: null,
    }
  );

  if (!urlUid) {
    urlUid = props.match.params.id;
  }

  /* ------------------------------------------
  // Daten aus DB lesen
  // ------------------------------------------ */
  React.useEffect(() => {
    dispatchQuantityCalculation({
      type: REDUCER_ACTIONS.QUANTITY_CALCULATION_FETCH_INIT,
    });

    if (!props.location.state) {
      // Event nachlesen
      Event.getEvent({ firebase: firebase, uid: urlUid })
        .then((result) => {
          dispatchQuantityCalculation({
            type: REDUCER_ACTIONS.EVENT_FETCH_SUCCES,
            payload: result,
          });
        })
        .catch((error) => {
          console.error(error);
          dispatchQuantityCalculation({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });

      // Menuplan lesen
      Menuplan.getMenuplan({ firebase: firebase, uid: urlUid })
        .then((result) => {
          dispatchQuantityCalculation({
            type: REDUCER_ACTIONS.MENUPLAN_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          console.error(error);
          dispatchQuantityCalculation({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    } else {
      dispatchQuantityCalculation({
        type: REDUCER_ACTIONS.INITIAL_TRANSFER,
        event: props.location.state.event,
        menuplan: props.location.state.menuplan,
      });
    }
  }, []);

  React.useEffect(() => {
    // Loader
    dispatchQuantityCalculation({
      type: REDUCER_ACTIONS.QUANTITY_CALCULATION_FETCH_INIT,
    });
    if (
      quantityCalculation.menuplan?.recipes &&
      quantityCalculation.menuplan?.recipes.length > 0
    ) {
      // Rezepte holen und skalieren
      QuantityCalculation.getRecipesAndScale({
        firebase: firebase,
        menuplan: quantityCalculation.menuplan,
      })
        .then((result) => {
          dispatchQuantityCalculation({
            type: REDUCER_ACTIONS.QUANTITY_CALCULATION_FETCH_SUCCESS,
            payload: result,
          });
        })
        .catch((error) => {
          console.error(error);
          dispatchQuantityCalculation({
            type: REDUCER_ACTIONS.GENERIC_ERROR,
            payload: error,
          });
        });
    } else if (quantityCalculation.menuplan.recipes.length === 0) {
      dispatchQuantityCalculation({
        type: REDUCER_ACTIONS.GENERIC_ERROR,
        payload: new Error(TEXT.QUANTITY_CALCULATION_ERROR_NO_RECIPES),
      });
    }
  }, [quantityCalculation.event, quantityCalculation.menuplan]);

  /* ------------------------------------------
  //  Mengenberechnung öffnen
  // ------------------------------------------ */
  const onMenuplan = () => {
    push({
      pathname: `${ROUTES.MENUPLAN}/${quantityCalculation.event.uid}`,
      state: {
        action: ACTIONS.VIEW,
        menuplan: quantityCalculation.menuplan,
        event: quantityCalculation.event,
      },
    });
  };
  /* ------------------------------------------
  //  PDF generieren
  // ------------------------------------------ */
  const onPrintVersion = async () => {
    const doc = (
      <QuantityCalculationPdf
        event={quantityCalculation.event}
        menuplan={quantityCalculation.menuplan}
        quantityCalculation={quantityCalculation.data}
        authUser={authUser}
      />
    );
    const asPdf = pdf([]);
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    saveAs(
      blob,
      TEXT.QUANTITY_CALCULATION +
        " " +
        quantityCalculation.event.name +
        TEXT.SUFFIX_PDF
    );
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      {quantityCalculation.error?.code !==
        FIREBASE_MESSAGES.GENERAL.PERMISSION_DENIED && (
        <PageHeader
          quantityCalculation={quantityCalculation}
          onMenuplan={onMenuplan}
          onPrintVersion={onPrintVersion}
          authUser={authUser}
        />
      )}
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
        <Backdrop
          className={classes.backdrop}
          open={quantityCalculation.isLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container justify="center" alignItems="center" spacing={2}>
          {quantityCalculation.isError && !quantityCalculation.isLoading && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={quantityCalculation.error}
                messageTitle={TEXT.ALERT_TITLE_WAIT_A_MINUTE}
              />
            </Grid>
          )}
          <MealBlock quantityCalculation={quantityCalculation.data} />
        </Grid>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================= Page Header =========================
// =================================================================== */
const PageHeader = ({
  quantityCalculation,
  onMenuplan,
  onPrintVersion,
  authUser,
}) => {
  return (
    <React.Fragment>
      <PageTitle
        title={TEXT.PAGE_TITLE_MENUPLAN}
        subTitle={
          TEXT.PAGE_TITLE_QUANTITY_CALCULATION +
          " " +
          quantityCalculation.event.name
        }
      />
      <ButtonRow
        key="buttons_create"
        buttons={[
          {
            id: "print",
            hero: true,
            label: TEXT.BUTTON_PRINTVERSION,
            variant: "contained",
            color: "primary",
            visible: true,
            onClick: onPrintVersion,
          },
          {
            id: "menuplan",
            hero: true,
            label: TEXT.BUTTON_MENUPLAN,
            variant: "outlined",
            color: "primary",
            visible: true,
            onClick: onMenuplan,
          },
        ]}
      />
    </React.Fragment>
  );
};

/* ===================================================================
// ============================= Meal Block ==========================
// =================================================================== */
const MealBlock = ({ quantityCalculation }) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      {quantityCalculation.map((mealRecipe) => (
        <React.Fragment key={"mealBlock_" + mealRecipe.uid}>
          <MealRecipe mealRecipe={mealRecipe} />
          <Grid item key={"recipeGridDividerLeft_" + mealRecipe.uid} xs={5}>
            <Divider
              className={classes.thickDivider}
              key={"recipeDividerLeft_" + mealRecipe.uid}
            />
          </Grid>
          <Grid
            item
            container
            justify="center"
            key={"recipeGridImage_" + mealRecipe.uid}
            xs={2}
          >
            <img
              className={classes.marginCenter}
              src={
                IMAGE_REPOSITORY.getEnviromentRelatedPicture().DIVIDER_ICON_SRC
              }
              alt=""
              align="center"
              width="50px"
            />
          </Grid>
          <Grid item key={"recipeGridDividerRight_" + mealRecipe.uid} xs={5}>
            <Divider
              className={classes.thickDivider}
              key={"recipeDividerRight_" + mealRecipe.uid}
            />
          </Grid>
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};

/* ===================================================================
// ============================ Meal Recipe ===========================
// =================================================================== */
const MealRecipe = ({ mealRecipe }) => {
  return (
    <React.Fragment key={"mealRecipe_" + mealRecipe.uid}>
      {/* Rezeptname */}
      <Grid item key={"recipeName_" + mealRecipe.uid} xs={12}>
        <Typography component="h1" variant="h4" align="center">
          {mealRecipe.recipeName}
        </Typography>
      </Grid>
      {/* Info-Block */}
      <Grid item key={"recipeInfos_" + mealRecipe.uid} xs={12}>
        <InfoBlock mealRecipe={mealRecipe} />
      </Grid>
      <Grid item key={"recipeInfosDivider_" + mealRecipe.uid} xs={12}>
        <Divider variant="middle" />
      </Grid>
      {/* Zutaten */}
      <Grid item key={"recipeIngredients_" + mealRecipe.uid} xs={12}>
        <IngredienstBlock mealRecipe={mealRecipe} />
      </Grid>
      <Grid item key={"recipeInfosIngredients_" + mealRecipe.uid} xs={12}>
        <Divider variant="middle" />
      </Grid>
      {/* Zubereitung */}
      <Grid item key={"recipePreparationSteps_" + mealRecipe.uid} xs={12}>
        <PreparationStepsBlock
          mealRecipeUid={mealRecipe.uid}
          preparationSteps={mealRecipe.recipe.preparationSteps}
        />
      </Grid>
      {/* Rezept-Hinweis */}
      {mealRecipe.recipe.note && (
        <Grid item key={"note_" + mealRecipe.uid} xs={12}>
          <NoteBlock
            mealRecipeUid={mealRecipe.uid}
            note={mealRecipe.recipe.note}
          />
        </Grid>
      )}
    </React.Fragment>
  );
};
/* ===================================================================
// ============================= Info Block ==========================
// =================================================================== */
const InfoBlock = ({ mealRecipe }) => {
  const classes = useStyles();

  return (
    <Grid container>
      <Grid item key={"recipeInfoBlockTime" + mealRecipe.uid} xs={12} sm={6}>
        <List
          disablePadding
          dense
          key={"listInfoBlockTime_" + mealRecipe.uid}
          aria-label="recipe Block Info"
        >
          <ListItem>
            <ListItemText
              className={classes.listItemTitleRight}
              key={"recipeInfoLabel_preparationTime" + mealRecipe.uid}
              secondary={TEXT.FIELD_PREPARATION_TIME}
            />
            <ListItemText
              className={classes.listItemContent}
              key={"recipeInfo_preparationTime" + mealRecipe.uid}
              primary={mealRecipe.recipe.preparationTime}
            />
          </ListItem>

          {mealRecipe.recipe?.cookTime && (
            <ListItem>
              <ListItemText
                className={classes.listItemTitleRight}
                key={"recipeInfoLabel_cookTime" + mealRecipe.uid}
                secondary={TEXT.FIELD_COOK_TIME}
              />
              <ListItemText
                className={classes.listItemContent}
                key={"recipeInfo_cookTime" + mealRecipe.uid}
                primary={mealRecipe.recipe.cookTime}
              />
            </ListItem>
          )}

          {mealRecipe.recipe?.restTime && (
            <ListItem>
              <ListItemText
                className={classes.listItemTitleRight}
                key={"recipeInfoLabel_restTime" + mealRecipe.uid}
                secondary={TEXT.FIELD_REST_TIME}
              />
              <ListItemText
                className={classes.listItemContent}
                key={"recipeInfo_restTime" + mealRecipe.uid}
                primary={mealRecipe.recipe.restTime}
              />
            </ListItem>
          )}
        </List>
      </Grid>

      <Grid item key={"recipeInfoBlockSource" + mealRecipe.uid} xs={12} sm={6}>
        <List
          disablePadding
          dense
          key={"listInfoBlockSource_" + mealRecipe.uid}
          aria-label="recipe Block Source"
        >
          <ListItem>
            <ListItemText
              className={classes.listItemTitleRight}
              key={"recipeInfoLabel_day" + mealRecipe.uid}
              secondary={TEXT.FIELD_DAY}
            />
            <ListItemText
              className={classes.listItemContent}
              key={"recipeInfo_day" + mealRecipe.uid}
              primary={mealRecipe.date.toLocaleString("de-CH", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            />
          </ListItem>

          <ListItem>
            <ListItemText
              className={classes.listItemTitleRight}
              key={"recipeInfoLabel_meal" + mealRecipe.uid}
              secondary={TEXT.FIELD_MEAL}
            />
            <ListItemText
              className={classes.listItemContent}
              key={"recipeInfo_meal" + mealRecipe.uid}
              primary={mealRecipe.mealName}
            />
          </ListItem>

          <ListItem>
            <ListItemText
              className={classes.listItemTitleRight}
              key={"recipeInfoLabel_source" + mealRecipe.uid}
              secondary={TEXT.FIELD_SOURCE}
            />
            <ListItemText
              className={classes.listItemContent}
              key={"recipeInfo_source" + mealRecipe.uid}
              primary={
                <Link href={mealRecipe.recipe.source}>
                  {Utils.getDomain(mealRecipe.recipe.source)}
                </Link>
              }
            />
          </ListItem>
        </List>
      </Grid>
    </Grid>
  );
};
/* ===================================================================
// =========================== Zutaten Block =========================
// =================================================================== */
const IngredienstBlock = ({ mealRecipe }) => {
  const classes = useStyles();
  const theme = useTheme();
  const breakpointIsXs = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <Grid container spacing={2}>
      <Grid item key={"recipeIngredientsTitel" + mealRecipe.uid} xs={12}>
        <Typography variant="subtitle2" gutterBottom align="center">
          {TEXT.PANEL_INGREDIENTS}
        </Typography>
      </Grid>

      {!breakpointIsXs && (
        <Grid
          item
          key={"recipeIngredientsOriginal" + mealRecipe.uid}
          xs={12}
          sm={6}
        >
          <IngredientList
            mealRecipeUid={mealRecipe.uid}
            portions={mealRecipe.recipe.portions}
            ingredients={mealRecipe.recipe.ingredients}
          />
        </Grid>
      )}
      <Grid
        item
        key={"recipeIngredientsScaled" + mealRecipe.uid}
        xs={12}
        sm={6}
      >
        <IngredientList
          mealRecipeUid={mealRecipe.uid}
          portions={mealRecipe.recipe.scaledNoOfServings}
          ingredients={mealRecipe.recipe.scaledIngredients}
        />
      </Grid>
    </Grid>
  );
};
/* ===================================================================
// ========================= Liste der Zutaten =======================
// =================================================================== */
const IngredientList = ({ mealRecipeUid, portions, ingredients }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Typography variant="subtitle2" gutterBottom align="center">
        {portions + " " + TEXT.FIELD_PORTIONS}
      </Typography>
      <List disablePadding dense>
        {ingredients.map((ingredient) => (
          <ListItem
            key={"ingredient_listItem_" + mealRecipeUid + "_" + ingredient.uid}
          >
            <ListItemText
              className={classes.listItemQuantity}
              primary={
                Number.isNaN(ingredient.quantity)
                  ? ""
                  : ingredient.quantity.toLocaleString("de-CH")
              }
              key={
                "ingredient_listItem_quantity" +
                mealRecipeUid +
                "_" +
                ingredient.uid
              }
            />
            <ListItemText
              className={classes.listItemUnit}
              secondary={ingredient.unit}
              key={
                "ingredient_listItem_unit" +
                mealRecipeUid +
                "_" +
                ingredient.uid
              }
            />
            <ListItemText
              className={classes.listItemName}
              primary={ingredient.product.name}
              key={
                "ingredient_listItem_name" +
                mealRecipeUid +
                "_" +
                ingredient.uid
              }
            />
            <ListItemText
              className={classes.listItemDetail}
              secondary={
                <Typography color="textSecondary" variant="body2">
                  {ingredient.detail}
                </Typography>
              }
              key={
                "ingredient_listItem_detail" +
                mealRecipeUid +
                "_" +
                ingredient.uid
              }
            />
          </ListItem>
        ))}
      </List>
    </React.Fragment>
  );
};
/* ===================================================================
// ======================= Zubereitungsschritte ======================
// =================================================================== */
const PreparationStepsBlock = ({ mealRecipeUid, preparationSteps }) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography variant="subtitle2" gutterBottom align="center">
        {TEXT.PANEL_PREPARATION}
      </Typography>
      <List disablePadding dense>
        {preparationSteps.map((preparationStep) => (
          <ListItem
            key={"preparationStep_" + mealRecipeUid + "_" + preparationStep.uid}
          >
            <ListItemText primary={preparationStep.step} />
          </ListItem>
        ))}
      </List>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================== Hinweis ============================
// =================================================================== */
const NoteBlock = ({ mealRecipeUid, note }) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography variant="subtitle2" gutterBottom align="center">
        {TEXT.PANEL_NOTES}
      </Typography>
      <List disablePadding dense>
        <ListItem key={"notes_" + mealRecipeUid}>
          <ListItemText primary={note} />
        </ListItem>
      </List>
    </React.Fragment>
  );
};

const condition = (authUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(QuantityCalculationPage);
