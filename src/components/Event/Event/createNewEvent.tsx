import React from "react";
import {useHistory} from "react-router";
import {compose} from "react-recompose";

import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Button,
  Backdrop,
  CircularProgress,
  Typography,
  Card,
  CardHeader,
  CardContent,
  useMediaQuery,
} from "@material-ui/core";

import {
  CREATE_YOUR_EVENT as TEXT_CREATE_YOUR_EVENT,
  WHAT_ARE_YOU_UP_TO as TEXT_WHAT_ARE_YOU_UP_TO,
  EVENT_INFO as TEXT_EVENT_INFO,
  QUANTITY_CALCULATION_INFO as TEXT_QUANTITY_CALCULATION_INFO,
  COMPLETION as TEXT_COMPLETION,
  CONTINUE as TEXT_CONTIUNE,
  BACK_TO_OVERVIEW as TEXT_BACK_TO_OVERVIEW,
  BACK_TO_EVENT_INFO as TEXT_BACK_TO_EVENT_INFO,
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  EVENT_IS_BEEING_CREATED as TEXT_EVENT_IS_BEEING_CREATED,
  IMAGE_IS_BEEING_UPLOADED as TEXT_IMAGE_IS_BEEING_UPLOADED,
  BACK_TO_GROUPCONFIG as TEXT_BACK_TO_GROUPCONFIG,
  RESUME_INTRODUCTION as TEXT_RESUME_INTRODUCTION,
  PLEASE_DONATE as TEXT_PLEASE_DONATE,
  WHY_DONATE as TEXT_WHY_DONATE,
  NEED_A_RECEIPT as TEXT_NEED_A_RECEIPT,
  THANK_YOU_1000 as TEXT_THANK_YOU_1000,
} from "../../../constants/text";

import useStyles from "../../../constants/styles";
import PageTitle from "../../Shared/pageTitle";
import EventInfoPage from "./eventInfo";
import EventGroupConfigurationPage from "../GroupConfiguration/groupConfigruation";
import Event from "./event.class";

import {
  HOME as ROUTE_HOME,
  EVENT as ROUTE_EVENT,
} from "../../../constants/routes";

import {withFirebase} from "../../Firebase/firebaseContext";

import {
  NavigationValuesContext,
  NavigationObject,
} from "../../Navigation/navigationContext";
import Action from "../../../constants/actions";
import AlertMessage from "../../Shared/AlertMessage";
import Menuplan from "../Menuplan/menuplan.class";
import FieldValidationError, {
  FormValidationFieldError,
} from "../../Shared/fieldValidation.error.class";
import EventGroupConfiguration from "../GroupConfiguration/groupConfiguration.class";
import withEmailVerification from "../../Session/withEmailVerification";
import {
  AuthUserContext,
  withAuthorization,
} from "../../Session/authUserContext";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../../Shared/global.interface";
import {ImageRepository} from "../../../constants/imageRepository";
import {TWINT_PAYLINK} from "../../../constants/defaultValues";
/* ===================================================================
// ============================== Global =============================
// =================================================================== */
enum WizardSteps {
  info,
  groupConfig,
  completion,
}
/* ===================================================================
// ============================ Dispatcher ===========================
// =================================================================== */
enum ReducerActions {
  SET_EVENT,
  SET_GROUP_CONFIG,
  FIELD_UPDATE,
  SET_PICTURE,
  UPLOAD_PICTURE_INIT,
  UPLOAD_PICTURE_SUCCESS,
  SHOW_LOADING,
  SAVE_EVENT_INIT,
  SAVE_EVENT_SUCCESS,
  FORM_FIELD_ERROR,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: any;
};
type State = {
  event: Event;
  groupConfig: EventGroupConfiguration;
  localPicture: File | null;
  isLoading: boolean;
  isUpLoadingPicture: boolean;
  isSaving: boolean;
  isError: boolean;
  eventFormValidation: FormValidationFieldError[];
  error: Error | null;
};
const inititialState: State = {
  event: new Event(),
  groupConfig: new EventGroupConfiguration(),
  localPicture: null,
  isLoading: false,
  isUpLoadingPicture: false,
  isSaving: false,
  isError: false,
  eventFormValidation: [],
  error: null,
};

const eventReducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.SET_EVENT:
      return {...state, event: action.payload as Event};
    case ReducerActions.SET_GROUP_CONFIG:
      return {...state, groupConfig: action.payload as EventGroupConfiguration};
    case ReducerActions.FIELD_UPDATE:
      return {
        ...state,
        event: {...state.event, [action.payload.field]: action.payload.value},
      };
    case ReducerActions.SET_PICTURE:
      return {...state, localPicture: action.payload as File | null};
    case ReducerActions.UPLOAD_PICTURE_INIT:
      return {
        ...state,
        isUpLoadingPicture: true,
      };
    case ReducerActions.UPLOAD_PICTURE_SUCCESS:
      return {
        ...state,
        event: {
          ...state.event,
          pictureSrc: action.payload.pictureSrc as string,
        },
        isUpLoadingPicture: false,
      };
    case ReducerActions.SAVE_EVENT_INIT:
      return {...state, isSaving: true};
    case ReducerActions.SAVE_EVENT_SUCCESS:
      return {...state, isSaving: false, event: action.payload as Event};
    case ReducerActions.FORM_FIELD_ERROR:
      return {
        ...state,
        isSaving: false,
        isError: true,
        error: action.payload as Error,
        eventFormValidation: action.payload
          .formValidation as FormValidationFieldError[],
      };
    case ReducerActions.SHOW_LOADING:
      return {
        ...state,
        isSaving: true,
      };
    case ReducerActions.GENERIC_ERROR:
      return {
        ...state,
        isSaving: false,
        isError: true,
        error: action.payload as Error,
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const CreateEventPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <CreateEventBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const CreateEventBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();
  const {push} = useHistory();

  const [state, dispatch] = React.useReducer(eventReducer, inititialState);
  const navigationValuesContext = React.useContext(NavigationValuesContext);
  const [activeStep, setActiveStep] = React.useState(WizardSteps.info);

  /* ------------------------------------------
  // Navigation-Handler
  // ------------------------------------------ */
  React.useEffect(() => {
    if (authUser !== null) {
      navigationValuesContext?.setNavigationValues({
        action: Action.NEW,
        object: NavigationObject.none,
      });
      // Initialier Event erstellen
      dispatch({
        type: ReducerActions.SET_EVENT,
        payload: Event.factory(authUser),
      });
    }
  }, [authUser]);

  if (!authUser) {
    return null;
  }
  /* ------------------------------------------
  // Step-Steuerung
  // ------------------------------------------ */
  const goToStepGroup = () => {
    setActiveStep(WizardSteps.groupConfig);
  };
  const goToOvierview = () => {
    if (state.event.uid) {
      // Event wieder löschen
      Event.delete({
        event: state.event,
        firebase: firebase,
        authUser: authUser,
      });
    }

    push({
      pathname: `${ROUTE_HOME}`,
    });
  };
  const goToStepInfo = () => {
    setActiveStep(WizardSteps.info);
  };
  const goToResume = (
    event: React.MouseEvent<HTMLButtonElement>,
    value?: any
  ) => {
    dispatch({type: ReducerActions.SET_GROUP_CONFIG, payload: value});
    setActiveStep(WizardSteps.completion);
  };
  const goToMenuplan = async () => {
    dispatch({type: ReducerActions.SHOW_LOADING, payload: {}});

    // Kurz warten, dass auch alles ready ist
    await new Promise(function (resolve) {
      setTimeout(resolve, 1500);
    });

    push({
      pathname: `${ROUTE_EVENT}/${state.event.uid}`,
      state: {event: state.event, groupConfig: state.groupConfig},
    });
  };
  /* ------------------------------------------
  // Änderungen übernehmen
  // ------------------------------------------ */
  const onUpdateEvent = (event: Event) => {
    dispatch({type: ReducerActions.SET_EVENT, payload: event});
  };
  const onUpdatePicture = (picture: File | null) => {
    dispatch({type: ReducerActions.SET_PICTURE, payload: picture!});
  };
  const onEventError = (error: Error) => {
    dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
  };
  /* ------------------------------------------
  // Event Speicherung
  // ------------------------------------------ */
  const onCreateEvent = async () => {
    dispatch({type: ReducerActions.SAVE_EVENT_INIT, payload: {}});

    await Event.save({
      firebase: firebase,
      event: state.event,
      authUser: authUser,
      localPicture: state.localPicture ? state.localPicture : ({} as File),
    })
      .then(async (result) => {
        dispatch({type: ReducerActions.SAVE_EVENT_SUCCESS, payload: result});
        // Menüplan erstellen und speichern.
        await Menuplan.save({
          menuplan: Menuplan.factory({
            event: {...state.event, uid: result.uid},
            authUser: authUser,
          }),
          firebase: firebase,
          authUser: authUser,
        })
          .catch((error) => {
            console.error(error);
            throw error;
          })
          .finally(() => {
            // Einen Schritt weiter
            goToStepGroup();
          });
      })
      .catch((error: FieldValidationError) => {
        console.error(error);
        if (error.formValidation) {
          dispatch({type: ReducerActions.FORM_FIELD_ERROR, payload: error});
          // setFormValidation(error.formValidation);
          // Zum 1. Fehler-Feld scrollen
          const element = document.getElementById(
            error.formValidation[0].fieldName
          );
          element && element.scrollIntoView({behavior: "smooth"});
          return;
        }
        // Neuer Fehler // ValidationError im Reducer
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      });
  };

  return (
    <React.Fragment>
      <PageTitle
        title={TEXT_CREATE_YOUR_EVENT}
        subTitle={TEXT_WHAT_ARE_YOU_UP_TO}
      />
      <CreateEventStepper activeStep={activeStep} />
      <Backdrop className={classes.backdrop} open={state.isSaving}>
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.centerCenter}>
            <CircularProgress color="inherit" />
          </Grid>
          <Grid item xs={12} className={classes.centerCenter}>
            <Typography>
              {TEXT_EVENT_IS_BEEING_CREATED(state.event.name)}
            </Typography>
          </Grid>
          {state.localPicture && (
            <Grid item xs={12} className={classes.centerCenter}>
              <Typography>{TEXT_IMAGE_IS_BEEING_UPLOADED}</Typography>
            </Grid>
          )}
        </Grid>
      </Backdrop>

      <Container className={classes.container} component="main" maxWidth="md">
        <Grid container spacing={2}>
          {state.isError && (
            <Grid item key={"error"} xs={12}>
              <AlertMessage
                error={state.error as Error}
                messageTitle={TEXT_ALERT_TITLE_WAIT_A_MINUTE}
              />
            </Grid>
          )}

          {activeStep == WizardSteps.info ? (
            <React.Fragment>
              <Grid item xs={12}>
                <EventInfoPage
                  event={state.event}
                  localPicture={state.localPicture}
                  formValidation={state.eventFormValidation}
                  firebase={firebase}
                  authUser={authUser}
                  onUpdateEvent={onUpdateEvent}
                  onUpdatePicture={onUpdatePicture}
                  onError={onEventError}
                />
              </Grid>
              <Grid item xs={12} container justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={goToOvierview}
                >
                  {TEXT_BACK_TO_OVERVIEW}
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  style={{marginLeft: "1rem"}}
                  onClick={onCreateEvent}
                >
                  {TEXT_CONTIUNE}
                </Button>
              </Grid>
            </React.Fragment>
          ) : activeStep === WizardSteps.groupConfig ? (
            <Grid item xs={12}>
              <EventGroupConfigurationPage
                firebase={firebase}
                authUser={authUser}
                event={state.event}
                onConfirm={{buttonText: TEXT_CONTIUNE, onClick: goToResume}}
                onCancel={{
                  buttonText: TEXT_BACK_TO_EVENT_INFO,
                  onClick: goToStepInfo,
                }}
              />
            </Grid>
          ) : (
            <Grid item xs={12}>
              <CreateEventCompletion
                event={state.event}
                onReturn={goToStepGroup}
                onProceed={goToMenuplan}
              />
            </Grid>
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// =============================== Resume ============================
// =================================================================== */
interface CreateEventCompletionProps {
  event: Event;
  onReturn: () => void;
  onProceed: () => void;
}
const CreateEventCompletion = ({
  event,
  onProceed,
  onReturn,
}: CreateEventCompletionProps) => {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="md">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={TEXT_COMPLETION} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>
                    {TEXT_RESUME_INTRODUCTION(event.name)}
                  </Typography>
                  <br />
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
                </Grid>
                <Grid item xs={12}>
                  <Grid container justifyContent="center">
                    <img
                      src={
                        ImageRepository.getEnviromentRelatedPicture()
                          .TWINT_QR_CODE
                      }
                      className={classes.cardMediaQrCode}
                      style={{maxWidth: "100%", height: "auto"}}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container justifyContent="center">
                    <TwintButton />
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} container justifyContent="flex-end">
              <Button variant="outlined" color="primary" onClick={onReturn}>
                {TEXT_BACK_TO_GROUPCONFIG}
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{marginLeft: "1rem"}}
                onClick={onProceed}
              >
                {TEXT_CONTIUNE}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
// ===================================================================
// ============================ Twint Button =========================
// =================================================================== */
const TwintButton = () => {
  const classes = useStyles();
  // const theme = useTheme();
  const [darkMode, setDarkMode] = React.useState(false);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  React.useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  return (
    <Button
      // style={{paddingLeft: theme.spacing(2), marginRight: theme.spacing(2)}}
      fullWidth
      startIcon={
        <img
          src={
            darkMode
              ? "https://assets.raisenow.io/twint-logo-light.svg"
              : "https://assets.raisenow.io/twint-logo-dark.svg"
          }
          alt="Twint-Icon"
        />
      }
      onClick={() => {
        window.open(TWINT_PAYLINK, "_blank");
      }}
      className={`${classes.twintButton} ${
        darkMode ? classes.twintButtonDarkMode : classes.twintButtonLightMode
      }`}
    >
      Mit TWINT bezahlen
    </Button>
  );
};
/* ===================================================================
// ============================== Stepper ============================
// =================================================================== */
interface CreateEventStepperProps {
  activeStep: WizardSteps;
}
const CreateEventStepper = ({activeStep}: CreateEventStepperProps) => {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      <Step key={WizardSteps.info}>
        <StepLabel>{TEXT_EVENT_INFO}</StepLabel>
      </Step>
      <Step key={WizardSteps.groupConfig}>
        <StepLabel>{TEXT_QUANTITY_CALCULATION_INFO}</StepLabel>
      </Step>
      <Step key={WizardSteps.completion}>
        <StepLabel>{TEXT_COMPLETION}</StepLabel>
      </Step>
    </Stepper>
  );
};

const condition = (authUser: AuthUser | null) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(CreateEventPage);
