import { useEffect, useState } from "react";
import axios from "../../api/axios";

const css = `
  .payments-page { animation: fadeUp 0.35s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  .page-header { margin-bottom: 1.5rem; display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
  .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.83rem; color: var(--text-secondary); margin-top: 0.3rem; }

  .stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(185px,1fr)); gap:1rem; margin-bottom:1.5rem; }
  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 1.25rem 1.375rem;
    transition: box-shadow 0.2s, transform 0.15s;
    box-shadow: var(--shadow-sm);
    position: relative; overflow: hidden;
  }
  .stat-card::after {
    content: '';
    position: absolute; top:0; left:0; right:0; height:3px;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }
  .stat-card.blue::after  { background: linear-gradient(90deg, #4361EE, #7B8FF7); }
  .stat-card.green::after { background: linear-gradient(90deg, #0CAA6E, #34D399); }
  .stat-card.red::after   { background: linear-gradient(90deg, #DC3545, #F87171); }
  .stat-card.amber::after { background: linear-gradient(90deg, #D97706, #FBBF24); }
  .stat-card:hover { box-shadow: var(--shadow-md); transform:translateY(-2px); }
  .stat-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.875rem; }
  .stat-label { font-size:0.75rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.04em; }
  .stat-icon { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:0.95rem; }
  .stat-icon.blue  { background:#EEF2FF; }
  .stat-icon.green { background:#EDFAF4; }
  .stat-icon.red   { background:#FEF2F2; }
  .stat-icon.amber { background:#FFFBEB; }
  .stat-value { font-size:1.85rem; font-weight:700; line-height:1; letter-spacing:-0.04em; font-family:'DM Mono',monospace; }
  .stat-value.blue  { color:#4361EE; }
  .stat-value.green { color:#0CAA6E; }
  .stat-value.red   { color:#DC3545; }
  .stat-value.amber { color:#D97706; }

  .filter-bar { display:flex; gap:0.375rem; flex-wrap:wrap; margin-bottom:1.25rem; }
  .filter-pill {
    padding:0.325rem 0.875rem; border-radius:8px; font-size:0.765rem; font-weight:500;
    cursor:pointer; border:1px solid var(--border); background:var(--bg-card);
    color:var(--text-secondary); transition:all 0.15s; box-shadow:var(--shadow-xs);
  }
  .filter-pill:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-light); }
  .filter-pill.active { background:var(--accent); border-color:var(--accent); color:#fff; box-shadow:0 2px 8px rgba(67,97,238,0.25); }

  .panel { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-xl); overflow:hidden; box-shadow:var(--shadow-sm); }
  .data-table { width:100%; border-collapse:collapse; }
  .data-table th {
    padding:0.8rem 1.125rem; text-align:left; font-size:0.72rem; font-weight:700;
    text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted);
    background:#F8F9FC; border-bottom:1px solid var(--border); white-space:nowrap;
  }
  .data-table td {
    padding:0.875rem 1.125rem; font-size:0.845rem;
    border-bottom:1px solid #F2F4F9; vertical-align:middle; color:var(--text-primary);
  }
  .data-table tr:last-child td { border-bottom:none; }
  .data-table tbody tr:hover td { background:#F8F9FC; }

  .mono { font-family:'DM Mono','Fira Code',monospace; font-size:0.82rem; }
  .id-muted { color:var(--text-secondary); }
  .id-accent { color:var(--accent); font-weight:600; }
  .amount-green { color:var(--green); font-weight:700; }

  .badge { display:inline-flex; align-items:center; gap:0.3rem; padding:0.22rem 0.65rem; border-radius:6px; font-size:0.69rem; font-weight:700; letter-spacing:0.01em; border:1px solid; }
  .badge::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
  .badge-SUCCESS  { color:#0CAA6E; background:#EDFAF4; border-color:rgba(12,170,110,0.2); }
  .badge-INITIATED{ color:#D97706; background:#FFFBEB; border-color:rgba(217,119,6,0.2); }
  .badge-FAILED   { color:#DC3545; background:#FEF2F2; border-color:rgba(220,53,69,0.2); }
  .badge-REFUNDED { color:#4361EE; background:#EEF2FF; border-color:rgba(67,97,238,0.2); }
  .badge-REVERSED { color:#D97706; background:#FFFBEB; border-color:rgba(217,119,6,0.2); }

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
  .no-records { color:var(--text-secondary); font-size:0.845rem; padding:4rem; text-align:center; }
`;

const FILTERS = ["ALL", "SUCCESS", "INITIATED", "FAILED", "REFUNDED", "REVERSED"];

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    axios.get("/payments/all").then(res => setPayments(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? payments : payments.filter(p => p.status === filter);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const countOf = f => f === "ALL" ? payments.length : payments.filter(p => p.status === f).length;
  const revenue = payments.filter(p => p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0);

  const STATS = [
    { label: "Total Payments", value: payments.length, color: "blue",  icon: "💳" },
    { label: "Successful",     value: payments.filter(p => p.status === "SUCCESS").length, color: "green", icon: "✓" },
    { label: "Failed",         value: payments.filter(p => p.status === "FAILED").length,  color: "red",   icon: "✕" },
    { label: "Revenue",        value: `₹${revenue.toLocaleString("en-IN")}`, color: "amber", icon: "₹" },
  ];

  return (
    <div className="payments-page">
      <style>{css}</style>

      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-sub">All transactions across the platform</div>
        </div>
      </div>

      <div className="stat-grid">
        {STATS.map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-top">
              <div className="stat-label">{s.label}</div>
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            </div>
            <div className={`stat-value ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        {FILTERS.map(f => (
          <button key={f} className={`filter-pill${filter === f ? " active" : ""}`}
            onClick={() => { setFilter(f); setCurrentPage(1); }}>
            {f} · {countOf(f)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>&nbsp;Loading transactions…</div>
      ) : filtered.length === 0 ? (
        <div className="no-records">No transactions found</div>
      ) : (
        <div className="panel">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>{["Payment ID","Order ID","Amount","Status","Transaction ID"].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {paginated.map(p => (
                  <tr key={p.paymentId || p.id}>
                    <td><span className="mono id-muted">#{p.paymentId || p.id}</span></td>
                    <td><span className="mono id-accent">#{p.orderId}</span></td>
                    <td><span className="mono amount-green">₹{p.amount?.toLocaleString("en-IN")}</span></td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td><span className="mono id-muted">{p.transactionId || "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setCurrentPage(p => p-1)} disabled={currentPage===1}>‹</button>
              {[...Array(totalPages)].map((_,i) => (
                <button key={i} className={`page-btn${currentPage===i+1?" active":""}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
              ))}
              <button className="page-btn" onClick={() => setCurrentPage(p => p+1)} disabled={currentPage===totalPages}>›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}