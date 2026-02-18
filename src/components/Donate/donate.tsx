import React from "react";
import {compose} from "react-recompose";

import {
  Container,
  Stack,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import {
  DONATE as TEXT_DONATE,
  THANK_YOU_1000 as TEXT_THANK_YOU_1000,
  WHY_DONATE as TEXT_WHY_DONATE,
  NEED_A_RECEIPT as TEXT_NEED_A_RECEIPT,
  PLEASE_DONATE as TEXT_PLEASE_DONATE,
} from "../../constants/text";

import useCustomStyles from "../../constants/styles";

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
  const classes = useCustomStyles();

  if (!authUser) {
    return null;
  }

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_DONATE} subTitle={TEXT_THANK_YOU_1000} />
      {/* ===== BODY ===== */}
      <Container sx={classes.container} component="main" maxWidth="sm">
        <Card sx={classes.card} key={"cardInfo"}>
          <CardContent sx={classes.cardContent} key={"cardContentInfo"}>
            <Stack
              spacing={2}
              sx={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
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
              <Box
                component="img"
                src={
                  ImageRepository.getEnviromentRelatedPicture().TWINT_QR_CODE
                }
                sx={classes.cardMediaQrCode}
                style={{maxWidth: "100%", height: "auto"}}
              />
              <TwintButton />
            </Stack>
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
