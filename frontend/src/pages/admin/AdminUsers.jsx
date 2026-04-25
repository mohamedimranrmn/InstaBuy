import { useEffect, useState } from "react";
import axios from "../../api/axios";

const css = `
  .users-page { animation: fadeUp 0.4s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

  .page-header { margin-bottom: 1.75rem; }
  .page-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--accent-blue); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.4rem; }
  .page-title { font-family: 'Orbitron', monospace; font-size: 1.6rem; font-weight: 700; color: #fff; }
  .page-sub { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.35rem; font-family: 'JetBrains Mono', monospace; }

  .toast-msg { padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.82rem; font-weight: 600; font-family: 'JetBrains Mono', monospace; margin-bottom: 1.25rem; border: 1px solid; display: flex; align-items: center; gap: 0.5rem; }
  .toast-success { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.3); color: var(--accent-green); }
  .toast-error { background: rgba(244,63,94,0.08); border-color: rgba(244,63,94,0.3); color: var(--accent-red); }

  .create-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem; }

  .create-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }
  .create-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; }
  .create-card.admin-card::before { background: linear-gradient(90deg, transparent, var(--accent-blue), transparent); }
  .create-card.customer-card::before { background: linear-gradient(90deg, transparent, var(--accent-gold), transparent); }

  .create-card-title { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 1.1rem; display: flex; align-items: center; gap: 0.5rem; }
  .create-card-title.blue { color: var(--accent-blue); }
  .create-card-title.gold { color: var(--accent-gold); }
  .create-card-title::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; box-shadow:0 0 6px currentColor; }

  .form-field { margin-bottom: 0.75rem; }
  .form-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-secondary); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 0.35rem; }
  .form-input { width: 100%; padding: 0.55rem 0.875rem; background: rgba(5,8,16,0.6); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 0.845rem; font-family: 'Space Grotesk', sans-serif; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
  .form-input::placeholder { color: var(--text-muted); }
  .form-input:focus { border-color: var(--accent-blue); }

  .create-btn { width: 100%; padding: 0.65rem; border-radius: 8px; font-size: 0.82rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; cursor: pointer; letter-spacing: 0.05em; transition: all 0.2s; margin-top: 0.25rem; border: 1px solid; }
  .create-btn.blue { color: var(--accent-blue); border-color: rgba(56,189,248,0.35); background: rgba(56,189,248,0.08); }
  .create-btn.blue:hover { background: rgba(56,189,248,0.15); box-shadow: 0 0 12px rgba(56,189,248,0.15); }
  .create-btn.gold { color: var(--accent-gold); border-color: rgba(240,165,0,0.35); background: rgba(240,165,0,0.08); }
  .create-btn.gold:hover { background: rgba(240,165,0,0.15); box-shadow: 0 0 12px rgba(240,165,0,0.15); }
  .create-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .toolbar { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
  .search-input-wrap { position: relative; flex: 1; max-width: 320px; }
  .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.9rem; pointer-events: none; }
  .search-input { width: 100%; padding: 0.6rem 0.875rem 0.6rem 2.4rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 0.845rem; font-family: 'Space Grotesk', sans-serif; outline: none; transition: border-color 0.2s; }
  .search-input::placeholder { color: var(--text-muted); }
  .search-input:focus { border-color: var(--accent-blue); }

  .table-shell { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; backdrop-filter: blur(10px); }
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th { padding: 0.75rem 1.1rem; text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); }
  .data-table td { padding: 0.9rem 1.1rem; font-size: 0.845rem; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: rgba(56,189,248,0.03); }

  .user-id { font-family: 'JetBrains Mono', monospace; color: var(--accent-blue); }
  .user-email { color: var(--text-secondary); font-size: 0.82rem; }
  .role-admin { display: inline-flex; align-items: center; gap: 0.3rem; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; padding: 0.2rem 0.65rem; border-radius: 20px; color: var(--accent-blue); background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.25); }
  .role-customer { display: inline-flex; align-items: center; gap: 0.3rem; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; padding: 0.2rem 0.65rem; border-radius: 20px; color: var(--accent-gold); background: rgba(240,165,0,0.1); border: 1px solid rgba(240,165,0,0.25); }
  .role-admin::before, .role-customer::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }

  .delete-btn { padding: 0.3rem 0.7rem; border-radius: 6px; font-size: 0.7rem; font-weight: 600; font-family: 'JetBrains Mono', monospace; cursor: pointer; border: 1px solid rgba(244,63,94,0.3); background: rgba(244,63,94,0.05); color: var(--accent-red); transition: all 0.15s; }
  .delete-btn:hover { background: rgba(244,63,94,0.12); }

  .loading-pulse { display:flex; gap:0.4rem; align-items:center; color:var(--text-secondary); font-family:'JetBrains Mono',monospace; font-size:0.8rem; margin:3rem 0; }
  .loading-pulse span { width:6px; height:6px; border-radius:50%; background:var(--accent-blue); animation:loadbounce 1.2s ease-in-out infinite; }
  .loading-pulse span:nth-child(2) { animation-delay:0.15s; }
  .loading-pulse span:nth-child(3) { animation-delay:0.3s; }
  @keyframes loadbounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }

  @media(max-width:700px) { .create-grid { grid-template-columns: 1fr; } }

  .actions-cell {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .tbl-btn {
    padding: 0.3rem 0.7rem;
    border-radius: 6px;
    font-size: 0.68rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    cursor: pointer;
    border: 1px solid;
  }

  .tbl-btn:disabled {
    opacity: 0.28;
    cursor: not-allowed;
  }

  .tbl-btn-soft {
    color: #f59e0b;
    border-color: rgba(245,158,11,0.35);
    background: rgba(245,158,11,0.06);
  }

  .tbl-btn-restore {
    color: var(--accent-green);
    border-color: rgba(16,185,129,0.35);
    background: rgba(16,185,129,0.06);
  }

  .tbl-btn-hard {
    color: var(--accent-red);
    border-color: rgba(244,63,94,0.35);
    background: rgba(244,63,94,0.06);
  }

  .btn-divider {
    width: 1px;
    height: 20px;
    background: var(--border);
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 1.25rem;
  }

  .page-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .page-btn.active {
    background: rgba(56,189,248,0.12);
    border-color: var(--accent-blue);
    color: var(--accent-blue);
  }
`;

const EMPTY = { name: "", email: "", password: "" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [adminForm, setAdminForm] = useState(EMPTY);
  const [custForm, setCustForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const API_KEY = "0aK4VOyO5dOwBEBjJG6+cbio1ENbTNYVqi0elOkWnvo=";

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadUsers = () => {
    axios.get("/users/getAll")
      .then(res => setUsers(res.data))
      .catch(() => showToast("error", "FAILED TO LOAD USERS"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (role) => {
    const form = role === "admin" ? adminForm : custForm;
    const setForm = role === "admin" ? setAdminForm : setCustForm;
    const endpoint = role === "admin" ? "/users/create-admin" : "/users/create-customer";
    if (!form.name || !form.email || !form.password) { showToast("error", "ALL FIELDS REQUIRED"); return; }
    setSubmitting(role);
    try {
      await axios.post(endpoint, form);
      showToast("success", `${role.toUpperCase()} CREATED SUCCESSFULLY`);
      setForm(EMPTY);
      loadUsers();
    } catch { showToast("error", "CREATION FAILED"); }
    finally { setSubmitting(null); }
  };

  const softDeleteUser = async (id) => {
    try {
      await axios.patch(`/users/${id}/soft-delete`, {}, {
        headers: { "X-Internal-Key": API_KEY }
      });
      showToast("success", "USER SOFT DELETED");
      loadUsers();
    } catch {
      showToast("error", "SOFT DELETE FAILED");
    }
  };

  const restoreUser = async (id) => {
    try {
      await axios.patch(`/users/${id}/restore`, {}, {
        headers: { "X-Internal-Key": API_KEY }
      });
      showToast("success", "USER RESTORED");
      loadUsers();
    } catch {
      showToast("error", "RESTORE FAILED");
    }
  };

  const hardDeleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;

    try {
      await axios.delete(`/users/${id}`, {
        headers: { "X-Internal-Key": API_KEY }
      });
      showToast("success", "USER DELETED");
      loadUsers();
    } catch {
      showToast("error", "DELETE FAILED");
    }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    return String(u.id).includes(search) || (u.name || "").toLowerCase().includes(search.toLowerCase());
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginated = filtered.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
  );

  return (
    <div className="users-page">
      <style>{css}</style>

      <div className="page-header">
        <div className="page-eyebrow">// user_management</div>
        <div className="page-title">USERS</div>
        <div className="page-sub">{loading ? "LOADING..." : `${users.length} TOTAL_ACCOUNTS`}</div>
      </div>

      {toast && (
        <div className={`toast-msg ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.type === "error" ? "⚠" : "✓"}&nbsp;{toast.msg}
        </div>
      )}

      <div className="create-grid">
        <div className="create-card admin-card">
          <div className="create-card-title blue">Create Admin Account</div>
          <div className="form-field">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Admin name" value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} />
          </div>
          <div className="form-field">
            <label className="form-label">Email Address</label>
            <input className="form-input" placeholder="admin@example.com" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} />
          </div>
          <button className="create-btn blue" onClick={() => handleCreate("admin")} disabled={submitting === "admin"}>
            {submitting === "admin" ? "CREATING..." : "+ CREATE_ADMIN"}
          </button>
        </div>

        <div className="create-card customer-card">
          <div className="create-card-title gold">Create Customer Account</div>
          <div className="form-field">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Customer name" value={custForm.name} onChange={e => setCustForm({ ...custForm, name: e.target.value })} />
          </div>
          <div className="form-field">
            <label className="form-label">Email Address</label>
            <input className="form-input" placeholder="user@example.com" value={custForm.email} onChange={e => setCustForm({ ...custForm, email: e.target.value })} />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={custForm.password} onChange={e => setCustForm({ ...custForm, password: e.target.value })} />
          </div>
          <button className="create-btn gold" onClick={() => handleCreate("customer")} disabled={submitting === "customer"}>
            {submitting === "customer" ? "CREATING..." : "+ CREATE_CUSTOMER"}
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap">
          <span className="search-icon">⌕</span>
          <input className="search-input" type="text" placeholder="Search by ID or name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="loading-pulse"><span/><span/><span/>&nbsp;LOADING ACCOUNTS...</div>
      ) : (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                {["USER_ID", "NAME", "EMAIL", "ROLE", "ACTIONS"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {paginated.map(u => {
                const isAdmin = u.role?.toLowerCase() === "admin";

                return (
                  <tr key={u.id} style={{ opacity: u.deleted ? 0.5 : 1 }}>
                    <td><span className="user-id">#{u.id}</span></td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{u.name}</td>
                    <td><span className="user-email">{u.email}</span></td>
                    <td>
                      {u.role?.toLowerCase() === "admin"
                        ? <span className="role-admin">ADMIN</span>
                        : <span className="role-customer">CUSTOMER</span>
                      }
                    </td>
                    <td>
                      <div className="actions-cell">

                        <button
                          className="tbl-btn tbl-btn-soft"
                          onClick={() => softDeleteUser(u.id)}
                          disabled={u.deleted || isAdmin}
                        >
                          DISABLE
                        </button>

                        <button
                          className="tbl-btn tbl-btn-restore"
                          onClick={() => restoreUser(u.id)}
                          disabled={!u.deleted || isAdmin}
                        >
                          ↺ ENABLE
                        </button>

                        <div className="btn-divider" />

                        <button
                          className="tbl-btn tbl-btn-hard"
                          onClick={() => hardDeleteUser(u.id)}
                          disabled={isAdmin}
                        >
                          ✕ DELETE
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                ←
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}