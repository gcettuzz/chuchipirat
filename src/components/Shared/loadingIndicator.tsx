import React from "react";
import Grid from "@mui/material/Grid";

import CircularProgress from "@mui/material/CircularProgress";

import useStyles from "../../constants/styles";

const LoadingIndicator = () => {
  const classes = useStyles();
  return (
    <Grid container alignItems="center" direction="row">
      <Grid item container justifyContent="center" alignItems="center" xs={12}>
        <CircularProgress className={classes.margin} />
      </Grid>
    </Grid>
  );
};
export default LoadingIndicator;
