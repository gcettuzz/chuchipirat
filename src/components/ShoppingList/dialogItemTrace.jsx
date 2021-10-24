import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import useStyles from "../../constants/styles";

import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import * as TEXT from "../../constants/text";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */

/* ===================================================================
// =================== Pop Up Nachverfolgung Produkt =================
// =================================================================== */
const DialogItemTrace = ({ dialogOpen, handleOk, itemName, tracedRecipes }) => {
  const classes = useStyles();
  /* ------------------------------------------
  // PopUp Ok
  // ------------------------------------------ */
  const onOkClick = () => {
    handleOk();
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={onOkClick}
      aria-labelledby="dialogScaleRecipe"
      fullWidth={true}
      maxWidth="xs"
    >
      <DialogTitle id="dialogScaleRecipe">
        {TEXT.DIALOG_TITLE_ITEM_TRACE}
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1">
          <strong>{itemName}</strong>
        </Typography>
        <List className={classes.list} key={"tracedItemList"}>
          {tracedRecipes.map((recipe, counter) => (
            <React.Fragment
              key={`tracedItemListItem_${recipe.recipeUid}_${counter}`}
            >
              <ListItem key={`tracedItem_${recipe.recipeUid}_${counter}`}>
                <ListItemText
                  key={`tracedItemName_${recipe.recipeUid}_${counter}`}
                  className={classes.traceListItemRecipe}
                  primary={recipe.recipeName}
                  secondary={
                    recipe.mealDate.toLocaleString("de-CH", {
                      weekday: "short",
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                    }) +
                    ", " +
                    recipe.mealName
                  }
                />
                {/* <ListItemText
                  key={`tracedItemMeal_${recipe.recipeUid}_${counter}`}
                  className={classes.traceListItemDate}
                  
                /> */}
                <ListItemText
                  key={`tracedItemQuantity_${recipe.recipeUid}_${counter}`}
                  className={classes.traceListItemQuantity}
                  primary={
                    Number.isNaN(recipe.ingredientQuantity)
                      ? ""
                      : recipe.ingredientQuantity.toLocaleString("de-CH")
                  }
                />
                <ListItemText
                  key={`tracedItemUnit_${recipe.recipeUid}_${counter}`}
                  className={classes.traceListItemUnit}
                  secondary={recipe.ingredientUnit}
                />
              </ListItem>
              {tracedRecipes.length !== counter && (
                <Grid item xs={12} sm={12}>
                  <Divider
                    key={`tracedItemDivider_${recipe.recipeUid}_${counter}`}
                  />
                </Grid>
              )}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onOkClick} variant="contained">
          {TEXT.BUTTON_OK}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogItemTrace;
