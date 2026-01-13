import React from "react";

import Typography from "@mui/material/Typography";
import {ValueObject} from "../Firebase/Db/firebase.db.super.class";
import useCustomStyles from "../../constants/styles";
import {Box} from "@mui/material";

/**
 * PageTitle-Eingenschaften
 * @param title - Seitentitel
 * @param smallTitle - Seitentitel klein
 * @param subTitle - Untertitel
 * @param pictureSrc - URL für Bild
 * @param ribbon - JSX-Element -> Ribbon
 */
interface PageTitleProps {
  title?: string;
  smallTitle?: string;
  subTitle?: string;
  windowTitle?: string;
  ribbon?: ValueObject;
}

/* =====================================================================
/**
 * Standard Seitentitel
 * @param object --> PageTitleProps 
 * @returns JSX-Element
 */
const PageTitle = ({
  title,
  smallTitle,
  subTitle,
  windowTitle,
  ribbon,
}: PageTitleProps) => {
  const classes = useCustomStyles();

  window.document.title = windowTitle
    ? windowTitle
    : title
    ? title
    : smallTitle
    ? smallTitle
    : "";

  return (
    <React.Fragment>
      {ribbon && <Ribbon text={ribbon.text} cssProperty={ribbon.class} />}
      <Box component="div" sx={classes.heroContent}>
        {title && (
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="textPrimary"
          >
            {title}
          </Typography>
        )}
        {smallTitle && (
          <Typography
            component="h1"
            variant="h5"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            {smallTitle}
          </Typography>
        )}
        {subTitle && (
          <Typography
            component="h2"
            variant="h5"
            align="center"
            color="textSecondary"
            gutterBottom
          >
            {subTitle}
          </Typography>
        )}
      </Box>
    </React.Fragment>
  );
};

/* ===================================================================
// ============================== Ribbon =============================
// =================================================================== */
interface RibbonProps {
  text: string;
  cssProperty: string;
}
export const Ribbon = ({text, cssProperty}: RibbonProps) => {
  return <div className={cssProperty}>{text}</div>;
};
export default PageTitle;
