import React, { useState, useEffect, useMemo } from "react";
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
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "layouts/documents/components/DataTable";
import InputForm from "components/InputForm";
import { DOCUMENTS_BASE_URL } from "static/baseUrl";
import { useMaterialUIController } from "../../context";

function AddDocumentForm({ open, onClose }) {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, departmentsRes] = await Promise.all([

          fetch(`${DOCUMENTS_BASE_URL}/api/categories`),
          fetch(`${DOCUMENTS_BASE_URL}/api/departments`),
        ]);

        const [categoriesData, departmentsData] = await Promise.all([
          categoriesRes.json(),
          departmentsRes.json(),
        ]);

        setCategories(categoriesData);
        setDepartments(departmentsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("translatedTitle", values.translatedTitle || "");

      // Make sure values.file is the actual File object, not just the path
      if (values.file instanceof File) {
        formData.append("file", values.file);
      } else {
        throw new Error("No file selected");
      }

      // Find the selected category and department objects
      const selectedCategory = categories.find((cat) => cat.name === values.categoryName);
      const selectedDepartment = departments.find((dept) => dept.name === values.departmentName);

      if (!selectedCategory || !selectedDepartment) {
        throw new Error("Category or Department not found");
      }

      formData.append("categoryId", selectedCategory.id);
      formData.append("departmentId", selectedDepartment.id);

      // Better logging of FormData contents
      console.log("Form values:", {
        title: values.title,
        translatedTitle: values.translatedTitle,
        fileName: values.file.name,
        fileSize: values.file.size,
        categoryId: selectedCategory.id,
        departmentId: selectedDepartment.id,
      });

      const response = await fetch(`${DOCUMENTS_BASE_URL}/api/documents?userId=1`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it automatically with boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `HTTP error! status: ${response.status}${errorData ? ` - ${JSON.stringify(errorData)}` : ""
          }`
        );
      }

      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      // You might want to show an error message to the user here
    }
  };

  const formInputs = [
    { name: "title", label: "Title", required: true },
    { name: "translatedTitle", label: "Translated Title" },
    {
      name: "file",
      label: "Document File",
      type: "file",
      required: true,
      accept:
        ".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    {
      name: "categoryName",
      label: "Category",
      type: "select",
      required: true,
      options: categories.map((category) => category.name), // Display names in dropdown
    },
    {
      name: "departmentName",
      label: "Department",
      type: "select",
      required: true,
      options: departments.map((department) => department.name), // Display names in dropdown
    },
  ];

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <MDTypography>Loading categories and departments...</MDTypography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <MDTypography variant="h6">Add New Document</MDTypography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: (theme) => theme.palette.grey[500] }}
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
  onClose: PropTypes.func.isRequired,
};

function DocumentsDataTable({ onRowClick }) {
  const API_URL = useMemo(() => `${DOCUMENTS_BASE_URL}/api/documents`, []);

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: "10%" },
      { field: "title", headerName: "Title", width: "20%" },
      { field: "translatedTitle", headerName: "Translated Title", width: "20%" },
      {
        field: "fileUrl",
        headerName: "File",
        width: "20%",
        renderCell: (row) =>
          row.presignedUrl ? (
            <a href={row.presignedUrl} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          ) : (
            "-"
          ),
      },
      { field: "categoryName", headerName: "Category", width: "15%" },
      { field: "departmentName", headerName: "Department", width: "15%" },
    ],
    []
  );

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

function Documents() {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [controller] = useMaterialUIController();
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
              <MDBox
                pt={2}
                px={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
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
