import { useEffect, useState } from "react";
import axios from "../../api/axios";

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#111" },
  heading: { fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.25rem", color: "#111" },
  sub: { fontSize: "0.8rem", color: "#666", margin: "0 0 1.25rem" },
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
  card: { background: "#fff", border: "1px solid #d5d9d9", borderRadius: 8, overflow: "hidden" },
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
  badge: (color, bg) => ({
    display: "inline-block",
    padding: "0.2rem 0.65rem",
    borderRadius: 20,
    fontSize: "0.7rem",
    fontWeight: 700,
    color,
    background: bg,
    whiteSpace: "nowrap",
  }),
  expandBox: {
    background: "#fafafa",
    border: "1px solid #eee",
    borderRadius: 6,
    padding: "0.75rem 1rem",
    margin: "0 0 0.5rem",
  },
  actionBtn: (color, bg, border) => ({
    padding: "0.35rem 0.85rem",
    borderRadius: 6,
    border: `1px solid ${border}`,
    background: bg,
    color,
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    marginRight: "0.4rem",
  }),
};

const STATUS_MAP = {
  COMPLETED:          { color: "#007600", bg: "#e6f4e6" },
  FAILED:             { color: "#b12704", bg: "#fde8e4" },
  PAYMENT_PENDING:    { color: "#c45500", bg: "#fef3e9" },
  CREATED:            { color: "#c45500", bg: "#fef3e9" },
  INVENTORY_RESERVED: { color: "#0066c0", bg: "#e6f0fb" },
  CANCELLED:          { color: "#555",    bg: "#f0f0f0" },
  CANCEL_REQUESTED:   { color: "#7a5900", bg: "#fff8e0" },
  REFUND_PENDING:     { color: "#c45500", bg: "#fef3e9" },
  REFUNDED:           { color: "#007600", bg: "#e6f4e6" },
  REFUND_REJECTED:    { color: "#b12704", bg: "#fde8e4" },
};

const FILTERS = ["ALL", "COMPLETED", "PAYMENT_PENDING", "FAILED", "CANCELLED", "CANCEL_REQUESTED", "REFUNDED"];

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status?.toUpperCase()] || { color: "#555", bg: "#f0f0f0" };
  return <span style={s.badge(cfg.color, cfg.bg)}>{status?.replace(/_/g, " ")}</span>;
}

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [processing, setProcessing] = useState(null); // orderId being acted on

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setLoading(true);
    axios
      .get("/orders/admin/all")
      .then((res) => setOrders(res.data.sort((a, b) => b.orderId - a.orderId)))
      .finally(() => setLoading(false));
  };

  const approveRefund = async (orderId) => {
    setProcessing(orderId);
    try {
      await axios.post(`/orders/refund-decision/${orderId}?approve=true`);
      loadOrders();
    } finally {
      setProcessing(null);
    }
  };

  const rejectRefund = async (orderId) => {
    setProcessing(orderId);
    try {
      await axios.post(`/orders/refund-decision/${orderId}?approve=false`);
      loadOrders();
    } finally {
      setProcessing(null);
    }
  };

  const filtered =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const countOf = (f) =>
    f === "ALL" ? orders.length : orders.filter((o) => o.status === f).length;

  return (
    <div style={s.page}>
      <h1 style={s.heading}>All Orders</h1>
      <p style={s.sub}>{orders.length} total orders</p>

      {/* Filter pills */}
      <div style={s.filters}>
        {FILTERS.map((f) => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f.replace(/_/g, " ")} ({countOf(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#666" }}>Loading orders…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "#666" }}>No orders found.</p>
      ) : (
        <div style={s.card}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Order ID", "User ID", "Status", "Total", "Date", "Items", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const isCancelReq = o.status === "CANCEL_REQUESTED";
                  const busy = processing === o.orderId;

                  return (
                    <>
                      <tr
                        key={o.orderId}
                        style={{ background: isCancelReq ? "#fffdf0" : "#fff" }}
                      >
                        <td style={s.td}>
                          <span style={{ fontWeight: 700, color: "#0066c0" }}>#{o.orderId}</span>
                        </td>
                        <td style={{ ...s.td, color: "#555" }}>#{o.userId}</td>
                        <td style={s.td}><StatusBadge status={o.status} /></td>
                        <td style={{ ...s.td, fontWeight: 600, color: "#007600" }}>
                          ₹{o.totalAmount?.toLocaleString("en-IN")}
                        </td>
                        <td style={{ ...s.td, color: "#555", fontSize: "0.8rem" }}>
                          {new Date(o.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td style={s.td}>
                          <button
                            style={s.actionBtn("#0066c0", "#fff", "#d5d9d9")}
                            onClick={() => setExpanded(expanded === o.orderId ? null : o.orderId)}
                          >
                            {expanded === o.orderId ? "▲ Hide" : "▼ View"}
                          </button>
                        </td>

                        {/* ── ADMIN ACTIONS COLUMN ── */}
                        <td style={s.td}>
                          {isCancelReq ? (
                            <>
                              <button
                                disabled={busy}
                                style={s.actionBtn("#fff", busy ? "#aaa" : "#007600", busy ? "#aaa" : "#007600")}
                                onClick={() => approveRefund(o.orderId)}
                              >
                                {busy ? "…" : "✓ Approve Refund"}
                              </button>
                              <button
                                disabled={busy}
                                style={s.actionBtn("#fff", busy ? "#aaa" : "#b12704", busy ? "#aaa" : "#b12704")}
                                onClick={() => rejectRefund(o.orderId)}
                              >
                                {busy ? "…" : "✕ Reject Refund"}
                              </button>
                            </>
                          ) : (
                            <span style={{ color: "#aaa", fontSize: "0.78rem" }}>—</span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable items row */}
                      {expanded === o.orderId && (
                        <tr key={`${o.orderId}-exp`}>
                          <td colSpan={7} style={{ padding: "0 1rem 0.75rem", background: "#fafafa" }}>
                            <div style={s.expandBox}>
                              <p style={{ fontSize: "0.78rem", color: "#555", marginBottom: "0.5rem", fontWeight: 600 }}>
                                Order Items
                              </p>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                                <thead>
                                  <tr>
                                    {["Product ID", "Qty", "Unit Price", "Subtotal"].map((h) => (
                                      <th key={h} style={{ textAlign: "left", padding: "0.25rem 0.5rem", color: "#666", fontWeight: 600 }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {o.items?.map((item, i) => (
                                    <tr key={i} style={{ borderTop: "1px solid #eee" }}>
                                      <td style={{ padding: "0.35rem 0.5rem" }}>#{item.productId}</td>
                                      <td style={{ padding: "0.35rem 0.5rem" }}>{item.quantity}</td>
                                      <td style={{ padding: "0.35rem 0.5rem" }}>₹{item.price?.toLocaleString("en-IN")}</td>
                                      <td style={{ padding: "0.35rem 0.5rem", fontWeight: 600 }}>
                                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {o.failureReason && (
                                <p style={{ color: "#b12704", marginTop: "0.5rem", fontSize: "0.82rem" }}>
                                  ⚠ {o.failureReason}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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