import React from "react";
import {useTheme} from "@material-ui/core/styles";

import useMediaQuery from "@material-ui/core/useMediaQuery";

import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  AutocompleteChangeReason,
} from "@material-ui/lab/Autocomplete";

import Unit, {UnitDimension} from "./unit.class";

import {FIELD_UNIT, ABBREVIATION_UNIT} from "../../constants/text";

interface UnitAutocompleteProps {
  componentKey?: string;
  unitKey: Unit["key"];
  units: Unit[];
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: Unit | null, // string | Unit
    action: AutocompleteChangeReason,
    objectId: string
  ) => void;
}
// ===================================================================== */
/**
 * Autocomplete Feld für Einheit
 * @param param0
 * @returns
 */
const UnitAutocomplete = ({
  componentKey,
  unitKey,
  units,
  onChange,
}: UnitAutocompleteProps) => {
  const theme = useTheme();
  const breakpointIsXs = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <Autocomplete
      key={componentKey ? "unit_" + componentKey : "unit"}
      id={componentKey ? "unit_" + componentKey : "unit"}
      value={{key: unitKey, name: "", dimension: UnitDimension.dimensionless}}
      options={units}
      autoSelect
      autoHighlight
      // getOptionSelected={(unit) => unit.key === unitKey}
      getOptionSelected={(option) => option.key === unitKey}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        if (option.key) {
          return option.key;
        }
        return option.name;
      }}
      onChange={(event, newValue, action) => {
        onChange(
          event as unknown as React.ChangeEvent<HTMLInputElement>,
          newValue,
          action,
          componentKey ? "unit_" + componentKey : "unit"
        );
      }}
      fullWidth
      renderInput={(params) => (
        <TextField
          // value={ingredient.unit}
          {...params}
          label={breakpointIsXs ? ABBREVIATION_UNIT : FIELD_UNIT}
          size="small"
        />
      )}
    />
  );
};
export default UnitAutocomplete;
