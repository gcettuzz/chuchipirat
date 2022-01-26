import React from "react";

import Fab from "@material-ui/core/Fab";
import useStyles from "../../constants/styles";

import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { useHistory, useLocation } from "react-router";

// ===================================================================
// ========================== GoBack Button ==========================
// ===================================================================
const GoBackFab = (props) => {
  const classes = useStyles();
  const history = useHistory();
  /* ------------------------------------------
  // zurück navigieren
  // ------------------------------------------ */
  const onBack = () => {
    history.goBack();
  };

  return (
    <Fab
      component="span"
      size="small"
      color="primary"
      aria-label="back"
      className={classes.goBackFabButton}
      onClick={onBack}
    >
      <ArrowBackIosIcon fontSize="small" className={classes.goBackButtonIcon} />
    </Fab>
  );
};

export default GoBackFab;
