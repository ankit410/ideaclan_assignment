import { debounce } from "@mui/material";
import * as React from "react";

export interface User {
  id: number;
  name: string; // Text Field
  role: string; // Select Field
  email: string; // Email Field
  dob: string; // Date Field
  active: boolean; // Switch Field
  bio: string; // Text area
  shift: string;  // Radio button
  salary: number; // Number Field  
}

export type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string | boolean },
  b: { [key in Key]: number | string | boolean },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const useTableData = (defaultRows: User[]) => {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof User>('name');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [rowsData, setRows] = React.useState<User[]>(defaultRows);
  const [searchedRows, setSearchedRows] = React.useState<User[]>(rowsData);
  const [operationType, setOperationType] = React.useState<"create" | "edit">("create");
  const [selectedValue, setSelectedValue] = React.useState<User | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const rows = inputValue.length ? searchedRows : rowsData;

  React.useEffect(()=>{
    setSearchedRows([...rowsData])
  },[rowsData]) 

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof User,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const toggleDialog = (value: boolean) => setDialogOpen(value);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      stableSort(rows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [order, orderBy, page, rowsPerPage, rowsData, searchedRows],
  );

  const totalSalary = React.useMemo(
    () => rows.reduce((sum,cur)=>sum + cur.salary, 0)
     ,
    [rowsData, searchedRows],
  );

  const openToast = (message: string) => {
    setToastOpen(true);
    setToastMessage(message);
  }

  const closeToast = () => {
    setToastMessage("");
    setToastOpen(false);
  }

  // form actions

  const createUser = (values: User) => {
    const user = { ...values, id: Date.now() };
    setRows([user, ...rows])
  }

  const editUser = (values: User) => {
    const users = rows.map((row) => {
      if (row.id === selectedValue!.id) return { ...values, id: selectedValue!.id };
      return row;
    })
    setRows(users)
  }

  const deleteUser = (id: number) => {
    setRows((rows) => rows.filter((row) => row.id !== id))
    openToast("User deleted")
  }

  const deleteSelectedUsers = () => {
    const idMap = new Map(selected.map((row)=>[row, row]))
    setRows((rows) => rows.filter((row) => !idMap.has(row.id) ))
    setSelected([])
    openToast("Users deleted")
  } 

  const openCreateUserDialog = () => {
    setOperationType("create");
    setDialogOpen(true);
  }

  const openEditUserDialog = (user: User) => {
    setOperationType("edit");
    setDialogOpen(true);
    setSelectedValue(user)
  }

  const closeDialog = () => {
    setSelectedValue(null);
    setDialogOpen(false);
  }

  const comparator = (input: string, row: User) => {
    const searchText = input.toLowerCase();
    const name = row.name.toLowerCase();
    const email = row.email.toLowerCase();
    return name.includes(searchText) || email.includes(searchText)
  }

  const searchUsers = (value: string) => {
    setSearchedRows(rowsData.filter((row) => comparator(value, row)))
  }

  const debounceSearch = React.useCallback(debounce(searchUsers, 300), [rowsData])

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    debounceSearch(value);
  }

  const submitForm = (values: User) => {
    if(operationType == "create") {
      createUser(values);
      openToast("User created");
    }else {
      editUser(values);
      openToast("User edited");
    }
    toggleDialog(false);
  }

  return {
    visibleRows,
    selected,
    emptyRows,
    rows,
    order, orderBy, page, rowsPerPage,
    dialogOpen,
    operationType,
    inputValue,
    selectedValue,
    toastMessage,
    toastOpen,
    totalSalary,
    handleChangePage,
    isSelected,
    handleChangeRowsPerPage,
    handleClick,
    handleSelectAllClick,
    handleRequestSort,
    toggleDialog,
    deleteUser, editUser, createUser,
    setSelectedValue,
    openEditUserDialog, openCreateUserDialog, closeDialog, handleSearchChange,
    openToast, closeToast,
    submitForm,
    deleteSelectedUsers
  }

}

export default useTableData;