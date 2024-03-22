import React, {Suspense, lazy} from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import {MobileView} from "react-device-detect";

import CssBaseline from "@material-ui/core/CssBaseline";
import "./App.css";

import Navigation from "../Navigation/navigation";
import ScrollToTop from "../Navigation/scrollToTop";
import GoBackFab from "../Navigation/goBack";
import Footer from "../Footer/footer";
import LandingPage from "../Landing/landing";
import AuthServiceHandler from "../AuthServiceHandler/authServiceHandler";

import {MuiThemeProvider, useMediaQuery} from "@material-ui/core";
import {createTheme} from "@material-ui/core/styles";
import useStyles from "../../constants/styles";
import NotFound from "../404/404";
import FallbackLoading from "../Shared/fallbackLoading";

import * as ROUTES from "../../constants/routes";

import CustomDialog from "../Shared/customDialog";
import publicProfile from "../User/publicProfile";
import NoAuthPage from "../Session/noAuth";
import CustomTheme from "./customTheme.class";
// Für nachträglicher Load --> Code Splitting
import SignUpPage from "../SignUp/signUp";
import SignInPage from "../SignIn/signIn";
import PasswordReset from "../AuthServiceHandler/passwordReset";

import {withAuthentication} from "../Session/authUserContext";
import {SessionStorageHandler} from "../Firebase/Db/sessionStorageHandler.class";

const PasswordChange = lazy(() => import("../PasswordChange/passwordChange"));
const Units = lazy(() => import("../Unit/units"));
const UnitConversion = lazy(() => import("../Unit/unitConversion"));
const Products = lazy(() => import("../Product/products"));
const Materials = lazy(() => import("../Material/materials"));
const Departments = lazy(() => import("../Department/departments"));
const requestOverview = lazy(() => import("../Request/requestOverview"));
const HomePage = lazy(() => import("../Home/home"));
const UserProfile = lazy(() => import("../User/userProfile"));
const PrivacyPolicyPage = lazy(() => import("./privacyPolicy"));
const TermOfUsePage = lazy(() => import("./termOfUse"));
const Temp = lazy(() => import("../Temp/temp"));

const Event = lazy(() => import("../Event/Event/event"));
const Events = lazy(() => import("../Event/Event/events"));
const Recipe = lazy(() => import("../Recipe/recipe"));

const CreateNewEvent = lazy(() => import("../Event/Event/createNewEvent"));
const Recipes = lazy(() => import("../Recipe/recipes"));
const System = lazy(() => import("../Admin/system"));
const GlobalSettings = lazy(() => import("../Admin/globalSettings"));
const FeedDelete = lazy(() => import("../Admin/feedDelete"));
const WhereUsed = lazy(() => import("../Admin/whereUsed"));
const MergeProducts = lazy(() => import("../Admin/mergeProducts"));
const ConvertProductToMaterial = lazy(() =>
  import("../Admin/convertProductToMaterial")
);
const Jobs = lazy(() => import("../Admin/executeJob"));
const BuildDbIndices = lazy(() => import("../Admin/buildDbIndex"));
const OverviewRecipes = lazy(() => import("../Admin/overviewRecipes"));
const OverviewEvents = lazy(() => import("../Admin/overviewEvents"));
const OverviewUsers = lazy(() => import("../Admin/overviewUsers"));
const OverviewMailbox = lazy(() => import("../Admin/overviewMailbox"));
const OverviewCloudFx = lazy(() => import("../Admin/overviewCloudFunctions"));
const ActivateSupportUser = lazy(() => import("../Admin/activateSupportUser"));
const MailConsole = lazy(() => import("../Admin/mailConsole"));

const App = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const classes = useStyles();

  /* ------------------------------------------
  // Theme für App
  // ------------------------------------------ */
  const theme = React.useMemo(
    () => createTheme({palette: CustomTheme.getTheme(prefersDarkMode)}),
    [prefersDarkMode]
  );

  React.useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Wenn auf Auffrischen geklickt wird, soll der Session-Storage gelöscht werden
      // Wir gehen davon aus, dass die Person über das Resultat irritiert ist und darum
      // laden wir die Daten frisch aus der DB.
      SessionStorageHandler.clearAll();
    };

    // Event Listener für das beforeunload-Ereignis hinzufügen
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Aufräumarbeiten: Event Listener entfernen, um Speicherlecks zu vermeiden
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className={classes.pageContainer}>
          <Navigation />
          <ScrollToTop />
          <MobileView>
            <Route
              path={[
                ROUTES.RECIPE,
                ROUTES.RECIPES,
                ROUTES.CREATE_NEW_EVENT,
                ROUTES.EVENT,
                ROUTES.EVENTS,
                // ROUTES.MENUPLAN,
                // ROUTES.QUANTITY_CALCULATION,
                // ROUTES.SHOPPINGLIST,
                ROUTES.UNITS,
                ROUTES.UNITCONVERSION,
                ROUTES.PRODUCTS,
                ROUTES.MATERIALS,
                ROUTES.DEPARTMENTS,
                ROUTES.SYSTEM,
                ROUTES.NOT_FOUND,
                ROUTES.SYSTEM_OVERVIEW_USERS,
                ROUTES.USER_PUBLIC_PROFILE_UID,
                ROUTES.USER_PROFILE,
              ]}
              component={GoBackFab}
            />
          </MobileView>
          <div className={classes.content}>
            <Suspense fallback={<FallbackLoading />}>
              <Switch>
                <Route exact path={ROUTES.LANDING} component={LandingPage} />
                <Route path={ROUTES.SIGN_IN} component={SignInPage} />
                <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
                <Route
                  path={ROUTES.PRIVACY_POLICY}
                  component={PrivacyPolicyPage}
                />
                <Route path={ROUTES.TERM_OF_USE} component={TermOfUsePage} />
                <Route path={ROUTES.HOME} component={HomePage} />
                <Route path={ROUTES.PASSWORD_RESET} component={PasswordReset} />
                <Route
                  path={ROUTES.PASSWORD_CHANGE}
                  component={PasswordChange}
                />
                <Route
                  path={ROUTES.AUTH_SERVICE_HANDLER}
                  component={AuthServiceHandler}
                />
                <Route
                  path={ROUTES.CREATE_NEW_EVENT}
                  component={CreateNewEvent}
                />
                <Route path={ROUTES.EVENTS} component={Events} />
                <Route exact path={ROUTES.EVENT_UID} component={Event} />
                <Route path={ROUTES.RECIPES} component={Recipes} />
                <Route
                  exact
                  path={ROUTES.USER_PUBLIC_PROFILE_UID}
                  component={publicProfile}
                />
                <Route path={ROUTES.UNITS} component={Units} />
                <Route
                  path={ROUTES.UNITCONVERSION}
                  component={UnitConversion}
                />
                <Route path={ROUTES.PRODUCTS} component={Products} />
                <Route path={ROUTES.MATERIALS} component={Materials} />
                <Route path={ROUTES.DEPARTMENTS} component={Departments} />
                <Route exact path={ROUTES.SYSTEM_JOBS} component={Jobs} />
                <Route
                  path={ROUTES.SYSTEM_OVERVIEW_USERS}
                  component={OverviewUsers}
                />
                <Route
                  path={ROUTES.SYSTEM_OVERVIEW_MAILBOX}
                  component={OverviewMailbox}
                />
                <Route exact path={ROUTES.SYSTEM} component={System} />
                <Route
                  path={ROUTES.REQUEST_OVERVIEW}
                  component={requestOverview}
                />
                <Route
                  exact
                  path={ROUTES.SYSTEM_GLOBAL_SETTINGS}
                  component={GlobalSettings}
                />
                <Route
                  exact
                  path={ROUTES.SYSTEM_OVERVIEW_RECIPES}
                  component={OverviewRecipes}
                />
                <Route
                  exact
                  path={ROUTES.SYSTEM_OVERVIEW_EVENTS}
                  component={OverviewEvents}
                />
                <Route
                  exact
                  path={ROUTES.SYSTEM_OVERVIEW_CLOUDFX}
                  component={OverviewCloudFx}
                />
                <Route
                  exact
                  path={ROUTES.SYSTEM_FEED_DELETE}
                  component={FeedDelete}
                />
                <Route
                  exact
                  path={ROUTES.SYSTEM_WHERE_USED}
                  component={WhereUsed}
                />
                <Route
                  exact
                  path={ROUTES.SYSTEM_MERGE_PRODUCT}
                  component={MergeProducts}
                />
                <Route
                  exact
                  path={ROUTES.SYSTEM_CONVERT_PRODUCT_TO_MATERIAL}
                  component={ConvertProductToMaterial}
                />
                <Route
                  exact
                  path={ROUTES.SYSTEM_DB_INDICES}
                  component={BuildDbIndices}
                />
                <Route
                  exact
                  path={ROUTES.SYSTEM_ACTIVATE_SUPPORT_USER}
                  component={ActivateSupportUser}
                />
                <Route
                  exact
                  path={ROUTES.SYSTEM_MAIL_CONSOLE}
                  component={MailConsole}
                />
                <Route
                  exact
                  path={ROUTES.USER_PROFILE}
                  component={UserProfile}
                />
                <Route
                  exact
                  path={ROUTES.USER_PROFILE_UID}
                  component={UserProfile}
                />
                <Route path={ROUTES.TEMP} component={Temp} />
                <Route path={ROUTES.NOT_FOUND} component={NotFound} />
                <Route exact path={ROUTES.RECIPE} component={Recipe} />
                <Route exact path={ROUTES.RECIPE_UID} component={Recipe} />
                <Route exact path={ROUTES.RECIPE_USER_UID} component={Recipe} />
                <Route exact path={ROUTES.NO_AUTH} component={NoAuthPage} />
                <Redirect to="404" />
              </Switch>
            </Suspense>
          </div>
          <div className={classes.footer}>
            <Route
              path={[
                ROUTES.LANDING,
                ROUTES.HOME,
                ROUTES.RECIPE,
                ROUTES.RECIPES,
                ROUTES.CREATE_NEW_EVENT,
                ROUTES.EVENT,
                ROUTES.UNITS,
                ROUTES.UNITCONVERSION,
                ROUTES.PRODUCTS,
                ROUTES.MATERIALS,
                ROUTES.DEPARTMENTS,
                ROUTES.SIGN_IN,
                ROUTES.SIGN_UP,
                ROUTES.SYSTEM,
                ROUTES.NOT_FOUND,
              ]}
              component={Footer}
            />
          </div>
        </div>
      </Router>
      <CustomDialog />
    </MuiThemeProvider>
  );
};

export default withAuthentication(App);
