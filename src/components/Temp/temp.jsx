import React from "react";
import { compose } from "recompose";

import Typography from "@material-ui/core/Typography";

import Button from "@material-ui/core/Button";

import * as ROLES from "../../constants/roles";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import users from "../User/users";

const Temp = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <TempBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

const TempBase = ({ props, authUser }) => {
  const firebase = props.firebase;

  const [dbError, setDbError] = React.useState();
  const doRequest = () => {
    // var xhttp = new XMLHttpRequest();
    // xhttp.onreadystatechange = function () {
    //   if (this.readyState == 4 && this.status == 200) {
    //     alert(this.responseText);
    //   }
    // };
    // xhttp.open(
    //   "POST",
    //   "https://maker.ifttt.com/trigger/chuchipirat_user_created/with/key/bDl9vn7PMDEUwlwEsiVDjU",
    //   true
    // );
    // xhttp.setRequestHeader("Content-type", "application/json");
    // xhttp.send({ value1: "Gio", value2: "42" });

    fetch(
      "https://maker.ifttt.com/trigger/chuchipirat_user_created/with/key/bDl9vn7PMDEUwlwEsiVDjU?value1=xyz&value2=13",
      // "https://maker.ifttt.com/trigger/chuchipirat_user_created/with/key/bDl9vn7PMDEUwlwEsiVDjU",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({
        //   value1: "Gio",
        //   value2: "42",
        // }),
      }
    );
  };

  // Index docs_collectionGroup usedProducts
  const shoppingList_docs_usedProducts = async () => {
    const menuplan = firebase.event_docs_collectionGroup();

    await menuplan
      .where("usedProducts", "array-contains", "i58ib4CpQcRGetDLvt3J")
      .get()
      .then((snapshot) => {
        snapshot.forEach((document) => {
          console.log(document.ref.parent.parent.id);
          console.log(document.id);
        });
      })
      .catch((error) => {
        console.error(error);
        setDbError(error);
        throw error;
      });
  };
  const recipe_details_usedProducts = async () => {
    const recipe = firebase.recipe_details_collectionGroup();

    await recipe
      .where("usedProducts", "array-contains", "i58ib4CpQcRGetDLvt3J")
      .get()
      .then((snapshot) => {
        snapshot.forEach((document) => {
          console.log(document.ref.parent.parent.id);
          console.log(document.id);
        });
      })
      .catch((error) => {
        console.error(error);
        setDbError(error);
        throw error;
      });
  };

  const shoppingList_docs_createdFromUid = async () => {
    const menuplans = firebase.event_docs_collectionGroup();

    await menuplans
      .where("createdFromUid", "==", "tasT02c6mxOWDstBdvwzjbs5Tfc2")
      .get()
      .then((snapshot) => {
        snapshot.forEach((document) => {
          console.log(document.ref.parent.parent.id);
          console.log(document.id);
        });
      })
      .catch((error) => {
        console.error(error);
        setDbError(error);
        throw error;
      });
  };

  const shoppingList_docs_generatedFromUid = async () => {
    const shoppingLists = firebase.event_docs_collectionGroup();

    await shoppingLists
      .where("generatedFromUid", "==", "tasT02c6mxOWDstBdvwzjbs5Tfc2")
      .get()
      .then((snapshot) => {
        snapshot.forEach((document) => {
          console.log(document.ref.parent.parent.id);
          console.log(document.id);
        });
      })
      .catch((error) => {
        console.error(error);
        setDbError(error);
        throw error;
      });
  };

  const shoppingList_docs_lastChangeFromUid = async () => {
    const menuplans = firebase.event_docs_collectionGroup();

    await menuplans
      .where("lastChangeFromUid", "==", "tasT02c6mxOWDstBdvwzjbs5Tfc2")
      .get()
      .then((snapshot) => {
        snapshot.forEach((document) => {
          console.log(document.ref.parent.parent.id);
          console.log(document.id);
        });
      })
      .catch((error) => {
        console.error(error);
        setDbError(error);
        throw error;
      });
  };

  const user_public_email = async () => {
    const users = firebase.public_CollectionGroup();

    await users
      .where("email", "==", "hallo@chuchipirat.ch")
      .get()
      .then((snapshot) => {
        snapshot.forEach((document) => {
          console.log(document.ref.parent.parent.id);
          console.log(document.id);
        });
      })
      .catch((error) => {
        console.error(error);
        setDbError(error);
        throw error;
      });
  };

  return (
    <React.Fragment>
      <Typography variant="h1">TEMP</Typography>

      {dbError && <Typography color="error">{dbError?.message}</Typography>}

      <Button onClick={shoppingList_docs_usedProducts}>
        shoppingList_docs_usedProducts
      </Button>
      <Button onClick={shoppingList_docs_createdFromUid}>
        shoppingList_docs_createdFromUid
      </Button>
      <Button onClick={shoppingList_docs_generatedFromUid}>
        shoppingList_docs_generatedFromUid
      </Button>
      <Button onClick={shoppingList_docs_lastChangeFromUid}>
        shoppingList_docs_lastChangeFromUid
      </Button>
      <Button onClick={recipe_details_usedProducts}>
        recipe_details_usedProducts
      </Button>
      <Button onClick={doRequest}>doRequest</Button>
      <Button onClick={user_public_email}>user_public_email</Button>
    </React.Fragment>
  );
};
const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(Temp);
