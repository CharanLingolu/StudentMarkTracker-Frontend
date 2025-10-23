import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./LoginPage";

const API_BASE = "https://studentmarktracker-backend-873w.onrender.com/api";

function LoginWrapper() {
  // Assuming useAuth now provides an isAuthLoading state
  const { auth, login, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // State for login API call status (separate from global auth loading)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    // ⚠️ Only run navigation logic IF authentication is done loading
    if (!isAuthLoading && auth?.role) {
      if (auth.role === "admin") navigate("/admin");
      else if (auth.role === "teacher") navigate("/teacher");
      else if (auth.role === "student") navigate("/student");
    }
  }, [auth, isAuthLoading, navigate]); // Added isAuthLoading to dependencies

  const handleLogin = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      login(data.token, data.role, data.username);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Show a loading screen while the context is checking localStorage
  if (isAuthLoading) {
    return <div>Loading authentication status...</div>;
  }

  // 2. Render the LoginPage component
  return <LoginPage onLogin={handleLogin} loading={loading} error={error} />;
}

export default LoginWrapper;
