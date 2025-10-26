import { models } from '../../models/index.js';
import XLSX from "xlsx";
const { AccountGroup } = models;

// Create Account Group
export const createAccountGroup = async (req, res) => {
  const { account_group_code, account_group_name } = req.body;

  try {
    const accountGroup = await AccountGroup.create({ account_group_code, account_group_name });
    return res.status(201).json(accountGroup);
  } catch (error) {
    console.error("Error creating account group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Account Groups
export const getAllAccountGroups = async (req, res) => {
  try {
    const accountGroups = await AccountGroup.findAll();
    return res.status(200).json(accountGroups);
  } catch (error) {
    console.error("Error fetching account groups:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Account Group by ID
export const getAccountGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    const accountGroup = await AccountGroup.findByPk(id);
    if (!accountGroup) {
      return res.status(404).json({ message: "Account group not found" });
    }
    return res.status(200).json(accountGroup);
  } catch (error) {
    console.error("Error fetching account group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Account Group
export const updateAccountGroup = async (req, res) => {
  const { id } = req.params;
  const { account_group_code, account_group_name } = req.body;

  try {
    const accountGroup = await AccountGroup.findByPk(id);
    if (!accountGroup) {
      return res.status(404).json({ message: "Account group not found" });
    }

    await accountGroup.update({ account_group_code, account_group_name });
    return res.status(200).json(accountGroup);
  } catch (error) {
    console.error("Error updating account group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Account Group
export const deleteAccountGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const accountGroup = await AccountGroup.findByPk(id);
    if (!accountGroup) {
      return res.status(404).json({ message: "Account group not found" });
    }

    await accountGroup.destroy();
    return res.status(200).json({ message: "Account group deleted successfully" });
  } catch (error) {
    console.error("Error deleting account group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const bulkUploadAccountGroup = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Parse rows with header mapping
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];

    for (const [index, row] of rows.entries()) {
      try {
        // Create AccountGroup from each row
        const accountGroup = await AccountGroup.create({
          account_group_code: row.account_group_code,
          account_group_name: row.account_group_name,
        });

        results.push({
          row: index + 2, // account for header row and zero-based index
          status: "success",
          id: accountGroup.id,
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
    console.error("Bulk upload AccountGroup error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
