import { useEffect, useState } from "react";
import axios from "../../api/axios";

const css = `
:root {
  --accent: #4361ee;
  --accent-light: #eef2ff;
  --border: #e5e7eb;
  --bg-card: #ffffff;
  --text-secondary: #6b7280;
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --radius: 8px;
}

/* Layout */
.logs-page { animation: fadeUp 0.3s ease; }
@keyframes fadeUp { from {opacity:0;transform:translateY(10px);} to {opacity:1;transform:translateY(0);} }

.page-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }

.toolbar {
  display:flex;
  gap:10px;
  margin-bottom:10px;
  flex-wrap:wrap;
}

.search-input {
  padding:8px;
  border:1px solid var(--border);
  border-radius:6px;
  min-width:220px;
}

/* Filter buttons */
.filter-buttons button {
  padding:6px 12px;
  border:1px solid var(--border);
  background:#fff;
  cursor:pointer;
  border-radius:6px;
}

.filter-buttons button.active {
  background:var(--accent);
  color:#fff;
}

/* Panel */
.panel { background: white; border-radius: 10px; overflow: hidden; }

/* Table */
table { width: 100%; border-collapse: collapse; }

th, td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 14px;
}

th {
  background: #f5f5f5;
  position: sticky;
  top: 0;
}

/* Badges */
.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge-login { background:#e6f7ee; color:#0CAA6E; }
.badge-logout { background:#f1f1f1; color:#666; }
.badge-delete { background:#fdecec; color:#DC3545; }

/* Pagination */
.pagination {
  display:flex;
  justify-content:center;
  gap:0.375rem;
  padding:1rem;
  border-top:1px solid var(--border);
  background:#F8F9FC;
}

.page-btn {
  width:34px;
  height:34px;
  border-radius:var(--radius);
  border:1px solid var(--border);
  background:var(--bg-card);
  color:var(--text-secondary);
  cursor:pointer;
  font-size:0.8rem;
  display:flex;
  align-items:center;
  justify-content:center;
}

.page-btn.active {
  background:var(--accent);
  color:#fff;
}

.page-btn:disabled {
  opacity:0.3;
  cursor:not-allowed;
}

.loading, .empty {
  text-align:center;
  padding:2rem;
}
`;

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    loadLogs();

    const interval = setInterval(() => {
      loadLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      const res = await axios.get("/logs");

      const sorted = res.data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setLogs(sorted);
    } catch {
      alert("Failed to load logs");
    }
  };

  /* SEARCH */
  const searched = logs.filter(log =>
    log.username?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase())
  );

  /* DATE FILTER */
  const now = new Date();

  const filtered = searched.filter(log => {
    const logDate = new Date(log.timestamp);

    if (filter === "TODAY") {
      return logDate.toDateString() === now.toDateString();
    }

    if (filter === "WEEK") {
      const diff = (now - logDate) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }

    return true;
  });

  /* PAGINATION */
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="logs-page">
      <style>{css}</style>

      <div className="page-title">System Logs</div>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <div className="filter-buttons">
          {["ALL", "TODAY", "WEEK"].map(f => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => {
                setFilter(f);
                setCurrentPage(1);
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty">No logs found</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Entity</th>
                  <th>Details</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map(log => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.service}</td>

                    <td>
                      <span className={
                        "badge " +
                        (log.action.includes("LOGIN") ? "badge-login" :
                         log.action.includes("LOGOUT") ? "badge-logout" :
                         "badge-delete")
                      }>
                        {log.action}
                      </span>
                    </td>

                    <td
                      onClick={() => navigator.clipboard.writeText(log.username)}
                      style={{ cursor: "pointer" }}
                      title="Click to copy"
                    >
                      {log.username}
                    </td>

                    <td>{log.entity}</td>
                    <td>{log.details}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
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
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}