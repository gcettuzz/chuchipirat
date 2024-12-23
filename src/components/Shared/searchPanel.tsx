import React from "react";

import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import * as TEXT from "../../constants/text";

/* ===================================================================
// ============================= Such Panel ==========================
// =================================================================== */
interface SearchPanelProps {
  searchString: string;
  onUpdateSearchString: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  onClearSearchString: () => void;
}
const SearchPanel = ({
  searchString,
  onUpdateSearchString,
  onClearSearchString,
}: SearchPanelProps) => {
  return (
    <React.Fragment>
      <FormControl
        // className={clsx(classes.margin, classes.textField)}
        variant="outlined"
        fullWidth
      >
        {/* <InputLabel id={"SearchString"}>{TEXT.SEARCH_STRING}</InputLabel> */}
        <InputLabel htmlFor="searchString_input">
          {TEXT.SEARCH_STRING}
        </InputLabel>

        <OutlinedInput
          label={TEXT.SEARCH_STRING}
          id={"searchString_input"}
          type={"text"}
          value={searchString}
          fullWidth={true}
          autoComplete="off"
          onChange={onUpdateSearchString}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="clear Search Term"
                onClick={() => {
                  if (searchString) {
                    onClearSearchString();
                  }
                }}
                edge="end"
                size="small"
              >
                {!searchString ? <SearchIcon /> : <ClearIcon />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </React.Fragment>
  );
};

export default SearchPanel;
