export class ImageRepository {
  /* =====================================================================
  // Allgemeine Bilder
  // ===================================================================== */
  static getEnviromentRelatedPicture = () => {
    switch (process.env.REACT_APP_ENVIROMENT) {
      case "PRD":
        return PRODUCTION;
      case "TST":
        return TEST;
      case "DEV":
        return DEVELOPMENT;
      default:
        return PRODUCTION;
    }
  };
  /* =====================================================================
  // Bilder für Landing-Page
  // ===================================================================== */
  static getLandingPageEnviromentRelatedPicture = () => {
    switch (process.env.REACT_APP_ENVIROMENT) {
      case "PRD":
        return LANDING_PAGE_PICTURES_PRODUCTION;
      case "TEST":
        return LANDING_PAGE_PICTURES_TEST;
      case "DEV":
        return LANDING_PAGE_PICTURES_DEVELOPMENT;
      default:
        return LANDING_PAGE_PICTURES_PRODUCTION;
    }
  };
}
/* =====================================================================
// Bild-Konstanten je nach System 
// ===================================================================== */
interface PictureRepository {
  LANDING_LOGO: string;
  SIGN_IN_HEADER: string;
  PDF_FOOTER_IMAGE: string;
  CARD_PLACEHOLDER_MEDIA: string;
  DIVIDER_ICON_SRC: string;
}

const DEVELOPMENT: PictureRepository = {
  LANDING_LOGO:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/defaults%2Flanding_logo.svg?alt=media&token=67b09680-5866-4689-9cc9-02efba55d6a9",
  SIGN_IN_HEADER:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/defaults%2Flogo_16_9.png?alt=media&token=ae5638ce-4df3-4518-9037-e357668b85d6",
  PDF_FOOTER_IMAGE:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/defaults%2FpdfFooterImage.png?alt=media&token=b486073c-fe6a-4b29-9502-1bdb38b243e0",
  CARD_PLACEHOLDER_MEDIA:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/defaults%2Fplaceholder.png?alt=media&token=fe2c82ce-5e98-41be-ae98-87a1af3753a3",
  DIVIDER_ICON_SRC:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/defaults%2Fdivider_icon.svg?alt=media&token=8e8cb6d1-a4bb-4b9c-ba40-7adeeed25e61",
};
const TEST: PictureRepository = {
  LANDING_LOGO:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-tst.appspot.com/o/defaults%2Flanding_logo.svg?alt=media&token=d104547b-34dc-49fe-a0d8-05dd5119d34a",
  SIGN_IN_HEADER:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-tst.appspot.com/o/defaults%2Flogo_16_9.png?alt=media&token=21e937bc-92b8-49de-a4e0-cb07b6c5ac15",
  PDF_FOOTER_IMAGE:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-tst.appspot.com/o/defaults%2FpdfFooterImage.png?alt=media&token=4cfa4074-583f-42f4-b2bd-bef22718e3d8",
  CARD_PLACEHOLDER_MEDIA:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-tst.appspot.com/o/defaults%2Fplaceholder.png?alt=media&token=565c9d99-b243-4a41-a62f-d3b615ae18b3",
  DIVIDER_ICON_SRC:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-tst.appspot.com/o/defaults%2Fdivider_icon.svg?alt=media&token=a155c0fd-c385-45f4-acd8-4ef913d5fcdb",
};
const PRODUCTION: PictureRepository = {
  LANDING_LOGO:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat.appspot.com/o/defaults%2Flanding_logo.svg?alt=media&token=aadca31f-8740-4e9c-9478-6b36c3126940",
  SIGN_IN_HEADER:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat.appspot.com/o/defaults%2Flogo_16_9.png?alt=media&token=21f6a336-64ca-450a-9418-5ee72b3355ba",
  PDF_FOOTER_IMAGE:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat.appspot.com/o/defaults%2FpdfFooterImage.png?alt=media&token=a51e2a20-ca53-43d6-ad88-b5fcdc92466a",
  CARD_PLACEHOLDER_MEDIA:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat.appspot.com/o/defaults%2Fplaceholder.png?alt=media&token=c5532518-f7d1-4c76-b9ee-f4f93716dd27",
  DIVIDER_ICON_SRC:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat.appspot.com/o/defaults%2Fdivider_icon.svg?alt=media&token=d37468a3-a536-417f-bb14-3fc6b7bef737",
};
/* =====================================================================
// Bilder für die Landingpage
// ===================================================================== */
interface LandingPagePictureRepository {
  recipes: string;
  menuplan: string;
  scaling: string;
  shoppinglist: string;
  groupconfig: string;
}
const LANDING_PAGE_PICTURES_PRODUCTION: LandingPagePictureRepository = {
  recipes: "",
  menuplan: "",
  scaling: "",
  shoppinglist: "",
  groupconfig: "",
};
const LANDING_PAGE_PICTURES_TEST: LandingPagePictureRepository = {
  recipes:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-tst.appspot.com/o/landing%2Frecipes.png?alt=media&token=5f0bbc4a-ab04-4e4f-a6e4-53fcba50a6c5",
  menuplan:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-tst.appspot.com/o/landing%2Fmenuplan.png?alt=media&token=bb5cf21a-96e3-473e-960c-bcb48d4ae6be",
  scaling:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-tst.appspot.com/o/landing%2Fscaling.png?alt=media&token=40688bfa-f906-4f00-93b8-75637ea74835",
  shoppinglist:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-tst.appspot.com/o/landing%2Fshoppinglist.png?alt=media&token=72c4e6f6-243e-46cf-afc1-111c0214c7a6",
  groupconfig:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-tst.appspot.com/o/landing%2Fgroupconfig.png?alt=media&token=93ec7626-be22-4ce0-af2e-68f3d896beb9",
};
const LANDING_PAGE_PICTURES_DEVELOPMENT: LandingPagePictureRepository = {
  recipes:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/landing%2Frecipes.png?alt=media&token=1dbb2ee7-6ec5-436d-bf51-eb148891fe30",
  menuplan:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/landing%2Fmenuplan.png?alt=media&token=5bdb9f0d-c87f-488c-a87d-d8a8849b19b0",
  scaling:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/landing%2Fscaling.png?alt=media&token=36ff13c1-45ae-42c6-94a6-d23e6429ca4e",
  shoppinglist:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/landing%2Fshoppinglist.png?alt=media&token=50a135f2-dc3f-4b70-90e5-b6f3fded28cf",
  groupconfig:
    "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/landing%2Fgroupconfig.png?alt=media&token=45d75376-4719-4360-b10f-10355ba94f0f",
};
