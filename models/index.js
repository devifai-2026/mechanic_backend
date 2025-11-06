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

// Sync the models
const syncModels = async () => {
  try {
    // Now safely sync your models
    await sequelize.sync({ alter: true });
    console.log("✅ Sync successful");
  } catch (err) {
    console.error("❌ Sync failed:", err);
  }
};

// Export models and syncModels function
export { models, syncModels };
