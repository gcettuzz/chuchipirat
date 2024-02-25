import React from "react";
import useStyles from "../../../constants/styles";

import {
  Typography,
  Card,
  CardMedia,
  CardHeader,
  CardActionArea,
} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";

import Event from "./event.class";
import {CARD_PLACEHOLDER_PICTURE} from "../../../constants/defaultValues";

interface EventCardProps {
  event: Event;
  onCardClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
// ===================================================================== */
/**
 * Rezept-Karte
 * @param Objekt nach mit Event und onCardClickAction
 * @returns JSX-Element
 */

const EventCard = ({event, onCardClick}: EventCardProps) => {
  const classes = useStyles();
  const [hover, setHover] = React.useState(false);

  /* ------------------------------------------
  // Hover
  // ------------------------------------------ */
  const handleHover = () => {
    setHover(true);
  };
  const handleMouseOut = () => {
    setHover(false);
  };
  return (
    <Card
      className={classes.card}
      onMouseOver={handleHover}
      onMouseOut={handleMouseOut}
      key={"eventcard_" + event.uid}
    >
      <CardActionArea
        name={"eventCardActionArea_" + event.uid}
        onClick={onCardClick}
        style={{height: "100%"}}
      >
        <div className={classes.card}>
          <div style={{overflow: "hidden"}}>
            <CardMedia
              className={classes.cardMedia}
              image={
                event.pictureSrc ? event.pictureSrc : CARD_PLACEHOLDER_PICTURE()
              }
              title={event.name}
              style={{
                transform: hover ? "scale(1.05)" : "scale(1)",
                transition: "0.5s ease",
                // backgroundSize: "contain",
              }}
            />
          </div>
          <CardHeader
            title={event.name}
            subheader={
              <Typography variant="body2" color="textSecondary">
                {event.motto}
              </Typography>
            }
          />
        </div>
      </CardActionArea>
    </Card>
  );
};
/* ===================================================================
// =====================Rezept Karte am laden ========================
// =================================================================== */
const EventCardLoading = () => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      {/* Card Media */}
      <Skeleton animation="wave" variant="rect" className={classes.cardMedia} />

      <CardHeader
        className={classes.cardContent}
        title={
          <Typography gutterBottom={true} variant="h5" component="h2">
            <Skeleton />
          </Typography>
        }
      ></CardHeader>
    </Card>
  );
};

export default EventCard;
export {EventCardLoading};
