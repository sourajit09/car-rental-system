import React, { useState } from 'react'
import AuthImage from "../../assets/images/car.gif";

const Register = () => {

  const [uname,setUname]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [phone,setPhone]=useState('')

  return (
    <div className="container py-5">
      <div className="row align-items-center">

      {/* LEFT SIDE GIF */}
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


        {/* RIGHT SIDE FORM */}
        <div className="col-md-5 bg-light rounded-3 p-4 shadow">

          <h3 className="mb-4 text-center text-dark">
            Registration Form
          </h3>

          {/* Name */}
          <div className="mb-3">
            <label className="form-label">Enter Your Name</label>
            <input
              type="text"
              value={uname}
              onChange={(e)=> setUname(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e)=> setPassword(e.target.value)}
              className="form-control"
            />
          </div>

        </div>
      </div>
    </div>
  )
}

export default Register
