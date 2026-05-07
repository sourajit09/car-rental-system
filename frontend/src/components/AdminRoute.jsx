import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api/API.jsx";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  isAdminUser,
  updateStoredUser,
} from "../utils/authStorage.js";

const AdminRoute = ({ children }) => {
  const token = getStoredToken();
  const [isChecking, setIsChecking] = useState(Boolean(token));
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    let ignore = false;

    const verifyAdminAccess = async () => {
      if (!token) {
        setIsChecking(false);
        setUser(null);
        return;
      }

      try {
        const { data } = await API.get("/user/me");
        if (!ignore) {
          setUser(data?.user || null);
          if (data?.user) {
            updateStoredUser(data.user);
          }
        }
      } catch (error) {
        if (!ignore) {
          clearAuthSession();
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setIsChecking(false);
        }
      }
    };

    verifyAdminAccess();

    return () => {
      ignore = true;
    };
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;
  if (isChecking) {
    return <div className="container py-5">Checking admin access...</div>;
  }
  if (!isAdminUser(user)) return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;
