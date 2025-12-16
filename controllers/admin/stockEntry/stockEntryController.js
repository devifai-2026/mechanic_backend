// File: controllers/admin/stockEntry/stockEntryController.js
import { Sequelize, Op } from "sequelize";
import { models } from "../../../models/index.js";

const { StockEntry, StockLocation, Store, Project_Master, Partner } = models;

// Get all stock entries for a specific item with filtering and pagination
export const getStockEntriesByItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      search = "",
      storeCode,
      projectCode,
      startDate,
      endDate 
    } = req.query;

    const offset = (page - 1) * limit;

    let whereCondition = {
      '$location.consumable_item_id$': itemId,
    };

    // Build include options
    const includeOptions = [
      {
        model: StockLocation,
        as: "location",
        required: true,
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
      },
    ];

    // For MySQL/MariaDB, we need to use Op.like and handle case-insensitivity
    const searchPattern = search ? `%${search}%` : null;
    const storeCodePattern = storeCode ? `%${storeCode}%` : null;
    const projectCodePattern = projectCode ? `%${projectCode}%` : null;

    // Search filter - using Op.like with Sequelize.fn for case-insensitive search
    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('location.store.store_code')),
            { [Op.like]: `%${search.toLowerCase()}%` }
          ),
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('location.project.project_no')),
            { [Op.like]: `%${search.toLowerCase()}%` }
          ),
        ],
      };
    }

    // Additional filters
    if (storeCode) {
      whereCondition['$location.store.store_code$'] = { 
        [Op.like]: storeCodePattern 
      };
    }
    
    if (projectCode) {
      whereCondition['$location.project.project_no$'] = { 
        [Op.like]: projectCodePattern 
      };
    }
    
    if (startDate && endDate) {
      whereCondition.entry_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const { count, rows: entries } = await StockEntry.findAndCountAll({
      where: whereCondition,
      include: includeOptions,
      order: [["entry_date", "DESC"], ["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      entries,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching stock entries:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message
    });
  }
};

// Create new stock entry
export const createStockEntry = async (req, res) => {
  const transaction = await StockEntry.sequelize.transaction();
  
  try {
    const { locationId } = req.params;
    const { 
      stockLocationId, // From frontend payload
      quantity, 
      unitPrice, // Changed from unit_price to unitPrice
      entryDate = new Date().toISOString().split('T')[0], // Changed from entry_date to entryDate
      remarks 
    } = req.body;

    // Use either locationId from params or stockLocationId from body
    const locationIdToUse = stockLocationId || locationId;

    if (!quantity || !unitPrice) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "Quantity and unit price are required" 
      });
    }

    const quantityNum = parseFloat(quantity);
    const unitPriceNum = parseFloat(unitPrice);

    if (quantityNum <= 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "Quantity must be greater than 0" 
      });
    }

    if (unitPriceNum <= 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "Unit price must be greater than 0" 
      });
    }

    // Get the stock location
    const location = await StockLocation.findByPk(locationIdToUse, { transaction });
    
    if (!location) {
      await transaction.rollback();
      return res.status(404).json({ message: "Stock location not found" });
    }

    // Use current closing stock as opening stock for new entry
    const opening_stock = location.closing_stock;
    const closing_stock = opening_stock + quantityNum;

    // Create stock entry
    const stockEntry = await StockEntry.create({
      stock_location_id: locationIdToUse,
      entry_date: entryDate, // Map entryDate to entry_date
      quantity: quantityNum,
      unit_price: unitPriceNum, // Map unitPrice to unit_price
      opening_stock,
      closing_stock,
      remarks: remarks || "Stock entry added",
      created_by: req.user?.id,
    }, { transaction });

    // Update stock location
    location.closing_stock = closing_stock;
    location.last_updated = new Date();
    await location.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      message: "Stock entry created successfully",
      entry: stockEntry,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating stock entry:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message
    });
  }
};

// Get stock entry by ID
export const getStockEntryById = async (req, res) => {
  try {
    const { entryId } = req.params;

    const entry = await StockEntry.findByPk(entryId, {
      include: [
        {
          model: StockLocation,
          as: "location",
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
            },
          ],
        },
      ],
    });

    if (!entry) {
      return res.status(404).json({ message: "Stock entry not found" });
    }

    res.status(200).json(entry);
  } catch (error) {
    console.error("Error fetching stock entry:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Update stock entry
export const updateStockEntry = async (req, res) => {
  const transaction = await StockEntry.sequelize.transaction();
  
  try {
    const { entryId } = req.params;
    const { quantity, unit_price, entry_date, remarks } = req.body;

    const entry = await StockEntry.findByPk(entryId, { transaction });
    
    if (!entry) {
      await transaction.rollback();
      return res.status(404).json({ message: "Stock entry not found" });
    }

    // Update entry fields
    const updates = {};
    if (quantity !== undefined) updates.quantity = parseFloat(quantity);
    if (unit_price !== undefined) updates.unit_price = parseFloat(unit_price);
    if (entry_date !== undefined) updates.entry_date = entry_date;
    if (remarks !== undefined) updates.remarks = remarks;

    await entry.update(updates, { transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Stock entry updated successfully",
      entry,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating stock entry:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete stock entry
export const deleteStockEntry = async (req, res) => {
  const transaction = await StockEntry.sequelize.transaction();
  
  try {
    const { entryId } = req.params;

    const entry = await StockEntry.findByPk(entryId, { transaction });
    
    if (!entry) {
      await transaction.rollback();
      return res.status(404).json({ message: "Stock entry not found" });
    }

    // Delete the entry
    await entry.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Stock entry deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting stock entry:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};