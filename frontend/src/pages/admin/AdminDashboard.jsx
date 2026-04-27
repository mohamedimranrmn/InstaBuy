import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";

const css = `
  .dash-page { animation: fadeUp 0.3s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  /* ── Header ── */
  .dash-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 1.75rem; flex-wrap: wrap; gap: 0.75rem;
  }
  .dash-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.03em; }
  .dash-sub { font-size: 0.83rem; color: var(--text-secondary); margin-top: 0.25rem; }
  .dash-timestamp { font-size: 0.75rem; color: var(--text-muted); font-family: 'DM Mono', monospace; }

  /* ── Stat grid ── */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 1rem;
    margin-bottom: 1.75rem;
  }

  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 1.25rem 1.375rem 1.125rem;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.18s, transform 0.18s;
    position: relative; overflow: hidden;
  }
  .stat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .stat-card-accent {
    position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }
  .accent-blue  { background: linear-gradient(90deg,#4361EE,#818CF8); }
  .accent-green { background: linear-gradient(90deg,#0CAA6E,#34D399); }
  .accent-amber { background: linear-gradient(90deg,#D97706,#FCD34D); }
  .accent-indigo { background: linear-gradient(90deg,#6366F1,#A5B4FC); }

  .stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.875rem; }
  .stat-label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .stat-icon {
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center; font-size: 0.875rem;
  }
  .si-blue   { background: #EEF2FF; }
  .si-green  { background: #EDFAF4; }
  .si-amber  { background: #FFFBEB; }
  .si-indigo { background: #EEF2FF; }

  .stat-value {
    font-size: 1.875rem; font-weight: 700; line-height: 1;
    letter-spacing: -0.04em; font-family: 'DM Mono', monospace;
    color: var(--text-primary);
  }
  .stat-meta { margin-top: 0.5rem; font-size: 0.72rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem; }
  .live-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #0CAA6E;
    animation: livepulse 2s ease-in-out infinite; flex-shrink: 0;
  }
  @keyframes livepulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.75)} }

  /* ── Bottom grid ── */
  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1.6fr;
    gap: 1.25rem;
    align-items: start;
  }
  @media (max-width: 860px) { .bottom-grid { grid-template-columns: 1fr; } }

  /* ── Panel shell ── */
  .panel {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-sm);
  }
  .panel-header {
    padding: 0.875rem 1.25rem;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .panel-title { font-size: 0.83rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }
  .panel-count {
    font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.55rem;
    border-radius: 20px; background: var(--accent-dim); color: var(--accent);
    border: 1px solid rgba(67,97,238,0.15);
  }

  /* ── Quick links ── */
  .quick-body { padding: 0.5rem; }
  .quick-link {
    display: flex; align-items: center; gap: 0.875rem;
    padding: 0.7rem 0.875rem; border-radius: var(--radius-lg);
    text-decoration: none; color: var(--text-secondary);
    transition: background 0.13s, border-color 0.13s;
    border: 1px solid transparent; margin-bottom: 0.125rem;
  }
  .quick-link:last-child { margin-bottom: 0; }
  .quick-link:hover { background: var(--bg-hover); border-color: var(--border); }
  .ql-icon {
    width: 34px; height: 34px; border-radius: 9px;
    background: var(--bg-base); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; font-size: 0.85rem;
    flex-shrink: 0; transition: background 0.13s, border-color 0.13s;
  }
  .quick-link:hover .ql-icon { background: var(--accent-dim); border-color: rgba(67,97,238,0.2); }
  .ql-text { flex: 1; min-width: 0; }
  .ql-name { font-size: 0.83rem; font-weight: 600; color: var(--text-primary); }
  .ql-desc { font-size: 0.71rem; color: var(--text-muted); margin-top: 1px; }
  .ql-arrow { color: var(--text-muted); font-size: 1rem; }

  /* ── Recent orders ── */
  .orders-body { padding: 0; }
  .order-row {
    display: flex; align-items: center; gap: 0.875rem;
    padding: 0.8rem 1.25rem; border-bottom: 1px solid #F2F4F9;
    transition: background 0.12s;
  }
  .order-row:last-child { border-bottom: none; }
  .order-row:hover { background: #F8F9FC; }
  .order-id { font-family: 'DM Mono', monospace; font-size: 0.78rem; color: var(--accent); font-weight: 600; flex-shrink: 0; width: 64px; }
  .order-info { flex: 1; min-width: 0; }
  .order-name { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .order-date { font-size: 0.71rem; color: var(--text-muted); margin-top: 1px; }
  .order-amount { font-family: 'DM Mono', monospace; font-size: 0.83rem; font-weight: 700; color: var(--text-primary); flex-shrink: 0; }
  .order-status { flex-shrink: 0; }
  .obadge {
    font-size: 0.65rem; font-weight: 700; padding: 0.18rem 0.55rem;
    border-radius: 6px; border: 1px solid; display: inline-flex; align-items: center; gap: 0.25rem;
  }
  .obadge::before { content:''; width:4px; height:4px; border-radius:50%; background:currentColor; }
  .ob-completed { color:#0CAA6E; background:#EDFAF4; border-color:rgba(12,170,110,0.2); }
  .ob-pending   { color:#D97706; background:#FFFBEB; border-color:rgba(217,119,6,0.2); }
  .ob-created   { color:#6366F1; background:#EEF2FF; border-color:rgba(99,102,241,0.2); }
  .ob-cancelled { color:#DC3545; background:#FEF2F2; border-color:rgba(220,53,69,0.2); }
  .ob-default   { color:var(--text-muted); background:var(--bg-base); border-color:var(--border); }

  .empty-orders { padding: 2.5rem; text-align: center; color: var(--text-muted); font-size: 0.83rem; }

  .panel-footer {
    padding: 0.75rem 1.25rem; border-top: 1px solid var(--border);
    background: #F8F9FC;
  }
  .view-all-link {
    font-size: 0.78rem; font-weight: 600; color: var(--accent);
    text-decoration: none; display: flex; align-items: center; gap: 0.3rem;
    transition: gap 0.15s;
  }
  .view-all-link:hover { gap: 0.55rem; }

  /* ── Skeleton ── */
  .stat-skel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px,1fr)); gap: 1rem; margin-bottom: 1.75rem; }
  .skel {
    background: linear-gradient(135deg,#f0f2f8 0%,#e8ecf5 50%,#f0f2f8 100%);
    border: 1px solid var(--border); border-radius: var(--radius-xl);
    height: 116px; position: relative; overflow: hidden;
  }
  .skel::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(90deg,transparent 20%,rgba(255,255,255,0.65) 50%,transparent 80%);
    animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }

  .orders-skel { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .oskel { height: 40px; border-radius: var(--radius-lg); }
`;

const QUICK = [
  { label: "Products",        to: "/admin/products",        icon: "🏷",  desc: "Manage catalog & inventory" },
  { label: "Orders",          to: "/admin/orders",          icon: "📋",  desc: "View and manage all orders" },
  { label: "Refund Requests", to: "/admin/cancel-requests", icon: "↩",   desc: "Process cancellations" },
  { label: "Users",           to: "/admin/users",           icon: "👤",  desc: "Manage user accounts" },
  { label: "Payments",        to: "/admin/payments",        icon: "💳",  desc: "Transaction records" },
];

const statusClass = (s = "") => {
  const u = s.toUpperCase();
  if (u === "COMPLETED") return "ob-completed";
  if (["PAYMENT_PENDING", "INVENTORY_RESERVED"].includes(u)) return "ob-pending";
  if (u === "CREATED") return "ob-created";
  if (["CANCELLED", "REFUNDED"].includes(u)) return "ob-cancelled";
  return "ob-default";
};

const statusLabel = (s = "") => {
  const map = {
    COMPLETED: "Completed",
    PAYMENT_PENDING: "Pending",
    INVENTORY_RESERVED: "Reserved",
    CREATED: "Created",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  };
  return map[s.toUpperCase()] ?? s;
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

export default function AdminDashboard() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow]         = useState(new Date());

  useEffect(() => {
    axios.get("/orders/admin/all")
      .then(res => setOrders(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const completed  = orders.filter(o => o.status?.toUpperCase() === "COMPLETED");
  const pending    = orders.filter(o => ["PAYMENT_PENDING","CREATED","INVENTORY_RESERVED"].includes(o.status?.toUpperCase()));
  const revenue    = completed.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const recent     = [...orders].sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)).slice(0, 6);

  const CARDS = [
    { label: "Total Orders", value: orders.length,    accent: "accent-blue",   icon: "📦", iconCls: "si-blue",   meta: "all time" },
    { label: "Completed",    value: completed.length, accent: "accent-green",  icon: "✓",  iconCls: "si-green",  meta: `${orders.length ? Math.round(completed.length/orders.length*100) : 0}% of orders` },
    { label: "Pending",      value: pending.length,   accent: "accent-amber",  icon: "⏳", iconCls: "si-amber",  meta: "need attention" },
    { label: "Revenue",      value: `₹${revenue.toLocaleString("en-IN")}`, accent: "accent-indigo", icon: "₹", iconCls: "si-indigo", meta: "from completed" },
  ];

  return (
    <div className="dash-page">
      <style>{css}</style>

      <div className="dash-header">
        <div>
          <div className="dash-title">Dashboard</div>
          <div className="dash-sub">Here's what's happening with your store.</div>
        </div>
        <div className="dash-timestamp">
          {now.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" })}
          {" · "}
          {now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="stat-skel-grid">{[1,2,3,4].map(i => <div key={i} className="skel"/>)}</div>
      ) : (
        <div className="stat-grid">
          {CARDS.map(c => (
            <div key={c.label} className="stat-card">
              <div className={`stat-card-accent ${c.accent}`}/>
              <div className="stat-top">
                <div className="stat-label">{c.label}</div>
                <div className={`stat-icon ${c.iconCls}`}>{c.icon}</div>
              </div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-meta">
                <div className="live-dot"/>
                {c.meta}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom section */}
      <div className="bottom-grid">

        {/* Quick access */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              ⚡ Quick Access
            </div>
            <span className="panel-count">{QUICK.length} sections</span>
          </div>
          <div className="quick-body">
            {QUICK.map(q => (
              <Link key={q.to} to={q.to} className="quick-link">
                <div className="ql-icon">{q.icon}</div>
                <div className="ql-text">
                  <div className="ql-name">{q.label}</div>
                  <div className="ql-desc">{q.desc}</div>
                </div>
                <span className="ql-arrow">›</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🕐 Recent Orders</div>
            {!loading && <span className="panel-count">{orders.length} total</span>}
          </div>

          <div className="orders-body">
            {loading ? (
              <div className="orders-skel">
                {[1,2,3,4,5].map(i => <div key={i} className="skel oskel"/>)}
              </div>
            ) : recent.length === 0 ? (
              <div className="empty-orders">No orders yet</div>
            ) : (
              recent.map(o => (
                <div className="order-row" key={o.orderId ?? o.id}>
                  <span className="order-id">#{o.orderId ?? o.id}</span>
                  <div className="order-info">
                    <div className="order-name">{o.customerName ?? o.userName ?? "Customer"}</div>
                    <div className="order-date">{fmtDate(o.createdAt)}</div>
                  </div>
                  <span className="order-amount">₹{(o.totalAmount ?? 0).toLocaleString("en-IN")}</span>
                  <div className="order-status">
                    <span className={`obadge ${statusClass(o.status)}`}>{statusLabel(o.status)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && orders.length > 0 && (
            <div className="panel-footer">
              <Link to="/admin/orders" className="view-all-link">
                View all orders ›
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}