import React from "react";
import {useHistory} from "react-router";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";

import TextField from "@material-ui/core/TextField";
import {
  Link,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@material-ui/core";
import useStyles from "../../constants/styles";

import {FormListItem} from "../Shared/formListItem";

import {
  REQUEST as TEXT_REQUEST,
  REQUEST_TYPE_LABEL as TEXT_REQUEST_TYPE_LABEL,
  REQUEST_OBJECT_LABEL as TEXT_REQUEST_OBJECT_LABEL,
  REQUEST_STATUS as TEXT_REQUEST_STATUS,
  REQUEST_NEXT_POSSIBLE_TRANSITION_LABEL as TEXT_REQUEST_NEXT_POSSIBLE_TRANSITION_LABEL,
  REQUEST_CREATION_DATE as TEXT_REQUEST_CREATION_DATE,
  REQUEST_AUTHOR_DISPLAYNAME as TEXT_REQUEST_AUTHOR_DISPLAYNAME,
  REQUEST_ASSIGNEE_DISPLAYNAME as TEXT_REQUEST_ASSIGNEE_DISPLAYNAME,
  REQUEST_ASSIGN_TO_ME_LABEL as TEXT_REQUEST_ASSIGN_TO_ME_LABEL,
  // REQUEST_CONTINUE_WITH as TEXT_REQUEST_CONTINUE_WITH,
  BUTTON_CANCEL as TEXT_BUTTON_CANCEL,
  BUTTON_CLOSE as TEXT_BUTTON_CLOSE,
  COMMENTS as TEXT_COMMENTS,
  FIELD_YOUR_COMMENT as TEXT_FIELD_YOUR_COMMENT,
  BUTTON_ADD_COMMENT as TEXT_BUTTON_ADD_COMMENT,
  UID as TEXT_UID,
} from "../../constants/text";

import {USER_PUBLIC_PROFILE as ROUTES_USER_PUBLIC_PROFILE} from "../../constants/routes";
import Action from "../../constants/actions";

import {RequestStatus} from "./request.class";
import {Request} from "./internal";
import AuthUser from "../Firebase/Authentication/authUser.class";
import Role from "../../constants/roles";
import {StatusChips} from "./requestOverview";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */

/* ===================================================================
// =================== Pop Up Rezept veröffentlichen =================
// =================================================================== */
interface DialogRequestProps {
  request: Request;
  dialogOpen: boolean;
  authUser: AuthUser;
  handleClose: () => void;
  handleUpdateStatus: (nextStatus: RequestStatus) => void;
  handleAssignToMe: () => void;
  handleAddComment: (newComment: string) => void;
  handleRecipeOpen: (uid: string) => void;
}

const DialogRequest = ({
  request,
  dialogOpen,
  authUser,
  handleClose,
  handleUpdateStatus,
  handleAssignToMe,
  handleAddComment,
  handleRecipeOpen,
}: DialogRequestProps) => {
  const classes = useStyles();
  const {push} = useHistory();

  const [comment, setComment] = React.useState("");
  /* ------------------------------------------
  // PopUp Abbrechen
  // ------------------------------------------ */
  const onCancelClick = () => {
    handleClose();
  };

  const onClickNextStatus = (nextStatus: RequestStatus) => {
    handleUpdateStatus(nextStatus);
  };
  /* ------------------------------------------
  // Kommentar zwischenspeichern
  // ------------------------------------------ */
  const onChangeComment = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };
  const saveComment = () => {
    handleAddComment(comment);
    setComment("");
  };
  const clearComment = () => {
    setComment("");
  };
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialog Request"
      fullWidth={true}
      maxWidth="sm"
    >
      <DialogTitle
        className={classes.dialogHeaderWithPicture}
        style={{
          backgroundImage: `url(${request?.requestObject?.pictureSrc})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        disableTypography
      >
        <Typography
          variant="h4"
          component="h1"
          className={classes.dialogHeaderWithPictureTitle}
          style={{paddingLeft: "2ex"}}
        >
          {TEXT_REQUEST} #{request.number}
        </Typography>
      </DialogTitle>

      <DialogContent style={{overflow: "unset"}}>
        <List>
          {/* Request Type */}
          <FormListItem
            key={"RequestType"}
            id={"RequestType"}
            value={Request.translateType(request.requestType)}
            label={TEXT_REQUEST_TYPE_LABEL}
          />
          {/* UID */}
          {authUser.roles.includes(Role.admin) && (
            <FormListItem
              key={"RequestUid"}
              id={"RequestUid"}
              value={request.uid}
              label={TEXT_UID}
              displayAsCode={true}
            />
          )}
          {/* Request Name */}
          <FormListItem
            key={"RequestName"}
            id={"RequestName"}
            value={
              <Link
                style={{cursor: "pointer"}}
                onClick={() => handleRecipeOpen(request.requestObject?.uid)}
              >
                {request.requestObject?.name}
              </Link>
            }
            label={TEXT_REQUEST_OBJECT_LABEL}
          />
          {/* Status */}
          <FormListItem
            key={"RequestStatus"}
            id={"RequestStatus"}
            value={<StatusChips status={request.status} />}
            label={TEXT_REQUEST_STATUS}
          />
          {/* Nächster möglicher Status */}
          {/* Nur möglich für andere. Selber kann man nicht verschieben */}
          {authUser?.uid !== request?.author?.uid && (
            <FormListItem
              key={"RequestNextPossibleState"}
              id={"RequestRequestNextPossibleStateType"}
              value={
                <React.Fragment>
                  {Request.getNextPossibleTransitionsForType({
                    status: request.status,
                    requestType: request.requestType,
                  })?.map((possibleTransition, counter) => (
                    <React.Fragment
                      key={
                        "transition_" + possibleTransition.description + counter
                      }
                    >
                      {counter > 0 && " | "}
                      <Link
                        key={`transitionLink_${counter}`}
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          onClickNextStatus(possibleTransition.toState)
                        }
                      >
                        {possibleTransition.description}
                      </Link>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              }
              label={TEXT_REQUEST_NEXT_POSSIBLE_TRANSITION_LABEL}
            />
          )}
          {/* Datum */}
          <FormListItem
            key={"RequestCreateDate"}
            id={"RequestCreateDate"}
            value={request?.createDate?.toLocaleString("de-CH", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
            label={TEXT_REQUEST_CREATION_DATE}
          />

          {/* Autor*in */}
          <FormListItem
            key={"RequestAuthor"}
            id={"RequestAuthor"}
            value={
              <Link
                style={{cursor: "pointer"}}
                onClick={() =>
                  push({
                    pathname: `${ROUTES_USER_PUBLIC_PROFILE}/${request.author.uid}`,
                    state: {
                      action: Action.VIEW,
                      displayName: request.author?.displayName,
                      pictureSrc: request.author?.pictureSrc,
                    },
                  })
                }
              >
                {request.author?.displayName}
              </Link>
            }
            label={TEXT_REQUEST_AUTHOR_DISPLAYNAME}
          />

          {/* Bearbeiter*in */}
          <FormListItem
            key={"RequestAsignee"}
            id={"RequestAsignee"}
            value={
              <React.Fragment>
                <Link
                  style={{cursor: "pointer"}}
                  onClick={() =>
                    push({
                      pathname: `${ROUTES_USER_PUBLIC_PROFILE}/${request?.assignee?.uid}`,
                      state: {
                        action: Action.VIEW,
                        displayName: request.assignee?.displayName,
                        pictureSrc: request.assignee?.pictureSrc,
                      },
                    })
                  }
                >
                  {request.assignee?.displayName}
                </Link>
                {authUser.roles.includes(Role.communityLeader) &&
                request?.assignee?.uid !== authUser?.uid &&
                request?.author?.uid !== authUser?.uid ? (
                  <Link
                    style={{cursor: "pointer"}}
                    onClick={() => handleAssignToMe()}
                  >
                    {TEXT_REQUEST_ASSIGN_TO_ME_LABEL}
                  </Link>
                ) : null}
              </React.Fragment>
            }
            label={TEXT_REQUEST_ASSIGNEE_DISPLAYNAME}
          />
        </List>

        {request?.comments?.length > 0 && (
          <React.Fragment>
            <Typography variant="subtitle1" style={{marginTop: "4ex"}}>
              {TEXT_COMMENTS}
            </Typography>
            <List>
              {request.comments.map((comment, counter) => (
                <React.Fragment key={`comment_${counter}`}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      {comment.user?.pictureSrc ? (
                        <Avatar
                          alt={comment.user.displayName}
                          src={comment.user.pictureSrc}
                        />
                      ) : (
                        <Avatar alt={comment.user.displayName}>
                          {comment.user?.displayName.charAt(0)}
                        </Avatar>
                      )}
                    </ListItemAvatar>

                    <ListItemText
                      primary={comment.comment}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            // className={classes.inline}
                            color="textPrimary"
                          >
                            {comment.user.displayName}
                          </Typography>
                          {` — ${comment.date.toLocaleString("de-CH", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {counter !== request.comments.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </React.Fragment>
        )}
        <TextField
          id="outlined-multiline-static"
          label={TEXT_FIELD_YOUR_COMMENT}
          multiline
          minRows={4}
          variant="outlined"
          fullWidth
          value={comment}
          onChange={onChangeComment}
        />
        <Button size="small" onClick={saveComment}>
          {TEXT_BUTTON_ADD_COMMENT}
        </Button>
        <Button size="small" onClick={clearComment}>
          {TEXT_BUTTON_CANCEL}
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick} variant="outlined">
          {TEXT_BUTTON_CLOSE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DialogRequest;
