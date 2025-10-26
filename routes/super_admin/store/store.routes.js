import express from "express";
import {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  bulkUploadStores,
} from "../../../controllers/store/store.controller.js"; // Adjust path if needed
import upload from "../../../middleware/bulkUpload.js";

const router = express.Router();

// POST /store/create
router.post("/create", createStore);

// GET /store/getAll
router.get("/getAll", getStores);

// GET /store/get/:id
router.get("/get/:id", getStoreById);

// PUT /store/update/:id
router.patch("/update/:id", updateStore);

// DELETE /store/delete/:id
router.delete("/delete/:id", deleteStore);
router.post("/bulk-upload", upload.single("file"), bulkUploadStores);
export default router;
