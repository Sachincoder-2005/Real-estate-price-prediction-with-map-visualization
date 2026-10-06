import { useState } from "react";
import { supabase } from "./supabaseClient";

function Login({ onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    console.log("LOGIN EMAIL:", email);
    console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("LOGIN RESULT:", { data, error });

    if (error) {
      console.error("SUPABASE LOGIN ERROR:", error);
      setMessage(error.message);
    } else {
      setMessage("Login successful!");

      if (onLogin) {
        onLogin(data.user);
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-grid"></div>

      <div className="auth-wrapper">

        {/* LEFT SIDE */}
        <div className="auth-visual">

          <div className="auth-status">
            <span className="status-dot"></span>
            ESTATE AI / SYSTEM ONLINE
          </div>

          <div className="auth-brand">
            <span>REAL ESTATE</span>
<h1>ESTATE<span>AI</span></h1>
<p>REAL ESTATE PRICE PREDICTION WITH MAP VISUALIZATION</p>
          </div>

          <div className="property-visual">

            <div className="visual-label">
              PROPERTY ANALYSIS
            </div>

            <div className="building-scene">
              <div className="building building-1"></div>
              <div className="building building-2"></div>
              <div className="building building-3"></div>

              <div className="scan-line"></div>

              <div className="map-point point-1"></div>
              <div className="map-point point-2"></div>
              <div className="map-point point-3"></div>
            </div>

            <div className="coordinates">
              <span>19.0760° N</span>
              <span>72.8777° E</span>
            </div>

          </div>

          <div className="auth-features">
            <span>AI PREDICTION</span>
            <span>PROPERTY DATA</span>
            <span>SMART ANALYTICS</span>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="auth-box">

          <div className="auth-top">
            <span>ACCESS PORTAL</span>
            <span>01 / 02</span>
          </div>

          <div className="auth-icon">
            🏠
          </div>

          <h2>Welcome Back</h2>

          <p className="auth-subtitle">
            Access your real estate intelligence dashboard.
          </p>

          <form onSubmit={handleLogin}>

            <div className="auth-field">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="ENTER EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>

              <input
                type="password"
                placeholder="ENTER PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              className="auth-main-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "AUTHENTICATING..." : "ENTER ESTATE AI →"}
            </button>

          </form>

         {message && (
  <div
    className={`auth-message ${
      message.toLowerCase().includes("successful")
        ? "auth-success"
        : "auth-error"
    }`}
  >
    <span className="auth-message-icon">
      {message.toLowerCase().includes("successful") ? "✓" : "!"}
    </span>

    <span>{message}</span>
  </div>
)}

          <div className="auth-switch">

            <span>NEW TO ESTATE AI?</span>

            <button
              type="button"
              onClick={onSignup}
            >
              CREATE ACCOUNT →
            </button>

          </div>

          <div className="auth-security">
            <span>● SECURE ACCESS</span>
            <span>SUPABASE AUTH</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;