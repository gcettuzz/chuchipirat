import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import "./App.css";

import Navigation from "../Navigation/navigation";
import ScrollToTop from "../Navigation/scrollToTop";
import Footer from "../Footer/footer";
import LandingPage from "../Landing/landing";
import SignUpPage from "../SignUp/signUp";
import SignInPage from "../SignIn/signIn";
import AuthServiceHandler from "../AuthServiceHandler/authServiceHandler";

import PasswordReset from "../AuthServiceHandler/passwordReset";

import PasswordChange from "../PasswordChange/passwordChange";
import HomePage from "../Home/home";
import Event from "../Event/event";
import Events from "../Event/events";
import Recipe from "../Recipe/recipe";
import Recipes from "../Recipe/recipes";
import Users from "../User/users";
import Admin from "../Admin/admin";
import FeedDelete from "../Admin/feedDelete";
import WhereUsed from "../Admin/whereUsed";

import UserPublicProfile from "../User/publicProfile";
import UserProfile from "../User/userProfile";
import Menuplan from "../Menuplan/menuplan";
import QuantityCalculation from "../QuantityCalculation/quantityCalculation";
import ShoppingList from "../ShoppingList/shoppingList";

import Units from "../Unit/units";
import UnitConversion from "../Unit/unitConversion";
import Products from "../Product/products";
import Departments from "../Department/departments";
import useStyles from "../../constants/styles";

import NotFound from "../404/404";

import Temp from "../Temp/temp";

import * as ROUTES from "../../constants/routes";
import { withAuthentication } from "../Session/index";

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
// import lime from "@material-ui/core/colors/lime";
// import blueGrey from "@material-ui/core/colors/blueGrey";
import red from "@material-ui/core/colors/red";
import publicProfile from "../User/publicProfile";
import { useMediaQuery } from "@material-ui/core";

const App = (props) => {
  const firebase = props.firebase;
  let authUser = null;
  let listener = () => {};
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const classes = useStyles();

  /* ------------------------------------------
  // Farbpaletten
  // ------------------------------------------ */
  const darkPalett = {
    type: "dark",
    primary: {
      main: "#00bcd4",
      light: "#fff",
      dark: "#fff",
      contrastText: "#000",
    },
    secondary: {
      main: "#c6ff00",
      light: "#fdff58",
      dark: "#90cc00",
      contrastText: "#000",
    },
    error: red,
  };
  const lightPalette = {
    type: "light",
    primary: {
      main: "#006064",
      light: "#428e92",
      dark: "#00363a",
      contrastText: "#fff",
    },
    secondary: {
      main: "#c6ff00",
      light: "#fdff58",
      dark: "#90cc00",
      contrastText: "#000",
    },
    error: red,
  };

  /* ------------------------------------------
  // Theme für App
  // ------------------------------------------ */
  const theme = React.useMemo(
    () =>
      createMuiTheme(
        prefersDarkMode ? { palette: darkPalett } : { palette: lightPalette }
      ),
    [prefersDarkMode]
  );

  React.useEffect(() => {
    listener = firebase.auth.onAuthStateChanged((user) => {
      user ? (authUser = user) : (authUser = null);
    });

    // Return Function = componentWillUmount
    return function cleanup() {
      listener();
    };
  });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className={classes.pageContainer}>
          <Navigation />
          <ScrollToTop />
          <div className={classes.content}>
            <Switch>
              <Route exact path={ROUTES.LANDING} component={LandingPage} />

              <Route path={ROUTES.SIGN_IN} component={SignInPage} />
              <Route path={ROUTES.SIGN_UP} component={SignUpPage} />

              <Route path={ROUTES.HOME} component={HomePage} />

              {/* <Route path={ROUTES.VERIFY_EMAIL} component={VerifyEmail} />*/}
              <Route path={ROUTES.PASSWORD_RESET} component={PasswordReset} />
              <Route path={ROUTES.PASSWORD_CHANGE} component={PasswordChange} />

              <Route
                path={ROUTES.AUTH_SERVICE_HANDLER}
                component={AuthServiceHandler}
              />

              <Route path={ROUTES.EVENTS} component={Events} />
              <Route exact path={ROUTES.EVENT} component={Event} />
              <Route exact path={ROUTES.EVENT_UID} component={Event} />

              <Route path={ROUTES.RECIPES} component={Recipes} />
              <Route exact path={ROUTES.RECIPE} component={Recipe} />
              <Route exact path={ROUTES.RECIPE_UID} component={Recipe} />

              <Route
                exact
                path={ROUTES.USER_PUBLIC_PROFILE_UID}
                component={publicProfile}
              />

              <Route path={ROUTES.UNITS} component={Units} />
              <Route path={ROUTES.UNITCONVERSION} component={UnitConversion} />

              <Route path={ROUTES.PRODUCTS} component={Products} />
              <Route path={ROUTES.DEPARTMENTS} component={Departments} />

              <Route exact path={ROUTES.MENUPLAN} component={Menuplan} />
              <Route exact path={ROUTES.MENUPLAN_UID} component={Menuplan} />

              <Route
                exact
                path={ROUTES.QUANTITY_CALCULATION}
                component={QuantityCalculation}
              />
              <Route
                exact
                path={ROUTES.QUANTITY_CALCULATION_UID}
                component={QuantityCalculation}
              />

              <Route
                exact
                path={ROUTES.SHOPPINGLIST}
                component={ShoppingList}
              />
              <Route
                exact
                path={ROUTES.SHOPPINGLIST_UID}
                component={ShoppingList}
              />

              <Route path={ROUTES.USERS} component={Users} />
              <Route exact path={ROUTES.ADMIN} component={Admin} />
              <Route
                exact
                path={ROUTES.ADMIN_FEED_DELETE}
                component={FeedDelete}
              />
              <Route
                exact
                path={ROUTES.ADMIN_WHERE_USED}
                component={WhereUsed}
              />

              <Route exact path={ROUTES.USER_PROFILE} component={UserProfile} />
              <Route
                exact
                path={ROUTES.USER_PROFILE_UID}
                component={UserProfile}
              />
              <Route path={ROUTES.TEMP} component={Temp} />

              <Route path={ROUTES.NOT_FOUND} component={NotFound} />
              <Redirect to="404" />
            </Switch>
          </div>
          <div className={classes.footer}>
            <Route
              path={[
                ROUTES.LANDING,
                ROUTES.HOME,
                ROUTES.RECIPE,
                ROUTES.RECIPES,
                ROUTES.EVENTS,
                ROUTES.EVENT,
                ROUTES.MENUPLAN,
                ROUTES.QUANTITY_CALCULATION,
                ROUTES.SHOPPINGLIST,
                // ROUTES.USER_ACCOUNT,
                ROUTES.UNITS,
                ROUTES.UNITCONVERSION,
                ROUTES.PRODUCTS,
                ROUTES.DEPARTMENTS,
                ROUTES.SIGN_IN,
                ROUTES.SIGN_UP,
                ROUTES.ADMIN,
              ]}
              component={Footer}
            />
          </div>
        </div>
      </Router>
    </MuiThemeProvider>
  );
};

export default withAuthentication(App);
