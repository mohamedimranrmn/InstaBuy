import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

  .ib-home * { box-sizing: border-box; margin: 0; padding: 0; }
  .ib-home { font-family: 'DM Sans', sans-serif; background: #f8f7f4; min-height: 100vh; }

  /* HERO */
  .ib-hero {
    background: linear-gradient(135deg, #0f1c35 0%, #1b2a4a 50%, #0f1c35 100%);
    min-height: 88vh;
    display: flex; align-items: center;
    position: relative; overflow: hidden;
    padding: 4rem 2rem;
    text-align: center;
  }

  .ib-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(240,165,0,0.08) 0%, transparent 70%);
  }

  .ib-hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .ib-hero-inner {
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .ib-hero-tag {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(240,165,0,0.15);
    border: 1px solid rgba(240,165,0,0.3);
    color: #f0a500;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.4rem 1rem;
    border-radius: 100px;
    margin-bottom: 1.5rem;
  }

  .ib-hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.4rem, 5vw, 3.6rem);
    color: #fff;
    line-height: 1.15;
    margin-bottom: 1.25rem;
  }

  .ib-hero h1 span { color: #f0a500; }

  .ib-hero-desc {
    color: #94afd4;
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 2.5rem;
    max-width: 700px;
    margin-inline: auto;
  }

  .ib-hero-btns {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .ib-btn-primary {
    background: #f0a500;
    color: #0f1c35;
    padding: 0.85rem 2rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.95rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .ib-btn-primary:hover {
    background: #ffc107;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(240,165,0,0.35);
  }

  .ib-btn-outline {
    background: transparent;
    color: #fff;
    padding: 0.85rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.25);
    transition: all 0.2s;
  }

  .ib-btn-outline:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.5);
  }

  /* STATS BAR */
  .ib-stats-bar {
    background: #1b2a4a;
    padding: 1.75rem 2rem;
  }

  .ib-stats-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    text-align: center;
  }

  .ib-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: #f0a500;
  }

  .ib-stat-txt {
    color: #94afd4;
    font-size: 0.82rem;
  }

  @media (max-width: 900px) {
    .ib-stats-inner { grid-template-columns: repeat(2, 1fr); }
  }
`;

const features = [
  { icon: "🚀", title: "Lightning Fast Orders", desc: "Place orders in seconds with our streamlined checkout flow powered by Razorpay." },
  { icon: "🔒", title: "Secure Payments", desc: "Bank-grade encryption and idempotent transactions keep every payment safe." },
  { icon: "📦", title: "Real-Time Inventory", desc: "Optimistic locking prevents overselling even under high concurrent traffic." },
  { icon: "♻️", title: "Easy Refunds", desc: "Request refunds with one click. Admin reviews and processes them quickly." },
  { icon: "🛡️", title: "Fault Tolerant", desc: "Saga orchestration ensures rollbacks on failures." },
];

export default function Home() {
    const navigate = useNavigate();
  return (
    <div className="ib-home">
      <style>{styles}</style>

      {/* HERO */}
      <section className="ib-hero">
        <div className="ib-hero-grid" />
        <div className="ib-hero-inner">
          <div className="ib-hero-tag">Now Live · Microservices Architecture</div>
          <h1>
            Shop Smarter with <span>InstaBuy</span>
          </h1>
          <p className="ib-hero-desc">
            A high‑performance order management system built for scale.
            Real‑time inventory, instant payments, zero overselling.
          </p>

          <div className="ib-hero-btns">
            <button
              className="ib-btn-primary"
              onClick={() => {
                const token = localStorage.getItem("token");

                if (!token) {
                  navigate("/login");
                } else {
                  navigate("/products");
                }
              }}
            >
              Start Shopping →
            </button>
            <Link to="/register" className="ib-btn-outline">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="ib-stats-bar">
        <div className="ib-stats-inner">
          {[
            ["10K+", "Products Listed"],
            ["99.9%", "Uptime SLA"],
            ["<50ms", "API Response"],
            ["256‑bit", "Encryption"],
          ].map(([n, t]) => (
            <div key={t}>
              <div className="ib-stat-num">{n}</div>
              <div className="ib-stat-txt">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}