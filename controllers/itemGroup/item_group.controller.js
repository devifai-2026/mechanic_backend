import { models } from "../../models/index.js"; // adjust path if needed
import XLSX from "xlsx";
const { ItemGroup } = models;

// Create a new ItemGroup
export const createItemGroup = async (req, res) => {
  try {
    const { group_name, group_code } = req.body;
    const newItemGroup = await ItemGroup.create({ group_name, group_code });
    res.status(201).json(newItemGroup);
  } catch (error) {
    console.error("Error creating ItemGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all ItemGroups
export const getAllItemGroups = async (req, res) => {
  try {
    const itemGroups = await ItemGroup.findAll({
      include: [{ model: models.ConsumableItem, as: "consumableItems" }],
    });
    res.json(itemGroups);
  } catch (error) {
    console.error("Error fetching ItemGroups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get ItemGroup by ID
export const getItemGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const itemGroup = await ItemGroup.findByPk(id, {
      include: [{ model: models.ConsumableItem, as: "consumableItems" }],
    });

    if (!itemGroup) {
      return res.status(404).json({ error: "ItemGroup not found" });
    }

    res.json(itemGroup);
  } catch (error) {
    console.error("Error fetching ItemGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an ItemGroup by ID
export const updateItemGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_name, group_code } = req.body;

    const itemGroup = await ItemGroup.findByPk(id);
    if (!itemGroup) {
      return res.status(404).json({ error: "ItemGroup not found" });
    }

    await itemGroup.update({ group_name, group_code });
    res.json(itemGroup);
  } catch (error) {
    console.error("Error updating ItemGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete an ItemGroup by ID
export const deleteItemGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const itemGroup = await ItemGroup.findByPk(id);

    if (!itemGroup) {
      return res.status(404).json({ error: "ItemGroup not found" });
    }

    await itemGroup.destroy();
    res.json({ message: "ItemGroup deleted successfully" });
  } catch (error) {
    console.error("Error deleting ItemGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const bulkUploadItemGroup = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Parse rows as JSON with header row
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];

    for (const [index, row] of rows.entries()) {
      const { group_name, group_code } = row;

      if (!group_name || !group_code) {
        results.push({
          row: index + 2,
          status: "failed",
          message: "Missing required fields (group_name or group_code)",
        });
        continue;
      }

      try {
        // Check duplicate group_code
        const existingGroup = await ItemGroup.findOne({ where: { group_code } });
        if (existingGroup) {
          results.push({
            row: index + 2,
            status: "failed",
            message: "ItemGroup with this group_code already exists",
          });
          continue;
        }

        const newItemGroup = await ItemGroup.create({ group_name, group_code });
        results.push({
          row: index + 2,
          status: "success",
          itemGroupId: newItemGroup.id,
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
    console.error("Bulk upload ItemGroup error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
