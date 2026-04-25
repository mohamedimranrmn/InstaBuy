import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { ADMIN_BASE_CSS } from "./adminStyles";

const FILTERS = ["ALL", "COMPLETED", "PAYMENT_PENDING", "FAILED", "CANCELLED", "CANCEL_REQUESTED", "REFUNDED"];

const BADGE_MAP = {
  COMPLETED: "adm-badge-green",
  FAILED: "adm-badge-red",
  PAYMENT_PENDING: "adm-badge-amber",
  CREATED: "adm-badge-amber",
  INVENTORY_RESERVED: "adm-badge-blue",
  CANCELLED: "adm-badge-gray",
  CANCEL_REQUESTED: "adm-badge-amber",
  REFUNDED: "adm-badge-green",
  REFUND_PENDING: "adm-badge-amber",
  REFUND_REJECTED: "adm-badge-red",
};

function StatusBadge({ status }) {
  const cls = BADGE_MAP[status?.toUpperCase()] || "adm-badge-gray";
  return <span className={`adm-badge ${cls}`}>{status?.replace(/_/g, " ")}</span>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [processing, setProcessing] = useState(null);

  const load = () => {
    setLoading(true);
    axios.get("/orders/admin/all")
      .then(res => setOrders(res.data.sort((a, b) => b.orderId - a.orderId)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const decide = async (id, approve) => {
    setProcessing(id);
    try {
      await axios.post(`/orders/refund-decision/${id}?approve=${approve}`);
      load();
    }
    finally { setProcessing(null); }
  };

  const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);
  const countOf = f => f === "ALL" ? orders.length : orders.filter(o => o.status === f).length;

  return (
    <div className="adm-page">
      <style>{ADMIN_BASE_CSS}</style>

      {/* Card Styles */}
      <style>{`
        .adm-cards-wrap {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .adm-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          transition: all 0.2s ease;
        }

        .adm-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent-blue);
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }

        .adm-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .adm-order-id {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--accent-blue);
          font-family: 'JetBrains Mono', monospace;
        }

        .adm-user-id {
          font-size: 0.72rem;
          color: #888078;
        }

        .adm-divider {
          height: 1px;
          background: var(--border);
          opacity: 0.6;
        }

        .adm-meta {
          display: flex;
          justify-content: space-between;
        }

        .adm-label {
          font-size: 0.65rem;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .adm-value {
          font-size: 0.85rem;
        }

        .adm-price {
          font-weight: 700;
          color: var(--accent-green);
        }

        .adm-items {
          border-top: 1px solid var(--border);
          padding-top: 0.5rem;
        }

        .adm-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.3rem 0;
        }

        .adm-item-left {
          display: flex;
          flex-direction: column;
        }

        .adm-prod {
          font-size: 0.78rem;
          font-weight: 500;
        }

        .adm-qty {
          font-size: 0.68rem;
          color: var(--text-secondary);
        }

        .adm-item-right {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .adm-error {
          background: rgba(244,63,94,0.08);
          border: 1px solid rgba(244,63,94,0.2);
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          font-size: 0.72rem;
          color: #f87171;
        }

        .adm-card-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.4rem;
          margin-top: 0.4rem;
        }

        .adm-muted {
          font-size: 0.7rem;
          color: #aaa;
        }
      `}</style>

      <div className="adm-eyebrow">Order Management</div>
      <h1 className="adm-title">All Orders</h1>
      <p className="adm-sub">{loading ? "Loading…" : `${orders.length} total records`}</p>
      <hr className="adm-rule" />

      <div className="adm-filters">
        {FILTERS.map(f => (
          <button key={f} className={`adm-filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
            {f.replace(/_/g, " ")} ({countOf(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="adm-loading">Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">No records found.</div>
      ) : (
        <div className="adm-cards-wrap">
          {filtered.map(o => {
            const isCR = o.status === "CANCEL_REQUESTED";
            const busy = processing === o.orderId;

            return (
              <div key={o.orderId} className="adm-card">

                {/* Header */}
                <div className="adm-card-header">
                  <div>
                    <div className="adm-order-id">#{o.orderId}</div>
                    <div className="adm-user-id">User #{o.userId}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                {/* Divider */}
                <div className="adm-divider" />

                {/* Meta Info */}
                <div className="adm-meta">
                  <div>
                    <div className="adm-label">Total</div>
                    <div className="adm-value adm-price">
                      ₹{o.totalAmount?.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div>
                    <div className="adm-label">Date</div>
                    <div className="adm-value">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="adm-items">
                  {o.items?.map((item, i) => (
                    <div key={i} className="adm-item">
                      <div className="adm-item-left">
                        <div className="adm-prod">Product #{item.productId}</div>
                        <div className="adm-qty">Qty: {item.quantity}</div>
                      </div>
                      <div className="adm-item-right">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Failure */}
                {o.failureReason && (
                  <div className="adm-error">
                    ⚠ {o.failureReason}
                  </div>
                )}

                {/* Actions */}
                <div className="adm-card-actions">
                  {isCR ? (
                    <>
                      <button
                        className="adm-btn adm-btn-green"
                        disabled={busy}
                        onClick={() => decide(o.orderId, true)}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="adm-btn adm-btn-red"
                        disabled={busy}
                        onClick={() => decide(o.orderId, false)}
                      >
                        ✕ Reject
                      </button>
                    </>
                  ) : (
                    <span className="adm-muted">No actions</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}