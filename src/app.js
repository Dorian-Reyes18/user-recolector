import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import usuariosSystem from "./routes/usuarios_system.js";
import { verifyToken, isAdmin } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", routes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", verifyToken, isAdmin, usuariosSystem);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
