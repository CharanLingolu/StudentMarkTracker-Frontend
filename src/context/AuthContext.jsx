// AuthContext.js (File in src/context/)

import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    // Robust check for session data
    return token && role && username ? { token, role, username } : null;
  });

  const login = (token, role, username) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
    setAuth({ token, role, username });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setAuth(null);
  };

  const value = { auth, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
