import { models } from "../../models/index.js";

const {
  EquipmentTransaction,
  Partner,
  EquipmentTransactionsForm,
  Project_Master,
  ConsumableItem,
  UOM,
} = models;

// CREATE
export const createEquipmentTransaction = async (req, res) => {
  try {
    const { project_id, date, data_type, type, partner, formItems, createdBy } =
      req.body;

    const transaction = await EquipmentTransaction.create({
      project_id,
      date,
      data_type,
      type,
      partner,
      createdBy,
    });

    if (Array.isArray(formItems) && formItems.length > 0) {
      const formData = formItems.map((item) => {
        if (!item.equipment) {
          throw new Error("Missing 'equipment' in one or more formItems.");
        }

        return {
          equipment_transaction_id: transaction.id,
          equipment: item.equipment,
          qty: item.qty,
          uom: item.uom,
          notes: item.notes || null,
        };
      });

      await EquipmentTransactionsForm.bulkCreate(formData);
    }

    res
      .status(201)
      .json({ message: "Equipment transaction created", transaction });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// READ ALL
export const getAllEquipmentTransactions = async (req, res) => {
  try {
    const { data_type, project_id, createdBy } = req.body;

    if (!["equipment_in", "equipment_out"].includes(data_type)) {
      return res.status(400).json({ error: "Invalid or missing data_type" });
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

    const transactions = await EquipmentTransaction.findAll({
      where: whereClause,
      include: [
        { model: Partner, as: "partnerDetails" },
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
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllEquipmentTransactionsNoFilter = async (req, res) => {
  try {
    const transactions = await EquipmentTransaction.findAll({
      include: [
        { model: Partner, as: "partnerDetails" },
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
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// READ ONE
export const getEquipmentTransactionById = async (req, res) => {
  try {
    const transaction = await EquipmentTransaction.findByPk(req.params.id, {
      include: [
        { model: Partner, as: "partnerDetails" },
        { model: Project_Master, as: "project" },
        {
          model: EquipmentTransactionsForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem", // alias from association
            },
            {
              model: UOM,
              as: "unitOfMeasure", // alias from association
            },
          ],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching equipment transaction by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE
export const updateEquipmentTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { project_id, date, data_type, type, partner, formItems } = req.body;

    const transaction = await EquipmentTransaction.findByPk(id);
    if (!transaction) return res.status(404).json({ message: "Not found" });

    await transaction.update({ project_id, date, data_type, type, partner });

    // Replace old formItems
    if (Array.isArray(formItems)) {
      await EquipmentTransactionsForm.destroy({
        where: { equipment_transaction_id: id },
      });

      const newFormItems = formItems.map((item) => ({
        ...item,
        equipment_transaction_id: id,
      }));
      await EquipmentTransactionsForm.bulkCreate(newFormItems);
    }

    res.status(200).json({ message: "Transaction updated", transaction });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE
export const deleteEquipmentTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    await EquipmentTransactionsForm.destroy({
      where: { equipment_transaction_id: id },
    });

    const deleted = await EquipmentTransaction.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
