import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connection } from "./config/mysql.js"; // Import syncModels
import adminRoutes from "./routes/admin/admin.routes.js"; // Import admin routes
import projectsRoutes from "./routes/super_admin/project_master/project.routes.js";
import partnerRoutes from "./routes/super_admin/partner/index.js";
import job_masterRoutes from "./routes/super_admin/job_master/job_master.routes.js";
import revenueRoutes from "./routes/super_admin/revenue/revenue.routes.js";
import equipmentGroupRoutes from "./routes/super_admin/equipmentGroup/equipmentGroup.routes.js";
import equipmentRoutes from "./routes/super_admin/equipment/equioment.routes.js";
import roleRoutes from "./routes/super_admin/role/role.routes.js";
import shiftRoutes from "./routes/super_admin/shift/shift.routes.js";
import empPositionRoutes from "./routes/super_admin/empPosition/empPosition.routes.js";
import employeeRoutes from "./routes/super_admin/employee/employee.routes.js";
import storeRoutes from "./routes/super_admin/store/store.routes.js"; // Import store routes
import orgRoutes from "./routes/super_admin/organisation/organisation.routes.js"; // Import organisations routes
import UOMRoutes from "./routes/super_admin/uom/uom.routes.js"; // Import uom routes
import ItemGroupRoutes from "./routes/super_admin/itemGroup/itemGroup.routes.js"; // Import uom routes
import OEMRoutes from "./routes/super_admin/oem/oem.routes.js"; // Import uom routes
import AccountGroupRoutes from "./routes/super_admin/account_group/account_group.routes.js"; // Import uom routes
import ConsumableItemsRoutes from "./routes/super_admin/consumableItems/consumable_items.routes.js"; // Import uom routes
import AccountRoutes from "./routes/super_admin/account/account.routes.js"; // Import uom routes
import diselRequisitionRoutes from "./routes/Mechanic/diesel_requisitions/diesel_requisition.routes.js"; // Import uom routes
import dieselReceiptRoutes from "./routes/Mechanic/diesel_reciept/diesel_reciept.routes.js"; // Import uom routes
import consumptionSheetRoutes from "./routes/Mechanic/consumption_sheet/consumption_sheet.routes.js"; // Import uom routes
import maintenanceSheetRoutes from "./routes/Mechanic/maintenance_sheet/maintenance_sheet.routes.js"; // Import uom routes
import authentcationRoutes from "./routes/authentications/auth.routes.js"; // Import authentication routes
import mechanicInchargeRoutes from "./routes/MechanicIncharge/mechanic_incharge.routes.js"; // Import authentication routes
import siteInchargeRoutes from "./routes/SiteIncharge/site_incharge.routes.js"; // Import authentication routes
import projectManagerRoutes from "./routes/project_manager/proect_manager.routes.js"; // Import authentication routes
import storeManagerRoutes from "./routes/storeManager/store_manager.routes.js"; // Import authentication routes
import AccountManagerRoutes from "./routes/accountManager/accountManager.routes.js"; // Import authentication routes

import { syncModels } from "./models/index.js";
import jwtMiddleware from "./middleware/jwtMiddleware.js";

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

app.use("/api/master/super/admin", adminRoutes);
app.use("/api/master/auth", authentcationRoutes);



// app.use(jwtMiddleware); // Apply JWT middleware globally

// Use partner routes
app.use("/api/master/super/admin/project", projectsRoutes);
app.use("/api/master/super/admin/partner", partnerRoutes);
app.use("/api/master/super/admin/job_master", job_masterRoutes);
app.use("/api/master/super/admin/revenue_master", revenueRoutes);
app.use(
  "/api/master/super/admin/equipmentGroup",

  equipmentGroupRoutes
);
app.use("/api/master/super/admin/equipment", equipmentRoutes);
app.use("/api/master/super/admin/role", roleRoutes);
app.use("/api/master/super/admin/shift", shiftRoutes);
app.use(
  "/api/master/super/admin/empPosition",

  empPositionRoutes
);
app.use("/api/master/super/admin/employee", employeeRoutes);
app.use("/api/master/super/admin/store", storeRoutes);
app.use("/api/master/super/admin/organisations", orgRoutes);
app.use("/api/master/super/admin/uom", UOMRoutes);
app.use("/api/master/super/admin/itemgroup", ItemGroupRoutes);
app.use("/api/master/super/admin/oem", OEMRoutes);
app.use(
  "/api/master/super/admin/accountgroup",

  AccountGroupRoutes
);
app.use(
 "/api/master/super/admin/consumableitems",

  ConsumableItemsRoutes
);
app.use("/api/master/super/admin/account", AccountRoutes);
app.use(
  "/api/master/mechanic/diselrequisition",

  diselRequisitionRoutes
);
app.use(
  "/api/master/mechanic/diselreciept",

  dieselReceiptRoutes
);
app.use(
  "/api/master/mechanic/consumptionsheet",

  consumptionSheetRoutes
);
app.use(
  "/api/master/mechanic/maintenanceSheet",

  maintenanceSheetRoutes
);
// app.use("/api/master/auth", authentcationRoutes);
app.use("/api/master/mechanic_incharge", mechanicInchargeRoutes);
app.use("/api/master/site_incharge", siteInchargeRoutes);
app.use("/api/master/project_manager", projectManagerRoutes);
app.use("/api/master/store_manager", storeManagerRoutes);
app.use("/api/master/account_manager", AccountManagerRoutes);

app.use("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API" });
});

// Initialize database connection
connection();

// Sync models
// syncModels(); // Ensure models are synced before starting the server

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
