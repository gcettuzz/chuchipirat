import React from "react";

import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

import useStyles from "../../constants/styles";

import * as TEXT from "../../constants/text";
import * as DEFAULT_VALUES from "../../constants/defaultValues";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";
import {Container, IconButton} from "@material-ui/core";
import {Instagram as IconInstagram} from "@material-ui/icons";

const packageJson = require("../../../package.json");

const Footer = () => {
  const classes = useStyles();

  const onOpenInstagram = () => {
    window.open(DEFAULT_VALUES.INSTAGRAM_URL, "_blank");
  };

  return (
    <footer>
      <Grid container justifyContent="center" alignItems="center" spacing={4}>
        <Grid item xs={2} />
        <Grid item xs={3}>
          <Divider
            className={classes.mediumDivider}
            key={"footerDividerLeft"}
          />
        </Grid>
        <Grid item container justifyContent="center" xs={2}>
          <img
            className={classes.marginCenter}
            src={
              IMAGE_REPOSITORY.getEnviromentRelatedPicture().DIVIDER_ICON_SRC
            }
            alt=""
            // align="center"
            width="50px"
          />
        </Grid>
        <Grid item xs={3}>
          <Divider
            className={classes.mediumDivider}
            key={"footerDividerRight"}
          />
        </Grid>
        <Grid item xs={2} />

        <Grid item xs={12}>
          <Typography variant="h6" align="center" gutterBottom>
            {TEXT.APP_NAME}
          </Typography>

          <Typography
            variant="subtitle1"
            color="textSecondary"
            align="center"
            gutterBottom
          >
            {TEXT.FOOTER_CREATED_WITH_JOY_OF_LIFE.part1}
            <Link href="https://jubla.ch">
              {TEXT.FOOTER_CREATED_WITH_JOY_OF_LIFE.linkText}
            </Link>
            {TEXT.FOOTER_CREATED_WITH_JOY_OF_LIFE.part2}
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="textSecondary"
            component="p"
            gutterBottom
          >
            {TEXT.VERSION}{" "}
            <Link href="https://github.com/gcettuzz/chuchipirat">
              {packageJson.version}
            </Link>
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            gutterBottom
          >
            <strong>{TEXT.FOOTER_QUESTIONS_SUGGESTIONS.TITLE}</strong> <br />
            {TEXT.FOOTER_QUESTIONS_SUGGESTIONS.CONTACTHERE}{" "}
            <Link href={`mailto:${DEFAULT_VALUES.MAILADDRESS}`}>
              {DEFAULT_VALUES.MAILADDRESS}
            </Link>
            <br />
            {TEXT.FOOTER_QUESTIONS_SUGGESTIONS.OR_LOOK_HERE}
            <Link
              href={DEFAULT_VALUES.HELPCENTER_URL}
              target="_blank"
              rel="noopener"
            >
              {TEXT.FOOTER_QUESTIONS_SUGGESTIONS.HELPCENTER}
            </Link>{" "}
            {TEXT.FOOTER_QUESTIONS_SUGGESTIONS.OVER}
          </Typography>
        </Grid>
        <Grid>
          <IconButton size="small" onClick={onOpenInstagram}>
            <IconInstagram />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <Copyright />
          <br />
        </Grid>
      </Grid>
    </footer>
  );
};

export default Footer;

export const Copyright = () => {
  return (
    <React.Fragment>
      <Typography variant="body2" color="textSecondary" align="center">
        {"Copyright © "}
        <Link color="inherit" href="https://chuchipirat.ch/">
          {TEXT.APP_NAME}
        </Link>{" "}
        {new Date().getFullYear()}
        {"."}
      </Typography>

      {/* FIXME: Datenschutzrichtlinien */}
    </React.Fragment>
  );
};
