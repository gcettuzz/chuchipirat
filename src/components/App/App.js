import React, {Suspense, lazy} from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import {MobileView} from "react-device-detect";

import "./App.css";

import Navigation from "../Navigation/navigation";
import ScrollToTop from "../Navigation/scrollToTop";
import GoBackFab from "../Navigation/goBack";
import Footer from "../Footer/footer";
import LandingPage from "../Landing/landing";
import AuthServiceHandler from "../AuthServiceHandler/authServiceHandler";

import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
  adaptV4Theme,
} from "@mui/material/styles";

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
import Fab from "@mui/material/Fab";
import {FeedbackIcon} from "../Shared/icons";
import * as Sentry from "@sentry/react";

import {withAuthentication} from "../Session/authUserContext";
import {SessionStorageHandler} from "../Firebase/Db/sessionStorageHandler.class";
import {FEEDBACK as TEXT_FEEDBACK} from "../../constants/text";
import {CssBaseline, useMediaQuery} from "@mui/material";
import useCustomStyles from "../../constants/styles";

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
const Schema = lazy(() => import("../Temp/schema"));

const Event = lazy(() => import("../Event/Event/event"));
const Events = lazy(() => import("../Event/Event/events"));
const Recipe = lazy(() => import("../Recipe/recipe"));

const CreateNewEvent = lazy(() => import("../Event/Event/createNewEvent"));
const Recipes = lazy(() => import("../Recipe/recipes"));
const Donate = lazy(() => import("../Donate/donate"));

const PasswordReset = lazy(() => import("../AuthServiceHandler/passwordReset"));

const System = lazy(() => import("../Admin/system"));
const GlobalSettings = lazy(() => import("../Admin/globalSettings"));
const SystemMessage = lazy(() => import("../Admin/systemMessage"));
const WhereUsed = lazy(() => import("../Admin/whereUsed"));
const MergeItems = lazy(() => import("../Admin/mergeItems"));
const ConvertItem = lazy(() => import("../Admin/convertItem"));
const Jobs = lazy(() => import("../Admin/executeJob"));
const BuildDbIndices = lazy(() => import("../Admin/buildDbIndex"));
const OverviewRecipes = lazy(() => import("../Admin/overviewRecipes"));
const OverviewEvents = lazy(() => import("../Admin/overviewEvents"));
const OverviewUsers = lazy(() => import("../Admin/overviewUsers"));
const OverviewMailbox = lazy(() => import("../Admin/overviewMailbox"));
const OverviewCloudFx = lazy(() => import("../Admin/overviewCloudFunctions"));
const OverviewFeeds = lazy(() => import("../Admin/overviewFeeds"));
const ActivateSupportUser = lazy(() => import("../Admin/activateSupportUser"));
const MailConsole = lazy(() => import("../Admin/mailConsole"));

const App = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
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
      // SessionStorageHandler.clearAll();
    };

    // Event Listener für das beforeunload-Ereignis hinzufügen
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Aufräumarbeiten: Event Listener entfernen, um Speicherlecks zu vermeiden
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  React.useEffect(async () => {
    const feedback = Sentry.feedbackIntegration({autoInject: false});
    const button = document.getElementById("custom-feedback-button");

    if (button) {
      feedback.attachTo(button, {
        formTitle: TEXT_FEEDBACK.title,
        colorScheme: "system",
        submitButtonLabel: TEXT_FEEDBACK.submitButton,
        cancelButtonLabel: TEXT_FEEDBACK.cancelButton,
        addScreenshotButtonLabel: TEXT_FEEDBACK.addScreenshotButton,
        removeScreenshotButtonLabel: TEXT_FEEDBACK.removeScreenshotButton,
        namePlaceholder: TEXT_FEEDBACK.namePlaceholder,
        emailPlaceholder: TEXT_FEEDBACK.emailPlaceholder,
        messageLabel: TEXT_FEEDBACK.messageLabel,
        messagePlaceholder: TEXT_FEEDBACK.messagePlaceholder,
        successMessageText: TEXT_FEEDBACK.successMessage,
        isRequiredLabel: TEXT_FEEDBACK.isRequired,
        themeLight: {
          foreground: theme.palette.text.primary,
          background: theme.palette.background.default,
          accentBackground: theme.palette.primary.main,
          successColor: theme.palette.success.main,
          errorColor: theme.palette.error.main,
        },
        themeDark: {
          foreground: "#fff",
          background: "#121212",
          accentBackground: "#00bcd4",
          accentForeground: "#000",
          successColor: "#4caf50",
          errorColor: "#f44336",
        },
      });
    }
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
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
          <Suspense fallback={<FallbackLoading />}>
            <Route
              path={[
                ROUTES.HOME,
                ROUTES.SIGN_IN,
                ROUTES.PASSWORD_CHANGE,
                ROUTES.PASSWORD_RESET,
                ROUTES.AUTH_SERVICE_HANDLER,
                ROUTES.CREATE_NEW_EVENT,
                ROUTES.EVENTS,
                ROUTES.EVENT_UID,
                ROUTES.RECIPES,
                ROUTES.RECIPE,
                ROUTES.RECIPE_UID,
                ROUTES.RECIPE_USER_UID,
                ROUTES.USER_PROFILE,
                ROUTES.USER_PROFILE_UID,
                ROUTES.USER_PUBLIC_PROFILE,
                ROUTES.USER_PUBLIC_PROFILE_UID,
                ROUTES.UNITS,
                ROUTES.UNITCONVERSION,
                ROUTES.PRODUCTS,
                ROUTES.MATERIALS,
                ROUTES.DEPARTMENTS,
                ROUTES.REQUEST_OVERVIEW,
                ROUTES.REQUEST_OVERVIEW_UID,
                ROUTES.NOT_FOUND,
                ROUTES.NO_AUTH,
              ]}
              component={FeedbackFab}
            />
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
              <Route path={ROUTES.PASSWORD_CHANGE} component={PasswordChange} />
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
              <Route path={ROUTES.UNITCONVERSION} component={UnitConversion} />
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
              <Route path={ROUTES.DONATE} component={Donate} />
              <Route
                exact
                path={ROUTES.SYSTEM_GLOBAL_SETTINGS}
                component={GlobalSettings}
              />
              <Route
                exact
                path={ROUTES.SYSTEM_SYSTEM_MESSAGE}
                component={SystemMessage}
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
                path={ROUTES.SYSTEM_OVERVIEW_FEEDS}
                component={OverviewFeeds}
              />
              <Route
                exact
                path={ROUTES.SYSTEM_WHERE_USED}
                component={WhereUsed}
              />
              <Route
                exact
                path={ROUTES.SYSTEM_MERGE_ITEM}
                component={MergeItems}
              />
              <Route
                exact
                path={ROUTES.SYSTEM_CONVERT_ITEM}
                component={ConvertItem}
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
              <Route exact path={ROUTES.USER_PROFILE} component={UserProfile} />
              <Route
                exact
                path={ROUTES.USER_PROFILE_UID}
                component={UserProfile}
              />
              <Route path={ROUTES.TEMP} component={Temp} />
              <Route path={ROUTES.SCHEMA} component={Schema} />
              <Route path={ROUTES.NOT_FOUND} component={NotFound} />
              <Route exact path={ROUTES.RECIPE} component={Recipe} />
              <Route exact path={ROUTES.RECIPE_UID} component={Recipe} />
              <Route exact path={ROUTES.RECIPE_USER_UID} component={Recipe} />
              <Route exact path={ROUTES.NO_AUTH} component={NoAuthPage} />
              <Redirect to="404" />
            </Switch>
          </Suspense>
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
        </Router>
        <CustomDialog />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

const FeedbackFab = () => {
  const classes = useCustomStyles();

  return (
    <Fab
      id="custom-feedback-button"
      color="secondary"
      size="small"
      aria-label="Feedback geben"
      sx={classes.fabBottom}
    >
      <FeedbackIcon />
    </Fab>
  );
};

export default withAuthentication(App);
