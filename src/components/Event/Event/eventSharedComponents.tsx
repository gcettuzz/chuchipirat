import React from "react";
import Menuplan, {Menue, MenueCoordinates} from "../Menuplan/menuplan.class";

import {
  Grid,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";

import {
  MENUE_SELECTION as TEXT_MENUE_SELECTION,
  PRINTVERSION as TEXT_PRINTVERSION,
  REFRESH as TEXT_REFRESH,
  NEW_LIST as TEXT_NEW_LIST,
  EXISTING_LISTS as TEXT_EXISTING_LISTS,
  CHANGE as TEXT_CHANGE,
  WHERE_DOES_THIS_ITEM_COME_FROM as TEXT_WHERE_DOES_THIS_ITEM_COME_FROM,
  DELETE as TEXT_DELETE,
  CLOSE as TEXT_CLOSE,
  ADDED_MANUALY as TEXT_ADDED_MANUALY,
  THE_QUANTITY_HAS_BEEN_MANUALY_EDITED as TEXT_THE_QUANTITY_HAS_BEEN_MANUALY_EDITED,
} from "../../../constants/text";

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ErrorOutline as ErrorOutlineIcon,
  CallSplit as CallSplitIcon,
  Info as InfoIcon,
} from "@material-ui/icons";

import {decodeSelectedMeals} from "../Menuplan/dialogSelectMenues";
import ShoppingListCollection, {
  ProductTrace,
} from "../ShoppingList/shoppingListCollection.class";
import UsedRecipes from "../UsedRecipes/usedRecipes.class";
import MaterialList from "../MaterialList/materialList.class";
import Action from "../../../constants/actions";
import Recipe from "../../Recipe/recipe.class";
import useStyles from "../../../constants/styles";
/* ===================================================================
// ===================== Globale Einstellungen ======================
// =================================================================== */
export enum OperationType {
  none,
  Create,
  Update,
}

/* ===================================================================
// ======================= Einstellungen-Card ========================
// =================================================================== */
interface EventListCardProps {
  cardTitle: string;
  cardDescription: string;
  outOfDateWarnMessage: string;
  selectedListItem: string | null;
  lists:
    | ShoppingListCollection["lists"]
    | UsedRecipes["lists"]
    | MaterialList["lists"];
  noOfLists: number;
  menuplan: Menuplan;
  onCreateList: () => void;
  onListElementSelect: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  onListElementDelete: (event: React.MouseEvent<HTMLElement>) => void;
  onListElementEdit: (event: React.MouseEvent<HTMLElement>) => void;
  onRefreshLists: () => void;
  onGeneratePrintVersion: () => void;
}
export const EventListCard = ({
  cardTitle,
  cardDescription,
  outOfDateWarnMessage,
  selectedListItem,
  lists,
  noOfLists,
  menuplan,
  onCreateList,
  onListElementSelect,
  onListElementEdit,
  onListElementDelete,
  onRefreshLists,
  onGeneratePrintVersion,
}: EventListCardProps) => {
  return (
    <Card>
      <CardHeader
        title={`${cardTitle} - ${TEXT_MENUE_SELECTION}`}
        subheader={cardDescription}
      />
      <CardContent>
        {Object.keys(lists).length > 0 && (
          <List>
            <ListSubheader>{TEXT_EXISTING_LISTS}</ListSubheader>
            {Object.values(lists).map((list) => (
              <ListItem
                key={"listItem_" + list?.properties.uid}
                id={"listItem_" + list?.properties.uid}
                button
                selected={selectedListItem == list?.properties.uid}
                onClick={onListElementSelect}
              >
                <ListItemText
                  primary={list?.properties.name}
                  secondary={decodeSelectedMeals({
                    selectedMeals: list?.properties.selectedMeals,
                    menuplan: menuplan,
                  })}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    id={"EditBtn_" + list?.properties.uid}
                    onClick={onListElementEdit}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    id={"DeleteBtn_" + list?.properties.uid}
                    onClick={onListElementDelete}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {/* Warnung abgeben, wenn das Änderungsdatum des Menüplan kleiner ist, als der Listen */}
        {selectedListItem &&
          menuplan.lastChange.date >
            lists[selectedListItem]?.properties.generated.date &&
          noOfLists > 0 && (
            <Grid container>
              <Grid
                item
                xs={1}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  // alignItems: "center",
                }}
              >
                <ErrorOutlineIcon color="error" />
              </Grid>
              <Grid item xs={11}>
                <Typography color="error">{outOfDateWarnMessage}</Typography>
              </Grid>
            </Grid>
          )}
      </CardContent>
      <CardActions style={{justifyContent: "flex-end"}}>
        <Button color="primary" variant="outlined" onClick={onCreateList}>
          {TEXT_NEW_LIST}
        </Button>
        {noOfLists > 0 && (
          <Button
            color="primary"
            variant="outlined"
            disabled={noOfLists == 0}
            onClick={onRefreshLists}
          >
            {TEXT_REFRESH}
          </Button>
        )}
        {noOfLists > 0 && (
          <Button
            color="primary"
            variant="contained"
            disabled={selectedListItem == null}
            onClick={onGeneratePrintVersion}
          >
            {TEXT_PRINTVERSION}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
/* ===================================================================
// ========================== Kontext-Menü ===========================
// =================================================================== */
interface PositionContextMenuProps {
  itemType: string;
  anchorEl: HTMLElement | null;
  handleMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  handleMenuClose: () => void;
}
export const PositionContextMenu = ({
  itemType,
  anchorEl,
  handleMenuClick,
  handleMenuClose,
}: PositionContextMenuProps) => {
  return (
    <Menu
      keepMounted
      id={"positionMenu"}
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem id={"ContextMenuItem_" + Action.EDIT} onClick={handleMenuClick}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{TEXT_CHANGE}</Typography>
      </MenuItem>
      <MenuItem
        id={"ContextMenuItem_" + Action.TRACE}
        onClick={handleMenuClick}
      >
        <ListItemIcon>
          <CallSplitIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">
          {TEXT_WHERE_DOES_THIS_ITEM_COME_FROM(itemType)}
        </Typography>
      </MenuItem>
      <MenuItem
        id={"ContextMenuItem_" + Action.DELETE}
        onClick={handleMenuClick}
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{TEXT_DELETE}</Typography>
      </MenuItem>
    </Menu>
  );
};
/* ===================================================================
// ================== Dialog Artikel Nachverfolgung ==================
// =================================================================== */
interface DialogTraceItem {
  dialogOpen: boolean;
  trace: ProductTrace[];
  sortedMenues: MenueCoordinates[];
  hasBeenManualyEdited: boolean;
  handleClose: () => void;
  onShowRecipe: (menuUid: Menue["uid"], recipeUid: Recipe["uid"]) => void;
}
export const DialogTraceItem = ({
  dialogOpen,
  trace,
  sortedMenues,
  hasBeenManualyEdited,
  handleClose,
  onShowRecipe,
}: DialogTraceItem) => {
  const classes = useStyles();

  /* ------------------------------------------
  // Rezept Handler
  // ------------------------------------------ */
  const onListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const pressedButton = event.currentTarget.id.split("_");

    if (pressedButton.length == 4 && pressedButton[3] != "undefined") {
      onShowRecipe(pressedButton[1], pressedButton[3]);
    }
  };

  return (
    <Dialog open={dialogOpen} maxWidth="xs" fullWidth style={{zIndex: 500}}>
      <DialogTitle>{TEXT_WHERE_DOES_THIS_ITEM_COME_FROM}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {hasBeenManualyEdited && (
            <React.Fragment>
              <Grid item xs={2}>
                <InfoIcon fontSize="small" color="disabled" />
              </Grid>
              <Grid xs={10}>
                <Typography variant="body1">
                  {TEXT_THE_QUANTITY_HAS_BEEN_MANUALY_EDITED}
                </Typography>
              </Grid>
            </React.Fragment>
          )}
          <Grid item xs={12}>
            <List key={`list_for_trace`}>
              {sortedMenues.map((menue) => {
                const traceItems = trace.filter(
                  (item) => item.menueUid == menue.menueUid
                );
                return (
                  <React.Fragment key={`menue_container_${menue.menueUid}`}>
                    {traceItems.length > 0 && (
                      <React.Fragment key={`menue_${menue.menueUid}`}>
                        <ListSubheader disableGutters>
                          {menue.menueName && `${menue.menueName}, `}
                          {`${menue.date.toLocaleString("de-CH", {
                            weekday: "long",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })} - ${menue.mealType.name}`}
                        </ListSubheader>
                        {traceItems.map((item, counter) => (
                          <React.Fragment key={`${item}_${counter}`}>
                            {item.recipe.uid ? (
                              // List-Item nur mit Button, wenn auch ein Rezept dahinter steckt
                              <ListItem
                                button
                                onClick={onListItemClick}
                                id={`listItemButton_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                key={`listItemButton_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                              >
                                <ListItemText
                                  primary={
                                    item.recipe.name
                                      ? item.recipe.name
                                      : TEXT_ADDED_MANUALY
                                  }
                                  secondary={
                                    item?.planedPortions &&
                                    `${item.planedPortions} Portionen`
                                  }
                                  id={`listItemTextItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                  key={`listItemTextItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                />
                                <ListItemText
                                  primary={`${
                                    Number.isNaN(item.quantity) ||
                                    item.quantity == 0
                                      ? ""
                                      : item.quantity
                                  } ${item.unit}`}
                                  className={classes.listItemTextAlignRight}
                                  id={`listItemTextQuantity_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                  key={`listItemTextQuantity_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                />
                              </ListItem>
                            ) : (
                              <ListItem
                                id={`listItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                key={`listItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                              >
                                <ListItemText
                                  primary={
                                    item.recipe.name
                                      ? item.recipe.name
                                      : TEXT_ADDED_MANUALY
                                  }
                                  secondary={
                                    item?.planedPortions &&
                                    `${item.planedPortions} Portionen`
                                  }
                                  id={`listItemTextItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                  key={`listItemTextItem_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                />
                                <ListItemText
                                  primary={`${
                                    Number.isNaN(item.quantity) ||
                                    item.quantity == 0
                                      ? ""
                                      : item.quantity
                                  } ${item.unit}`}
                                  className={classes.listItemTextAlignRight}
                                  id={`listItemTextQuantity_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                  key={`listItemTextQuantity_${menue.menueUid}_${counter}_${item.recipe.uid}`}
                                />
                              </ListItem>
                            )}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    )}
                  </React.Fragment>
                );
              })}
              {/* Die manuell hinzugefügten Artikel auflisten */}
              {trace
                .filter((item) => item?.manualAdd)
                .map((item, counter) => (
                  <ListItem key={`manualItem_${counter}`}>
                    <ListItemText
                      primary={TEXT_ADDED_MANUALY}
                      key={`manualItemTextItem_${counter}`}
                    />
                    <ListItemText
                      primary={`${
                        Number.isNaN(item.quantity) || item.quantity == 0
                          ? ""
                          : item.quantity
                      } ${item.unit}`}
                      className={classes.listItemTextAlignRight}
                      key={`manualItemTextQuantity_${counter}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          {TEXT_CLOSE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
