import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/**
 * A wrapper component that protects routes based on authentication status and user role.
 * @param {object} children - The component(s) to render if authorized.
 * @param {string[]} allowedRoles - An array of roles that are permitted access (e.g., ['admin', 'teacher']).
 */
function PrivateRoute({ children, allowedRoles }) {
  const { auth } = useAuth();

  // 1. Check if the user is authenticated at all
  if (!auth?.token) {
    // Redirect to login if no token is present
    return <Navigate to="/login" replace />;
  }

  // 2. Check if the authenticated user has an allowed role
  if (!allowedRoles.includes(auth.role)) {
    // Redirect to an unauthorized page or dashboard/login if the role is not allowed
    // A common practice is to redirect to the main dashboard or a 403 page.
    // Redirecting back to /login might not be ideal, but is used here for simplicity.
    return <Navigate to="/login" replace />;
  }

  // 3. User is authenticated and authorized, render the children
  return children;
}

export default PrivateRoute;
