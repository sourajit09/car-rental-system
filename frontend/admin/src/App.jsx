import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "../../src/pages/Admin/Dashboard.jsx";
import AdminRoute from "../../src/components/AdminRoute.jsx";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  isAdminUser,
} from "../../src/utils/authStorage.js";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminRegister from "./pages/AdminRegister.jsx";

const AdminShell = ({ children }) => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top admin-navbar">
        <div className="container-fluid">
          <span className="navbar-brand d-flex align-items-center gap-2">
            <span className="brand-pill">ADMIN</span>
            <span>Car Rental Control</span>
          </span>
          <div className="ms-auto d-flex align-items-center gap-3">
            {user?.email && <span className="small text-muted">{user.email}</span>}
            <button className="btn btn-dark btn-sm rounded-pill px-3" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
};

const AdminOnlyDashboard = () => (
  <AdminRoute>
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  </AdminRoute>
);

const RootRedirect = () => {
  const token = getStoredToken();
  const user = getStoredUser();

  return token && isAdminUser(user) ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<AdminRegister />} />
        <Route path="/dashboard" element={<AdminOnlyDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
