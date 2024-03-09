import React from "react";
import useStyles from "../../../constants/styles";

import Button from "@material-ui/core/Button";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import CardMedia from "@material-ui/core/CardMedia";

import {DialogContent, Link, List} from "@material-ui/core";
import {FormListItem} from "../../Shared/formListItem";

import Firebase from "../../Firebase/firebase.class";

import {
  LOCATION as TEXT_LOCATION,
  UID as TEXT_UID,
  MOTTO as TEXT_MOTTO,
  NO_OF_COOKS as TEXT_NO_OF_COOKS,
  NO_OF_DAYS as TEXT_NO_OF_DAYS,
  START_DATE as TEXT_START_DATE,
  END_DATE as TEXT_END_DATE,
  CREATED_FROM as TEXT_CREATED_FROM,
} from "../../../constants/text";

import EventShort from "./eventShort.class";
import Event from "./event.class";
import {ImageRepository} from "../../../constants/imageRepository";
import {useHistory} from "react-router";
import Action from "../../../constants/actions";
import {USER_PUBLIC_PROFILE as ROUTES_USER_PUBLIC_PROFILE} from "../../../constants/routes";

export interface DialogQuickViewActions {
  key: string;
  name: string;
  variant: "text" | "outlined" | "contained";
  onClick: (
    event: React.MouseEvent<HTMLButtonElement> | undefined,
    recipe: Event
  ) => void;
}

/* ===================================================================
// ==================== Pop Up Event Kurzübersicht ==================
// =================================================================== */
interface DialogEventQuickViewProps {
  firebase: Firebase;
  eventShort: EventShort;
  dialogOpen: boolean;
  handleClose: (event, reason) => void;
  dialogActions: DialogQuickViewActions[];
}

const DialogEventQuickView = ({
  firebase,
  eventShort,
  dialogOpen,
  handleClose,
  dialogActions,
}: DialogEventQuickViewProps) => {
  const [event, setEvent] = React.useState<Event>(new Event());
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const classes = useStyles();
  const {push} = useHistory();

  if (eventShort?.uid && !event.uid) {
    Event.getEvent({
      firebase: firebase,
      uid: eventShort.uid,
    }).then((result) => {
      setEvent(result);
      setIsLoading(false);
    });
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="Event Quick View"
      fullWidth
      maxWidth={"sm"}
      open={dialogOpen}
      scroll={"paper"}
    >
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {eventShort.pictureSrc && (
        <CardMedia
          className={classes.cardMedia}
          image={
            eventShort.pictureSrc
              ? eventShort.pictureSrc
              : ImageRepository.getEnviromentRelatedPicture()
                  .CARD_PLACEHOLDER_MEDIA
          }
          title={"Bild " + eventShort.name}
        />
      )}
      <DialogTitle id="simple-dialog-title">{eventShort.name}</DialogTitle>
      <DialogContent>
        <List dense>
          {/* UID */}
          <FormListItem
            key={"uid"}
            id={"uid"}
            value={event.uid}
            label={TEXT_UID}
            displayAsCode={true}
          />

          {/* Ort */}
          <FormListItem
            key={"location"}
            id={"location"}
            value={event.location}
            label={TEXT_LOCATION}
          />
          {/* Motto */}
          <FormListItem
            key={"motto"}
            id={"motto"}
            value={event.motto}
            label={TEXT_MOTTO}
          />
          {/* Anzahl Köche */}
          <FormListItem
            key={"noOfCooks"}
            id={"noOfCooks"}
            value={event.authUsers.length}
            label={TEXT_NO_OF_COOKS}
          />
          {/* Start-Datum */}
          <FormListItem
            key={"startDate"}
            id={"startDate"}
            value={
              event.dates[0]?.from
                ? new Intl.DateTimeFormat("de-CH", {
                    dateStyle: "medium",
                  }).format(new Date(event.dates[0]?.from))
                : ""
            }
            label={TEXT_START_DATE}
          />
          {/* Ende-Datum */}
          <FormListItem
            key={"EndDate"}
            id={"EndDate"}
            value={new Intl.DateTimeFormat("de-CH", {
              dateStyle: "medium",
            }).format(event.maxDate as Date)}
            label={TEXT_END_DATE}
          />
          {/* Anzahl Tage */}
          <FormListItem
            key={"noOfDays"}
            id={"noOfDays"}
            value={event.numberOfDays}
            label={TEXT_NO_OF_DAYS}
          />
          {/* Autor*in */}
          <FormListItem
            key={"author"}
            id={"author"}
            value={
              <Link
                style={{cursor: "pointer"}}
                onClick={() =>
                  push({
                    pathname: `${ROUTES_USER_PUBLIC_PROFILE}/${event.created.fromUid}`,
                    state: {
                      action: Action.VIEW,
                      displayName: event.created.fromDisplayName,
                    },
                  })
                }
              >
                {event.created.fromDisplayName}
              </Link>
            }
            label={TEXT_CREATED_FROM}
          />
          <FormListItem
            key={"authorUid"}
            id={"authorUid"}
            value={event.created.fromUid}
            label={`${TEXT_CREATED_FROM} ${TEXT_UID}`}
            displayAsCode={true}
          />
        </List>
      </DialogContent>
      <DialogActions>
        {dialogActions.map((action) => (
          <Button
            key={action.key}
            id={action.key}
            size="small"
            color="primary"
            variant={action.variant}
            onClick={(actionEvent) => action.onClick(actionEvent, event)}
          >
            {action.name}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default DialogEventQuickView;
