import React, {useState, useEffect} from "react";
import {compose} from "react-recompose";
import {withRouter} from "react-router-dom";

import AuthUser from "../Firebase/Authentication/authUser.class";
import {withFirebase} from "../Firebase/firebaseContext";

import {
  SIGN_IN as ROUTE_SIGN_IN,
  NO_AUTH as ROUTE_NO_AUTH,
  // VERIFY_EMAIL as ROUTE_VERIFY_EMAIL,
} from "../../constants/routes";
import {RouteComponentProps} from "react-router";
import Firebase from "../Firebase/firebase.class";

export const AuthUserContext = React.createContext<AuthUser | null>(null);

/* ===================================================================
// ============================ Prüfung User =========================
// =================================================================== */
interface WithAuthenticationProps {
  firebase: Firebase;
}

export const withAuthentication = <P extends WithAuthenticationProps>(
  Component: React.ComponentType<P>
) => {
  const WithAuthentication: React.FC<Omit<P, keyof WithAuthenticationProps>> = (
    props
  ) => {
    const {firebase, ...restProps} = props as P;
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);

    useEffect(() => {
      // wieso wird der auth listener nicht erneut gerufen....
      const listener = firebase.onAuthUserListener((authUser) => {
        setAuthUser(authUser);
      });

      return () => {
        listener(); // Aufräumarbeiten beim Komponentenabbau
      };
    }, [firebase.auth]);

    return (
      <AuthUserContext.Provider value={authUser}>
        <Component {...(restProps as P)} />
      </AuthUserContext.Provider>
    );
  };

  return withFirebase(WithAuthentication);
};

/* ===================================================================
// ======================== Prüfung Berechtigung =====================
// =================================================================== */
export const withAuthorization =
  (condition: (authUser: AuthUser | null) => boolean) =>
  <P extends RouteComponentProps & {firebase: Firebase}>(
    Component: React.ComponentType<P>
  ) => {
    const WithAuthorization: React.FC<P> = (props) => {
      useEffect(() => {
        const listener = props.firebase.onAuthUserListener((authUser) => {
          if (authUser === null) {
            props.history.push(ROUTE_SIGN_IN);
          } else if (!condition(authUser)) {
            props.history.push(ROUTE_NO_AUTH);
          }
        });

        return () => {
          listener(); // Aufräumarbeiten beim Komponentenabbau
        };
      }, [props.firebase.auth, props.history]);

      return (
        <AuthUserContext.Consumer>
          {(authUser) =>
            condition(authUser) ? <Component {...props} /> : null
          }
        </AuthUserContext.Consumer>
      );
    };

    return compose(withRouter, withFirebase)(WithAuthorization);
  };
