import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginWrapper from "./LoginWrapper";
import AdminPanel from "./AdminPanel";
import TeacherPanel from "./TeacherPanel";
import StudentPanel from "./StudentPanel";
import PrivateRoute from "./PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import RoleSelectorPage from "./RoleSelectorPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route for Login. LoginWrapper contains logic to redirect 
              the user if they are already logged in based on their role. */}
          <Route path="/login" element={<LoginWrapper />} />

          {/* Explicitly handle the root path ("/") using the LoginWrapper.
              If logged in, it redirects to dashboard. If not, it shows the login form. */}
          <Route path="/" element={<RoleSelectorPage />} />

          {/* Protected routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminPanel />
              </PrivateRoute>
            }
          />

          <Route
            path="/teacher"
            element={
              <PrivateRoute allowedRoles={["teacher"]}>
                <TeacherPanel />
              </PrivateRoute>
            }
          />

          <Route
            path="/student"
            element={
              <PrivateRoute allowedRoles={["student"]}>
                <StudentPanel />
              </PrivateRoute>
            }
          />

          {/* Fallback/404 route: Redirects any unknown path to the login page */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
