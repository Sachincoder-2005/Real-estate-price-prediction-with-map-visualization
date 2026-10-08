import { useState } from "react";
import { supabase } from "./supabaseClient";

function Signup({ onLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
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
      setConfirmPassword("");

      if (onLogin) {
        setTimeout(() => {
          onLogin();
        }, 1000);
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


          <div className="luxury-hero-text">

            <div className="luxury-eyebrow">
              INTELLIGENT REAL ESTATE
            </div>

            <h2>
              Build your profile.
              <br />
              Explore property values.
              <br />
              <span>Make smarter decisions.</span>
            </h2>

            <p>
              Create your Estate AI account and unlock
              AI-powered property valuation, location
              insights and smart real estate analytics.
            </p>

          </div>


          <div className="luxury-features">

            <div className="luxury-feature">

              <div className="luxury-feature-icon">
                ↗
              </div>

              <div>
                <strong>AI Prediction</strong>
                <small>Accurate Price Estimates</small>
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

            <div className="luxury-card-line"></div>

            <div className="luxury-card-label">
              CREATE ACCOUNT
            </div>

            <h2>
              Create Your Account
            </h2>

            <p className="luxury-card-subtitle">
              Join Estate AI and start your real estate journey.
            </p>


            <form onSubmit={handleSignup}>

              {/* Full Name */}

              <div className="luxury-field">

                <label>
                  Full Name
                </label>

                <div className="luxury-input-wrap">

                  <span>
                    ♙
                  </span>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    autoComplete="name"
                    required
                  />

                </div>

              </div>


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
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="new-password"
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


              {/* Confirm Password */}

              <div className="luxury-field">

                <label>
                  Confirm Password
                </label>

                <div className="luxury-input-wrap">

                  <span>
                    🔒
                  </span>

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="luxury-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword ? "🙈" : "👁"}
                  </button>

                </div>

              </div>


              {/* Create Account */}

              <button
                type="submit"
                className="luxury-main-button"
                disabled={loading}
              >
                {loading
                  ? "CREATING ACCOUNT..."
                  : "CREATE ACCOUNT →"}
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


            {/* Login */}

            <div className="luxury-account-switch">

              <span>
                Already have an account?
              </span>

              <button
                type="button"
                onClick={onLogin}
              >
                Login →
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

export default Signup;