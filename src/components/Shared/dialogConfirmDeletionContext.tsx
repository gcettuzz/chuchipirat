// import React from "react";
// import { useReducer, useContext } from "react";
// import {
//   DELETE as TEXT_DELETE,
//   CANCEL as TEXT_CANCEL,
// } from "../../constants/text";

// // Danke an https://devrecipes.net/custom-confirm-dialog-with-react-hooks-and-the-context-api/

// const CONFIRM_DELETION_DIALOG_INITIAL_STATE: State = {
//   visible: false,
//   confirmationString: "",
// };

// const ConfirmDeletionContext = React.createContext({
//   confirmDeletionState: CONFIRM_DELETION_DIALOG_INITIAL_STATE,
//   dispatch: (value: any) => {
//     return;
//   },
// });
// /* ===================================================================
// // ========================= Context Provider ========================
// // =================================================================== */
// enum ReducerActions {
//   SHOW_CONFIRM_DIALOG = "SHOW_CONFIRM_DIALOG",
//   HIDE_CONFIRM_DIALOG = "HIDE_CONFIRM_DIALOG",
// }

// type DispatchAction = {
//   type: ReducerActions;
//   payload: State;
// };

// type State = {
//   visible: boolean;
//   confirmationString: string;
// };

// interface DialogContentProps {
//   confirmationString: string;
// }

// const reducer = (state: State, action: DispatchAction): State => {
//   switch (action.type) {
//     case ReducerActions.SHOW_CONFIRM_DIALOG:
//       return {
//         visible: true,
//         confirmationString: action.payload.confirmationString,
//       };
//     case ReducerActions.HIDE_CONFIRM_DIALOG:
//       return CONFIRM_DELETION_DIALOG_INITIAL_STATE;
//     default:
//       return CONFIRM_DELETION_DIALOG_INITIAL_STATE;
//   }
// };

// export const ConfirmDeletionContextProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(
//     reducer,
//     CONFIRM_DELETION_DIALOG_INITIAL_STATE
//   );

//   return (
//     //@ts-ignore
//     <ConfirmDeletionContext.Provider
//       value={{
//         confirmDeletionState: state,
//         dispatch: dispatch,
//       }}
//     >
//       {children}
//     </ConfirmDeletionContext.Provider>
//   );
// };

// /* ===================================================================
// // ========================== Confirm Promise ========================
// // =================================================================== */
// let resolveCallback;

// export const useConfirmDeletion = () => {
//   const { confirmDeletionState: confirmDeletionState, dispatch } = useContext(
//     ConfirmDeletionContext
//   );
//   const onConfirmDeletion = () => {
//     closeConfirmDeletion();
//     resolveCallback(true);
//   };

//   const onCancelDeletion = () => {
//     closeConfirmDeletion();
//     resolveCallback(false);
//   };
//   const confirmDeletion = ({ confirmationString }: DialogContentProps) => {
//     dispatch({
//       type: ReducerActions.SHOW_CONFIRM_DIALOG,
//       payload: {
//         confirmationString: confirmationString,
//       },
//     });
//     return new Promise((res, rej) => {
//       resolveCallback = res;
//     });
//   };

//   const closeConfirmDeletion = () => {
//     dispatch({
//       type: ReducerActions.HIDE_CONFIRM_DIALOG,
//     });
//   };

//   return {
//     confirmDeletion,
//     onConfirmDeletion,
//     onCancelDeletion,
//     confirmDeletionState,
//   };
// };

// export default ConfirmDeletionContext;
