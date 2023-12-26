import React, { useReducer } from "react";
import { compose } from "recompose";
import { useHistory } from "react-router";

import useStyles from "../../constants/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";

import PageTitle from "../Shared/pageTitle";

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";
import * as ROUTES from "../../constants/routes";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const OverviewEventsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <OverviewEventsBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const OverviewEventsBase = ({ props, authUser }) => {
  const classes = useStyles();
  const { push } = useHistory();

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={"NOT Implemented yet"}
        // subTitle={TEXT.PAGE_SUBTITLE_ADMIN}
      />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="md">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}></Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(OverviewEventsPage);
