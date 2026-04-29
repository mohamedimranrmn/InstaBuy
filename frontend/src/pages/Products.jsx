import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useCart } from "../context/CartContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
  .ib-products * { box-sizing: border-box; }
  .ib-products { font-family: 'DM Sans', sans-serif; background: #f8f7f4; min-height: 100vh; padding: 3rem 2rem; }
  .ib-products-inner { max-width: 1200px; margin: 0 auto; }

  /* HEADER */
  .ib-prod-header { margin-bottom: 2.5rem; }
  .ib-prod-header-top { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
  .ib-prod-label { color: #f0a500; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.4rem; }
  .ib-prod-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: #0f1c35; font-weight: 700; line-height: 1.2; }
  .ib-prod-count { color: #999; font-size: 0.88rem; margin-top: 0.3rem; }

  /* SEARCH */
  .ib-search-wrap { position: relative; }
  .ib-search-wrap input {
    padding: 0.65rem 1rem 0.65rem 2.75rem;
    border: 1px solid #e0ddd6; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; background: #fff;
    outline: none; width: 280px; color: #0f1c35;
    transition: all 0.2s;
  }
  .ib-search-wrap input:focus { border-color: #f0a500; box-shadow: 0 0 0 3px rgba(240,165,0,0.12); }
  .ib-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #bbb; font-size: 0.9rem; }

  /* FILTER TABS */
  .ib-filter-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .ib-filter-tab {
    padding: 0.4rem 1rem; border-radius: 100px;
    border: 1px solid #e0ddd6; background: #fff;
    color: #666; font-size: 0.82rem; font-weight: 600; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .ib-filter-tab.active { background: #1b2a4a; border-color: #1b2a4a; color: #fff; }
  .ib-filter-tab:hover:not(.active) { border-color: #1b2a4a; color: #1b2a4a; }

  /* GRID */
  .ib-prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }

  /* CARD */
  .ib-prod-card {
    background: #fff; border-radius: 18px; overflow: hidden;
    border: 1px solid #ebe9e3; transition: all 0.3s;
    display: flex; flex-direction: column;
  }
  .ib-prod-card:hover { transform: translateY(-5px); box-shadow: 0 24px 56px rgba(0,0,0,0.1); border-color: transparent; }
  .ib-prod-card.unavailable { opacity: 0.6; }

  .ib-prod-img-wrap { position: relative; overflow: hidden; height: 220px; background: #f4f3f0; }
  .ib-prod-img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s; padding: 0.5rem; }
  .ib-prod-card:hover .ib-prod-img { transform: scale(1.05); }

  .ib-prod-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(15,28,53,0.5) 0%, transparent 50%);
  }
  .ib-prod-badge {
    position: absolute; top: 1rem; right: 1rem;
    padding: 0.25rem 0.65rem; border-radius: 100px;
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
  }
  .ib-badge-instock { background: rgba(0,196,106,0.9); color: #fff; }
  .ib-badge-outstock { background: rgba(220,53,69,0.9); color: #fff; }
  .ib-badge-deleted { background: rgba(120,120,120,0.9); color: #fff; }

  .ib-prod-body { padding: 1.25rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; }
  .ib-prod-name { font-weight: 700; color: #0f1c35; font-size: 1.05rem; margin-bottom: 0.4rem; line-height: 1.3; }
  .ib-prod-stock { color: #999; font-size: 0.82rem; margin-bottom: 1rem; }
  .ib-prod-stock span { color: #f0a500; font-weight: 600; }
  .ib-prod-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
  .ib-prod-price { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #0f1c35; font-weight: 700; }
  .ib-prod-price sup { font-size: 0.9rem; font-family: 'DM Sans', sans-serif; font-weight: 600; }

  .ib-add-btn {
    background: #1b2a4a; color: #fff;
    padding: 0.6rem 1.25rem; border-radius: 10px;
    border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem;
    font-family: 'DM Sans', sans-serif; transition: all 0.2s;
    display: flex; align-items: center; gap: 0.4rem;
  }
  .ib-add-btn:hover:not(:disabled) { background: #f0a500; color: #0f1c35; transform: scale(1.04); }
  .ib-add-btn:disabled { background: #ddd; cursor: not-allowed; color: #999; }
  .ib-add-btn.added { background: #00c46a; }

  /* TOAST */
  .ib-toast {
    position: fixed; bottom: 2rem; right: 2rem;
    background: #0f1c35; color: #fff; padding: 0.85rem 1.5rem;
    border-radius: 12px; font-size: 0.9rem; font-weight: 600;
    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
    display: flex; align-items: center; gap: 0.5rem;
    animation: ib-slideIn 0.3s ease;
    z-index: 9999; border-left: 3px solid #f0a500;
  }
  @keyframes ib-slideIn { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }

  /* EMPTY */
  .ib-empty { text-align: center; padding: 5rem 2rem; }
  .ib-empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }
  .ib-empty h3 { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #0f1c35; margin-bottom: 0.5rem; }
  .ib-empty p { color: #999; font-size: 0.95rem; }

  /* SKELETON */
  .ib-skeleton { background: linear-gradient(90deg, #f0ede8 25%, #e8e4df 50%, #f0ede8 75%); background-size: 200% 100%; animation: ib-shimmer 1.5s infinite; border-radius: 8px; }
  @keyframes ib-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  @media(max-width:700px) {
    .ib-prod-grid { grid-template-columns: 1fr 1fr; }
    .ib-prod-header-top { flex-direction: column; align-items: flex-start; }
    .ib-search-wrap input { width: 100%; }
  }
  @media(max-width:480px) { .ib-prod-grid { grid-template-columns: 1fr; } }
`;

const FALLBACK = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [toast, setToast] = useState(null);
  const [added, setAdded] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
    const interval = setInterval(loadProducts, 5000);
    window.addEventListener("focus", loadProducts);
    return () => { clearInterval(interval); window.removeEventListener("focus", loadProducts); };
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get("/products");
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setProducts(data);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const handleAdd = (p) => {
    if (p.deleted || p.availableQuantity <= 0) return;

    addToCart({
      productId: p.productId,
      productName: p.productName,
      price: p.price,
      imageUrl: p.imageUrl
    });

    setAdded(p.productId);
    setToast(`"${p.productName}" added to cart!`);
    setTimeout(() => { setAdded(null); setToast(null); }, 2000);
  };

  const FILTERS = [
    { key: "ALL", label: "All Products" },
    { key: "INSTOCK", label: "In Stock" },
    { key: "OUTOFSTOCK", label: "Out of Stock" },
  ];

  const filtered = products.filter(p => {
    const matchSearch = p.productName?.toLowerCase().includes(search.toLowerCase());
    if (filter === "INSTOCK") {
      return matchSearch && !p.deleted && p.availableQuantity > 0;
    }
    if (filter === "OUTOFSTOCK") {
      return matchSearch && (p.deleted || p.availableQuantity <= 0);
    }
    return matchSearch;
  });

  return (
    <div className="ib-products">
      <style>{styles}</style>
      <div className="ib-products-inner">

        {/* HEADER */}
        <div className="ib-prod-header">
          <div className="ib-prod-header-top">
            <div>
              <div className="ib-prod-label">Catalogue</div>
              <h1 className="ib-prod-title">Explore Products</h1>
              <p className="ib-prod-count">{loading ? "Loading…" : `${filtered.length} products available`}</p>
            </div>
            <div className="ib-search-wrap">
              <span className="ib-search-icon">🔍</span>
              <input
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="ib-filter-tabs">
            {FILTERS.map(f => (
              <button key={f.key} className={`ib-filter-tab${filter===f.key?" active":""}`} onClick={()=>setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="ib-prod-grid">
            {[...Array(6)].map((_,i) => (
              <div key={i} style={{background:"#fff",borderRadius:18,overflow:"hidden",border:"1px solid #ebe9e3"}}>
                <div className="ib-skeleton" style={{height:220}} />
                <div style={{padding:"1.25rem 1.5rem"}}>
                  <div className="ib-skeleton" style={{height:18,marginBottom:8,width:"70%"}} />
                  <div className="ib-skeleton" style={{height:14,marginBottom:16,width:"40%"}} />
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div className="ib-skeleton" style={{height:28,width:"30%"}} />
                    <div className="ib-skeleton" style={{height:38,width:"40%",borderRadius:10}} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="ib-empty">
            <div className="ib-empty-icon">📦</div>
            <h3>No Products Found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="ib-prod-grid">
            {filtered.map(p => {
              const unavail = p.deleted || p.availableQuantity <= 0;
              const imgSrc = p.imageUrl || `https://picsum.photos/seed/${p.productId}/400/280`;
              return (
                <div className={`ib-prod-card${unavail?" unavailable":""}`} key={p.productId}>
                  <div className="ib-prod-img-wrap">
                    <img
                      className="ib-prod-img"
                      src={imgSrc}
                      alt={p.productName}
                      onError={e => { e.target.onerror=null; e.target.src=FALLBACK; }}
                    />
                    <div className="ib-prod-img-overlay" />
                    <span className={`ib-prod-badge ${p.deleted?"ib-badge-deleted":p.availableQuantity>0?"ib-badge-instock":"ib-badge-outstock"}`}>
                      {p.deleted ? "Unavailable" : p.availableQuantity > 0 ? "● In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="ib-prod-body">
                    <div className="ib-prod-name">{p.productName}</div>
                    <div className="ib-prod-stock">Stock: <span>{p.availableQuantity} units</span></div>
                    <div className="ib-prod-footer">
                      <div className="ib-prod-price"><sup>₹</sup>{p.price?.toLocaleString("en-IN")}</div>
                      <button
                        className={`ib-add-btn${added===p.productId?" added":""}`}
                        disabled={unavail}
                        onClick={() => handleAdd(p)}
                      >
                        {added===p.productId ? "✓ Added" : unavail ? "Unavailable" : "+ Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {toast && <div className="ib-toast">🛒 {toast}</div>}
    </div>
  );
}