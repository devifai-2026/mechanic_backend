import express from "express";
import { changePassword, login, logout } from "../../controllers/auth/auth.controller.js";
import jwtMiddleware from "../../middleware/jwtMiddleware.js";


const router = express.Router();

router.post('/login', login);
router.post('/change/pass', changePassword);
router.post('/logout', jwtMiddleware, logout);

export default router;
