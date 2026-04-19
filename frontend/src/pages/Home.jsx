import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <div className="bg-dark text-white text-center p-5">
        <h1 className="display-4 fw-bold">Welcome to InstaBuy</h1>
        <p className="lead">Smartest Online Shopping Store</p>

        <Link to="/products" className="btn btn-warning btn-lg mt-3">
          Shop Now
        </Link>
      </div>

      <div className="container mt-5 text-center">
        <h2>Why Choose Us?</h2>

        <div className="row mt-4">
          <div className="col-md-4">
            <h4>🚚 Fast Delivery</h4>
            <p>Quick and secure delivery.</p>
          </div>

          <div className="col-md-4">
            <h4>💳 Secure Payment</h4>
            <p>Razorpay trusted payments.</p>
          </div>

          <div className="col-md-4">
            <h4>⭐ Best Quality</h4>
            <p>Top rated products.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;