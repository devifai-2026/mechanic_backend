import express from "express";







import { getAllDieselRequisitions, getCompleteDieselRequisitions, getPendingDieselRequisitions, updateDieselRequisitionMicApproval } from "../../controllers/Site_Incharge/dieselRequisition.controller.js";
import { getAllDieselReceipts, getCompleteDieselReceipts, getPendingDieselReceipts, updateDieselReceiptMicApproval } from "../../controllers/Site_Incharge/dieselReceipt.controller.js";
import { getAllConsumptionSheets, getCompleteConsumptionSheets, getPendingConsumptionSheets, updateConsumptionSheetSicApproval } from "../../controllers/Site_Incharge/consumption_sheet.controller.js";
import { getAllMaintenanceSheets, getApprovedMaintenanceSheets, getPendingMaintenanceSheets, updateMaintenanceSheetSicApproval } from "../../controllers/Site_Incharge/maintenance_sheet.controller.js";
import { createDailyProgressReport, deleteAllDailyProgressReports, getAllDailyProgressReports, getAllDailyProgressReportsByCreator } from "../../controllers/Site_Incharge/daily_progres_report.js";



const router = express.Router();

// Get all diesel requisitions for a project
router.post("/diesel-requisitions/all", getAllDieselRequisitions);

// Get pending diesel requisitions (is_approved_mic = pending) for a project
router.post("/diesel-requisitions/pending", getPendingDieselRequisitions);

// Get complete diesel requisitions (is_approved_mic = approved) for a project
router.post("/diesel-requisitions/complete", getCompleteDieselRequisitions);

// Update MIC approval status for a diesel requisition
router.post("/diesel-requisitions/update-sic-approval", updateDieselRequisitionMicApproval);


// _______________________________________________________________
// _________________________________________________________________
// ___________________________________________________________________
router.post("/diesel-receipts/all", getAllDieselReceipts);
router.post("/diesel-receipts/pending", getPendingDieselReceipts);
router.post("/diesel-receipts/complete", getCompleteDieselReceipts);
router.post("/diesel-receipts/update-sic-approval", updateDieselReceiptMicApproval);


// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------

router.post("/consumption-sheets/all", getAllConsumptionSheets);
router.post("/consumption-sheets/pending", getPendingConsumptionSheets);
router.post("/consumption-sheets/complete", getCompleteConsumptionSheets);
router.post("/consumption-sheets/update-sic-approval", updateConsumptionSheetSicApproval);

// _________________________________________________________________________________________
// _________________________________________________________________________________________
// _________________________________________________________________________________________
// _________________________________________________________________________________________
// _________________________________________________________________________________________

router.post("/maintenance-sheets/all", getAllMaintenanceSheets);
router.post("/maintenance-sheets/pending", getPendingMaintenanceSheets);
router.post("/maintenance-sheets/approved", getApprovedMaintenanceSheets);
router.post("/maintenance-sheets/update-sic-approval", updateMaintenanceSheetSicApproval);




router.post("/create-dpr", createDailyProgressReport);
router.post("/get-dpr/creator", getAllDailyProgressReportsByCreator);
router.get("/get-all-dpr", getAllDailyProgressReports);
router.get("/get-all-dpr/admin", getAllDailyProgressReports);
router.delete("/delete-all-dpr", deleteAllDailyProgressReports);

export default router;
