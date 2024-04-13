import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  AutocompleteChangeReason,
} from "@material-ui/lab/Autocomplete";

import {ITEM_CANT_BE_CHANGED, DEPARTMENT} from "../../constants/text";
import Department from "./department.class";

interface DepartmentAutocompleteProps {
  componentKey?: string;
  department: Department | null;
  departments: Department[];
  label?: string;
  disabled: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: string | Department,
    action: AutocompleteChangeReason,
    objectId: string
  ) => void;
  error?: {isError: boolean; errorText: string};
}

// ===================================================================== */
/**
 * Autocomplete Feld für Abteilung
 * @param param0
 * @returns
 */
const DepartmentAutocomplete = ({
  componentKey,
  department,
  departments,
  label = DEPARTMENT,
  disabled,
  onChange,
  error,
}: DepartmentAutocompleteProps) => {
  return (
    <Autocomplete
      key={componentKey ? "department_" + componentKey : "department"}
      id={componentKey ? "department_" + componentKey : "department"}
      value={department}
      options={departments}
      disabled={disabled}
      autoSelect
      autoHighlight
      getOptionLabel={(option) => option.name}
      onChange={(event, newValue, action) =>
        newValue &&
        onChange(
          event as unknown as React.ChangeEvent<HTMLInputElement>,
          newValue,
          action,
          componentKey ? "department_" + componentKey : "department"
        )
      }
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          error={error?.isError}
          helperText={
            error?.isError
              ? error.errorText
              : disabled
              ? ITEM_CANT_BE_CHANGED
              : ""
          }
        />
      )}
    />
  );
};
export default DepartmentAutocomplete;
