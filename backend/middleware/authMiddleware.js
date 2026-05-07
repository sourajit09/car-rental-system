import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const getAuthenticatedUserFromToken = async (token) => {
  const decode = JWT.verify(token, process.env.JWT_SECRET);
  const dbUser = await userModel.findById(decode.id).lean();
  if (!dbUser) {
    const error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }

  const inferredRole =
    dbUser.isAdmin === true ? "admin" : dbUser.role || "customer";
  const isOwner = inferredRole === "owner";
  const isAdminUser = inferredRole === "admin";

  return {
    id: decode.id,
    isAdmin: dbUser.isAdmin === true,
    isAdminUser,
    isOwner,
    role: inferredRole,
    email: dbUser.email,
    uname: dbUser.uname,
  };
};

const attachAuthenticatedUser = async (token, req) => {
  req.user = await getAuthenticatedUserFromToken(token);
};

const unauthorizedResponse = (res, message, error) =>
  res.status(401).send({
    success: false,
    message,
    ...(error ? { error } : {}),
  });

// Verify JWT from bearer token and attach decoded payload to req.user
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorizedResponse(res, "Authorization token missing");
    }

    const token = authHeader.split(" ")[1];
    await attachAuthenticatedUser(token, req);
    next();
  } catch (error) {
    console.log(error);
    unauthorizedResponse(res, "Invalid or expired token", error);
  }
};

const getFreshUserRole = (user) =>
  user?.isAdmin === true ? "admin" : user?.role || "customer";

const requireRole = (allowedRoles, message) => async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id).lean();
    const role = getFreshUserRole(user);

    if (!user || !allowedRoles.includes(role)) {
      return res.status(403).send({
        success: false,
        message,
      });
    }

    req.user = {
      ...req.user,
      role,
      isAdmin: role === "admin",
      isAdminUser: role === "admin",
      isOwner: role === "owner",
    };

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error checking role access",
      error,
    });
  }
};

export const requireAdmin = requireRole(["admin"], "Admin access required");

export const requireOwner = requireRole(["owner"], "Owner access required");

export const requireOwnerOrAdmin = requireRole(
  ["owner", "admin"],
  "Owner or admin access required"
);

// Backward-compatible name for old imports. Prefer requireAdmin.
export const isAdmin = requireAdmin;
