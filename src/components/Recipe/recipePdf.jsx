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
const RecipePdf = ({ recipe, scaledPortions, scaledIngredients, authUser }) => {
  let actualDate = new Date();

  return (
    <Document
      author={authUser.publicProfile.displayName}
      creator={TEXT.APP_NAME}
      keywords={recipe.name}
      subject={recipe.name}
      title={recipe.name}
    >
      <RecipePage
        key={"recipePage_" + recipe.uid}
        recipe={recipe}
        scaledPortions={scaledPortions}
        scaledIngredients={scaledIngredients}
        actualDate={actualDate}
        authUser={authUser}
      />
    </Document>
  );
};
/* ===================================================================
// =========================== Rezept-Seite ==========================
// =================================================================== */
const RecipePage = ({
  recipe,
  scaledPortions,
  scaledIngredients,
  actualDate,
  authUser,
}) => {
  return (
    <Page key={"page_" + recipe.uid} style={styles.body}>
      {/*===== Body =====*/}
      <RecipeHeader recipe={recipe} scaledPortions={scaledPortions} />
      <View style={styles.containerBottomBorder} />
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol50}>
            <RecipeIngredients
              ingredients={
                scaledPortions && recipe.portions !== scaledPortions
                  ? scaledIngredients
                  : recipe.ingredients
              }
            />
          </View>
          <View style={styles.tableCol50}>
            <RecipePreparation recipe={recipe} />
          </View>
        </View>
      </View>
      {recipe.note ? (
        <React.Fragment>
          <View style={styles.containerBottomBorder} />
          <RecipeNote recipe={recipe} />
        </React.Fragment>
      ) : null}
      {/*===== Fusszeile =====*/}
      <Text
        key={"pageFooter_generatedOn_" + recipe.uid}
        style={styles.printedOn}
        fixed
      >
        {TEXT.EXPORTED_ON}
        {actualDate.toLocaleString("de-CH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <Text
        key={"pageFooter_printedFrom" + recipe.uid}
        style={styles.printedFrom}
        fixed
      >
        {TEXT.EXPORTED_FROM}
        {authUser.publicProfile.displayName}
      </Text>
      <Text
        key={"pageFooter_pages_" + recipe.uid}
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
      <Text
        key={"pageFooter_appName_" + recipe.uid}
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
const RecipeHeader = ({ recipe, scaledPortions }) => {
  return (
    <React.Fragment>
      {/*===== Rezept Name =====*/}
      <View style={styles.containerBottomBorder}>
        <Text style={styles.title}>{recipe.name}</Text>
      </View>
      {/*===== Details =====*/}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColKey}>
            <Text style={styles.tableCell}>{TEXT.FIELD_PORTIONS}</Text>
          </View>
          <View style={styles.tableColValue}>
            <Text style={styles.tableCell}>
              {scaledPortions && recipe.portions !== scaledPortions
                ? scaledPortions
                : recipe.portions}
              {/* Details abdrucken, falls vorhanden */}
              {scaledPortions && recipe.portions !== scaledPortions && (
                <Text style={styles.tableCellThin}>
                  {TEXT.SCALED_RECIPE_ORIGINAL_IS(recipe.portions)}
                </Text>
              )}
            </Text>
          </View>
          <View style={styles.tableColKey}>
            <Text style={styles.tableCell}>{TEXT.FIELD_SOURCE}</Text>
          </View>
          <View style={styles.tableColValue}>
            <Text style={styles.tableCell}>
              {Utils.isUrl(recipe.source) ? (
                <Link src={recipe.source}>
                  {Utils.getDomain(recipe.source)}
                </Link>
              ) : (
                <Text style={styles.tableCell}>{recipe.source}</Text>
              )}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColKey}>
            <Text style={styles.tableCell}>{TEXT.FIELD_PREPARATION_TIME}</Text>
          </View>
          <View style={styles.tableColValue}>
            <Text style={styles.tableCell}>{recipe.preparationTime}</Text>
          </View>
          <View style={styles.tableColKey}>
            <Text style={styles.tableCell}>{TEXT.FIELD_REST_TIME}</Text>
          </View>
          <View style={styles.tableColValue}>
            <Text style={styles.tableCell}>{recipe.restTime}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColKey}>
            <Text style={styles.tableCell}>{TEXT.FIELD_COOK_TIME}</Text>
          </View>
          <View style={styles.tableColValue}>
            <Text style={styles.tableCell}>{recipe.cookTime}</Text>
          </View>
          <View style={styles.tableColKey}></View>
          <View style={styles.tableColValue}></View>
        </View>
      </View>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================== Zutaten ============================
// =================================================================== */
const RecipeIngredients = ({ ingredients }) => {
  return (
    <React.Fragment>
      {/*===== Überschriften =====*/}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol100}>
            <Text style={styles.subTitle}>{TEXT.PANEL_INGREDIENTS}</Text>
          </View>
        </View>
        {/*===== Zutaten =====*/}
        {ingredients.map((ingredient, counter) => {
          return (
            <View
              style={styles.tableRow}
              key={"ingredientBlock_" + ingredient.uid + "_" + counter}
            >
              <View
                style={styles.tableColQuantity}
                key={"ingredientQuantity_" + ingredient.uid + "_" + counter}
              >
                <Text style={styles.tableCell}>
                  {Number.isNaN(ingredient.quantity)
                    ? ""
                    : ingredient.quantity.toLocaleString("de-CH")}
                </Text>
              </View>
              <View
                style={styles.tableColUnit}
                key={"ingredientUnit_" + ingredient.uid + "_" + counter}
              >
                <Text style={styles.tableCell}>{ingredient.unit}</Text>
              </View>
              <View
                style={styles.tableColItem}
                // style={{ ...styles.tableCol80, ...styles.tableCellAlignLeft }}
                key={"ingredientProduct_" + ingredient.uid + "_" + counter}
              >
                <Text style={styles.tableCell}>
                  {ingredient.product.name}
                  {/* Details abdrucken, falls vorhanden */}
                  {ingredient.detail && (
                    <Text style={styles.tableCellThin}>
                      , {ingredient.detail}
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
const RecipePreparation = ({ recipe }) => {
  return (
    <View style={styles.table}>
      <View style={styles.tableCol100}>
        <Text style={styles.subTitle}>{TEXT.PANEL_PREPARATION}</Text>
      </View>
      {recipe.preparationSteps.map((step) => (
        <View
          style={styles.tableRow}
          key={"preparationStep_" + recipe.uid + "_" + step.pos}
        >
          <View
            style={styles.tableColStepPos}
            key={"preparationStepPos_" + recipe.uid + "_" + step.pos}
          >
            <Text style={styles.tableCell}>{step.pos}</Text>
          </View>
          <View
            style={styles.tableColStep}
            key={"preparationStepText_" + recipe.uid + "_" + step.pos}
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
const RecipeNote = ({ recipe }) => {
  return (
    <React.Fragment>
      <View style={styles.table}>
        <View style={styles.tableCol100}>
          <Text style={styles.subTitle}>{TEXT.PANEL_NOTES}</Text>
        </View>
        <View style={styles.tableRow} key={"recipeNote_" + recipe.uid}>
          <View
            style={styles.tableColNote}
            key={"recipeNoteText_" + recipe.uid}
          >
            <Text style={styles.tableCell}>{recipe.note}</Text>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

export default RecipePdf;
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
