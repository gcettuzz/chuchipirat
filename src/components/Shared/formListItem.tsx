import React from "react";
import useStyles from "../../constants/styles";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

import Divider from "@material-ui/core/Divider";

import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";

import Utils from "./utils.class";

interface FormListItemProps {
  value: string | number | JSX.Element | JSX.Element[];
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
      {!editMode && withDivider && <Divider />}
    </React.Fragment>
  );
};
