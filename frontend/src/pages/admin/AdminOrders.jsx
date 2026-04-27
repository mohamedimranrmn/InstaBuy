import { useEffect, useState } from "react";
import axios from "../../api/axios";

const css = `
  .orders-page { animation: fadeUp 0.35s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  .page-header { margin-bottom: 1.5rem; display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
  .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.83rem; color: var(--text-secondary); margin-top: 0.3rem; }
  .page-count-pill {
    display: inline-flex; align-items:center; gap:0.35rem;
    background: var(--accent-dim); color: var(--accent);
    border: 1px solid rgba(67,97,238,0.15);
    padding: 0.3rem 0.875rem; border-radius: 20px;
    font-size: 0.78rem; font-weight: 600;
  }

  .filter-bar { display: flex; gap: 0.375rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .filter-pill {
    padding: 0.325rem 0.875rem;
    border-radius: 8px;
    font-size: 0.765rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-secondary);
    transition: all 0.15s;
    box-shadow: var(--shadow-xs);
  }
  .filter-pill:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .filter-pill.active { background: var(--accent); border-color: var(--accent); color: #fff; box-shadow: 0 2px 8px rgba(67,97,238,0.25); }

  .panel {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th {
    padding: 0.8rem 1.125rem;
    text-align: left;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    background: #F8F9FC;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  .data-table td {
    padding: 0.875rem 1.125rem;
    font-size: 0.845rem;
    border-bottom: 1px solid #F2F4F9;
    vertical-align: middle;
    color: var(--text-primary);
  }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tbody tr:hover td { background: #F8F9FC; }

  .mono { font-family: 'DM Mono', 'Fira Code', monospace; font-size: 0.82rem; }
  .id-accent { color: var(--accent); font-weight: 600; }
  .id-muted { color: var(--text-secondary); }
  .amount-green { color: var(--green); font-weight: 700; }
  .date-muted { color: var(--text-secondary); font-size: 0.78rem; }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.22rem 0.65rem;
    border-radius: 6px;
    font-size: 0.69rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    white-space: nowrap;
    border: 1px solid;
  }
  .badge::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
  .badge-COMPLETED       { color:#0CAA6E; background:#EDFAF4; border-color:rgba(12,170,110,0.2); }
  .badge-FAILED          { color:#DC3545; background:#FEF2F2; border-color:rgba(220,53,69,0.2); }
  .badge-PAYMENT_PENDING,
  .badge-CREATED         { color:#D97706; background:#FFFBEB; border-color:rgba(217,119,6,0.2); }
  .badge-INVENTORY_RESERVED { color:#4361EE; background:#EEF2FF; border-color:rgba(67,97,238,0.2); }
  .badge-CANCELLED       { color:#6B7280; background:#F9FAFB; border-color:#E5E7EB; }
  .badge-CANCEL_REQUESTED{ color:#D97706; background:#FFFBEB; border-color:rgba(217,119,6,0.3); }
  .badge-REFUNDED        { color:#0CAA6E; background:#EDFAF4; border-color:rgba(12,170,110,0.2); }
  .badge-REFUND_PENDING  { color:#D97706; background:#FFFBEB; border-color:rgba(217,119,6,0.2); }
  .badge-REFUND_REJECTED { color:#DC3545; background:#FEF2F2; border-color:rgba(220,53,69,0.2); }

  .tbl-btn {
    padding: 0.3rem 0.75rem;
    border-radius: 6px;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid;
    transition: all 0.15s;
    margin-right: 0.25rem;
    white-space: nowrap;
  }
  .btn-view    { color:#4361EE; border-color:rgba(67,97,238,0.25); background:#EEF2FF; }
  .btn-view:hover { background:#E0E7FF; border-color:rgba(67,97,238,0.4); }
  .btn-approve { color:#0CAA6E; border-color:rgba(12,170,110,0.25); background:#EDFAF4; }
  .btn-approve:hover { background:#D1FAE5; border-color:rgba(12,170,110,0.4); }
  .btn-reject  { color:#DC3545; border-color:rgba(220,53,69,0.25); background:#FEF2F2; }
  .btn-reject:hover  { background:#FEE2E2; border-color:rgba(220,53,69,0.4); }
  .tbl-btn:disabled { opacity:0.4; cursor:not-allowed; }

  .expand-row td { padding: 0 1.125rem 1rem; background: #F8F9FC; }
  .expand-inner {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1rem 1.125rem;
    box-shadow: var(--shadow-xs);
  }
  .expand-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 0.75rem; }
  .item-row { display:flex; gap:2rem; font-size:0.8rem; padding:0.45rem 0; border-bottom:1px solid var(--border); font-family:'DM Mono','Fira Code',monospace; }
  .item-row:last-child { border-bottom:none; }

  .no-records { color: var(--text-secondary); font-size: 0.845rem; padding: 4rem; text-align: center; }

  .loading-wrap { display:flex; gap:0.35rem; align-items:center; justify-content:center; color:var(--text-secondary); font-size:0.83rem; padding:4rem 0; }
  .loading-dot { width:7px; height:7px; border-radius:50%; background:var(--accent); animation:ldot 1.2s ease-in-out infinite; }
  .loading-dot:nth-child(2){animation-delay:0.15s;} .loading-dot:nth-child(3){animation-delay:0.3s;}
  @keyframes ldot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}

  .pagination { display:flex; justify-content:center; gap:0.375rem; padding:1rem; border-top:1px solid var(--border); background:#F8F9FC; }
  .page-btn {
    width:34px; height:34px; border-radius:var(--radius);
    border:1px solid var(--border); background:var(--bg-card);
    color:var(--text-secondary); cursor:pointer; font-size:0.8rem;
    transition:all 0.15s; display:flex; align-items:center; justify-content:center;
    font-family:'DM Mono',monospace; box-shadow:var(--shadow-xs);
  }
  .page-btn:hover:not(:disabled) { border-color:var(--accent); color:var(--accent); background:var(--accent-light); }
  .page-btn.active { background:var(--accent); border-color:var(--accent); color:#fff; box-shadow:0 2px 6px rgba(67,97,238,0.25); }
  .page-btn:disabled { opacity:0.3; cursor:not-allowed; }
`;

const FILTERS = ["ALL", "COMPLETED", "PAYMENT_PENDING", "FAILED", "CANCELLED", "CANCEL_REQUESTED", "REFUNDED"];

function Badge({ status }) {
  return <span className={`badge badge-${status?.toUpperCase()}`}>{status?.replace(/_/g, " ")}</span>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const load = () => {
    setLoading(true);
    axios.get("/orders/admin/all")
      .then(res => setOrders(res.data.sort((a, b) => b.orderId - a.orderId)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const decide = async (id, approve) => {
    setProcessing(id);
    try { await axios.post(`/orders/refund-decision/${id}?approve=${approve}`); load(); }
    finally { setProcessing(null); }
  };

  const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const countOf = f => f === "ALL" ? orders.length : orders.filter(o => o.status === f).length;

  return (
    <div className="orders-page">
      <style>{css}</style>

      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-sub">Manage and track all customer orders</div>
        </div>
        {!loading && <span className="page-count-pill">📋 {orders.length} total records</span>}
      </div>

      <div className="filter-bar">
        {FILTERS.map(f => (
          <button key={f} className={`filter-pill${filter === f ? " active" : ""}`}
            onClick={() => { setFilter(f); setCurrentPage(1); }}>
            {f.replace(/_/g, " ")} · {countOf(f)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>&nbsp;Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div className="no-records">No orders found for the selected filter.</div>
      ) : (
        <div className="panel">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  {["Order ID", "User ID", "Status", "Total", "Date", "Items", "Actions"].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {paginated.map(o => {
                  const isCR = o.status === "CANCEL_REQUESTED";
                  const busy = processing === o.orderId;
                  const open = expanded === o.orderId;
                  return (
                    <>
                      <tr key={o.orderId}>
                        <td><span className="mono id-accent">#{o.orderId}</span></td>
                        <td><span className="mono id-muted">#{o.userId}</span></td>
                        <td><Badge status={o.status} /></td>
                        <td><span className="mono amount-green">₹{o.totalAmount?.toLocaleString("en-IN")}</span></td>
                        <td><span className="date-muted">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></td>
                        <td>
                          <button className="tbl-btn btn-view" onClick={() => setExpanded(open ? null : o.orderId)}>
                            {open ? "▲ Hide" : "▼ Items"}
                          </button>
                        </td>
                        <td>
                          {isCR ? (
                            <>
                              <button className="tbl-btn btn-approve" disabled={busy} onClick={() => decide(o.orderId, true)}>{busy ? "…" : "✓ Approve"}</button>
                              <button className="tbl-btn btn-reject"  disabled={busy} onClick={() => decide(o.orderId, false)}>{busy ? "…" : "✕ Reject"}</button>
                            </>
                          ) : <span style={{ color:"var(--text-muted)", fontSize:"0.8rem" }}>—</span>}
                        </td>
                      </tr>
                      {open && (
                        <tr key={`${o.orderId}-exp`} className="expand-row">
                          <td colSpan={7}>
                            <div className="expand-inner">
                              <div className="expand-label">Order Items</div>
                              {o.items?.map((item, i) => (
                                <div key={i} className="item-row">
                                  <span style={{ color:"var(--accent)" }}>Product #{item.productId}</span>
                                  <span style={{ color:"var(--text-secondary)" }}>Qty: {item.quantity}</span>
                                  <span style={{ color:"var(--text-secondary)" }}>Unit: ₹{item.price?.toLocaleString("en-IN")}</span>
                                  <span style={{ marginLeft:"auto", color:"var(--green)", fontWeight:700 }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                </div>
                              ))}
                              {o.failureReason && (
                                <div style={{ color:"var(--red)", marginTop:"0.625rem", fontSize:"0.78rem", padding:"0.5rem", background:"var(--red-bg)", borderRadius:"6px", border:"1px solid var(--red-border)" }}>⚠ {o.failureReason}</div>
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
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>‹</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={`page-btn${currentPage === i+1 ? " active" : ""}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
              ))}
              <button className="page-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}