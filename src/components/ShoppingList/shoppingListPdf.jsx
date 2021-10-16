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
import ShoppingList from "./shoppingList.class";

import StylesPdf from "../../constants/stylesPdf";
import * as TEXT from "../../constants/text";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
// Anzahl Zeilen, die pro Seite platz haben
const LINES_PER_PAGE = {
  FIRST: 33,
  REST: 35,
};

const COLUMN = {
  LEFT: 1,
  RIGHT: 2,
};

class FormatedShoppingList {
  constructor(shoppingList) {
    this.pages = [];
    this.actualPage = 0;
    // Einträge zählen
    let noItems = ShoppingList.countItems({ shoppingList: shoppingList });
    let noDepartmentes = ShoppingList.countDepartments({
      shoppingList: shoppingList,
    });

    // Anzahl Zeilen bestimmen (inkl. Leerzeilen)
    let noEntries = noItems + noDepartmentes + (noDepartmentes - 1);
    // 2 Spalten = 1/2 sovile Zeilen
    let noLines = Math.round(noEntries / 2, 0);

    // Seiten mit Max.Zeilen bestimmen
    do {
      if (this.pages.length === 0 && noLines > LINES_PER_PAGE.FIRST) {
        // Es gibt mehrere Seiten
        this.pages.push({
          pageControl: new PageControl(LINES_PER_PAGE.FIRST),
          list: [],
        });
        noLines = noLines - LINES_PER_PAGE.FIRST;
      } else if (this.pages.length === 0 && noLines <= LINES_PER_PAGE.FIRST) {
        // Nur eine Seite, aber nicht voll --> sauber verteilen
        this.pages.push({
          pageControl: new PageControl(noLines),
          list: [],
        });
        noLines = 0;
      } else if (this.pages.length > 0 && noLines > LINES_PER_PAGE.REST) {
        // zweite oder mehr Seite - voll
        this.pages.push({
          pageControl: new PageControl(LINES_PER_PAGE.REST),
          list: [],
        });
        noLines = noLines - LINES_PER_PAGE.REST;
      } else {
        // letzte Seite
        this.pages.push({
          pageControl: new PageControl(noLines),
          list: [],
        });
        noLines = 0;
      }
    } while (noLines > 0);

    shoppingList.list.forEach((department) => {
      let pageControl = this.pages[this.actualPage].pageControl;
      switch (pageControl.actualColum) {
        case COLUMN.LEFT:
          this.pages[this.actualPage].list.push({
            department1: department.name,
          });
          pageControl.lineCounter++;
          break;
        case COLUMN.RIGHT:
          this.pages[this.actualPage].list[
            pageControl.lineCounter
          ].department2 = department.name;
          pageControl.lineCounter++;
          break;
      }
      this.updatePageControl(pageControl);
      department.items.forEach((item) => {
        pageControl = this.pages[this.actualPage].pageControl;
        switch (pageControl.actualColum) {
          case COLUMN.LEFT:
            this.pages[this.actualPage].list.push({
              quantity1: item.quantity,
              unit1: item.unit,
              name1: item.name,
            });
            pageControl.lineCounter++;
            break;
          case COLUMN.RIGHT:
            let lineItem =
              this.pages[this.actualPage].list[pageControl.lineCounter];
            lineItem.quantity2 = item.quantity;
            lineItem.unit2 = item.unit;
            lineItem.name2 = item.name;
            pageControl.lineCounter++;
            break;
        }
        this.updatePageControl(pageControl);
      });
      if (pageControl.lineCounter !== 0) {
        // nun brauchts eine Leerzeile - aber nicht am Spaltenanfang
        if (pageControl.actualColum === COLUMN.LEFT) {
          this.pages[this.actualPage].list.push({});
        }
        pageControl.lineCounter++;
        this.updatePageControl(pageControl);
      }
    });
  }

  updatePageControl(pageControl) {
    // Prüfen ob es einen Spalten- oder Seitenumbruch benötigt
    if (
      pageControl.lineCounter === pageControl.maxLines &&
      pageControl.actualColum === COLUMN.LEFT
    ) {
      pageControl.lineCounter = 0;
      pageControl.actualColum = COLUMN.RIGHT;
    } else if (
      pageControl.lineCounter === pageControl.maxLines &&
      pageControl.actualColum === COLUMN.RIGHT
    ) {
      // Neue Seite anlegen
      this.actualPage++;
    }
  }
}

class PageControl {
  constructor(maxLines) {
    this.lineCounter = 0;
    this.actualColum = COLUMN.LEFT;
    this.maxLines = maxLines;
  }
}

/* ===================================================================
// ========================= Postizettel PDF =========================
// =================================================================== */
const ShoppingListPdf = ({ event, shoppingList, authUser }) => {
  let actualDate = new Date();
  let formatedShoppingList = new FormatedShoppingList(shoppingList);
  return (
    <Document
      author={authUser.publicProfile.displayName}
      creator={TEXT.APP_NAME}
      keywords={event.name + " " + TEXT.SHOPPING_LIST}
      subject={TEXT.SHOPPING_LIST + " " + event.name}
      title={TEXT.SHOPPING_LIST + " " + event.name}
    >
      {formatedShoppingList.pages.map((page, counter) => (
        <ShoppingListPage
          key={"shoppingListPage_+" + counter}
          event={event}
          shoppingList={shoppingList}
          formatedList={page.list}
          pageCounter={counter + 1}
          actualDate={actualDate}
          authUser={authUser}
        />
      ))}
    </Document>
  );
};
/* ===================================================================
// ========================= Postizettel Seite =======================
// =================================================================== */
const ShoppingListPage = ({
  event,
  shoppingList,
  formatedList,
  pageCounter,
  actualDate,
  authUser,
}) => {
  return (
    <Page key={"page_" + pageCounter} style={styles.body}>
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
          {TEXT.SHOPPING_LIST}
        </Text>
      </View>
      {/*===== Body =====*/}
      {pageCounter === 1 && (
        <React.Fragment>
          <View style={styles.containerBottomBorder} />
          <ShoppingListPeriodBlock
            key={"shoppingListBlock_" + pageCounter}
            shoppingList={shoppingList}
            pageCounter={pageCounter}
          />
          <View style={styles.containerBottomBorder} />
        </React.Fragment>
      )}
      <ShoppingListItemsBlock
        formatedList={formatedList}
        pageCounter={pageCounter}
      />

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
// ======================= Abgrenzung Zeitraum =======================
// =================================================================== */

const ShoppingListPeriodBlock = ({ shoppingList }) => {
  return (
    <View>
      {shoppingList.dateFrom && shoppingList.dateTo ? (
        <Text style={styles.subSubTitle}>
          {shoppingList.dateFrom.toLocaleString("default", {
            weekday: "long",
          }) +
            ", " +
            shoppingList.dateFrom.toLocaleString("de-CH", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }) +
            " " +
            shoppingList.mealFrom.name +
            " - " +
            shoppingList.dateTo.toLocaleString("default", {
              weekday: "long",
            }) +
            ", " +
            shoppingList.dateTo.toLocaleString("de-CH", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }) +
            " " +
            shoppingList.mealTo.name}
        </Text>
      ) : null}
    </View>
  );
};
/* ===================================================================
// ======================== Liste der Artikel ========================
// =================================================================== */
const ShoppingListItemsBlock = ({ formatedList, pageCounter }) => {
  return (
    <View style={styles.table} key={"itemBlockTable_" + pageCounter}>
      {formatedList.map((item, line) => (
        <View
          style={styles.tableRow}
          key={"itemBlock_" + "_" + pageCounter + "_" + line}
        >
          {item.department1 ? (
            <View
              style={styles.tableCol50}
              key={"itemBlockDepartment_Left" + pageCounter + "_" + line}
            >
              <Text
                style={{
                  ...styles.tableCellBold,
                  ...styles.tableCellAlignLeft,
                }}
              >
                {item.department1}
              </Text>
            </View>
          ) : (
            <React.Fragment key={"itemLeft_" + pageCounter + "_" + line}>
              <View
                style={styles.tableColQuantity}
                key={"itemBlockQuantity_Left" + pageCounter + "_" + line}
              >
                <Text style={styles.tableCell}>
                  {Number.isNaN(item.quantity1) || !item.quantity1
                    ? ""
                    : new Intl.NumberFormat("de-CH", {
                        maximumSignificantDigits: 3,
                      }).format(item.quantity1)}
                </Text>
              </View>
              <View
                style={styles.tableColUnitShoppingList}
                key={"itemBlockUnit_Left" + pageCounter + "_" + line}
              >
                <Text style={styles.tableCell}>{item.unit1}</Text>
              </View>
              <View
                style={styles.tableColItemShoppingList}
                key={"itemBlockProduct_Left" + pageCounter + "_" + line}
              >
                <Text style={styles.tableCell}>{item.name1}</Text>
              </View>
            </React.Fragment>
          )}
          {item.department2 ? (
            <View
              style={styles.tableCol50}
              key={"itemBlockDepartment_Right" + pageCounter + "_" + line}
            >
              <Text
                style={{
                  ...styles.tableCellBold,
                  ...styles.tableCellAlignLeft,
                }}
              >
                {item.department2}
              </Text>
            </View>
          ) : (
            <React.Fragment key={"itemRight_" + pageCounter + "_" + line}>
              <View
                style={styles.tableColQuantity}
                key={"itemBlockQuantity_Right" + pageCounter + "_" + line}
              >
                <Text style={styles.tableCell}>
                  {Number.isNaN(item.quantity2) || !item.quantity2
                    ? ""
                    : new Intl.NumberFormat("de-CH", {
                        maximumSignificantDigits: 3,
                      }).format(item.quantity2)}
                </Text>
              </View>
              <View
                style={styles.tableColUnitShoppingList}
                key={"itemBlockUnit_Right" + pageCounter + "_" + line}
              >
                <Text style={styles.tableCell}>{item.unit2}</Text>
              </View>
              <View
                style={styles.tableColItemShoppingList}
                key={"itemBlockProduct_Right" + pageCounter + "_" + line}
              >
                <Text style={styles.tableCell}>{item.name2}</Text>
              </View>
            </React.Fragment>
          )}
        </View>
      ))}
    </View>
  );
};

export default ShoppingListPdf;
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
