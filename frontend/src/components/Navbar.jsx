import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

function Navbar() {
  const { count } = useCart();
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role,  setRole]  = useState(localStorage.getItem("role"));

  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
    navigate("/login");
  };

  return (
    <nav style={{
      background: "#1b2a4a",
      padding: "0 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* Logo */}
      <Link to="/" style={{
        color: "#f0a500",
        fontWeight: 700,
        fontSize: "1.15rem",
        textDecoration: "none",
        letterSpacing: "0.02em",
      }}>
        🛒 InstaBuy
      </Link>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>

        {/* Customer links */}
        {token && role !== "ADMIN" && (
          <>
            <NavBtn to="/products">Products</NavBtn>
            <NavBtn to="/cart">Cart ({count})</NavBtn>
            <NavBtn to="/orders">My Orders</NavBtn>
          </>
        )}

        {/* Public */}
        {!token && <NavBtn to="/products">Products</NavBtn>}

        {/* Admin */}
        {token && role === "ADMIN" && (
          <NavBtn to="/admin">Admin Dashboard</NavBtn>
        )}

        {/* Auth */}
        {token ? (
          <button
            onClick={handleLogout}
            style={{
              padding: "0.35rem 0.9rem",
              borderRadius: 4,
              border: "1px solid #e74c3c",
              background: "transparent",
              color: "#e74c3c",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <NavBtn to="/login">Login</NavBtn>
            <NavBtn to="/register">Register</NavBtn>
          </>
        )}
      </div>
    </nav>
  );
}

function NavBtn({ to, children }) {
  return (
    <Link to={to} style={{
      padding: "0.35rem 0.9rem",
      borderRadius: 4,
      border: "1px solid rgba(255,255,255,0.25)",
      color: "#fff",
      fontSize: "0.82rem",
      fontWeight: 500,
      textDecoration: "none",
      background: "transparent",
      transition: "background 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </Link>
  );
}

export default Navbar;