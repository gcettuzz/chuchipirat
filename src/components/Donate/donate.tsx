import React from "react";
import {compose} from "react-recompose";

import {Container, Grid, Card, CardContent, Typography} from "@mui/material";

import {
  DONATE as TEXT_DONATE,
  THANK_YOU_1000 as TEXT_THANK_YOU_1000,
  WHY_DONATE as TEXT_WHY_DONATE,
  NEED_A_RECEIPT as TEXT_NEED_A_RECEIPT,
  PLEASE_DONATE as TEXT_PLEASE_DONATE,
} from "../../constants/text";

import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../Shared/global.interface";
import {TwintButton} from "../Event/Event/createNewEvent";
import {ImageRepository} from "../../constants/imageRepository";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const DonatePage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <DonateBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const DonateBase: React.FC<CustomRouterProps & {authUser: AuthUser | null}> = ({
  authUser,
}) => {
  const classes = useStyles();

  if (!authUser) {
    return null;
  }

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_DONATE} subTitle={TEXT_THANK_YOU_1000} />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Card className={classes.card} key={"cardInfo"}>
          <CardContent className={classes.cardContent} key={"cardContentInfo"}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>
                  <strong>{TEXT_PLEASE_DONATE}</strong>
                  <br />
                  {TEXT_WHY_DONATE}
                  <br />
                  {TEXT_NEED_A_RECEIPT}
                  <br />
                  <br />
                  {TEXT_THANK_YOU_1000}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Grid container justifyContent="center">
                  <img
                    src={
                      ImageRepository.getEnviromentRelatedPicture()
                        .TWINT_QR_CODE
                    }
                    className={classes.cardMediaQrCode}
                    style={{maxWidth: "100%", height: "auto"}}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container justifyContent="center">
                  <TwintButton />
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </React.Fragment>
  );
};

const condition = (authUser: AuthUser | null) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition)
)(DonatePage);
