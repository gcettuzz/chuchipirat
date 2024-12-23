import React from "react";
import * as TEXT from "../../constants/text";

import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";

import zxcvbn from "zxcvbn";
import useCustomStyles from "../../constants/styles";
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
// ===================================================================
// ====================== Password-Strengh-Meter =====================
// ===================================================================
interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter = ({password}: PasswordStrengthMeterProps) => {
  const testedResult = zxcvbn(password);
  const classes = useCustomStyles();
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
                colorPrimary:
                  classes.passwordStrengthMeter.colorPrimaryStrength0,
                barColorPrimary:
                  classes.passwordStrengthMeter.barColorPrimaryStrength0,
              }
            : testedResult.score === 1
            ? {
                colorPrimary:
                  classes.passwordStrengthMeter.colorPrimaryStrength1,
                barColorPrimary:
                  classes.passwordStrengthMeter.barColorPrimaryStrength1,
              }
            : testedResult.score === 2
            ? {
                colorPrimary:
                  classes.passwordStrengthMeter.colorPrimaryStrength2,
                barColorPrimary:
                  classes.passwordStrengthMeter.barColorPrimaryStrength2,
              }
            : testedResult.score === 3
            ? {
                colorPrimary:
                  classes.passwordStrengthMeter.colorPrimaryStrength3,
                barColorPrimary:
                  classes.passwordStrengthMeter.barColorPrimaryStrength3,
              }
            : testedResult.score === 4
            ? {
                colorPrimary:
                  classes.passwordStrengthMeter.colorPrimaryStrength4,
                barColorPrimary:
                  classes.passwordStrengthMeter.barColorPrimaryStrength4,
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
