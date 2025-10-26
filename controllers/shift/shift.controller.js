import { Op } from "sequelize";
import { models } from "../../models/index.js";
const { Shift } = models;
import XLSX from "xlsx";
// Create Shift
export const createShift = async (req, res) => {
  try {
    const { shift_code, shift_from_time, shift_to_time } = req.body;

    // Check if shift with the same code exists
    const existingShift = await Shift.findOne({
      where: {
        shift_code: {
          [Op.eq]: shift_code, // Use Op.iLike for PostgreSQL and case-insensitive match
        },
      },
    });

    if (existingShift) {
      return res
        .status(500)
        .json({ message: "Shift with this code already exists" });
    }

    // Create new shift
    const newShift = await Shift.create({
      shift_code,
      shift_from_time,
      shift_to_time,
    });

    return res.status(201).json(newShift);
  } catch (error) {
    console.error("Error creating shift:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all Shifts
export const getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.findAll();
    return res.status(200).json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Shift by ID
export const getShiftById = async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findByPk(id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }
    return res.status(200).json(shift);
  } catch (error) {
    console.error("Error fetching shift by ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Shift
export const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { shift_code, shift_from_time, shift_to_time } = req.body;

    const shift = await Shift.findByPk(id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    await shift.update({ shift_code, shift_from_time, shift_to_time });
    return res.status(200).json(shift);
  } catch (error) {
    console.error("Error updating shift:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Shift
export const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    const shift = await Shift.findByPk(id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    await shift.destroy();
    return res.status(200).json({ message: "Shift deleted successfully" });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const bulkUploadShifts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse Excel buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON using header row as keys
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];

    for (const [index, row] of rows.entries()) {
      const { shift_code, shift_from_time, shift_to_time } = row;

      // Basic validation
      if (!shift_code || !shift_from_time || !shift_to_time) {
        results.push({
          row: index + 2,
          status: "failed",
          message: "Missing required fields",
        });
        continue;
      }

      try {
        // Check if shift_code exists (case-insensitive if needed)
        const existingShift = await Shift.findOne({
          where: {
            shift_code: {
              [Op.eq]: shift_code,
            },
          },
        });

        if (existingShift) {
          results.push({
            row: index + 2,
            status: "failed",
            message: "Shift code already exists",
          });
          continue;
        }

        // Create new shift
        const newShift = await Shift.create({
          shift_code,
          shift_from_time,
          shift_to_time,
        });

        results.push({
          row: index + 2,
          status: "success",
          shiftId: newShift.id,
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
    console.error("Bulk upload shifts error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};