import express from 'express';
import {
  createAccountGroup,
  getAllAccountGroups,
  getAccountGroupById,
  updateAccountGroup,
  deleteAccountGroup,
  bulkUploadAccountGroup
} from '../../../controllers/accountGroup/account_group.controller.js';
import upload from "../../../middleware/bulkUpload.js";
const router = express.Router();

router.post('/', createAccountGroup);
router.get('/', getAllAccountGroups);
router.get('/:id', getAccountGroupById);
router.put('/:id', updateAccountGroup);
router.delete('/:id', deleteAccountGroup);
router.post("/bulk-upload", upload.single("file"), bulkUploadAccountGroup);

export default router;
