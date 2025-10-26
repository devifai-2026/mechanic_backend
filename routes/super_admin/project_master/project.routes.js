import express from "express";
import { bulkUploadProjects, createProject, deleteProject, getProjectById, getProjects, updateProject } from "../../../controllers/project_master/project_master.controller.js";
import upload from "../../../middleware/bulkUpload.js";


const router = express.Router();

// Routes
router.post("/create/", createProject);
router.get("/getAll", getProjects);
router.post("/get/", getProjectById);
router.patch("/update/:id", updateProject);
router.delete("/delete/:id", deleteProject);
router.post("/bulk-upload", upload.single("file"), bulkUploadProjects);
export default router; // Ensure this is exported correctly
