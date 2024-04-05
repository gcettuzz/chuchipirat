/* eslint-disable react/prop-types */ // TODO: upgrade to latest eslint tooling

import React from "react";
import {compose} from "react-recompose";
// import useStyles from "../../constants/styles";

// import initialData, {InitialData, ColumnProps, TaskProps} from "./initial-data";

import Typography from "@material-ui/core/Typography";
// import TextField from "@material-ui/core/TextField";
// import SearchIcon from "@material-ui/icons/Search";
// import ClearIcon from "@material-ui/icons/Clear";
// import IconButton from "@material-ui/core/IconButton";
// import InputAdornment from "@material-ui/core/InputAdornment";
// import OutlinedInput from "@material-ui/core/OutlinedInput";
// import InputLabel from "@material-ui/core/InputLabel";
// import FormControl from "@material-ui/core/FormControl";

// import {
//   DialogType,
//   SingleTextInputResult,
//   useCustomDialog,
// } from "../Shared/customDialogContext";

import {
  // Card,
  // CardMedia,
  // CardContent,
  // makeStyles,
  // CardHeader,
  Container,
  // List,
  // ListItem,
  // ListItemText,
  // Divider,
  Grid,
} from "@material-ui/core";

import Button from "@material-ui/core/Button";
// import Input from "@material-ui/core/Input";
// import Link from "@material-ui/core/Link";
import Role from "../../constants/roles";

import {withFirebase} from "../Firebase/firebaseContext";
// import {AuthUser} from "../Firebase/Authentication/authUser.class";

import withEmailVerification from "../Session/withEmailVerification";
import AuthUser from "../Firebase/Authentication/authUser.class";
import {CustomRouterProps} from "../Shared/global.interface";
import {AuthUserContext, withAuthorization} from "../Session/authUserContext";
import {Request} from "../Request/request.class";
import Feed from "../Shared/feed.class";
// import {
//   Ingredient,
//   PositionType,
//   PreparationStep,
//   RecipeMaterialPosition,
//   RecipeObjectStructure,
// } from "../Recipe/recipe.class";
// import Feed, {FeedType} from "../Shared/feed.class";
// import {userInfo} from "os";
// import Request from "../Request/request.class";

// const TempPage = (props) => {
//   return (
//     <AuthUserContext.Consumer>
//       {(authUser) => <TempBase props={props} authUser={authUser} />}
//     </AuthUserContext.Consumer>
//   );
// };

// const appUrl = "http://localhost:3000";

/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const TempPage = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <TempBase {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};
/* ===================================================================
// =============================== Base ==============================
// =================================================================== */
const TempBase: React.FC<CustomRouterProps & {authUser: AuthUser | null}> = ({
  authUser,
  ...props
}) => {
  const firebase = props.firebase;

  if (!authUser) {
    return null;
  }

  const rebuildFeedLog = async () => {
    const newStructure = {};
    await Feed.getFeedsLog({
      firebase: firebase,
    }).then((result) => {
      result.forEach((feed) => {
        newStructure[feed.uid] = {
          created: feed.created,
          text: feed.text,
          title: feed.title,
          type: feed.type,
          visibility: feed["visibilty"],
        };
      });

      firebase.feed.log.set({
        uids: [],
        value: newStructure,
        authUser: authUser,
      });
    });
  };

  return (
    <React.Fragment>
      <Container style={{marginTop: "3rem"}} component="main" maxWidth="md">
        <Typography variant="h1" align="center">
          TEMP
        </Typography>
        <Grid container justifyContent="center">
          <Button variant="outlined" color="primary" onClick={rebuildFeedLog}>
            Feed Log neu aufbauen
          </Button>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

const condition = (authUser: AuthUser | null) =>
  !!authUser && !!authUser.roles.includes(Role.admin);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(TempPage);
