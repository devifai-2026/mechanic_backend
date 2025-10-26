import { models } from "../../models/index.js";
const { RevenueMaster } = models;
import XLSX from "xlsx";
// Create RevenueMaster

export const createRevenue = async (req, res) => {
  const { revenue_code, revenue_description, revenue_value } = req.body;

  try {
    const newRevenue = await RevenueMaster.create({
      revenue_code,
      revenue_description,
      revenue_value,
    });

    return res.status(201).json(newRevenue);
  } catch (error) {
    console.error("Error creating revenue:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Revenues
export const getAllRevenues = async (req, res) => {
  try {
    const revenues = await RevenueMaster.findAll();
    return res.status(200).json(revenues);
  } catch (error) {
    console.error("Error fetching revenues:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue by ID
export const getRevenueById = async (req, res) => {
  const { id } = req.params;

  try {
    const revenue = await RevenueMaster.findByPk(id);
    if (!revenue) {
      return res.status(404).json({ message: "Revenue not found" });
    }
    return res.status(200).json(revenue);
  } catch (error) {
    console.error("Error fetching revenue:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Revenue
export const updateRevenue = async (req, res) => {
  const { id } = req.params;
  const { revenue_code, revenue_description, revenue_value } = req.body;

  try {
    const revenue = await RevenueMaster.findByPk(id);
    if (!revenue) {
      return res.status(404).json({ message: "Revenue not found" });
    }

    await revenue.update({
      revenue_code,
      revenue_description,
      revenue_value,
    });

    return res.status(200).json(revenue);
  } catch (error) {
    console.error("Error updating revenue:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Revenue
export const deleteRevenue = async (req, res) => {
  const { id } = req.params;

  try {
    const revenue = await RevenueMaster.findByPk(id);
    if (!revenue) {
      return res.status(404).json({ message: "Revenue not found" });
    }

    await revenue.destroy();
    return res.status(200).json({ message: "Revenue deleted successfully" });
  } catch (error) {
    console.error("Error deleting revenue:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const bulkUploadRevenues = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read and parse Excel file buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];

    for (const [index, row] of rows.entries()) {
      const revenueCode = row.revenueCode?.trim();
      const revenueDescription = row.description?.trim() || "";
      const revenueValue = parseFloat(row.revenueValue);

      if (!revenueCode || isNaN(revenueValue)) {
        results.push({
          row: index + 2,
          status: "failed",
          revenueCode: revenueCode || "",
          message: "Missing or invalid revenueCode or revenueValue",
        });
        continue;
      }

      try {
        const newRevenue = await RevenueMaster.create({
          revenue_code: revenueCode,
          revenue_description: revenueDescription,
          revenue_value: revenueValue,
        });

        results.push({
          row: index + 2,
          status: "success",
          revenueCode,
          revenueId: newRevenue.id,
        });
      } catch (error) {
        results.push({
          row: index + 2,
          status: "failed",
          revenueCode,
          message: error.message || "Database error",
        });
      }
    }

    return res.status(201).json({
      message: "Bulk upload completed",
      total: rows.length,
      successCount: results.filter((r) => r.status === "success").length,
      failureCount: results.filter((r) => r.status === "failed").length,
      results,
    });
  } catch (error) {
    console.error("Bulk upload revenue error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
