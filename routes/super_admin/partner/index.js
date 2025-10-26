import express from "express";
import {
  bulkUploadPartners,
  createPartner,
  deletePartner,
  getPartnerById,
  getPartners,
  updatePartner,
} from "../../../controllers/partner/partner.controller.js"; // Adjust path as necessary
import upload from "../../../middleware/bulkUpload.js";

const router = express.Router();

// Routes
router.post("/create", createPartner);
router.get("/getall", getPartners);
router.get("/get/:id", getPartnerById);
router.patch("/update/:id", updatePartner);
router.delete("/delete/:id", deletePartner);
router.post("/bulk-upload", upload.single("file"), bulkUploadPartners);

export default router; // Ensure this is exported correctly
