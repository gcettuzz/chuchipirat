import React from "react";

import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import useStyles from "../../constants/styles";

// Seiten Titel
const PageTitle = ({ title, smallTitle, subTitle, pictureSrc }) => {
  const classes = useStyles();

  let boxStyle = {};
  if (pictureSrc) {
    boxStyle = {
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
      <Box component="span" display="block" style={boxStyle} />
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

export default PageTitle;
