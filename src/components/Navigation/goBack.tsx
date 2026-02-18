import React from "react";
import Fab from "@mui/material/Fab";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import {useHistory} from "react-router";
import useCustomStyles from "../../constants/styles";

// ===================================================================
// ========================== GoBack Button ==========================
// ===================================================================
const GoBackFab = () => {
  const classes = useCustomStyles();
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
      sx={classes.goBackFabButton}
      onClick={onBack}
    >
      <ArrowBackIosIcon fontSize="small" sx={classes.goBackButtonIcon} />
    </Fab>
  );
};

export default GoBackFab;
