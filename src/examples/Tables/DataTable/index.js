import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableRow,
  TableContainer,
  Menu,
  MenuItem,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Icon,
  Autocomplete,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDPagination from "components/MDPagination";

// Material Dashboard 2 React example components
import DataTableHeadCell from "examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "examples/Tables/DataTable/DataTableBodyCell";

export default function DataTable({
  columns = [],
  apiUrl = "",
  title = "Data Table",
  initialRowsPerPage = 10,
  enableSearch = true,
  enableFilters = true,
  enablePagination = true,
  onRowClick = null,
  searchField = "name",
}) {
  // State management
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState([]);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({
    key: "",
    op: "contains",
    value: "",
  });
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const entriesOptions = ["5", "10", "20", "25", "30"];

  const filterOperators = [
    { value: "eq", label: "Equals" },
    { value: "ne", label: "Not Equals" },
    { value: "gt", label: "Greater Than" },
    { value: "lt", label: "Less Than" },
    { value: "ge", label: "Greater Than or Equal" },
    { value: "le", label: "Less Than or Equal" },
    { value: "contains", label: "Contains" },
    { value: "startswith", label: "Starts With" },
    { value: "endswith", label: "Ends With" },
  ];

  const fetchData = useCallback(async () => {
    if (!apiUrl) return;
    setLoading(true);
    try {
      // Map frontend filters to backend query params
      let query = {
        page: (page - 1).toString(), // backend is 0-based
        size: rowsPerPage.toString(),
      };
      filters.forEach((filter) => {
        // Support all filter fields, not just name/email/department
        if (filter.key && filter.value) {
          query[filter.key] = filter.value;
        }
      });
      if (search && searchField) {
        query[searchField] = search;
      }
      const params = new URLSearchParams(query);

      let token = null;
      let tokenType = "Bearer";
      const authData = localStorage.getItem("auth");
      if (authData) {
        try {
          const authObject = JSON.parse(authData);
          token = authObject.token || authObject.accessToken;
          tokenType = authObject.tokenType || "Bearer";
        } catch (e) {
          console.error("Error parsing auth data:", e);
        }
      }
      // Only set Authorization header for GET
      const headers = {};
      if (token) headers["Authorization"] = `${tokenType} ${token}`;

      const fetchUrl = `${apiUrl}?${params.toString()}`;
      console.log("Fetching:", fetchUrl);
      console.log("Headers:", headers);
      const response = await fetch(fetchUrl, {
        method: "GET",
        headers,
      });
      if (response.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      }
      const text = await response.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Failed to parse response as JSON:", text);
      }
      console.log("Backend response:", result);
      // Support both {users: [...], totalItems, ...} and {content: [...], totalElements, ...}
      if (result.users) {
        setData(result.users);
        setTotalRows(result.totalItems || result.users.length);
      } else if (result.content) {
        setData(result.content);
        setTotalRows(result.totalElements || result.content.length);
      } else if (Array.isArray(result)) {
        setData(result);
        setTotalRows(result.length);
      } else {
        setData([]);
        setTotalRows(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, page, rowsPerPage, filters, search, searchField]);

  useEffect(() => {
    let isMounted = true;
    fetchData().then(() => {
      if (!isMounted) return;
    });
    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const debouncedSearch = useCallback(
    debounce((newSearch) => {
      setSearch(newSearch);
      setPage(1);
    }, 300),
    []
  );

  const totalPages = enablePagination ? Math.max(1, Math.ceil(totalRows / rowsPerPage)) : 1;

  const setEntriesPerPage = (value) => {
    const currentValue = parseInt(value, 10);
    setRowsPerPage(currentValue);
    setPage(1);
  };

  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleFilterDialogOpen = (columnField) => {
    setCurrentFilter({
      key: columnField,
      op: "contains",
      value: "",
    });
    setFilterDialogOpen(true);
    handleFilterMenuClose();
  };

  const handleFilterDialogClose = () => {
    setFilterDialogOpen(false);
  };

  const handleApplyFilter = () => {
    if (currentFilter.key && currentFilter.value) {
      setFilters((prev) => [...prev, { ...currentFilter }]);
      setFilterDialogOpen(false);
      setPage(1);
    }
  };

  const handleRemoveFilter = (index) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters([]);
    setSearch("");
    setPage(1);
  };

  const getColumnLabel = (field) => {
    const column = columns.find((col) => col.field === field);
    return column ? column.headerName : field;
  };

  const getOperatorLabel = (operator) => {
    const op = filterOperators.find((op) => op.value === operator);
    return op ? op.label : operator;
  };

  // Enhanced pagination rendering
  const renderPagination = () => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => (
        <MDPagination
          item
          key={i}
          onClick={() => setPage(i + 1)}
          active={page === i + 1}
        >
          {i + 1}
        </MDPagination>
      ));
    }

    const pages = [];
    const addPage = (pageNum) => (
      <MDPagination
        item
        key={pageNum}
        onClick={() => setPage(pageNum)}
        active={page === pageNum}
      >
        {pageNum}
      </MDPagination>
    );

    // Always show first page
    pages.push(addPage(1));

    // Show ellipsis if needed
    if (page > 3) {
      pages.push(<MDTypography key="start-ellipsis">...</MDTypography>);
    }

    // Show pages around current page
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(addPage(i));
    }

    // Show ellipsis if needed
    if (page < totalPages - 2) {
      pages.push(<MDTypography key="end-ellipsis">...</MDTypography>);
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(addPage(totalPages));
    }

    return pages;
  };

  const entriesStart = totalRows === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const entriesEnd = Math.min(page * rowsPerPage, totalRows);

  return (
    <TableContainer sx={{ boxShadow: "none" }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox display="flex" alignItems="center" gap={2}>
          <MDBox display="flex" alignItems="center">
            <Autocomplete
              disableClearable
              value={rowsPerPage.toString()}
              options={entriesOptions}
              onChange={(_, newValue) => {
                if (newValue) {
                  setEntriesPerPage(parseInt(newValue, 10));
                }
              }}
              size="small"
              sx={{ width: "5rem" }}
              renderInput={(params) => <MDInput {...params} />}
            />
            <MDTypography variant="caption" color="secondary">
              &nbsp;&nbsp;entries per page
            </MDTypography>
          </MDBox>

          {enableSearch && (
            <MDBox width="12rem">
              <MDInput
                placeholder="Search..."
                size="small"
                fullWidth
                value={search}
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </MDBox>
          )}

          {enableFilters && (
            <IconButton onClick={handleFilterMenuOpen}>
              <FilterListIcon />
            </IconButton>
          )}
        </MDBox>
      </MDBox>

      {filters.length > 0 && (
        <MDBox display="flex" flexWrap="wrap" gap={1} mb={2} px={3}>
          {filters.map((filter, index) => (
            <MDBox
              key={index}
              component="span"
              bgColor="light"
              color="dark"
              py={0.5}
              px={1.5}
              borderRadius="md"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <MDTypography variant="caption" fontWeight="medium">
                {`${getColumnLabel(filter.key)} ${getOperatorLabel(filter.op)} "${filter.value}"`}
              </MDTypography>
              <Icon
                sx={{ cursor: "pointer", fontSize: "small" }}
                onClick={() => handleRemoveFilter(index)}
              >
                close
              </Icon>
            </MDBox>
          ))}
          {filters.length > 0 && (
            <MDBox
              component="span"
              bgColor="error"
              color="white"
              py={0.5}
              px={1.5}
              borderRadius="md"
              onClick={handleClearFilters}
              sx={{ cursor: "pointer" }}
            >
              <MDTypography variant="caption" fontWeight="medium" color="white">
                Clear All
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
      )}

      <Table>
        <MDBox component="thead">
          <TableRow>
            {columns.map((column) => (
              <DataTableHeadCell
                key={column.field}
                width={column.width || "auto"}
                align={column.align || "left"}
                sorted={false}
              >
                {column.headerName}
              </DataTableHeadCell>
            ))}
          </TableRow>
        </MDBox>
        <TableBody>
          {loading ? (
            <TableRow>
              <DataTableBodyCell colSpan={columns.length} align="center">
                Loading...
              </DataTableBodyCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <DataTableBodyCell colSpan={columns.length} align="center">
                No data available
              </DataTableBodyCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={index}
                sx={{ cursor: onRowClick ? "pointer" : "default" }}
                onClick={() => onRowClick && onRowClick(row)}
                hover
              >
                {columns.map((column) => (
                  <DataTableBodyCell key={column.field} align={column.align || "left"}>
                    {column.renderCell ? column.renderCell(row) : row[column.field] ?? "-"}
                  </DataTableBodyCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {enablePagination && (
        <MDBox
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          p={3}
        >
          <MDBox mb={{ xs: 3, sm: 0 }}>
            <MDTypography variant="button" color="secondary" fontWeight="regular">
              Showing {entriesStart} to {entriesEnd} of {totalRows} entries
            </MDTypography>
          </MDBox>

          {totalPages > 1 && (
            <MDPagination variant="gradient" color="info">
              {page > 1 && (
                <MDPagination item onClick={() => setPage(page - 1)}>
                  <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
                </MDPagination>
              )}

              {renderPagination()}

              {page < totalPages && (
                <MDPagination item onClick={() => setPage(page + 1)}>
                  <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                </MDPagination>
              )}
            </MDPagination>
          )}
        </MDBox>
      )}

      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
      >
        {columns.map((column) => (
          <MenuItem key={column.field} onClick={() => handleFilterDialogOpen(column.field)}>
            {column.headerName}
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={filterDialogOpen} onClose={handleFilterDialogClose}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <MDTypography variant="h6">Add Filter</MDTypography>
          <IconButton aria-label="close" onClick={handleFilterDialogClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 400 }}>
          <MDBox display="flex" flexDirection="column" gap={2}>
            <MDTypography variant="subtitle2">
              {getColumnLabel(currentFilter.key)}
            </MDTypography>

            <FormControl fullWidth size="small">
              <InputLabel>Operator</InputLabel>
              <Select
                value={currentFilter.op}
                label="Operator"
                onChange={(e) => setCurrentFilter({ ...currentFilter, op: e.target.value })}
              >
                {filterOperators.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <MDInput
              label="Value"
              size="small"
              fullWidth
              value={currentFilter.value}
              onChange={(e) => setCurrentFilter({ ...currentFilter, value: e.target.value })}
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDBox display="flex" gap={2} p={1.5}>
            <MDTypography
              component="button"
              variant="button"
              color="secondary"
              fontWeight="regular"
              onClick={handleFilterDialogClose}
              sx={{
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: "8px 16px",
              }}
            >
              Cancel
            </MDTypography>
            <MDTypography
              component="button"
              variant="button"
              color="info"
              fontWeight="regular"
              onClick={handleApplyFilter}
              sx={{
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: "8px 16px",
              }}
            >
              Apply
            </MDTypography>
          </MDBox>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      headerName: PropTypes.string.isRequired,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      renderCell: PropTypes.func,
      align: PropTypes.oneOf(["left", "right", "center"]),
    })
  ),
  apiUrl: PropTypes.string.isRequired,
  title: PropTypes.string,
  initialRowsPerPage: PropTypes.number,
  enableSearch: PropTypes.bool,
  enableFilters: PropTypes.bool,
  enablePagination: PropTypes.bool,
  onRowClick: PropTypes.func,
  searchField: PropTypes.string,
};

DataTable.defaultProps = {
  searchField: "name",
};