import { Router } from "express";
import { registerAdmin, login } from "../controllers/auth_controller.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Registro de admin ahora protegido: solo admins pueden registrar otro admin
router.post("/register", verifyToken, isAdmin, registerAdmin);

// Login sigue público
router.post("/login", login);

export default router;
