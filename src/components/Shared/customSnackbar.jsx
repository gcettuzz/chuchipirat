import React from "react";

import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Fade from "@material-ui/core/Fade";

import useStyles from "../../constants/styles";

export const SNACKBAR_INITIAL_STATE_VALUES = {
  open: false,
  severity: "success",
  message: "",
};

function CustomSnackbar({ message, severity, snackbarOpen, handleClose }) {
  const classes = useStyles();

  const Alert = (props) => {
    return <MuiAlert elevation={6} {...props} />;
  };

  return (
    <Snackbar
      className={classes.Snackbar}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      open={snackbarOpen}
      onClose={handleClose}
      autoHideDuration={6000}
      TransitionComponent={Fade}
    >
      <Alert onClose={handleClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default CustomSnackbar;
