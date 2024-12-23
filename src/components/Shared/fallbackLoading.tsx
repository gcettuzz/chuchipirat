import React from "react";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import useStyles from "../../constants/styles";

/* ===================================================================
// ======================= Ladeanzeige für Seite =====================
// =================================================================== */
const FallbackLoading = () => {
  const classes = useStyles();

  return (
    <Backdrop className={classes.backdrop} open={true}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default FallbackLoading;
