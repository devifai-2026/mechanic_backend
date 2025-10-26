import express from 'express';

import { bulkUploadUOM, createUOM, deleteUOM, getUOMById, getUOMs, updateUOM } from '../../../controllers/uom/uom.controller.js';
import upload from "../../../middleware/bulkUpload.js";
const router = express.Router();

router.post('/', createUOM);
router.get('/', getUOMs);
router.get('/:id', getUOMById);
router.post('/:id', updateUOM);
router.delete('/:id', deleteUOM);
router.post("/upload/bulk-upload", upload.single("file"), bulkUploadUOM);


export default router;
