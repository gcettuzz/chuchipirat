import React from "react";
import Fab from "@material-ui/core/Fab";
import FeedbackIcon from "@material-ui/icons/Feedback";
import * as Sentry from "@sentry/react";
import useStyles from "../../constants/styles";

const FeedbackFab = () => {
  const classes = useStyles();
  //TODO: löschen
  const feedback = Sentry.feedbackIntegration({
    autoInject: false,
    colorScheme: "system",
    showBranding: false,
    triggerLabel: "Bug melden",
    formTitle: "Bug / Wunsch melden",
    submitButtonLabel: "Meldung senden",
    cancelButtonLabel: "Abbrechen",
    addScreenshotButtonLabel: "Screenshot hinzufügen",
    removeScreenshotButtonLabel: "Screenshot löschen",
    namePlaceholder: "Dein Name",
    emailPlaceholder: "deine.email@beispiel.ch",
    messageLabel: "Beschreibung",
    messagePlaceholder: "Was möchtest du uns melden?",
    successMessageText: "Danke für deine Rückmeldung.",
  });
  const button = document.getElementById("custom-feedback-button");
  if (button) {
    console.info("häh");
    feedback.attachTo(button);
  }

  return (
    <Fab
      id="custom-feedback-button"
      color="secondary"
      size="small"
      aria-label="Feedback geben"
      className={classes.fabBottom}
    >
      <FeedbackIcon />
    </Fab>
  );
};

export default FeedbackFab;
