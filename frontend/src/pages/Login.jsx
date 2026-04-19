import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const parseJwt = (token) => {
    try {
      return JSON.parse(
        atob(token.split(".")[1])
      );
    } catch {
      return null;
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "/auth/login",
        {
          email,
          password
        }
      );

      const token =
        res.data.token ||
        res.data.jwt ||
        res.data.accessToken;

      localStorage.setItem("token", token);

      const decoded = parseJwt(token);

      const role =
        decoded?.role ||
        decoded?.roles ||
        "CUSTOMER";

      localStorage.setItem(
        "role",
        role
      );

      alert("Login Successful");

      if (role === "ADMIN") {
        window.location.href =
          "/admin";
      } else {
        window.location.href =
          "/products";
      }

    } catch (error) {
      console.log(error);
      alert("Invalid Credentials");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "70vh" }}   // 👈 pushes footer down nicely
    >
      <div
        className="container"
        style={{ maxWidth: "450px" }}
      >
        <div className="card shadow p-4">
          <h2 className="mb-4">Login</h2>

          <input
            className="form-control mb-3"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="btn btn-primary w-100"
            onClick={handleLogin}
          >
            Login
          </button>

          <p className="mt-3 text-center">
            Don't have an account?{" "}
            <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;