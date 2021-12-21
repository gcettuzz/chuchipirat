import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";

import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

import useStyles from "../../constants/styles";

/* ===================================================================
// ============================= Button Row ==========================
// =================================================================== */
/*der Importparamter *buttons* muss ein Array sein, mit Objekten
{
  id:
  label:
  variant:
  color:
  onClick:
  type:
  form:
  disabled
  visible
}
*/

// https://stackoverflow.com/questions/40881616/how-to-submit-the-form-by-material-ui-dialog-using-reactjs
const ButtonRow = ({ buttons, buttonGroup, splitButtons }) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleClick = () => {
    splitButtons[selectedIndex].onClick();
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    // und gleich ausführen
    splitButtons[index].onClick();
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };
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
                type={button.type}
                form={button.form}
                disabled={button.disabled}
              >
                {button.label}
              </Button>
            )}
          </Grid>
        ))}
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
              ref={anchorRef}
            >
              <Button id="splitButton" onClick={handleClick}>
                {splitButtons[selectedIndex].label}
              </Button>
              <Button
                id="ButtonarrowDropDown"
                color="primary"
                size="small"
                aria-controls={open ? "split-button-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="menu"
                onClick={handleToggle}
              >
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>
            <Popper
              open={open}
              anchorEl={anchorRef.current}
              role={undefined}
              transition
              // disablePortal
            >
              {({ TransitionProps, placement }) => (
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
                    <ClickAwayListener onClickAway={handleClose}>
                      <MenuList id="split-button-menu">
                        {splitButtons.map((button, index) => (
                          <MenuItem
                            key={button.id}
                            selected={index === selectedIndex}
                            onClick={(event) =>
                              handleMenuItemClick(event, index)
                            }
                          >
                            {button.label}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Grid>
        )}
      </Grid>

      {/* </div> */}
    </React.Fragment>
  );
};

export default ButtonRow;
