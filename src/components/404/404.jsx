import React from "react";
import * as TEXT from "../../constants/text";
import Typography from "@material-ui/core/Typography";

const NotFound = () => (
  <React.Fragment>
    <Typography variant="h1" color="textSecondary" align="center">
      {TEXT.PAGE_TITLE_404}
    </Typography>
    <Typography variant="h6" color="textSecondary" align="center">
      {TEXT.PAGE_SUBTITLE_404}
    </Typography>
  </React.Fragment>
);

export default NotFound;
