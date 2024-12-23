import React from "react";
import {compose} from "react-recompose";

import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  useTheme,
  LinearProgress,
} from "@mui/material";

import {
  ACTIVATE_SUPPORT_USER as TEXT_ACTIVATE_SUPPORT_USER,
  EVENT_UID as TEXT_EVENT_UID,
  ACTIVATE_SUPPORT_MODE as TEXT_ACTIVATE_SUPPORT_MODE,
  ACTIVATE_SUPPORT_MODE_DESCRIPTION as TEXT_ACTIVATE_SUPPORT_MODE_DESCRIPTION,
  SUPPORT_USER_REGISTERED as TEXT_SUPPORT_USER_REGISTERED,
} from "../../constants/text";
import Role from "../../constants/roles";

import useStyles from "../../constants/styles";

import {withFirebase} from "../Firebase/firebaseContext";
import AuthUser from "../Firebase/Authentication/authUser.class";
import withEmailVerification from "../Session/withEmailVerification";
import {CustomRouterProps} from "../Shared/global.interface";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import PageTitle from "../Shared/pageTitle";
import Event from "../Event/Event/event.class";
import {Alert} from "@mui/lab";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
enum ReducerActions {
  EVENT_UID_UPDATE,
  ACTIVATE_SUPPORT_USER_START,
  ACTIVATE_SUPPORT_USER_FINISHED,
  GENERIC_ERROR,
}
type DispatchAction = {
  type: ReducerActions;
  payload: {[key: string]: any};
};

type State = {
  eventUid: Event["uid"];
  isActivating: boolean;
  activationComplete: boolean;
  errorMessage: Error["message"];
};

const inititialState: State = {
  eventUid: "",
  isActivating: false,
  activationComplete: false,
  errorMessage: "",
};

const activateSupportUserReducer = (
  state: State,
  action: DispatchAction
): State => {
  switch (action.type) {
    case ReducerActions.ACTIVATE_SUPPORT_USER_START:
      return {...state, isActivating: true};
    case ReducerActions.ACTIVATE_SUPPORT_USER_FINISHED:
      return {
        ...state,
        isActivating: false,
        activationComplete: true,
        errorMessage: action.payload.errorMessage,
      };
    case ReducerActions.EVENT_UID_UPDATE:
      return {...state, ...action.payload};
    case ReducerActions.GENERIC_ERROR:
      return {
        ...state,
        errorMessage: action.payload.message as Error["message"],
      };
    default:
      console.error("Unbekannter ActionType: ", action.type);
      throw new Error();
  }
};

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const ActivateSupportUserPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <ActivateSupportUserBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const ActivateSupportUserBase: React.FC<
  CustomRouterProps & {authUser: AuthUser | null}
> = ({authUser, ...props}) => {
  const firebase = props.firebase;
  const classes = useStyles();

  const [state, dispatch] = React.useReducer(
    activateSupportUserReducer,
    inititialState
  );

  /* ------------------------------------------
    // Delete Feeds Wert setzen
    // ------------------------------------------ */
  const onChangeEventUidField = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch({
      type: ReducerActions.EVENT_UID_UPDATE,
      payload: {[event.target.name]: event.target.value},
    });
  };
  /* ------------------------------------------
    // markierte Feeds löschen
    // ------------------------------------------ */
  const onRegisterSupportUser = () => {
    dispatch({
      type: ReducerActions.ACTIVATE_SUPPORT_USER_START,
      payload: {},
    });

    Event.activateSupportUser({
      firebase: firebase,
      eventUid: state.eventUid,
      authUser: authUser!,
      callback: (document) => {
        dispatch({
          type: ReducerActions.ACTIVATE_SUPPORT_USER_FINISHED,
          payload: document,
        });
      },
      errorCallback: (error) => {
        dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
      },
    }).catch((error) => {
      console.error(error);
      dispatch({type: ReducerActions.GENERIC_ERROR, payload: error});
    });
  };
  return (
    <React.Fragment>
      {/*===== HEADER ===== */}
      <PageTitle title={TEXT_ACTIVATE_SUPPORT_USER} subTitle="" />
      {/* ===== BODY ===== */}
      <Container className={classes.container} component="main" maxWidth="sm">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <PanelActivateSupportUser
              eventUid={state.eventUid}
              activationComplete={state.activationComplete}
              errorMessage={state.errorMessage}
              isActivating={state.isActivating}
              onChangeField={onChangeEventUidField}
              onRegisterSupportUser={onRegisterSupportUser}
            />
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
================== Feed Einträge nach Tagen löschen ===============
=================================================================== */
interface PanelActivateSupportUserProps {
  eventUid: Event["uid"];
  isActivating: boolean;
  activationComplete: boolean;
  errorMessage: Error["message"];
  onChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRegisterSupportUser: () => void;
}
const PanelActivateSupportUser = ({
  eventUid,
  isActivating,
  activationComplete,
  errorMessage,
  onChangeField,
  onRegisterSupportUser,
}: PanelActivateSupportUserProps) => {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <Card className={classes.card} key={"cardInfo"}>
      <CardHeader title={TEXT_ACTIVATE_SUPPORT_MODE} />
      <CardContent className={classes.cardContent} key={"cardContentInfo"}>
        <Typography style={{marginBottom: theme.spacing(2)}}>
          {TEXT_ACTIVATE_SUPPORT_MODE_DESCRIPTION}
        </Typography>

        <TextField
          id={"eventUid"}
          key={"eventUid"}
          label={TEXT_EVENT_UID}
          name={"eventUid"}
          required
          value={eventUid}
          onChange={onChangeField}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button
          fullWidth
          disabled={eventUid.length !== 20 && !isActivating}
          variant="contained"
          color="primary"
          onClick={onRegisterSupportUser}
          style={{marginTop: theme.spacing(2), marginBottom: theme.spacing(2)}}
        >
          {TEXT_ACTIVATE_SUPPORT_MODE}
        </Button>
        {isActivating && <LinearProgress />}
        {activationComplete &&
          (errorMessage ? (
            <Alert severity="error">{errorMessage}</Alert>
          ) : (
            <Alert severity="success">{TEXT_SUPPORT_USER_REGISTERED}</Alert>
          ))}
      </CardContent>
    </Card>
  );
};

const condition = (authUser: AuthUser | null) =>
  !!authUser &&
  (!!authUser.roles.includes(Role.communityLeader) ||
    !!authUser.roles.includes(Role.admin));

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(ActivateSupportUserPage);
