import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";

import Button from "@material-ui/core/Button";

import * as TEXT from "../../constants/text";
import { Typography } from "@material-ui/core";

/* ===================================================================
// ========================== Pop App Updaten ========================
// =================================================================== */
const DialogRefreshApp = ({ dialogOpen, handleOk, handleClose }) => {
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialogRefreshApp"
    >
      <DialogTitle id="dialogAppRefresh">
        {TEXT.DIALOG_REFRESH_APP_TILE}
      </DialogTitle>
      <DialogContent>
        <Typography>{TEXT.DIALOG_REFRESH_APP_TEXT}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="outlined">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button onClick={handleOk} color="primary" variant="contained">
          {TEXT.BUTTON_OK}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogRefreshApp;
