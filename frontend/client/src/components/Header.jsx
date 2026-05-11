import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import API from "../api/API.jsx";
import {
  AUTH_UPDATED_EVENT,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  isOwnerUser,
  updateStoredUser,
} from "../utils/authStorage.js";

const Header = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const syncAuthState = () => {
      setToken(getStoredToken());
      setUser(getStoredUser());
    };

    syncAuthState();
    window.addEventListener(AUTH_UPDATED_EVENT, syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const syncCurrentUser = async () => {
      if (!token) {
        return;
      }

      try {
        const { data } = await API.get("/user/me");
        if (!ignore && data?.user) {
          updateStoredUser(data.user);
        }
      } catch (error) {
        if (!ignore && error.response?.status === 401) {
          clearAuthSession();
        }
      }
    };

    syncCurrentUser();

    return () => {
      ignore = true;
    };
  }, [token]);

  const isAuthenticated = Boolean(token);
  const isOwner = isOwnerUser(user);

  const handleLogout = () => {
    clearAuthSession();
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
        {isAuthenticated && !isOwner && (
          <li className="nav-item">
            <Link className="nav-link " aria-current="page" to="/cars">All vehicles </Link>
          </li>
        )}
         <li className="nav-item">
          <Link className="nav-link " aria-current="page" to="/about">About </Link>
        </li>

         <li className="nav-item">
          <Link className="nav-link " aria-current="page" to="/contact">Contact </Link>
        </li>

        {isAuthenticated && (
          <li className="nav-item">
            <Link className="nav-link " aria-current="page" to="/profile">My Account </Link>
          </li>
        )}

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

        {isOwner && (
          <li className="nav-item ms-lg-2">
            <Link
              className="btn btn-dark rounded-pill px-3 mt-2 mt-lg-0"
              aria-current="page"
              to="/owner/dashboard"
            >
              Owner Dashboard
            </Link>
          </li>
        )}

      </ul>

    </div>
  </div>
</nav>

    </>
  )
}

export default Header;
