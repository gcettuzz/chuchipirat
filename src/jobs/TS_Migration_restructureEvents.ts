import EventGroupConfiguration from "../components/Event/GroupConfiguration/groupConfiguration.class";
import Event from "../components/Event/Event/event.class";
import EventShort from "../components/Event/Event/eventShort.class";
import AuthUser from "../components/Firebase/Authentication/authUser.class";
import {ValueObject} from "../components/Firebase/Db/firebase.db.super.class";
import Firebase from "../components/Firebase/firebase.class";
import Menuplan, {
  MealRecipe,
  MealRecipeDeletedPrefix,
  PlanedDiet,
  PlanedIntolerances,
} from "../components/Event/Menuplan/menuplan.class";
import Recipe, {RecipeType} from "../components/Recipe/recipe.class";
import RecipeShort from "../components/Recipe/recipeShort.class";
import Utils from "../components/Shared/utils.class";

import _ from "lodash";

import {
  MEAT as TEXT_MEAT,
  WITHOUT_INTOLERANCES as TEXT_WITHOUT_INTOLERANCES,
} from "../constants/text";
import User from "../components/User/user.class";
import UserPublicProfile, {
  UserPublicProfileStatsFields,
} from "../components/User/user.public.profile.class";

export async function restructureEventDocuments(
  firebase: Firebase,
  authUser: AuthUser
) {
  let recipes: {[key: string]: RecipeShort} = {};
  const events: {[key: string]: EventShort} = {};
  const statsRecipesInMenuplan: {[key: Recipe["uid"]]: number} = {};
  let counter = 0;
  let eventCounter = 0;
  let portionsCounter = 0;
  const cookedEventsPerUser: {[key: User["uid"]]: number} = {};

  // alle 000_recipes_all auslesen
  await firebase.recipeShortPublic
    .read<{[key: string]: RecipeShort}>({uids: []})
    .then((result) => {
      recipes = result;
    });

  // Alle privaten 000_recipes auslesen
  await firebase.recipeShortPrivate
    .readRawData({uids: []})
    .then(async (result) => {
      await result.userWithPrivateRecipes.forEach(async (userUid: string) => {
        await firebase.recipeShortPrivate
          .read<ValueObject>({uids: [userUid]})
          .then((result) => {
            recipes = {...recipes, ...result};
          });
      });
    });

  // Alle Dokumente holen
  const snapshot = await firebase.db.collection("events").get();

  // Zuerst das Event-Dokument
  for (const eventDocument of snapshot.docs) {
    let eventDocumentData = eventDocument.data();
    eventCounter++;
    eventDocumentData =
      firebase.event.convertTimestampValuesToDates(eventDocumentData);

    if (Object.prototype.hasOwnProperty.call(eventDocumentData, "createdAt")) {
      console.log(eventDocument.id);
      const eventDocumentNewStructure = {
        uid: eventDocument.id,
        authUsers: eventDocumentData.authUsers,
        cooks: eventDocumentData.cooks.map((cook) => ({
          displayName: cook.displayName,
          motto: cook.motto,
          pictureSrc: {
            fullSize: cook.pictureSrc,
            normalSize: cook.pictureSrc,
            smallSize: cook.pictureSrc,
          },
          uid: cook.uid,
        })),
        created: {
          date: eventDocumentData.createdAt,
          fromDisplayName: eventDocumentData.createdFromDisplayName,
          fromUid: eventDocumentData.createdFromUid,
        },
        dates: eventDocumentData.dates,
        lastChange: {
          date: eventDocumentData.lastChangeAt,
          fromDisplayName: eventDocumentData.lastChangeFromDisplayName,
          fromUid: eventDocumentData.lastChangeFromUid,
        },
        location: eventDocumentData.location,
        maxDate: eventDocumentData.maxDate,
        motto: eventDocumentData.motto,
        name: eventDocumentData.name,
        numberOfDays: eventDocumentData.dates.reduce(
          (result, currenEntry) =>
            result +
            Utils.differenceBetweenTwoDates({
              dateFrom: currenEntry.from,
              dateTo: currenEntry.to,
            }),
          0
        ),
        pictureSrc: eventDocumentData?.pictureSrc
          ? eventDocumentData?.pictureSrc
          : "",
      } as Event;

      // Statistik führen, wer wie viele Anlässe bekocht hat.
      eventDocumentNewStructure.authUsers.forEach((authUserUid) => {
        if (
          Object.prototype.hasOwnProperty.call(cookedEventsPerUser, authUserUid)
        ) {
          cookedEventsPerUser[authUserUid] =
            cookedEventsPerUser[authUserUid] + 1;
        } else {
          cookedEventsPerUser[authUserUid] = 1;
        }
      });

      // Event zurückspeichern
      await eventDocument.ref.set(
        Object.assign(
          {},
          firebase.event.convertDateValuesToTimestamp(
            _.cloneDeep(eventDocumentNewStructure)
          )
        )
      );
      counter++;

      // Event im 000_allEvents nachführen
      events[eventDocument.id] = EventShort.createShortEventFromEvent(
        eventDocumentNewStructure
      );

      // Group-Config generieren
      const groupConfig = EventGroupConfiguration.factory();
      let dietUid = "";
      let intorleranceUid = "";

      // Im Feld ohne Intoleranzen
      Object.values(groupConfig.diets.entries).forEach((entry) => {
        if (entry.name == TEXT_MEAT) {
          entry.totalPortions = eventDocumentData.participants;
          dietUid = entry.uid;
        }
      });
      Object.values(groupConfig.intolerances.entries).forEach((entry) => {
        if (entry.name == TEXT_WITHOUT_INTOLERANCES) {
          entry.totalPortions = eventDocumentData.participants;
          intorleranceUid = entry.uid;
        }
      });

      groupConfig.created = {
        fromDisplayName: "Migration",
        date: new Date(),
        fromUid: "-",
      };
      groupConfig.lastChange = {
        fromDisplayName: "Migration",
        date: new Date(),
        fromUid: "-",
      };

      groupConfig.totalPortions = eventDocumentData.participants;
      groupConfig.portions[dietUid][intorleranceUid] =
        eventDocumentData.participants;

      const grouConfigDocumentReference = firebase.db.doc(
        `events/${eventDocument.id}/docs/groupConfiguration`
      );

      const dbObject =
        firebase.event.groupConfiguration.convertDateValuesToTimestamp(
          _.cloneDeep(groupConfig)
        );

      await grouConfigDocumentReference
        .set(Object.assign({}, dbObject))
        .catch((error) => {
          console.error(error);
          throw error;
        });

      portionsCounter = groupConfig.totalPortions;
      counter++;

      // Menüplan migrieren
      const menuplanDocument = firebase.db.doc(
        `events/${eventDocument.id}/docs/menuplan`
      );

      const result = await menuplanDocument.get();
      let menuplanDocumentData = result.data();
      menuplanDocumentData =
        firebase.event.menuplan.convertTimestampValuesToDates(
          menuplanDocumentData
        );

      if (menuplanDocumentData) {
        const menuplanNewStructure = Menuplan.factory({
          event: {...eventDocumentNewStructure, uid: eventDocument.id},
          authUser: {
            uid: "",
            publicProfile: {displayName: ""},
          } as AuthUser,
        });

        // Mahlzeit-Typen aus der Factory löschen
        menuplanNewStructure.mealTypes = {order: [], entries: {}};

        // Standard Felder setzen
        menuplanNewStructure.created = {
          date: menuplanDocumentData.createdAt,
          fromDisplayName: menuplanDocumentData.createdFromDisplayName,
          fromUid: menuplanDocumentData.createdFromUid,
        };
        menuplanNewStructure.lastChange = {
          date: menuplanDocumentData.lastChangeAt,
          fromDisplayName: menuplanDocumentData.lastChangeFromDisplayName,
          fromUid: menuplanDocumentData.lastChangeFromUid,
        };

        menuplanNewStructure.materials = {};
        menuplanNewStructure.products = {};

        menuplanNewStructure.usedRecipes = menuplanDocumentData.usedRecipes;
        menuplanNewStructure.usedProducts = [];

        // Mahlzeitentypen
        menuplanDocumentData.meals.forEach((meal) => {
          menuplanNewStructure.mealTypes.order.push(meal.uid);
          menuplanNewStructure.mealTypes.entries[meal.uid] = {
            name: meal.name,
            uid: meal.uid,
          };
        });

        // Mahlzeiten - Pro Tag und Mahlzeit eine generieren
        Object.values(menuplanNewStructure.mealTypes.entries).forEach(
          (mealType) => {
            menuplanNewStructure.dates.forEach((date) => {
              // Mahlzeit erstellen
              const meal = Menuplan.createMeal({
                mealType: mealType.uid,
                date: date,
              });
              menuplanNewStructure.meals[meal.uid] = meal;
              // Ein Menü erzeugen und der Mahlzeit hinzufügen
              const menu = Menuplan.createMenu();
              menuplanNewStructure.meals[meal.uid].menuOrder.push(menu.uid);
              menuplanNewStructure.menues[menu.uid] = menu;
            });
          }
        );

        // Rezepte - die Fixe Portion wird für die Planung 1:1 übernommen
        menuplanDocumentData.recipes.forEach((recipe) => {
          const fullRecipe = recipes[recipe.recipeUid];

          const mealRecipe = {
            uid: recipe?.uid,
            recipe: {
              createdFromUid: fullRecipe?.created?.fromUid
                ? fullRecipe?.created?.fromUid
                : "",
              name: fullRecipe
                ? fullRecipe?.name
                : `🗑️ Das Rezept «${recipe.recipeName}» wurde gelöscht`,
              recipeUid: fullRecipe
                ? recipe?.recipeUid
                : `${MealRecipeDeletedPrefix}${recipe.recipeUid}`,
              type: fullRecipe ? fullRecipe?.type : RecipeType.public,
            },
            totalPortions: parseInt(recipe.noOfServings),
            plan: [
              {
                diet: PlanedDiet.FIX,
                intolerance: PlanedIntolerances.FIX,
                factor: 1,
                totalPortions: parseInt(recipe.noOfServings),
              },
            ],
          } as MealRecipe;
          menuplanNewStructure.mealRecipes[mealRecipe.uid] = mealRecipe;

          // Heraussuchen in welches Menü, das muss und in die Order schieben.
          const meal = Object.values(menuplanNewStructure.meals).find(
            (meals) => {
              if (
                meals.date == Utils.dateAsString(recipe.date) &&
                meals.mealType == recipe.mealUid
              ) {
                return true;
              }
            }
          );

          if (!meal) {
            console.log(recipe);
            console.log(menuplanDocumentData);
            console.log(menuplanNewStructure);
            console.warn(
              "Meal nicht gefunden - menuplan",
              menuplanNewStructure.uid
            );
          } else {
            const menueUid = menuplanNewStructure.meals[meal.uid].menuOrder[0];

            menuplanNewStructure.menues[menueUid].mealRecipeOrder.push(
              mealRecipe.uid
            );
          }
          // Statistik mitführen
          if (
            Object.prototype.hasOwnProperty.call(
              statsRecipesInMenuplan,
              recipe.recipeUid
            )
          ) {
            statsRecipesInMenuplan[recipe.recipeUid] =
              statsRecipesInMenuplan[recipe.recipeUid] + 1;
          } else {
            statsRecipesInMenuplan[recipe.recipeUid] = 1;
          }
        });

        // Notizen
        menuplanDocumentData.notes.forEach((note) => {
          // Wenn nur im Original-Dok Datum und MealUid gefüllt, muss
          // das entsprechende Menü zuerst gesucht werden.
          if (note.mealUid) {
            const meal = Object.values(menuplanNewStructure.meals).find(
              (meals) => {
                if (
                  note.date instanceof Date &&
                  meals.date == Utils.dateAsString(note.date) &&
                  meals.mealType == note.mealUid
                ) {
                  return true;
                }
              }
            );

            if (meal) {
              menuplanNewStructure.notes[note.uid] = {
                date: Utils.dateAsString(note.date),
                menueUid: meal?.uid,
                text: note.text,
                uid: note.uid,
              };
            }
          } else {
            // Kopfnotiz
            menuplanNewStructure.notes[note.uid] = {
              date: Utils.dateAsString(note.date),
              menueUid: "",
              text: note.text,
              uid: note.uid,
            };
          }
        });

        await menuplanDocument.set(
          Object.assign(
            {},
            firebase.event.menuplan.convertDateValuesToTimestamp(
              _.cloneDeep(menuplanNewStructure)
            )
          )
        );
        counter++;
      }

      // Event-Index updaten
      // Danach die eine Einkaufsliste löschen
      const shoppingListDocument = firebase.db.doc(
        `events/${eventDocument.id}/docs/shoppingList`
      );
      await shoppingListDocument.delete().catch((error) => {
        // Gab wohl keine ShoppingListe
        console.warn(error);
      });
    }
  }

  // Den Usern Credits verteilen
  Object.entries(cookedEventsPerUser).forEach(([key, value]) => {
    UserPublicProfile.incrementField({
      firebase: firebase,
      uid: key,
      field: UserPublicProfileStatsFields.noEvents,
      step: value,
    }).catch((error) => console.error(error));
  });

  firebase.stats.counter.updateFields({
    uids: [""],
    values: {
      noParticipants: portionsCounter,
      noEvents: eventCounter,
    },
    authUser: authUser,
  });

  console.log(events);
  await firebase.db
    .doc(`events/000_allEvents`)
    .update(
      Object.assign({}, firebase.event.convertDateValuesToTimestamp(events))
    )
    .catch((error) => console.error(error));
  counter++;

  console.log("recipesInMenuplan", statsRecipesInMenuplan);
  await firebase.db
    .collection("stats")
    .doc("recipesInMenuplan")
    .set(statsRecipesInMenuplan)
    .catch((error) => console.error(error));

  return counter;
}
