import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Verify JWT and attach decoded payload to req.user
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    const decode = JWT.verify(token, process.env.JWT_SECRET);
    // attach basic info
    req.user = { id: decode.id };

    // fetch user once to know role/admin
    const dbUser = await userModel.findById(decode.id).lean();
    if (dbUser) {
      req.user.isAdmin = dbUser.isAdmin === true;
      req.user.email = dbUser.email;
      req.user.uname = dbUser.uname;
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      message: "Invalid or expired token",
      error,
    });
  }
};

// Allow only users flagged as admin
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user || user.isAdmin !== true) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized user",
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
