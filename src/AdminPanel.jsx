import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "./context/AuthContext";
import "./Panels.css";

const API_BASE = "http://localhost:5000/api";

const AdminPanel = () => {
  const { auth, logout } = useAuth();
  const [masterUsers, setMasterUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // 👈 Local filtering input
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "student",
    fullName: "",
    rollNumber: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Function to fetch all users from the backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          logout();
          return;
        }
        throw new Error("Failed to fetch user list.");
      }

      const data = await response.json();
      setMasterUsers(data); // 👈 Store the master list
    } catch (error) {
      alert(`Error loading users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add("panel-active-body");
    if (auth.token) {
      fetchUsers(); // Fetched only once on mount/login
    } else {
      setLoading(false);
    }
    return () => {
      document.body.classList.remove("panel-active-body");
    };
  }, [auth.token]);

  // 💥 NEW LOGIC: Filter the master list whenever the searchTerm changes
  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return masterUsers; // If search bar is empty, show master list
    }

    const lowerCaseSearch = searchTerm.toLowerCase();

    return masterUsers.filter(
      (user) =>
        // Search by username, full name, or roll number
        user.username?.toLowerCase().includes(lowerCaseSearch) ||
        user.fullName?.toLowerCase().includes(lowerCaseSearch) ||
        user.rollNumber?.toLowerCase().includes(lowerCaseSearch)
    );
  }, [masterUsers, searchTerm]);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- EDITING & PROFILE UPDATE LOGIC ---
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const startEdit = (user) => {
    setEditingId(user._id);
    // Populate the edit form with the current user data
    setEditForm({
      role: user.role,
      fullName: user.fullName || "",
      rollNumber: user.rollNumber || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const updateUserInDB = async (id) => {
    // Validation check for student fields
    if (
      editForm.role === "student" &&
      (!editForm.fullName || !editForm.rollNumber)
    ) {
      alert("Full Name and Roll Number are required for student accounts.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update user.`);
      }

      cancelEdit();
      fetchUsers(); // Refresh master list
    } catch (error) {
      alert(`Error updating user: ${error.message}`);
    }
  };

  const addUser = async () => {
    if (!form.username || !form.password) {
      alert("Username and password are required.");
      return;
    }
    if (form.role === "student" && (!form.fullName || !form.rollNumber)) {
      alert("Full Name and Roll Number are required for student accounts.");
      return;
    }

    const payload = {
      username: form.username,
      password: form.password,
      role: form.role,
      fullName: form.fullName,
      rollNumber: form.rollNumber,
    };

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create user.`);
      }

      setForm({
        username: "",
        password: "",
        role: "student",
        fullName: "",
        rollNumber: "",
      });
      fetchUsers(); // Refresh master list
    } catch (error) {
      alert(`Error creating user: ${error.message}`);
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (response.status === 403) {
        throw new Error("You cannot delete yourself or another admin.");
      }
      if (!response.ok) {
        throw new Error("Failed to delete user.");
      }

      // Optimistic delete: update masterUsers locally
      setMasterUsers(masterUsers.filter((user) => user._id !== id));
      alert("User deleted successfully.");
    } catch (error) {
      alert(`Error deleting user: ${error.message}`);
    }
  };

  const resetPassword = async (id, username) => {
    const newPassword = prompt(`Enter new password for ${username}:`);
    if (!newPassword || newPassword.length < 6) {
      if (newPassword !== null) {
        alert("Password must be at least 6 characters long.");
      }
      return;
    }
    try {
      await fetch(`${API_BASE}/users/password/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      alert(`Password for ${username} updated successfully!`);
    } catch (error) {
      alert(`Error resetting password: ${error.message}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  // --- RENDERING ---

  if (loading) {
    return (
      <div className="panel-wrapper admin-panel">
        <div className="panel-header-bar">
          <h1>Admin Panel</h1>
          <button className="logout-button" onClick={logout}>
            Log Out ({auth?.username || "User"})
          </button>
        </div>
        <div className="panel-section">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="panel-wrapper admin-panel">
      <div className="panel-header-bar">
        <h1>Admin Panel</h1>
        <button className="logout-button" onClick={logout}>
          Log Out ({auth.username || "User"})
        </button>
      </div>
      <hr />

      <div className="panel-section">
        <h2>User Management (Add New)</h2>

        <label htmlFor="username-input" className="input-label">
          Login Username
        </label>
        <input
          id="username-input"
          name="username"
          placeholder="Unique Login ID (for system access)"
          value={form.username}
          onChange={handleInput}
        />

        {form.role === "student" && (
          <>
            <label htmlFor="fullName-input" className="input-label">
              Student Full Name
            </label>
            <input
              id="fullName-input"
              name="fullName"
              placeholder="Full Name (e.g., Jane Doe)"
              value={form.fullName}
              onChange={handleInput}
            />
          </>
        )}

        {form.role === "student" && (
          <>
            <label htmlFor="rollNumber-input" className="input-label">
              Roll Number (Unique Marks Identifier)
            </label>
            <input
              id="rollNumber-input"
              name="rollNumber"
              placeholder="Unique Roll Number (e.g., 1001)"
              value={form.rollNumber}
              onChange={handleInput}
            />
          </>
        )}

        <label htmlFor="password-input" className="input-label">
          Password
        </label>
        <input
          id="password-input"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleInput}
        />

        <label htmlFor="role-select" className="input-label">
          Role
        </label>
        <select
          id="role-select"
          name="role"
          value={form.role}
          onChange={handleInput}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <button onClick={addUser}>Add User</button>
      </div>

      <div className="panel-section">
        <h2>All Users ({filteredUsers.length} Found)</h2>
        {/* Search Input wrapped in a form to prevent page refresh */}
        <form onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Search by username, name, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
        </form>
        <ul>
          {/* 💥 RENDER: Uses the locally filtered list */}
          {filteredUsers.map((user) => (
            <li key={user._id}>
              {editingId === user._id ? (
                // EDIT MODE DISPLAY
                <div className="edit-user-form">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={editForm.fullName || ""}
                    onChange={handleEditChange}
                    className="input-inline"
                  />
                  {user.role === "student" && (
                    <input
                      type="text"
                      name="rollNumber"
                      placeholder="Roll Number"
                      value={editForm.rollNumber || ""}
                      onChange={handleEditChange}
                      className="input-inline"
                    />
                  )}
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    className="input-inline"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button onClick={() => updateUserInDB(user._id)}>Save</button>
                  <button className="delete-button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              ) : (
                // READ MODE DISPLAY (MODIFIED)
                <>
                  <div className="user-details-readout">
                    <p>
                      <strong>{user.fullName || user.username}</strong>
                      &nbsp;—&nbsp;
                      <span className="user-role-tag">({user.role})</span>
                      {user.rollNumber && user.role === "student" && (
                        <span className="user-roll-tag">
                          {" "}
                          [Roll: {user.rollNumber}]
                        </span>
                      )}
                      <br />
                      <small className="text-muted">
                        Login ID: {user.username}
                      </small>
                      <br />
                      {/* Displaying HASHED password details */}
                      <small className="text-muted" title={user.password}>
                        Hashed PW:{" "}
                        {user.password
                          ? user.password.substring(0, 15) + "..."
                          : "N/A"}
                      </small>
                    </p>
                  </div>
                  <div className="user-actions">
                    <button
                      onClick={() => resetPassword(user._id, user.username)}
                      className="action-button-small"
                    >
                      Reset PW
                    </button>
                    <button
                      onClick={() => startEdit(user)}
                      className="action-button-small"
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
