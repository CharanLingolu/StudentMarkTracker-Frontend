import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import "./Panels.css";

const API_BASE = "http://localhost:5000/api";

const StudentPanel = () => {
  const { auth, logout } = useAuth();

  const [marks, setMarks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [complaintMessage, setComplaintMessage] = useState(""); // 💥 NEW STATE: Toggle visibility of complaints
  const [showComplaints, setShowComplaints] = useState(false);

  useEffect(() => {
    document.body.classList.add("panel-active-body");
    return () => {
      document.body.classList.remove("panel-active-body");
    };
  }, []);

  const fetchData = useCallback(async () => {
    setErrorMessage(null);
    if (!auth?.token) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const performFetch = async (url, errorContext) => {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `Failed to fetch ${errorContext}: ${
            errorData.message || response.statusText
          }`
        );
      }
      return response.json();
    };

    try {
      const marksUrl = `${API_BASE}/studentmarks`;
      const markData = await performFetch(marksUrl, "marks data");
      setMarks(markData);

      const complaintsUrl = `${API_BASE}/complaints`;
      const complaintData = await performFetch(
        complaintsUrl,
        "complaints list"
      );
      setComplaints(complaintData);
    } catch (error) {
      console.error("Critical Error fetching student data:", error);
      setErrorMessage(error.message);

      if (
        error.message.includes("Forbidden") ||
        error.message.includes("Invalid token")
      ) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [auth?.token, logout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submitComplaint = async () => {
    if (!complaintMessage.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ message: complaintMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit complaint.");
      }

      setComplaintMessage("");
      fetchData();
    } catch (error) {
      alert(`Error submitting complaint: ${error.message}`);
      console.error("Error submitting complaint:", error);
    }
  };

  if (loading) {
    return (
      <div className="panel-wrapper student-panel">
               {" "}
        <div className="panel-header-bar">
                    <h1>Student Portal</h1>         {" "}
          <button className="logout-button" onClick={logout}>
                        Log Out ({auth?.fullName || "Student"})          {" "}
          </button>
                 {" "}
        </div>
                <div className="panel-section">Loading your records...</div>   
         {" "}
      </div>
    );
  }

  return (
    <div className="panel-wrapper student-panel">
           {" "}
      <div className="panel-header-bar">
        <h1>Student Portal</h1>{" "}
        <button className="logout-button" onClick={logout}>
                    Log Out ({auth?.username || "Student"})        {" "}
        </button>
             {" "}
      </div>
            <hr />     {" "}
      {errorMessage && <div className="error-message">{errorMessage}</div>}     {" "}
      <div className="panel-section">
                <h2>{auth.username}</h2> <h2>Your Marks</h2>       {" "}
        <ul>
                   {" "}
          {marks.length === 0 ? (
            <li>No marks recorded yet for roll number {auth?.username}.</li>
          ) : (
            marks.map((record) => (
              <li key={record._id}>
                                <strong>{record.subject}</strong>:{" "}
                {record.marks}             {" "}
              </li>
            ))
          )}
                 {" "}
        </ul>
             {" "}
      </div>
           {" "}
      <div className="panel-section">
                <h2>Raise Complaint</h2>       {" "}
        <textarea
          rows={4}
          placeholder="Describe your issue with marks..."
          value={complaintMessage}
          onChange={(e) => setComplaintMessage(e.target.value)}
        />
                <br />       {" "}
        <button onClick={submitComplaint} disabled={!complaintMessage.trim()}>
                    Submit Complaint        {" "}
        </button>
             {" "}
      </div>
           {" "}
      <div className="panel-section">
                <h3>Complaints Status</h3>       {" "}
        {/* 💥 NEW BUTTON: Toggles visibility */}       {" "}
        <button
          onClick={() => setShowComplaints(!showComplaints)}
          className="action-button-small"
          style={{ marginBottom: "20px" }}
        >
          {showComplaints ? "Hide Status ▲" : "View Status ▼"}
        </button>
                {/* 💥 CONDITIONAL RENDERING */}       {" "}
        {showComplaints && (
          <ul>
                       {" "}
            {complaints.length === 0 ? (
              <li>No complaints submitted.</li>
            ) : (
              complaints.map((c) => (
                <li key={c._id}>
                                    {c.message} - Status: **{c.status}**        
                         {" "}
                </li>
              ))
            )}
                     {" "}
          </ul>
        )}
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default StudentPanel;
