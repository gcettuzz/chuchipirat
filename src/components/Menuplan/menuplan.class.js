import Utils from "../Shared/utils.class";
import * as DEFAULT_VALUES from "../../constants/defaultValues";
import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";
import Feed, { FEED_TYPE } from "../Shared/feed.class";

export default class Menuplan {
  constructor({
    dates = [],
    meals = [],
    notes = [],
    recipes = [],
    createdAt = null,
    createdFromUid = "",
    createdFromDisplayName = "",
    lastChangeAt = null,
    lastChangeFromUid = "",
    lastChangeFromDisplayName = "",
  }) {
    this.dates = dates;
    this.meals = meals;
    this.notes = notes;
    this.recipes = recipes;
    this.createdAt = createdAt;
    this.createdFromUid = createdFromUid;
    this.createdFromDisplayName = createdFromDisplayName;
    this.lastChangeAt = lastChangeAt;
    this.lastChangeFromUid = lastChangeFromUid;
    this.lastChangeFromDisplayName = lastChangeFromDisplayName;
  }
  /* =====================================================================
  // Anhand Event einen neuen Menüplan erstellen
  // ===================================================================== */
  static factory = ({ event }) => {
    // Datenliste generieren
    let dates = Menuplan._getEventDateList(event);

    // Mahlzeiten generieren (aus Default)
    let meals = DEFAULT_VALUES.MENUPLAN_MEALS;

    meals.forEach((meal) => {
      meal.uid = Utils.generateUid(5);
    });

    return new Menuplan({ dates: dates, meals: meals, notes: [], recipes: [] });
  };
  /* =====================================================================
  // Daten holen
  // ===================================================================== */
  static getMenuplan = async ({ firebase, uid }) => {
    let menuplan = {};

    const menuplanDoc = firebase.menuplan(uid);
    await menuplanDoc
      .get()
      .then((snapshot) => {
        if (!snapshot.data()) {
          return;
        }
        menuplan = snapshot.data();
        // Timestamps umbiegen
        menuplan.createdAt = menuplan.createdAt.toDate();
        menuplan.lastChangeAt = menuplan.lastChangeAt.toDate();

        menuplan.dates = menuplan.dates.map((day) => {
          return day.toDate();
        });

        // Datum mit der Datumsliste abgleichen. Muss die selbe Referenz haben
        // sonst funkionierts im UI nicht mehr 🤷🏻‍♂️
        menuplan.notes.forEach((note) => {
          note.date = menuplan.dates.find(
            (day) => day.getTime() === note.date.toDate().getTime()
          );
        });
        menuplan.recipes.forEach((recipe) => {
          recipe.date = menuplan.dates.find(
            (day) => day.getTime() === recipe.date.toDate().getTime()
          );
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    // Analytik
    firebase.analytics.logEvent(FIREBASE_EVENTS.MENUPLAN_GET);

    return menuplan;
  };
  /* =====================================================================
  // Speichern
  // ===================================================================== */
  static save = async ({
    firebase,
    uid,
    dates,
    meals,
    notes,
    recipes,
    eventName,
    createdAt,
    createdFromUid,
    createdFromDisplayName,
    authUser,
  }) => {
    let menuplanDoc = firebase.menuplan(uid);
    let newMenuplan = false;
    let usedRecipes = [];

    // Wenn kein Datum, wird der Menüplan gerade neu angelegt
    if (!createdAt) {
      createdAt = firebase.timestamp.fromDate(new Date());
      createdFromUid = authUser.uid;
      createdFromDisplayName = authUser.publicProfile.displayName;
      newMenuplan = true;
    }

    //Portionen: sicherstellen, dass Nummerische Werte auch so gespeichert werden
    recipes.forEach((recipe) => {
      recipe.noOfServings = parseInt(recipe.noOfServings);
    });

    // Alle Rezepte sammeln (für suche)
    recipes.forEach((recipe) => usedRecipes.push(recipe.recipeUid));

    menuplanDoc
      .set({
        dates: dates,
        meals: meals,
        notes: notes,
        recipes: recipes,
        usedRecipes: usedRecipes,
        createdAt: createdAt,
        createdFromUid: createdFromUid,
        createdFromDisplayName: createdFromDisplayName,
        lastChangeFromUid: authUser.uid,
        lastChangeFromDisplayName: authUser.publicProfile.displayName,
        lastChangeAt: firebase.timestamp.fromDate(new Date()),
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    if (newMenuplan) {
      // Event
      firebase.analytics.logEvent(FIREBASE_EVENTS.MENUPLAN_CREATED);

      // Feed Eintrag
      Feed.createFeedEntry({
        firebase: firebase,
        authUser: authUser,
        feedType: FEED_TYPE.MENUPLAN_CREATED,
        objectUid: uid,
        text: eventName,
      });
    }
  };
  /* =====================================================================
  // Neue Mahlzeit anlegen
  // ===================================================================== */
  static createMeal = ({ meals, mealName }) => {
    return {
      pos: meals.length + 1,
      name: mealName,
      uid: Utils.generateUid(5),
    };
  };
  /* =====================================================================
  // Neue Notiz anlegen
  // ===================================================================== */
  static createNote = ({ date, mealUid, type, text }) => {
    return {
      uid: Utils.generateUid(5),
      type: type,
      text: text,
      date: date,
      mealUid: mealUid,
    };
  };
  /* =====================================================================
  // Neues (Menüplan-) Rezept anlegen
  // ===================================================================== */
  static createMealRecipe = ({
    date,
    mealUid,
    recipeUid,
    recipeName,
    pictureSrc,
    noOfServings,
  }) => {
    return {
      uid: Utils.generateUid(5),
      date: date,
      mealUid: mealUid,
      recipeUid: recipeUid,
      recipeName: recipeName,
      pictureSrc: pictureSrc,
      noOfServings: noOfServings,
    };
  };
  /* =====================================================================
  // Mahlzeit Position hoch schieben
  // ===================================================================== */
  static moveMealUp = ({ meals, meal }) => {
    meals = Utils.moveArrayElementUp({
      array: meals,
      indexToMoveUp: meal.pos - 1,
    });
    meals = Utils.renumberArray({ array: meals, field: "pos" });
    return meals;
  };
  /* =====================================================================
  // Mahlzeit Position runter schieben
  // ===================================================================== */
  static moveMealDown = ({ meals, meal }) => {
    meals = Utils.moveArrayElementDown({
      array: meals,
      indexToMoveDown: meal.pos - 1,
    });
    meals = Utils.renumberArray({ array: meals, field: "pos" });
    return meals;
  };
  /* =====================================================================
  // Mahlzeit in Plan hinzufügen
  // ===================================================================== */
  // static addMealToPlan = ({ plan, meal }) => {
  //   plan.forEach((day) => {
  //     day.meals.push({ mealUid: meal.uid, recipes: [], notes: [] });
  //   });
  //   return plan;
  // };
  /* =====================================================================
  // Notiz in Plan hinzufügen
  // ===================================================================== */
  // static addNoteToPlan = ({ plan, note, headNote, mealDate, mealUid }) => {
  //   let day = plan.find((day) => day.date.getTime() === mealDate.getTime());
  //   if (headNote) {
  //     day.headNotes.push(note);
  //   } else {
  //     let meal = day.meals.find((meal) => meal.mealUid === mealUid);
  //     meal.notes.push(note);
  //   }
  //   return plan;
  // };
  /* =====================================================================
  // PRIVAT: Liste mit Tagen generieren
  // ===================================================================== */
  static _getEventDateList = (event) => {
    let dateList = [];

    for (let i = 0; i < event.dates.length; i++) {
      let eventDate = event.dates[i].from;
      while (eventDate <= event.dates[i].to) {
        dateList.push(new Date(eventDate));
        eventDate.setDate(eventDate.getDate() + 1);
      }
    }
    return dateList;
  };
}
