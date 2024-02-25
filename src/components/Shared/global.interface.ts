import {RouteComponentProps} from "react-router-dom";
import AuthUser from "../Firebase/Authentication/authUser.class";
import Firebase from "../Firebase/firebase.class";
import * as H from "history";
/**
 * Change-Management Objekt für das festhalten von
 * Created / Edited
 * @param date - Datum der Änderung
 * @param fromUid - UID des Users
 * @param fromDisplayName - Anzeigename des Users
 */
export interface ChangeRecord {
  date: Date;
  fromUid: string;
  fromDisplayName: string;
}
/**
 * Bilder-URL in verschiedenen grössen
 * @param smallSize - für Avatar
 * @param normalSize - normale Grösse
 * @param fullSize - Grösse in voller Auflösung
 */
export interface Picture {
  smallSize: string;
  normalSize: string;
  fullSize: string;
}
export interface ButtonAction {
  buttonText: string;
  onClick: (
    event: React.MouseEvent<HTMLButtonElement>,
    value?: {[key: string]: any}
  ) => void;
}

export interface ExtendedProps extends RouteComponentProps {
  firebase?: Firebase;
}

export interface BaseProperties extends ExtendedProps {
  props: ExtendedProps;
  authUser: AuthUser | null;
}

export interface match<T> {
  params: T;
  isExact: boolean;
  path: string;
  url: string;
}

export interface CustomRouterProps<T1 = undefined, T2 = object> {
  match: match<T1>;
  history: H.History;
  location: H.Location & {
    state?: T2;
  };
  firebase: Firebase;
  oobCode?: string;
}
