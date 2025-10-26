import express from "express";
import { createAdmin } from "../../controllers/admin/admin.controller.js";
import { adminLogin, adminLogout } from "../../controllers/adminAuth/adminAuth.controller.js";


const router = express.Router();

// POST /api/master/admin/create
router.post("/create", createAdmin);
router.post("/login", adminLogin);
router.post("/logout", adminLogout);

export default router;
