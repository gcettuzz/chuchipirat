import React from "react";
import PropTypes from "prop-types";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Checkbox from "@material-ui/core/Checkbox";

import useStyles from "../../constants/styles";
import { IconButton, TextField } from "@material-ui/core";

export const TABLE_COLUMN_TYPES = {
  NUMBER: "number",
  STRING: "string",
  DATE: "date",
  BUTTON: "button",
  CHECKBOX: "checkbox",
};

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

// ===================================================================
// ============================== Tabelle ============================
// ===================================================================
// Wichtig! Wird mit den Icons gearbeitet um einen Eintrag zu ändern,
// kann immer nur eine Zeile bearbeitet werden.
const EnhancedTable = ({ tableData, tableColumns, keyColum, onIconClick }) => {
  const classes = useStyles();

  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("pos");

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <TableContainer>
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        aria-label="enhanced table"
      >
        <EnhancedTableHead
          tableColumns={tableColumns}
          classes={classes}
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
          rowCount={tableData.length}
        />
        <EnhancedTableBody
          tableColumns={tableColumns}
          tableData={tableData}
          keyColum={keyColum}
          order={order}
          orderBy={orderBy}
          onIconClick={onIconClick}
        />
      </Table>
    </TableContainer>
  );
};

// ===================================================================
// =========================== Tabellenkopf ==========================
// ===================================================================

// Beispiel Spalte
// const tableColumns = [
//   {
//     id: "firstName",
//     type: TABLE_COLUMN_TYPES.STRING,
//     textAlign: "left",
//     disablePadding: false,
//     label: "Vorname",
//     visible: true,
//     iconButton: <EditIcon />
//   },...
// id der Spalte entspricht der Zelle im Array

const EnhancedTableHead = ({
  tableColumns,
  order,
  orderBy,
  rowCount,
  onRequestSort,
}) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {tableColumns.map((column) => (
          <React.Fragment key={"fragment_" + column.id}>
            {column.visible ? (
              <TableCell
                key={column.id}
                align={column.textAlign}
                padding={column.disablePadding ? "none" : "default"}
                sortDirection={orderBy === column.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={orderBy === column.id ? order : "asc"}
                  onClick={createSortHandler(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              </TableCell>
            ) : null}
          </React.Fragment>
        ))}
      </TableRow>
    </TableHead>
  );
};

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  // numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  // onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

// ===================================================================
// ========================== Tabellenkörper =========================
// ===================================================================

const EnhancedTableBody = ({
  tableData,
  tableColumns,
  keyColum,
  order,
  orderBy,
  onIconClick,
}) => {
  // const classes = useStyles();

  return (
    <TableBody>
      {stableSort(tableData, getComparator(order, orderBy)).map((row) => {
        // const labelId = `enhanced-table-checkbox-${index}`;
        return (
          <TableRow hover tabIndex={-1} key={row[keyColum]}>
            {tableColumns.map((column, index) => {
              if (column.visible) {
                switch (column.type) {
                  case TABLE_COLUMN_TYPES.NUMBER:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColum] + "_cell_" + column.id}
                      >
                        {row[column.id]}
                      </TableCell>
                    );
                  case TABLE_COLUMN_TYPES.STRING:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColum] + "_cell_" + column.id}
                      >
                        {row[column.id]}
                      </TableCell>
                    );
                  case TABLE_COLUMN_TYPES.DATE:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColum] + "_cell_" + column.id}
                      >
                        {row[column.id].toLocaleString("de-CH", {
                          dateStyle: "medium",
                        })}
                      </TableCell>
                    );
                  case TABLE_COLUMN_TYPES.BUTTON:
                    return (
                      <TableCell
                        align="center"
                        key={row[keyColum] + "_cell_" + column.id}
                      >
                        <IconButton
                          color="primary"
                          component="span"
                          id={row[keyColum] + "_button_" + column.id}
                          onClick={(event) => onIconClick(event, row)}
                        >
                          {column.iconButton}
                        </IconButton>
                      </TableCell>
                    );
                  case TABLE_COLUMN_TYPES.CHECKBOX:
                    return (
                      <TableCell
                        align="center"
                        key={row[keyColum] + "_cell_" + column.id}
                      >
                        <Checkbox disabled checked={row[column.id]} />
                      </TableCell>
                    );
                  default:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColum] + "_cell_" + column.id}
                      >
                        {row[column.id]}
                      </TableCell>
                    );
                }
              }
            })}
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default EnhancedTable;
