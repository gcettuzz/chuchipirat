import React from "react";

import {
  Dialog,
  Container,
  Typography,
  Button,
  Card,
  CardHeader,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  CardActions,
} from "@material-ui/core";

import Menuplan, {Menue, Meal, MealType} from "./menuplan.class";
import Utils from "../../Shared/utils.class";
import useStyles from "../../../constants/styles";
import {FormValidationFieldError} from "../../Shared/fieldValidation.error.class";

import {DoneAll as DoneAllIcon} from "@material-ui/icons";

import {
  NO_MENUES_MARKED as TEXT_NO_MENUES_MARKED,
  DIALOG_CHOOSE_MENUES_TITLE as TEXT_DIALOG_CHOOSE_MENUES_TITLE,
  SELECT_DAY as TEXT_SELECT_DAY,
  SELECT_ALL as TEXT_SELECT_ALL,
  CONTINUE as TEXT_CONTINUE,
  MENUE as TEXT_MENUE,
  CANCEL as TEXT_CANCEL,
} from "../../../constants/text";
/* ===================================================================
// ============================== Global =============================
// =================================================================== */
interface DecodeSeletedMenues {
  selectedMenues: string[];
  menuplan: Menuplan;
}

interface TimeSlice {
  from: {date: Date | null; mealType: MealType["uid"]};
  to: {date: Date | null; mealType: MealType["uid"]};
}
export const decodeSelectedMenues = ({
  selectedMenues,
  menuplan,
}: DecodeSeletedMenues) => {
  // Über den Menüplan in der Reihenfolge loopen und ein Array
  // mit Von-Bis aufbauen.
  let selectedRange: TimeSlice[] = [];
  let preRecord = {date: new Date(), mealType: ""};

  let timeslice: TimeSlice = {
    from: {date: null, mealType: ""},
    to: {date: null, mealType: ""},
  };
  let openTimeSlice = false;

  menuplan.dates.forEach((date) => {
    menuplan.mealTypes.order.forEach((mealTypeUid) => {
      let meal = Object.values(menuplan.meals).find(
        (meal) =>
          meal.date == Utils.dateAsString(date) && meal.mealType == mealTypeUid
      );

      if (meal) {
        meal.menuOrder.forEach((menuUid) => {
          if (selectedMenues.includes(menuUid)) {
            if (!openTimeSlice) {
              // Neuer Range erfassen
              timeslice.from = {
                date: date,
                mealType: menuplan.mealTypes.entries[mealTypeUid].name,
              };
            }
            openTimeSlice = true;
          } else {
            if (openTimeSlice) {
              // abschliessen
              timeslice.to = {
                date: preRecord.date,
                mealType: menuplan.mealTypes.entries[preRecord.mealType].name,
              };
              selectedRange.push(timeslice);
              timeslice = {
                from: {date: null, mealType: ""},
                to: {date: null, mealType: ""},
              };
              openTimeSlice = false;
            }
          }
        });
      }
      preRecord.mealType = mealTypeUid;
      preRecord.date = date;
    });
  });
  if (openTimeSlice) {
    // Konnte im Loop nicht agebschlossen werden
    timeslice.to = {
      date: preRecord.date,
      mealType: menuplan.mealTypes.entries[preRecord.mealType].name,
    };
    selectedRange.push(timeslice);
  }

  let displayText = "";

  selectedRange.forEach((timeslice, counter) => {
    if (counter > 0) {
      displayText = `${displayText}, `;
    }

    displayText = `${displayText}${timeslice.from.date!.toLocaleString(
      "de-CH",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    )} ${timeslice.from.mealType}`;

    if (
      timeslice.from.date != timeslice.to.date ||
      timeslice.from.mealType != timeslice.to.mealType
    ) {
      displayText = `${displayText} - ${timeslice.to.date!.toLocaleString(
        "de-CH",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      )} ${timeslice.to.mealType}`;
    }
  });
  return displayText;
};

/* ===================================================================
// ================== Dialog-Datums-Wahl-Einplanung ===================
// =================================================================== */
interface DialogSelectMenuesProps {
  open: boolean;
  title: string;
  dates: Menuplan["dates"];
  preSelectedMenue: DialogSelectMenuesForRecipeDialogValues;
  mealTypes: Menuplan["mealTypes"];
  meals: Menuplan["meals"];
  menues: Menuplan["menues"];
  showSelectAll?: boolean;
  onClose: () => void;
  onConfirm: (dialogValues: DialogSelectMenuesForRecipeDialogValues) => void;
}
export interface DialogSelectMenuesForRecipeDialogValues {
  [key: Menue["uid"]]: boolean;
}
export const DialogSelectMenues = ({
  open,
  title,
  dates,
  preSelectedMenue,
  mealTypes,
  meals,
  menues,
  showSelectAll = false,
  onConfirm,
  onClose,
}: DialogSelectMenuesProps) => {
  const classes = useStyles();
  const [dialogValues, setDialogValues] =
    React.useState<DialogSelectMenuesForRecipeDialogValues | null>(null);
  let initialDialogValues = {} as DialogSelectMenuesForRecipeDialogValues;
  const [dialogValidation, setDialogValidation] = React.useState<
    Array<FormValidationFieldError>
  >([]);
  /* ------------------------------------------
  // Initialisierung
  // ------------------------------------------ */
  const createInitialValues = (menues: DialogSelectMenuesProps["menues"]) => {
    let initialValues = {} as DialogSelectMenuesForRecipeDialogValues;

    Object.keys(menues).forEach((menueUid) => {
      initialValues[menueUid] = false;
    });
    return initialValues;
  };
  if (
    !dialogValues ||
    (Object.keys(dialogValues).length == 0 &&
      Object.keys(preSelectedMenue).length > 0)
  ) {
    initialDialogValues = createInitialValues(menues);
    setDialogValues({...initialDialogValues, ...preSelectedMenue});
  } else if (
    Object.values(dialogValues).filter((menue) => menue === true).length == 0 &&
    Object.keys(preSelectedMenue).length > 0
  ) {
    setDialogValues({...dialogValues, ...preSelectedMenue});
  }
  /* ------------------------------------------
  // Select-Menues
  // ------------------------------------------ */
  const selectMenuesOfDay = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Alle Menüs dieses Tages markieren
    let selectedDate = event.currentTarget.id;
    if (!selectedDate) {
      return;
    }

    let newDialogValues = {...dialogValues};

    Object.values(meals).forEach((meal) => {
      if (meal.date == event.currentTarget.id) {
        meal.menuOrder.forEach((menueUid) => {
          newDialogValues[menueUid] = true;
        });
      }
    });
    setDialogValues(newDialogValues);
  };
  const selectAllMenues = () => {
    let newDialogValues = {...dialogValues};

    Object.values(meals).forEach((meal) => {
      meal.menuOrder.forEach((menueUid) => {
        newDialogValues[menueUid] = true;
      });
    });
    setDialogValues(newDialogValues);
  };
  /* ------------------------------------------
  // Change-Event
  // ------------------------------------------ */
  const onFieldUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newDialogValues = {...dialogValues};
    newDialogValues[event.target.id.split("_")[2]] = event.target.checked;
    setDialogValues(newDialogValues);
  };
  const onOkClick = () => {
    if (!dialogValues) {
      return;
    }
    if (
      Object.keys(dialogValues).filter(
        (menuUid) => dialogValues[menuUid] == true
      ).length == 0
    ) {
      // Fehlermeldung ausgeben, kein Feld markiert!
      setDialogValidation([
        {
          priority: 1,
          fieldName: "ERROR_MESSAGE_NO_MENUE_MARKED",
          errorMessage: TEXT_NO_MENUES_MARKED,
        },
      ]);
      return;
    } else {
      setDialogValidation([]);
    }

    // Wir übergeben nur die markierten
    let selectedMenues = {} as DialogSelectMenuesForRecipeDialogValues;
    Object.keys(dialogValues).forEach((menueUid) => {
      if (dialogValues[menueUid] == true) {
        selectedMenues[menueUid] = true;
      }
    });
    setDialogValues(null);
    // setDialogValues(createInitialValues(menues));
    onConfirm(selectedMenues);
  };
  const onCloseClick = () => {
    // setDialogValues(createInitialValues(menues));
    setDialogValues(null);
    onClose();
  };

  return (
    <Dialog open={open} maxWidth="xl">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Container
          className={classes.dialogSelectMenueRow}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gridAutoFlow: "column",
          }}
        >
          <Container className={classes.dialogSelectMenueItem}>
            <span />
          </Container>
          {dates.map((date) => (
            <Container
              className={classes.dialogSelectMenueItem}
              key={"dialogSelectMenueDayCardContainer_" + date}
            >
              <Card
                key={"date_card_" + date}
                className={classes.cardDate}
                style={{width: "100%"}}
                variant="outlined"
              >
                <CardHeader
                  key={
                    "dialogSelectMenueDayCardContainerDate_cardHeader" + date
                  }
                  align="center"
                  title={date.toLocaleString("default", {weekday: "long"})}
                  titleTypographyProps={{variant: "h6"}}
                  subheader={date.toLocaleString("de-CH", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                />
                {showSelectAll && (
                  <CardActions
                    style={{marginTop: "-3ex", justifyContent: "center"}}
                  >
                    <Button
                      id={Utils.dateAsString(date)}
                      color="primary"
                      startIcon={<DoneAllIcon />}
                      onClick={selectMenuesOfDay}
                    >
                      {TEXT_SELECT_DAY}
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Container>
          ))}
        </Container>
        {mealTypes.order.map((mealTypeUid) => (
          <Container
            className={classes.dialogSelectMenueRow}
            key={"dialogSelectMenueDayCardContainerMealType_row_" + mealTypeUid}
          >
            <Container
              className={classes.dialogSelectMenueItem}
              key={"dialogSelectMenueDayCardContainerMealType_" + mealTypeUid}
            >
              <Card
                key={"mealType_card_" + mealTypeUid}
                className={classes.dialogSelectMenuCardMealtype}
                style={{width: "100%"}}
                variant="outlined"
              >
                <CardHeader
                  key={
                    "dialogSelectMenueDayCardContainerMealType_cardHeader" +
                    mealTypeUid
                  }
                  // align="center"
                  title={mealTypes.entries[mealTypeUid].name}
                  titleTypographyProps={{variant: "h6"}}
                />
              </Card>
            </Container>
            {dates.map((date) => {
              let actualMeal = {} as Meal;
              Object.values(meals).forEach((meal) => {
                if (
                  meal.mealType == mealTypeUid &&
                  meal.date == Utils.dateAsString(date)
                ) {
                  actualMeal = meal;
                }
              });
              return (
                <Container
                  className={classes.dialogSelectMenueItemCheckboxBox}
                  key={
                    "dialogSelectMenueDayCardContainerMealType_Row_Meal_" +
                    Utils.dateAsString(date) +
                    "_" +
                    mealTypeUid
                  }
                >
                  {actualMeal.menuOrder?.map((menueUid) => (
                    <FormControlLabel
                      key={
                        "dialogSelectMenueDayFormControllCheckbox_" + menueUid
                      }
                      style={{width: "100%"}}
                      control={
                        <Checkbox
                          id={"dialogSelectMenueDay_checkbox_" + menueUid}
                          checked={
                            !dialogValues ? false : dialogValues[menueUid]
                          }
                          onChange={onFieldUpdate}
                          name="checkedA"
                          color="primary"
                        />
                      }
                      label={
                        menues[menueUid].name
                          ? menues[menueUid].name
                          : TEXT_MENUE
                      }
                    />
                  ))}
                </Container>
              );
            })}
          </Container>
        ))}
        {showSelectAll && (
          <Container>
            <Button
              color="primary"
              startIcon={<DoneAllIcon />}
              onClick={selectAllMenues}
            >
              {TEXT_SELECT_ALL}
            </Button>
          </Container>
        )}
        {dialogValidation[0]?.fieldName == "ERROR_MESSAGE_NO_MENUE_MARKED" && (
          <Typography color="error">
            {dialogValidation[0].errorMessage}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseClick} color="primary" variant="outlined">
          {TEXT_CANCEL}
        </Button>
        <Button onClick={onOkClick} color="primary" variant="contained">
          {TEXT_CONTINUE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
