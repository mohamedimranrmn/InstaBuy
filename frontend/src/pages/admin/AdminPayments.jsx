import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { ADMIN_BASE_CSS } from "./adminStyles";

const FILTERS = ["ALL", "SUCCESS", "INITIATED", "FAILED", "REFUNDED", "REVERSED"];

const BADGE_MAP = {
  SUCCESS: "adm-badge-green",
  INITIATED: "adm-badge-amber",
  FAILED: "adm-badge-red",
  REFUNDED: "adm-badge-blue",
  REVERSED: "adm-badge-amber",
};

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    axios.get("/payments/all")
      .then(res => setPayments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? payments : payments.filter(p => p.status === filter);
  const countOf = f => f === "ALL" ? payments.length : payments.filter(p => p.status === f).length;
  const revenue = payments.filter(p => p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0);

  const STATS = [
    { label: "Total Payments", value: payments.length, color: "#1a5a9a" },
    { label: "Successful",     value: payments.filter(p => p.status === "SUCCESS").length, color: "#2a6a2a" },
    { label: "Failed",         value: payments.filter(p => p.status === "FAILED").length, color: "#8b2020" },
    { label: "Revenue",        value: `₹${revenue.toLocaleString("en-IN")}`, color: "#8a6020" },
  ];

  return (
    <div className="adm-page">
      <style>{ADMIN_BASE_CSS}</style>

      <div className="adm-eyebrow">Payment Ledger</div>
      <h1 className="adm-title">Payments</h1>
      <p className="adm-sub">All transactions across the platform</p>
      <hr className="adm-rule" />

      <div className="adm-stat-grid">
        {STATS.map(s => (
          <div key={s.label} className="adm-stat-card" style={{ borderTopColor: s.color }}>
            <div className="adm-stat-label">{s.label}</div>
            <div className="adm-stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="adm-filters">
        {FILTERS.map(f => (
          <button key={f} className={`adm-filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
            {f} ({countOf(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="adm-loading">Loading transactions…</div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">No records found.</div>
      ) : (
        <div className="adm-table-wrap">
          <div style={{ overflowX: "auto" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  {["Payment ID", "Order ID", "Amount", "Status", "Transaction ID"].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.paymentId || p.id}>
                    <td><span style={{ color: "#888078", fontSize: "0.82rem" }}>#{p.paymentId || p.id}</span></td>
                    <td><span className="adm-id">#{p.orderId}</span></td>
                    <td style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 700 }}>₹{p.amount?.toLocaleString("en-IN")}</td>
                    <td><span className={`adm-badge ${BADGE_MAP[p.status] || "adm-badge-gray"}`}>{p.status}</span></td>
                    <td style={{ color: "#888078", fontSize: "0.78rem" }}>{p.transactionId || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}