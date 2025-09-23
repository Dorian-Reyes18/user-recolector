import { Router } from "express";
import usuariosEnacalRoutes from "./usuarios_enacal.js";

const router = Router();

router.use("/usuarios_enacal", usuariosEnacalRoutes); // /api/usuarios

export default router;
