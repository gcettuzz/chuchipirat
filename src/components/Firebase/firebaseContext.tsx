import React from "react";
import Firebase from "./firebase.class";

export const FirebaseContext = React.createContext<Firebase | null>(null);

export const withFirebase = (Component) => {
  const WithFirebase = (props) => (
    <FirebaseContext.Consumer>
      {(firebase) => <Component {...props} firebase={firebase} />}
    </FirebaseContext.Consumer>
  );

  WithFirebase.displayName = `WithFirebase(${
    Component.displayName || Component.name || "Component"
  })`;

  return WithFirebase;
};
