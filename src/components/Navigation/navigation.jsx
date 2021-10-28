import React from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { useMediaQuery } from "@material-ui/core";
import { useHistory } from "react-router";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import CssBaseline from "@material-ui/core/CssBaseline";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";

import Avatar from "@material-ui/core/Avatar";
import Fab from "@material-ui/core/Fab";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Zoom from "@material-ui/core/Zoom";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Link from "@material-ui/core/Link";

import clsx from "clsx";

import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import EventIcon from "@material-ui/icons/Event";
import FastfoodIcon from "@material-ui/icons/Fastfood";
import ListItemText from "@material-ui/core/ListItemText";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import StraightenIcon from "@material-ui/icons/Straighten";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import LoyaltyIcon from "@material-ui/icons/Loyalty";
import SettingsIcon from "@material-ui/icons/Settings";
import GroupIcon from "@material-ui/icons/Group";
import NewReleasesIcon from "@material-ui/icons/NewReleases";

import * as ACTIONS from "../../constants/actions";
import * as ROUTES from "../../constants/routes";
import * as TEXT from "../../constants/text";
import * as BUTTONTEXT from "../../constants/buttonText";
import * as DEFAULT_VALUES from "../../constants/defaultValues";
import * as LOCAL_STORAGE from "../../constants/localStorage";
import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";

import packageJson from "../../../package.json";
import DialogRefreshApp from "./dialogRefreshApp";

import { withFirebase } from "../Firebase/index.js";
import { AuthUserContext } from "../Session/index";
import * as ROLES from "../../constants/roles";

import useStyles from "../../constants/styles";
import { act } from "@testing-library/react";

// ===================================================================
// ========================== Scroll to Top  =========================
// ===================================================================
function ScrollTop(props) {
  const { children, window } = props;
  const classes = useStyles();

  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleTopClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      "#back-to-top-anchor"
    );
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <Zoom in={trigger}>
      <div
        key={"backToTop"}
        onClick={handleTopClick}
        role="presentation"
        className={classes.fabBottom}
      >
        {children}
      </div>
    </Zoom>
  );
}
// ===================================================================
// ======================= Navigation Komponente =====================
// ===================================================================
const NavigationComponent = () => (
  <div>
    <AuthUserContext.Consumer>
      {(authUser) =>
        authUser ? <NavigationAuth authUser={authUser} /> : <NavigationNoAuth />
      }
    </AuthUserContext.Consumer>
  </div>
);

// ===================================================================
// ==================== Navigation mit Berechtigung ==================
// ===================================================================
const NavigationAuthBase = (props) => {
  const classes = useStyles();
  const firebase = props.firebase;
  const authUser = props.authUser;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [showDialogRefreshApp, setShowDialogRefreshApp] = React.useState(false);

  const handleMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { push } = useHistory();

  // NAV Drawer Zeugs
  const [state, setDrawerState] = React.useState({
    left: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setDrawerState({ ...state, [anchor]: open });
  };

  const handleMenuClick = (event) => {
    let pressedButton = event.currentTarget.id.split("_");

    switch (pressedButton[0]) {
      case BUTTONTEXT.ACCOUNT:
        push({
          action: ACTIONS.VIEW,
          pathname: `${ROUTES.USER_PROFILE}/${authUser.uid}`,
          state: {},
        });
        break;
      case BUTTONTEXT.SIGNOUT:
        firebase.signOut();
        sessionStorage.removeItem(LOCAL_STORAGE.AUTH_USER);
        push({
          pathname: ROUTES.LANDING,
        });
        break;
      default:
    }
    setAnchorEl(null);
  };
  /* ------------------------------------------
  // Fragen ob Seite refresht werden darf
  // ------------------------------------------ */
  const onClickUpdateRibon = () => {
    setShowDialogRefreshApp(true);
  };
  /* ------------------------------------------
  // App auffrischen
  // ------------------------------------------ */
  const onUpdateAppOk = () => {
    // Event auslösen
    firebase.analytics.logEvent(FIREBASE_EVENTS.APP_FORCED_REFRESH);
    window.localStorage.clear();
    window.location.reload();
    setShowDialogRefreshApp(false);
  };
  /* ------------------------------------------
  // Refresh abbrechen
  // ------------------------------------------ */
  const onUpdateAppCancel = () => {
    setShowDialogRefreshApp(false);
  };
  /* ------------------------------------------
  // Prüfen ob sich die Version geändert hat
  // ------------------------------------------ */
  const isVersionUpToDate = async () => {
    let actualVersion;
    let localStorageVersion = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE.VERSION)
    );
    // aktuelles Datum als String - für bessere Vergleichbarkeit
    let today = new Date();
    let todayString = `${String(today.getFullYear())}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (
      !localStorageVersion ||
      localStorageVersion?.lastCheck !== todayString
    ) {
      console.warn("=== READ VERSION===");
      // Kein Wert oder veraltet
      await firebase
        .actualVersion()
        .get()
        .then((result) => {
          actualVersion = result.data().actualVersion;

          // speichern
          localStorage.setItem(
            LOCAL_STORAGE.VERSION,
            JSON.stringify({
              lastCheck: todayString,
              lastFetchedVersion: actualVersion,
            })
          );
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      actualVersion = localStorageVersion.lastFetchedVersion;
    }

    if (actualVersion !== packageJson.version) {
      return false;
    } else {
      return true;
    }
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.navigationList, {
        [classes.navigationFullList]: anchor === "top" || anchor === "bottom",
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <ListItem button key="Event">
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText
            primary={TEXT.NAVIGATION_EVENTS}
            onClick={() => push(ROUTES.EVENTS)}
          />
        </ListItem>
        <ListItem button key="Recipes">
          <ListItemIcon>
            <FastfoodIcon />
          </ListItemIcon>
          <ListItemText
            primary={TEXT.NAVIGATION_RECIPES}
            onClick={() => push(ROUTES.RECIPES)}
          />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button key="Units">
          <ListItemIcon>
            <StraightenIcon />
          </ListItemIcon>
          <ListItemText
            primary={TEXT.NAVIGATION_UNITS}
            onClick={() => push(ROUTES.UNITS)}
          />
        </ListItem>
        <ListItem button key="UnitConversion">
          <ListItemIcon>
            <SwapHorizIcon />
          </ListItemIcon>
          <ListItemText
            primary={TEXT.NAVIGATION_UNIT_CONVERSION}
            onClick={() => push(ROUTES.UNITCONVERSION)}
          />
        </ListItem>
        <ListItem button key="Products">
          <ListItemIcon>
            <LoyaltyIcon />
          </ListItemIcon>
          <ListItemText
            primary={TEXT.NAVIGATION_PRODUCTS}
            onClick={() => push(ROUTES.PRODUCTS)}
          />
        </ListItem>
        <ListItem button key="departments">
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText
            primary={TEXT.NAVIGATION_DEPARTMENTS}
            onClick={() => push(ROUTES.DEPARTMENTS)}
          />
        </ListItem>
      </List>
      {authUser.roles.includes(ROLES.ADMIN) && (
        <React.Fragment>
          <Divider />
          <List>
            <ListItem button key="Admin">
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary={TEXT.NAVIGATION_ADMIN}
                onClick={() => push(ROUTES.ADMIN)}
              />
            </ListItem>
            <ListItem button key="Users">
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText
                primary={TEXT.NAVIGATION_USERS}
                onClick={() => push(ROUTES.USERS)}
              />
            </ListItem>
          </List>
          <Divider />
        </React.Fragment>
      )}
      <Divider />
      <List>
        <ListItem button key="Help">
          <ListItemIcon>
            <HelpOutlineIcon />
          </ListItemIcon>
          <ListItemText
            primary={TEXT.NAVIGATION_HELP}
            onClick={() => window.open(DEFAULT_VALUES.HELPCENTER_URL, "_blank")}
          />
        </ListItem>
      </List>
    </div>
  );

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar className={prefersDarkMode ? classes.appBarDark : classes.appBar}>
        <Toolbar
          className={prefersDarkMode ? classes.appBarDark : classes.appBar}
        >
          <IconButton
            edge="start"
            className={classes.navigationMenuButton}
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer("left", true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.navigationTitle}>
            <Link
              component="button"
              className={classes.navigationTitle}
              variant="h6"
              color="inherit"
              underline="none"
              onClick={() =>
                push({
                  pathname: ROUTES.HOME,
                })
              }
            >
              {TEXT.APP_NAME}
            </Link>
          </Typography>
          {isVersionUpToDate() ? (
            <Ribbon text={"BETA"} />
          ) : (
            <UpdateRibbon onClick={onClickUpdateRibon} />
          )}

          <div>
            {/* {authUser.publicProfile.pictureSrc ? (
              <div onClick={handleMenu}>
                <Avatar
                  alt="Remy Sharp"
                  src={authUser.publicProfile.pictureSrc}
                />
              </div>
            ) : ( */}
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            {/* )} */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={open}
              onClose={handleClose}
            >
              <MenuItem id={BUTTONTEXT.ACCOUNT} onClick={handleMenuClick}>
                {TEXT.NAVIGATION_USER_PROFILE}
              </MenuItem>

              {/* <MenuItem>Einstellungen</MenuItem> */}
              <MenuItem id={BUTTONTEXT.SIGNOUT} onClick={handleMenuClick}>
                {TEXT.NAVIGATION_SIGN_OUT}
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      {/* <div id="back-to-top-anchor" /> */}
      <Toolbar
        className={classes.toolbar}
        id="back-to-top-anchor"
        disableGutters
      />

      <div>
        <React.Fragment key={"left"}>
          <Drawer
            anchor={"left"}
            open={state["left"]}
            onClose={toggleDrawer("left", false)}
          >
            {list("left")}
          </Drawer>
        </React.Fragment>
        {/* ))} */}
      </div>

      <ScrollTop {...props}>
        <Fab color="secondary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
      <DialogRefreshApp
        dialogOpen={showDialogRefreshApp}
        handleOk={onUpdateAppOk}
        handleClose={onUpdateAppCancel}
      />
    </React.Fragment>
  );
};
// ===================================================================
// ================== Navigation ohne Berechtigung ===================
// ===================================================================
// Komponente für Navigation ohne Login//Ohne Berechtigunge
export function NavigationNoAuthBase(props) {
  const classes = useStyles();
  const { push } = useHistory();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar className={prefersDarkMode ? classes.appBarDark : classes.appBar}>
        <Toolbar
          className={prefersDarkMode ? classes.appBarDark : classes.appBar}
        >
          <Typography variant="h6" className={classes.navigationTitle}>
            <Link
              variant="h6"
              component="button"
              color="inherit"
              underline="none"
              onClick={() =>
                push({
                  pathname: ROUTES.LANDING,
                })
              }
            >
              {TEXT.APP_NAME}
            </Link>
          </Typography>

          <div>
            <Typography variant="h6" className={classes.navigationTitle}>
              <Link
                variant="body1"
                component="button"
                color="inherit"
                underline="none"
                onClick={() =>
                  push({
                    pathname: ROUTES.SIGN_IN,
                  })
                }
              >
                {TEXT.NAVIGATION_SIGN_IN}
              </Link>
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
      <Toolbar id="back-to-top-anchor" />
    </React.Fragment>
  );
}
/* ===================================================================
// =============================== Ribbon ============================
// =================================================================== */
export const Ribbon = ({ text }) => {
  return <div className="ribbon  ribbon--red">{text}</div>;
};
export const UpdateRibbon = ({ onClick }) => {
  return (
    <div className="ribbon  ribbon--purple">
      <Link component="button" color="inherit" onClick={onClick}>
        {<NewReleasesIcon fontSize="large" />}
      </Link>
    </div>
  );
};
const NavigationAuth = compose(withRouter, withFirebase)(NavigationAuthBase);
const NavigationNoAuth = compose(
  withRouter,
  withFirebase
)(NavigationNoAuthBase);

export default NavigationComponent;
