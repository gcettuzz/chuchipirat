import React from "react";
import {
  PAGE_TITLE_404 as TEXT_PAGE_TITLE_404,
  PAGE_SUBTITLE_404 as TEXT_PAGE_SUBTITLE_404,
} from "../../constants/text";
import Typography from "@material-ui/core/Typography";
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const NotFound = () => {
  return (
    <React.Fragment>
      <Typography variant="h1" color="textSecondary" align="center">
        {TEXT_PAGE_TITLE_404}
      </Typography>
      <Typography variant="h6" color="textSecondary" align="center">
        {TEXT_PAGE_SUBTITLE_404}
      </Typography>
    </React.Fragment>
  );
};
export default NotFound;
