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
import Utils from "../Shared/utils.class";

import StylesPdf from "../../constants/stylesPdf";
import * as TEXT from "../../constants/text";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";

/* ===================================================================
// ======================= Mengenberechnung PDF ======================
// =================================================================== */
const QuantityCalculationPdf = ({
  event,
  menuplan,
  quantityCalculation,
  authUser,
}) => {
  let actualDate = new Date();

  return (
    <Document
      author={authUser.publicProfile.displayName}
      creator={TEXT.APP_NAME}
      keywords={event.name + " " + TEXT.QUANTITY_CALCULATION}
      subject={TEXT.QUANTITY_CALCULATION + " " + event.name}
      title={TEXT.QUANTITY_CALCULATION + " " + event.name}
    >
      {/* Dieses Array, müsste bereits sortiert sein. */}
      {quantityCalculation.map((mealRecipe) => (
        <RecipePage
          key={"recipePage_" + mealRecipe.uid}
          mealRecipe={mealRecipe}
          event={event}
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
const RecipePage = ({ mealRecipe, event, actualDate, authUser }) => {
  return (
    <Page key={"page_" + mealRecipe.uid} style={styles.body}>
      {/*===== Kopfzeile =====*/}
      <Text key={"pageHeader_" + mealRecipe.uid} style={styles.header} fixed>
        <Text
          key={"pageHeader_event_" + mealRecipe.uid}
          style={styles.header}
          fixed
        >
          {event.name}
        </Text>
      </Text>
      {/*===== Body =====*/}
      <RecipeHeader mealRecipe={mealRecipe} />
      <View style={styles.containerBottomBorder} />
      <RecipeIngredients mealRecipe={mealRecipe} />
      <View style={styles.containerBottomBorder} />
      <RecipePreparation mealRecipe={mealRecipe} />
      {mealRecipe.recipe?.note ? <RecipeNote mealRecipe={mealRecipe} /> : null}
      {/*===== Fusszeile =====*/}
      <Text
        key={"pageFooter_generatedOn_" + mealRecipe.uid}
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
        key={"pageFooter_printedFrom" + mealRecipe.uid}
        style={styles.printedFrom}
        fixed
      >
        {TEXT.GENERATED_FROM}
        {authUser.publicProfile.displayName}
      </Text>
      <Text
        key={"pageFooter_pages_" + mealRecipe.uid}
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
      <Text
        key={"pageFooter_appName_" + mealRecipe.uid}
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
// ===================== Titel und oberste Infos =====================
// =================================================================== */
const RecipeHeader = ({ mealRecipe }) => {
  return (
    <React.Fragment>
      {/*===== Rezept Name =====*/}
      <View style={styles.containerBottomBorder}>
        <Text style={styles.title}>{mealRecipe.recipeName}</Text>
      </View>
      {/*===== Details =====*/}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColKey}>
            <Text style={styles.tableCell}>{TEXT.FIELD_DAY}</Text>
          </View>
          <View style={styles.tableColValue}>
            <Text style={styles.tableCell}>
              {mealRecipe.date.toLocaleString("default", {
                weekday: "long",
              }) +
                ", " +
                mealRecipe.date.toLocaleString("de-CH", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
            </Text>
          </View>
          <View style={styles.tableColKey}>
            <Text style={styles.tableCell}>{TEXT.FIELD_SOURCE}</Text>
          </View>
          <View style={styles.tableColValue}>
            <Text style={styles.tableCell}>
              {Utils.isUrl(mealRecipe.recipe.source) ? (
                <Link src={mealRecipe.recipe.source}>
                  {Utils.getDomain(mealRecipe.recipe.source)}
                </Link>
              ) : (
                <Text style={styles.tableCell}>{mealRecipe.recipe.source}</Text>
              )}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColKey}>
            <Text style={styles.tableCell}>{TEXT.FIELD_MEAL}</Text>
          </View>
          <View style={styles.tableColValue}>
            <Text style={styles.tableCell}>{mealRecipe.mealName}</Text>
          </View>
          <View style={styles.tableColKey}>
            <Text style={styles.tableCell}>{TEXT.FIELD_PREPARATION_TIME}</Text>
          </View>
          <View style={styles.tableColValue}>
            <Text style={styles.tableCell}>
              {mealRecipe.recipe.preparationTime}
            </Text>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================== Zutaten ============================
// =================================================================== */
const RecipeIngredients = ({ mealRecipe }) => {
  return (
    <React.Fragment>
      {/*===== Überschriften =====*/}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol100}>
            <Text style={styles.subTitle}>{TEXT.PANEL_INGREDIENTS}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol25}>
            <Text style={{ ...styles.tableCellBold, ...styles.tableCellGrey }}>
              {TEXT.ORIGINAL_QUANTITIES}
            </Text>
          </View>
          <View style={styles.tableCol25}>
            <Text style={styles.tableCellBold}>{TEXT.SCALED_QUANTITIES}</Text>
          </View>
          <View style={styles.tableCol50} />
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol25}>
            <Text style={{ ...styles.tableCell, ...styles.tableCellGrey }}>
              {mealRecipe.recipe.portions} {TEXT.FIELD_PORTIONS}
            </Text>
          </View>
          <View style={styles.tableCol25}>
            <Text style={styles.tableCell}>
              {mealRecipe.recipe.scaledNoOfServings} {TEXT.FIELD_PORTIONS}
            </Text>
          </View>
          <View style={styles.tableCol50} />
        </View>

        {/* Leerzeile */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol100}>
            <Text style={styles.tableCell}> </Text>
          </View>
        </View>

        {/*===== Zutaten =====*/}
        {mealRecipe.recipe.ingredients.map((ingredient, counter) => {
          return (
            <View
              style={styles.tableRow}
              key={"ingredientBlock_" + mealRecipe.uid + "_" + counter}
            >
              <View
                style={styles.tableColQuantity}
                key={
                  "ingredientQuantity_Left_" + mealRecipe.uid + "_" + counter
                }
              >
                <Text
                  style={{
                    ...styles.tableCell,
                    ...styles.tableCellGrey,
                  }}
                >
                  {Number.isNaN(ingredient.quantity)
                    ? ""
                    : ingredient.quantity.toLocaleString("de-CH")}
                </Text>
              </View>
              <View
                style={styles.tableColUnit}
                key={"ingredientUnit_Left_" + mealRecipe.uid + "_" + counter}
              >
                <Text style={{ ...styles.tableCell, ...styles.tableCellGrey }}>
                  {ingredient.unit}
                </Text>
              </View>
              <View
                style={styles.tableColQuantity}
                key={
                  "ingredientQuantity_Right_" + mealRecipe.uid + "_" + counter
                }
              >
                <Text style={styles.tableCell}>
                  {Number.isNaN(
                    mealRecipe.recipe.scaledIngredients[counter].quantity
                  )
                    ? ""
                    : mealRecipe.recipe.scaledIngredients[
                        counter
                      ].quantity.toLocaleString("de-CH")}
                </Text>
              </View>
              <View
                style={styles.tableColUnit}
                key={"ingredientUnit_Right_" + mealRecipe.uid + "_" + counter}
              >
                <Text style={styles.tableCell}>
                  {mealRecipe.recipe.scaledIngredients[counter].unit}
                </Text>
              </View>
              <View
                style={styles.tableColItem}
                key={
                  "ingredientProduct_Right_" + mealRecipe.uid + "_" + counter
                }
              >
                <Text style={styles.tableCell}>
                  {mealRecipe.recipe.scaledIngredients[counter].product.name}
                  {/* Details abdrucken, falls vorhanden */}
                  {mealRecipe.recipe.scaledIngredients[counter].detail && (
                    <Text style={styles.tableCellThin}>
                      , {mealRecipe.recipe.scaledIngredients[counter].detail}
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================ Zubereitung ==========================
// =================================================================== */
const RecipePreparation = ({ mealRecipe }) => {
  return (
    <View style={styles.table}>
      <View style={styles.tableCol100}>
        <Text style={styles.subTitle}>{TEXT.PANEL_PREPARATION}</Text>
      </View>
      {mealRecipe.recipe.preparationSteps.map((step) => (
        <View
          style={styles.tableRow}
          key={"preparationStep_" + mealRecipe.uid + "_" + step.pos}
        >
          <View
            style={styles.tableColStepPos}
            key={"preparationStepPos_" + mealRecipe.uid + "_" + step.pos}
          >
            <Text style={styles.tableCell}>{step.pos}</Text>
          </View>
          <View
            style={styles.tableColStep}
            key={"preparationStepText_" + mealRecipe.uid + "_" + step.pos}
          >
            <Text style={styles.tableCell}>{step.step}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};
/* ===================================================================
// ========================== Hinweis Rezept =========================
// =================================================================== */
const RecipeNote = ({ mealRecipe }) => {
  return (
    <React.Fragment>
      {mealRecipe.recipe.note ? (
        <View style={styles.table}>
          <View style={styles.tableCol100}>
            <Text style={styles.subTitle}>{TEXT.PANEL_NOTES}</Text>
          </View>
          <View style={styles.tableRow} key={"recipeNote_" + mealRecipe.uid}>
            <View
              style={styles.tableColNote}
              key={"recipeNoteText_" + mealRecipe.uid}
            >
              <Text style={styles.tableCell}>{mealRecipe.recipe.note}</Text>
            </View>
          </View>
        </View>
      ) : null}
    </React.Fragment>
  );
};

export default QuantityCalculationPdf;
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
      src: "https://fonts.gstatic.com/s/roboto/v16/zN7GBFwfMP4uA6AR0HCoLQ.ttf",
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v15/bdHGHleUa-ndQCOrdpfxfw.ttf",
      fontStyle: "bold",
      fontWeight: 700,
    },
  ],
});

const styles = StylesPdf.getPdfStyles();
