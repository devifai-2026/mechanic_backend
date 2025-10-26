import express from 'express';
import {
  createDieselReciept,
  getAllDieselReciept,
  getDieselRecieptById,
  updateDieselReceipt,
  deleteDieselRequisition,
  getAllDieselReceiptByCreator
} from '../../../controllers/Mechanic/diesel_receipt/diesel_receipt.controller.js';

const router = express.Router();

// POST: Create new diesel requisition
router.post('/', createDieselReciept);
router.post('/getByCreator', getAllDieselReceiptByCreator);

// GET: Get all diesel requisitions
router.get('/', getAllDieselReciept);
router.post('/admin', getAllDieselReciept);
// GET: Get a single diesel requisition by ID
router.get('/:id', getDieselRecieptById);

// PUT: Update diesel requisition by ID
router.put('/:id', updateDieselReceipt);

// DELETE: Delete diesel requisition by ID
router.delete('/:id', deleteDieselRequisition);

export default router;
