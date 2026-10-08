import { useState } from "react";
import { supabase } from "./supabaseClient";

function Login({ onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
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
    <div className="luxury-auth-page">

      {/* Background */}
      <div className="luxury-auth-background"></div>
      <div className="luxury-auth-overlay"></div>

      {/* Main Content */}
      <div className="luxury-auth-content">

        {/* ================= LEFT SIDE ================= */}

        <section className="luxury-auth-left">

          {/* Brand */}
          <div className="luxury-brand">

            <div className="luxury-brand-logo">
              🏠
            </div>

            <div>
              <h1>
                ESTATE <span>AI</span>
              </h1>

              <p>
                Real Estate Price Prediction with
                <br />
                Map Visualization
              </p>
            </div>

          </div>

          {/* Hero */}
          <div className="luxury-hero-text">

            <div className="luxury-eyebrow">
              INTELLIGENT REAL ESTATE
            </div>

            <h2>
              Find the right property.
              <br />
              Understand its value.
              <br />
              <span>Make smarter decisions.</span>
            </h2>

            <p>
              AI-powered property valuation, location
              insights and data-driven real estate intelligence.
            </p>

          </div>

          {/* Features */}
          <div className="luxury-features">

            <div className="luxury-feature">

              <div className="luxury-feature-icon">
                ↗
              </div>

              <div>
                <strong>AI Prediction</strong>
                <small>Estimated Price Prediction</small>
              </div>

            </div>

            <div className="luxury-feature">

              <div className="luxury-feature-icon">
                ⌖
              </div>

              <div>
                <strong>Map Visualization</strong>
                <small>Explore Locations</small>
              </div>

            </div>

            <div className="luxury-feature">

              <div className="luxury-feature-icon">
                ▥
              </div>

              <div>
                <strong>Smart Analytics</strong>
                <small>Data-Driven Insights</small>
              </div>

            </div>

          </div>

        </section>


        {/* ================= RIGHT SIDE ================= */}

        <section className="luxury-auth-right">

          <div className="luxury-auth-card">

            {/* Top Accent */}
            <div className="luxury-card-line"></div>

            <div className="luxury-card-label">
              SECURE ACCESS
            </div>

            <h2>
              Welcome Back
            </h2>

            <p className="luxury-card-subtitle">
              Access your real estate intelligence dashboard.
            </p>


            {/* ================= FORM ================= */}

            <form onSubmit={handleLogin}>

              {/* Email */}

              <div className="luxury-field">

                <label>
                  Email Address
                </label>

                <div className="luxury-input-wrap">

                  <span>
                    ✉
                  </span>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                    required
                  />

                </div>

              </div>


              {/* Password */}

              <div className="luxury-field">

                <label>
                  Password
                </label>

                <div className="luxury-input-wrap">

                  <span>
                    🔒
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="luxury-password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>

                </div>

              </div>


              {/* Options */}

              <div className="luxury-options">

                <label className="remember-option">

                  <input
                    type="checkbox"
                  />

                  <span>
                    Remember me
                  </span>

                </label>


              <button
  type="button"
  className="forgot-password"
  onClick={async () => {
    if (!email) {
      setMessage("Please enter your email address first.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Password reset link has been sent to your email."
      );
    }

    setLoading(false);
  }}
>
  Forgot password?
</button>

              </div>


              {/* Login Button */}

              <button
                type="submit"
                className="luxury-main-button"
                disabled={loading}
              >

                {loading
                  ? "AUTHENTICATING..."
                  : "ENTER ESTATE AI →"}

              </button>

            </form>


            {/* Message */}

            {message && (
              <p className="luxury-auth-message">
                {message}
              </p>
            )}


            {/* Divider */}

            <div className="luxury-divider">

              <span></span>

              <small>
                OR
              </small>

              <span></span>

            </div>


            {/* Signup */}

            <div className="luxury-account-switch">

              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={onSignup}
              >
                Create account →
              </button>

            </div>


            {/* Security */}

            <div className="luxury-security">

              <span>
                ● SECURE
              </span>

              <span>
                SUPABASE AUTH
              </span>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Login;