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
    content: ''; position: absolute; top: -30%; left: -10%;
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(27,42,74,0.06), transparent 70%);
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
    width: 40px; height: 40px; background: linear-gradient(135deg, #f0a500, #e8960a);
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
    background: linear-gradient(135deg, #f0a500, #e8960a);
    color: #0f1c35; font-weight: 700; font-size: 1rem;
    border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
    margin-top: 0.5rem; transition: all 0.2s;
  }
  .ib-auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(240,165,0,0.35); }
  .ib-auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .ib-auth-divider { display: flex; align-items: center; gap: 0.75rem; margin: 1.25rem 0; }
  .ib-auth-divider::before, .ib-auth-divider::after { content: ''; flex: 1; height: 1px; background: #ebe9e3; }
  .ib-auth-divider span { color: #bbb; font-size: 0.78rem; }
  .ib-auth-link { text-align: center; font-size: 0.88rem; color: #777; }
  .ib-auth-link a { color: #1b2a4a; font-weight: 700; text-decoration: none; }
  .ib-auth-link a:hover { color: #f0a500; }
  .ib-auth-error { background: #fff2f2; border: 1px solid #fcc; color: #c0392b; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
  .ib-perks { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
  .ib-perk { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: #666; }
  .ib-perk-dot { color: #00c46a; font-size: 0.7rem; }
`;

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError(""); setLoading(true);
    try {
      const res = await axios.post("/auth/register", { name, email, password });
      const token = res.data.token || res.data.jwt || res.data.accessToken;
      if (token) {
        localStorage.setItem("token", token);
        // Decode JWT payload to extract role and persist it — App.jsx reads localStorage("role")
        const payload = JSON.parse(atob(token.split(".")[1]));
        const raw = (payload.role || payload.authorities || "CUSTOMER").toString().toUpperCase();
        const resolvedRole = raw.includes("ADMIN") ? "ADMIN" : "CUSTOMER";
        localStorage.setItem("role", resolvedRole);
        window.location.href = resolvedRole === "ADMIN" ? "/admin" : "/products";
      } else {
        // Registration succeeded but no token returned — send to login
        window.location.href = "/login";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="ib-auth">
      <style>{styles}</style>
      <div className="ib-auth-card">
        <div className="ib-auth-logo">
          <div className="ib-auth-logo-icon">🛒</div>
          <div className="ib-auth-logo-text">InstaBuy</div>
        </div>
        <h1 className="ib-auth-title">Create your account</h1>
        <p className="ib-auth-sub">Join thousands of happy customers</p>

        {error && <div className="ib-auth-error">⚠ {error}</div>}

        <div className="ib-field">
          <label>Full Name</label>
          <input placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="ib-field">
          <label>Email Address</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="ib-field">
          <label>Password</label>
          <input type="password" placeholder="Create a strong password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>

        <button className="ib-auth-btn" onClick={handleRegister} disabled={loading}>
          {loading ? "Creating account…" : "Create Account →"}
        </button>

        <div className="ib-auth-divider"><span>or</span></div>

        <div className="ib-auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}