import React from "react";

import {
  Stack,
  Button,
  TextField,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
} from "@mui/material";

import Material, {MaterialType} from "./material.class";

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
  CREATE as TEXT_CREATE,
  BUTTON_SAVE,
  BUTTON_CANCEL,
  ERROR_MATERIAL_WITH_THIS_NAME_ALREADY_EXISTS,
  ERROR_PARAMETER_NOT_PASSED,
  USABLE,
} from "../../constants/text";

import AuthUser from "../Firebase/Authentication/authUser.class";
import Firebase from "../Firebase/firebase.class";
import {ValueObject} from "../Firebase/Db/firebase.db.super.class";

/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
export const MATERIAL_POP_UP_VALUES_INITIAL_STATE = {
  uid: "",
  name: "",
  type: MaterialType.none,
  usable: true,
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
  firebase?: Firebase;
  dialogType: MaterialDialog;
  materialName: Material["name"];
  materialUid: Material["uid"];
  materialType: Material["type"];
  materialUsable: Material["usable"];
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
  materialUsable,
  dialogOpen,
  handleOk,
  handleClose,
  authUser,
}: DialogMaterialProps) => {
  const theme = useTheme();

  const [materialPopUpValues, setMaterialPopUpValues] = React.useState(
    MATERIAL_POP_UP_VALUES_INITIAL_STATE
  );
  const [validation, setValidation] = React.useState({
    name: {hasError: false, errorText: ""},
    type: {hasError: false, errorText: ""},
  });

  /* ------------------------------------------
  // Change Ereignis Felder
  // ------------------------------------------ */
  const onChangeField = (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?: any,
    objectId?: string
  ) => {
    let value: string | ValueObject | boolean;
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
      type: parseInt((event.target as HTMLInputElement).value) as MaterialType,
      clear: false,
      firstCall: false,
    });
  };
  const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaterialPopUpValues({
      ...materialPopUpValues,
      usable: event.target.checked,
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
    const tempValidation = validation;

    !materialPopUpValues.name
      ? (tempValidation.name = {
          hasError: true,
          errorText: FORM_GIVE_MATERIAL,
        })
      : (tempValidation.name = {hasError: false, errorText: ""});

    materialPopUpValues.type === MaterialType.none
      ? (tempValidation.type = {
          hasError: true,
          errorText: FORM_GIVE_MATERIAL_TYPE,
        })
      : (tempValidation.type = {hasError: false, errorText: ""});
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
      setMaterialPopUpValues({...materialPopUpValues});
    } else {
      switch (dialogType) {
        case MATERIAL_DIALOG_TYPE.CREATE:
          if (!firebase) {
            throw new Error(ERROR_PARAMETER_NOT_PASSED);
          }
          //Neues Produkt anlegen
          Material.createMaterial({
            firebase: firebase,
            name: materialPopUpValues.name,
            type: materialPopUpValues.type,
            authUser: authUser,
          }).then((result) => {
            handleOk(result);
            setMaterialPopUpValues({
              ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
              clear: true,
            });
          });

          break;
        case MATERIAL_DIALOG_TYPE.EDIT: {
          const material = new Material();
          material.uid = materialPopUpValues.uid;
          material.name = materialPopUpValues.name;
          material.type = materialPopUpValues.type;
          material.usable = materialPopUpValues.usable;
          handleOk(material);
          setMaterialPopUpValues({
            ...MATERIAL_POP_UP_VALUES_INITIAL_STATE,
            clear: true,
          });
        }
      }
    }
  };
  /* ------------------------------------------
  // PopUp Ok - schliessen
  // ------------------------------------------ */
  const onClose = (event: ValueObject, reason: string) => {
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
      usable: materialUsable,
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
        <DialogContentText sx={{marginBottom: theme.spacing(2)}}>
          {dialogType === MATERIAL_DIALOG_TYPE.CREATE && DIALOG_TEXT_MATERIAL}
        </DialogContentText>
        <Stack spacing={2}>
          <TextField
            autoComplete="off"
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
                control={<Radio required />}
                label={MATERIAL_TYPE_CONSUMABLE}
                id="materialtype"
              />
              <FormControlLabel
                value={MaterialType.usage}
                control={<Radio required />}
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
          {dialogType == MATERIAL_DIALOG_TYPE.EDIT && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={materialPopUpValues.usable}
                  onChange={onChangeCheckbox}
                  name="usable"
                />
              }
              label={USABLE}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick} color="primary" variant="outlined">
          {BUTTON_CANCEL}
        </Button>
        <Button onClick={onOkClick} color="primary" variant="contained">
          {dialogType === MATERIAL_DIALOG_TYPE.CREATE
            ? TEXT_CREATE
            : BUTTON_SAVE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogMaterial;
