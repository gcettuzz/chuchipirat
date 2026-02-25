import React from "react";
import Firebase from "./firebase.class";

export const FirebaseContext = React.createContext<Firebase | null>(null);

export const useFirebase = (): Firebase => {
  const firebase = React.useContext(FirebaseContext);
  if (!firebase)
    throw new Error("useFirebase must be used within FirebaseContext.Provider");
  return firebase;
};

