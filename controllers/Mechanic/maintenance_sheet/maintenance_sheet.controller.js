import { models } from "../../../models/index.js";
const { MaintenanceSheet, MaintenanceSheetItem, ConsumableItem, UOM, Equipment, Organisations } = models;

// Create Maintenance Sheet with items
export const createMaintenanceSheet = async (req, res) => {
  const t = await models.sequelize.transaction();
  try {
    const { items, ...sheetData } = req.body;

    // Create main sheet
    const sheet = await MaintenanceSheet.create(sheetData, { transaction: t });

    // Create associated items
    if (Array.isArray(items) && items.length > 0) {
      const itemRecords = items.map((item) => ({
        maintenance_sheet_id: sheet.id,
        item: item.item,
        quantity: item.quantity,
        uom_id: item.uom_id,
        notes: item.notes || '',
      }));
      await MaintenanceSheetItem.bulkCreate(itemRecords, { transaction: t });
    }

    await t.commit();
    return res.status(201).json({ message: "Maintenance sheet created", sheetId: sheet.id });
  } catch (error) {
    await t.rollback();
    console.error("Error creating maintenance sheet:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all Maintenance Sheets with items
export const getAllMaintenanceSheets = async (req, res) => {
  try {
    const sheets = await MaintenanceSheet.findAll({
      include: [
        { association: 'equipmentData' },
        { association: 'createdByUser' },
        { association: 'organisation' },
        {
          model: MaintenanceSheetItem,
          as: 'items',
          include: [
            { association: 'itemData' },
            { association: 'uomData' },
          ],
        },
      ],
    });
    return res.status(200).json(sheets);
  } catch (error) {
    console.error("Error fetching maintenance sheets:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Maintenance Sheet by ID
export const getMaintenanceSheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const sheet = await MaintenanceSheet.findByPk(id, {
      include: [
        { association: 'equipmentData' },
        { association: 'createdByUser' },
        { association: 'organisation' },
        {
          model: MaintenanceSheetItem,
          as: 'items',
          include: [
            { association: 'itemData' },
            { association: 'uomData' },
          ],
        },
      ],
    });

    if (!sheet) {
      return res.status(404).json({ message: "Maintenance sheet not found" });
    }

    return res.status(200).json(sheet);
  } catch (error) {
    console.error("Error fetching maintenance sheet:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Maintenance Sheet and its items
export const updateMaintenanceSheet = async (req, res) => {
  const t = await models.sequelize.transaction();
  try {
    const { id } = req.params;
    const { items, ...sheetData } = req.body;

    const sheet = await MaintenanceSheet.findByPk(id);
    if (!sheet) {
      return res.status(404).json({ message: "Maintenance sheet not found" });
    }

    await sheet.update(sheetData, { transaction: t });

    if (Array.isArray(items)) {
      // Delete old items
      await MaintenanceSheetItem.destroy({
        where: { maintenance_sheet_id: id },
        transaction: t,
      });

      // Add updated items
      const newItems = items.map((item) => ({
        maintenance_sheet_id: id,
        item: item.item,
        quantity: item.quantity,
        uom_id: item.uom_id,
        notes: item.notes || '',
      }));

      await MaintenanceSheetItem.bulkCreate(newItems, { transaction: t });
    }

    await t.commit();
    return res.status(200).json({ message: "Maintenance sheet updated" });
  } catch (error) {
    await t.rollback();
    console.error("Error updating maintenance sheet:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Maintenance Sheet and its items
export const deleteMaintenanceSheet = async (req, res) => {
  const t = await models.sequelize.transaction();
  try {
    const { id } = req.params;

    const sheet = await MaintenanceSheet.findByPk(id);
    if (!sheet) {
      return res.status(404).json({ message: "Maintenance sheet not found" });
    }

    await MaintenanceSheetItem.destroy({ where: { maintenance_sheet_id: id }, transaction: t });
    await MaintenanceSheet.destroy({ where: { id }, transaction: t });

    await t.commit();
    return res.status(200).json({ message: "Maintenance sheet deleted successfully" });
  } catch (error) {
    await t.rollback();
    console.error("Error deleting maintenance sheet:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getAllMaintenanceSheetByCreator = async (req, res) => {
  try {
    const { org_id, createdBy, project_id } = req.body;

    if (!org_id) {
      return res.status(400).json({ message: "Missing org_id parameter" });
    }
    if (!createdBy) {
      return res.status(400).json({ message: "Missing createdBy parameter" });
    }
    if (!project_id) {
      return res.status(400).json({ message: "Missing project id parameter" });
    }

    const requisitions = await MaintenanceSheet.findAll({
      where: { org_id, createdBy, project_id },
      include: [
        {
          model: MaintenanceSheetItem,
          as: "items",
          include: [
            {
              model: ConsumableItem,
              as: "itemData",
              attributes: ["id", "item_name", "item_description"],
            },
            {
              model: UOM,
              as: "uomData",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Map over each requisition and add equipment details manually
    const enrichedRequisitions = await Promise.all(
      requisitions.map(async (reqItem) => {
        const equipmentDetails = reqItem.equipment
          ? await Equipment.findByPk(reqItem.equipment, {
            attributes: ["id", "equipment_name", ], // select relevant fields
          })
          : null;

        // Convert Sequelize instance to plain object
        const plainReqItem = reqItem.toJSON();
        plainReqItem.equipment = equipmentDetails;

        return plainReqItem;
      })
    );

    return res.status(200).json(enrichedRequisitions);
  } catch (error) {
    console.error("Error retrieving maintenance sheets:", error);
    return res.status(500).json({
      message: "Failed to retrieve maintenance sheets",
      error: error.message,
    });
  }
};
