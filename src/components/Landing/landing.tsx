import React from "react";
import {useHistory} from "react-router";

import {Container, Grid, Card, Typography, CardMedia} from "@material-ui/core";

import {
  SIGN_IN as ROUTE_SIGN_IN,
  SIGN_UP as ROUTE_SIGN_UP,
} from "../../constants/routes";
import {
  APP_NAME as TEXT_APP_NAME,
  APP_CLAIM as TEXT_APP_CLAIM,
  SIGN_IN as TEXT_SIGN_IN,
  SIGN_UP as TEXT_SIGN_UP,
  LANDING_LEAD_TEXT as TEXT_LANDING_LEAD_TEXT,
  LANDING_RECIPES_BLOCK_TITLE as TEXT_LANDING_RECIPES_BLOCK_TITLE,
  LANDING_RECIPES_BLOCK_TEXT as TEXT_LANDING_RECIPES_BLOCK_TEXT,
  LANDING_GROUP_CONFIG_TITLE as TEXT_LANDING_GROUP_CONFIG_TITLE,
  LANDING_GROUP_CONFIG_TEXT as TEXT_LANDING_GROUP_CONFIG_TEXT,
  LANDING_GROUP_SIZE_TITLE as TEXT_LANDING_GROUP_SIZE_TITLE,
  LANDING_GROUP_SIZE_TEXT as TEXT_LANDING_GROUP_SIZE_TEXT,
  LANDING_MENUPLAN_TITLE as TEXT_LANDING_MENUPLAN_TITLE,
  LANDING_MENUPLAN_TEXT as TEXT_LANDING_MENUPLAN_TEXT,
  LANDING_SCALING_TITLE as TEXT_LANDING_SCALING_TITLE,
  LANDING_SCALING_TEXT as TEXT_LANDING_SCALING_TEXT,
  LANDING_SHOPPINGLIST_TITLE as TEXT_LANDING_SHOPPINGLIST_TITLE,
  LANDING_SHOPPINGLIST_TEXT as TEXT_LANDING_SHOPPINGLIST_TEXT,
  LANDING_SOCIAL_TITLE as TEXT_LANDING_SOCIAL_TITLE,
  LANDING_SOCIAL_TEXT as TEXT_LANDING_SOCIAL_TEXT,
  LANDING_OFFLINE_TITLE as TEXT_LANDING_OFFLINE_TITLE,
  LANDING_OFFLINE_TEXT as TEXT_LANDING_OFFLINE_TEXT,
  LOVE_TO_COOK as TEXT_LOVE_TO_COOK,
} from "../../constants/text";

import {ImageRepository} from "../../constants/imageRepository";
import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import ButtonRow from "../Shared/buttonRow";
import {HOME as ROUTE_HOME} from "../../constants/routes";
import {AuthUserContext} from "../Session/authUserContext";
import {CustomRouterProps} from "../Shared/global.interface";
import AuthUser from "../Firebase/Authentication/authUser.class";

/* ===================================================================
// ================================ Page =============================
// =================================================================== */
const LandingPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <LandingBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

/* ===================================================================
// ================================ Base =============================
// =================================================================== */
const LandingBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser}) => {
  const classes = useStyles();
  const {push} = useHistory();

  // Wenn angemeldet direkt weiterleiten
  if (authUser) {
    push({pathname: ROUTE_HOME});
  }
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_APP_NAME} subTitle={TEXT_APP_CLAIM} />
      <ButtonRow
        key="buttons_head"
        buttons={[
          {
            id: "SIGN_IN",
            hero: true,
            visible: true,
            label: TEXT_SIGN_IN,
            variant: "contained",
            color: "primary",
            onClick: () => {
              push({pathname: ROUTE_SIGN_IN});
            },
          },
          {
            id: "SIGN_UP",
            hero: true,
            visible: true,
            label: TEXT_SIGN_UP,
            variant: "outlined",
            color: "primary",
            onClick: () => {
              push({pathname: ROUTE_SIGN_UP});
            },
          },
        ]}
      />

      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} style={{textAlign: "center"}}>
            <img
              src={ImageRepository.getEnviromentRelatedPicture().LANDING_LOGO}
              width="350em"
              alt="Logo"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" component="h2">
              {TEXT_LANDING_LEAD_TEXT}
            </Typography>
            <br />
            <Typography variant="subtitle1">{TEXT_LOVE_TO_COOK}</Typography>
          </Grid>
          {/* Rezepte */}
          <Grid item xs={12}>
            <Typography>
              <strong>{TEXT_LANDING_RECIPES_BLOCK_TITLE}</strong>
              <br />
              {TEXT_LANDING_RECIPES_BLOCK_TEXT}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <ImageCard
              url={
                ImageRepository.getLandingPageEnviromentRelatedPicture().recipes
              }
            />
          </Grid>
          {/* Gruppen-Config */}
          <Grid item xs={12}>
            <Typography>
              <strong>{TEXT_LANDING_GROUP_CONFIG_TITLE}</strong>
              <br />
              {TEXT_LANDING_GROUP_CONFIG_TEXT}
            </Typography>
          </Grid>

          {/* Gruppengrösse */}
          <Grid item xs={12}>
            <Typography>
              <strong>{TEXT_LANDING_GROUP_SIZE_TITLE}</strong>
              <br />
              {TEXT_LANDING_GROUP_SIZE_TEXT}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <ImageCard
              url={
                ImageRepository.getLandingPageEnviromentRelatedPicture()
                  .groupconfig
              }
            />
          </Grid>

          {/* Menüplan */}
          <Grid item xs={12}>
            <Typography>
              <strong>{TEXT_LANDING_MENUPLAN_TITLE}</strong>
              <br />
              {TEXT_LANDING_MENUPLAN_TEXT}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <ImageCard
              url={
                ImageRepository.getLandingPageEnviromentRelatedPicture()
                  .menuplan
              }
            />
          </Grid>
          {/* <Grid item xs={12}>
            <Divider color="primary" />
          </Grid> */}
          {/* Skalierung */}
          <Grid item xs={12}>
            <Typography>
              <strong>{TEXT_LANDING_SCALING_TITLE}</strong>
              <br />
              {TEXT_LANDING_SCALING_TEXT}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <ImageCard
              url={
                ImageRepository.getLandingPageEnviromentRelatedPicture().scaling
              }
            />
          </Grid>
          {/* <Grid item xs={12}>
            <Divider color="primary" />
          </Grid> */}
          {/* Einkaufen */}
          <Grid item xs={12}>
            <Typography>
              <strong>{TEXT_LANDING_SHOPPINGLIST_TITLE}</strong>
              <br />
              {TEXT_LANDING_SHOPPINGLIST_TEXT}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <ImageCard
              url={
                ImageRepository.getLandingPageEnviromentRelatedPicture()
                  .shoppinglist
              }
            />
          </Grid>
          {/* <Grid item xs={12}>
            <Divider color="primary" />
          </Grid> */}
          {/* Social */}
          <Grid item xs={12}>
            <Typography>
              <strong>{TEXT_LANDING_SOCIAL_TITLE}</strong>
              <br />
              {TEXT_LANDING_SOCIAL_TEXT}
            </Typography>
          </Grid>
          {/* <Grid item xs={12}>
            <Divider color="primary" />
          </Grid> */}
          {/* Offline */}

          <Grid item xs={12}>
            <Typography>
              <strong>{TEXT_LANDING_OFFLINE_TITLE}</strong>
              <br />
              {TEXT_LANDING_OFFLINE_TEXT}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};
interface ImageCardProps {
  url: string;
}
const ImageCard = ({url}: ImageCardProps) => {
  return (
    <Card style={{display: "flex", flexDirection: "column", height: "100%"}}>
      <CardMedia
        style={{
          width: "100%",
          height: "100%",
          // paddingTop: "56.25%", // 16:9
          paddingTop: "75%", // Hier anpassen, um das gewünschte Seitenverhältnis zu erreichen
          backgroundPosition: "top",
          flexGrow: 1,
          objectFit: "cover",
        }}
        image={url}
      />
    </Card>
  );
};

export default LandingPage;
