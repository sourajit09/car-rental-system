import React, { useState } from "react";
import AuthImage from "../../assets/images/car.gif";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../../api/API.jsx";

const ResetPassword = () => {
  const navigation = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const selectedRole =
    searchParams.get("role") === "owner" ? "owner" : "customer";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTokenMissing = !token;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isTokenMissing) {
      return toast.error("This reset link is invalid");
    }

    if (!password || !confirmPassword) {
      return toast.error("Please fill in both password fields");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setIsSubmitting(true);
      const { data } = await API.post("/user/reset-password", {
        token,
        password,
        confirmPassword,
      });

      if (data.success) {
        toast.success(data.message);
        navigation(`/login?role=${selectedRole}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to reset password"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row align-items-center">
        <div className="col-md-7 d-flex justify-content-center align-items-center">
          <img
            src={AuthImage}
            alt="auth"
            className="img-fluid"
            style={{
              height: "600px",
              width: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        <div className="col-md-5 bg-light rounded-3 p-4 shadow">
          <h3 className="mb-4 text-center text-dark">
            {selectedRole === "owner"
              ? "Set Owner Password"
              : "Set Customer Password"}
          </h3>

          <p className="text-muted">
            Choose a new password for your account. Reset links expire quickly
            for safety.
          </p>

          {isTokenMissing ? (
            <div className="alert alert-danger">
              This password reset link is incomplete or invalid.
            </div>
          ) : null}

          <div className="mb-3">
            <label className="form-label">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              disabled={isTokenMissing}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              disabled={isTokenMissing}
            />
          </div>

          <button
            className="btn btn-primary w-100"
            onClick={handleSubmit}
            disabled={isSubmitting || isTokenMissing}
          >
            {isSubmitting ? "Updating password..." : "Reset password"}
          </button>

          <p className="small text-muted text-center mt-3 mb-0">
            Need a fresh link?{" "}
            <Link to={`/forgot-password?role=${selectedRole}`}>
              Request another reset email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
