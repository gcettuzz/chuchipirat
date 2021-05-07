import React, { useReducer } from "react";
import { compose } from "recompose";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import Feed from "../Shared/feed.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const REDUCER_ACTIONS = {
  X: "X",
  SNACKBAR_CLOSE: "SNACKBAR_CLOSE",
  GENERIC_ERROR: "GENERIC_ERROR",
};

const whereUsedReducer = (state, action) => {
  switch (action.type) {
    case REDUCER_ACTIONS.X:
      return {
        ...state,
        deleteFeeds: { ...state.deleteFeeds, dayOffset: action.payload },
      };

    case REDUCER_ACTIONS.GENERIC_ERROR:
      // Allgemeiner Fehler
      return {
        ...state,
        isError: true,
        error: action.payload,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const WhereUsedPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <WhereUsedBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const WhereUsedBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [whereUsed, dispatchWhereUsed] = React.useReducer(whereUsedReducer, {
    data: {},
    isError: false,
    isLoading: false,
    error: {},
    snackbar: { open: false, severity: "success", message: "" },
  });

  /* ------------------------------------------
  // Snackbar schliessen
  // ------------------------------------------ */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatchWhereUsed({
      type: REDUCER_ACTIONS.SNACKBAR_CLOSE,
    });
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle
        title={"TEXT.PAGE_TITLE_ADMIN"}
        subTitle={"TEXT.PAGE_SUBTITLE_ADMIN"}
      />
      {/* <ButtonRow
        key="buttons_edit"
        buttons={[
          {
            id: "edit",
            hero: true,
            visible:
              !editMode &&
              (authUser.roles.includes(ROLES.SUB_ADMIN) ||
                authUser.roles.includes(ROLES.ADMIN)),
            label: TEXT.BUTTON_EDIT,
            variant: "contained",
            color: "primary",
            onClick: toggleEditMode,
          },
        ]} */}
      {/* /> */}
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        {/* <Backdrop className={classes.backdrop} open={x.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop> */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}></Grid>
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
)(WhereUsedPage);
