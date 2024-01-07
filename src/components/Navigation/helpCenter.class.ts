import * as ROUTES from "../../constants/routes";
import {HELPCENTER_URL} from "../../constants/defaultValues";
import Action from "../../constants/actions";
import {NavigationObject} from "../Navigation/navigationContext";
interface GetMatchingHelpPage {
  actualPath: string;
  navigationObject?: NavigationObject;
  action?: Action;
}
export default class HelpCenter {
  // ===================================================================== */
  /**
   * Zugehörige Help-Seiten-URL aus dem Helpcenter definieren
   * @param aktueller Pfad -
   * @returns URL zur Helpcenter Seite
   */
  static getMatchingHelpPage = ({
    actualPath,
    navigationObject,
    action,
  }: GetMatchingHelpPage) => {
    let path = actualPath.split("/");
    let subdirectory = "";
    let page = "";

    switch (`/${path[1]}`) {
      case ROUTES.HOME:
        subdirectory = "home";
        page = "home";
        break;
      case ROUTES.RECIPE:
        subdirectory = "recipe";
        if (action == Action.VIEW) {
          page = "recipe%20structure";
        } else if (action == Action.EDIT) {
          page = "recipe%20create,%20change";
        } else {
          page = "recipe";
        }
        break;
      case ROUTES.RECIPES:
        subdirectory = "recipe";
        page = "recipes%20overview";
        break;
      case ROUTES.EVENT:
        subdirectory = "event";

        switch (navigationObject) {
          case NavigationObject.menueplan:
            page = "menueplan";
            break;
          case NavigationObject.groupConfigruation:
            page = "groupconfiguration";
            break;
          case NavigationObject.usedRecipes:
            page = "used%20recipes";
            break;
          case NavigationObject.shoppingList:
            page = "shoppinglist";
            break;
          case NavigationObject.materialList:
            page = "materiallist";
            break;
          case NavigationObject.eventSettings:
            page = "event%20settings";
            break;
          default:
            if (action == Action.NEW) {
              page = "event%20create";
            } else {
              page = "event";
            }
        }

        break;
      case ROUTES.PRODUCTS:
        subdirectory = "admin";
        page = "products";
        break;
      case ROUTES.REQUEST_OVERVIEW:
        subdirectory = "request";
        page = "requests";
        break;
      default:
        subdirectory = "";
    }

    return `${HELPCENTER_URL}/docs/${subdirectory}/${page}`;
  };
}
