import { where } from "sequelize";
import { models } from "../../models/index.js";
import { Op } from "sequelize";
const {
  MaterialBillTransaction,
  MaterialBillTransactionForm,
  ExpenseInput,
  RevenueInput,
  Employee,
  Project_Master,
  MaterialTransaction,
  ConsumableItem,
  UOM,
  DieselInvoice,
  DieselInvoiceSubform,
  MaterialTransactionForm,
  DieselReceipt,
  DieselReceiptItem,
  Organisations,
  Partner,
} = models;

// ✅ Create Material Bill
export const createMaterialBill = async (req, res) => {
  try {
    const {
      project_id,
      date,
      createdBy,
      partner,
      partner_inv_no,
      inv_basic_value,
      inv_tax,
      total_invoice_value,
      materialTransactionId,
      forms,
      isInvoiced,
      unit_price,
      totalValue,
    } = req.body;

    const existingBill = await MaterialBillTransaction.findOne({
      where: { materialTransactionId },
    });

    if (existingBill) {
      return res.status(500).json({
        message: "A bill already exists for this materialTransactionId.",
        existingBill,
      });
    }
    // Step 1: Create Material Bill
    const bill = await MaterialBillTransaction.create({
      project_id,
      date,
      createdBy,
      partner,
      partner_inv_no,
      inv_basic_value,
      inv_tax,
      total_invoice_value,
      materialTransactionId,
    });

    // Step 2: Create Subform Items
    if (Array.isArray(forms) && forms.length > 0) {
      const formData = forms.map((item) => ({
        material_transaction_id: bill.id,
        item: item.item,
        qty: item.qty,
        uom: item.uom,
        unit_price: item.unit_price || unit_price,
        totalValue: item.totalValue || totalValue,
        notes: item.notes || null,
      }));

      await MaterialBillTransactionForm.bulkCreate(formData);
    }

    // Step 3: Update MaterialTransaction is_invoiced to "invoiced"
    if (materialTransactionId) {
      const [affectedRows] = await MaterialTransaction.update(
        { is_invoiced: isInvoiced },
        { where: { id: materialTransactionId } }
      );

      if (affectedRows === 0) {
        console.warn(
          "MaterialTransaction ID not found or already invoiced:",
          materialTransactionId
        );
      }
    }

    return res
      .status(201)
      .json({ message: "Material bill created successfully", bill });
  } catch (error) {
    console.error("❌ Create Material Bill Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getAllMaterialBills = async (req, res) => {
  try {
    const bills = await MaterialBillTransaction.findAll({
      include: [
        {
          model: models.Project_Master,
          as: "project",
          attributes: ["id", "project_no"],
        },
        {
          model: models.Partner,
          as: "partnerDetails",
          attributes: ["id", "partner_name", "partner_address"],
        },
        {
          model: models.Employee,
          as: "createdByUser",
          attributes: ["id", "emp_id", "emp_name"],
        },
        {
          model: models.MaterialTransaction,
          as: "material",
          attributes: ["id", "challan_no", "type", "data_type", "date"],
        },
        {
          model: models.MaterialBillTransactionForm,
          as: "formItems",
          include: [
            {
              model: models.ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_code"],
            },
            {
              model: models.UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Get All Bills Error:", error);
    return res.status(500).json({ message: "Failed to fetch material bills" });
  }
};

export const getBillsByProjectAndUser = async (req, res) => {
  try {
    const { project_id, createdBy } = req.body;

    const bills = await MaterialBillTransaction.findAll({
      where: { project_id, createdBy },
      include: [
        {
          model: models.MaterialBillTransactionForm,
          as: "formItems",
          include: [
            {
              model: models.ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name"],
            },
            {
              model: models.UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name"],
            },
          ],
        },
        {
          model: models.MaterialTransaction,
          as: "material",
          attributes: ["id", "challan_no", "type"],
        },
      ],
    });

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Filter Bills Error:", error);
    return res.status(500).json({ message: "Failed to filter material bills" });
  }
};

export const getBillsByProject = async (req, res) => {
  try {
    const { project_id } = req.body;

    const bills = await MaterialBillTransaction.findAll({
      where: { project_id },
      include: [
        {
          model: MaterialBillTransactionForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_code", "product_type"],
            },
            {
              model: UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name"],
            },
          ],
        },
      ],
    });

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Filter Bills Error:", error);
    return res.status(500).json({ message: "Failed to filter material bills" });
  }
};

export const getMaterialInByProject = async (req, res) => {
  try {
    const { project_id } = req.body;

    const bills = await MaterialTransaction.findAll({
      where: { project_id, is_approve_pm: "approved", is_invoiced: "draft" },
      include: [
        {
          model: MaterialTransactionForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name"],
            },
            {
              model: UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name"],
            },
          ],
        },
        {
          model: models.Partner,
          as: "partnerDetails",
          attributes: ["id", "partner_name", "partner_address"],
        },
      ],
    });

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Filter Bills Error:", error);
    return res.status(500).json({ message: "Failed to filter material bills" });
  }
};

export const getCombinedBillsAndMaterialsByProject = async (req, res) => {
  try {
    const { project_id } = req.body;

    // Get all MaterialBillTransaction data
    const bills = await MaterialBillTransaction.findAll({
      where: { project_id },
      include: [
        {
          model: MaterialBillTransactionForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_code", "product_type"],
            },
            {
              model: UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name"],
            },
          ],
        },
      ],
    });

    // Extract all material_transaction_ids from bills to exclude them from MaterialTransaction
    const excludedTransactionIds = [
      ...new Set(
        bills
          .map((bill) => bill.materialTransactionId)
          .filter((id) => id !== null && id !== undefined)
      ),
    ];

    // Get MaterialTransaction data excluding those already referenced in bills
    const whereCondition = {
      project_id,
      is_approve_pm: "approved",
      [Op.or]: [{ is_invoiced: "draft" }, { is_invoiced: "invoiced" }],
    };

    // Only add the exclusion condition if there are IDs to exclude
    if (excludedTransactionIds.length > 0) {
      whereCondition.id = {
        [Op.notIn]: excludedTransactionIds,
      };
    }

    const materialTransactions = await MaterialTransaction.findAll({
      where: whereCondition,
      include: [
        {
          model: MaterialTransactionForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name"],
            },
            {
              model: UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name"],
            },
          ],
        },
        {
          model: models.Partner,
          as: "partnerDetails",
          attributes: ["id", "partner_name", "partner_address"],
        },
      ],
    });

    // Combine the results
    const combinedData = {
      bills: bills,
      materialTransactions: materialTransactions,
      summary: {
        totalBills: bills.length,
        totalMaterialTransactions: materialTransactions.length,
        excludedTransactionIds: excludedTransactionIds,
      },
    };

    return res.status(200).json(combinedData);
  } catch (error) {
    console.error("Combined Bills and Materials Error:", error);
    return res.status(500).json({
      message: "Failed to fetch combined bills and material transactions",
    });
  }
};

export const updateMaterialBill = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      project_id,
      date,
      createdBy,
      partner,
      partner_inv_no,
      inv_basic_value,
      inv_tax,
      total_invoice_value,
      materialTransactionId,
      forms,
    } = req.body;

    const bill = await MaterialBillTransaction.findByPk(id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    await bill.update({
      project_id,
      date,
      createdBy,
      partner,
      partner_inv_no,
      inv_basic_value,
      inv_tax,
      total_invoice_value,
      materialTransactionId,
    });

    if (Array.isArray(forms)) {
      await MaterialBillTransactionForm.destroy({
        where: { material_transaction_id: id },
      });

      const formData = forms.map((item) => ({
        material_transaction_id: id,
        item: item.item,
        qty: item.qty,
        uom: item.uom,
        notes: item.notes || null,
      }));

      await MaterialBillTransactionForm.bulkCreate(formData);
    }

    return res.status(200).json({ message: "Bill updated successfully" });
  } catch (error) {
    console.error("Update Bill Error:", error);
    return res.status(500).json({ message: "Failed to update bill" });
  }
};

export const deleteMaterialBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await MaterialBillTransaction.findByPk(id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    await MaterialBillTransactionForm.destroy({
      where: { material_transaction_id: id },
    });

    await bill.destroy();

    return res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Delete Bill Error:", error);
    return res.status(500).json({ message: "Failed to delete bill" });
  }
};

// ExpenseInput

export const createDailyExpense = async (req, res) => {
  try {
    const {
      project_id,
      date,
      paid_to,
      paid_by,
      expense_code,
      expense_name,
      amount,
      allocation,
      notes,
      createdBy,
    } = req.body;

    const expense = await ExpenseInput.create({
      project_id,
      date,
      paid_to,
      paid_by,
      expense_code,
      expense_name,
      amount,
      allocation,
      notes,
      createdBy,
    });

    res.status(201).json({ message: "Expense created successfully", expense });
  } catch (error) {
    console.error("Create Expense Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getAllDailyExpenses = async (req, res) => {
  try {
    const expenses = await DailyExpense.findAll({
      include: [
        {
          model: Employee,
          as: "creator",
          attributes: ["id", "emp_name", "emp_id"],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Fetch All Expenses Error:", error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

export const getExpensesByCreator = async (req, res) => {
  try {
    const { createdBy, project_id } = req.body;

    // Always filter by project_id
    const where = { project_id };

    // Conditionally filter by createdBy only if it's provided
    if (createdBy) {
      where.createdBy = createdBy;
    }

    const expenses = await ExpenseInput.findAll({
      where,
      include: [
        {
          model: Employee,
          as: "creator",
        },
        {
          model: Project_Master,
          as: "project",
        },
      ],
      order: [["date", "DESC"]],
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Filter Expenses Error:", error);
    res.status(500).json({ message: "Failed to filter expenses" });
  }
};


export const deleteDailyExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await DailyExpense.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

// revenue input
export const createRevenueInput = async (req, res) => {
  try {
    const {
      project_id,
      createdBy,
      date,
      ho_invoice,
      account_code,
      account_name,
      amount_basic,
      tax_value,
      total_amount,
    } = req.body;

    const invoice = await RevenueInput.create({
      project_id,
      createdBy,
      date,
      ho_invoice,
      account_code,
      account_name,
      amount_basic,
      tax_value,
      total_amount,
    });

    res.status(201).json({ message: "Invoice created successfully", invoice });
  } catch (error) {
    console.error("Create HO Invoice Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getAllRevenueInputInvoices = async (req, res) => {
  try {
    const invoices = await RevenueInput.findAll({
      include: [
        {
          model: Employee,
          as: "creator",
          attributes: ["id", "emp_name", "emp_id"],
        },
        {
          model: Project_Master,
          as: "project",
          attributes: ["id", "project_no"],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Get All HO Invoices Error:", error);
    res.status(500).json({ message: "Failed to fetch HO invoices" });
  }
};

export const getRevenueInputInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await RevenueInput.findByPk(id, {
      include: [
        {
          model: Employee,
          as: "creator",
          attributes: ["id", "emp_name", "emp_id"],
        },
        {
          model: Project_Master,
          as: "project",
          attributes: ["id", "project_no"],
        },
      ],
    });

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    return res.status(200).json(invoice);
  } catch (error) {
    console.error("Get HO Invoice By ID Error:", error);
    res.status(500).json({ message: "Failed to fetch HO invoice" });
  }
};

export const getHOInvoicesByProjectAndUser = async (req, res) => {
  try {
    const { project_id, createdBy } = req.body;

    // Build dynamic where clause
    const whereClause = {
      project_id,
      ...(createdBy && { createdBy }), // only include createdBy if it's provided
    };

    const invoices = await RevenueInput.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: "creator",
        },
        {
          model: Project_Master,
          as: "project",
        },
      ],
      order: [["date", "DESC"]],
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Filter HO Invoices Error:", error);
    res.status(500).json({ message: "Failed to filter HO invoices" });
  }
};


// ----------------------- After 2nd feedback --------------------------

export const getDraft = async (req, res) => {
  const { project_id } = req.body;

  try {
    const data = await MaterialTransaction.findAll({
      where: {
        is_approve_pm: "approved",
        is_invoiced: "draft",
        project_id,
      },
      include: [
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
              as: "unitOfMeasure",
            },
          ],
        },
      ],
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch approved & draft transactions",
      error: err.message,
    });
  }
};

export const getInvoiced = async (req, res) => {
  const { project_id } = req.body;

  try {
    const data = await MaterialTransaction.findAll({
      where: {
        is_approve_pm: "approved",
        is_invoiced: "invoiced",
        project_id,
      },
      include: [
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
              as: "unitOfMeasure",
            },
          ],
        },
      ],
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch approved & invoiced transactions",
      error: err.message,
    });
  }
};

export const getRejected = async (req, res) => {
  const { project_id } = req.body;

  try {
    const data = await MaterialTransaction.findAll({
      where: {
        is_approve_pm: "approved",
        is_invoiced: "rejected",
        project_id,
      },
      include: [
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
              as: "unitOfMeasure",
            },
          ],
        },
      ],
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch approved & rejected transactions",
      error: err.message,
    });
  }
};

// ----------------------diesel invoices --------------------------

export const getSubmittedDieselInvoices = async (req, res) => {
  const { project_id } = req.body;

  try {
    const receipts = await DieselReceipt.findAll({
      where: {
        project_id,
        is_approve_pm: "approved",
        is_approve_mic: "approved",
        is_approve_sic: "approved",
      },
      include: [
        {
          model: DieselReceiptItem,
          as: "items",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
            },
            {
              model: UOM,
              as: "unitOfMeasurement",
            },
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
    console.error("Error fetching submitted diesel invoices:", error);
    return res.status(500).json({ message: "Failed to retrieve data", error });
  }
};

export const createDieselInvoice = async (req, res) => {
  try {
    const { project_id, dieselInvoiceId, date, formItems, is_invoiced } =
      req.body;

    const invoice = await DieselInvoice.create({
      project_id,
      dieselReceiptId: dieselInvoiceId,
      date,
      is_invoiced,
    });

    if (Array.isArray(formItems)) {
      const mapped = formItems.map((item) => ({
        diesel_invoice_id: invoice.id,
        item: item.item,
        qty: item.qty,
        uom: item.uom,
        unit_rate: item.unit_rate,
        total_value: item.qty * item.unit_rate,
        notes: item.notes || null,
      }));
      await DieselInvoiceSubform.bulkCreate(mapped);
    }

    res.status(201).json({ message: "Invoice created", invoice });
  } catch (error) {
    console.error("Create Invoice Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ GET BY STATUS (draft, invoiced, rejected)
export const getInvoicesByStatus = async (req, res) => {
  const { status } = req.params; // draft | invoiced | rejected
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  console.log({ status });
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  try {
    const invoices = await DieselInvoice.findAll({
      where: { is_invoiced: status },
      include: [
        {
          model: DieselInvoiceSubform,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name"],
            },
            {
              model: UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
};

export const getInvoicesByProjectId = async (req, res) => {
  const { project_id } = req.body; // draft | invoiced | rejected
  try {
    const invoices = await DieselInvoice.findAll({
      where: { project_id },
      include: [
        {
          model: DieselInvoiceSubform,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name"],
            },
            {
              model: UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
};

export const getCombinedDieselReceiptsAndInvoices = async (req, res) => {
  try {
    const { project_id } = req.body;

    // ✅ Step 1: Fetch Diesel Invoices
    const invoices = await DieselInvoice.findAll({
      where: {
        project_id,
      },
      include: [
        {
          model: DieselInvoiceSubform,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name"],
            },
            {
              model: UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // ✅ Step 2: Extract IDs of already invoiced Diesel Receipts
    const invoicedReceiptIds = invoices
      .map((invoice) => invoice.dieselReceiptId)
      .filter((id) => id !== null); // Skip nulls

    // ✅ Step 3: Build dynamic `where` clause for receipts
    const receiptWhereClause = {
      project_id,
      is_approve_pm: "approved",
      is_approve_mic: "approved",
      is_approve_sic: "approved",
      ...(invoicedReceiptIds.length > 0 && {
        id: { [Op.notIn]: invoicedReceiptIds },
      }),
    };

    // ✅ Step 4: Fetch eligible Diesel Receipts
    const receipts = await DieselReceipt.findAll({
      where: receiptWhereClause,
      include: [
        {
          model: DieselReceiptItem,
          as: "items",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name"],
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
        },
        {
          model: Organisations,
          as: "organisation",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // ✅ Step 5: Combine data and respond
    const combinedData = {
      dieselReceipts: receipts,
      dieselInvoices: invoices,
      summary: {
        totalReceipts: receipts.length,
        totalInvoices: invoices.length,
      },
    };

    return res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching combined diesel data:", error);
    return res.status(500).json({
      message: "Failed to retrieve diesel receipts and invoices",
      error: error.message || error,
    });
  }
};

// ✅ UPDATE
export const updateDieselInvoice = async (req, res) => {
  const { id } = req.params;
  const { project_id, dieselInvoiceId, date, is_invoiced, formItems } =
    req.body;

  try {
    const invoice = await DieselInvoice.findByPk(id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    await invoice.update({ project_id, dieselInvoiceId, date, is_invoiced });

    await DieselInvoiceSubform.destroy({ where: { diesel_invoice_id: id } });

    const updatedItems = formItems.map((item) => ({
      diesel_invoice_id: id,
      item: item.item,
      qty: item.qty,
      uom: item.uom,
      unit_rate: item.unit_rate,
      total_value: item.qty * item.unit_rate,
      notes: item.notes || null,
    }));

    await DieselInvoiceSubform.bulkCreate(updatedItems);

    res.status(200).json({ message: "Invoice updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// ✅ DELETE
export const deleteDieselInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await DieselInvoice.findByPk(id);
    if (!invoice) return res.status(404).json({ message: "Not found" });

    await DieselInvoiceSubform.destroy({ where: { diesel_invoice_id: id } });
    await invoice.destroy();

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
};

// =============================================================================================================================

// Get All Bills
export const getAllBills = async (req, res) => {
  try {
    const bills = await MaterialBillTransaction.findAll({
      include: [
        {
          model: Project_Master,
          as: "project",
          attributes: [
            "id",
            "project_no",
            "contract_start_date",
            "contract_end_date",
          ],
        },
        {
          model: Partner,
          as: "partnerDetails",
          attributes: ["id", "partner_name", "partner_address"],
        },
        {
          model: Employee,
          as: "createdByUser",
          attributes: ["id", "emp_id", "emp_name"],
        },
        {
          model: MaterialTransaction,
          as: "material",
          attributes: ["id", "challan_no", "type", "data_type", "date"],
        },
        {
          model: MaterialBillTransactionForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_code"],
            },
            {
              model: UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Get All Bills Error:", error);
    return res.status(500).json({ message: "Failed to fetch material bills" });
  }
};

// Get All Expenses
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await ExpenseInput.findAll({
      include: [
        {
          model: Employee,
          as: "creator",
          attributes: ["id", "emp_name", "emp_id"],
        },
        {
          model: Project_Master,
          as: "project",
          attributes: [
            "id",
            "project_no",
            "contract_start_date",
            "contract_end_date",
          ],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Fetch All Expenses Error:", error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

// Get All Revenue Input Invoices
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await DieselInvoice.findAll({
      include: [
        {
          model: DieselInvoiceSubform,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_code"],
            },
            {
              model: UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
        {
          model: Project_Master,
          as: "project",
          attributes: ["id", "project_no"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Get All Invoices Error:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

// Get Bill Details by ID
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await MaterialBillTransaction.findByPk(id, {
      include: [
        {
          model: Project_Master,
          as: "project",
          attributes: ["id", "project_no"],
        },
        {
          model: Partner,
          as: "partnerDetails",
          attributes: ["id", "partner_name", "partner_address"],
        },
        {
          model: Employee,
          as: "createdByUser",
          attributes: ["id", "emp_id", "emp_name"],
        },
        {
          model: MaterialTransaction,
          as: "material",
          attributes: ["id", "challan_no", "type", "data_type", "date"],
        },
        {
          model: MaterialBillTransactionForm,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_code"],
            },
            {
              model: UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
      ],
    });

    if (!bill) return res.status(404).json({ message: "Bill not found" });
    return res.status(200).json(bill);
  } catch (error) {
    console.error("Get Bill By ID Error:", error);
    return res.status(500).json({ message: "Failed to fetch bill details" });
  }
};

// Get Expense Details by ID
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await ExpenseInput.findByPk(id, {
      include: [
        {
          model: Employee,
          as: "creator",
          attributes: ["id", "emp_name", "emp_id"],
        },
        {
          model: Project_Master,
          as: "project",
          attributes: ["id", "project_no"],
        },
      ],
    });

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    return res.status(200).json(expense);
  } catch (error) {
    console.error("Get Expense By ID Error:", error);
    res.status(500).json({ message: "Failed to fetch expense details" });
  }
};

// Get Invoice Details by ID
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await DieselInvoice.findByPk(id, {
      include: [
        {
          model: DieselInvoiceSubform,
          as: "formItems",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_code"],
            },
            {
              model: UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
        {
          model: Project_Master,
          as: "project",
          attributes: ["id", "project_no"],
        },
      ],
    });

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    return res.status(200).json(invoice);
  } catch (error) {
    console.error("Get Invoice By ID Error:", error);
    res.status(500).json({ message: "Failed to fetch invoice details" });
  }
};
