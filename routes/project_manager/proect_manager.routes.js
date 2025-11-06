import express from "express";
import {
  getAllDieselRequisitions,
  getCompleteDieselRequisitions,
  getPendingDieselRequisitions,
  updateDieselRequisitionMicApproval,
} from "../../controllers/project_Manager/dieselRequisition.controller.js";
import {
  getAllConsumptionSheets,
  getCompleteConsumptionSheets,
  getPendingConsumptionSheets,
  updateConsumptionSheetSicApproval,
} from "../../controllers/project_Manager/consumptionSheet.controller.js";
import {
  getAllDieselReceipts,
  getCompleteDieselReceipts,
  getPendingDieselReceipts,
  updateDieselReceiptMicApproval,
} from "../../controllers/project_Manager/dieselReceipt.controller.js";
import {
  getAllMaintenanceSheets,
  getApprovedMaintenanceSheets,
  getPendingMaintenanceSheets,
  updateMaintenanceSheetSicApproval,
} from "../../controllers/project_Manager/maintenance_sheet.js";
import {
  approveOrRejectDPR,
  getAllDPRs,
  getDPRsByStatus,
} from "../../controllers/project_Manager/dpr.controller.js";
import { getMaterialTransactionsByStatus, updateMaterialTransactionStatus } from "../../controllers/project_Manager/material_transactions.controller.js";
import { getEquipmentTransactionsByStatus, updateEquipmentTransactionStatus } from "../../controllers/project_Manager/equipment_transactions.controller.js";

const router = express.Router();

// Get all diesel requisitions for a project
router.post("/diesel-requisitions/all", getAllDieselRequisitions);

// Get pending diesel requisitions (is_approved_mic = pending) for a project
router.post("/diesel-requisitions/pending", getPendingDieselRequisitions);

// Get complete diesel requisitions (is_approved_mic = approved) for a project
router.post("/diesel-requisitions/complete", getCompleteDieselRequisitions);

// Update MIC approval status for a diesel requisition
router.post(
  "/diesel-requisitions/update-sic-approval",
  updateDieselRequisitionMicApproval
);

// _______________________________________________________________
// _________________________________________________________________
// ___________________________________________________________________
router.post("/diesel-receipts/all", getAllDieselReceipts);
router.post("/diesel-receipts/pending", getPendingDieselReceipts);
router.post("/diesel-receipts/complete", getCompleteDieselReceipts);
router.post(
  "/diesel-receipts/update-sic-approval",
  updateDieselReceiptMicApproval
);

// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------

router.post("/consumption-sheets/all", getAllConsumptionSheets);
router.post("/consumption-sheets/pending", getPendingConsumptionSheets);
router.post("/consumption-sheets/complete", getCompleteConsumptionSheets);
router.post(
  "/consumption-sheets/update-sic-approval",
  updateConsumptionSheetSicApproval
);

// _________________________________________________________________________________________
// _________________________________________________________________________________________
// _________________________________________________________________________________________
// _________________________________________________________________________________________
// _________________________________________________________________________________________

router.post("/maintenance-sheets/all", getAllMaintenanceSheets);
router.post("/maintenance-sheets/pending", getPendingMaintenanceSheets);
router.post("/maintenance-sheets/approved", getApprovedMaintenanceSheets);
router.post(
  "/maintenance-sheets/update-sic-approval",
  updateMaintenanceSheetSicApproval
);

// Daily Progress Report Routes
router.post("/dpr/approve-reject/:dpr_id", approveOrRejectDPR); // Approve or Reject DPR

router.post("/dpr/all", getAllDPRs); // Get all DPRs (optionally by project_id in body/query)
router.post("/dpr/status/:status", getDPRsByStatus); // Get DPRs by status (approved/rejected/pending)


//Material In and Out
router.post("/material-transaction/update-status", updateMaterialTransactionStatus);
router.post("/material-transactions", getMaterialTransactionsByStatus);


//Equipment In and Equipment Out

router.post("/equipment-transaction/update-status", updateEquipmentTransactionStatus);
router.post("/equipment-transactions", getEquipmentTransactionsByStatus);

export default router;
