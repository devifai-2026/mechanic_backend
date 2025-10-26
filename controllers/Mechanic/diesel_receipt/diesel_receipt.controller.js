import { models } from "../../../models/index.js"; // adjust path if needed
const {
  DieselReceipt,
  ConsumableItem,
  UOM,
  OEM,
  Employee,
  Organisations,
  DieselReceiptItem,
} = models;

// Create a new diesel requisition

// Create receipt with items
export const createDieselReciept = async (req, res) => {
  const t = await models.sequelize.transaction();
  try {
    const {
      date,
      items,
      createdBy,
      is_approve_mic = "pending",
      is_approve_sic = "pending",
      is_approve_pm ="pending",
      org_id,
      project_id,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required." });
    }

    const receipt = await DieselReceipt.create(
      {
        date,
        createdBy,
        is_approve_mic,
        is_approve_sic,
        is_approve_pm,
        org_id,
        project_id
      },
      { transaction: t }
    );

    const itemEntries = items.map((entry) => ({
      receipt_id: receipt.id,
      item: entry.item,
      quantity: entry.quantity,
      UOM: entry.UOM,
      Notes: entry.Notes || "",
    }));

    await DieselReceiptItem.bulkCreate(itemEntries, { transaction: t });

    await t.commit();

    return res.status(201).json({
      message: "Diesel receipt created successfully",
      data: receipt,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get all receipts with items
export const getAllDieselReciept = async (req, res) => {
  try {
    const receipts = await DieselReceipt.findAll({
      include: [
        {
          model: DieselReceiptItem,
          as: "items",
          include: [
            { model: ConsumableItem, as: "consumableItem" },
            { model: UOM, as: "unitOfMeasurement" },
          ],
        },
        {
          model: Employee,
          as: "createdByEmployee",
        },
        {
          model: Organisations,
          as: "organisation",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(receipts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve data", error });
  }
};

// Get single receipt
export const getDieselRecieptById = async (req, res) => {
  try {
    const receipt = await DieselReceipt.findByPk(req.params.id, {
      include: [
        {
          model: DieselReceiptItem,
          as: "items",
          include: [
            { model: ConsumableItem, as: "consumableItem" },
            { model: UOM, as: "unitOfMeasurement" },
          ],
        },
      ],
    });

    if (!receipt) {
      return res.status(404).json({ message: "Requisition not found" });
    }

    return res.status(200).json(receipt);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve requisition", error });
  }
};

// Update receipt (basic only, not deep item updates here)
export const updateDieselReceipt = async (req, res) => {
  try {
    const [updated] = await DieselReceipt.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Requisition not found or unchanged" });
    }

    const updatedReceipt = await DieselReceipt.findByPk(req.params.id);
    return res.status(200).json(updatedReceipt);
  } catch (error) {
    return res.status(500).json({ message: "Update failed", error });
  }
};

// Delete receipt and associated items
export const deleteDieselRequisition = async (req, res) => {
  try {
    const deleted = await DieselReceipt.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Requisition not found" });
    }

    return res
      .status(200)
      .json({ message: "Requisition deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Delete failed", error });
  }
};


export const getAllDieselReceiptByCreator = async (req, res) => {
  try {
    const { org_id, createdBy,project_id } = req.body; // or req.query depending on your frontend

    // Defensive checks
    if (!org_id) {
      return res.status(400).json({ message: "Missing org_id parameter" });
    }
    if (!createdBy) {
      return res.status(400).json({ message: "Missing createdBy parameter" });
    }
    if (!project_id) {
      return res.status(400).json({ message: "Missing project id parameter" });
    }

    const receipts = await DieselReceipt.findAll({
      where: {
        org_id,
        createdBy,
        project_id
      },
      include: [
        {
          model: DieselReceiptItem,
          as: "items",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_description"],
            },
            {
              model: UOM,
              as: "unitOfMeasurement",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
        {
          model: Employee,
          as: "createdByEmployee",
          attributes: ["id", "emp_name"],
        },
        {
          model: Organisations,
          as: "organisation",
          attributes: ["id", "org_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(receipts);
  } catch (error) {
    console.error("Error retrieving diesel receipt:", error);
    return res.status(500).json({
      message: "Failed to retrieve receipt",
      error: error.message,
    });
  }
};
