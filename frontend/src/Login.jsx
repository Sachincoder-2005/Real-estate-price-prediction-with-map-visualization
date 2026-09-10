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
  setMessage("Invalid login password");
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
    <div className="auth-box">

      <div className="auth-logo">🏠</div>

      <h2>Welcome Back</h2>

      <p className="auth-subtitle">
        Login to your Real Estate Price Predictor
      </p>

      <form onSubmit={handleLogin}>

        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

      {message && (
        <p className="auth-message">{message}</p>
      )}

      <p className="auth-switch">
        Don't have an account?{" "}
        <button type="button" onClick={onSignup}>
          Create Account
        </button>
      </p>

    </div>
  </div>
);
}
export default Login;