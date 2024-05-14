import React from "react";
import useStyles from "../../constants/styles";

import Button from "@material-ui/core/Button";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import CardMedia from "@material-ui/core/CardMedia";

import RecipeShort from "./recipeShort.class";
import Recipe from "./recipe.class";
import {DialogContent, Link, List} from "@material-ui/core";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {FormListItem} from "../Shared/formListItem";
import Utils from "../Shared/utils.class";
import Firebase from "../Firebase/firebase.class";

import {
  SOURCE as TEXT_SOURCE,
  UID as TEXT_UID,
  CREATED_FROM as TEXT_CREATED_FROM,
  RECIPETYPE as TEXT_RECIPETYPE,
} from "../../constants/text";

import {USER_PUBLIC_PROFILE as ROUTES_USER_PUBLIC_PROFILE} from "../../constants/routes";
import {useHistory} from "react-router";
import Action from "../../constants/actions";
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
  authUser: AuthUser;
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
  const {push} = useHistory();

  if (recipeShort.uid && !recipe.uid) {
    Recipe.getRecipe({
      firebase: firebase,
      uid: recipeShort.uid,
      userUid: recipeShort.created.fromUid,
      type: recipeShort.type,
      authUser: authUser,
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
        <List dense>
          {/* UID */}
          <FormListItem
            key={"uid"}
            id={"uid"}
            value={recipe.uid}
            label={TEXT_UID}
            displayAsCode={true}
          />

          {/* Quelle */}
          <FormListItem
            key={"source"}
            id={"source"}
            value={
              Utils.isUrl(recipe.source) ? (
                <Link href={recipe.source as string} target="_blank">
                  {Utils.getDomain(recipe.source)}
                </Link>
              ) : (
                recipe.source
              )
            }
            label={TEXT_SOURCE}
          />
          {/* Autor*in */}
          <FormListItem
            key={"author"}
            id={"author"}
            value={
              <Link
                style={{cursor: "pointer"}}
                onClick={() =>
                  push({
                    pathname: `${ROUTES_USER_PUBLIC_PROFILE}/${recipe.created.fromUid}`,
                    state: {
                      action: Action.VIEW,
                      displayName: recipe.created.fromDisplayName,
                    },
                  })
                }
              >
                {recipe.created.fromDisplayName}
              </Link>
            }
            label={TEXT_CREATED_FROM}
          />
          <FormListItem
            key={"authorUid"}
            id={"authorUid"}
            value={recipe.created.fromUid}
            label={`${TEXT_CREATED_FROM} ${TEXT_UID}`}
            displayAsCode={true}
          />
          <FormListItem
            key={"recipeType"}
            id={"recipeType"}
            value={recipe.type}
            label={TEXT_RECIPETYPE}
            displayAsCode={true}
          />
        </List>
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
      </DialogActions>
    </Dialog>
  );
};

export default DialogRecipeQuickView;
