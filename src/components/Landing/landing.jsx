import React from "react";
import { useHistory } from "react-router";

import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import { Divider, makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import * as ROUTES from "../../constants/routes";
import * as TEXT from "../../constants/text";
import * as IMAGE_REPOSITORY from "../../constants/imageRepository";
import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";

import { AuthUserContext } from "../Session";

/* ===================================================================
// ================================ Page =============================
// =================================================================== */
const LandingPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <LandingBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

/* ===================================================================
// ================================ Base =============================
// =================================================================== */
const LandingBase = ({ props, authUser }) => {
  const classes = useStyles();
  const { push } = useHistory();

  // Wenn angemeldet direkt weiterleiten
  if (authUser) {
    props.history.push(ROUTES.HOME);
  }

  /* ------------------------------------------
  // Klick auf Button --> Ziel = ID des Buttons
  // ------------------------------------------ */
  const onButtonClick = (event) => {
    push({
      pathname: ROUTES[event.currentTarget.id],
    });
  };
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT.APP_NAME} subTitle={TEXT.APP_CLAIM} />
      <ButtonRow
        key="buttons_head"
        buttons={[
          {
            id: "SIGN_IN",
            hero: true,
            visible: true,
            label: TEXT.BUTTON_SIGN_IN,
            variant: "contained",
            color: "primary",
            onClick: onButtonClick,
          },
          {
            id: "SIGN_UP",
            hero: true,
            visible: true,
            label: TEXT.BUTTON_SIGN_UP,
            variant: "outlined",
            color: "primary",
            onClick: onButtonClick,
          },
        ]}
      />

      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
        <Grid container spacing={4}>
          <Grid item align="center" xs={12}>
            <img
              src={IMAGE_REPOSITORY.getEnviromentRelatedPicture().LANDING_LOGO}
              width="350em"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" component="h2">
              {TEXT.LANDING_LEAD_TEXT}
            </Typography>
          </Grid>
          {/* Rezepte */}
          <Grid item xs={12} md={6}>
            <Typography>
              <strong>{TEXT.LANDING_RECIPES_BLOCK_TITLE}</strong>
              <br />
              {TEXT.LANDING_RECIPES_BLOCK_TEXT}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <ImageCard />
          </Grid>
          <Grid item xs={12}>
            <Divider color="primary" />
          </Grid>
          {/* Menüplan */}
          <Grid item xs={12} md={6}>
            <ImageCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography>
              <strong>{TEXT.LANDING_MENUPLAN_TITLE}</strong>
              <br />
              {TEXT.LANDING_MENUPLAN_TEXT}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider color="primary" />
          </Grid>
          {/* Skalierung */}
          <Grid item xs={12} md={6}>
            <Typography>
              <strong>{TEXT.LANDING_SCALING_TITLE}</strong>
              <br />
              {TEXT.LANDING_SCALING_TEXT}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <ImageCard />
          </Grid>
          <Grid item xs={12}>
            <Divider color="primary" />
          </Grid>
          {/* Einkaufen */}
          <Grid item xs={12} md={6}>
            <Typography>
              <strong>{TEXT.LANDING_SHOPPINGLIST_TITLE}</strong>
              <br />
              {TEXT.LANDING_SHOPPINGLIST_TEXT}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <ImageCard />
          </Grid>
          <Grid item xs={12}>
            <Divider color="primary" />
          </Grid>
          {/* Social */}
          <Grid item xs={12} md={6}>
            <Typography>
              <strong>{TEXT.LANDING_SOCIAL_TITLE}</strong>
              <br />
              {TEXT.LANDING_SOCIAL_TEXT}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <ImageCard />
          </Grid>
          <Grid item xs={12}>
            <Divider color="primary" />
          </Grid>
          {/* Offline */}
          <Grid item xs={12} md={6}>
            <ImageCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography>
              <strong>{TEXT.LANDING_OFFLINE_TITLE}</strong>
              <br />
              {TEXT.LANDING_OFFLINE_TEXT}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

const ImageCard = () => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          Platzhalter
        </Typography>
      </CardContent>
    </Card>
  );
};

export default LandingPage;
