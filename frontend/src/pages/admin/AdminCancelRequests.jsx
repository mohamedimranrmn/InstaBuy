import { useEffect, useState } from "react";
import axios from "../../api/axios";

const css = `
  .refunds-page { animation: fadeUp 0.35s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  .page-header { margin-bottom: 1.5rem; display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
  .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.83rem; color: var(--text-secondary); margin-top: 0.3rem; }

  .count-pill {
    display: inline-flex; align-items:center; gap:0.35rem;
    background: #FFFBEB; color: #D97706;
    border: 1px solid rgba(217,119,6,0.2);
    padding: 0.3rem 0.875rem; border-radius: 20px;
    font-size: 0.78rem; font-weight: 600;
  }

  .empty-state {
    background: var(--bg-card);
    border: 2px dashed var(--border);
    border-radius: var(--radius-xl);
    padding: 5rem 2rem;
    text-align: center;
  }
  .empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--green-bg); border: 1px solid var(--green-border);
    display: flex; align-items:center; justify-content:center;
    font-size: 1.5rem; margin: 0 auto 1rem;
  }
  .empty-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
  .empty-sub { font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.375rem; }

  .refund-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    margin-bottom: 1rem;
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.15s;
    box-shadow: var(--shadow-sm);
  }
  .refund-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }

  .refund-header {
    background: #F8F9FC;
    border-bottom: 1px solid var(--border);
    padding: 1rem 1.375rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .order-meta { display: flex; align-items: center; gap: 0.875rem; }
  .order-num { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); font-family: 'DM Mono', monospace; }

  .user-chip {
    font-size: 0.7rem;
    color: var(--accent);
    background: var(--accent-light);
    border: 1px solid rgba(67,97,238,0.15);
    padding: 0.18rem 0.6rem;
    border-radius: 6px;
    font-family: 'DM Mono', monospace;
    font-weight: 600;
  }

  .status-chip {
    font-size: 0.68rem;
    font-weight: 700;
    padding: 0.2rem 0.65rem;
    border-radius: 6px;
    background: #FFFBEB;
    color: #D97706;
    border: 1px solid rgba(217,119,6,0.2);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .amount-meta { text-align: right; }
  .amount-big { font-size: 1.25rem; font-weight: 700; color: var(--green); font-family: 'DM Mono', monospace; letter-spacing: -0.02em; }
  .date-small { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; }

  .refund-body { padding: 1.125rem 1.375rem; }

  .items-label {
    font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 0.75rem;
  }

  .item-row {
    display:flex; align-items:center; gap:1.5rem;
    padding:0.5rem 0.75rem;
    margin-bottom: 0.25rem;
    border-radius: var(--radius);
    font-size:0.82rem;
    font-family:'DM Mono','Fira Code',monospace;
    background: #F8F9FC;
    border: 1px solid var(--border);
  }
  .item-prod { color: var(--accent); font-weight: 600; }
  .item-qty { color: var(--text-secondary); }
  .item-subtotal { margin-left: auto; color: var(--green); font-weight: 700; }

  .action-row { display:flex; gap:0.75rem; margin-top:1rem; }
  .action-btn {
    flex:1; padding:0.65rem;
    border-radius:var(--radius-lg);
    font-size:0.83rem; font-weight:700;
    cursor:pointer; transition:all 0.2s;
    border:1px solid; letter-spacing: 0.01em;
  }
  .btn-approve {
    color: #0CAA6E;
    border-color: rgba(12,170,110,0.3);
    background: #EDFAF4;
  }
  .btn-approve:hover:not(:disabled) { background: #D1FAE5; border-color: #0CAA6E; box-shadow: 0 2px 8px rgba(12,170,110,0.2); }
  .btn-reject  {
    color: #DC3545;
    border-color: rgba(220,53,69,0.3);
    background: #FEF2F2;
  }
  .btn-reject:hover:not(:disabled)  { background: #FEE2E2; border-color: #DC3545; box-shadow: 0 2px 8px rgba(220,53,69,0.2); }
  .action-btn:disabled { opacity:0.4; cursor:not-allowed; }

  .loading-wrap { display:flex; gap:0.35rem; align-items:center; justify-content:center; color:var(--text-secondary); font-size:0.83rem; padding:4rem 0; }
  .loading-dot { width:7px; height:7px; border-radius:50%; background:var(--accent); animation:ldot 1.2s ease-in-out infinite; }
  .loading-dot:nth-child(2){animation-delay:0.15s;} .loading-dot:nth-child(3){animation-delay:0.3s;}
  @keyframes ldot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}
`;

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
    <div className="refunds-page">
      <style>{css}</style>

      <div className="page-header">
        <div>
          <div className="page-title">Refund Requests</div>
          <div className="page-sub">Review and process customer cancellation requests</div>
        </div>
        {!loading && data.length > 0 && (
          <span className="count-pill">⏳ {data.length} pending request{data.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>&nbsp;Loading queue…</div>
      ) : data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <div className="empty-title">Queue is clear</div>
          <div className="empty-sub">No pending refund requests at this time. Check back later.</div>
        </div>
      ) : (
        data.map(o => {
          const busy = processing === o.orderId;
          return (
            <div key={o.orderId} className="refund-card">
              <div className="refund-header">
                <div className="order-meta">
                  <span className="order-num">Order #{o.orderId}</span>
                  <span className="user-chip">User #{o.userId}</span>
                  <span className="status-chip">Cancel Requested</span>
                </div>
                <div className="amount-meta">
                  <div className="amount-big">₹{o.totalAmount?.toLocaleString("en-IN")}</div>
                  <div className="date-small">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>

              <div className="refund-body">
                <div className="items-label">Order Items</div>
                {o.items?.map((item, i) => (
                  <div key={i} className="item-row">
                    <span className="item-prod">Product #{item.productId}</span>
                    <span className="item-qty">Qty: {item.quantity}</span>
                    <span className="item-subtotal">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="action-row">
                  <button
                    className="action-btn btn-approve"
                    disabled={busy || o.status !== "CANCEL_REQUESTED"}
                    onClick={() => decide(o.orderId, true)}
                  >
                    {busy ? "Processing…" : "✓ Approve Refund"}
                  </button>
                  <button
                    className="action-btn btn-reject"
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