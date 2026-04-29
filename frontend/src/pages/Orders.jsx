import { useEffect, useState } from "react";
import axios from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
  .ib-orders * { box-sizing: border-box; }
  .ib-orders { font-family: 'DM Sans', sans-serif; background: #f8f7f4; min-height: 100vh; padding: 3rem 2rem; }
  .ib-orders-inner { max-width: 1000px; margin: 0 auto; }

  .ib-orders-header { margin-bottom: 2.5rem; }
  .ib-orders-label { color: #f0a500; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.4rem; }
  .ib-orders-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: #0f1c35; font-weight: 700; }
  .ib-orders-sub { color: #999; font-size: 0.9rem; margin-top: 0.3rem; }

  /* FILTER TABS */
  .ib-orders-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
  .ib-orders-tab {
    padding: 0.4rem 1rem; border-radius: 100px;
    border: 1px solid #e0ddd6; background: #fff;
    color: #666; font-size: 0.82rem; font-weight: 600; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .ib-orders-tab.active { background: #1b2a4a; border-color: #1b2a4a; color: #fff; }

  /* ORDER CARD */
  .ib-order-card {
    background: #fff; border-radius: 18px; border: 1px solid #ebe9e3;
    margin-bottom: 1.25rem; overflow: hidden; transition: all 0.2s;
  }
  .ib-order-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }

  .ib-order-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1.25rem 1.5rem; background: #f8f7f4; border-bottom: 1px solid #ebe9e3;
    flex-wrap: wrap; gap: 0.75rem;
  }
  .ib-order-id { font-weight: 700; color: #0f1c35; font-size: 1rem; }
  .ib-order-id span { color: #1b2a4a; font-family: 'Playfair Display', serif; }
  .ib-order-date { color: #999; font-size: 0.82rem; margin-top: 0.15rem; }
  .ib-order-amount { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: #0f1c35; font-weight: 700; }

  /* STATUS BADGE */
  .ib-status { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.8rem; border-radius: 100px; font-size: 0.75rem; font-weight: 700; }
  .ib-status-dot { width: 6px; height: 6px; border-radius: 50%; }

  .ib-order-body { padding: 1.25rem 1.5rem; }

  /* JOURNEY */
  .ib-journey { display: flex; align-items: center; gap: 0; margin-bottom: 1.25rem; overflow-x: auto; }
  .ib-journey-step { display: flex; align-items: center; gap: 0; flex-shrink: 0; }
  .ib-journey-dot {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700;
  }
  .ib-journey-dot.done { background: #00c46a; color: #fff; }
  .ib-journey-dot.current { background: #f0a500; color: #0f1c35; }
  .ib-journey-dot.pending { background: #ebe9e3; color: #bbb; }
  .ib-journey-dot.fail { background: #e74c3c; color: #fff; }
  .ib-journey-label { font-size: 0.72rem; color: #999; margin-top: 0.2rem; text-align: center; white-space: nowrap; }
  .ib-journey-line { width: 40px; height: 2px; background: #ebe9e3; flex-shrink: 0; }
  .ib-journey-line.done { background: #00c46a; }
  .ib-journey-wrap { display: flex; flex-direction: column; align-items: center; }

  /* ITEMS TABLE */
  .ib-items-title { font-weight: 700; color: #0f1c35; font-size: 0.85rem; margin-bottom: 0.75rem; }
  .ib-items-list { border: 1px solid #ebe9e3; border-radius: 10px; overflow: hidden; margin-bottom: 1.25rem; }
  .ib-item-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; font-size: 0.85rem; border-bottom: 1px solid #f4f3f0; }
  .ib-item-row:last-child { border-bottom: none; }
  .ib-item-row-label { color: #555; display: flex; align-items: center; gap: 0.75rem; }
  .ib-item-row-val { font-weight: 600; color: #0f1c35; white-space: nowrap; margin-left: 1rem; }

  /* PRODUCT THUMB */
  .ib-product-thumb {
    width: 40px; height: 40px; object-fit: cover;
    border-radius: 6px; border: 1px solid #ebe9e3; flex-shrink: 0;
  }
  .ib-product-info { display: flex; flex-direction: column; gap: 0.1rem; }
  .ib-product-name { font-weight: 600; color: #0f1c35; font-size: 0.85rem; }
  .ib-product-qty { font-size: 0.75rem; color: #999; }

  /* ALERTS */
  .ib-alert { padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.85rem; margin-bottom: 1rem; font-weight: 600; }
  .ib-alert-danger { background: #fff2f2; border: 1px solid #fcc; color: #c0392b; }
  .ib-alert-info { background: #f0f7ff; border: 1px solid #b3d7ff; color: #1b6ab0; }
  .ib-alert-success { background: #f0fff8; border: 1px solid #b3f0d5; color: #0a7a4a; }
  .ib-alert-warning { background: #fffbf0; border: 1px solid #fce4a0; color: #8a6000; }

  /* ACTIONS */
  .ib-order-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .ib-action-btn {
    padding: 0.6rem 1.25rem; border-radius: 10px; font-size: 0.85rem; font-weight: 700;
    cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
  }
  .ib-action-btn.pay { background: linear-gradient(135deg, #00c46a, #00a857); color: #fff; }
  .ib-action-btn.pay:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,196,106,0.35); }
  .ib-action-btn.cancel { background: #fff; border: 1px solid #e74c3c; color: #e74c3c; }
  .ib-action-btn.cancel:hover { background: #e74c3c; color: #fff; }
  .ib-action-btn.refund { background: #fff; border: 1px solid #f0a500; color: #c47d00; }
  .ib-action-btn.refund:hover { background: #f0a500; color: #0f1c35; }

  /* EMPTY */
  .ib-orders-empty { text-align: center; padding: 5rem 2rem; background: #fff; border-radius: 20px; border: 1px solid #ebe9e3; }
  .ib-orders-empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }
  .ib-orders-empty h3 { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #0f1c35; margin-bottom: 0.5rem; }
  .ib-orders-empty p { color: #999; }

  @media(max-width:600px) {
    .ib-order-head { flex-direction: column; }
    .ib-orders-title { font-size: 1.75rem; }
  }
`;

const STATUS_CONFIG = {
  COMPLETED:          { label: "Completed",         dot: "#00c46a", bg: "#f0fff8", text: "#0a7a4a" },
  FAILED:             { label: "Failed",            dot: "#e74c3c", bg: "#fff2f2", text: "#c0392b" },
  PAYMENT_PENDING:    { label: "Payment Pending",   dot: "#f0a500", bg: "#fffbf0", text: "#8a6000" },
  CREATED:            { label: "Processing",        dot: "#f0a500", bg: "#fffbf0", text: "#8a6000" },
  INVENTORY_RESERVED: { label: "Reserved",          dot: "#1b6ab0", bg: "#f0f7ff", text: "#1b6ab0" },
  CANCELLED:          { label: "Cancelled",         dot: "#aaa",    bg: "#f5f5f5", text: "#777" },
  CANCEL_REQUESTED:   { label: "Refund Requested",  dot: "#f0a500", bg: "#fffbf0", text: "#8a6000" },
  REFUNDED:           { label: "Refunded",          dot: "#1b6ab0", bg: "#f0f7ff", text: "#1b6ab0" },
  REFUND_REJECTED:    { label: "Refund Rejected",   dot: "#e74c3c", bg: "#fff2f2", text: "#c0392b" },
};

const JOURNEY_STEPS = ["Placed", "Payment", "Confirmed"];

function getJourneyState(status) {
  const s = status?.toUpperCase();
  if (s === "COMPLETED") return [2,2,2];
  if (s === "FAILED") return [2,3,3];
  if (["PAYMENT_PENDING","CREATED","INVENTORY_RESERVED"].includes(s)) return [2,1,0];
  if (["CANCELLED","CANCEL_REQUESTED"].includes(s)) return [2,3,3];
  if (s === "REFUNDED") return [2,2,2];
  return [1,0,0];
}

const TABS = ["ALL","COMPLETED","PAYMENT_PENDING","FAILED","CANCELLED","REFUNDED"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [productMap, setProductMap] = useState({});

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await axios.get("/orders");
      setOrders(res.data.sort((a, b) => b.orderId - a.orderId));
    } catch {}
    finally { setLoading(false); }
  };

  const loadProducts = async () => {
    try {
      const res = await axios.get("/products");
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      const map = {};
      data.forEach(p => { map[p.productId] = p; });
      setProductMap(map);
    } catch {}
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try { await axios.post(`/orders/cancel/${id}`); loadOrders(); }
    catch (e) { alert(e.response?.data?.message || "Cancel failed"); }
  };

  const requestRefund = async (id) => {
    if (!window.confirm("Request a refund for this order?")) return;
    try { await axios.post(`/orders/cancel/${id}`); alert("Refund request submitted."); loadOrders(); }
    catch (e) { alert(e.response?.data?.message || "Refund request failed"); }
  };

  const handlePayNow = async (order) => {
    try {
      const res = await axios.post("/payments/create-order", { orderId: order.orderId });
      const payData = res.data;
      new window.Razorpay({
        key: "rzp_test_ScylNDSHyd9V2p",
        amount: payData.amount * 100, currency: "INR",
        name: "InstaBuy", description: "Order Payment",
        order_id: payData.transactionId,
        handler: async (response) => {
          await axios.post("/payments/confirm", {
            orderId: order.orderId, razorpayOrderId: payData.transactionId,
            razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature,
          });
          alert("Payment Successful!"); loadOrders();
        },
        modal: { ondismiss: async () => { await axios.post("/payments/fail", { orderId: order.orderId }); loadOrders(); } }
      }).open();
    } catch { alert("Payment initiation failed"); }
  };

  const isCancellable = (s) => ["CREATED","INVENTORY_RESERVED","PAYMENT_PENDING"].includes(s?.toUpperCase());

  const filtered = tab === "ALL" ? orders : orders.filter(o => o.status?.toUpperCase() === tab);
  const countOf = (t) => t === "ALL" ? orders.length : orders.filter(o => o.status?.toUpperCase() === t).length;

  const getDaysLeft = (createdAt) => {
    const orderDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now - orderDate;
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return 5 - daysPassed;
  };

  return (
    <div className="ib-orders">
      <style>{styles}</style>
      <div className="ib-orders-inner">
        <div className="ib-orders-header">
          <div className="ib-orders-label">My Account</div>
          <h1 className="ib-orders-title">My Orders</h1>
          <p className="ib-orders-sub">{loading ? "Loading…" : `${orders.length} total orders`}</p>
        </div>

        <div className="ib-orders-tabs">
          {TABS.map(t => (
            <button key={t} className={`ib-orders-tab${tab===t?" active":""}`} onClick={() => setTab(t)}>
              {t.replace(/_/g," ")} ({countOf(t)})
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{color:"#999",textAlign:"center",padding:"3rem"}}>Loading your orders…</p>
        ) : filtered.length === 0 ? (
          <div className="ib-orders-empty">
            <div className="ib-orders-empty-icon">📋</div>
            <h3>No orders found</h3>
            <p>Orders will appear here once you place them.</p>
          </div>
        ) : (
          filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status?.toUpperCase()] || { label: order.status, dot: "#aaa", bg: "#f5f5f5", text: "#777" };
            const journey = getJourneyState(order.status);
            const cancellable = isCancellable(order.status);
            const daysLeft = getDaysLeft(order.createdAt);
            const refundExpired = daysLeft <= 0;

            return (
              <div className="ib-order-card" key={order.orderId}>
                <div className="ib-order-head">
                  <div>
                    <div className="ib-order-id">Order <span>#{order.orderId}</span></div>
                    <div className="ib-order-date">{new Date(order.createdAt).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
                    <span className="ib-status" style={{background:cfg.bg,color:cfg.text}}>
                      <span className="ib-status-dot" style={{background:cfg.dot}} />
                      {cfg.label}
                    </span>
                    <div className="ib-order-amount">₹{order.totalAmount?.toLocaleString("en-IN")}</div>
                  </div>
                </div>

                <div className="ib-order-body">
                  {/* JOURNEY */}
                  <div className="ib-journey" style={{marginBottom:"1.25rem"}}>
                    {JOURNEY_STEPS.map((step, i) => {
                      const state = journey[i]; // 0=pending, 1=current, 2=done, 3=fail
                      return (
                        <div className="ib-journey-step" key={step}>
                          <div className="ib-journey-wrap">
                            <div className={`ib-journey-dot ${state===2?"done":state===1?"current":state===3?"fail":"pending"}`}>
                              {state===2?"✓":state===3?"✕":i+1}
                            </div>
                            <div className="ib-journey-label">{step}</div>
                          </div>
                          {i < JOURNEY_STEPS.length-1 && <div className={`ib-journey-line${state===2?" done":""}`} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* FAILURE */}
                  {order.failureReason && <div className="ib-alert ib-alert-danger">⚠ {order.failureReason}</div>}

                  {/* ITEMS */}
                  {order.items?.length > 0 && (
                    <>
                      <div className="ib-items-title">Items</div>
                      <div className="ib-items-list">
                        {order.items.map((item, idx) => {
                          const product = productMap[item.productId];
                          return (
                            <div className="ib-item-row" key={idx}>
                              <span className="ib-item-row-label">
                                <img
                                  src={product?.imageUrl || "https://via.placeholder.com/40"}
                                  alt={product?.productName || `Product #${item.productId}`}
                                  className="ib-product-thumb"
                                />
                                <div className="ib-product-info">
                                  <span className="ib-product-name">
                                    {product?.productName || `Product #${item.productId}`}
                                  </span>
                                  <span className="ib-product-qty">Qty: {item.quantity}</span>
                                </div>
                              </span>
                              <span className="ib-item-row-val">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* STATUS ALERTS */}
                  {order.status?.toUpperCase() === "CANCEL_REQUESTED" && <div className="ib-alert ib-alert-info">⏳ Refund request is under admin review.</div>}
                  {order.status?.toUpperCase() === "REFUNDED" && <div className="ib-alert ib-alert-success">✅ Refund has been processed successfully.</div>}
                  {order.status?.toUpperCase() === "REFUND_REJECTED" && <div className="ib-alert ib-alert-danger">❌ Refund request was rejected.</div>}

                  {/* ACTIONS */}
                  <div className="ib-order-actions">
                    {cancellable && order.status?.toUpperCase() === "PAYMENT_PENDING" && (
                      <button className="ib-action-btn pay" onClick={() => handlePayNow(order)}>💳 Pay Now</button>
                    )}
                    {cancellable && (
                      <button className="ib-action-btn cancel" onClick={() => cancelOrder(order.orderId)}>Cancel Order</button>
                    )}
                    {order.status?.toUpperCase() === "COMPLETED" && (
                      <button
                        className="ib-action-btn refund"
                        disabled={refundExpired}
                        style={{ opacity: refundExpired ? 0.5 : 1, cursor: refundExpired ? "not-allowed" : "pointer" }}
                        onClick={() => {
                          if (refundExpired) { alert("Refund period expired (5 days only)"); return; }
                          requestRefund(order.orderId);
                        }}
                      >
                        ↩ Request Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}