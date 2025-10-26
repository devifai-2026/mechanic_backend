import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { models } from "../../models/index.js";
dotenv.config();

const { Admin } = models;

export const adminLogin = async (req, res) => {
  const { admin_id, password } = req.body;

  if (!admin_id || !password) {
    return res
      .status(400)
      .json({ message: "admin_id and password are required" });
  }

  try {
    const admin = await Admin.findOne({ where: { admin_id } });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (admin.active_jwt_token) {
      return res.status(403).json({
        isMultipleLogin: true,
        message:
          "Admin already logged in on another device. Please logout first.",
      });
    }

    const token = jwt.sign(
      { id: admin.id, admin_id: admin.admin_id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    admin.active_jwt_token = token;
    await admin.save();

    return res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        admin_id: admin.email,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Admin Login Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const adminLogout = async (req, res) => {
  try {
    // Find the only admin (assuming only one exists)
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Invalidate the token
    admin.active_jwt_token = null;
    await admin.save();

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Admin Logout Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const adminChangePassword = async (req, res) => {
  const { admin_id, oldPassword, newPassword } = req.body;

  if (!admin_id || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const admin = await Admin.findOne({ where: { admin_id } });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;
    await admin.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
