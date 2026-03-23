import React from 'react';
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
  <nav className="navbar navbar-expand-lg fixed-top">
  <div className="container-fluid">
    <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
      <div className="brand-pill"><i className="fa-solid fa-car-side"></i></div>
      <span>Car Rental</span>
    </Link>

    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon"></span>
    </button> 

    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav ms-auto mb-2 mb-lg-0">

        <li className="nav-item">
          <Link className="nav-link " aria-current="page" to="/">Home </Link>
        </li>
 <li className="nav-item">
          <Link className="nav-link " aria-current="page" to="/cars">All cars </Link>
        </li>
         <li className="nav-item">
          <Link className="nav-link " aria-current="page" to="/about">About </Link>
        </li>

         <li className="nav-item">
          <Link className="nav-link " aria-current="page" to="/contact">Contact </Link>
        </li>

         <li className="nav-item">
          <Link className="nav-link " aria-current="page" to="/profile">My Account </Link>
        </li>

        {isAuthenticated ? (
          <li className="nav-item">
            <button
              type="button"
              className="nav-link btn btn-link px-0"
              onClick={handleLogout}
            >
              Logout
            </button>
          </li>
        ) : (
          <>
            <li className="nav-item">
              <Link className="nav-link " aria-current="page" to="/login">Login </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link " aria-current="page" to="/register">Register</Link>
            </li>
          </>
        )}


      </ul>

    </div>
  </div>
</nav>

    </>
  )
}

export default Header;
