import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

import {
  REFRESH_APP_TEXT as TEXT_REFRESH_APP_TEXT,
  REFRESH_APP_TILE as TEXT_REFRESH_APP_TILE,
  CANCEL as TEXT_CANCEL,
  OK as TEXT_OK,
} from "../../constants/text";

/* ===================================================================
// ========================== Pop App Updaten ========================
// =================================================================== */
interface DialogRefreshAppProps {
  dialogOpen: boolean;
  handleOk: () => void;
  handleClose: () => void;
}
const DialogRefreshApp = ({
  dialogOpen,
  handleOk,
  handleClose,
}: DialogRefreshAppProps) => {
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialogRefreshApp"
    >
      <DialogTitle id="dialogAppRefresh">{TEXT_REFRESH_APP_TILE}</DialogTitle>
      <DialogContent>
        <Typography>{TEXT_REFRESH_APP_TEXT}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="outlined">
          {TEXT_CANCEL}
        </Button>
        <Button onClick={handleOk} color="primary" variant="contained">
          {TEXT_OK}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogRefreshApp;
