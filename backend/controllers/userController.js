import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { uname, email, password, phone } = req.body;

    if (!uname || !email || !password || !phone) {
      return res.status(400).send({
        success: false,
        message: `please provide all fields`,
      });
    }

    const existinguser = await userModel.findOne({ email });
    if (existinguser) {
      return res.status(500).send({
        success: false,
        message: `Use Already Exists`,
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new userModel({
      uname,
      email,
      password: hashedPassword,
      phone,
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
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(500).send({
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

    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "Login Successful",
      token,
      user,
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
    const user = await userModel.findById(req.user.id).select("-password");
    if(!user){
      return res.status(404).send({
        success:false,
        message:"User not found"
      });
    }
    res.status(200).send({
      success:true,
      user,
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
    const data = { ...req.body };

    // hash password if provided
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    const user = await userModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );
    res.status(200).send({
      success: true,
      message: "User has been updated",
      user,
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
