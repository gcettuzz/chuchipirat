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
// Alte Struktur

// authUsers: value.authUsers,
// cooks: value.cooks,
// createdAt: this.firebase.timestamp.fromDate(value.createdAt),
// createdFromDisplayName: value.createdFromDisplayName,
// createdFromUid: value.createdFromUid,
// dates: value.dates,
// lastChangeAt: this.firebase.timestamp.fromDate(value.lastChangeAt),
// lastChangeFromDisplayName: value.lastChangeFromDisplayName,
// lastChangeFromUid: value.lastChangeFromUid,
// location: value.location,
// maxDate: this.firebase.timestamp.fromDate(value.maxDate),
// motto: value.motto,
// name: value.name,
// participants: parseInt(value.participants),
// numberOfDays: value.numberOfDays,
// pictureSrc: value.pictureSrc,
// pictureSrcFullSize: value.pictureSrcFullSize,

// Neue Struktur
// Meal wird zu MealTypes {entries und order}
// authUsers: value.authUsers,
// cooks: value.cooks,
// dates: value.dates,
// location: value.location,
// maxDate: this.firebase.timestamp.fromDate(value.maxDate),
// motto: value.motto,
// name: value.name,
// numberOfDays: value.numberOfDays,
// pictureSrc: value.pictureSrc,
// created: {
//   date: this.firebase.timestamp.fromDate(value.created.date),
//   fromUid: value.created.fromUid,
//   fromDisplayName: value.created.fromDisplayName,
// },
// lastChange: {
//   date: this.firebase.timestamp.fromDate(value.lastChange.date),
//   fromUid: value.lastChange.fromUid,
//   fromDisplayName: value.lastChange.fromDisplayName,
// },

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
      // alle Sammlungen holen --> Firebase bietet keine Möglichkeit von
      // einem Dokument alle Sammlungen zu holen. Daher wird im File 000_userRecipes
      // Buch geführt, wer alles mindestens ein privates Rezept hat
      await result.userWithPrivateRecipes.forEach(async (userUid: string) => {
        await firebase.recipeShortPrivate
          .read<ValueObject>({uids: [userUid]})
          .then((result) => {
            recipes = {...recipes, ...result};
          });
      });
    });
  console.warn("=== Recipes ===");
  console.log(recipes);

  // Alle dokumente holen
  const collection = firebase.db.collection("events");

  await collection.get().then((snapshot) => {
    // Zuerst das Event-Dokument
    snapshot.forEach(async (eventDocument) => {
      let eventDocumentData = eventDocument.data();
      eventCounter++;
      eventDocumentData =
        firebase.event.convertTimestampValuesToDates(eventDocumentData);
      console.warn("=== Event ===");
      // Alt-Version speichern!
      console.log(
        "type: ",
        "event",
        "uid: ",
        eventDocument.id,
        "data: ",
        JSON.stringify(eventDocumentData)
      );

      if (
        Object.prototype.hasOwnProperty.call(eventDocumentData, "createdAt")
      ) {
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
            (result, currenEntry) => {
              return (
                result +
                Utils.differenceBetweenTwoDates({
                  dateFrom: currenEntry.from,
                  dateTo: currenEntry.to,
                })
              );
            }
          ),

          pictureSrc: eventDocumentData?.pictureSrc
            ? eventDocumentData?.pictureSrc
            : "",
        } as Event;

        // Event zurückspeichern
        const eventDocumentReference = firebase.db.doc(
          `events/${eventDocument.id}`
        );
        console.log("Speicherung Event ", eventDocument.id);
        console.log(eventDocumentNewStructure);
        await eventDocumentReference.set(
          Object.assign(
            {},
            firebase.event.convertDateValuesToTimestamp(
              _.cloneDeep(eventDocumentNewStructure)
            )
          )
        );
        counter++;

        // für weitere Felder, die Timestamps in Datum umbiegen
        // eventDocumentNewStructure.created.date =
        //   eventDocumentNewStructure.created.date.toDate();
        // eventDocumentNewStructure.lastChange.date =
        //   eventDocumentNewStructure.lastChange.date.toDate();

        // eventDocumentNewStructure.dates = eventDocumentNewStructure.dates.map(
        //   (dateRange) => ({
        //     pos: dateRange.pos,
        //     from: dateRange.from.toDate(),
        //     to: dateRange.to.toDate(),
        //     uid: dateRange.uid,
        //   })
        // );
        // eventDocumentNewStructure.maxDate =
        //   eventDocumentNewStructure.maxDate.toDate();

        // Event im 000_allEvents nachführen
        events[eventDocument.id] = EventShort.createShortEventFromEvent(
          eventDocumentNewStructure
        );
        console.warn("=== GroupConfig ===");
        // Group-Config generieren --> neue Dokument. Einfach die Anzahl Portionen übernehmen.
        const groupConfig = EventGroupConfiguration.factory();
        let dietUid = "";
        let intorleranceUid = "";
        // Im Feld ohne Intoleranzen // Alle den Wert der Teilnehmen (alte Struktur setzen)
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
        console.log("Speicherung GroupConfig ", eventDocument.id);
        console.log(JSON.stringify(groupConfig));
        await grouConfigDocumentReference
          .set(Object.assign({}, dbObject))
          .catch((error) => {
            console.error(error);
            throw error;
          });
        portionsCounter = groupConfig.totalPortions;
        counter++;
        console.warn("=== Menüplan ===");

        // Menüplan migrieren
        const menuplanDocument = firebase.db.doc(
          `events/${eventDocument.id}/docs/menuplan`
        );

        await menuplanDocument
          .get()
          .then(async (result) => {
            let menuplanDocumentData = result.data();

            menuplanDocumentData =
              firebase.event.menuplan.convertTimestampValuesToDates(
                menuplanDocumentData
              );

            // Alt-Version speichern!
            console.log(
              "type: ",
              "menuplan",
              "uid: ",
              result.id,
              "data: ",
              JSON.stringify(menuplanDocumentData)
            );

            if (menuplanDocumentData) {
              const menuplanNewStructure = Menuplan.factory({
                event: {...eventDocumentNewStructure, uid: eventDocument.id},
                authUser: {
                  uid: "",
                  publicProfile: {displayName: ""},
                } as AuthUser,
              });

              // Mahlzeit-Typen löschen -->
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
              // menuplanNewStructure.dates = menuplanDocumentData.dates.map(
              //   (date) => date.toDate()
              // );
              menuplanNewStructure.materials = {
                entries: {},
                order: [],
              } as unknown as Menuplan["materials"];
              menuplanNewStructure.products = {
                entries: {},
                order: [],
              } as unknown as Menuplan["products"];
              menuplanNewStructure["usedRecipes"] =
                menuplanDocumentData.usedRecipes;

              menuplanNewStructure["usedRecipes"] =
                menuplanDocumentData.usedRecipes;

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
                    menuplanNewStructure.meals[meal.uid].menuOrder.push(
                      menu.uid
                    );
                    menuplanNewStructure.menues[menu.uid] = menu;
                  });
                }
              );

              // Rezepte - die Fixe Portion wird für die Planung 1:1 übernommen
              menuplanDocumentData.recipes.forEach((recipe) => {
                const fullRecipe = recipes[recipe.recipeUid];
                const mealRecipe = {
                  uid: recipe.uid,
                  recipe: {
                    createdFromUid: fullRecipe.created.fromUid,
                    name: fullRecipe
                      ? fullRecipe.name
                      : `🗑️ Das Rezept «${recipe.recipeName}» wurde gelöscht`,
                    recipeUid: fullRecipe
                      ? recipe.recipeUid
                      : `${MealRecipeDeletedPrefix}${recipe.recipeUid}`,
                    type: fullRecipe ? fullRecipe?.type : RecipeType.public,
                  },
                  totalPortions: recipe.noOfServings,
                  plan: [
                    {
                      diet: PlanedDiet.FIX,
                      intolerance: PlanedIntolerances.FIX,
                      factor: 1,
                      totalPortions: recipe.noOfServings,
                    },
                  ],
                } as MealRecipe;
                menuplanNewStructure.mealRecipes[mealRecipe.uid] = mealRecipe;

                // Heraussuchen in welches Menü, das muss und in die Order schieben.
                console.group(recipe.recipeUid);
                const meal = Object.values(menuplanNewStructure.meals).find(
                  (meals) => {
                    console.log(meals.date);
                    console.log(Utils.dateAsString(recipe.date));
                    console.log(recipe.mealUid);
                    if (
                      meals.date == Utils.dateAsString(recipe.date) &&
                      meals.mealType == recipe.mealUid
                    ) {
                      return true;
                    }
                  }
                );
                console.groupEnd();
                if (!meal) {
                  console.log(recipe);
                  console.log(menuplanDocumentData);
                  console.log(menuplanNewStructure);
                  throw new Error("Meal nicht gefunden");
                }
                const menueUid =
                  menuplanNewStructure.meals[meal.uid].menuOrder[0];

                menuplanNewStructure.menues[menueUid].mealRecipeOrder.push(
                  mealRecipe.uid
                );
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

              console.log(menuplanNewStructure);
              console.log(JSON.stringify(menuplanNewStructure));
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
          })
          .then(async () => {
            // Event-Index updaten
            console.warn("=== ShoppingList ===");

            // Danach die eine Einkaufsliste löschen --> werden nicht übernommen
            const shoppingListDocument = firebase.db.doc(
              `events/${eventDocument.id}/docs/shoppingList`
            );
            await shoppingListDocument.delete().catch((error) => {
              // Gab wohl keine ShoppingListe
              console.log(error);
            });
          });
      }
    });

    console.warn("=== 000_allEvents ===");

    const allEventsDocument = firebase.db.doc(`events/000_allEvents`);
    console.log(events);

    firebase.stats.updateFields({
      uids: [""],
      values: {
        noParticipants: portionsCounter,
        noEvents: eventCounter,
      },
      authUser: authUser,
    });

    allEventsDocument.update(
      Object.assign({}, firebase.event.convertDateValuesToTimestamp(events))
    );
    counter++;
  });

  firebase.db
    .collection("stats")
    .doc("recipesInMenuplan")
    .set(statsRecipesInMenuplan)
    .catch((error) => console.error(error));

  return counter;
}
