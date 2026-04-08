import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService.js";

const PASSWORD_RESET_EXPIRY_MINUTES = Number(
  process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15
);
const GENERIC_PASSWORD_RESET_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";
const DEVELOPMENT_PASSWORD_RESET_MESSAGE =
  "Email delivery is not configured, so the reset link is returned for local development.";

const getUserRole = (user) =>
  user.role || (user.isAdmin ? "owner" : "customer");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const clearPasswordResetFields = (user) => {
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
};

const canExposeResetUrl = () =>
  process.env.NODE_ENV !== "production" ||
  process.env.ALLOW_RESET_LINK_IN_RESPONSE === "true";

const buildPasswordResetUrl = (token, role) => {
  const baseUrl = (
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
  ).replace(/\/+$/, "");

  const params = new URLSearchParams({
    token,
    role,
  });

  return `${baseUrl}/reset-password?${params.toString()}`;
};

export const register = async (req, res) => {
  try {
    const { uname, email, password, phone, role: roleInput } = req.body;

    if (!uname || !email || !password || !phone) {
      return res.status(400).send({
        success: false,
        message: `please provide all fields`,
      });
    }

    const role =
      roleInput === "owner" ? "owner" : "customer";

    const existinguser = await userModel.findOne({ email });
    if (existinguser) {
      return res.status(500).send({
        success: false,
        message: `Use Already Exists`,
      });
    }
    const hashedPassword = await hashPassword(password);

    const user = new userModel({
      uname,
      email,
      password: hashedPassword,
      phone,
      role,
    });
    await user.save();
    user.password = undefined;
    res.status(201).send({
      success: true,
      message: `User Created!`,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Register",
      error,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(500).send({
        message: "add email or password",
        success: false,
      });
    }
    const user = await userModel.findOne({ email }).lean();
    if (!user) {
      return res.status(500).send({
        message: "user not found",
        success: false,
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid credentials",
      });
    }
      // Generate JWT token
    const token = JWT.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _pw, ...userSafe } = user;
    const role = getUserRole(userSafe);
    res.status(200).send({
      success: true,
      message: "Login Successful",
      token,
      user: { ...userSafe, role },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password").lean();
    if(!user){
      return res.status(404).send({
        success:false,
        message:"User not found"
      });
    }

    const role = getUserRole(user);
    res.status(200).send({
      success:true,
      user: {
        ...user,
        role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success:false,
      message:"Error fetching profile",
      error,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(500).send({
        success: false,
        message: "User not found",
      });
    }

    const isOwnProfile = req.user?.id === id;
    const canManageUsers = req.user?.isAdmin === true;
    if (!canManageUsers && !isOwnProfile) {
      return res.status(403).send({
        success: false,
        message: "Not allowed to update this user",
      });
    }

    const data = { ...req.body };

    if (!canManageUsers) {
      delete data.isAdmin;
      delete data.role;
      delete data.email;
    }

    delete data.passwordResetToken;
    delete data.passwordResetExpiresAt;

    // hash password if provided
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    const user = await userModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    ).select("-password").lean();

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "User has been updated",
      user: {
        ...user,
        role: getUserRole(user),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating the user",
      error,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(200).send({
        success: true,
        message: GENERIC_PASSWORD_RESET_MESSAGE,
      });
    }

    const role = getUserRole(user);
    const rawResetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(rawResetToken)
      .digest("hex");

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpiresAt = new Date(
      Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000
    );
    await user.save();

    const resetUrl = buildPasswordResetUrl(rawResetToken, role);

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.uname,
        role,
        resetUrl,
      });

      return res.status(200).send({
        success: true,
        message: GENERIC_PASSWORD_RESET_MESSAGE,
      });
    } catch (emailError) {
      if (emailError.code === "MAIL_NOT_CONFIGURED" && canExposeResetUrl()) {
        return res.status(200).send({
          success: true,
          message: DEVELOPMENT_PASSWORD_RESET_MESSAGE,
          resetUrl,
        });
      }

      clearPasswordResetFields(user);
      await user.save();

      console.log(emailError);
      return res.status(500).send({
        success: false,
        message: "Unable to send password reset email right now",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error sending password reset link",
      error,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      return res.status(400).send({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).send({
        success: false,
        message: "Passwords do not match",
      });
    }

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await userModel.findOne({
      passwordResetToken: hashedResetToken,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpiresAt");

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = await hashPassword(password);
    clearPasswordResetFields(user);
    await user.save();

    res.status(200).send({
      success: true,
      message: "Password reset successful. Please log in again.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error resetting password",
      error,
    });
  }
};
