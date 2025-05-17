import { useEffect, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

import USERS_BASE_URL from "static/baseUrl";

// Layout and charts
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PieChart from "examples/Charts/PieChart";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [userDistributionChart, setUserDistributionChart] = useState(null);
  const [userBarChart, setUserBarChart] = useState(null); // ✅ Declare this missing state


  const User_stat_BASE_URL = `${USERS_BASE_URL}/api/departments`;

  useEffect(() => {
    // Fetch statistics cards
    fetch(User_stat_BASE_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((error) => console.error("Failed to fetch stats:", error));

    // Fetch pie chart data
    fetch("http://localhost:5000/user-distribution", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => setUserDistributionChart(data))
      .catch((error) => console.error("Failed to fetch pie chart data:", error));

    // Fetch vertical bar chart data
    fetch("http://localhost:5000/user-bar-distribution", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => setUserBarChart(data))
      .catch((error) => console.error("Failed to fetch vertical bar chart:", error));
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Top Statistics Cards */}
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color={stat.color}
                  icon="leaderboard"
                  title={stat.title}
                  count={stat.count}
                  percentage={{
                    color: "success",
                    amount: `${stat.percentage}%`,
                    label: "Of total documents",
                  }}
                />
              </MDBox>
            </Grid>
          ))}
        </Grid>

        {/* Aligned PieChart + VerticalBarChart */}
        <MDBox mt={4.5}>
          <Grid container spacing={3} alignItems="stretch">
            {userDistributionChart && (
              <Grid item xs={12} md={6} lg={6}>
                <MDBox p={2}>
                  <PieChart
                    icon={userDistributionChart.icon}
                    title={userDistributionChart.title}
                    description={userDistributionChart.description}
                    height="19.125rem"
                    chart={userDistributionChart.chart}
                  />
                </MDBox>
              </Grid>
            )}

            {userBarChart && (
              <Grid item xs={12} md={6} lg={6}>
                <MDBox p={2}>
                  <VerticalBarChart
                    icon={userBarChart.icon}
                    title={userBarChart.title}
                    description={userBarChart.description}
                    chart={userBarChart.chart}
                  />
                </MDBox>
              </Grid>
            )}
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
