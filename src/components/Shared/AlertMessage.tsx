import React from "react";
import {Alert, AlertColor, AlertTitle} from "@mui/material";
import FirebaseMessageHandler from "../Firebase/firebaseMessageHandler.class";
import useCustomStyles from "../../constants/styles";

interface AlertMessageProps {
  error?: Error | null;
  severity?: AlertColor;
  messageTitle?: string;
  body?: string | JSX.Element;
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
  const classes = useCustomStyles();
  return (
    <React.Fragment>
      <Alert severity={severity} sx={classes.alertMessage}>
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
