import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// @mui icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BadgeIcon from "@mui/icons-material/Badge";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Base API URL
import BASE_URL from 'static/baseUrl';

// Header component for profile page
import Header from "layouts/profile/components/Header";
import UserHeader from "layouts/profile/components/UserHeader";


// Default avatar image
import defaultAvatar from "assets/images/team-4.jpg";

// Add this import at the top if not already there

// Custom ProfileInfoCard component that doesn't require special structure
function CustomProfileInfoCard({ title, info }) {
    return (
        <Card sx={{ height: '100%', width: '100%' }}>
            <MDBox p={2}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    {title}
                </MDTypography>
                <MDBox>
                    {Object.entries(info).map(([key, value]) => (
                        <MDBox key={key} display="flex" py={1} pr={2}>
                            <MDTypography variant="button" fontWeight="bold" textTransform="capitalize">
                                {key}: &nbsp;
                            </MDTypography>
                            <MDTypography variant="button" fontWeight="regular" color="text">
                                {value}
                            </MDTypography>
                        </MDBox>
                    ))}
                </MDBox>
            </MDBox>
        </Card>
    );
}

// Add PropTypes validation for CustomProfileInfoCard
CustomProfileInfoCard.propTypes = {
    title: PropTypes.string.isRequired,
    info: PropTypes.object.isRequired,
};

function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const url = `${BASE_URL}/api/users/get/${userId}`;
                const response = await fetch(url);
                const responseData = await response.json();

                if (responseData.status === "success") {
                    setUser(responseData.data);
                    setEditedUser(responseData.data);
                } else {
                    setError("User not found");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            // When editing, make a copy of the user to edit
            setEditedUser({ ...user });
        } else {
            // When saving, update the user with the edited values
            // In a real app, you'd send an API update request here
            setUser(editedUser);
            // TODO: API call to update user
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser({ ...editedUser, [name]: value });
    };

    const handleDeleteConfirm = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteUser = async () => {
        try {
            // In a real app, delete the user via API
            // await fetch(`${BASE_URL}/api/users/${userId}`, { method: 'DELETE' });
            setDeleteDialogOpen(false);
            navigate('/users'); // Navigate back to users page
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Active": return "success";
            case "On Leave": return "warning";
            case "Inactive": return "error";
            case "Suspended": return "dark";
            default: return "info";
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <DashboardNavbar />
                <MDBox display="flex" justifyContent="center" p={5}>
                    <MDTypography variant="h5" color="text">
                        Loading user data...
                    </MDTypography>
                </MDBox>
            </DashboardLayout>
        );
    }

    if (error || !user) {
        return (
            <DashboardLayout>
                <DashboardNavbar />
                <MDBox display="flex" justifyContent="center" p={5}>
                    <MDTypography variant="h5" color="error">
                        {error || "User not found"}
                    </MDTypography>
                </MDBox>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox pt={6} pb={3} />
            <UserHeader userName={user.name} userAvatar={user.avatar || defaultAvatar}>
                {/* User Info Section */}
                <MDBox mt={5} mb={3}>
                    <Grid container spacing={1}>
                        {/* User Profile Info */}
                        <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
                            <CustomProfileInfoCard
                                title="Profile Information"
                                info={{
                                    "Full Name": user.name,
                                    "Position": user.position,
                                    "Department": user.department,
                                    "Status": user.status,
                                    "Employee ID": user.employee_id,
                                }}
                            />
                        </Grid>

                        {/* Contact Information */}
                        <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
                            <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
                            <CustomProfileInfoCard
                                title="Contact Information"
                                info={{
                                    "Email": user.email,
                                    "Phone": user.phone,
                                    "Address": user.address,
                                }}
                            />
                            <Divider orientation="vertical" sx={{ mx: 0 }} />
                        </Grid>

                        {/* Edit Form (Conditionally Rendered) */}
                        <Dialog
                            open={isEditing}
                            onClose={() => setIsEditing(false)}
                            maxWidth="md"
                            fullWidth
                        >
                            <DialogTitle>Edit User Information</DialogTitle>
                            <DialogContent>
                                <MDBox py={2}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <MDInput
                                                fullWidth
                                                label="Full Name"
                                                name="name"
                                                value={editedUser.name}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <MDInput
                                                fullWidth
                                                label="Position"
                                                name="position"
                                                value={editedUser.position}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <MDInput
                                                fullWidth
                                                label="Email"
                                                name="email"
                                                type="email"
                                                value={editedUser.email}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <MDInput
                                                fullWidth
                                                label="Phone"
                                                name="phone"
                                                value={editedUser.phone}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <MDInput
                                                fullWidth
                                                label="Department"
                                                name="department"
                                                value={editedUser.department}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <MDInput
                                                select
                                                SelectProps={{
                                                    native: true,
                                                }}
                                                fullWidth
                                                label="Status"
                                                name="status"
                                                value={editedUser.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="On Leave">On Leave</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Suspended">Suspended</option>
                                            </MDInput>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <MDInput
                                                fullWidth
                                                multiline
                                                rows={3}
                                                label="Address"
                                                name="address"
                                                value={editedUser.address}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <MDInput
                                                fullWidth
                                                type="date"
                                                label="Hire Date"
                                                name="hire_date"
                                                value={editedUser.hire_date}
                                                onChange={handleInputChange}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                    </Grid>
                                </MDBox>


                            </DialogContent>
                            <DialogActions>
                                <MDButton onClick={() => setIsEditing(false)} color="secondary">
                                    Cancel
                                </MDButton>
                                <MDButton onClick={handleEditToggle} color="info">
                                    Save Changes
                                </MDButton>
                            </DialogActions>
                        </Dialog>

                        {/* Additional Info */}


                        {/* Actions */}
                        <Grid item xs={12} xl={4}>
                            <Card sx={{ height: "100%" }}>
                                <MDBox p={2}>
                                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                        User Actions
                                    </MDTypography>
                                    <MDBox display="flex" flexDirection="column" gap={2}>
                                        {!isEditing && (
                                            <MDButton
                                                variant="gradient"
                                                color="info"
                                                fullWidth
                                                onClick={handleEditToggle}
                                                startIcon={<EditIcon />}
                                            >
                                                Edit Profile
                                            </MDButton>
                                        )}
                                        <MDButton
                                            variant="gradient"
                                            color="error"
                                            fullWidth
                                            onClick={handleDeleteConfirm}
                                            startIcon={<DeleteIcon />}
                                        >
                                            Remove User
                                        </MDButton>
                                    </MDBox>
                                </MDBox>
                            </Card>
                        </Grid>
                    </Grid>
                </MDBox>

                {/* Tabs Section */}
                <Card>
                    <MDBox p={3}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{ mb: 3 }}
                        >
                            <Tab label="Overview" />
                            <Tab label="Activity" />
                            <Tab label="Settings" />
                        </Tabs>

                        {tabValue === 0 && (
                            <MDBox>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <MDBox mb={3}>
                                            <MDTypography variant="h6" fontWeight="medium">
                                                User Status
                                            </MDTypography>
                                            <MDBox mt={2} display="flex" alignItems="center">
                                                <MDBox
                                                    width="12px"
                                                    height="12px"
                                                    borderRadius="50%"
                                                    backgroundColor={getStatusColor(user.status)}
                                                    mr={1}
                                                />
                                                <MDTypography variant="button" fontWeight="medium">
                                                    {user.status}
                                                </MDTypography>
                                            </MDBox>
                                        </MDBox>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <MDBox mb={3}>
                                            <MDTypography variant="h6" fontWeight="medium">
                                                Assigned Projects
                                            </MDTypography>
                                            <MDBox mt={2}>
                                                <MDTypography variant="button" color="text">
                                                    No projects assigned yet.
                                                </MDTypography>
                                            </MDBox>
                                        </MDBox>
                                    </Grid>
                                </Grid>
                            </MDBox>
                        )}

                        {tabValue === 1 && (
                            <MDBox>
                                <MDTypography variant="button" color="text">
                                    User activity will be displayed here.
                                </MDTypography>
                            </MDBox>
                        )}

                        {tabValue === 2 && (
                            <MDBox>
                                <MDTypography variant="button" color="text">
                                    User settings will be displayed here.
                                </MDTypography>
                            </MDBox>
                        )}
                    </MDBox>
                </Card>
            </UserHeader>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm User Removal</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove {user.name}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <MDButton onClick={() => setDeleteDialogOpen(false)} color="secondary">
                        Cancel
                    </MDButton>
                    <MDButton onClick={handleDeleteUser} color="error" autoFocus>
                        Remove
                    </MDButton>
                </DialogActions>
            </Dialog>

            <Footer />
        </DashboardLayout>
    );
}

export default UserProfile;