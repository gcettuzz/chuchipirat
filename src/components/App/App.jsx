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
} from "@mui/material/styles";

import NotFound from "../404/404";
import FallbackLoading from "../Shared/fallbackLoading";

import * as ROUTES from "../../constants/routes";

import CustomDialog from "../Shared/customDialog";
import PublicProfile from "../User/publicProfile";
import NoAuthPage from "../Session/noAuth";
import CustomTheme from "./customTheme.class";
// Für nachträglicher Load --> Code Splitting
import SignUpPage from "../SignUp/signUp";
import SignInPage from "../SignIn/signIn";
import Fab from "@mui/material/Fab";
import {FeedbackIcon} from "../Shared/icons";
import * as Sentry from "@sentry/react";

import {AuthorizationGuard} from "../Session/authUserContext";
import {EmailVerificationGuard} from "../Session/emailVerificationGuard";
import Role from "../../constants/roles";
import {FEEDBACK as TEXT_FEEDBACK} from "../../constants/text";
import {CssBaseline, useMediaQuery} from "@mui/material";
import useCustomStyles from "../../constants/styles";

const PasswordChange = lazy(() => import("../PasswordChange/passwordChange"));
const Units = lazy(() => import("../Unit/units"));
const UnitConversion = lazy(() => import("../Unit/unitConversion"));
const Products = lazy(() => import("../Product/products"));
const Materials = lazy(() => import("../Material/materials"));
const Departments = lazy(() => import("../Department/departments"));
const RequestOverview = lazy(() => import("../Request/requestOverview"));
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

/* ===================================================================
// ====================== Authorization Conditions ===================
// =================================================================== */
const isAuthenticated = (authUser) => !!authUser;

const isAdmin = (authUser) =>
  !!authUser && !!authUser.roles.includes(Role.admin);

const isAdminOrCommunityLeader = (authUser) =>
  !!authUser &&
  (!!authUser.roles.includes(Role.admin) ||
    !!authUser.roles.includes(Role.communityLeader));

const isCommunityLeader = (authUser) =>
  !!authUser && !!authUser.roles.includes(Role.communityLeader);

/* ===================================================================
// ====================== Guarded Route Helpers ======================
// =================================================================== */
const GuardedRoute = ({condition, component: Component, ...rest}) => (
  <Route
    {...rest}
    render={(props) => (
      <AuthorizationGuard condition={condition}>
        <EmailVerificationGuard>
          <Component {...props} />
        </EmailVerificationGuard>
      </AuthorizationGuard>
    )}
  />
);

const GuardedRouteNoEmailVerification = ({
  condition,
  component: Component,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => (
      <AuthorizationGuard condition={condition}>
        <Component {...props} />
      </AuthorizationGuard>
    )}
  />
);

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

  React.useEffect(() => {
    const initFeedback = async () => {
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
    };
    initFeedback();
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
              {/* Public routes */}
              <Route exact path={ROUTES.LANDING} component={LandingPage} />
              <Route path={ROUTES.SIGN_IN} component={SignInPage} />
              <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
              <Route
                path={ROUTES.PRIVACY_POLICY}
                component={PrivacyPolicyPage}
              />
              <Route path={ROUTES.TERM_OF_USE} component={TermOfUsePage} />
              <Route path={ROUTES.PASSWORD_RESET} component={PasswordReset} />
              <Route
                path={ROUTES.AUTH_SERVICE_HANDLER}
                component={AuthServiceHandler}
              />
              <Route path={ROUTES.NOT_FOUND} component={NotFound} />
              <Route exact path={ROUTES.NO_AUTH} component={NoAuthPage} />

              {/* Authenticated routes (isAuthenticated + EmailVerification) */}
              <GuardedRoute
                path={ROUTES.HOME}
                condition={isAuthenticated}
                component={HomePage}
              />
              <GuardedRoute
                path={ROUTES.CREATE_NEW_EVENT}
                condition={isAuthenticated}
                component={CreateNewEvent}
              />
              <GuardedRoute
                path={ROUTES.EVENTS}
                condition={isAuthenticated}
                component={Events}
              />
              <GuardedRoute
                exact
                path={ROUTES.EVENT_UID}
                condition={isAuthenticated}
                component={Event}
              />
              <GuardedRoute
                path={ROUTES.RECIPES}
                condition={isAuthenticated}
                component={Recipes}
              />
              <GuardedRoute
                exact
                path={ROUTES.RECIPE}
                condition={isAuthenticated}
                component={Recipe}
              />
              <GuardedRoute
                exact
                path={ROUTES.RECIPE_UID}
                condition={isAuthenticated}
                component={Recipe}
              />
              <GuardedRoute
                exact
                path={ROUTES.RECIPE_USER_UID}
                condition={isAuthenticated}
                component={Recipe}
              />
              <GuardedRoute
                exact
                path={ROUTES.USER_PUBLIC_PROFILE_UID}
                condition={isAuthenticated}
                component={PublicProfile}
              />
              <GuardedRoute
                path={ROUTES.UNITS}
                condition={isAuthenticated}
                component={Units}
              />
              <GuardedRoute
                path={ROUTES.UNITCONVERSION}
                condition={isAuthenticated}
                component={UnitConversion}
              />
              <GuardedRoute
                path={ROUTES.REQUEST_OVERVIEW}
                condition={isAuthenticated}
                component={RequestOverview}
              />
              <GuardedRoute
                exact
                path={ROUTES.USER_PROFILE}
                condition={isAuthenticated}
                component={UserProfile}
              />
              <GuardedRoute
                exact
                path={ROUTES.USER_PROFILE_UID}
                condition={isAuthenticated}
                component={UserProfile}
              />
              <GuardedRoute
                path={ROUTES.DONATE}
                condition={isAuthenticated}
                component={Donate}
              />

              {/* Password change: EmailVerification guard but no Authorization redirect */}
              <Route
                path={ROUTES.PASSWORD_CHANGE}
                render={(props) => (
                  <EmailVerificationGuard>
                    <PasswordChange {...props} />
                  </EmailVerificationGuard>
                )}
              />

              {/* Admin or CommunityLeader routes */}
              <GuardedRoute
                path={ROUTES.PRODUCTS}
                condition={isAdminOrCommunityLeader}
                component={Products}
              />
              <GuardedRoute
                path={ROUTES.MATERIALS}
                condition={isAdminOrCommunityLeader}
                component={Materials}
              />
              <GuardedRoute
                path={ROUTES.DEPARTMENTS}
                condition={isAdminOrCommunityLeader}
                component={Departments}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM}
                condition={isAdminOrCommunityLeader}
                component={System}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_WHERE_USED}
                condition={isAdminOrCommunityLeader}
                component={WhereUsed}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_MERGE_ITEM}
                condition={isAdminOrCommunityLeader}
                component={MergeItems}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_CONVERT_ITEM}
                condition={isAdminOrCommunityLeader}
                component={ConvertItem}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_SYSTEM_MESSAGE}
                condition={isAdminOrCommunityLeader}
                component={SystemMessage}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_OVERVIEW_RECIPES}
                condition={isAdminOrCommunityLeader}
                component={OverviewRecipes}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_OVERVIEW_EVENTS}
                condition={isAdminOrCommunityLeader}
                component={OverviewEvents}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_DB_INDICES}
                condition={isAdminOrCommunityLeader}
                component={BuildDbIndices}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_ACTIVATE_SUPPORT_USER}
                condition={isAdminOrCommunityLeader}
                component={ActivateSupportUser}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_MAIL_CONSOLE}
                condition={isAdminOrCommunityLeader}
                component={MailConsole}
              />

              {/* Admin-only routes */}
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_GLOBAL_SETTINGS}
                condition={isAdmin}
                component={GlobalSettings}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_JOBS}
                condition={isAdmin}
                component={Jobs}
              />
              <GuardedRoute
                path={ROUTES.SYSTEM_OVERVIEW_USERS}
                condition={isAdmin}
                component={OverviewUsers}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_OVERVIEW_MAILBOX}
                condition={isAdmin}
                component={OverviewMailbox}
              />
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_OVERVIEW_CLOUDFX}
                condition={isAdmin}
                component={OverviewCloudFx}
              />

              {/* CommunityLeader routes */}
              <GuardedRoute
                exact
                path={ROUTES.SYSTEM_OVERVIEW_FEEDS}
                condition={isCommunityLeader}
                component={OverviewFeeds}
              />

              {/* Temp/Schema: admin only */}
              <GuardedRoute
                path={ROUTES.TEMP}
                condition={isAdmin}
                component={Temp}
              />
              <GuardedRoute
                path={ROUTES.SCHEMA}
                condition={isAdmin}
                component={Schema}
              />

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

export default App;
