import {StyleSheet} from "@react-pdf/renderer";

export default class PdfStyles {
  // Stile für PDF Export
  static getPdfStyles() {
    return StyleSheet.create({
      header: {
        fontSize: 9,
        marginBottom: 20,
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: 200,
        textAlign: "center",
      },

      printedOn: {
        position: "absolute",
        fontSize: 9,
        bottom: 30,
        left: 35,
        right: 0,
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: 200,
        textAlign: "left",
      },
      printedFrom: {
        position: "absolute",
        fontSize: 9,
        bottom: 16,
        left: 35,
        right: 0,
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: 200,
        textAlign: "left",
      },
      pageNumber: {
        position: "absolute",
        fontSize: 10,
        bottom: 30,
        left: 0,
        right: 0,
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: 200,
        textAlign: "center",
      },
      chuchipirat: {
        position: "absolute",
        fontSize: 9,
        bottom: 16,
        left: 0,
        right: 0,
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: 200,
        textAlign: "center",
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
