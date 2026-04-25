import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
  .ib-nav * { box-sizing: border-box; }
  .ib-nav {
    background: #0f1c35;
    height: 60px; padding: 0 2rem;
    display: flex; align-items: center; justify-content: space-between;
    font-family: 'DM Sans', sans-serif;
    position: sticky; top: 0; z-index: 1000;
    box-shadow: 0 2px 20px rgba(0,0,0,0.25);
  }
  .ib-nav-logo {
    display: flex; align-items: center; gap: 0.5rem;
    text-decoration: none; color: #fff;
  }
  .ib-nav-logo-icon {
    width: 34px; height: 34px; background: linear-gradient(135deg, #f0a500, #e8960a);
    border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem;
  }
  .ib-nav-logo-text { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: #fff; }
  .ib-nav-logo-text span { color: #f0a500; }

  .ib-nav-links { display: flex; align-items: center; gap: 0.25rem; }
  .ib-nav-link {
    padding: 0.4rem 0.85rem; border-radius: 6px;
    color: rgba(255,255,255,0.75); font-size: 0.85rem; font-weight: 500;
    text-decoration: none; transition: all 0.15s; position: relative;
  }
  .ib-nav-link:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .ib-nav-link.active { color: #f0a500; }
  .ib-nav-link.active::after {
    content: ''; position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%);
    width: 16px; height: 2px; background: #f0a500; border-radius: 2px;
  }

  .ib-nav-cart {
    position: relative; padding: 0.4rem 0.85rem;
    color: rgba(255,255,255,0.75); font-size: 0.85rem; font-weight: 500;
    text-decoration: none; transition: all 0.15s; border-radius: 6px;
  }
  .ib-nav-cart:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .ib-cart-badge {
    position: absolute; top: -2px; right: 2px;
    background: #f0a500; color: #0f1c35; font-size: 0.6rem; font-weight: 800;
    min-width: 16px; height: 16px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; padding: 0 3px;
  }

  .ib-nav-btn {
    padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none;
    transition: all 0.15s;
  }
  .ib-nav-btn.login { background: transparent; border: 1px solid rgba(255,255,255,0.25); color: #fff; }
  .ib-nav-btn.login:hover { background: rgba(255,255,255,0.08); }
  .ib-nav-btn.register { background: #f0a500; border: 1px solid #f0a500; color: #0f1c35; }
  .ib-nav-btn.register:hover { background: #ffc107; }
  .ib-nav-btn.logout { background: transparent; border: 1px solid rgba(231,76,60,0.5); color: #e74c3c; }
  .ib-nav-btn.logout:hover { background: rgba(231,76,60,0.1); }
  .ib-nav-btn.admin { background: rgba(240,165,0,0.15); border: 1px solid rgba(240,165,0,0.4); color: #f0a500; }
  .ib-nav-btn.admin:hover { background: rgba(240,165,0,0.25); }
`;

export default function Navbar() {
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const sync = () => { setToken(localStorage.getItem("token")); setRole(localStorage.getItem("role")); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("role");
    setToken(null); setRole(null); navigate("/login");
  };

  const isActive = (path) => location.pathname === path ? "ib-nav-link active" : "ib-nav-link";

  return (
    <nav className="ib-nav">
      <style>{styles}</style>
      <Link to="/" className="ib-nav-logo">
        <div className="ib-nav-logo-icon">🛒</div>
        <div className="ib-nav-logo-text">Insta<span>Buy</span></div>
      </Link>

      <div className="ib-nav-links">
        {token && role !== "ADMIN" && (
          <>
            <Link to="/products" className={isActive("/products")}>Products</Link>
            <Link to="/orders" className={isActive("/orders")}>My Orders</Link>
            <Link to="/cart" className="ib-nav-cart">
              🛒 Cart
              {count > 0 && <span className="ib-cart-badge">{count}</span>}
            </Link>
          </>
        )}
        {!token && <Link to="/products" className={isActive("/products")}>Products</Link>}
        {token && role === "ADMIN" && (
          <Link to="/admin" className="ib-nav-btn admin">⚙ Admin Panel</Link>
        )}
        {token ? (
          <button className="ib-nav-btn logout" onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login" className="ib-nav-btn login">Sign In</Link>
            <Link to="/register" className="ib-nav-btn register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}