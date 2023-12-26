import React from "react";
import {withRouter, useLocation} from "react-router-dom";
import {compose} from "recompose";
import {useMediaQuery} from "@material-ui/core";
import {useHistory} from "react-router";

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
// import EventIcon from "@material-ui/icons/Event";
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

import * as ACTIONS from "../../constants/actions";
import * as ROUTES from "../../constants/routes";
import * as TEXT from "../../constants/text";
import * as BUTTONTEXT from "../../constants/buttonText";
import * as DEFAULT_VALUES from "../../constants/defaultValues";
import * as LOCAL_STORAGE from "../../constants/localStorage";
import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";

import HelpCenter from "./helpCenter.class";
import Enviroment from "../Shared/enviroment.class";

import packageJson from "../../../package.json";
import DialogRefreshApp from "./dialogRefreshApp";

import {withFirebase} from "../Firebase/index.js";
import {AuthUserContext} from "../Session/index";
import * as ROLES from "../../constants/roles";
import Role from "../../constants/roles";

import useStyles from "../../constants/styles";
import {act} from "@testing-library/react";
// import LocalStorageHandler from "../Shared/localStorageHandler.class";
import {
  SessionStorageHandler,
  STORAGE_OBJECT_PROPERTY,
} from "../Firebase/Db/sessionStorageHandler.class";
import Environment from "../Shared/enviroment.class";
import {NavigationValuesContext} from "../Navigation/navigationContext";
// ===================================================================
// ============================= Global =============================
// ===================================================================
type Anchor = "top" | "left" | "bottom" | "right";

// ===================================================================
// ========================== Scroll to Top  =========================
// ===================================================================
function ScrollTop(props) {
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
  const location = useLocation();
  const classes = useStyles();
  const firebase = props.firebase;
  const authUser = props.authUser;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [showDialogRefreshApp, setShowDialogRefreshApp] = React.useState(false);

  const [loadedVersionIsUpToDate, setLoadedVersionIsUpToDate] =
    React.useState(false);
  const navigationValuesContext = React.useContext(NavigationValuesContext);
  /* ------------------------------------------
  // Aktuelle Version holen
  // ------------------------------------------ */
  React.useEffect(() => {
    // Einmal ausführen
    getActualVersion();
    // Timer stellen, dass es in 12 Stunden erneut ausgeführt wird (falls kein Refresh stattfindet)
    const intervalId = setInterval(getActualVersion, 60 * 60 * 12 * 1000); // alle 12 Stunden

    return () => {
      clearInterval(intervalId);
    };
  }, []);
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
    let helpPage = HelpCenter.getMatchingHelpPage({
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
  const [state, setDrawerState] = React.useState({
    left: false,
  });

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
        localStorage.removeItem(LOCAL_STORAGE.AUTH_USER);
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
  const getActualVersion = async () => {
    let sessionStorageVersion = "";
    sessionStorageVersion = SessionStorageHandler.getDocument({
      storageObjectProperty: STORAGE_OBJECT_PROPERTY.ENVIROMENT,
      documentUid: "version",
    })?.actualVersion;

    await Environment.getActualVersion({firebase: firebase})
      .then((result) => {
        if (sessionStorageVersion != "" && sessionStorageVersion != result) {
          setLoadedVersionIsUpToDate(false);
        } else {
          setLoadedVersionIsUpToDate(true);
        }
      })
      .catch((error) => {
        throw error;
      });
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
      <Divider />
      <List>
        <ListItem button key="requestOverview">
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText
            primary={TEXT.NAVIGATION_REQUEST_OVERVIEW}
            onClick={() => push(ROUTES.REQUEST_OVERVIEW)}
          />
        </ListItem>
      </List>
      {authUser.roles.includes(Role.communityLeader) && (
        <React.Fragment>
          <Divider />
          <List>
            <ListItem button key="Products">
              <ListItemIcon>
                <LoyaltyIcon />
              </ListItemIcon>
              <ListItemText
                primary={TEXT.NAVIGATION_PRODUCTS}
                onClick={() => push(ROUTES.PRODUCTS)}
              />
            </ListItem>
          </List>
        </React.Fragment>
      )}
      {authUser.roles.includes(ROLES.ADMIN) && (
        <React.Fragment>
          <Divider />
          <List>
            <ListItem button key="Admin">
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary={TEXT.NAVIGATION_SYSTEM}
                onClick={() => push(ROUTES.SYSTEM)}
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
          {loadedVersionIsUpToDate ? null : ( // <Ribbon text={"BETA"} />
            <UpdateRibbon onClick={onClickUpdateRibon} />
          )}

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
          {/* <Ribbon text={"BETA"} /> */}
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
interface RibbonProps {
  text: string;
}
export const Ribbon = ({text}: RibbonProps) => {
  return <div className="ribbon  ribbon--red">{text}</div>;
};
export const UpdateRibbon = ({onClick}) => {
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
