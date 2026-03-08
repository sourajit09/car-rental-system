import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const authMiddleware = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token)
      return res.status(402).send({
        success: false,
        message: "token not found",
      });
    const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in User Auth",
      error,
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (user.isAdmin !== true) {
      return res.status(402).send({
        success: false,
        message: "unAuthorized user",
        error,
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Admin Auth",
      error,
    });
  }
};
