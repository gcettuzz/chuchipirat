import React from "react";
import {Document, Page, View, Text, Font} from "@react-pdf/renderer";
// import Utils from "../Shared/utils.class";
import Event from "../Event/event.class";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import StylesPdf from "../../../constants/stylesMaterialListPdf";

import {
  APP_NAME as TEXT_APP_NAME,
  MATERIAL_LIST as TEXT_MATERIAL_LIST,
} from "../../../constants/text";

import {Footer, Header} from "../../Shared/pdfComponents";
import {MaterialListEntry, MaterialListMaterial} from "./materialList.class";
import Utils from "../../Shared/utils.class";
/* ===================================================================
// ========================= PDF Einkaufsliste =======================
// =================================================================== */
interface MaterialListPdfProps {
  materialList: MaterialListEntry;
  materialListSelectedTimeSlice: string;
  eventName: Event["name"];
  authUser: AuthUser;
}
const MaterialListPdf = ({
  materialList,
  materialListSelectedTimeSlice,
  eventName,
  authUser,
}: MaterialListPdfProps) => {
  let actualDate = new Date();

  return (
    <Document
      author={authUser.publicProfile.displayName}
      creator={TEXT_APP_NAME}
      keywords={eventName + " " + TEXT_MATERIAL_LIST}
      subject={TEXT_MATERIAL_LIST + " " + eventName}
      title={TEXT_MATERIAL_LIST + " " + eventName}
    >
      <MaterialListPage
        eventName={eventName}
        materialList={materialList}
        materialListSelectedTimeSlice={materialListSelectedTimeSlice}
        actualDate={actualDate}
        authUser={authUser}
      />
    </Document>
  );
};

/* ===================================================================
// =========================== Rezept-Seite ==========================
// =================================================================== */
interface MaterialListPageProps {
  materialList: MaterialListEntry;
  materialListSelectedTimeSlice: string;
  eventName: Event["name"];
  actualDate: Date;
  authUser: AuthUser;
}
const MaterialListPage = ({
  materialList,
  materialListSelectedTimeSlice,
  eventName,
  actualDate,
  authUser,
}: MaterialListPageProps) => {
  return (
    <Page key={"page_" + materialList.properties.uid} style={styles.body}>
      <Header text={eventName} uid={"mealRecipe.uid"} />
      <MaterialListTitle
        materialListName={materialList.properties.name}
        materialListSelectedTimeSlice={materialListSelectedTimeSlice}
      />
      <MaterialListList materialList={materialList} />

      <Footer
        uid={"Footer_" + materialList.properties.uid}
        actualDate={actualDate}
        authUser={authUser}
      />
    </Page>
  );
};
/* ===================================================================
// ============================== Titel ==============================
// =================================================================== */
interface MaterialListTitleProps {
  materialListName: MaterialListMaterial["name"];
  materialListSelectedTimeSlice: string;
}
const MaterialListTitle = ({
  materialListName,
  materialListSelectedTimeSlice,
}: MaterialListTitleProps) => {
  return (
    <React.Fragment>
      <View>
        <Text style={styles.title}>{TEXT_MATERIAL_LIST}</Text>
      </View>
      <View style={styles.containerBottomBorder} />
      <Text
        style={styles.subSubTitle}
      >{`${materialListName}: ${materialListSelectedTimeSlice}`}</Text>
      <View style={styles.containerBottomBorder} />
    </React.Fragment>
  );
};
/* ===================================================================
// ============================ Item-Liste ===========================
// =================================================================== */
interface MaterialListListProps {
  materialList: MaterialListEntry;
}
const MaterialListList = ({materialList}: MaterialListListProps) => {
  return (
    <View style={styles.table} key={"materialBlockTable"}>
      {Utils.sortArray({array: materialList.items, attributeName: "name"}).map(
        (material, line) => (
          <View style={styles.tableRow} key={"materialLine_" + "_" + line}>
            <View
              style={styles.tableColQuantity}
              key={"materialBlockQuantity" + line}
            >
              <Text
                style={
                  material.checked
                    ? {
                        ...styles.tableCell,
                        ...styles.gray,
                        ...styles.strikeTrough,
                      }
                    : styles.tableCell
                }
              >
                {Number.isNaN(material.quantity) || !material.quantity
                  ? ""
                  : new Intl.NumberFormat("de-CH", {
                      maximumSignificantDigits: 3,
                    }).format(material.quantity)}
              </Text>
            </View>
            <View style={styles.tableCol5} key={"materialBlockSpacer" + line} />

            <View style={styles.tableColItem} key={"materialBlockName" + line}>
              <Text
                style={
                  material.checked
                    ? {
                        ...styles.tableCell,
                        ...styles.gray,
                        ...styles.strikeTrough,
                      }
                    : styles.tableCell
                }
              >
                {material.name}
              </Text>
            </View>
          </View>
        )
      )}
    </View>
  );
};

export default MaterialListPdf;
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
