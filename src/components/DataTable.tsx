import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import * as React from 'react';
import useTableData, { Order, User } from '../custom-hooks/useTableData';
import { formatDate } from '../formatters/date';
import { formatRole } from '../formatters/role';
import { data } from '../mocks/users';
import UserForm from './UserForm';
import { Button, Snackbar, TextField } from '@mui/material';

type UserKeys = keyof User;

const FlexBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px"
})

interface HeadCell {
  disablePadding: boolean;
  id: UserKeys;
  label: string;
  hideSort?: boolean;
}

const initialValue = {
  name: "",
  role: "",
  email: "",
  dob: "",
  active: false,
  bio: "",
  shift: "",
  salary: 0,
  id: 0
}


const headCells: readonly HeadCell[] = [
  {
    id: 'name',
    disablePadding: true,
    label: 'Name',
  },
  {
    id: 'email',
    disablePadding: false,
    label: 'Email',
  },
  {
    id: 'role',
    disablePadding: false,
    label: 'Role',
  },
  {
    id: 'dob',
    disablePadding: false,
    label: 'DOB',
  },
  {
    id: 'salary',
    disablePadding: false,
    label: 'Salary (in lacs)',
  },
  {
    id: 'shift',
    disablePadding: false,
    label: 'Shift Timing',
  },
  {
    id: 'active',
    disablePadding: false,
    label: 'Status',
  }
];

interface DataTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: UserKeys) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function DataTableHead(props: DataTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: UserKeys) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align='left'
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell
          align='right'
          padding='none'
        >

        </TableCell>
      </TableRow>
    </TableHead>
  );
}

interface DataTableToolbarProps {
  numSelected: number;
  onClickDeleteBtn: () => void
}

function DataTableToolbar(props: DataTableToolbarProps) {
  const { numSelected, onClickDeleteBtn } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Users
        </Typography>
      )}
      {numSelected > 0 && (
        <Tooltip title="Delete">
          <IconButton onClick={onClickDeleteBtn}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}
export default function DataTable() {

  const { emptyRows, handleChangePage, handleChangeRowsPerPage, handleClick, handleRequestSort,
    handleSelectAllClick, isSelected, visibleRows, selected, order, orderBy, page, rowsPerPage, rows, dialogOpen, toggleDialog,
    deleteUser, operationType, selectedValue, openCreateUserDialog, openEditUserDialog,
    handleSearchChange, inputValue, toastMessage, toastOpen, closeToast, submitForm, totalSalary, deleteSelectedUsers
  } = useTableData(data);

  const renderStatus = (active: boolean) => active ? "Active" : "Inactive";

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <FlexBox >
          <TextField
            placeholder='Search name or email'            
            size="small"
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <Button variant='contained' onClick={openCreateUserDialog}>Create</Button>

        </FlexBox>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <DataTableToolbar numSelected={selected.length} onClickDeleteBtn={deleteSelectedUsers} />
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
            >
              <DataTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.name}
                      </TableCell>
                      <TableCell >{row.email}</TableCell>
                      <TableCell >{formatRole(row.role)}</TableCell>
                      <TableCell >{formatDate(row.dob)}</TableCell>
                      <TableCell >{row.salary}</TableCell>
                      <TableCell >{row.shift}</TableCell>
                      <TableCell >{renderStatus(row.active)}</TableCell>
                      <TableCell align='right'>
                        <IconButton onClick={(e) => {
                          deleteUser(row.id)
                          e.stopPropagation();
                        }}>
                          <DeleteIcon />
                        </IconButton>
                        <IconButton onClick={(e) => {
                          openEditUserDialog(row);
                          e.stopPropagation();
                        }}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: (53) * emptyRows,
                    }}
                  >
                    <TableCell colSpan={8} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        <Typography color="green" textAlign="right">
          Total Salary: {totalSalary} Lacs
        </Typography>
      </Box>
      {dialogOpen && <UserForm
        handleClose={() => toggleDialog(false)}
        operationType={operationType}
        onSubmit={submitForm}
        defaultValue={operationType == "create" ? initialValue : selectedValue!}
      />}

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={closeToast}
        message={toastMessage}
      />
    </>
  );
}
