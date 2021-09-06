import React from "react";

import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";
import * as LOCAL_STORAGE from "../../constants/localStorage";

const withAuthentication = (Component) => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        authUser: JSON.parse(sessionStorage.getItem(LOCAL_STORAGE.AUTH_USER)),
      };
    }

    componentDidMount() {
      this.listener = this.props.firebase.onAuthUserListener(
        (authUser) => {
          sessionStorage.setItem(
            LOCAL_STORAGE.AUTH_USER,
            JSON.stringify(authUser)
          );
          this.setState({ authUser });
        },
        () => {
          sessionStorage.removeItem(LOCAL_STORAGE.AUTH_USER);
          this.setState({ authUser: null });
        }
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return withFirebase(WithAuthentication);
};

export default withAuthentication;
