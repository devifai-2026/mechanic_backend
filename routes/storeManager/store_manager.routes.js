import express from "express";
import {
  createMaterialTransaction,
  deleteAllMaterialTransactions,
  deleteMaterialTransaction,
  getAllMaterialTransactions,
  getAllMaterialTransactionsNoFilter,
  getMaterialTransactionById,
  updateMaterialTransaction,
} from "../../controllers/StoreManager/storeManager.material.controller.js";
import {
  createEquipmentTransaction,
  deleteEquipmentTransaction,
  getAllEquipmentTransactions,
  getAllEquipmentTransactionsNoFilter,
  getEquipmentTransactionById,
  updateEquipmentTransaction,
} from "../../controllers/StoreManager/storeManager.equipment.controller.js";

const router = express.Router();

// Create a new Material Transaction
router.post("/", createMaterialTransaction);

// Get all Material Transactions
router.post("/get/transactions", getAllMaterialTransactions);
router.get("/get/transactions", getAllMaterialTransactionsNoFilter);

// Get a single Material Transaction by ID
router.get("/:id", getMaterialTransactionById);

// Update a Material Transaction by ID
router.put("/:id", updateMaterialTransaction);

// Delete a Material Transaction by ID
router.delete("/:id", deleteMaterialTransaction);
router.delete("/material-transaction", deleteAllMaterialTransactions);

router.post("/equipment", createEquipmentTransaction);
router.post("/get/equipment", getAllEquipmentTransactions);
router.get("/get/equipment", getAllEquipmentTransactionsNoFilter); // admin
router.post("/get/equipment/admin", getAllEquipmentTransactionsNoFilter);
router.get("/equipment/:id", getEquipmentTransactionById); // admin
router.put("/equipment/:id", updateEquipmentTransaction);
router.delete("/equipment/:id", deleteEquipmentTransaction);

export default router;
