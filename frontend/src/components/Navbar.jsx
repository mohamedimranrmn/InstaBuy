import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import axios from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

  .ib-nav *, .ib-nav *::before, .ib-nav *::after { box-sizing: border-box; }

  .ib-nav {
    background: #0f1c35;
    height: 58px;
    padding: 0 1.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'DM Sans', sans-serif;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.2);
  }

  /* Logo */
  .ib-logo {
    display: flex; align-items: center; gap: 0.5rem;
    text-decoration: none; flex-shrink: 0;
  }
  .ib-logo-mark {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #f0a500, #e08c00);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.95rem;
  }
  .ib-logo-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem; font-weight: 700; color: #fff;
  }
  .ib-logo-name span { color: #f0a500; }

  /* Nav links */
  .ib-nav-links {
    display: flex; align-items: center; gap: 0.2rem;
  }

  .ib-link {
    padding: 0.375rem 0.8rem;
    border-radius: 6px;
    color: rgba(255,255,255,0.7);
    font-size: 0.845rem; font-weight: 500;
    text-decoration: none;
    transition: color 0.13s, background 0.13s;
    position: relative;
  }
  .ib-link:hover { color: #fff; background: rgba(255,255,255,0.07); }
  .ib-link.active { color: #f0a500; }
  .ib-link.active::after {
    content: '';
    position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
    width: 14px; height: 2px;
    background: #f0a500; border-radius: 2px;
  }

  /* Cart */
  .ib-cart {
    position: relative;
    padding: 0.375rem 0.8rem;
    border-radius: 6px;
    color: rgba(255,255,255,0.7);
    font-size: 0.845rem; font-weight: 500;
    text-decoration: none;
    transition: color 0.13s, background 0.13s;
  }
  .ib-cart:hover { color: #fff; background: rgba(255,255,255,0.07); }
  .ib-cart-badge {
    position: absolute; top: 0px; right: 0px;
    background: #f0a500; color: #0f1c35;
    font-size: 0.58rem; font-weight: 800;
    min-width: 15px; height: 15px;
    border-radius: 8px; padding: 0 3px;
    display: flex; align-items: center; justify-content: center;
  }

  /* Divider */
  .ib-nav-divider {
    width: 1px; height: 18px;
    background: rgba(255,255,255,0.1);
    margin: 0 0.3rem; flex-shrink: 0;
  }

  /* Buttons */
  .ib-btn {
    padding: 0.375rem 0.9rem;
    border-radius: 6px;
    font-size: 0.835rem; font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    text-decoration: none;
    border: 1px solid;
    transition: all 0.13s;
    display: inline-flex; align-items: center; gap: 0.3rem;
  }
  .ib-btn-ghost {
    background: transparent;
    border-color: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.85);
  }
  .ib-btn-ghost:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.35); color: #fff; }

  .ib-btn-primary {
    background: #f0a500;
    border-color: #f0a500;
    color: #0f1c35;
  }
  .ib-btn-primary:hover { background: #fdb813; border-color: #fdb813; }

  .ib-btn-admin {
    background: rgba(240,165,0,0.12);
    border-color: rgba(240,165,0,0.35);
    color: #f0a500;
  }
  .ib-btn-admin:hover { background: rgba(240,165,0,0.22); }

  .ib-btn-danger {
    background: transparent;
    border-color: rgba(220,53,69,0.4);
    color: #e05565;
  }
  .ib-btn-danger:hover { background: rgba(220,53,69,0.08); border-color: rgba(220,53,69,0.6); }
`;

export default function Navbar() {
  const { count } = useCart();
  const location  = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role,  setRole]  = useState(localStorage.getItem("role"));

  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const handleLogout = async () => {
    try { await axios.post("/auth/logout"); } catch {}
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const isActive = (path) =>
    location.pathname === path ? "ib-link active" : "ib-link";

  return (
    <nav className="ib-nav">
      <style>{styles}</style>

      <Link to="/" className="ib-logo">
        <div className="ib-logo-mark">🛒</div>
        <div className="ib-logo-name">Insta<span>Buy</span></div>
      </Link>

      <div className="ib-nav-links">
        {/* Customer links */}
        {token && role !== "ADMIN" && (
          <>
            <Link to="/products" className={isActive("/products")}>Products</Link>
            <Link to="/orders"   className={isActive("/orders")}>My Orders</Link>
            <Link to="/cart" className="ib-cart">
              🛒 Cart
              {count > 0 && <span className="ib-cart-badge">{count}</span>}
            </Link>
          </>
        )}

        {/* Guest: show Products */}
        {!token && (
          <Link to="/products" className={isActive("/products")}>Products</Link>
        )}

        {/* Admin shortcut */}
        {token && role === "ADMIN" && (
          <Link to="/admin" className="ib-btn ib-btn-admin">⚙ Admin Panel</Link>
        )}

        <div className="ib-nav-divider" />

        {token ? (
          <button className="ib-btn ib-btn-danger" onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login"    className="ib-btn ib-btn-ghost">Sign In</Link>
            <Link to="/register" className="ib-btn ib-btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}