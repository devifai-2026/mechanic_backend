import express from "express";

import {
  createMaintenanceSheet,
  getAllMaintenanceSheets,
  getMaintenanceSheetById,
  updateMaintenanceSheet,
  deleteMaintenanceSheet,
  getAllMaintenanceSheetByCreator,
} from "../../../controllers/Mechanic/maintenance_sheet/maintenance_sheet.controller.js";

const router = express.Router();

router.post("/", createMaintenanceSheet);
router.get("/", getAllMaintenanceSheets);
router.post("/admin", getAllMaintenanceSheets);
router.get("/:id", getMaintenanceSheetById);
router.put("/:id", updateMaintenanceSheet);
router.delete("/:id", deleteMaintenanceSheet);
router.post("/byCreator", getAllMaintenanceSheetByCreator);

export default router;
