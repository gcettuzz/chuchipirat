import React from "react";
import {compose} from "react-recompose";
// import {useHistory} from "react-router";

import useStyles from "../../constants/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import PageTitle from "../Shared/pageTitle";

import Role from "../../constants/roles";

import {withFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {CustomRouterProps} from "../Shared/global.interface";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const OverviewEventsPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <OverviewEventsBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const OverviewEventsBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;

  const classes = useStyles();
  // const {push} = useHistory();

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

// const condition = (authUser) => !!authUser.roles.includes(Role.admin);

// export default compose(
//   withAuthorization(condition),
//   withFirebase
// )(OverviewEventsPage);
const condition = (authUser: AuthUser | null) =>
  !!authUser &&
  (!!authUser.roles.includes(Role.admin) ||
    !!authUser.roles.includes(Role.communityLeader));

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(OverviewEventsPage);
