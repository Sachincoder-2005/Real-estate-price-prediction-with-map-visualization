import { useState } from "react";
import { supabase } from "./supabaseClient";

function Signup({ onLogin }) {
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
    });

    if (error) {
  setMessage(error.message);
} else {
  setMessage("Signup successful! Please login.");

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
      <div className="auth-box">

        <h2>Create Account</h2>

        <p className="auth-subtitle">
          Create your account to use Real Estate Price Predictor
        </p>

        <form onSubmit={handleSignup}>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}
        <p className="auth-switch">
  Already have an account?{" "}
  <button type="button" onClick={onLogin}>
    Login
  </button>
</p>

      </div>
    </div>
  );
}

export default Signup;