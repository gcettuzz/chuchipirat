import React from "react";
import {compose} from "react-recompose";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import LinearProgress from "@material-ui/core/LinearProgress";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import {
  JOBS as TEXT_JOBS,
  // TEMP_JOBS as TEXT_TEMP_JOBS,
} from "../../constants/text";

import {rebuildFile000AllRecipes} from "../../jobs/rebuildFile000AllRecipes";
import {rebuildFile000AllUsers} from "../../jobs/rebuildFile000AllUsers";
import {rebuildFile000AllEvents} from "../../jobs/rebuildFile000AllEvents";

import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";

import {withFirebase} from "../Firebase/firebaseContext";
import Role from "../../constants/roles";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {CustomRouterProps} from "../Shared/global.interface";
import Stats from "../Shared/stats.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
interface DocumentCounter {
  restructeredRecipes: number;
  privateRecipes: number;
  allRecipes: number;
  allUsers: number;
  allEvents: number;
  statsCounter: number;
  publicUserProfile: number;
  restructeredEvents: number;
  restructureProducts: number;
  fixEvents: number;
}

interface JobMonitor {
  restructeredRecipes: boolean;
  privateRecipes: boolean;
  allRecipes: boolean;
  allUsers: boolean;
  allEvents: boolean;
  statsCounter: boolean;
  publicUserProfile: boolean;
  restructeredEvents: boolean;
  restructureProducts: boolean;
  fixEvent: boolean;
}
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const ExecuteJobPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <ExecuteJobBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const ExecuteJobBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  // const {customDialog} = useCustomDialog();

  const [documentCounter, setDocumentCounter] = React.useState<DocumentCounter>(
    {
      restructeredRecipes: 0,
      privateRecipes: 0,
      allRecipes: 0,
      allUsers: 0,
      allEvents: 0,
      statsCounter: 0,
      publicUserProfile: 0,
      restructeredEvents: 0,
      restructureProducts: 0,
      fixEvents: 0,
    }
  );

  const [jobMonitor, setJobMonitor] = React.useState<JobMonitor>({
    restructeredRecipes: false,
    privateRecipes: false,
    allRecipes: false,
    allUsers: false,
    allEvents: false,
    statsCounter: false,
    publicUserProfile: false,
    restructeredEvents: false,
    restructureProducts: false,
    fixEvent: false,
  });

  if (!authUser) {
    return <React.Fragment></React.Fragment>;
  }

  const onRebuildFile000AllRecipes = async () => {
    await rebuildFile000AllRecipes(firebase).then((result) => {
      setDocumentCounter({...documentCounter, allRecipes: result});
    });
  };

  const onRebuildFile000AllUsers = async () => {
    await rebuildFile000AllUsers(firebase).then((result) => {
      setDocumentCounter({...documentCounter, allUsers: result});
    });
  };

  const onRebuildFile000AllEvents = async () => {
    await rebuildFile000AllEvents(firebase, authUser).then((result) => {
      setDocumentCounter({...documentCounter, allEvents: result});
    });
  };
  const onRebuildStatsCounter = async () => {
    setJobMonitor({...jobMonitor, statsCounter: true});
    Stats.rebuildStats({
      firebase: firebase,
      authUser: authUser,
      callback: (document) => {
        setDocumentCounter({
          ...documentCounter,
          statsCounter: document.processedDocuments,
        });
        setJobMonitor({...jobMonitor, statsCounter: false});
      },
    }).catch((error) => console.error(error));
  };

  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_JOBS} />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <PanelJobList
              onRebuild000AllRecipes={onRebuildFile000AllRecipes}
              onRebuild000AllUsers={onRebuildFile000AllUsers}
              onRebuild000AllEvents={onRebuildFile000AllEvents}
              onRebuildStatsCounter={onRebuildStatsCounter}
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
  onRebuild000AllUsers: () => void;
  onRebuild000AllEvents: () => void;
  onRebuildStatsCounter: () => void;
  documentCounter: DocumentCounter;
  jobMonitor: JobMonitor;
}

const PanelJobList = ({
  onRebuild000AllRecipes,
  onRebuild000AllUsers,
  onRebuild000AllEvents,
  onRebuildStatsCounter,
  documentCounter,
  jobMonitor,
}: JobListProps) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_JOBS}
        </Typography>
        <JobEntry
          onClick={onRebuild000AllRecipes}
          jobName={"000_allRecipe neu aufbauen"}
          jobDescription={"Dokument 000_allRecipes neu aufbauen."}
          jobIsRunning={jobMonitor.allRecipes}
          changedRecords={documentCounter.allRecipes}
          successMessage={`Dokument 000_allRecipes mit ${documentCounter.allRecipes} Rezepten neu aufgebaut.`}
        />
        <br />
        <JobEntry
          onClick={onRebuild000AllUsers}
          jobName={"000_allUsers neu aufbauen"}
          jobDescription={"Dokument 000_allUsers neu aufbauen."}
          jobIsRunning={jobMonitor.allUsers}
          changedRecords={documentCounter.allUsers}
          successMessage={`Dokument 000_alUsers mit ${documentCounter.allUsers} Users neu aufgebaut.`}
        />
        <br />
        <JobEntry
          onClick={onRebuild000AllEvents}
          jobName={"000_allEvents neu aufbauen"}
          jobDescription={"Dokument 000_allEvents neu aufbauen."}
          jobIsRunning={jobMonitor.allEvents}
          changedRecords={documentCounter.allEvents}
          successMessage={`Dokument 000_alEvents mit ${documentCounter.allEvents} Events neu aufgebaut.`}
        />
        <br />
        <JobEntry
          onClick={onRebuildStatsCounter}
          jobName={"Stats-Counter neu aufbauen"}
          jobDescription={"Dokument stats/counter und Statistik neu berechnen."}
          jobIsRunning={jobMonitor.statsCounter}
          changedRecords={documentCounter.statsCounter}
          successMessage={`Dokument stats/counter mit ${documentCounter.statsCounter} gelesenen Dokumenten neu aufgebaut.`}
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

const condition = (authUser: AuthUser | null) =>
  !!authUser && !!authUser.roles.includes(Role.admin);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(ExecuteJobPage);
