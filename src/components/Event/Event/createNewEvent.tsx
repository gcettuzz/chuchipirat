import React from "react";
import {useHistory} from "react-router";

import {compose} from "recompose";
import {Container, Stepper, Step, StepLabel} from "@material-ui/core";

import {
  CREATE_YOUR_EVENT as TEXT_CREATE_YOUR_EVENT,
  WHAT_ARE_YOU_UP_TO as TEXT_WHAT_ARE_YOU_UP_TO,
  EVENT_INFO as TEXT_EVENT_INFO,
  QUANTITY_CALCULATION_INFO as TEXT_QUANTITY_CALCULATION_INFO,
  CONTINUE as TEXT_CONTIUNE,
  BACK_TO_OVERVIEW as TEXT_BACK_TO_OVERVIEW,
  BACK_TO_EVENT_INFO as TEXT_BACK_TO_EVENT_INFO,
} from "../../../constants/text";

import useStyles from "../../../constants/styles";
import PageTitle from "../../Shared/pageTitle";
import EventInfoPage from "./eventInfo";
import EventGroupConfigurationPage from "../GroupConfiguration/groupConfigruation";
import Event from "./event.class";

import {
  HOME as ROUTE_HOME,
  CREATE_NEW_EVENT as ROUTE_CREATE_NEW_EVENT,
  EVENT as ROUTE_EVENT,
} from "../../../constants/routes";

import Firebase, {withFirebase} from "../../Firebase";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../../Session";
import AuthUser from "../../Firebase/Authentication/authUser.class";
import {
  NavigationValuesContext,
  NavigationObject,
} from "../../Navigation/navigationContext";
import Action from "../../../constants/actions";

/* ===================================================================
// ============================== Global =============================
// =================================================================== */
enum WizardSteps {
  info,
  groupConfig,
}
/* ===================================================================
// ============================ Dispatcher ===========================
// =================================================================== */

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const CreateEventPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <CreateEventBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

/* ===================================================================
// =============================== Base ==============================
// =================================================================== */

const CreateEventBase = ({props, authUser}) => {
  const firebase = props.firebase as Firebase;
  const classes = useStyles();
  const {push} = useHistory();
  const navigationValuesContext = React.useContext(NavigationValuesContext);

  const [activeStep, setActiveStep] = React.useState(WizardSteps.info);
  const [eventInfo, setEventInfo] = React.useState<Event>({} as Event);

  /* ------------------------------------------
  // Navigation-Handler
  // ------------------------------------------ */
  React.useEffect(() => {
    navigationValuesContext?.setNavigationValues({
      action: Action.NEW,
      object: NavigationObject.none,
    });
  }, []);

  /* ------------------------------------------
  // Step-Steuerung
  // ------------------------------------------ */
  const goToStepGroup = (
    event: React.MouseEvent<HTMLButtonElement>,
    value?: {[key: string]: any}
  ) => {
    if (value) {
      setEventInfo(value as Event);
    }
    setActiveStep(WizardSteps.groupConfig);
  };

  const goToOvierview = () => {
    push({
      pathname: `${ROUTE_HOME}`,
    });
  };
  const goToStepInfo = () => {
    setActiveStep(WizardSteps.info);
  };
  const goToMenuplan = (
    event: React.MouseEvent<HTMLButtonElement>,
    value?: {[key: string]: any}
  ) => {
    push({
      pathname: `${ROUTE_EVENT}/${eventInfo.uid}`,
      state: {event: eventInfo, groupConfig: value},
    });
  };

  return (
    <React.Fragment>
      <PageTitle
        title={TEXT_CREATE_YOUR_EVENT}
        subTitle={TEXT_WHAT_ARE_YOU_UP_TO}
      />
      <CreateEventStepper activeStep={activeStep} />
      <Container className={classes.container} component="main" maxWidth="md">
        {activeStep == WizardSteps.info ? (
          <EventInfoPage
            firebase={firebase}
            authUser={authUser}
            onConfirm={{buttonText: TEXT_CONTIUNE, onClick: goToStepGroup}}
            onCancel={{
              buttonText: TEXT_BACK_TO_OVERVIEW,
              onClick: goToOvierview,
            }}
          />
        ) : (
          <EventGroupConfigurationPage
            firebase={firebase}
            authUser={authUser}
            event={eventInfo}
            onConfirm={{buttonText: TEXT_CONTIUNE, onClick: goToMenuplan}}
            onCancel={{
              buttonText: TEXT_BACK_TO_EVENT_INFO,
              onClick: goToStepInfo,
            }}
          />
        )}
      </Container>
    </React.Fragment>
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
    </Stepper>
  );
};
const condition = (authUser: AuthUser) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(CreateEventPage);
