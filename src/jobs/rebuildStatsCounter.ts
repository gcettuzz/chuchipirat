// Die Zähler im File Stats geradebiegen

import Event from "../components/Event/Event/event.class";
import AuthUser from "../components/Firebase/Authentication/authUser.class";
import Firebase from "../components/Firebase/firebase.class";
import Stats from "../components/Shared/stats.class";
import Product from "../components/Product/product.class";
import Material from "../components/Material/material.class";
import {RecipeType} from "../components/Recipe/recipe.class";
import User from "../components/User/user.class";

export async function rebuildStatsCounter(
  firebase: Firebase,
  authUser: AuthUser
) {
  let counter = 0;
  const stats = new Stats();

  const promiseCollector: Promise<void>[] = [];

  // Alle Anlässe holen
  promiseCollector.push(
    Event.getAllEvents({firebase: firebase})
      .then((result) => {
        counter++;
        stats.noEvents = result.length;
      })
      .catch((error) => console.log(error))
  );
  // Alle Produkte holen
  promiseCollector.push(
    Product.getAllProducts({
      firebase: firebase,
      onlyUsable: true,
      withDepartmentName: false,
    })
      .then((result) => {
        counter++;
        stats.noIngredients = result.length;
      })
      .catch((error) => console.log(error))
  );
  // Alle Materialien holen
  promiseCollector.push(
    Material.getAllMaterials({
      firebase: firebase,
      onlyUsable: true,
    })
      .then((result) => {
        counter++;
        stats.noMaterials = result.length;
      })
      .catch((error) => console.log(error))
  );

  // Wir wollen alle Dokumente einer Collectiongroup
  // Darum direkter Zugriff auf Firebase
  promiseCollector.push(
    firebase.db
      .collectionGroup("docs")
      .get()
      .then((result) => {
        if (result.size > 0) {
          result.forEach((document) => {
            counter++;
            switch (document.id) {
              case "groupConfiguration":
                // Group-Config --> Anzahl Portionen
                stats.noParticipants =
                  stats.noParticipants +
                  parseInt(document.data().totalPortions);
                break;
              case "materialList":
                // Materialliste zählen
                stats.noMaterialLists =
                  stats.noMaterialLists + parseInt(document.data().noOfLists);
                break;
              case "shoppingListCollection":
                // Einkaufslsiten
                stats.noShoppingLists =
                  stats.noShoppingLists + parseInt(document.data().noOfLists);
                break;
              default:
              // Nichts tun
            }
          });
        }
      })
      .catch((error) => console.log(error))
  );

  // Rezepte
  promiseCollector.push(
    firebase.db
      .collectionGroup("recipes")
      .get()
      .then((result) => {
        result.forEach((recipeDocument) => {
          counter++;
          if (recipeDocument.ref.path.includes(`/${RecipeType.public}/`)) {
            stats.noRecipesPublic++;
          } else if (
            recipeDocument.ref.path.includes(`/${RecipeType.private}/`)
          ) {
            stats.noRecipesPrivate++;
          } else if (
            recipeDocument.ref.path.includes(`/${RecipeType.variant}s/`)
          ) {
            stats.noRecipeVariants++;
          }
        });
      })
      .catch((error) => console.log(error))
  );

  // User holen
  promiseCollector.push(
    User.getUsersOverview({firebase})
      .then((result) => {
        counter++;
        stats.noUsers = result.length;
      })
      .catch((error) => console.log(error))
  );

  await Promise.all(promiseCollector);
  console.log(stats, counter);
  await Stats.save({
    firebase: firebase,
    stats: stats,
    authUser: authUser,
  }).catch((error) => console.log(error));

  return counter;
}
