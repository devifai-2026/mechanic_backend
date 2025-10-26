import express from "express";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  bulkUploadEquipment,
} from "../../../controllers/equipment/equipment.controller.js";
import upload from "../../../middleware/bulkUpload.js";

const router = express.Router();

router.post("/create", createEquipment);
router.get("/getAll/", getAllEquipment);
router.get("/get/:id", getEquipmentById);
router.patch("/update/:id", updateEquipment);
router.delete("/delete/:id", deleteEquipment);
router.post("/bulk-upload", upload.single("file"), bulkUploadEquipment);
export default router;
