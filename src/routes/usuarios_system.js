import { Router } from "express";
import {
  getUsuariosSystem,
  getUsuarioSystemById,
  createUsuarioSystem,
  updateUsuarioSystem,
  deleteUsuarioSystem,
} from "../controllers/usuarios_system_controllers.js";

import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Solo usuarios autenticados y admin pueden manipular usuarios del sistema
router.get("/", verifyToken, isAdmin, getUsuariosSystem);
router.get("/:id", verifyToken, isAdmin, getUsuarioSystemById);
router.post("/", verifyToken, isAdmin, createUsuarioSystem);
router.put("/:id", verifyToken, isAdmin, updateUsuarioSystem);
router.delete("/:id", verifyToken, isAdmin, deleteUsuarioSystem);

export default router;
