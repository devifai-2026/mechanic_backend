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

router.post("/", createConsumableItem);
router.get("/", getAllConsumableItems);
router.get("/:id", getConsumableItemById);
router.post("/:id", updateConsumableItem);
router.delete("/:id", deleteConsumableItem);
router.post("/bulk-upload", upload.single("file"), bulkUploadConsumableItems);

export default router;
