import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Link,
  Font,
} from "@react-pdf/renderer";

import StylesPdf from "../../constants/stylesPdf";
import * as TEXT from "../../constants/text";
import * as DEFAULT_VALUES from "../../constants/defaultValues";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";
import { NOTE_TYPES } from "./menuplan";

/* ===================================================================
// =========================== Menüplan PDF ==========================
// =================================================================== */
const MenuplanPdf = ({ menuplan, event, noOfColums, authUser }) => {
  // Array erstellen, das dem Aufbau des PDF entspricht
  // Eine Seite hat 5 Spalten (1 die Mahlzeiten, 4 die Daten)
  let splitedDates = [];
  //NEXT_FEATURE: Anzahl Spalten dynamisch übernehmen.
  //Spalten di Anzahl Tagesspalten (ohne Mahlzeiten)
  const noColums = DEFAULT_VALUES.MENUPLAN_NO_OF_COLUMS_PRINT;
  let datesOfPage = [];
  let actualDate = new Date();

  menuplan.dates.forEach((day) => {
    datesOfPage.push(day);

    if (datesOfPage.length === noColums) {
      splitedDates.push(datesOfPage);
      datesOfPage = [];
    }
  });

  if (menuplan.dates.length % noColums !== 0) {
    //Auffüllen auf 4 damit die letzten Zeilen auch links sind
    for (let i = 1; i <= noColums - (menuplan.dates.length % noColums); i++) {
      datesOfPage.push(null);
    }
    // Angefangene Seite aufnehmen
    splitedDates.push(datesOfPage);
  }

  return (
    <Document
      author={authUser.publicProfile.displayName}
      creator={TEXT.APP_NAME}
      keywords={event.name + " " + TEXT.MENUPLAN}
      subject={TEXT.MENUPLAN + " " + event.name}
      title={TEXT.MENUPLAN + " " + event.name}
    >
      {splitedDates.map((datesOfPage, pageCounter) => (
        <MenuplanPage
          key={"menuplanPage_" + pageCounter}
          menuplan={menuplan}
          event={event}
          datesOfPage={datesOfPage}
          pageCounter={pageCounter}
          actualDate={actualDate}
          authUser={authUser}
        />
      ))}
    </Document>
  );
};

/* ===================================================================
// =========================== Rezept-Seite ==========================
// =================================================================== */
const MenuplanPage = ({
  menuplan,
  event,
  datesOfPage,
  pageCounter,
  actualDate,
  authUser,
}) => {
  return (
    <Page
      key={"page_" + pageCounter}
      orientation="landscape"
      style={styles.body}
    >
      {/*===== Kopfzeile =====*/}
      <Text key={"pageHeader_" + pageCounter} style={styles.header} fixed>
        <Text
          key={"pageHeader_event_" + pageCounter}
          style={styles.header}
          fixed
        >
          {event.name}
        </Text>
      </Text>
      {/*===== Menüplan Überschrift =====*/}
      <View key={"titelRow_" + pageCounter}>
        <Text key={"titel_" + pageCounter} style={styles.title}>
          {TEXT.MENUPLAN}
        </Text>
      </View>
      {/*===== Body =====*/}
      <View key={"menuPlanTable_" + pageCounter} style={styles.table}>
        <MenuplanHeaderRow
          datesOfPage={datesOfPage}
          pageCounter={pageCounter}
        />
        <View
          key={"menuplanHeaderLing_" + pageCounter}
          style={styles.containerBottomBorderThin}
        />

        <MenuplanHeadNotes
          menuplan={menuplan}
          datesOfPage={datesOfPage}
          pageCounter={pageCounter}
        />
        <MenuplanMeals
          menuplan={menuplan}
          datesOfPage={datesOfPage}
          pageCounter={pageCounter}
        />
      </View>

      {/*===== Fusszeile =====*/}
      <Text
        key={"pageFooter_generatedOn_" + pageCounter}
        style={styles.printedOn}
        fixed
      >
        {TEXT.GENERATED_ON}
        {actualDate.toLocaleString("de-CH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <Text
        key={"pageFooter_printedFrom" + pageCounter}
        style={styles.printedFrom}
        fixed
      >
        {TEXT.GENERATED_FROM}
        {authUser.publicProfile.displayName}
      </Text>
      <Text
        key={"pageFooter_pages_" + pageCounter}
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
      <Text
        key={"pageFooter_appName_" + pageCounter}
        style={styles.chuchipirat}
        fixed
      >
        {TEXT.APP_NAME}
      </Text>
      <Image
        style={styles.footerImage}
        src={IMAGE_REPOSITORY.getEnviromentRelatedPicture().PDF_FOOTER_IMAGE}
        fixed
      />
    </Page>
  );
};
/* ===================================================================
// ==================== Menüplan Überschriften Tag ===================
// =================================================================== */
const MenuplanHeaderRow = ({ datesOfPage, pageCounter }) => {
  return (
    <View key={"dayRow_" + pageCounter} style={styles.tableRow}>
      {/* leere Zelle oben links */}
      <View key={"dayRow_" + pageCounter + "_empty"} style={styles.tableCol20}>
        <Text key={"day_" + pageCounter + "_empty"} style={styles.tableCell}>
          {" "}
        </Text>
      </View>
      {/* Wochentage mit Datum */}
      {datesOfPage.map((day, dayCounter) => (
        <View
          key={"day_" + pageCounter + "_" + dayCounter}
          style={styles.tableCol20}
        >
          <Text style={styles.tableCellBold}>
            {day
              ? day.toLocaleString("default", {
                  weekday: "long",
                })
              : " "}
          </Text>
          <Text style={{ ...styles.tableCell, ...styles.tableCellGrey }}>
            {day
              ? day.toLocaleString("de-CH", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
              : " "}
          </Text>
        </View>
      ))}
    </View>
  );
};
/* ===================================================================
// ============================ Kopfnotizen ==========================
// =================================================================== */
const MenuplanHeadNotes = ({ menuplan, datesOfPage, pageCounter }) => {
  let hasHeadNotes = false;

  // Kopfnotizen sammeln
  datesOfPage.forEach((day) => {
    if (!day) {
      return;
    }

    day.headNotes = menuplan.notes.filter(
      (note) => note.date.getTime() === day.getTime() && !note.mealUid
    );

    if (day.headNotes.length > 0) {
      hasHeadNotes = true;
    }
  });

  if (!hasHeadNotes) {
    return null;
  }
  return (
    <View key={"headNoteRow_" + pageCounter} style={styles.tableRow}>
      {/* leere Zelle oben links */}
      <View
        key={"headNote_" + pageCounter + "_empty"}
        style={styles.tableCol20}
      >
        <Text style={styles.tableCell}> </Text>
      </View>
      {datesOfPage.map((day, dayCounter) => {
        if (!day || day.headNotes.length === 0) {
          return (
            <View
              key={"headNote_" + pageCounter + "_" + dayCounter}
              style={styles.tableCol20}
            >
              <Text style={styles.tableCell}> </Text>
            </View>
          );
        } else {
          return day.headNotes.map((note) => (
            <View
              key={"headNote_" + pageCounter + "_" + note.uid}
              style={styles.tableCol20}
            >
              {/* NEXT_FEATURE: Bilder --> nächste Version von React-Print müsste das können */}
              {/* <Image src={<CakeIcon color="error" fontSize="small" />}></Image> */}
              <Text style={styles.tableCellHeadNote}>
                <Text
                  style={{
                    ...styles.tableCell,
                    ...styles.tableCellGrey,
                    ...styles.thinItalic,
                  }}
                >
                  {note.type
                    ? Object.values(NOTE_TYPES).find(
                        (noteType) => noteType.key === note.type
                      ).text + ": "
                    : null}
                </Text>

                {note.text}
              </Text>
            </View>
          ));
        }
      })}
    </View>
  );
};
/* ===================================================================
// ============================= Mahlzeiten ==========================
// =================================================================== */
const MenuplanMeals = ({ menuplan, datesOfPage, pageCounter }) => {
  return (
    <React.Fragment key={"menuplanRowDiv_" + pageCounter}>
      {menuplan.meals.map((meal) => (
        <React.Fragment key={"menuplanRowDiv_" + pageCounter + "_" + meal.uid}>
          <MenuplanMealRow
            menuplan={menuplan}
            datesOfPage={datesOfPage}
            pageCounter={pageCounter}
            meal={meal}
          />
          <View style={styles.containerBottomBorderThinEmptyRow} />
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};
/* ===================================================================
// =========================== Malzeit-Reihe =========================
// =================================================================== */
const MenuplanMealRow = ({ menuplan, datesOfPage, pageCounter, meal }) => {
  // Die Daten dieser Reihe zusammensuchen
  let mealRow = [];
  datesOfPage.forEach((day) => {
    if (!day) {
      mealRow.push({ date: null, notes: [], recipes: [] });
    } else {
      mealRow.push({
        date: day,
        notes: menuplan.notes.filter(
          (note) =>
            note.date.getTime() === day.getTime() && note.mealUid === meal.uid
        ),
        recipes: menuplan.recipes.filter(
          (recipe) =>
            recipe.date.getTime() === day.getTime() &&
            recipe.mealUid === meal.uid
        ),
      });
    }
  });
  return (
    <React.Fragment key={"mealFragment_" + pageCounter + "_" + meal.uid}>
      <View
        key={"mealRow_" + pageCounter + "_" + meal.uid}
        style={styles.tableRow}
      >
        <View style={styles.tableCol20}>
          <Text style={styles.tableCellMeal}>{meal.name}</Text>
        </View>
        {mealRow.map((mealCell, mealCellCounter) =>
          mealCell.notes.length === 0 && mealCell.recipes.length === 0 ? (
            // Kein Rezept und Notizen --> leere Zelle
            <View
              key={
                "recipe_" + pageCounter + "_" + mealCellCounter + "_" + meal.uid
              }
              style={styles.tableCol20}
            >
              <Text style={styles.tableCellRecipe}> </Text>
            </View>
          ) : (
            <View
              key={
                "recipe_" + pageCounter + "_" + mealCellCounter + "_" + meal.uid
              }
              style={styles.tableCol20}
            >
              {/*  Alle Rezepte auflisten */}
              {mealCell.recipes.map((recipe, recipeCounter) => {
                return (
                  <Text
                    key={
                      "recipe_" +
                      pageCounter +
                      "_" +
                      recipeCounter +
                      "_" +
                      recipe.uid
                    }
                    style={styles.tableCellRecipe}
                  >
                    {recipe.recipeName}
                  </Text>
                );
              })}
              {mealCell.notes.map((note, noteCounter) => {
                return (
                  <Text
                    key={
                      "note_" +
                      +pageCounter +
                      "_" +
                      noteCounter +
                      "_" +
                      note.uid
                    }
                    style={styles.tableCellNote}
                  >
                    <Text
                      style={{
                        ...styles.tableCell,
                        ...styles.tableCellGrey,
                        ...styles.thinItalic,
                        ...styles.alignLeft,
                      }}
                    >
                      {note.type
                        ? Object.values(NOTE_TYPES).find(
                            (noteType) => noteType.key === note.type
                          ).text + ": "
                        : null}
                    </Text>
                    {note.text}
                  </Text>
                );
              })}
            </View>
          )
        )}
      </View>
    </React.Fragment>
  );
};
export default MenuplanPdf;
/* ===================================================================
// ======================== Fonts registrieren =======================
// =================================================================== */
//-->gist.github.com/karimnaaji/b6c9c9e819204113e9cabf290d580551
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v15/7MygqTe2zs9YkP0adA9QQQ.ttf",
      fontStyle: "thin",
      fontWeight: 100,
    },
    {
      src:
        "https://fonts.gstatic.com/s/roboto/v15/T1xnudodhcgwXCmZQ490TPesZW2xOQ-xsNqO47m55DA.ttf",
      fontStyle: "thinItalic",
      fontWeight: 100,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v16/zN7GBFwfMP4uA6AR0HCoLQ.ttf",
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v15/hcKoSgxdnKlbH5dlTwKbow.ttf",
      fontStyle: "italic",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v15/bdHGHleUa-ndQCOrdpfxfw.ttf",
      fontStyle: "bold",
      fontWeight: 700,
    },
  ],
});

const styles = StylesPdf.getPdfStyles();
