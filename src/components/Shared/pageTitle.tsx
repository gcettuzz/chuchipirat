import React from "react";

import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import useStyles from "../../constants/styles";
import { ValueObject } from "../Firebase/Db/firebase.db.super.class";

//FIXME:
interface PageTitleProps {
  title: string;
  smallTitle?: string;
  subTitle?: string;
  pictureSrc?: string;
  ribbon?: ValueObject;
}

// Seiten Titel
const PageTitle = ({
  title,
  smallTitle,
  subTitle,
  pictureSrc,
  ribbon,
}: PageTitleProps) => {
  const classes = useStyles();

  let boxStyle = {};
  if (pictureSrc) {
    boxStyle = {
      position: "sticky",
      overflow: "hidden",
      height: "25em",
      backgroundImage: `url(${pictureSrc})`,
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      verticalAlign: "middle",
      marginTop: "-1.4em",
    };
  }

  return (
    <React.Fragment>
      <Box component="span" display="block" style={boxStyle}>
        {ribbon && <Ribbon text={ribbon.text} cssProperty={ribbon.class} />}
      </Box>
      <div className={classes.heroContent}>
        {title && (
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="textPrimary"
            gutterBottom
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
            variant="h6"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            {subTitle}
          </Typography>
        )}
      </div>
    </React.Fragment>
  );
};

/* ===================================================================
// ============================== Ribbon =============================
// =================================================================== */
export const Ribbon = ({ text, cssProperty }) => {
  return <div className={cssProperty}>{text}</div>;
};
export default PageTitle;
