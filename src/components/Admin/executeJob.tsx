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
  TEMP_JOBS as TEXT_TEMP_JOBS,
} from "../../constants/text";

import {rebuildFile000AllRecipes} from "../../jobs/rebuildFile000AllRecipes";
import {rebuildFile000AllUsers} from "../../jobs/rebuildFile000AllUsers";
import {rebuildFile000AllEvents} from "../../jobs/rebuildFile000AllEvents";

import {restructureRecipeDocuments} from "../../jobs/TS_Migration_restructureRecipes";
// import {restructurePrivateRecipeDocuments} from "../../jobs/TS_Migration_restructurePrivateRecipes";
import {restructureUserPublicProfile} from "../../jobs/TS_Migration_restructureUserPublicProfile";
import {restructureEventDocuments} from "../../jobs/TS_Migration_restructureEvents";

import useStyles from "../../constants/styles";

import PageTitle from "../Shared/pageTitle";
import AlertMessage from "../Shared/AlertMessage";

import {withFirebase} from "../Firebase/firebaseContext";
import Role from "../../constants/roles";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {CustomRouterProps} from "../Shared/global.interface";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
interface DocumentCounter {
  restructeredRecipes: number;
  privateRecipes: number;
  allRecipes: number;
  allUsers: number;
  allEvents: number;
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
    publicUserProfile: false,
    restructeredEvents: false,
    restructureProducts: false,
    fixEvent: false,
  });

  if (!authUser) {
    return <React.Fragment></React.Fragment>;
  }

  /* ------------------------------------------
  // Rezepte (Dokumente) der neuen Struktur anpassen
  // ------------------------------------------ */
  const onRestructureRecipeDocuments = async () => {
    await restructureRecipeDocuments(firebase).then((result) => {
      setDocumentCounter({...documentCounter, restructeredRecipes: result});
    });
  };
  // const onMovePriveRecipeDocuments = async () => {
  //   await restructurePrivateRecipeDocuments(firebase).then((result) => {
  //     setDocumentCounter({...documentCounter, privateRecipes: result});
  //   });
  // };

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
    await rebuildFile000AllEvents(firebase).then((result) => {
      setDocumentCounter({...documentCounter, allEvents: result});
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
    await restructureEventDocuments(firebase, authUser).then((result) => {
      setDocumentCounter({...documentCounter, restructeredEvents: result});
      setJobMonitor({...jobMonitor, restructeredEvents: false});
    });
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
              documentCounter={documentCounter}
              jobMonitor={jobMonitor}
            />
          </Grid>
          <Grid item xs={12}>
            <PanelTempJobList
              onRestructureRecipeDocuments={onRestructureRecipeDocuments}
              // onMovePriveRecipeDocuments={onMovePriveRecipeDocuments}
              onRestructurePublicUserProfile={onRestructePublicUserProfile}
              onRestructureEvents={onRestructeEvents}
              // onRestructureProducts={onRestructureProducts}
              // onFixEvents={onFixEvent}
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
  documentCounter: DocumentCounter;
  jobMonitor: JobMonitor;
}

const PanelJobList = ({
  onRebuild000AllRecipes,
  onRebuild000AllUsers,
  onRebuild000AllEvents,
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
      </CardContent>
    </Card>
  );
};

/* ===================================================================
// ========================== Liste aller Jobs =======================
// =================================================================== */
interface PanelTempJobListProps {
  onRestructureRecipeDocuments: () => void;
  // onMovePriveRecipeDocuments: () => void;
  onRestructurePublicUserProfile: () => void;
  onRestructureEvents: () => void;
  // onRestructureProducts: () => void;
  // onFixEvents: () => void;
  documentCounter: DocumentCounter;
  jobMonitor: JobMonitor;
}
const PanelTempJobList = ({
  onRestructureRecipeDocuments,
  // onMovePriveRecipeDocuments,
  onRestructurePublicUserProfile,
  onRestructureEvents,
  // onRestructureProducts,
  // onFixEvents,
  documentCounter,
  jobMonitor,
}: PanelTempJobListProps) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={"cardTempJobs"}>
      <CardContent className={classes.cardContent} key={"cardContentTempJobs"}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {TEXT_TEMP_JOBS}
        </Typography>
        <Typography>
          Folgende Jobs sind für die Umstellung der Datenstruktur (Migratiom
          Typescript) angedacht. Diese dürfen nur <strong>EINMAL</strong>{" "}
          ausgeführt werden.
        </Typography>
        <Typography color="error">
          <strong>
            Vor der Migration auf Firebase unbedingt die Berechtigungen
            ausschalten, sodass ich als Admin alles darf.
          </strong>
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
            "Alle Rezept-Dokumente in Firebase nach der neuen File-Struktur umbiegen und in die privaten Verzeichnisse verschieben."
          }
          jobIsRunning={jobMonitor.restructeredRecipes}
          changedRecords={documentCounter.restructeredRecipes}
          successMessage={`${documentCounter.restructeredRecipes} Dokumente wurden angepasst.`}
        />
        <br></br>
        {/* <JobEntry
          onClick={onMovePriveRecipeDocuments}
          jobName={"Private Rezepte verschieben"}
          jobDescription={
            "Alle privaten Rezepte in neuer Firebase Struktur verschieben."
          }
          jobIsRunning={jobMonitor.privateRecipes}
          changedRecords={documentCounter.privateRecipes}
          successMessage={`${documentCounter.privateRecipes} Dokumente wurden angepasst.`}
        /> 
        <br></br>*/}
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
        <br></br>
        {/* <JobEntry
          onClick={onFixEvents}
          jobName={"Alter Anlass wiederherstellen"}
          jobDescription={"JSON einfügen um alten Anlass wiederherzustellen"}
          jobIsRunning={jobMonitor.fixEvent}
          changedRecords={documentCounter.fixEvents}
          successMessage={`${documentCounter.fixEvents} Dokumente wurden angepasst.`}
        /> */}
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
