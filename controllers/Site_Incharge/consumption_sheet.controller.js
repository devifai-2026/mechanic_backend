import { Op } from "sequelize";
import { models } from "../../models/index.js";
const {
  ConsumptionSheet,
  ConsumptionSheetItem,
  ConsumableItem,
  UOM,
  Employee,
  Organisations,
  Equipment,
} = models;

/**
 * Get all consumption sheets for a project
 */
export const getAllConsumptionSheets = async (req, res) => {
  try {
    const { projectId } = req.body;

    const sheets = await ConsumptionSheet.findAll({
      where: {
        project_id: projectId,
        is_approved_mic: {
          [Op.in]: ["pending", "approved"], // Correct usage of IN operator
        },
      },

      include: [
        {
          model: ConsumptionSheetItem,
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
            {
              model: Equipment,
              as: "equipmentData",
              attributes: ["id", "equipment_name"],
            },
          ],
        },
        {
          model: Employee,
          as: "createdByUser",
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

    return res.status(200).json(sheets);
  } catch (error) {
    console.error("Error fetching all consumption sheets:", error);
    return res.status(500).json({
      message: "Failed to fetch consumption sheets",
      error: error.message,
    });
  }
};

/**
 * Get pending Site Incharge-approved consumption sheets
 */
export const getPendingConsumptionSheets = async (req, res) => {
  try {
    const { projectId } = req.body;

    const sheets = await ConsumptionSheet.findAll({
      where: {
        project_id: projectId,
        is_approved_mic: {
          [Op.in]: ["pending", "approved"], // Correct usage of IN operator
        },
        is_approved_sic: "pending",
      },
      include: [
        {
          model: ConsumptionSheetItem,
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
            {
              model: Equipment,
              as: "equipmentData",
              attributes: ["id", "equipment_name"],
            },
          ],
        },
        {
          model: Employee,
          as: "createdByUser",
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

    return res.status(200).json(sheets);
  } catch (error) {
    console.error("Error fetching pending sheets:", error);
    return res.status(500).json({
      message: "Failed to fetch pending sheets",
      error: error.message,
    });
  }
};

/**
 * Get complete Site Incharge-approved consumption sheets
 */
export const getCompleteConsumptionSheets = async (req, res) => {
  try {
    const { projectId } = req.body;

    const sheets = await ConsumptionSheet.findAll({
      where: {
        project_id: projectId,
        is_approved_mic: {
          [Op.in]: ["pending", "approved"], // Correct usage of IN operator
        },
        is_approved_sic: "approved",
      },
      include: [
        {
          model: ConsumptionSheetItem,
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
            {
              model: Equipment,
              as: "equipmentData",
              attributes: ["id", "equipment_name"],
            },
          ],
        },
        {
          model: Employee,
          as: "createdByUser",
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

    return res.status(200).json(sheets);
  } catch (error) {
    console.error("Error fetching approved sheets:", error);
    return res.status(500).json({
      message: "Failed to fetch approved sheets",
      error: error.message,
    });
  }
};

/**
 * Update Site Incharge approval status for a consumption sheet
 */
export const updateConsumptionSheetSicApproval = async (req, res) => {
  try {
    const { sheetId, status, reject_reason } = req.body;

    const validStatuses = ["approved", "pending", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Must be 'approved', 'pending', or 'rejected'.",
      });
    }

    const sheet = await ConsumptionSheet.findByPk(sheetId);
    if (!sheet) {
      return res.status(404).json({ message: "Consumption sheet not found." });
    }

    sheet.is_approved_sic = status;

    if (status === "rejected") {
      if (!reject_reason || reject_reason.trim() === "") {
        return res
          .status(400)
          .json({
            message: "Rejection reason is required when status is 'rejected'.",
          });
      }
      sheet.reject_reason = reject_reason;
    } else {
      sheet.reject_reason = null;
    }

    await sheet.save();

    return res.status(200).json({
      message: "Site Incharge approval status updated successfully.",
      sheet,
    });
  } catch (error) {
    console.error("Error updating Site Incharge approval:", error);
    return res.status(500).json({
      message: "Failed to update Site Incharge approval status.",
      error: error.message,
    });
  }
};
