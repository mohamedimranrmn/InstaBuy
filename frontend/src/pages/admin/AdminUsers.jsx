import { useEffect, useState } from "react";
import axios from "../../api/axios";

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#111" },
  heading: { fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.25rem", color: "#111" },
  sub: { fontSize: "0.8rem", color: "#666", margin: "0 0 1.5rem" },

  toast: (type) => ({
    marginBottom: "1rem",
    padding: "0.75rem 1.25rem",
    borderRadius: 6,
    border: `1px solid ${type === "error" ? "#f5c6cb" : "#c3e6cb"}`,
    background: type === "error" ? "#fff2f2" : "#f0fff4",
    color: type === "error" ? "#b12704" : "#007600",
    fontSize: "0.875rem",
    fontWeight: 600,
  }),

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.25rem",
    marginBottom: "1.5rem",
  },
  formCard: {
    background: "#fff",
    border: "1px solid #d5d9d9",
    borderRadius: 8,
    padding: "1.25rem 1.5rem",
  },
  formTitle: (color) => ({
    fontSize: "0.95rem",
    fontWeight: 700,
    color,
    marginBottom: "1rem",
  }),
  input: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: 6,
    border: "1px solid #d5d9d9",
    fontSize: "0.875rem",
    outline: "none",
    marginBottom: "0.65rem",
    boxSizing: "border-box",
  },
  btn: (color) => ({
    width: "100%",
    padding: "0.55rem",
    borderRadius: 6,
    border: `1px solid ${color}`,
    background: color,
    color: "#fff",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "0.25rem",
  }),

  tableCard: { background: "#fff", border: "1px solid #d5d9d9", borderRadius: 8, overflow: "hidden" },
  th: {
    padding: "0.65rem 1rem",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#444",
    background: "#f0f2f2",
    borderBottom: "1px solid #d5d9d9",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "0.85rem 1rem",
    fontSize: "0.875rem",
    borderBottom: "1px solid #f0f2f2",
    verticalAlign: "middle",
  },
};

const EMPTY = { name: "", email: "", password: "" };

export default function AdminUsers() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);
  const [adminForm, setAdminForm] = useState(EMPTY);
  const [custForm, setCustForm]   = useState(EMPTY);
  const [submitting, setSubmitting] = useState(null); // "admin" | "customer" | null

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadUsers = () => {
    axios.get("/users/getAll")
      .then((res) => setUsers(res.data))
      .catch(() => showToast("error", "Failed to load users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (role) => {
    const form     = role === "admin" ? adminForm : custForm;
    const setForm  = role === "admin" ? setAdminForm : setCustForm;
    const endpoint = role === "admin" ? "/users/create-admin" : "/users/create-customer";

    if (!form.name || !form.email || !form.password) {
      showToast("error", "All fields are required.");
      return;
    }

    setSubmitting(role);
    try {
      await axios.post(endpoint, {
        name: form.name,
        email:    form.email,
        password: form.password,
      });
      showToast("success", `${role === "admin" ? "Admin" : "Customer"} created successfully.`);
      setForm(EMPTY);
      loadUsers();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        `Failed to create ${role}.`;
      showToast("error", typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(null);
    }
  };

  const patchAdmin = (f, v) => setAdminForm((p) => ({ ...p, [f]: v }));
  const patchCust  = (f, v) => setCustForm((p) => ({ ...p, [f]: v }));

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Users</h1>
      <p style={s.sub}>{loading ? "Loading…" : `${users.length} registered users`}</p>

      {/* Toast */}
      {toast && (
        <div style={s.toast(toast.type)}>
          {toast.type === "error" ? "⚠ " : "✓ "}{toast.msg}
        </div>
      )}

      {/* Create forms */}
      <div style={s.formGrid}>

        {/* Create Admin */}
        <div style={s.formCard}>
          <p style={s.formTitle("#0066c0")}>+ Create Admin</p>
          <input
            style={s.input}
            placeholder="Username"
            value={adminForm.name}
            onChange={(e) => patchAdmin("name", e.target.value)}
          />
          <input
            style={s.input}
            placeholder="Email"
            type="email"
            value={adminForm.email}
            onChange={(e) => patchAdmin("email", e.target.value)}
          />
          <input
            style={s.input}
            placeholder="Password"
            type="password"
            value={adminForm.password}
            onChange={(e) => patchAdmin("password", e.target.value)}
          />
          <button
            style={{ ...s.btn("#1b2a4a"), opacity: submitting === "admin" ? 0.7 : 1 }}
            disabled={submitting === "admin"}
            onClick={() => handleCreate("admin")}
          >
            {submitting === "admin" ? "Creating…" : "Create Admin"}
          </button>
        </div>

        {/* Create Customer */}
        <div style={s.formCard}>
          <p style={s.formTitle("#c45500")}>+ Create Customer</p>
          <input
            style={s.input}
            placeholder="Username"
            value={custForm.name}
            onChange={(e) => patchCust("name", e.target.value)}
          />
          <input
            style={s.input}
            placeholder="Email"
            type="email"
            value={custForm.email}
            onChange={(e) => patchCust("email", e.target.value)}
          />
          <input
            style={s.input}
            placeholder="Password"
            type="password"
            value={custForm.password}
            onChange={(e) => patchCust("password", e.target.value)}
          />
          <button
            style={{ ...s.btn("#c45500"), opacity: submitting === "customer" ? 0.7 : 1 }}
            disabled={submitting === "customer"}
            onClick={() => handleCreate("customer")}
          >
            {submitting === "customer" ? "Creating…" : "Create Customer"}
          </button>
        </div>

      </div>

      {/* Users table */}
      {loading ? (
        <p style={{ color: "#666" }}>Loading users…</p>
      ) : users.length === 0 ? (
        <p style={{ color: "#666" }}>No users found.</p>
      ) : (
        <div style={s.tableCard}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["ID", "name", "Email", "Role"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || u.userId || u.email}>
                    <td style={{ ...s.td, color: "#666" }}>#{u.id || u.userId}</td>
                    <td style={{ ...s.td, fontWeight: 600 }}>{u.name || u.name || "—"}</td>
                    <td style={{ ...s.td, color: "#0066c0" }}>{u.email}</td>
                    <td style={s.td}>
                      <span style={{
                        display: "inline-block",
                        padding: "0.2rem 0.65rem",
                        borderRadius: 20,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: u.role === "ADMIN" ? "#e6f0fb" : "#f0f0f0",
                        color: u.role === "ADMIN" ? "#0066c0" : "#444",
                      }}>
                        {u.role || "CUSTOMER"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}