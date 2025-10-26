import { models } from "../../models/index.js";
const { ConsumableItem, ItemGroup, OEM, UOM, Account, RevenueMaster } = models;
import XLSX from "xlsx";
import { where, fn, col } from "sequelize";

// Create Consumable Item
export const createConsumableItem = async (req, res) => {
  try {
    const item = await ConsumableItem.create(req.body);
    return res.status(201).json(item);
  } catch (error) {
    console.error("Error creating item:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Items with Associations
export const getAllConsumableItems = async (req, res) => {
  try {
    const items = await ConsumableItem.findAll({
      include: [
        { model: ItemGroup, as: "itemGroup" },
        { model: OEM, as: "oem" },
        { model: UOM, as: "uom" },
        { model: Account, as: "inventoryAccount" },
        { model: Account, as: "expenseAccount" },
        { model: RevenueMaster, as: "revenueAccount" },
      ],
    });
    return res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Item by ID
export const getConsumableItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await ConsumableItem.findByPk(id, {
      include: [
        { model: ItemGroup, as: "itemGroup" },
        { model: OEM, as: "oem" },
        { model: UOM, as: "uom" },
        { model: Account, as: "inventoryAccount" },
        { model: Account, as: "expenseAccount" },
        { model: RevenueMaster, as: "revenueAccount" },
      ],
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.status(200).json(item);
  } catch (error) {
    console.error("Error getting item:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Consumable Item
export const updateConsumableItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await ConsumableItem.findByPk(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.update(req.body);
    return res.status(200).json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Consumable Item
export const deleteConsumableItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await ConsumableItem.findByPk(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.destroy();
    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const bulkUploadConsumableItems = async (req, res) => {
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
      try {
        // Lookup IDs from names
        const itemGroup = await ItemGroup.findOne({
          where: { group_name: row.item_group_name },
        });
        const oem = await OEM.findOne({
          where: { oem_name: row.item_make_name },
        });
        const uom = await UOM.findOne({
          where: { unit_name: row.unit_of_measurement_name },
        });
        const inventoryAccount = await Account.findOne({
          where: where(
            fn("LOWER", fn("TRIM", col("account_name"))),
            row.inventory_account_code_name.trim().toLowerCase()
          ),
        });

        // For expense account
        const expenseAccount = await Account.findOne({
          where: where(
            fn("LOWER", fn("TRIM", col("account_name"))),
            row.expense_account_code_name.trim().toLowerCase()
          ),
        });
        const revenueAccount = await RevenueMaster.findOne({
          where: { revenue_code: row.revenue_account_code_name },
        });

        if (
          !itemGroup ||
          !oem ||
          !uom ||
          !inventoryAccount ||
          !expenseAccount ||
          !revenueAccount
        ) {
          results.push({
            row: index + 2,
            status: "failed",
            message: "One or more referenced names could not be found.",
          });
          continue;
        }

        const created = await ConsumableItem.create({
          item_code: row.item_code,
          item_name: row.item_name,
          item_description: row.item_description,
          product_type: row.product_type,
          item_group_id: itemGroup.id,
          item_make: oem.id,
          unit_of_measurement: uom.id,
          item_qty_in_hand: parseInt(row.item_qty_in_hand) || 0,
          item_avg_cost: parseFloat(row.item_avg_cost) || 0,
          hsn_number: row.hsn_number || "",
          inventory_account_code: inventoryAccount.id,
          expense_account_code: expenseAccount.id,
          revenue_account_code: revenueAccount.id,
        });

        results.push({
          row: index + 2,
          status: "success",
          itemId: created.id,
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
    console.error("Bulk upload consumable items error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
