import React from "react";
import { compose } from "recompose";

import Typography from "@material-ui/core/Typography";

import Button from "@material-ui/core/Button";
import Input from "@material-ui/core/Input";
// import Link from "@material-ui/core/Link";
import * as ROLES from "../../constants/roles";

import Util from "../Shared/utils.class";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";

const Temp = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <TempBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

const TempBase = ({ props, authUser }) => {
  // const firebase = props.firebase;
  console.log(authUser);
  // const [recipeUid, setRecipeUid] = React.useState("");

  const [url, setUrl] = React.useState("");
  const onInputChange = (event) => {
    setUrl(event.target.value);
  };

  const validateUrl = () => {
    console.log(url);
    console.log(Util.isUrl(url));
  };

  // onInputChange = (event) => {
  //   setRecipeUid(event.target.value);
  // };

  //FIXME: prüfen
  // const menuplan_usedRecipes_index = async () => {
  //   const menuplans = firebase.event_docs_collectionGroup();

  //   await menuplans
  //     .where("usedRecipes", "array-contains", "h5VqrDq8g4Vn6wdekLpg")
  //     .get()
  //     .then((snapshot) => {
  //       snapshot.forEach((document) => {
  //         console.log(document.ref.parent.parent.id);
  //         console.log(document.id);
  //       });
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       throw error;
  //     });
  // };

  // const remodelRecipes = async () => {
  //   if (!recipeUid) {
  //     return;
  //   }

  //   let recipeHead = {};
  //   let recipeDetails = {};
  //   let recipeDocRef;
  //   let recipeDetailsDocRef;
  //   let allRecipes = {};
  //   let recipe = {};
  //   let recipes = [];

  //   const recipesRef = firebase.recipe(recipeUid);
  //   await recipesRef
  //     .get()
  //     .then(async (snapshot) => {
  //       recipeHead = snapshot.data();
  //     })
  //     .then(async () => {
  //       recipeDetailsDocRef = firebase.recipe_details(recipeUid);
  //       await recipeDetailsDocRef.get().then((snapshot) => {
  //         recipeDetails = snapshot.data();
  //       });
  //     })
  //     .then(() => {
  //       recipe = { ...recipeHead, ...recipeDetails };
  //       delete recipe.searchString;
  //       console.log(recipe);
  //       // Hier updaten
  //       recipeDocRef = firebase.recipe(recipeUid);
  //       recipeDocRef.set(recipe);
  //     })
  //     .then(() => {
  //       let allRecipesDocRef = firebase.allRecipes();
  //       allRecipesDocRef.update({
  //         [recipeUid]: {
  //           name: recipe.name,
  //           pictureSrc: recipe.pictureSrcFullSize,
  //           tags: recipe.tags,
  //         },
  //       });
  //     })
  //     .then(() => {
  //       console.log(allRecipes);
  //     })

  //     .catch((error) => {
  //       console.error(error);
  //       throw error;
  //     });
  // };

  return (
    <React.Fragment>
      <Typography variant="h3">TEMP</Typography>
      {/* <Input
        id={"input"}
        value={recipeUid}
        // fullWidth={true}
        autoFocus
        autoComplete="off"
        onChange={onInputChange}
      /> */}

      <Input
        id={"input"}
        value={url}
        // fullWidth={true}
        autoFocus
        autoComplete="off"
        onChange={onInputChange}
      />

      <Button onClick={validateUrl}>Url validieren</Button>

      {/* <Button onClick={menuplan_usedRecipes_index}>
        menuplan_usedRecipes_index
      </Button>
      <br></br>
      <Link
        component="button"
        variant="h6"
        // color="inherit"
        underline="none"
        onClick={() => alert("click")}
      >
        {"test"}
      </Link> */}
    </React.Fragment>
  );
};
const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(Temp);
