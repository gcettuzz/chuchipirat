import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    listStyle: "none",
    padding: theme.spacing(1),
    // margin: 1,
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
    // width: 0,
    paddingTop: "56.25%", // 16:9
  },
  cardContent: {
    flexGrow: 1,
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
    display: "flex",
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
    width: "50%",
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
  // marginCenter: {
  //   margin: "auto",
  //   marginLeft: "auto",
  //   marginRight: "auto",
  // },
  textFieldMulti: {
    marginBottom: theme.spacing(2),
  },
  statKpiBox: {
    marginBottom: theme.spacing(3),
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
  userProfileCardNameOnImageBackground: {
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
    // "& > * + *": {
    //   marginTop: theme.spacing(2),
    // },
  },
  fabBottom: {
    flexGrow: 1,
    margin: theme.spacing(1),
    position: "fixed",
    bottom: theme.spacing(6),
    right: theme.spacing(3),
    zIndex: 1000,
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

  /* ------------------------------------------
  // Rezept
  // ------------------------------------------ */
  listItemQuantity: {
    display: "flex",
    justifyContent: "flex-end",
    width: "10%",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
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
}));
export default useStyles;
