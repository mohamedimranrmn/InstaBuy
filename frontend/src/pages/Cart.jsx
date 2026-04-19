import { useState } from "react";
import axios from "../api/axios";
import { useCart } from "../context/CartContext";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Cart() {
  const { cart, increaseQty, decreaseQty, removeItem, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.qty
        }))
      };

      const orderRes = await axios.post("/orders", payload);
      const order = orderRes.data;

      if (order.status === "FAILED") {
        alert(order.failureReason || "Order failed. Check stock availability.");
        setLoading(false);
        return;
      }

      const orderId = order.orderId;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Razorpay SDK failed to load. Check your internet connection.");
        setLoading(false);
        return;
      }

      const payRes = await axios.post("/payments/create-order", { orderId });
      const payData = payRes.data;

      const options = {
        key: "rzp_test_ScylNDSHyd9V2p",
        amount: payData.amount * 100,
        currency: "INR",
        name: "InstaBuy",
        description: `Order #${orderId}`,
        order_id: payData.transactionId,

        handler: async function (response) {
          try {
            await axios.post("/payments/confirm", {
              razorpayOrderId: payData.transactionId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: Number(orderId)
            });
            clearCart();
            alert("✅ Payment Successful! Order confirmed.");
            window.location.href = "/orders";
          } catch (err) {
            console.error("Confirmation failed", err);
            alert("Payment done but confirmation failed. Contact support.");
          }
        },

        modal: {
          ondismiss: async function () {
            try {
              await axios.post("/payments/fail", { orderId });
            } catch (e) {
              console.error("Fail notify error", e);
            }
            alert("❌ Payment cancelled. Order has been marked as failed.");
            window.location.href = "/orders";
          }
        },

        prefill: {
          name: "Customer",
          email: localStorage.getItem("email") || ""
        },

        theme: { color: "#ffc107" }
      };

      new window.Razorpay(options).open();

    } catch (error) {
      console.error("Checkout error", error);
      alert(error.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">

      <div className="text-center mb-5">
        <h1 className="fw-bold">Your Shopping Cart</h1>
        <p className="text-muted">Review items before checkout</p>
      </div>

      {cart.length === 0 ? (

        <div className="text-center mt-5">
          <h3>🛒 Cart is Empty</h3>
          <p className="text-muted">Add products to continue shopping</p>
        </div>

      ) : (

        <div className="row g-4">

          {/* LEFT - ITEMS */}
          <div className="col-lg-8">
            {cart.map((item) => (
              <div key={item.id} className="card shadow border-0 mb-4" style={{ borderRadius: "18px" }}>
                <div className="row g-0 align-items-center">

                  <div className="col-md-4">
                    <img
                      src={`https://picsum.photos/250/200?random=${item.id}`}
                      alt={item.name}
                      className="img-fluid"
                      style={{
                        borderTopLeftRadius: "18px",
                        borderBottomLeftRadius: "18px",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </div>

                  <div className="col-md-8">
                    <div className="card-body">
                      <h4 className="fw-bold">{item.name}</h4>
                      <h5 className="text-success">₹ {item.price}</h5>

                      <div className="d-flex align-items-center gap-2 mt-3">
                        <button className="btn btn-outline-dark" onClick={() => decreaseQty(item.id)}>−</button>
                        <span className="fw-bold">{item.qty}</span>
                        <button className="btn btn-outline-dark" onClick={() => increaseQty(item.id)}>+</button>
                        <button className="btn btn-danger ms-3" onClick={() => removeItem(item.id)}>Remove</button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* RIGHT - SUMMARY */}
          <div className="col-lg-4">
            <div className="card shadow border-0 p-4" style={{ borderRadius: "18px", position: "sticky", top: "100px" }}>
              <h3 className="fw-bold mb-4">Order Summary</h3>

              <div className="d-flex justify-content-between mb-3">
                <span>Items</span>
                <span>{cart.length}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>Total</span>
                <span className="fw-bold text-success">₹ {total}</span>
              </div>

              <hr />

              <button
                className="btn btn-warning fw-bold w-100 py-2"
                style={{ borderRadius: "12px" }}
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Cart;