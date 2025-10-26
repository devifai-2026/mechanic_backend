import express from 'express';
import {
  createConsumptionSheet,
  getAllConsumptionSheets,
  getConsumptionSheetById,
  updateConsumptionSheet,
  deleteConsumptionSheet,
  getConsumptionSheetsByCreator,
} from '../../../controllers/Mechanic/consumption_sheet/consumption_sheet.controller.js';

const router = express.Router();

router.post('/', createConsumptionSheet);
router.get('/', getAllConsumptionSheets);
router.post('/admin', getAllConsumptionSheets);
router.get('/:id', getConsumptionSheetById);
router.put('/:id', updateConsumptionSheet);
router.delete('/:id', deleteConsumptionSheet);
router.post('/getbycreator', getConsumptionSheetsByCreator);

export default router;
