import React from "react";
import { Alert, AlertTitle, Color } from "@material-ui/lab";
import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";
import useStyles from "../../constants/styles";

interface AlertMessageProps {
  error?: object;
  severity?: Color;
  messageTitle?: string;
  body: string;
}

/* ===================================================================
// =============================== Alert =============================
// =================================================================== */
const AlertMessage = ({
  error,
  severity = "error",
  messageTitle = "",
  body,
}: AlertMessageProps) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Alert severity={severity} className={classes.alertMessage}>
        {messageTitle && <AlertTitle>{messageTitle}</AlertTitle>}
        <React.Fragment>
          {error && FirebaseMessageHandler.translateMessage(error)}
          {body}
        </React.Fragment>
      </Alert>
    </React.Fragment>
  );
};

export default AlertMessage;
