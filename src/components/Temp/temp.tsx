import React from "react";
import { compose } from "recompose";
import useStyles from "../../constants/styles";

import initialData, {
  InitialData,
  ColumnProps,
  TaskProps,
} from "./initial-data";

import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
  Card,
  CardMedia,
  CardContent,
  makeStyles,
  CardHeader,
  Container,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from "@material-ui/core";

import Button from "@material-ui/core/Button";
import Input from "@material-ui/core/Input";
// import Link from "@material-ui/core/Link";
import * as ROLES from "../../constants/roles";

import Firebase, { withFirebase } from "../Firebase";
import { AuthUser } from "../Firebase/Authentication/authUser.class";

import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import { OnDragEndResponder } from "react-beautiful-dnd";
import { DropResult } from "react-beautiful-dnd";

const Temp = (props) => {
  return (
    <AuthUserContext.Consumer>
      {(authUser) => <TempBase props={props} authUser={authUser} />}
    </AuthUserContext.Consumer>
  );
};

const TempBase = ({ props, authUser }) => {
  const firebase: Firebase = props.firebase;
  const classes = useStyles();

  const [state, setState] = React.useState<InitialData>(initialData);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    let newState = {} as InitialData;

    if (!destination) {
      return;
    }
    if (
      destination?.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "COLUMN") {
      const newColumnOrder = Array.from(state.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      newState = {
        ...state,
        columnOrder: newColumnOrder,
      };
    } else {
      const start = state.columns[source.droppableId];
      const finish = state.columns[destination.droppableId];

      if (start === finish) {
        // Gleiche Card
        const column = state.columns[source.droppableId];
        const newTaskIds = Array.from(column.taskIds);

        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination?.index, 0, draggableId);
        const newColumn = { ...column, taskIds: newTaskIds };
        newState = {
          ...state,
          columns: {
            ...state.columns,
            [newColumn.id.toString()]: newColumn,
          },
        };
      } else {
        // Unterschiedlice Card
        const sourceTaskIds = Array.from(start.taskIds);
        sourceTaskIds.splice(source.index, 1);
        const newStart = { ...start, taskIds: sourceTaskIds };

        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinish = { ...finish, taskIds: finishTaskIds };

        newState = {
          ...state,
          columns: {
            ...state.columns,
            [newStart.id.toString()]: newStart,
            [newFinish.id.toString()]: newFinish,
          },
        };
      }
    }

    setState(newState);
  };

  return (
    <React.Fragment>
      <Container style={{ marginTop: "3rem" }} component="main" maxWidth="md">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="allColumns" type="COLUMN">
            {(provided) => (
              <Container
                {...provided.droppableProps}
                innerRef={provided.innerRef}
              >
                {state.columnOrder.map((columnId, index) => {
                  let columnData = state.columns[columnId.toString()];
                  return (
                    <Column
                      key={columnData.id.toString()}
                      column={columnData}
                      tasks={columnData.taskIds.map(
                        (taskId) => state.tasks[taskId.toString()]
                      )}
                      index={index}
                    />
                  );
                })}
                {provided.placeholder}
              </Container>
            )}
          </Droppable>
        </DragDropContext>
      </Container>
      <Divider />
      <Container
        style={{ marginTop: "3rem", width: "2600px", overflow: "auto" }}
        component="main"
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "column",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((index) => (
            <div
              // className={classes.menuplanGridItem}
              style={{ flexGrow: 1, width: `${100 / 7}%` }}
            >
              {index}
            </div>
          ))}
        </div>
      </Container>
      <Container component="main">
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((index) => (
            <Grid item xs={1} style={{ backgroundColor: "red" }}>
              {index}
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container component="main">
        <div
          style={{
            display: "grid",
            // gridTemplateColumns: "1fr",
            gridTemplateRows: "1fr 1fr 1fr 1fr",
            // gridAutoRows: "min-Content",
            gridAutoFlow: "column",
          }}
        >
          {[
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
            19, 20,
          ].map((index) => (
            <div style={{ minWidth: "400px" }}>
              {index}
              {index == 7 && (
                <p>
                  öakdf
                  <br />
                  öaksjaösf
                  <br />
                </p>
              )}
            </div>
          ))}
        </div>
      </Container>
      <Container style={{ marginTop: "3rem" }}>
        {/* Test mit div */}
        <DragDropContext onDragEnd={() => {}}>
          <Droppable droppableId="cards">
            {(provided) => (
              <Container
                style={{
                  display: "grid",
                  // gridTemplateColumns: "1fr",
                  gridTemplateRows: "1fr 1fr 1fr 1fr",
                  // gridAutoRows: "min-Content",
                  gridAutoFlow: "column",
                }}
                {...provided.droppableProps}
                innerRef={provided.innerRef}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((value, index) => (
                  <Draggable draggableId={value.toString()} index={index}>
                    {(provided) => (
                      <Card
                        {...provided.draggableProps}
                        innerRef={provided.innerRef}
                      >
                        <CardHeader
                          title={value}
                          {...provided.dragHandleProps}
                        />
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Container>
            )}
          </Droppable>
        </DragDropContext>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// ============================== Column =============================
// =================================================================== */
interface ColumnUiProp {
  column: ColumnProps;
  tasks: TaskProps[];
  index: number;
}
const Column = React.memo(
  function Column({ column, tasks, index }: ColumnUiProp) {
    const classes = useStyles();
    return (
      <Draggable draggableId={column.id.toString()} index={index}>
        {(provided) => (
          <Card {...provided.draggableProps} innerRef={provided.innerRef}>
            <CardHeader {...provided.dragHandleProps} title={column.title} />
            <CardContent style={{ height: "100%" }}>
              <Droppable droppableId={column.id.toString()} type="TASK">
                {(provided, snapshot) => (
                  <List
                    innerRef={provided.innerRef}
                    {...provided.droppableProps}
                    className={
                      snapshot.isDraggingOver
                        ? classes.ListOnDrop
                        : classes.ListNoDrop
                    }
                  >
                    <TaskList tasks={tasks} />

                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
  },
  (prevProps, nextProps) => {
    if (
      nextProps.column === prevProps.column &&
      nextProps.index === prevProps.index &&
      nextProps.tasks === prevProps.tasks
    ) {
      return false;
    } else {
      return true;
    }
  }
);

/* ===================================================================
// =============================== TaskList ============================
// =================================================================== */
interface TaskListProps {
  tasks: TaskProps[];
}
const TaskList = React.memo(
  function TaskList({ tasks }: TaskListProps) {
    return (
      <React.Fragment>
        {tasks.map((task, index) => (
          <TaskItem key={task.id.toString()} task={task} index={index} />
        ))}
      </React.Fragment>
    );
  },
  (prevProps, nextProps) => {
    if (nextProps.tasks === prevProps.tasks) {
      return false;
    } else {
      return true;
    }
  }
);

interface TaskItemProps {
  task: TaskProps;
  index: number;
}
const TaskItem = ({ task, index }: TaskItemProps) => {
  const classes = useStyles();

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <ListItem
          dense
          innerRef={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={
            snapshot.isDragging
              ? classes.listItemOnDrag
              : classes.listItemNoDrag
          }
        >
          <ListItemText>{task.content}</ListItemText>
        </ListItem>
      )}
    </Draggable>
  );
};

const condition = (authUser) => !!authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(Temp);
