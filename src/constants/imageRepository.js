// Links müssen ersetzt werden!
export const DEVELOPMENT = {
  LANDING_LOGO:
    "https://xxx",
  SIGN_IN_HEADER:
    "https://xxx",
  PDF_FOOTER_IMAGE:
    "https://xxx",
  CARD_PLACEHOLDER_MEDIA:
    "https://xxx",
  DIVIDER_ICON_SRC:
    "https://xxx",
};

export const PRODUCTION = {
  LANDING_LOGO:
    "https://xxx",
  SIGN_IN_HEADER:
    "https://xxx",
  PDF_FOOTER_IMAGE:
    "https://xxx",
  CARD_PLACEHOLDER_MEDIA:
    "https://xxx",
  DIVIDER_ICON_SRC:
    "https://xxx",
};
/* =====================================================================
// Bild-Konstanten je nach System zurückgeben
// ===================================================================== */
export const getEnviromentRelatedPicture = () => {
  switch (process.env.REACT_APP_ENVIROMENT) {
    case "PRD":
      return PRODUCTION;
    case "DEV":
      return DEVELOPMENT;
  }
};
