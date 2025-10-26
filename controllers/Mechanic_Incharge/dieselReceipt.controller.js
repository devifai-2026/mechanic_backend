import { models } from "../../models/index.js";
const {
  DieselReceipt,
  DieselReceiptItem,
  ConsumableItem,
  UOM,
  Employee,
  Organisations,
} = models;

export const getAllDieselReceipts = async (req, res) => {
  try {
    const { projectId } = req.body;

    const receipts = await DieselReceipt.findAll({
      where: {
        project_id: projectId,
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

    // Format date field
    const formattedReceipts = receipts.map((receipt) => {
      const receiptData = receipt.toJSON();
      if (receiptData.date) {
        receiptData.date = new Date(receiptData.date).toISOString().split("T")[0];
      }
      return receiptData;
    });

    return res.status(200).json(formattedReceipts);
  } catch (error) {
    console.error("Error retrieving diesel receipts:", error);
    return res.status(500).json({
      message: "Failed to retrieve receipts",
      error: error.message,
    });
  }
};


export const getPendingDieselReceipts = async (req, res) => {
  try {
    const { projectId } = req.body;

    const receipts = await DieselReceipt.findAll({
      where: {
        project_id: projectId,
        is_approve_mic: "pending",
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
    console.error("Error retrieving pending diesel receipts:", error);
    return res.status(500).json({
      message: "Failed to retrieve pending receipts",
      error: error.message,
    });
  }
};

export const getCompleteDieselReceipts = async (req, res) => {
  try {
    const { projectId } = req.body;

    const receipts = await DieselReceipt.findAll({
      where: {
        project_id: projectId,
        is_approve_mic: "approved",
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
    console.error("Error retrieving complete diesel receipts:", error);
    return res.status(500).json({
      message: "Failed to retrieve approved receipts",
      error: error.message,
    });
  }
};

export const updateDieselReceiptMicApproval = async (req, res) => {
  try {
    const { receiptId, status, reject_reason } = req.body;

    const allowedStatuses = ["approved", "pending", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid approval status. Must be 'approved', 'pending', or 'rejected'." });
    }

    const receipt = await DieselReceipt.findByPk(receiptId);

    if (!receipt) {
      return res.status(404).json({ message: "Diesel receipt not found." });
    }

    receipt.is_approve_mic = status;

    if (status === "rejected") {
      if (!reject_reason || reject_reason.trim() === "") {
        return res.status(400).json({ message: "Rejection reason is required when status is 'rejected'." });
      }
      receipt.reject_reason = reject_reason;
    } else {
      receipt.reject_reason = null; // clear previous reason if status is not rejected
    }

    await receipt.save();

    return res.status(200).json({
      message: "MIC approval status updated successfully.",
      receipt,
    });
  } catch (error) {
    console.error("Error updating MIC approval for diesel receipt:", error);
    return res.status(500).json({
      message: "Failed to update MIC approval status.",
      error: error.message,
    });
  }
};
