import React, { useState } from 'react'
import AuthImage from "../../assets/images/car.gif";
import toast from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api/API.jsx';
import { getUserRole, setAuthSession } from '../../utils/authStorage.js';

const Login = () => {

  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRole =
    searchParams.get("role") === "owner" ? "owner" : "customer";
  

  const navigation = useNavigate()

  const handleSubmit = async(e) => {
    e.preventDefault()
    try {
      if (!email || !password) {
        return toast.error("Please enter email or password");
      }
      const { data } = await API.post('/user/login', {
        email,
        password,
      });

      if (data.success) {
        const loggedRole = getUserRole(data.user);
        if (loggedRole !== selectedRole) {
          return toast.error(
            `This account is registered as ${loggedRole}. Please use the ${loggedRole} login.`
          );
        }

        setAuthSession({
          token: data.token,
          user: data.user,
        });

        toast.success("Login Successful");
        setEmail('');
        setPassword('');
        navigation(loggedRole === "owner" ? "/owner/dashboard" : "/cars");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
  toast.error(error.response?.data?.message || "Something went wrong");  
}
  }
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
              objectFit: "contain"
            }}
          />
        </div>

        <div className="col-md-5 bg-light rounded-3 p-4 shadow">
          <h3 className="mb-4 text-center text-dark">
            {selectedRole === "owner" ? "Owner Login" : "Customer Login"}
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

          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
          </div>

          <button className="btn btn-primary w-100" onClick={handleSubmit}>
            {selectedRole === "owner" ? "Login as owner" : "Login as customer"}
          </button>
          <p className="small text-muted text-center mt-3 mb-0">
            Need a new account?{" "}
            <Link to={`/register?role=${selectedRole}`}>Sign up here</Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Login
