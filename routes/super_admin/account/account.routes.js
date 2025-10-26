import express from "express";
import {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  bulkUploadAccount,
} from "../../../controllers/account/account.controller.js";
import upload from "../../../middleware/bulkUpload.js";

const router = express.Router();

router.post("/", createAccount);
router.get("/", getAllAccounts);
router.get("/:id", getAccountById);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);
router.post("/upload/bulk-upload", upload.single("file"), bulkUploadAccount);

export default router;
