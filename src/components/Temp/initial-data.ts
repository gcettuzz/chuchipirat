export interface TaskProps {
  id: String;
  content: string;
}
export interface TasksProps {
  [key: string]: TaskProps;
}
export interface ColumnProps {
  id: String;
  title: string;
  taskIds: TaskProps["id"][];
}
export interface Columns {
  [key: string]: ColumnProps;
}
export interface InitialData {
  tasks: TasksProps;
  columns: Columns;
  columnOrder: ColumnProps["id"][];
}

const initialData = <InitialData>{
  tasks: {
    "task-1": { id: "task-1", content: "Take out the garbage" },
    "task-2": { id: "task-2", content: "Watch my favorite show" },
    "task-3": { id: "task-3", content: "Charge my phone" },
    "task-4": { id: "task-4", content: "Cook dinner" },
    "task-5": { id: "task-5", content: "I'm blocked" },
  },
  columns: {
    "column-1": {
      id: "column-1",
      title: "To do",
      taskIds: ["task-1", "task-2", "task-3", "task-4"],
    },
    "column-2": {
      id: "column-2",
      title: "Doing",
      taskIds: [],
    },
    "column-3": {
      id: "column-3",
      title: "Done",
      taskIds: [],
    },
    "column-4": {
      id: "column-4",
      title: "Not Here",
      taskIds: ["task-5"],
    },
  },
  // Facilitate reordering of the columns
  columnOrder: ["column-1", "column-2", "column-4", "column-3"],
};

export default initialData;
