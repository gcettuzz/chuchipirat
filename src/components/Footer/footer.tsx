import React from "react";

import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

import useStyles from "../../constants/styles";

import {
  TERM_OF_USE as TEXT_TERM_OF_USE,
  APP_NAME as TEXT_APP_NAME,
  FOOTER_CREATED_WITH_JOY_OF_LIFE as TEXT_FOOTER_CREATED_WITH_JOY_OF_LIFE,
  VERSION as TEXT_VERSION,
  FOOTER_QUESTIONS_SUGGESTIONS as TEXT_FOOTER_QUESTIONS_SUGGESTIONS,
  PRIVACY_POLICY as TEXT_PRIVACY_POLICY,
} from "../../constants/text";
import * as DEFAULT_VALUES from "../../constants/defaultValues";
import {ImageRepository} from "../../constants/imageRepository";
import {
  TERM_OF_USE as ROUTE_TERM_OF_USE,
  PRIVACY_POLICY as ROUTE_PRIVACY_POLICY,
} from "../../constants/routes";
import {IconButton} from "@material-ui/core";
import {Instagram as IconInstagram} from "@material-ui/icons";
import packageJson from "../../../package.json";
import {useHistory} from "react-router";

const Footer = () => {
  const classes = useStyles();
  const {push} = useHistory();

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
            src={ImageRepository.getEnviromentRelatedPicture().DIVIDER_ICON_SRC}
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
            {TEXT_APP_NAME}
          </Typography>

          <Typography
            variant="subtitle1"
            color="textSecondary"
            align="center"
            gutterBottom
          >
            {TEXT_FOOTER_CREATED_WITH_JOY_OF_LIFE.part1}
            <Link href="https://jubla.ch">
              {TEXT_FOOTER_CREATED_WITH_JOY_OF_LIFE.linkText}
            </Link>
            {TEXT_FOOTER_CREATED_WITH_JOY_OF_LIFE.part2}
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="textSecondary"
            component="p"
            gutterBottom
          >
            {TEXT_VERSION}{" "}
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
            <strong>{TEXT_FOOTER_QUESTIONS_SUGGESTIONS.TITLE}</strong> <br />
            {TEXT_FOOTER_QUESTIONS_SUGGESTIONS.CONTACTHERE}{" "}
            <Link href={`mailto:${DEFAULT_VALUES.MAILADDRESS}`}>
              {DEFAULT_VALUES.MAILADDRESS}
            </Link>
            <br />
            {TEXT_FOOTER_QUESTIONS_SUGGESTIONS.OR_LOOK_HERE}
            <Link
              href={DEFAULT_VALUES.HELPCENTER_URL}
              target="_blank"
              rel="noopener"
            >
              {TEXT_FOOTER_QUESTIONS_SUGGESTIONS.HELPCENTER}
            </Link>
            {TEXT_FOOTER_QUESTIONS_SUGGESTIONS.OVER}
            <br />
            <br />
            <Link
              onClick={() => {
                push({pathname: ROUTE_TERM_OF_USE});
              }}
            >
              {TEXT_TERM_OF_USE}
            </Link>
            {" | "}
            <Link
              onClick={() => {
                push({pathname: ROUTE_PRIVACY_POLICY});
              }}
            >
              {TEXT_PRIVACY_POLICY}
            </Link>
          </Typography>
        </Grid>
        <Grid>
          <IconButton
            size="small"
            onClick={onOpenInstagram}
            aria-label="Instagramm"
          >
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
          {TEXT_APP_NAME}
        </Link>{" "}
        {new Date().getFullYear()}
        {"."}
      </Typography>
    </React.Fragment>
  );
};
