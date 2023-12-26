//FIXME: löschen nach Typescript Migration
export const VIEW = "view";
export const EDIT = "edit";
export const NEW = "new";
export const ADD = "add";
export const DELETE = "delete";
export const MOVE_UP = "moveup";
export const MOVE_DOWN = "movedown";
export const TRACE = "trace";
export const REFRESH = "refresh";

enum Action {
  VIEW = "VIEW",
  EDIT = "EDIT",
  NEW = "NEW",
  NEWSECTION = "NEWSECTION",
  ADD = "ADD",
  DELETE = "DELETE",
  MOVEUP = "MOVEUP",
  MOVEDOWN = "MOVEDOWN",
  TRACE = "TRACE",
  REFRESH = "REFRESH",
  KEEP = "KEEP",
  NONE = "",
}

export default Action;
