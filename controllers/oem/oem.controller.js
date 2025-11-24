import { models } from '../../models/index.js';
const { OEM } = models;

// Create OEM
export const createOEM = async (req, res) => {
  const { oem_name, oem_code } = req.body;

  try {
    const oem = await OEM.create({ oem_name, oem_code });
    return res.status(201).json(oem);
  } catch (error) {
    console.error("Error creating OEM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All OEMs
export const getAllOEMs = async (req, res) => {
  try {
    const oems = await OEM.findAll();
    console
    return res.status(200).json(oems);
  } catch (error) {
    console.error("Error fetching OEMs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get OEM by ID
export const getOEMById = async (req, res) => {
  const { id } = req.params;

  try {
    const oem = await OEM.findByPk(id);
    if (!oem) {
      return res.status(404).json({ message: "OEM not found" });
    }
    return res.status(200).json(oem);
  } catch (error) {
    console.error("Error fetching OEM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update OEM
export const updateOEM = async (req, res) => {
  const { id } = req.params;
  const { oem_name, oem_code } = req.body;

  try {
    const oem = await OEM.findByPk(id);
    if (!oem) {
      return res.status(404).json({ message: "OEM not found" });
    }

    await oem.update({ oem_name, oem_code });
    return res.status(200).json(oem);
  } catch (error) {
    console.error("Error updating OEM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete OEM
export const deleteOEM = async (req, res) => {
  const { id } = req.params;

  try {
    const oem = await OEM.findByPk(id);
    if (!oem) {
      return res.status(404).json({ message: "OEM not found" });
    }

    await oem.destroy();
    return res.status(200).json({ message: "OEM deleted successfully" });
  } catch (error) {
    console.error("Error deleting OEM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
