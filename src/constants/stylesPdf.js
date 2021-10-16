import { red } from "@material-ui/core/colors";
import { StyleSheet } from "@react-pdf/renderer";

export default class PdfStyles {
  // Stile für PDF Export
  static getPdfStyles() {
    return StyleSheet.create({
      containerBottomBorder: {
        flexDirection: "row",
        flexFlow: "wrap",
        borderBottomWidth: 1,
        borderBottomColor: "#112131",
        borderBottomStyle: "solid",
        alignItems: "stretch",
        marginBottom: 10,
      },
      containerBottomBorderThin: {
        flexDirection: "row",
        flexFlow: "wrap",
        borderBottomWidth: 0.2,
        borderBottomColor: "#112131",
        borderBottomStyle: "solid",
        alignItems: "stretch",
        marginBottom: 10,
        paddingHorizontal: 10,
      },

      containerBottomBorderThinEmptyRow: {
        flexDirection: "row",
        flexFlow: "wrap",
        borderBottomWidth: 0.2,
        borderBottomColor: "#112131",
        borderBottomStyle: "solid",
        alignItems: "stretch",
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 10,
      },

      title: {
        fontSize: 32,
        textAlign: "center",
        fontFamily: "Roboto",
        fontStyle: "thin",
        fontWeight: 100,
        marginBottom: 10,
      },
      subTitle: {
        fontSize: 16,
        textAlign: "center",
        fontFamily: "Roboto",
        fontStyle: "thin",
        fontWeight: 100,
        marginBottom: 10,
      },
      subSubTitle: {
        fontSize: 12,
        textAlign: "center",
        fontFamily: "Roboto",
        fontStyle: "thin",
        fontWeight: 100,
        marginBottom: 10,
      },
      text: {
        fontSize: 11,
        textAlign: "justify",
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: 400,
      },

      header: {
        fontSize: 10,
        marginBottom: 20,
        fontFamily: "Roboto",
        fontStyle: "thin",
        fontWeight: 200,
        textAlign: "center",
      },
      pageNumber: {
        position: "absolute",
        fontSize: 10,
        bottom: 30,
        left: 0,
        right: 0,
        fontFamily: "Roboto",
        fontStyle: "thin",
        fontWeight: 200,
        textAlign: "center",
      },
      chuchipirat: {
        position: "absolute",
        fontSize: 10,
        bottom: 16,
        left: 0,
        right: 0,
        fontFamily: "Roboto",
        fontStyle: "thin",
        fontWeight: 200,
        textAlign: "center",
      },
      printedOn: {
        position: "absolute",
        fontSize: 10,
        bottom: 30,
        left: 35,
        right: 0,
        fontFamily: "Roboto",
        fontStyle: "thin",
        fontWeight: 200,
        textAlign: "left",
      },
      printedFrom: {
        position: "absolute",
        fontSize: 10,
        bottom: 16,
        left: 35,
        right: 0,
        fontFamily: "Roboto",
        fontStyle: "thin",
        fontWeight: 200,
        textAlign: "left",
      },

      // tabellen Coding

      body: {
        paddingTop: 15,
        paddingBottom: 65,
        paddingHorizontal: 35,
      },
      table: {
        display: "table",
        width: "auto",
        marginTop: 10,
        marginBottom: 10,
      },
      tableRow: {
        margin: "auto",
        flexDirection: "row",
      },

      tableColKey: {
        width: "15%",
        textAlign: "right",
        color: "grey",
        fontFamily: "Roboto",
        fontStyle: "normal",
      },
      tableColValue: {
        width: "35%",
        textAlign: "left",
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: 400,
      },
      tableColValueLarge: {
        width: "85%",
        textAlign: "left",
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: 400,
      },
      tableCol100: {
        width: "100%",
        textAlign: "center",
      },
      tableCol50: {
        width: "50%",
        textAlign: "center",
      },
      tableCol20: {
        width: "20%",
        textAlign: "center",
      },
      tableCol25: {
        width: "25%",
        textAlign: "center",
      },
      tableCol50: {
        width: "50%",
        textAlign: "center",
      },
      tableCol75: {
        width: "75%",
        textAlign: "center",
      },
      tableCol80: {
        width: "80%",
        textAlign: "center",
      },
      tableColQuantity: {
        width: "10%",
        textAlign: "right",
      },
      tableColUnit: {
        width: "7%",
        textAlign: "left",
      },
      tableColItem: {
        width: "60%",
        textAlign: "left",
      },
      tableColStepPos: {
        width: "10%",
        textAlign: "center",
        color: "grey",
      },
      tableColStep: {
        width: "90%",
        textAlign: "left",
      },
      tableColNote: {
        width: "100%",
        textAlign: "left",
      },
      tableColUnitShoppingList: {
        width: "10%",
        textAlign: "left",
      },
      tableColItemShoppingList: {
        width: "30%",
        textAlign: "left",
      },
      // Spezifische Formate für den Menüplan
      tableCellRecipe: {
        textAlign: "left",
        fontSize: 11,
        margin: 3,
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: 400,
      },
      tableCellMeal: {
        textAlign: "left",
        fontSize: 11,
        margin: 3,
        marginLeft: 10,
        fontFamily: "Roboto",
        fontStyle: "bold",
        fontWeight: 700,
      },
      tableCellHeadNote: {
        textAlign: "center",
        fontSize: 11,
        margin: 3,
        fontFamily: "Roboto",
        fontStyle: "italic",
        fontWeight: 400,
      },
      tableCellNote: {
        textAlign: "left",
        fontSize: 11,
        margin: 3,
        fontFamily: "Roboto",
        fontStyle: "italic",
        fontWeight: 400,
      },

      tableCellHeader: {
        fontSize: 11,
        fontWeight: 500,
      },
      tableCell: {
        margin: 3,
        fontSize: 11,
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: 400,
      },
      tableCellGrey: {
        color: "grey",
      },
      tableCellThin: {
        fontSize: 11,
        fontFamily: "Roboto",
        fontStyle: "thin",
        fontWeight: 100,
      },
      tableCellBold: {
        margin: 3,
        fontFamily: "Roboto",
        fontStyle: "bold",
        fontWeight: 700,
        fontSize: 11,
      },
      tableCellAlignLeft: {
        textAlign: "left",
      },
      tableCellAlignRight: {
        textAlign: "right",
      },
      italic: {
        fontStyle: "italic",
      },
      thinItalic: {
        fontStyle: "thinItalic",
        fontWeight: 100,
      },
      alignLeft: {
        textAlign: "left",
      },
      footerImage: {
        opacity: 0.5,
        width: "50px",
        position: "absolute",
        bottom: 10,
        // left: 0,
        right: 30,
      },
    });
  }
}
