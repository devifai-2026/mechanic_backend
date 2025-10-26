import express from 'express';
import {
  createDieselRequisition,
  getAllDieselRequisitions,
  getDieselRequisitionById,
  updateDieselRequisition,
  deleteDieselRequisition,
  getAllDieselRequisitionsByCreator
} from '../../../controllers/Mechanic/diesel_requisirtion/diesel_requisition.controller.js';
import { getRecentDieselRequisitionsByCreator } from '../../../controllers/Mechanic/lastRequisitions/lastRequisiiton.controller.js';

const router = express.Router();

// POST: Create new diesel requisition
router.post('/', createDieselRequisition);

// GET: Get all diesel requisitions
router.get('/', getAllDieselRequisitions);
router.post('/admin', getAllDieselRequisitions);
router.post('/getByCreator', getAllDieselRequisitionsByCreator);

// GET: Get a single diesel requisition by ID
router.get('/:id', getDieselRequisitionById);

// PUT: Update diesel requisition by ID
router.put('/:id', updateDieselRequisition);

// DELETE: Delete diesel requisition by ID
router.delete('/:id', deleteDieselRequisition);
router.post('/latest', getRecentDieselRequisitionsByCreator);

export default router;
