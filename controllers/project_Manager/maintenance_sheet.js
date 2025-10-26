import { Op } from "sequelize";
import { models } from "../../models/index.js";

const {
    MaintenanceSheet,
    MaintenanceSheetItem,
    Equipment,
    Employee,
    Organisations,
    UOM,
    ConsumableItem
} = models;

// Get all maintenance sheets
export const getAllMaintenanceSheets = async (req, res) => {
    try {
        const { projectId } = req.body;

        const sheets = await MaintenanceSheet.findAll({
            where: {
                project_id: projectId,
                is_approved_mic: {
                    [Op.in]: ["pending", "approved"], // Correct usage of IN operator
                },
                is_approved_sic: {
                    [Op.in]: ["pending", "approved"], // Correct usage of IN operator
                },
            },
            include: [
                {
                    model: MaintenanceSheetItem,
                    as: "items",
                    include: [
                        {
                            model: ConsumableItem,
                            as: "itemData",
                            attributes: ["id", "item_name", "item_description"]
                        },
                        {
                            model: UOM,
                            as: "uomData",
                            attributes: ["id", "unit_name", "unit_code"]
                        }
                    ]
                },
                {
                    model: Equipment,
                    as: "equipmentData",
                    attributes: ["id", "equipment_name"]
                },
                {
                    model: Employee,
                    as: "createdByUser",
                    attributes: ["id", "emp_name"]
                },
                {
                    model: Organisations,
                    as: "organisation",
                    attributes: ["id", "org_name"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json(sheets);
    } catch (error) {
        console.error("Error fetching sheets:", error);
        res.status(500).json({ message: "Failed to fetch maintenance sheets", error: error.message });
    }
};

// Get pending maintenance sheets
export const getPendingMaintenanceSheets = async (req, res) => {
    try {
        const { projectId } = req.body;

        const sheets = await MaintenanceSheet.findAll({
            where: {
                project_id: projectId,
                is_approved_mic: {
                    [Op.in]: ["pending", "approved"], // Correct usage of IN operator
                },
                is_approved_sic: {
                    [Op.in]: ["pending", "approved"], // Correct usage of IN operator
                },
                is_approved_pm: "pending"
            },
            include: [
                {
                    model: MaintenanceSheetItem,
                    as: "items",
                    include: [
                        {
                            model: ConsumableItem,
                            as: "itemData"
                        },
                        {
                            model: UOM,
                            as: "uomData"
                        }
                    ]
                },
                {
                    model: Equipment,
                    as: "equipmentData"
                },
                {
                    model: Employee,
                    as: "createdByUser"
                },
                {
                    model: Organisations,
                    as: "organisation"
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json(sheets);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pending sheets", error: error.message });
    }
};

// Get approved maintenance sheets
export const getApprovedMaintenanceSheets = async (req, res) => {
    try {
        const { projectId } = req.body;

        const sheets = await MaintenanceSheet.findAll({
            where: {
                project_id: projectId,
                is_approved_mic: {
                    [Op.in]: ["pending", "approved"], // Correct usage of IN operator
                },
                is_approved_sic: {
                    [Op.in]: ["pending", "approved"], // Correct usage of IN operator
                },
                is_approved_pm: "approved"
            },
            include: [
                {
                    model: MaintenanceSheetItem,
                    as: "items",
                    include: [
                        {
                            model: ConsumableItem,
                            as: "itemData"
                        },
                        {
                            model: UOM,
                            as: "uomData"
                        }
                    ]
                },
                {
                    model: Equipment,
                    as: "equipmentData"
                },
                {
                    model: Employee,
                    as: "createdByUser"
                },
                {
                    model: Organisations,
                    as: "organisation"
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json(sheets);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch approved sheets", error: error.message });
    }
};

// Update Site Incharge approval
export const updateMaintenanceSheetSicApproval = async (req, res) => {
    try {
        const { sheetId, status, reject_reason } = req.body;
        const validStatus = ["approved", "pending", "rejected"];

        if (!validStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid approval status" });
        }

        const sheet = await MaintenanceSheet.findByPk(sheetId);
        if (!sheet) {
            return res.status(404).json({ message: "Maintenance sheet not found" });
        }

        sheet.is_approved_pm = status;

        if (status === "rejected") {
            if (!reject_reason || reject_reason.trim() === "") {
                return res.status(400).json({ message: "Rejection reason is required when status is 'rejected'." });
            }
            sheet.reject_reason = reject_reason;
        } else {
            sheet.reject_reason = null;
        }

        await sheet.save();

        res.status(200).json({ message: "Status updated", sheet });
    } catch (error) {
        res.status(500).json({ message: "Failed to update approval", error: error.message });
    }
};
