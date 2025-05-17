import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDChip from "components/MDChip";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import MenuItem from "@mui/material/MenuItem";
import { USERS_BASE_URL } from "static/baseUrl";

function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      let token = null;
      let tokenType = "Bearer";
      const authData = localStorage.getItem("auth");
      if (authData) {
        try {
          const authObject = JSON.parse(authData);
          token = authObject.token || authObject.accessToken;
          tokenType = authObject.tokenType || "Bearer";
        } catch (e) {}
      }
      try {
        const response = await fetch(`${USERS_BASE_URL}/api/users/${id}`, {
          headers: token ? { Authorization: `${tokenType} ${token}` } : {},
        });
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        setUser(data);
        setForm(data);
      } catch (err) {
        setError("User not found or error fetching user.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch("http://192.168.137.254:8081/api/departments");
        if (!response.ok) throw new Error("Failed to fetch departments");
        const data = await response.json();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (e) {
        setDepartments([]);
      }
    }
    fetchDepartments();
  }, []);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm(user);
  };
  const handleChange = (e) => {
    if (e.target.name === "departments") {
      // Multi-select
      const value = Array.from(e.target.selectedOptions, (option) => option.value);
      setForm({ ...form, departments: value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };
  const handleSave = async () => {
    let token = null;
    let tokenType = "Bearer";
    const authData = localStorage.getItem("auth");
    if (authData) {
      try {
        const authObject = JSON.parse(authData);
        token = authObject.token || authObject.accessToken;
        tokenType = authObject.tokenType || "Bearer";
      } catch (e) {}
    }
    try {
      // Prepare payload with all required fields and correct formats
      const payload = {
        id: user.id,
        name: form.name,
        position: form.position,
        address: form.address,
        status: form.status,
        email: form.email,
        phone: form.phone,
        departments: Array.isArray(form.departments) ? form.departments : (form.departments ? [form.departments] : []),
        hireDate: form.hireDate ? form.hireDate.slice(0, 10) : null, // YYYY-MM-DD
        password: form.password || user.password, // always send password
        roles: form.roles || user.roles || [], // always send roles
      };
      const response = await fetch(`${USERS_BASE_URL}/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `${tokenType} ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update user");
      const updated = await response.json();
      setUser(updated);
      setForm(updated);
      setEditMode(false);
    } catch (err) {
      setError("Failed to update user.");
    }
  };

  const handleDelete = async () => {
    let token = null;
    let tokenType = "Bearer";
    const authData = localStorage.getItem("auth");
    if (authData) {
      try {
        const authObject = JSON.parse(authData);
        token = authObject.token || authObject.accessToken;
        tokenType = authObject.tokenType || "Bearer";
      } catch (e) {}
    }
    try {
      const response = await fetch(`${USERS_BASE_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `${tokenType} ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to delete user");
      navigate("/users");
    } catch (err) {
      setError("Failed to delete user.");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) return <MDBox p={4}><MDTypography>Loading...</MDTypography></MDBox>;
  if (error) return <MDBox p={4}><MDTypography color="error">{error}</MDTypography></MDBox>;
  if (!user) return null;

  return (
    <MDBox py={4} px={2}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Card sx={{ p: 4 }}>
            <MDTypography variant="h4" mb={2}>User Profile</MDTypography>
            <MDBox mb={2}>
              <MDTypography variant="h6">ID: {user.id}</MDTypography>
            </MDBox>
            <Grid container spacing={2}>
              {[
                ["name", "Name"],
                ["email", "Email"],
                ["position", "Position"],
                ["departments", "Departments"],
                ["status", "Status"],
                ["hireDate", "Hire Date"],
                ["address", "Address"],
                ["phone", "Phone"],
              ].map(([key, label]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <MDTypography variant="subtitle2">{label}</MDTypography>
                  {editMode ? (
                    key === "departments" ? (
                      <select
                        name="departments"
                        multiple
                        value={form.departments || []}
                        onChange={handleChange}
                        style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", minHeight: 40 }}
                      >
                        {departments.map(dep => (
                          <option key={dep.id} value={dep.name}>{dep.name}</option>
                        ))}
                      </select>
                    ) : (
                      <MDInput
                        name={key}
                        value={form[key] || ""}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                      />
                    )
                  ) : (
                    key === "departments" ? (
                      Array.isArray(user.departments) && user.departments.length > 0 ?
                        user.departments.map(dep => (
                          <MDChip key={dep} label={dep} size="small" style={{marginRight: 4, marginBottom: 2}} />
                        )) : "-"
                    ) : (
                      <MDTypography>{user[key] || "-"}</MDTypography>
                    )
                  )}
                </Grid>
              ))}
            </Grid>
            <MDBox mt={4} display="flex" gap={2}>
              {editMode ? (
                <>
                  <MDButton color="info" onClick={handleSave} variant="gradient" startIcon={<Icon>save</Icon>}>
                    Save
                  </MDButton>
                  <MDButton color="secondary" onClick={handleCancel} variant="outlined">
                    Cancel
                  </MDButton>
                </>
              ) : (
                <MDButton color="info" onClick={handleEdit} variant="gradient" startIcon={<Icon>edit</Icon>}>
                  Edit
                </MDButton>
              )}
              <MDButton color="error" variant="outlined" onClick={() => setDeleteDialogOpen(true)}>
                Delete
              </MDButton>
              <MDButton color="secondary" variant="outlined" onClick={() => navigate(-1)}>
                Back
              </MDButton>
            </MDBox>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
              <Card sx={{ p: 3 }}>
                <MDTypography variant="h6" mb={2}>Confirm Delete</MDTypography>
                <MDTypography mb={3}>Are you sure you want to delete this user? This action cannot be undone.</MDTypography>
                <MDBox display="flex" gap={2} justifyContent="flex-end">
                  <MDButton onClick={() => setDeleteDialogOpen(false)} color="secondary" variant="outlined">
                    Cancel
                  </MDButton>
                  <MDButton onClick={handleDelete} color="error" variant="gradient">
                    Delete
                  </MDButton>
                </MDBox>
              </Card>
            </Dialog>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default UserProfilePage;
