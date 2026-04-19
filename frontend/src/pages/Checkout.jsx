import { useState } from "react";
import { useCart } from "../context/CartContext";

function Checkout() {
  const { cart, total } = useCart();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const handlePayment = () => {
    alert("Payment Integration Coming Next");
  };

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>

      <div className="row mt-4">

        <div className="col-md-6">
          <h4>Delivery Details</h4>

          <input
            className="form-control mb-3"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            className="form-control mb-3"
            placeholder="Address"
            rows="4"
            onChange={(e) => setAddress(e.target.value)}
          ></textarea>

          <input
            className="form-control mb-3"
            placeholder="Phone Number"
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <h4>Order Summary</h4>

          {cart.map(item => (
            <div key={item.id} className="border p-2 mb-2 rounded">
              {item.name} x {item.qty}
              <span className="float-end">
                ₹ {item.price * item.qty}
              </span>
            </div>
          ))}

          <h4 className="mt-3">Total: ₹ {total}</h4>

          <button
            className="btn btn-success w-100 mt-3"
            onClick={handlePayment}
          >
            Pay Now
          </button>
        </div>

      </div>
    </div>
  );
}

export default Checkout;