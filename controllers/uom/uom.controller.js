import { models } from "../../models/index.js";
const { UOM } = models;
import XLSX from "xlsx";
// Create a UOM
export const createUOM = async (req, res) => {
  const { unit_code, unit_name } = req.body;

  try {
    // Check if unit_code already exists
    const existingUOM = await UOM.findOne({ where: { unit_code } });
    if (existingUOM) {
      return res.status(400).json({ message: "UOM with this unit_code already exists" });
    }

    // Create new UOM
    const uom = await UOM.create({ unit_code, unit_name });
    return res.status(201).json(uom);
  } catch (error) {
    console.error("Error creating UOM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all UOMs
export const getUOMs = async (req, res) => {
  try {
    const uoms = await UOM.findAll();
    return res.status(200).json(uoms);
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get UOM by ID
export const getUOMById = async (req, res) => {
  const { id } = req.params;

  try {
    const uom = await UOM.findByPk(id);
    if (!uom) {
      return res.status(404).json({ message: "UOM not found" });
    }
    return res.status(200).json(uom);
  } catch (error) {
    console.error("Error fetching UOM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update UOM
export const updateUOM = async (req, res) => {
  const { id } = req.params;
  const { unit_code, unit_name } = req.body;

  try {
    const uom = await UOM.findByPk(id);
    if (!uom) {
      return res.status(404).json({ message: "UOM not found" });
    }

    // If unit_code is being updated, check uniqueness
    if (unit_code && unit_code !== uom.unit_code) {
      const existingUOM = await UOM.findOne({ where: { unit_code } });
      if (existingUOM) {
        return res.status(400).json({ message: "UOM with this unit_code already exists" });
      }
    }

    await uom.update({ unit_code, unit_name });
    return res.status(200).json(uom);
  } catch (error) {
    console.error("Error updating UOM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete UOM
export const deleteUOM = async (req, res) => {
  const { id } = req.params;

  try {
    const uom = await UOM.findByPk(id);
    if (!uom) {
      return res.status(404).json({ message: "UOM not found" });
    }

    await uom.destroy();
    return res.status(200).json({ message: "UOM deleted successfully" });
  } catch (error) {
    console.error("Error deleting UOM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const bulkUploadUOM = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Parse rows as JSON using first row as header
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];

    for (const [index, row] of rows.entries()) {
      const { unit_code, unit_name } = row;

      if (!unit_code || !unit_name) {
        results.push({
          row: index + 2,
          status: "failed",
          message: "Missing required fields (unit_code or unit_name)",
        });
        continue;
      }

      try {
        const existingUOM = await UOM.findOne({ where: { unit_code } });
        if (existingUOM) {
          results.push({
            row: index + 2,
            status: "failed",
            message: "UOM with this unit_code already exists",
          });
          continue;
        }

        const uom = await UOM.create({ unit_code, unit_name });
        results.push({
          row: index + 2,
          status: "success",
          uomId: uom.id,
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
    console.error("Bulk upload UOM error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
