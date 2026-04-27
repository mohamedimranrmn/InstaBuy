import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
  .ib-auth * { box-sizing: border-box; }
  .ib-auth {
    font-family: 'DM Sans', sans-serif;
    min-height: 85vh; display: flex; align-items: center; justify-content: center;
    background: #f8f7f4; padding: 2rem;
    position: relative; overflow: hidden;
  }
  .ib-auth::before {
    content: ''; position: absolute; top: -30%; right: -10%;
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(240,165,0,0.08), transparent 70%);
    pointer-events: none;
  }
  .ib-auth-card {
    background: #fff; border-radius: 24px; border: 1px solid #ebe9e3;
    padding: 2.75rem; width: 100%; max-width: 440px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.08);
    position: relative; z-index: 1;
  }
  .ib-auth-logo { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; }
  .ib-auth-logo-icon {
    width: 40px; height: 40px; background: linear-gradient(135deg, #1b2a4a, #0f1c35);
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
  }
  .ib-auth-logo-text { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: #0f1c35; }

  .ib-auth-title { font-family: 'Playfair Display', serif; font-size: 1.75rem; color: #0f1c35; font-weight: 700; margin-bottom: 0.4rem; }
  .ib-auth-sub { color: #999; font-size: 0.9rem; margin-bottom: 2rem; }

  .ib-field { margin-bottom: 1.1rem; }
  .ib-field label { display: block; font-size: 0.82rem; font-weight: 700; color: #444; margin-bottom: 0.4rem; letter-spacing: 0.03em; }
  .ib-field input {
    width: 100%; padding: 0.75rem 1rem;
    border: 1.5px solid #e0ddd6; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem; color: #0f1c35;
    outline: none; transition: all 0.2s; background: #fafaf8;
  }
  .ib-field input:focus { border-color: #f0a500; background: #fff; box-shadow: 0 0 0 3px rgba(240,165,0,0.12); }

  .ib-auth-btn {
    width: 100%; padding: 0.85rem; border-radius: 12px;
    background: linear-gradient(135deg, #1b2a4a, #0f1c35);
    color: #fff; font-weight: 700; font-size: 1rem;
    border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
    margin-top: 0.5rem; transition: all 0.2s; letter-spacing: 0.02em;
  }
  .ib-auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(15,28,53,0.3); }
  .ib-auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .ib-auth-divider { display: flex; align-items: center; gap: 0.75rem; margin: 1.25rem 0; }
  .ib-auth-divider::before, .ib-auth-divider::after { content: ''; flex: 1; height: 1px; background: #ebe9e3; }
  .ib-auth-divider span { color: #bbb; font-size: 0.78rem; }

  .ib-auth-link { text-align: center; font-size: 0.88rem; color: #777; }
  .ib-auth-link a { color: #1b2a4a; font-weight: 700; text-decoration: none; }
  .ib-auth-link a:hover { color: #f0a500; }

  .ib-auth-error { background: #fff2f2; border: 1px solid #fcc; color: #c0392b; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
`;

function parseJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/login", { email, password });

      const token = res.data.token || res.data.jwt || res.data.accessToken;
      localStorage.setItem("token", token);

      const decoded = parseJwt(token);
      const role = decoded?.role || decoded?.roles || "CUSTOMER";
      localStorage.setItem("role", role);

      window.location.href = role === "ADMIN" ? "/admin" : "/products";

    } catch (err) {
      const msg = err.response?.data?.message || "";

      if (msg.includes("ACCOUNT_DISABLED")) {
        setError("Your account is disabled. Contact admin.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="ib-auth">
      <style>{styles}</style>
      <div className="ib-auth-card">
        <div className="ib-auth-logo">
          <div className="ib-auth-logo-icon">🛒</div>
          <div className="ib-auth-logo-text">InstaBuy</div>
        </div>
        <h1 className="ib-auth-title">Welcome back</h1>
        <p className="ib-auth-sub">Sign in to your account to continue shopping</p>

        {error && <div className="ib-auth-error">⚠ {error}</div>}

        <div className="ib-field">
          <label>Email Address</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={handleKey} />
        </div>
        <div className="ib-field">
          <label>Password</label>
          <input type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={handleKey} />
        </div>

        <button className="ib-auth-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in…" : "Sign In →"}
        </button>

        <div className="ib-auth-divider"><span>or</span></div>

        <div className="ib-auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}