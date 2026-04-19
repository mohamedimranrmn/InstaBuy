import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

function Register() {
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post(
        "/auth/register",
        {
          name,
          email,
          password
        }
      );

      const token =
        res.data.token ||
        res.data.jwt ||
        res.data.accessToken;

      if (token) {
        localStorage.setItem("token", token);
      }

      alert("Registration Successful");
      window.location.href = "/products";

    } catch (error) {
      console.log(error);

      if (error.response) {
        alert(
          error.response.data?.message ||
          "Registration Failed"
        );
      } else {
        alert("Backend not reachable");
      }
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "70vh" }}   // 👈 same fix
    >
      <div
        className="container"
        style={{ maxWidth: "450px" }}
      >
        <div className="card shadow p-4">
          <h2 className="mb-4">Register</h2>

          <input
            className="form-control mb-3"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />

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
            className="btn btn-success w-100"
            onClick={handleRegister}
          >
            Register
          </button>

          <p className="mt-3 text-center">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;