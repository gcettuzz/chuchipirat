import {useEffect} from "react";
import {useHistory} from "react-router";

function ScrollToTop() {
  const history = useHistory();

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

export default ScrollToTop;
