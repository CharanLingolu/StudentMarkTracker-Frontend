import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If role doesn’t match the allowed roles, redirect to login
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the protected component
  return children;
};

export default ProtectedRoute;
