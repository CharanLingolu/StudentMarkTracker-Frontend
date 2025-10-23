// src/pages/RoleSelectorPage.jsx (Conceptual Code)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelectorPage.css";

const RoleSelectorPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);

    // 1. Store the selected role temporarily (e.g., in session storage)
    sessionStorage.setItem("pendingRole", role);

    // 2. Navigate to the LoginWrapper page
    // We pass the role as a state object, or rely on the sessionStorage check in LoginWrapper.
    navigate("/login", { state: { role: role } });
  };

  return (
    <div className="role-selector-container">
      <h1>Welcome to Student Mark Tracker</h1>
      <p>Please select your role to continue:</p>
      <div className="role-buttons">
        <button onClick={() => handleRoleSelect("admin")}>Admin</button>
        <button onClick={() => handleRoleSelect("teacher")}>Teacher</button>
        <button onClick={() => handleRoleSelect("student")}>Student</button>
      </div>
      {/* Optional: Display selected role */}
      {selectedRole && <p>You selected: {selectedRole}</p>}
    </div>
  );
};

export default RoleSelectorPage;
