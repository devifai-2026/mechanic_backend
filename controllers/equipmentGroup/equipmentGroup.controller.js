import { models } from "../../models/index.js";
const { EquipmentGroup } = models;
import XLSX from "xlsx";
// Create EquipmentGroup
export const createEquipmentGroup = async (req, res) => {
  const { equip_grp_code, equipment_group } = req.body;

  try {
    const newGroup = await EquipmentGroup.create({
      equip_grp_code,
      equipment_group,
    });

    return res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating equipment group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All EquipmentGroups
export const getAllEquipmentGroups = async (req, res) => {
  try {
    const groups = await EquipmentGroup.findAll();
    return res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching equipment groups:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get EquipmentGroup by ID
export const getEquipmentGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await EquipmentGroup.findByPk(id);
    if (!group) {
      return res.status(404).json({ message: "Equipment group not found" });
    }
    return res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching equipment group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update EquipmentGroup
export const updateEquipmentGroup = async (req, res) => {
  const { id } = req.params;
  const { equip_grp_code, equipment_group } = req.body;

  try {
    const group = await EquipmentGroup.findByPk(id);
    if (!group) {
      return res.status(404).json({ message: "Equipment group not found" });
    }

    await group.update({
      equip_grp_code,
      equipment_group,
    });

    return res.status(200).json(group);
  } catch (error) {
    console.error("Error updating equipment group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete EquipmentGroup
export const deleteEquipmentGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await EquipmentGroup.findByPk(id);
    if (!group) {
      return res.status(404).json({ message: "Equipment group not found" });
    }

    await group.destroy();
    return res
      .status(200)
      .json({ message: "Equipment group deleted successfully" });
  } catch (error) {
    console.error("Error deleting equipment group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const bulkUploadEquipmentGroups = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];

    for (const [index, row] of rows.entries()) {
      const { group_name, group_code } = row;

      // Validate required fields
      if (!group_name || !group_code) {
        results.push({
          row: index + 2,
          status: "failed",
          message: "Missing required fields: equipment_group or equip_grp_code",
        });
        continue;
      }

      try {
        const newGroup = await EquipmentGroup.create({
          equipment_group: group_name,
          equip_grp_code: group_code,
        });

        results.push({
          row: index + 2,
          status: "success",
          id: newGroup.id,
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
    console.error("Bulk upload error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
