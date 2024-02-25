import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import Button from "@material-ui/core/Button";

import {
  REFRESH_APP_TEXT as TEXT_REFRESH_APP_TEXT,
  REFRESH_APP_TILE as TEXT_REFRESH_APP_TILE,
  CANCEL as TEXT_CANCEL,
  OK as TEXT_OK,
} from "../../constants/text";
import {Typography} from "@material-ui/core";

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
