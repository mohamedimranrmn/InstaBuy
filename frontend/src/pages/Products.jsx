import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useCart } from "../context/CartContext";
import fallbackImg from "../assets/fallback.jpeg";

function Products() {
const [products, setProducts] = useState([]);
const { addToCart } = useCart();

useEffect(() => {
  loadProducts();

  const interval = setInterval(loadProducts, 5000);

  const handleFocus = () => loadProducts();
  window.addEventListener("focus", handleFocus);

  return () => {
    clearInterval(interval);
    window.removeEventListener("focus", handleFocus);
  };
}, []);


const loadProducts = async () => {
try {
const res = await axios.get("/products");
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else if (res.data.content) {
        setProducts(res.data.content);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.log(error);
      setProducts([]);
    }
};

const handleAdd = (p) => {
if (p.deleted || p.availableQuantity <= 0) return;

addToCart({
  id: p.productId,
  name: p.productName,
  price: p.price
});

alert("Added to Cart");
};

return ( <div className="container py-5">

  {/* HEADER */}
  <div className="text-center mb-5">
    <h1 className="fw-bold">Explore Products</h1>
    <p className="text-muted">Premium products at best prices</p>
  </div>

  {/* PRODUCTS */}
  <div className="row g-4">

    {products.map((p) => {
      const isUnavailable = p.deleted || p.availableQuantity <= 0;

      return (
        <div className="col-md-4 col-sm-6" key={p.productId}>
          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "18px",
              transition: "0.3s",
              filter: p.deleted ? "blur(2px)" : "none",
              opacity: p.deleted ? 0.6 : 1
            }}
          >

            {/* IMAGE */}
              <img
                src={
                  p.imageUrl
                    ? p.imageUrl
                    : `https://source.unsplash.com/300x220/?${encodeURIComponent(p.productName)}`
                }
                onError={(e) => {
                  e.target.onerror = null; // prevent infinite loop
                  e.target.src = fallbackImg;
                }}
                alt={p.productName}
                className="card-img-top"
                style={{
                  borderTopLeftRadius: "18px",
                  borderTopRightRadius: "18px",
                  height: "220px",
                  objectFit: "cover"
                }}
              />

            <div className="card-body text-center">

              <h4 className="fw-bold mb-3">
                {p.productName}
              </h4>

              <h3 className="text-success fw-bold">
                ₹ {p.price}
              </h3>

              <p className="text-muted mb-3">
                Stock Available: {p.availableQuantity}
              </p>

              {/* STATUS BADGE */}
              <span
                className={`badge px-3 py-2 mb-3 ${
                  p.deleted
                    ? "bg-secondary"
                    : p.availableQuantity > 0
                    ? "bg-success"
                    : "bg-danger"
                }`}
              >
                {p.deleted
                  ? "Unavailable"
                  : p.availableQuantity > 0
                  ? "In Stock"
                  : "Out of Stock"}
              </span>

              <div className="d-grid mt-3">
                <button
                  className="btn btn-warning fw-bold"
                  style={{ borderRadius: "12px" }}
                  disabled={isUnavailable}
                  onClick={() => handleAdd(p)}
                >
                  {p.deleted
                    ? "Unavailable"
                    : p.availableQuantity > 0
                    ? "Add to Cart"
                    : "Out of Stock"}
                </button>
              </div>

            </div>

          </div>
        </div>
      );
    })}

  </div>

  {/* EMPTY */}
  {products.length === 0 && (
    <div className="text-center mt-5">
      <h4>No Products Found</h4>
    </div>
  )}

</div>
);
}

export default Products;
