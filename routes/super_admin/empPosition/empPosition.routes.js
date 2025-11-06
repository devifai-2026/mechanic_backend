import express from "express";
import {
  createEmpPosition,
  getAllEmpPositions,
  getEmpPositionById,
  updateEmpPosition,
  deleteEmpPosition,
} from "../../../controllers/empPosition/empPosition.controller.js"; // Adjust path

const router = express.Router();

router.post("/create", createEmpPosition);
router.get("/getall", getAllEmpPositions);
router.get("/get/:id", getEmpPositionById);
router.post("/update/:id", updateEmpPosition);
router.delete("/delete/:id", deleteEmpPosition);

export default router;
