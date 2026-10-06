import { useState } from "react";
import { supabase } from "./supabaseClient";

function Signup({ onLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signup successful! Please login.");

      setFullName("");
      setEmail("");
      setPassword("");

      if (onLogin) {
        onLogin();
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
            ESTATE AI / REGISTRATION
          </div>

          <div className="auth-brand">
           <span>BUILD YOUR PROFILE</span>
<h1>ESTATE<span>AI</span></h1>
<p>REAL ESTATE PRICE PREDICTION WITH MAP VISUALIZATION</p>
          </div>

          <div className="property-visual">

            <div className="visual-label">
              CREATE YOUR PROFILE
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
              <span>SMART PROPERTY</span>
              <span>DATA / 2026</span>
            </div>

          </div>

          <div className="auth-features">
            <span>CREATE PROFILE</span>
            <span>TRACK PREDICTIONS</span>
            <span>PROPERTY ANALYTICS</span>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="auth-box">

          <div className="auth-top">
            <span>NEW USER REGISTRATION</span>
            <span>02 / 02</span>
          </div>

          <div className="auth-icon">
            🏠
          </div>

          <h2>Create Account</h2>

          <p className="auth-subtitle">
            Create your profile and enter the Estate AI platform.
          </p>

          <form onSubmit={handleSignup}>

            <div className="auth-field">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="ENTER FULL NAME"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="ENTER EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>

              <input
                type="password"
                placeholder="CREATE PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              className="auth-main-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "CREATING PROFILE..."
                : "CREATE ESTATE AI ACCOUNT →"}
            </button>

          </form>

          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

          <div className="auth-switch">

            <span>ALREADY A MEMBER?</span>

            <button
              type="button"
              onClick={onLogin}
            >
              LOGIN →
            </button>

          </div>

          <div className="auth-security">
            <span>● SECURE REGISTRATION</span>
            <span>SUPABASE AUTH</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Signup;