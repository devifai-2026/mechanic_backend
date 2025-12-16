import { sequelize } from "../config/mysql.js";
import JobMasterModel from "./job_master.model.js";
import PartnerModel from "./partner.model.js";
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
import DailyProgressReportFormModel from "./daily_progress_report_form.model.js";
import MaterialTransactionModel from "./material_transactions.js";
import MaterialTransactionsFormModel from "./material_transactions_form.model.js";
import EquipmentTransacationModel from "./equipment_transaction.model.js";
import EquipmentTransactionsFormModel from "./equipment_transactionForm.model.js";
import MaterialBillTransactionModel from "./material_bill.model.js";
import MaterialBillTransactionsFormModel from "./material_bill.form.model.js";
import ExpenseInputModel from "./expenseInput.model.js";
import RevenuenputModel from "./revenueInput.model.js";
import DieselInvoiceModel from "./DieselInvoices.js";
import DieselInvoiceForm from "./DieselInvoiceSubform.model.js";
import EmployeeLoginLogModel from "./junctionTable/EmployeeLoginLog.js";
import AdminModel from "./admin.model.js";
import EquipmentEquipmentGroupModel from "./junctionTable/EquipmentEquipmentGroup.js";
// Fixed imports - use named imports for the models
import { StockLocationModel } from "./stockLocationModel.js";
import { StockEntryModel } from "./stockEntryModel.js";

// Step 1: Initialize models
const Project_Master = ProjectMasterModel(sequelize);
const Partner = PartnerModel(sequelize);
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
const DailyProgressReportForm = DailyProgressReportFormModel(sequelize);
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
const MaterialBillTransactionForm = MaterialBillTransactionsFormModel(sequelize);
// Initialize stock models
const StockLocation = StockLocationModel(sequelize);
const StockEntry = StockEntryModel(sequelize);

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
  EquipmentEquipmentGroup,
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
  StockLocation,
  StockEntry,
};

// Step 2: Call associations AFTER all models are initialized
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});



// Export models and syncModels function
export { models, syncModels };

const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Sync successful");
  } catch (err) {
    console.error("❌ Sync failed:", err);
  }
};

// Add this new function for syncing only stock tables
const fixStockTables = async () => {
  try {
    console.log('🔧 Fixing stock table columns...');
    
    // Check and fix stock_location table
    const [locationColumns] = await sequelize.query(`
      SHOW COLUMNS FROM stock_location LIKE 'created_at'
    `);
    
    if (locationColumns.length === 0) {
      console.log('📝 Adding created_at and updated_at to stock_location...');
      await sequelize.query(`
        ALTER TABLE stock_location 
        ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
    }
    
    // Check and fix stock_entry table
    const [entryColumns] = await sequelize.query(`
      SHOW COLUMNS FROM stock_entry LIKE 'created_at'
    `);
    
    if (entryColumns.length === 0) {
      console.log('📝 Adding created_at and updated_at to stock_entry...');
      await sequelize.query(`
        ALTER TABLE stock_entry 
        ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
    }
    
    console.log('✅ Stock table columns fixed');
  } catch (error) {
    console.error('❌ Error fixing table columns:', error.message);
  }
};

// Call this after your syncStockTables function
// await fixStockTables();