import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkUploadEmployees,
  getEmployeesByRole,
  getAllEmployeesGroupedByRole,
  getProjectsByEmployeeId,
  addEmployeesToProject,
  getEmployeesByProject,
  getEmployeesByProjectWithRoleType,
  updateEmployeesForProject,
} from "../../../controllers/employee/employee.controller.js";
import upload from "../../../middleware/bulkUpload.js";
import jwtMiddleware from "../../../middleware/jwtMiddleware.js";

const router = express.Router();

router.post("/create", createEmployee);
router.get("/getAll", getAllEmployees);
router.get("/get/:id", getEmployeeById);
router.get("/get/projects/:id", getProjectsByEmployeeId);
router.patch("/update/:id", updateEmployee);
router.delete("/delete/:id", deleteEmployee);
router.post(
  "/bulk-upload",
  upload.single("file"),

  bulkUploadEmployees
);
router.get("/role/:id", getEmployeesByRole);
router.get("/grouped-by-role", getAllEmployeesGroupedByRole);
// POST /api/project-employees/add
router.post("/add/employee/project", addEmployeesToProject);
router.post("/edit/employee/project", updateEmployeesForProject);
router.post("/get/employee/project", getEmployeesByProject);
router.post(
  "/get/employee/project/roleType",
  getEmployeesByProjectWithRoleType
);
export default router;
