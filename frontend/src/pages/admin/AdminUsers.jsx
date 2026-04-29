import { useEffect, useState } from "react";
import axios from "../../api/axios";

const css = `
  .users-page { animation: fadeUp 0.35s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  .page-header { margin-bottom: 1.5rem; display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
  .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.83rem; color: var(--text-secondary); margin-top: 0.3rem; }

  .header-actions { display:flex; gap:0.625rem; }

  .toast-msg {
    padding:0.75rem 1rem; border-radius:var(--radius-lg); font-size:0.83rem;
    font-weight:600; margin-bottom:1rem; border:1px solid;
    display:flex; align-items:center; gap:0.625rem; box-shadow:var(--shadow-sm);
  }
  .toast-success { background:#EDFAF4; border-color:rgba(12,170,110,0.25); color:#0CAA6E; }
  .toast-error   { background:#FEF2F2; border-color:rgba(220,53,69,0.25); color:#DC3545; }

  .add-btn {
    padding:0.575rem 1.25rem;
    border-radius:var(--radius-lg); border:none;
    font-size:0.845rem; font-weight:700; cursor:pointer;
    transition:all 0.15s; white-space:nowrap;
    display:flex; align-items:center; gap:0.4rem;
    font-family:'DM Sans',sans-serif;
  }
  .add-btn.blue {
    background:#4361EE; color:#fff;
    box-shadow:0 2px 8px rgba(67,97,238,0.25);
  }
  .add-btn.blue:hover { background:#3451D1; box-shadow:0 4px 12px rgba(67,97,238,0.35); transform:translateY(-1px); }
  .add-btn.amber {
    background:#D97706; color:#fff;
    box-shadow:0 2px 8px rgba(217,119,6,0.25);
  }
  .add-btn.amber:hover { background:#B45309; box-shadow:0 4px 12px rgba(217,119,6,0.35); transform:translateY(-1px); }

  .toolbar { display:flex; gap:0.875rem; margin-bottom:1.125rem; }
  .search-wrap { position:relative; flex:1; max-width:320px; }
  .search-icon { position:absolute; left:0.875rem; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:1rem; pointer-events:none; }
  .search-input {
    width:100%; padding:0.575rem 0.875rem 0.575rem 2.5rem;
    background:var(--bg-card); border:1px solid var(--border);
    border-radius:var(--radius-lg); color:var(--text-primary);
    font-size:0.845rem; outline:none; transition:border-color 0.15s, box-shadow 0.15s;
    box-shadow:var(--shadow-xs); font-family:'DM Sans',sans-serif;
  }
  .search-input::placeholder { color:var(--text-muted); }
  .search-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(67,97,238,0.1); }

  .panel { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-xl); overflow:hidden; box-shadow:var(--shadow-sm); }
  .data-table { width:100%; border-collapse:collapse; }
  .data-table th {
    padding:0.8rem 1.125rem; text-align:left; font-size:0.72rem; font-weight:700;
    text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted);
    background:#F8F9FC; border-bottom:1px solid var(--border);
  }
  .data-table td {
    padding:0.875rem 1.125rem; font-size:0.845rem;
    border-bottom:1px solid #F2F4F9; vertical-align:middle; color:var(--text-primary);
  }
  .data-table tr:last-child td { border-bottom:none; }
  .data-table tbody tr:hover td { background:#F8F9FC; }

  .mono { font-family:'DM Mono','Fira Code',monospace; font-size:0.82rem; }
  .id-accent { color:var(--accent); font-weight:600; }
  .user-email { color:var(--text-secondary); font-size:0.82rem; }

  .user-avatar {
    width: 30px; height: 30px; border-radius: 8px;
    background: linear-gradient(135deg, #EEF2FF, #C7D2FE);
    border: 1px solid rgba(67,97,238,0.15);
    display:inline-flex; align-items:center; justify-content:center;
    font-size:0.7rem; font-weight:700; color:var(--accent);
    margin-right:0.5rem; vertical-align:middle; flex-shrink:0;
  }
  .user-name-wrap { display:inline-flex; align-items:center; }

  .role-badge { display:inline-flex; align-items:center; gap:0.25rem; font-size:0.69rem; font-weight:700; padding:0.22rem 0.65rem; border-radius:6px; border:1px solid; }
  .role-badge::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
  .role-admin    { color:#4361EE; background:#EEF2FF; border-color:rgba(67,97,238,0.2); }
  .role-customer { color:#D97706; background:#FFFBEB; border-color:rgba(217,119,6,0.2); }

  .actions-cell { display:flex; align-items:center; gap:0.375rem; }
  .tbl-btn { padding:0.3rem 0.7rem; border-radius:6px; font-size:0.72rem; font-weight:600; cursor:pointer; border:1px solid; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
  .tbl-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .btn-soft    { color:#D97706; border-color:rgba(217,119,6,0.25); background:#FFFBEB; }
  .btn-soft:hover:not(:disabled) { background:#FEF3C7; border-color:#D97706; }
  .btn-restore { color:#0CAA6E; border-color:rgba(12,170,110,0.25); background:#EDFAF4; }
  .btn-restore:hover:not(:disabled) { background:#D1FAE5; border-color:#0CAA6E; }
  .btn-delete  { color:#DC3545; border-color:rgba(220,53,69,0.25); background:#FEF2F2; }
  .btn-delete:hover { background:#FEE2E2; border-color:#DC3545; }
  .btn-divider { width:1px; height:18px; background:var(--border); flex-shrink:0; }

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
    width:100%; max-width:420px;
    animation: modalSlideIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
    overflow:hidden;
  }
  @keyframes modalSlideIn { from { opacity:0; transform:scale(0.93) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }

  .modal-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:1.125rem 1.375rem 1rem;
    border-bottom:1px solid var(--border);
  }
  .modal-header-left { display:flex; align-items:center; gap:0.625rem; }
  .modal-icon {
    width:32px; height:32px; border-radius:8px;
    display:flex; align-items:center; justify-content:center; font-size:0.9rem;
  }
  .modal-icon.blue  { background:#EEF2FF; }
  .modal-icon.amber { background:#FFFBEB; }
  .modal-title { font-size:0.93rem; font-weight:700; }
  .modal-title.blue  { color:#4361EE; }
  .modal-title.amber { color:#D97706; }
  .modal-close {
    width:28px; height:28px; border-radius:6px; border:1px solid var(--border);
    background:transparent; color:var(--text-secondary); cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:1rem; line-height:1; transition:all 0.15s;
  }
  .modal-close:hover { background:var(--bg-base); color:var(--text-primary); }

  .modal-body { padding:1.25rem 1.375rem; }

  .modal-accent-bar {
    height:3px; width:100%;
  }
  .modal-accent-bar.blue  { background:linear-gradient(90deg,#4361EE,#7B8FF7); }
  .modal-accent-bar.amber { background:linear-gradient(90deg,#D97706,#FBBF24); }

  .form-field { margin-bottom:0.875rem; }
  .form-label { font-size:0.72rem; font-weight:600; color:var(--text-secondary); display:block; margin-bottom:0.35rem; text-transform:uppercase; letter-spacing:0.04em; }
  .form-input {
    width:100%; padding:0.575rem 0.875rem;
    background:var(--bg-base); border:1px solid var(--border);
    border-radius:var(--radius-lg); color:var(--text-primary);
    font-size:0.845rem; outline:none;
    transition:border-color 0.15s, box-shadow 0.15s;
    box-sizing:border-box; font-family:'DM Sans',sans-serif;
  }
  .form-input::placeholder { color:var(--text-muted); }
  .form-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(67,97,238,0.1); background:var(--bg-card); }

  .modal-footer {
    display:flex; gap:0.625rem; justify-content:flex-end;
    padding:1rem 1.375rem 1.25rem;
    border-top:1px solid var(--border);
  }
  .modal-cancel-btn {
    padding:0.55rem 1.1rem; border-radius:var(--radius-lg);
    border:1px solid var(--border); background:var(--bg-base);
    color:var(--text-secondary); font-size:0.845rem; font-weight:600;
    cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif;
  }
  .modal-cancel-btn:hover { background:var(--bg-card); border-color:var(--text-muted); color:var(--text-primary); }
  .modal-submit-btn {
    padding:0.55rem 1.25rem; border-radius:var(--radius-lg);
    border:none; font-size:0.845rem; font-weight:700;
    cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif;
  }
  .modal-submit-btn.blue  { background:#4361EE; color:#fff; box-shadow:0 2px 8px rgba(67,97,238,0.25); }
  .modal-submit-btn.blue:hover:not(:disabled)  { background:#3451D1; box-shadow:0 4px 12px rgba(67,97,238,0.35); transform:translateY(-1px); }
  .modal-submit-btn.amber { background:#D97706; color:#fff; box-shadow:0 2px 8px rgba(217,119,6,0.25); }
  .modal-submit-btn.amber:hover:not(:disabled) { background:#B45309; box-shadow:0 4px 12px rgba(217,119,6,0.35); transform:translateY(-1px); }
  .modal-submit-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none !important; }
`;

const EMPTY = { name: "", email: "", password: "" };

/* ── Create User Modal ── */
function CreateUserModal({ role, onClose, onSave, submitting }) {
  const [form, setForm] = useState(EMPTY);
  const isAdmin = role === "admin";
  const accent  = isAdmin ? "blue" : "amber";

  const handleSubmit = () => onSave(role, form, () => setForm(EMPTY));

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div className={`modal-accent-bar ${accent}`} />
        <div className="modal-header">
          <div className="modal-header-left">
            <div className={`modal-icon ${accent}`}>{isAdmin ? "🛡" : "👤"}</div>
            <div className={`modal-title ${accent}`}>{isAdmin ? "Create Admin Account" : "Create Customer Account"}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-field">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              placeholder={isAdmin ? "Admin name" : "Customer name"}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              placeholder={isAdmin ? "admin@example.com" : "user@example.com"}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className={`modal-submit-btn ${accent}`}
            onClick={handleSubmit}
            disabled={submitting === role}
          >
            {submitting === role ? "Creating…" : `+ Create ${isAdmin ? "Admin" : "Customer"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addModal, setAddModal] = useState(null); // "admin" | "customer" | null
  const itemsPerPage = 10;
  const API_KEY = "0aK4VOyO5dOwBEBjJG6+cbio1ENbTNYVqi0elOkWnvo=";

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "X-Internal-Key": API_KEY,
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadUsers = () => {
    setLoading(true);
    axios.get("/users/getAll", { headers: authHeaders() })
      .then(res => setUsers(res.data))
      .catch(() => showToast("error", "Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (role, form, resetForm) => {
    if (!form.name || !form.email || !form.password) { showToast("error", "All fields are required"); return; }
    setSubmitting(role);
    try {
      await axios.post(`/users/create-${role}`, form, { headers: authHeaders() });
      resetForm();
      setAddModal(null);
      showToast("success", `${role === "admin" ? "Admin" : "Customer"} account created`);
      loadUsers();
    } catch { showToast("error", "Failed to create account"); }
    finally { setSubmitting(null); }
  };

  const softDeleteUser = async (id) => {
    try { await axios.patch(`/users/${id}/soft-delete`, null, { headers: authHeaders() }); loadUsers(); showToast("success", `User #${id} deactivated`); }
    catch { showToast("error", "Action failed"); }
  };

  const restoreUser = async (id) => {
    try { await axios.patch(`/users/${id}/restore`, null, { headers: authHeaders() }); loadUsers(); showToast("success", `User #${id} restored`); }
    catch { showToast("error", "Action failed"); }
  };

  const hardDeleteUser = async (id) => {
    if (!window.confirm(`Permanently delete user #${id}? This cannot be undone.`)) return;
    try { await axios.delete(`/users/${id}`, { headers: authHeaders() }); loadUsers(); showToast("success", `User #${id} deleted`); }
    catch { showToast("error", "Delete failed"); }
  };

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  const filtered = users.filter(u => {
    if (!search) return true;
    return String(u.id).includes(search) || (u.name || "").toLowerCase().includes(search.toLowerCase());
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="users-page">
      <style>{css}</style>

      {addModal && (
        <CreateUserModal
          role={addModal}
          onClose={() => setAddModal(null)}
          onSave={handleCreate}
          submitting={submitting}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Users</div>
          <div className="page-sub">{loading ? "Loading…" : `${users.length} total accounts`}</div>
        </div>
        <div className="header-actions">
          <button className="add-btn blue"  onClick={() => setAddModal("admin")}>🛡 Add Admin</button>
          <button className="add-btn amber" onClick={() => setAddModal("customer")}>👤 Add Customer</button>
        </div>
      </div>

      {toast && (
        <div className={`toast-msg ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.type === "error" ? "⚠" : "✓"} {toast.msg}
        </div>
      )}

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input className="search-input" type="text" placeholder="Search by ID or name…" value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>&nbsp;Loading accounts…</div>
      ) : (
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>{["User ID","Name","Email","Role","Actions"].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {paginated.map(u => (
                <tr key={u.id} style={{ opacity: u.deleted ? 0.5 : 1 }}>
                  <td><span className="mono id-accent">#{u.id}</span></td>
                  <td>
                    <div className="user-name-wrap">
                      <span className="user-avatar">{getInitials(u.name)}</span>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td><span className="user-email">{u.email}</span></td>
                  <td>
                    {u.role?.toLowerCase() === "admin"
                      ? <span className="role-badge role-admin">Admin</span>
                      : <span className="role-badge role-customer">Customer</span>}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="tbl-btn btn-soft" onClick={() => softDeleteUser(u.id)} disabled={u.deleted}>Deactivate</button>
                      <button className="tbl-btn btn-restore" onClick={() => restoreUser(u.id)} disabled={!u.deleted}>Restore</button>
                      <div className="btn-divider" />
                      <button className="tbl-btn btn-delete" onClick={() => hardDeleteUser(u.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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