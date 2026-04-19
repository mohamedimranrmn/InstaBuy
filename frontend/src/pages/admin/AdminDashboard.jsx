import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#111" },
  heading: { fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.25rem", color: "#111" },
  sub: { fontSize: "0.8rem", color: "#666", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", margin: "1.5rem 0" },
  card: {
    background: "#fff",
    border: "1px solid #d5d9d9",
    borderRadius: 8,
    padding: "1.25rem 1.5rem",
  },
  cardLabel: { fontSize: "0.75rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" },
  cardValue: { fontSize: "1.75rem", fontWeight: 700 },
  section: { background: "#fff", border: "1px solid #d5d9d9", borderRadius: 8, padding: "1.25rem 1.5rem", marginTop: "1.5rem" },
  sectionTitle: { fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem", color: "#111" },
  quickLink: (color) => ({
    display: "inline-block",
    padding: "0.45rem 1rem",
    borderRadius: 6,
    border: `1px solid ${color}`,
    color: color,
    fontSize: "0.82rem",
    fontWeight: 600,
    textDecoration: "none",
    marginRight: "0.5rem",
    marginBottom: "0.5rem",
    background: "#fff",
  }),
};

const QUICK = [
  { label: "Products",       to: "/admin/products",         color: "#0066c0" },
  { label: "Orders",         to: "/admin/orders",           color: "#0066c0" },
  { label: "Refund Requests",to: "/admin/cancel-requests",  color: "#c45500" },
  { label: "Users",          to: "/admin/users",            color: "#0066c0" },
  { label: "Payments",       to: "/admin/payments",         color: "#0066c0" },
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
    { label: "Total Orders",  value: stats.total,       color: "#0066c0" },
    { label: "Completed",     value: stats.completed,   color: "#007600" },
    { label: "Pending",       value: stats.pending,     color: "#c45500" },
    { label: "Revenue (₹)",   value: `₹${stats.revenue.toLocaleString("en-IN")}`, color: "#b12704" },
  ];

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Admin Dashboard</h1>
      <p style={s.sub}>Overview of your store</p>

      {loading ? (
        <p style={{ color: "#666", marginTop: "2rem" }}>Loading…</p>
      ) : (
        <div style={s.grid}>
          {STAT_CARDS.map((c) => (
            <div key={c.label} style={{ ...s.card, borderTop: `3px solid ${c.color}` }}>
              <p style={s.cardLabel}>{c.label}</p>
              <p style={{ ...s.cardValue, color: c.color, margin: 0 }}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={s.section}>
        <p style={s.sectionTitle}>Quick Navigation</p>
        {QUICK.map((q) => (
          <Link key={q.to} to={q.to} style={s.quickLink(q.color)}>
            {q.label}
          </Link>
        ))}
      </div>
    </div>
  );
}