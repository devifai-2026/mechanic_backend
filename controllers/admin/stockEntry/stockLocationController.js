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
      {
        model: StockEntry,
        as: "entries",
        attributes: ["id", "quantity", "unit_price", "entry_date", "remarks"],
        required: false, // Use false to get locations even without entries
      },
    ];

    const locations = await StockLocation.findAll({
      where: whereCondition,
      include: includeOptions,
      order: [
        ["last_updated", "DESC"],
        [{ model: StockEntry, as: "entries" }, "entry_date", "DESC"], // Order entries by date
      ],
    });

    // Calculate total quantity, value, and average price
    const locationsWithCalculations = locations.map(location => {
      const locationJSON = location.toJSON();
      
      // Calculate totals from entries
      let totalQuantity = 0;
      let totalValue = 0;
      
      if (locationJSON.entries && locationJSON.entries.length > 0) {
        locationJSON.entries.forEach(entry => {
          totalQuantity += parseFloat(entry.quantity);
          totalValue += parseFloat(entry.quantity) * parseFloat(entry.unit_price);
        });
      }
      
      // Add calculated fields
      locationJSON.total_quantity = totalQuantity;
      locationJSON.total_value = totalValue;
      locationJSON.average_unit_price = totalQuantity > 0 ? 
        (totalValue / totalQuantity).toFixed(2) : 0;
      
      return locationJSON;
    });

    res.status(200).json(locationsWithCalculations);
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


// File: controllers/admin/stockEntry/stockEntryController.js


// Get ALL stock entries OR locations if entries don't exist
export const getAllStockEntries = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = "",
      storeCode,
      projectCode,
      startDate,
      endDate,
      entryType,
      itemCode,
      itemName
    } = req.query;
    

    const offset = (page - 1) * limit;

    // Try to get from StockEntry first
    let whereCondition = {};
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
            where: storeCode ? { store_code: { [Op.like]: `%${storeCode}%` } } : undefined,
          },
          {
            model: Project_Master,
            as: "project",
            attributes: ["id", "project_no", "order_no"],
            where: projectCode ? { project_no: { [Op.like]: `%${projectCode}%` } } : undefined,
            include: [
              {
                model: Partner,
                as: "customer",
                attributes: ["id", "partner_name"],
              },
            ],
          },
          {
            model: ConsumableItem,
            as: "consumable_item",
            attributes: ["id", "item_code", "item_name"],
            where: itemCode ? { item_code: { [Op.like]: `%${itemCode}%` } } : 
                   itemName ? { item_name: { [Op.like]: `%${itemName}%` } } : undefined,
          },
        ],
      },
    ];

    // Search filter
    if (search) {
      whereCondition[Op.or] = [
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('location.store.store_code')),
          { [Op.like]: `%${search.toLowerCase()}%` }
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('location.project.project_no')),
          { [Op.like]: `%${search.toLowerCase()}%` }
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('location.consumable_item.item_code')),
          { [Op.like]: `%${search.toLowerCase()}%` }
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('location.consumable_item.item_name')),
          { [Op.like]: `%${search.toLowerCase()}%` }
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('remarks')),
          { [Op.like]: `%${search.toLowerCase()}%` }
        ),
      ];
    }
    
    if (entryType) {
      whereCondition.entry_type = entryType;
    }
    
    if (startDate && endDate) {
      whereCondition.entry_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    try {
      // Try to get stock entries
      const { count, rows: entries } = await StockEntry.findAndCountAll({
        where: whereCondition,
        include: includeOptions,
        order: [["entry_date", "DESC"], ["created_at", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true,
      });

      // Format the response
      const formattedEntries = entries.map(entry => ({
        id: entry.id,
        date: entry.entry_date || entry.created_at,
        storeCode: entry.location?.store?.store_code || 'N/A',
        storeName: entry.location?.store?.store_name || 'N/A',
        storeLocation: entry.location?.store?.store_location || 'N/A',
        projectCode: entry.location?.project?.project_no || 'N/A',
        orderNo: entry.location?.project?.order_no || 'N/A',
        customerName: entry.location?.project?.customer?.partner_name || 'N/A',
        itemCode: entry.location?.consumable_item?.item_code || 'N/A',
        itemName: entry.location?.consumable_item?.item_name || 'N/A',
        quantity: parseFloat(entry.quantity) || 0,
        unitPrice: parseFloat(entry.unit_price) || 0,
        totalPrice: (parseFloat(entry.quantity) || 0) * (parseFloat(entry.unit_price) || 0),
        openingStock: parseFloat(entry.opening_stock) || 0,
        closingStock: parseFloat(entry.closing_stock) || 0,
        entryType: entry.entry_type || 'Stock Entry',
        remarks: entry.remarks || '',
        createdBy: entry.created_by,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
      }));

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        entries: formattedEntries,
        pagination: {
          totalItems: count,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });

    } catch (error) {
      // If no StockEntry data, try to get from StockLocation
      console.log("No StockEntry data, trying StockLocation...");
      
      // Get stock locations with filters
      const locationWhereCondition = {};
      const locationIncludeOptions = [
        {
          model: Store,
          as: "store",
          attributes: ["id", "store_code", "store_name", "store_location"],
          where: storeCode ? { store_code: { [Op.like]: `%${storeCode}%` } } : undefined,
        },
        {
          model: Project_Master,
          as: "project",
          attributes: ["id", "project_no", "order_no"],
          where: projectCode ? { project_no: { [Op.like]: `%${projectCode}%` } } : undefined,
          include: [
            {
              model: Partner,
              as: "customer",
              attributes: ["id", "partner_name"],
            },
          ],
        },
        {
          model: ConsumableItem,
          as: "consumable_item",
          attributes: ["id", "item_code", "item_name"],
          where: itemCode ? { item_code: { [Op.like]: `%${itemCode}%` } } : 
                 itemName ? { item_name: { [Op.like]: `%${itemName}%` } } : undefined,
        },
      ];

      // Apply search filter to locations
      if (search) {
        locationWhereCondition[Op.or] = [
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('store.store_code')),
            { [Op.like]: `%${search.toLowerCase()}%` }
          ),
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('project.project_no')),
            { [Op.like]: `%${search.toLowerCase()}%` }
          ),
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('consumable_item.item_code')),
            { [Op.like]: `%${search.toLowerCase()}%` }
          ),
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('consumable_item.item_name')),
            { [Op.like]: `%${search.toLowerCase()}%` }
          ),
        ];
      }

      const { count: locationCount, rows: locations } = await StockLocation.findAndCountAll({
        where: locationWhereCondition,
        include: locationIncludeOptions,
        order: [["last_updated", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true,
      });

      // Format locations as entries for the history table
      const formattedEntries = locations.map(location => ({
        id: location.id,
        date: location.last_updated || location.created_at,
        storeCode: location.store?.store_code || 'N/A',
        storeName: location.store?.store_name || 'N/A',
        storeLocation: location.store?.store_location || 'N/A',
        projectCode: location.project?.project_no || 'N/A',
        orderNo: location.project?.order_no || 'N/A',
        customerName: location.project?.customer?.partner_name || 'N/A',
        itemCode: location.consumable_item?.item_code || 'N/A',
        itemName: location.consumable_item?.item_name || 'N/A',
        quantity: 0, // No quantity for location-only entries
        unitPrice: 0,
        totalPrice: 0,
        openingStock: parseFloat(location.opening_stock) || 0,
        closingStock: parseFloat(location.closing_stock) || 0,
        entryType: 'Stock Location',
        remarks: 'Location record',
        createdAt: location.created_at,
        updatedAt: location.updated_at,
      }));

      const totalPages = Math.ceil(locationCount / limit);

      res.status(200).json({
        entries: formattedEntries,
        pagination: {
          totalItems: locationCount,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    }

  } catch (error) {
    console.error("Error fetching stock entries:", error);
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