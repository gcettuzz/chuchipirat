import React from "react";
import * as TEXT from "../../constants/text";

import {Typography, LinearProgress} from "@mui/material";

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
// ===================================================================
// ====================== Password-Strengh-Meter =====================
// ===================================================================
interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter = ({password}: PasswordStrengthMeterProps) => {
  const testedResult = zxcvbn(password);

  return (
    <React.Fragment>
      <LinearProgress
        variant="determinate"
        value={(100 / 4) * testedResult.score}
        color={
          !password
            ? "primary"
            : testedResult.score === 0 && password.length > 0
            ? "error"
            : testedResult.score === 1
            ? "error"
            : testedResult.score === 2
            ? "warning"
            : testedResult.score === 3
            ? "info"
            : testedResult.score === 4
            ? "success"
            : "primary"
        }
      />
      <br />

      <Typography>
        {TEXT.PASSWORD_HOW_STRONG_IS_IT}
        {password.length > 0 && (
          <strong>{getPasswordLabel(testedResult)}</strong>
        )}
      </Typography>
    </React.Fragment>
  );
};

export default PasswordStrengthMeter;
