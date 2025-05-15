import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

function AdminRoute({ children }) {
  const auth = useSelector((state) => state.auth.value);
  // Accepts both string and array for roles
  const isAdmin = auth && auth.roles && (typeof auth.roles === "string"
    ? auth.roles.includes("ROLE_ADMIN")
    : Array.isArray(auth.roles) && auth.roles.includes("ROLE_ADMIN"));

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminRoute;
