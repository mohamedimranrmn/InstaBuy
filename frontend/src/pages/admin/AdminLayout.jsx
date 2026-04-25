import { NavLink, Outlet } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
  .ib-admin * { box-sizing: border-box; }
  .ib-admin {
    display: flex; min-height: calc(100vh - 62px);
    font-family: 'Source Sans 3', sans-serif;
    background: #faf8f4;
  }
  .ib-admin-sidebar {
    width: 230px; flex-shrink: 0;
    background: #1a1a18;
    border-right: 2px solid #c8a84b;
    padding: 1.75rem 0; display: flex; flex-direction: column;
    position: sticky; top: 62px; height: calc(100vh - 62px);
    overflow-y: auto;
  }
  .ib-admin-brand {
    padding: 0 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(200,168,75,0.2);
    margin-bottom: 1rem;
  }
  .ib-admin-brand-label {
    color: rgba(200,168,75,0.5); font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 0.3rem;
  }
  .ib-admin-brand-name {
    font-family: 'Libre Baskerville', serif; color: #f5f0e8; font-size: 1rem; font-weight: 700;
  }
  .ib-admin-brand-name span { color: #c8a84b; font-style: italic; }

  .ib-admin-nav-section { padding: 0 0.75rem; }
  .ib-admin-nav-label {
    color: rgba(200,168,75,0.4); font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase; padding: 0 0.5rem; margin-bottom: 0.35rem;
  }

  .ib-admin-nav-item {
    display: flex; align-items: center; gap: 0.7rem;
    padding: 0.6rem 0.75rem;
    color: rgba(245,240,232,0.55); font-size: 0.85rem; font-weight: 500;
    text-decoration: none; transition: all 0.15s; margin-bottom: 0.1rem;
    border-left: 2px solid transparent;
    letter-spacing: 0.01em;
  }
  .ib-admin-nav-item:hover { color: rgba(245,240,232,0.9); background: rgba(255,255,255,0.05); border-left-color: rgba(200,168,75,0.3); }
  .ib-admin-nav-item.active {
    color: #c8a84b; background: rgba(200,168,75,0.1);
    border-left-color: #c8a84b;
  }
  .ib-admin-nav-icon {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center; font-size: 0.85rem;
    flex-shrink: 0; opacity: 0.7;
  }
  .ib-admin-nav-item.active .ib-admin-nav-icon { opacity: 1; }

  .ib-admin-main { flex: 1; padding: 2.5rem; overflow: auto; }

  @media(max-width:768px) {
    .ib-admin { flex-direction: column; }
    .ib-admin-sidebar { width: 100%; height: auto; position: static; flex-direction: row; padding: 0.75rem 1rem; overflow-x: auto; border-right: none; border-bottom: 2px solid #c8a84b; }
    .ib-admin-brand { display: none; }
    .ib-admin-nav-section { display: flex; gap: 0.15rem; padding: 0; }
    .ib-admin-nav-label { display: none; }
    .ib-admin-nav-item { flex-direction: column; gap: 0.2rem; font-size: 0.68rem; padding: 0.4rem 0.65rem; white-space: nowrap; border-left: none; border-bottom: 2px solid transparent; }
    .ib-admin-nav-item.active { border-left-color: transparent; border-bottom-color: #c8a84b; }
    .ib-admin-main { padding: 1.5rem 1rem; }
  }
`;

const NAV = [
  { to: "/admin",                 label: "Dashboard",       icon: "◈", end: true },
  { to: "/admin/orders",          label: "Orders",          icon: "◻" },
  { to: "/admin/cancel-requests", label: "Refund Requests", icon: "↩" },
  { to: "/admin/products",        label: "Products",        icon: "◇" },
  { to: "/admin/payments",        label: "Payments",        icon: "◈" },
  { to: "/admin/users",           label: "Users",           icon: "◉" },
];

export default function AdminLayout() {
  return (
    <div className="ib-admin">
      <style>{styles}</style>
      <aside className="ib-admin-sidebar">
        <div className="ib-admin-nav-section">
          {NAV.map(item => (
            <NavLink
              key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `ib-admin-nav-item${isActive ? " active" : ""}`}
            >
              <div className="ib-admin-nav-icon">{item.icon}</div>
              {item.label}
            </NavLink>
          ))}
        </div>
      </aside>
      <main className="ib-admin-main">
        <Outlet />
      </main>
    </div>
  );
}