import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../../src/api/API.jsx";
import { getUserRole, setAuthSession } from "../../../src/utils/authStorage.js";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      const { data } = await API.post("/user/login", { email, password });

      if (!data?.success) {
        toast.error(data?.message || "Login failed");
        return;
      }

      const role = getUserRole(data.user);
      if (role !== "admin") {
        toast.error("Only admin accounts can open this panel");
        return;
      }

      setAuthSession({ token: data.token, user: data.user });
      toast.success("Admin login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-hero">
        <div>
          <span className="eyebrow">Admin Panel</span>
          <h1>Manage vehicles, bookings, payments, and live tracking.</h1>
          <p>
            This separate app is only for administrators. Owner and customer
            pages stay in the main frontend app.
          </p>
        </div>
      </section>

      <section className="admin-auth-card">
        <h3 className="mb-4">Admin Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button className="btn btn-primary w-100" type="submit">
            Login to admin panel
          </button>
        </form>
        <p className="small text-muted text-center mt-3 mb-0">
          Need an admin account? <Link to="/register">Create admin signup</Link>
        </p>
      </section>
    </main>
  );
};

export default AdminLogin;
