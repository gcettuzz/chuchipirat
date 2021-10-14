import React from "react";

import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

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
