import { Op } from "sequelize";
import { models } from "../../models/index.js";
const { EmpPositionsModel } = models;

// Create Emp Position
export const createEmpPosition = async (req, res) => {
  try {
    const { designation } = req.body;

    // Check if the designation already exists
    const existingPosition = await EmpPositionsModel.findOne({
      where: {
        designation: {
          [Op.iLike]: designation, // case-insensitive match (PostgreSQL). Use Op.eq for exact/case-sensitive.
        },
      },
    });

    if (existingPosition) {
      return res.status(500).json({ message: "Designation already exists" });
    }

    // Create new position if no duplicate
    const newPosition = await EmpPositionsModel.create({ designation });
    return res.status(201).json(newPosition);
  } catch (error) {
    console.error("Error creating employee position:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Positions
export const getAllEmpPositions = async (req, res) => {
  try {
    const positions = await EmpPositionsModel.findAll();
    return res.status(200).json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Position by ID
export const getEmpPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await EmpPositionsModel.findByPk(id);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    return res.status(200).json(position);
  } catch (error) {
    console.error("Error fetching position by ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Position
export const updateEmpPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { designation } = req.body;

    const position = await EmpPositionsModel.findByPk(id);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    await position.update({ designation });
    return res.status(200).json(position);
  } catch (error) {
    console.error("Error updating position:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Position
export const deleteEmpPosition = async (req, res) => {
  try {
    const { id } = req.params;

    const position = await EmpPositionsModel.findByPk(id);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    await position.destroy();
    return res.status(200).json({ message: "Position deleted successfully" });
  } catch (error) {
    console.error("Error deleting position:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
