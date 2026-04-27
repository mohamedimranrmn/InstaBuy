import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLogs from "./pages/admin/AdminLogs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCancelRequests from "./pages/admin/AdminCancelRequests";
import AdminUsers from "./pages/admin/AdminUsers";

/* 🔹 Redirect based on auth */
const RootRedirect = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;

  if (role === "ADMIN") return <Navigate to="/admin" />;

  return <Navigate to="/products" />;
};

/* 🔹 Protect user routes */
const ProtectedUserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;

  if (role === "ADMIN") return <Navigate to="/admin" />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">

        <Navbar />

        <div className="flex-grow-1">
          <Routes>

            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Auth routes */}
            <Route
              path="/login"
              element={
                localStorage.getItem("token")
                  ? <RootRedirect />
                  : <Login />
              }
            />
            <Route path="/register" element={<Register />} />

            {/* User routes */}
            <Route
              path="/products"
              element={
                <ProtectedUserRoute>
                  <Products />
                </ProtectedUserRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <ProtectedUserRoute>
                  <Cart />
                </ProtectedUserRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedUserRoute>
                  <Checkout />
                </ProtectedUserRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedUserRoute>
                  <Orders />
                </ProtectedUserRoute>
              }
            />

            {/* Admin section */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="cancel-requests" element={<AdminCancelRequests />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="logs" element={<AdminLogs />} />
            </Route>

          </Routes>
        </div>

        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default App;