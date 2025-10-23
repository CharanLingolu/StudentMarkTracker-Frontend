import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./context/AuthContext";
import "./Panels.css";

const API_BASE = "https://studentmarktracker-backend-873w.onrender.com/api";

const TeacherPanel = () => {
  const { auth, logout } = useAuth();
  const [masterStudents, setMasterStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null); // 💥 NEW STATE: Toggle visibility of complaints
  const [showComplaints, setShowComplaints] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [studentForm, setStudentForm] = useState({
    rollNumber: "",
    marks: "",
    subject: "",
  });

  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingMark, setEditingMark] = useState(""); // Helper function to apply global body style

  useEffect(() => {
    document.body.classList.add("panel-active-body");
    return () => {
      document.body.classList.remove("panel-active-body");
    };
  }, []); // R (Read): Fetch ALL data once on mount

  const fetchData = useCallback(async () => {
    if (!auth?.token) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const cacheBuster = Date.now(); // Fetch ALL students without a search query

      const studentResponse = await fetch(
        `${API_BASE}/studentmarks?t=${cacheBuster}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      const studentData = await studentResponse.json();
      if (studentResponse.ok) {
        setMasterStudents(studentData);
      } // Fetch Complaints (unchanged)

      const complaintResponse = await fetch(
        `${API_BASE}/complaints?t=${cacheBuster}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      const complaintData = await complaintResponse.json();
      if (complaintResponse.ok) setComplaints(complaintData);
    } catch (error) {
      setErrorMessage(`Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [auth.token]); // Execute fetch once on initial mount only

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Filter students whenever the searchTerm or master list changes

  const filteredStudents = useMemo(() => {
    if (!searchTerm) {
      return masterStudents;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();

    return masterStudents.filter(
      (student) =>
        student.rollNumber?.toLowerCase().includes(lowerCaseSearch) ||
        student.studentName?.toLowerCase().includes(lowerCaseSearch) ||
        student.subject?.toLowerCase().includes(lowerCaseSearch)
    );
  }, [masterStudents, searchTerm]); // Filter subjects from the FILTERED list for rendering

  const uniqueSubjects = useMemo(() => {
    return [...new Set(filteredStudents.map((s) => s.subject))];
  }, [filteredStudents]); // C (Create): Add a new student mark

  const addStudent = async () => {
    if (!studentForm.rollNumber || !studentForm.marks || !studentForm.subject) {
      alert("All fields are required.");
      return;
    }

    const payload = {
      rollNumber: studentForm.rollNumber,
      marks: studentForm.marks,
      subject: studentForm.subject,
    };

    try {
      const response = await fetch(`${API_BASE}/studentmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add student mark.`);
      }

      setStudentForm({ rollNumber: "", marks: "", subject: "" });
      fetchData();
    } catch (error) {
      alert(`Error adding student: ${error.message}`);
    }
  }; // U (Update): Update a student's mark

  const updateMark = async (id) => {
    const mark = parseFloat(editingMark);
    if (isNaN(mark) || mark < 0 || mark > 100) {
      alert("Mark must be a number between 0 and 100.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/studentmarks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ marks: mark }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update mark.`);
      }

      setEditingStudentId(null);
      setEditingMark("");
      fetchData();
    } catch (error) {
      alert(`Error updating mark: ${error.message}`);
    }
  }; // U (Update): Resolve a complaint

  const resolveComplaint = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/complaints/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to resolve complaint.`);
      }

      fetchData();
    } catch (error) {
      alert(`Error resolving complaint: ${error.message}`);
    }
  }; // D (Delete): Delete a student mark record

  const deleteStudent = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/studentmarks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.status === 403) {
        throw new Error("You are not authorized to delete this mark.");
      } // 💥 FIX: Handle potential non-JSON response on success or error

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to delete student mark."
          );
        } else {
          throw new Error(`Deletion failed with status ${response.status}.`);
        }
      } // If response is OK, refetch the data to show the updated list

      fetchData();
    } catch (error) {
      alert(`Error deleting student mark: ${error.message}`);
    }
  }; // Handler to prevent refresh on search button click

  const handleSearchClick = () => {
    if (searchTerm === "") {
      fetchData();
    }
  }; // Handle Enter key press within the input field

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Re-trigger filtering by re-setting the state (which useMemo watches)
      setSearchTerm(searchTerm);
    }
  };

  if (loading) {
    return (
      <div className="panel-wrapper teacher-panel">
               {" "}
        <div className="panel-header-bar">
                    <h1>Teacher Panel</h1>         {" "}
          <button className="logout-button" onClick={logout}>
                        Log Out ({auth?.username || "Teacher"})          {" "}
          </button>
                 {" "}
        </div>
               {" "}
        <div className="panel-section">
                    Loading student data and complaints...        {" "}
        </div>
             {" "}
      </div>
    );
  }

  return (
    <div className="panel-wrapper teacher-panel">
           {" "}
      <div className="panel-header-bar">
                <h1>Teacher Panel</h1>       {" "}
        <button className="logout-button" onClick={logout}>
                    Log Out ({auth?.username || "Teacher"})        {" "}
        </button>
             {" "}
      </div>
            <hr />     {" "}
      {errorMessage && <div className="error-message">{errorMessage}</div>}     {" "}
      <div className="panel-section">
                <h2>Add Student Mark</h2>       {" "}
        <input
          placeholder="Student Roll Number"
          value={studentForm.rollNumber}
          onChange={(e) =>
            setStudentForm({ ...studentForm, rollNumber: e.target.value })
          }
        />
               {" "}
        <input
          type="number"
          placeholder="Marks (0-100)"
          value={studentForm.marks}
          onChange={(e) =>
            setStudentForm({ ...studentForm, marks: e.target.value })
          }
        />
               {" "}
        <input
          placeholder="Subject"
          value={studentForm.subject}
          onChange={(e) =>
            setStudentForm({ ...studentForm, subject: e.target.value })
          }
        />
                <button onClick={addStudent}>Add Mark Record</button>     {" "}
      </div>
           {" "}
      <div className="panel-section">
                <h2>Mark Records by Subject</h2>       {" "}
        {/* Search Input is NOT in a form */}       {" "}
        <div
          className="search-form-group"
          style={{ display: "flex", marginBottom: "20px" }}
        >
                   {" "}
          <input
            type="search"
            placeholder="Search by name, roll number, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="search-input-field"
            style={{ flexGrow: 1, marginRight: "10px" }}
          />
                   {" "}
          <button
            type="button"
            onClick={handleSearchClick}
            className="action-button-refresh"
          >
                        Refresh          {" "}
          </button>
                 {" "}
        </div>
               {" "}
        {filteredStudents.length === 0 ? (
          <p>No student marks found yet matching the current search filter.</p>
        ) : (
          uniqueSubjects.map((subject) => (
            <div key={subject} className="panel-subject-section">
                            <h3>{subject}</h3>             {" "}
              <ul>
                               {" "}
                {filteredStudents
                  .filter((s) => s.subject === subject)
                  .map((student) => (
                    <li key={student._id}>
                                           {" "}
                      {/* Display student's name and roll number */}           
                               {" "}
                      <strong>
                                                {student.studentName || "N/A"} 
                                           {" "}
                      </strong>{" "}
                      (Roll: {student.rollNumber}):                      {" "}
                      {editingStudentId === student._id ? (
                        // Editing View
                        <div className="edit-mark-group">
                                                   {" "}
                          <input
                            type="number"
                            value={editingMark}
                            onChange={(e) => setEditingMark(e.target.value)}
                            className="input-small"
                          />
                                                   {" "}
                          <button onClick={() => updateMark(student._id)}>
                                                        Save                    
                                 {" "}
                          </button>
                                                   {" "}
                          <button
                            className="delete-button"
                            onClick={() => setEditingStudentId(null)}
                          >
                                                        Cancel                  
                                   {" "}
                          </button>
                                                 {" "}
                        </div>
                      ) : (
                        // Display View
                        <div className="mark-actions-group">
                                                   {" "}
                          <span className="mark-display">{student.marks}</span> 
                                                 {" "}
                          <button
                            onClick={() => {
                              setEditingStudentId(student._id);
                              setEditingMark(student.marks.toString());
                            }}
                            className="action-button"
                          >
                                                        Edit Mark              
                                       {" "}
                          </button>
                                                   {" "}
                          <button
                            className="delete-button"
                            onClick={() => deleteStudent(student._id)}
                          >
                                                        Delete                  
                                   {" "}
                          </button>
                                                 {" "}
                        </div>
                      )}
                                         {" "}
                    </li>
                  ))}
                             {" "}
              </ul>
                         {" "}
            </div>
          ))
        )}
             {" "}
      </div>
           {" "}
      <div className="panel-section">
                {/* 💥 NEW BUTTON: Toggles visibility */}       {" "}
        <h2>
                    Student Complaints ({""}
          {complaints.filter((c) => c.status === "Submitted").length} Pending)  
               {" "}
        </h2>
        <button
          onClick={() => setShowComplaints(!showComplaints)}
          className="action-button-small"
          style={{ marginBottom: "20px" }}
        >
          {showComplaints ? "Hide Complaints ▲" : "Show Complaints ▼"}
        </button>
                {/* 💥 CONDITIONAL RENDERING */}       {" "}
        {showComplaints && (
          <ul>
                       {" "}
            {complaints.map((c) => (
              <li key={c._id}>
                                <strong>{c.studentName}</strong>: {c.message}{" "}
                (Status: {c.status})                {" "}
                {c.status === "Submitted" && (
                  <button onClick={() => resolveComplaint(c._id)}>
                    Resolve
                  </button>
                )}
                             {" "}
              </li>
            ))}
                     {" "}
          </ul>
        )}
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default TeacherPanel;
