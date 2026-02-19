import React, {useState, useEffect} from "react";
import {useHistory} from "react-router";

import AuthUser from "../Firebase/Authentication/authUser.class";
import {useFirebase} from "../Firebase/firebaseContext";

import {
  SIGN_IN as ROUTE_SIGN_IN,
  NO_AUTH as ROUTE_NO_AUTH,
} from "../../constants/routes";

export const AuthUserContext = React.createContext<AuthUser | null>(null);

/* ===================================================================
// ============================== Hooks ==============================
// =================================================================== */
export const useAuthUser = (): AuthUser | null => {
  return React.useContext(AuthUserContext);
};

/* ===================================================================
// ========================= AuthUserProvider ========================
// =================================================================== */
export const AuthUserProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const firebase = useFirebase();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const listener = firebase.onAuthUserListener((authUser) => {
      setAuthUser(authUser);
    });

    return () => {
      listener(); // Aufräumarbeiten beim Komponentenabbau
    };
  }, [firebase.auth]);

  return (
    <AuthUserContext.Provider value={authUser}>
      {children}
    </AuthUserContext.Provider>
  );
};

/* ===================================================================
// ======================= AuthorizationGuard ========================
// =================================================================== */
interface AuthorizationGuardProps {
  condition: (authUser: AuthUser | null) => boolean;
  children: React.ReactNode;
}
export const AuthorizationGuard: React.FC<AuthorizationGuardProps> = ({
  condition,
  children,
}) => {
  const authUser = useAuthUser();
  const firebase = useFirebase();
  const history = useHistory();

  useEffect(() => {
    const listener = firebase.onAuthUserListener((authUser) => {
      if (authUser === null) {
        history.push(ROUTE_SIGN_IN);
      } else if (!condition(authUser)) {
        history.push(ROUTE_NO_AUTH);
      }
    });

    return () => {
      listener(); // Aufräumarbeiten beim Komponentenabbau
    };
  }, [firebase.auth, history]);

  return condition(authUser) ? <>{children}</> : null;
};
