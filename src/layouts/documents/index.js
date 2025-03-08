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
import { useNavigate } from 'react-router-dom';
import BASE_URL from "static/baseUrl";
import PropTypes from "prop-types";

import InputForm from "components/InputForm";

import { useMaterialUIController } from "../../context";


function AddDocumentForm({ open, onClose }) {
  const handleSubmit = (values) => {
    console.log("Form submitted:", values);
    // Process form data
    onClose(); // Close the dialog after submission
  };

  const formInputs = [
    { name: "name", label: "Name", required: true },
    { name: "description", label: "Description", multiline: true, rows: 2 },
    { name: "file", label: "File", type: "file", required: true },
    { name: "category", label: "Category", type: "select", options: ["Document", "Image", "Video"], required: true },
    { name: "status", label: "Status", type: "select", options: ["Active", "Inactive", "Pending"], required: true },
    { name: "tags", label: "Tags", type: "tags" }

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
          <MDTypography variant="h6">Add New Document</MDTypography>
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
          submitText="Add Document"
          buttonColor="info"
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

AddDocumentForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

// DocumentsDataTable Component
function DocumentsDataTable({ onRowClick }) {
  const API_URL = useMemo(() => `${BASE_URL}/api/documents`, []);

  const columns = useMemo(() => [
    { field: "id", headerName: "ID", width: "10%" },
    { field: "name", headerName: "Name", width: "15%" },
    { field: "description", headerName: "Description", width: "20%" },
    { field: "category", headerName: "Category", width: "10%" },
    { field: "status", headerName: "Status", width: "10%" },
    {
      field: "tags",
      headerName: "Tags",
      width: "15%"

    },
    {
      field: "createdAt",
      headerName: "Created",
      width: "10%",
      renderCell: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: "10%",
      renderCell: (row) => new Date(row.updatedAt).toLocaleDateString()
    }
  ], []);

  return (
    <DataTable
      columns={columns}
      apiUrl={API_URL}
      title="Documents Table"
      onRowClick={onRowClick}
      enableSearch
      enableFilters
      enablePagination
    />
  );
}

DocumentsDataTable.propTypes = {
  onRowClick: PropTypes.func.isRequired,
};

// Documents Component
function Documents() {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [controller, dispatch] = useMaterialUIController();
  const { sidenavColor } = controller;

  const handleRowClick = (row) => {
    navigate(`/document/${row.id}`);
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
                  Documents
                </MDTypography>
                <MDButton variant="gradient" color={sidenavColor} onClick={handleOpenForm}>
                  <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                  &nbsp;add new document
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                <DocumentsDataTable onRowClick={handleRowClick} />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <AddDocumentForm open={formOpen} onClose={handleCloseForm} />

    </DashboardLayout>
  );
}

export default Documents;