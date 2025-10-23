import React from "react";
import { createRoot } from "react-dom/client";
// ... other imports

// ➡️ IMPORT the Provider you defined:
import { AuthProvider } from "./context/AuthContext";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ➡️ WRAP the application with the Provider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
