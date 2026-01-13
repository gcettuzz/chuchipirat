import {type Edge} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

export type DraggableState =
  | {type: "idle"}
  | {type: "preview"; container: HTMLElement}
  | {type: "dragging"};

export const idleState: DraggableState = {type: "idle"};
export const draggingState: DraggableState = {type: "dragging"};

export type CleanupFn = () => void;
export type ItemEntry = {itemUiId: string; element: HTMLElement};

export type ListContextValue = {
  getListLength: () => number;
  registerItem: (entry: ItemEntry) => CleanupFn;
  reorderItem: (args: {
    list: string[];
    startIndex: number;
    indexOfTarget: number;
    closestEdgeOfTarget: Edge | null;
  }) => void;
  instanceId: symbol;
};

export type LastCardMoved<T> = {
  item: T;
  previousIndex: number;
  currentIndex: number;
  numberOfItems: number;
} | null;
