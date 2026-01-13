import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import {
  DIALOG_TITLE_SELECT_DEPARTMENT as TEXT_DIALOG_TITLE_SELECT_DEPARTMENT,
  DIALOG_SUBTITLE_SELECT_DEPARTMENT as TEXT_DIALOG_SUBTITLE_SELECT_DEPARTMENT,
  CANCEL as TEXT_CANCEL,
  CONTINUE as TEXT_CONTINUE,
  SELECT_ALL as TEXT_SELECT_ALL,
  NO_DEPARTMENTS_MARKED as TEXT_NO_DEPARTMENTS_MARKED,
} from "../../../constants/text";
import Department from "../../Department/department.class";
import {FormValidationFieldError} from "../../Shared/fieldValidation.error.class";

// ===================================================================
// ============================== Global =============================
// =================================================================== */

/* ===================================================================
//   Dialog-Abteilungen wählen
//=================================================================== */
export interface SelectedDepartmentsForShoppingList {
  [key: Department["uid"]]: boolean;
}
interface DialogSelectDepartmentsProps {
  open: boolean;
  departments: Department[];
  preSelecteDepartments: SelectedDepartmentsForShoppingList;
  onClose: () => void;
  onConfirm: (dialogValues: SelectedDepartmentsForShoppingList) => void;
}
export const DialogSelectDepartments = ({
  open,
  departments,
  preSelecteDepartments,
  onClose,
  onConfirm,
}: DialogSelectDepartmentsProps) => {
  const [dialogValues, setDialogValues] =
    React.useState<SelectedDepartmentsForShoppingList | null>(null);
  const [dialogValidation, setDialogValidation] = React.useState<
    Array<FormValidationFieldError>
  >([]);
  // ------------------------------------------
  // Helpers
  // ------------------------------------------
  const createInitialValues = React.useCallback(() => {
    const initialValues = {} as SelectedDepartmentsForShoppingList;
    departments.forEach((department) => {
      initialValues[department.uid] = false;
    });
    return initialValues;
  }, []);
  // dialogValues sauber initialisieren, sobald Dialog geöffnet/geschlossen wird
  React.useEffect(() => {
    if (!open) {
      setDialogValues(null);
      return;
    }

    const initial = createInitialValues();
    setDialogValues({...initial, ...preSelecteDepartments});
  }, [open, departments, preSelecteDepartments]);
  // ------------------------------------------
  // Change-Events
  // ------------------------------------------
  const onCheckboxChange =
    (departmentUid: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setDialogValues((prev) => {
        if (!prev) return prev;
        return {...prev, [departmentUid]: event.target.checked};
      });
    };

  // ------------------------------------------
  // OK / Close
  // ------------------------------------------
  const onSelectAll = () => {
    const allSelectedValues = {...dialogValues};
    departments.forEach((department) => {
      allSelectedValues[department.uid] = true;
    });
    setDialogValues(allSelectedValues);
  };
  const onOkClick = () => {
    if (!dialogValues) return;

    const marked = Object.keys(dialogValues).filter((uid) => dialogValues[uid]);

    if (marked.length === 0) {
      // Validierungsfehler - es muss mindestens eine Abteilung gewählt werden
      setDialogValidation([
        {
          priority: 1,
          fieldName: "ERROR_MESSAGE_NO_DEPARTMENT_MARKED",
          errorMessage: TEXT_NO_DEPARTMENTS_MARKED,
        },
      ]);
      return;
    }

    setDialogValidation([]);

    const selectedDepartments = {} as SelectedDepartmentsForShoppingList;
    marked.forEach((uid) => {
      selectedDepartments[uid] = true;
    });

    setDialogValues(null);
    onConfirm(selectedDepartments);
  };
  const onCloseClick = () => {
    setDialogValues(null);
    onClose();
  };

  return (
    <Dialog open={open} maxWidth="xl">
      <DialogTitle>{TEXT_DIALOG_TITLE_SELECT_DEPARTMENT}</DialogTitle>
      <DialogContent>
        <Typography>{TEXT_DIALOG_SUBTITLE_SELECT_DEPARTMENT}</Typography>

        <FormGroup>
          {departments?.map((department) => (
            <FormControlLabel
              key={"frmctrlbl_" + department.uid}
              control={
                <Checkbox
                  id={"chkb_" + department.uid}
                  checked={dialogValues?.[department.uid] ?? false}
                  onChange={onCheckboxChange(department.uid)}
                />
              }
              label={department.name}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        {dialogValidation[0]?.fieldName ===
          "ERROR_MESSAGE_NO_DEPARTMENT_MARKED" && (
          <Typography color="error" sx={{mr: "auto"}}>
            {dialogValidation[0].errorMessage}
          </Typography>
        )}
        <Button onClick={onSelectAll} color="primary" variant="outlined">
          {TEXT_SELECT_ALL}
        </Button>
        <Button onClick={onCloseClick} color="primary" variant="outlined">
          {TEXT_CANCEL}
        </Button>
        <Button onClick={onOkClick} color="primary" variant="contained">
          {TEXT_CONTINUE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
