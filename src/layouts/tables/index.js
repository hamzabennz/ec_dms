import React, { useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import BASE_URL from "static/baseUrl";
import PropTypes from "prop-types";

import { history } from '../../utils/history';


import InputForm from "components/InputForm";
import { useMaterialUIController } from "context";

function AddUserForm({ open, onClose }) {
  const handleSubmit = (values) => {
    console.log("Form submitted:", values);
    // Process form data
    onClose(); // Close the dialog after submission
  };

  const formInputs = [
    { name: "name", label: "Name", required: true },
    { name: "position", label: "Position", required: true },
    { name: "address", label: "Address", multiline: true, rows: 2 },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Active", "Inactive", "On Leave", "Suspended", "Pending"],
      required: true
    },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone Number", required: true },
    { name: "department", label: "Department", required: true },
    { name: "hire_date", label: "Hire Date", type: "date", required: true },
    { name: "employee_id", label: "Employee ID", type: "number", required: true }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <MDTypography variant="h6">Add New User</MDTypography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </MDBox>
      </DialogTitle>
      <DialogContent>
        <InputForm
          inputs={formInputs}
          submitText="Add User"
          buttonColor="info"
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

AddUserForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

// EmployeeDataTable Component
function EmployeeDataTable({ onRowClick }) {
  const API_URL = useMemo(() => `${BASE_URL}/api/users`, []);

  const columns = useMemo(() => [
    { field: "id", headerName: "ID", width: "5%" },
    { field: "name", headerName: "Name", width: "15%" },
    { field: "email", headerName: "Email", width: "20%" },
    { field: "hire_date", headerName: "Hire Date", width: "10%" },
    { field: "position", headerName: "Position", width: "20%" },
    { field: "department", headerName: "Department", width: "15%" },
    {
      field: "status",
      headerName: "Status",
      width: "15%",
      renderCell: (row) => row.status
    },
  ], []);

  return (
    <DataTable
      columns={columns}
      apiUrl={API_URL}
      title="Users Table"
      onRowClick={onRowClick}
      enableSearch
      enableFilters
      enablePagination
    />
  );
}

EmployeeDataTable.propTypes = {
  onRowClick: PropTypes.func.isRequired,
};

// Tables Component
function Tables() {
  const [formOpen, setFormOpen] = useState(false);
  const [controller, dispatch] = useMaterialUIController();
  const { sidenavColor } = controller;

  const handleRowClick = (row) => {
    history.navigate(`/user/${row.id}`);
  };

  const handleOpenForm = () => {
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" fontWeight="medium">
                  Users
                </MDTypography>
                <MDButton variant="gradient" color={sidenavColor} onClick={handleOpenForm}>
                  <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                  &nbsp;add new user
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                <EmployeeDataTable onRowClick={handleRowClick} />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <AddUserForm open={formOpen} onClose={handleCloseForm} />

    </DashboardLayout>
  );
}

export default Tables;