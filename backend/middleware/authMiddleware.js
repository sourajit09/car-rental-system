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
    dbUser.role ||
    (dbUser.isAdmin === true ? "owner" : "customer");
  const isOwner =
    inferredRole === "owner" || dbUser.isAdmin === true;

  return {
    id: decode.id,
    isAdmin: dbUser.isAdmin === true,
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

// Fleet owner: business operator (role owner) or legacy isAdmin
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    const isFleetOwner =
      user &&
      (user.role === "owner" || user.isAdmin === true);
    if (!isFleetOwner) {
      return res.status(403).send({
        success: false,
        message: "Owner access required",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Admin Auth",
      error,
    });
  }
};
