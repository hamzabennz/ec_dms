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

/**
 * Reusable DataTable component with server-side data fetching and Material Dashboard styling
 */
export default function DataTable({
  columns = [],
  apiUrl = "",
  title = "Data Table",
  initialRowsPerPage = 10,
  enableSearch = true,
  enableFilters = true,
  enablePagination = true,
  onRowClick = null,
}) {
  apiUrl = apiUrl + "/filter";
  // State management (keeping original state variables)
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

  // Entries per page options for dropdown
  const entriesOptions = ["5", "10", "20", "25", "30"];

  // Filter operators matching backend
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

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!apiUrl) return;
      setLoading(true);

      try {
        // Build filters array
        const filterBody = [];
        if (search) filterBody.push({ key: "title", op: "contains", value: search });
        filterBody.push(...filters);

        // Create request body matching backend format
        const requestBody = {
          page: page - 1, // Adjust for 0-based indexing if needed
          perPage: rowsPerPage,
          sortBy: "id",
          order: "desc",
          filters: filterBody,
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!isMounted) return;

        const result = await response.json();
        if (result.status === "success") {
          setData(result.data || []);
          setTotalRows(result.pagination.total_records || 0);
        } else {
          throw new Error("API returned error");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
        setTotalRows(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [apiUrl, page, rowsPerPage, filters, search]);

  const debouncedSearch = useCallback(
    debounce((newSearch) => {
      setSearch(newSearch);
      setPage(1); // Reset pagination
    }, 300),
    []
  );

  // Calculate total pages
  const totalPages = enablePagination ? Math.ceil(totalRows / rowsPerPage) : 1;

  // Handle page change
  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  // Handler for entries per page change
  const setEntriesPerPage = (value) => {
    // Store the current value
    const currentValue = parseInt(value, 10);

    // Update component state for rowsPerPage
    setRowsPerPage(currentValue);

    // Reset to first page whenever entries per page changes
    // to avoid showing an empty page if current page exceeds new total pages
    setPage(1);
  };

  // Open filter menu
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  // Close filter menu
  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  // Open filter dialog for a specific column
  const handleFilterDialogOpen = (columnField) => {
    setCurrentFilter({
      key: columnField,
      op: "contains",
      value: "",
    });
    setFilterDialogOpen(true);
    handleFilterMenuClose();
  };

  // Close filter dialog
  const handleFilterDialogClose = () => {
    setFilterDialogOpen(false);
  };

  // Apply the filter
  const handleApplyFilter = () => {
    if (currentFilter.key && currentFilter.value) {
      setFilters([...filters, { ...currentFilter }]);
      setFilterDialogOpen(false);
      setPage(1); // Reset to first page when adding filters
    }
  };

  // Remove a filter
  const handleRemoveFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
    setPage(1); // Reset to first page when removing filters
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters([]);
    setPage(1);
  };

  // Get column label by field name
  const getColumnLabel = (field) => {
    const column = columns.find((col) => col.field === field);
    return column ? column.headerName : field;
  };

  // Get operator label
  const getOperatorLabel = (operator) => {
    const op = filterOperators.find((op) => op.value === operator);
    return op ? op.label : operator;
  };

  // Render pagination elements
  const renderPagination = Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => (
    <MDPagination
      item
      key={pageNum}
      onClick={() => setPage(pageNum + 1)}
      active={page === pageNum + 1}
    >
      {pageNum + 1}
    </MDPagination>
  ));

  // Calculate entries range for display
  const entriesStart = (page - 1) * rowsPerPage + 1;
  const entriesEnd = Math.min(page * rowsPerPage, totalRows);

  return (
    <TableContainer sx={{ boxShadow: "none" }}>
      {/* Header with entries per page and search controls */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox display="flex" alignItems="center" gap={2}>
          {/* Entries per page dropdown */}
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

          {/* Search */}
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

          {/* Filter button */}
          {enableFilters && (
            <IconButton onClick={handleFilterMenuOpen}>
              <FilterListIcon />
            </IconButton>
          )}
        </MDBox>
      </MDBox>

      {/* Active filters display */}
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
          {filters.length > 1 && (
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

      {/* Table container */}
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
                    {column.renderCell ? column.renderCell(row) : row[column.field]}
                  </DataTableBodyCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination and entries display */}
      {enablePagination && totalPages > 0 && (
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

              {renderPagination.length > 6 ? (
                <MDBox width="5rem" mx={1}>
                  <MDInput
                    inputProps={{
                      type: "number",
                      min: 1,
                      max: totalPages,
                    }}
                    value={page}
                    onChange={(e) => {
                      const newPage = parseInt(e.target.value, 10);
                      if (newPage > 0 && newPage <= totalPages) {
                        setPage(newPage);
                      }
                    }}
                  />
                </MDBox>
              ) : (
                renderPagination
              )}

              {page < totalPages && (
                <MDPagination item onClick={() => setPage(page + 1)}>
                  <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                </MDPagination>
              )}
            </MDPagination>
          )}
        </MDBox>
      )}

      {/* Filter Column Menu */}
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

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={handleFilterDialogClose}>
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <MDTypography variant="h6">Add Filter</MDTypography>
          <IconButton aria-label="close" onClick={handleFilterDialogClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 400 }}>
          <MDBox display="flex" flexDirection="column" gap={2}>
            <MDTypography variant="subtitle2">{getColumnLabel(currentFilter.key)}</MDTypography>

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

// PropTypes validation
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
};
