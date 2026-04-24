import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../utils/api";
import { jwtDecode } from "jwt-decode";
import Button from "../../components/ui/Button";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("access_token", data.access_token);
      
      const decoded = jwtDecode(data.access_token);
      const role = decoded.role || "employee";
      
      // Redirect based on role: admin → /admin, hr → /hr, manager → /manager, employee → /employee
      const roleRedirects = {
        admin: "/admin",
        hr: "/hr",
        manager: "/manager",
        employee: "/employee"
      };

      const redirectPath = roleRedirects[role] || "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail || "An error occurred during login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card-container">
        <div className="login-header">
          <div className="brand-logo">⏱ TimeStamp</div>
          <h2>Sign in to your account</h2>
          <p>Optimize your workforce management today.</p>
        </div>

        {error && <div className="toast-error">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group-login">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group-login">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" disabled={loading} style={{ marginTop: '12px', width: '100%', padding: '12px' }}>
            {loading ? "Authenticating..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
