import React, { useState } from "react";
import "./LoginPage.css";

// LoginPage now accepts an 'onLogin' prop
const LoginPage = ({ onLogin, loading, error }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Handles form submission by calling the 'onLogin' function from the wrapper
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    // Replaced large inline style block with the external class .login-container
    <div className="login-container">
      {/* Optional: Add a decorative background element if needed, though body styling handles most of it */}
      <div className="login-bg-glass"></div>

      <h1>Login</h1>

      {/* Error display kept simple. You can style a dedicated .login-error class if needed */}
      {error && <div style={{ color: "white", marginBottom: 15 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* 💥 NEW WRAPPER CLASS FOR PADDING: login-form-area */}
        <div className="login-form-area">
          <div>
            {/* Replaced inline styles with class="login-input" */}
            <input
              type="text"
              className="login-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            {/* Replaced inline styles with class="login-input" */}
            <input
              type="password"
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Replaced inline styles with class="login-btn".
              The loading state (button disabled) is now handled entirely by the 
              :disabled pseudo-class in LoginPage.css. */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
