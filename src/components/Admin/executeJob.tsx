import React, {useReducer} from "react";
import {compose} from "recompose";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
// import TextField from "@material-ui/core/TextField";
// import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import LinearProgress from "@material-ui/core/LinearProgress";

// import LinearProgress from "@material-ui/core/LinearProgress";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import * as TEXT from "../../constants/text";
import * as ROLES from "../../constants/roles";

import {rebuildFile000AllRecipes} from "../../jobs/rebuildFile000AllRecipes";

import {restructureRecipeDocuments} from "../../jobs/TS_Migration_restructureRecipes";
import {restructurePrivateRecipeDocuments} from "../../jobs/TS_Migration_restructurePrivateRecipes";
import {restructureUserPublicProfile} from "../../jobs/TS_Migration_restructureUserPublicProfile";
import {restructureEventDocuments} from "../../jobs/TS_Migration_restructureEvents";
import {restructureProducts} from "../../jobs/TS_Migration_Products";

// import Feeds from "../Shared/feed.class";
import useStyles from "../../constants/styles";

// import DialogDeletionConfirmation from "../Shared/dialogDeletionConfirmation";
import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";

import {withFirebase} from "../Firebase";
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
  GENERIC_ERROR: "GENERIC_ERROR",
};

interface DocumentCounter {
  restructeredRecipes: number;
  privateRecipes: number;
  allRecipes: number;
  publicUserProfile: number;
  restructeredEvents: number;
  restructureProducts: number;
}

interface JobMonitor {
  restructeredRecipes: boolean;
  privateRecipes: boolean;
  allRecipes: boolean;
  publicUserProfile: boolean;
  restructeredEvents: boolean;
  restructureProducts: boolean;
}

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
const ExecuteJobBase = ({props, authUser}) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [documentCounter, setDocumentCounter] = React.useState<DocumentCounter>(
    {
      restructeredRecipes: 0,
      privateRecipes: 0,
      allRecipes: 0,
      publicUserProfile: 0,
      restructeredEvents: 0,
      restructureProducts: 0,
    }
  );

  const [jobMonitor, setJobMonitor] = React.useState<JobMonitor>({
    restructeredRecipes: false,
    privateRecipes: false,
    allRecipes: false,
    publicUserProfile: false,
    restructeredEvents: false,
    restructureProducts: false,
  });

  /* ------------------------------------------
  // Rezepte (Dokumente) der neuen Struktur anpassen
  // ------------------------------------------ */
  const onRebuild000AllRecipes = () => {};

  const onRestructureRecipeDocuments = async () => {
    await restructureRecipeDocuments(firebase).then((result) => {
      setDocumentCounter({...documentCounter, restructeredRecipes: result});
    });
  };
  const onMovePriveRecipeDocuments = async () => {
    await restructurePrivateRecipeDocuments(firebase).then((result) => {
      setDocumentCounter({...documentCounter, privateRecipes: result});
    });
  };

  const onRebuildFile000AllRecipes = async () => {
    await rebuildFile000AllRecipes(firebase).then((result) => {
      setDocumentCounter({...documentCounter, allRecipes: result});
    });
  };

  const onRestructePublicUserProfile = async () => {
    setJobMonitor({...jobMonitor, publicUserProfile: true});
    await restructureUserPublicProfile(firebase).then((result) => {
      setDocumentCounter({...documentCounter, publicUserProfile: result});
      setJobMonitor({...jobMonitor, publicUserProfile: false});
    });
  };

  const onRestructeEvents = async () => {
    setJobMonitor({...jobMonitor, restructeredEvents: true});
    await restructureEventDocuments(firebase).then((result) => {
      setDocumentCounter({...documentCounter, restructeredEvents: result});
      setJobMonitor({...jobMonitor, restructeredEvents: false});
    });
  };

  const onRestructureProducts = async () => {
    setJobMonitor({...jobMonitor, restructureProducts: true});
    await restructureProducts(firebase).then((result) => {
      setDocumentCounter({...documentCounter, restructureProducts: result});
      setJobMonitor({...jobMonitor, restructureProducts: false});
    });
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT.PANEL_SYSTEM_JOBS} />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <PanelJobList
              onRebuild000AllRecipes={onRebuildFile000AllRecipes}
              documentCounter={documentCounter}
              jobMonitor={jobMonitor}
            />
          </Grid>
          <Grid item xs={12}>
            <PanelTempJobList
              onRestructureRecipeDocuments={onRestructureRecipeDocuments}
              onMovePriveRecipeDocuments={onMovePriveRecipeDocuments}
              onRestructurePublicUserProfile={onRestructePublicUserProfile}
              onRestructureEvents={onRestructeEvents}
              onRestructureProducts={onRestructureProducts}
              documentCounter={documentCounter}
              jobMonitor={jobMonitor}
            />
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// ========================== Liste aller Jobs =======================
// =================================================================== */
interface JobListProps {
  onRebuild000AllRecipes: () => void;
  documentCounter: DocumentCounter;
  jobMonitor: JobMonitor;
}

const PanelJobList = ({
  onRebuild000AllRecipes,
  documentCounter,
  jobMonitor,
}: JobListProps) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_SYSTEM_JOBS}
        </Typography>
        <JobEntry
          onClick={onRebuild000AllRecipes}
          jobName={"000_allRecipe neu aufbauen"}
          jobDescription={"Dokument 000_allRecipes neu aufbauen."}
          jobIsRunning={jobMonitor.allRecipes}
          changedRecords={documentCounter.allRecipes}
          successMessage={`Dokument 000_allRecipes mit ${documentCounter.allRecipes} Rezepten neu aufgebaut.`}
        />
      </CardContent>
    </Card>
  );
};

/* ===================================================================
// ========================== Liste aller Jobs =======================
// =================================================================== */
interface PanelTempJobListProps {
  onRestructureRecipeDocuments: () => void;
  onMovePriveRecipeDocuments: () => void;
  onRestructurePublicUserProfile: () => void;
  onRestructureEvents: () => void;
  onRestructureProducts: () => void;
  documentCounter: DocumentCounter;
  jobMonitor: JobMonitor;
}
const PanelTempJobList = ({
  onRestructureRecipeDocuments,
  onMovePriveRecipeDocuments,
  onRestructurePublicUserProfile,
  onRestructureEvents,
  onRestructureProducts,
  documentCounter,
  jobMonitor,
}: PanelTempJobListProps) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardTempJobs"}>
      <CardContent className={classes.cardContent} key={"cardContentTempJobs"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT.PANEL_SYSTEM_TEMP_JOBS}
        </Typography>
        <Typography>
          Folgende Jobs sind für die Umstellung der Datenstruktur (Migratiom
          Typescript) angedacht. Diese dürfen nur <strong>EINMAL</strong>{" "}
          ausgeführt werden.
        </Typography>
        <br></br>
        {/* <JobEntry
          onClick={onRestructureProducts}
          jobName={"Produkte restrukturieren"}
          jobDescription={"Produkte in neue Strutkur umbiegen."}
          jobIsRunning={jobMonitor.restructureProducts}
          changedRecords={documentCounter.restructureProducts}
          successMessage={`${documentCounter.restructureProducts} Produkte wurden angepasst.`}
        />
        <br></br> */}
        <JobEntry
          onClick={onRestructureRecipeDocuments}
          jobName={"Rezepte restrukturieren"}
          jobDescription={
            "Alle Rezept-Dokumente in Firebase nach der neuen File-Struktur umbiegen."
          }
          jobIsRunning={jobMonitor.restructeredRecipes}
          changedRecords={documentCounter.restructeredRecipes}
          successMessage={`${documentCounter.restructeredRecipes} Dokumente wurden angepasst.`}
        />
        <br></br>
        <JobEntry
          onClick={onMovePriveRecipeDocuments}
          jobName={"Private Rezepte verschieben"}
          jobDescription={
            "Alle privaten Rezepte in neuer Firebase Struktur verschieben."
          }
          jobIsRunning={jobMonitor.privateRecipes}
          changedRecords={documentCounter.privateRecipes}
          successMessage={`${documentCounter.privateRecipes} Dokumente wurden angepasst.`}
        />

        <br></br>
        <JobEntry
          onClick={onRestructurePublicUserProfile}
          jobName={"Öffentliches User Profil umstrukturieren"}
          jobDescription={
            "Die Felder des öffentlichen User Profil der neuen Struktur anpassen."
          }
          jobIsRunning={jobMonitor.publicUserProfile}
          changedRecords={documentCounter.publicUserProfile}
          successMessage={`${documentCounter.publicUserProfile} Dokumente wurden angepasst.`}
        />
        <br></br>
        <JobEntry
          onClick={onRestructureEvents}
          jobName={"Anlässe restukturieren"}
          jobDescription={"Anlässe in neue Struktur umbiegen"}
          jobIsRunning={jobMonitor.restructeredEvents}
          changedRecords={documentCounter.restructeredEvents}
          successMessage={`${documentCounter.restructeredEvents} Dokumente wurden angepasst.`}
        />
      </CardContent>
    </Card>
  );
};
/* ===================================================================
// ======================== Eintrag in Job Liste =====================
// =================================================================== */
interface JobEntryProps {
  onClick: () => void;
  jobName: string;
  jobDescription: string;
  jobIsRunning: boolean;
  changedRecords: number;
  successMessage: string;
}
const JobEntry = ({
  onClick,
  jobName,
  jobDescription,
  jobIsRunning,
  changedRecords,
  successMessage,
}: JobEntryProps) => {
  return (
    <React.Fragment>
      <Link onClick={onClick} variant="body1">
        {jobName}
      </Link>
      <Typography>{jobDescription}</Typography>
      {jobIsRunning && <LinearProgress />}
      {changedRecords > 0 && (
        <AlertMessage severity="success" body={successMessage}></AlertMessage>
      )}
    </React.Fragment>
  );
};

const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(ExecuteJobPage);
