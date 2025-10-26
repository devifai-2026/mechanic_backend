import { models } from "../../models/index.js";
const {
  EquipmentTransaction,
  EquipmentTransactionsForm,
  ConsumableItem,
  UOM,
  Partner,
  Project_Master,
} = models;

export const updateEquipmentTransactionStatus = async (req, res) => {
  try {
    const { project_id, equipment_transaction_id, status } = req.body;

    if (!project_id || !equipment_transaction_id || !status) {
      return res.status(400).json({
        message:
          "project_id, equipment_transaction_id, and status are required",
      });
    }

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const [updatedRowsCount] = await EquipmentTransaction.update(
      { is_approve_pm: status },
      {
        where: {
          id: equipment_transaction_id,
          project_id: project_id,
        },
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        message:
          "No matching equipment transaction found with given ID and project",
      });
    }

    return res.status(200).json({
      message: "Equipment transaction status updated successfully",
    });
  } catch (error) {
    console.error("Error updating equipment transaction status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getEquipmentTransactionsByStatus = async (req, res) => {
  try {
    const { status, project_id, data_type } = req.body;
    console.log({ status, project_id, data_type });
    const validStatuses = ["pending", "approved", "rejected", "all"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid or missing status. Must be one of: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    const whereCondition = {};
    if (status !== "all") {
      whereCondition.is_approve_pm = status;
    }
    if (project_id) {
      whereCondition.project_id = project_id;
    }
    if (data_type) {
      whereCondition.data_type = data_type;
    }

    const transactions = await EquipmentTransaction.findAll({
      where: whereCondition,
      include: [
        { model: Partner, as: "partnerDetails", required: false },
        { model: Project_Master, as: "project" },
        {
          model: EquipmentTransactionsForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
            },
            {
              model: UOM,
              as: "unitOfMeasure",
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: `Fetched ${status} equipment transactions successfully`,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching equipment transactions:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
