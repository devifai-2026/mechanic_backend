// File: routes/stockRoutes.js
import express from "express";
import {
  getStockEntriesByItem,
  createStockEntry,
  getStockEntryById,
  updateStockEntry,
  deleteStockEntry,
} from "../../../controllers/admin/stockEntry/stockEntryController.js";

import {
  getStockLocationsByItem,
  createStockLocationWithEntry,
  updateStockLocation,
  deleteStockLocation,
  getAllStockEntries,
} from "../../../controllers/admin/stockEntry/stockLocationController.js";

const router = express.Router();

// Stock Locations Routes
router.get("/items/:itemId/locations", getStockLocationsByItem);
router.post("/items/:itemId/locations", createStockLocationWithEntry);
router.put("/locations/:locationId", updateStockLocation);
router.delete("/locations/:locationId", deleteStockLocation);

// Stock Entries Routes
router.get("/items/:itemId/entries", getStockEntriesByItem);
router.post("/locations/:locationId/entries", createStockEntry);
router.get("/entries/:entryId", getStockEntryById);
router.put("/entries/:entryId", updateStockEntry);
router.delete("/entries/:entryId", deleteStockEntry);
router.get("/entries/all", getAllStockEntries);

export default router;