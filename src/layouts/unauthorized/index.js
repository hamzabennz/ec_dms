// src/pages/UnauthorizedPage/index.js

import React from "react";
import { useNavigate } from "react-router-dom";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

function UnauthorizedPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/authentication/sign-in"); 
  };

  return (
    <MDBox
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      bgcolor="#f8f9fa"
      p={4}
    >
      <Icon sx={{ fontSize: 60, color: "error.main", mb: 2 }}>block</Icon>
      <MDTypography variant="h3" fontWeight="bold" color="error" mb={1}>
        Access Denied
      </MDTypography>
      <MDTypography variant="body1" color="text">
        You do not have permission to view this page.
      </MDTypography>
      <MDButton
        variant="gradient"
        color="error"
        sx={{ mt: 3 }}
        onClick={handleGoHome}
      >
        <Icon sx={{ mr: 1 }}>home</Icon>
        Go Back to Dashboard
      </MDButton>
    </MDBox>
  );
}

export default UnauthorizedPage;
