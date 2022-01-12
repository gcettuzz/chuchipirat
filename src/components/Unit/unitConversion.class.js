import Utils from "../Shared/utils.class";
import * as TEXT from "../../constants/text";
import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";

export default class UnitConversion {
  constructor(
    uid,
    productName,
    productUid,
    denominator,
    numerator,
    fromUnit,
    toUnit
  ) {
    this.uid = uid;
    this.productName = productName;
    this.productUid = productUid;
    this.denominator = denominator;
    this.numerator = numerator;
    this.fromUnit = fromUnit;
    this.toUnit = toUnit;
  }

  /* =====================================================================
  // Alle Umrechnungen Basic holen
  // ===================================================================== */
  static getAllConversionBasic = async (firebase) => {
    let unitsConversionBasic = [];

    await firebase
      .unitConversionBasic()
      .get()
      .then((snapshot) => {
        if (snapshot && snapshot.exists) {
          Object.keys(snapshot.data()).forEach((key) => {
            unitsConversionBasic.push(
              new UnitConversion(
                key,
                "",
                "",
                snapshot.data()[key].denominator,
                snapshot.data()[key].numerator,
                snapshot.data()[key].fromUnit,
                snapshot.data()[key].toUnit
              )
            );
          });
        }
      });

    unitsConversionBasic = Utils.sortArray({
      array: unitsConversionBasic,
      attributeName: "fromUnit",
    });
    return unitsConversionBasic;
  };
  /* =====================================================================
  // Neue Umrechnung Basic anlegen
  // ===================================================================== */
  static createUnitConversionBasic = async (
    firebase,
    denominator,
    numerator,
    fromUnit,
    toUnit
  ) => {
    const unitConversionBasicDoc = firebase.unitConversionBasic();

    // Neue UID generieren
    let uid = Utils.generateUid(20);
    let newUnitConversionBasic = {
      denominator: Number(denominator),
      numerator: Number(numerator),
      fromUnit: fromUnit,
      toUnit: toUnit,
    };

    await unitConversionBasicDoc
      .update({
        [uid]: newUnitConversionBasic,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    // Event auslösen
    firebase.analytics.logEvent(FIREBASE_EVENTS.UNIT_CONVERSION_CREATED);

    return { [uid]: newUnitConversionBasic };
  };
  /* =====================================================================
  // Umrechnung löschen
  // ===================================================================== */
  static deleteUnitConversionBasic = async (firebase, uid) => {
    const unitConversionBasicDoc = firebase.unitConversionBasic();

    // Feld löschen
    await unitConversionBasicDoc
      .update({
        [uid]: firebase.fieldValue.delete(),
      })
      .catch((error) => {
        throw error;
      });
  };
  /* =====================================================================
  // Umrechnungen Basic speichern
  // ===================================================================== */
  static saveUnitConversionBasic = async (firebase, unitConversionBasic) => {
    const unitConversionDoc = firebase.unitConversionBasic();

    var unitConversionMap = {};
    unitConversionBasic.forEach((unitConversion) => {
      unitConversionMap[unitConversion.uid] = {
        denominator: Number(unitConversion.denominator),
        numerator: Number(unitConversion.numerator),
        fromUnit: unitConversion.fromUnit,
        toUnit: unitConversion.toUnit,
      };
    });

    await unitConversionDoc.update(unitConversionMap).catch((error) => {
      throw error;
    });
  };
  /* =====================================================================
  // Alle Umrechnungen Basic holen
  // ===================================================================== */
  static getAllConversionProducts = async (firebase) => {
    let unitsConversionProducts = [];

    await firebase
      .unitConversionProducts()
      .get()
      .then((snapshot) => {
        if (snapshot && snapshot.exists) {
          Object.keys(snapshot.data()).forEach((key) => {
            unitsConversionProducts.push(
              new UnitConversion(
                key,
                snapshot.data()[key].productName,
                snapshot.data()[key].productUid,
                snapshot.data()[key].denominator,
                snapshot.data()[key].numerator,
                snapshot.data()[key].fromUnit,
                snapshot.data()[key].toUnit
              )
            );
          });
        }
      });

    unitsConversionProducts = Utils.sortArray({
      array: unitsConversionProducts,
      attributeName: "productName",
    });
    return unitsConversionProducts;
  };
  /* =====================================================================
  // Neue Umrechnung Basic anlegen
  // ===================================================================== */
  static createUnitConversionProduct = async (
    firebase,
    product,
    denominator,
    numerator,
    fromUnit,
    toUnit
  ) => {
    const unitConversionProductDoc = firebase.unitConversionProducts();

    // Neue UID generieren
    let uid = Utils.generateUid(20);
    let newUnitConversionProduct = {
      productUid: product.uid,
      productName: product.name,
      denominator: Number(denominator),
      numerator: Number(numerator),
      fromUnit: fromUnit,
      toUnit: toUnit,
    };

    await unitConversionProductDoc
      .update({
        [uid]: newUnitConversionProduct,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    // Event auslösen
    firebase.analytics.logEvent(FIREBASE_EVENTS.UNIT_CONVERSION_CREATED);

    return { [uid]: newUnitConversionProduct };
  };
  /* =====================================================================
  // Umrechnungen Product speichern
  // ===================================================================== */
  static saveUnitConversionProduct = async (
    firebase,
    unitConversionProduct
  ) => {
    const unitConversionDoc = firebase.unitConversionProducts();
    var unitConversionMap = {};
    unitConversionProduct.forEach((unitConversion) => {
      unitConversionMap[unitConversion.uid] = {
        productUid: unitConversion.productUid,
        productName: unitConversion.productName,
        denominator: Number(unitConversion.denominator),
        numerator: Number(unitConversion.numerator),
        fromUnit: unitConversion.fromUnit,
        toUnit: unitConversion.toUnit,
      };
    });

    await unitConversionDoc.update(unitConversionMap).catch((error) => {
      throw error;
    });
  };
  /* =====================================================================
  // Umrechnung löschen
  // ===================================================================== */
  static deleteUnitConversionProduct = async (firebase, uid) => {
    const unitConversionProductsDoc = firebase.unitConversionProducts();

    // Feld löschen
    await unitConversionProductsDoc
      .update({
        [uid]: firebase.fieldValue.delete(),
      })
      .catch((error) => {
        throw error;
      });
  };
  /* =====================================================================
// Menge umrechnen
// ===================================================================== */
  static convertQuantity = ({
    quantity,
    product,
    fromUnit,
    toUnit,
    unitConversionBasic,
    unitConversionProducts,
  }) => {
    let conversionRule;
    let convertedQuantity;

    if (product) {
      // Zuerst Produktspezifisch schauen (sollte es nur eine geben)
      conversionRule = unitConversionProducts.find(
        (rule) => rule.productUid === product.uid && rule.fromUnit === fromUnit
      );
    }
    if (!product || !conversionRule) {
      conversionRule = unitConversionBasic.find(
        (rule) => rule.fromUnit === fromUnit
      );
    }

    if (conversionRule) {
      convertedQuantity =
        (quantity * conversionRule.numerator) / conversionRule.denominator;
    } else {
      throw new Error(TEXT.ERROR_UNIT_CONVERSION_NOT_FOUND);
    }

    if (conversionRule.toUnit === toUnit) {
      // Umrechnen
      return convertedQuantity;
    } else {
      // Die richtige Ziel-Einheit wurde noch nicht gefunden. Nun rekursiv suchen
      try {
        return UnitConversion.convertQuantity({
          quantity: convertedQuantity,
          fromUnit: conversionRule.toUnit,
          toUnit: toUnit,
          unitConversionBasic: unitConversionBasic,
        });
      } catch (error) {
        throw error;
      }
    }
  };
}
