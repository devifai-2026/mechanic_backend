
import { models } from "../../models/index.js";


const { MaterialTransaction, Partner, Project_Master, MaterialTransactionForm , ConsumableItem, UOM} = models;

export const updateMaterialTransactionStatus = async (req, res) => {
  try {
    const { project_id, status, material_transaction_id } = req.body;

    if (!project_id || !status) {
      return res.status(400).json({
        message: "project_id and status are required",
      });
    }

    // Validate status
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const [updatedRowsCount] = await MaterialTransaction.update(
      { is_approve_pm: status },
      {
        where: {
          id: material_transaction_id,
          project_id: project_id,
        },
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        message: "No material transactions found for the given project_id",
      });
    }

    return res.status(200).json({
      message: `Successfully updated ${updatedRowsCount} transaction(s)`,
    });
  } catch (error) {
    console.error("Error updating material transaction status:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};





export const getMaterialTransactionsByStatus = async (req, res) => {
  try {
    const { status, project_id } = req.body;

    const validStatuses = ["pending", "approved", "rejected", "all"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid or missing status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Build dynamic WHERE clause
    const whereCondition = {};

    if (status !== "all") {
      whereCondition.is_approve_pm = status;
    }

    if (project_id) {
      whereCondition.project_id = project_id;
    }

    const transactions = await MaterialTransaction.findAll({
      where: whereCondition,
      include: [
        { model: Partner, as: "partnerDetails" },
        { model: Project_Master, as: "project" },
        {
          model: MaterialTransactionForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              
            },
            {
              model: UOM,
              as: "unitOfMeasure"
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: `Fetched ${status} transactions successfully`,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};