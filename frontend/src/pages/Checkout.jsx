import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
  .ib-checkout * { box-sizing: border-box; }
  .ib-checkout {
    font-family: 'DM Sans', sans-serif;
    background: #f8f7f4; min-height: 100vh; padding: 3rem 2rem;
  }
  .ib-checkout-inner { max-width: 1050px; margin: 0 auto; }

  /* HEADER */
  .ib-checkout-label { color: #f0a500; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.4rem; }
  .ib-checkout-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: #0f1c35; font-weight: 700; margin-bottom: 0.4rem; }
  .ib-checkout-sub { color: #999; font-size: 0.9rem; margin-bottom: 2.5rem; }

  /* PROGRESS */
  .ib-progress { display: flex; align-items: center; margin-bottom: 2.5rem; }
  .ib-progress-step { display: flex; align-items: center; gap: 0.5rem; }
  .ib-progress-dot {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.78rem; font-weight: 700; flex-shrink: 0;
  }
  .ib-progress-dot.done { background: #00c46a; color: #fff; }
  .ib-progress-dot.active { background: #1b2a4a; color: #fff; }
  .ib-progress-dot.pending { background: #e8e5e0; color: #bbb; }
  .ib-progress-step-label { font-size: 0.82rem; font-weight: 600; }
  .ib-progress-step-label.active { color: #0f1c35; }
  .ib-progress-step-label.done { color: #00c46a; }
  .ib-progress-step-label.pending { color: #bbb; }
  .ib-progress-line { flex: 1; height: 2px; background: #e8e5e0; margin: 0 0.75rem; }
  .ib-progress-line.done { background: #00c46a; }

  /* LAYOUT */
  .ib-checkout-layout { display: grid; grid-template-columns: 1fr 360px; gap: 2rem; align-items: start; }

  /* FORM CARD */
  .ib-form-card {
    background: #fff; border-radius: 20px; border: 1px solid #ebe9e3;
    padding: 2rem; margin-bottom: 1.25rem;
  }
  .ib-form-card-title {
    font-family: 'Playfair Display', serif; font-size: 1.15rem; color: #0f1c35;
    font-weight: 700; margin-bottom: 1.5rem;
    padding-bottom: 0.75rem; border-bottom: 1px solid #ebe9e3;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .ib-form-card-title span { font-size: 1rem; }

  .ib-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .ib-form-row.full { grid-template-columns: 1fr; }
  .ib-field { display: flex; flex-direction: column; }
  .ib-field label { font-size: 0.8rem; font-weight: 700; color: #555; margin-bottom: 0.4rem; letter-spacing: 0.03em; }
  .ib-field input,
  .ib-field textarea,
  .ib-field select {
    padding: 0.75rem 1rem;
    border: 1.5px solid #e0ddd6; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: #0f1c35;
    outline: none; transition: all 0.2s; background: #fafaf8;
    resize: none;
  }
  .ib-field input:focus,
  .ib-field textarea:focus,
  .ib-field select:focus {
    border-color: #f0a500; background: #fff;
    box-shadow: 0 0 0 3px rgba(240,165,0,0.12);
  }
  .ib-field input.error,
  .ib-field textarea.error { border-color: #e74c3c; }
  .ib-field-error { color: #e74c3c; font-size: 0.75rem; margin-top: 0.3rem; font-weight: 600; }

  /* PAYMENT OPTIONS */
  .ib-pay-options { display: flex; flex-direction: column; gap: 0.75rem; }
  .ib-pay-option {
    display: flex; align-items: center; gap: 1rem;
    padding: 1rem 1.25rem; border-radius: 12px;
    border: 1.5px solid #e0ddd6; cursor: pointer; transition: all 0.2s;
    background: #fafaf8;
  }
  .ib-pay-option:hover { border-color: #f0a500; background: #fffbf0; }
  .ib-pay-option.selected { border-color: #f0a500; background: #fffbf0; }
  .ib-pay-option input[type="radio"] { accent-color: #f0a500; width: 18px; height: 18px; cursor: pointer; }
  .ib-pay-option-info { flex: 1; }
  .ib-pay-option-name { font-weight: 700; color: #0f1c35; font-size: 0.9rem; }
  .ib-pay-option-desc { color: #999; font-size: 0.78rem; margin-top: 0.1rem; }
  .ib-pay-option-badge {
    padding: 0.2rem 0.6rem; border-radius: 100px;
    background: rgba(240,165,0,0.15); color: #c47d00;
    font-size: 0.7rem; font-weight: 700;
  }

  /* ORDER SUMMARY */
  .ib-summary-card {
    background: #fff; border-radius: 20px; border: 1px solid #ebe9e3;
    padding: 1.75rem; position: sticky; top: 1rem;
  }
  .ib-summary-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: #0f1c35; font-weight: 700; margin-bottom: 1.25rem; }
  .ib-summary-items { margin-bottom: 1.25rem; }
  .ib-summary-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.65rem 0; border-bottom: 1px solid #f4f3f0;
  }
  .ib-summary-item:last-child { border-bottom: none; }
  .ib-summary-item-img {
    width: 44px; height: 44px; border-radius: 8px; object-fit: cover; flex-shrink: 0;
  }
  .ib-summary-item-name { font-size: 0.82rem; font-weight: 600; color: #0f1c35; flex: 1; line-height: 1.3; }
  .ib-summary-item-qty { font-size: 0.75rem; color: #999; }
  .ib-summary-item-price { font-weight: 700; color: #0f1c35; font-size: 0.88rem; white-space: nowrap; }

  .ib-summary-divider { height: 1px; background: #ebe9e3; margin: 0.75rem 0; }
  .ib-summary-row { display: flex; justify-content: space-between; padding: 0.35rem 0; }
  .ib-summary-row-label { color: #777; font-size: 0.875rem; }
  .ib-summary-row-val { font-weight: 600; color: #0f1c35; font-size: 0.875rem; }
  .ib-summary-total-label { font-weight: 700; color: #0f1c35; font-size: 1rem; }
  .ib-summary-total-val { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #0f1c35; font-weight: 700; }

  .ib-place-btn {
    width: 100%; padding: 0.95rem; border-radius: 12px;
    background: linear-gradient(135deg, #f0a500, #e8960a);
    color: #0f1c35; font-weight: 700; font-size: 1rem;
    border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
    margin-top: 1.25rem; transition: all 0.2s; letter-spacing: 0.02em;
  }
  .ib-place-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(240,165,0,0.35); }
  .ib-place-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .ib-secure-note { display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-top: 0.75rem; color: #bbb; font-size: 0.78rem; }

  /* EMPTY */
  .ib-checkout-empty { text-align: center; padding: 5rem 2rem; background: #fff; border-radius: 20px; border: 1px solid #ebe9e3; }
  .ib-checkout-empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }
  .ib-checkout-empty h2 { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #0f1c35; margin-bottom: 0.5rem; }
  .ib-checkout-empty p { color: #999; margin-bottom: 1.5rem; }
  .ib-back-btn {
    background: #1b2a4a; color: #fff; padding: 0.75rem 2rem;
    border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; transition: all 0.2s;
  }
  .ib-back-btn:hover { background: #f0a500; color: #0f1c35; }

  @media(max-width:900px) {
    .ib-checkout-layout { grid-template-columns: 1fr; }
    .ib-summary-card { position: static; }
  }
  @media(max-width:600px) {
    .ib-form-row { grid-template-columns: 1fr; }
    .ib-checkout-title { font-size: 1.75rem; }
  }
`;

const PAYMENT_METHODS = [
  { id: "razorpay", name: "Razorpay", desc: "UPI, Cards, Net Banking & Wallets", badge: "Recommended" },
  { id: "cod", name: "Cash on Delivery", desc: "Pay when your order arrives", badge: null },
];

export default function Checkout() {
  const { cart, total } = useCart();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [payMethod, setPayMethod] = useState("razorpay");

  const patch = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g,""))) e.phone = "Enter valid 10-digit number";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (!form.pincode.trim()) e.pincode = "Required";
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validate()) return;
    alert(`Order placed via ${payMethod === "razorpay" ? "Razorpay" : "Cash on Delivery"}!\n\nPayment integration is handled from the Cart page.`);
  };

  const STEPS = ["Cart", "Delivery", "Payment"];

  if (cart.length === 0) {
    return (
      <div className="ib-checkout">
        <style>{styles}</style>
        <div className="ib-checkout-inner">
          <div className="ib-checkout-empty">
            <div className="ib-checkout-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products before checking out.</p>
            <Link to="/products" className="ib-back-btn">Browse Products →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ib-checkout">
      <style>{styles}</style>
      <div className="ib-checkout-inner">
        <div className="ib-checkout-label">Checkout</div>
        <h1 className="ib-checkout-title">Complete Your Order</h1>
        <p className="ib-checkout-sub">Fill in your details and choose a payment method</p>

        {/* PROGRESS */}
        <div className="ib-progress">
          {STEPS.map((step, i) => (
            <div key={step} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:"initial"}}>
              <div className="ib-progress-step">
                <div className={`ib-progress-dot ${i===0?"done":i===1?"active":"pending"}`}>
                  {i === 0 ? "✓" : i + 1}
                </div>
                <span className={`ib-progress-step-label ${i===0?"done":i===1?"active":"pending"}`}>{step}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`ib-progress-line${i===0?" done":""}`} />}
            </div>
          ))}
        </div>

        <div className="ib-checkout-layout">
          <div>
            {/* DELIVERY DETAILS */}
            <div className="ib-form-card">
              <div className="ib-form-card-title"><span>📦</span> Delivery Details</div>
              <div className="ib-form-row">
                <div className="ib-field">
                  <label>First Name</label>
                  <input className={errors.firstName?"error":""} placeholder="Ravi" value={form.firstName} onChange={e=>patch("firstName",e.target.value)} />
                  {errors.firstName && <span className="ib-field-error">{errors.firstName}</span>}
                </div>
                <div className="ib-field">
                  <label>Last Name</label>
                  <input className={errors.lastName?"error":""} placeholder="Kumar" value={form.lastName} onChange={e=>patch("lastName",e.target.value)} />
                  {errors.lastName && <span className="ib-field-error">{errors.lastName}</span>}
                </div>
              </div>
              <div className="ib-form-row">
                <div className="ib-field">
                  <label>Email Address</label>
                  <input type="email" className={errors.email?"error":""} placeholder="ravi@example.com" value={form.email} onChange={e=>patch("email",e.target.value)} />
                  {errors.email && <span className="ib-field-error">{errors.email}</span>}
                </div>
                <div className="ib-field">
                  <label>Phone Number</label>
                  <input type="tel" className={errors.phone?"error":""} placeholder="9876543210" value={form.phone} onChange={e=>patch("phone",e.target.value)} />
                  {errors.phone && <span className="ib-field-error">{errors.phone}</span>}
                </div>
              </div>
              <div className="ib-form-row full">
                <div className="ib-field">
                  <label>Full Address</label>
                  <textarea rows={3} className={errors.address?"error":""} placeholder="House No, Street Name, Area" value={form.address} onChange={e=>patch("address",e.target.value)} />
                  {errors.address && <span className="ib-field-error">{errors.address}</span>}
                </div>
              </div>
              <div className="ib-form-row" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
                <div className="ib-field">
                  <label>City</label>
                  <input className={errors.city?"error":""} placeholder="Hyderabad" value={form.city} onChange={e=>patch("city",e.target.value)} />
                  {errors.city && <span className="ib-field-error">{errors.city}</span>}
                </div>
                <div className="ib-field">
                  <label>State</label>
                  <input className={errors.state?"error":""} placeholder="Telangana" value={form.state} onChange={e=>patch("state",e.target.value)} />
                  {errors.state && <span className="ib-field-error">{errors.state}</span>}
                </div>
                <div className="ib-field">
                  <label>Pincode</label>
                  <input className={errors.pincode?"error":""} placeholder="500001" value={form.pincode} onChange={e=>patch("pincode",e.target.value)} maxLength={6} />
                  {errors.pincode && <span className="ib-field-error">{errors.pincode}</span>}
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="ib-form-card">
              <div className="ib-form-card-title"><span>💳</span> Payment Method</div>
              <div className="ib-pay-options">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} className={`ib-pay-option${payMethod===m.id?" selected":""}`}>
                    <input type="radio" name="payment" value={m.id} checked={payMethod===m.id} onChange={()=>setPayMethod(m.id)} />
                    <div className="ib-pay-option-info">
                      <div className="ib-pay-option-name">{m.name}</div>
                      <div className="ib-pay-option-desc">{m.desc}</div>
                    </div>
                    {m.badge && <span className="ib-pay-option-badge">{m.badge}</span>}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="ib-summary-card">
            <div className="ib-summary-title">Order Summary</div>
            <div className="ib-summary-items">
              {cart.map(item => (
                <div className="ib-summary-item" key={item.id}>
                  <img
                    className="ib-summary-item-img"
                    src={`https://picsum.photos/seed/${item.id}/80/80`}
                    alt={item.name}
                    onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop";}}
                  />
                  <div className="ib-summary-item-name">{item.name}</div>
                  <div style={{textAlign:"right"}}>
                    <div className="ib-summary-item-qty">×{item.qty}</div>
                    <div className="ib-summary-item-price">₹{(item.price*item.qty).toLocaleString("en-IN")}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ib-summary-divider" />
            <div className="ib-summary-row">
              <span className="ib-summary-row-label">Subtotal</span>
              <span className="ib-summary-row-val">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div className="ib-summary-row">
              <span className="ib-summary-row-label">Delivery</span>
              <span style={{color:"#00c46a",fontWeight:700,fontSize:"0.875rem"}}>FREE</span>
            </div>
            <div className="ib-summary-row">
              <span className="ib-summary-row-label">Taxes</span>
              <span className="ib-summary-row-val">Included</span>
            </div>
            <div className="ib-summary-divider" />
            <div className="ib-summary-row">
              <span className="ib-summary-total-label">Total</span>
              <span className="ib-summary-total-val">₹{total.toLocaleString("en-IN")}</span>
            </div>

            <button className="ib-place-btn" onClick={handlePlaceOrder}>
              {payMethod === "razorpay" ? "🔒 Pay with Razorpay" : "📦 Place Order (COD)"}
            </button>
            <div className="ib-secure-note">🔐 Secured by Razorpay · 256-bit SSL</div>
          </div>
        </div>
      </div>
    </div>
  );
}