import express from "express";

import {
  createDailyExpense,
  createDieselInvoice,
  createMaterialBill,
  createRevenueInput,
  deleteDieselInvoice,
  getAllBills,
  getAllExpenses,
  getAllInvoices,
  getAllRevenueInputInvoices,
  getBillById,
  getBillsByProject,
  getBillsByProjectAndUser,
  getCombinedBillsAndMaterialsByProject,
  getCombinedDieselReceiptsAndInvoices,
  getDraft,
  getExpenseById,
  getExpensesByCreator,
  getHOInvoicesByProjectAndUser,
  getInvoiceById,
  getInvoiced,
  getInvoicesByProjectId,
  getInvoicesByStatus,
  getMaterialInByProject,
  getRejected,
  getRevenueInputInvoiceById,
  getSubmittedDieselInvoices,
  updateDieselInvoice,
} from "../../controllers/account_manager/material_bill.controller.js";

const router = express.Router();

router.get("/all-bills", getAllBills); // GET all bills
router.get("/all-expenses", getAllExpenses); // GET all expenses
router.get("/all-invoices", getAllInvoices); // GET all invoices
router.get("/all/revenue-invoice", getAllRevenueInputInvoices); //admin


router.get("/bill/:id", getBillById);
router.get("/expense/:id", getExpenseById);
router.get("/invoice/:id", getInvoiceById);
router.get("/revenue-invoice/:id", getRevenueInputInvoiceById);

router.post("/create/material/bill", createMaterialBill);
router.post("/get/material/bill/creator", getBillsByProjectAndUser);
router.post("/get/material/bill/by/project", getBillsByProject); //admin
router.post("/get/material/in/by/project", getCombinedBillsAndMaterialsByProject); //admin
router.post("/create/expense/input", createDailyExpense);
router.post("/get/expense/input/creator", getExpensesByCreator); //admin
router.post("/create/revenue/input", createRevenueInput);
router.post("/get/revenue/input", getAllRevenueInputInvoices);
router.post("/get/revenue/input/creator", getHOInvoicesByProjectAndUser);
router.post("/diesel-invoice", createDieselInvoice);
router.post("/diesel-invoice/submitted", getSubmittedDieselInvoices);
// router.post("/diesel-invoice/all", getInvoicesByProjectId); //admin
router.post("/diesel-invoice/all", getCombinedDieselReceiptsAndInvoices); //admin
router.get("/diesel-invoice/status/:status", getInvoicesByStatus);
router.put("/diesel-invoice/:id", updateDieselInvoice);
router.delete("/diesel-invoice/:id", deleteDieselInvoice);
router.delete("/material-bill/draft", getDraft);
router.delete("/material-bill/invoiced", getInvoiced);
router.delete("/material-bill/rejected", getRejected);

export default router;
