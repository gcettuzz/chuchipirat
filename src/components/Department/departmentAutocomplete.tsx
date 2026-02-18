import React from "react";
import TextField from "@mui/material/TextField";

import {Autocomplete, AutocompleteChangeReason} from "@mui/material";

import {
  ITEM_CANT_BE_CHANGED,
  DEPARTMENT,
  ERROR_NO_OPTIONS,
} from "../../constants/text";
import Department from "./department.class";
import {TextFieldSize} from "../../constants/defaultValues";

interface DepartmentAutocompleteProps {
  componentKey?: string;
  department: Department | null;
  departments: Department[];
  label?: string;
  disabled: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: Department | null,
    action: AutocompleteChangeReason,
    objectId: string
  ) => void;
  error?: {isError: boolean; errorText: string};
  size?: TextFieldSize;
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
  size = TextFieldSize.medium,
}: DepartmentAutocompleteProps) => {
  return (
    <Autocomplete
      key={componentKey ? "department_" + componentKey : "department"}
      id={componentKey ? "department_" + componentKey : "department"}
      value={department}
      options={departments}
      autoSelect
      autoHighlight
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        if (option == undefined || !option?.name) {
          return "";
        }
        return option.name;
      }}
      noOptionsText={ERROR_NO_OPTIONS}
      disabled={disabled}
      onChange={(event, newValue, action) => {
        onChange(
          event as unknown as React.ChangeEvent<HTMLInputElement>,
          newValue,
          action,
          componentKey ? "department_" + componentKey : "department"
        );
      }}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error?.isError}
          helperText={
            error?.isError
              ? error.errorText
              : disabled
              ? ITEM_CANT_BE_CHANGED
              : ""
          }
          size={size}
        />
      )}
    />
  );
};
export default DepartmentAutocomplete;
