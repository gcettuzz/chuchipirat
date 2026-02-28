import React, {SyntheticEvent} from "react";

import {
  Alert,
  AlertColor,
  Fade,
  Snackbar,
  SnackbarCloseReason,
} from "@mui/material";

import useCustomStyles from "../../constants/styles";

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
  severity: AlertColor;
  message: string;
}

interface CustomSnackbarProps {
  message: string;
  severity: AlertColor;
  snackbarOpen: boolean;
  handleClose: (
    event: Event | SyntheticEvent<Element, Event>,
    reason: SnackbarCloseReason
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
  const classes = useCustomStyles();

  const CustomAlert = (props) => {
    return <Alert elevation={6} {...props} />;
  };

  return (
    <Snackbar
      sx={classes.snackbar}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      open={snackbarOpen}
      onClose={handleClose}
      autoHideDuration={6000}
      TransitionComponent={Fade}
    >
      <div>
        <CustomAlert onClose={handleClose} severity={severity}>
          {message}
        </CustomAlert>
      </div>
    </Snackbar>
  );
}

export default CustomSnackbar;
