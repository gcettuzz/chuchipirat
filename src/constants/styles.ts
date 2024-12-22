import {makeStyles} from "@material-ui/core/styles";
import {alpha} from "@material-ui/core/styles/colorManipulator";

// import "typeface-roboto";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    listStyle: "none",
    padding: theme.spacing(1),
    // margin: 1,
  },
  backgroundGrey: {
    backgroundColor: theme.palette.action.hover,
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6, 0, 1),
  },
  heroButton: {
    margin: theme.spacing(3, 1, 3, 1),
  },
  button: {
    margin: theme.spacing(1),
  },
  container: {
    padding: theme.spacing(3, 1, 6, 1),
  },
  containerLg: {
    padding: theme.spacing(6, 3, 6, 3),
  },
  containerSm: {
    padding: theme.spacing(3, 0, 6),
  },
  pageContainer: {
    position: "relative",
    minHeight: "100vh",
  },
  content: {
    paddingBottom: "12rem",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "15rem",
    padding: theme.spacing(2),
  },
  paper: {
    //marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
  },
  box: {
    width: "100%",
    // height: "100%",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  card: {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  cardActions: {
    marginTop: "auto",
  },
  cardMenu: {
    backgroundColor: "none",
    // height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMenuEmpty: {
    backgroundColor: "none",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderColor: "darkgray",
    border: "2px dashed",

    boxShadow: "none",
  },
  cardActionRight: {
    justifyContent: "flex-end",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  alignGridItemContentRight: {
    justifyContent: "flex-end",
  },
  margin: {
    margin: theme.spacing(1),
  },
  textField: {
    width: "25ch",
  },
  pos: {
    marginBottom: 12,
  },
  listItemIcon: {
    width: "5%",
  },
  listItemTitle: {
    width: "40%",
  },
  listItemTitleRight: {
    width: "40%",
    display: "flex",
    justifyContent: "flex-end",
    marginRight: theme.spacing(2),
  },
  listItemContent: {
    width: "60%",
  },
  listItemHelperText: {
    paddingTop: theme.spacing(0),
  },
  submit: {
    margin: theme.spacing(2, 0, 1),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  centerCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  centerRight: {
    display: "flex",
    // alignItems: "center",
    justifyContent: "flex-end",
  },
  topCenter: {
    display: "flex",
    alignItems: "top",
    justifyContent: "center",
  },
  marginCenter: {
    margin: "auto",
    marginLeft: "auto",
    marginRight: "auto",
  },
  textFieldMulti: {
    marginBottom: theme.spacing(2),
  },
  statsKpiBox: {
    marginBottom: theme.spacing(3),
  },
  statsRatingBox: {
    display: "flex",
    m: "auto",
    alignItems: "center",
    justifyContent: "center",
  },

  rating: {
    alignItems: "center",
    justifyContent: "center",
  },

  pagination: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },

  form: {
    margin: theme.spacing(1),
    // width: "25ch",
  },
  formSelect: {
    width: "100%",
  },
  formControl: {
    margin: theme.spacing(0, 2, 2, 0),
    verticalAlign: "bottom",
    minWidth: 120,
  },
  formControlForSelect: {
    margin: theme.spacing(0, 2, 2, 0),
    minWidth: 80,
    // width: 180,
  },
  formControlForSelectLarge: {
    margin: theme.spacing(0, 2, 2, 0),
    minWidth: 150,
    // width: 180,
  },
  formListItem: {
    paddingRight: theme.spacing(0),
    paddingLeft: theme.spacing(0),
  },
  marginLarge: {
    margin: theme.spacing(4),
  },
  shoppingListItemTextQuantity: {
    textAlign: "right",
    minWidth: "5%",
    maxWidth: "15%",
    paddingRight: theme.spacing(2),
  },
  shoppingListItemTextUnit: {
    minWidth: "10%",
    maxWidth: "15%",
  },
  shoppingListItemTextProduct: {
    minWidth: "50%",
    maxWidth: "100%",
  },
  listShoppingList: {
    // display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    listStyle: "none",
    marginTop: theme.spacing(0),
    paddingTop: theme.spacing(0),
  },
  listShoppingListItem: {
    margin: theme.spacing(0),
    padding: theme.spacing(0),
  },
  typographyShoppingListDepartment: {
    paddingTop: theme.spacing(2.5),
  },
  typographyCode: {
    fontFamily: "Roboto Mono",
  },
  textOnCardMediaImage: {
    width: "100%",
    position: "absolute",
    bottom: "5%",
    left: "0%",
    background: "rgba(0, 0, 0, 0.5)",
    color: "white",
  },
  userProfileCardNameOnImage: {
    marginLeft: "3%",
  },
  userProfileCardIconButton: {
    position: "absolute",
    bottom: "23%",
    right: "5%",
  },
  userProfileCardIconButtonDelete: {
    position: "absolute",
    bottom: "23%",
    right: "15%",
  },
  imageButtonInput: {
    display: "none",
  },
  table: {
    // background: "red",
  },
  tableCellInactive: {
    color: theme.palette.text.disabled,
  },
  snackbar: {
    width: "100%",
  },
  fabBottom: {
    flexGrow: 1,
    margin: theme.spacing(1),
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    zIndex: 1000,
  },
  goBackFabButton: {
    flexGrow: 1,
    position: "absolute",
    margin: theme.spacing(1),
    top: theme.spacing(9),
    left: theme.spacing(1),
    zIndex: 1000,
    color: theme.palette.primary.main,
    background: theme.palette.background.paper,
    borderColor: theme.palette.primary.main,
    border: "2px solid",
  },
  goBackButtonIcon: {
    marginLeft: theme.spacing(0.9),
  },
  closeDrawerIconButton: {
    flexGrow: 1,
    position: "fixed",
    margin: theme.spacing(1),
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1000,
    background: alpha(theme.palette.background.paper, 0.7), // color: theme.palette.primary.main,
  },

  title: {
    flexGrow: 1,
  },
  // SearchInput
  alert: {
    margin: theme.spacing(3, 0, 3),
  },
  inputFileUpload: {
    display: "none",
  },
  mediumDivider: {
    height: "1px",
    backgroundColor: theme.palette.primary.main,
  },
  thickDivider: {
    height: "2px",
    backgroundColor: theme.palette.primary.main,
  },
  listItemTextAlignRight: {
    textAlign: "right",
  },
  // === Komponenten-Spezifisch ===
  // Loading Indicator
  containerLoadingIndicator: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(6, 0, 6),
  },
  containerSearchInput: {
    margin: theme.spacing(0.5),
  },
  containerUsersTable: {
    // margin: theme.spacing(0.5),
    margin: theme.spacing(3, 0.5, 6, 0.5),
    padding: theme.spacing(3, 0, 6, 0),
  },
  // Navigation
  appBar: {
    backgroundColor: "default",
  },
  appBarDark: {
    backgroundColor: "#333",
    color: "#fff",
  },

  navigationMenuButton: {
    marginRight: theme.spacing(2),
  },
  navigationTitle: {
    flexGrow: 1,
  },
  navigatioMmenuItem: {
    width: 230,
  },
  // Drawer
  navigationList: {
    width: 250,
  },
  navigationFullList: {
    width: "auto",
  },
  // Backdrop
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  toolbar: {
    padding: theme.spacing(0),
  },
  gridSearchInput: {
    paddingBottom: theme.spacing(2),
  },
  // Drawer zum Rezepte suchen im Menüplan
  recipeSearchDrawerPaperHorizontal: {
    backgroundColor: theme.palette.background.default,
    width: "45%",
  },
  recipeSearchDrawerPaperVertical: {
    backgroundColor: theme.palette.background.default,
    maxHeight: "90%",
  },
  toggleButtonGroup: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
    display: "flex",
  },
  toggleButton: {
    flex: "1",
    height: "100%",
    whiteSpace: "nowrap",
  },
  selectedToggleButton: {
    flex: "1",
    height: "100%",
    color: "red",
    backgroundColor: "yellow",
    whiteSpace: "nowrap",
  },
  deleteButton: {
    color: "#C62828",
    borderColor: "#C62828",
  },
  dataGridDisabled: {
    color: theme.palette.text.disabled,
  },
  /* ------------------------------------------
  // Rezept
  // ------------------------------------------ */
  recipeHeader: {
    [theme.breakpoints.down("sm")]: {height: "100vw", maxHeight: "380px"},
    [theme.breakpoints.up("md")]: {height: "50vw", maxHeight: "380px"},
    // position: "relative",
    display: "flex",
    alignItems: "flex-end",
    textAlign: "center",
    flexDirection: "row",
    flexWrap: "nowrap",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    // justifyContent: "center",
  },
  recipeHeaderTitle: {
    background: alpha(theme.palette.background.paper, 0.7),
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
    padding: theme.spacing(2),
    flex: "1",
    alignItems: "flex-end",
  },
  recipeHeaderPictureSource: {
    background: alpha(theme.palette.background.paper, 0.7),
    writingMode: "vertical-rl",
    transform: "rotate(-180deg)",
    position: "absolute", // flex: "1",
    right: "0",
    bottom: "0",
    padding: theme.spacing(0.5),
    paddingBottom: theme.spacing(1),
    borderBottomRightRadius: "4px",
  },
  listItemQuantity: {
    display: "flex",
    justifyContent: "flex-end",
    width: "10%",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  listItemSectionName: {
    width: "100%",
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1.5),
    fontSize: "1.2em",
  },
  listItemDetailSmall: {
    width: "20%",
  },
  listItemDetailLarge: {
    width: "30%",
  },
  listItemUnit: {
    width: "15%",
  },
  listItemNameLarge: {
    width: "40%",
  },
  listItemNameSmall: {
    width: "40%",
  },
  listItemScaleFactor: {
    width: "15%",
  },

  colorPrimary: {
    backgroundColor: "#00695C",
  },
  barColorPrimary: {
    backgroundColor: "#B2DFDB",
  },
  recipeMoreOptionsButton: {
    flexGrow: 1,
    position: "absolute",
    margin: theme.spacing(1),
    top: theme.spacing(40),
    right: theme.spacing(1),
    zIndex: 1000,
    // color: theme.palette.primary.main,
    // background: theme.palette.background.paper,
    // borderColor: theme.palette.primary.main,
    // border: "2px solid",
  },
  recipeImageSourceBackground: {
    maxWidth: "90%",
    // minWidth: "60%",
    paddingLeft: "2%",
    paddingRight: "2%",
    // width: "80%",
    right: "0",
    position: "absolute",
    top: "23.5em",
    background: "rgba(0, 0, 0, 0.6)",
    color: "white",
    borderTopLeftRadius: "1.5em",
    borderBottomLeftRadius: "1.5em",
  },
  recipeImageSourceText: {
    paddingLeft: "1.0em",
    paddingTop: "0.4em",
    paddingBottom: "0.4em",
    alignContent: "flex-end",
    // paddingRight: "2%",
  },

  /* ------------------------------------------
  // Menüplan
  // ------------------------------------------ */

  menuplanTabsContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  menuplanTabs: {
    justifyContent: "center",
  },
  menuplanRow: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
  },
  menuplanRowOnDrag: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
  },
  menuplanRowNoDrag: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
  },

  menuplanItem: {
    flexGrow: 1,
    flexBasis: 0,
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    minWidth: "330px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  cardMealType: {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    minHeight: "10em",
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    minWidth: "200px",
    width: "100%",
  },
  cardDate: {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    minWidth: "200px",
    width: "100%",
  },
  emptyMealBox: {
    borderColor: theme.palette.grey[500],
    border: "2px dashed",
    borderRadius: "4px",
    height: "100%",
    width: "100%",
    padding: "0",
    display: "flex",
  },
  listItemOnDrag: {
    backgroundColor: alpha(theme.palette.primary.main, 0.3),
    borderRadius: "0.2em",
  },
  listItemNoDrag: {
    backgroundColor: "inherit",
    borderRadius: "0",
  },
  ListOnDrop: {
    backgroundColor: theme.palette.action.hover,
    transition: "background-color 0.2s ease",
  },
  ListNoDrop: {
    backgroundColor: "inherit",
    transition: "background-color 0.2s ease",
  },
  mealRowOnDrop: {
    backgroundColor: theme.palette.action.hover,
    transition: "background-color 0.2s ease",
  },
  mealRowNoDrop: {
    backgroundColor: "inherit",
    transition: "background-color 0.2s ease",
  },
  menuplanGrid: {
    gridGap: theme.spacing(1),
    // alignItems: "center",
    // justifyContent: "center",
  },
  menuCard: {
    position: "relative",
    // height: "100%",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    marginBottom: theme.spacing(1),
  },
  recipeDrawerBackground: {
    backgroundColor: theme.palette.background.default,
    height: "100%",
  },
  dialogSelectMenueRow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    // gridAutoRows: "min-Content",
    gridAutoFlow: "column",
    padding: "0",
    // marginBottom: theme.spacing(1),
  },
  dialogSelectMenueItem: {
    padding: theme.spacing(1),
    minWidth: "15em",
    paddingBottom: theme.spacing(2),
  },
  dialogSelectMenueItemCheckboxBox: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    minWidth: "15em",
  },
  dialogSelectMenuCardMealtype: {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    // minWidth: "15em",
    width: "100%",
  },

  /* ------------------------------------------
  // Postizettel
  // ------------------------------------------ */
  traceListItemRecipe: {
    width: "60%",
  },
  traceListItemDate: {
    width: "30%",
  },
  traceListItemQuantity: {
    width: "15%",
    display: "flex",
    justifyContent: "flex-end",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  traceListItemUnit: {
    width: "15%",
  },
  /* ------------------------------------------
  // Quantity Calculation
  // ------------------------------------------ */
  quantityCalculationListGridItem: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  quantityCalculationListItemQuantity: {
    display: "flex",
    justifyContent: "flex-end",
    width: "15%",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  quantityCalculationListItemDetail: {
    width: "35%",
  },
  quantityCalculationListItemUnit: {
    width: "15%",
  },
  quantityCalculationListItemName: {
    width: "45%",
  },

  avatarSmall: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },

  /* ------------------------------------------
  // Dialog löschen bestätigen
  // ------------------------------------------ */
  dialogDeletionConfirmationTitle: {
    backgroundColor: "#FBE9E7",
    color: "#C62828",
  },
  dialogDeletionConfirmationText: {
    color: "#C62828",
  },
  dialogDeletionConfirmationButton: {
    color: "blue",
    backgroundColor: "blue",
  },
  dialogDeletionConfirmationWarningIcon: {
    marginRight: theme.spacing(1.5),
  },
  alertMessage: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  dialogDeletedeleteButton: {
    backgroundColor: "#C62828",
    color: "#FFFFFF",
    "&:hover": {
      backgroundColor: "#b71c1c",
    },
  },
  /* ------------------------------------------
  // Worfklow Chips
  // ------------------------------------------ */
  workflowChipActive: {
    backgroundColor: "#01579B !important",
    color: "white !important",
  },
  workflowChipDone: {
    backgroundColor: "#1B5E20 !important",
    color: "white !important",
  },
  workflowChipAborted: {
    backgroundColor: "#B71C1C !important",
    color: "white !important",
  },
  /* ------------------------------------------
  // Request 
  // ------------------------------------------ */
  listItemRequestTitle: {
    width: "50%",
  },
  listItemRequestContent: {
    width: "50%",
  },
  listItemRequestContentAvatar: {
    padding: "0",
    width: "50%",
  },
  dialogHeaderWithPicture: {
    height: "300px",
    width: "100%",
    bottom: "5%",
    left: "0%",
    color: "white",
    padding: "0",
  },
  dialogHeaderWithPictureTitle: {
    marginTop: "225px",
    background: "rgba(0, 0, 0, 0.5)",
    lineHeight: "150%",
  },
  /* ------------------------------------------
  // Gruppen-Konfiguration
  // ------------------------------------------ */
  itemGroupConfigurationRow: {
    height: theme.spacing(7),
    alignItems: "flex-end",
    display: "flex",
  },
  /* ------------------------------------------
  // Twint Button
  // ------------------------------------------ */
  cardMediaQrCode: {
    height: "100%",
    margin: "auto",
    maxWidth: "350px",
  },
  twintButton: {
    textTransform: "none",
    maxWidth: "420px",
  },
  twintButtonLightMode: {
    backgroundColor: "#262626",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#262626", // Hintergrundfarbe beim Hover-Effekt
      boxShadow: "#fff", // Schatten beim Hover-Effekt
    },
  },
  twintButtonDarkMode: {
    backgroundColor: "#fff",
    color: "#000",
    "&:hover": {
      backgroundColor: "#fff", // Hintergrundfarbe beim Hover-Effekt
      boxShadow: "#000", // Schatten beim Hover-Effekt
    },
  },
}));
export default useStyles;
