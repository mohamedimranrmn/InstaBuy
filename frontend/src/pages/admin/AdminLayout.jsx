import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin",                  label: "Dashboard",        icon: "📊" },
  { to: "/admin/orders",           label: "Orders",           icon: "📦" },
  { to: "/admin/cancel-requests",  label: "Refund Requests",  icon: "↩" },
  { to: "/admin/products",         label: "Products",         icon: "🏷" },
  { to: "/admin/payments",         label: "Payments",         icon: "💳" },
  { to: "/admin/users",            label: "Users",            icon: "👥" },
];

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "calc(100vh - 120px)",
    background: "#f3f4f6",
    fontFamily: "'Segoe UI', sans-serif",
  },
  sidebar: {
    width: 220,
    flexShrink: 0,
    background: "#1b2a4a",
    padding: "1.5rem 0",
    display: "flex",
    flexDirection: "column",
  },
  sidebarTitle: {
    color: "#94afd4",
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "0 1.25rem",
    marginBottom: "0.75rem",
  },
  main: {
    flex: 1,
    overflow: "auto",
    padding: "2rem",
  },
};

function AdminLayout() {
  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <p style={styles.sidebarTitle}>Admin Panel</p>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.6rem 1.25rem",
                color: isActive ? "#fff" : "#94afd4",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                borderLeft: isActive ? "3px solid #f0a500" : "3px solid transparent",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
                textDecoration: "none",
                transition: "all 0.15s",
              })}
            >
              <span style={{ fontSize: "1rem", width: 18, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Page content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;