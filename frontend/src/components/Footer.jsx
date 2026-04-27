const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

  .ib-footer *, .ib-footer *::before, .ib-footer *::after { box-sizing: border-box; }

  .ib-footer {
    background: #0f1c35;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 0.875rem 1.75rem;
    font-family: 'DM Sans', sans-serif;
    color: #7a9bbf;
  }

  .ib-footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  /* Left: logo + copy */
  .ib-footer-left {
    display: flex; align-items: center; gap: 0.875rem;
  }
  .ib-footer-logo {
    display: flex; align-items: center; gap: 0.4rem; text-decoration: none;
  }
  .ib-footer-logo-mark {
    width: 26px; height: 26px;
    background: linear-gradient(135deg, #f0a500, #e08c00);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem;
  }
  .ib-footer-logo-name {
    font-family: 'Playfair Display', serif;
    font-size: 0.95rem; font-weight: 700; color: #fff;
  }
  .ib-footer-logo-name span { color: #f0a500; }

  .ib-footer-sep {
    width: 1px; height: 14px;
    background: rgba(255,255,255,0.1); flex-shrink: 0;
  }

  .ib-footer-copy { font-size: 0.78rem; color: #7a9bbf; }

  /* Right: badges */
  .ib-footer-badges { display: flex; gap: 0.4rem; align-items: center; }
  .ib-footer-badge {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.09);
    padding: 0.2rem 0.6rem;
    border-radius: 100px;
    font-size: 0.7rem;
    color: #7a9bbf;
    white-space: nowrap;
  }

  @media (max-width: 520px) {
    .ib-footer-inner { flex-direction: column; align-items: flex-start; }
  }
`;

export default function Footer() {
  return (
    <footer className="ib-footer">
      <style>{styles}</style>
      <div className="ib-footer-inner">

        <div className="ib-footer-left">
          <a href="/" className="ib-footer-logo">
            <div className="ib-footer-logo-mark">🛒</div>
            <div className="ib-footer-logo-name">Insta<span>Buy</span></div>
          </a>
          <div className="ib-footer-sep" />
          <span className="ib-footer-copy">© {new Date().getFullYear()} InstaBuy</span>
        </div>

        <div className="ib-footer-badges">
          <span className="ib-footer-badge">🔒 Razorpay</span>
          <span className="ib-footer-badge">⚡ Microservices</span>
        </div>

      </div>
    </footer>
  );
}