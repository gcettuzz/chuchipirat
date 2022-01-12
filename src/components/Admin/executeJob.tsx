import React, { useReducer } from "react";
import { compose } from "recompose";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
// import TextField from "@material-ui/core/TextField";
// import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";

// import LinearProgress from "@material-ui/core/LinearProgress";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import { restructureRecipeDocuments } from "../../jobs/restructureDocuments";

// import Feeds from "../Shared/feed.class";
import useStyles from "../../constants/styles";

// import DialogDeletionConfirmation from "../Shared/dialogDeletionConfirmation";
import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";

import { withFirebase } from "../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
// import Feed from "../Shared/feed.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const REDUCER_ACTIONS = {
  // FEED_DELETE_SET_DAYOFFSET: "FEED_DELETE_SET_DAYOFFSET",
  // FEED_DELETE_INIT: "FEED_DELETE_INIT",
  // FEED_DELETE_SUCCESS: "FEED_DELETE_SUCCESS",
  // FEED_DELETE_ERROR: "FEED_DELETE_ERROR",
  // // CLOSE_SNACKBAR: "CLOSE_SNACKBAR",
  GENERIC_ERROR: "GENERIC_ERROR",
};

// const deleteFeedsReducer = (state, action) => {
//   switch (action.type) {
//     case REDUCER_ACTIONS.FEED_DELETE_SET_DAYOFFSET:
//       return {
//         ...state,
//         deleteFeeds: { ...state.deleteFeeds, dayOffset: action.payload },
//       };
//     case REDUCER_ACTIONS.FEED_DELETE_INIT:
//       return {
//         ...state,
//         deleteFeeds: {
//           ...state.deleteFeeds,
//           isDeleting: true,
//           isDeleted: false,
//         },
//       };
//     case REDUCER_ACTIONS.FEED_DELETE_SUCCESS:
//       return {
//         ...state,
//         deleteFeeds: {
//           ...state.deleteFeeds,
//           isDeleting: false,
//           isDeleted: true,
//           message: action.payload,
//           error: null,
//         },
//       };
//     case REDUCER_ACTIONS.FEED_DELETE_ERROR:
//       return {
//         ...state,
//         deleteFeeds: {
//           ...state.deleteFeeds,
//           isDeleting: false,
//           isDeleted: false,
//           error: action.payload,
//         },
//       };

//     case REDUCER_ACTIONS.GENERIC_ERROR:
//       // Allgemeiner Fehler
//       return {
//         ...state,
//         isError: true,
//         error: action.payload,
//       };
//     default:
//       console.error("Unbekannter ActionType: ", action.type);
//       throw new Error();
//   }
// };

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const ExecuteJobPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <ExecuteJobBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const ExecuteJobBase = ({ props, authUser }) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [documentCounter, setDocumentCounter] = React.useState({ recipe: 0 });

  /* ------------------------------------------
  // Rezepte (Dokumente) der neuen Struktur anpassen
  // ------------------------------------------ */
  const onRestructureRecipeDocuments = async () => {
    await restructureRecipeDocuments(firebase).then((result) => {
      setDocumentCounter({ recipe: result });
    });
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT.PAGE_TITLE_JOBS} />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <PanelJobList
              onRestructureRecipeDocuments={onRestructureRecipeDocuments}
              documentCounter={documentCounter}
            />
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// ======================== Feed Einträge löschen ====================
// =================================================================== */
const PanelJobList = ({ onRestructureRecipeDocuments, documentCounter }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_ADMIN_JOBS}
        </Typography>
        <Link onClick={onRestructureRecipeDocuments} variant="body1">
          Rezepte restrukturieren
        </Link>
        <Typography>
          {
            "Alle Rezept-Dokumente in Firebase nach der neuen File-Struktur umbiegen."
          }
        </Typography>
        {documentCounter.recipe > 0 && (
          <AlertMessage
            severity="success"
            body={`${documentCounter.recipe} Dokumente wurden angepasst.`}
          ></AlertMessage>
        )}
      </CardContent>
    </Card>
  );
};

const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(ExecuteJobPage);
