import React, { useReducer } from "react";
import useStyles from "../../constants/styles";

import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";

import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";

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
  const classes = useStyles();

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
                onClick={!searchString ? () => {} : onClearSearchString}
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
