import React from "react";
import {useReducer, useContext} from "react";
import {OK as TEXT_OK, CANCEL as TEXT_CANCEL} from "../../constants/text";

// Danke an https://devrecipes.net/custom-confirm-dialog-with-react-hooks-and-the-context-api/

export enum DialogType {
  None,
  Confirm,
  SingleTextInput,
  ConfirmDeletion,
  selectOptions,
}

const CUSTOM_DIALOG_INITIAL_STATE: State = {
  dialogType: DialogType.None,
  visible: false,
  text: "",
  title: "",
  buttonTextConfirm: "",
  buttonTextCancel: "",
  options: [],
};

const CustomDialogContext = React.createContext({
  dialogState: CUSTOM_DIALOG_INITIAL_STATE,
  dispatch: (value: any) => {
    return;
  },
});

export interface SingleTextInputResult {
  valid: boolean;
  input: string;
}
/* ===================================================================
// ========================= Context Provider ========================
// =================================================================== */
enum ReducerActions {
  SHOW_DIALOG = "SHOW_DIALOG",
  HIDE_DIALOG = "HIDE_DIALOG",
}

type DispatchAction = {
  type: ReducerActions;
  payload: State;
};

type Option = {key: number | string; text: string};

type State = {
  dialogType: DialogType;
  visible: boolean;
  title: string;
  text: string;
  buttonTextConfirm: string;
  buttonTextCancel: string;
  deletionDialogProperties?: DeletionDialogProperties;
  singleTextInputProperties?: SingleTextInputProperties;
  options: Option[];
};

interface DeletionDialogProperties {
  confirmationString: string;
}

interface SingleTextInputProperties {
  initialValue: string;
  textInputLabel: string;
  textInputMultiline?: boolean;
}

interface DialogContentProps {
  dialogType: DialogType;
  title?: string;
  text?: string;
  buttonTextConfirm?: string;
  buttonTextCancel?: string;
  deletionDialogProperties?: DeletionDialogProperties;
  singleTextInputProperties?: SingleTextInputProperties;
  options?: Option[];
}

const reducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case ReducerActions.SHOW_DIALOG:
      return {
        ...action.payload,
        visible: true,
      };
    case ReducerActions.HIDE_DIALOG:
      return CUSTOM_DIALOG_INITIAL_STATE;
    default:
      return CUSTOM_DIALOG_INITIAL_STATE;
  }
};

export const CustomDialogContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducer, CUSTOM_DIALOG_INITIAL_STATE);

  return (
    <CustomDialogContext.Provider
      value={{
        dialogState: state,
        dispatch: dispatch,
      }}
    >
      {children}
    </CustomDialogContext.Provider>
  );
};

/* ===================================================================
// ========================== Confirm Promise ========================
// =================================================================== */
let resolveCallback;

export const useCustomDialog = () => {
  const {dialogState, dispatch} = useContext(CustomDialogContext);
  const onConfirm = (input?) => {
    closeDialog();
    if (typeof input == "string" || typeof input == "number") {
      resolveCallback({valid: true, input: input});
    } else {
      resolveCallback(true);
    }
  };

  const onCancel = (input?) => {
    closeDialog();
    if (typeof input == "string" || typeof input == "number") {
      resolveCallback({valid: false, input: ""});
    } else {
      resolveCallback(false);
    }
  };
  const customDialog = ({
    dialogType,
    title,
    text,
    buttonTextCancel,
    buttonTextConfirm,
    deletionDialogProperties,
    singleTextInputProperties,
    options,
  }: DialogContentProps) => {
    dispatch({
      type: ReducerActions.SHOW_DIALOG,
      payload: {
        dialogType: dialogType,
        title: title,
        text: text,
        buttonTextConfirm: buttonTextConfirm ? buttonTextConfirm : TEXT_OK,
        buttonTextCancel: buttonTextCancel ? buttonTextCancel : TEXT_CANCEL,
        deletionDialogProperties: deletionDialogProperties,
        singleTextInputProperties: singleTextInputProperties,
        options: options,
      },
    });
    return new Promise((res, rej) => {
      resolveCallback = res;
    });
  };

  const closeDialog = () => {
    dispatch({
      type: ReducerActions.HIDE_DIALOG,
    });
  };

  return {customDialog, onConfirm, onCancel, dialogState};
};

export default CustomDialogContext;
