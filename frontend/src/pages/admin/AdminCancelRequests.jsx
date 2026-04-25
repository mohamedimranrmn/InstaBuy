import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { ADMIN_BASE_CSS } from "./adminStyles";

export default function AdminCancelRequests() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    axios.get("/orders/cancel-requests").then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  const decide = async (orderId, approve) => {
    setProcessing(orderId);
    try {
      await axios.post(`/orders/refund-decision/${orderId}?approve=${approve}`);
      setData(prev => prev.filter(o => o.orderId !== orderId));
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="adm-page">
      <style>{ADMIN_BASE_CSS}</style>

      <div className="adm-eyebrow">Refund Queue</div>
      <h1 className="adm-title">Refund Requests</h1>
      <p className="adm-sub">
        {loading ? "Loading…" : `${data.length} pending request${data.length !== 1 ? "s" : ""}`}
      </p>
      <hr className="adm-rule" />

      {loading ? (
        <div className="adm-loading">Loading queue…</div>
      ) : data.length === 0 ? (
        <div className="adm-empty" style={{ background: "#fff", border: "1px solid #ddd8cc", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.35 }}>◉</div>
          <div style={{ fontFamily: "'Libre Baskerville', serif", color: "#888078", fontSize: "0.95rem" }}>Queue is empty</div>
          <div style={{ fontSize: "0.82rem", color: "#bbb4a8", marginTop: "0.4rem" }}>No pending refund requests at this time.</div>
        </div>
      ) : (
        data.map(o => {
          const busy = processing === o.orderId;
          return (
            <div key={o.orderId} className="adm-card">
              <div className="adm-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="adm-id">Order #{o.orderId}</span>
                  <span className="adm-chip">User #{o.userId}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="adm-amount">₹{o.totalAmount?.toLocaleString("en-IN")}</div>
                  <div className="adm-date">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>

              <div className="adm-card-body">
                <div className="adm-items-label">Order Items</div>
                {o.items?.map((item, i) => (
                  <div key={i} className="adm-item-row">
                    <span className="adm-item-prod">Product #{item.productId}</span>
                    <span className="adm-item-qty">Qty: {item.quantity}</span>
                    <span className="adm-item-sub">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}

                <div className="adm-action-row">
                  <button
                    className="adm-action-btn adm-action-approve"
                    disabled={busy || o.status !== "CANCEL_REQUESTED"}
                    onClick={() => decide(o.orderId, true)}
                  >
                    {busy ? "Processing…" : "✓ Approve Refund"}
                  </button>
                  <button
                    className="adm-action-btn adm-action-reject"
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