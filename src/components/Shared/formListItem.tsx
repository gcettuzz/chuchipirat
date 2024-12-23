import React from "react";
import useStyles from "../../constants/styles";

import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";

import Divider from "@mui/material/Divider";

import TextField from "@mui/material/TextField";

interface FormListItemProps {
  value: string | number | Date | JSX.Element | JSX.Element[];
  id: string;
  label: string;
  icon?: JSX.Element;
  type?: string;
  multiLine?: boolean;
  disabled?: boolean;
  required?: boolean;
  editMode?: boolean;
  helperText?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  displayAsCode?: boolean;
  withDivider?: boolean;
  secondaryAction?: JSX.Element;
  endAdornment?: JSX.Element;
}

export const FormListItem = ({
  value,
  id,
  label,
  icon,
  type,
  multiLine = false,
  disabled = false,
  required = false,
  editMode = false,
  withDivider = true,
  helperText = "",
  onChange,
  displayAsCode,
  secondaryAction,
  endAdornment,
}: FormListItemProps) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <ListItem key={"listItem_" + id}>
        {icon && (
          <ListItemIcon className={classes.listItemIcon}>{icon}</ListItemIcon>
        )}
        {editMode ? (
          <TextField
            id={id}
            key={id}
            name={id}
            type={type}
            InputProps={{
              ...{endAdornment: endAdornment},
              ...{inputProps: {min: 0}},
            }}
            label={label}
            disabled={disabled}
            required={required}
            autoComplete={id}
            value={value}
            onChange={onChange}
            multiline={multiLine}
            helperText={helperText}
            fullWidth
          />
        ) : (
          <React.Fragment>
            {/* Nur Möglichkeit von JSX Element oder von einfachem Text.. alles andere wird overhead */}
            <ListItemText className={classes.listItemTitle} secondary={label} />
            {typeof value === "string" ? (
              <ListItemText
                className={
                  !displayAsCode
                    ? classes.listItemContent
                    : `${classes.listItemContent} ${classes.typographyCode}`
                }
                disableTypography={displayAsCode}
                primary={value}
              />
            ) : value instanceof Date ? (
              <ListItemText className={classes.listItemContent}>
                {value.toLocaleString("de-CH", {
                  dateStyle: "medium",
                })}
              </ListItemText>
            ) : (
              <ListItemText className={classes.listItemContent}>
                {value}
              </ListItemText>
            )}
            {secondaryAction && (
              <ListItemSecondaryAction>
                {secondaryAction}
              </ListItemSecondaryAction>
            )}
          </React.Fragment>
        )}
      </ListItem>
      {!editMode && withDivider && <Divider component="li" />}
    </React.Fragment>
  );
};
