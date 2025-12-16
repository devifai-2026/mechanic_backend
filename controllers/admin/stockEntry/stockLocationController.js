// File: controllers/admin/stockEntry/stockLocationController.js
import { Op } from "sequelize";
import { models } from "../../../models/index.js";

const { StockLocation, StockEntry, ConsumableItem, Store, Project_Master, Partner } = models;

// Get all stock locations for a specific consumable item
export const getStockLocationsByItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { search } = req.query;

    let whereCondition = { consumable_item_id: itemId };
    
    const includeOptions = [
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
    ];

    const locations = await StockLocation.findAll({
      where: whereCondition,
      include: includeOptions,
      order: [["last_updated", "DESC"]],
    });

    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching stock locations:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message
    });
  }
};

// Create new stock location with initial stock entry
export const createStockLocationWithEntry = async (req, res) => {
  const transaction = await StockLocation.sequelize.transaction();
  
  try {
    const { itemId } = req.params;
    const { 
      storeId,  // <-- This is from request body (camelCase)
      projectId, // <-- This is from request body (camelCase)
      openingStock, // <-- This is from request body (camelCase)
      quantity,
      unitPrice, // <-- This is from request body (camelCase)
      entryDate, // <-- This is from request body (camelCase)
      remarks 
    } = req.body;

    // Convert to snake_case for database
    const store_id = storeId;
    const project_id = projectId;
    const opening_stock = openingStock || 0;
    const unit_price = unitPrice || 0;
    const entry_date = entryDate || new Date().toISOString().split('T')[0];

    // Check if location already exists
    const existingLocation = await StockLocation.findOne({
      where: {
        consumable_item_id: itemId,
        store_id, // <-- Use the converted variable
        project_id, // <-- Use the converted variable
      },
      transaction,
    });

    if (existingLocation) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "Stock location already exists for this store and project combination" 
      });
    }

    // Calculate closing stock
    const closing_stock = (parseFloat(opening_stock) || 0) + (parseFloat(quantity) || 0);

    // Create stock location
    const stockLocation = await StockLocation.create({
      consumable_item_id: itemId,
      store_id,
      project_id,
      opening_stock: parseFloat(opening_stock) || 0,
      closing_stock,
      last_updated: new Date(),
    }, { transaction });

    // Create initial stock entry if quantity is provided
    if (quantity > 0 && unit_price > 0) {
      await StockEntry.create({
        stock_location_id: stockLocation.id,
        entry_date,
        quantity: parseFloat(quantity),
        unit_price: parseFloat(unit_price),
        opening_stock: parseFloat(opening_stock) || 0,
        closing_stock,
        remarks: remarks || "Initial stock entry",
        created_by: req.user?.id,
      }, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      message: "Stock location created successfully",
      location: stockLocation,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating stock location:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message
    });
  }
};

// Update stock location
export const updateStockLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { opening_stock, closing_stock } = req.body;

    const location = await StockLocation.findByPk(locationId);
    
    if (!location) {
      return res.status(404).json({ message: "Stock location not found" });
    }

    const updates = {};
    if (opening_stock !== undefined) updates.opening_stock = parseFloat(opening_stock);
    if (closing_stock !== undefined) updates.closing_stock = parseFloat(closing_stock);
    
    updates.last_updated = new Date();

    await location.update(updates);

    res.status(200).json({
      message: "Stock location updated successfully",
      location,
    });
  } catch (error) {
    console.error("Error updating stock location:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete stock location
export const deleteStockLocation = async (req, res) => {
  const transaction = await StockLocation.sequelize.transaction();
  
  try {
    const { locationId } = req.params;

    const location = await StockLocation.findByPk(locationId, { transaction });
    
    if (!location) {
      await transaction.rollback();
      return res.status(404).json({ message: "Stock location not found" });
    }

    // Delete the location (cascade will handle entries)
    await location.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Stock location and associated entries deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting stock location:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};