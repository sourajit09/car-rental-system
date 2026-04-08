import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import userModel from "../models/userModel.js";

dotenv.config();

const email = process.argv[2]?.trim()?.toLowerCase();

if (!email) {
  console.error(
    "Usage: npm run make-owner -- user@example.com (or npm run make-admin -- user@example.com)"
  );
  process.exit(1);
}

const promoteUserToAdmin = async () => {
  try {
    await connectDb();

    const user = await userModel.findOneAndUpdate(
      { email },
      { $set: { isAdmin: true, role: "owner" } },
      { new: true }
    ).select("uname email phone isAdmin role");

    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exitCode = 1;
      return;
    }

    console.log("Owner dashboard access granted successfully.");
    console.log(`Name: ${user.uname}`);
    console.log(`Email: ${user.email}`);
    console.log(`Phone: ${user.phone}`);
    console.log(`isAdmin (owner account): ${user.isAdmin}`);
    console.log(`role: ${user.role}`);
  } catch (error) {
    console.error("Failed to grant owner access:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

promoteUserToAdmin();
