import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { ADMIN_BASE_CSS } from "./adminStyles";

const INTERNAL_KEY = "0aK4VOyO5dOwBEBjJG6+cbio1ENbTNYVqi0elOkWnvo=";
const INTERNAL_HEADERS = {
  "X-Internal-Key": INTERNAL_KEY,
  "Content-Type": "application/json",
};

const extractError = (err, fallback) => {
  if (err?.response) {
    const status = err.response.status;
    const data = err.response.data;
    const detail = data?.message || data?.error || data?.detail || (typeof data === "string" ? data : null);
    return detail ? `[${status}] ${detail}` : `[${status}] ${fallback}`;
  }
  if (err?.request) return "No response from server — check backend is running";
  return fallback;
};

const VIEW_TABS = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "DELETED", label: "Soft Deleted" },
];

export default function AdminProducts() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewTab, setViewTab] = useState("ALL");
  const [toast, setToast] = useState(null);
  const itemsPerPage = 10;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/products");
      setProducts(res.data?.content ?? res.data ?? []);
    } catch (err) {
      showToast("error", extractError(err, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async () => {
    if (!name || !price || !stock) { showToast("error", "All fields required"); return; }
    try {
      await axios.post("/products", {
        productName: name, price: Number(price), availableQuantity: Number(stock),
      });
      setName(""); setPrice(""); setStock("");
      showToast("success", "Product added successfully");
      loadProducts();
    } catch (err) {
      showToast("error", extractError(err, "Failed to add product"));
    }
  };

  const softDelete = async (id) => {
    try {
      await axios.patch(`/products/${id}/soft-delete`, null, { headers: INTERNAL_HEADERS });
      showToast("success", `Product #${id} soft-deleted`);
      loadProducts();
    } catch (err) {
      showToast("error", extractError(err, `Soft delete failed for #${id}`));
    }
  };

  const restore = async (id) => {
    try {
      await axios.patch(`/products/${id}/restore`, null, { headers: INTERNAL_HEADERS });
      showToast("success", `Product #${id} restored`);
      loadProducts();
    } catch (err) {
      showToast("error", extractError(err, `Restore failed for #${id}`));
    }
  };

  const hardDelete = async (id) => {
    if (!window.confirm(`Permanently delete product #${id}? This cannot be undone.`)) return;
    try {
      await axios.delete(`/products/${id}`, { headers: INTERNAL_HEADERS });
      showToast("success", `Product #${id} permanently deleted`);
      loadProducts();
    } catch (err) {
      showToast("error", extractError(err, `Hard delete failed for #${id}`));
    }
  };

  const searched = products.filter(p =>
    p.productName?.toLowerCase().includes(search.toLowerCase()) ||
    String(p.productId).includes(search)
  );

  const filtered =
    viewTab === "ACTIVE" ? searched.filter(p => !p.deleted) :
    viewTab === "DELETED" ? searched.filter(p => p.deleted) :
    searched;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const activeCount = products.filter(p => !p.deleted).length;
  const deletedCount = products.filter(p => p.deleted).length;

  return (
    <div className="adm-page">
      <style>{ADMIN_BASE_CSS}</style>

      <div className="adm-eyebrow">Product Catalogue</div>
      <h1 className="adm-title">Products</h1>
      <p className="adm-sub">{activeCount} active · {deletedCount} soft-deleted · {products.length} total</p>
      <hr className="adm-rule" />

      {toast && (
        <div className={`adm-toast ${toast.type === "error" ? "adm-toast-error" : "adm-toast-success"}`}>
          {toast.type === "error" ? "⚠" : "✓"} {toast.msg}
        </div>
      )}

      <div className="adm-form-card">
        <div className="adm-form-title">Add New Product</div>
        <div className="adm-form-row">
          <div className="adm-form-field">
            <label className="adm-form-label">Product Name</label>
            <input className="adm-form-input" placeholder="Enter product name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="adm-form-field">
            <label className="adm-form-label">Price (₹)</label>
            <input className="adm-form-input" type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div className="adm-form-field">
            <label className="adm-form-label">Stock Quantity</label>
            <input className="adm-form-input" type="number" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} />
          </div>
          <button className="adm-form-btn" onClick={addProduct}>+ Add Product</button>
        </div>
      </div>

      <div className="adm-legend">
        <div className="adm-legend-item"><div className="adm-legend-dot" style={{ background: "#c8a84b" }} /> Soft delete — hides from storefront, recoverable</div>
        <div className="adm-legend-item"><div className="adm-legend-dot" style={{ background: "#5a8a5a" }} /> Restore — bring soft-deleted product back</div>
        <div className="adm-legend-item"><div className="adm-legend-dot" style={{ background: "#c87070" }} /> Hard delete — permanent &amp; irreversible</div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <span className="adm-search-icon">🔍</span>
          <input
            className="adm-search-input"
            type="text"
            placeholder="Search by ID or name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="adm-filters">
          {VIEW_TABS.map(t => (
            <button
              key={t.key}
              className={`adm-filter-btn${viewTab === t.key ? " active" : ""}`}
              onClick={() => { setViewTab(t.key); setCurrentPage(1); }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="adm-loading">Loading products…</div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">No products found.</div>
      ) : (
        <>
          <div className="adm-table-wrap">
            <div style={{ overflowX: "auto" }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    {["ID", "Product Name", "Price", "Stock", "Status", "Actions"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => (
                    <tr key={p.productId} className={p.deleted ? "row-deleted" : ""}>
                      <td><span className="adm-id">#{p.productId}</span></td>
                      <td style={{ fontWeight: 600, color: "#1a1a18" }}>{p.productName}</td>
                      <td style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 700 }}>₹{p.price?.toLocaleString("en-IN")}</td>
                      <td style={{ fontWeight: 600 }}>{p.availableQuantity}</td>
                      <td>
                        {p.deleted
                          ? <span className="adm-badge adm-badge-red">Soft Deleted</span>
                          : <span className="adm-badge adm-badge-green">Active</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "nowrap" }}>
                          <button className="adm-btn adm-btn-amber" onClick={() => softDelete(p.productId)} disabled={p.deleted}>Soft Delete</button>
                          <button className="adm-btn adm-btn-green" onClick={() => restore(p.productId)} disabled={!p.deleted}>Restore</button>
                          <div className="adm-btn-divider" />
                          <button className="adm-btn adm-btn-red" onClick={() => hardDelete(p.productId)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="adm-pagination">
              <button className="adm-page-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>‹</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={`adm-page-btn${currentPage === i + 1 ? " active" : ""}`} onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button className="adm-page-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}