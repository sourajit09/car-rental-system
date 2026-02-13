import React from 'react'
import AuthImage from "../../assets/images/car.gif";

const Register = () => {
  return (
   <>
   <div className="container p-4">
    <div className="row">
      <div className="col-md-7">
        <img src={AuthImage} alt="auth" className="rounded" height={'100%'} width={'100%'} />
      </div>
    </div>
   </div>
   </>
  )
}

export default Register
