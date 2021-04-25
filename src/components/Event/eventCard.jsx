import React from "react";
import useStyles from "../../constants/styles";

// import Container from "@material-ui/core/Container";
// import Grid from "@material-ui/core/Grid";

// import IconButton from "@material-ui/core/IconButton";

import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";

import { EVENT_PLACEHOLDER_PICTURE } from "../../constants/defaultValues";

// import Menu from "@material-ui/core/Menu";
// import MenuItem from "@material-ui/core/MenuItem";
// import MenuList from "@material-ui/core/MenuList";
// import ListItemIcon from "@material-ui/core/ListItemIcon";

// import MoreVertIcon from "@material-ui/icons/MoreVert";
// import FileCopyIcon from "@material-ui/icons/FileCopy";
// import DeleteIcon from "@material-ui/icons/Delete";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */

/* ===================================================================
// ============================ Event karte ==========================
// =================================================================== */
const EventCard = ({ event, cardActions = [] }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardMedia
        className={classes.cardMedia}
        image={event.pictureSrc ? event.pictureSrc : EVENT_PLACEHOLDER_PICTURE}
        title={event.name}
      />
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {event.name}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          {event.motto ? event.motto : " - "}
        </Typography>
        <Typography variant="body2" component="p">
          {event.location}
        </Typography>
        {/* Nur maximal 3 Daten anzeigen, sonst wird die Karte riesig */}
        <Typography variant="body2" component="p">
          {event.dates.map((date, counter) =>
            counter < 2 || (counter === 2 && event.dates.length === 3) ? (
              <span key={"event_" + event.uid + "_date_" + date.from}>
                {date.from.toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
                {" - "}
                {date.to.toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
                {/* {date.from} {" - "} {date.to} */}
                <br></br>
              </span>
            ) : (
              "..."
            )
          )}
        </Typography>
      </CardContent>
      {cardActions.length > 0 && (
        <CardActions>
          {cardActions.map((action) => (
            <Button
              key={action.key + "_" + event.uid}
              id={action.key + "_" + event.uid}
              size="small"
              color="primary"
              onClick={(triggeredEvent) =>
                action.onClick(triggeredEvent, event)
              }
            >
              {action.name}
            </Button>
          ))}
        </CardActions>
      )}
    </Card>
  );
};

export default EventCard;
