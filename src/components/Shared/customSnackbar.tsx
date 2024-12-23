import React from "react";
import {Color} from "@mui/lab";

import {Alert} from "@mui/lab";
import Snackbar from "@mui/material/Snackbar";
import Fade from "@mui/material/Fade";

import useStyles from "../../constants/styles";

export const SNACKBAR_INITIAL_STATE_VALUES: Snackbar = {
  open: false,
  severity: "success",
  message: "",
};

/**
 * Interface für Reducer als Snackbar
 */
export interface Snackbar {
  open: boolean;
  severity: Color;
  message: string;
}

interface CustomSnackbarProps {
  message: string;
  severity: Color;
  snackbarOpen: boolean;
  handleClose: (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => void;
}
/* ===================================================================
// ============================== Snackbar ===========================
// =================================================================== */
function CustomSnackbar({
  message,
  severity,
  snackbarOpen,
  handleClose,
}: CustomSnackbarProps) {
  const classes = useStyles();

  const Alert = (props) => {
    return <Alert elevation={6} {...props} />;
  };

  return (
    <Snackbar
      className={classes.snackbar}
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
