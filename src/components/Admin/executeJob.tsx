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
import {fixEventDocuments} from "../../jobs/TS_Fix_Event";

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
import {
  DialogType,
  SingleTextInputResult,
  useCustomDialog,
} from "../Shared/customDialogContext";
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
  fixEvents: number;
}

interface JobMonitor {
  restructeredRecipes: boolean;
  privateRecipes: boolean;
  allRecipes: boolean;
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
  const {customDialog} = useCustomDialog();

  const [documentCounter, setDocumentCounter] = React.useState<DocumentCounter>(
    {
      restructeredRecipes: 0,
      privateRecipes: 0,
      allRecipes: 0,
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
    publicUserProfile: false,
    restructeredEvents: false,
    restructureProducts: false,
    fixEvent: false,
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

  // const onFixEvent = async () => {
  //   let eventUID = "0AIHHZKcAv6dEinTVXY1";
  //   let event = {
  //     location: "ort",
  //     participants: 13,
  //     motto: "motto",
  //     maxDate: "1971-12-31T23:00:00.000Z",
  //     createdAt: "2021-12-31T16:58:59.060Z",
  //     pictureSrcFullSize: "",
  //     pictureSrc: "",
  //     dates: [
  //       {
  //         pos: 1,
  //         from: "1970-12-31T23:00:00.000Z",
  //         to: "1971-12-31T23:00:00.000Z",
  //         uid: "90mpF",
  //       },
  //     ],
  //     cooks: [
  //       {
  //         pictureSrc:
  //           "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/users%2FtasT02c6mxOWDstBdvwzjbs5Tfc2_50x50.jpeg?alt=media&token=fd88dd87-7b16-4319-9fa7-80948f2b95ed",
  //         uid: "tasT02c6mxOWDstBdvwzjbs5Tfc2",
  //         displayName: "Gio XIII",
  //         motto: "Figged eu alli 🖕 Tschau zäme !",
  //       },
  //     ],
  //     authUsers: ["tasT02c6mxOWDstBdvwzjbs5Tfc2"],
  //     numberOfDays: 366,
  //     name: "test",
  //     createdFromDisplayName: "Gio XIII",
  //     createdFromUid: "tasT02c6mxOWDstBdvwzjbs5Tfc2",
  //     lastChangeAt: "1970-01-01T00:00:00.000Z",
  //     lastChangeFromUid: "",
  //     lastChangeFromDisplayName: "",
  //   };
  //   let menuplan = {
  //     recipes: [
  //       {
  //         recipeUid: "5oXe05lESkZ6B47j75p2",
  //         noOfServings: 36,
  //         uid: "WGO5l",
  //         date: new Date("2021-03-26T00:00:00.000Z"),
  //         pictureSrc: "https://recipecontent.fooby.ch/10729_3-2_1920-1280.jpg",
  //         mealUid: "1FokE",
  //         recipeName: "Hörnli und Ghackets",
  //       },
  //       {
  //         pictureSrc:
  //           "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/recipes%2Fh5VqrDq8g4Vn6wdekLpg.jpeg?alt=media&token=9b0b7292-34e8-43b0-80c4-cab0d09aec74",
  //         uid: "LFmr5",
  //         date: new Date("2021-03-27T00:00:00.000Z"),
  //         noOfServings: 3,
  //         recipeUid: "h5VqrDq8g4Vn6wdekLpg",
  //         recipeName: "Spätzli",
  //         mealUid: "1FokE",
  //       },
  //       {
  //         date: new Date("2021-05-01T00:00:00.000Z"),
  //         uid: "mxhZ6",
  //         mealUid: "K0FU0",
  //         pictureSrc:
  //           "https://firebasestorage.googleapis.com/v0/b/chuchipirat-dev.appspot.com/o/recipes%2Fh5VqrDq8g4Vn6wdekLpg.jpeg?alt=media&token=9b0b7292-34e8-43b0-80c4-cab0d09aec74",
  //         noOfServings: 40,
  //         recipeName: "Spätzli",
  //         recipeUid: "h5VqrDq8g4Vn6wdekLpg",
  //       },
  //       {
  //         pictureSrc:
  //           "https://res.cloudinary.com/swissmilk/image/fetch/ar_16:10,g_auto,w_1512,c_fill,f_auto,q_auto,fl_progressive/https://api.swissmilk.ch/wp-content/uploads/2019/06/engadiner-hochzeitssuppe-2560x2560.jpg",
  //         uid: "PNc7U",
  //         mealUid: "K0FU0",
  //         recipeName: "Engadiner Hochzeitsuppe",
  //         date: new Date("2021-03-26T00:00:00.000Z"),
  //         recipeUid: "HWEvHBnRM56GDapkWtsd",
  //         noOfServings: 8,
  //       },
  //       {
  //         pictureSrc: "https://recipecontent.fooby.ch/14130_3-2_1200-800.jpg",
  //         uid: "b0WkO",
  //         date: new Date("2021-03-27T00:00:00.000Z"),
  //         noOfServings: 36,
  //         mealUid: "K0FU0",
  //         recipeUid: "zFAZcHPctTQYaEtDOOni",
  //         recipeName: "Pesto",
  //       },
  //       {
  //         date: new Date("2021-04-24T00:00:00.000Z"),
  //         recipeUid: "aWkF0K4PlbLUsP3nirOW",
  //         pictureSrc:
  //           "https://www.bettybossi.ch/static/rezepte/x/bb_bkxx060801_0090a_x.jpg",
  //         recipeName: "Lasagne al forno",
  //         uid: "pcfK3",
  //         noOfServings: 24,
  //         mealUid: "1FokE",
  //       },
  //       {
  //         pictureSrc: "https://recipecontent.fooby.ch/17511_3-2_480-320.jpg",
  //         date: new Date("2021-04-24T00:00:00.000Z"),
  //         recipeUid: "jTqQt1MBaPq65mEaai1H",
  //         recipeName: "Spinat Lasagne",
  //         noOfServings: 8,
  //         uid: "qgVHr",
  //         mealUid: "1FokE",
  //       },
  //       {
  //         uid: "El7Lz",
  //         noOfServings: 36,
  //         date: new Date("2021-04-24T00:00:00.000Z"),
  //         recipeName: "Salat mit Honig-Senf Sauce",
  //         recipeUid: "uHKGoOFJt1kux8mFKeAU",
  //         mealUid: "1FokE",
  //         pictureSrc:
  //           "https://recipeimages.migros.ch/crop/v-w-1600-h-680-a-center_center/70d779838c60ccb0c3cf84c15b8297d9fce9ad58/salat-an-honig-senf-sauce-0-47-20.jpg",
  //       },
  //       {
  //         uid: "EcaDh",
  //         noOfServings: 36,
  //         recipeName: "Linsensalaat",
  //         pictureSrc: "https://recipecontent.fooby.ch/13636_3-2_480-320.jpg",
  //         mealUid: "1FokE",
  //         date: new Date("2021-04-25T00:00:00.000Z"),
  //         recipeUid: "5wOxyKv4eCy6v5idygRz",
  //       },
  //       {
  //         recipeName: "Panna cotta mit Orangen",
  //         pictureSrc:
  //           "https://www.bettybossi.ch/static/rezepte/x/bb_bbzb190215_0022a_x.jpg",
  //         uid: "4Js5u",
  //         date: new Date("2021-03-27T00:00:00.000Z"),
  //         mealUid: "lNB38",
  //         noOfServings: 36,
  //         recipeUid: "W39V3E0fsGe7874QPff7",
  //       },
  //       {
  //         pictureSrc:
  //           "https://recipeimages.migros.ch/crop/v-w-2000-h-851-a-center_center/323e97d7031e3995a5325da2381cc72992cf9dc2/rindsfilet-stroganoff-0-47-20.jpg",
  //         mealUid: "1FokE",
  //         recipeName: "Cervelat Stroganoff",
  //         noOfServings: 36,
  //         date: new Date("2021-03-27T00:00:00.000Z"),
  //         uid: "r4D52",
  //         recipeUid: "t3jKjgl5QnDpe9EHDWZ9",
  //       },
  //       {
  //         recipeUid: "fRTPyX4nnQh8tqg6fbPI",
  //         recipeName: "test für DIE Suche eines Rezeptes und",
  //         date: new Date("2021-03-26T00:00:00.000Z"),
  //         noOfServings: 36,
  //         pictureSrc: "",
  //         mealUid: "xkHBE",
  //         uid: "aGxAL",
  //       },
  //     ],
  //     lastChangeFromUid: "tasT02c6mxOWDstBdvwzjbs5Tfc2",
  //     createdFromDisplayName: "Gio XIII",
  //     lastChangeAt: new Date("2021-04-30T00:00:00.000Z"),
  //     notes: [
  //       {
  //         date: new Date("2021-03-26T00:00:00.000Z"),
  //         mealUid: "",
  //         type: 1,
  //         text: "Thomas",
  //         uid: "oqepY",
  //       },
  //       {
  //         type: 2,
  //         date: new Date("2021-03-27T00:00:00.000Z"),
  //         text: "Marinade",
  //         uid: "C9VS7",
  //         mealUid: "1FokE",
  //       },
  //       {
  //         type: "",
  //         mealUid: "xkHBE",
  //         date: new Date("2021-04-25T00:00:00.000Z"),
  //         uid: "ifTTH",
  //         text: "test",
  //       },
  //     ],
  //     meals: [
  //       {
  //         pos: 1,
  //         name: "Zmorgen",
  //         uid: "xkHBE",
  //       },
  //       {
  //         pos: 2,
  //         name: "Zmittag",
  //         uid: "1FokE",
  //       },
  //       {
  //         uid: "K0FU0",
  //         name: "Znacht",
  //         pos: 3,
  //       },
  //       {
  //         uid: "lNB38",
  //         pos: 4,
  //         name: "Dessert",
  //       },
  //     ],
  //     createdFromUid: "tasT02c6mxOWDstBdvwzjbs5Tfc2",
  //     dates: [
  //       new Date("2021-03-27T00:00:00.000Z"),
  //       new Date("2021-03-28T00:00:00.000Z"),
  //       new Date("2021-04-24T00:00:00.000Z"),
  //       new Date("2021-04-25T00:00:00.000Z"),
  //       new Date("2021-04-26T00:00:00.000Z"),
  //       new Date("2021-04-27T00:00:00.000Z"),
  //       new Date("2021-04-28T00:00:00.000Z"),
  //       new Date("2021-04-29T00:00:00.000Z"),
  //       new Date("2021-04-30T00:00:00.000Z"),
  //       new Date("2021-05-01T00:00:00.000Z"),
  //     ],
  //     createdAt: new Date("2021-03-26T00:00:00.000Z"),
  //     lastChangeFromDisplayName: "Gio XIII",
  //     usedRecipes: [
  //       "5oXe05lESkZ6B47j75p2",
  //       "h5VqrDq8g4Vn6wdekLpg",
  //       "h5VqrDq8g4Vn6wdekLpg",
  //       "HWEvHBnRM56GDapkWtsd",
  //       "zFAZcHPctTQYaEtDOOni",
  //       "aWkF0K4PlbLUsP3nirOW",
  //       "jTqQt1MBaPq65mEaai1H",
  //       "uHKGoOFJt1kux8mFKeAU",
  //       "5wOxyKv4eCy6v5idygRz",
  //       "W39V3E0fsGe7874QPff7",
  //       "t3jKjgl5QnDpe9EHDWZ9",
  //       "fRTPyX4nnQh8tqg6fbPI",
  //     ],
  //   };
  //   setJobMonitor({...jobMonitor, fixEvent: true});

  //   // let userInput = (await customDialog({
  //   //   dialogType: DialogType.SingleTextInput,
  //   //   title: "Anlass-UID",
  //   //   text: "",
  //   //   singleTextInputProperties: {
  //   //     initialValue: "",
  //   //     textInputLabel: "UID",
  //   //   },
  //   // })) as SingleTextInputResult;

  //   // if (!userInput.valid) {
  //   //   return;
  //   // } else {
  //   //   eventUID = userInput.input;
  //   // }

  //   // userInput = (await customDialog({
  //   //   dialogType: DialogType.SingleTextInput,
  //   //   title: "Anlass",
  //   //   text: "JSON des alten Anlasses angeben",
  //   //   singleTextInputProperties: {
  //   //     initialValue: "",
  //   //     textInputLabel: "JSON",
  //   //   },
  //   // })) as SingleTextInputResult;

  //   // if (!userInput.valid) {
  //   //   return;
  //   // } else {
  //   //   eventJSON = userInput.input.trim();
  //   // }

  //   // userInput = (await customDialog({
  //   //   dialogType: DialogType.SingleTextInput,
  //   //   title: "Menuplan",
  //   //   text: "JSON des alten Menuplans angeben",
  //   //   singleTextInputProperties: {
  //   //     initialValue: "",
  //   //     textInputLabel: "JSON",
  //   //   },
  //   // })) as SingleTextInputResult;

  //   // if (!userInput.valid) {
  //   //   return;
  //   // } else {
  //   //   menuplanJSON = userInput.input.trim();
  //   // }
  //   // console.log(eventUID, eventJSON, menuplanJSON);
  //   await fixEventDocuments({
  //     eventUid: eventUID,
  //     event: event,
  //     menuplan: menuplan,
  //     firebase: firebase,
  //   }).then((result) => {
  //     setDocumentCounter({...documentCounter, restructureProducts: 1});
  //     setJobMonitor({...jobMonitor, fixEvent: false});
  //   });
  // };

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
  // onFixEvents: () => void;
  documentCounter: DocumentCounter;
  jobMonitor: JobMonitor;
}
const PanelTempJobList = ({
  onRestructureRecipeDocuments,
  onMovePriveRecipeDocuments,
  onRestructurePublicUserProfile,
  onRestructureEvents,
  onRestructureProducts,
  // onFixEvents,
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

const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(ExecuteJobPage);
