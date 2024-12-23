import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import Button from "@mui/material/Button";

import {
  REFRESH_APP_TEXT as TEXT_REFRESH_APP_TEXT,
  REFRESH_APP_TILE as TEXT_REFRESH_APP_TILE,
  CANCEL as TEXT_CANCEL,
  OK as TEXT_OK,
} from "../../constants/text";
import {Typography} from "@mui/material";

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
