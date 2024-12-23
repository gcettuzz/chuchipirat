import React from "react";
import PropTypes from "prop-types";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";

import useStyles from "../../constants/styles";
import {IconButton, Typography, Link} from "@mui/material";
import Utils from "./utils.class";
import {ValueObject} from "../Firebase/Db/firebase.db.super.class";

export enum TableColumnTypes {
  number = "number",
  string = "string",
  date = "date",
  button = "button",
  checkbox = "checkbox",
  link = "link",
  icon = "icon",
  chip = "chip",
  JSX = "jsx",
}

export enum ColumnTextAlign {
  center = "center",
  inherit = "inherit",
  justify = "justify",
  left = "left",
  right = "right",
}

export interface Column {
  id: string;
  type: TableColumnTypes;
  textAlign: ColumnTextAlign;
  disablePadding: boolean;
  label: string;
  visible: boolean;
  iconButton?: JSX.Element;
  monoSpaces?: boolean;
}

type Order = "asc" | "desc";

function stableSort(
  array: Record<string, unknown>[],
  comparator: (a: any, b: any) => number
) {
  const stabilizedThis = array.map(
    (el, index) => [el, index] as [Record<string, unknown>, number]
  );
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

const getComparator = <Key extends keyof any>(
  order: Order,
  orderBy: Key
): ((
  a: {[key in Key]: number | string},
  b: {[key in Key]: number | string}
) => number) =>
  order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);

// ===================================================================
// ============================== Tabelle ============================
// ===================================================================
// ATTENTION: Wird mit den Icons gearbeitet um einen Eintrag zu ändern,
// kann immer nur eine Zeile bearbeitet werden.
interface EnhancedTableProps {
  tableData: ValueObject[];
  tableColumns: Column[];
  keyColum: string;
  onIconClick?: (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    row: any
  ) => void;
  onRowClick?: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    rowId: string
  ) => void;
}
const EnhancedTable = ({
  tableData,
  tableColumns,
  keyColum,
  onIconClick,
  onRowClick,
}: EnhancedTableProps) => {
  const classes = useStyles();

  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState("pos");

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <TableContainer style={{width: "100%"}}>
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        aria-label="enhanced table"
        style={{width: "100%"}}
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
          onRowClick={onRowClick}
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
interface EnhancedTableHeadProps {
  tableColumns: Column[];
  order: Order;
  orderBy: string;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  rowCount: number;
}
const EnhancedTableHead = ({
  tableColumns,
  order,
  orderBy,
  onRequestSort,
}: EnhancedTableHeadProps) => {
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
                padding={column.disablePadding ? "none" : "normal"}
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
interface EnhancedTableBodyProps {
  tableData: Record<string, unknown>[];
  tableColumns: Column[];
  keyColum: string;
  order: Order;
  orderBy: string;
  onIconClick?: (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    row: any
  ) => void;
  onRowClick?: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    rowKey: string
  ) => void;
}
const EnhancedTableBody = ({
  tableData,
  tableColumns,
  keyColum: keyColumn,
  order,
  orderBy,
  onIconClick,
  onRowClick,
}: EnhancedTableBodyProps) => {
  const classes = useStyles();

  return (
    <TableBody>
      {stableSort(tableData, getComparator(order, orderBy)).map((row) => {
        const rowKey = row[keyColumn] as string; // Hier wird der Typ von row[keyColumn] als string angenommen

        return (
          <TableRow
            hover
            tabIndex={-1}
            key={rowKey}
            onClick={(event) => {
              onRowClick && onRowClick(event, rowKey);
            }}
          >
            {tableColumns.map((column) => {
              let cellValue: any = "";

              if (column.id.includes(".")) {
                // Punkte auflösen im Loop
                cellValue = row;
                column.id.split(".").forEach((member) => {
                  cellValue = cellValue[member];
                });
              } else {
                cellValue = row[column.id];
              }
              if (column.visible) {
                switch (column.type) {
                  case TableColumnTypes.number:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColumn] + "_cell_" + column.id}
                      >
                        {cellValue}
                      </TableCell>
                    );
                  case TableColumnTypes.string:
                    return column.monoSpaces ? (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColumn] + "_cell_" + column.id}
                        className={classes.typographyCode}
                      >
                        {cellValue}
                      </TableCell>
                    ) : (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColumn] + "_cell_" + column.id}
                      >
                        {cellValue}
                      </TableCell>
                    );
                  case TableColumnTypes.date:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColumn] + "_cell_" + column.id}
                      >
                        {cellValue.toLocaleString("de-CH", {
                          dateStyle: "medium",
                        })}
                      </TableCell>
                    );
                  case TableColumnTypes.button:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColumn] + "_cell_" + column.id}
                      >
                        <IconButton
                          color="primary"
                          component="span"
                          id={row[keyColumn] + "_button_" + column.id}
                          onClick={(event) => onIconClick!(event, row)}
                        >
                          {column.iconButton}
                        </IconButton>
                      </TableCell>
                    );
                  case TableColumnTypes.checkbox:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColumn] + "_cell_" + column.id}
                      >
                        <Checkbox
                          disabled
                          checked={row[column["id"]] as boolean}
                          color="primary"
                        />
                      </TableCell>
                    );
                  case TableColumnTypes.link:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColumn] + "_cell_" + column.id}
                      >
                        <Typography>
                          <Link href={cellValue}>
                            {Utils.getDomain(cellValue)}
                          </Link>
                        </Typography>
                      </TableCell>
                    );
                  case TableColumnTypes.icon:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColumn] + "_cell_" + column.id}
                      >
                        {/* Icon muss bereits in der Tablle gespeichert sein */}
                        {row[column.id]}
                      </TableCell>
                    );
                  case TableColumnTypes.chip:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColumn] + "_cell_" + column.id}
                      >
                        <Chip label={row[column.id]} size="small" />
                      </TableCell>
                    );
                  case TableColumnTypes.JSX:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColumn] + "_cell_" + column.id}
                      >
                        {row[column.id]}
                      </TableCell>
                    );
                  default:
                    return (
                      <TableCell
                        align={column.textAlign}
                        key={row[keyColumn] + "_cell_" + column.id}
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
