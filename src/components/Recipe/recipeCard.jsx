import React from "react";
import useStyles from "../../constants/styles";

import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Skeleton from "@material-ui/lab/Skeleton";

export const RECIPE_PLACEHOLDER_PICTURE =
  "https://firebasestorage.googleapis.com/v0/b/chuchipirat-a99de.appspot.com/o/placeholder.png?alt=media&token=333b62f9-db26-4bdb-96ba-8f6bf95c8d1e";

const RecipeCard = ({ recipe, cardActions = [] }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardMedia
        className={classes.cardMedia}
        image={
          recipe.pictureSrc ? recipe.pictureSrc : RECIPE_PLACEHOLDER_PICTURE
        }
        title={recipe.name}
      />
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          {recipe.name}
        </Typography>
      </CardContent>
      {cardActions.length > 0 && (
        <CardActions>
          {cardActions.map((action) => (
            <Button
              key={action.key + "_" + recipe.uid}
              id={action.key + "_" + recipe.uid}
              size="small"
              color="primary"
              onClick={(event) => action.onClick(event, recipe)}
            >
              {action.name}
            </Button>
          ))}
        </CardActions>
      )}
    </Card>
  );
};
/* ===================================================================
// =====================Rezept Karte am laden ========================
// =================================================================== */
const RecipeCardLoading = () => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      {/* Card Media */}
      <Skeleton animation="wave" variant="rect" className={classes.cardMedia} />

      <CardContent className={classes.cardContent}>
        <Typography gutterBottom={true} variant="h5" component="h2">
          <Skeleton />
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
export { RecipeCardLoading };
