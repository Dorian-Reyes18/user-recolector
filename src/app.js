import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import routes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import usuariosSystem from "./routes/usuarios_system.js";
import { verifyToken, isAdmin } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

// Seguridad con headers HTTP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // solo permite recursos del mismo origen
        scriptSrc: ["'self'"], // scripts solo desde el mismo dominio
        objectSrc: ["'none'"], // bloquea objetos <object>, <embed>, <applet>
        upgradeInsecureRequests: [], // fuerza HTTPS si es posible
      },
    },
    crossOriginEmbedderPolicy: false, // evita errores con algunas librerías modernas
  })
);

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", routes); // acceso general incluyendo los endpoints publicos
app.use("/api/auth", authRoutes); // acceso a endpoints de autenticación y registro

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
