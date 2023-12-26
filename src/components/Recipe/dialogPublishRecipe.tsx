import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import useStyles from "../../constants/styles";
import { Alert, AlertTitle } from "@material-ui/lab";
import CheckBoxOutlinedIcon from "@material-ui/icons/CheckBoxOutlined";

import * as TEXT from "../../constants/text";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */

/* ===================================================================
// =================== Pop Up Rezept veröffentlichen =================
// =================================================================== */
interface DialogPublishRecipeProps {
  dialogOpen: boolean;
  handleOk: (messageForReview: string) => void;
  handleClose: () => void;
}

const DialogPublishRecipe = ({
  dialogOpen,
  handleOk,
  handleClose,
}: DialogPublishRecipeProps) => {
  const [formFields, setFormFields] = React.useState({
    messageForReview: "",
    initial: true,
  });

  const classes = useStyles();

  /* ------------------------------------------
  // Change Ereignis Felder
  // ------------------------------------------ */
  const onChangeField = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFormFields({
      ...formFields,
      messageForReview: event.target.value,
      initial: false,
    });
  };
  /* ------------------------------------------
  // PopUp Ok
  // ------------------------------------------ */
  const onOkClick = () => {
    setFormFields({ ...formFields, initial: true });
    handleOk(formFields.messageForReview);
  };
  /* ------------------------------------------
  // PopUp Abbrechen
  // ------------------------------------------ */
  const onCancelClick = () => {
    handleClose();
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="dialogScaleRecipe"
      fullWidth={true}
      maxWidth="sm"
    >
      <DialogTitle id="dialogScaleRecipe">{TEXT.PUBLISH_RECIPE}</DialogTitle>
      <DialogContent>
        <Typography>{TEXT.PUBLISH_RECIPE_RULES_PART1}</Typography>
        <List dense>
          {TEXT.PUBLISH_RECIPE_RULES_BULLET_LIST.split("•").map(
            (bulletPoint, counter) => (
              <ListItem key={"listitem_" + counter}>
                <ListItemIcon>
                  <CheckBoxOutlinedIcon fontSize={"small"} />
                </ListItemIcon>
                <ListItemText>{bulletPoint}</ListItemText>
              </ListItem>
            )
          )}
        </List>
        <Typography>{TEXT.PUBLISH_RECIPE_RULES_PART2}</Typography>
        <br />
        <Typography>{TEXT.PUBLISH_RECIPE_RULES_PART3}</Typography>
        <Typography>{TEXT.PUBLISH_RECIPE_RULES_PART4}</Typography>
        <br />
        <Typography>{TEXT.PUBLISH_RECIPE_RULES_PART5}</Typography>
        <Typography>{TEXT.PUBLISH_RECIPE_RULES_PART6}</Typography>
        <br />
        <TextField
          margin="dense"
          id="messageForReview"
          name="messageForReview"
          value={formFields.messageForReview}
          multiline
          fullWidth
          minRows={3}
          maxRows={10}
          onChange={onChangeField}
          variant="outlined"
          label={TEXT.MESSAGE_TO_REVIEW}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick} variant="outlined">
          {TEXT.BUTTON_CANCEL}
        </Button>
        <Button onClick={onOkClick} variant="contained" color="primary">
          {TEXT.SEND_RECIPE_TO_REVIEW}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogPublishRecipe;
