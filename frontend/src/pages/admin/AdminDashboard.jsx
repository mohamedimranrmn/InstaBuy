import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
  .admin-dashboard { font-family: 'Source Sans 3', sans-serif; color: #1a1a18; }
  .admin-page-eyebrow { color: #c8a84b; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 0.35rem; }
  .admin-page-title { font-family: 'Libre Baskerville', serif; font-size: 1.75rem; font-weight: 700; color: #1a1a18; margin-bottom: 0.25rem; }
  .admin-page-sub { font-size: 0.85rem; color: #888078; }
  .admin-rule { border: none; border-top: 1px solid #ddd8cc; margin: 1.5rem 0; }

  .admin-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.1rem; margin: 1.5rem 0; }
  .admin-stat-card {
    background: #fff; border: 1px solid #ddd8cc;
    border-top: 2px solid;
    padding: 1.25rem 1.4rem;
  }
  .admin-stat-label { font-size: 0.7rem; color: #888078; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; font-weight: 700; }
  .admin-stat-value { font-family: 'Libre Baskerville', serif; font-size: 1.85rem; font-weight: 700; }

  .admin-section { background: #fff; border: 1px solid #ddd8cc; padding: 1.4rem 1.5rem; margin-top: 1.5rem; }
  .admin-section-title { font-family: 'Libre Baskerville', serif; font-size: 1rem; font-weight: 700; margin-bottom: 1.25rem; color: #1a1a18; border-bottom: 1px solid #ede9e0; padding-bottom: 0.6rem; }
  .admin-quick-links { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .admin-quick-link {
    display: inline-block; padding: 0.42rem 1.1rem;
    border: 1px solid; font-size: 0.8rem; font-weight: 700;
    text-decoration: none; transition: all 0.15s;
    letter-spacing: 0.04em; text-transform: uppercase;
    font-family: 'Source Sans 3', sans-serif;
  }
`;

const QUICK = [
  { label: "Products",       to: "/admin/products",         color: "#1a5a9a" },
  { label: "Orders",         to: "/admin/orders",           color: "#1a5a9a" },
  { label: "Refund Requests",to: "/admin/cancel-requests",  color: "#8a4a1a" },
  { label: "Users",          to: "/admin/users",            color: "#1a5a9a" },
  { label: "Payments",       to: "/admin/payments",         color: "#1a5a9a" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/orders/admin/all")
      .then((res) => {
        const data = res.data;
        const completed = data.filter((o) => o.status?.toUpperCase() === "COMPLETED");
        const pending = data.filter((o) =>
          ["PAYMENT_PENDING", "CREATED", "INVENTORY_RESERVED"].includes(o.status?.toUpperCase())
        );
        setStats({
          total: data.length,
          completed: completed.length,
          pending: pending.length,
          revenue: completed.reduce((sum, o) => sum + o.totalAmount, 0),
        });
      }).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { label: "Total Orders",  value: stats.total,     color: "#1a5a9a" },
    { label: "Completed",     value: stats.completed, color: "#2a6a2a" },
    { label: "Pending",       value: stats.pending,   color: "#8a4a1a" },
    { label: "Revenue",       value: `₹${stats.revenue.toLocaleString("en-IN")}`, color: "#c8a84b" },
  ];

  return (
    <div className="admin-dashboard">
      <style>{styles}</style>
      <div className="admin-page-eyebrow">Overview</div>
      <h1 className="admin-page-title">Admin Dashboard</h1>
      <p className="admin-page-sub">Summary of your store's performance</p>
      <hr className="admin-rule" />

      {loading ? (
        <p style={{ color: "#888078", marginTop: "2rem" }}>Loading…</p>
      ) : (
        <div className="admin-stat-grid">
          {STAT_CARDS.map((c) => (
            <div key={c.label} className="admin-stat-card" style={{ borderTopColor: c.color }}>
              <p className="admin-stat-label">{c.label}</p>
              <p className="admin-stat-value" style={{ color: c.color, margin: 0 }}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="admin-section">
        <p className="admin-section-title">Quick Navigation</p>
        <div className="admin-quick-links">
          {QUICK.map((q) => (
            <Link
              key={q.to} to={q.to}
              className="admin-quick-link"
              style={{ borderColor: q.color, color: q.color }}
            >
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}