import React from "react";
import PageTitle from "../Shared/pageTitle";
import {Container, Link, Typography} from "@mui/material";
import {Alert, AlertTitle} from "@mui/lab";
import {
  HOME as ROUTE_HOME,
  SIGN_IN as ROUTE_SIGN_IN,
} from "../../constants/routes";
import {useHistory} from "react-router";
import {
  ALERT_TITLE_WAIT_A_MINUTE as TEXT_ALERT_TITLE_WAIT_A_MINUTE,
  ALERT_TITLE_MUTINY_ON_THE_HIGH_SEAS as TEXT_ALERT_TITLE_MUTINY_ON_THE_HIGH_SEAS,
  REDIRECTION_IN as TEXT_REDIRECTION_IN,
  NO_AUTH_REDIRECT_TO_HOME as TEXT_NO_AUTH_REDIRECT_TO_HOME,
  OR_CLICK as TEXT_OR_CLICK,
  IF_YOU_ARE_IMPATIENT as TEXT_IF_YOU_ARE_IMPATIENT,
  HERE as TEXT_HERE,
} from "../../constants/text";
import useStyles from "../../constants/styles";

const NoAuthPage = () => {
  const authUser = null;
  const [timer, setTimer] = React.useState(20);
  const {push} = useHistory();
  const classes = useStyles();

  React.useEffect(() => {
    if (timer === 0) {
      setTimeout(
        () =>
          authUser !== null
            ? push({pathname: ROUTE_HOME})
            : push({pathname: ROUTE_SIGN_IN}),
        500
      );
    } else {
      setTimeout(() => setTimer(timer - 1), 1000);
    }
  }, [timer]);

  return (
    <React.Fragment>
      <PageTitle title={TEXT_ALERT_TITLE_WAIT_A_MINUTE} />
      <Container className={classes.container} component="main" maxWidth="xs">
        <Alert severity="warning">
          <AlertTitle>
            {TEXT_ALERT_TITLE_MUTINY_ON_THE_HIGH_SEAS} - {TEXT_REDIRECTION_IN}{" "}
            {timer}
          </AlertTitle>
          <Typography>
            {TEXT_NO_AUTH_REDIRECT_TO_HOME}
            <br />
            {TEXT_OR_CLICK}
            <Link
              onClick={() => {
                authUser !== null
                  ? push({pathname: ROUTE_HOME})
                  : push({pathname: ROUTE_SIGN_IN});
              }}
            >
              {TEXT_HERE}
            </Link>
            {", "}
            {TEXT_IF_YOU_ARE_IMPATIENT}.
          </Typography>
        </Alert>
      </Container>
    </React.Fragment>
  );
};

export default NoAuthPage;
