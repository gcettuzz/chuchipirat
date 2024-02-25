import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import * as TEXT from "../../constants/text";

import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";

import zxcvbn from "zxcvbn";
// ===================================================================
// ============================= Global ============================
// ===================================================================
// Kategorien Passwort
const getPasswordLabel = (result) => {
  switch (result.score) {
    case 0:
      return TEXT.PASSWORD_STRENGTH_METER.WEAK;
    case 1:
      return TEXT.PASSWORD_STRENGTH_METER.WEAK;
    case 2:
      return TEXT.PASSWORD_STRENGTH_METER.SUFFICENT;
    case 3:
      return TEXT.PASSWORD_STRENGTH_METER.GOOD;
    case 4:
      return TEXT.PASSWORD_STRENGTH_METER.STRONG;
    default:
      return TEXT.PASSWORD_STRENGTH_METER.WEAK;
  }
};
const useStyles = makeStyles({
  // Farben aus Material UI-Palette. Jeweils die 700 und 200 Variante
  // Strength 0 = rot
  colorPrimaryStrength0: {
    backgroundColor: "#d32f2f",
  },
  barColorPrimaryStrength0: {
    backgroundColor: "#ef9a9a",
  },
  // Strength 1 = rot
  colorPrimaryStrength1: {
    backgroundColor: "#d32f2f",
  },
  barColorPrimaryStrength1: {
    backgroundColor: "#ef9a9a",
  },
  // Strength 2 = orange
  colorPrimaryStrength2: {
    backgroundColor: "#ffa000",
  },
  barColorPrimaryStrength2: {
    backgroundColor: "#ffe082",
  },
  // Strength 3 = blau
  colorPrimaryStrength3: {
    backgroundColor: "#1976d2",
  },
  barColorPrimaryStrength3: {
    backgroundColor: "#90caf9",
  },
  // Strength 4 = grün
  colorPrimaryStrength4: {
    backgroundColor: "#388e3c",
  },
  barColorPrimaryStrength4: {
    backgroundColor: "#a5d6a7",
  },
});
// ===================================================================
// ====================== Password-Strengh-Meter =====================
// ===================================================================
interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter = ({password}: PasswordStrengthMeterProps) => {
  const testedResult = zxcvbn(password);
  const classes = useStyles();
  return (
    <React.Fragment>
      <LinearProgress
        variant="determinate"
        value={(100 / 4) * testedResult.score}
        classes={
          !password
            ? undefined
            : testedResult.score === 0
            ? {
                colorPrimary: classes.colorPrimaryStrength0,
                barColorPrimary: classes.barColorPrimaryStrength0,
              }
            : testedResult.score === 1
            ? {
                colorPrimary: classes.colorPrimaryStrength1,
                barColorPrimary: classes.barColorPrimaryStrength1,
              }
            : testedResult.score === 2
            ? {
                colorPrimary: classes.colorPrimaryStrength2,
                barColorPrimary: classes.barColorPrimaryStrength2,
              }
            : testedResult.score === 3
            ? {
                colorPrimary: classes.colorPrimaryStrength3,
                barColorPrimary: classes.barColorPrimaryStrength3,
              }
            : testedResult.score === 4
            ? {
                colorPrimary: classes.colorPrimaryStrength4,
                barColorPrimary: classes.barColorPrimaryStrength4,
              }
            : undefined
        }
      />
      <br />
      {password && (
        <Typography>
          {TEXT.PASSWORD_HOW_STRONG_IS_IT}
          <strong>{getPasswordLabel(testedResult)}</strong>
        </Typography>
      )}
    </React.Fragment>
  );
};

export default PasswordStrengthMeter;
