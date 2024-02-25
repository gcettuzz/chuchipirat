/* eslint-disable react/prop-types */ // TODO: upgrade to latest eslint tooling

import React from "react";
import {compose} from "react-recompose";
// import useStyles from "../../constants/styles";

// import initialData, {InitialData, ColumnProps, TaskProps} from "./initial-data";

import Typography from "@material-ui/core/Typography";
// import TextField from "@material-ui/core/TextField";
// import SearchIcon from "@material-ui/icons/Search";
// import ClearIcon from "@material-ui/icons/Clear";
// import IconButton from "@material-ui/core/IconButton";
// import InputAdornment from "@material-ui/core/InputAdornment";
// import OutlinedInput from "@material-ui/core/OutlinedInput";
// import InputLabel from "@material-ui/core/InputLabel";
// import FormControl from "@material-ui/core/FormControl";

// import {
//   DialogType,
//   SingleTextInputResult,
//   useCustomDialog,
// } from "../Shared/customDialogContext";

import {
  // Card,
  // CardMedia,
  // CardContent,
  // makeStyles,
  // CardHeader,
  Container,
  // List,
  // ListItem,
  // ListItemText,
  // Divider,
  Grid,
} from "@material-ui/core";

import Button from "@material-ui/core/Button";
// import Input from "@material-ui/core/Input";
// import Link from "@material-ui/core/Link";
import Role from "../../constants/roles";

import {withFirebase} from "../Firebase/firebaseContext";
// import {AuthUser} from "../Firebase/Authentication/authUser.class";

import withEmailVerification from "../Session/withEmailVerification";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../Shared/global.interface";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
// import {
//   Ingredient,
//   PositionType,
//   PreparationStep,
//   RecipeMaterialPosition,
//   RecipeObjectStructure,
// } from "../Recipe/recipe.class";
// import Feed, {FeedType} from "../Shared/feed.class";
// import {userInfo} from "os";
// import Request from "../Request/request.class";

// const TempPage = (props) => {
//   return (
//     <AuthUserContext.Consumer>
//       {(authUser) => <TempBase props={props} authUser={authUser} />}
//     </AuthUserContext.Consumer>
//   );
// };

// const appUrl = "http://localhost:3000";

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const TempPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <TempBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const TempBase: React.FC<CustomRouterProps & {authUser: AuthUser | null}> = ({
  authUser,
  ...props
}) => {
  const firebase = props.firebase;

  if (!authUser) {
    return null;
  }
  console.log(firebase);

  const moveRecipes = async () => {
    firebase.db
      .collection("/recipe/public/recipes")
      .get()
      .then((recipeDocuments) => {
        recipeDocuments.forEach((recipeDoc) => {
          const docData = recipeDoc.data();

          if (Object.prototype.hasOwnProperty.call(docData, "ingredients")) {
            console.log(recipeDoc.id);
            firebase.db
              .collection("recipes/public/recipes")
              .doc(recipeDoc.id)
              .set(docData)
              .then(() => {
                recipeDoc.ref.delete();
              });
          } else if (recipeDoc.id === "000_allRecipes") {
            firebase.db
              .collection("recipes")
              .doc("public")
              .set(docData)
              .then(() => {
                recipeDoc.ref.delete();
              });
          }
        });
      });
  };

  // const classes = useStyles();
  // const {customDialog} = useCustomDialog();

  // let counter = 0;
  // Rezepte anpassen
  // const updateRecipes = async () => {
  //   // Alle Rezepte aus einer Collection holen
  //   let userInput = {valid: false, input: ""} as SingleTextInputResult;

  //   userInput = (await customDialog({
  //     dialogType: DialogType.SingleTextInput,
  //     title: "Verzeichnis-UID für User Rezepte",
  //     text: "",
  //   })) as SingleTextInputResult;

  //   if (userInput.valid) {
  //     let collection = firebase.db.collection(
  //       `recipes/000_userRecipes/${userInput.input}/`
  //     );

  //     await collection.get().then((snapshot) => {
  //       snapshot.forEach(async (document) => {
  //         if (
  //           document.id !== "000_allRecipes" &&
  //           document.id !== "000_userRecipes"
  //         ) {
  //           counter++;
  //           let recipeData = document.data();

  //           let ingredients: RecipeObjectStructure<Ingredient> = {
  //             entries: {},
  //             order: [],
  //           };
  //           let preparationSteps: RecipeObjectStructure<PreparationStep> = {
  //             entries: {},
  //             order: [],
  //           };

  //           let materials: RecipeObjectStructure<RecipeMaterialPosition> = {
  //             entries: {},
  //             order: [],
  //           };

  //           recipeData.ingredients.forEach((ingredient) => {
  //             let newIngredient = {
  //               uid: ingredient.uid,
  //               posType: PositionType.ingredient,
  //               product: ingredient.product,
  //               quantity: ingredient.quantity,
  //               unit: ingredient.unit,
  //               detail: ingredient.detail,
  //               scalingFactor: ingredient.scalingFactor,
  //             };

  //             ingredients.entries[newIngredient.uid] = newIngredient;
  //             ingredients.order.push(newIngredient.uid);
  //           });

  //           recipeData.ingredients = ingredients;

  //           recipeData.preparationSteps.forEach((preparationStep) => {
  //             let newPreparationStep = {
  //               uid: preparationStep.uid,
  //               posType: PositionType.preparationStep,
  //               step: preparationStep.step,
  //             };

  //             preparationSteps.entries[newPreparationStep.uid] =
  //               newPreparationStep;
  //             preparationSteps.order.push(newPreparationStep.uid);
  //           });
  //           recipeData.preparationSteps = preparationSteps;

  //           if (recipeData?.materials) {
  //             recipeData?.materials.forEach((material) => {
  //               let newMaterial = {
  //                 uid: material.uid,
  //                 quantity: material.quantity,
  //                 material: material.material,
  //               };

  //               materials.entries[newMaterial.uid] = newMaterial;
  //               materials.order.push(newMaterial.uid);
  //             });
  //           }

  //           recipeData.materials = materials;

  //           delete recipeData.sections;
  //           // Daten zurückschreiben

  //           let documentReference = firebase.db.doc(
  //             `recipes/000_userRecipes/${userInput.input}/${document.id}`
  //           );
  //           await documentReference.set(recipeData);
  //         }
  //       });
  //     });
  //   }
  // };

  // console.log(firebase.configuration);

  // const createFeedMail = async () => {
  //   let allergenDescription = {
  //     1: "Laktose",
  //     2: "Gluten",
  //   };
  //   let dietDescription = {
  //     1: "ist Fleisch",
  //     2: "Vegetarisch",
  //     3: "Vegan",
  //   };
  //   let materialTypeDescription = {
  //     1: "Verbrauchsmaterial",
  //     2: "Gebrauchsmaterial",
  //   };
  //   let userInput = (await customDialog({
  //     dialogType: DialogType.SingleTextInput,
  //     title: "Datum",
  //     singleTextInputProperties: {
  //       initialValue: "2023-09-16",
  //       // initialValue: "2024-01-13",
  //       textInputLabel: "",
  //       textInputMultiline: false,
  //     },
  //   })) as SingleTextInputResult;
  //   let products: object;
  //   let materials: object;
  //   let departments: object;
  //   let newsletterPictureSrc = "";
  //   if (!userInput.valid) {
  //     return;
  //   }
  //   // 15.09.23 PRODUKT
  //   // 23.07.23 MATERIAL
  //   // 11.09.23 RECIPE PUBLISHED
  //   let today = new Date(userInput.input);
  //   today.setHours(0, 0, 0, 0);
  //   let yesterday = new Date(today);
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   console.log("today:", today);
  //   console.log("yesterday:", yesterday);
  //   let mailData = {
  //     appUrl: appUrl,
  //     headerPictureSrc: "",
  //     date: yesterday.toLocaleDateString("de-CH", {dateStyle: "medium"}),
  //     newUserCount: 0,
  //     newEventCount: 0,
  //     hasNewRecipes: false,
  //     newRecipes: [] as {name: string; type: string}[],
  //     hasPublishedRecipes: false,
  //     publishedRecipes: [] as {name: string; uid: string; url: string}[],
  //     hasNewProducts: false,
  //     newProducts: [] as {
  //       name: string;
  //       department: string;
  //       unit: string;
  //       allergy: string;
  //       diet: string;
  //     }[],
  //     hasNewMaterials: false,
  //     newMaterials: [] as {name: string; type: string}[],
  //     hasOpenRequests: false,
  //     openRequests: [] as {number: number; name: string; createDate: string}[],
  //   };
  //   await firebase.db
  //     .collection("feeds")
  //     .where("created.date", "<", today)
  //     .where("created.date", ">=", yesterday)
  //     // .where("type", "==", FeedType.recipePublished)
  //     .where("type", "in", [
  //       FeedType.userCreated,
  //       FeedType.eventCreated,
  //       FeedType.recipeCreated,
  //       FeedType.recipePublished,
  //       FeedType.productCreated,
  //       FeedType.materialCreated,
  //     ])
  //     .get()
  //     .then(async (snapshot) => {
  //       if (snapshot.size == 0) {
  //         return;
  //       }
  //       if (
  //         snapshot.docs.some(
  //           (doc) => doc.data().type == FeedType.productCreated
  //         )
  //       ) {
  //         // Produkte lesen
  //         await firebase.db
  //           .collection("masterData")
  //           .doc("products")
  //           .get()
  //           .then((result) => {
  //             products = result.data() as object;
  //             console.log("products", products);
  //           })
  //           .then(async () => {
  //             // Abteilungen
  //             await firebase.db
  //               .collection("masterData")
  //               .doc("departments")
  //               .get()
  //               .then((result) => {
  //                 departments = result.data() as object;
  //                 console.log("departments", departments);
  //               });
  //           })
  //           .catch((error) => console.log(error));
  //       }
  //       if (
  //         snapshot.docs.some(
  //           (doc) => doc.data().type == FeedType.materialCreated
  //         )
  //       ) {
  //         // Materiale lesen
  //         await firebase.db
  //           .collection("masterData")
  //           .doc("materials")
  //           .get()
  //           .then((result) => {
  //             materials = result.data() as object;
  //             console.log("materials", materials);
  //           })
  //           .catch((error) => console.log(error));
  //       }
  //       snapshot.docs.forEach((feedDoc) => {
  //         let feed = feedDoc.data() as Feed;
  //         switch (feed.type) {
  //           case FeedType.userCreated:
  //             mailData.newUserCount++;
  //             break;
  //           case FeedType.eventCreated:
  //             mailData.newEventCount++;
  //             break;
  //           case FeedType.recipeCreated:
  //             if (!newsletterPictureSrc && feed.sourceObject.pictureSrc) {
  //               // für den Newsletter das Bild eines Rezeptes übernehmen
  //               newsletterPictureSrc = feed.sourceObject.pictureSrc;
  //             }
  //             mailData.newRecipes.push({
  //               name: feed.sourceObject.name,
  //               type:
  //                 feed.sourceObject.type == "private"
  //                   ? "Privat"
  //                   : feed.sourceObject.type == "variant"
  //                   ? "Variante"
  //                   : "",
  //             });
  //             mailData.hasNewRecipes = true;
  //             break;
  //           case FeedType.recipePublished:
  //             mailData.publishedRecipes.push({
  //               name: feed.sourceObject.name,
  //               uid: feed.sourceObject.uid,
  //               url: `${appUrl}/recipe/${feed.sourceObject.uid}`,
  //             });
  //             mailData.hasPublishedRecipes = true;
  //             break;
  //           case FeedType.productCreated:
  //             let product = products[feed.sourceObject.uid];
  //             mailData.newProducts.push({
  //               name: product.name,
  //               department: departments[product.departmentUid].name,
  //               unit: product.shoppingUnit,
  //               allergy: product.dietProperties.allergens
  //                 .map((allergen) => allergenDescription[allergen])
  //                 .join(", "),
  //               diet: dietDescription[product?.dietProperties.diet],
  //             });
  //             mailData.hasNewProducts = true;
  //             break;
  //           case FeedType.materialCreated:
  //             let material = materials[feed.sourceObject.uid];
  //             mailData.newMaterials.push({
  //               name: material.name,
  //               type: materialTypeDescription[material.type],
  //             });
  //             mailData.hasNewMaterials = true;
  //             break;
  //         }
  //       });
  //       //TODO: ersetzen je nach Umgebung
  //       mailData.headerPictureSrc = newsletterPictureSrc
  //         ? newsletterPictureSrc
  //         : "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/defaults%2Fplaceholder.png?alt=media&token=fe2c82ce-5e98-41be-ae98-87a1af3753a3";
  //     })
  //     .then(async () => {
  //       // Prüfen ob es offene Requests gibt
  //       // Schauen ob es offene Requests gibt
  //       await firebase.db
  //         .collectionGroup("active")
  //         .where("assignee.uid", "==", "")
  //         .get()
  //         .then((snapshot) => {
  //           console.log(snapshot.size);
  //           if (snapshot.size == 0) {
  //             return;
  //           }
  //           snapshot.forEach((document) => {
  //             let request = document.data() as Request;
  //             mailData.openRequests.push({
  //               number: request.number,
  //               name: request.requestObject.name,
  //               createDate: request.createDate
  //                 .toDate()
  //                 .toLocaleDateString("de-CH", {dateStyle: "medium"}),
  //             });
  //             mailData.hasOpenRequests = true;
  //           });
  //         })
  //         .catch((error) => console.error(error));
  //       return;
  //     })
  //     .finally(async () => {
  //       console.log(mailData);
  //       // nur ausführen, wenn daten vorhanden sind.
  //       if (
  //         mailData.hasNewMaterials == false &&
  //         mailData.hasNewProducts == false &&
  //         mailData.hasNewRecipes == false &&
  //         mailData.hasPublishedRecipes == false &&
  //         mailData.hasOpenRequests == false &&
  //         mailData.newUserCount == 0 &&
  //         mailData.newEventCount == 0
  //       ) {
  //         // Keine Änderung - kein Mail
  //         return;
  //       }
  //       let mailDocument = firebase.db.collection("_mailbox").doc();
  //       await mailDocument
  //         .set({
  //           to: "gio.cettuzzi@gmail.com",
  //           // bcc: "hallo@chuchipirat.ch",
  //           template: {
  //             data: mailData,
  //             name: "DailySummary",
  //           },
  //         })
  //         .then(() => {
  //           console.warn(mailDocument.id);
  //           // Log der Ausführungen Cloudfunctions nachführen
  //           firebase.db
  //             .collection("_cloudFunctions")
  //             .doc("log")
  //             .update({
  //               [mailDocument.id]: {
  //                 cloudFunctionType: "dailySummary",
  //                 date: firebase.timestamp.fromDate(new Date()),
  //                 invokedBy: {
  //                   uid: "",
  //                   displayName: "system",
  //                   firstName: "System",
  //                   lastName: "",
  //                   email: "",
  //                 },
  //               },
  //             });
  //         })
  //         .catch((error) => {
  //           console.error(error);
  //         });
  //     })
  //     .catch((error) => console.log(error));
  // };

  return (
    <React.Fragment>
      <Container style={{marginTop: "3rem"}} component="main" maxWidth="md">
        <Typography variant="h1" align="center">
          TEMP
        </Typography>
        <Grid container justifyContent="center">
          <Button variant="outlined" color="primary" onClick={moveRecipes}>
            Rezepte umziehen
          </Button>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

const condition = (authUser: AuthUser | null) =>
  !!authUser && !!authUser.roles.includes(Role.admin);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(TempPage);
