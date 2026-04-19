import { useEffect, useState } from "react";
import axios from "../../api/axios";

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#111" },
  heading: { fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.25rem", color: "#111" },
  sub: { fontSize: "0.8rem", color: "#666", margin: "0 0 1.5rem" },
  emptyCard: {
    background: "#fff",
    border: "1px solid #d5d9d9",
    borderRadius: 8,
    padding: "3rem",
    textAlign: "center",
    color: "#555",
  },
  card: {
    background: "#fff",
    border: "1px solid #d5d9d9",
    borderRadius: 8,
    marginBottom: "1rem",
    overflow: "hidden",
  },
  cardHeader: {
    background: "#f0f2f2",
    borderBottom: "1px solid #d5d9d9",
    padding: "0.75rem 1.25rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardBody: { padding: "1rem 1.25rem" },
  itemRow: {
    display: "flex",
    gap: "2rem",
    fontSize: "0.85rem",
    padding: "0.35rem 0",
    borderBottom: "1px solid #f5f5f5",
    color: "#333",
  },
  btn: (color, bg, border) => ({
    flex: 1,
    padding: "0.55rem",
    borderRadius: 6,
    border: `1px solid ${border}`,
    background: bg,
    color,
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
  }),
};

export default function AdminCancelRequests() {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    axios.get("/orders/cancel-requests").then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  const decide = async (orderId, approve) => {
    setProcessing(orderId);
    try {
      await axios.post(`/orders/refund-decision/${orderId}?approve=${approve}`);
      setData((prev) => prev.filter((o) => o.orderId !== orderId));
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Refund Requests</h1>
      <p style={s.sub}>
        {loading ? "Loading…" : `${data.length} pending ${data.length === 1 ? "request" : "requests"}`}
      </p>

      {loading ? (
        <p style={{ color: "#666" }}>Loading…</p>
      ) : data.length === 0 ? (
        <div style={s.emptyCard}>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.25rem" }}>All clear</p>
          <p style={{ color: "#888", margin: 0 }}>No pending refund requests at this time.</p>
        </div>
      ) : (
        data.map((o) => {
          const busy = processing === o.orderId;
          return (
            <div key={o.orderId} style={s.card}>
              {/* Header */}
              <div style={s.cardHeader}>
                <div>
                  <span style={{ fontWeight: 700 }}>Order #{o.orderId}</span>
                  <span style={{ color: "#666", fontSize: "0.8rem", marginLeft: "1rem" }}>
                    User #{o.userId}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "#b12704" }}>
                    ₹{o.totalAmount?.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#666" }}>
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Items + actions */}
              <div style={s.cardBody}>
                <p style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Order Items
                </p>
                {o.items?.map((item, i) => (
                  <div key={i} style={s.itemRow}>
                    <span>Product #{item.productId}</span>
                    <span style={{ color: "#666" }}>× {item.quantity}</span>
                    <span style={{ marginLeft: "auto", fontWeight: 600 }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button
                    disabled={busy || o.status !== "CANCEL_REQUESTED"}
                    onClick={() => decide(o.orderId, true)}
                  >
                    {busy ? "Processing…" : "✓ Approve Refund"}
                  </button>

                  <button
                    disabled={busy || o.status !== "CANCEL_REQUESTED"}
                    onClick={() => decide(o.orderId, false)}
                  >
                    {busy ? "Processing…" : "✕ Reject Refund"}
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}