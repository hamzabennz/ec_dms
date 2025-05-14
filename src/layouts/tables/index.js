import React, { useState } from "react";
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
  const handleSubmit = async (values) => {
    try {
      // Get token from localStorage
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
      if (!token) {
        alert("Authentication token missing. Please log in again.");
        return;
      }
      // Prepare user data with only required fields and correct keys
      const userData = {
        name: values.name,
        position: values.position,
        address: values.address,
        status: values.status,
        email: values.email,
        phone: values.phone,
        department: values.department,
        hireDate: values.hire_date, // from form input
        password: values.password
      };
      // POST request
      const response = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
          "Authorization": `${tokenType} ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add user");
      }
      onClose(); // Close the dialog after submission
    } catch (err) {
      alert("Error adding user: " + err.message);
    }
  };

  const formInputs = [
    { name: "name", label: "Name", required: true },
    { name: "position", label: "Position", required: true },
    { name: "address", label: "Address", multiline: true, rows: 2 },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["active", "inactive", "on leave", "suspended", "pending"],
      required: true
    },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone Number", required: true },
    { name: "department", label: "Department", required: true },
    { name: "hire_date", label: "Hire Date", type: "date", required: true },
    { name: "password", label: "Password", type: "password", required: true }
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
  const columns = [
    { field: "id", headerName: "ID", width: "5%" },
    { field: "name", headerName: "Name", width: "15%" },
    { field: "email", headerName: "Email", width: "20%" },
    { field: "hireDate", headerName: "Hire Date", width: "10%" },
    { field: "position", headerName: "Position", width: "20%" },
    { field: "department", headerName: "Department", width: "15%" },
    { field: "status", headerName: "Status", width: "15%" },
  ];

  return (
    <DataTable
      apiUrl="http://localhost:8080/api/users"
      columns={columns}
      title="Users Table"
      onRowClick={onRowClick}
      enableSearch
      enableFilters
      enablePagination
      searchField="name"
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