import React, { useReducer } from "react";
import { useHistory } from "react-router";
import useStyles from "../../constants/styles";

import Button from "@material-ui/core/Button";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import CardMedia from "@material-ui/core/CardMedia";

// import Slide from "@material-ui/core/Slide";
// import { TransitionProps } from "@material-ui/core/transitions";

import * as TEXT from "../../constants/text";

import Firebase, { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import RecipeShort from "./recipeShort.class";
import recipe from "./recipe";
import Recipe from "./recipe.class";
import { DialogContent } from "@material-ui/core";

export interface DialogQuickViewActions {
  key: string;
  name: string;
  variant: "text" | "outlined" | "contained";
  onClick: (
    event: React.MouseEvent<HTMLButtonElement> | undefined,
    recipe: Recipe
  ) => void;
}

/* ===================================================================
// ==================== Pop Up Rezept Kurzübersicht ==================
// =================================================================== */
interface DialogRecipeQuickViewProps {
  firebase: Firebase;
  recipeShort: RecipeShort;
  dialogOpen: boolean;
  handleClose: (event, reason) => void;
  dialogActions: DialogQuickViewActions[];
  authUser: any;
}

const DialogRecipeQuickView = ({
  firebase,
  recipeShort,
  dialogOpen,
  handleClose,
  dialogActions,
  authUser,
}: DialogRecipeQuickViewProps) => {
  const [recipe, setRecipe] = React.useState<Recipe>(new Recipe());
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const classes = useStyles();

  // const Transition = React.forwardRef(function Transition(
  //   props: TransitionProps & { children?: React.ReactElement<any, any> },
  //   ref: React.Ref<unknown>
  // ) {
  //   return <Slide direction="up" ref={ref} {...props} />;
  // });

  if (recipeShort.uid && !recipe.uid) {
    Recipe.getRecipe({
      firebase: firebase,
      uid: recipeShort.uid,
      userUid: recipeShort.created.fromUid,
      type: recipeShort.type,
    }).then((result) => {
      setRecipe(result);
      setIsLoading(false);
    });
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="Rezept Quick View"
      fullWidth
      // TransitionComponent={Transition}
      // keepMounted
      maxWidth={"sm"}
      open={dialogOpen}
      scroll={"paper"}
    >
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {recipeShort.pictureSrc && (
        <CardMedia
          className={classes.cardMedia}
          image={recipeShort.pictureSrc}
          title={"Bild " + recipeShort.name}
        />
      )}
      <DialogTitle id="simple-dialog-title">{recipeShort.name}</DialogTitle>
      <DialogContent>
        {recipe.source}
        //TODO: Inhalt definieren
      </DialogContent>
      <DialogActions>
        {dialogActions.map((action) => (
          <Button
            key={action.key}
            id={action.key}
            size="small"
            color="primary"
            variant={action.variant}
            onClick={(event) => action.onClick(event, recipe)}
          >
            {action.name}
          </Button>
        ))}
        {/* <Button onClick={handleButtonClose} color="primary">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button onClick={() => handleOpen} color="primary" variant="outlined">
          {TEXT.RECIPE_OPEN}
        </Button> */}
      </DialogActions>
    </Dialog>
  );
};

export default DialogRecipeQuickView;
