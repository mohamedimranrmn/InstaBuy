import { NavLink, Outlet } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --bg-base: #F5F6FA;
    --bg-surface: #FFFFFF;
    --bg-card: #FFFFFF;
    --bg-hover: #F0F2F8;
    --bg-active: #EEF2FF;
    --border: #E4E7EF;
    --border-light: #C9D0E4;

    --accent: #4361EE;
    --accent-light: #EEF2FF;
    --accent-hover: #3451D1;
    --accent-dim: rgba(67,97,238,0.1);

    --green: #0CAA6E;
    --green-bg: #EDFAF4;
    --green-border: rgba(12,170,110,0.2);

    --amber: #D97706;
    --amber-bg: #FFFBEB;
    --amber-border: rgba(217,119,6,0.2);

    --red: #DC3545;
    --red-bg: #FEF2F2;
    --red-border: rgba(220,53,69,0.2);

    --purple: #7C3AED;
    --purple-bg: #F5F3FF;

    --text-primary: #111827;
    --text-secondary: #6B7280;
    --text-muted: #9CA3AF;
    --text-accent: #4361EE;

    --sidebar-w: 252px;
    --radius: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;

    --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 10px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .adm-shell {
    display: flex;
    min-height: 100vh;
    background: var(--bg-base);
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--text-primary);
  }

  /* ── SIDEBAR ── */
  .adm-sidebar {
    width: var(--sidebar-w);
    flex-shrink: 0;
    background: var(--bg-surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    z-index: 50;
    box-shadow: var(--shadow-sm);
  }

  .adm-sidebar::-webkit-scrollbar { width: 3px; }
  .adm-sidebar::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 2px; }

  .adm-brand {
    padding: 1.5rem 1.375rem 1.25rem;
    border-bottom: 1px solid var(--border);
  }

  .adm-brand-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .adm-brand-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(67,97,238,0.3);
    letter-spacing: -0.5px;
  }

  .adm-brand-text {}
  .adm-brand-name {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.03em;
    line-height: 1.1;
  }
  .adm-brand-name span { color: var(--accent); }
  .adm-brand-sub {
    font-size: 0.68rem;
    color: var(--text-muted);
    font-weight: 500;
    margin-top: 2px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .adm-nav {
    padding: 1.25rem 0.875rem;
    flex: 1;
  }

  .adm-nav-section { margin-bottom: 1.5rem; }

  .adm-nav-label {
    font-size: 0.63rem;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0 0.625rem;
    margin-bottom: 0.5rem;
  }

  .adm-nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.55rem 0.75rem;
    border-radius: var(--radius);
    color: var(--text-secondary);
    font-size: 0.855rem;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    margin-bottom: 0.125rem;
    position: relative;
  }

  .adm-nav-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .adm-nav-item.active {
    background: var(--bg-active);
    color: var(--accent);
    font-weight: 600;
  }

  .adm-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 3px;
    background: var(--accent);
    border-radius: 0 2px 2px 0;
  }

  .adm-nav-icon {
    width: 32px;
    height: 32px;
    border-radius: 7px;
    background: var(--bg-hover);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
    transition: background 0.15s;
  }

  .adm-nav-item.active .adm-nav-icon {
    background: var(--accent-dim);
  }

  .adm-nav-badge {
    margin-left: auto;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.1rem 0.45rem;
    border-radius: 20px;
    background: var(--red-bg);
    color: var(--red);
    border: 1px solid var(--red-border);
  }

  .adm-sidebar-footer {
    padding: 1rem 1.375rem;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .adm-avatar {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(67,97,238,0.2);
  }

  .adm-user-name { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); line-height: 1.2; }
  .adm-user-role {
    font-size: 0.67rem;
    color: var(--green);
    font-weight: 600;
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .adm-user-role::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--green);
  }

  /* ── TOPBAR ── */
  .adm-topbar {
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    padding: 0 2rem;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: var(--shadow-xs);
  }

  .adm-topbar-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .adm-topbar-crumb { color: var(--text-primary); font-weight: 500; }

  .adm-topbar-right { display: flex; align-items: center; gap: 0.75rem; }

  .adm-notif-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.15s;
  }
  .adm-notif-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

  /* ── MAIN ── */
  .adm-content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  .adm-main {
    flex: 1;
    padding: 2rem;
    overflow: auto;
  }

  @media (max-width: 860px) {
    .adm-shell { flex-direction: column; }
    .adm-sidebar {
      width: 100%;
      height: auto;
      position: static;
      flex-direction: row;
      overflow-x: auto;
      overflow-y: hidden;
    }
    .adm-brand { display: none; }
    .adm-nav { display: flex; gap: 0.25rem; padding: 0.5rem; flex-direction: row; }
    .adm-nav-section { margin-bottom: 0; display: flex; gap: 0.25rem; }
    .adm-nav-label { display: none; }
    .adm-nav-item {
      flex-direction: column;
      gap: 0.2rem;
      font-size: 0.65rem;
      padding: 0.5rem 0.75rem;
      white-space: nowrap;
    }
    .adm-nav-item.active::before { display: none; }
    .adm-main { padding: 1rem; }
    .adm-sidebar-footer { display: none; }
    .adm-topbar { padding: 0 1rem; }
  }
`;

const NAV = [
  { to: "/admin",                 label: "Dashboard",       icon: "▦",  end: true },
  { to: "/admin/orders",          label: "Orders",          icon: "📋" },
  { to: "/admin/cancel-requests", label: "Refund Requests", icon: "↩" },
  { to: "/admin/products",        label: "Products",        icon: "🏷" },
  { to: "/admin/payments",        label: "Payments",        icon: "💳" },
  { to: "/admin/users",           label: "Users",           icon: "👤" },
  { to: "/admin/logs",            label: "Logs",            icon: "📜" },
];

export default function AdminLayout() {
  const now = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="adm-shell">
      <style>{styles}</style>
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <div className="adm-brand-logo">
            <div className="adm-brand-icon">IB</div>
            <div className="adm-brand-text">
              <div className="adm-brand-name">Insta<span>Buy</span></div>
              <div className="adm-brand-sub">Admin Console</div>
            </div>
          </div>
        </div>

        <nav className="adm-nav">
          <div className="adm-nav-section">
            <div className="adm-nav-label">Main Menu</div>
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `adm-nav-item${isActive ? " active" : ""}`}
              >
                <div className="adm-nav-icon">{item.icon}</div>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-avatar">SA</div>
          <div>
            <div className="adm-user-name">Super Admin</div>
            <div className="adm-user-role">Authorized</div>
          </div>
        </div>
      </aside>

      <div className="adm-content-wrapper">
        <div className="adm-topbar">
          <div className="adm-topbar-left">
            <span>InstaBuy</span>
            <span>›</span>
            <span className="adm-topbar-crumb">Admin</span>
          </div>
          <div className="adm-topbar-right">
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{now}</span>
            <button className="adm-notif-btn" title="Notifications">🔔</button>
          </div>
        </div>
        <main className="adm-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}