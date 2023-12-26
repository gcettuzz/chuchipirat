import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

import {ButtonTypeMap} from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

import useMediaQuery from "@material-ui/core/useMediaQuery";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";

import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import useStyles from "../../constants/styles";
import {useTheme} from "@material-ui/core";

export interface CustomButton {
  id: string;
  label: string;
  hero: boolean;
  variant: ButtonTypeMap["props"]["variant"];
  color: ButtonTypeMap["props"]["color"];
  onClick: (event?: React.MouseEvent<HTMLButtonElement>) => any;
  disabled?: boolean;
  visible: boolean;
  startIcon?: JSX.Element;
}

interface ButtonRowProps {
  buttons: CustomButton[];
  buttonGroup?: CustomButton[];
  splitButtons?: CustomButton[];
}

/* ===================================================================
// ============================= Button Row ==========================
// =================================================================== */
const ButtonRow = ({buttons, buttonGroup, splitButtons}: ButtonRowProps) => {
  const classes = useStyles();
  const theme = useTheme();
  let menuItems: Array<CustomButton> = [];
  let noOfVisibleButtons = 0;

  /* ------------------------------------------
  // Split-Button
  // ------------------------------------------ */
  const [splitButtonMenuOpen, setSplitButtonMenuOpen] = React.useState(false);
  const splitButtonAnchor = React.useRef<HTMLDivElement>(null);
  const [selectedSplitButtonIndex, setSelectedSplitButtonIndex] =
    React.useState(0);

  const handleSplitButtonClick = () => {
    if (splitButtons) {
      splitButtons[selectedSplitButtonIndex].onClick();
    }
  };
  const handleSplitButtonMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    if (splitButtons) {
      setSelectedSplitButtonIndex(index);
      // und gleich ausführen
      splitButtons[index].onClick();
      setSplitButtonMenuOpen(false);
    }
  };
  const handleSplitButtonToggle = () => {
    setSplitButtonMenuOpen((prevOpen) => !prevOpen);
  };
  const handleSplitButtonMenuClose = (
    event: React.MouseEvent<Document, MouseEvent>
  ) => {
    if (
      splitButtonAnchor.current &&
      splitButtonAnchor.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setSplitButtonMenuOpen(false);
  };
  /* ------------------------------------------
  // Vert-More Icon-Button
  // ------------------------------------------ */
  const [vertMoreAnchor, setVertMoreAnchor] =
    React.useState<null | HTMLElement>(null);
  const vertMoreMenuOpen = Boolean(vertMoreAnchor);

  const handleVertMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setVertMoreAnchor(event.currentTarget);
  };
  const handleVertMoreMenuClose = () => {
    setVertMoreAnchor(null);
  };
  const onMenuItemClick = (menuFunction: () => void) => {
    menuFunction();
    setVertMoreAnchor(null);
  };

  // hat das Array Buttons mehr Buttons als die Screen-Breite zulässt
  // werden diese in einem Menü zusammengefasst.
  let isXSBreakPoint = useMediaQuery(theme.breakpoints.down("xs"));
  let isSMBreakPoint = useMediaQuery(theme.breakpoints.down("sm"));
  let isMdBreakPoint = useMediaQuery(theme.breakpoints.down("md"));
  if (isXSBreakPoint && buttons.length > 1) {
    noOfVisibleButtons = 2;
  } else if (isSMBreakPoint && buttons.length > 3) {
    noOfVisibleButtons = 3;
  } else if (isMdBreakPoint && buttons.length > 4) {
    noOfVisibleButtons = 4;
  } else {
    noOfVisibleButtons = buttons.length;
  }
  menuItems = buttons.slice(noOfVisibleButtons);
  buttons = buttons.slice(0, noOfVisibleButtons);

  return (
    <React.Fragment>
      {/* <div className={classes.heroButtons}> */}
      <Grid container justifyContent="center">
        {buttons.map((button) => (
          <Grid item key={"grid_" + button.id}>
            {button.visible && (
              <Button
                className={button.hero ? classes.heroButton : classes.button}
                id={button.id}
                key={button.id}
                variant={button.variant}
                color={button.color}
                onClick={button.onClick}
                // type={button.type}
                // form={button.form}
                disabled={button.disabled}
                startIcon={button.startIcon}
              >
                {button.label}
              </Button>
            )}
          </Grid>
        ))}
        {/* Nur sichtbare zählen */}
        {menuItems.reduce(
          (counter, button) => (button.visible ? counter + 1 : counter),
          0
        ) > 0 && (
          <React.Fragment>
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleVertMoreClick}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>

            <Menu
              id="simple-menu"
              anchorEl={vertMoreAnchor}
              keepMounted
              open={Boolean(vertMoreAnchor)}
              onClose={handleVertMoreMenuClose}
            >
              {menuItems.map(
                (menuItem) =>
                  menuItem.visible && (
                    <MenuItem
                      key={menuItem.id}
                      onClick={() => onMenuItemClick(menuItem.onClick)}
                    >
                      {menuItem.label}
                    </MenuItem>
                  )
              )}
            </Menu>
          </React.Fragment>
        )}
        {buttonGroup && (
          <Grid item key={"grid_buttonGroup"}>
            <ButtonGroup
              id="buttonGroup"
              color="primary"
              className={classes.heroButton}
            >
              {buttonGroup.map((button) => (
                <Button
                  id={button.id}
                  key={button.id}
                  onClick={button.onClick}
                  disabled={button.disabled}
                >
                  {button.label}
                </Button>
              ))}
            </ButtonGroup>
          </Grid>
        )}
        {splitButtons && (
          <Grid item key={"grid_splitButton"}>
            <ButtonGroup
              className={classes.heroButton}
              variant="outlined"
              color="primary"
              ref={splitButtonAnchor}
            >
              <Button id="splitButton" onClick={handleSplitButtonClick}>
                {splitButtons[selectedSplitButtonIndex].label}
              </Button>
              <Button
                id="ButtonarrowDropDown"
                color="primary"
                size="small"
                aria-controls={
                  splitButtonMenuOpen ? "split-button-menu" : undefined
                }
                aria-expanded={splitButtonMenuOpen ? "true" : undefined}
                aria-haspopup="menu"
                onClick={handleSplitButtonToggle}
              >
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>
            <Popper
              open={splitButtonMenuOpen}
              anchorEl={splitButtonAnchor.current}
              role={undefined}
              transition
              // disablePortal
            >
              {({TransitionProps, placement}) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === "bottom" ? "center top" : "center bottom",
                  }}
                >
                  <Paper
                  // MenuProps={{
                  //   style: { zIndex: 35001 },
                  // }}
                  >
                    <ClickAwayListener onClickAway={handleSplitButtonMenuClose}>
                      <MenuList id="split-button-menu">
                        {splitButtons.map(
                          (button, index) =>
                            button.visible && (
                              <MenuItem
                                key={button.id}
                                selected={index === selectedSplitButtonIndex}
                                onClick={(event) =>
                                  handleSplitButtonMenuItemClick(event, index)
                                }
                                disabled={button.disabled}
                              >
                                {button.label}
                              </MenuItem>
                            )
                        )}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Grid>
        )}
      </Grid>
    </React.Fragment>
  );
};

export default ButtonRow;
