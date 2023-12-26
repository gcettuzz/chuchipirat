import React from "react";
import useStyles from "../../constants/styles";

import {
  Typography,
  Card,
  CardMedia,
  CardHeader,
  CardContent,
  CardActions,
  Tooltip,
  Grid,
  CardActionArea,
  Fab,
} from "@material-ui/core";
import { Info as InfoIcon, Add as AddIcon } from "@material-ui/icons";

import { Skeleton, Rating } from "@material-ui/lab";
import RecipeShort from "./recipeShort.class";
import { CARD_PLACEHOLDER_PICTURE } from "../../constants/defaultValues";
import { OnRecipeCardClickProps } from "./recipes";
import {
  DIET_TYPES as TEXT_DIET_TYPES,
  ALLERGENS_FREE_TYPES as TEXT_ALLERGENS_FREE_TYPES,
  VOTE as TEXT_VOTE,
  VOTES as TEXT_VOTES,
  VARIANT as TEXT_VARIANT,
} from "../../constants/text";

import Utils from "../Shared/utils.class";
import { Allergen, Diet, DietProperties } from "../Product/product.class";
import { RecipeType } from "./recipe.class";
// ===================================================================== */
/**
 * Aktionen in der Recipe Card
 * @param key - ID/KEY des Button
 * @param name - Anzeigetext des Button
 * @param onClick - Funktion die ausgeführt wird.
 */
export interface RecipeCardActions {
  key: string;
  name: string;
  onClick: ({ event, recipe }: OnRecipeCardClickProps) => void;
}

// ===================================================================== */
/**
 * Parameter für Rezeptkarte
 * @param recipe - Kurzinformationen zu Rezept
 * @param cardActions -  Allfällige Aktionen auf der Karte
 * @param ribbon: Informationen zum Ribbon
 * @param fabButton: FAB-Button, als JSX
 */
interface RecipeCardProps {
  recipe: RecipeShort;
  onCardClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  // cardActions: RecipeCardActions[];
  ribbon?: CardRibbonProps;
  fabButtonIcon?: JSX.Element;
  onFabButtonClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
// ===================================================================== */
/**
 * Rezept-Karte
 * @param Objekt nach RecipeCardActions
 * @returns JSX-Element
 */
const RecipeCard = ({
  recipe,
  onCardClick,
  ribbon,
  fabButtonIcon,
  onFabButtonClick: onFabButtonClickSuper,
}: RecipeCardProps) => {
  const classes = useStyles();

  const [hover, setHover] = React.useState(false);

  const createInfoLine = (dietProperties: DietProperties) => {
    let infoLine = "";

    if (dietProperties.diet != Diet.Meat) {
      infoLine = addTextEntry(infoLine, TEXT_DIET_TYPES[dietProperties.diet]);
    }

    if (dietProperties.allergens.length > 0) {
      Object.keys(Allergen).map((allergen) => {
        if (
          parseInt(allergen) > 0 &&
          !isNaN(parseInt(allergen)) &&
          !dietProperties.allergens.includes(parseInt(allergen))
        ) {
          infoLine = addTextEntry(
            infoLine,
            TEXT_ALLERGENS_FREE_TYPES[parseInt(allergen)]
          );
        }
      });
    }

    return infoLine;
  };
  const addTextEntry = (existingText: string, textToAdd: string) => {
    return existingText ? existingText + ", " + textToAdd : textToAdd;
  };
  /* ------------------------------------------
  // Hover
  // ------------------------------------------ */
  const handleHover = () => {
    setHover(true);
  };

  const handleMouseOut = () => {
    setHover(false);
  };
  /* ------------------------------------------
  // Fab-Button Handling
  // ------------------------------------------ */
  const onFabButtonClick = (event) => {
    if (!onFabButtonClickSuper) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    onFabButtonClickSuper(event);
  };
  let infoLine = createInfoLine(recipe.dietProperties);

  return (
    <Card
      className={classes.card}
      onMouseOver={handleHover}
      onMouseOut={handleMouseOut}
    >
      <CardActionArea
        id={"recipeCardActionArea_" + recipe.uid}
        onClick={onCardClick}
        style={{ height: "100%" }}
      >
        <div className={classes.card}>
          <div style={{ overflow: "hidden" }}>
            {ribbon && (
              <CardRibbon
                cssProperty={ribbon.cssProperty}
                icon={ribbon.icon}
                tooltip={ribbon.tooltip}
              />
            )}
            <CardMedia
              className={classes.cardMedia}
              image={
                recipe.pictureSrc
                  ? recipe.pictureSrc
                  : CARD_PLACEHOLDER_PICTURE()
              }
              title={recipe.name}
              style={{
                transform: hover ? "scale(1.05)" : "scale(1)",
                transition: "0.5s ease",
              }}
            />
          </div>
          <CardHeader
            title={
              <span>
                {recipe.name}
                <span>
                  <Typography variant="subtitle1" color="textSecondary">
                    {recipe.type === RecipeType.variant
                      ? ` [${TEXT_VARIANT}: ${recipe.variantName}]`
                      : ``}
                  </Typography>
                </span>
              </span>
            }
            subheader={
              <Typography variant="body2" color="textSecondary">
                {Utils.isUrl(recipe.source)
                  ? Utils.getDomain(recipe.source)
                  : recipe.source}
              </Typography>
            }
          />
          <CardContent className={classes.cardContent}>
            {infoLine ? (
              <Grid container spacing={1}>
                <Grid item xs={1}>
                  <InfoIcon fontSize="small" color="action" />
                </Grid>
                <Grid item xs={11}>
                  <Typography>{infoLine}</Typography>
                </Grid>
              </Grid>
            ) : (
              <div />
            )}
          </CardContent>

          {/* <CardActions> */}
          <CardActions className={classes.cardActions}>
            <Grid container spacing={1}>
              <Grid item xs={10}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Rating
                    value={recipe.rating.avgRating}
                    size="small"
                    readOnly
                  />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    style={{ marginLeft: "0.5rem" }}
                  >
                    {`${recipe.rating.noRatings} ${
                      recipe.rating.noRatings === 1 ? TEXT_VOTE : TEXT_VOTES
                    }`}
                  </Typography>
                </div>
              </Grid>
              <Grid
                item
                xs={2}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                {onFabButtonClickSuper ? (
                  <Fab
                    component="a"
                    id={"recipeCardFab_" + recipe.uid}
                    size="small"
                    color="primary"
                    aria-label="add"
                    style={{ marginBottom: "1em" }}
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={onFabButtonClick}
                  >
                    {fabButtonIcon ? fabButtonIcon : <AddIcon />}
                  </Fab>
                ) : null}
              </Grid>
            </Grid>
          </CardActions>

          {/* {cardActions.length > 0 && (
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
      )} */}
        </div>
      </CardActionArea>
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
/* ===================================================================
// ===================== Ribbon auf der Karte ========================
// =================================================================== */
/**
 * Eigenschaften für Card-Ribbon
 * @param cssProperty - CSS Eigenschaften
 * @param icon - MUI-Icon, dass auf dem Ribon angezeigt wird
 * @param tooltip - Text, der als Tooltip angezeigt wird.
 */
export interface CardRibbonProps {
  cssProperty: string;
  icon: JSX.Element;
  tooltip?: string;
}
/**
 * Ribon auf der Karte
 * @param Object - Siehe CardRibbonProps
 * @returns JSX.Element
 */
export const CardRibbon = ({ cssProperty, icon, tooltip }: CardRibbonProps) => {
  return (
    <div className={cssProperty}>
      {tooltip ? (
        <Tooltip title={tooltip} arrow>
          {icon}
        </Tooltip>
      ) : (
        { icon }
      )}
    </div>
  );
};

export default RecipeCard;
export { RecipeCardLoading };
