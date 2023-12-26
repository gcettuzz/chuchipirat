import EventGroupConfiguration from "../components/Event/GroupConfiguration/groupConfiguration.class";
import Event from "../components/Event/Event/event.class";
import EventShort from "../components/Event/Event/eventShort.class";
import AuthUser from "../components/Firebase/Authentication/authUser.class";
import {ValueObject} from "../components/Firebase/Db/firebase.db.super.class";
import Firebase from "../components/Firebase/firebase.class";
import Menuplan, {
  PlanedDiet,
  PlanedIntolerances,
} from "../components/Event/Menuplan/menuplan.class";
import Recipe from "../components/Recipe/recipe.class";
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

export async function restructureEventDocuments(firebase: Firebase) {
  let recipes: {[key: string]: RecipeShort} = {};
  let events: {[key: string]: EventShort} = {};
  let counter: number = 0;

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

  console.log(recipes);

  // Alle dokumente holen
  let collection = firebase.db.collection("events");

  await collection.get().then((snapshot) => {
    // Zuerst das Event-Dokument
    snapshot.forEach(async (eventDocument) => {
      let eventDocumentData = eventDocument.data();

      if (eventDocumentData.hasOwnProperty("createdAt")) {
        let eventDocumentNewStructure = {
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
                  dateFrom: currenEntry.from.toDate(),
                  dateTo: currenEntry.to.toDate(),
                })
              );
            }
          ),

          pictureSrc: eventDocumentData.pictureSrc,
        };

        // Event zurückspeichern
        // let eventDocumentReference = firebase.db.doc(
        //   `events/${eventDocument.id}`
        // );
        // await eventDocumentReference.set(eventDocumentNewStructure);
        counter++;

        // für weitere Felder, die Timestamps in umbiegen
        eventDocumentNewStructure.created.date =
          eventDocumentNewStructure.created.date.toDate();
        eventDocumentNewStructure.lastChange.date =
          eventDocumentNewStructure.lastChange.date.toDate();

        eventDocumentNewStructure.dates = eventDocumentNewStructure.dates.map(
          (dateRange) => ({
            pos: dateRange.pos,
            from: dateRange.from.toDate(),
            to: dateRange.to.toDate(),
            uid: dateRange.uid,
          })
        );
        eventDocumentNewStructure.maxDate =
          eventDocumentNewStructure.maxDate.toDate();

        // Event im 000_allEvents nachführen
        events[eventDocument.id] = EventShort.createShortEventFromEvent(
          eventDocumentNewStructure
        );

        // Group-Config generieren --> neue Dokument. Einfach die Anzahl Portionen übernehmen.
        let groupConfig = EventGroupConfiguration.factory();
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

        groupConfig.totalPortions = eventDocumentData.participants;
        groupConfig.portions[dietUid][intorleranceUid] =
          eventDocumentData.participants;

        // let grouConfigDocumentReference = firebase.db.doc(
        //   `events/${eventDocument.id}/docs/groupConfiguration`
        // );
        // await grouConfigDocumentReference.set(groupConfig);
        // counter++;

        // Menüplan migrieren
        let menuplanDocument = firebase.db.doc(
          `events/${eventDocument.id}/docs/menuplan`
        );

        await menuplanDocument.get().then(async (result) => {
          let menuplanDocumentData = result.data();

          if (menuplanDocumentData) {
            let menuplanNewStructure = Menuplan.factory({
              event: {...eventDocumentNewStructure, uid: eventDocument.id},
              authUser: {uid: "", publicProfile: {displayName: ""}} as AuthUser,
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
            menuplanNewStructure.dates = menuplanDocumentData.dates.map(
              (date) => date.toDate()
            );
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
                  let meal = Menuplan.createMeal({
                    mealType: mealType.uid,
                    date: date,
                  });
                  menuplanNewStructure.meals[meal.uid] = meal;
                  // Ein Menü erzeugen und der Mahlzeit hinzufügen
                  let menu = Menuplan.createMenu();
                  menuplanNewStructure.meals[meal.uid].menuOrder.push(menu.uid);
                  menuplanNewStructure.menues[menu.uid] = menu;
                });
              }
            );

            // Rezepte - die Fixe Portion wird für die Planung 1:1 übernommen
            menuplanDocumentData.recipes.forEach((recipe) => {
              let mealRecipe = {
                uid: recipe.uid,
                recipe: {
                  createdFromUid: recipes[recipe.recipeUid]?.created.fromUid,
                  name: recipe.recipeName,
                  recipeUid: recipe.recipeUid,
                  type: recipes[recipe.recipeUid]?.type,
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
              };
              menuplanNewStructure.mealRecipes[mealRecipe.uid] = mealRecipe;
              // Heraussuchen in welches Menü, das muss und in die Order schieben.
              let meal = Object.values(menuplanNewStructure.meals).find(
                (meals) => {
                  if (
                    meals.date == Utils.dateAsString(recipe.date.toDate()) &&
                    meals.mealType == recipe.mealUid
                  ) {
                    return true;
                  }
                }
              );
              if (!meal) {
                throw new Error("Meal nicht gefunden");
              }
              let menueUid = menuplanNewStructure.meals[meal.uid].menuOrder[0];

              menuplanNewStructure.menues[menueUid].mealRecipeOrder.push(
                mealRecipe.uid
              );
            });

            // Notizen
            menuplanDocumentData.notes.forEach((note) => {
              // Wenn nur im Original-Dok Datum und MealUid gefüllt, muss
              // das entsprechende Menü zuerst gesucht werden.
              if (note.mealUid) {
                let meal = Object.values(menuplanNewStructure.meals).find(
                  (meals) => {
                    if (
                      meals.date == Utils.dateAsString(note.date.toDate()) &&
                      meals.mealType == note.mealUid
                    ) {
                      return true;
                    }
                  }
                );

                if (meal) {
                  menuplanNewStructure.notes[note.uid] = {
                    date: Utils.dateAsString(note.date.toDate()),
                    menueUid: meal?.uid,
                    text: note.text,
                    uid: note.uid,
                  };
                }
              } else {
                // Kopfnotiz
                menuplanNewStructure.notes[note.uid] = {
                  date: Utils.dateAsString(note.date.toDate()),
                  menueUid: "",
                  text: note.text,
                  uid: note.uid,
                };
              }
            });

            // Dokument zurückschreiben
            if (menuplanNewStructure.uid == "0AIHHZKcAv6dEinTVXY1") {
              console.log(menuplanNewStructure);
            }

            // Datum in Timestamp umwandeln
            //@ts-ignore
            menuplanNewStructure.dates = menuplanNewStructure.dates.map(
              (date) => firebase.timestamp.fromDate(date)
            );
            // await menuplanDocument.set(menuplanNewStructure);
          }
        });

        // Danach die eine Einkaufsliste
      }
    });
  });
  // Event-Index updaten
  let allEvents = firebase.db.doc(`events/000_allEvents`);
  // await allEvents.update(events);

  return counter;
}
