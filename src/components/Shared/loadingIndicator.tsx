import React from "react";
import {Box, CircularProgress} from "@mui/material";

const LoadingIndicator = () => {
  return (
    <Box
      component="div"
      sx={{
        alignItems: "center",
        direction: "row",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
};
export default LoadingIndicator;
