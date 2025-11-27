import { sequelize } from "../config/mysql.js"; // Named import
import JobMasterModel from "./job_master.model.js";
import PartnerModel from "./partner.model.js"; // Import the Partner model
import ProjectMasterModel from "./project_master.model.js";
import RevenueMasterModel from "./revenue.model.js";
import ShiftModel from "./shift.model.js";
import StoreModel from "./store.model.js";
import EquipmentGroupModel from "./equipment_group.model.js";
import EquipmentModel from "./equipment.model.js";
import RoleModel from "./roles.model.js";
import EmpPositions from "./emp_position.model.js";
import EmployeeModel from "./employees.model.js";
import EquipProjectModel from "./junctionTable/EquipmentProject.js";
import EmpProjectModel from "./junctionTable/ProjectEmployees.js";
import ProjectRevenueModel from "./junctionTable/ProjectRevenue.js";
import StoreProjectModel from "./junctionTable/ProjectStore.model.js";
import { OrganisationModel } from "./organisation.model.js";
import { UOMModel } from "./uom.model.js";
import { DieselRequisitionModel } from "./diesel_requisition.model.js";
import { ConsumableItemsModel } from "./consumable_items.model.js";
import { ItemGroupModel } from "./item_group.model.js";
import { OEMModel } from "./oem.model.js";
import { AccountGroupModel } from "./account_group.model.js";
import { AccountModel } from "./account.model.js";
import { DieselReceiptModel } from "./diesel_reciept.model.js";
import { ConsumptionSheetModel } from "./consumption_sheet.model.js";
import { MaintenanceSheetModel } from "./maintenance_sheet.js";
import { DieselRequisitionItemModel } from "./diesel_requisition_item.model.js";
import { DieselReceiptItemModel } from "./diesel_reciept_item.model.js";
import { ConsumptionSheetItemModel } from "./consumption_sheet_item.model.js";
import { MaintenanceSheetItemModel } from "./maintenanceSheetItem.model.js";
import { EmployeeOrganisationsModel } from "./junctionTable/EmployeeOrganisations.js";
import DailyProgressReportModel from "./daily_progress_report.js";
import DailyProgressReportFormModel from "./daily_progress_report_form.model.js"; // <-- Add this
import MaterialTransactionModel from "./material_transactions.js"; // <-- Add this
import MaterialTransactionsFormModel from "./material_transactions_form.model.js"; // <-- Add this
import EquipmentTransacationModel from "./equipment_transaction.model.js"; // <-- Add this
import EquipmentTransactionsFormModel from "./equipment_transactionForm.model.js"; // <-- Add this
import MaterialBillTransactionModel from "./material_bill.model.js"; // <-- Add this
import MaterialBillTransactionsFormModel from "./material_bill.form.model.js"; // <-- Add this
import ExpenseInputModel from "./expenseInput.model.js"; // <-- Add this
import RevenuenputModel from "./revenueInput.model.js"; // <-- Add this
import DieselInvoiceModel from "./DieselInvoices.js";
import DieselInvoiceForm from "./DieselInvoiceSubform.model.js";
import EmployeeLoginLogModel from "../models/junctionTable/EmployeeLoginLog.js";
import AdminModel from "../models/admin.model.js";
import EquipmentEquipmentGroupModel from "./junctionTable/EquipmentEquipmentGroup.js";

//Step 1: Initialize models
const Project_Master = ProjectMasterModel(sequelize); // Pass the sequelize instance to the model
const Partner = PartnerModel(sequelize); // Pass the sequelize instance to the model
const RevenueMaster = RevenueMasterModel(sequelize);
const Admin = AdminModel(sequelize);
const JobMaster = JobMasterModel(sequelize);
const Shift = ShiftModel(sequelize);
const Store = StoreModel(sequelize);
const EquipmentGroup = EquipmentGroupModel(sequelize);
const Equipment = EquipmentModel(sequelize);
const Role = RoleModel(sequelize);
const EquipmentEquipmentGroup = EquipmentEquipmentGroupModel(sequelize);
const EmpPositionsModel = EmpPositions(sequelize);
const Employee = EmployeeModel(sequelize);
const EquipmentProject = EquipProjectModel(sequelize);
const ProjectEmployees = EmpProjectModel(sequelize);
const ProjectRevenue = ProjectRevenueModel(sequelize);
const StoreProject = StoreProjectModel(sequelize);
const Organisations = OrganisationModel(sequelize);
const UOM = UOMModel(sequelize);
const DieselRequisitions = DieselRequisitionModel(sequelize);
const DieselRequisitionItems = DieselRequisitionItemModel(sequelize);

const ConsumableItem = ConsumableItemsModel(sequelize);
const ItemGroup = ItemGroupModel(sequelize);
const OEM = OEMModel(sequelize);
const AccountGroup = AccountGroupModel(sequelize);
const Account = AccountModel(sequelize);
const DieselReceipt = DieselReceiptModel(sequelize);
const DieselReceiptItem = DieselReceiptItemModel(sequelize);
const ConsumptionSheet = ConsumptionSheetModel(sequelize);
const ConsumptionSheetItem = ConsumptionSheetItemModel(sequelize);
const MaintenanceSheet = MaintenanceSheetModel(sequelize);
const MaintenanceSheetItem = MaintenanceSheetItemModel(sequelize);
const EmployeeOrganisations = EmployeeOrganisationsModel(sequelize);
const DailyProgressReport = DailyProgressReportModel(sequelize);
const DailyProgressReportForm = DailyProgressReportFormModel(sequelize); // <-- Add this
const MaterialTransaction = MaterialTransactionModel(sequelize);
const MaterialTransactionForm = MaterialTransactionsFormModel(sequelize);
const EquipmentTransaction = EquipmentTransacationModel(sequelize);
const EquipmentTransactionsForm = EquipmentTransactionsFormModel(sequelize);
const MaterialBillTransaction = MaterialBillTransactionModel(sequelize);
const ExpenseInput = ExpenseInputModel(sequelize);
const RevenueInput = RevenuenputModel(sequelize);
const DieselInvoiceSubform = DieselInvoiceForm(sequelize);
const DieselInvoice = DieselInvoiceModel(sequelize);
const EmployeeLoginLog = EmployeeLoginLogModel(sequelize);
const MaterialBillTransactionForm =
  MaterialBillTransactionsFormModel(sequelize);

const models = {
  sequelize,
  Admin,
  Partner,
  Project_Master,
  RevenueMaster,
  JobMaster,
  Shift,
  Store,
  EquipmentGroup,
  Equipment,
  Role,
  EmpPositionsModel,
  Employee,
  EquipmentProject,
  ProjectEmployees,
  ProjectRevenue,
  StoreProject,
  Organisations,
  UOM,
  DieselRequisitions,
  DieselRequisitionItems,
  ConsumableItem,
  ItemGroup,
  OEM,
  AccountGroup,
  Account,
  EquipmentEquipmentGroup, // Add this
  DieselReceipt,
  DieselReceiptItem,
  ConsumptionSheet,
  MaintenanceSheet,
  ConsumptionSheetItem,
  MaintenanceSheetItem,
  EmployeeOrganisations,
  DailyProgressReport,
  DailyProgressReportForm,
  MaterialTransaction,
  MaterialTransactionForm,
  EquipmentTransaction,
  EquipmentTransactionsForm,
  MaterialBillTransaction,
  MaterialBillTransactionForm,
  ExpenseInput,
  RevenueInput,
  DieselInvoiceSubform,
  DieselInvoice,
  EmployeeLoginLog,
};

// Step 2: Call associations AFTER all models are initialized
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});


// Add this to your models/index.js file temporarily

// models/index.js - Complete fix
const fixJunctionTable = async () => {
  try {
    console.log("🔍 Checking data types...");
    
    // Check the actual data types of the referenced tables
    const [equipmentInfo] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'equipment' 
      AND TABLE_SCHEMA = 'maco_mechanic'
      AND COLUMN_NAME = 'id'
    `);
    
    const [groupInfo] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'equipment_group' 
      AND TABLE_SCHEMA = 'maco_mechanic'
      AND COLUMN_NAME = 'id'
    `);
    
    console.log("Equipment ID type:", equipmentInfo[0]);
    console.log("Equipment Group ID type:", groupInfo[0]);
    
    // Drop the existing junction table if it exists
    await sequelize.query(`DROP TABLE IF EXISTS EquipmentEquipmentGroup`);
    
    // Create junction table with matching data types
    const equipmentType = equipmentInfo[0]?.COLUMN_TYPE || 'CHAR(36)';
    const groupType = groupInfo[0]?.COLUMN_TYPE || 'CHAR(36)';
    
    console.log(`Using equipment_id type: ${equipmentType}`);
    console.log(`Using equipment_group_id type: ${groupType}`);
    
    await sequelize.query(`
      CREATE TABLE EquipmentEquipmentGroup (
        id CHAR(36) NOT NULL,
        equipment_id ${equipmentType} NOT NULL,
        equipment_group_id ${groupType} NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY equipment_group_unique (equipment_id, equipment_group_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    
    console.log("✅ Junction table created with correct data types");
    
  } catch (error) {
    console.error("❌ Failed to fix junction table:", error.message);
  }
};

// Call this instead of createJunctionTable
// fixJunctionTable();
// models/index.js - Add foreign keys
// models/index.js - Final setup without foreign keys
const finalizeJunctionTable = async () => {
  try {
    console.log("🔄 Finalizing junction table setup...");
    
    // Drop and recreate without foreign key attempts
    await sequelize.query(`DROP TABLE IF EXISTS EquipmentEquipmentGroup`);
    
    await sequelize.query(`
      CREATE TABLE EquipmentEquipmentGroup (
        id CHAR(36) NOT NULL,
        equipment_id CHAR(36) NOT NULL,
        equipment_group_id CHAR(36) NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY equipment_group_unique (equipment_id, equipment_group_id),
        INDEX idx_equipment_id (equipment_id),
        INDEX idx_equipment_group_id (equipment_group_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log("✅ Junction table ready for use (without foreign keys)");
    console.log("📝 You can add foreign keys later via database migration");
    
  } catch (error) {
    console.error("❌ Final setup failed:", error.message);
  }
};



// Replace your previous calls with this
// finalizeJunctionTable();
// Sync the models
// const syncModels = async () => {
//   try {
//     // Now safely sync your models
//     // await sequelize.sync({ alter: true });
//     console.log("✅ Sync successful");
//   } catch (err) {
//     console.error("❌ Sync failed:", err);
//   }
// };



//DONT RUN TIHS
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Sync successful");
  } catch (err) {
    console.error("❌ Sync failed:", err);
  }
};

// Export models and syncModels function
export { models, syncModels };
