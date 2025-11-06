import express from "express";
import {
  createEquipmentGroup,
  getAllEquipmentGroups,
  getEquipmentGroupById,
  updateEquipmentGroup,
  deleteEquipmentGroup,
  bulkUploadEquipmentGroups,
} from "../../../controllers/equipmentGroup/equipmentGroup.controller.js";
import upload from "../../../middleware/bulkUpload.js";

const router = express.Router();

router.post("/create", createEquipmentGroup);
router.get("/getAll", getAllEquipmentGroups);
router.get("/get/:id", getEquipmentGroupById);
router.post("/update/:id", updateEquipmentGroup);
router.delete("/delete/:id", deleteEquipmentGroup);
router.post("/bulk-upload", upload.single("file"), bulkUploadEquipmentGroups);

export default router;
