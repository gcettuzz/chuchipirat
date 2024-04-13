/* eslint-disable react/prop-types */
import React from "react";
import {useLocation} from "react-router-dom";
import {useMediaQuery} from "@material-ui/core";
import {useHistory} from "react-router";
import {compose} from "react-recompose";
import {withRouter} from "react-router-dom";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import CssBaseline from "@material-ui/core/CssBaseline";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";

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
import DescriptionIcon from "@material-ui/icons/Description";
import BuildIcon from "@material-ui/icons/Build";

import Action from "../../constants/actions";
import * as ROUTES from "../../constants/routes";
import * as TEXT from "../../constants/text";
import * as BUTTONTEXT from "../../constants/buttonText";
import LocalStorageKey from "../../constants/localStorage";
import FirebaseAnalyticEvent from "../../constants/firebaseEvent";

import HelpCenter from "./helpCenter.class";

import DialogRefreshApp from "./dialogRefreshApp";

import Role from "../../constants/roles";

import useStyles from "../../constants/styles";

import {NavigationValuesContext} from "../Navigation/navigationContext";
import {AuthUserContext} from "../Session/authUserContext";
import {withFirebase} from "../Firebase/firebaseContext";

// import Environment from "../Shared/enviroment.class";
import Utils from "../Shared/utils.class";
// ===================================================================
// ============================= Global =============================
// ===================================================================
type Anchor = "top" | "left" | "bottom" | "right";

// ===================================================================
// ========================== Scroll to Top  =========================
// ===================================================================
interface ScrollTopProps {
  children: React.ReactElement;
  window?: () => Window;
}

function ScrollTop(props: ScrollTopProps) {
  const {children, window} = props;
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
      anchor.scrollIntoView({behavior: "smooth", block: "center"});
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
const NavigationComponent = () => {
  // const authUser = useAuthUser();
  return (
    <div>
      <AuthUserContext.Consumer>
        {(authUser) =>
          authUser ? (
            <NavigationAuth authUser={authUser} />
          ) : (
            <NavigationNoAuth />
          )
        }
      </AuthUserContext.Consumer>
    </div>
  );
};

// ===================================================================
// ==================== Navigation mit Berechtigung ==================
// ===================================================================
const NavigationAuthBase = (props) => {
  const location = useLocation();
  const classes = useStyles();
  const firebase = props.firebase;
  const authUser = props.authUser;

  // const authUser = useAuthUser();
  // const firebase = useFirebase();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const navigationValuesContext = React.useContext(NavigationValuesContext);
  const [showDialogRefreshApp, setShowDialogRefreshApp] = React.useState(false);
  const [state, setDrawerState] = React.useState({
    left: false,
  });
  const open = Boolean(anchorEl);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // const [loadedVersionIsUpToDate, setLoadedVersionIsUpToDate] =
  // React.useState(false);
  /* ------------------------------------------
  // Prüfen ob sich die Version geändert hat
  // ------------------------------------------ */
  //FIXME:
  // type LocalStorageVersion = {
  //   lastFetchedVersion: string;
  //   lastCheck: string;
  // };

  // const isVersionUpToDate = async () => {
  //   console.warn("hier");
  //   let actualVersion = "";
  //   let localStorageVersion: LocalStorageVersion | null = null;
  //   const localStorageVersionString = localStorage.getItem(
  //     LocalStorageKey.VERSION
  //   );

  //   if (localStorageVersionString) {
  //     localStorageVersion = JSON.parse(
  //       localStorageVersionString
  //     ) as LocalStorageVersion;
  //   }

  //   // aktuelles Datum als String - für bessere Vergleichbarkeit
  //   const today = new Date();
  //   const todayString = `${String(today.getFullYear())}-${String(
  //     today.getMonth() + 1
  //   ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  //   console.log(localStorageVersion);
  //   if (
  //     !localStorageVersion ||
  //     localStorageVersion?.lastCheck !== todayString
  //   ) {
  //     console.warn("=== READ VERSION===");
  //     // Kein Wert oder veraltet
  //     await Environment.getActualVersion({firebase: firebase})
  //       .then((result) => {
  //         actualVersion = result;

  //         // speichern
  //         localStorage.setItem(
  //           LocalStorageKey.VERSION,
  //           JSON.stringify({
  //             lastCheck: todayString,
  //             lastFetchedVersion: actualVersion,
  //           })
  //         );
  //       })
  //       .catch((error) => {
  //         console.error(error);
  //       });
  //   } else {
  //     actualVersion = localStorageVersion.lastFetchedVersion;
  //   }

  //   if (actualVersion !== packageJson.version) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // };
  /* ------------------------------------------
  Aktuelle Version holen
  ------------------------------------------ */
  // React.useEffect(() => {
  //   // Einmal ausführen
  //   getActualVersion();

  //   // Timer stellen, dass es in 12 Stunden erneut ausgeführt wird (falls kein Refresh stattfindet)
  //   const intervalId = setInterval(getActualVersion, 60 * 60 * 12 * 1000); // alle 12 Stunden

  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, []);

  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
  // Kontextmenü-Handler
  // ------------------------------------------ */
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  /* ------------------------------------------
  // Hilfe-Button
  // ------------------------------------------ */
  const handleHelp = () => {
    const helpPage = HelpCenter.getMatchingHelpPage({
      actualPath: location.pathname,
      navigationObject: navigationValuesContext?.navigationValues.object,
      action: navigationValuesContext?.navigationValues.action,
    });

    window.open(helpPage, "_blank");
  };

  const {push} = useHistory();

  /* ------------------------------------------
  // Navigation-Panel
  // ------------------------------------------ */

  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setDrawerState({...state, [anchor]: open});
    };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    const pressedButton = event.currentTarget.id.split("_");

    switch (pressedButton[0]) {
      case BUTTONTEXT.ACCOUNT:
        push({
          pathname: `${ROUTES.USER_PROFILE}/${authUser.uid}`,
          state: {action: Action.VIEW},
        });
        break;
      case BUTTONTEXT.SIGNOUT:
        firebase.signOut();
        localStorage.removeItem(LocalStorageKey.AUTH_USER);
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
  // const onClickUpdateRibon = () => {
  //   setShowDialogRefreshApp(true);
  // };
  /* ------------------------------------------
  // App auffrischen
  // ------------------------------------------ */
  const onUpdateAppOk = () => {
    // Event auslösen
    firebase.analytics.logEvent(FirebaseAnalyticEvent.appForceRefresh);
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
  const list = (anchor: Anchor) => (
    <div
      className={clsx(classes.navigationList, {
        [classes.navigationFullList]: anchor === "top" || anchor === "bottom",
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <ListItem button key="Recipes" onClick={() => push(ROUTES.RECIPES)}>
          <ListItemIcon>
            <FastfoodIcon />
          </ListItemIcon>
          <ListItemText primary={TEXT.RECIPES} />
        </ListItem>
        <ListItem button key="Events">
          <ListItemIcon onClick={() => push(ROUTES.EVENTS)}>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary={TEXT.EVENTS} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem
          button
          key="UnitConversion"
          onClick={() => push(ROUTES.UNITCONVERSION)}
        >
          <ListItemIcon>
            <SwapHorizIcon />
          </ListItemIcon>
          <ListItemText primary={TEXT.NAVIGATION_UNIT_CONVERSION} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem
          button
          key="requestOverview"
          onClick={() => push(ROUTES.REQUEST_OVERVIEW)}
        >
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary={TEXT.NAVIGATION_REQUEST_OVERVIEW} />
        </ListItem>
      </List>
      {authUser.roles?.includes(Role.communityLeader) && (
        <React.Fragment>
          <Divider />
          <List>
            <ListItem
              button
              key="Products"
              onClick={() => push(ROUTES.PRODUCTS)}
            >
              <ListItemIcon>
                <LoyaltyIcon />
              </ListItemIcon>
              <ListItemText primary={TEXT.NAVIGATION_PRODUCTS} />
            </ListItem>
            <ListItem
              button
              key="Materials"
              onClick={() => push(ROUTES.MATERIALS)}
            >
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary={TEXT.MATERIALS} />
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
        </React.Fragment>
      )}
      {authUser.roles?.includes(Role.communityLeader) && (
        <React.Fragment>
          <ListItem button key="Units" onClick={() => push(ROUTES.UNITS)}>
            <ListItemIcon>
              <StraightenIcon />
            </ListItemIcon>
            <ListItemText primary={TEXT.NAVIGATION_UNITS} />
          </ListItem>
          <Divider />
          <List>
            <ListItem button key="Admin" onClick={() => push(ROUTES.SYSTEM)}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={TEXT.NAVIGATION_SYSTEM} />
            </ListItem>
            {authUser.roles?.includes(Role.admin) && (
              <ListItem
                button
                key="Users"
                onClick={() => push(ROUTES.SYSTEM_OVERVIEW_USERS)}
              >
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText primary={TEXT.NAVIGATION_USERS} />
              </ListItem>
            )}
          </List>
          <Divider />
        </React.Fragment>
      )}
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
            disabled={!authUser.emailVerified}
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
          {Utils.isTestEnviroment() ? <TestTenantRibbon /> : null}
          {/* {!isVersionUpToDate ? (
            <UpdateRibbon onClick={onClickUpdateRibon} />
          ) : Utils.isTestTenant(window.location.toString()) ? (
            <TestTenantRibbon />
          ) : null}
 */}
          <div>
            <IconButton
              aria-label="go to Helppage"
              aria-controls="menu-appbar"
              aria-haspopup="false"
              color="inherit"
              onClick={handleHelp}
            >
              <HelpOutlineIcon />
            </IconButton>
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
                {TEXT.SIGN_OUT}
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
export function NavigationNoAuthBase() {
  const classes = useStyles();
  const {push} = useHistory();
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
          {Utils.isTestEnviroment() ? <TestTenantRibbon /> : null}
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
                {TEXT.SIGN_IN}
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
interface RibbonProps {
  text?: string;
  icon?: JSX.Element;
}
export const Ribbon = ({text, icon}: RibbonProps) => {
  return (
    <div className="ribbon  ribbon--red">{text ? text : icon ? icon : ""}</div>
  );
};

export const TestTenantRibbon = () => {
  return <div className="ribbon  ribbon--yellow">TEST</div>;
};
interface UpdateRibbonProps {
  onClick: (event: React.SyntheticEvent) => void;
}
export const UpdateRibbon = ({onClick}: UpdateRibbonProps) => {
  return (
    <div className="ribbon  ribbon--purple">
      <Link component="button" color="inherit" onClick={onClick}>
        {<NewReleasesIcon fontSize="large" />}
      </Link>
    </div>
  );
};
// const NavigationAuth = compose(withRouter, withFirebase)(NavigationAuthBase);
// const NavigationNoAuth = compose(
//   withRouter,
//   withFirebase
// )(NavigationNoAuthBase);

const NavigationAuth = compose(withRouter, withFirebase)(NavigationAuthBase);
const NavigationNoAuth = compose(
  withRouter,
  withFirebase
)(NavigationNoAuthBase);
export default NavigationComponent;
