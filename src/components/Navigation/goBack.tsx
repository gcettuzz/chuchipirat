import React from "react";
import Fab from "@mui/material/Fab";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import {useNavigate} from "react-router";
import useCustomStyles from "../../constants/styles";

// ===================================================================
// ========================== GoBack Button ==========================
// ===================================================================
const GoBackFab = () => {
  const classes = useCustomStyles();
  const navigate = useNavigate();
  /* ------------------------------------------
  // zurück navigieren
  // ------------------------------------------ */
  const onBack = () => {
    navigate(-1);
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
