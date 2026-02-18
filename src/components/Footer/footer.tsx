import React from "react";

import Link from "@mui/material/Link";
import Grid from "@mui/material/Unstable_Grid2";

import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

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
import {Box, Container, IconButton} from "@mui/material";
import {Instagram as IconInstagram} from "@mui/icons-material";
import packageJson from "../../../package.json";
import {useHistory} from "react-router";
import useCustomStyles from "../../constants/styles";

const Footer = () => {
  const classes = useCustomStyles();
  const {push} = useHistory();

  const onOpenInstagram = () => {
    window.open(DEFAULT_VALUES.INSTAGRAM_URL, "_blank");
  };

  return (
    <footer>
      <Container sx={classes.container}>
        <Grid container justifyContent="center" alignItems="center" spacing={4}>
          <Grid xs={2} />
          <Grid xs={3}>
            <Divider sx={classes.mediumDivider} key={"footerDividerLeft"} />
          </Grid>
          <Grid container justifyContent="center" xs={2}>
            <Box
              component="img"
              src={
                ImageRepository.getEnviromentRelatedPicture().VECTOR_LOGO_GREY
              }
              alt=""
              width="50px"
            />
          </Grid>
          <Grid xs={3}>
            <Divider sx={classes.mediumDivider} key={"footerDividerRight"} />
          </Grid>
          <Grid xs={2} />

          <Grid xs={12}>
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
              <Link href="https://jubla.ch" target="_blank">
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
              <Link
                href="https://github.com/gcettuzz/chuchipirat"
                target="_blank"
              >
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
              <Link
                href={`mailto:${DEFAULT_VALUES.MAILADDRESS}`}
                target="_blank"
              >
                {DEFAULT_VALUES.MAILADDRESS}
              </Link>
              <br />
              {TEXT_FOOTER_QUESTIONS_SUGGESTIONS.OR_LOOK_HERE}{" "}
              <Link
                href={DEFAULT_VALUES.HELPCENTER_URL}
                target="_blank"
                rel="noopener"
              >
                {TEXT_FOOTER_QUESTIONS_SUGGESTIONS.HELPCENTER}
              </Link>{" "}
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
          <Grid xs={12}>
            <Copyright />
            <br />
          </Grid>
        </Grid>
      </Container>
    </footer>
  );
};

export default Footer;

export const Copyright = () => {
  return (
    <React.Fragment>
      <Typography variant="body2" color="textSecondary" align="center">
        {"Copyright © "}
        <Link color="inherit" href="https://chuchipirat.ch/" target="_blank">
          {TEXT_APP_NAME}
        </Link>{" "}
        {new Date().getFullYear()}
        {"."}
      </Typography>
    </React.Fragment>
  );
};
