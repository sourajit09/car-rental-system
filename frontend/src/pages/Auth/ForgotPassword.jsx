import React, { useState } from "react";
import AuthImage from "../../assets/images/car.gif";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import API from "../../api/API.jsx";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRole =
    searchParams.get("role") === "owner" ? "owner" : "customer";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast.error("Please enter your email address");
    }

    try {
      setIsSubmitting(true);
      const { data } = await API.post("/user/forgot-password", {
        email,
        role: selectedRole,
      });

      if (data.success) {
        toast.success(data.message);
        setDevResetUrl(data.resetUrl || "");
        if (!data.resetUrl) {
          setEmail("");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to start password reset"
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
              ? "Owner Password Reset"
              : "Customer Password Reset"}
          </h3>

          <div className="d-flex gap-2 mb-4">
            <button
              type="button"
              className={`btn flex-fill ${
                selectedRole === "customer" ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => setSearchParams({ role: "customer" })}
            >
              Customer
            </button>
            <button
              type="button"
              className={`btn flex-fill ${
                selectedRole === "owner" ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => setSearchParams({ role: "owner" })}
            >
              Owner
            </button>
          </div>

          <p className="text-muted">
            Enter the email used on your account and we&apos;ll help you reset
            the password.
          </p>

          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>

          <button
            className="btn btn-primary w-100"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending reset link..." : "Send reset link"}
          </button>

          {devResetUrl && (
            <div className="alert alert-warning mt-3 mb-0">
              Email is not configured on this server yet. Use this temporary{" "}
              <a href={devResetUrl}>reset link</a> while developing.
            </div>
          )}

          <p className="small text-muted text-center mt-3 mb-0">
            Remembered your password?{" "}
            <Link to={`/login?role=${selectedRole}`}>Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
