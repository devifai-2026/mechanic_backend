import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  bulkUploadRoles,
} from "../../../controllers/role/role.controller.js";
import upload from "../../../middleware/bulkUpload.js";

const router = express.Router();

router.post("/create", createRole);
router.get("/getall", getAllRoles);
router.get("/get/:id", getRoleById);
router.post("/update/:id", updateRole);
router.delete("/delete/:id", deleteRole);
router.post("/bulk-upload", upload.single("file"), bulkUploadRoles);


export default router;
