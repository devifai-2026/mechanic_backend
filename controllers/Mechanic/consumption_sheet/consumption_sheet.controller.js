import { models } from "../../../models/index.js"; // Adjust path if needed
const {
  Equipment,
  ConsumableItem,
  UOM,
  Employee,
  Organisations,
  ConsumptionSheet,
  ConsumptionSheetItem,
} = models;

// ✅ CREATE

export const createConsumptionSheet = async (req, res) => {
  const {
    date,
    createdBy,
    org_id,
    project_id, // Assuming project_id isrequired
    is_approved_mic = "pending",
    is_approved_sic = "pending",
    is_approved_pm = "pending",
    items = [],
  } = req.body;

  if (!items.length) {
    return res.status(400).json({ message: "No items provided" });
  }

  try {
    // Validate organisation
    const org = await Organisations.findByPk(org_id);
    if (!org) {
      return res.status(400).json({ message: 'Invalid organisation ID' });
    }

    // Validate creator
    const creator = await Employee.findByPk(createdBy);
    if (!creator) {
      return res.status(400).json({ message: 'Invalid creator (employee) ID' });
    }

    // Validate each item and its UOM
    for (const item of items) {
      const itemExists = await ConsumableItem.findByPk(item.item);
      if (!itemExists) {
        return res.status(400).json({ message: `Invalid item ID: ${item.item}` });
      }

      const uomExists = await UOM.findByPk(item.uom_id);
      if (!uomExists) {
        return res.status(400).json({ message: `Invalid UOM ID: ${item.uom_id}` });
      }
    }

    // Create the sheet
    const sheet = await ConsumptionSheet.create({
      date,
      createdBy,
      org_id,
      is_approved_mic,
      is_approved_sic,
      is_approved_pm,
      project_id
    });

    // Create items
    const itemPromises = items.map(item =>
      ConsumptionSheetItem.create({
        consumption_sheet_id: sheet.id,
        equipment: item.equipment,
        item: item.item,
        equipment: item.equipment,
        quantity: item.quantity,
        uom_id: item.uom_id,
        notes: item.notes || "",
        reading_meter_uom: item.reading_meter_uom || null,
        reading_meter_number: item.reading_meter_number || null,
      })
    );

    const createdItems = await Promise.all(itemPromises);

    return res.status(201).json({
      message: "Consumption sheet created successfully",
      sheet,
      items: createdItems,
    });
  } catch (error) {
    console.error('Error creating consumption sheet:', error);
    return res.status(500).json({
      message: "Failed to create consumption sheet",
      error: error.message,
    });
  }
};


// ✅ READ ALL
export const getAllConsumptionSheets = async (req, res) => {
  try {
    const sheets = await ConsumptionSheet.findAll({
      include: [
        {
          model: ConsumptionSheetItem,
          as: "items",
          include: [
            { model: ConsumableItem, as: "itemData" },
            { model: UOM, as: "uomData" },
            { model: Equipment, as: "equipmentData" }, 
          ],
        },
        { model: Employee, as: "createdByUser" },
        { model: Organisations, as: "organisation" },
      ],
    });
    return res.status(200).json(sheets);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve entries", error: error.message });
  }
};

// ✅ READ ONE
export const getConsumptionSheetById = async (req, res) => {
  try {
    const sheet = await ConsumptionSheet.findByPk(req.params.id, {
      include: [
        {
          model: ConsumptionSheetItem,
          as: "items",
          include: [
            { model: ConsumableItem, as: "itemData" },
            { model: UOM, as: "uomData" },
            { model: Equipment, as: "equipmentData" }, 
          ],
        },
        { model: Employee, as: "createdByUser" },
        { model: Organisations, as: "organisation" },
      ],
    });

    if (!sheet) {
      return res.status(404).json({ message: "Entry not found" });
    }

    return res.status(200).json(sheet);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve entry", error: error.message });
  }
};

// ✅ UPDATE
export const updateConsumptionSheet = async (req, res) => {
  const { id } = req.params;
  const {
    date,
    createdBy,
    org_id,
    is_approved_mic,
    is_approved_sic,
    is_approved_pm,
    items = [],
  } = req.body;

  try {
    const sheet = await ConsumptionSheet.findByPk(id);
    if (!sheet) {
      return res.status(404).json({ message: "Consumption sheet not found" });
    }

    await sheet.update({
      date,
      createdBy,
      org_id,
      is_approved_mic,
      is_approved_sic,
      is_approved_pm,
    });

    // Optional: Delete existing items and re-create (or do smart update if needed)
    await ConsumptionSheetItem.destroy({ where: { consumption_sheet_id: id } });

    const newItems = await Promise.all(
      items.map((item) =>
        ConsumptionSheetItem.create({
          consumption_sheet_id: id,
          item: item.item,
          equipment: item.equipment,
          quantity: item.quantity,
          uom_id: item.uom_id,
          notes: item.notes || "",
          reading_meter_uom: item.reading_meter_uom || null,
          reading_meter_number: item.reading_meter_number || null,
        })
      )
    );

    return res
      .status(200)
      .json({ message: "Updated successfully", sheet, items: newItems });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update", error: error.message });
  }
};

// ✅ DELETE
export const deleteConsumptionSheet = async (req, res) => {
  const { id } = req.params;

  try {
    const sheet = await ConsumptionSheet.findByPk(id);
    if (!sheet) {
      return res.status(404).json({ message: "Entry not found" });
    }

    await ConsumptionSheetItem.destroy({ where: { consumption_sheet_id: id } });
    await sheet.destroy();

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete", error: error.message });
  }
};


// // ✅  get by creator
export const getConsumptionSheetsByCreator = async (req, res) => {
  try {
    const { createdBy, org_id, project_id } = req.body; // Use req.body or req.query based on your frontend

    // Defensive checks
    if (!createdBy) {
      return res.status(400).json({ message: 'Missing createdBy parameter' });
    }
    if (!org_id) {
      return res.status(400).json({ message: 'Missing org_id parameter' });
    }
     if (!project_id) {
      return res.status(400).json({ message: 'Missing project_id parameter' });
    }

    // Fetching consumption sheets by creator and org
    const sheets = await ConsumptionSheet.findAll({
      where: {
        createdBy,
        org_id,
        project_id
      },
      include: [
        {
          model: ConsumptionSheetItem,
          as: 'items',
          include: [
            { model: ConsumableItem, as: 'itemData' },
            { model: UOM, as: 'uomData' },
          ],
        },
        {
          model: Employee,
          as: 'createdByUser',
        },
        {
          model: Organisations,
          as: 'organisation',
        },
      ],
    });

    return res.status(200).json(sheets);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve consumption sheets',
      error: error.message,
    });
  }
};

