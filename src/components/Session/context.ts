import React from "react";
import AuthUser from "../Firebase/Authentication/authUser.class";

const AuthUserContext = React.createContext<AuthUser | null>(null);

export default AuthUserContext;
