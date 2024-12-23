import React from "react";
import {useTheme} from "@mui/material/styles";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import * as TEXT from "../../constants/text";

import useMediaQuery from "@mui/material/useMediaQuery";

import useStyles from "../../constants/styles";

import {HTMLInputTypeAttribute} from "react";
// ===================================================================== */
/**
 * Übergabeparameter für SearchInputWithButton
 * @param id - ID des Objektes
 * @param label - Feld-Label
 * @param value - Wert im Such-Input
 * @param type - Feldtyp (Siehe HTML InputType Attributes)
 * @param onInputChange - Aufgerufene Methode bei Feldänderung
 * @param onInputClear - Aufgerufene Methode bei Clear-Befehl
 * @param onSearch - Aufgerufene Methode bei Suche
 */
interface SearchInputWithButtonProps {
  id: string;
  label: string;
  value: string;
  type?: HTMLInputTypeAttribute;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInputClear: () => void;
  onSearch: () => void;
}
/**
 * Suchfeld mit Button
 * @param Object - Siehe Interface SearchInputWithButtonProps
 * @returns JSX-Element
 */
const SearchInputWithButton = ({
  id,
  label,
  value,
  type = "text",
  onInputChange,
  onInputClear,
  onSearch,
}: SearchInputWithButtonProps) => {
  const classes = useStyles();

  const theme = useTheme();
  const breakpointIsSm = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container className={classes.container} component="main">
      <Grid container spacing={2} className={classes.gridSearchInput}>
        <Grid item xs={8} sm={9}>
          <FormControl fullWidth>
            <InputLabel id={id}>{label}</InputLabel>
            <Input
              id={id}
              type={type}
              value={value}
              fullWidth={true}
              autoFocus
              autoComplete="off"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange(event)
              }
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  onSearch();
                }
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear Search Term"
                    onClick={onInputClear}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </Grid>
        <Grid item xs={4} sm={3}>
          {breakpointIsSm ? (
            <Button
              fullWidth
              color="primary"
              variant="contained"
              onClick={onSearch}
              disabled={!value}
            >
              <SearchIcon />
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<SearchIcon />}
              onClick={onSearch}
              disabled={!value}
            >
              {TEXT.BUTTON_SEARCH}
            </Button>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchInputWithButton;
