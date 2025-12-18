import { models } from "../../models/index.js";
const { ConsumableItem, ItemGroup, OEM, UOM, Account, StockLocation, Partner, Store,  Project_Master } = models;
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
        { model: Account, as: "revenueAccount" },
      ],
    });

    // For each item, get stock locations
    const itemsWithStock = await Promise.all(
      items.map(async (item) => {
        const itemData = item.toJSON();
        
        try {
          // Get stock locations for this item
          const stockLocations = await StockLocation.findAll({
            where: { consumable_item_id: item.id },
            include: [
              {
                model: Store,
                as: "store",
                attributes: ["id", "store_code", "store_name", "store_location"],
              },
              {
                model: Project_Master,
                as: "project",
                attributes: ["id", "project_no", "order_no"],
                include: [
                  {
                    model: Partner,
                    as: "customer",
                    attributes: ["id", "partner_name"],
                  },
                ],
              },
            ],
          });

          // Calculate total closing stock
          let totalClosingStock = 0;
          let latestStockData = [];

          if (stockLocations.length > 0) {
            // Sum up closing stock and prepare data
            totalClosingStock = stockLocations.reduce((sum, location) => 
              sum + (parseFloat(location.closing_stock) || 0), 0
            );

            // Prepare location data
            latestStockData = stockLocations.map(location => ({
              location_id: location.id,
              store_code: location.store?.store_code || 'N/A',
              store_name: location.store?.store_name || 'N/A',
              store_location: location.store?.store_location || 'N/A',
              project_no: location.project?.project_no || 'N/A',
              order_no: location.project?.order_no || 'N/A',
              customer_name: location.project?.customer?.partner_name || 'N/A',
              opening_stock: location.opening_stock,
              closing_stock: location.closing_stock,
              last_updated: location.last_updated || location.updated_at
            }));
          }

          // Return item with stock data
          return {
            ...itemData,
            stock_info: {
              total_closing_stock: totalClosingStock,
              uom: item.uom?.unit_name || itemData.uom?.unit_name || '',
              stock_locations_count: stockLocations.length,
              latest_stock_entries: latestStockData
            }
          };
        } catch (stockError) {
          console.error(`Error fetching stock for item ${item.id}:`, stockError.message);
          // Return item without stock data if there's an error
          return {
            ...itemData,
            stock_info: {
              total_closing_stock: 0,
              uom: item.uom?.unit_name || itemData.uom?.unit_name || '',
              stock_locations_count: 0,
              latest_stock_entries: [],
              error: "Could not fetch stock data"
            }
          };
        }
      })
    );

    return res.status(200).json(itemsWithStock);
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
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
        { model: Account, as: "revenueAccount" }, // Changed from RevenueMaster to Account
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
        // Validate required fields
        const requiredFields = [
          'item_code', 'item_name', 'product_type', 'item_group_name',
          'item_make_name', 'unit_of_measurement_name', 'inventory_account_code_name',
          'expense_account_code_name', 'revenue_account_code_name'
        ];

        const missingRequired = requiredFields.filter(field => !row[field] || row[field].toString().trim() === '');
        
        if (missingRequired.length > 0) {
          results.push({
            row: index + 2,
            status: "failed",
            message: `Missing required fields: ${missingRequired.join(', ')}`
          });
          continue;
        }

        // Lookup IDs from names
        const itemGroup = await ItemGroup.findOne({
          where: { group_name: row.item_group_name.trim() },
        });
        
        const oem = await OEM.findOne({
          where: { oem_name: row.item_make_name.trim() },
        });
        
        const uom = await UOM.findOne({
          where: { unit_name: row.unit_of_measurement_name.trim() },
        });

        const inventoryAccount = await Account.findOne({
          where: where(
            fn("LOWER", fn("TRIM", col("account_name"))),
            fn("LOWER", row.inventory_account_code_name.trim())
          ),
        });

        const expenseAccount = await Account.findOne({
          where: where(
            fn("LOWER", fn("TRIM", col("account_name"))),
            fn("LOWER", row.expense_account_code_name.trim())
          ),
        });

        const revenueAccount = await Account.findOne({
          where: where(
            fn("LOWER", fn("TRIM", col("account_name"))),
            fn("LOWER", row.revenue_account_code_name.trim())
          ),
        });

        // Check if all references were found
        const missingReferences = [];
        if (!itemGroup) missingReferences.push(`Item Group: "${row.item_group_name}"`);
        if (!oem) missingReferences.push(`OEM: "${row.item_make_name}"`);
        if (!uom) missingReferences.push(`UOM: "${row.unit_of_measurement_name}"`);
        if (!inventoryAccount) missingReferences.push(`Inventory Account: "${row.inventory_account_code_name}"`);
        if (!expenseAccount) missingReferences.push(`Expense Account: "${row.expense_account_code_name}"`);
        if (!revenueAccount) missingReferences.push(`Revenue Account: "${row.revenue_account_code_name}"`);

        if (missingReferences.length > 0) {
          results.push({
            row: index + 2,
            status: "failed",
            message: `References not found: ${missingReferences.join(', ')}`
          });
          continue;
        }

        // REMOVED: Account type validation

        // Create the consumable item
        const created = await ConsumableItem.create({
          item_code: row.item_code.trim(),
          item_name: row.item_name.trim(),
          item_description: (row.item_description || '').trim(),
          product_type: row.product_type.trim(),
          item_group_id: itemGroup.id,
          item_make: oem.id,
          unit_of_measurement: uom.id,
          item_qty_in_hand: parseInt(row.item_qty_in_hand) || 0,
          item_avg_cost: parseFloat(row.item_avg_cost) || 0,
          hsn_number: String(row.hsn_number || '').trim(),
          inventory_account_code: inventoryAccount.id,
          expense_account_code: expenseAccount.id,
          revenue_account_code: revenueAccount.id,
        });

        results.push({
          row: index + 2,
          status: "success",
          itemId: created.id,
          message: `Item "${row.item_name}" created successfully`
        });

      } catch (error) {
        console.error(`Error processing row ${index + 2}:`, error.message);
        results.push({
          row: index + 2,
          status: "failed",
          message: `Processing error: ${error.message}`
        });
      }
    }

    // Calculate summary
    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    return res.status(201).json({
      message: `Bulk upload completed: ${successCount} successful, ${failedCount} failed`,
      summary: {
        total: rows.length,
        success: successCount,
        failed: failedCount
      },
      results,
    });
  } catch (error) {
    console.error("Bulk upload consumable items error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};