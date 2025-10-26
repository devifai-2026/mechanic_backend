import express from "express";
import {
  createRevenue,
  getAllRevenues,
  getRevenueById,
  updateRevenue,
  deleteRevenue,
  bulkUploadRevenues,
} from "../../../controllers/revenue/revenue_master.controller.js";
import upload from "../../../middleware/bulkUpload.js";

const router = express.Router();

router.post("/create", createRevenue);
router.get("/getAll", getAllRevenues);
router.get("/get/:id", getRevenueById);
router.patch("/update/:id", updateRevenue);
router.delete("/delete/:id", deleteRevenue);
router.post("/bulk-upload", upload.single("file"), bulkUploadRevenues);

export default router;
