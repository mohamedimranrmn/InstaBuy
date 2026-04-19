import { useEffect, useState } from "react";
import axios from "../../api/axios";

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#111" },
  heading: { fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.25rem", color: "#111" },
  sub: { fontSize: "0.8rem", color: "#666", margin: "0 0 1.5rem" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  statCard: (accent) => ({
    background: "#fff",
    border: "1px solid #d5d9d9",
    borderTop: `3px solid ${accent}`,
    borderRadius: 8,
    padding: "1rem 1.25rem",
  }),
  statLabel: { fontSize: "0.72rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" },
  statValue: (color) => ({ fontSize: "1.6rem", fontWeight: 700, color, margin: 0 }),
  filters: { display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" },
  filterBtn: (active) => ({
    padding: "0.35rem 0.85rem",
    borderRadius: 20,
    border: active ? "1px solid #1b2a4a" : "1px solid #d5d9d9",
    background: active ? "#1b2a4a" : "#fff",
    color: active ? "#fff" : "#444",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
  }),
  tableCard: { background: "#fff", border: "1px solid #d5d9d9", borderRadius: 8, overflow: "hidden" },
  th: {
    padding: "0.65rem 1rem",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#444",
    background: "#f0f2f2",
    borderBottom: "1px solid #d5d9d9",
    whiteSpace: "nowrap",
  },
  td: { padding: "0.85rem 1rem", fontSize: "0.875rem", borderBottom: "1px solid #f0f2f2", verticalAlign: "middle" },
};

const STATUS_MAP = {
  SUCCESS:  { color: "#007600", bg: "#e6f4e6" },
  INITIATED:{ color: "#c45500", bg: "#fef3e9" },
  FAILED:   { color: "#b12704", bg: "#fde8e4" },
  REFUNDED: { color: "#0066c0", bg: "#e6f0fb" },
  REVERSED: { color: "#7a5900", bg: "#fff8e0" },
};

const FILTERS = ["ALL", "SUCCESS", "INITIATED", "FAILED", "REFUNDED", "REVERSED"];

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("ALL");

  useEffect(() => {
    axios.get("/payments/all")
      .then((res) => setPayments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? payments : payments.filter((p) => p.status === filter);
  const countOf  = (f) => f === "ALL" ? payments.length : payments.filter((p) => p.status === f).length;

  const totalRevenue = payments.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + p.amount, 0);
  const STATS = [
    { label: "Total Payments", value: payments.length,                                     accent: "#1b2a4a", color: "#1b2a4a" },
    { label: "Successful",     value: payments.filter((p) => p.status === "SUCCESS").length, accent: "#007600", color: "#007600" },
    { label: "Failed",         value: payments.filter((p) => p.status === "FAILED").length,  accent: "#b12704", color: "#b12704" },
    { label: "Revenue",        value: `₹${totalRevenue.toLocaleString("en-IN")}`,            accent: "#c45500", color: "#c45500" },
  ];

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Payments</h1>
      <p style={s.sub}>Payment records across all orders</p>

      {/* Stats */}
      <div style={s.statsGrid}>
        {STATS.map((st) => (
          <div key={st.label} style={s.statCard(st.accent)}>
            <p style={s.statLabel}>{st.label}</p>
            <p style={s.statValue(st.color)}>{st.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={s.filters}>
        {FILTERS.map((f) => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f} ({countOf(f)})
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: "#666" }}>Loading payments…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "#666" }}>No payment records found.</p>
      ) : (
        <div style={s.tableCard}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Payment ID", "Order ID", "Amount", "Status", "Transaction ID"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const cfg = STATUS_MAP[p.status] || { color: "#555", bg: "#f0f0f0" };
                  return (
                    <tr key={p.paymentId || p.id}>
                      <td style={{ ...s.td, color: "#666" }}>#{p.paymentId || p.id}</td>
                      <td style={{ ...s.td, fontWeight: 600, color: "#0066c0" }}>#{p.orderId}</td>
                      <td style={{ ...s.td, fontWeight: 600, color: "#007600" }}>
                        ₹{p.amount?.toLocaleString("en-IN")}
                      </td>
                      <td style={s.td}>
                        <span style={{
                          display: "inline-block",
                          padding: "0.2rem 0.65rem",
                          borderRadius: 20,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background: cfg.bg,
                          color: cfg.color,
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: "#555", fontFamily: "monospace", fontSize: "0.8rem" }}>
                        {p.transactionId || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}