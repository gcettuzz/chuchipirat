import React from "react";
import {
  PAGE_TITLE_500 as TEXT_PAGE_TITLE_500,
  PAGE_TEXT_1_500 as TEXT_PAGE_TEXT_1_500,
  PAGE_TEXT_2_500 as TEXT_PAGE_TEXT_2_500,
  PAGE_TEXT_3_500 as TEXT_PAGE_TEXT_3_500,
} from "../../constants/text";
import Typography from "@mui/material/Typography";
import {Container, Grid} from "@mui/material";
import {ImageRepository} from "../../constants/imageRepository";
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const ErrorInfo = () => {
  return (
    <React.Fragment>
      <Container component="main" maxWidth="sm">
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} style={{textAlign: "center"}}>
            <img
              src={ImageRepository.getEnviromentRelatedPicture().LANDING_LOGO}
              width="350em"
              alt="Logo"
            />
          </Grid>
          <Grid item xs={12} style={{textAlign: "center"}}>
            <Typography variant="h2" color="textSecondary" align="center">
              {TEXT_PAGE_TITLE_500}
            </Typography>
            <br />
            <Typography align="center">{TEXT_PAGE_TEXT_1_500}</Typography>
            <br />
            <Typography align="center">{TEXT_PAGE_TEXT_2_500}</Typography>
            <br />
            <Typography align="center">{TEXT_PAGE_TEXT_3_500}</Typography>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};
export default ErrorInfo;
