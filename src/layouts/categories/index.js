import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import InputForm from "components/InputForm";
import PropTypes from "prop-types";

// ✅ Replace with your actual categories API base URL
const API_BASE_URL = "http://192.168.137.254:8081/api/categories";

// 🔹 Modal Form Component
function CategoryForm({ open, onClose, onSubmit, initialData }) {
  const formInputs = [
    { name: "name", label: "Category Name", required: true },
  ];

  const safeInitialData = initialData || { name: "" };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6">
            {safeInitialData.id ? "Edit" : "Add"} Category
          </MDTypography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
      </DialogTitle>
      <DialogContent>
        <InputForm
          inputs={formInputs}
          initialValues={safeInitialData}
          submitText={safeInitialData.id ? "Update" : "Create"}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

CategoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};

// 🔹 Main Component
function CategorieTables() {
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch(API_BASE_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      alert("Failed to load categories");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddClick = () => {
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleEditClick = (cat) => {
    setSelectedCategory(cat);
    setFormOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      const isEdit = !!selectedCategory;
      const url = isEdit
        ? `${API_BASE_URL}/${selectedCategory.id}`
        : API_BASE_URL;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: values.name }),
      });

      if (!res.ok) throw new Error("Failed to save category");

      setFormOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={2} display="flex" justifyContent="space-between">
                <MDTypography variant="h6">Categories</MDTypography>
                <MDButton color="info" onClick={handleAddClick}>
                  <Icon>add</Icon>&nbsp;Add Category
                </MDButton>
              </MDBox>
              <MDBox px={2} pb={2}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "12px", borderBottom: "1px solid #ccc", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "12px", borderBottom: "1px solid #ccc", textAlign: "left" }}>Name</th>
                      <th style={{ padding: "12px", borderBottom: "1px solid #ccc", textAlign: "left" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td style={{ padding: "12px", textAlign: "left", verticalAlign: "middle" }}>{cat.id}</td>
                        <td style={{ padding: "12px", textAlign: "left", verticalAlign: "middle" }}>{cat.name}</td>
                        <td style={{ padding: "12px", textAlign: "left", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                          <MDButton
                            size="small"
                            variant="text"
                            color="warning"
                            onClick={() => handleEditClick(cat)}
                            sx={{ marginRight: 1 }}
                          >
                            Edit
                          </MDButton>
                          <MDButton
                            size="small"
                            variant="text"
                            color="error"
                            onClick={() => handleDeleteClick(cat.id)}
                          >
                            Delete
                          </MDButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <CategoryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCategory || {}}
      />

      <Footer />
    </DashboardLayout>
  );
}

export default CategorieTables;
