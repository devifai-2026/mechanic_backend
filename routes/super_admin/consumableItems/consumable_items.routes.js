import express from "express";
import {
  createConsumableItem,
  getAllConsumableItems,
  getConsumableItemById,
  updateConsumableItem,
  deleteConsumableItem,
  bulkUploadConsumableItems,
} from "../../../controllers/consumerableItems/consumable_items.controller.js";
import upload from "../../../middleware/bulkUpload.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  console.log(`🔍 Path: ${req.path}`);
  console.log(`📍 Base URL: ${req.baseUrl}`);
  next();
});

// FIX: Put specific routes BEFORE parameterized routes
router.post("/bulk-upload", upload.single("file"), bulkUploadConsumableItems);

// Then general routes
router.post("/", createConsumableItem);
router.get("/", getAllConsumableItems);

// Parameterized routes should come LAST
router.get("/:id", getConsumableItemById);
router.post("/:id", updateConsumableItem);  // Consider using PUT or PATCH for updates
router.delete("/:id", deleteConsumableItem);

export default router;