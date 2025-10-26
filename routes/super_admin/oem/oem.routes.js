import express from 'express';
import { createOEM, deleteOEM, getAllOEMs, getOEMById, updateOEM } from '../../../controllers/oem/oem.controller.js';


const router = express.Router();

router.post('/', createOEM);
router.get('/', getAllOEMs);
router.get('/:id', getOEMById);
router.put('/:id', updateOEM);
router.delete('/:id', deleteOEM);

export default router;
