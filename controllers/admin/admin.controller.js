import { models } from "../../models/index.js";
import bcrypt from "bcrypt";

const { Admin } = models;

export const createAdmin = async (req, res) => {
  const {
    name,
    email,
    password,
  } = req.body;

  try {
    // Check if admin already exists by email
    const exists = await Admin.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists." });
    }

    // Set admin_id as email
    const admin_id = email;

    const admin = await Admin.create({
      admin_id,
      name,
      email,
      password,
      active_jwt_token: null,
    });

    return res.status(201).json({
      message: "Admin created successfully!",
      admin_id: admin.admin_id,
      email: admin.email,
      name: admin.name,
    });
  } catch (err) {
    console.error("Create Admin Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};