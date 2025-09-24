import { Router } from "express";
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "../controllers/usuarios_enacal_controller.js";

import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", verifyToken, isAdmin, getUsuarios);
router.get("/:id", verifyToken, isAdmin, getUsuarioById);
router.post("/", createUsuario); // POST /api/usuarios -> público, cualquier usuario puede enviar sus datos
router.put("/:id", verifyToken, isAdmin, updateUsuario);
router.delete("/:id", verifyToken, isAdmin, deleteUsuario);

export default router;
