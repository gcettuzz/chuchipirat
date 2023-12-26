import React from "react";
import Grid from "@material-ui/core/Grid";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import Firebase, { withFirebase } from "../Firebase";
import Material, { MaterialType } from "./material.class";

import {
  DIALOG_TITLE_MATERIAL_ADD,
  DIALOG_TITLE_MATERIAL_EDIT,
  DIALOG_TEXT_MATERIAL,
  MATERIAL,
  MATERIAL_TYPE,
  MATERIAL_TYPE_CONSUMABLE,
  MATERIAL_TYPE_USAGE,
  DIALOG_EXPLANATION_MATERIAL_TYPE_CONSUMABLE,
  DIALOG_EXPLANATION_MATERIAL_TYPE_USAGE,
  FORM_GIVE_MATERIAL,
  FORM_GIVE_MATERIAL_TYPE,
  BUTTON_CREATE,
  BUTTON_SAVE,
  BUTTON_CANCEL,
  ERROR_MATERIAL_WITH_THIS_NAME_ALREADY_EXISTS,
} from "../../constants/text";

import AuthUser from "../Firebase/Authentication/authUser.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
export const MATERIAL_POP_UP_VALUES_INITIAL_STATE = {
  uid: "",
  name: "",
  type: MaterialType.none,
  clear: false,
  firstCall: true,
};

export enum MaterialDialog {
  CREATE = "create",
  EDIT = "edit",
}
export const MATERIAL_DIALOG_TYPE = {
  CREATE: "create",
  EDIT: "edit",
};

/* ===================================================================
// ===================== Pop Up Produkt hinzufügen ===================
// =================================================================== */

interface DialogMaterialProps {
  firebase: Firebase;
  dialogType: MaterialDialog;
  materialName: Material["name"];
  materialUid: Material["uid"];
  materialType: Material["type"];
  materials: Material[];
  dialogOpen: boolean;
  handleOk: (material: Material) => void;
  handleClose: () => void;
  // selectedDepartment: Department;
  // selectedUnit: Unit;
  // usable: boolean;
  // departments: Department[];
  // units: Unit[];
  authUser: AuthUser;
}

const DialogMaterial = ({
  firebase,
  dialogType,
  materialName = "",
  materialUid = "",
  materials = [],
  materialType = MaterialType.none,
  dialogOpen,
  handleOk,
  handleClose,
  authUser,
}: DialogMaterialProps) => {
  const [materialPopUpValues, setMaterialPopUpValues] = React.useState(
    MATERIAL_POP_UP_VALUES_INITIAL_STATE
  );
  const [validation, setValidation] = React.useState({
    name: { hasError: false, errorText: "" },
    type: { hasError: false, errorText: "" },
  });

  /* ------------------------------------------
  // Change Ereignis Felder
  // ------------------------------------------ */
  const onChangeField = (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: any,
    objectId?: string
  ) => {
    let value: string | Object;
    let field: string;

    if (event.target.id) {
      field = event.target.id.split("-")[0];
    } else {
      objectId ? (field = objectId) : (field = "");
    }

    switch (field) {
      case "material":
        value = newValue;
        break;
      case "department":
        value = newValue;
        break;
      case "name":
        value = event.target.value;
        break;
      case "usable":
        value = event.target.checked;
        break;
      default:
        return;
    }
    setMaterialPopUpValues({
      ...materialPopUpValues,
      [field]: value,
      clear: false,
      firstCall: false,
    });
  };
  const onChangeRadioButton = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaterialPopUpValues({
      ...materialPopUpValues,
      type: (event.target as HTMLInputElement).value as MaterialType,
      clear: false,
      firstCall: false,
    });
  };
  /* ------------------------------------------
  // PopUp Abbrechen
  // ------------------------------------------ */
  const onCancelClick = () => {
    setMaterialPopUpValues({
      ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
    });
    handleClose();
  };
  /* ------------------------------------------
  // PopUp Ok - schliessen
  // ------------------------------------------ */
  const onOkClick = () => {
    //  Prüfung Typ und Name gesetzt
    let tempValidation = validation;

    !materialPopUpValues.name
      ? (tempValidation.name = {
          hasError: true,
          errorText: FORM_GIVE_MATERIAL,
        })
      : (tempValidation.name = { hasError: false, errorText: "" });

    materialPopUpValues.type === MaterialType.none
      ? (tempValidation.type = {
          hasError: true,
          errorText: FORM_GIVE_MATERIAL_TYPE,
        })
      : (tempValidation.type = { hasError: false, errorText: "" });
    if (
      // Nur wenn keine UID
      // sicherstellen, dass nicht zwei Material mit dem selben Namen erfasst werden
      !materialPopUpValues.uid &&
      materials.find(
        (material) =>
          material.name.toLowerCase() ==
          materialPopUpValues.name.toLowerCase().trim()
      ) !== undefined
    ) {
      // Ein Produkt mit diesem Namen besteht schon. --> Abbruch
      tempValidation.name = {
        hasError: true,
        errorText: ERROR_MATERIAL_WITH_THIS_NAME_ALREADY_EXISTS,
      };
    }
    if (tempValidation.name.hasError || tempValidation.type.hasError) {
      setValidation(tempValidation);
      setMaterialPopUpValues({ ...materialPopUpValues });
    } else {
      switch (dialogType) {
        case MATERIAL_DIALOG_TYPE.CREATE:
          //Neues Produkt anlegen
          Material.createMaterial({
            firebase: firebase,
            name: materialPopUpValues.name,
            type: materialPopUpValues.type,
            authUser: authUser,
          }).then((result) => {
            setMaterialPopUpValues({
              ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
              clear: true,
            });
            handleOk(result);
          });
          break;
        case MATERIAL_DIALOG_TYPE.EDIT:
        //TODO:
        // Produkt ändern
        // Product.editProduct({
        //   firebase: firebase,
        //   uid: productPopUpValues.uid,
        //   name: productPopUpValues.name,
        //   departmentUid: productPopUpValues.department.uid,
        //   shoppingUnit: productPopUpValues.shoppingUnit,
        //   usable: productPopUpValues.usable,
        //   runCloudFunction: Boolean(productPopUpValues.name != productName),
        // }).then((result) => {
        //   setProductPopUpValues({ ...productPopUpValues, uid: result.uid });
        //   handleOk(result);
        //   setProductPopUpValues({
        //     ...PRODUCT_POP_UP_VALUES_INITIAL_STATE,
        //     clear: true,
        //   });
        // });
      }
    }
  };
  /* ------------------------------------------
  // PopUp Ok - schliessen
  // ------------------------------------------ */
  const onClose = (event: object, reason: string) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      handleClose();
    }
  };

  // Werte setzen, wenn das erste Mal PopUp geöffnet wird
  if (
    !materialPopUpValues.name &&
    materialName &&
    materialPopUpValues.firstCall == true
  ) {
    setMaterialPopUpValues({
      ...materialPopUpValues,
      uid: materialUid,
      name: materialName.trim(),
      type: materialType,
    });
  }
  return (
    <Dialog
      open={dialogOpen}
      onClose={onClose}
      aria-labelledby="dialog Add Material"
    >
      <DialogTitle id="dialogAddMaterial">
        {dialogType === MATERIAL_DIALOG_TYPE.CREATE
          ? DIALOG_TITLE_MATERIAL_ADD
          : DIALOG_TITLE_MATERIAL_EDIT}
      </DialogTitle>

      <DialogContent>
        {/* <Alert severity="info">{TEXT.DIALOG_ALERT_TEXT_ADD_PRODUCT}</Alert>
        <br /> */}
        <DialogContentText>
          {dialogType === MATERIAL_DIALOG_TYPE.CREATE && DIALOG_TEXT_MATERIAL}
        </DialogContentText>
        {/* {dialogType === MATERIAL_DIALOG_TYPE.EDIT && (
          <AlertMessage
            severity="warning"
            messageTitle={TEXT.ATTENTION}
            body={
              <React.Fragment>
                {TEXT.DIALOG_WARNING_PRODUCT_1}
                <strong>{TEXT.DIALOG_WARNING_PRODUCT_2}</strong>
                {TEXT.DIALOG_WARNING_PRODUCT_3}
              </React.Fragment>
            }
          />
        )} */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              error={validation.name.hasError}
              margin="dense"
              id="name"
              name="name"
              value={materialPopUpValues.name}
              required
              fullWidth
              onChange={onChangeField}
              label={MATERIAL}
              type="text"
              helperText={validation.name.errorText}
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset" error={validation.type.hasError}>
              <FormLabel component="legend">{MATERIAL_TYPE}</FormLabel>
              <RadioGroup
                aria-label="materialtyp"
                name="materialtype"
                id="materialtype"
                value={materialPopUpValues.type}
                onChange={onChangeRadioButton}
                row
              >
                <FormControlLabel
                  value={MaterialType.consumable}
                  control={<Radio color="primary" required />}
                  label={MATERIAL_TYPE_CONSUMABLE}
                  id="materialtype"
                />
                <FormControlLabel
                  value={MaterialType.usage}
                  control={<Radio color="primary" required />}
                  label={MATERIAL_TYPE_USAGE}
                  id="materialtype"
                />
              </RadioGroup>
              <FormHelperText>{validation.type.errorText}</FormHelperText>
            </FormControl>
            <FormHelperText>
              {DIALOG_EXPLANATION_MATERIAL_TYPE_CONSUMABLE}
            </FormHelperText>
            <FormHelperText>
              {DIALOG_EXPLANATION_MATERIAL_TYPE_USAGE}
            </FormHelperText>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick} color="primary" variant="outlined">
          {BUTTON_CANCEL}
        </Button>
        <Button onClick={onOkClick} color="primary" variant="contained">
          {dialogType === MATERIAL_DIALOG_TYPE.CREATE
            ? BUTTON_CREATE
            : BUTTON_SAVE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default withFirebase(DialogMaterial);
