import React, { useState } from 'react'
import AuthImage from "../../assets/images/car.gif";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

const Login = () => {

 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  

  const navigation = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      if (!email || !password) {
        return toast.error("Please enter email or password");
      }
      console.log('auth from data',+email+password);
      setEmail('');
      setPassword('');
      toast.success("Login Successful");
      navigation("/cars")
    } catch (error) {
      console.log(error)
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
            Login Form
          </h3>

          

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
            Login
          </button>
        </div>

      </div>
    </div>
  )
}

export default Login