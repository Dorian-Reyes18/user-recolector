// Este archivo es el punto de entrada de todas las rutas de la API es donde se mandan llamar todas las rutas
import { Router } from "express";
import usuariosEnacalRoutes from "./usuarios_enacal.js";
import usuariosSistema from "./usuarios_system.js";

const router = Router();

router.use("/usuarios_enacal", usuariosEnacalRoutes); 
router.use("usuarios_sistema", usuariosSistema);

export default router;
