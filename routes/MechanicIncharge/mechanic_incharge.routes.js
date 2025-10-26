import express from "express";
import {
  getAllDieselRequisitions,
  getPendingDieselRequisitions,
  getCompleteDieselRequisitions,
  updateDieselRequisitionMicApproval,
} from "../../controllers/Mechanic_Incharge/dieselRequisition.controller.js"; // <-- replace with your actual controller file path


import {
  getAllDieselReceipts,
  getPendingDieselReceipts,
  getCompleteDieselReceipts,
  updateDieselReceiptMicApproval,
} from "../../controllers/Mechanic_Incharge/dieselReceipt.controller.js";


import {
  getAllConsumptionSheets,
  getPendingConsumptionSheets,
  getCompleteConsumptionSheets,
  updateConsumptionSheetMicApproval,
} from "../../controllers/Mechanic_Incharge/consumption_sheet.controller.js";



import {
  getAllMaintenanceSheets,
  getPendingMaintenanceSheets,
  getApprovedMaintenanceSheets,
  updateMaintenanceSheetMicApproval,
} from "../../controllers/Mechanic_Incharge/maintenance_sheet.controller.js";



const router = express.Router();

// Get all diesel requisitions for a project
router.post("/diesel-requisitions/all", getAllDieselRequisitions);

// Get pending diesel requisitions (is_approved_mic = pending) for a project
router.post("/diesel-requisitions/pending", getPendingDieselRequisitions);

// Get complete diesel requisitions (is_approved_mic = approved) for a project
router.post("/diesel-requisitions/complete", getCompleteDieselRequisitions);

// Update MIC approval status for a diesel requisition
router.post("/diesel-requisitions/update-mic-approval", updateDieselRequisitionMicApproval);


// _______________________________________________________________
// _________________________________________________________________
// ___________________________________________________________________
router.post("/diesel-receipts/all", getAllDieselReceipts);
router.post("/diesel-receipts/pending", getPendingDieselReceipts);
router.post("/diesel-receipts/complete", getCompleteDieselReceipts);
router.post("/diesel-receipts/update-mic-approval", updateDieselReceiptMicApproval);


// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------

router.post("/consumption-sheets/all", getAllConsumptionSheets);
router.post("/consumption-sheets/pending", getPendingConsumptionSheets);
router.post("/consumption-sheets/complete", getCompleteConsumptionSheets);
router.post("/consumption-sheets/update-mic-approval", updateConsumptionSheetMicApproval);

// _________________________________________________________________________________________
// _________________________________________________________________________________________
// _________________________________________________________________________________________
// _________________________________________________________________________________________
// _________________________________________________________________________________________

router.post("/maintenance-sheets/all", getAllMaintenanceSheets);
router.post("/maintenance-sheets/pending", getPendingMaintenanceSheets);
router.post("/maintenance-sheets/approved", getApprovedMaintenanceSheets);
router.post("/maintenance-sheets/update-mic-approval", updateMaintenanceSheetMicApproval);

export default router;
