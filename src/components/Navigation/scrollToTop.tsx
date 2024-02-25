import {useEffect} from "react";
import {withRouter} from "react-router-dom";
// import { useHistory } from "react-router";

import {History} from "history";

interface ScrollToTopProps {
  history: History;
}

function ScrollToTop({history}: ScrollToTopProps) {
  useEffect(() => {
    const unlisten = history.listen(() => {
      window.scrollTo({top: 0, behavior: "smooth"});
    });
    return () => {
      unlisten();
    };
  }, [history]);

  return null;
}

export default withRouter(ScrollToTop);
