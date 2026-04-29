import { useState } from "react";
    import axios from "../api/axios";
    import { useCart } from "../context/CartContext";
    import { Link } from "react-router-dom";

    const styles = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
      .ib-cartimg * { box-sizing: border-box; }
      .ib-cartimg { font-family: 'DM Sans', sans-serif; background: #f8f7f4; min-height: 100vh; padding: 3rem 2rem; }
      .ib-cart-inner { max-width: 1100px; margin: 0 auto; }

      .ib-cart-header { margin-bottom: 2rem; }
      .ib-cart-label { color: #f0a500; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.4rem; }
      .ib-cart-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: #0f1c35; font-weight: 700; }
      .ib-cart-sub { color: #999; font-size: 0.9rem; margin-top: 0.3rem; }

      .ib-cart-layout { display: grid; grid-template-columns: 1fr 360px; gap: 2rem; align-items: start; }

      /* ITEMS */
      .ib-cart-items { display: flex; flex-direction: column; gap: 1rem; }
      .ib-cart-item {
        background: #fff; border-radius: 16px; border: 1px solid #ebe9e3;
        display: flex; gap: 1.25rem; padding: 1.25rem;
        transition: all 0.2s; align-items: center;
      }
      .ib-cart-item:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
      .ib-cart-item-img {
        width: 90px; height: 90px; border-radius: 12px; object-fit: cover;
        flex-shrink: 0; background: #f4f3f0;
      }
      .ib-cart-item-info { flex: 1; min-width: 0; }
      .ib-cart-item-name { font-weight: 700; color: #0f1c35; font-size: 1rem; margin-bottom: 0.3rem; }
      .ib-cart-item-price { color: #f0a500; font-weight: 700; font-size: 1.05rem; margin-bottom: 0.75rem; }
      .ib-cart-item-controls { display: flex; align-items: center; gap: 0.5rem; }
      .ib-qty-btn {
        width: 32px; height: 32px; border-radius: 8px;
        border: 1px solid #e0ddd6; background: #f8f7f4;
        font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
        font-weight: 700; color: #0f1c35; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
      }
      .ib-qty-btn:hover { background: #1b2a4a; color: #fff; border-color: #1b2a4a; }
      .ib-qty-val { font-weight: 700; font-size: 1rem; color: #0f1c35; min-width: 24px; text-align: center; }
      .ib-remove-btn {
        background: none; border: none; cursor: pointer;
        color: #ccc; font-size: 1.2rem; padding: 0.25rem;
        transition: color 0.15s; margin-left: auto;
      }
      .ib-remove-btn:hover { color: #e74c3c; }
      .ib-item-subtotal { font-weight: 700; color: #0f1c35; font-size: 1.05rem; white-space: nowrap; }

      /* SUMMARY */
      .ib-cart-summary {
        background: #fff; border-radius: 20px; border: 1px solid #ebe9e3;
        padding: 1.75rem; position: sticky; top: 1rem;
      }
      .ib-summary-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: #0f1c35; font-weight: 700; margin-bottom: 1.5rem; }
      .ib-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; }
      .ib-summary-label { color: #777; font-size: 0.9rem; }
      .ib-summary-val { color: #0f1c35; font-weight: 600; font-size: 0.95rem; }
      .ib-summary-divider { height: 1px; background: #ebe9e3; margin: 0.75rem 0; }
      .ib-summary-total-label { font-weight: 700; color: #0f1c35; font-size: 1rem; }
      .ib-summary-total-val { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #0f1c35; font-weight: 700; }
      .ib-checkout-btn {
        width: 100%; padding: 0.95rem; border-radius: 12px;
        background: linear-gradient(135deg, #f0a500, #e8960a);
        color: #0f1c35; font-weight: 700; font-size: 1rem;
        border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
        margin-top: 1.25rem; transition: all 0.2s; letter-spacing: 0.02em;
      }
      .ib-checkout-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(240,165,0,0.35); }
      .ib-checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .ib-continue-link {
        display: block; text-align: center; margin-top: 0.75rem;
        color: #1b2a4a; font-size: 0.85rem; font-weight: 600; text-decoration: none;
        transition: color 0.15s;
      }
      .ib-continue-link:hover { color: #f0a500; }
      .ib-summary-secure {
        display: flex; align-items: center; gap: 0.4rem; justify-content: center;
        margin-top: 1rem; color: #bbb; font-size: 0.78rem;
      }

      /* EMPTY */
      .ib-cart-empty {
        text-align: center; padding: 6rem 2rem; background: #fff;
        border-radius: 20px; border: 1px solid #ebe9e3;
      }
      .ib-cart-empty-icon { font-size: 4rem; margin-bottom: 1.25rem; }
      .ib-cart-empty h2 { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: #0f1c35; margin-bottom: 0.5rem; }
      .ib-cart-empty p { color: #999; margin-bottom: 2rem; }
      .ib-shop-btn {
        background: #1b2a4a; color: #fff; padding: 0.8rem 2rem;
        border-radius: 10px; text-decoration: none; font-weight: 700;
        font-size: 0.95rem; display: inline-block; transition: all 0.2s;
      }
      .ib-shop-btn:hover { background: #f0a500; color: #0f1c35; }

      @media(max-width:900px) {
        .ib-cart-layout { grid-template-columns: 1fr; }
        .ib-cart-summary { position: static; }
      }
      @media(max-width:600px) {
        .ib-cart-item { flex-direction: column; }
        .ib-cart-item-img { width: 100%; height: 160px; }
        .ib-remove-btn { margin-left: 0; }
      }
    `;

    const FALLBACK = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop";

    function loadRazorpayScript() {
      return new Promise(resolve => {
        if (window.Razorpay) { resolve(true); return; }
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
      });
    }

    export default function Cart() {
      const { cart, increaseQty, decreaseQty, removeItem, total, clearCart } = useCart();
      const [loading, setLoading] = useState(false);

      const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
          const payload = { items: cart.map(i => ({ productId: i.productId, quantity: i.qty })) };
          const orderRes = await axios.post("/orders", payload);
          const order = orderRes.data;
          if (order.status === "FAILED") { alert(order.failureReason || "Order failed."); return; }

          const loaded = await loadRazorpayScript();
          if (!loaded) { alert("Razorpay failed to load."); return; }

          const payRes = await axios.post("/payments/create-order", { orderId: order.orderId });
          const payData = payRes.data;

          new window.Razorpay({
            key: "rzp_test_ScylNDSHyd9V2p",
            amount: payData.amount * 100,
            currency: "INR",
            name: "InstaBuy",
            description: `Order #${order.orderId}`,
            order_id: payData.transactionId,
            handler: async (response) => {
              try {
                await axios.post("/payments/confirm", {
                  razorpayOrderId: payData.transactionId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderId: Number(order.orderId),
                });
                clearCart();
                alert("✅ Payment Successful! Order confirmed.");
                window.location.href = "/orders";
              } catch { alert("Payment done but confirmation failed. Contact support."); }
            },
            modal: {
              ondismiss: async () => {
                try { await axios.post("/payments/fail", { orderId: order.orderId }); } catch {}
                alert("❌ Payment cancelled.");
                window.location.href = "/orders";
              }
            },
            prefill: { email: localStorage.getItem("email") || "" },
            theme: { color: "#f0a500" }
          }).open();
        } catch (err) {
          alert(err.response?.data?.message || "Checkout failed.");
        } finally { setLoading(false); }
      };

      return (
        <div className="ib-cartimg">
          <style>{styles}</style>
          <div className="ib-cart-inner">
            <div className="ib-cart-header">
              <div className="ib-cart-label">Shopping Cart</div>
              <h1 className="ib-cart-title">Your Cart</h1>
              <p className="ib-cart-sub">{cart.length === 0 ? "Your cart is empty" : `${cart.reduce((s,i)=>s+i.qty,0)} items ready for checkout`}</p>
            </div>

            {cart.length === 0 ? (
              <div className="ib-cart-empty">
                <div className="ib-cart-empty-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything yet.</p>
                <Link to="/products" className="ib-shop-btn">Browse Products →</Link>
              </div>
            ) : (
              <div className="ib-cart-layout">
                <div className="ib-cart-items">
                  {cart.map(item => (
                    <div className="ib-cart-item" key={item.productId}>
                      <img
                        className="ib-cart-item-img"
                        src={item.imageUrl || `https://picsum.photos/seed/${item.productId}/200/200`}
                        alt={item.productName}
                        onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }}
                      />
                      <div className="ib-cart-item-info">
                        <div className="ib-cart-item-name">{item.productName}</div>
                        <div className="ib-cart-item-price">₹{item.price?.toLocaleString("en-IN")}</div>
                        <div className="ib-cart-item-controls">
                          <button className="ib-qty-btn" onClick={() => decreaseQty(item.productId)}>−</button>
                          <span className="ib-qty-val">{item.qty}</span>
                          <button className="ib-qty-btn" onClick={() => increaseQty(item.productId)}>+</button>
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.5rem"}}>
                        <button className="ib-remove-btn" onClick={() => removeItem(item.productId)} title="Remove">✕</button>
                        <div className="ib-item-subtotal">₹{(item.price * item.qty).toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ib-cart-summary">
                  <div className="ib-summary-title">Order Summary</div>
                  <div className="ib-summary-row">
                    <span className="ib-summary-label">Items ({cart.reduce((s,i)=>s+i.qty,0)})</span>
                    <span className="ib-summary-val">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="ib-summary-row">
                    <span className="ib-summary-label">Delivery</span>
                    <span style={{color:"#00c46a",fontWeight:700,fontSize:"0.9rem"}}>FREE</span>
                  </div>
                  <div className="ib-summary-divider" />
                  <div className="ib-summary-row">
                    <span className="ib-summary-total-label">Total</span>
                    <span className="ib-summary-total-val">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <button className="ib-checkout-btn" onClick={handleCheckout} disabled={loading}>
                    {loading ? "⏳ Processing…" : "🔒 Proceed to Checkout"}
                  </button>
                  <Link to="/products" className="ib-continue-link">← Continue Shopping</Link>
                  <div className="ib-summary-secure">🔐 Secured by Razorpay</div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }