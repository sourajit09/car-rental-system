import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api/API.jsx";
import "./AdminStyles.css";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [uname, setUname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!uname || !email || !phone || !password) {
      toast.error("Please provide all fields");
      return;
    }

    try {
      const { data } = await API.post("/user/register", {
        uname,
        email,
        phone,
        password,
        role: "admin",
      });

      if (!data?.success) {
        toast.error(data?.message || "Registration failed");
        return;
      }

      toast.success("Admin account created");
      navigate("/admin/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-hero">
        <div>
          <span className="eyebrow">Admin Signup</span>
          <h1>Create an administrator account.</h1>
          <p>
            Admin accounts manage the platform side: fleet oversight, booking
            approvals, payment status, and live location tracking.
          </p>
        </div>
      </section>

      <section className="admin-auth-card">
        <h3 className="mb-4 text-center">Admin Registration</h3>
        <div className="d-flex gap-2 mb-4">
          <Link to="/register?role=customer" className="btn flex-fill btn-outline-dark">
            Customer
          </Link>
          <Link to="/register?role=owner" className="btn flex-fill btn-outline-dark">
            Owner
          </Link>
          <button type="button" className="btn flex-fill btn-dark">
            Admin
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={uname}
              onChange={(event) => setUname(event.target.value)}
            />
          </div>
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
            <label className="form-label">Mobile number</label>
            <input
              className="form-control"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
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
            Create admin account
          </button>
        </form>
        <p className="small text-muted text-center mt-3 mb-0">
          Already have an admin account? <Link to="/admin/login">Login here</Link>
        </p>
      </section>
    </main>
  );
};

export default AdminRegister;
