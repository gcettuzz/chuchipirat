import React from "react";
import {Document, Page, View, Text, Font} from "@react-pdf/renderer";
// import Utils from "../Shared/utils.class";
import Event from "../Event/event.class";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import StylesPdf from "../../../constants/stylesShoppingListPdf";

import {
  APP_NAME as TEXT_APP_NAME,
  SHOPPING_LIST as TEXT_SHOPPING_LIST,
} from "../../../constants/text";

import {Footer, Header} from "../../Shared/pdfComponents";
import ShoppingList, {ShoppingListItem} from "./shoppingList.class";
import {ShoppingListProperties} from "./shoppingListCollection.class";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
// Anzahl Zeilen, die pro Seite platz haben
const LINES_PER_PAGE = {
  FIRST: 33,
  REST: 35,
};

enum Column {
  LEFT,
  RIGHT,
}
enum LineType {
  DEPARTMENT,
  ITEM,
}

interface FormatedShoppingListPage {
  pageControl: PageControl;
  list: FormatedShoppingListLine[];
}

interface FormatedShoppingListLine {
  left: FormatedShoppingListItem | FormatedShoppingListDepartment | null;
  right: FormatedShoppingListItem | FormatedShoppingListDepartment | null;
}

interface FormatedShoppingListItem {
  type: LineType.ITEM;
  checked: boolean;
  quantity: ShoppingListItem["quantity"];
  unit: ShoppingListItem["unit"];
  name: string;
}
interface FormatedShoppingListDepartment {
  type: LineType.DEPARTMENT;
  name: string;
}

// ===================================================================== */
/**
 * Einkaufsliste formatieren
 * Damit die Liste in zwei Spalten generiert werden kann (Platz-sparend),
 * müssen die Einträge entsprechend so gebüschelt werden, dass sie später
 * in der Render-Methode korrekt nebeneinander angezeigt werden, auch wenn
 * die Lese Richtung von unten-nach-oben ist.
 */
class FormatedShoppingList {
  pages: FormatedShoppingListPage[];
  actualPage: number;

  constructor(shoppingList: ShoppingList) {
    this.pages = [];
    this.actualPage = 0;
    // Einträge zählen
    const noItems = ShoppingList.countItems({shoppingList: shoppingList});
    const noDepartmentes = Object.keys(shoppingList.list).length;

    // Anzahl Zeilen bestimmen (inkl. Leerzeilen)
    const noEntries = noItems + noDepartmentes + (noDepartmentes - 1);
    // 2 Spalten = 1/2 sovile Zeilen
    let noLines = Math.round(noEntries / 2);

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

    Object.values(shoppingList.list).forEach((department) => {
      let pageControl = this.pages[this.actualPage].pageControl;
      switch (pageControl.actualColum) {
        case Column.LEFT:
          this.pages[this.actualPage].list.push({
            left: {
              type: LineType.DEPARTMENT,
              name: department.departmentName,
            },
            right: null,
          });
          pageControl.lineCounter++;
          break;
        case Column.RIGHT:
          this.pages[this.actualPage].list[pageControl.lineCounter].right = {
            type: LineType.DEPARTMENT,
            name: department.departmentName,
          };
          pageControl.lineCounter++;
          break;
      }
      this.updatePageControl(pageControl);
      department.items.forEach((item) => {
        pageControl = this.pages[this.actualPage].pageControl;
        let lineItem: FormatedShoppingListLine;
        switch (pageControl.actualColum) {
          case Column.LEFT:
            this.pages[this.actualPage].list.push({
              left: {
                type: LineType.ITEM,
                quantity: item.quantity,
                checked: item.checked,
                unit: item.unit,
                name: item.item.name,
              },
              right: null,
            });
            pageControl.lineCounter++;
            break;
          case Column.RIGHT:
            lineItem =
              this.pages[this.actualPage].list[pageControl.lineCounter];
            lineItem.right = {
              type: LineType.ITEM,
              checked: item.checked,
              quantity: item.quantity,
              unit: item.unit,
              name: item.item.name,
            };
            pageControl.lineCounter++;
            break;
        }
        this.updatePageControl(pageControl);
      });
      if (pageControl.lineCounter !== 0) {
        // nun brauchts eine Leerzeile - aber nicht am Spaltenanfang
        if (pageControl.actualColum === Column.LEFT) {
          this.pages[this.actualPage].list.push({left: null, right: null});
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
      pageControl.actualColum === Column.LEFT
    ) {
      pageControl.lineCounter = 0;
      pageControl.actualColum = Column.RIGHT;
    } else if (
      pageControl.lineCounter === pageControl.maxLines &&
      pageControl.actualColum === Column.RIGHT
    ) {
      // Neue Seite anlegen
      this.actualPage++;
    }
  }
}

class PageControl {
  lineCounter: number;
  actualColum: Column;
  maxLines: number;

  constructor(maxLines) {
    this.lineCounter = 0;
    this.actualColum = Column.LEFT;
    this.maxLines = maxLines;
  }
}

/* ===================================================================
// ========================= PDF Einkaufsliste =======================
// =================================================================== */
interface ShoppingListPdfProps {
  shoppingList: ShoppingList;
  shoppingListName: ShoppingListProperties["name"];
  shoppingListSelectedTimeSlice: string;
  eventName: Event["name"];
  authUser: AuthUser;
}
const ShoppingListPdf = ({
  shoppingList,
  shoppingListName,
  shoppingListSelectedTimeSlice,
  eventName,
  authUser,
}: ShoppingListPdfProps) => {
  const actualDate = new Date();
  const formatedShoppingList = new FormatedShoppingList(shoppingList);

  return (
    <Document
      author={authUser.publicProfile.displayName}
      creator={TEXT_APP_NAME}
      keywords={eventName + " " + TEXT_SHOPPING_LIST}
      subject={TEXT_SHOPPING_LIST + " " + eventName}
      title={TEXT_SHOPPING_LIST + " " + eventName}
    >
      {formatedShoppingList.pages.map((page, counter) => (
        <ShoppingListPage
          eventName={eventName}
          shoppingList={page.list}
          shoppingListName={shoppingListName}
          shoppingListSelectedTimeSlice={shoppingListSelectedTimeSlice}
          actualDate={actualDate}
          pageNumber={counter}
          authUser={authUser}
          key={"shoppintListPage_" + counter}
        />
      ))}
    </Document>
  );
};

/* ===================================================================
// =========================== Rezept-Seite ==========================
// =================================================================== */
interface ShoppingListPageProps {
  shoppingList: FormatedShoppingListLine[];
  shoppingListName: ShoppingListProperties["name"];
  shoppingListSelectedTimeSlice: string;
  eventName: Event["name"];
  actualDate: Date;
  pageNumber: number;
  authUser: AuthUser;
}
const ShoppingListPage = ({
  shoppingList,
  shoppingListName,
  shoppingListSelectedTimeSlice,
  eventName,
  actualDate,
  pageNumber,
  authUser,
}: ShoppingListPageProps) => {
  return (
    <Page key={"page_" + pageNumber} style={styles.body}>
      <Header text={eventName} uid={"Header_" + pageNumber} />
      <ShoppingListTitle
        shoppingListName={shoppingListName}
        shoppingListSelectedTimeSlice={shoppingListSelectedTimeSlice}
      />
      <ShoppingListList shoppingList={shoppingList} pageNumber={pageNumber} />

      <Footer
        uid={"Footer_" + pageNumber}
        actualDate={actualDate}
        authUser={authUser}
      />
    </Page>
  );
};
/* ===================================================================
// ============================== Titel ==============================
// =================================================================== */
interface ShoppingListTitleProps {
  shoppingListName: ShoppingListProperties["name"];
  shoppingListSelectedTimeSlice: string;
}
const ShoppingListTitle = ({
  shoppingListName,
  shoppingListSelectedTimeSlice,
}: ShoppingListTitleProps) => {
  return (
    <React.Fragment>
      <View>
        <Text style={styles.title}>{TEXT_SHOPPING_LIST}</Text>
      </View>
      <View style={styles.containerBottomBorder} />
      <Text
        style={styles.subSubTitle}
      >{`${shoppingListName}: ${shoppingListSelectedTimeSlice}`}</Text>
      <View style={styles.containerBottomBorder} />
    </React.Fragment>
  );
};
/* ===================================================================
// ============================ Item-Liste ===========================
// =================================================================== */
interface ShoppingListListProps {
  shoppingList: FormatedShoppingListLine[];
  pageNumber: number;
}
const ShoppingListList = ({
  shoppingList,
  pageNumber,
}: ShoppingListListProps) => {
  return (
    <View style={styles.table} key={"itemBlockTable_" + pageNumber}>
      {shoppingList.map((item, line) => (
        <View
          style={styles.tableRow}
          key={"itemBlock_" + "_" + pageNumber + "_" + line}
        >
          {item.left == null ? (
            <View
              style={styles.tableCol50}
              key={"itemBlockNull_Left" + pageNumber + "_" + line}
            />
          ) : item.left?.type == LineType.DEPARTMENT ? (
            <View
              style={styles.tableCol50}
              key={"itemBlockDepartment_Left" + pageNumber + "_" + line}
            >
              <Text
                style={{
                  ...styles.tableCellBold,
                  ...styles.tableCellAlignLeft,
                }}
              >
                {item.left.name}
              </Text>
            </View>
          ) : (
            <React.Fragment key={"itemLeft_" + pageNumber + "_" + line}>
              <View
                style={styles.tableColQuantity}
                key={"itemBlockQuantity_Left" + pageNumber + "_" + line}
              >
                <Text
                  style={
                    item.left.checked
                      ? {
                          ...styles.tableCell,
                          ...styles.gray,
                          ...styles.strikeTrough,
                        }
                      : styles.tableCell
                  }
                >
                  {Number.isNaN(item.left?.quantity) || !item.left?.quantity
                    ? ""
                    : new Intl.NumberFormat("de-CH", {
                        maximumSignificantDigits: 3,
                      }).format(item.left.quantity)}
                </Text>
              </View>
              <View
                style={styles.tableColUnit}
                key={"itemBlockUnit_Left" + pageNumber + "_" + line}
              >
                <Text
                  style={
                    item.left.checked
                      ? {
                          ...styles.tableCell,
                          ...styles.gray,
                          ...styles.strikeTrough,
                        }
                      : styles.tableCell
                  }
                >
                  {item.left?.unit}
                </Text>
              </View>
              <View
                style={styles.tableColItem}
                key={"itemBlockProduct_Left" + pageNumber + "_" + line}
              >
                <Text
                  style={
                    item.left.checked
                      ? {
                          ...styles.tableCell,
                          ...styles.gray,
                          ...styles.strikeTrough,
                        }
                      : styles.tableCell
                  }
                >
                  {item.left?.name}
                </Text>
              </View>
            </React.Fragment>
          )}
          {item.right == null ? (
            <View
              style={styles.tableCol50}
              key={"itemBlockDepartment_Left" + pageNumber + "_" + line}
            />
          ) : item.right?.type == LineType.DEPARTMENT ? (
            <View
              style={styles.tableCol50}
              key={"itemBlockDepartment_Right" + pageNumber + "_" + line}
            >
              <Text
                style={{
                  ...styles.tableCellBold,
                  ...styles.tableCellAlignLeft,
                }}
              >
                {item.right.name}
              </Text>
            </View>
          ) : (
            <React.Fragment key={"itemRight_" + pageNumber + "_" + line}>
              <View
                style={styles.tableColQuantity}
                key={"itemBlockQuantity_Right" + pageNumber + "_" + line}
              >
                <Text
                  style={
                    item.right.checked
                      ? {
                          ...styles.tableCell,
                          ...styles.gray,
                          ...styles.strikeTrough,
                        }
                      : styles.tableCell
                  }
                >
                  {Number.isNaN(item.right?.quantity) || !item.right?.quantity
                    ? ""
                    : new Intl.NumberFormat("de-CH", {
                        maximumSignificantDigits: 3,
                      }).format(item.right?.quantity)}
                </Text>
              </View>
              <View
                style={styles.tableColUnit}
                key={"itemBlockUnit_Right" + pageNumber + "_" + line}
              >
                <Text
                  style={
                    item.right.checked
                      ? {
                          ...styles.tableCell,
                          ...styles.gray,
                          ...styles.strikeTrough,
                        }
                      : styles.tableCell
                  }
                >
                  {item.right?.unit}
                </Text>
              </View>
              <View
                style={styles.tableColItem}
                key={"itemBlockProduct_Right" + pageNumber + "_" + line}
              >
                <Text
                  style={
                    item.right.checked
                      ? {
                          ...styles.tableCell,
                          ...styles.gray,
                          ...styles.strikeTrough,
                        }
                      : styles.tableCell
                  }
                >
                  {item.right?.name}
                </Text>
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
