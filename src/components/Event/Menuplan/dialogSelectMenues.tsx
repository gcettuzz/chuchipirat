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
  Radio,
  RadioGroup,
} from "@mui/material";

import Menuplan, {Menue, Meal, MealType} from "./menuplan.class";
import Utils from "../../Shared/utils.class";
import useCustomStyles from "../../../constants/styles";
import {FormValidationFieldError} from "../../Shared/fieldValidation.error.class";

import {DoneAll as DoneAllIcon} from "@mui/icons-material";

import {
  NO_MENUES_MARKED as TEXT_NO_MENUES_MARKED,
  SELECT_DAY as TEXT_SELECT_DAY,
  SELECT_ALL as TEXT_SELECT_ALL,
  CONTINUE as TEXT_CONTINUE,
  CANCEL as TEXT_CANCEL,
} from "../../../constants/text";

// ===================================================================
// ============================== Global =============================
// =================================================================== */
interface DecodeSeletedMenues {
  selectedMeals: string[];
  menuplan: Menuplan;
}

interface TimeSlice {
  from: {date: Date | null; mealType: MealType["uid"]};
  to: {date: Date | null; mealType: MealType["uid"]};
}
export const decodeSelectedMeals = ({
  selectedMeals,
  menuplan,
}: DecodeSeletedMenues) => {
  // Über den Menüplan in der Reihenfolge loopen und ein Array
  // mit Von-Bis aufbauen.
  const selectedRange: TimeSlice[] = [];
  const preRecord = {date: new Date(), mealType: ""};

  let timeslice: TimeSlice = {
    from: {date: null, mealType: ""},
    to: {date: null, mealType: ""},
  };
  let openTimeSlice = false;

  menuplan.dates.forEach((date) => {
    menuplan.mealTypes.order.forEach((mealTypeUid) => {
      const meal = Object.values(menuplan.meals).find(
        (meal) =>
          meal.date == Utils.dateAsString(date) && meal.mealType == mealTypeUid
      );

      if (meal) {
        if (selectedMeals?.includes(meal.uid)) {
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
export const getMealForMealTypeAndDate = (
  meals: Menuplan["meals"],
  mealTypeUid: MealType["uid"],
  date: Date
): Meal | null => {
  const dateStr = Utils.dateAsString(date);
  return (
    Object.values(meals).find(
      (m) => m.mealType === mealTypeUid && m.date === dateStr
    ) ?? null
  );
};

/* ===================================================================
   Dialog-Datums-Wahl-Einplanung
=================================================================== */
interface DialogSelectMenuesProps {
  open: boolean;
  title: string;
  dates: Menuplan["dates"];
  preSelectedMenue: DialogSelectMenuesForRecipeDialogValues;
  mealTypes: Menuplan["mealTypes"];
  meals: Menuplan["meals"];
  menues: Menuplan["menues"];
  showSelectAll?: boolean;
  singleSelection?: boolean;
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
  singleSelection = false,
  onConfirm,
  onClose,
}: DialogSelectMenuesProps) => {
  const classes = useCustomStyles();

  const [dialogValues, setDialogValues] =
    React.useState<DialogSelectMenuesForRecipeDialogValues | null>(null);

  const [dialogValidation, setDialogValidation] = React.useState<
    Array<FormValidationFieldError>
  >([]);

  // ------------------------------------------
  // Helpers
  // ------------------------------------------
  const createInitialValues = React.useCallback(
    (allMenues: DialogSelectMenuesProps["menues"]) => {
      const initialValues = {} as DialogSelectMenuesForRecipeDialogValues;
      Object.keys(allMenues).forEach((menueUid) => {
        initialValues[menueUid] = false;
      });
      return initialValues;
    },
    []
  );

  // dialogValues sauber initialisieren, sobald Dialog geöffnet/geschlossen wird
  React.useEffect(() => {
    if (!open) {
      setDialogValues(null);
      setDialogValidation([]);
      return;
    }

    const initial = createInitialValues(menues);
    setDialogValues({...initial, ...preSelectedMenue});
  }, [open, menues, preSelectedMenue, createInitialValues]);

  // Für RadioGroup.value: aktuell selektierte UID ableiten
  const selectedMenueUid = React.useMemo(() => {
    if (!singleSelection || !dialogValues) return "";
    return Object.keys(dialogValues).find((k) => dialogValues[k]) ?? "";
  }, [dialogValues, singleSelection]);

  // ------------------------------------------
  // Select-Menues
  // ------------------------------------------
  const selectMenuesOfDay = (event: React.MouseEvent<HTMLButtonElement>) => {
    const selectedDate = event.currentTarget.id;
    if (!selectedDate || !dialogValues) return;

    const newDialogValues = {...dialogValues};
    let newValueToSet = true;

    const meal = Object.values(meals).find(
      (m) => m.date === selectedDate && m.menuOrder.length !== 0
    );
    if (meal) {
      newValueToSet = !dialogValues[meal.menuOrder[0]];
    }

    Object.values(meals).forEach((m) => {
      if (m.date === selectedDate) {
        m.menuOrder.forEach((menueUid) => {
          newDialogValues[menueUid] = newValueToSet;
        });
      }
    });

    setDialogValues(newDialogValues);
  };

  const selectAllMenues = () => {
    if (!dialogValues) return;

    const newDialogValues = {...dialogValues};
    const firstKey = Object.keys(newDialogValues)[0];
    const newValueToSet = firstKey ? !newDialogValues[firstKey] : true;

    Object.values(meals).forEach((meal) => {
      meal.menuOrder.forEach((menueUid) => {
        newDialogValues[menueUid] = newValueToSet;
      });
    });

    setDialogValues(newDialogValues);
  };

  // ------------------------------------------
  // Change-Events (getrennt: Checkbox vs Radio)
  // ------------------------------------------
  const onRadioChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    // singleSelection: genau eines true
    setDialogValues({[value]: true} as DialogSelectMenuesForRecipeDialogValues);
  };

  const onCheckboxChange =
    (menueUid: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setDialogValues((prev) => {
        if (!prev) return prev;
        return {...prev, [menueUid]: event.target.checked};
      });
    };

  // ------------------------------------------
  // OK / Close
  // ------------------------------------------
  const onOkClick = () => {
    if (!dialogValues) return;

    const marked = Object.keys(dialogValues).filter((uid) => dialogValues[uid]);

    if (marked.length === 0) {
      setDialogValidation([
        {
          priority: 1,
          fieldName: "ERROR_MESSAGE_NO_MENUE_MARKED",
          errorMessage: TEXT_NO_MENUES_MARKED,
        },
      ]);
      return;
    }

    setDialogValidation([]);

    const selectedMenues = {} as DialogSelectMenuesForRecipeDialogValues;
    marked.forEach((uid) => (selectedMenues[uid] = true));

    setDialogValues(null);
    onConfirm(selectedMenues);
  };

  const onCloseClick = () => {
    setDialogValues(null);
    onClose();
  };

  // ------------------------------------------
  // Grid styles (einheitlich)
  // ------------------------------------------
  const rowGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    // Wichtig: KEIN gridAutoFlow: "column" nötig, sonst kann es "spaltenweise" fuellen.
    // Standard (row) ist fuer eine Matrix meistens besser.
  };
  return (
    <Dialog open={open} maxWidth="xl">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {/* Header-Zeile: Wochentage / Datum */}
        <Container sx={classes.dialogSelectMenueRow} style={rowGridStyle}>
          <Container sx={classes.dialogSelectMenueItem}>
            <span />
          </Container>

          {dates.map((date) => (
            <Container
              sx={classes.dialogSelectMenueItem}
              key={"dialogSelectMenueDayCardContainer_" + date.toISOString()}
            >
              <Card
                sx={classes.cardDate}
                style={{width: "100%"}}
                variant="outlined"
              >
                <CardHeader
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

        {/* MealType-Zeilen */}
        {mealTypes.order.map((mealTypeUid) => (
          <Container
            sx={classes.dialogSelectMenueRow}
            key={"dialogSelectMenueRow_" + mealTypeUid}
            style={rowGridStyle}
          >
            {/* Erste Spalte: MealType */}
            <Container sx={classes.dialogSelectMenueItem}>
              <Card
                sx={classes.dialogSelectMenuCardMealtype}
                style={{width: "100%"}}
                variant="outlined"
              >
                <CardHeader
                  title={mealTypes.entries[mealTypeUid].name}
                  titleTypographyProps={{variant: "h6"}}
                />
              </Card>
            </Container>

            {/* Restliche Spalten: pro Datum ein Feld */}
            {singleSelection ? (
              <RadioGroup
                value={selectedMenueUid}
                onChange={onRadioChange}
                // Trick: macht RadioGroup layout-"transparent", damit das Grid greift
                sx={{display: "contents"}}
              >
                {dates.map((date) => {
                  const actualMeal = getMealForMealTypeAndDate(
                    meals,
                    mealTypeUid,
                    date
                  );

                  return (
                    <Container
                      sx={classes.dialogSelectMenueItemCheckboxBox}
                      key={
                        "cell_" + Utils.dateAsString(date) + "_" + mealTypeUid
                      }
                    >
                      {actualMeal?.menuOrder?.map((menueUid) => (
                        <FormControlLabel
                          key={"radio_" + menueUid}
                          value={menueUid}
                          control={<Radio />}
                          label={
                            menues[menueUid].name
                              ? menues[menueUid].name
                              : mealTypes.entries[mealTypeUid].name
                          }
                          style={{width: "100%"}}
                        />
                      ))}
                    </Container>
                  );
                })}
              </RadioGroup>
            ) : (
              <>
                {dates.map((date) => {
                  const actualMeal = getMealForMealTypeAndDate(
                    meals,
                    mealTypeUid,
                    date
                  );

                  return (
                    <Container
                      sx={classes.dialogSelectMenueItemCheckboxBox}
                      key={
                        "cell_" + Utils.dateAsString(date) + "_" + mealTypeUid
                      }
                    >
                      {actualMeal?.menuOrder?.map((menueUid) => (
                        <FormControlLabel
                          key={"checkbox_" + menueUid}
                          control={
                            <Checkbox
                              checked={!!dialogValues?.[menueUid]}
                              onChange={onCheckboxChange(menueUid)}
                            />
                          }
                          label={
                            menues[menueUid].name
                              ? menues[menueUid].name
                              : mealTypes.entries[mealTypeUid].name
                          }
                          style={{width: "100%"}}
                        />
                      ))}
                    </Container>
                  );
                })}
              </>
            )}
          </Container>
        ))}

        {showSelectAll && !singleSelection && (
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

        {dialogValidation[0]?.fieldName === "ERROR_MESSAGE_NO_MENUE_MARKED" && (
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
