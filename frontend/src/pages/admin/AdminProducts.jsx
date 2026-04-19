import { useEffect, useState } from "react";
import axios from "../../api/axios";

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#111" },
  heading: { fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.25rem", color: "#111" },
  sub: { fontSize: "0.8rem", color: "#666", margin: "0 0 1.5rem" },
  formCard: {
    background: "#fff",
    border: "1px solid #d5d9d9",
    borderRadius: 8,
    padding: "1.25rem 1.5rem",
    marginBottom: "1.5rem",
  },
  formTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#0066c0", marginBottom: "1rem" },
  row: { display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" },
  input: {
    flex: "1 1 160px",
    padding: "0.5rem 0.75rem",
    borderRadius: 6,
    border: "1px solid #d5d9d9",
    fontSize: "0.875rem",
    outline: "none",
  },
  addBtn: {
    padding: "0.5rem 1.5rem",
    borderRadius: 6,
    border: "1px solid #c45500",
    background: "#c45500",
    color: "#fff",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
  },
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
  td: { padding: "0.85rem 1rem", fontSize: "0.875rem", borderBottom: "1px solid #f0f2f2", verticalAlign: "middle" },
  actionBtn: (color, disabled) => ({
    padding: "0.3rem 0.75rem",
    borderRadius: 6,
    border: `1px solid ${disabled ? "#ddd" : color}`,
    background: "#fff",
    color: disabled ? "#bbb" : color,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    marginRight: "0.4rem",
  }),
};

export default function AdminProducts() {
  const [name, setName]     = useState("");
  const [price, setPrice]   = useState("");
  const [stock, setStock]   = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState(false);
  const [toast, setToast]       = useState(null); // { type: "error"|"success", msg: string }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get("/products");
      setProducts(res.data.content || []);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async () => {
    if (!name || !price || !stock) return;
    setAdding(true);
    try {
      await axios.post("/products", {
        productName: name,
        price: Number(price),
        availableQuantity: Number(stock),
      });
      setName(""); setPrice(""); setStock("");
      loadProducts();
    } finally {
      setAdding(false);
    }
  };

  const softDelete = async (id) => {
    await axios.patch(`/products/${id}/soft-delete`, {}, {
      headers: { "X-Internal-Key": "0aK4VOyO5dOwBEBjJG6+cbio1ENbTNYVqi0elOkWnvo=" },
    });
    loadProducts();
  };

  const restore = async (id) => {
    await axios.patch(`/products/${id}/restore`, {}, {
      headers: { "X-Internal-Key": "0aK4VOyO5dOwBEBjJG6+cbio1ENbTNYVqi0elOkWnvo=" },
    });
    loadProducts();
  };

  const hardDelete = async (id) => {
    if (!window.confirm("Permanently delete this product? This cannot be undone.")) return;
    try {
      await axios.delete(`/orders/admin/products/${id}`);
      showToast("success", "Product deleted successfully.");
      loadProducts();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Cannot delete: product is used in active or completed orders.";
      showToast("error", typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const active  = products.filter((p) => !p.deleted).length;
  const deleted = products.filter((p) => p.deleted).length;

  return (
    <div style={s.page}>
      {/* Toast notification */}
      {toast && (
        <div style={{
          marginBottom: "1rem",
          padding: "0.75rem 1.25rem",
          borderRadius: 6,
          border: `1px solid ${toast.type === "error" ? "#f5c6cb" : "#c3e6cb"}`,
          background: toast.type === "error" ? "#fff2f2" : "#f0fff4",
          color: toast.type === "error" ? "#b12704" : "#007600",
          fontSize: "0.875rem",
          fontWeight: 600,
        }}>
          {toast.type === "error" ? "⚠ " : "✓ "}{toast.msg}
        </div>
      )}
      <h1 style={s.heading}>Products</h1>
      <p style={s.sub}>{active} active · {deleted} soft-deleted</p>

      {/* Add form */}
      <div style={s.formCard}>
        <p style={s.formTitle}>+ Add New Product</p>
        <div style={s.row}>
          <input
            style={{ ...s.input, flex: "2 1 240px" }}
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={s.input}
            type="number"
            placeholder="Price (₹)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onWheel={(e) => e.target.blur()}
          />
          <input
            style={s.input}
            type="number"
            placeholder="Stock qty"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            onWheel={(e) => e.target.blur()}
          />
        </div>
        <button style={{ ...s.addBtn, opacity: adding ? 0.7 : 1 }} onClick={addProduct} disabled={adding}>
          {adding ? "Adding…" : "Add Product"}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: "#666" }}>Loading products…</p>
      ) : (
        <div style={s.tableCard}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["ID", "Product Name", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#888" }}>
                      No products found.
                    </td>
                  </tr>
                ) : products.map((p) => (
                  <tr key={p.productId} style={{ opacity: p.deleted ? 0.55 : 1 }}>
                    <td style={{ ...s.td, color: "#666" }}>#{p.productId}</td>
                    <td style={{ ...s.td, fontWeight: 600 }}>{p.productName}</td>
                    <td style={{ ...s.td, color: "#007600", fontWeight: 600 }}>
                      ₹{p.price?.toLocaleString("en-IN")}
                    </td>
                    <td style={{ ...s.td, color: p.availableQuantity === 0 ? "#b12704" : "#111", fontWeight: p.availableQuantity === 0 ? 700 : 400 }}>
                      {p.availableQuantity}
                    </td>
                    <td style={s.td}>
                      <span style={{
                        display: "inline-block",
                        padding: "0.2rem 0.65rem",
                        borderRadius: 20,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: p.deleted ? "#fde8e4" : "#e6f4e6",
                        color: p.deleted ? "#b12704" : "#007600",
                      }}>
                        {p.deleted ? "Soft Deleted" : "Active"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button
                        disabled={p.deleted}
                        style={s.actionBtn("#c45500", p.deleted)}
                        onClick={() => softDelete(p.productId)}
                      >
                        Soft Delete
                      </button>
                      <button
                        disabled={!p.deleted}
                        style={s.actionBtn("#007600", !p.deleted)}
                        onClick={() => restore(p.productId)}
                      >
                        Restore
                      </button>
                      <button
                        style={s.actionBtn("#b12704", false)}
                        onClick={() => hardDelete(p.productId)}
                      >
                        Hard Delete
                      </button>
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