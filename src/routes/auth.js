import { Router } from "express";
import { registerAdmin, login } from "../controllers/auth_controller.js";

const router = Router();

// Solo se usaría al principio para crear el primer admin
router.post("/register", registerAdmin);

router.post("/login", login);

export default router;
