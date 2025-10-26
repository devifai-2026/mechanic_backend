import { Op } from "sequelize";
import { models } from "../../models/index.js";
const { Role } = models;
import XLSX from "xlsx";

// Create Role
export const createRole = async (req, res) => {
  try {
    const { code, name } = req.body;

    // Check if role with same code or name already exists
    const existingRole = await Role.findOne({
      where: {
        [Op.or]: [{ code }, { name }],
      },
    });

    if (existingRole) {
      return res
        .status(500)
        .json({ message: "Role with same code or name already exists" });
    }

    // If no duplicate, create new role
    const newRole = await Role.create({ code, name });
    return res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating role:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all Roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    return res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Role by ID
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    return res.status(200).json(role);
  } catch (error) {
    console.error("Error fetching role by ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await role.update({ code, name });
    return res.status(200).json(role);
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await role.destroy();
    return res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const bulkUploadRoles = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Parse rows using header row as keys
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];

    for (const [index, row] of rows.entries()) {
      const { code, name } = row;

      // Validate required fields
      if (!code || !name) {
        results.push({
          row: index + 2,
          status: "failed",
          message: "Missing required fields (code or name)",
        });
        continue;
      }

      try {
        // Check if role with same code or name exists
        const existingRole = await Role.findOne({
          where: {
            [Op.or]: [{ code }, { name }],
          },
        });

        if (existingRole) {
          results.push({
            row: index + 2,
            status: "failed",
            message: "Role with same code or name already exists",
          });
          continue;
        }

        // Create new role
        const newRole = await Role.create({ code, name });

        results.push({
          row: index + 2,
          status: "success",
          roleId: newRole.id,
        });
      } catch (error) {
        results.push({
          row: index + 2,
          status: "failed",
          message: error.message,
        });
      }
    }

    return res.status(201).json({
      message: "Bulk upload completed",
      results,
    });
  } catch (error) {
    console.error("Bulk upload roles error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};