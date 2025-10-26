import express from "express";
import { bulkUploadItemGroup, createItemGroup } from "../../../controllers/itemGroup/item_group.controller.js";
import { getAllItemGroups } from "../../../controllers/itemGroup/item_group.controller.js";
import { getItemGroupById } from "../../../controllers/itemGroup/item_group.controller.js";
import { updateItemGroup } from "../../../controllers/itemGroup/item_group.controller.js";
import { deleteItemGroup } from "../../../controllers/itemGroup/item_group.controller.js";
import upload from "../../../middleware/bulkUpload.js";

const router = express.Router();

router.post("/", createItemGroup);
router.get("/", getAllItemGroups);
router.get("/:id", getItemGroupById);
router.put("/:id", updateItemGroup);
router.delete("/:id", deleteItemGroup);
router.post("/bulk-upload", upload.single("file"), bulkUploadItemGroup);

export default router;
