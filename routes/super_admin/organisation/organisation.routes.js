import express from 'express';
import {
  createOrganisation,
  getOrganisations,
  getOrganisationById,
  updateOrganisation,
  deleteOrganisation,
  bulkUploadOrganisations,
} from '../../../controllers/organisations/organisation.controller.js'; // Adjust path
import upload from '../../../middleware/bulkUpload.js';


const router = express.Router();

router.post('/', createOrganisation);
router.get('/', getOrganisations);
router.get('/:id', getOrganisationById);
router.post('/:id', updateOrganisation);
router.delete('/:id', deleteOrganisation);
router.post("/upload/bulk-upload", upload.single("file"), bulkUploadOrganisations);

export default router;
