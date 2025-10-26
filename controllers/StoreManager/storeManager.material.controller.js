import { models } from "../../models/index.js";

const {
  MaterialTransaction,
  MaterialTransactionForm,
  Partner,
  ConsumableItem,
  UOM,
} = models;
// CREATE
export const createMaterialTransaction = async (req, res) => {
  try {
    const {
      date,
      data_type,
      type,
      partner,
      challan_no,
      formItems,
      project_id,
      createdBy,
    } = req.body;

    console.log({
      date,
      data_type,
      type,
      partner,
      challan_no,
      formItems,
      project_id,
      createdBy,
    });
    const transaction = await MaterialTransaction.create({
      date,
      data_type,
      type,
      partner,
      challan_no,
      project_id,
      createdBy,
    });

    if (Array.isArray(formItems) && formItems.length > 0) {
      const formEntries = formItems.map((item) => ({
        ...item,
        material_transaction_id: transaction.id,
      }));
      await MaterialTransactionForm.bulkCreate(formEntries);
    }

    res
      .status(201)
      .json({ message: "Material Transaction created", transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// READ ALL
export const getAllMaterialTransactions = async (req, res) => {
  try {
    const { data_type, project_id, createdBy } = req.body;

    if (!["material_in", "material_out"].includes(data_type)) {
      return res.status(400).json({ error: "Invalid data_type" });
    }

    if (!project_id) {
      return res.status(400).json({ error: "project_id is required" });
    }

    // Build dynamic where clause it is Admin -- get all data with data_type and Project_id only
    const whereClause = {
      data_type,
      project_id,
      ...(createdBy && { createdBy }),
    };

    const transactions = await MaterialTransaction.findAll({
      where: whereClause,
      include: [
        { model: Partner, as: "partnerDetails" },
        {
          model: MaterialTransactionForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem", // From model alias
            },
            {
              model: UOM,
              as: "unitOfMeasure", // From model alias
            },
          ],
        },
      ],
    });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching material transactions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//Read all with no check
export const getAllMaterialTransactionsNoFilter = async (req, res) => {
  try {
    const transactions = await MaterialTransaction.findAll({
      include: [
        { model: Partner, as: "partnerDetails" },
        {
          model: MaterialTransactionForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem", // From model alias
            },
            {
              model: UOM,
              as: "unitOfMeasure", // From model alias
            },
          ],
        },
      ],
    });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching material transactions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// READ ONE
export const getMaterialTransactionById = async (req, res) => {
  try {
    const transaction = await MaterialTransaction.findByPk(req.params.id, {
      include: [
        { model: Partner, as: "partnerDetails" },
        {
          model: MaterialTransactionForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem", // From model alias
            },
            {
              model: UOM,
              as: "unitOfMeasure", // From model alias
            },
          ],
        },
      ],
    });

    if (!transaction) return res.status(404).json({ message: "Not found" });

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE
export const updateMaterialTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, data_type, type, partner, challan_no, formItems } = req.body;

    const transaction = await MaterialTransaction.findByPk(id);
    if (!transaction) return res.status(404).json({ message: "Not found" });

    await transaction.update({ date, data_type, type, partner, challan_no });

    if (Array.isArray(formItems)) {
      // Delete old items and add new
      await MaterialTransactionForm.destroy({
        where: { material_transaction_id: id },
      });
      const newFormItems = formItems.map((item) => ({
        ...item,
        material_transaction_id: id,
      }));
      await MaterialTransactionForm.bulkCreate(newFormItems);
    }

    res.status(200).json({ message: "Transaction updated", transaction });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE
export const deleteMaterialTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    await MaterialTransactionForm.destroy({
      where: { material_transaction_id: id },
    });
    const deleted = await MaterialTransaction.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE ALL
// DELETE ALL Material Transactions
export const deleteAllMaterialTransactions = async (req, res) => {
  try {
    // Delete all form items first
    await MaterialTransactionForm.destroy({ where: {} });

    // Then delete all material transactions
    await MaterialTransaction.destroy({ where: {} });

    res
      .status(200)
      .json({ message: "All material transactions and forms deleted." });
  } catch (error) {
    console.error("Error deleting all:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
