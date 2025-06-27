import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

export type Column<T> = {
  label: string;
  field: keyof T | string;
  renderCell?: (row: T) => React.ReactNode;
};

export type CommonTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  actions?: (row: T) => React.ReactNode;
};

function CommonTable<T>({ columns, rows, actions }: CommonTableProps<T>) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col, idx) => (
              <TableCell key={col.label || idx}>{col.label}</TableCell>
            ))}
            {actions && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col, j) => (
                <TableCell key={j}>
                  {col.renderCell ? col.renderCell(row) : (row as any)[col.field]}
                </TableCell>
              ))}
              {actions && <TableCell>{actions(row)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CommonTable; 