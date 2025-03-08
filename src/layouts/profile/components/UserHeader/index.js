import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React base styles
import breakpoints from "assets/theme/base/breakpoints";

// Images
import backgroundImage from "assets/images/bg-profile.jpeg";
import defaultAvatar from "assets/images/team-4.jpg";

function UserHeader({ children, userName, userAvatar = defaultAvatar }) {
    const [tabsOrientation, setTabsOrientation] = useState("horizontal");
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        // A function that sets the orientation state of the tabs.
        function handleTabsOrientation() {
            return window.innerWidth < breakpoints.values.sm
                ? setTabsOrientation("vertical")
                : setTabsOrientation("horizontal");
        }

        /** 
         The event listener that's calling the handleTabsOrientation function when resizing the window.
        */
        window.addEventListener("resize", handleTabsOrientation);

        // Call the handleTabsOrientation function to set the state with the initial value.
        handleTabsOrientation();

        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleTabsOrientation);
    }, [tabsOrientation]);

    const handleSetTabValue = (event, newValue) => setTabValue(newValue);

    return (
        <MDBox position="relative" mb={5}>

            <Card
                sx={{
                    position: "relative",
                    mt: -8,
                    mx: 3,
                    py: 2,
                    px: 2,
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <MDAvatar src={userAvatar} alt="profile-image" size="xl" shadow="sm" />
                    </Grid>
                    <Grid item>
                        <MDBox height="100%" mt={0.5} lineHeight={1}>
                            <MDTypography variant="h5" fontWeight="medium">
                                {userName}
                            </MDTypography>
                        </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>

                    </Grid>
                </Grid>
                {children}
            </Card>
        </MDBox>
    );
}

// Setting default props for the Header
UserHeader.defaultProps = {
    children: "",
    userAvatar: defaultAvatar
};

// Typechecking props for the Header
UserHeader.propTypes = {
    children: PropTypes.node,
    userName: PropTypes.string.isRequired,
    userAvatar: PropTypes.string
};

export default UserHeader;