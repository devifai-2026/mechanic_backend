import express from "express";
import {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift,
  bulkUploadShifts,
} from "../../../controllers/shift/shift.controller.js"; // Adjust path
import upload from "../../../middleware/bulkUpload.js";

const router = express.Router();

router.post("/create", createShift);
router.get("/getAll", getAllShifts);
router.get("/get/:id", getShiftById);
router.post("/update/:id", updateShift);
router.delete("/delete/:id", deleteShift);
router.post("/bulk-upload", upload.single("file"), bulkUploadShifts);


export default router;
