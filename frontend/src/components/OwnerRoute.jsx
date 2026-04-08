import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api/API.jsx";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  isOwnerUser,
  updateStoredUser,
} from "../utils/authStorage.js";

const OwnerRoute = ({ children }) => {
  const token = getStoredToken();
  const [isChecking, setIsChecking] = useState(Boolean(token));
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    let ignore = false;

    const verifyOwnerAccess = async () => {
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
      } catch (_error) {
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

    verifyOwnerAccess();

    return () => {
      ignore = true;
    };
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;
  if (isChecking) {
    return <div className="container py-5">Checking owner access...</div>;
  }
  if (!isOwnerUser(user)) return <Navigate to="/" replace />;
  return children;
};

export default OwnerRoute;
