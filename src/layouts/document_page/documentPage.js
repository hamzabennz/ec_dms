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
import Tooltip from "@mui/material/Tooltip";

// @mui icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";
import FolderIcon from "@mui/icons-material/Folder";
import HistoryIcon from "@mui/icons-material/History";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CategoryIcon from "@mui/icons-material/Category";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDChip from "components/MDChip";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Base API URL
import BASE_URL from 'static/baseUrl';

// Document Header
function DocumentHeader({ docName, docType, docIcon }) {
    return (
        <MDBox position="relative" mb={5}>
            <Card sx={{ position: "relative", mx: 3, mt: 3, py: 2, px: 2 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <MDBox
                            width="64px"
                            height="64px"
                            bgcolor="grey.100"
                            borderRadius="lg"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            boxShadow="md"
                        >
                            {docIcon}
                        </MDBox>
                    </Grid>
                    <Grid item>
                        <MDBox height="100%" mt={0.5} lineHeight={1}>
                            <MDTypography variant="h5" fontWeight="medium">
                                {docName}
                            </MDTypography>
                            <MDTypography variant="button" color="text">
                                {docType}
                            </MDTypography>
                        </MDBox>
                    </Grid>
                </Grid>
            </Card>
        </MDBox>
    );
}

DocumentHeader.propTypes = {
    docName: PropTypes.string.isRequired,
    docType: PropTypes.string.isRequired,
    docIcon: PropTypes.node.isRequired
};

// Custom InfoCard component
function InfoCard({ title, info }) {
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

InfoCard.propTypes = {
    title: PropTypes.string.isRequired,
    info: PropTypes.object.isRequired,
};

function getDocumentIcon(fileType) {
    switch (fileType.toLowerCase()) {
        case 'pdf':
            return <PictureAsPdfIcon color="error" sx={{ fontSize: 36 }} />;
        case '':
        case 'doc':
            return <ArticleIcon color="info" sx={{ fontSize: 36 }} />;
        case 'xlsx':
        case 'xls':
            return <InsertDriveFileIcon color="success" sx={{ fontSize: 36 }} />;
        case 'jpg':
        case 'jpeg':
        case 'png':
            return <ImageIcon color="warning" sx={{ fontSize: 36 }} />;
        default:
            return <DescriptionIcon color="secondary" sx={{ fontSize: 36 }} />;
    }
}

function DocumentPage() {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDocument, setEditedDocument] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [accessDialogOpen, setAccessDialogOpen] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Mock history data for the History tab
    const historyColumns = [
        { Header: "Date", accessor: "date", width: "25%" },
        { Header: "User", accessor: "user", width: "25%" },
        { Header: "Action", accessor: "action", width: "50%" },
    ];

    const historyRows = [
        { date: "2023-10-20", user: "John Smith", action: "Created document" },
        { date: "2023-10-21", user: "Jane Doe", action: "Modified content" },
        { date: "2023-10-25", user: "John Smith", action: "Updated metadata" },
        { date: "2023-10-30", user: "Admin User", action: "Changed access permissions" },
    ];

    // Mock access permissions for Access tab
    const accessColumns = [
        { Header: "User/Group", accessor: "name", width: "40%" },
        { Header: "Access Level", accessor: "accessLevel", width: "40%" },
        { Header: "Actions", accessor: "actions", width: "20%" },
    ];

    const accessRows = [
        {
            name: "Engineering Team",
            accessLevel: "Read & Write",
            actions: (
                <MDBox display="flex" gap={1}>
                    <Tooltip title="Edit access">
                        <MDButton variant="text" color="info" iconOnly>
                            <EditIcon fontSize="small" />
                        </MDButton>
                    </Tooltip>
                    <Tooltip title="Remove access">
                        <MDButton variant="text" color="error" iconOnly>
                            <DeleteIcon fontSize="small" />
                        </MDButton>
                    </Tooltip>
                </MDBox>
            )
        },
        {
            name: "Marketing Team",
            accessLevel: "Read Only",
            actions: (
                <MDBox display="flex" gap={1}>
                    <Tooltip title="Edit access">
                        <MDButton variant="text" color="info" iconOnly>
                            <EditIcon fontSize="small" />
                        </MDButton>
                    </Tooltip>
                    <Tooltip title="Remove access">
                        <MDButton variant="text" color="error" iconOnly>
                            <DeleteIcon fontSize="small" />
                        </MDButton>
                    </Tooltip>
                </MDBox>
            )
        },
        {
            name: "John Doe",
            accessLevel: "Owner",
            actions: (
                <MDBox display="flex" gap={1}>
                    <Tooltip title="Edit access">
                        <MDButton variant="text" color="info" iconOnly>
                            <EditIcon fontSize="small" />
                        </MDButton>
                    </Tooltip>
                </MDBox>
            )
        },
    ];

    useEffect(() => {
        const fetchDocument = async () => {
            setLoading(true);
            try {
                // Mock data for development
                const mockDocument = {
                    id: documentId,
                    name: "Annual Report 2023.pdf",
                    type: "pdf",
                    size: "3.5 MB",
                    created_date: "2023-10-15",
                    modified_date: "2023-10-20",
                    created_by: "John Smith",
                    modified_by: "Jane Doe",
                    version: "1.2",
                    status: "Active",
                    category: "Reports",
                    description: "Annual financial report for fiscal year 2023 including revenue projections and market analysis.",
                    tags: ["financial", "annual", "2023", "report"],
                    access_level: "Restricted",
                    location: "/Users/tarekbn/Downloads/hackathon[1].pdf",
                    preview_available: true
                };

                setDocument(mockDocument);
                setEditedDocument(mockDocument);
                // For a PDF document, we could set a preview URL
                setPreviewUrl(`${BASE_URL}/api/documents/preview/${documentId}`);

                // In a real app, fetch from API
                /*
                const url = `${BASE_URL}/api/documents/${documentId}`;
                const response = await fetch(url);
                const responseData = await response.json();
                
                if (responseData.status === "success") {
                  setDocument(responseData.data);
                  setEditedDocument(responseData.data);
                  
                  if (responseData.data.preview_available) {
                    setPreviewUrl(`${BASE_URL}/api/documents/preview/${documentId}`);
                  }
                } else {
                  setError("Document not found");
                }
                */
            } catch (error) {
                console.error("Error fetching document data:", error);
                setError("Failed to load document data");
            } finally {
                setLoading(false);
            }
        };

        if (documentId) {
            fetchDocument();
        }
    }, [documentId]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            // When opening the edit form, make sure editedDocument is a fresh copy of document
            setEditedDocument({ ...document });
        } else {
            // When saving, update the document with the edited values
            // In a real app, you'd send an API update request here
            setDocument(editedDocument);
            // TODO: API call to update document
        }
        setIsEditing(!isEditing);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDocument({ ...editedDocument, [name]: value });
    };

    const handleTagsChange = (e) => {
        // Split the input by commas to create an array of tags
        const tagsArray = e.target.value.split(',').map(tag => tag.trim());
        setEditedDocument({ ...editedDocument, tags: tagsArray });
    };

    const handleDeleteConfirm = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteDocument = async () => {
        try {
            // In a real app, delete the document via API
            // await fetch(`${BASE_URL}/api/documents/${documentId}`, { method: 'DELETE' });
            setDeleteDialogOpen(false);
            navigate('/documents'); // Navigate back to documents page
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    const handleDownloadDocument = () => {
        // In a real app, this would trigger a download
        console.log(`Downloading document: ${documentId}`);
        // window.open(`${BASE_URL}/api/documents/download/${documentId}`, '_blank');
    };

    const handleShareDocument = () => {
        setShareDialogOpen(true);
    };

    const handleManageAccess = () => {
        setAccessDialogOpen(true);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <DashboardNavbar />
                <MDBox display="flex" justifyContent="center" p={5}>
                    <MDTypography variant="h5" color="text">
                        Loading document data...
                    </MDTypography>
                </MDBox>
            </DashboardLayout>
        );
    }

    if (error || !document) {
        return (
            <DashboardLayout>
                <DashboardNavbar />
                <MDBox display="flex" justifyContent="center" p={5}>
                    <MDTypography variant="h5" color="error">
                        {error || "Document not found"}
                    </MDTypography>
                </MDBox>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox pt={6} pb={3} />

            <DocumentHeader
                docName={document.name}
                docType={document.type.toUpperCase()}
                docIcon={getDocumentIcon(document.type)}
            />
            {/* Document Info Section */}
            <MDBox mt={5} mb={3}>
                <Grid container spacing={3}>
                    {/* Document Info */}
                    <Grid item xs={12} md={6} xl={4}>
                        <InfoCard
                            title="Document Information"
                            info={{
                                "Filename": document.name,
                                "Type": document.type.toUpperCase(),
                                "Size": document.size,
                                "Version": document.version,
                                "Status": document.status,
                                "Category": document.category,
                            }}
                        />
                    </Grid>

                    {/* Dates & Ownership */}
                    <Grid item xs={12} md={6} xl={4}>
                        <InfoCard
                            title="Dates & Ownership"
                            info={{
                                "Created Date": new Date(document.created_date).toLocaleDateString(),
                                "Created By": document.created_by,
                                "Modified Date": new Date(document.modified_date).toLocaleDateString(),
                                "Modified By": document.modified_by,
                                "Access Level": document.access_level,
                                "Location": document.location,
                            }}
                        />
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} xl={4}>
                        <Card sx={{ height: "100%" }}>
                            <MDBox p={2}>
                                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                    Document Actions
                                </MDTypography>
                                <MDBox display="flex" flexDirection="column" gap={2}>
                                    <MDButton
                                        variant="gradient"
                                        color="info"
                                        fullWidth
                                        onClick={handleDownloadDocument}
                                        startIcon={<DownloadIcon />}
                                    >
                                        Download Document
                                    </MDButton>

                                    {!isEditing && (
                                        <MDButton
                                            variant="outlined"
                                            color="info"
                                            fullWidth
                                            onClick={handleEditToggle}
                                            startIcon={<EditIcon />}
                                        >
                                            Edit Details
                                        </MDButton>
                                    )}

                                    <MDButton
                                        variant="outlined"
                                        color="dark"
                                        fullWidth
                                        onClick={handleShareDocument}
                                        startIcon={<ShareIcon />}
                                    >
                                        Share Document
                                    </MDButton>

                                    <MDButton
                                        variant="outlined"
                                        color={document.access_level === "Public" ? "success" : "warning"}
                                        fullWidth
                                        onClick={handleManageAccess}
                                        startIcon={document.access_level === "Public" ? <LockOpenIcon /> : <LockIcon />}
                                    >
                                        Manage Access
                                    </MDButton>

                                    <MDButton
                                        variant="gradient"
                                        color="error"
                                        fullWidth
                                        onClick={handleDeleteConfirm}
                                        startIcon={<DeleteIcon />}
                                    >
                                        Delete Document
                                    </MDButton>
                                </MDBox>
                            </MDBox>
                        </Card>
                    </Grid>

                    {/* Add this dialog for editing: */}
                    <Dialog
                        open={isEditing}
                        onClose={() => setIsEditing(false)}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>Edit Document Information</DialogTitle>
                        <DialogContent>
                            <MDBox py={2}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <MDInput
                                            fullWidth
                                            label="Document Name"
                                            name="name"
                                            value={editedDocument?.name || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <MDInput
                                            fullWidth
                                            label="Category"
                                            name="category"
                                            value={editedDocument?.category || ""}
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
                                            value={editedDocument?.status || ""}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Archived">Archived</option>
                                            <option value="Draft">Draft</option>
                                        </MDInput>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <MDInput
                                            select
                                            SelectProps={{
                                                native: true,
                                            }}
                                            fullWidth
                                            label="Access Level"
                                            name="access_level"
                                            value={editedDocument?.access_level || ""}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Public">Public</option>
                                            <option value="Restricted">Restricted</option>
                                            <option value="Private">Private</option>
                                        </MDInput>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <MDInput
                                            fullWidth
                                            label="Location"
                                            name="location"
                                            value={editedDocument?.location || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <MDInput
                                            fullWidth
                                            label="Tags (comma separated)"
                                            name="tags"
                                            value={editedDocument?.tags?.join(', ') || ""}
                                            onChange={handleTagsChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <MDInput
                                            fullWidth
                                            multiline
                                            rows={4}
                                            label="Description"
                                            name="description"
                                            value={editedDocument?.description || ""}
                                            onChange={handleInputChange}
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
                </Grid>
            </MDBox>

            {/* Document Content & Details */}
            <Grid container spacing={3}>
                {/* Document Preview */}
                <Grid item xs={12}>
                    <Card>
                        <MDBox p={3}>
                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                Document Preview
                            </MDTypography>
                            {previewUrl ? (
                                <MDBox
                                    component="iframe"
                                    src={previewUrl}
                                    width="100%"
                                    height="500px"
                                    sx={{ border: "1px solid #eee", borderRadius: "8px" }}
                                    title="Document preview"
                                />
                            ) : (
                                <MDBox
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    height="200px"
                                    bgcolor="grey.100"
                                    borderRadius="lg"
                                >
                                    <MDTypography variant="button" color="text">
                                        Preview not available for this document type
                                    </MDTypography>
                                </MDBox>
                            )}
                        </MDBox>
                    </Card>
                </Grid>

                {/* Document Metadata */}
                <Grid item xs={12}>
                    <Card>
                        <MDBox p={3}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                        Description
                                    </MDTypography>
                                    <MDTypography variant="body2" color="text">
                                        {document.description || "No description available."}
                                    </MDTypography>
                                </Grid>

                                <Grid item xs={12} mt={2}>
                                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                        Tags
                                    </MDTypography>
                                    <MDBox display="flex" flexWrap="wrap" gap={1}>
                                        {document.tags && document.tags.length > 0 ? (
                                            document.tags.map((tag, index) => (
                                                <MDChip
                                                    key={index}
                                                    variant="outlined"
                                                    color="info"
                                                    size="small"
                                                    label={tag}
                                                />
                                            ))
                                        ) : (
                                            <MDTypography variant="button" color="text">
                                                No tags
                                            </MDTypography>
                                        )}
                                    </MDBox>
                                </Grid>
                            </Grid>
                        </MDBox>
                    </Card>
                </Grid>

                {/* Tabs Section */}
                <Grid item xs={12}>
                    <Card>
                        <MDBox p={3}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                textColor="primary"
                                indicatorColor="primary"
                                sx={{ mb: 3 }}
                            >
                                <Tab icon={<HistoryIcon />} label="History" />
                                <Tab icon={<LockIcon />} label="Access" />
                            </Tabs>

                            {tabValue === 0 && (
                                <MDBox>
                                    <DataTable
                                        table={{ columns: historyColumns, rows: historyRows }}
                                        showTotalEntries={false}
                                        isSorted={false}
                                        entriesPerPage={false}
                                        canSearch
                                    />
                                </MDBox>
                            )}

                            {tabValue === 1 && (
                                <MDBox>
                                    <MDBox display="flex" justifyContent="flex-end" mb={2}>
                                        <MDButton
                                            variant="gradient"
                                            color="info"
                                            startIcon={<PersonIcon />}
                                        >
                                            Add Users/Groups
                                        </MDButton>
                                    </MDBox>
                                    <DataTable
                                        table={{ columns: accessColumns, rows: accessRows }}
                                        showTotalEntries={false}
                                        isSorted={false}
                                        entriesPerPage={false}
                                    />
                                </MDBox>
                            )}
                        </MDBox>
                    </Card>
                </Grid>
            </Grid>


            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Document Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete &ldquo;{document.name}&rdquo;? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <MDButton onClick={() => setDeleteDialogOpen(false)} color="secondary">
                        Cancel
                    </MDButton>
                    <MDButton onClick={handleDeleteDocument} color="error" autoFocus>
                        Delete
                    </MDButton>
                </DialogActions>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
                <DialogTitle>Share Document</DialogTitle>
                <DialogContent>
                    <MDBox py={2}>
                        <MDInput
                            fullWidth
                            label="Email Addresses"
                            placeholder="Enter email addresses separated by commas"
                            sx={{ mb: 2 }}
                        />
                        <MDInput
                            fullWidth
                            multiline
                            rows={4}
                            label="Message (Optional)"
                            placeholder="Include a message with your shared document"
                        />
                        <MDBox mt={2}>
                            <MDTypography variant="h6" fontSize="small" mb={1}>
                                Access Level
                            </MDTypography>
                            <MDBox display="flex" gap={1}>
                                <MDButton variant={document.access_level === "Read Only" ? "contained" : "outlined"} color="info" size="small">
                                    Read Only
                                </MDButton>
                                <MDButton variant={document.access_level === "Read & Write" ? "contained" : "outlined"} color="info" size="small">
                                    Read & Write
                                </MDButton>
                            </MDBox>
                        </MDBox>
                    </MDBox>
                </DialogContent>
                <DialogActions>
                    <MDButton onClick={() => setShareDialogOpen(false)} color="secondary">
                        Cancel
                    </MDButton>
                    <MDButton onClick={() => setShareDialogOpen(false)} color="info">
                        Share
                    </MDButton>
                </DialogActions>
            </Dialog>

            {/* Access Management Dialog */}
            <Dialog
                open={accessDialogOpen}
                onClose={() => setAccessDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Access Management</DialogTitle>
                <DialogContent>
                    <MDBox py={2}>
                        <MDTypography variant="h6" fontSize="small" mb={2}>
                            Document Access Level
                        </MDTypography>
                        <MDBox display="flex" gap={1} mb={3}>
                            <MDButton
                                variant={document.access_level === "Private" ? "contained" : "outlined"}
                                color="error"
                                size="small"
                                startIcon={<LockIcon />}
                            >
                                Private
                            </MDButton>
                            <MDButton
                                variant={document.access_level === "Restricted" ? "contained" : "outlined"}
                                color="warning"
                                size="small"
                                startIcon={<LockIcon />}
                            >
                                Restricted
                            </MDButton>
                            <MDButton
                                variant={document.access_level === "Public" ? "contained" : "outlined"}
                                color="success"
                                size="small"
                                startIcon={<LockOpenIcon />}
                            >
                                Public
                            </MDButton>
                        </MDBox>

                        <Divider sx={{ my: 2 }} />

                        <MDTypography variant="h6" fontSize="small" mb={2}>
                            User & Group Access
                        </MDTypography>

                        <DataTable
                            table={{ columns: accessColumns, rows: accessRows }}
                            showTotalEntries={false}
                            isSorted={false}
                            entriesPerPage={false}
                        />

                        <MDBox mt={3} display="flex" justifyContent="space-between" alignItems="center">
                            <MDInput
                                placeholder="Add user or group"
                                sx={{ width: '70%' }}
                            />
                            <MDBox>
                                <MDButton
                                    variant="gradient"
                                    color="info"
                                    size="small"
                                >
                                    Add
                                </MDButton>
                            </MDBox>
                        </MDBox>
                    </MDBox>
                </DialogContent>
                <DialogActions>
                    <MDButton onClick={() => setAccessDialogOpen(false)} color="secondary">
                        Cancel
                    </MDButton>
                    <MDButton onClick={() => setAccessDialogOpen(false)} color="info">
                        Save Changes
                    </MDButton>
                </DialogActions>
            </Dialog>

        </DashboardLayout>
    );
}

export default DocumentPage;