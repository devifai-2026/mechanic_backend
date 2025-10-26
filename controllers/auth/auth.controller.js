import bcrypt from "bcrypt";
import { models } from "../../models/index.js"; // Adjust path if needed
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendLoginNotification } from "../../utils/pushNotifications/pushNotifications.js";
const { Employee, Role, Organisations, EmployeeLoginLog } = models;

// ✅ LOGIN

dotenv.config();

export const login = async (req, res) => {
  const {
    emp_id,
    password,
    forceLogoutAll = false,
    device_name = "Unknown",
    device_id = "Unknown",
    player_id = null, // 👈 receive player_id from frontend
  } = req.body;

  console.log({ device_name, device_id, player_id });

  if (!emp_id || !password) {
    return res
      .status(400)
      .json({ message: "emp_id and password are required" });
  }

  try {
    const employee = await Employee.findOne({ where: { emp_id } });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (employee.active_jwt_token && !forceLogoutAll) {
      return res.status(403).json({
        message: "User already logged in on another device. Force logout?",
        promptForceLogout: true,
      });
    }

    const token = jwt.sign(
      {
        id: employee.id,
        emp_id: employee.emp_id,
        role: employee.app_access_role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Update token and player_id
    employee.active_jwt_token = token;
    if (player_id) employee.player_id = player_id;
    await employee.save();

    // Save login log
    await EmployeeLoginLog.create({
      employee_id: employee.id,
      login_time: new Date(),
      device_name,
      device_id,
      jwt_token: token,
    });

    const organisation = await Organisations.findOne({
      where: { id: employee.org_id },
      attributes: ["id", "org_name"],
    });

    // ✅ Send notification on successful login
    // if (player_id) {
    //   await sendLoginNotification(
    //     employee.emp_name,
    //     device_name,
    //     player_id,
    //     "Login successful from " + device_name
    //   );
    // }

    return res.status(200).json({
      message: "Login successful",
      token,
      employee: {
        id: employee.id,
        emp_id: employee.emp_id,
        emp_name: employee.emp_name,
        role: employee.app_access_role,
        organisation: {
          id: organisation?.id,
          name: organisation?.org_name,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// ✅ CHANGE PASSWORD
export const changePassword = async (req, res) => {
  const { emp_id, oldPassword, newPassword } = req.body;

  if (!emp_id || !oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "emp_id, oldPassword, and newPassword are required" });
  }

  try {
    const employee = await Employee.findOne({ where: { emp_id } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;

    await employee.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user session" });
    }

    // Remove active token
    await Employee.update(
      { active_jwt_token: null },
      { where: { id: userId } }
    );

    // Update the latest login log with logout_time
    await EmployeeLoginLog.update(
      { logout_time: new Date() },
      {
        where: {
          employee_id: userId,
          logout_time: null,
        },
        order: [["createdAt", "DESC"]],
        limit: 1,
      }
    );

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
