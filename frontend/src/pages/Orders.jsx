import { useEffect, useState } from "react";
import axios from "../api/axios";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await axios.get("/orders");
      setOrders(res.data.sort((a, b) => b.orderId - a.orderId));
    } catch (error) {
      console.log(error);
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      // ✅ Fixed path: /orders/cancel/:id
      await axios.post(`/orders/cancel/${id}`);
      alert("Order Cancelled Successfully");
      loadOrders();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Cancel Failed");
    }
  };

  const handlePayNow = async (order) => {
    try {
      // 1. Create Razorpay order
      const res = await axios.post("/payments/create-order", {
        orderId: order.orderId
      });

      const paymentData = res.data;

      // 2. Open Razorpay
      const options = {
        key: "rzp_test_ScylNDSHyd9V2p", // your key
        amount: paymentData.amount * 100,
        currency: "INR",
        name: "InstaBuy",
        description: "Order Payment",
        order_id: paymentData.transactionId,

        handler: async function (response) {
          // SUCCESS
          await axios.post("/payments/confirm", {
            orderId: order.orderId,
            razorpayOrderId: paymentData.transactionId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });

          alert("Payment Successful");
          loadOrders();
        },

        modal: {
          ondismiss: async function () {
            // FAILURE / CANCEL
            await axios.post("/payments/fail", {
              orderId: order.orderId
            });

            alert("Payment Failed / Cancelled");
            loadOrders();
          }
        }
      };

      new window.Razorpay(options).open();

    } catch (error) {
      console.log(error);
      alert("Payment initiation failed");
    }
  };

  const requestRefund = async (id) => {
    if (!window.confirm("Request a refund for this completed order?")) return;
    try {
      // Completed orders → cancel triggers CANCEL_REQUESTED state
      // Admin then approves/rejects from Admin dashboard
      await axios.post(`/orders/cancel/${id}`);
      alert("Refund request submitted. Admin will review shortly.");
      loadOrders();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Refund request failed");
    }
  };

  const getBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "COMPLETED") return "bg-success";
    if (s === "FAILED") return "bg-danger";
    if (s === "PAYMENT_PENDING" || s === "CREATED" || s === "INVENTORY_RESERVED")
      return "bg-warning text-dark";
    if (s === "REFUNDED") return "bg-primary";
    if (s === "CANCELLED") return "bg-secondary";
    if (s === "CANCEL_REQUESTED") return "bg-info text-dark";
    if (s === "REFUND_PENDING") return "bg-warning text-dark";
    return "bg-dark";
  };

  // ✅ Fixed: all statuses where cancel is allowed before payment completes
  const isCancellable = (status) => {
    return ["CREATED", "INVENTORY_RESERVED", "PAYMENT_PENDING"].includes(
      status?.toUpperCase()
    );
  };

  return (
    <div className="container py-5">

      {/* HEADER */}
      <div className="text-center mb-5">
        <h1 className="fw-bold">My Orders</h1>
        <p className="text-muted">Track all your purchases</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center mt-5">
          <h4>No Orders Found</h4>
          <p className="text-muted">Place an order to see it here.</p>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order.orderId} className="col-lg-6">
              <div
                className="card shadow-lg border-0 h-100"
                style={{ borderRadius: "18px" }}
              >
                <div className="card-body p-4">

                  {/* TOP */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Order #{order.orderId}</h5>
                    <span className={`badge ${getBadge(order.status)}`}>
                      {order.status?.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* INFO */}
                  <p className="mb-1">
                    <strong>Total:</strong> ₹ {order.totalAmount.toLocaleString("en-IN")}
                  </p>
                  <p className="mb-2 text-muted">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>

                  {/* FAILURE REASON */}
                  {order.failureReason && (
                    <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.85rem" }}>
                      ⚠ {order.failureReason}
                    </div>
                  )}

                  {/* ORDER JOURNEY */}
                  <div className="mb-3">
                    <small className="text-muted">Order Journey</small>
                    <div className="mt-1">
                      <span>Placed</span>
                      {" → "}
                      <span>Payment</span>
                      {" → "}
                      <b>{order.status?.replace(/_/g, " ")}</b>
                    </div>
                  </div>

                  {/* ITEMS */}
                  <h6 className="fw-bold mt-3">Items</h6>
                  <ul className="list-group list-group-flush mb-3">
                    {order.items?.map((item, index) => (
                      <li key={index} className="list-group-item px-0 py-1">
                        Product #{item.productId} | Qty: {item.quantity} | ₹ {item.price}
                      </li>
                    ))}
                  </ul>

                  {/* ✅ CANCEL BUTTON - works for pre-payment statuses */}
                  {isCancellable(order.status) && (
                    <div className="d-flex gap-2 mb-2">

                      {/* ✅ PAY NOW (ONLY FOR PAYMENT_PENDING) */}
                      {order.status?.toUpperCase() === "PAYMENT_PENDING" && (
                        <button
                          className="btn btn-success w-50"
                          onClick={() => handlePayNow(order)}
                        >
                          Pay Now
                        </button>
                      )}

                      {/* ✅ CANCEL */}
                      <button
                        className="btn btn-danger w-50"
                        onClick={() => cancelOrder(order.orderId)}
                      >
                        Cancel
                      </button>

                    </div>
                  )}

                  {/* ✅ REFUND REQUEST BUTTON - only for completed orders */}
                  {order.status?.toUpperCase() === "COMPLETED" && (
                    <button
                      className="btn btn-outline-warning w-100"
                      onClick={() => requestRefund(order.orderId)}
                    >
                      Cancel and Request Refund
                    </button>
                  )}

                  {/* INFO for pending refund */}
                  {order.status?.toUpperCase() === "CANCEL_REQUESTED" && (
                    <div className="alert alert-info py-2 px-3 mb-0" style={{ fontSize: "0.85rem" }}>
                      ⏳ Refund request is under admin review.
                    </div>
                  )}

                  {order.status?.toUpperCase() === "REFUNDED" && (
                    <div className="alert alert-success py-2 px-3 mb-0" style={{ fontSize: "0.85rem" }}>
                      ✅ Refund has been processed.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;