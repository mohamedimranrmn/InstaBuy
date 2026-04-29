import { useEffect, useState } from "react";
import axios from "../../api/axios";

const INTERNAL_KEY = "0aK4VOyO5dOwBEBjJG6+cbio1ENbTNYVqi0elOkWnvo=";
const INTERNAL_HEADERS = { "X-Internal-Key": INTERNAL_KEY, "Content-Type": "application/json" };

const extractError = (err, fallback) => {
  if (err?.response) {
    const { status, data } = err.response;
    const detail = data?.message || data?.error || data?.detail || (typeof data === "string" ? data : null);
    return detail ? `[${status}] ${detail}` : `[${status}] ${fallback}`;
  }
  if (err?.request) return "No response from server — check backend is running";
  return fallback;
};

const css = `
  .products-page { animation: fadeUp 0.35s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  .page-header { margin-bottom: 1.5rem; display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
  .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.83rem; color: var(--text-secondary); margin-top: 0.3rem; }

  .toolbar { display:flex; gap:0.875rem; margin-bottom:1.125rem; align-items:center; flex-wrap:wrap; }
  .search-wrap { position:relative; flex:1; min-width:200px; max-width:320px; }
  .search-icon { position:absolute; left:0.875rem; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:1rem; pointer-events:none; }
  .search-input {
    width:100%; padding:0.575rem 0.875rem 0.575rem 2.5rem;
    background:var(--bg-card); border:1px solid var(--border);
    border-radius:var(--radius-lg); color:var(--text-primary);
    font-size:0.845rem; outline:none; transition:border-color 0.15s, box-shadow 0.15s;
    box-shadow: var(--shadow-xs); font-family:'DM Sans',sans-serif;
  }
  .search-input::placeholder { color:var(--text-muted); }
  .search-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(67,97,238,0.1); }

  .view-tabs { display:flex; gap:0.3rem; margin-left:auto; }
  .view-tab {
    padding:0.375rem 0.875rem; border-radius:8px; font-size:0.765rem; font-weight:500;
    cursor:pointer; border:1px solid var(--border); background:var(--bg-card);
    color:var(--text-secondary); transition:all 0.15s; box-shadow:var(--shadow-xs);
  }
  .view-tab:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-light); }
  .view-tab.tab-all     { background:var(--accent); border-color:var(--accent); color:#fff; }
  .view-tab.tab-active  { background:#EDFAF4; border-color:rgba(12,170,110,0.3); color:#0CAA6E; }
  .view-tab.tab-deleted { background:#FEF2F2; border-color:rgba(220,53,69,0.3); color:#DC3545; }

  .add-btn {
    padding:0.575rem 1.25rem;
    border-radius:var(--radius-lg); border:none;
    background: var(--accent); color:#fff;
    font-size:0.845rem; font-weight:700; cursor:pointer;
    transition:all 0.15s; white-space:nowrap;
    box-shadow: 0 2px 8px rgba(67,97,238,0.25); font-family:'DM Sans',sans-serif;
    display:flex; align-items:center; gap:0.4rem;
  }
  .add-btn:hover { background:var(--accent-hover); box-shadow:0 4px 12px rgba(67,97,238,0.35); transform:translateY(-1px); }

  .legend { display:flex; gap:1.25rem; margin-bottom:0.875rem; flex-wrap:wrap; }
  .legend-item { display:flex; align-items:center; gap:0.4rem; font-size:0.74rem; color:var(--text-secondary); font-weight:500; }
  .legend-dot { width:8px; height:8px; border-radius:3px; flex-shrink:0; }
  .legend-dot.amber { background:#D97706; }
  .legend-dot.green { background:#0CAA6E; }
  .legend-dot.red   { background:#DC3545; }

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
  .data-table tr.row-deleted td { opacity:0.5; }

  .mono { font-family:'DM Mono','Fira Code',monospace; font-size:0.82rem; }
  .id-accent { color:var(--accent); font-weight:600; }
  .price-green { color:var(--green); font-weight:700; }

  .status-badge { display:inline-flex; align-items:center; gap:0.25rem; font-size:0.69rem; font-weight:700; padding:0.22rem 0.65rem; border-radius:6px; border:1px solid; }
  .status-badge::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
  .status-active  { color:#0CAA6E; background:#EDFAF4; border-color:rgba(12,170,110,0.2); }
  .status-deleted { color:#DC3545; background:#FEF2F2; border-color:rgba(220,53,69,0.2); }

  .actions-cell { display:flex; align-items:center; gap:0.375rem; flex-wrap:nowrap; }
  .tbl-btn {
    padding:0.3rem 0.7rem; border-radius:6px; font-size:0.72rem;
    font-weight:600; cursor:pointer; border:1px solid;
    transition:all 0.15s; white-space:nowrap; font-family:'DM Sans',sans-serif;
  }
  .tbl-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .btn-soft    { color:#D97706; border-color:rgba(217,119,6,0.25); background:#FFFBEB; }
  .btn-soft:hover:not(:disabled)    { background:#FEF3C7; border-color:#D97706; }
  .btn-restore { color:#0CAA6E; border-color:rgba(12,170,110,0.25); background:#EDFAF4; }
  .btn-restore:hover:not(:disabled) { background:#D1FAE5; border-color:#0CAA6E; }
  .btn-delete  { color:#DC3545; border-color:rgba(220,53,69,0.25); background:#FEF2F2; }
  .btn-delete:hover:not(:disabled)  { background:#FEE2E2; border-color:#DC3545; }
  .btn-divider { width:1px; height:18px; background:var(--border); flex-shrink:0; }

  .toast-bar {
    padding:0.75rem 1rem; border-radius:var(--radius-lg); font-size:0.83rem;
    font-weight:600; margin-bottom:1rem; border:1px solid;
    display:flex; align-items:center; gap:0.625rem; box-shadow:var(--shadow-sm);
  }
  .toast-success { background:#EDFAF4; border-color:rgba(12,170,110,0.25); color:#0CAA6E; }
  .toast-error   { background:#FEF2F2; border-color:rgba(220,53,69,0.25); color:#DC3545; }

  .loading-wrap { display:flex; gap:0.35rem; align-items:center; justify-content:center; color:var(--text-secondary); font-size:0.83rem; padding:4rem 0; }
  .loading-dot { width:7px; height:7px; border-radius:50%; background:var(--accent); animation:ldot 1.2s ease-in-out infinite; }
  .loading-dot:nth-child(2){animation-delay:0.15s;} .loading-dot:nth-child(3){animation-delay:0.3s;}
  @keyframes ldot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}

  .empty-note { color:var(--text-secondary); font-size:0.845rem; padding:4rem; text-align:center; }

  .pagination { display:flex; justify-content:center; align-items:center; gap:0.375rem; padding:1rem; border-top:1px solid var(--border); background:#F8F9FC; }
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

  /* ── MODAL ── */
  .modal-backdrop {
    position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(3px);
    display:flex; align-items:center; justify-content:center;
    z-index:9999; padding:1rem;
    animation: backdropIn 0.18s ease;
  }
  @keyframes backdropIn { from { opacity:0 } to { opacity:1 } }

  .modal-card {
    background:var(--bg-card); border:1px solid var(--border);
    border-radius:var(--radius-xl); box-shadow:0 24px 64px rgba(0,0,0,0.18);
    width:100%; max-width:460px;
    animation: modalSlideIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
    overflow:hidden;
  }
  @keyframes modalSlideIn { from { opacity:0; transform:scale(0.94) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }

  .modal-header {
    padding:1.25rem 1.5rem 0;
    display:flex; align-items:flex-start; justify-content:space-between; gap:1rem;
  }
  .modal-title-row { display:flex; align-items:center; gap:0.625rem; }
  .modal-icon {
    width:36px; height:36px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:1rem; flex-shrink:0;
  }
  .modal-icon-edit    { background:#EEF2FF; color:var(--accent); }
  .modal-icon-stock   { background:#EDFAF4; color:#0CAA6E; }
  .modal-icon-danger  { background:#FEF2F2; color:#DC3545; }

  .modal-title { font-size:1rem; font-weight:700; color:var(--text-primary); }
  .modal-subtitle { font-size:0.77rem; color:var(--text-secondary); margin-top:0.15rem; }

  .modal-close {
    width:30px; height:30px; border-radius:8px;
    border:1px solid var(--border); background:transparent;
    color:var(--text-muted); cursor:pointer; font-size:1rem;
    display:flex; align-items:center; justify-content:center;
    transition:all 0.15s; flex-shrink:0;
  }
  .modal-close:hover { background:var(--bg-base); color:var(--text-primary); }

  .modal-body { padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:1rem; }

  .modal-field { display:flex; flex-direction:column; gap:0.375rem; }
  .modal-label { font-size:0.72rem; font-weight:600; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em; }
  .modal-input {
    padding:0.625rem 0.875rem;
    background:var(--bg-base); border:1.5px solid var(--border);
    border-radius:var(--radius-lg); color:var(--text-primary);
    font-size:0.875rem; outline:none; transition:border-color 0.15s, box-shadow 0.15s;
    font-family:'DM Sans',sans-serif; width:100%; box-sizing:border-box;
  }
  .modal-input::placeholder { color:var(--text-muted); }
  .modal-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(67,97,238,0.1); background:var(--bg-card); }
  .modal-input-danger:focus { border-color:#DC3545; box-shadow:0 0 0 3px rgba(220,53,69,0.1); }

  .stock-controls { display:flex; gap:0.625rem; align-items:center; }
  .stock-direction-btn {
    flex:1; padding:0.625rem; border-radius:var(--radius-lg); border:1.5px solid;
    font-size:0.8rem; font-weight:600; cursor:pointer; transition:all 0.15s;
    font-family:'DM Sans',sans-serif; text-align:center;
  }
  .stock-dir-increase { border-color:rgba(12,170,110,0.3); background:#EDFAF4; color:#0CAA6E; }
  .stock-dir-increase.selected,
  .stock-dir-increase:hover { background:#0CAA6E; color:#fff; border-color:#0CAA6E; }
  .stock-dir-decrease { border-color:rgba(220,53,69,0.3); background:#FEF2F2; color:#DC3545; }
  .stock-dir-decrease.selected,
  .stock-dir-decrease:hover { background:#DC3545; color:#fff; border-color:#DC3545; }

  .modal-product-chip {
    display:inline-flex; align-items:center; gap:0.5rem;
    background:var(--bg-base); border:1px solid var(--border);
    border-radius:8px; padding:0.5rem 0.875rem;
    font-size:0.8rem; color:var(--text-secondary);
  }
  .modal-product-chip strong { color:var(--text-primary); font-weight:600; }
  .modal-product-chip .chip-badge {
    font-family:'DM Mono',monospace; font-size:0.72rem;
    color:var(--accent); font-weight:600;
  }

  .modal-divider { height:1px; background:var(--border); margin:0 -1.5rem; }

  .modal-footer {
    padding:1rem 1.5rem;
    display:flex; gap:0.625rem; justify-content:flex-end;
    background:#F8F9FC; border-top:1px solid var(--border);
  }
  .modal-btn {
    padding:0.575rem 1.25rem; border-radius:var(--radius-lg);
    font-size:0.845rem; font-weight:700; cursor:pointer;
    transition:all 0.15s; font-family:'DM Sans',sans-serif; border:1px solid;
  }
  .modal-btn-cancel { background:var(--bg-card); border-color:var(--border); color:var(--text-secondary); }
  .modal-btn-cancel:hover { border-color:var(--text-muted); color:var(--text-primary); }
  .modal-btn-primary { background:var(--accent); border-color:var(--accent); color:#fff; box-shadow:0 2px 8px rgba(67,97,238,0.25); }
  .modal-btn-primary:hover { background:var(--accent-hover); box-shadow:0 4px 12px rgba(67,97,238,0.3); transform:translateY(-1px); }
  .modal-btn-danger { background:#DC3545; border-color:#DC3545; color:#fff; box-shadow:0 2px 8px rgba(220,53,69,0.25); }
  .modal-btn-danger:hover { background:#B91C1C; box-shadow:0 4px 12px rgba(220,53,69,0.3); transform:translateY(-1px); }
  .modal-btn-green { background:#0CAA6E; border-color:#0CAA6E; color:#fff; box-shadow:0 2px 8px rgba(12,170,110,0.25); }
  .modal-btn-green:hover { background:#059B63; transform:translateY(-1px); }
  .modal-btn:disabled { opacity:0.4; cursor:not-allowed; transform:none !important; }

  .danger-text { font-size:0.83rem; color:var(--text-secondary); line-height:1.55; }
  .danger-text strong { color:#DC3545; }

  .current-stock-display {
    display:flex; align-items:center; justify-content:space-between;
    padding:0.625rem 0.875rem; background:var(--bg-base);
    border:1px solid var(--border); border-radius:var(--radius-lg);
    font-size:0.83rem; color:var(--text-secondary);
  }
  .current-stock-display .stock-val { font-family:'DM Mono',monospace; font-weight:700; color:var(--text-primary); font-size:1rem; }

  .field-row { display:flex; gap:0.875rem; }
  .field-row .modal-field { flex:1; }
`;

const VIEW_TABS = [
  { key: "ALL",     label: "All",          cls: "tab-all"     },
  { key: "ACTIVE",  label: "Active",       cls: "tab-active"  },
  { key: "DELETED", label: "Deactivated",  cls: "tab-deleted" },
];

/* ── Reusable modal shell ── */
function Modal({ onClose, children }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">{children}</div>
    </div>
  );
}

/* ── Add Product Modal ── */
function AddModal({ onClose, onSave }) {
  const [name, setName]         = useState("");
  const [price, setPrice]       = useState("");
  const [qty, setQty]           = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy]         = useState(false);

  const valid = name.trim() && Number(price) > 0 && qty !== "" && Number(qty) >= 0;

  const handleSave = async () => {
    if (!valid) return;
    setBusy(true);
    await onSave({
      productName: name.trim(),
      price: parseFloat(price),
      availableQuantity: parseInt(qty),
      imageUrl,
    });
    setBusy(false);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title-row">
          <div className="modal-icon modal-icon-edit">＋</div>
          <div>
            <div className="modal-title">Add New Product</div>
            <div className="modal-subtitle">Fill in the details to add to the catalog</div>
          </div>
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="modal-body">
        <div className="modal-field">
          <label className="modal-label">Product Name</label>
          <input
            className="modal-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Wireless Headphones"
            autoFocus
          />
        </div>
        <div className="field-row">
          <div className="modal-field">
            <label className="modal-label">Price (₹)</label>
            <input
              className="modal-input"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">Stock Quantity</label>
            <input
              className="modal-input"
              type="number"
              min="0"
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="modal-field">
          <label className="modal-label">Product Image URL</label>
          <input
            className="modal-input"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="Paste image URL (Supabase / CDN)"
          />
        </div>
      </div>

      <div className="modal-footer">
        <button className="modal-btn modal-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="modal-btn modal-btn-primary" onClick={handleSave} disabled={!valid || busy}>
          {busy ? "Adding…" : "Add Product"}
        </button>
      </div>
    </Modal>
  );
}

/* ── Edit Product Modal ── */
function EditModal({ product, onClose, onSave }) {
  const [name, setName]         = useState(product.productName);
  const [price, setPrice]       = useState(product.price);
  const [qty, setQty]           = useState(product.availableQuantity);
  const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
  const [busy, setBusy]         = useState(false);

  const valid = name.trim() && Number(price) > 0 && Number(qty) >= 0;

  const handleSave = async () => {
    if (!valid) return;
    setBusy(true);
    await onSave(product.productId, {
      productName: name.trim(),
      price: Number(price),
      availableQuantity: Number(qty),
      imageUrl,
    });
    setBusy(false);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title-row">
          <div className="modal-icon modal-icon-edit">✎</div>
          <div>
            <div className="modal-title">Edit Product</div>
            <div className="modal-subtitle">#{product.productId} · {product.productName}</div>
          </div>
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="modal-body">
        <div className="modal-field">
          <label className="modal-label">Product Name</label>
          <input className="modal-input" value={name} onChange={e => setName(e.target.value)} placeholder="Product name" />
        </div>
        <div className="field-row">
          <div className="modal-field">
            <label className="modal-label">Price (₹)</label>
            <input className="modal-input" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
          </div>
          <div className="modal-field">
            <label className="modal-label">Stock Quantity</label>
            <input className="modal-input" type="number" min="0" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="modal-field">
          <label className="modal-label">Product Image URL</label>
          <input
            className="modal-input"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="Update image URL"
          />
        </div>
      </div>

      <div className="modal-footer">
        <button className="modal-btn modal-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="modal-btn modal-btn-primary" onClick={handleSave} disabled={!valid || busy}>
          {busy ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
}

/* ── Stock Adjust Modal ── */
function StockModal({ product, defaultDirection, onClose, onSave }) {
  const [direction, setDirection] = useState(defaultDirection || "increase");
  const [qty, setQty]             = useState("");
  const [busy, setBusy]           = useState(false);

  const numQty  = parseInt(qty);
  const valid   = qty !== "" && numQty > 0 && (direction === "increase" || numQty <= product.availableQuantity);
  const preview = direction === "increase"
    ? product.availableQuantity + (numQty || 0)
    : product.availableQuantity - (numQty || 0);

  const handleSave = async () => {
    if (!valid) return;
    setBusy(true);
    await onSave(product.productId, direction, numQty);
    setBusy(false);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title-row">
          <div className="modal-icon modal-icon-stock">⊞</div>
          <div>
            <div className="modal-title">Adjust Stock</div>
            <div className="modal-subtitle">#{product.productId} · {product.productName}</div>
          </div>
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="modal-body">
        <div className="current-stock-display">
          <span>Current stock</span>
          <span className="stock-val">{product.availableQuantity} units</span>
        </div>

        <div className="modal-field">
          <label className="modal-label">Direction</label>
          <div className="stock-controls">
            <button
              className={`stock-direction-btn stock-dir-increase${direction === "increase" ? " selected" : ""}`}
              onClick={() => setDirection("increase")}
            >+ Increase</button>
            <button
              className={`stock-direction-btn stock-dir-decrease${direction === "decrease" ? " selected" : ""}`}
              onClick={() => setDirection("decrease")}
            >− Decrease</button>
          </div>
        </div>

        <div className="modal-field">
          <label className="modal-label">Quantity</label>
          <input
            className="modal-input"
            type="number"
            min="1"
            max={direction === "decrease" ? product.availableQuantity : undefined}
            value={qty}
            onChange={e => setQty(e.target.value)}
            placeholder="Enter quantity"
            autoFocus
          />
          {direction === "decrease" && numQty > product.availableQuantity && (
            <span style={{ fontSize:"0.75rem", color:"#DC3545", marginTop:"0.25rem" }}>
              Cannot reduce below 0 (current: {product.availableQuantity})
            </span>
          )}
        </div>

        {qty !== "" && numQty > 0 && valid && (
          <div className="current-stock-display" style={{ borderColor: direction === "increase" ? "rgba(12,170,110,0.3)" : "rgba(220,53,69,0.3)" }}>
            <span>New stock after {direction}</span>
            <span className="stock-val" style={{ color: direction === "increase" ? "#0CAA6E" : "#DC3545" }}>
              {preview} units
            </span>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button className="modal-btn modal-btn-cancel" onClick={onClose}>Cancel</button>
        <button
          className={`modal-btn ${direction === "increase" ? "modal-btn-green" : "modal-btn-danger"}`}
          onClick={handleSave}
          disabled={!valid || busy}
        >
          {busy ? "Updating…" : direction === "increase" ? `Add ${numQty || ""} Units` : `Remove ${numQty || ""} Units`}
        </button>
      </div>
    </Modal>
  );
}

/* ── Confirm Delete Modal ── */
function DeleteModal({ product, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const handleConfirm = async () => {
    setBusy(true);
    await onConfirm(product.productId);
    setBusy(false);
    onClose();
  };
  return (
    <Modal onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title-row">
          <div className="modal-icon modal-icon-danger">⚠</div>
          <div>
            <div className="modal-title">Permanently Delete</div>
            <div className="modal-subtitle">This action cannot be undone</div>
          </div>
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <div className="modal-product-chip">
          <span className="chip-badge">#{product.productId}</span>
          <strong>{product.productName}</strong>
          <span>·</span>
          <span>₹{product.price?.toLocaleString("en-IN")}</span>
        </div>
        <p className="danger-text">
          You are about to <strong>permanently delete</strong> this product from the catalog.
          All associated data will be removed and this product will no longer be recoverable.
        </p>
      </div>
      <div className="modal-footer">
        <button className="modal-btn modal-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="modal-btn modal-btn-danger" onClick={handleConfirm} disabled={busy}>
          {busy ? "Deleting…" : "Yes, Delete Permanently"}
        </button>
      </div>
    </Modal>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewTab, setViewTab] = useState("ALL");
  const [toast, setToast]   = useState(null);
  const itemsPerPage = 10;

  /* Modal state */
  const [addModal,    setAddModal]    = useState(false);
  const [editModal,   setEditModal]   = useState(null);   // product object
  const [stockModal,  setStockModal]  = useState(null);   // { product, direction }
  const [deleteModal, setDeleteModal] = useState(null);   // product object

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try { const res = await axios.get("/products"); setProducts(res.data?.content ?? res.data ?? []); }
    catch { showToast("error", "Failed to load products"); }
    finally { setLoading(false); }
  };

  const addProduct = async (payload) => {
    try {
      await axios.post("/products", payload, { headers: INTERNAL_HEADERS });
      showToast("success", `"${payload.productName}" added to catalog`);
      loadProducts();
    } catch (err) { showToast("error", extractError(err, "Failed to add product")); }
  };

  const softDelete = async (id) => {
    try { await axios.patch(`/products/${id}/soft-delete`, null, { headers: INTERNAL_HEADERS }); showToast("success", `Product #${id} deactivated`); loadProducts(); }
    catch (err) { showToast("error", extractError(err, `Deactivation failed for #${id}`)); }
  };

  const restore = async (id) => {
    try { await axios.patch(`/products/${id}/restore`, null, { headers: INTERNAL_HEADERS }); showToast("success", `Product #${id} restored`); loadProducts(); }
    catch (err) { showToast("error", extractError(err, `Restore failed for #${id}`)); }
  };

  const hardDelete = async (id) => {
    try { await axios.delete(`/orders/admin/products/${id}`, { headers: INTERNAL_HEADERS }); showToast("success", `Product #${id} permanently deleted`); loadProducts(); }
    catch (err) { showToast("error", extractError(err, `Hard delete failed for #${id}`)); }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      await axios.put(`/products/${id}`, updatedData, { headers: INTERNAL_HEADERS });
      showToast("success", `Product #${id} updated`);
      loadProducts();
    } catch (err) { showToast("error", extractError(err, "Update failed")); }
  };

  const adjustStock = async (id, direction, qty) => {
    const endpoint = direction === "increase" ? `/products/${id}/increase` : `/products/${id}/reduce`;
    try {
      await axios.patch(endpoint, { quantity: qty }, { headers: INTERNAL_HEADERS });
      showToast("success", `Stock ${direction === "increase" ? "increased" : "reduced"} for #${id}`);
      loadProducts();
    } catch (err) { showToast("error", extractError(err, `Stock ${direction} failed`)); }
  };

  const searched = products.filter(p =>
    p.productName?.toLowerCase().includes(search.toLowerCase()) || String(p.productId).includes(search)
  );
  const filtered =
    viewTab === "ACTIVE"  ? searched.filter(p => !p.deleted) :
    viewTab === "DELETED" ? searched.filter(p =>  p.deleted) : searched;

  const totalPages   = Math.ceil(filtered.length / itemsPerPage);
  const paginated    = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const activeCount  = products.filter(p => !p.deleted).length;
  const deletedCount = products.filter(p =>  p.deleted).length;

  return (
    <div className="products-page">
      <style>{css}</style>

      {/* Modals */}
      {addModal && (
        <AddModal
          onClose={() => setAddModal(false)}
          onSave={addProduct}
        />
      )}
      {editModal && (
        <EditModal
          product={editModal}
          onClose={() => setEditModal(null)}
          onSave={updateProduct}
        />
      )}
      {stockModal && (
        <StockModal
          product={stockModal.product}
          defaultDirection={stockModal.direction}
          onClose={() => setStockModal(null)}
          onSave={adjustStock}
        />
      )}
      {deleteModal && (
        <DeleteModal
          product={deleteModal}
          onClose={() => setDeleteModal(null)}
          onConfirm={hardDelete}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-sub">{activeCount} active · {deletedCount} deactivated · {products.length} total</div>
        </div>
        <button className="add-btn" onClick={() => setAddModal(true)}>＋ Add Product</button>
      </div>

      {toast && (
        <div className={`toast-bar ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.type === "error" ? "⚠" : "✓"} {toast.msg}
        </div>
      )}

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input className="search-input" type="text" placeholder="Search by ID or name…" value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="view-tabs">
          {VIEW_TABS.map(t => (
            <button key={t.key} className={`view-tab${viewTab === t.key ? " " + t.cls : ""}`}
              onClick={() => { setViewTab(t.key); setCurrentPage(1); }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="legend">
        <div className="legend-item"><div className="legend-dot amber"/> Deactivate — hides from storefront, recoverable</div>
        <div className="legend-item"><div className="legend-dot green"/> Restore — brings deactivated product back</div>
        <div className="legend-item"><div className="legend-dot red"/>   Hard Delete — permanent and irreversible</div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>&nbsp;Loading catalog…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-note">No products found</div>
      ) : (
        <div className="panel">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>{["ID","Product Name","Price","Stock","Status","Actions"].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {paginated.map(p => (
                  <tr key={p.productId} className={p.deleted ? "row-deleted" : ""}>
                    <td><span className="mono id-accent">#{p.productId}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={p.imageUrl || "https://via.placeholder.com/40"}
                          alt={p.productName}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.productName}</span>
                      </div>
                    </td>
                    <td><span className="mono price-green">₹{p.price?.toLocaleString("en-IN")}</span></td>
                    <td><span className="mono">{p.availableQuantity}</span></td>
                    <td>
                      {p.deleted
                        ? <span className="status-badge status-deleted">Deactivated</span>
                        : <span className="status-badge status-active">Active</span>}
                    </td>
                    <td>
                      <div className="actions-cell">

                        {/* Stock + */}
                        <button
                          className="tbl-btn btn-restore"
                          title="Increase stock"
                          onClick={() => setStockModal({ product: p, direction: "increase" })}
                        >+</button>

                        {/* Stock − */}
                        <button
                          className="tbl-btn btn-delete"
                          title="Decrease stock"
                          onClick={() => setStockModal({ product: p, direction: "decrease" })}
                          disabled={p.availableQuantity <= 0}
                        >−</button>

                        <div className="btn-divider" />

                        <button
                          className="tbl-btn btn-soft"
                          onClick={() => softDelete(p.productId)}
                          disabled={p.deleted}
                        >Deactivate</button>

                        <button
                          className="tbl-btn btn-soft"
                          onClick={() => setEditModal(p)}
                        >Edit</button>

                        <button
                          className="tbl-btn btn-restore"
                          onClick={() => restore(p.productId)}
                          disabled={!p.deleted}
                        >Restore</button>

                        <div className="btn-divider" />

                        <button
                          className="tbl-btn btn-delete"
                          onClick={() => setDeleteModal(p)}
                        >Delete</button>

                      </div>
                    </td>
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