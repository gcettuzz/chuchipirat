import React from "react";
import { Color } from "@material-ui/lab";
import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Fade from "@material-ui/core/Fade";

import useStyles from "../../constants/styles";

export const SNACKBAR_INITIAL_STATE_VALUES = {
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
    return <MuiAlert elevation={6} {...props} />;
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
