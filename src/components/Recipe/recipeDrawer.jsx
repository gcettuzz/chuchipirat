import React from "react";
import { useTheme } from "@material-ui/core/styles";
import { useHistory } from "react-router";

import useMediaQuery from "@material-ui/core/useMediaQuery";

import Container from "@material-ui/core/Container";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";

import useStyles from "../../constants/styles";

import * as ROUTES from "../../constants/routes";
import * as ACTIONS from "../../constants/actions";
import * as TEXT from "../../constants/text";

import { RecipeSearch } from "../Recipe/recipes";

/* ===================================================================
// ======================= Recipe Search Drawer ======================
// =================================================================== */
const RecipeSearchDrawer = ({
  allRecipes,
  drawerState,
  toggleRecipeSearch,
  onRecipeShow,
  onRecipeAdd,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { push } = useHistory();

  /* ------------------------------------------
  // Neues Rezept anlegen
  // ------------------------------------------ */
  const onNewRecipe = () => {
    push({
      pathname: ROUTES.RECIPE,
      state: { action: ACTIONS.NEW },
    });
  };

  return (
    <Drawer
      anchor={drawerState.anchor}
      open={drawerState.open}
      onClose={toggleRecipeSearch(false)}
      classes={{
        paper: useMediaQuery(theme.breakpoints.down("xs"), { noSsr: true })
          ? classes.recipeSearchDrawerPaperVertical
          : classes.recipeSearchDrawerPaperHorizontal,
      }}
    >
      <Container className={classes.container} component="main" maxWidth="lg">
        <Typography
          component="h3"
          variant="h4"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          {TEXT.MENUPLAN_DRAWER_SEARCH_RECIPE_TITLE}
        </Typography>

        <RecipeSearch
          recipes={allRecipes}
          onNewClick={onNewRecipe}
          cardActions={[
            {
              key: ACTIONS.VIEW,
              name: TEXT.BUTTON_SHOW,
              onClick: onRecipeShow,
            },
            { key: ACTIONS.ADD, name: TEXT.BUTTON_ADD, onClick: onRecipeAdd },
          ]}
          embededMode={true}
        />
      </Container>
    </Drawer>
  );
};

export default RecipeSearchDrawer;
